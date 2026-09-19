import React from "react";
import { parseViaStops } from "../utils";
import styles from "../microbus.module.css";

interface MicrobusTimelineProps {
  stationName: string;
  via: string;
  destination: string;
  accentColor: string;
}

export default function MicrobusTimeline({
  stationName,
  via,
  destination,
  accentColor,
}: MicrobusTimelineProps) {
  const originName = stationName.split("(")[0].trim();
  const stops = [originName, ...parseViaStops(via), destination];

  return (
    <div className={styles.timelineWrapper}>
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "12px", fontWeight: "700" }}>
        <i className="bx bx-transfer" style={{ fontSize: "0.88rem", marginLeft: "6px", color: accentColor }} />
        خط السير:
      </span>

      <div style={{ overflowX: "auto", paddingBottom: "6px" }} className="hide-scrollbar">
        <div style={{ display: "flex", alignItems: "center", position: "relative", minWidth: "400px", padding: "0 10px" }}>
          <div style={{
            position: "absolute",
            top: "10px",
            left: "24px",
            right: "24px",
            height: "1px",
            background: "var(--border-glass)",
            zIndex: 1
          }} />

          {stops.map((stop, idx, arr) => {
            const isStart = idx === 0;
            const isEnd = idx === arr.length - 1;
            const dotColor = isStart ? "#10b981" : isEnd ? "#ef4444" : "#f59e0b";

            return (
              <div key={idx} style={{
                flex: "1 1 0%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 2
              }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `3px solid ${dotColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "6px",
                  boxShadow: `0 0 8px ${dotColor}40`
                }}>
                  <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: dotColor
                  }} />
                </div>

                <span style={{
                  fontSize: "0.72rem",
                  fontWeight: isStart || isEnd ? "bold" : "500",
                  color: isStart || isEnd ? "var(--text-primary)" : "var(--text-secondary)",
                  textAlign: "center",
                  minWidth: "max-content",
                  whiteSpace: "normal",
                  lineHeight: "1.3"
                }}>
                  {stop}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
