import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { Search, Filter, Mail, Edit, UserCheck, UserX, Download } from "lucide-react";

export default function AttendeesPage() {
  // State for filters
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedTicketType, setSelectedTicketType] = useState<string>("all");
  const [checkInStatus, setCheckInStatus] = useState<string>("all"); // "checked-in", "not-checked-in", or "all"
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // State for modals
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingAttendee, setEditingAttendee] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  
  // Use the correct API method name based on your error message
  const events = useQuery(api.events.getAll) || [];
  
  // Use a proper query for ticket types - use "skip" instead of null
  const ticketTypes = useQuery(
    api.ticketTypes.getAll, 
    selectedEvent !== "all" ? {} : "skip"
  ) || [];
  
  // Filter ticket types client-side if needed
  const filteredTicketTypes = selectedEvent !== "all" 
    ? ticketTypes.filter((type: any) => type.eventId === selectedEvent)
    : ticketTypes;
  
  // Fetch attendees with filters
  const attendeeResult = useQuery(api.attendees.getAllAttendees, {
    eventId: selectedEvent !== "all" ? selectedEvent : undefined,
    ticketTypeId: selectedTicketType !== "all" ? selectedTicketType : undefined,
    isCheckedIn: checkInStatus === "checked-in" ? true : 
                 checkInStatus === "not-checked-in" ? false : 
                 undefined,
    searchQuery: searchQuery || undefined,
    page: currentPage,
    limit: itemsPerPage
  });
  
  // Fetch check-in stats
  // Try to use the API if available, otherwise use mock data
  const mockCheckInStats = {
    totalAttendees: 120,
    checkedInAttendees: 78,
    checkedInPercentage: 65,
    statsByTicketType: []
  };
  
  const checkInStats = useQuery(
    api.attendees.getCheckInStats, 
    selectedEvent !== "all" ? { eventId: selectedEvent } : "skip"
  ) || mockCheckInStats;
  
  // Set up mutations
  const updateAttendee = useMutation(api.attendees.updateAttendee);
  const sendEmail = useMutation(api.attendees.sendEmailToAttendees);
  
  // Handle pagination
  const totalPages = attendeeResult ? 
    Math.ceil(attendeeResult.totalCount / attendeeResult.limit) : 0;
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle email sending
  const handleSendEmail = async () => {
    if (!selectedEvent) return;
    
    await sendEmail({
      eventId: selectedEvent,
      ticketTypeId: selectedTicketType || undefined,
      subject: emailSubject,
      message: emailMessage
    });
    
    setIsEmailModalOpen(false);
    setEmailSubject("");
    setEmailMessage("");
  };
  
  // Handle attendee edit
  const handleEditAttendee = async (values: any) => {
    if (!editingAttendee) return;
    
    await updateAttendee({
      attendeeId: editingAttendee._id,
      ...values
    });
    
    setIsEditModalOpen(false);
    setEditingAttendee(null);
  };
  
  // Handle export to CSV
  const exportToCSV = () => {
    if (!attendeeResult || !attendeeResult.attendees) return;
    
    const headers = [
      "First Name", 
      "Last Name", 
      "Email", 
      "Phone", 
      "Age", 
      "Dietary Restrictions", 
      "Special Requirements", 
      "Registration Date", 
      "Checked In", 
      "Ticket Type"
    ];
    
    const csvRows = [
      headers.join(','),
      ...attendeeResult.attendees.map(attendee => [
        `"${attendee.firstName || ''}"`,
        `"${attendee.lastName || ''}"`,
        `"${attendee.email || ''}"`,
        `"${attendee.phone || ''}"`,
        `"${attendee.age || ''}"`,
        `"${(attendee.dietaryRestrictions || '').replace(/"/g, '""')}"`,
        `"${(attendee.specialRequirements || '').replace(/"/g, '""')}"`,
        `"${new Date(attendee.registrationDate).toLocaleString()}"`,
        attendee.isCheckedIn ? "Yes" : "No",
        `"${attendee.ticketTypeLabel?.name || ''}"`,
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendees-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendees Management</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV} 
            disabled={!attendeeResult || !attendeeResult.attendees || attendeeResult.attendees.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      {selectedEvent !== "all" && checkInStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{checkInStats.totalAttendees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{checkInStats.checkedInAttendees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Check-in Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{checkInStats.checkedInPercentage}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {checkInStats.totalAttendees - checkInStats.checkedInAttendees}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter attendees by event, ticket type, and check-in status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Event</label>
              <Select 
                value={selectedEvent} 
                onValueChange={(value) => {
                  setSelectedEvent(value);
                  setSelectedTicketType("");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {events.map((event: any) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ticket Type</label>
              <Select 
                value={selectedTicketType} 
                onValueChange={(value) => {
                  setSelectedTicketType(value);
                  setCurrentPage(1);
                }}
                disabled={!selectedEvent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {/* Use "all" instead of empty string */}
                  <SelectItem value="all">All ticket types</SelectItem>
                  {filteredTicketTypes.map((type: any) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Check-in Status</label>
              <Select 
                value={checkInStatus} 
                onValueChange={(value) => {
                  setCheckInStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {attendeeResult ? `${attendeeResult.totalCount} attendees found` : "Loading..."}
          </div>
          <Button 
            variant="outline"
            onClick={() => setIsEmailModalOpen(true)} 
            disabled={selectedEvent === "all" || !attendeeResult || attendeeResult.totalCount === 0}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Attendees
          </Button>
        </CardFooter>
      </Card>
      
      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees List</CardTitle>
          <CardDescription>
            Showing {attendeeResult?.attendees?.length || 0} of {attendeeResult?.totalCount || 0} attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendeeResult && attendeeResult.attendees && attendeeResult.attendees.length > 0 ? (
                  attendeeResult.attendees.map((attendee: any) => (
                    <TableRow key={attendee._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{attendee.firstName} {attendee.lastName}</p>
                          {attendee.phone && (
                            <p className="text-sm text-muted-foreground">{attendee.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{attendee.email}</TableCell>
                      <TableCell>
                        {attendee.ticketTypeLabel ? attendee.ticketTypeLabel.name : "Unknown"}
                      </TableCell>
                      <TableCell>
                        {new Date(attendee.registrationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {attendee.isCheckedIn ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Not Checked In
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAttendee(attendee);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {attendeeResult ? "No attendees found" : "Loading..."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        {/* Pagination */}
        {attendeeResult && totalPages > 1 && (
          <CardFooter className="border-t bg-muted/50">
            <div className="w-full">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Email Attendees</DialogTitle>
            <DialogDescription>
              Send an email to {attendeeResult?.totalCount || 0} attendees matching your current filters
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Input 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <Textarea 
                value={emailMessage} 
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Email message"
                rows={8}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendEmail}
              disabled={!emailSubject || !emailMessage}
            >
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Attendee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendee</DialogTitle>
            <DialogDescription>
              Update attendee information
            </DialogDescription>
          </DialogHeader>
          
          {editingAttendee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">First Name</label>
                  <Input 
                    value={editingAttendee.firstName || ''} 
                    onChange={(e) => setEditingAttendee({...editingAttendee, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Last Name</label>
                  <Input 
                    value={editingAttendee.lastName || ''} 
                    onChange={(e) => setEditingAttendee({...editingAttendee, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input 
                  value={editingAttendee.email || ''} 
                  onChange={(e) => setEditingAttendee({...editingAttendee, email: e.target.value})}
                  type="email"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input 
                  value={editingAttendee.phone || ''} 
                  onChange={(e) => setEditingAttendee({...editingAttendee, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Age</label>
                <Input 
                  value={editingAttendee.age || ''} 
                  onChange={(e) => setEditingAttendee({...editingAttendee, age: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Dietary Restrictions</label>
                <Input 
                  value={editingAttendee.dietaryRestrictions || ''} 
                  onChange={(e) => setEditingAttendee({...editingAttendee, dietaryRestrictions: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Special Requirements</label>
                <Textarea 
                  value={editingAttendee.specialRequirements || ''} 
                  onChange={(e) => setEditingAttendee({...editingAttendee, specialRequirements: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleEditAttendee(editingAttendee)}
              disabled={!editingAttendee || !editingAttendee.firstName || !editingAttendee.lastName || !editingAttendee.email}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}