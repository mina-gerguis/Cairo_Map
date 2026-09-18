import React from "react";
import styles from "../directions.module.css";
import { RouteLeg } from "../types";

interface RouteCardLegTimelineProps {
  legs: RouteLeg[];
}

export function RouteCardLegTimeline({ legs }: RouteCardLegTimelineProps) {
  return (
    <div className={styles.timelineStepper}>
      {(legs || []).map((leg, lIdx) => (
        <div key={lIdx} className={styles.timelineStep}>
          <div className={styles.stepDot} />
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <span>📍 {leg.title}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                {leg.cost !== undefined && (
                  <span style={{ color: "#34d399" }}>{leg.cost} ج.م</span>
                )}
                {leg.duration && (
                  <span style={{ color: "#60a5fa" }}>{leg.duration}</span>
                )}
              </div>
            </div>
            <ol className={styles.stepList}>
              {(leg.steps || []).map((step, sIdx) => (
                <li key={sIdx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
}
