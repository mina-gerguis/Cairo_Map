import React, { RefObject, useMemo } from "react";
import { MicrobusStation } from "../types";
import { POPULAR_DESTINATIONS } from "../constants";
import styles from "../microbus.module.css";

interface MicrobusSearchCardProps {
  searchPanelRef: RefObject<HTMLDivElement | null>;
  stations: MicrobusStation[];
  selectedStation: string;
  onStationChange: (station: string) => void;
  destinationQuery: string;
  onDestinationChange: (query: string) => void;
}

export default function MicrobusSearchCard({
  searchPanelRef,
  stations,
  selectedStation,
  onStationChange,
  destinationQuery,
  onDestinationChange,
}: MicrobusSearchCardProps) {
  // Preset destination tags based on current station or top popular destinations
  const presetTags = useMemo(() => {
    if (selectedStation && selectedStation !== "all") {
      const current = stations.find(s => s.name === selectedStation);
      if (current?.routes) {
        return Array.from(new Set(current.routes.map(r => r.destination))).slice(0, 6);
      }
    }
    return POPULAR_DESTINATIONS.slice(0, 6);
  }, [selectedStation, stations]);

  return (
    <div ref={searchPanelRef} className={styles.searchBentoCard}>
      <div className={styles.searchBentoHeader}>
        <h2 className={styles.searchTitle}>
          <i className="bx bx-search-alt" style={{ color: "var(--color-secondary" }} />
          <span>تحديد الموقف والوجهة</span>
        </h2>
      </div>

      <div className={styles.inputGroup}>
        {/* From Station Selection */}
        <div>
          <label className={styles.fieldLabel}>
            <span>هتركب من موقف إيه؟</span>
          </label>
          <select
            value={selectedStation}
            onChange={e => onStationChange(e.target.value)}
            className={styles.modernSelect}
          >
            <option value="all">جميع المواقف ({stations.length} موقف)</option>
            {stations.map(s => (
              <option key={s.id || s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Destination Search Input */}
        <div>
          <label className={styles.fieldLabel}>
            <span>عايز تروح فين؟</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="6 أكتوبر، التجمع، العبور..."
              value={destinationQuery}
              onChange={e => onDestinationChange(e.target.value)}
              className={styles.modernInput}
              style={{ paddingLeft: destinationQuery ? "42px" : "16px" }}
            />
            {destinationQuery && (
              <button
                type="button"
                onClick={() => onDestinationChange("")}
                className={styles.clearBtn}
                aria-label="مسح البحث"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Preset Chips */}
          <div className={styles.presetChipsWrapper}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: "700" }}>وجهات رائجة:</span>
            {presetTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => onDestinationChange(tag)}
                className={`${styles.chipTag} ${destinationQuery === tag ? styles.chipTagActive : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
