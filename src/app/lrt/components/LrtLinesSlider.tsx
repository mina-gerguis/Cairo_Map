import React from "react";
import { LrtExplorerTab, LrtLineTabConfig, LrtStation } from "../types";
import styles from "../lrt.module.css";

export interface LrtLinesSliderProps {
  sliderRef?: React.RefObject<HTMLDivElement | null>;
  tabs: LrtLineTabConfig[];
  selectedTab: LrtExplorerTab;
  onSelectTab: (tabId: LrtExplorerTab) => void;
  stations: LrtStation[];
}

export default function LrtLinesSlider({
  sliderRef,
  tabs,
  selectedTab,
  onSelectTab,
  stations,
}: LrtLinesSliderProps) {
  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderTrack}>
        {tabs.map((tab) => {
          const active = selectedTab === tab.id;
          const stationsCount =
            tab.id === "all"
              ? stations.length
              : stations.filter((s) => s.line_type === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={{
                "--card-color": tab.color,
                "--card-glow": `${tab.color}40`,
              } as React.CSSProperties}
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill} style={{ color: tab.color }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: tab.color,
                      display: "inline-block",
                    }}
                  />
                  {tab.label}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>{tab.title}</div>
                <div className={styles.bentoCardSubtitle}>
                  {stationsCount > 0 ? `${stationsCount} محطة` : "قيد التطوير"} • {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
