import React from "react";
import { RouteLeg } from "../types";
import { getTransitOptionIconPath } from "../utils";
import styles from "./RouteLegTimeline.module.css";

interface RouteLegTimelineProps {
  legs: RouteLeg[];
}

export default function RouteLegTimeline({ legs }: RouteLegTimelineProps) {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>
        <i className={`bx bx-git-repo-forked ${styles.titleIcon}`} />
        <span>خطوات ومراحل المسار:</span>
      </h4>

      <div className={styles.stagesList}>
        {legs.map((leg, legIdx) => {
          const isLastLeg = legIdx === legs.length - 1;
          const legIconData = getTransitOptionIconPath({
            vehicleType: leg.vehicleType || leg.title,
            type: leg.vehicleType,
          });

          return (
            <div key={legIdx} className={styles.stageRow}>
              {/* Stage Header Item */}
              <div className={styles.stageHeaderItem}>
                {/* Dot Number */}
                <div className={styles.dotNumber}>
                  {legIdx + 1}
                </div>

                {/* Stage Content */}
                <div className={isLastLeg ? styles.stageContentLast : styles.stageContent}>
                  <div className={styles.stageHeader}>
                    <h5 className={styles.stageTitle}>
                      {legIconData.type === "image" && legIconData.src ? (
                        <img
                          src={legIconData.src}
                          alt=""
                          className={styles.stageIconImg}
                        />
                      ) : (
                        <i
                          className={`${legIconData.iconClass || "bx bx-right-arrow-alt"} ${styles.stageIcon}`}
                        />
                      )}
                      <span>{leg.title}</span>
                    </h5>

                    <div className={styles.stagePills}>
                      {leg.cost !== undefined && (
                        <span className={`tab ${styles.stagePill}`}>
                          {leg.cost} ج.م
                        </span>
                      )}
                      {leg.duration && (
                        <span className={`tab ${styles.stagePill}`}>
                          {leg.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Steps list inside leg */}
                  <div className={styles.stepsList}>
                    {(leg?.steps || []).map((stepText, sIdx) => (
                      <div key={sIdx} className={styles.stepRow}>
                        <span className={styles.stepBullet}>•</span>
                        <div className={styles.stepText}>
                          {stepText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connecting vertical line */}
              {!isLastLeg && (
                <div className={styles.lineConnector}>
                  <div className={styles.lineWrapper}>
                    <div className={styles.verticalLine} />
                  </div>
                  <div style={{ flexGrow: 1 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
