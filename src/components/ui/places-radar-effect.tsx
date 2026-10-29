"use client";

import React from "react";
import { motion } from "motion/react";
import { Navigation, Landmark, Coffee, Sparkles, Star } from "lucide-react";

export const PlacesRadarEffect: React.FC = () => {
  return (
    <div className="relative w-full max-w-[340px] h-[260px] flex items-center justify-center select-none overflow-visible">
      {/* Background Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer dashed ring */}
        <div className="w-[220px] h-[220px] rounded-full border border-dashed border-white/10" />

        {/* Middle ring */}
        <div className="absolute w-[150px] h-[150px] rounded-full border border-white/10" />

        {/* Inner ring */}
        <div className="absolute w-[80px] h-[80px] rounded-full border border-blue-500/20 bg-blue-500/[0.03]" />

        {/* Animated Expanding Pulse Wave */}
        <motion.div
          className="absolute w-[80px] h-[80px] rounded-full border border-blue-400/40"
          animate={{
            scale: [1, 2.7],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Sweeping Radar Scanner Line */}
        <motion.div
          className="absolute w-[220px] h-[220px] rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.25) 0deg, rgba(59, 130, 246, 0.05) 45deg, transparent 90deg, transparent 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Crosshair guidelines */}
        <div className="absolute w-[220px] h-[1px] bg-white/[0.06]" />
        <div className="absolute h-[220px] w-[1px] bg-white/[0.06]" />
      </div>

      {/* Center User Location Beacon */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute w-10 h-10 rounded-full bg-blue-500/20 blur-md animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] flex items-center justify-center text-white">
          <Navigation className="w-4 h-4 fill-white -rotate-45" />
        </div>
      </div>

      {/* Floating Place Badge 1: Cairo Tower (Top Right) */}
      <motion.div
        className="absolute top-2 right-1 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -5, 0],
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#14151f] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-white leading-tight">برج القاهرة</span>
            <span className="text-[9px] text-zinc-400 flex items-center gap-1 font-medium">
              1.2 كم • <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 inline" /> 4.8
            </span>
          </div>
        </div>
      </motion.div>

      {/* Floating Place Badge 2: Khan el-Khalili (Middle Left) */}
      <motion.div
        className="absolute top-12 left-1 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -4, 0],
        }}
        transition={{
          opacity: { duration: 0.5, delay: 0.2 },
          scale: { duration: 0.5, delay: 0.2 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
        }}
      >
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#14151f] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-white leading-tight">خان الخليلي</span>
            <span className="text-[9px] text-zinc-400 font-medium">وجهة تاريخية • 800 م</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Place Badge 3: Groppi / Cafe (Bottom Right) */}
      <motion.div
        className="absolute bottom-2 right-2 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, 5, 0],
        }}
        transition={{
          opacity: { duration: 0.5, delay: 0.3 },
          scale: { duration: 0.5, delay: 0.3 },
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
        }}
      >
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#14151f] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
          <div className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-white leading-tight">كافيه وسط البلد</span>
            <span className="text-[9px] text-emerald-400 font-medium">مفتوح الآن • 450 م</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
