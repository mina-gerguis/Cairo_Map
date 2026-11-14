"use client";

import React from "react";
import { Search, Menu } from "lucide-react";
import styles from "../doc.module.css";
import { ASSETS } from "@/constants/assets";

// --- Custom SVG Components for Hand-Drawn Accents ---

export const ArrowGreenLeft = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-[#CCFF00] stroke-current overflow-visible"
    style={{ color: "#CCFF00", stroke: "#CCFF00" }}
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

export const ArrowGreenRight = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-[#CCFF00] stroke-current overflow-visible"
    style={{ color: "#CCFF00", stroke: "#CCFF00" }}
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

export const ArrowBlack1 = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-black stroke-current overflow-visible"
    style={{ color: "var(--color-fg)", stroke: "var(--color-fg)" }}
    fill="none"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

export const ArrowBlack2 = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-black stroke-current overflow-visible"
    style={{ color: "var(--color-fg)", stroke: "var(--color-fg)" }}
    fill="none"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

export interface CircularBadgeProps {
  onClick?: () => void;
  text?: string;
}

export const CircularBadge: React.FC<CircularBadgeProps> = ({
  onClick,
  text = "EXPLORE DOCS • QAREEB CHANGELOG • ",
}) => (
  <div
    onClick={onClick}
    className={`${styles.badgeCircle} relative w-28 h-28 md:w-36 md:h-36 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer border-[3px] border-black/5`}
    role="button"
    tabIndex={0}
    aria-label="استكشف التوثيق"
  >
    <div className={`${styles.badgeRotatingSvg} absolute inset-1 animate-[spin_10s_linear_infinite]`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          id="docCirclePath"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text
          className="text-[11px] font-black tracking-[0.18em] uppercase"
          fill="black"
          style={{ fontWeight: 900, letterSpacing: "0.18em" }}
        >
          <textPath href="#docCirclePath" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
    <div className={`${styles.badgeCenterArrow} absolute inset-0 flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-10 h-10 text-black stroke-current overflow-visible"
        style={{ color: "#000000", stroke: "#000000" }}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);

export interface DocHeroCounts {
  total: number;
  updates: number;
  features: number;
  roadmap: number;
  inProgress: number;
}

export interface DocHeroProps {
  /** Optional variant: 'doc' (customized for Qareeb Docs) or 'original' */
  variant?: "doc" | "original";
  title1?: string;
  title2?: string;
  title3?: string;
  counts?: DocHeroCounts;
  onSearchClick?: () => void;
  onFilterClick?: (type: "all" | "update" | "feature" | "roadmap") => void;
  isAdmin?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  onToggleMobileSidebar?: () => void;
}

export const DocHero: React.FC<DocHeroProps> = ({
  variant = "doc",
  title1,
  title2,
  title3,
  counts = { total: 42, updates: 18, features: 15, roadmap: 9, inProgress: 4 },
  onSearchClick,
  onFilterClick,
  isAdmin = false,
  onRefresh,
  loading = false,
  onToggleMobileSidebar,
}) => {
  const isOriginal = variant === "original";

  const t1 = "#سجلات";
  const t2 = "وتوثيقات";
  const t3 = "#قريــب";

  const scrollToExplorer = () => {
    const el = document.getElementById("docs-explorer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={styles.heroContainer}>
      {/* Background Blueprint Grid */}
      <div className={styles.backgroundGrid} />

      {/* Top Navbar */}
      <nav className={styles.navBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          {/* Logo Badge */}
          <div className={`${styles.logoWrapper}`} onClick={scrollToExplorer}>
            <div className={`${styles.logoBoxPrimary} font-display`}>
              سجلات
              <div
                className={styles.logoCornerFold}
              />
            </div>
            <div className={`${styles.logoBoxSecondary} font-display`}>
              قريــب
            </div>
          </div>
        </div>

        {/* Quick Search Trigger & Header Action Buttons */}
        <div className={styles.navActions}>
          {/* Search Docs Button (⌘K) */}
          <button
            type="button"
            onClick={onSearchClick || scrollToExplorer}
            className={`${styles.searchTriggerBtn} search-input`}
            title="بحث سريع"
          >
            <div className={styles.searchTriggerInner}>
              <span className={styles.searchTriggerText}>بحث في التوثيق</span>
              <Search size={16} />
            </div>
          </button>

          {/* Admin Link if Admin */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className={styles.mobileMenuToggle}
              aria-label="فتح قائمة التوثيق"
              title="فتح قائمة التوثيق"
            >
              <Menu size={18} />
            </button>
          )}
        </div>
      </nav>

      {/* Hero Center Section */}
      <main className={styles.heroMain}>
        {/* Massive Typography & Elements Container */}
        <div className={styles.heroStackContainer}>
          {/* Text Stack */}
          <div className={`${styles.textStack}`}>
            {/* Top Word (#DOCS / #CLUB) */}
            <div>
              <h1
                className={`${styles.massiveTitle} ${styles.limeText}`}
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow:
                    "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99",
                }}
              >
                {t1}
              </h1>
            </div>

            {/* Middle Word (CHANGELOG / SOCIALFI) */}
            <div>
              <h1
                className={`${styles.massiveTitle} ${styles.whiteText} text-[clamp(5rem,15vw,220px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase`}
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow:
                    "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99",
                }}
              >
                {t2}
              </h1>
            </div>

            {/* Bottom Word (ROADMAP / PEOPLE) */}
            <div className={styles.titleLineRight}>
              <h1
                className={`${styles.massiveTitle} ${styles.whiteText} text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase`}
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow:
                    "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99",
                }}
              >
                {t3}
              </h1>
            </div>
          </div>

          {/* Absolute Overlays (Cards, Arrows, Badge) */}
          <div className={`${styles.overlaysLayer}`}>
            {/* Decorative Arrow Left */}
            <div className={`${styles.arrowLeftWrapper} `}>
              <ArrowGreenLeft />
            </div>

            {/* Decorative Arrow Right */}
            <div className={`${styles.arrowRightWrapper} `}>
              <ArrowGreenRight />
            </div>

            {/* Circular Badge */}
            <div className={`${styles.circularBadgeWrapper} `}>
              <CircularBadge
                onClick={scrollToExplorer}
                text="EXPLORE DOCS • QAREEB CHANGELOG • "
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Features Section */}
      <section className={`${styles.featuresSection} `}>
        <div className={`${styles.featuresGrid} `}>
          {/* Card 1: Updates / Subscribe */}
          <div
            className={`${styles.featureCard} `}
            onClick={() => {
              onFilterClick?.("update");
              scrollToExplorer();
            }}
          >
            <h3 className={`${styles.featureCardTitle}`}>
              سجل التحديثات
            </h3>
            <p className={`${styles.featureCardSubtitle} `}>
              توثيق شامل ودوري لجميع التغييرات والتحسينات ({counts.updates} إصدار)
            </p>

            {/* Pill Graphic */}
            <div className={`${styles.pillGraphicWrapper} `}>
              <div className={`${styles.bluePillBox} `}>
                <div className={`${styles.pillAvatar}`}>
                  <img
                    src={ASSETS.memoji.memoji4}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`${styles.pillTexts}`}>
                  <p className={`font-display fw-600 fs-xs `}>
                    تحديثات مستمرة
                  </p>
                </div>
              </div>
              <div className={`${styles.floatingTagLime} font-display`}>
                مستقر
              </div>
            </div>

            {/* Arrow pointing to next card */}
            <div className={styles.featureArrowRight}>
              <ArrowBlack1 />
            </div>
          </div>

          {/* Card 2: Features / Rewards */}
          <div
            className={`${styles.featureCard}`}
            onClick={() => {
              onFilterClick?.("feature");
              scrollToExplorer();
            }}
          >
            <h3 className={`${styles.featureCardTitle}`}>
              المميزات الجديدة
            </h3>
            <p className={`${styles.featureCardSubtitle}`}>
              أدوات وميزات جديدة وذكية لتسهيل التنقل والوصول ({counts.features} ميزة)
            </p>

            {/* Pill Graphic */}
            <div className={`${styles.pillGraphicWrapper}`}>
              <div className={`${styles.dualPillBox}`}>
                <div className={`${styles.pillInnerWhiteBadge}`}>
                  {counts.features}+
                </div>
                <div className={`${styles.pillInnerLabel} font-display fs-xl`}>
                  مميزات
                </div>
              </div>

              {/* Small floating green pill */}
              <div className={`${styles.smallFloatingIconPill}`}>
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-black stroke-current"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Arrow pointing to next card */}
            <div className={`${styles.featureArrowRight}`}>
              <ArrowBlack2 />
            </div>
          </div>

          {/* Card 3: Roadmap / Staking */}
          <div
            className={`${styles.featureCard}`}
            onClick={() => {
              onFilterClick?.("roadmap");
              scrollToExplorer();
            }}
          >
            <h3 className={`${styles.featureCardTitle}`}>
              خريطة التطوير
            </h3>
            <p className={`${styles.featureCardSubtitle}`}>
              المشاريع والخدمات الجديدة قيد الإعداد والتنفيذ {counts.inProgress} جارية

            </p>

            {/* Speech bubble graphic */}
            <div className={`${styles.speechBubbleGraphic}`}>
              <p className={`${styles.bubbleSmallLabel} font-display`}>
                قيد التنفيذ والتطوير
              </p>
              <p className={`${styles.bubbleBigNumber} font-display gap-1`}>
                <span>{counts.inProgress}</span>
                <span>
                  عملية تطوير جارية
                </span>
              </p>
              {/* Speech bubble tail */}
              <div className={`${styles.bubbleTail}`} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocHero;
