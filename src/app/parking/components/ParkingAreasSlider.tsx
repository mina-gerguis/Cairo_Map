"use client";

import React, { RefObject } from "react";
import { ParkingSpot } from "../types";
import { PARKING_PALETTE } from "../constants";
import styles from "../parking.module.css";

interface ParkingAreasSliderProps {
  sliderRef?: RefObject<HTMLDivElement | null>;
  areas: string[];
  parkingData: ParkingSpot[];
  selectedArea: string;
  onSelectArea: (area: string) => void;
}

export function ParkingAreasSlider({
  sliderRef,
  areas,
  parkingData,
  selectedArea,
  onSelectArea,
}: ParkingAreasSliderProps) {
  const handleAreaClick = (area: string) => {
    onSelectArea(area);

    setTimeout(() => {
      const targetEl = document.getElementById("parking-results-section");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  // Group count by area
  const areaCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    parkingData.forEach((p) => {
      map[p.area] = (map[p.area] || 0) + 1;
    });
    return map;
  }, [parkingData]);

  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderTrack}>
        {/* All Areas Bento Card */}
        <button
          type="button"
          onClick={() => handleAreaClick("all")}
          className={`${styles.bentoCard} ${
            selectedArea === "all" ? styles.bentoCardActive : ""
          }`}
          style={
            {
              "--card-color": "#3b82f6",
              "--card-glow": "rgba(59, 130, 246, 0.4)",
            } as React.CSSProperties
          }
        >
          <div className={styles.bentoCardTop}>
            <span className={styles.bentoPill}>
              <i className="bx bx-layer" /> الكل
            </span>
            <div className={styles.bentoIconBox}>
              <i className="bx bx-parking" style={{ color: "#3b82f6" }} />
            </div>
          </div>

          <div>
            <div className={styles.bentoCardTitle}>جميع المناطق</div>
            <div className={styles.bentoCardSubtitle}>
              {parkingData.length} جراج مسجل
            </div>
          </div>
        </button>

        {/* Individual Area Bento Cards */}
        {areas
          .filter((a) => a !== "all")
          .map((area, idx) => {
            const active = selectedArea === area;
            const palette = PARKING_PALETTE[idx % PARKING_PALETTE.length];
            const count = areaCounts[area] || 0;

            return (
              <button
                key={area}
                type="button"
                onClick={() => handleAreaClick(area)}
                className={`${styles.bentoCard} ${
                  active ? styles.bentoCardActive : ""
                }`}
                style={
                  {
                    "--card-color": palette.color,
                    "--card-glow": palette.glow,
                  } as React.CSSProperties
                }
              >
                <div className={styles.bentoCardTop}>
                  <span className={styles.bentoPill}>منطقة</span>
                  <div className={styles.bentoIconBox}>
                    <i
                      className={palette.icon || "bx bx-map-pin"}
                      style={{ color: palette.color }}
                    />
                  </div>
                </div>

                <div>
                  <div className={styles.bentoCardTitle}>{area}</div>
                  <div className={styles.bentoCardSubtitle}>
                    {count} {count === 1 ? "جراج" : "جراجات"}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default ParkingAreasSlider;
