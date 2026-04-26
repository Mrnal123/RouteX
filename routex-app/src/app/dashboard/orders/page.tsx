'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AntigravityCard } from '@/components/ui/AntigravityGlass';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { getOrderBadgeClass, toDisplayOrderStatus } from '@/lib/orderStatus';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowUpRight,
  Zap,
  Clock,
  MoreVertical,
  Activity,
  Layers,
  MapPin,
  Truck,
  Box,
  ChevronRight,
  X,
  Target,
  Thermometer,
  ShieldCheck
} from 'lucide-react';

interface Order {
  id: string;
  destination: string;
  status: string;
  priority: 'Urgent' | 'High' | 'Normal';
  eta: string;
  weight: string;
  type: 'Heavy Freight' | 'Standard' | 'Micro';
  coordinates: [number, number];
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const ordersData = useQuery(api.orders.listOrders, {});

  const orders: Order[] = (ordersData ?? []).map((order) => {
    const displayStatus = toDisplayOrderStatus(order.status);
    return {
      id: order._id,
      destination: order.deliveryAddress,
      status: displayStatus,
      priority: order.status === 'pending' ? 'Normal' : order.status === 'cancelled' ? 'Urgent' : 'High',
      eta: order.timeWindowEnd
        ? new Date(order.timeWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'N/A',
      weight: 'N/A',
      type: order.status === 'assigned' ? 'Heavy Freight' : order.status === 'out-for-delivery' ? 'Standard' : 'Micro',
      coordinates: [order.lat, order.lng],
    };
  });

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-full pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Terminal List */}
      <div className={`flex-1 space-y-12 transition-all duration-500 ${selectedOrder ? 'xl:w-2/3' : 'w-full'}`}>
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl font-black font-headline tracking-tighter text-white uppercase italic">Shipment Terminal</h1>
            <div className="flex items-center gap-6 mt-4">
               <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                  <Activity size={12} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Nexus Sync Active</span>
               </div>
               <p className="text-white/40 text-sm font-medium">Monitoring <span className="text-white">{orders.length}</span> live shipment vectors.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
               <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
               <input 
                  type="text" 
                  placeholder="Query Parcel Signature..." 
                  className="h-14 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 text-sm focus:outline-none focus:border-primary/40 focus:bg-white/10 w-64 text-white placeholder:text-white/20 font-bold transition-all"
               />
            </div>
            
            <button className="h-14 px-10 bg-primary text-on-primary rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Deploy Unit
            </button>
          </div>
        </div>

        {/* Parcel List */}
        <div className="space-y-4">
          <div className="grid grid-cols-[80px_1fr_1fr_1.5fr_1fr] gap-6 px-10 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] bg-white/[0.02] border-b border-white/5 rounded-t-2xl">
            <span>Class</span>
            <span>Identifier</span>
            <span>Ledger Status</span>
            <span>Tactical Flux</span>
            <span>Arrival Delta</span>
          </div>

