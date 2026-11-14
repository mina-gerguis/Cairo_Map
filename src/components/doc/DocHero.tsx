"use client";

import React from "react";
import { motion } from "motion/react";
import styles from "./DocHero.module.css";

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
    style={{ color: "#000000", stroke: "#000000" }}
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
    style={{ color: "#000000", stroke: "#000000" }}
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
}

export const DocHero: React.FC<DocHeroProps> = ({
  variant = "doc",
  title1,
  title2,
  title3,
  counts = { total: 42, updates: 18, features: 15, roadmap: 9, inProgress: 4 },
  onSearchClick,
  onFilterClick,
}) => {
  const isOriginal = variant === "original";

  const t1 = title1 || (isOriginal ? "#سجل" : "#سجل");
  const t2 = title2 || (isOriginal ? "توثيقات" : "وتوثيقات");
  const t3 = title3 || (isOriginal ? "#تحديثات" : "#تحديثات");

  const scrollToExplorer = () => {
    const el = document.getElementById("docs-explorer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`${styles.heroContainer} min-h-screen bg-[#0038FF] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-hidden w-full`}>
      {/* Background Blueprint Grid */}
      <div className={`${styles.backgroundGrid} absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0`} />

      {/* Top Navbar */}
      <nav className={styles.navBar}>
        {/* Logo Badge */}
        <div className={`${styles.logoWrapper} flex items-center gap-1 cursor-pointer`} onClick={scrollToExplorer}>
          <div className={`${styles.logoBoxPrimary} font-display`}>
            {isOriginal ? "قريب" : "قريب"}
            <div
              className={`${styles.logoCornerFold} absolute -bottom-1.5 left-0 w-3 h-3 bg-white`}
              style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
            />
          </div>
          <div className={`${styles.logoBoxSecondary} font-display`}>
            {isOriginal ? "سجلات" : "سجلات"}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className={`${styles.navLinks} hidden md:flex items-center space-x-2`}>
          {isOriginal ? (
            ["About Club", "My stats", "Tokenomic", "Airdrop"].map((item) => (
              <a
                key={item}
                href="#docs-explorer"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToExplorer();
                }}
                className={`${styles.navLinkBtn} px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors`}
              >
                {item}
              </a>
            ))
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onFilterClick?.("all");
                  scrollToExplorer();
                }}
                className={styles.navLinkBtn}
              >
                جميع التوثيقات ({counts.total})
              </button>
              <button
                type="button"
                onClick={() => {
                  onFilterClick?.("update");
                  scrollToExplorer();
                }}
                className={styles.navLinkBtn}
              >
                سجل التحديثات ({counts.updates})
              </button>
              <button
                type="button"
                onClick={() => {
                  onFilterClick?.("feature");
                  scrollToExplorer();
                }}
                className={styles.navLinkBtn}
              >
                المميزات ({counts.features})
              </button>
              <button
                type="button"
                onClick={() => {
                  onFilterClick?.("roadmap");
                  scrollToExplorer();
                }}
                className={styles.navLinkBtn}
              >
                خريطة الطريق ({counts.roadmap || counts.inProgress})
              </button>
            </>
          )}
        </div>

        {/* Action Button (Search / Connect) */}
        <button
          type="button"
          onClick={onSearchClick || scrollToExplorer}
          className={styles.actionBtn}
        >
          {isOriginal ? "" : "بحث في التوثيق"}
        </button>
      </nav>

      {/* Hero Center Section */}
      <main className={styles.heroMain}>
        {/* Massive Typography & Elements Container */}
        <div className={styles.heroStackContainer}>
          {/* Text Stack */}
          <div className={`${styles.textStack} w-full flex flex-col items-center relative z-10 space-y-2 md:space-y-4`}>
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
          <div className={`${styles.overlaysLayer} absolute inset-0 w-full h-full pointer-events-none`}>
            {/* Decorative Arrow Left */}
            <div className={`${styles.arrowLeftWrapper} absolute bottom-[0%] left-[0%] md:left-[10%] w-24 h-24 md:w-32 md:h-32 z-20`}>
              <ArrowGreenLeft />
            </div>

            {/* Decorative Arrow Right */}
            <div className={`${styles.arrowRightWrapper} absolute top-[5%] right-[0%] md:right-[10%] w-24 h-24 md:w-32 md:h-32 z-20`}>
              <ArrowGreenRight />
            </div>

            {/* Circular Badge */}
            <div className={`${styles.circularBadgeWrapper} absolute bottom-[-10%] right-[0%] md:right-[15%] z-40 pointer-events-auto`}>
              <CircularBadge
                onClick={scrollToExplorer}
                text={isOriginal ? "GET STARTED FOR FREE • GET STARTED FOR FREE • " : "EXPLORE DOCS • QAREEB CHANGELOG • "}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Features Section */}
      <section className={`${styles.featuresSection} bg-white text-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] mt-auto w-full`}>
        <div className={`${styles.featuresGrid} max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8`}>
          {/* Card 1: Updates / Subscribe */}
          <div
            className={`${styles.featureCard} bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100 cursor-pointer`}
            onClick={() => {
              onFilterClick?.("update");
              scrollToExplorer();
            }}
          >
            <h3 className={`${styles.featureCardTitle} text-xl md:text-2xl uppercase leading-tight mb-2 font-black`}>
               سجل التحديثات
            </h3>
            <p className={`${styles.featureCardSubtitle} text-[10px] md:text-xs text-black/60 font-bold mb-auto`}>
              {isOriginal
                ? "you will receive $CLUB every second"
                : `توثيق دوري لجميع التغييرات والتحسينات (${counts.updates} إصدار)`}
            </p>

            {/* Pill Graphic */}
            <div className={`${styles.pillGraphicWrapper} relative w-full flex justify-center mt-6`}>
              <div className={`${styles.bluePillBox} flex items-center bg-[#0038FF] rounded-2xl p-2 pr-16 text-white shadow-lg relative z-10`}>
                <div className={`${styles.pillAvatar} w-8 h-8 bg-[#D2B48C] rounded-full mr-3 border border-white/30 overflow-hidden flex-shrink-0`}>
                  <img
                    src="https://cdn.21st.dev/assets/mirror/a9/a9ba4bfede6313e1469d3a9f805603867503389824f1daedfd5ed293c3a8156c.svg"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`${styles.pillTexts} text-left`}>
                  <p className={`${styles.pillUsername} text-[10px] font-bold leading-none`}>
                    {isOriginal ? "baseclub.eth" : "changelog.v2"}
                  </p>
                  <p className={`${styles.pillPoints} text-[8px] text-white/70 leading-none mt-1`}>
                    {isOriginal ? "23 422 points" : "100% موثق"}
                  </p>
                </div>
              </div>
              <div className={`${styles.floatingTagLime} absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#CCFF00] text-black font-black text-[10px] px-3 py-2 rounded-xl z-20 shadow-md`}>
                {isOriginal ? "20.24 $CLUB" : "v2.4.0 LIVE"}
              </div>
            </div>

            {/* Arrow pointing to next card */}
            <div className={`${styles.featureArrowRight} hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30`}>
              <ArrowBlack1 />
            </div>
          </div>

          {/* Card 2: Features / Rewards */}
          <div
            className={`${styles.featureCard} bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100 cursor-pointer`}
            onClick={() => {
              onFilterClick?.("feature");
              scrollToExplorer();
            }}
          >
            <h3 className={`${styles.featureCardTitle} text-xl md:text-2xl uppercase leading-tight mb-2 font-black`}>
              المميزات الجديدة
            </h3>
            <p className={`${styles.featureCardSubtitle} text-[10px] md:text-xs text-black/60 font-bold mb-auto`}>
              {isOriginal
                ? "each account has a different of $CLUB"
                : `أدوات وميزات ذكية للنقل والخرائط (${counts.features} ميزة)`}
            </p>

            {/* Pill Graphic */}
            <div className={`${styles.pillGraphicWrapper} relative w-full flex justify-center mt-6`}>
              <div className={`${styles.dualPillBox} flex items-center bg-[#0038FF] rounded-full p-1.5 text-white shadow-lg`}>
                <div className={`${styles.pillInnerWhiteBadge} bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-full mr-2`}>
                  {isOriginal ? "20.4220" : `${counts.features}+`}
                </div>
                <div className={`${styles.pillInnerLabel} font-bold text-xs px-4`}>
                  {isOriginal ? "$CLUB" : "FEATURES"}
                </div>
              </div>

              {/* Small floating green pill */}
              <div className={`${styles.smallFloatingIconPill} absolute -bottom-6 right-1/3 bg-[#CCFF00] rounded-full p-2.5 shadow-lg transform rotate-12 z-20`}>
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
            <div className={`${styles.featureArrowRight} hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30`}>
              <ArrowBlack2 />
            </div>
          </div>

          {/* Card 3: Roadmap / Staking */}
          <div
            className={`${styles.featureCard} bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col items-center text-center relative h-64 border border-gray-100 cursor-pointer`}
            onClick={() => {
              onFilterClick?.("roadmap");
              scrollToExplorer();
            }}
          >
            <h3 className={`${styles.featureCardTitle} text-xl md:text-2xl uppercase leading-tight mb-2 font-black`}>
               خريطة التطوير
            </h3>
            <p className={`${styles.featureCardSubtitle} text-[10px] md:text-xs text-black/60 font-bold mb-auto`}>
              {isOriginal
                ? "you will receive $CLUB every month"
                : `المشاريع والخدمات قيد الإعداد والتنفيذ (${counts.inProgress} جارية)`}
            </p>

            {/* Speech bubble graphic */}
            <div className={`${styles.speechBubbleGraphic} flex flex-col items-center bg-[#CCFF00] rounded-[2rem] px-6 py-4 text-black shadow-lg mt-6 relative w-full max-w-[200px]`}>
              <p className={`${styles.bubbleSmallLabel} text-[9px] font-bold uppercase tracking-wider mb-1`}>
                {isOriginal ? "EST. Monthly $CLUB" : "ACTIVE ROADMAP"}
              </p>
              <p className={`${styles.bubbleBigNumber} text-xl font-black`}>
                {isOriginal ? "188.34257" : `${counts.inProgress} IN PROGRESS`}
              </p>
              {/* Speech bubble tail */}
              <div className={`${styles.bubbleTail} absolute -bottom-2 left-8 w-5 h-5 bg-[#CCFF00] transform rotate-45`} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocHero;
