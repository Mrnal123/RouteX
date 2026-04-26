'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { AntigravityCard } from '@/components/ui/AntigravityGlass';
import { 
  Truck, 
  Activity,
  AlertTriangle,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Plus,
  Bike,
  Car,
} from 'lucide-react';

// ── Deploy Unit Configuration ───────────────────────────────────────────
const UNIT_QUEUE = [
  { name: "RX-Alpha", driverName: "Driver Alpha", capacity: 50, type: "Bike" },
  { name: "RX-Bravo", driverName: "Driver Bravo", capacity: 200, type: "Van" },
  { name: "RX-Charlie", driverName: "Driver Charlie", capacity: 500, type: "Truck" },
  { name: "RX-Delta", driverName: "Driver Delta", capacity: 100, type: "Bike" },
  { name: "RX-Echo", driverName: "Driver Echo", capacity: 350, type: "Van" },
];

function getVehicleIcon(name: string) {
  if (name.toLowerCase().includes("bike") || name.toLowerCase().includes("rx-alpha") || name.toLowerCase().includes("rx-delta")) return <Bike size={24} />;
  if (name.toLowerCase().includes("van") || name.toLowerCase().includes("rx-bravo") || name.toLowerCase().includes("rx-echo")) return <Car size={24} />;
  return <Truck size={24} />;
}

function inferType(name: string, capacity: number): string {
  if (capacity <= 100) return "Bike";
  if (capacity <= 250) return "Van";
  return "Truck";
}

