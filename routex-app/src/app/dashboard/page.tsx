'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AntigravityCard } from '@/components/ui/AntigravityGlass';
import { getOrderTableBadgeClass, toDisplayOrderStatus } from '@/lib/orderStatus';
import { 
  TrendingUp, 
  Package, 
  Map as MapIcon,
  Activity,
  ChevronRight,
  Navigation,
  Clock,
  Zap,
  AlertTriangle,
  BrainCircuit,
  Settings2,
  Cpu,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

// CityMap3D manages its own internal data — no props needed
const CityMap3D = dynamic(() => import('@/components/CityMap3D'), { ssr: false }) as React.ComponentType<Record<string, never>>;

// Chennai bounding box
const CHENNAI_BBOX = {
  minLat: 12.85,
  maxLat: 13.20,
  minLng: 80.15,
  maxLng: 80.30,
};

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
  });
}

const CHENNAI_ADDRESSES = [
  "T. Nagar, Chennai",
  "Adyar Signal, ECR",
  "Anna Nagar Tower Park",
  "Mylapore Kapaleeswarar",
  "Velachery Main Rd",
  "Guindy Industrial Estate",
  "Tambaram West",
  "Porur Junction",
  "Sholinganallur IT Park",
  "Perambur Barracks Rd",
  "Chromepet Radha Nagar",
  "Thiruvanmiyur Beach Rd",
];

const CUSTOMER_NAMES = [
  "Arvind Kumar", "Priya Rajan", "Deepak Venkat", "Kavitha Sundaram",
  "Rajesh Mohan", "Anitha Bala", "Suresh Narayanan", "Meena Krishnan",
];

