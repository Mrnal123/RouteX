import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  },
});

export const listOrders = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("assigned"),
        v.literal("out-for-delivery"),
        v.literal("delivered"),
        v.literal("cancelled")
      )
    ),
    routeId: v.optional(v.id("routes")),
  },
  handler: async (ctx, args) => {
    if (args.routeId) {
      return await ctx.db.query("orders")
        .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
        .collect();
    }
    
    if (args.status) {
      const status = args.status;
      return await ctx.db.query("orders")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }

    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const createOrder = mutation({
  args: {
    customerName: v.string(),
    deliveryAddress: v.string(),
    lat: v.number(),
    lng: v.number(),
    timeWindowStart: v.optional(v.number()),
    timeWindowEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return orderId;
  },
});

export const createOrderAndAutoDispatch = mutation({
  args: {
    customerName: v.string(),
    deliveryAddress: v.string(),
    lat: v.number(),
    lng: v.number(),
    timeWindowStart: v.optional(v.number()),
    timeWindowEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });

    const activeRoute = await ctx.db
      .query("routes")
      .withIndex("by_status", (q) => q.eq("status", "in-progress"))
      .first();

    if (activeRoute) {
      const stopIndex = activeRoute.stops.length;
      const nextStops = [...activeRoute.stops, { orderId, status: "pending" as const }];

      await ctx.db.patch(activeRoute._id, {
        stops: nextStops,
      });

      await ctx.db.patch(orderId, {
        routeId: activeRoute._id,
        stopIndex,
        status: "assigned",
      });

      return { orderId, routeId: activeRoute._id, createdNewRoute: false };
    }

    const routeId = await ctx.db.insert("routes", {
      vehicleId: undefined,
      status: "in-progress",
      stops: [{ orderId, status: "pending" as const }],
      currentStopIndex: 0,
      startTime: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.patch(orderId, {
      routeId,
      stopIndex: 0,
      status: "assigned",
    });

    return { orderId, routeId, createdNewRoute: true };
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("out-for-delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const updateData: Record<string, unknown> = { status: args.status };

    // Automatically timestamp the delivery when successful
    if (args.status === "delivered") {
      updateData.deliveryTime = Date.now();
    }

    await ctx.db.patch(args.orderId, updateData);
  },
});

export const assignOrderToRoute = mutation({
  args: {
    orderId: v.id("orders"),
    routeId: v.id("routes"),
    stopIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      routeId: args.routeId,
      stopIndex: args.stopIndex,
      status: "assigned", // Automatically move status upon assignment
    });
  },
});
