'use client'
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AntigravityCard } from '@/components/ui/AntigravityGlass';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { 
  Zap, 
  Waves,
  Cpu,
} from 'lucide-react';

export default function AnalyticsPage() {
  const dashboardData = useQuery(api.dashboard.getOverviewDashboardData);
  const orders = useQuery(api.orders.listOrders, {});
  const routes = useQuery(api.routes.listActiveRoutes);
  const disruptions = useQuery(api.disruptions.listRecentDisruptions);
  const decisionLogs = useQuery(api.decisionLogs.listDecisionLogs);

  const totalOrders = orders?.length ?? 0;
  const assignedOrders = orders?.filter((o) => o.status === 'assigned' || o.status === 'out-for-delivery').length ?? 0;
  const deliveredOrders = orders?.filter((o) => o.status === 'delivered').length ?? 0;
  const activeRoutes = routes?.length ?? 0;
  const activeDisruptions = disruptions?.filter((d) => d.status === 'active').length ?? 0;
  const avgEtaMinutes = dashboardData?.avgDeliveryEta ?? 0;

  const throughputCapacity = totalOrders > 0 ? Math.round((assignedOrders / totalOrders) * 100) : 0;
  const riskMitigationRate = disruptions && disruptions.length > 0
    ? Math.max(0, Math.round(((disruptions.length - activeDisruptions) / disruptions.length) * 100))
    : 100;
  const fuelDelta = `${Math.max(0, activeRoutes * 12)}k`;

  const flowSeries = useMemo(() => {
    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const anchorTime = orders?.[0]?.createdAt ?? 0;
    const dayMs = 24 * 60 * 60 * 1000;
    const data = dayLabels.map((day, idx) => {
      const dayStart = anchorTime - (6 - idx) * dayMs;
      const dayEnd = dayStart + dayMs;
      const count = (orders ?? []).filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd).length;
      return { day, actual: count };
    });
    const peak = Math.max(1, ...data.map((d) => d.actual));
    return data.map((d) => {
      const actual = Math.round((d.actual / peak) * 100);
      const planned = Math.min(100, actual + 12);
      return { ...d, actual: Math.max(actual, 6), planned: Math.max(planned, 10) };
    });
  }, [orders]);

  const saturation = useMemo(() => {
    const pending = orders?.filter((o) => o.status === 'pending').length ?? 0;
    const assigned = orders?.filter((o) => o.status === 'assigned' || o.status === 'out-for-delivery').length ?? 0;
    const delivered = orders?.filter((o) => o.status === 'delivered').length ?? 0;
    const total = Math.max(1, totalOrders);
    return {
      urban: Math.round((assigned / total) * 100),
      heavy: Math.round((pending / total) * 100),
      lastMile: Math.round((delivered / total) * 100),
    };
  }, [orders, totalOrders]);

  const regionalRows = useMemo(() => {
    const labels = ['Primary Route Cluster', 'Secondary Route Cluster', 'Pending Queue', 'Recovery Queue'];
    const values = [
      assignedOrders,
      activeRoutes,
      orders?.filter((o) => o.status === 'pending').length ?? 0,
      activeDisruptions,
    ];
    const max = Math.max(1, ...values);
    return labels.map((label, i) => ({
      country: label,
      count: values[i],
      percent: Math.round((values[i] / max) * 100),
    }));
  }, [assignedOrders, activeRoutes, orders, activeDisruptions]);

  const avgComputationMs = decisionLogs && decisionLogs.length > 0
    ? Math.round(decisionLogs.reduce((sum, l) => sum + l.computationTimeMs, 0) / decisionLogs.length)
    : 0;
  const anomalyProbability = Math.max(1, Math.min(99, activeDisruptions * 8));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black font-headline tracking-tighter text-white">ANALYTICS ENGINE</h1>
          <p className="text-white/40 text-lg font-body mt-3 max-w-2xl leading-relaxed">
            Deep-dive into algorithm efficiency, global throughput delta, and real-time topographical execution metrics.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#1c2024] px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
           <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_#99f7ff]" />
           <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Live Heuristic Feed</span>
        </div>
      </div>

      {/* Top Row: Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <SummaryCard title="Throughput Capacity" value={`${throughputCapacity}%`} change={`${assignedOrders} assigned`} trend="up" />
        <SummaryCard title="Node Latency Delta" value={`${avgComputationMs}ms`} change={`ETA ${avgEtaMinutes}m`} trend="neutral" />
        <SummaryCard title="Optimized Fuel Delta" value={`$${fuelDelta}`} change={`${activeRoutes} active routes`} trend="up" />
        <SummaryCard title="Risk Mitigation Rate" value={`${riskMitigationRate}%`} change={`${activeDisruptions} active disruptions`} trend={activeDisruptions > 0 ? "down" : "up"} />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Volume and Flow */}
        <div className="lg:col-span-2 space-y-8">
          <AntigravityCard className="p-10 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="font-headline text-2xl font-black text-white px-2">FLOW VELOCITY DELTA</h3>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] px-2 mt-1">Real-time throughput vs capacity</p>
              </div>
              <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-white/10 rounded-sm border border-white/10" />
                  <span className="text-white/30">Target</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-primary rounded-sm shadow-[0_0_8px_rgba(0,241,254,0.4)]" />
                  <span className="text-primary">Actual</span>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between h-80 gap-5 px-4 mb-2">
              {flowSeries.map((row) => (
                <DoubleBar key={row.day} planned={row.planned} actual={row.actual} day={row.day} />
              ))}
            </div>
          </AntigravityCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <AntigravityCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Waves size={20} />
                   </div>
                   <h4 className="text-lg font-black text-white">Vector Saturation</h4>
                </div>
                <div className="space-y-6">
                   <SaturationBar label="Urban Drones" value={saturation.urban} color="bg-primary" />
                   <SaturationBar label="Heavy Freight" value={saturation.heavy} color="bg-primary-container" />
                   <SaturationBar label="Last Mile Fleet" value={saturation.lastMile} color="bg-white/20" />
                </div>
             </AntigravityCard>

             <AntigravityCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Zap size={20} />
                   </div>
                   <h4 className="text-lg font-black text-white">Anomalous Spike Prob.</h4>
                </div>
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                   <p className="text-4xl font-black text-white mb-2 underline decoration-orange-500/50 decoration-4 underline-offset-8">{anomalyProbability.toString().padStart(2, '0')}.0%</p>
                   <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Estimated from active disruptions and route load</p>
                </div>
             </AntigravityCard>
          </div>
        </div>

        {/* Right Column: Regional Density & HUD */}
        <div className="space-y-8">
          <AntigravityCard className="p-0 overflow-hidden relative border-primary/10 group min-h-[500px] flex flex-col">
            <div className="p-10 pb-0">
               <h3 className="font-headline text-2xl font-black text-white mb-2">REGIONAL DENSITY</h3>
               <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-8">Node Distribution Matrix</p>
            </div>
            
            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] bg-cover grayscale brightness-[0.2] contrast-125 transition-transform duration-[40s] group-hover:scale-110" />
               <div className="absolute inset-0 bg-primary/5 mix-blend-color" />
               
               {/* Regional Data HUD */}
               <div className="p-8 space-y-4 relative z-10 bg-black/40 backdrop-blur-sm border-t border-b border-white/5 my-10">
                  {regionalRows.map((row) => (
                    <RegionalRow key={row.country} country={row.country} count={row.count} percent={row.percent} />
                  ))}
               </div>

               <div className="absolute bottom-8 left-8 right-8 p-6 bg-primary/10 border border-primary/20 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Sync</span>
                     <span className="text-[10px] font-mono text-primary-dim tracking-tight">V8.4.2</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="h-full w-1/3 bg-primary blur-[2px]"
                     />
                  </div>
               </div>
            </div>
          </AntigravityCard>

          <AntigravityCard className="p-8 border-rose-500/10 bg-rose-500/[0.02]">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Active Disruptions</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ff4d4d] animate-pulse" />
             </div>
             <div className="flex items-baseline gap-3">
                <h4 className="text-4xl font-black text-white">{activeDisruptions.toString().padStart(2, '0')}</h4>
                <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Localized Events</p>
             </div>
             <p className="text-[11px] text-white/40 mt-3 leading-relaxed">System protocols active. Mitigation in SEC-9 bypassing anomalous weather front.</p>
          </AntigravityCard>
        </div>
      </div>

      {/* Algorithm Efficacy Comparison */}
      <div className="space-y-6">
         <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-white font-headline tracking-tight">LOGISTICAL HEURISTICS</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
           <AlgoCard
             name="Vector Search A*"
             efficiency={Math.min(99, Math.max(50, 100 - activeDisruptions * 6))}
             gain={`+${Math.max(10, assignedOrders)}%`}
             latency={`${Math.max(1, avgComputationMs || 1)}ms`}
             active={true}
           />
           <AlgoCard
             name="BFS Baseline"
             efficiency={Math.max(30, Math.min(75, Math.round((deliveredOrders / Math.max(totalOrders, 1)) * 100)))}
             gain="Reference"
             latency={`${Math.max(6, Math.round((avgComputationMs || 12) * 1.8))}ms`}
             active={false}
           />
           <AlgoCard
             name="Dynamic Dijkstra"
             efficiency={Math.max(40, Math.min(90, Math.round((throughputCapacity + riskMitigationRate) / 2)))}
             gain={`+${Math.max(5, activeRoutes * 3)}%`}
             latency={`${Math.max(3, Math.round((avgComputationMs || 10) * 1.2))}ms`}
             active={false}
           />
         </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, change, trend = 'neutral' }: { title: string, value: string, change: string, trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <AntigravityCard className="border-l-4 border-l-primary/40 p-8 group hover:border-l-primary transition-all bg-white/[0.02]">
       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-4 group-hover:text-primary transition-colors">{title}</p>
       <div className="flex items-baseline gap-4">
          <h2 className="text-5xl font-black font-headline text-white tracking-tighter">{value}</h2>
          <span className={`text-sm font-black tracking-tight ${
            trend === 'up' ? 'text-emerald-400' : 
            trend === 'down' ? 'text-rose-400' : 'text-primary'
          }`}>{change}</span>
       </div>
    </AntigravityCard>
  );
}

