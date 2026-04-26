import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper to calculate Euclidean distance (in generic units, roughly acting as lat/lng distance proxy)
function heuristic(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));
}

// Simple priority queue for True A* state expansion
class PriorityQueue<T> {
  private elements: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.elements.shift()?.item;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}

export const getRouteData = internalQuery({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found");

    const vehicle = route.vehicleId ? await ctx.db.get(route.vehicleId) : null;
    const currentLocation = vehicle?.currentLocation;

    const pendingStops = [];
    const previousPath: Id<"orders">[] = [];
    
    for (const stop of route.stops) {
      if (stop.status === "pending") {
        const order = await ctx.db.get(stop.orderId);
        if (order) {
            pendingStops.push(order);
        }
      }
      previousPath.push(stop.orderId);
    }

    return { route, currentLocation, pendingStops, previousPath };
  },
});

export const updateRouteFromReroute = internalMutation({
  args: {
    routeId: v.id("routes"),
    newStops: v.array(v.object({
        orderId: v.id("orders"),
        scheduledArrivalTime: v.optional(v.number()),
        actualArrivalTime: v.optional(v.number()),
        status: v.union(
            v.literal("pending"),
            v.literal("completed"),
            v.literal("failed")
        ),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.routeId, {
      stops: args.newStops,
    });
  },
});

export const triggerReroute = action({
  args: {
    routeId: v.id("routes"),
    disruptionId: v.optional(v.id("disruptions")),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    const { route, currentLocation, pendingStops, previousPath } = await ctx.runQuery(
      internal.reroutePredict.getRouteData,
      { routeId: args.routeId }
    );

    if (pendingStops.length === 0) {
      return { success: false, message: "No pending stops to reroute" };
    }

    const currentPoint = currentLocation || { lat: pendingStops[0].lat, lng: pendingStops[0].lng };

    // Route sequencing heuristic (multi-stop ordering). Not point-to-point A*.
    // State representation for the priority queue
    interface SearchState {
      currentLoc: { lat: number; lng: number };
      unvisited: typeof pendingStops;
      path: Id<"orders">[];
      gCost: number; // Cost from start to current node
    }

    const pq = new PriorityQueue<SearchState>();
    
    pq.enqueue({
      currentLoc: currentPoint,
      unvisited: pendingStops,
      path: [],
      gCost: 0
    }, 0);

    let optimalPath: Id<"orders">[] = [];
    
    // Safety break to prevent infinite loops on large sets
    let iterations = 0;
    const MAX_ITERATIONS = 5000;

    while (!pq.isEmpty()) {
      iterations++;
      if (iterations > MAX_ITERATIONS) {
        // Fallback strategy if state space blows up (just in case of >10 stops)
        break;
      }

      const state = pq.dequeue()!;

      // If we've visited all nodes, this is the optimal complete path
      if (state.unvisited.length === 0) {
        optimalPath = state.path;
        break;
      }

      // Expand to all possible next unvisited nodes
      for (let i = 0; i < state.unvisited.length; i++) {
        const nextNode = state.unvisited[i];
        
        // Compute g(n): known cost from start to next node
        const stepCost = heuristic(state.currentLoc, nextNode);
        const newGCost = state.gCost + stepCost;

        // Compute h(n): heuristic estimating cost from next node to the end
        // A simple admissible heuristic for TSP is the distance to the furthest unvisited node, 
        // or a Minimum Spanning Tree estimation. For speed, we use nearest unvisited distance
        // or just 0 (which makes it Uniform Cost Search, still finding the optimal path).
        let hCost = 0;
        const remainingAfterNext = state.unvisited.filter((_, idx) => idx !== i);
        if (remainingAfterNext.length > 0) {
            // A simple admissible h(x): distance from nextNode to the closest remaining node
            let minEdge = Infinity;
            for (const r of remainingAfterNext) {
                const d = heuristic(nextNode, r);
                if (d < minEdge) minEdge = d;
            }
            hCost = minEdge;
        }

        const fCost = newGCost + hCost;

        pq.enqueue({
          currentLoc: { lat: nextNode.lat, lng: nextNode.lng },
          unvisited: remainingAfterNext,
          path: [...state.path, nextNode._id],
          gCost: newGCost
        }, fCost);
      }
    }

    // If iterations max out, fallback to greedy nearest-neighbor sequencing
    if (optimalPath.length === 0) {
      let curr = currentPoint;
      const left = [...pendingStops];
      while (left.length > 0) {
        left.sort((a, b) => heuristic(curr, a) - heuristic(curr, b));
        const next = left.shift()!;
        optimalPath.push(next._id);
        curr = { lat: next.lat, lng: next.lng };
      }
    }

    // Update route stops in Convex
    interface RouteStop {
      orderId: Id<"orders">;
      status: "pending" | "completed" | "failed";
    }
    const completedStops = (route.stops as RouteStop[]).filter((s: RouteStop) => s.status !== "pending");
    const updatedPendingStops = optimalPath.map((orderId) => ({
      orderId,
      status: "pending" as const,
    }));

    const newStops = [...completedStops, ...updatedPendingStops];

    await ctx.runMutation(internal.reroutePredict.updateRouteFromReroute, {
      routeId: args.routeId,
      newStops,
    });

    const computationTimeMs = Date.now() - startTime;

    // Log the decision
    await ctx.runMutation(internal.decisionLogs.addLogEntry, {
      routeId: args.routeId,
      triggerType: args.disruptionId ? "disruption" : "manual-optimization",
      disruptionId: args.disruptionId,
      previousPath,
      newPath: newStops.map((s) => s.orderId),
      reasoning: `Route sequencing heuristic (multi-stop ordering). Falls back to greedy nearest-neighbor when state space is large. Computed in ${computationTimeMs}ms.`,
      computationTimeMs,
    });

    return {
      success: true,
      newPath: optimalPath,
      computationTimeMs,
    };
  },
});
