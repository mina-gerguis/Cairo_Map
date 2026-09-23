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
  const handleLineClick = (lineId: any) => {
    onSelectLine(lineId);

    setTimeout(() => {
      const targetEl = document.getElementById("metro-line-explorer-panel");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

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

          const isUnderConstruction = lineStatsCount === 0 || line.id === "line4" || line.id === "line5" || line.id === "line6";

          return (
            <button
              key={line.id}
              type="button"
              onClick={() => handleLineClick(line.id)}
              className={`${styles.bentoCard} ${active ? styles.bentoCardActive : ""}`}
            >
              <div className={styles.bentoCardTop}>
                <span className={styles.bentoPill}>
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: line.color,
                      display: "inline-block",
                    }}
                  />
                  {line.shortName}
                </span>

                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: isUnderConstruction ? "#ef4444" : "#10b981",
                  }}
                >
                  {isUnderConstruction ? "تحت الإنشاء" : "يعمل الآن"}
                </span>
              </div>

              <div>
                <div className={styles.bentoCardTitle}>{line.name}</div>
                <div className={styles.bentoCardSubtitle}>
                  {lineStatsCount > 0 ? `${lineStatsCount} محطة` : "المرحلة الأولى قيد التنفيذ"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
