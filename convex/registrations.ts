// convex/registrations.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new registration
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    company: v.optional(v.string()),
    ticketTypeId: v.string(),
    dietaryRestrictions: v.optional(v.string()),
    paymentMethod: v.string(),
    paymentEmail: v.optional(v.string()),
    paymentPhone: v.optional(v.string()),
    paymentConfirmation: v.string(),
    paymentStatus: v.string(),
    paymentAmount: v.number(),
    registrationDate: v.string()
  },
  handler: async (ctx, args) => {
    // Insert registration into the database
    const registrationId = await ctx.db.insert("registrations", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      company: args.company,
      ticketTypeId: args.ticketTypeId,
      dietaryRestrictions: args.dietaryRestrictions,
      paymentMethod: args.paymentMethod,
      paymentEmail: args.paymentEmail,
      paymentPhone: args.paymentPhone,
      paymentConfirmation: args.paymentConfirmation,
      paymentStatus: args.paymentStatus,
      paymentAmount: args.paymentAmount,
      registrationDate: args.registrationDate,
      paymentVerified: false,
      notificationSent: false
    });
    
    // Get admin notification settings
    const notificationSettings = await ctx.db
      .query("notificationSettings")
      .first();
    
    // Send notification to admin if enabled
    if (notificationSettings && notificationSettings.notifyOnRegistration) {
      await sendNotifications(ctx, {
        adminEmail: notificationSettings.adminEmail,
        adminPhone: notificationSettings.adminPhone,
        subject: "New Event Registration",
        message: `New registration: ${args.firstName} ${args.lastName} (${args.email}) has registered for a ${args.ticketTypeId} ticket.`
      });
      
      // Mark notification as sent
      await ctx.db.patch(registrationId, {
        notificationSent: true
      });
    }
    
    return registrationId;
  },
});

// Get all registrations
export const getAll = query({
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    return registrations;
  },
});

// Get registrations by day for charting
export const getRegistrationsByDay = query({
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    
    // Group registrations by day
    const registrationsByDay = registrations.reduce((acc, registration) => {
      const date = registration.registrationDate.split('T')[0];
      
      const existingDay = acc.find(day => day.date === date);
      if (existingDay) {
        existingDay.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      
      return acc;
    }, [] as { date: string; count: number }[]);
    
    // Sort by date
    registrationsByDay.sort((a, b) => a.date.localeCompare(b.date));
    
    return registrationsByDay;
  },
});

// Get summary of ticket types
export const getTicketTypeSummary = query({
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    
    // Group by ticket type
    const ticketTypes = registrations.reduce((acc, registration) => {
      const ticketType = registration.ticketTypeId;
      const existingType = acc.find(t => t.ticketType === ticketType);
      
      if (existingType) {
        existingType.count += 1;
        existingType.revenue += registration.paymentAmount;
      } else {
        acc.push({
          ticketType,
          count: 1,
          revenue: registration.paymentAmount
        });
      }
      
      return acc;
    }, [] as { ticketType: string; count: number; revenue: number }[]);
    
    return ticketTypes;
  },
});

// Get total revenue
export const getTotalRevenue = query({
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    
    const totalRevenue = registrations.reduce(
      (sum, registration) => sum + registration.paymentAmount,
      0
    );
    
    return totalRevenue;
  },
});

// Get payment method stats
export const getPaymentMethodStats = query({
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    
    // Group by payment method
    const paymentMethods = registrations.reduce((acc, registration) => {
      const method = registration.paymentMethod;
      const existingMethod = acc.find(m => m.method === method);
      
      if (existingMethod) {
        existingMethod.count += 1;
        existingMethod.revenue += registration.paymentAmount;
      } else {
        acc.push({
          method,
          count: 1,
          revenue: registration.paymentAmount
        });
      }
      
      return acc;
    }, [] as { method: string; count: number; revenue: number }[]);
    
    return paymentMethods;
  },
});

// Verify a payment
export const verifyPayment = mutation({
  args: {
    registrationId: v.id("registrations"),
    adminName: v.string(),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    
    if (!registration) {
      throw new Error("Registration not found");
    }
    
    // Update the registration with verification info
    await ctx.db.patch(args.registrationId, {
      paymentStatus: "verified",
      paymentVerified: true,
      verificationDate: new Date().toISOString(),
      verifiedBy: args.adminName
    });
    
    return true;
  },
});

// Function to send notifications (email and SMS)
async function sendNotifications(
  ctx: any,
  {
    adminEmail,
    adminPhone,
    subject,
    message
  }: {
    adminEmail: string;
    adminPhone: string;
    subject: string;
    message: string;
  }
) {
  // In a real application, you would integrate with an email service like SendGrid
  // and an SMS service like Twilio here
  
  // For this example, we'll just log the notification
  console.log(`NOTIFICATION to ${adminEmail} and ${adminPhone}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  
  // In a real implementation:
  // 1. Add SendGrid/Mailgun for email
  // await sendEmail(adminEmail, subject, message);
  
  // 2. Add Twilio for SMS
  // await sendSMS(adminPhone, message);
  
  return true;
}