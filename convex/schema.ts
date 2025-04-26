import { defineSchema, defineTable } from "convex/server"
import { Infer, v } from "convex/values"
import { mutation } from "./_generated/server";

export const INTERVALS = {
    MONTH: "month",
    YEAR: "year",
} as const;

export const intervalValidator = v.union(
    v.literal(INTERVALS.MONTH),
    v.literal(INTERVALS.YEAR),
);

export type Interval = Infer<typeof intervalValidator>;

// Define a price object structure that matches your data
const priceValidator = v.object({
    amount: v.number(),
    polarId: v.string(),
});

// Define a prices object structure for a specific interval
const intervalPricesValidator = v.object({
    usd: priceValidator,
});

export default defineSchema({
    users: defineTable({
        createdAt: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        userId: v.string(),
        subscription: v.optional(v.string()),
        credits: v.optional(v.string()),
        tokenIdentifier: v.string(),
    }).index("by_token", ["tokenIdentifier"]),
    subscriptions: defineTable({
        userId: v.optional(v.string()),
        polarId: v.optional(v.string()),
        polarPriceId: v.optional(v.string()),
        currency: v.optional(v.string()),
        interval: v.optional(v.string()),
        status: v.optional(v.string()),
        currentPeriodStart: v.optional(v.number()),
        currentPeriodEnd: v.optional(v.number()),
        cancelAtPeriodEnd: v.optional(v.boolean()),
        amount: v.optional(v.number()),
        startedAt: v.optional(v.number()),
        endsAt: v.optional(v.number()),
        endedAt: v.optional(v.number()),
        canceledAt: v.optional(v.number()),
        customerCancellationReason: v.optional(v.string()),
        customerCancellationComment: v.optional(v.string()),
        metadata: v.optional(v.any()),
        customFieldData: v.optional(v.any()),
        customerId: v.optional(v.string()),
    })
        .index("userId", ["userId"])
        .index("polarId", ["polarId"]),
    webhookEvents: defineTable({
        type: v.string(),
        polarEventId: v.string(),
        createdAt: v.string(),
        modifiedAt: v.string(),
        data: v.any(),
    })
        .index("type", ["type"])
        .index("polarEventId", ["polarEventId"]),
        registrations: defineTable({
            // Personal information
            firstName: v.string(),
            lastName: v.string(),
            email: v.string(),
            phone: v.string(),
            company: v.optional(v.string()),
            
            // Event information
            ticketTypeId: v.string(),
            dietaryRestrictions: v.optional(v.string()),
            
            // Payment information
            paymentMethod: v.string(), // 'paypal', 'zelle'
            paymentEmail: v.optional(v.string()), // For PayPal
            paymentPhone: v.optional(v.string()), // For Zelle
            paymentConfirmation: v.string(), // Transaction ID or confirmation
            paymentStatus: v.string(), // 'pending', 'completed', 'failed', 'verified'
            paymentAmount: v.number(),
            registrationDate: v.string(),
            
            // Admin fields
            notificationSent: v.optional(v.boolean()),
            paymentVerified: v.optional(v.boolean()),
            verificationDate: v.optional(v.string()),
            verifiedBy: v.optional(v.string()),
            notes: v.optional(v.string()),
        
            // Link to order if part of a cart checkout
            orderId: v.optional(v.id("orders")),
          }),
          
          // Store event configuration
          events: defineTable({
            name: v.string(),
            description: v.string(),
            startDate: v.string(),
            endDate: v.string(),
            venue: v.string(),
            capacity: v.number(),
            isActive: v.boolean(),
          }),
          
          // Ticket types configuration
          ticketTypes: defineTable({
            eventId: v.id("events"),
            name: v.string(),
            price: v.number(),
            description: v.string(),
            available: v.number(),
            sold: v.number(),
            isActive: v.boolean(),
          }),
          
          // Merchandise items
          merchandise: defineTable({
            name: v.string(),
            description: v.string(),
            price: v.number(),
            imageUrl: v.optional(v.string()),
            available: v.number(),
            sold: v.number(),
            category: v.string(), // e.g., "clothing", "accessories", "books"
            variants: v.optional(v.array(
              v.object({
                name: v.string(), // e.g., "Size", "Color"
                values: v.array(v.string())
              })
            )),
            isActive: v.boolean(),
          }),
          
          // Admin notifications configuration
          notificationSettings: defineTable({
            adminEmail: v.string(),
            adminPhone: v.string(),
            notifyOnRegistration: v.boolean(),
            notifyOnPayment: v.boolean(),
            dailySummary: v.boolean(),
          }),
        
          // ==== Shopping Cart Schema ====
        
          // Cart items
          carts: defineTable({
            // User identification (could be a logged-in user ID or session ID)
            userId: v.optional(v.string()),
            sessionId: v.string(),
            
            // Cart contents
            items: v.array(
              v.object({
                itemId: v.string(),
                itemType: v.string(), // 'ticket' or 'merchandise'
                quantity: v.number(),
                price: v.number(),
                name: v.string(),
                description: v.optional(v.string()),
                variantSelections: v.optional(v.array(
                  v.object({
                    name: v.string(),
                    value: v.string()
                  })
                )),
              })
            ),
            
            // Cart state
            status: v.string(), // 'active', 'abandoned', 'converted'
            
            // Timestamps
            createdAt: v.string(),
            updatedAt: v.string(),
            expiresAt: v.optional(v.string()),
            
            // Totals
            subtotal: v.number(),
            taxes: v.optional(v.number()),
            fees: v.optional(v.number()),
            total: v.number(),
          }),
          
          // Orders (carts that have been checked out)
          orders: defineTable({
            // User/customer information
            userId: v.optional(v.string()),
            sessionId: v.string(),
            customerEmail: v.string(),
            customerPhone: v.string(),
            
            // Order details (copied from cart at checkout)
            items: v.array(
              v.object({
                itemId: v.string(),
                itemType: v.string(), // 'ticket' or 'merchandise'
                quantity: v.number(),
                price: v.number(),
                name: v.string(),
                description: v.optional(v.string()),
                variantSelections: v.optional(v.array(
                  v.object({
                    name: v.string(),
                    value: v.string()
                  })
                )),
              })
            ),
            
            // Financial details
            subtotal: v.number(),
            taxes: v.optional(v.number()),
            fees: v.optional(v.number()),
            total: v.number(),
            
            // Payment info
            paymentMethod: v.string(), // 'paypal', 'zelle'
            paymentEmail: v.optional(v.string()),
            paymentPhone: v.optional(v.string()),
            paymentConfirmation: v.optional(v.string()),
            paymentStatus: v.string(), // 'pending', 'completed', 'verified'
            
            // Admin fields
            status: v.string(), // 'pending', 'processing', 'completed', 'cancelled'
            notes: v.optional(v.string()),
            
            // Original cart reference
            cartId: v.id("carts"),
            
            // Timestamps
            createdAt: v.string(),
            updatedAt: v.optional(v.string()),
            completedAt: v.optional(v.string()),
          }),
          
          // Attendee details for orders with multiple tickets
          attendees: defineTable({
            // Order reference
            orderId: v.id("orders"),
            ticketTypeId: v.string(),
            
            // Personal information
            firstName: v.string(),
            lastName: v.string(),
            email: v.string(),
            phone: v.optional(v.string()),
            age: v.optional(v.string()),
            
            // Additional info
            dietaryRestrictions: v.optional(v.string()),
            specialRequirements: v.optional(v.string()),
            
            // Registration details
            registrationDate: v.string(),
            checkInDate: v.optional(v.string()),
            isCheckedIn: v.optional(v.boolean()),
          }),  
          emailLogs : defineTable({
            type: v.string(), // 'order_confirmation', 'admin_notification', 'bulk_campaign'
            recipient: v.string(),
            messageId: v.optional(v.string()),
            subject: v.string(),
            status: v.string(), // 'sent', 'failed', 'bounced'
            errorMessage: v.optional(v.string()),
            orderId: v.optional(v.id("orders")),
            eventId: v.optional(v.string()),
            sentAt: v.string(),
          })
})