export default function DashboardPage() {
  const dashboardData = useQuery(api.dashboard.getOverviewDashboardData);
  const orders = useQuery(api.orders.listOrders, {});
  const decisionLogs = useQuery(api.decisionLogs.listDecisionLogs);
  const activeRoutesData = useQuery(api.routes.listActiveRoutes);

  const createOrderAndAutoDispatch = useMutation(api.orders.createOrderAndAutoDispatch);
  const replanRoute = useAction(api.routing.replan.replanRoute);

  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [shipmentFlash, setShipmentFlash] = useState(false);
  const [optimizeFlash, setOptimizeFlash] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const activeRoutes = dashboardData?.activeRoutes ?? 0;
  const fleetSize = dashboardData?.fleetSize ?? 0;
  const avgEta = dashboardData?.avgDeliveryEta ?? 0;
  const disruptionsCount = dashboardData?.disruptionsToday ?? 0;

  // ── Quick Deploy: New Shipment (Chennai coordinates) ──────────────────
  const handleNewShipment = async () => {
    if (isCreatingShipment) return;
    setIsCreatingShipment(true);
    try {
      const lat = randomInRange(CHENNAI_BBOX.minLat, CHENNAI_BBOX.maxLat);
      const lng = randomInRange(CHENNAI_BBOX.minLng, CHENNAI_BBOX.maxLng);
      const address = CHENNAI_ADDRESSES[Math.floor(Math.random() * CHENNAI_ADDRESSES.length)];
      const customer = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];

      const result = await withTimeout(
        createOrderAndAutoDispatch({
          customerName: customer,
          deliveryAddress: address,
          lat,
          lng,
          timeWindowStart: Date.now(),
          timeWindowEnd: Date.now() + 4 * 60 * 60 * 1000, // 4-hour window
        }),
        12000,
        "Shipment dispatch timed out. Check Convex connection."
      );

      setActionMessage(
        result.createdNewRoute
          ? 'Shipment deployed and new route dispatched'
          : 'Shipment deployed and assigned to active route'
      );
      setShipmentFlash(true);
      setTimeout(() => setShipmentFlash(false), 2000);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error("Failed to create shipment:", err);
      setActionMessage('Failed to deploy shipment. Please retry.');
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setIsCreatingShipment(false);
    }
  };

  // ── Optimize Global Grid: Trigger A* Reroute ──────────────────────────
  const handleOptimizeGrid = async () => {
    if (isOptimizing) return;
    if (!activeRoutesData || activeRoutesData.length === 0) {
      // No active routes — inform user
      setOptimizeFlash(true);
      setTimeout(() => setOptimizeFlash(false), 2000);
      return;
    }
    setIsOptimizing(true);
    try {
      const result = await replanRoute({
        routeId: activeRoutesData[0]._id,
        disruptionType: "manual-optimization",
      });
      if (result.success) {
        setOptimizeFlash(true);
        setTimeout(() => setOptimizeFlash(false), 3000);
        setActionMessage(`A* complete in ${result.computationTimeMs}ms`);
      } else {
        setActionMessage(("reason" in result ? result.reason : undefined) ?? 'Optimization did not complete.');
      }
    } catch (err) {
      console.error("Optimization failed:", err);
      setActionMessage('Optimization failed. Please try again.');
    } finally {
      setTimeout(() => setActionMessage(null), 3000);
      setIsOptimizing(false);
    }
  };

  // ── Time-ago helper ───────────────────────────────────────────────────
  function timeAgo(timestamp: number) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just Now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter text-white">Logistics Command Central</h1>
          <p className="text-white/40 font-medium text-sm">Synchronized Vector Operations Hub v4.0.2</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            Schedule Routine
          </button>
          <button
            onClick={handleNewShipment}
            disabled={isCreatingShipment}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
              shipmentFlash
                ? 'bg-emerald-500 text-white shadow-emerald-500/40 scale-105'
                : 'bg-primary text-on-primary shadow-primary/20 hover:scale-105'
            } ${isCreatingShipment ? 'opacity-60 cursor-wait' : ''}`}
          >
            {isCreatingShipment ? (
              <Loader2 size={14} strokeWidth={3} className="animate-spin" />
            ) : shipmentFlash ? (
              <CheckCircle2 size={14} strokeWidth={3} />
            ) : (
              <Package size={14} strokeWidth={3} />
            )}
            {shipmentFlash ? 'Deployed to Chennai' : 'New Shipment'}
          </button>
        </div>
      </div>
      {actionMessage && (
        <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-white/80">
          {actionMessage}
        </div>
      )}

      {/* Primary Metrics Cluster - Denser Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MiniMetricCard label="Active Routes" value={activeRoutes.toLocaleString()} icon={<Navigation size={14} />} trend={+12} />
        <MiniMetricCard label="Active Fleet" value={fleetSize.toLocaleString()} icon={<Zap size={14} />} trend={+5.4} />
        <MiniMetricCard label="Avg. ETA" value={`${avgEta}m`} icon={<Clock size={14} />} trend={-2.1} negative />
        <MiniMetricCard label="Daily Disruptions" value={disruptionsCount.toLocaleString()} icon={<AlertTriangle size={14} />} trend={-4.5} negative />
        <MiniMetricCard label="Efficiency" value="94.2%" icon={<TrendingUp size={14} />} trend={+1.2} />
        <MiniMetricCard label="SLA Health" value="99.9%" icon={<Zap size={14} />} trend={0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Operational Vector View */}
        <div className="xl:col-span-8 space-y-8">
          <AntigravityCard className="h-[520px] p-0 overflow-hidden relative border-primary/10 shadow-2xl">
            {/* Live 3D City Map */}
            <div className="absolute inset-0">
              <CityMap3D />
            </div>

          </AntigravityCard>

          {/* Tactical Shipment Ledger - Ported Density from Template */}
          <AntigravityCard className="p-0 border-white/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black font-headline tracking-tighter text-white">Live Operations Ledger</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[.2em]">Real-time shipment vector tracking</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/5 text-[9px] font-black text-white/60 uppercase tracking-widest rounded-lg border border-white/5">Filter By Zone</button>
                <button className="px-3 py-1.5 bg-white/5 text-[9px] font-black text-white/60 uppercase tracking-widest rounded-lg border border-white/5">Export CSV</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Shipment ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Target Node</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Time Window</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5 text-right">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders?.slice(0, 5).map((order) => (
                    <ShipmentRow 
                      key={order._id}
                      id={order._id.substring(0, 8)} 
                      node={order.deliveryAddress} 
                      prio={order.status === 'pending' ? 'NORMAL' : 'HIGH'} 
                      eta={order.timeWindowStart ? new Date(order.timeWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"} 
                      status={order.status} 
                    />
                  ))}
                  {(!orders || orders.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-white/20 text-xs font-bold uppercase tracking-[.2em]">
                        No active shipment vectors detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Displaying {Math.min(5, orders?.length ?? 0)} of {orders?.length ?? 0} Operational Vectors</span>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Operations Ledger</button>
            </div>
          </AntigravityCard>
        </div>

        {/* Sidebar Intelligence */}
        <div className="xl:col-span-4 space-y-8">
          <AntigravityCard className="bg-[#101417]/80">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Fleet Capacity Analytics</h3>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-primary" />
              </div>
            </div>
            
            <div className="space-y-8">
              <CapacityMeter label="Heavy Freight" usage={84} total="420 Units" />
              <CapacityMeter label="Drone Delivery" usage={62} total="1,150 Units" />
              <CapacityMeter label="Last Mile Fleet" usage={91} total="840 Units" color="bg-rose-500" />
            </div>

            <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Activity size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Network Efficiency Peak</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">+18.4% compared to prev. shift</p>
                  </div>
               </div>
               <button
                 onClick={handleOptimizeGrid}
                 disabled={isOptimizing}
                 className={`w-full py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all leading-none flex items-center justify-center gap-2 ${
                   optimizeFlash
                     ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                     : isOptimizing
                       ? 'bg-emerald-500/10 text-emerald-400/50 cursor-wait'
                       : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                 }`}
               >
                 {isOptimizing ? (
                   <><Loader2 size={12} className="animate-spin" /> Running A* Optimization...</>
                 ) : optimizeFlash ? (
                   activeRoutesData && activeRoutesData.length > 0
                     ? <><CheckCircle2 size={12} /> Grid Optimized</>
                     : <>No Active Routes to Optimize</>
                 ) : (
                   'Optimize Global Grid Now'
                 )}
               </button>
            </div>
          </AntigravityCard>

          <AntigravityCard className="border-primary/10 bg-gradient-to-b from-primary/5 to-transparent">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter">AI Operational Log</h3>
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
             </div>
             
             <div className="space-y-4">
                {decisionLogs && decisionLogs.length > 0 ? (
                  decisionLogs.slice(0, 4).map((log) => (
                    <SimpleLog
                      key={log._id}
                      msg={log.reasoning.length > 60 ? log.reasoning.substring(0, 60) + '...' : log.reasoning}
                      time={timeAgo(log.timestamp)}
                      warning={log.triggerType === 'disruption'}
                    />
                  ))
                ) : (
                  <>
                    <SimpleLog msg="Awaiting first optimization cycle..." time="—" />
                    <p className="text-[10px] text-white/20 text-center py-2 uppercase tracking-widest">Deploy shipments & optimize to populate</p>
                  </>
                )}
             </div>

             <button className="w-full mt-6 py-4 bg-white/5 text-[9px] font-black text-white/40 uppercase tracking-[.2em] rounded-xl hover:bg-white/10 hover:text-white transition-all">
                Full Decision Audit
             </button>
          </AntigravityCard>
        </div>
      </div>
    </div>
  );
}

function MiniMetricCard({ label, value, trend, icon, negative = false }: { label: string, value: string, trend: number, icon: React.ReactNode, negative?: boolean }) {
  const isUp = trend > 0;
  return (
    <AntigravityCard className="p-4 border-white/5 hover:border-primary/20 transition-all cursor-default group">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white/40 group-hover:text-primary transition-colors">{icon}</div>
        <div className={`text-[9px] font-black tracking-tighter px-1.5 py-0.5 rounded-md ${
          trend === 0 ? 'bg-white/5 text-white/30' : 
          (isUp && !negative) || (!isUp && negative) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      </div>
      <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xl font-black text-white tracking-tighter font-headline">{value}</p>
    </AntigravityCard>
  );
}

