import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { RoutingGraph, GraphNode } from "./graph";
import { runAStar } from "./astar";
import { euclideanDistance } from "./heuristics";
import { Id } from "../_generated/dataModel";

// Fetch pending stops and context
export const getReplanContext = internalQuery({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) throw new Error("Route not found");

    const previousPath = route.stops.map(s => s.orderId);
    const pendingOrderIds = route.stops.filter((s) => s.status === "pending").map((s) => s.orderId);
    
    // Fetch order coordinates
    const nodes: (GraphNode & { timeWindowEnd?: number; createdAt: number })[] = [];
    for (const orderId of pendingOrderIds) {
      const order = await ctx.db.get(orderId);
      if (order) {
        nodes.push({ id: order._id, lat: order.lat, lng: order.lng, timeWindowEnd: order.timeWindowEnd, createdAt: order.createdAt });
      }
    }

    let currentLocation = { id: "START", lat: nodes[0]?.lat || 0, lng: nodes[0]?.lng || 0 };
    if (route.vehicleId) {
       const vehicle = await ctx.db.get(route.vehicleId);
       if (vehicle?.currentLocation) {
         currentLocation = { id: "START", lat: vehicle.currentLocation.lat, lng: vehicle.currentLocation.lng };
       }
    }

    const goalNode = [...nodes].sort((a, b) => {
      const aTw = a.timeWindowEnd ?? Number.POSITIVE_INFINITY;
      const bTw = b.timeWindowEnd ?? Number.POSITIVE_INFINITY;
      if (aTw !== bTw) return aTw - bTw; // earliest deadline first
      return a.createdAt - b.createdAt; // oldest first
    })[0];

    return { route, previousPath, nodes, currentLocation, goalNodeId: goalNode?.id ?? null, pendingOrderIds };
  },
});

// Update the route state
export const commitReplan = internalMutation({
  args: {
    routeId: v.id("routes"),
    newStops: v.array(v.object({
      orderId: v.id("orders"),
      status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    })),
    pathNodes: v.array(v.object({ lat: v.number(), lng: v.number() })),
    etaMinutes: v.number(),
    distanceKm: v.number(),
    algorithmUsed: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.routeId, {
      stops: args.newStops,
      pathNodes: args.pathNodes,
      etaMinutes: args.etaMinutes,
      distanceKm: args.distanceKm,
      algorithmUsed: args.algorithmUsed,
      lastReplannedAt: Date.now(),
    } as unknown as Record<string, unknown>);
  },
});

// Main orchestration action
export const replanRoute = action({
  args: {
    routeId: v.id("routes"),
    disruptionType: v.string(),
    blockedEdge: v.optional(v.object({ from: v.string(), to: v.string() })),
    urgentOrderNode: v.optional(v.object({ id: v.string(), lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    const { route, previousPath, nodes, currentLocation, goalNodeId, pendingOrderIds } = await ctx.runQuery(
      internal.routing.replan.getReplanContext,
      { routeId: args.routeId }
    );

    if (nodes.length === 0) {
      return { success: false, reason: "No pending nodes" };
    }

    // 1. Build State
    const graph = new RoutingGraph();
    graph.addNode(currentLocation);
    
    // Optional urgent node
    if (args.urgentOrderNode) {
      graph.addNode(args.urgentOrderNode);
      nodes.push({ ...args.urgentOrderNode, createdAt: Date.now() });
    }
    
    for (const node of nodes) {
      graph.addNode(node);
    }

    // 2. Connect Graph Edges (Fully connected sequence for simplistic TSP approximation)
    const allNodes = [currentLocation, ...nodes];
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = 0; j < allNodes.length; j++) {
         if (i === j) continue;
         const n1 = allNodes[i];
         const n2 = allNodes[j];
         const dist = euclideanDistance(n1.lat, n1.lng, n2.lat, n2.lng);
         
         // Mark explicitly blocked edges
         const isBlocked = args.blockedEdge && 
            ((args.blockedEdge.from === n1.id && args.blockedEdge.to === n2.id) ||
             (args.blockedEdge.from === n2.id && args.blockedEdge.to === n1.id));

         graph.addEdge(n1.id, n2.id, dist, isBlocked);
       }
    }

    const goalNode = goalNodeId ? nodes.find((n) => n.id === goalNodeId) : nodes[0];
    if (!goalNode) {
      return { success: false, reason: "No goal node available" };
    }

    // 3. Compute A* Path
    const result = runAStar(
      graph,
      currentLocation.id,
      goalNode.id,
      (a, b) => euclideanDistance(a.lat, a.lng, b.lat, b.lng)
    );

    if (result.path.length === 0) {
      return { success: false, reason: "Path unreachable" };
    }

    // Filter out "START" helper node from results
    const pendingSet = new Set<string>(pendingOrderIds as unknown as string[]);
    const newOrderIds = result.path
      .filter((id) => id !== "START" && pendingSet.has(id)) as Id<"orders">[];

    // 4. Transform to new Stops Schema
    const completedStops = route.stops.filter((s) => s.status !== "pending");
    const pendingStops = newOrderIds.map((id) => ({ orderId: id, status: "pending" as const }));
    const newStops = [...completedStops, ...pendingStops];
    
    // Map structural visualization nodes
    const pathNodes = result.path.map(id => {
       const mapped = graph.nodes.get(id);
       return { lat: mapped?.lat || 0, lng: mapped?.lng || 0 };
    });

    const computationTimeMs = Date.now() - startTime;

    const winningPathLog = result.winningPathCosts
      .map((p) => `- ${p.nodeId}: g=${p.g.toFixed(4)}, h=${p.h.toFixed(4)}, f=${p.f.toFixed(4)}`)
      .join("\n");

    // 5. Commit state inside database
    await ctx.runMutation(internal.routing.replan.commitReplan, {
      routeId: args.routeId,
      newStops,
      pathNodes,
      etaMinutes: Math.round(result.totalCost * 10), // Rough scaling 
      distanceKm: result.totalCost,
      algorithmUsed: "astar-euclidean"
    });

    // 6. Push explicit action to audit trail
    await ctx.runMutation(internal.decisionLogs.addLogEntry, {
      routeId: args.routeId,
      triggerType: args.disruptionType,
      previousPath: previousPath,
      newPath: newOrderIds,
      reasoning: `A* point-to-point replanned due to: ${args.disruptionType}. Visited ${result.visitedCount} graph nodes.\nGoalNode=${goalNode.id}\nWinningPathCosts:\n${winningPathLog}`,
      computationTimeMs
    });

    return {
      success: true,
      newPath: newOrderIds,
      totalCost: result.totalCost,
      computationTimeMs
    };
  },
});
