"use client";

import React, { useState, useEffect, useRef } from "react";
import { QareebLogoEffect } from "@/components/ui/qareeb-logo-effect";
import styles from "./SitePreloader.module.css";

interface SitePreloaderProps {
  /**
   * Animation speed multiplier for the logo stroke drawing (0.8 = ~2.4s total animation)
   */
  speed?: number;
  /**
   * Logo size in pixels (default 130 for a sleek compact appearance)
   */
  size?: number;
}

export const SitePreloader: React.FC<SitePreloaderProps> = ({
  speed = 0.8,
  size = 130,
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const animationFinishedRef = useRef<boolean>(false);
  const pageLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Lock document scrolling while preloader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. Check document readiness
    const onPageReady = () => {
      pageLoadedRef.current = true;
      checkAndDismiss();
    };

    if (document.readyState === "complete") {
      pageLoadedRef.current = true;
    } else {
      window.addEventListener("load", onPageReady);
    }

    // 3. Fallback safety timer: dismiss at most after 3.8s even on slow networks
    const fallbackTimer = setTimeout(() => {
      pageLoadedRef.current = true;
      animationFinishedRef.current = true;
      triggerDismiss();
    }, 3800);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("load", onPageReady);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const checkAndDismiss = () => {
    if (pageLoadedRef.current && animationFinishedRef.current) {
      triggerDismiss();
    }
  };

  const triggerDismiss = () => {
    setIsFadingOut(true);
    document.body.style.overflow = "";

    // Allow CSS transition (650ms) to finish before unmounting from DOM
    setTimeout(() => {
      setIsMounted(false);
    }, 650);
  };

  const handleAnimationComplete = () => {
    animationFinishedRef.current = true;
    // Add small pause (200ms) to let the illuminated filled logo be admired
    setTimeout(() => {
      checkAndDismiss();
    }, 200);
  };

  if (!isMounted) return null;

  return (
    <div
      className={`${styles.preloaderOverlay} ${
        isFadingOut ? styles.preloaderOverlayFading : ""
      }`}
      aria-hidden={isFadingOut}
      role="progressbar"
      aria-label="جاري تحميل الموقع"
    >
      {/* Background Ambient Glow Accents (Matching Slide 3) */}
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />
      <div className={styles.ambientOrb3} />

      {/* Center Stage */}
      <div className={styles.contentStage}>
        {/* Animated Brand Logo Motion Graphic */}
        <div className={styles.logoWrapper}>
          <QareebLogoEffect
            speed={speed}
            size={size}
            theme="light"
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {/* Brand Name & Slogan */}
        <h1 className={styles.brandTitle}>قريب</h1>
        <p className={styles.brandDesc}>متستناش تتوه، اسأل قريب</p>

        {/* Minimalist Glowing Progress Line */}
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} />
        </div>
      </div>
    </div>
  );
};

export default SitePreloader;
