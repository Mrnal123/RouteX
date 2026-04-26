import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  orders: defineTable({
    customerName: v.string(),
    deliveryAddress: v.string(),
    lat: v.number(),
    lng: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("out-for-delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    routeId: v.optional(v.id("routes")),
    stopIndex: v.optional(v.number()),
    timeWindowStart: v.optional(v.number()), // Unix timestamp
    timeWindowEnd: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_route", ["routeId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  routes: defineTable({
    vehicleId: v.optional(v.id("vehicles")),
    status: v.union(
      v.literal("planned"),
      v.literal("in-progress"),
      v.literal("completed")
    ),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    currentNode: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    stops: v.array(
      v.object({
        orderId: v.id("orders"),
        status: v.union(
          v.literal("pending"),
          v.literal("completed"),
          v.literal("failed")
        ),
      })
    ),
    currentStopIndex: v.number(),
    createdAt: v.number(),
    pathNodes: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))),
    etaMinutes: v.optional(v.number()),
    distanceKm: v.optional(v.number()),
    algorithmUsed: v.optional(v.string()),
    lastReplannedAt: v.optional(v.number()),
  })
    .index("by_vehicle", ["vehicleId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  vehicles: defineTable({
    name: v.string(),
    driverName: v.string(),
    capacity: v.number(),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("maintenance")
    ),
    currentLocation: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
        timestamp: v.number(),
      })
    ),
  }),

  disruptions: defineTable({
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
    status: v.union(v.literal("active"), v.literal("resolved")),
    createdAt: v.number(),
    affectedRouteIds: v.optional(v.array(v.id("routes"))),
  })
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  decisionLogs: defineTable({
    routeId: v.id("routes"),
    timestamp: v.number(),
    triggerType: v.string(),
    disruptionId: v.optional(v.id("disruptions")),
    previousPath: v.array(v.id("orders")),
    newPath: v.array(v.id("orders")),
    reasoning: v.string(),
    computationTimeMs: v.number(),
    createdAt: v.number(),
  })
    .index("by_route", ["routeId"])
    .index("by_created_at", ["createdAt"]),

  etaPredictions: defineTable({
    routeId: v.id("routes"),
    orderId: v.id("orders"),
    predictedEta: v.number(),
    confidenceScore: v.number(), // 0 to 1
    calculationTimestamp: v.number(),
  })
    .index("by_route", ["routeId"])
    .index("by_order", ["orderId"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),
});
