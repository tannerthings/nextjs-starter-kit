// convex/attendees.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all attendees with filtering options
export const getAllAttendees = query({
  args: {
    eventId: v.optional(v.string()),
    ticketTypeId: v.optional(v.string()),
    isCheckedIn: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get ticket types first if filtering by event
    let relevantTicketTypeIds: Id<"ticketTypes">[] = [];
    
    if (args.eventId) {
      // Find all ticket types for this event
      const ticketTypes = await ctx.db
        .query("ticketTypes")
        .filter(q => q.eq(q.field("eventId"), args.eventId))
        .collect();
      
      relevantTicketTypeIds = ticketTypes.map(type => type._id);
    }
    
    // Get all attendees (either filtered by ticket type or all)
    let allAttendees: any[] = [];
    
    if (args.ticketTypeId) {
      // If a specific ticket type is requested, use that
      allAttendees = await ctx.db
        .query("attendees")
        .filter(q => q.eq(q.field("ticketTypeId"), args.ticketTypeId))
        .collect();
    } else if (args.eventId && relevantTicketTypeIds.length > 0) {
      // Get attendees for each ticket type separately
      for (const ticketTypeId of relevantTicketTypeIds) {
        const attendeesForType = await ctx.db
          .query("attendees")
          .filter(q => q.eq(q.field("ticketTypeId"), ticketTypeId))
          .collect();
        
        allAttendees = [...allAttendees, ...attendeesForType];
      }
    } else {
      // No event or ticket type filter, get all attendees
      allAttendees = await ctx.db.query("attendees").collect();
    }
    
    // Apply remaining filters manually in memory
    let filteredAttendees = [...allAttendees];
    
    // Filter by check-in status
    if (args.isCheckedIn !== undefined) {
      filteredAttendees = filteredAttendees.filter(a => a.isCheckedIn === args.isCheckedIn);
    }
    
    // Filter by search query (case insensitive)
    if (args.searchQuery && args.searchQuery.trim() !== "") {
      const searchTerm = args.searchQuery.toLowerCase().trim();
      filteredAttendees = filteredAttendees.filter(a => 
        (a.firstName || "").toLowerCase().includes(searchTerm) ||
        (a.lastName || "").toLowerCase().includes(searchTerm) ||
        (a.email || "").toLowerCase().includes(searchTerm)
      );
    }
    
    // Get total count before pagination
    const totalCount = filteredAttendees.length;
    
    // Sort by registration date (newest first)
    filteredAttendees.sort((a, b) => {
      return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
    });
    
    // Apply pagination
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;
    const paginatedAttendees = filteredAttendees.slice(skip, skip + limit);
    
    // Get ticket type information for display
    const attendeesWithTicketInfo = await Promise.all(
      paginatedAttendees.map(async (attendee) => {
        // Try to get ticket type information
        let ticketTypeLabel;
        try {
          const ticketType = await ctx.db.get(attendee.ticketTypeId);
          if (ticketType) {
            ticketTypeLabel = ticketType;
          }
        } catch (error) {
          console.error("Error fetching ticket type:", error);
        }
        
        return {
          ...attendee,
          ticketTypeLabel
        };
      })
    );
    
    return {
      attendees: attendeesWithTicketInfo,
      totalCount,
      page,
      limit
    };
  },
});


