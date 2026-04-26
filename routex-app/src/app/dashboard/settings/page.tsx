'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { AntigravityCard } from '@/components/ui/AntigravityGlass';
import { 
  User, 
  Key, 
  Shield, 
  Cpu,
  Save,
  Trash2,
  Bell,
  Globe,
  Lock,
  Zap,
  Fingerprint
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div>
          <h1 className="text-6xl font-black font-headline tracking-tighter text-white">CONTROL CENTER</h1>
          <p className="text-white/40 text-lg font-body mt-4 max-w-xl leading-relaxed">
            Manage your neural link, cryptographic signatures, and global node operational parameters.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/20">
          <Fingerprint size={18} className="text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Validated Administrator</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Profile & Main Config */}
        <div className="lg:col-span-8 space-y-12">
          {/* Administrator Profile Card */}
          <section className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-4">
              <User size={14} className="text-primary" />
              Administrator Core
            </h3>
            <AntigravityCard className="p-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-3xl bg-surface-container border-2 border-white/5 overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dim/20" />
                    <img 
                      src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=200&h=200" 
                      alt="Profile"
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-xl shadow-primary/20 hover:scale-110 active:scale-90 transition-all">
                    <Zap size={18} />
                  </button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest pl-1">Protocol Alias</label>
                    <input type="text" defaultValue="Admin-Alpha-1" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest pl-1">Encrypted Mail</label>
                    <input type="email" defaultValue="nexus@routex.ai" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-white transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest pl-1">Bio-Metric Status</label>
                    <div className="flex items-center gap-4 px-5 py-4 bg-white/[0.02] border border-white/5 rounded-xl">
                       <Shield size={16} className="text-primary" />
                       <span className="text-sm font-bold text-white/60">Quantum Encryption Level 5 Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </AntigravityCard>
          </section>

          {/* Integration Protocols */}
          <section className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-4">
              <Key size={14} className="text-primary" />
              INTEGRATION STACK
            </h3>
            <AntigravityCard className="p-10 space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Neural Access Key</label>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-lg border border-primary/20">Rotate Signature</button>
                </div>
                <div className="relative group">
                  <input type="password" value="rtx_nexus_sigma_9182391203912" readOnly className="w-full bg-black/60 border-2 border-white/5 rounded-2xl px-6 py-5 font-mono text-sm text-primary/60 outline-none group-hover:border-primary/20 transition-all" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-4">
                    <button className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl transition-all">Copy</button>
                    <button className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl transition-all">View</button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
                    <Cpu size={28} />
                  </div>
                  <div>
                    <p className="text-base font-black text-white">Vector SDK</p>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">v4.2.1-AURORA</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                  <div className="w-14 h-14 rounded-xl bg-primary-dim/10 flex items-center justify-center group-hover:bg-primary-dim group-hover:text-on-primary transition-all duration-500">
                    <Globe size={28} className="text-primary-dim group-hover:text-on-primary" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white">Global CDN</p>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">34,000 Nodes Active</p>
                  </div>
                </div>
              </div>
            </AntigravityCard>
          </section>
        </div>

        {/* Right Column: Fast Settings & Actions */}
        <div className="lg:col-span-4 space-y-12">
          {/* Toggle Stack */}
          <section className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-4">
              <Shield size={14} className="text-primary-dim" />
              Active Shields
            </h3>
            <AntigravityCard className="p-8 space-y-8">
              <ToggleItem icon={<Lock size={16} />} title="Biometric Lock" desc="Neural signature verification" active />
              <ToggleItem icon={<Zap size={16} />} title="Turbo Routines" desc="Prioritize high-value cargo" />
              <ToggleItem icon={<Globe size={16} />} title="Stealth Node" desc="Mask node geolocation" active />
              <ToggleItem icon={<Bell size={16} />} title="Heuristic Alerts" desc="Live predictive delay pings" active />
            </AntigravityCard>
          </section>

          {/* Danger Zone / Final Action */}
          <section className="space-y-6">
             <AntigravityCard className="p-0 border-rose-500/10 bg-rose-500/[0.02]">
                <div className="p-8">
                   <h4 className="text-rose-500 font-black text-xs uppercase tracking-widest mb-2">Danger System</h4>
                   <p className="text-xs text-white/30 leading-relaxed font-medium">Erase this instance from the global nexus. This process is irreversible.</p>
                </div>
                <button className="w-full py-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-t border-rose-500/10">
                   Self-Destruct Instance
                </button>
             </AntigravityCard>
          </section>
        </div>
      </div>

      {/* Persistent Action Bar */}
      <div className="fixed bottom-0 left-[260px] right-0 h-24 bg-black/40 backdrop-blur-3xl border-t border-white/5 flex items-center justify-center z-50 px-12">
        <div className="max-w-5xl w-full flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Configuration Synchronized</span>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="text-[11px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Discard Draft</button>
              <button className="flex items-center gap-3 px-10 py-4 bg-primary text-on-primary-fixed rounded-2xl font-black text-xs uppercase tracking-[.25em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                <Save size={18} />
                Commit Protocol
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ icon, title, desc, active = false }: { icon: React.ReactNode, title: string, desc: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-white/20 border border-white/5'}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-black transition-colors ${active ? 'text-white' : 'text-white/40'}`}>{title}</p>
          <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">{desc}</p>
        </div>
      </div>
      <Toggle active={active} />
    </div>
  );
}

function Toggle({ active = false }: { active?: boolean }) {
  return (
    <div className={`w-12 h-6 rounded-full transition-all duration-500 relative cursor-pointer border ${active ? 'bg-primary/20 border-primary/30 shadow-[0_0_15px_rgba(0,241,254,0.1)]' : 'bg-white/5 border-white/10'}`}>
      <motion.div 
        animate={{ x: active ? 24 : 4 }}
        className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${active ? 'bg-primary' : 'bg-white/20'}`} 
      />
    </div>
  );
}

