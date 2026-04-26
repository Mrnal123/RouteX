'use client'
import React from "react";
import { motion, Variants } from "framer-motion";
import { Layers, BarChart3, Brain, BoxSelect, Split, AlertTriangle } from 'lucide-react';

const CAPABILITIES = [
    {
        id: 1,
        span: "md:col-span-2 md:row-span-2",
        icon: <Layers size={40} />,
        title: "Real-time re-routing",
        desc: "Instant path correction based on sudden road closures or weather shifts.",
        xDir: -1, yDir: -1
    },
    {
        id: 2,
        span: "md:col-span-1 md:row-span-1",
        icon: <BarChart3 size={32} />,
        title: "ETA prediction",
        desc: "XGBoost-powered forecasting with 99.2% accuracy.",
        xDir: 1, yDir: -1
    },
    {
        id: 3,
        span: "md:col-span-1 md:row-span-1",
        icon: <Brain size={32} />,
        title: "AI explanations",
        desc: "Human-readable rationales for every routing decision.",
        xDir: 1, yDir: 0
    },
    {
        id: 4,
        span: "md:col-span-1 md:row-span-1",
        icon: <BoxSelect size={32} />,
        title: "3D visualization",
        desc: "Volumetric mapping for multi-story delivery planning.",
        xDir: -1, yDir: 1
    },
    {
        id: 5,
        span: "md:col-span-2 md:row-span-1",
        icon: <Split size={32} />,
        title: "Multi-stop optimization",
        desc: "Solve the 'Traveling Salesperson' problem in milliseconds for 100+ stops.",
        xDir: 0, yDir: 1
    },
    {
        id: 6,
        span: "md:col-span-3 md:row-span-1",
        icon: <AlertTriangle size={32} />,
        title: "Disruption detection",
        desc: "Early warning system for anomalies in delivery patterns and vehicle health, keeping supply chains resilient.",
        xDir: 0, yDir: 1
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 70,
            damping: 20
        }
    }
};

export function CapabilityShutter() {
    return (
        <div className="relative w-full max-w-7xl mx-auto px-6 py-24 pb-32">
            <div className="mb-20 space-y-4 text-center">
                <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-white uppercase">
                    Advanced Capability Stack
                </h2>
                <p className="text-lg text-white/40 max-w-xl mx-auto font-body">
                    Precision engineering for high-velocity logistics operators.
                </p>
                <div className="h-1 w-24 bg-primary mx-auto rounded-full blur-[2px]" />
            </div>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {CAPABILITIES.map((cap) => (
                    <motion.div
                        key={cap.id}
                        variants={itemVariants}
                        className={`${cap.span} group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-end backdrop-blur-md hover:bg-white/[0.07] transition-colors`}
                    >
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        
                        {/* Glow on Hover */}
                        <div className="absolute -inset-20 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="text-primary group-hover:scale-110 origin-top-left transition-transform duration-500">
                                {cap.icon}
                            </div>
                            <div className="mt-4">
                                <h4 className="text-2xl font-bold mb-2 text-white group-hover:text-primary transition-colors">{cap.title}</h4>
                                <p className="text-white/50 text-sm leading-relaxed font-body max-w-md">{cap.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
