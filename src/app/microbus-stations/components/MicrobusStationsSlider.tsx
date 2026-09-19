import React, { RefObject } from "react";
import { MicrobusStation } from "../types";
import { STATION_PALETTE } from "../constants";
import styles from "../microbus.module.css";

interface MicrobusStationsSliderProps {
  sliderRef: RefObject<HTMLDivElement | null>;
  stations: MicrobusStation[];
  totalLinesCount: number;
  selectedStation: string;
  onSelectStation: (stationName: string) => void;
}

export default function MicrobusStationsSlider({
  sliderRef,
  stations,
  totalLinesCount,
  selectedStation,
  onSelectStation,
}: MicrobusStationsSliderProps) {
  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderTrack}>
        {/* All Stations Button */}
        <button
          type="button"
          onClick={() => onSelectStation("all")}
          className={`${styles.bentoCard} ${selectedStation === "all" ? styles.bentoCardActive : ""}`}
          style={{
            "--card-color": "#3b82f6",
            "--card-glow": "rgba(59, 130, 246, 0.4)",
          } as React.CSSProperties}
        >
          <div className={styles.bentoCardTop}>
            <span className={styles.bentoPill}>
              <i className="bx bx-layer" /> الكل
            </span>
          </div>

          <div>
            <div className={styles.bentoCardTitle}>جميع المواقف</div>
            <div className={styles.bentoCardSubtitle}>
              {stations.length} موقف • {totalLinesCount} خط سير
            </div>
          </div>
        </button>

        {/* Individual Station Bento Buttons */}
        {stations.map((station, idx) => {
          const active = selectedStation === station.name;
          const palette = STATION_PALETTE[idx % STATION_PALETTE.length];
          const routeCount = station.routes ? station.routes.length : 0;
          const shortName = station.name.replace(/^موقف\s+/, "").replace(/\(.*?\)/g, "").trim();

          return (
            <button
              key={station.id || station.name}
              type="button"
              onClick={() => onSelectStation(station.name)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={{
                "--card-color": palette.color,
                "--card-glow": palette.glow,
              } as React.CSSProperties}
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill}>
                  {station.governorate}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>موقف {shortName}</div>
                <div className={styles.bentoCardSubtitle}>
                  {routeCount} خطوط سير 
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
