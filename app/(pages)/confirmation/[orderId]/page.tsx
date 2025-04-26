'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, MapPin, Mail, Download, Printer, ArrowLeft, Clock, Users } from 'lucide-react';

// Type for an individual attendee
interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
  ticketTypeId: string;
  ticketTypeName: string;
  dietaryRestrictions?: string;
}

// Type for order details
interface OrderDetails {
  orderId: string;
  orderDate: string;
  customerEmail: string;
  customerPhone: string;
  attendees: Attendee[];
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  totalAmount: number;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-12345';
  
  // In a real application, you would fetch the order details based on orderId
  // For demo purposes, we'll use mock data
  const [orderDetails] = useState<OrderDetails>({
    orderId: orderId,
    orderDate: new Date().toLocaleDateString(),
    customerEmail: 'customer@example.com',
    customerPhone: '+1 (555) 123-4567',
    attendees: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        ticketTypeId: 'adult-ticket',
        ticketTypeName: 'Adult Ticket'
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        ticketTypeId: 'adult-ticket',
        ticketTypeName: 'Adult Ticket'
      },
      {
        firstName: 'Billy',
        lastName: 'Kid',
        email: 'billy@example.com',
        ticketTypeId: 'child-ticket',
        ticketTypeName: 'Child - Under 12',
        dietaryRestrictions: 'Nut allergy'
      }
    ],
    eventName: 'Annual Community Festival',
    eventDate: 'June 15, 2025',
    eventTime: '10:00 AM - 6:00 PM',
    eventLocation: '123 Main Street, Anytown, USA',
    totalAmount: 90.00
  });

  // Group tickets by type for display
  const ticketGroups = orderDetails.attendees.reduce((groups, attendee) => {
    const type = attendee.ticketTypeId;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(attendee);
    return groups;
  }, {} as Record<string, Attendee[]>);

  // Count tickets by type
  const ticketCounts = Object.entries(ticketGroups).map(([id, attendees]) => ({
    id,
    name: attendees[0].ticketTypeName,
    count: attendees.length
  }));

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold">Registration Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Your tickets have been successfully booked and sent to your email.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Order #{orderDetails.orderId}</CardTitle>
              <CardDescription>Placed on {orderDetails.orderDate}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 self-start sm:self-auto">
              Confirmed
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Event Details</h3>
              
              <div className="flex gap-3 items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">{orderDetails.eventName}</p>
                  <p className="text-gray-600">{orderDetails.eventDate}</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Event Time</p>
                  <p className="text-gray-600">{orderDetails.eventTime}</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{orderDetails.eventLocation}</p>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              
              <div className="flex gap-3 items-start">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Tickets</p>
                  <ul className="text-gray-600">
                    {ticketCounts.map(ticket => (
                      <li key={ticket.id}>
                        {ticket.name} × {ticket.count}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Contact Information</p>
                  <p className="text-gray-600">{orderDetails.customerEmail}</p>
                  <p className="text-gray-600">{orderDetails.customerPhone}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>${orderDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t flex flex-col sm:flex-row gap-3 justify-between">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Mail className="h-4 w-4 mr-2" />
            Resend Confirmation
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Tickets
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Attendee Details */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee Details</CardTitle>
          <CardDescription>
            Information for all {orderDetails.attendees.length} registered attendees
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Group attendees by ticket type */}
            {Object.entries(ticketGroups).map(([typeId, attendees]) => (
              <div key={typeId} className="space-y-4">
                <h3 className="font-medium text-lg">
                  {attendees[0].ticketTypeName} 
                  <span className="text-gray-500 font-normal ml-2">
                    ({attendees.length} {attendees.length === 1 ? 'ticket' : 'tickets'})
                  </span>
                </h3>
                
                <div className="divide-y border rounded-lg">
                  {attendees.map((attendee, index) => (
                    <div key={`${typeId}-${index}`} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-medium">
                            {attendee.firstName} {attendee.lastName}
                          </h4>
                          <p className="text-gray-600 text-sm">{attendee.email}</p>
                          
                          {attendee.dietaryRestrictions && (
                            <p className="text-amber-600 text-sm mt-1">
                              Dietary Restrictions: {attendee.dietaryRestrictions}
                            </p>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          Edit Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
          
          <Link href="/my-tickets" className="w-full sm:w-auto">
            <Button className="w-full">
              Manage My Tickets
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}