import React from "react";
import { MonorailLinesSliderProps } from "../types";
import styles from "../monorail.module.css";

export default function MonorailLinesSlider({
  sliderRef,
  lines,
  selectedLine,
  onSelectLine,
  stations,
}: MonorailLinesSliderProps) {
  return (
    <div className={styles.sliderSection}>
      <div ref={sliderRef} className={styles.sliderTrack}>
        {lines.map((line) => {
          const active = selectedLine === line.id;
          const lineStatsCount = stations.filter((s) => s.line_type === line.id).length;
          const lineIcon = line.id === "east" ? "🏛️" : "🏭";

          return (
            <div
              key={line.id}
              onClick={() => onSelectLine(line.id)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={
                {
                  "--line-color": line.color,
                  "--line-glow": `${line.color}40`,
                  "--line-bg": `${line.color}12`,
                } as React.CSSProperties
              }
            >
              <div className={styles.bentoCardTop}>
                <div className={styles.bentoIconBox}>
                  <span>{lineIcon}</span>
                </div>
                <div className={styles.bentoPill}>
                  <i className="fa-solid fa-route" style={{ fontSize: "0.7rem", color: line.color }} />
                  <span>{line.length}</span>
                </div>
              </div>

              <div>
                <h3 className={styles.bentoCardTitle}>{line.name}</h3>
                <p className={styles.bentoCardSubtitle}>
                  {lineStatsCount > 0 ? `${lineStatsCount} محطة` : "تحت الإنشاء"} • {line.time} تقريباً
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
