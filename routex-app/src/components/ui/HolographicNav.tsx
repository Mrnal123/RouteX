"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

type NavItem = {
    name: string;
    href: string;
};

interface NavProps {
    items: NavItem[];
    className?: string;
    activeTab?: string; // Controlled state for demo, usually via router
}

// ============================================================================
// 6. THE "FUTURISTIC" NAV (Holographic / Sci-Fi)
// Style: Cyan glow, skewed angles, matrix feel.
// Used by: Gaming sites, Web3, Cyberpunk themes.
// ============================================================================
export const HolographicNav = ({ items, className }: NavProps) => {
    const [active, setActive] = useState(items[0].name);

    return (
        <nav className={cn("flex gap-1 p-1 bg-black/80 border-t border-b border-cyan-500/30", className)}>
            {items.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setActive(item.name)}
                    className="relative group px-6 py-3 overflow-hidden"
                >
                    {/* Background Glitch on Hover */}
                    <span className="absolute inset-0 bg-cyan-950/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out skew-x-12 origin-bottom-left" />

                    {/* Active State Scanner Line */}
                    {active === item.name && (
                        <motion.div
                            layoutId="holo-scanner"
                            className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                        />
                    )}

                    {/* Text */}
                    <span className={cn(
                        "relative z-10 font-mono uppercase tracking-widest text-xs transition-colors duration-300",
                        active === item.name ? "text-cyan-400 text-shadow-neon" : "text-zinc-500 group-hover:text-cyan-200"
                    )}>
                        {item.name}
                    </span>
                </Link>
            ))}
        </nav>
    );
};