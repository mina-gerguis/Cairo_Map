import React from "react";
import styles from "../directions.module.css";

interface AdminDirectionsStatsProps {
  totalConnectionsCount: number;
  totalOptionsCount: number;
  totalMultiLegCount: number;
}

export function AdminDirectionsStats({
  totalConnectionsCount,
  totalOptionsCount,
  totalMultiLegCount
}: AdminDirectionsStatsProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div
          className={styles.statIconWrapper}
          style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}
        >
          <i className="bx bx-map-pin" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{totalConnectionsCount}</span>
          <span className={styles.statLabel}>إجمالي الوصلات والطرق</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <div
          className={styles.statIconWrapper}
          style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}
        >
          <i className="bx bx-bus" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{totalOptionsCount}</span>
          <span className={styles.statLabel}>وسائل المواصلات المسجلة</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <div
          className={styles.statIconWrapper}
          style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}
        >
          <i className="bx bx-git-repo-forked" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{totalMultiLegCount}</span>
          <span className={styles.statLabel}>مسارات متعددة المراحل</span>
        </div>
      </div>
    </div>
  );
}
