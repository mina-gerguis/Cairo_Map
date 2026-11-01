"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassRevealQareeb } from "@/components/ui/glass-icon-reveal";
import { QareebLogoEffect } from "@/components/ui/qareeb-logo-effect";
import { usePreloader } from "@/context/PreloaderContext";
import styles from "./SitePreloader.module.css";

export interface SitePreloaderProps {
  /**
   * Animation speed multiplier (1 = ~3s reveal, 1.2 = ~2.5s)
   */
  speed?: number;
  /**
   * Logo tile size in pixels (default 240 for sleek glass presence)
   */
  size?: number;
  /**
   * Style of reveal:
   * "glass" -> WebGL2 chromatic dispersion liquid glass reveal
   * "draw"  -> SVG stroke calligraphy drawing effect
   */
  variant?: "glass" | "draw";
  /**
   * Color scheme: "auto" (detects current site theme), "dark", or "light"
   */
  theme?: "auto" | "dark" | "light";
  /**
   * Whether to loop the animation continuously until page load finishes
   */
  loop?: boolean;
}

export const SitePreloader: React.FC<SitePreloaderProps> = ({
  speed = 1.05,
  size = 240,
  variant = "glass",
  theme = "auto",
  loop = false,
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");

  const animationFinishedRef = useRef<boolean>(false);
  const pageLoadedRef = useRef<boolean>(false);

  // 1. Theme resolution
  useEffect(() => {
    if (theme !== "auto") {
      setCurrentTheme(theme);
      return;
    }

    const resolveTheme = () => {
      const isLight =
        document.documentElement.classList.contains("light") ||
        localStorage.getItem("dftry_theme") === "light";
      setCurrentTheme(isLight ? "light" : "dark");
    };

    resolveTheme();
    window.addEventListener("themechange", resolveTheme);
    return () => window.removeEventListener("themechange", resolveTheme);
  }, [theme]);

  // 2. Page readiness & scroll locking
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onPageReady = () => {
      pageLoadedRef.current = true;
      checkAndDismiss();
    };

    if (document.readyState === "complete") {
      pageLoadedRef.current = true;
    } else {
      window.addEventListener("load", onPageReady);
    }

    // Safety fallback timer: dismiss at most after 4s on slow networks
    const fallbackTimer = setTimeout(() => {
      pageLoadedRef.current = true;
      animationFinishedRef.current = true;
      triggerDismiss();
    }, 4000);

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

  const { markSiteReady } = usePreloader();

  const triggerDismiss = () => {
    setIsFadingOut(true);
    document.body.style.overflow = "";

    // 1. Unfreeze page animations and trigger global site ready event
    markSiteReady();

    // Allow CSS transition (650ms) to finish before unmounting from DOM
    setTimeout(() => {
      setIsMounted(false);
    }, 650);
  };

  const handleAnimationComplete = () => {
    animationFinishedRef.current = true;
    // Brief pause to admire the unveiled clear mark
    setTimeout(() => {
      checkAndDismiss();
    }, 180);
  };

  if (!isMounted) return null;

  const isLight = currentTheme === "light";

  return (
    <div
      className={`${styles.preloaderOverlay} ${
        isLight ? styles.preloaderLight : styles.preloaderDark
      } ${isFadingOut ? styles.preloaderOverlayFading : ""}`}
      aria-hidden={isFadingOut}
      role="progressbar"
      aria-label="جاري تحميل الموقع"
    >
      {/* Background Ambient Glow Accents */}
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />
      <div className={styles.ambientOrb3} />

      {/* Center Stage */}
      <div className={styles.contentStage}>
        {/* Animated Brand Logo Stage */}
        <div className={styles.glassStageWrapper}>
          {variant === "glass" ? (
            <div
              className={styles.glassCanvasWrapper}
              style={{ width: size, height: size }}
            >
              <GlassRevealQareeb
                look={isLight ? "light" : "dark"}
                tileSize={size}
                speed={speed}
                loop={loop}
                background="transparent"
                plateColor={isLight ? "#f1f5f905" : "#080e1e0c"}
                logoColor={isLight ? "#1d4ed8" : "#38bdf8"}
                onComplete={handleAnimationComplete}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div style={{ width: size, height: size }}>
              <QareebLogoEffect
                speed={speed}
                size={Math.round(size * 0.75)}
                theme={isLight ? "light" : "dark"}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>
          )}
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
