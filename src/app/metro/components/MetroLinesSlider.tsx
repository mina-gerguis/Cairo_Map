import React from "react";
import { MetroLinesSliderProps } from "../types";
import styles from "../metro.module.css";

export default function MetroLinesSlider({
  sliderRef,
  lines,
  selectedLine,
  onSelectLine,
  stations,
}: MetroLinesSliderProps) {
  return (
    <div ref={sliderRef} className={styles.sliderSection}>
      <div className={styles.sliderTrack}>
        {lines.map((line) => {
          const active = selectedLine === line.id;
          const lineStatsCount = stations.filter((s) => {
            if (line.id === "line3") {
              return (
                s.line_type === "line3" ||
                s.line_type === "line3_branch_a" ||
                s.line_type === "line3_branch_b"
              );
            }
            return s.line_type === line.id;
          }).length;

          return (
            <button
              key={line.id}
              type="button"
              onClick={() => onSelectLine(line.id)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
              style={{
                "--card-color": line.color,
                "--card-glow": `${line.color}40`,
              } as React.CSSProperties}
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill} style={{ color: line.color }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: line.color,
                      display: "inline-block",
                    }}
                  />
                  {line.shortName}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>{line.name}</div>
                <div className={styles.bentoCardSubtitle}>
                  {lineStatsCount > 0 ? `${lineStatsCount} محطة` : "تحت الإنشاء"} • {line.from} - {line.to}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
