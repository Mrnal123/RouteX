'use client'
import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { AntigravityGlass, AntigravityCard } from '@/components/ui/AntigravityGlass';
import { CapabilityShutter } from '@/components/ui/CapabilityShutter';
import { 
  ArrowRight, 
  Box, 
  Zap, 
  BarChart3, 
  Shield, 
  Globe, 
  Cpu, 
  TimerOff, 
  Route, 
  CircleDollarSign, 
  Package, 
  Settings, 
  MapPin, 
  Scan, 
  Layers, 
  Brain, 
  BoxSelect, 
  Split, 
  AlertTriangle 
} from 'lucide-react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1 } });
    
    tl.fromTo('.hero-badge', { y: -20, opacity: 0 }, { y: 0, opacity: 1, delay: 0.2 })
      .fromTo('.hero-title', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2 }, '-=0.8')
      .fromTo('.hero-p', { y: 30, opacity: 0 }, { y: 0, opacity: 1 }, '-=1')
      .fromTo('.hero-btns', { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.8')
      .fromTo('.hero-preview', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 2 }, '-=1.2');

    // Scroll reveal for all sections
    const reveals = gsap.utils.toArray('.reveal-on-scroll');
    reveals.forEach((el: any) => {
      gsap.fromTo(el, 
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out'
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full overflow-clip bg-background min-h-screen">


      <div className="relative z-10 w-full overflow-x-clip">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 pb-20">
          <div className="spline-container absolute top-0 left-0 w-full h-full -z-10 opacity-60">
            <iframe
              src="https://my.spline.design/retrofuturisticcircuitloop-JngSBMetOQh9Jn4XS5OxTiIc/" 
              frameBorder="0"
              width="100%" 
              height="100%" 
              id="aura-spline"
            ></iframe>
          </div>
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left space-y-8">
              <AntigravityGlass className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 text-[10px] md:text-xs font-semibold tracking-wider uppercase text-primary border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#99f7ff]" />
                Live Logistics Intelligence Active
              </AntigravityGlass>

              <h1 className="hero-title text-5xl md:text-7xl font-black font-headline tracking-tighter leading-[0.9] text-white">
                Revolutionizing <span className="text-primary text-glow-primary">Last-Mile</span> Delivery
              </h1>

              <p className="hero-p text-lg md:text-xl text-white/50 max-w-lg font-body leading-relaxed">
                Efficiency at your fingertips. Harness the power of AI-driven neural networks to transform static routes into dynamic kinetic logic.
              </p>

              <div className="hero-btns flex flex-wrap gap-4 pt-4">
                <Link href="/auth/login">
                  <button className="group relative px-10 py-5 bg-primary text-on-primary-fixed font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 overflow-hidden shadow-[0_0_40px_rgba(153,247,255,0.2)]">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </Link>
                
                <Link href="#process">
                  <AntigravityGlass className="px-10 py-5 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-colors border-white/10">
                    View Simulation
                  </AntigravityGlass>
                </Link>
              </div>
            </div>

            <div className="hero-preview relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-tertiary/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <AntigravityCard className="relative p-0 aspect-video rounded-3xl border-primary/20 overflow-hidden bg-black/40">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8fm-TrH_HzI5gw4qCWKxlajAIq5vlctF7VpbpJKke1Yoc9X5D_4IrDtwh3oTtw-pjgdG3Iswzt4AvDHWGhpTEdFulM6oqhLOxd8cN5mT_CBx39HHUIgl-uEOMdOKXaBAWYjmTz2xGTmc9Dl9psSWood6dPecLnxqUdaMGBt9y3yyVzn8CuudxaYmii-Qzn4SCvDSuBQHf_bsXxX6IiFeXkV78xEMjhBKDGn90fluQklSfJ13iGetqiRur5kLNTw_bnfSwIhuW9ukt" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Fleet Status</p>
                    <p className="text-2xl font-black font-headline text-white">98% On-Time</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(153,247,255,1)]" />
                    <div className="w-4 h-1 bg-white/20 rounded-full" />
                    <div className="w-4 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>
              </AntigravityCard>
            </div>
          </div>
        </section>

        {/* LOGISTIC BOTTLENECK SECTION */}
        <section className="py-32 px-6 bg-surface-container-lowest/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="reveal-on-scroll max-w-2xl mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white">THE LOGISTIC BOTTLENECK</h2>
              <p className="text-xl text-primary/60 italic font-body">Traditional delivery systems are failing in an era of instant demand. We solve the chaos of the last mile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ProblemCard 
                icon={<TimerOff size={32} />}
                title="Inaccurate delivery times"
                desc="Ghost ETAs damage customer trust. Our models account for urban friction in real-time."
              />
              <ProblemCard 
                icon={<Route size={32} />}
                title="Inefficient routing"
                desc="Static mapping ignores the pulse of the city. We optimize for every turn and traffic light."
              />
              <ProblemCard 
                icon={<CircleDollarSign size={32} />}
                title="High operational costs"
                desc="Fuel and time waste eat margins. Precision routing saves 22% on average fuel consumption."
              />
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section id="process" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="reveal-on-scroll flex flex-col md:flex-row justify-between items-end mb-20 gap-4 border-b border-white/5 pb-10">
              <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white">THE PROCESS</h2>
              <p className="text-primary font-mono font-bold uppercase tracking-[0.3em] text-sm">Synchronized Logic / 01-04</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProcessStep 
                num="01"
                icon={<Scan size={40} />}
                title="Enter details"
                desc="Inject parcel data, destination parameters, and driver availability into the core."
              />
              <ProcessStep 
                num="02"
                icon={<Settings size={40} />}
                title="Receive optimized"
                desc="Our A* engine calculates millions of permutations to find the peak efficiency path."
              />
              <ProcessStep 
                num="03"
                icon={<MapPin size={40} />}
                title="Track real-time"
                desc="Live telemetry provides a 1:1 digital twin of your fleet operations on the ground."
              />
              <ProcessStep 
                num="04"
                icon={<BarChart3 size={40} />}
                title="Analyze metrics"
                desc="Post-trip AI summaries reveal hidden patterns to further sharpen future deliveries."
              />
            </div>
          </div>
        </section>

        {/* CAPABILITY STACK SECTION */}
        <CapabilityShutter />

        {/* TECH STACK SECTION */}
        <section className="py-32 px-6 border-y border-white/5 relative bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="reveal-on-scroll space-y-10">
                <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-white leading-tight">Built on Pure Precision</h2>
                <p className="text-lg text-white/40 leading-relaxed font-body">Our architecture doesn't just process data; it understands the physics of movement. By combining classical search algorithms with modern generative AI, we create a resilient delivery engine.</p>
                
                <div className="grid grid-cols-1 gap-6">
                  <TechItem label="A*" title="A* Search Optimization" desc="Heuristic-driven pathfinding for complex graph traversal." />
                  <TechItem label="XG" title="XGBoost ML Models" desc="Gradient boosted trees for precise ETA forecasting." />
                  <TechItem label="GM" title="Gemini LLM Integration" desc="Semantic reasoning for disrupted logistics scenarios." />
                </div>
              </div>

              <div className="reveal-on-scroll grid grid-cols-2 gap-8">
                <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-8 border border-white/5 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                  <span className="text-5xl md:text-7xl font-black font-headline text-primary mb-2">99.9%</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold">System Uptime</span>
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-8 border border-white/5 translate-y-12 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                  <span className="text-5xl md:text-7xl font-black font-headline text-primary mb-2">&lt;50ms</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold">Compute Latency</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-40 px-6">
          <div className="reveal-on-scroll max-w-5xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-dim rounded-3xl blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-gradient-to-br from-primary/20 to-primary-dim/10 rounded-[2.5rem] p-12 lg:p-24 text-center border border-primary/20 backdrop-blur-3xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full -ml-48 -mb-48 blur-[100px] pointer-events-none" />
              
              <h2 className="text-5xl md:text-8xl font-black font-headline text-white mb-10 tracking-[ -0.05em] leading-[0.9]">Ready to optimize?</h2>
              <p className="text-white/60 text-xl md:text-2xl mb-14 max-w-2xl mx-auto font-body">Join the next generation of logistics providers. Deploy the RouteX engine in minutes.</p>
              
              <Link href="/dashboard">
                <button className="bg-primary text-on-primary-fixed px-14 py-6 rounded-2xl font-black text-2xl hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,241,254,0.3)]">
                  Launch Dashboard
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function ProblemCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="reveal-on-scroll p-10 bg-white/5 border-l-4 border-primary rounded-r-xl group hover:bg-white/10 transition-all duration-500">
      <div className="text-primary mb-6 transition-transform group-hover:scale-110 duration-500">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary-dim transition-colors">{title}</h3>
      <p className="text-white/40 leading-relaxed font-body">{desc}</p>
    </div>
  );
}

function ProcessStep({ num, icon, title, desc }: { num: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <AntigravityCard className="reveal-on-scroll relative group border-white/5 hover:border-primary/30 transition-all duration-700">
      <div className="text-7xl font-black text-white/5 absolute top-6 right-6 group-hover:text-primary/10 transition-colors duration-700">{num}</div>
      <div className="text-primary mb-8 transition-transform group-hover:rotate-6 duration-500 scale-110 origin-left">{icon}</div>
      <h4 className="text-xl font-bold mb-3 text-white">{title}</h4>
      <p className="text-sm text-white/40 leading-relaxed font-body">{desc}</p>
    </AntigravityCard>
  );
}


function TechItem({ label, title, desc }: { label: string, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center font-black text-primary border border-white/10 group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
        {label}
      </div>
      <div>
        <h5 className="font-bold text-white group-hover:text-primary-dim transition-colors">{title}</h5>
        <p className="text-xs text-white/40 font-body">{desc}</p>
      </div>
    </div>
  );
}


