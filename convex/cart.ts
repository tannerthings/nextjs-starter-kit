// convex/cart.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Helper function to generate a unique session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Create a new cart or return existing cart for the session
export const getOrCreateCart = mutation({
  args: {
    sessionId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let sessionId = args.sessionId;
    
    // If no session ID provided, generate a new one
    if (!sessionId) {
      sessionId = generateSessionId();
    }
    
    // Try to find an existing active cart for this session
    let cart;
    
    if (args.userId) {
      // If user is logged in, find their cart
      cart = await ctx.db
        .query("carts")
        .filter(q => 
          q.eq(q.field("userId"), args.userId) && 
          q.eq(q.field("status"), "active")
        )
        .first();
    } else {
      // Otherwise, find cart by session ID
      cart = await ctx.db
        .query("carts")
        .filter(q => 
          q.eq(q.field("sessionId"), sessionId) && 
          q.eq(q.field("status"), "active")
        )
        .first();
    }
    
    // If cart exists, return it
    if (cart) {
      return { sessionId, cartId: cart._id };
    }
    
    // Otherwise, create a new cart
    const cartId = await ctx.db.insert("carts", {
      userId: args.userId,
      sessionId,
      items: [],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      subtotal: 0,
      total: 0,
    });
    
    return { sessionId, cartId };
  },
});

// Get cart contents
export const getCart = query({
  args: {
    cartId: v.id("carts"),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    return cart;
  },
});

