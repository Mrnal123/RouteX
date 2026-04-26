import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Very rough approximation of unit distance
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
}

// Convert rough distance to seconds (assuming an arbitrary speed factor)
function estimateTravelTimeSeconds(distance: number) {
  const SPEED_FACTOR = 1000; 
  return Math.floor(distance * SPEED_FACTOR);
}

export const getRouteForEta = internalQuery({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found");

    const pendingStops = [];
    for (const stop of route.stops) {
      if (stop.status === "pending") {
        const order = await ctx.db.get(stop.orderId);
        if (order) pendingStops.push(order);
      }
    }
    
    // Get vehicle location to start ETA from
    let startLocation = null;
    if (route.vehicleId) {
      const vehicle = await ctx.db.get(route.vehicleId);
      startLocation = vehicle?.currentLocation;
    }

    return { routeId: route._id, pendingStops, startLocation };
  },
});

export const saveEtaPrediction = internalMutation({
  args: {
    routeId: v.id("routes"),
    orderId: v.id("orders"),
    predictedEta: v.number(),
    confidenceScore: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("etaPredictions", {
      routeId: args.routeId,
      orderId: args.orderId,
      predictedEta: args.predictedEta,
      confidenceScore: args.confidenceScore,
      calculationTimestamp: Date.now(),
    });
  },
});

export const predictETA = action({
  args: {
    routeId: v.id("routes"),
  },
  handler: async (ctx, args): Promise<Array<{ orderId: string; predictedEta: number }>> => {
    const routeData = await ctx.runQuery(
      internal.etaPredict.getRouteForEta,
      { routeId: args.routeId }
    );

    const routeId = routeData.routeId;
    const pendingStops: Array<{ _id: any; lat: number; lng: number }> = routeData.pendingStops;
    const startLocation: { lat: number; lng: number } | null | undefined = routeData.startLocation;

    if (pendingStops.length === 0) return [];

    let currentLat: number = startLocation?.lat || pendingStops[0].lat;
    let currentLng: number = startLocation?.lng || pendingStops[0].lng;
    let currentTime: number = Date.now();
    const predictions: Array<{ orderId: string; predictedEta: number }> = [];

    for (const stop of pendingStops) {
      const distance = calculateDistance(currentLat, currentLng, stop.lat, stop.lng);
      const travelTimeMs = estimateTravelTimeSeconds(distance) * 1000;
      
      const predictedEta = currentTime + travelTimeMs;
      
      // Assume high confidence unless traffic disruptions exist (to be expanded)
      const confidenceScore = 0.85;

      await ctx.runMutation(internal.etaPredict.saveEtaPrediction, {
        routeId,
        orderId: stop._id,
        predictedEta,
        confidenceScore,
      });

      predictions.push({
        orderId: stop._id,
        predictedEta,
      });

      currentLat = stop.lat;
      currentLng = stop.lng;
      currentTime = predictedEta;
    }

    return predictions;
  },
});