export default function FleetPage() {
  const vehicles = useQuery(api.vehicles.listVehicles);
  const registerVehicle = useMutation(api.vehicles.registerVehicle);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployFlash, setDeployFlash] = useState(false);
  const [deployIndex, setDeployIndex] = useState(0);

  const fleet = vehicles ?? [];

  const handleDeployUnit = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    try {
      const unit = UNIT_QUEUE[deployIndex % UNIT_QUEUE.length];
      await registerVehicle({
        name: unit.name,
        driverName: unit.driverName,
        capacity: unit.capacity,
      });
      setDeployIndex((prev) => prev + 1);
      setDeployFlash(true);
      setTimeout(() => setDeployFlash(false), 2000);
    } catch (err) {
      console.error("Failed to deploy unit:", err);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Fleet Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black font-headline tracking-tighter text-white uppercase italic">Fleet Command</h1>
          <p className="text-white/40 text-lg font-body mt-4 max-w-xl leading-relaxed">
            Real-time orbital tracking of unit health, fuel consumption, and tactical deployment status.
          </p>
        </div>
        <div className="flex items-center gap-6">
           <button
             onClick={handleDeployUnit}
             disabled={isDeploying}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
               deployFlash
                 ? 'bg-emerald-500 text-white shadow-emerald-500/40 scale-105'
                 : 'bg-primary text-on-primary shadow-primary/20 hover:scale-105'
             } ${isDeploying ? 'opacity-60 cursor-wait' : ''}`}
           >
             {isDeploying ? (
               <Loader2 size={14} className="animate-spin" />
             ) : deployFlash ? (
               <CheckCircle2 size={14} />
             ) : (
               <Plus size={14} strokeWidth={3} />
             )}
             {deployFlash ? `${UNIT_QUEUE[(deployIndex - 1 + UNIT_QUEUE.length) % UNIT_QUEUE.length].name} Deployed` : 'Deploy Tactical Unit'}
           </button>
           <div className="text-right">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Registered Units</p>
              <h4 className="text-3xl font-black text-white font-mono tracking-tighter">{fleet.length}</h4>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group">
              <Activity size={24} className="animate-pulse" />
           </div>
        </div>
      </div>

      {/* Main Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Unit List */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Operational Unit Ledger</h3>
              <div className="flex gap-4">
                 <button className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/20 pb-0.5">Live View</button>
                 <button className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">History</button>
              </div>
           </div>

           <div className="space-y-4">
              {fleet.length > 0 ? (
                fleet.map((unit, idx) => (
                  <FleetRow key={unit._id} unit={unit} index={idx} />
                ))
              ) : (
                <AntigravityCard className="p-12 text-center">
                  <p className="text-white/20 text-xs font-bold uppercase tracking-[.2em] mb-4">No units deployed yet</p>
                  <p className="text-white/10 text-[10px] uppercase tracking-widest">Click "Deploy Tactical Unit" to register your first vehicle</p>
                </AntigravityCard>
              )}
           </div>
        </div>

        {/* Right Side: Tactical HUD */}
        <div className="lg:col-span-4 space-y-8">
           <AntigravityCard className="p-0 overflow-hidden border-white/5 bg-white/[0.02]">
              <div className="p-8 border-b border-white/5 bg-black/40">
                 <h4 className="text-sm font-black text-white uppercase tracking-widest">Global Fuel Flux</h4>
              </div>
              <div className="p-8 space-y-8">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <p className="text-4xl font-black text-white">$4.2M</p>
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Est. Monthly Delta</p>
                    </div>
                    <div className="text-right p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                       <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Saving: 12%</p>
                    </div>
                 </div>

                 {/* Fuel consumption graph placeholder */}
                 <div className="h-24 flex items-end gap-1 px-2">
                    {[34, 45, 23, 56, 78, 43, 67, 34, 45, 89, 23, 56].map((h, i) => (
                       <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                 </div>
              </div>
           </AntigravityCard>

           <AntigravityCard className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Anomaly Probability</h4>
                 <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div className="relative h-40 flex items-center justify-center">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                       <div className="text-2xl font-black text-white">0.02<span className="text-xs text-white/40">%</span></div>
                    </div>
                 </div>
                 {/* Decorative radar circle */}
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-t-2 border-primary/40"
                 />
              </div>
              <p className="text-[10px] text-white/30 text-center leading-relaxed font-bold uppercase tracking-widest">No critical anomalies detected in the current orbital scan.</p>
           </AntigravityCard>
        </div>
      </div>
    </div>
  );
}

function FleetRow({ unit, index }: { unit: any, index: number }) {
  const unitType = inferType(unit.name, unit.capacity);
  const isActive = unit.status === 'active';
  const isMaintenance = unit.status === 'maintenance';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <AntigravityCard className="p-0 overflow-hidden group hover:border-primary/20 transition-all duration-500 relative">
         <div className="flex items-center gap-8 py-6 px-8 flex-wrap md:flex-nowrap">
            {/* Unit Icon Pin */}
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all duration-500">
               {getVehicleIcon(unit.name)}
            </div>

            {/* Core Info */}
            <div className="flex-1 min-w-[150px]">
               <h4 className="text-xl font-black text-white tracking-tighter italic">{unit.name}</h4>
               <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">{unit.driverName} • {unitType}</p>
            </div>

            {/* Status Vitals */}
            <div className="flex items-center gap-12">
               <div className="space-y-2 text-center">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Capacity</span>
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${unit.capacity > 300 ? 'bg-primary' : unit.capacity > 100 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, (unit.capacity / 500) * 100)}%` }} />
                     </div>
                     <span className="text-xs font-black text-white/60">{unit.capacity}kg</span>
                  </div>
               </div>

               <div className="w-32">
                  <StatusPill status={unit.status} />
               </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-4">
               <div className="text-right hidden xl:block">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Signal</p>
                  <p className="text-xs font-bold text-primary">{isActive ? 'Strong' : isMaintenance ? 'Weak' : 'Standby'}</p>
               </div>
               <button className="p-3 hover:bg-white/5 rounded-xl text-white/10 hover:text-white transition-all">
                  <ChevronRight size={18} />
               </button>
            </div>
         </div>
         {/* Detail Overlay Reveal Placeholder */}
         <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500" />
      </AntigravityCard>
    </motion.div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: any = {
    'active': 'text-primary border-primary/20 bg-primary/5',
    'idle': 'text-amber-400 border-amber-400/20 bg-amber-400/5',
    'maintenance': 'text-rose-500 border-rose-500/20 bg-rose-500/5',
  };
  return (
    <div className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest text-center ${styles[status] || 'text-white/30 border-white/10 bg-white/5'}`}>
      {status}
    </div>
  );
}