// Update an attendee's information
export const updateAttendee = mutation({
  args: {
    attendeeId: v.id("attendees"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    age: v.optional(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    specialRequirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const attendee = await ctx.db.get(args.attendeeId);
    
    if (!attendee) {
      throw new Error("Attendee not found");
    }
    
    // Update attendee information
    await ctx.db.patch(args.attendeeId, {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      age: args.age,
      dietaryRestrictions: args.dietaryRestrictions,
      specialRequirements: args.specialRequirements,
    });
    
    return { success: true };
  },
});

// Add a new attendee
export const addAttendee = mutation({
  args: {
    orderId: v.id("orders"),
    ticketTypeId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    age: v.optional(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    specialRequirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if the ticket type exists
    try {
      const ticketType = await ctx.db.get(args.ticketTypeId as Id<"ticketTypes">);
      
      if (!ticketType) {
        throw new Error("Ticket type not found");
      }
      
      // Check if there are still tickets available
      if (ticketType.available <= 0) {
        throw new Error("No tickets available for this ticket type");
      }
      
      // Update ticket type inventory
      await ctx.db.patch(args.ticketTypeId as Id<"ticketTypes">, {
        sold: ticketType.sold + 1,
        available: ticketType.available - 1,
      });
    } catch (error) {
      console.error("Error checking ticket type:", error);
      throw new Error("Invalid ticket type");
    }
    
    // Generate a unique ticket code
    const ticketCode = generateTicketCode();
    
    // Add the attendee
    const attendeeId = await ctx.db.insert("attendees", {
      orderId: args.orderId,
      ticketTypeId: args.ticketTypeId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      age: args.age,
      dietaryRestrictions: args.dietaryRestrictions,
      specialRequirements: args.specialRequirements,
      registrationDate: new Date().toISOString(),
      isCheckedIn: false,
    });
    
    return { attendeeId };
  },
});

// Send email to filtered attendees
export const sendEmailToAttendees = mutation({
  args: {
    eventId: v.string(),
    ticketTypeId: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // This would typically integrate with your email service
    // For now, we'll just simulate the email sending
    
    // Get ticket types for this event
    const ticketTypes = await ctx.db
      .query("ticketTypes")
      .filter(q => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    let ticketTypeIds = ticketTypes.map(type => type._id);
    
    // Filter by specific ticket type if provided
    if (args.ticketTypeId) {
      ticketTypeIds = ticketTypeIds.filter(id => id.toString() === args.ticketTypeId);
    }
    
    // Get attendees for these ticket types
    let allAttendees: any[] = [];
    
    // We need to query for each ticket type separately
    for (const ticketTypeId of ticketTypeIds) {
      const attendeesForType = await ctx.db
        .query("attendees")
        .filter(q => q.eq(q.field("ticketTypeId"), ticketTypeId))
        .collect();
      
      allAttendees = [...allAttendees, ...attendeesForType];
    }
    
    // In a real implementation, you would send emails to these attendees
    // For simulation, we'll just log the number of recipients
    console.log(`Sending email to ${allAttendees.length} attendees`);
    console.log(`Subject: ${args.subject}`);
    console.log(`Message: ${args.message}`);
    
    return { 
      sentCount: allAttendees.length,
      recipients: allAttendees.map(a => a.email)
    };
  },
});

// Helper function to generate a unique ticket code
function generateTicketCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 to avoid confusion
  let result = '';
  
  // Generate a 6-character code
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Add dashes for readability
  return result.slice(0, 3) + '-' + result.slice(3);
}

// Get attendees for a specific order
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

// Generate a check-in report
export const getCheckInStats = query({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all ticket types for this event
    const ticketTypes = await ctx.db
      .query("ticketTypes")
      .filter(q => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    const ticketTypeIds = ticketTypes.map(type => type._id);
    
    // Get all attendees for each ticket type
    let allAttendees: any[] = [];
    
    // Query attendees for each ticket type separately
    for (const ticketTypeId of ticketTypeIds) {
      const attendeesForType = await ctx.db
        .query("attendees")
        .filter(q => q.eq(q.field("ticketTypeId"), ticketTypeId))
        .collect();
      
      allAttendees = [...allAttendees, ...attendeesForType];
    }
    
    // Calculate check-in statistics
    const totalAttendees = allAttendees.length;
    const checkedInAttendees = allAttendees.filter(a => a.isCheckedIn).length;
    const checkedInPercentage = totalAttendees > 0 
      ? Math.round((checkedInAttendees / totalAttendees) * 100) 
      : 0;
    
    // Calculate stats per ticket type
    const statsByTicketType = ticketTypes.map(type => {
      const typeAttendees = allAttendees.filter(a => a.ticketTypeId === type._id);
      const typeCheckedIn = typeAttendees.filter(a => a.isCheckedIn).length;
      const typePercentage = typeAttendees.length > 0 
        ? Math.round((typeCheckedIn / typeAttendees.length) * 100)
        : 0;
      
      return {
        ticketTypeId: type._id,
        ticketTypeName: type.name,
        totalAttendees: typeAttendees.length,
        checkedIn: typeCheckedIn,
        percentage: typePercentage,
      };
    });
    
    return {
      totalAttendees,
      checkedInAttendees,
      checkedInPercentage,
      statsByTicketType,
    };
  },
});