          <div className="flex flex-col gap-4">
            {orders.length === 0 && (
              <div className="px-10 py-10 rounded-2xl border border-white/5 bg-white/[0.02] text-center text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                No live orders received from Convex yet.
              </div>
            )}
            {orders.map((order, idx) => (
              <OrderRow 
                key={order.id} 
                order={order} 
                index={idx} 
                isSelected={selectedOrder?.id === order.id}
                onClick={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Side HUD - Detailed View */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="xl:w-1/3"
          >
            <AntigravityCard className="sticky top-10 p-0 overflow-hidden border-primary/20 bg-primary/[0.02] shadow-2xl">
               <div className="p-8 border-b border-white/5 flex justify-between items-start bg-black/40">
                  <div>
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Detailed Telemetry</p>
                     <h3 className="text-3xl font-black text-white font-headline tracking-tighter italic">{selectedOrder.id}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/20 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
               </div>

               <div className="p-8 space-y-10">
                  {/* Status HUD Widget */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Target size={60} strokeWidth={1} />
                     </div>
                     <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-baseline">
                           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Final Endpoint</span>
                           <span className="text-white font-bold">{selectedOrder.destination}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Vector Lat/Long</span>
                           <span className="text-primary font-mono text-xs">{selectedOrder.coordinates.join(', ')}</span>
                        </div>
                     </div>
                  </div>

                  {/* Environment Metrics */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                           <Thermometer size={12} className="text-orange-400" />
                           Payload Temp
                        </div>
                        <p className="text-2xl font-black text-white">22.4°C</p>
                     </div>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                           <ShieldCheck size={12} className="text-emerald-400" />
                           Integrity
                        </div>
                        <p className="text-2xl font-black text-white">100%</p>
                     </div>
                  </div>

                  {/* Route Visualizer Mock */}
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Node Path Progress</p>
                     <div className="flex items-center justify-between px-2">
                        {[1, 2, 3, 4].map((i) => (
                           <div key={i} className="flex flex-col items-center gap-2">
                              <div className={`w-3 h-3 rounded-full border-2 ${i <= 2 ? 'bg-primary border-primary shadow-[0_0_8px_#99f7ff]' : 'border-white/10 bg-black'}`} />
                              <span className="text-[8px] font-black text-white/20">NODE-{i}0</span>
                           </div>
                        ))}
                     </div>
                     <div className="h-0.5 w-full bg-white/5 relative mx-4">
                        <div className="absolute h-full bg-primary w-1/2 shadow-[0_0_10px_#99f7ff]" />
                     </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-4">
                     <button className="flex-1 py-4 bg-primary text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/10 hover:brightness-110 active:scale-95 transition-all">
                        Accelerate Flow
                     </button>
                     <button className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                        <MoreVertical size={18} />
                     </button>
                  </div>
               </div>
            </AntigravityCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderRow({ order, index, isSelected, onClick }: { order: Order, index: number, isSelected: boolean, onClick: () => void }) {
  const isUrgent = order.priority === 'Urgent';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <AntigravityCard 
        className={`p-0 rounded-2xl group relative overflow-hidden flex items-stretch cursor-pointer transition-all duration-500 ${
          isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]' : 'hover:border-white/20'
        }`}
        onClick={onClick}
      >
        <div className="grid grid-cols-[80px_1fr_1fr_1.5fr_1fr] gap-6 w-full items-center py-6 px-10">
          {/* Class Icon */}
          <div className="flex items-center justify-center">
            <div className={`w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center border border-white/5 transition-all duration-500 transform group-hover:rotate-[10deg] ${isSelected ? 'border-primary/40 rotate-0' : ''}`}>
               {order.type === 'Heavy Freight' && <Truck className={isSelected ? 'text-primary' : 'text-white/20'} size={24} />}
               {order.type === 'Standard' && <Package className={isSelected ? 'text-primary' : 'text-white/20'} size={24} />}
               {order.type === 'Micro' && <Box className={isSelected ? 'text-primary' : 'text-white/20'} size={24} />}
            </div>
          </div>

          {/* ID & Type */}
          <div>
            <p className="text-xl font-black text-white/90 group-hover:text-white transition-colors italic tracking-tighter">{order.id}</p>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">{order.type}</p>
          </div>

          {/* Ledger Status */}
          <div className="flex">
            <StatusBadge status={order.status} />
          </div>

          {/* Tactical Flux */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Weight</span>
                <p className="text-xs font-bold text-white/60">{order.weight}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Priority</span>
                <div className="flex items-center gap-2">
                   {isUrgent && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                   <span className={`text-xs font-black ${isUrgent ? 'text-primary' : 'text-white/40'}`}>{order.priority}</span>
                </div>
             </div>
          </div>

          {/* Arrival Delta */}
          <div className="text-right flex flex-col items-end">
             <div className="flex items-center gap-3">
                <Clock size={16} className={`transition-colors ${order.status === 'Flagged' ? 'text-rose-400' : 'text-white/20'}`} />
                <p className={`text-2xl font-black font-mono tracking-tighter transition-all ${order.status === 'Flagged' ? 'text-rose-500 animate-pulse' : 'text-white/90 group-hover:text-primary'}`}>{order.eta}</p>
             </div>
             <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">Simulated T-Delta</p>
          </div>
        </div>
        
        {/* Hover/Selection Reveal */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-primary transition-all duration-500 scale-y-0 ${isSelected ? 'scale-y-100' : 'group-hover:scale-y-100'}`} />
      </AntigravityCard>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const badgeClass = getOrderBadgeClass(status);
  return (
    <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-[0.2em] w-36 text-center ${badgeClass}`}>
      {status}
    </div>
  );
}
