"use client";

import React, { RefObject, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./PageHero.module.css";
import { useGSAP, gsap } from "@/lib/gsap";

export interface HeroStatItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export interface PageHeroIconConfig {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export interface PageHeroProps {
  headerRef?: RefObject<HTMLDivElement | null>;
  title: React.ReactNode;
  icon?: PageHeroIconConfig | React.ReactNode;
  subtitle?: React.ReactNode;
  pillBadge?: { text: string; showDot?: boolean } | React.ReactNode;
  stats?: HeroStatItem[];
  statsType?: "tab" | "badge";
  backHref?: string;
  backAriaLabel?: string;
  showAmbientGlow?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHero({
  headerRef,
  title,
  icon,
  subtitle,
  pillBadge,
  stats,
  statsType = "tab",
  backHref,
  backAriaLabel = "الرجوع للرئيسية",
  showAmbientGlow = false,
  children,
  className,
}: PageHeroProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = headerRef || localRef;

  // GSAP Choreographed Hero Entrance Animation
  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Animate ambient glow if present
      const glow = el.querySelector(`.${styles.ambientGlow}`);
      if (glow) {
        tl.fromTo(
          glow,
          { autoAlpha: 0, scale: 0.8 },
          { autoAlpha: 1, scale: 1, duration: 0.8 },
          0
        );
      }

      // Back button
      const backBtn = el.querySelector(`.${styles.backBtnCircle}`);
      if (backBtn) {
        tl.fromTo(
          backBtn,
          { autoAlpha: 0, x: 15 },
          { autoAlpha: 1, x: 0, duration: 0.4 },
          0.05
        );
      }

      // Pill badge
      const pill = el.querySelector(`.${styles.livePill}`);
      if (pill) {
        tl.fromTo(
          pill,
          { autoAlpha: 0, y: -12, scale: 0.95 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45 },
          0.08
        );
      }

      // Hero Title and Icon
      const heroTitle = el.querySelector(`.${styles.heroTitle}`);
      if (heroTitle) {
        tl.fromTo(
          heroTitle,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          0.12
        );
      }

      // Hero Subtitle
      const heroSub = el.querySelector(`.${styles.heroSubtitle}`);
      if (heroSub) {
        tl.fromTo(
          heroSub,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          0.2
        );
      }

      // Stats row badges
      const statBadges = el.querySelectorAll(
        `.${styles.statBadge}, .${styles.tabBadge}`
      );
      if (statBadges.length > 0) {
        tl.fromTo(
          statBadges,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.45 },
          0.28
        );
      }

      // Extra content / inputs
      const extra = el.querySelector(`.${styles.extraContent}`);
      if (extra) {
        tl.fromTo(
          extra,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          0.32
        );
      }
    },
    { scope: containerRef }
  );

  // Render icon helper
  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return <span className={styles.heroIcon}>{icon}</span>;
    }

    if (typeof icon === "object" && "src" in icon) {
      const iconConfig = icon as PageHeroIconConfig;
      return (
        <span className={styles.heroIcon}>
          <Image
            src={iconConfig.src}
            alt={iconConfig.alt || "Page Icon"}
            width={iconConfig.width || 48}
            height={iconConfig.height || 42}
            priority={iconConfig.priority ?? true}
            className={iconConfig.className}
          />
        </span>
      );
    }

    return null;
  };

  // Render top pill/badge helper
  const renderPillBadge = () => {
    if (!pillBadge) return null;

    if (React.isValidElement(pillBadge)) {
      return pillBadge;
    }

    if (typeof pillBadge === "object" && "text" in pillBadge) {
      return (
        <div className={styles.livePill}>
          {pillBadge.showDot !== false && <span className={styles.liveDot} />}
          <span>{pillBadge.text}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.heroSection} ${className || ""}`.trim()}
    >
      {showAmbientGlow && <div className={styles.ambientGlow} />}

      {backHref && (
        <Link
          href={backHref}
          className={styles.backBtnCircle}
          aria-label={backAriaLabel}
        >
          <i
            className="bx bx-right-arrow-alt"
            style={{ fontSize: "1.4rem" }}
          />
        </Link>
      )}

      {renderPillBadge()}

      <h1 className={styles.heroTitle}>
        {renderIcon()}
        {typeof title === "string" ? (
          <span className={styles.heroTitleGradient}>{title}</span>
        ) : (
          title
        )}
      </h1>

      {subtitle && (
        <p className={styles.heroSubtitle}>
          {subtitle}
        </p>
      )}

      {stats && stats.length > 0 && (
        <div className={styles.heroStatsRow}>
          {stats.map((stat, idx) => {
            const badgeClass =
              statsType === "badge"
                ? `${styles.statBadge} ${
                    stat.highlight ? styles.statBadgeHighlight : ""
                  }`
                : styles.tabBadge;

            return (
              <div key={idx} className={badgeClass}>
                {stat.icon && <span>{stat.icon}</span>}
                <span>{stat.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {children && <div className={styles.extraContent}>{children}</div>}
    </div>
  );
}
