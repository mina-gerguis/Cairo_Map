import React, { RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./PageHero.module.css";

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
      ref={headerRef}
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
