'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Cpu,
  ChevronRight,
  Hexagon,
  Truck
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <Package size={20} />, label: "Orders", href: "/dashboard/orders" },
    { icon: <Truck size={20} />, label: "Fleet", href: "/dashboard/fleet" },
    { icon: <BarChart3 size={20} />, label: "Analytics", href: "/dashboard/analytics" },
    { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#101417]/80 backdrop-blur-2xl flex flex-col z-40">
        <div className="p-8 flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center relative shadow-lg shadow-primary/10">
              <Cpu size={22} className="text-on-primary-fixed" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-2xl tracking-tighter text-white">RouteX</span>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Live Control</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {navItems.map((item) => (
            <NavItem 
              key={item.href}
              icon={item.icon} 
              label={item.label} 
              href={item.href} 
              active={pathname === item.href} 
            />
          ))}
        </nav>

        {/* Live Orders Micro-list (from Stitch Asset) */}
        <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Operational Status</h3>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#99f7ff]" />
          </div>
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <Hexagon size={12} className="text-primary" />
                <span className="text-xs text-white/60 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">System Grid Operational</span>
             </div>
             <div className="flex items-center gap-3">
                <Hexagon size={12} className="text-emerald-400" />
                <span className="text-xs text-white/60 font-medium tracking-tight">Sync Speed: 14ms</span>
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <Link href="/">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/5 transition-all group">
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold tracking-tight">Log Out</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0b0e11]/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-6 w-1/2 max-w-[480px]">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search logistical vectors..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-white/[0.08] transition-all font-body placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white group">
              <Bell size={20} className="group-hover:shake" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-4 ring-[#0b0e11]" />
            </button>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white tracking-tight">Admin Unit-01</p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  <p className="text-[10px] text-primary-dim uppercase font-black tracking-widest">Level 4 Access</p>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1c2024] to-black border border-white/10 p-1">
                 <div className="w-full h-full rounded-lg bg-[url('https://avatar.vercel.sh/routex')] bg-cover opacity-80" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 py-10 bg-[#0b0e11] relative isolate">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,241,254,0.03),transparent_40%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-50 overflow-hidden" />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ x: 4 }}
        className={`
          flex items-center gap-4 px-5 py-4 rounded-xl transition-all group relative overflow-hidden
          ${active ? 'text-primary' : 'text-white/40 hover:text-white'}
        `}
      >
        {active && (
          <motion.div 
            layoutId="active-nav"
            className="absolute inset-0 bg-primary/[0.07] border-l-4 border-primary"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className={`${active ? 'text-primary' : 'text-white/30 group-hover:text-primary'} transition-colors relative z-10`}>
          {icon}
        </div>
        <span className="text-sm font-black tracking-tight font-headline relative z-10">{label}</span>
        {active && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto relative z-10"
          >
            <ChevronRight size={14} className="text-primary" />
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}

