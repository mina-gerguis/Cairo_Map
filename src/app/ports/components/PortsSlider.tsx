import React, { RefObject } from "react";
import { PortFilter, CategoryCounts } from "../types";
import { PORT_FILTERS } from "../constants";
import styles from "../ports.module.css";

interface PortsSliderProps {
  sliderRef: RefObject<HTMLDivElement | null>;
  selectedFilter: PortFilter;
  onSelectFilter: (filter: PortFilter) => void;
  counts: CategoryCounts;
}

export default function PortsSlider({
  sliderRef,
  selectedFilter,
  onSelectFilter,
  counts,
}: PortsSliderProps) {
  const handleFilterClick = (filterId: PortFilter) => {
    onSelectFilter(filterId);

    setTimeout(() => {
      const targetEl = document.getElementById("ports-results-section");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderTrack}>
        {PORT_FILTERS.map((item) => {
          const active = selectedFilter === item.id;
          const count = counts[item.id] || 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleFilterClick(item.id)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={
                {
                  "--card-color": item.color,
                  "--card-glow": item.glow,
                } as React.CSSProperties
              }
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill}>
                  <i className={item.icon} style={{ marginLeft: "4px" }} />
                  {count} {count === 1 ? "ميناء" : "موانئ"}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>{item.label}</div>
                <div className={styles.bentoCardSubtitle}>{item.subLabel}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
