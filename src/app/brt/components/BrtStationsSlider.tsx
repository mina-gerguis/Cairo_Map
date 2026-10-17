import React, { RefObject } from "react";
import { BrtStation } from "../types";
import { STATION_PALETTE } from "../constants";
import styles from "../brt.module.css";

interface BrtStationsSliderProps {
  sliderRef: RefObject<HTMLDivElement | null>;
  stations: BrtStation[];
  totalLinesCount: number;
  selectedStation: string;
  onSelectStation: (stationName: string) => void;
}

export default function BrtStationsSlider({
  sliderRef,
  stations,
  totalLinesCount,
  selectedStation,
  onSelectStation,
}: BrtStationsSliderProps) {
  const handleStationClick = (stationName: string) => {
    onSelectStation(stationName);

    setTimeout(() => {
      const targetId = stationName === "all" ? "stations-results-section" : `station-${stationName}`;
      const targetEl = document.getElementById(targetId) || document.getElementById("stations-results-section");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderTrack}>
        {/* All Stations Button */}
        <button
          type="button"
          onClick={() => handleStationClick("all")}
          className={`${styles.bentoCard} ${selectedStation === "all" ? styles.bentoCardActive : ""}`}
          style={{
            "--card-color": "#e11d48",
            "--card-glow": "rgba(225, 29, 72, 0.4)",
          } as React.CSSProperties}
        >
          <div className={styles.bentoCardTop}>
            <span className={styles.bentoPill}>
              <i className="bx bx-layer" /> الكل
            </span>
          </div>

          <div>
            <div className={styles.bentoCardTitle}>جميع محطات BRT</div>
            <div className={styles.bentoCardSubtitle}>
              {stations.length} محطة • {totalLinesCount} مسار
            </div>
          </div>
        </button>

        {/* Individual Station Bento Buttons */}
        {stations.map((station, idx) => {
          const active = selectedStation === station.name;
          const palette = STATION_PALETTE[idx % STATION_PALETTE.length];
          const routeCount = station.routes ? station.routes.length : 0;
          const shortName = station.name.replace(/^محطة\s+/, "").replace(/\(.*?\)/g, "").trim();

          return (
            <button
              key={station.id || station.name}
              type="button"
              onClick={() => handleStationClick(station.name)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={{
                "--card-color": palette.color,
                "--card-glow": palette.glow,
              } as React.CSSProperties}
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill}>
                  {station.sector || station.governorate}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>{shortName}</div>
                <div className={styles.bentoCardSubtitle}>
                  {routeCount} وجهات مباشرة
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
