import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API key
// In production, use environment variables
const resend = new Resend('re_Ss3v3cFu_GNyfvPqDkEV9RWDJ4q3YJ9eC');

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Create email subject and content
    const subject = `Payment Confirmed: Your Reservation for 'Event'`;
    
    // Create HTML content for the email
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Payment Confirmation</h1>

        
        <p>We have received your payment and your reservation is now confirmed. You will receive your ticket(s) closer to the event date.</p>
        
        <p>Thank you for your reservation!</p>
        <p>The Events Team</p>
      </div>
    `;

    // Send the email
    const data = await resend.emails.send({
      from: 'Events <noreply@mail.wileyswiftreunion.com>',
      to: "rennatx@gmail.com",
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send payment confirmation email' },
      { status: 500 }
    );
  }
}