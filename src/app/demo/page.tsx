"use client";

import React, { useState } from "react";
import { Demo } from "@/components/ui/demo";
import { GlassRevealQareeb, GlassReveal21st } from "@/components/ui/glass-icon-reveal";
import { SitePreloader } from "@/components/SitePreloader";
import { RefreshCw, Play, Sparkles, Layers, Moon, Sun } from "lucide-react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"glass-reveal" | "dropdown">("glass-reveal");
  const [showFullPreloader, setShowFullPreloader] = useState(false);
  const [preloaderTheme, setPreloaderTheme] = useState<"dark" | "light">("dark");
  const [preloaderKey, setPreloaderKey] = useState(0);

  const [glassKey, setGlassKey] = useState(0);
  const [speed, setSpeed] = useState(1);

  const handleTriggerPreloader = (theme: "dark" | "light") => {
    setPreloaderTheme(theme);
    setPreloaderKey((prev) => prev + 1);
    setShowFullPreloader(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white flex flex-col items-center">
      {/* Full-screen preloader preview modal */}
      {showFullPreloader && (
        <div key={preloaderKey} className="relative z-[9999999]">
          <SitePreloader
            theme={preloaderTheme}
            speed={speed}
            variant="glass"
            loop={false}
          />
          {/* Close preview button floating on top */}
          <button
            onClick={() => setShowFullPreloader(false)}
            className="fixed top-6 right-6 z-[10000000] px-4 py-2 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shadow-lg"
          >
            <span>إغلاق المعاينة</span>
            <span className="text-white/60">✕</span>
          </button>
        </div>
      )}

      {/* Top Header & Tab Navigation */}
      <header className="w-full max-w-5xl px-6 pt-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> WebGL2 Shader Reveal
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            شاشة التحميل الزجاجية (Glass Reveal Preloader)
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            تأثير الانكسار اللوني السائل (Chromatic Dispersion Glass) مع لوجو قريب والماركات المتعددة
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("glass-reveal")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "glass-reveal"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            شاشة التحميل الزجاجية
          </button>
          <button
            onClick={() => setActiveTab("dropdown")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "dropdown"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            قائمة التنقل المنسدلة
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="w-full max-w-5xl px-6 py-8 flex-1">
        {activeTab === "glass-reveal" ? (
          <div className="space-y-10">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.03] border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTriggerPreloader("dark")}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>معاينة شاشة التحميل كاملة (Dark)</span>
                </button>
                <button
                  onClick={() => handleTriggerPreloader("light")}
                  className="px-4 py-2.5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>معاينة كاملة (Light)</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>السرعة:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-24 accent-blue-500"
                  />
                  <span className="font-mono text-white">{speed}x</span>
                </div>

                <button
                  onClick={() => setGlassKey((k) => k + 1)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                  title="إعادة تشغيل التأثير"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة تشغيل</span>
                </button>
              </div>
            </div>

            {/* Live Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={glassKey}>
              {/* Card 1: Qareeb Dark Glass */}
              <div className="flex flex-col items-center justify-between p-6 rounded-3xl bg-[#030712] border border-blue-500/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="w-full flex items-center justify-between mb-4 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      Dark Aesthetic
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">لوجو قريب (Qareeb)</span>
                </div>

                <div className="w-[260px] h-[260px] rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center bg-black my-4">
                  <GlassRevealQareeb
                    look="dark"
                    tileSize={260}
                    speed={speed}
                    loop={true}
                    hold={1.2}
                    background="#030712"
                    plateColor="#080e1e"
                    logoColor="#38bdf8"
                    className="w-full h-full"
                  />
                </div>

                <div className="text-center z-10 mt-2">
                  <h3 className="text-lg font-bold text-white">قريب - Dark Neon Glass</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    انعكاسات زجاجية ثلاثية الأبعاد بظلال النيون وتدرج لوني دقيق
                  </p>
                </div>
              </div>

              {/* Card 2: Qareeb Light Glass */}
              <div className="flex flex-col items-center justify-between p-6 rounded-3xl bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-2xl relative overflow-hidden group">
                <div className="w-full flex items-center justify-between mb-4 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Light Aesthetic
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">لوجو قريب (Qareeb)</span>
                </div>

                <div className="w-[260px] h-[260px] rounded-2xl overflow-hidden shadow-xl relative flex items-center justify-center bg-white my-4">
                  <GlassRevealQareeb
                    look="light"
                    tileSize={260}
                    speed={speed}
                    loop={true}
                    hold={1.2}
                    background="#ffffff"
                    plateColor="#f1f5f9"
                    logoColor="#1d4ed8"
                    iconPlate={false}
                    className="w-full h-full"
                  />
                </div>

                <div className="text-center z-10 mt-2">
                  <h3 className="text-lg font-bold text-neutral-900">قريب - Pure Light Glass</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    سطح زجاجي نقي مع تشتت لوني حاد على الحواف وانتقال سلس
                  </p>
                </div>
              </div>

              {/* Card 3: 21st.dev Mark Preset */}
              <div className="flex flex-col items-center justify-between p-6 rounded-3xl bg-[#0e1428] border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
                <div className="w-full flex items-center justify-between mb-4 z-10">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      21st.dev Mark Preset
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">ماركة 21st الأصلية</span>
                </div>

                <div className="w-[260px] h-[260px] rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center bg-[#0e1428] my-4">
                  <GlassReveal21st
                    tileSize={260}
                    speed={speed}
                    loop={true}
                    hold={1.2}
                    background="#0e1428"
                    logoColor="#3b82f6"
                    className="w-full h-full"
                  />
                </div>

                <div className="text-center z-10 mt-2">
                  <h3 className="text-lg font-bold text-white">21st.dev Glass Reveal</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    الشكل الأصلي لمكتبة 21st.dev بانكسار حاد وانسيابية عالية
                  </p>
                </div>
              </div>

              {/* Card 4: How it works summary */}
              <div className="flex flex-col justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h3 className="text-base font-bold text-white">كيف يعمل التأثير؟</h3>
                  </div>
                  <ul className="space-y-2.5 text-xs text-neutral-300 leading-relaxed list-disc list-inside">
                    <li>
                      <strong className="text-blue-300">محرك WebGL2 ذاتي:</strong> معالجة كاملة للشيدر
                      (Shader) بحسابات قانون سنيل (Snell&apos;s Law) للانكسار عبر 20 طول موجي للضوء.
                    </li>
                    <li>
                      <strong className="text-blue-300">Signed Distance Field (SDF):</strong> توليد خريطة
                      مسافات إشارية لشعار &quot;قريب&quot; لضمان حواف فائقة النعومة مع التكبير والتصغير.
                    </li>
                    <li>
                      <strong className="text-blue-300">Spring Physics Timeline:</strong> محاكاة هبوط قطرة
                      السائل الزجاجي ثم تحولها لقطعة زجاجية دائرية الأركان (Squircle) ثم انحلالها بلطف.
                    </li>
                    <li>
                      <strong className="text-blue-300">مدمج في شاشة تحميل الموقع:</strong> يحل تلقائياً في
                      مكون <code className="text-amber-300 bg-white/5 px-1 py-0.5 rounded">SitePreloader</code>{" "}
                      ويختفي بسلاسة بعد اكتمال التحميل.
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">انقر على أي بطاقة لإعادة تشغيل الحركة</span>
                  <button
                    onClick={() => handleTriggerPreloader("dark")}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    تجربة الشاشة الكاملة ←
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <Demo />
          </div>
        )}
      </main>
    </div>
  );
}
