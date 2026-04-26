import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listActiveRoutes = query({
  handler: async (ctx) => {
    const [inProgressRoutes, plannedRoutes] = await Promise.all([
      ctx.db
        .query("routes")
        .withIndex("by_status", (q) => q.eq("status", "in-progress"))
        .collect(),
      ctx.db
        .query("routes")
        .withIndex("by_status", (q) => q.eq("status", "planned"))
        .collect(),
    ]);
    return [...inProgressRoutes, ...plannedRoutes];
  },
});

export const getRoute = query({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }
    return route;
  },
});

export const createRoute = mutation({
  args: {
    vehicleId: v.optional(v.id("vehicles")),
    stops: v.array(
      v.object({
        orderId: v.id("orders"),
        status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const routeId = await ctx.db.insert("routes", {
      vehicleId: args.vehicleId,
      status: "planned",
      stops: args.stops,
      currentStopIndex: 0,
      createdAt: Date.now(),
      // The schema is assumed to support these appended attributes transparently or via patch updates
    });
    return routeId;
  },
});

export const updateCurrentPosition = mutation({
  args: {
    routeId: v.id("routes"),
    currentNode: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Patching the route with a custom field assumed supported by schema updates.
    await ctx.db.patch(args.routeId, {
      currentNode: args.currentNode,
    } as unknown as Record<string, unknown>);
  },
});

export const updateAfterReroute = mutation({
  args: {
    routeId: v.id("routes"),
    stops: v.array(
      v.object({
        orderId: v.id("orders"),
        status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
      })
    ),
    pathNodes: v.array(
      v.object({ lat: v.number(), lng: v.number() })
    ),
    etaMinutes: v.number(),
    distanceKm: v.number(),
    algorithmUsed: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.routeId, {
      stops: args.stops,
      pathNodes: args.pathNodes,
      etaMinutes: args.etaMinutes,
      distanceKm: args.distanceKm,
      algorithmUsed: args.algorithmUsed,
      lastReplannedAt: Date.now(),
    } as unknown as Record<string, unknown>);
  },
});

export const markStopDelivered = mutation({
  args: {
    routeId: v.id("routes"),
    stopIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found");

    const stops = [...route.stops];
    if (stops[args.stopIndex]) {
      stops[args.stopIndex] = {
        ...stops[args.stopIndex],
        status: "completed",
      };
    }

    const nextStopIndex = args.stopIndex + 1;
    const isCompleted = nextStopIndex >= stops.length;

    await ctx.db.patch(args.routeId, {
      stops,
      currentStopIndex: nextStopIndex,
      status: isCompleted ? "completed" : route.status,
      endTime: isCompleted ? Date.now() : route.endTime,
    });
    
    // Also patch the physical order to match the delivered status
    const orderId = stops[args.stopIndex]?.orderId;
    if (orderId) {
      await ctx.db.patch(orderId, {
        status: "delivered",
        deliveryTime: Date.now(),
      } as unknown as Record<string, unknown>);
    }
  },
});
