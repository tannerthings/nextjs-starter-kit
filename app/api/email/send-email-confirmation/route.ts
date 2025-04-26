import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API key
// In production, use environment variables
const resend = new Resend('re_Ss3v3cFu_GNyfvPqDkEV9RWDJ4q3YJ9eC');

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract email addresses and other parameters from the request body
    const { 
      to, 
      customerEmail,
      attendeeEmails = [],
      adminEmail,
      orderId,
      orderDetails = {},
      emailType = 'customer' // Default to customer email
    } = body;
    
    console.log(JSON.stringify(body));

    // Determine recipient - use explicitly provided 'to' field, or fallback to appropriate email
    const recipient = to || (
      emailType === 'admin' ? adminEmail :
      emailType === 'attendee' ? attendeeEmails[0] : 
      customerEmail
    );
    
    if (!recipient) {
      return NextResponse.json(
        { error: 'No recipient email address provided' },
        { status: 400 }
      );
    }
    
    // Create email subject based on email type
    let subject;
    let html;
    
    if (emailType === 'admin') {
      subject = `New Order Received: ${orderId}`;
      html = body.html ||  `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Order Received</h1>
          <p>Order ID: ${orderId || 'N/A'}</p>
          <p>Customer: ${customerEmail || 'N/A'}</p>
          <p>Total: $${orderDetails.total?.toFixed(2) || '0.00'}</p>
          <!-- More order details here -->
          <p>Please review this order in the admin dashboard.<a ref='/attendees'</a></p>
        </div>
      `;
    } else if (emailType === 'attendee') {
      subject = `Your Registration Information for Event`;
      html = body.html ||  `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your Registration Information</h1>
          <p>Order ID: ${orderId || 'N/A'}</p>
          <!-- Registration-specific details here -->
          <p>We look forward to seeing you at the event!</p>
        </div>
      `;
    } else {
      // Default customer email
      subject = body.subject || `Payment Confirmed: Your Reservation for 'Event'`;
      html = body.html || `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Payment Confirmation</h1>
          <p>We have received your payment and your registration is now confirmed. You will receive updates closer to the reunion date.</p>
          <p>Order ID: ${orderId || 'N/A'}</p>
          <p>Total Amount: $${orderDetails.total?.toFixed(2) || '0.00'}</p>
          <p>Thank you for your reservation!</p>
          <p>The Reunion Team</p>
        </div>
      `;
    }

    // Send the email
    const data = await resend.emails.send({
      from: 'Wiley Swift Reunion <noreply@mail.wileyswiftreunion.com>',
      to: recipient,
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}