import React, { RefObject } from "react";
import { QuickRouteItem } from "../types";
import styles from "../page.module.css";

interface PopularRoutesSliderProps {
  sliderRef: RefObject<HTMLDivElement | null>;
  routes: QuickRouteItem[];
  onSelectRoute: (from: string, to: string) => void;
}

export default function PopularRoutesSlider({
  sliderRef,
  routes,
  onSelectRoute,
}: PopularRoutesSliderProps) {
  if (!routes || routes.length === 0) return null;

  return (
    <div
      ref={sliderRef}
      className={`${styles.popularSlider} hide-scrollbar`}
    >
      {routes.map((item, idx) => {
        const isTop = idx === 0;

        return (
          <button
            key={`${item.from}-${item.to}-${idx}`}
            type="button"
            onClick={() => onSelectRoute(item.from, item.to)}
            className={styles.popularCard}
            style={{
              background: `radial-gradient(135px circle at top right, ${item.glowColor}33 0%, ${item.glowColor}10 45%, transparent 75%), var(--cardGlassBg, rgba(18, 18, 22, 0.72))`,
              borderColor: isTop ? `${item.glowColor}80` : undefined,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${item.glowColor}80`;
              e.currentTarget.style.boxShadow = `inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 8px 24px -2px ${item.glowColor}35, 0 4px 12px rgba(0,0,0,0.2)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isTop ? `${item.glowColor}80` : "";
              e.currentTarget.style.boxShadow = "";
            }}
            aria-label={`اختيار مسار ${item.label}`}
          >
            {/* Top Row: Icon Squircle + Optional Badge */}
            <div className={styles.popularCardTop}>
              <div
                className={styles.popularCardIconBox}
                style={{
                  boxShadow: `0 4px 12px ${item.glowColor}25`,
                  borderColor: `${item.glowColor}35`,
                }}
              >
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={styles.popularCardIcon}
                    loading="lazy"
                  />
                ) : (
                  <i
                    className={`fa-solid fa-route ${styles.popularCardFontIcon}`}
                    style={{ color: item.glowColor }}
                  />
                )}
              </div>

              {item.isTrending && (
                <span className={styles.popularCardTrendingPill}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: item.glowColor,
                      display: "inline-block",
                    }}
                  />
                  {isTop ? "الأكثر طلباً" : "شائع"}
                </span>
              )}
            </div>

            {/* Bottom Row: Title & Subtitle */}
            <div className={styles.popularCardBottom}>
              <div className={styles.popularCardTitle}>
                {item.label}
              </div>
              {item.subtitle && (
                <div className={styles.popularCardSubtitle}>
                  {item.subtitle}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

