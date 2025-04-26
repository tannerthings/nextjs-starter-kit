// convex/emails.ts
import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { Resend } from 'resend';


// Helper function to generate HTML email template 
function generateOrderEmailTemplate(order: any, attendees: any[]): string {
  // Format the date in a readable way
  const orderDate = new Date(order.completedAt || order.createdAt).toLocaleDateString();
  
  // Start building the HTML email
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase! Your order has been confirmed.</p>
      
      <div style="background-color: #f7f7f7; padding: 15px; margin: 20px 0;">
        <p><strong>Order #:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${orderDate}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>
      
      <h3>Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add each item to the email
  order.items.forEach((item: any) => {
    const itemTotal = item.price * item.quantity;
    
    html += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.name}</strong>
          ${item.description ? `<br><span style="font-size: 0.9em;">${item.description}</span>` : ''}
          ${item.variantSelections ? `<br><span style="font-size: 0.9em;">${item.variantSelections.map((v: any) => `${v.name}: ${v.value}`).join(', ')}</span>` : ''}
        </td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });
  
  // Add order totals
  html += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>Subtotal:</strong></td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${order.subtotal.toFixed(2)}</td>
          </tr>
  `;
  
  // Add taxes and fees if present
  if (order.taxes) {
    html += `
      <tr>
        <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>Taxes:</strong></td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${order.taxes.toFixed(2)}</td>
      </tr>
    `;
  }
  
  if (order.fees) {
    html += `
      <tr>
        <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>Fees:</strong></td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${order.fees.toFixed(2)}</td>
      </tr>
    `;
  }
  
  // Add total
  html += `
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; font-weight: bold;">$${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
  `;
  
  // If there are attendees, add them to the email
  if (attendees && attendees.length > 0) {
    html += `
      <h3 style="margin-top: 30px;">Attendee Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Name</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Email</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Ticket Type</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add each attendee
    attendees.forEach((attendee: any) => {
      // Find the ticket name from the order items
      const ticketItem = order.items.find((item: any) => 
        item.itemType === 'ticket' && item.itemId === attendee.ticketTypeId
      );
      
      const ticketName = ticketItem ? ticketItem.name : 'Ticket';
      
      html += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${attendee.firstName} ${attendee.lastName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${attendee.email}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${ticketName}</td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
  }
  
  // Close the email with additional information
  html += `
      <div style="margin-top: 30px; padding: 20px; background-color: #f7f7f7;">
        <h4>Important Information</h4>
        <p>Please keep this email as your receipt and confirmation of purchase.</p>
        <p>If you have any questions or need assistance, please contact us at support@yourdomain.com</p>
      </div>
      
      <div style="margin-top: 30px; font-size: 0.8em; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} Event Name. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return html;
}

// Function to log emails to the database
async function logEmailToDB(ctx: any, {
  type,
  recipient,
  messageId,
  subject,
  status,
  errorMessage,
  orderId,
  eventId,
}: {
  type: string,
  recipient: string,
  messageId?: string,
  subject: string,
  status: string,
  errorMessage?: string,
  orderId?: Id<"orders">,
  eventId?: string,
}) {
  return await ctx.db.insert("emailLogs", {
    type,
    recipient,
    messageId,
    subject,
    status,
    errorMessage,
    orderId,
    eventId,
    sentAt: new Date().toISOString(),
  });
}

// Combined function to send order confirmation email
export const sendOrderConfirmationEmail = internalMutation({
  args: {
    orderId: v.id("orders"),
    order: v.any(), // The full order object
    attendees: v.array(v.any()) // Array of attendees
  },
  handler: async (ctx, args) => {
    const { order, attendees, orderId } = args;
    
    try {
      // Initialize Resend
      const resend = new Resend("re_Ss3v3cFu_GNyfvPqDkEV9RWDJ4q3YJ9eC");
    
      // Prepare email content
      const to = [order.customerEmail, "rennatx@gmail.com"];
      const subject = `Order Confirmation: #${orderId}`;
      const htmlContent = generateOrderEmailTemplate(order, attendees);
      
      console.log(to);
      console.log(subject);
      console.log(htmlContent);
    
      //

      ////////
      try {
        console.log("Attempting to send email to:", to);
        
        const result = await resend.emails.send({
          from: 'Event Registration <registration@mail.wileyswiftreunion.com',
          
          to,
          subject,
          html: htmlContent,
        });
        
        console.log("Resend API response:", JSON.stringify(result, null, 2));
        
        if (result.error) {
          console.error("Resend API returned an error:", result.error);
          throw new Error(`Resend API error: ${result.error.message || "Unknown error"}`);
        }
        
        // Check if data exists before accessing it
        if (!result.data) {
          console.error("Resend API returned no data");
          throw new Error("No data returned from Resend API");
        }
        
        console.log("Email sent successfully with ID:", result.data.id);
        
      } catch (error: any) {
        // Log detailed error information
        console.error("Email sending failed with error:", {
          message: error?.message || "Unknown error",
          stack: error?.stack,
          name: error?.name,
          // If the error has additional properties specific to Resend, log those too
          details: error?.response?.data || error?.details || {},
          status: error?.status || error?.statusCode,
        });
        
        // Rethrow or handle the error as needed
        throw new Error(`Failed to send email: ${error?.message || "Unknown error"}`);
      }
      ///////
      // Send the email
      const result = await resend.emails.send({
        from: 'Event Registration <registration@mail.wileyswiftreunion.com>',
        to,
        subject,
        html: htmlContent,
      });
      
      // Handle possible errors
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Log the successful email using our helper function
      await logEmailToDB(ctx, {
        type: 'order_confirmation',
        recipient: to.join(', '),
        messageId: result.data?.id,
        subject,
        status: 'sent',
        orderId,
      });
      
      return { success: true };
    } catch (error: any) {
      // Log the failed email using our helper function
      await logEmailToDB(ctx, {
        type: 'order_confirmation',
        recipient: order.customerEmail + ', rennatx@gmail.com',
        subject: `Order Confirmation: #${orderId}`,
        status: 'failed',
        errorMessage: error?.message || "Unknown error",
        orderId,
      });

      // Re-throw the error to be handled by the scheduler
      throw error;
    }
  }
});


// Send email via an external API (like Resend, SendGrid, etc.)
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx: any, args: { to: any; subject: any; html: any; }): Promise<{ success: boolean; error?: string }> => {
    try {      
      // For now, we'll just log it
      console.log(`Sending email to ${args.to} with subject "${args.subject}"`);
      console.log("Email content:", args.html);
      
      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
}); 


