"use client";

import React from "react";
import styles from "../roads-info.module.css";
import { HighwayItem, RoadNewsItem } from "@/data/roads_info";
import { RoadSpeedLimitsSection } from "./RoadSpeedLimitsSection";
import { RoadWeatherSection } from "./RoadWeatherSection";
import { useRoadWeather } from "../hooks";
import { formatNewsDate } from "../utils";

interface RoadDetailCardProps {
  road: HighwayItem;
  onReportProblem: (road: HighwayItem) => void;
  news?: RoadNewsItem[];
}

export function RoadDetailCard({ road, onReportProblem, news = [] }: RoadDetailCardProps) {
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useRoadWeather(road);

  // Filter news specific to this road or general traffic news
  const roadNews = news.filter((item) => {
    if (!item.isActive) return false;
    if (!item.roadName) return false;
    const roadName = road.name.trim().toLowerCase();
    const itemRoad = item.roadName.trim().toLowerCase();
    if (itemRoad === "كافة الطرق" || itemRoad === "جميع الطرق") return true;
    if (roadName.includes(itemRoad) || itemRoad.includes(roadName)) return true;
    if (road.code && itemRoad.includes(road.code.trim().toLowerCase())) return true;
    return false;
  });

  return (
    <div className={styles.selectedRoadContainer}>
      <div className={styles.roadMasterCard}>
        {/* Header with Name, Type, and Actions */}
        <div className={styles.roadHeaderRow}>
          <div className={styles.roadTitleGroup}>
            <div className={styles.roadMainTitle}>
              <span>{road.name}</span>
              <span className={styles.roadTypeBadge}>{road.type}</span>
              {road.code && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(255, 255, 255, 0.1)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    color: "var(--text-secondary)",
                  }}
                >
                  كود: {road.code}
                </span>
              )}
            </div>

            <div className={styles.roadEndpoints}>
              <i className="bx bx-map-pin" style={{ color: "#3b82f6" }} />
              <span>من: <strong>{road.startPoint}</strong></span>
              <span>←</span>
              <span>إلى: <strong>{road.endPoint}</strong></span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {road.mapUrl && (
              <a
                href={road.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  padding: "8px 14px",
                  borderRadius: "10px",
                }}
              >
                <i className="bx bx-map" style={{ color: "#10b981" }} />
                <span>عرض على الخريطة</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => onReportProblem(road)}
              className="btn btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.82rem",
                padding: "8px 12px",
                borderRadius: "10px",
                color: "#f87171",
              }}
              title="إبلاغ عن تعديل أو مشكلة في هذا الطريق"
            >
              <i className="bx bx-error-circle" />
              <span>تحديث بيانات</span>
            </button>
          </div>
        </div>

        {/* Road Key Specifications Pills */}
        <div className={styles.roadStatsPills}>
          <div className={styles.roadPill}>
            <i className="bx bx-ruler" style={{ color: "#60a5fa" }} />
            <span>الطول الإجمالي:</span>
            <span className={styles.roadPillStrong}>{road.lengthKm} كم</span>
          </div>

          <div className={styles.roadPill}>
            <i className="bx bx-layer" style={{ color: "#a78bfa" }} />
            <span>عدد الحارات:</span>
            <span className={styles.roadPillStrong}>{road.lanesCount} حارات / اتجاه</span>
          </div>

          <div className={styles.roadPill}>
            <i className="bx bx-globe" style={{ color: "#34d399" }} />
            <span>المحافظات:</span>
            <span style={{ fontWeight: "600" }}>{road.governorates.join("، ")}</span>
          </div>

          {road.emergencyPhone && (
            <div className={styles.roadPill}>
              <i className="bx bx-phone" style={{ color: "#f87171" }} />
              <span>طوارئ الطريق:</span>
              <a
                href={`tel:${road.emergencyPhone}`}
                style={{ color: "#f87171", fontWeight: "700", direction: "ltr", textDecoration: "none" }}
              >
                {road.emergencyPhone}
              </a>
            </div>
          )}

          <div className={styles.roadPill}>
            <i className="bx bx-check-circle" style={{ color: "#22c55e" }} />
            <span>الحالة:</span>
            <span style={{ color: road.status === "open" ? "#4ade80" : "#fbbf24", fontWeight: "700" }}>
              {road.statusText || (road.status === "open" ? "مفتوح وسيولة" : "أعمال صيانة")}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className={styles.roadDescriptionText}>{road.description}</p>

        {/* Toll Gates & Gas Stations (if any) */}
        {((road.tollGates && road.tollGates.length > 0) || (road.gasStations && road.gasStations.length > 0)) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
              background: "var(--bg-secondary, rgba(15, 23, 42, 0.4))",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.05))",
            }}
          >
            {road.tollGates && road.tollGates.length > 0 && (
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#60a5fa", marginBottom: "6px" }}>
                  <i className="bx bx-wallet" style={{ marginLeft: "4px" }} /> بوابات الرسوم (الكارتة):
                </div>
                <ul style={{ margin: 0, paddingRight: "18px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {road.tollGates.map((gate, idx) => (
                    <li key={idx}>
                      {gate.name} {gate.fee && <span style={{ color: "#93c5fd" }}>({gate.fee})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {road.gasStations && road.gasStations.length > 0 && (
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#34d399", marginBottom: "6px" }}>
                  <i className="bx bx-gas-pump" style={{ marginLeft: "4px" }} /> محطات الخدمة والاستراحات:
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  {road.gasStations.join(" • ")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Weather Box for this road */}
        <RoadWeatherSection
          weather={weather}
          loading={weatherLoading}
          roadName={road.name}
          onRefresh={refetchWeather}
        />

        {/* Vehicle Speed Limits Section */}
        <RoadSpeedLimitsSection
          speeds={road.speeds}
          roadName={road.name}
          radarInfo={road.radarInfo}
        />

        {/* Road-Specific News & Traffic Alerts */}
        <div className={styles.roadSpecificNewsSection}>
          <div className={styles.roadSpecificNewsHeader}>
            <div className={styles.roadSpecificNewsTitle}>
              <i className="bx bx-bell" style={{ color: "#3b82f6" }} />
              <span>أخبار وتنبيهات هذا الطريق</span>
              {roadNews.length > 0 && (
                <span className={styles.tabBadge} style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}>
                  {roadNews.length}
                </span>
              )}
            </div>
          </div>

          {roadNews.length === 0 ? (
            <div className={styles.noRoadNewsBox}>
              <div className={styles.noRoadNewsIcon}>
                <i className="bx bx-check-shield" />
              </div>
              <div>
                <div className={styles.noRoadNewsTitle}>لا توجد أخبار أو تنبيهات مسجلة لهذا الطريق</div>
                <div className={styles.noRoadNewsDesc}>
                  كافة مسارات الطريق تعمل بحالتها الطبيعية وسيولة مرورية معتادة دون أي بلاغات طارئة حالياً.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {roadNews.map((item) => {
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

                      <h4 className={styles.newsTitle} style={{ fontSize: "1rem" }}>{item.title}</h4>
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
          )}
        </div>
      </div>
    </div>
  );
}
