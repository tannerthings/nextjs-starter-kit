// convex/events.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all events
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

// Get active events
export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get a specific event by ID
export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new event (admin only)
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    venue: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    // In a real app, you would check for admin permissions here
    
    return await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      venue: args.venue,
      capacity: args.capacity,
      isActive: true,
    });
  },
});

// Update an event (admin only)
export const update = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    venue: v.optional(v.string()),
    capacity: v.optional(v.number()),
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

// Delete an event (admin only)
export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    // In a real app, you would check for admin permissions here
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});