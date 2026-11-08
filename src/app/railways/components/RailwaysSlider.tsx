import React, { RefObject } from "react";
import { RailwayRoute } from "../types";
import { getRouteColor, getRouteShortName } from "../utils";
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
          const stopsCount = route.stops ? route.stops.length : 0;
          const startStation = route.stops?.[0]?.name?.replace(" (رمسيس)", "")?.replace(" (محطة رمسيس)", "") || route.from || "القاهرة";
          const endStation = route.stops?.[route.stops.length - 1]?.name?.replace(" (محطة سيدي جابر / مصر)", "") || route.to || "";

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => handleCardClick(route.id)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={{
                "--card-color": routeColor,
                "--card-glow": `${routeColor}40`,
              } as React.CSSProperties}
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill} style={{ color: routeColor }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: routeColor,
                      display: "inline-block",
                    }}
                  />
                  {shortName}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>{route.name}</div>
                <div className={styles.bentoCardSubtitle}>
                  {stopsCount > 0 ? `${stopsCount} محطة` : ""} • {startStation} - {endStation}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
