'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  PlusIcon, 
  CreditCardIcon, 
  ShoppingBagIcon 
} from 'lucide-react';

// Import Alert component in case we need to show notifications
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminDashboardPage() {
  // Get data for dashboard
  const events = useQuery(api.events.getActive) || [];
  const allTicketTypes = useQuery(api.ticketTypes.getAll) || [];
  const merchandise = useQuery(api.merchandise.getActive) || [];
  
  // Calculate totals and stats
  const totalEvents = events.length;
  const totalTicketTypes = allTicketTypes.length;
  const totalMerchandise = merchandise.length;
  
  // Calculate total capacity across all events
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);
  
  // Calculate total available tickets across all ticket types
  const totalAvailableTickets = allTicketTypes.reduce((sum, ticket) => sum + ticket.available, 0);
  
  // Calculate total sold tickets across all ticket types
  const totalSoldTickets = allTicketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
  
  // Calculate ticket sales percentage
  const ticketSalesPercentage = totalAvailableTickets + totalSoldTickets > 0 
    ? Math.round((totalSoldTickets / (totalAvailableTickets + totalSoldTickets)) * 100) 
    : 0;
  
  // Format date for display
  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Active Events */}
          <Card className="border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-900">Active Events</CardTitle>
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-neutral-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">{totalEvents}</div>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="px-0 text-neutral-600 hover:text-neutral-900">
                <Link href="/admin/events">View all events</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Ticket Sales */}
          <Card className="border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-900">Ticket Sales</CardTitle>
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <CreditCardIcon className="h-4 w-4 text-neutral-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-neutral-900">{totalSoldTickets} / {totalSoldTickets + totalAvailableTickets}</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-500">Sales Progress</p>
                  <p className="text-sm text-neutral-500">{ticketSalesPercentage}%</p>
                </div>
                <Progress value={ticketSalesPercentage} className="bg-neutral-200">
                  <div className="h-full bg-neutral-600 rounded-full" />
                </Progress>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="px-0 text-neutral-600 hover:text-neutral-900">
                <Link href="/admin/tickets">Manage tickets</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Merchandise */}
          <Card className="border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-900">Merchandise Items</CardTitle>
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <ShoppingBagIcon className="h-4 w-4 text-neutral-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">{totalMerchandise}</div>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="px-0 text-neutral-600 hover:text-neutral-900">
                <Link href="/admin/merchandise">Manage merchandise</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Upcoming Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Upcoming Events</h2>
            <Button variant="link" asChild className="px-0 text-neutral-600 hover:text-neutral-900">
              <Link href="/admin/events">View all</Link>
            </Button>
          </div>
          
          <Card className="border-neutral-200">
            {events.length === 0 ? (
              <CardContent className="py-4">
                <p className="text-sm text-neutral-500">No active events. Create your first event to get started.</p>
              </CardContent>
            ) : (
              <div className="divide-y divide-neutral-200">
                {events.map(event => (
                  <div key={event._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-neutral-800">{event.name}</p>
                        <div className="flex items-center text-sm text-neutral-500">
                          <CalendarIcon className="mr-1 h-4 w-4 text-neutral-400" />
                          <span>
                            {formatDate(event.startDate)} - {formatDate(event.endDate)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200"
                        asChild
                      >
                        <Link href={`/admin/tickets?eventId=${event._id}`}>
                          Manage Tickets
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <div className="flex items-center text-neutral-500">
                        <MapPinIcon className="mr-1 h-4 w-4 text-neutral-400" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center text-neutral-500">
                        <UsersIcon className="mr-1 h-4 w-4 text-neutral-400" />
                        <span>Capacity: {event.capacity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        {/* Quick Actions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-900">Quick Actions</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:border-neutral-300 hover:shadow-md transition-all border-neutral-200">
              <Link href="/admin/events" className="block h-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <PlusIcon className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Create Event</p>
                    <p className="text-sm text-neutral-500">Set up a new event with tickets</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="hover:border-neutral-300 hover:shadow-md transition-all border-neutral-200">
              <Link href="/admin/tickets" className="block h-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <CreditCardIcon className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Manage Tickets</p>
                    <p className="text-sm text-neutral-500">Add or edit ticket types</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="hover:border-neutral-300 hover:shadow-md transition-all border-neutral-200">
              <Link href="/admin/merchandise" className="block h-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <ShoppingBagIcon className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Add Merchandise</p>
                    <p className="text-sm text-neutral-500">Create new merchandise items</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}