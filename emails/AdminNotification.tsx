// emails/AdminNotification.tsx
import React from 'react';
import { 
  Text, 
  Section, 
  Button, 
  Hr,
  Link
} from '@react-email/components';
import { Layout } from './components/Layout';

interface TicketSummary {
  name: string;
  count: number;
}

interface AdminNotificationProps {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  ticketSummary: TicketSummary[];
  totalAmount: number;
  adminDashboardUrl: string;
}

export const AdminNotificationEmail = ({
  orderNumber,
  customerEmail,
  customerPhone,
  eventName,
  ticketSummary,
  totalAmount,
  adminDashboardUrl,
}: AdminNotificationProps) => {
  return (
    <Layout 
      previewText={`New order received: #${orderNumber}`}
      heading="New Order Received"
    >
      <Text>A new order has been successfully processed.</Text>
      
      <Section style={{ backgroundColor: '#f9f9f9', padding: '14px', borderRadius: '5px', marginTop: '20px' }}>
        <Text style={{ fontWeight: 'bold', margin: '0' }}>Order Details</Text>
        <Text style={{ margin: '8px 0' }}>Order Number: {orderNumber}</Text>
        <Text style={{ margin: '8px 0' }}>Event: {eventName}</Text>
        <Text style={{ margin: '8px 0' }}>Customer Email: {customerEmail}</Text>
        <Text style={{ margin: '8px 0' }}>Customer Phone: {customerPhone}</Text>
        <Text style={{ margin: '8px 0', fontWeight: 'bold' }}>Total Amount: ${totalAmount.toFixed(2)}</Text>
      </Section>
      
      <Section style={{ marginTop: '20px' }}>
        <Text style={{ fontWeight: 'bold' }}>Ticket Summary</Text>
        {ticketSummary.map((ticket, index) => (
          <Text key={index} style={{ margin: '4px 0' }}>
            {ticket.name}: {ticket.count} ticket{ticket.count !== 1 ? 's' : ''}
          </Text>
        ))}
      </Section>
      
      <Hr style={{ margin: '24px 0' }} />
      
      <Section style={{ textAlign: 'center' }}>
        <Button 
          href={adminDashboardUrl}
          style={{
            backgroundColor: '#5046e5',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          View Order Details
        </Button>
      </Section>
    </Layout>
  );
};

export default AdminNotificationEmail;