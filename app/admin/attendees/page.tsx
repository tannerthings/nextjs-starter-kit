"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Printer, Mail, Check, X, Edit, UserPlus } from "lucide-react";

export default function AttendeesPage() {
  // State for filters and pagination
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTicketType, setFilterTicketType] = useState<string | null>(null);
  const [filterCheckedIn, setFilterCheckedIn] = useState<boolean | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [newAttendeeData, setNewAttendeeData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketTypeId: "",
    orderId: "",
    dietaryRestrictions: "",
    specialRequirements: "",
  });
  
  const itemsPerPage = 10;


  // Fetch attendees with filters
  const attendees = useQuery(api.attendees.getAllAttendees, {
    eventId: currentEvent || undefined,
    ticketTypeId: filterTicketType || undefined,
    searchQuery: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
  }) || { attendees: [], totalCount: 0 };

  // Mutations
  const updateAttendee = useMutation(api.attendees.updateAttendee);
  const addAttendee = useMutation(api.attendees.addAttendee);
  const sendEmailToAttendees = useMutation(api.attendees.sendEmailToAttendees);

  // Handle pagination
  const totalPages = Math.ceil((attendees.totalCount || 0) / itemsPerPage);

  // Handle selecting an attendee for editing
  const handleSelectAttendee = (attendee: any) => {
    setSelectedAttendee(attendee);
    setIsEditModalOpen(true);
  };

  // Handle saving edited attendee
  const handleSaveEdit = async () => {
    if (!selectedAttendee) return;
    
    try {
      await updateAttendee({
        attendeeId: selectedAttendee._id,
        firstName: selectedAttendee.firstName,
        lastName: selectedAttendee.lastName,
        email: selectedAttendee.email,
        phone: selectedAttendee.phone || undefined,
        dietaryRestrictions: selectedAttendee.dietaryRestrictions || undefined,
        specialRequirements: selectedAttendee.specialRequirements || undefined,
      });
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating attendee:", error);
      alert("Failed to update attendee. Please try again.");
    }
  };

  // Handle adding a new attendee
  const handleAddAttendee = async () => {
    try {
      await addAttendee({
        ...newAttendeeData,
        orderId: newAttendeeData.orderId as Id<"orders">,
        ticketTypeId: newAttendeeData.ticketTypeId,
      });
      
      // Reset form and close modal
      setNewAttendeeData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ticketTypeId: "",
        orderId: "",
        dietaryRestrictions: "",
        specialRequirements: "",
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding attendee:", error);
      alert("Failed to add attendee. Please try again.");
    }
  };

  // Handle exporting attendee data
  const handleExportData = () => {
    // Implementation would depend on your export needs (CSV, Excel, etc.)
    console.log("Exporting data...");
    setIsExportModalOpen(false);
  };

  // Handle bulk email sending
  const handleSendBulkEmail = async () => {
    if (!currentEvent) return;
    
    try {
      await sendEmailToAttendees({
        eventId: currentEvent,
        ticketTypeId: filterTicketType || undefined,
        subject: "Important Event Information",
        message: "This is a test email to all filtered attendees.",
      });
      
      alert("Emails sent successfully!");
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      alert("Failed to send emails. Please try again.");
    }
  };

  // Helper function to generate pagination items
  const getPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // Page numbers with ellipsis for large page counts
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Show ellipsis or second page
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      } else {
        items.push(
          <PaginationItem key={2}>
            <PaginationLink
              onClick={() => setCurrentPage(2)}
              isActive={currentPage === 2}
            >
              2
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Show current page and neighbors
      for (
        let i = Math.max(3, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Show ellipsis or second-to-last page
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      } else {
        items.push(
          <PaginationItem key={totalPages - 1}>
            <PaginationLink
              onClick={() => setCurrentPage(totalPages - 1)}
              isActive={currentPage === totalPages - 1}
            >
              {totalPages - 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    return items;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendee Management</h1>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Attendee
          </Button>
          <Button onClick={() => setIsExportModalOpen(true)} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleSendBulkEmail} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email All
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter attendees by event, ticket type, check-in status, or search by name/email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">            
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees</CardTitle>
          <CardDescription>
            Showing {attendees.attendees.length} of {attendees.totalCount || 0} attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Check-in Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No attendees found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                attendees.attendees.map((attendee) => (
                  <TableRow key={attendee._id}>
                    <TableCell>
                      {attendee.firstName} {attendee.lastName}
                    </TableCell>
                    <TableCell>{attendee.email}</TableCell>
                    <TableCell>{attendee.phone || "—"}</TableCell>
                    <TableCell>
                      {new Date(attendee.registrationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectAttendee(attendee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, attendees.totalCount || 0)}-
              {Math.min(currentPage * itemsPerPage, attendees.totalCount || 0)} of {attendees.totalCount || 0} attendees
            </div>
            
            <Pagination>
              <PaginationContent>
                {getPaginationItems()}
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit Attendee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendee</DialogTitle>
            <DialogDescription>
              Update attendee information and preferences.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttendee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={selectedAttendee.firstName}
                    onChange={(e) =>
                      setSelectedAttendee({
                        ...selectedAttendee,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={selectedAttendee.lastName}
                    onChange={(e) =>
                      setSelectedAttendee({
                        ...selectedAttendee,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={selectedAttendee.email}
                    onChange={(e) =>
                      setSelectedAttendee({
                        ...selectedAttendee,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedAttendee.phone || ""}
                    onChange={(e) =>
                      setSelectedAttendee({
                        ...selectedAttendee,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-dietary">Dietary Restrictions</Label>
                <Input
                  id="edit-dietary"
                  value={selectedAttendee.dietaryRestrictions || ""}
                  onChange={(e) =>
                    setSelectedAttendee({
                      ...selectedAttendee,
                      dietaryRestrictions: e.target.value,
                    })
                  }
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-special">Special Requirements</Label>
                <Input
                  id="edit-special"
                  value={selectedAttendee.specialRequirements || ""}
                  onChange={(e) =>
                    setSelectedAttendee({
                      ...selectedAttendee,
                      specialRequirements: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Attendee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Attendee</DialogTitle>
            <DialogDescription>
              Add a new attendee to the event manually.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-firstName">First Name</Label>
                <Input
                  id="add-firstName"
                  value={newAttendeeData.firstName}
                  onChange={(e) =>
                    setNewAttendeeData({
                      ...newAttendeeData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-lastName">Last Name</Label>
                <Input
                  id="add-lastName"
                  value={newAttendeeData.lastName}
                  onChange={(e) =>
                    setNewAttendeeData({
                      ...newAttendeeData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  value={newAttendeeData.email}
                  onChange={(e) =>
                    setNewAttendeeData({
                      ...newAttendeeData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={newAttendeeData.phone}
                  onChange={(e) =>
                    setNewAttendeeData({
                      ...newAttendeeData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-dietary">Dietary Restrictions</Label>
              <Input
                id="add-dietary"
                value={newAttendeeData.dietaryRestrictions}
                onChange={(e) =>
                  setNewAttendeeData({
                    ...newAttendeeData,
                    dietaryRestrictions: e.target.value,
                  })
                }
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-special">Special Requirements</Label>
              <Input
                id="add-special"
                value={newAttendeeData.specialRequirements}
                onChange={(e) =>
                  setNewAttendeeData({
                    ...newAttendeeData,
                    specialRequirements: e.target.value,
                  })
                }
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAttendee}>Add Attendee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Attendee Data</DialogTitle>
            <DialogDescription>
              Choose export options for attendee data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="export-current" />
              <Label htmlFor="export-current">Export current filtered list only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="export-all" defaultChecked />
              <Label htmlFor="export-all">Export all attendees</Label>
            </div>
            
            <div className="pt-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button variant="outline" className="justify-start">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <Label>Include Fields</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-name" defaultChecked />
                  <Label htmlFor="include-name">Name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-email" defaultChecked />
                  <Label htmlFor="include-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-phone" defaultChecked />
                  <Label htmlFor="include-phone">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-ticket" defaultChecked />
                  <Label htmlFor="include-ticket">Ticket Type</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-date" defaultChecked />
                  <Label htmlFor="include-date">Registration Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-checkin" defaultChecked />
                  <Label htmlFor="include-checkin">Check-in Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-dietary" />
                  <Label htmlFor="include-dietary">Dietary Restrictions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-special" />
                  <Label htmlFor="include-special">Special Requirements</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData}>Export Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}