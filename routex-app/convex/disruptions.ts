import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listRecentDisruptions = query({
  handler: async (ctx) => {
    // Collect the most recent disruptions, newest first
    return await ctx.db.query("disruptions").order("desc").take(50);
  },
});

export const createDisruption = mutation({
  args: {
    type: v.union(
      v.literal("blocked-road"),
      v.literal("traffic"),
      v.literal("urgent-order"),
      v.literal("vehicle-breakdown")
    ),
    description: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    affectedRouteIds: v.optional(v.array(v.id("routes"))),
  },
  handler: async (ctx, args) => {
    const disruptionId = await ctx.db.insert("disruptions", {
      ...args,
      status: "active",
      createdAt: Date.now(),
    });
    return disruptionId;
  },
});

export const resolveDisruption = mutation({
  args: {
    disruptionId: v.id("disruptions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.disruptionId, {
      status: "resolved",
    });
  },
});
