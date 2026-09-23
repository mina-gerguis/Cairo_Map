import React, { RefObject } from "react";
import { RailwayRoute } from "../types";
import { getRouteColor, getRouteShortName, getRouteIconData } from "../utils";
import styles from "../railways.module.css";

interface RailwaysSliderProps {
  sliderRef: RefObject<HTMLDivElement | null>;
  routes: RailwayRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export default function RailwaysSlider({
  sliderRef,
  routes,
  selectedRouteId,
  onSelectRoute,
}: RailwaysSliderProps) {
  const handleCardClick = (routeId: string) => {
    onSelectRoute(routeId);

    setTimeout(() => {
      const detailsEl = document.getElementById("railway-route-details");
      if (detailsEl) {
        detailsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderTrack}>
        {routes.map((route, idx) => {
          const active = selectedRouteId === route.id;
          const routeColor = getRouteColor(route.id, idx);
          const shortName = getRouteShortName(route);
          const iconData = getRouteIconData(route.id, idx, routeColor);
          const stopsCount = route.stops ? route.stops.length : 0;

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => handleCardClick(route.id)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={{
                "--card-color": routeColor,
                "--card-glow": iconData.glowColor,
                background: active
                  ? `radial-gradient(circle at 100% 0%, ${iconData.glowColor}25 0%, transparent 70%), var(--bg-glass)`
                  : undefined,
              } as React.CSSProperties}
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill}>
                  <i className="fa-solid fa-train" style={{ fontSize: "0.68rem" }} />
                  <span>{stopsCount} محطات</span>
                </span>

                <div
                  className={styles.bentoIconBox}
                  style={{ background: iconData.bgGradient }}
                >
                  <i className={iconData.icon} />
                </div>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>{shortName}</div>
                <div className={styles.bentoCardSubtitle}>
                  {route.duration}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
