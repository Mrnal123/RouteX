import { v } from "convex/values";
import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const savePrediction = internalMutation({
  args: {
    routeId: v.id("routes"),
    orderId: v.id("orders"),
    predictedEta: v.number(),
    confidenceScore: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("etaPredictions", {
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
    orderId: v.id("orders"),
    distanceKm: v.number(),
    trafficLevel: v.union(v.literal("light"), v.literal("moderate"), v.literal("heavy")),
    remainingStops: v.number(),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  },
  handler: async (ctx, args) => {
    // Basic rules-engine variables
    const BASE_SPEED_KM_PER_MIN = 0.5; // Roughly 30km/hr city driving baseline
    const STOP_PENALTY_MINUTES = 3.5;  // Base parking + walking per drop-off
    
    // 1. Calculate unadjusted transit time
    let predictedEtaMinutes = args.distanceKm / BASE_SPEED_KM_PER_MIN;

    // 2. Adjust for the buffer of navigating prior stops
    predictedEtaMinutes += args.remainingStops * STOP_PENALTY_MINUTES;

    // 3. Adjust for live traffic conditions
    let trafficMultiplier = 1.0;
    let confidenceDegradation = 0;

    switch (args.trafficLevel) {
      case "light":
        trafficMultiplier = 1.0;
        confidenceDegradation = 0.05;
        break;
      case "moderate":
        trafficMultiplier = 1.4;
        confidenceDegradation = 0.15;
        break;
      case "heavy":
        trafficMultiplier = 2.2;
        confidenceDegradation = 0.35;
        break;
    }

    predictedEtaMinutes = predictedEtaMinutes * trafficMultiplier;

    // 4. Calculate statistical confidence bounds
    const baseConfidence = 0.98;
    // Prediction degrades naturally by 5% every 10km ahead it looks
    const distancePenalty = Math.min(args.distanceKm * 0.005, 0.2); 
    
    let confidenceScore = baseConfidence - confidenceDegradation - distancePenalty;

    // SLA Guarantee tuning
    if (args.priority === "high") {
       // High priority dispatches require fewer unpredictable multi-stop variants
       confidenceScore = Math.max(confidenceScore, 0.85); 
    } else {
       confidenceScore = Math.max(confidenceScore, 0.3); // Absolute failure floor
    }

    // 5. Transform estimated output into actual unix delivery clock boundaries
    const predictedTimestamp = Date.now() + (Math.round(predictedEtaMinutes) * 60 * 1000);

    // Save to database
    await ctx.runMutation(internal.ai.eta.savePrediction, {
      routeId: args.routeId,
      orderId: args.orderId,
      predictedEta: predictedTimestamp,
      confidenceScore: Number(confidenceScore.toFixed(3)),
    });

    return {
      predictedEtaMinutes: Math.round(predictedEtaMinutes),
      predictedTimestamp,
      confidenceScore: Number(confidenceScore.toFixed(3)),
    };
  },
});
