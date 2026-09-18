import React from "react";
import styles from "../directions.module.css";
import { RouteLeg } from "../types";
import { getTransitOptionIconPath } from "../utils";

interface RouteCardLegTimelineProps {
  legs: RouteLeg[];
}

export function RouteCardLegTimeline({ legs }: RouteCardLegTimelineProps) {
  return (
    <div className={styles.timelineStepper}>
      {(legs || []).map((leg, lIdx) => {
        const iconRes = getTransitOptionIconPath({
          vehicleType: leg.vehicleType || leg.title,
          type: leg.vehicleType
        });

        return (
          <div key={lIdx} className={styles.timelineStep}>
            <div className={styles.stepDot} />
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <span className="sub-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {iconRes.type === "image" && iconRes.src ? (
                    <img
                      src={iconRes.src}
                      alt=""
                      style={{ width: "18px", height: "auto", objectFit: "contain" }}
                    />
                  ) : (
                    <span>📍</span>
                  )}
                  {leg.title}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {leg.cost !== undefined && (
                    <span className="tab">{leg.cost} ج.م</span>
                  )}
                  {leg.duration && (
                    <span className="tab">{leg.duration}</span>
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
        );
      })}
    </div>
  );
}
