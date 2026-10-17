"use client";

import React from "react";
import styles from "../roads-info.module.css";
import { HighwaySpeedLimits } from "@/data/roads_info";
import { VEHICLE_TYPE_META } from "../constants";

interface RoadSpeedLimitsSectionProps {
  speeds: HighwaySpeedLimits;
  roadName: string;
  radarInfo?: string;
}

export function RoadSpeedLimitsSection({
  speeds,
  roadName,
  radarInfo,
}: RoadSpeedLimitsSectionProps) {
  return (
    <div className={styles.speedLimitsSection}>
      <div className={styles.speedSectionHeader}>
        <div className={styles.speedSectionTitle}>
          <i className="bx bx-tachometer" style={{ color: "#3b82f6" }} />
          <span>السرعات المقررة قانوناً وأجهزة الرادار على {roadName}</span>
        </div>

        <div className={styles.speedRadarBadge}>
          <i className="bx bx-radar" />
          <span>رادارات مراقبة السرعة مفعلة</span>
        </div>
      </div>

      <div className={styles.speedsGrid}>
        {VEHICLE_TYPE_META.map((meta) => {
          const speedVal = speeds[meta.key as keyof HighwaySpeedLimits] || 90;

          return (
            <div key={meta.key} className={styles.speedCard}>
              <div
                className={styles.speedVehicleIcon}
                style={{
                  background: `${meta.badgeColor}20`,
                  color: meta.badgeColor,
                }}
              >
                <i className={meta.icon} />
              </div>

              <div className={styles.speedVehicleName}>{meta.title}</div>
              <div className={styles.speedVehicleSub}>{meta.subtitle}</div>

              <div className={styles.speedGaugeWrapper}>
                <span className={styles.speedNumber} style={{ color: meta.badgeColor }}>
                  {speedVal}
                </span>
                <span className={styles.speedUnit}>كم/ساعة</span>
              </div>

              <div className={styles.speedNote}>{meta.desc}</div>
            </div>
          );
        })}
      </div>

      {radarInfo && (
        <div
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "14px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            fontSize: "0.86rem",
            color: "var(--text-secondary)",
            lineHeight: "1.5",
          }}
        >
          <i
            className="bx bx-info-circle"
            style={{ fontSize: "1.3rem", color: "#60a5fa", marginTop: "2px", flexShrink: 0 }}
          />
          <div>
            <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              تنبيهات وإرشادات الرادار والكاميرات الذكية:
            </strong>
            {radarInfo}
          </div>
        </div>
      )}
    </div>
  );
}
