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

  const handleRouteClick = (from: string, to: string) => {
    onSelectRoute(from, to);

    setTimeout(() => {
      const targetEl = document.getElementById("directions-results-section");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderHeader}>
        <h2 className={styles.sliderTitle}>
          <i className="bx bx-trending-up" style={{ color: "#f59e0b" }} />
          <span>أشهر المسارات والرحلات</span>
        </h2>
      </div>

      <div className={styles.sliderTrack}>
        {routes.map((item, idx) => {
          const glow = item.glowColor || "#3b82f6";

          return (
            <button
              key={`${item.from}-${item.to}-${idx}`}
              type="button"
              onClick={() => handleRouteClick(item.from, item.to)}
              className={styles.bentoCard}
              style={{
                background: `radial-gradient(135px circle at top right, ${glow}28 0%, ${glow}0a 45%, transparent 75%), var(--bg-glass)`,
              }}
              aria-label={`اختيار مسار ${item.label}`}
            >
              <div className={styles.bentoCardTop}>
                <div className={styles.bentoIconBox}>
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.label}
                      style={{ width: "22px", height: "22px", objectFit: "contain" }}
                      loading="lazy"
                    />
                  ) : (
                    <i
                      className="fa-solid fa-route"
                      style={{ color: glow, fontSize: "1rem" }}
                    />
                  )}
                </div>

                <span className={styles.bentoPill}>
                  {idx === 0 ? "🔥 الأكثر طلباً" : "مسار مباشر"}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>
                  {item.label}
                </div>
                <div className={styles.bentoCardSubtitle}>
                  من {item.from} إلى {item.to}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
