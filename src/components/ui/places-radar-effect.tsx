"use client";

import React from "react";
import { motion } from "motion/react";
import { Navigation, Landmark, Coffee, Sparkles } from "lucide-react";

export const PlacesRadarEffect: React.FC = () => {
  return (
    <div className="relative w-full max-w-[340px] flex flex-col items-center justify-center select-none">
      {/* Background ambient color aura */}
      <div className="absolute w-[260px] h-[180px] bg-gradient-to-tr from-blue-500/10 via-cyan-500/15 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Main Places Radar Card */}
      <motion.div
        className="relative z-10 w-full rounded-2xl bg-[#12131a] border border-white/10 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.85)] p-4 flex flex-col gap-3"
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: [0, -5, 0],
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* Top Header: Location Title & Radar Pill */}
        <div className="flex items-center justify-between gap-2 text-right">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Navigation className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-white leading-tight">رادار الأماكن القريبة</h4>
              <span className="text-[10px] text-zinc-400 font-medium">بحث مباشر في نطاق 2 كم</span>
            </div>
          </div>


        </div>

        {/* Center Radar Scanner Viewport */}
        <div className="relative w-full h-[84px] rounded-xl bg-black/50 border border-white/[0.06] overflow-hidden flex items-center justify-center">
          {/* Radar Concentric Rings */}
          <div className="absolute w-[60px] h-[60px] rounded-full border border-blue-500/20" />
          <div className="absolute w-[120px] h-[120px] rounded-full border border-white/[0.06]" />
          <div className="absolute w-full h-[1px] bg-white/[0.04]" />
          <div className="absolute h-full w-[1px] bg-white/[0.04]" />

          {/* Sweeping Radar Scanner Line */}
          <motion.div
            className="absolute w-[130px] h-[130px] rounded-full pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.35) 0deg, rgba(59, 130, 246, 0.05) 45deg, transparent 90deg, transparent 360deg)",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Center User Location Pin */}
          <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_8px_#3b82f6]" />

          {/* Radar Blip 1: Cairo Tower (Top Right) */}
          <div className="absolute top-2.5 right-6 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-[9px] font-bold text-amber-300 bg-black/75 px-1.5 py-0.5 rounded border border-amber-500/25">
              برج القاهرة
            </span>
          </div>

          {/* Radar Blip 2: Groppi / Cafe (Bottom Left) */}
          <div className="absolute bottom-2.5 left-5 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-[9px] font-bold text-rose-300 bg-black/75 px-1.5 py-0.5 rounded border border-rose-500/25">
              كافيه وسط البلد
            </span>
          </div>
        </div>

        {/* Two Discovered Places Bento Grid */}
        <div className="grid grid-cols-2 gap-2 text-right">
          {/* Place 1: Landmark */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-white truncate">برج القاهرة</span>
              <span className="text-[9px] text-zinc-400 font-medium">1.2 كم • ⭐ 4.8</span>
            </div>
          </div>

          {/* Place 2: Cafe */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <Coffee className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-white truncate">كافيه وسط البلد</span>
              <span className="text-[9px] text-emerald-400 font-medium">450 م • مفتوح</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Historical Highlight */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.07] text-right">
          <div className="flex items-center gap-1.5 text-zinc-300 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-zinc-300 font-medium truncate">
              خان الخليلي: وجهة تاريخية مميزة على بُعد 800 م
            </span>
          </div>

          <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md shrink-0">
            تحديث حي
          </span>
        </div>
      </motion.div>
    </div>
  );
};
