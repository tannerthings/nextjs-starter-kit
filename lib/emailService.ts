// src/emailService.ts
import { Resend } from 'resend';
import * as PDFLib from 'pdf-lib';
import QRCode from 'qrcode';
import { createCanvas } from 'canvas';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Define interfaces for type safety
interface EventDetails {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  calendarLink: string;
}

interface PaymentDetails {
  transactionId: string;
  paymentDate: string;
  ticketType: string;
  ticketQuantity: number;
  ticketPrice: number;
  discountApplied: boolean;
  discountAmount?: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  includeAttachment: boolean;
  ticketPdfBuffer?: Buffer;
}

interface CustomerDetails {
  firstName: string;
  email: string;
  unsubscribeLink: string;
}

interface PaymentConfirmationData extends EventDetails, PaymentDetails, CustomerDetails {}

// Resend API response types
interface ResendErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode?: number;
  }
}

interface ResendSuccessResponse {
  id: string;
}

// Union type for possible Resend API responses
type ResendEmailResponse = ResendSuccessResponse | ResendErrorResponse;

export class EmailService {
  private resend: Resend;
  private emailTemplates: Record<string, HandlebarsTemplateDelegate<any>>;
  private adminEmail: string;
  
  constructor(resendApiKey: string, adminEmail?: string) {
    if (!resendApiKey) {
      throw new Error('Resend API key is required');
    }
    this.resend = new Resend(resendApiKey);
    this.emailTemplates = {};
    this.adminEmail = adminEmail || process.env.ADMIN_EMAIL || 'admin@yourevent.com';
    this.loadEmailTemplates();
  }
  
  private loadEmailTemplates(): void {
    // Load and compile the email template using Handlebars
    try {
      const templatePath = path.join(__dirname, '../templates/payment-confirmation.html');
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      this.emailTemplates.paymentConfirmation = Handlebars.compile(templateSource);
    } catch (error) {
      console.error('Failed to load email templates:', error);
      throw new Error('Email templates could not be loaded');
    }
  }
  
  /**
   * Sends a payment confirmation email for event registration
   * @param data Payment and event details
   * @returns Promise with the email send result
   */
  public async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<ResendSuccessResponse> {
    try {
      // Render the HTML template with the data
      const html = this.emailTemplates.paymentConfirmation(data);
      
      // Prepare attachments if needed
      const attachments = data.includeAttachment && data.ticketPdfBuffer 
        ? [
            {
              filename: `ticket-${data.transactionId}.pdf`,
              content: data.ticketPdfBuffer,
            }
          ] 
        : undefined;
      
      // Send the email using Resend, including a CC to the admin
      const response = await this.resend.emails.send({
        from: 'Your Event <events@yourdomain.com>',
        to: [data.email],
        cc: [this.adminEmail], // Add carbon copy to admin email
        subject: `Payment Confirmation for ${data.eventName}`,
        html,
        attachments,
        // Optional: Add additional headers for tracking
        headers: {
          'X-Transaction-Id': data.transactionId,
          'X-Event-Id': data.eventName.replace(/\s+/g, '-').toLowerCase(),
        }
      }) as ResendEmailResponse;
      
      // Check if response contains error
      if ('error' in response) {
        throw new Error(`Email sending failed: ${response.error.message}`);
      }
      
      console.log('Payment confirmation email sent:', response.id);
      return { id: response.id };
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      throw error;
    }
  }

  /**
   * Sends a test email to verify the service is working
   * @param recipient Email address to send the test to
   * @returns Promise with the email send result
   */
  public async sendTestEmail(recipient: string): Promise<ResendSuccessResponse> {
    try {
      const response = await this.resend.emails.send({
        from: 'Your Event <events@yourdomain.com>',
        to: [recipient],
        cc: [this.adminEmail], // Add carbon copy to admin email
        subject: 'Test Email from Event Registration System',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email from your event registration system.</p>
          <p>If you received this email, your email service is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        `,
      }) as ResendEmailResponse;
      
      if ('error' in response) {
        throw new Error(`Test email sending failed: ${response.error.message}`);
      }
      
      console.log('Test email sent successfully:', response.id);
      return { id: response.id };
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }
  
  /**
   * Set a new admin email address
   * @param email The admin email address
   */
  public setAdminEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    this.adminEmail = email;
  }
  
  /**
   * Get the current admin email address
   * @returns The admin email address
   */
  public getAdminEmail(): string {
    return this.adminEmail;
  }
}

// Example usage
export async function generateTicketPdf(data: any): Promise<Buffer> {
  // Implementation from previous code...
  const pdfDoc = await PDFLib.PDFDocument.create();
  // ... PDF generation logic
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}