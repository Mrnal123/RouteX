"use client";

import React, { useRef } from "react";
import {
    motion,
    useMotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Globe, Cpu, Activity, User } from "lucide-react";

// Types
interface FooterProps {
    companyName?: string;
    links?: { label: string; href: string }[];
}

const SOCIALS = [
    { name: "LinkedIn", icon: <User size={20} /> },
    { name: "Twitter", icon: <Globe size={20} /> },
    { name: "Instagram", icon: <Activity size={20} /> },
    { name: "GitHub", icon: <Cpu size={20} /> },
];


export const MagneticFooter = ({ companyName = "RouteX", links = [] }: FooterProps) => {
    return (
        <footer className="bg-slate-900 py-32 px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <h2 className="text-5xl md:text-8xl font-bold text-white mb-12 tracking-tight">
                    Ready to scale?
                </h2>

                <div className="flex justify-center gap-6 mb-20">
                    <MagneticButton>Get Started</MagneticButton>
                    <MagneticButton variant="outline">Book a call</MagneticButton>
                </div>

                <div className="flex justify-between items-center pt-12 border-t border-slate-800 text-slate-400">
                    <p>© 2024 {companyName}.</p>
                    <div className="flex gap-6">
                        {links.map((link) => (
                            <a key={link.label} href={link.href} className="hover:text-white transition-colors">
                                {link.label}
                            </a>
                        ))}
                        {SOCIALS.map(s => (
                            <motion.a
                                key={s.name}
                                href="#"
                                whileHover={{ y: -5, color: "#fff" }}
                                className="transition-colors"
                            >
                                {s.icon}
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

const MagneticButton = ({ children, variant = "primary" }: { children: React.ReactNode, variant?: "primary" | "outline" }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();
        x.set((clientX - (left + width / 2)) * 0.3);
        y.set((clientY - (top + height / 2)) * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0); y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className={cn(
                "px-8 py-4 rounded-full text-lg font-medium transition-all duration-300",
                variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-500" : "border border-slate-700 text-white hover:border-slate-500"
            )}
        >
            {children}
        </motion.button>
    );
};