// Add an item to the cart
export const addItemToCart = mutation({
  args: {
    cartId: v.id("carts"),
    itemId: v.string(),
    itemType: v.string(), // 'ticket' or 'merchandise'
    quantity: v.number(),
    variantSelections: v.optional(v.array(
      v.object({
        name: v.string(),
        value: v.string()
      })
    )),
  },
  handler: async (ctx, args) => {
    // Get the current cart
    const cart = await ctx.db.get(args.cartId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    if (cart.expiresAt && new Date(cart.expiresAt) < new Date()) {
      // Reset expiration time instead of throwing an error
      await ctx.db.patch(args.cartId, {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // Continue with the function after extending the expiration
    }

    // Get the item details based on type
    let item;
    if (args.itemType === 'ticket') {
      item = await ctx.db
        .query("ticketTypes")
        .filter(q => q.eq(q.field("_id"), args.itemId))
        .first();
    } else if (args.itemType === 'merchandise') {
      item = await ctx.db
        .query("merchandise")
        .filter(q => q.eq(q.field("_id"), args.itemId))
        .first();
    } else {
      throw new Error("Invalid item type");
    }
    
    if (!item) {
      throw new Error("Item not found");
    }
    
    // Check if item is available
    if (!item.isActive) {
      throw new Error("This item is not available");
    }
    
    if (item.available < args.quantity) {
      throw new Error("Not enough items available");
    }
    
    // Generate a unique cart item identifier
    // For tickets, this is just the ID
    // For merchandise with variants, we need to include the variant selections
    let cartItemId = `${args.itemType}_${args.itemId}`;
    if (args.itemType === 'merchandise' && args.variantSelections && args.variantSelections.length > 0) {
      const variantString = args.variantSelections
        .map(v => `${v.name}:${v.value}`)
        .join('_');
      cartItemId = `${cartItemId}_${variantString}`;
    }
    
    // Check if the item already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => {
      if (args.itemType === 'ticket') {
        return item.itemId === args.itemId && item.itemType === args.itemType;
      } else {
        // For merchandise, also compare variant selections
        const variantsMatch = !args.variantSelections || 
          JSON.stringify(item.variantSelections) === JSON.stringify(args.variantSelections);
        
        return item.itemId === args.itemId && 
               item.itemType === args.itemType && 
               variantsMatch;
      }
    });
    
    let updatedItems;
    
    if (existingItemIndex >= 0) {
      // Update the quantity of the existing item
      updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + args.quantity,
      };
    } else {
      // Add the new item to the cart
      updatedItems = [
        ...cart.items,
        {
          itemId: args.itemId,
          itemType: args.itemType,
          quantity: args.quantity,
          price: item.price,
          name: item.name,
          description: item.description,
          variantSelections: args.variantSelections || undefined,
        },
      ];
    }
    
    // Calculate the new totals
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Update the cart
    await ctx.db.patch(args.cartId, {
      items: updatedItems,
      subtotal,
      total: subtotal, // For now, total = subtotal (no taxes or fees)
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Update item quantity in cart
export const updateItemQuantity = mutation({
  args: {
    cartId: v.id("carts"),
    itemIndex: v.number(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    // Check if the item index is valid
    if (args.itemIndex < 0 || args.itemIndex >= cart.items.length) {
      throw new Error("Invalid item index");
    }
    
    let updatedItems;
    
    if (args.quantity <= 0) {
      // Remove the item if quantity is 0 or negative
      updatedItems = [
        ...cart.items.slice(0, args.itemIndex),
        ...cart.items.slice(args.itemIndex + 1)
      ];
    } else {
      // Update the quantity
      updatedItems = [...cart.items];
      updatedItems[args.itemIndex] = {
        ...updatedItems[args.itemIndex],
        quantity: args.quantity,
      };
    }
    
    // Calculate the new totals
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Update the cart
    await ctx.db.patch(args.cartId, {
      items: updatedItems,
      subtotal,
      total: subtotal,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Remove an item from the cart
export const removeItemFromCart = mutation({
  args: {
    cartId: v.id("carts"),
    itemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    // Check if the item index is valid
    if (args.itemIndex < 0 || args.itemIndex >= cart.items.length) {
      throw new Error("Invalid item index");
    }
    
    // Remove the item from the cart
    const updatedItems = [
      ...cart.items.slice(0, args.itemIndex),
      ...cart.items.slice(args.itemIndex + 1)
    ];
    
    // Calculate the new totals
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Update the cart
    await ctx.db.patch(args.cartId, {
      items: updatedItems,
      subtotal,
      total: subtotal,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Clear the cart (remove all items)
export const clearCart = mutation({
  args: {
    cartId: v.id("carts"),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    // Update the cart with empty items
    await ctx.db.patch(args.cartId, {
      items: [],
      subtotal: 0,
      total: 0,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Convert cart to order (checkout process)
export const checkout = mutation({
  args: {
    cartId: v.id("carts"),
    customerEmail: v.string(),
    customerPhone: v.string(),
    paymentMethod: v.string(),
    paymentEmail: v.optional(v.string()),
    paymentPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    if (cart.items.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }
    
    // Create a new order
    const orderId = await ctx.db.insert("orders", {
      userId: cart.userId,
      sessionId: cart.sessionId,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      items: cart.items,
      subtotal: cart.subtotal,
      taxes: cart.taxes,
      fees: cart.fees,
      total: cart.total,
      paymentMethod: args.paymentMethod,
      paymentEmail: args.paymentEmail,
      paymentPhone: args.paymentPhone,
      paymentStatus: "pending",
      status: "pending",
      cartId: args.cartId,
      createdAt: new Date().toISOString(),
    });
    
    // Mark the cart as converted
    await ctx.db.patch(args.cartId, {
      status: "converted",
      updatedAt: new Date().toISOString(),
    });
    
    return { orderId };
  },
});

// Get order details
export const getOrder = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    return order;
  },
});

// Add attendee details for an order
export const addAttendee = mutation({
  args: {
    orderId: v.id("orders"),
    ticketTypeId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    specialRequirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if the order exists
    const order = await ctx.db.get(args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Add the attendee
    const attendeeId = await ctx.db.insert("attendees", {
      orderId: args.orderId,
      ticketTypeId: args.ticketTypeId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      dietaryRestrictions: args.dietaryRestrictions,
      specialRequirements: args.specialRequirements,
      registrationDate: new Date().toISOString(),
      isCheckedIn: false,
    });
    
    return { attendeeId };
  },
});

// Get all attendees for an order
export const getOrderAttendees = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const attendees = await ctx.db
      .query("attendees")
      .filter(q => q.eq(q.field("orderId"), args.orderId))
      .collect();
    
    return attendees;
  },
});


// Complete an order with payment confirmation
export const completeOrder = mutation({
  args: {
    orderId: v.id("orders"),
    paymentConfirmation: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Update the order status
    await ctx.db.patch(args.orderId, {
      paymentConfirmation: args.paymentConfirmation,
      paymentStatus: "completed",
      status: "completed",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // Update inventory for all items
    for (const item of order.items) {
      if (item.itemType === 'ticket') {
        // Update ticket availability
        const ticketType = await ctx.db
          .query("ticketTypes")
          .filter(q => q.eq(q.field("_id"), item.itemId))
          .first();
        
        if (ticketType) {
          await ctx.db.patch(ticketType._id, {
            sold: ticketType.sold + item.quantity,
            available: ticketType.available - item.quantity,
          });
        }
      } else if (item.itemType === 'merchandise') {
        // Update merchandise availability
        const merchItem = await ctx.db
          .query("merchandise")
          .filter(q => q.eq(q.field("_id"), item.itemId))
          .first();
        
        if (merchItem) {
          await ctx.db.patch(merchItem._id, {
            sold: merchItem.sold + item.quantity,
            available: merchItem.available - item.quantity,
          });
        }
      }
    }
    
    // Get updated order with completion details
    const updatedOrder = await ctx.db.get(args.orderId);
    
    // Get all attendees for this order for the email
    const attendees = await ctx.db
      .query("attendees")
      .filter(q => q.eq(q.field("orderId"), args.orderId))
      .collect();
    
    // Schedule the email sending through the scheduler
    //await ctx.scheduler.runAfter(0, internal.emails.sendOrderConfirmationEmail, {
    //  orderId: args.orderId,
    //  order: updatedOrder,
    //  attendees: attendees
    //});
    
    return { success: true };
  },
});




