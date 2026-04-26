import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const registerVehicle = mutation({
  args: {
    name: v.string(),
    driverName: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vehicles", {
      ...args,
      status: "idle",
    });
  },
});

export const updateVehicleLocation = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vehicleId, {
      currentLocation: {
        lat: args.lat,
        lng: args.lng,
        timestamp: Date.now(),
      },
    });
  },
});

export const listVehicles = query({
  handler: async (ctx) => {
    return await ctx.db.query("vehicles").collect();
  },
});
