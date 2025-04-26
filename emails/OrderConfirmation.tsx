// emails/OrderConfirmation.tsx
import React from 'react';
import { 
  Text, 
  Section, 
  Button, 
  Hr,
  Link
} from '@react-email/components';
import { Layout } from './components/Layout';

interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
  ticketTypeName: string;
  dietaryRestrictions?: string;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  attendees: Attendee[];
  totalAmount: number;
  orderViewUrl: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  eventName,
  eventDate,
  eventLocation,
  attendees,
  totalAmount,
  orderViewUrl,
}: OrderConfirmationProps) => {
  return (
    <Layout 
      previewText={`Your tickets to ${eventName} are confirmed!`}
      heading="Your Registration is Confirmed!"
    >
      <Text>Hello {customerName},</Text>
      <Text>Thank you for your order! Your tickets for {eventName} have been confirmed.</Text>
      
      <Section style={{ backgroundColor: '#f9f9f9', padding: '14px', borderRadius: '5px', marginTop: '20px' }}>
        <Text style={{ fontWeight: 'bold', margin: '0' }}>Order Summary</Text>
        <Text style={{ margin: '8px 0' }}>Order Number: {orderNumber}</Text>
        <Text style={{ margin: '8px 0' }}>Event: {eventName}</Text>
        <Text style={{ margin: '8px 0' }}>Date: {eventDate}</Text>
        <Text style={{ margin: '8px 0' }}>Location: {eventLocation}</Text>
        <Text style={{ margin: '8px 0', fontWeight: 'bold' }}>Total Amount: ${totalAmount.toFixed(2)}</Text>
      </Section>
      
      <Section style={{ marginTop: '20px' }}>
        <Text style={{ fontWeight: 'bold' }}>Attendee Information</Text>
        {attendees.map((attendee, index) => (
          <Section key={index} style={{ 
            borderBottom: index < attendees.length - 1 ? '1px solid #f0f0f0' : 'none',
            paddingBottom: '8px',
            marginBottom: '8px' 
          }}>
            <Text style={{ margin: '4px 0' }}>
              <strong>{attendee.ticketTypeName}</strong>: {attendee.firstName} {attendee.lastName}
            </Text>
            {attendee.dietaryRestrictions && (
              <Text style={{ margin: '4px 0', fontSize: '14px' }}>
                Dietary Requirements: {attendee.dietaryRestrictions}
              </Text>
            )}
          </Section>
        ))}
      </Section>
      
      <Hr style={{ margin: '24px 0' }} />
      
      <Section style={{ textAlign: 'center' }}>
        <Button 
          href={orderViewUrl}
          style={{
            backgroundColor: '#5046e5',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          View Your Tickets
        </Button>
      </Section>
      
      <Text style={{ fontSize: '14px', color: '#666', marginTop: '20px', textAlign: 'center' }}>
        If you have any questions, please contact our support team at{' '}
        <Link href="mailto:support@yourevent.com">support@yourevent.com</Link>
      </Text>
    </Layout>
  );
};

export default OrderConfirmationEmail;