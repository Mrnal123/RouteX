import { query } from "./_generated/server";

export const getOverviewDashboardData = query({
  handler: async (ctx) => {
    // 1. Get active routes count
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

    // 2. Get total fleet size
    const fleet = await ctx.db.query("vehicles").collect();

    // 3. Compute disruptions from the last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const disruptionsToday = await ctx.db
      .query("disruptions")
      .withIndex("by_created_at", (q) => q.gte("createdAt", oneDayAgo))
      .collect();

    // 4. Fetch recent orders
    const recentOrders = await ctx.db
      .query("orders")
      .order("desc")
      .take(5);

    // 5. Fetch recent decision logs
    const recentDecisionLogs = await ctx.db
      .query("decisionLogs")
      .order("desc")
      .take(5);

    // 6. Compute Average Delivery ETA (simplified for demo: average difference matching predictions)
    const recentEtas = await ctx.db
      .query("etaPredictions")
      .order("desc")
      .take(20);

    let avgDeliveryEta = 0;
    if (recentEtas.length > 0) {
      const totalEtaDiff = recentEtas.reduce((sum, prediction) => {
        // Find difference between prediction and current time
        const diffMs = Math.max(0, prediction.predictedEta - Date.now());
        return sum + diffMs;
      }, 0);
      
      // Convert to minutes
      avgDeliveryEta = Math.round((totalEtaDiff / recentEtas.length) / (1000 * 60));
    }

    return {
      activeRoutes: inProgressRoutes.length + plannedRoutes.length,
      fleetSize: fleet.length,
      avgDeliveryEta,
      disruptionsToday: disruptionsToday.length,
      recentOrders,
      recentDecisionLogs,
    };
  },
});
