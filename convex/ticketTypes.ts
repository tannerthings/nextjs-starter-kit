// convex/ticketTypes.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active ticket types
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("ticketTypes")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get ticket types for a specific event
export const getByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketTypes")
      .filter(q => 
        q.eq(q.field("eventId"), args.eventId) && 
        q.eq(q.field("isActive"), true)
      )
      .collect();
  },
});

// Get a specific ticket type by ID
export const getById = query({
  args: { id: v.id("ticketTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new ticket type (admin only)
export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    price: v.number(),
    description: v.string(),
    available: v.number(),
  },
  handler: async (ctx, args) => {
    // In a real app, you would check for admin permissions here
    
    return await ctx.db.insert("ticketTypes", {
      eventId: args.eventId,
      name: args.name,
      price: args.price,
      description: args.description,
      available: args.available,
      sold: 0,
      isActive: true,
    });
  },
});

// Update a ticket type (admin only)
export const update = mutation({
  args: {
    id: v.id("ticketTypes"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    available: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // In a real app, you would check for admin permissions here
    
    const { id, ...updates } = args;
    
    // Only include the fields that were provided
    const fieldsToUpdate: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fieldsToUpdate[key] = value;
      }
    }
    
    return await ctx.db.patch(id, fieldsToUpdate);
  },
});


export const getTicketTypes = query({
  args: {
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If eventId is provided, filter by eventId
    if (args.eventId) {
      return await ctx.db
        .query("ticketTypes")
        .filter(q => q.eq(q.field("eventId"), args.eventId))
        .collect();
    }
    
    // Otherwise, return all ticket types
    return await ctx.db.query("ticketTypes").collect();
  },
});

export const getTicketType = query({
  args: { ticketTypeId: v.id("ticketTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketTypeId);
  },
});