"use client";

import React from "react";
import Image from "next/image";
import styles from "../roads-info.module.css";
import { LiveRoadWeather } from "../types";

interface RoadWeatherSectionProps {
  weather: LiveRoadWeather | null;
  loading: boolean;
  roadName: string;
  onRefresh?: () => void;
}

export function RoadWeatherSection({
  weather,
  loading,
  roadName,
  onRefresh,
}: RoadWeatherSectionProps) {
  if (loading && !weather) {
    return (
      <div className={styles.weatherCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <i
            className="bx bx-loader-alt bx-spin"
            style={{ fontSize: "1.5rem", color: "#60a5fa" }}
          />
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            جاري جلب الطقس اللحظي ومستوى الرؤية على امتداد {roadName}...
          </span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={styles.weatherCard}>
      <div className={styles.weatherLeftGroup}>
        <div className={styles.weatherIconLarge}>
          {weather.conditionIcon === "sun" ? (
            <Image src="/images/icons3d/sun.webp" alt="sun" width={40} height={40} />
          ) : weather.conditionIcon === "rain" ? (
            <Image src="/images/icons3d/cloud_rain.webp" alt="rain" width={40} height={40} />
          ) : weather.conditionIcon === "cold" ? (
            <Image src="/images/icons3d/snowflake.webp" alt="cold" width={40} height={40} />
          ) : weather.conditionIcon === "fog" ? (
            <i className="bx bx-cloud" style={{ color: "#94a3b8" }} />
          ) : (
            <Image src="/images/icons3d/cloud.webp" alt="cloud" width={40} height={40} />
          )}
        </div>

        <div className={styles.weatherInfoGroup}>
          <div className={styles.weatherMainStatus}>
            <span className={styles.weatherTemp}>{weather.temp}° م</span>
            <span className={styles.weatherCondition}>{weather.conditionText}</span>
          </div>
          <div className={styles.weatherTipText}>
            {weather.hasWarning && (
              <span style={{ color: "#fbbf24", fontWeight: "700", display: "inline-block", marginLeft: "4px" }}>
                [تنبيه هام]
              </span>
            )}
            {weather.safetyTip}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div className={styles.weatherMetricsRow}>
          <div className={styles.weatherMetricItem} title="سرعة الرياح">
            <i className="bx bx-wind" style={{ color: "#38bdf8" }} />
            <span>{weather.windSpeed} كم/س</span>
          </div>

          <div className={styles.weatherMetricItem} title="نسبة الرطوبة">
            <i className="bx bx-droplet" style={{ color: "#60a5fa" }} />
            <span>{weather.humidity}% رطوبة</span>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            title="تحديث حالة الطقس"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className={`bx bx-refresh ${loading ? "bx-spin" : ""}`} style={{ fontSize: "1.2rem" }} />
          </button>
        )}
      </div>
    </div>
  );
}
