"use client";

import React, { forwardRef, useRef, useId, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ASSETS } from "@/constants/assets";

/* -------------------------------------------------------------------------- */
/*                            ANIMATED BEAM CORE                              */
/* -------------------------------------------------------------------------- */

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2.5,
  delay = 0,
  pathColor = "currentColor",
  pathWidth = 1.5,
  pathOpacity = 0.08,
  gradientStartColor = "#3b82f6",
  gradientStopColor = "#8b5cf6",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [gradientCoords, setGradientCoords] = useState({
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%",
  });

  const updatePath = useCallback(() => {
    if (containerRef.current && fromRef.current && toRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rectA = fromRef.current.getBoundingClientRect();
      const rectB = toRef.current.getBoundingClientRect();

      setSvgDimensions({
        width: containerRect.width,
        height: containerRect.height,
      });

      const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
      const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
      const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
      const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

      const controlX = (startX + endX) / 2;
      const controlY = (startY + endY) / 2 - curvature;
      const d = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;
      setPathD(d);

      setGradientCoords({
        x1: `${startX}px`,
        y1: `${startY}px`,
        x2: `${endX}px`,
        y2: `${endY}px`,
      });
    }
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  useEffect(() => {
    updatePath();
    const resizeObserver = new ResizeObserver(() => updatePath());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", updatePath);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePath);
    };
  }, [updatePath, containerRef]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1={gradientCoords.x1}
          y1={gradientCoords.y1}
          x2={gradientCoords.x2}
          y2={gradientCoords.y2}
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="25%" stopColor={gradientStartColor} stopOpacity="0.8" />
          <stop offset="60%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>

        <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Static Subdued Baseline Path */}
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />

      {/* Framer Motion Animated Beam Path */}
      {pathD && (
        <motion.path
          d={pathD}
          stroke={`url(#${id})`}
          strokeWidth={pathWidth * 1.8}
          strokeLinecap="round"
          strokeDasharray="45 155"
          filter={`url(#glow-${id})`}
          initial={{ strokeDashoffset: reverse ? 0 : 200 }}
          animate={{ strokeDashoffset: reverse ? 200 : 0 }}
          transition={{
            duration,
            delay,
            ease: [0.45, 0.05, 0.55, 0.95],
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                               CIRCLE ELEMENT                               */
/* -------------------------------------------------------------------------- */

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; style?: React.CSSProperties; children?: React.ReactNode; "aria-label"?: string }
>(({ className, style, children, "aria-label": ariaLabel }, ref) => {
  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      style={{
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        backgroundColor: "rgba(24, 24, 27, 0.9)",
        padding: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "all 0.3s ease",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

/* -------------------------------------------------------------------------- */
/*                           MAIN DEMO COMPONENT                              */
/* -------------------------------------------------------------------------- */

export interface AnimatedBeamDemoProps {
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export function AnimatedBeamDemo({ className, style, compact = false }: AnimatedBeamDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null); // Bus
  const div2Ref = useRef<HTMLDivElement>(null); // Metro
  const div3Ref = useRef<HTMLDivElement>(null); // Microbus
  const div4Ref = useRef<HTMLDivElement>(null); // Center (Cairo / Hub)
  const div5Ref = useRef<HTMLDivElement>(null); // Monorail
  const div6Ref = useRef<HTMLDivElement>(null); // Train
  const div7Ref = useRef<HTMLDivElement>(null); // LRT

  const circleSize = compact ? "38px" : "44px";
  const hubSize = compact ? "50px" : "58px";
  const iconPadding = compact ? "7px" : "9px";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        maxWidth: compact ? "330px" : "600px",
        height: compact ? "230px" : "360px",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(18, 19, 26, 0.95)",
        padding: compact ? "16px 20px" : "32px 40px",
        boxShadow: "0 20px 45px -12px rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxSizing: "border-box",
        direction: "ltr",
        ...style,
      }}
      className={className}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        {/* Row 1 */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Circle ref={div1Ref} aria-label="أتوبيس" style={{ width: circleSize, height: circleSize, padding: iconPadding }}>
            <Icons.bus />
          </Circle>
          <Circle ref={div5Ref} aria-label="مونوريل" style={{ width: circleSize, height: circleSize, padding: iconPadding }}>
            <Icons.monorail />
          </Circle>
        </div>

        {/* Row 2 */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Circle ref={div2Ref} aria-label="مترو الأنفاق" style={{ width: circleSize, height: circleSize, padding: iconPadding }}>
            <Icons.metro />
          </Circle>

          {/* Central Hub Node */}
          <Circle
            ref={div4Ref}
            aria-label="القاهرة - شبكة المواصلات"
            style={{
              width: hubSize,
              height: hubSize,
              borderRadius: "18px",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              backgroundColor: "#18181b",
              padding: compact ? "8px" : "10px",
              boxShadow: "0 0 25px rgba(59, 130, 246, 0.25), 0 10px 20px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Icons.center />
          </Circle>

          <Circle ref={div6Ref} aria-label="قطار" style={{ width: circleSize, height: circleSize, padding: iconPadding }}>
            <Icons.train />
          </Circle>
        </div>

        {/* Row 3 */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Circle ref={div3Ref} aria-label="ميكروباص" style={{ width: circleSize, height: circleSize, padding: iconPadding }}>
            <Icons.microbus />
          </Circle>
          <Circle ref={div7Ref} aria-label="القطار الكهربائي الخفيف LRT" style={{ width: circleSize, height: circleSize, padding: iconPadding }}>
            <Icons.lrt />
          </Circle>
        </div>
      </div>

      {/* --- LEFT NODES (Bus, Metro, Microbus -> Center Hub) --- */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={compact ? -35 : -50}
        endYOffset={-6}
        gradientStartColor="#3b82f6"
        gradientStopColor="#6366f1"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        gradientStartColor="#06b6d4"
        gradientStopColor="#3b82f6"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={compact ? 35 : 50}
        endYOffset={6}
        gradientStartColor="#10b981"
        gradientStopColor="#06b6d4"
      />

      {/* --- RIGHT NODES (Monorail, Train, LRT -> Center Hub) --- */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={compact ? -35 : -50}
        endYOffset={-6}
        gradientStartColor="#f59e0b"
        gradientStopColor="#6366f1"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        gradientStartColor="#f97316"
        gradientStopColor="#ec4899"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={compact ? 35 : 50}
        endYOffset={6}
        gradientStartColor="#8b5cf6"
        gradientStopColor="#6366f1"
      />
    </div>
  );
}

export { AnimatedBeamDemo as Component };
export default AnimatedBeamDemo;

/* -------------------------------------------------------------------------- */
/*                                    ICONS                                   */
/* -------------------------------------------------------------------------- */

const Icons = {
  metro: () => (
    <Image
      src={ASSETS.transit.metro}
      alt="مترو الأنفاق"
      width={50}
      height={50}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ),
  bus: () => (
    <Image
      src={ASSETS.locations.governorates.egypt}
      alt="مصر"
      width={50}
      height={50}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ),
  monorail: () => (
    <Image
      src={ASSETS.transit.monorailEast}
      alt="مونوريل"
      width={50}
      height={50}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ),
  train: () => (
    <Image
      src={ASSETS.transit.train}
      alt="قطار"
      width={50}
      height={50}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ),
  microbus: () => (
    <Image
      src={ASSETS.locations.cities.cairo}
      alt="القاهرة"
      width={50}
      height={50}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ),
  lrt: () => (
    <Image
      src={ASSETS.transit.lrt}
      alt="القطار الكهربائي الخفيف"
      width={50}
      height={50}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ),
  center: () => (
    <Image
      src={ASSETS.branding.qareebNoBGLight}
      alt="قريب"
      width={50}
      height={50}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ),
};