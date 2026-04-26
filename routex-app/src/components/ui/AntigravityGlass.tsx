'use client'
import React from 'react';
import { cn } from "@/lib/utils";

interface AntigravityGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tilt?: boolean;
}

export function AntigravityGlass({ 
  children, 
  className, 
  ...props 
}: AntigravityGlassProps) {
  return (
    <div
      className={cn(
        "relative rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20",
        className
      )}
      {...props}
    >
      {/* Subtle Inner Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function AntigravityCard({ 
  children, 
  className, 
  ...props 
}: AntigravityGlassProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/5 bg-surface-container/20 backdrop-blur-xl transition-all shadow-2xl overflow-hidden p-6",
        className
      )}
      {...props}
    >
      {/* Kinetic Beam Effect */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,rgba(0,241,254,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite]" />
      
      {/* Content wrapper - padding removed to allow more control from parent via className */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

