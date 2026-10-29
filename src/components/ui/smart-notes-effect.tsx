"use client";

import React from "react";
import { motion } from "motion/react";
import { Bell, MapPin, Clock, Radio, Check } from "lucide-react";

export const SmartNotesEffect: React.FC = () => {
  return (
    <div className="relative w-full max-w-[340px] flex flex-col items-center justify-center select-none">
      {/* Background ambient color aura */}
      <div className="absolute w-[260px] h-[180px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/15 to-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Main Smart Reminder Card */}
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
        {/* Top Header: Location Title & Status Pill */}
        <div className="flex items-center justify-between gap-2 text-right">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-white leading-tight">محطة مترو التحرير</h4>
              <span className="text-[10px] text-zinc-400 font-medium">الخط الأول والثاني</span>
            </div>
          </div>

          {/* Active Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400">تذكير تلقائي</span>
          </div>
        </div>

        {/* Note Body: Clean high-contrast container */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-2.5 text-right">
          <div className="flex items-start gap-1.5">
            <p className="text-[11px] text-zinc-200 font-medium leading-relaxed flex-1">
              تجديد كارت الاشتراك من شباك 3 قبل التحويل للخط الثاني 🚇
            </p>
          </div>
        </div>

        {/* Two-Column Smart Trigger Details */}
        <div className="grid grid-cols-2 gap-2 text-right">
          {/* Proximity Geofence trigger */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-zinc-400 font-medium">نطاق التنبيه</span>
              <span className="text-[11px] font-bold text-zinc-200">150 م عند الاقتراب</span>
            </div>
          </div>

          {/* Time trigger */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-zinc-400 font-medium">الموعد المحدد</span>
              <span className="text-[11px] font-bold text-zinc-200">اليوم 5:30 م</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Notification sound indicator + Active Switch */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.07] text-right">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400"
              animate={{
                rotate: [0, -12, 12, -8, 8, -4, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            >
              <Bell className="w-3.5 h-3.5" />
            </motion.div>
            <span className="text-[10px] text-zinc-300 font-medium">إشعار صوتي واهتزاز</span>
          </div>

          {/* Active Switch */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-4.5 rounded-full bg-emerald-600 p-0.5 flex items-center justify-end shadow-inner">
              <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-md">
                <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
