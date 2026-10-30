const fs = require('fs');
const paths = JSON.parse(fs.readFileSync('scripts/paths_formatted.json', 'utf8'));

const tsCode = `"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

const OUTER_PATH = \`${paths.outer}\`;
const INNER_PATH = \`${paths.inner}\`;
const COMBINED_PATH = \`\${OUTER_PATH} \${INNER_PATH}\`;

interface QareebLogoEffectProps {
  className?: string;
  speed?: number;
  onAnimationComplete?: () => void;
}

export const QareebLogoEffect: React.FC<QareebLogoEffectProps> = ({
  className = "",
  speed = 1,
  onAnimationComplete,
}) => {
  const [animationPhase, setAnimationPhase] = useState<"drawing" | "filled">("drawing");
  const calc = (x: number) => x * speed;

  return (
    <div className={\`relative w-full max-w-[340px] flex flex-col items-center justify-center select-none \${className}\`}>
      {/* Background ambient neon aura */}
      <motion.div
        className="absolute w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.22) 0%, rgba(37, 99, 235, 0.1) 45%, transparent 75%)",
        }}
        animate={{
          scale: animationPhase === "filled" ? [1, 1.15, 1] : 1,
          opacity: animationPhase === "filled" ? [0.6, 0.9, 0.7] : 0.4,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* SVG Canvas for Drawing the Logo */}
      <div className="relative w-[180px] h-[190px] flex items-center justify-center">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="280 200 1440 1840"
          className="w-full h-full overflow-visible drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
          initial={{ opacity: 1 }}
        >
          <defs>
            {/* Linear gradient for stroke drawing */}
            <linearGradient id="qareebStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#93c5fd" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>

            {/* Linear gradient for inner fill */}
            <linearGradient id="qareebFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f0f6ff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="qareebGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Animated Stroke: Outer Calligraphy Contour */}
          <motion.path
            d={OUTER_PATH}
            fill="none"
            stroke="url(#qareebStrokeGrad)"
            strokeWidth={32}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#qareebGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: calc(2.4),
              ease: "easeInOut",
              opacity: { duration: 0.3 },
            }}
          />

          {/* 2. Animated Stroke: Inner Loop Eye */}
          <motion.path
            d={INNER_PATH}
            fill="none"
            stroke="url(#qareebStrokeGrad)"
            strokeWidth={28}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: calc(1.4),
              delay: calc(0.9),
              ease: "easeInOut",
              opacity: { duration: 0.3, delay: calc(0.9) },
            }}
          />

          {/* 3. Smooth Fill Reveal (Fades in once strokes are fully drawn) */}
          <motion.path
            d={COMBINED_PATH}
            fill="url(#qareebFillGrad)"
            fillRule="evenodd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: calc(2.4),
              duration: calc(0.9),
              ease: "easeOut",
            }}
            onAnimationComplete={() => {
              setAnimationPhase("filled");
              if (onAnimationComplete) onAnimationComplete();
            }}
          />
        </motion.svg>
      </div>

      {/* Brand Typography & Tagline */}
      <motion.div
        className="mt-4 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: calc(2.6),
          duration: calc(0.7),
          ease: "easeOut",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-black tracking-widest text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)] font-heading">
            قَـــرِيـــبْ
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-400/30 text-blue-300">
            QAREEB
          </span>
        </div>

        <p className="text-[12px] text-zinc-300 font-medium mt-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>دليلك الذكي للتنقل والأماكن في مصر</span>
        </p>
      </motion.div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/ui/qareeb-logo-effect.tsx', tsCode, 'utf8');
console.log('Successfully written src/components/ui/qareeb-logo-effect.tsx');
