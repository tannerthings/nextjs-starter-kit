// lib/email.ts
import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import AdminNotificationEmail from '@/emails/AdminNotification';
import AttendeeBulkEmail from '@/emails/AttendeeBulkEmail';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Log email send attempts
async function logEmailSend(data: {
  type: string;
  recipient: string;
  messageId?: string;
  subject: string;
  status: string;
  errorMessage?: string;
  orderId?: string;
  eventId?: string;
}) {
  try {
    // You would call your Convex function here
    // await convex.mutation('email/logEmailSend', data);
    console.log('Email log:', data);
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

export async function sendOrderConfirmation({
  orderNumber,
  customerEmail,
  customerName,
  eventName,
  eventDate,
  eventLocation,
  attendees,
  totalAmount,
  orderId,
  eventId,
}: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  attendees: any[];
  totalAmount: number;
  orderId: string;
  eventId: string;
}) {
  try {
    const orderViewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${orderNumber}`;
    
    const html = await renderAsync(
      OrderConfirmationEmail({
        orderNumber,
        customerName,
        eventName,
        eventDate,
        eventLocation,
        attendees,
        totalAmount,
        orderViewUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: customerEmail,
      subject: `Your tickets for ${eventName} are confirmed!`,
      html,
    });

    await logEmailSend({
      type: 'order_confirmation',
      recipient: customerEmail,
      messageId: data?.id,
      subject: `Your tickets for ${eventName} are confirmed!`,
      status: error ? 'failed' : 'sent',
      errorMessage: error?.message,
      orderId,
      eventId,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error);
    
    await logEmailSend({
      type: 'order_confirmation',
      recipient: customerEmail,
      subject: `Your tickets for ${eventName} are confirmed!`,
      status: 'failed',
      errorMessage: error.message,
      orderId,
      eventId,
    });

    return { success: false, error };
  }
}

export async function sendAdminNotification({
  orderNumber,
  customerEmail,
  customerPhone,
  eventName,
  ticketSummary,
  totalAmount,
  orderId,
  eventId,
  adminEmails,
}: {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  ticketSummary: { name: string; count: number }[];
  totalAmount: number;
  orderId: string;
  eventId: string;
  adminEmails: string[];
}) {
  try {
    const adminDashboardUrl = `${process.env.NEXT_PUBLIC_ADMIN_URL}/orders/${orderNumber}`;
    
    const html = await renderAsync(
      AdminNotificationEmail({
        orderNumber,
        customerEmail,
        customerPhone,
        eventName,
        ticketSummary,
        totalAmount,
        adminDashboardUrl,
      })
    );

    const results = await Promise.all(
      adminEmails.map(async (email) => {
        const { data, error } = await resend.emails.send({
          from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
          to: email,
          subject: `New Order #${orderNumber} for ${eventName}`,
          html,
        });

        await logEmailSend({
          type: 'admin_notification',
          recipient: email,
          messageId: data?.id,
          subject: `New Order #${orderNumber} for ${eventName}`,
          status: error ? 'failed' : 'sent',
          errorMessage: error?.message,
          orderId,
          eventId,
        });

        return { email, success: !error, data, error };
      })
    );

    const failures = results.filter(r => !r.success);
    return { 
      success: failures.length === 0,
      data: results
    };
  } catch (error: any) {
    console.error('Failed to send admin notification emails:', error);
    
    for (const email of adminEmails) {
      await logEmailSend({
        type: 'admin_notification',
        recipient: email,
        subject: `New Order Notification`,
        status: 'failed',
        errorMessage: error.message,
        orderId,
        eventId,
      });
    }

    return { success: false, error };
  }
}

export async function sendBulkEmail({
  recipients,
  subject,
  messageHtml,
  eventName,
  eventDate,
  eventId,
  ctaText,
  ctaUrl,
}: {
  recipients: { email: string; firstName: string; lastName: string }[];
  subject: string;
  messageHtml: string;
  eventName: string;
  eventDate: string;
  eventId: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  const results = [];
  const batchSize = 50; // Send in batches to avoid rate limits
  
  // Process in batches
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (recipient) => {
      try {
        // Replace template variables in HTML
        const personalizedHtml = messageHtml
          .replace(/{{firstName}}/g, recipient.firstName)
          .replace(/{{lastName}}/g, recipient.lastName)
          .replace(/{{email}}/g, recipient.email);
        
        const html = await renderAsync(
          AttendeeBulkEmail({
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            eventName,
            eventDate,
            subject,
            messageHtml: personalizedHtml,
            ctaText,
            ctaUrl,
          })
        );

        const { data, error } = await resend.emails.send({
          from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
          to: recipient.email,
          subject,
          html,
        });

        await logEmailSend({
          type: 'bulk_email',
          recipient: recipient.email,
          messageId: data?.id,
          subject,
          status: error ? 'failed' : 'sent',
          errorMessage: error?.message,
          eventId,
        });

        return { 
          email: recipient.email, 
          success: !error,
          messageId: data?.id, 
          error 
        };
      } catch (error: any) {
        await logEmailSend({
          type: 'bulk_email',
          recipient: recipient.email,
          subject,
          status: 'failed',
          errorMessage: error.message,
          eventId,
        });
        
        return { 
          email: recipient.email, 
          success: false, 
          error: error.message 
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add a small delay between batches to avoid rate limits
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  return {
    success: failed === 0,
    sent: successful,
    failed,
    total: recipients.length,
    results
  };
}