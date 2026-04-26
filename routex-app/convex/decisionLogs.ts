import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const listDecisionLogs = query({
  handler: async (ctx) => {
    // Order by newest first
    return await ctx.db.query("decisionLogs").order("desc").take(10);
  },
});

export const createDecisionLog = mutation({
  args: {
    routeId: v.id("routes"),
    triggerType: v.string(),
    disruptionId: v.optional(v.id("disruptions")),
    previousPath: v.array(v.id("orders")),
    newPath: v.array(v.id("orders")),
    reasoning: v.string(),
    computationTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("decisionLogs", {
      ...args,
      timestamp: Date.now(),
      createdAt: Date.now(),
    });
    return logId;
  },
});

// Internal mutation used by reroutePredict action
export const addLogEntry = internalMutation({
  args: {
    routeId: v.id("routes"),
    triggerType: v.string(),
    disruptionId: v.optional(v.id("disruptions")),
    previousPath: v.array(v.id("orders")),
    newPath: v.array(v.id("orders")),
    reasoning: v.string(),
    computationTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("decisionLogs", {
      ...args,
      timestamp: Date.now(),
      createdAt: Date.now(),
    });
    return logId;
  },
});
