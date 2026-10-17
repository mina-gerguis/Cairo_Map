"use client";

import React from "react";
import styles from "../roads-info.module.css";
import { ROAD_NEWS_CATEGORIES } from "../constants";
import { RoadNewsItem } from "@/data/roads_info";
import { formatNewsDate } from "../utils";

interface RoadNewsSectionProps {
  news: RoadNewsItem[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  loading: boolean;
}

export function RoadNewsSection({
  news,
  selectedCategory,
  onCategoryChange,
  loading,
}: RoadNewsSectionProps) {
  return (
    <div className={styles.newsContainer}>
      {/* Category Pills */}
      <div className={styles.newsFiltersRow}>
        {ROAD_NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.filterChip} ${
              selectedCategory === cat.id ? styles.filterChipActive : ""
            }`}
            onClick={() => onCategoryChange(cat.id)}
          >
            <i className={cat.icon} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.8rem", color: "#60a5fa" }} />
          <p style={{ marginTop: "8px" }}>جاري تحميل أحدث أخبار وتنبيهات الطرق...</p>
        </div>
      )}

      {!loading && news.length === 0 && (
        <div
          style={{
            background: "var(--bg-card)",
            padding: "40px 20px",
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid var(--border-glass)",
          }}
        >
          <i className="bx bx-check-double" style={{ fontSize: "2.5rem", color: "#10b981", marginBottom: "8px" }} />
          <h3 style={{ fontSize: "1.1rem", color: "#fff", marginBottom: "4px" }}>لا توجد تنبيهات نشطة حالياً</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            كافة المحاور والطرق تعمل بسيولة واستقرار مروري دون أي بلاغات طارئة.
          </p>
        </div>
      )}

      {/* News Cards List */}
      {!loading &&
        news.map((item) => {
          const isCritical = item.severity === "critical";
          const isWarning = item.severity === "warning";

          return (
            <div key={item.id} className={styles.newsCard}>
              <div
                className={styles.newsIconCol}
                style={{
                  background: isCritical
                    ? "rgba(239, 68, 68, 0.15)"
                    : isWarning
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(59, 130, 246, 0.15)",
                  color: isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#3b82f6",
                }}
              >
                {item.category === "weather_fog" ? (
                  <i className="bx bx-cloud-rain" />
                ) : item.category === "maintenance" ? (
                  <i className="bx bx-wrench" />
                ) : item.category === "detour" ? (
                  <i className="bx bx-git-merge" />
                ) : item.category === "radar" ? (
                  <i className="bx bx-radar" />
                ) : (
                  <i className="bx bx-bell" />
                )}
              </div>

              <div className={styles.newsContentCol}>
                <div className={styles.newsMetaRow}>
                  <span
                    className={`${styles.newsSeverityBadge} ${
                      isCritical
                        ? styles.newsSeverityCritical
                        : isWarning
                        ? styles.newsSeverityWarning
                        : styles.newsSeverityInfo
                    }`}
                  >
                    {isCritical ? "عاجل" : isWarning ? "تنبيه هام" : "معلومة مرورية"}
                  </span>

                  {item.roadName && (
                    <span className={styles.newsRoadTag}>
                      <i className="bx bx-map" style={{ marginLeft: "3px" }} />
                      {item.roadName}
                    </span>
                  )}

                  <span className={styles.newsDate}>{formatNewsDate(item.publishedAt)}</span>
                </div>

                <h3 className={styles.newsTitle}>{item.title}</h3>
                <p className={styles.newsSummary}>{item.summary}</p>

                {item.source && (
                  <div className={styles.newsSource}>
                    <i className="bx bx-badge-check" style={{ color: "#38bdf8" }} />
                    <span>المصدر: {item.source}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