function HUDTelemetry({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex flex-col">
      <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none mb-1">{label}</span>
      <span className="text-[10px] text-white/80 font-mono leading-none tracking-tighter font-medium">{value}</span>
    </div>
  );
}

function ShipmentRow({ id, node, prio, eta, status }: { id: string, node: string, prio: string, eta: string, status: string }) {
  const displayStatus = toDisplayOrderStatus(status);
  const statusClass = getOrderTableBadgeClass(status);

  return (
    <tr className="group hover:bg-white/[0.03] transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-xs font-black text-white tracking-tight">{id}</span>
          <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">QR Verified</span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-bold text-white/60">{node}</td>
      <td className="px-6 py-4">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${prio === 'CRITICAL' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : prio === 'HIGH' ? 'bg-primary text-on-primary' : 'bg-white/10 text-white/60'}`}>
          {prio}
        </span>
      </td>
      <td className="px-6 py-4 text-xs font-mono text-white/40">{eta}</td>
      <td className="px-6 py-4 text-right">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase leading-none ${statusClass}`}>
          {displayStatus}
        </span>
      </td>
    </tr>
  );
}

function CapacityMeter({ label, usage, total, color = 'bg-primary' }: { label: string, usage: number, total: string, color?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{total}</span>
      </div>
      <div className="flex items-center gap-4">
         <div className="flex-1 h-3 bg-white/5 rounded-lg overflow-hidden relative border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${usage}%` }}
              className={`h-full ${color} absolute inset-0 z-10`} 
            />
            <div className="absolute inset-0 bg-white/5 z-0" />
         </div>
         <span className={`text-xs font-black min-w-[32px] text-right ${color.replace('bg-', 'text-')}`}>{usage}%</span>
      </div>
    </div>
  );
}

function SimpleLog({ msg, time, warning = false }: { msg: string, time: string, warning?: boolean }) {
  return (
    <div className="flex items-center gap-4 group cursor-default">
      <div className={`w-1 h-1 rounded-full shrink-0 ${warning ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-primary opacity-40 group-hover:opacity-100 transition-opacity'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${warning ? 'text-rose-400' : 'text-white/60 group-hover:text-white transition-colors'}`}>{msg}</p>
      </div>
      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{time}</span>
    </div>
  );
}
