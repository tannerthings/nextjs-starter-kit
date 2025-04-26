// convex/merchandise.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active merchandise
export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("merchandise")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get merchandise by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("merchandise")
      .filter(q => 
        q.eq(q.field("category"), args.category) && 
        q.eq(q.field("isActive"), true)
      )
      .collect();
  },
});

// Get a specific merchandise item by ID
export const getById = query({
  args: { id: v.id("merchandise") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new merchandise item (admin only)
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    available: v.number(),
    category: v.string(),
    variants: v.optional(v.array(
      v.object({
        name: v.string(),
        values: v.array(v.string())
      })
    )),
  },
  handler: async (ctx, args) => {
    // In a real app, you would check for admin permissions here
    
    return await ctx.db.insert("merchandise", {
      name: args.name,
      description: args.description,
      price: args.price,
      imageUrl: args.imageUrl,
      available: args.available,
      sold: 0,
      category: args.category,
      variants: args.variants,
      isActive: true,
    });
  },
});

// Update a merchandise item (admin only)
export const update = mutation({
  args: {
    id: v.id("merchandise"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    available: v.optional(v.number()),
    category: v.optional(v.string()),
    variants: v.optional(v.array(
      v.object({
        name: v.string(),
        values: v.array(v.string())
      })
    )),
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

// Delete a merchandise item (admin only)
export const remove = mutation({
  args: { id: v.id("merchandise") },
  handler: async (ctx, args) => {
    // In a real app, you would check for admin permissions here
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});