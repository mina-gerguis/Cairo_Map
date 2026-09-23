import React from "react";
import { MetroLinesSliderProps } from "../types";

export default function MetroLinesSlider({
  sliderRef,
  lines,
  selectedLine,
  onSelectLine,
  stations,
}: MetroLinesSliderProps) {
  return (
    <div
      ref={sliderRef}
      className="hide-scrollbar"
      style={{
        display: "flex",
        gap: "14px",
        overflowX: "auto",
        padding: "6px 4px 16px 4px",
        marginBottom: "20px",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        scrollSnapType: "x mandatory",
      }}
    >
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
            style={{
              background: `radial-gradient(circle at 100% 0%, ${line.color}98 20%, transparent 65%), var(--bgPrimary)`,
              border: active
                ? `2px solid ${line.color}`
                : "1px solid var(--border-secondary)",
              borderRadius: "var(--ra-8)",
              padding: "16px 16px 14px 16px",
              cursor: "pointer",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
              textAlign: "right",
              flex: "0 0 auto",
              minWidth: "175px",
              maxWidth: "200px",
              height: "85px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              scrollSnapAlign: "start",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Bottom Title & Subtitle */}
            <div
              style={{
                textAlign: "right",
                width: "100%",
                marginTop: "auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                  fontWeight: "700",
                  fontSize: "0.92rem",
                  lineHeight: "1.3",
                  letterSpacing: "-0.2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {line.shortName}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: "500",
                  marginTop: "3px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {lineStatsCount > 0 ? `${lineStatsCount} محطة` : "تحت الإنشاء"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
