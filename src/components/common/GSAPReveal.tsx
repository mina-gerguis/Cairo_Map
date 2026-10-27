"use client";

import React, { useRef } from "react";
import { useGSAP, gsap } from "@/lib/gsap";

export interface GSAPRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale";
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  threshold?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export default function GSAPReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.65,
  distance = 28,
  stagger,
  threshold = "top 88%",
  className,
  style,
  as: Component = "div",
}: GSAPRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const initialVars: gsap.TweenVars = {
        autoAlpha: 0,
      };

      if (direction === "up") initialVars.y = distance;
      else if (direction === "down") initialVars.y = -distance;
      else if (direction === "left") initialVars.x = distance;
      else if (direction === "right") initialVars.x = -distance;
      else if (direction === "scale") initialVars.scale = 0.94;

      const animateTargets =
        stagger && el.children.length > 0 ? Array.from(el.children) : el;

      gsap.fromTo(animateTargets, initialVars, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        stagger: stagger ? stagger : undefined,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: {
          trigger: el,
          start: threshold,
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <Component
      ref={containerRef as any}
      className={className}
      style={{
        ...style,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </Component>
  );
}