function SaturationBar({ label, value, color = 'bg-primary' }: { label: string, value: number, color?: string }) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
            <span>{label}</span>
            <span>{value}%</span>
         </div>
         <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${value}%` }}
               className={`h-full ${color} shadow-[0_0_10px_rgba(0,241,254,0.3)]`}
            />
         </div>
      </div>
   );
}

function RegionalRow({ country, count, percent }: { country: string, count: number, percent: number }) {
   return (
      <div className="flex items-center justify-between">
         <div className="flex flex-col">
            <span className="text-sm font-bold text-white/90">{country}</span>
            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{count.toLocaleString()} Deliveries</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right">
               <span className="text-lg font-black text-primary tracking-tighter">{percent}%</span>
            </div>
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
         </div>
      </div>
   );
}

function DoubleBar({ planned, actual, day }: { planned: number, actual: number, day: string }) {
  return (
    <div className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer h-full">
       <div className="flex flex-col justify-end gap-1.5 h-[80%]">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${planned}%` }}
            className="w-full bg-white/[0.05] border border-white/5 rounded-t-sm group-hover:bg-white/10 transition-colors" 
          />
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${actual}%` }}
            className="w-full bg-primary rounded-t-sm shadow-[0_0_12px_rgba(0,241,254,0.2)] group-hover:brightness-125 transition-all" 
          />
       </div>
       <span className="text-[10px] font-black text-white/20 mt-4 text-center group-hover:text-white transition-colors">{day}</span>
    </div>
  );
}

function AlgoCard({ name, efficiency, gain, latency, active }: { name: string, efficiency: number, gain: string, latency: string, active: boolean }) {
  return (
    <AntigravityCard className={`p-8 group relative overflow-hidden transition-all duration-500 ${active ? 'border-primary/20 bg-primary/[0.03]' : 'border-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
       <div className="flex justify-between items-start mb-8">
          <div>
            <h4 className="font-headline font-black text-xl text-white tracking-tight">{name}</h4>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Efficacy: {efficiency}%</p>
          </div>
          {active && <span className="bg-primary text-on-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Selected</span>}
       </div>
       
       <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">System Gain</p>
             <p className="text-xl font-black text-primary">{gain}</p>
          </div>
          <div className="space-y-1">
             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Avg Latency</p>
             <p className="text-xl font-black text-white">{latency}</p>
          </div>
       </div>

       <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
             <Cpu size={12} className="text-white/20" />
             <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Compute Intensity: {active ? 'High' : 'Low'}</span>
          </div>
       </div>
       
       {active && (
         <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
       )}
    </AntigravityCard>
  );
}
