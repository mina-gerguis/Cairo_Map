"use client";

import React from "react";
import { ParkingGarageCardProps } from "../types";
import styles from "../parking.module.css";

export function ParkingGarageCard({
  parking,
  isExpanded,
  onToggle,
  onReportParking,
}: ParkingGarageCardProps) {
  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url =
      parking.mapLocationLink ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${parking.name} ${parking.address}`
      )}`;
    window.open(url, "_blank");
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReportParking(parking.name);
  };

  return (
    <div
      onClick={onToggle}
      className={`${styles.garageCard} ${
        isExpanded ? styles.garageCardExpanded : ""
      }`}
    >
      {/* Header Row */}
      <div className={styles.garageHeader}>
        <div className={styles.garageTitleGroup}>
          <div className={styles.garageIconBadge}>
            <i className="bx bx-parking" />
          </div>
          <div>
            <h3 className={styles.garageName}>{parking.name}</h3>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {parking.type}
            </div>
          </div>
        </div>

        <div className={styles.garagePillsRow}>
          <span className={styles.areaPill}>{parking.area}</span>
          <span className={styles.ratePill}>
            {parking.hourlyRate} ج.م / س
          </span>
          <i
            className={`bx bx-chevron-${isExpanded ? "up" : "down"} ${
              styles.chevronIcon
            }`}
          />
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className={styles.garageDetailsBox}>
          {/* Address */}
          <div className={styles.addressRow}>
            <i
              className="bx bx-map-pin"
              style={{
                color: "var(--color-secondary, #3b82f6)",
                fontSize: "1.1rem",
                marginTop: "2px",
              }}
            />
            <span>{parking.address}</span>
          </div>

          {/* Nearest Metro */}
          {parking.nearestMetro && (
            <div className={styles.metroHighlightBox}>
              <i
                className="bx bx-train"
                style={{ color: "#10b981", fontSize: "1.2rem" }}
              />
              <div style={{ fontSize: "0.85rem" }}>
                <span
                  style={{
                    color: "#10b981",
                    fontWeight: "800",
                    marginLeft: "6px",
                  }}
                >
                  أقرب محطة مترو:
                </span>
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: "600",
                  }}
                >
                  {parking.nearestMetro}
                </span>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricTile}>
              <div className={styles.metricTileIcon}>
                <i className="bx bx-car" style={{ color: "#3b82f6" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    display: "block",
                  }}
                >
                  السعة الإجمالية
                </span>
                <span
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: "800",
                    color: "var(--text-primary)",
                  }}
                >
                  {parking.capacity ? `${parking.capacity} سيارة` : "غير محدد"}
                </span>
              </div>
            </div>

            <div className={styles.metricTile}>
              <div className={styles.metricTileIcon}>
                <i className="bx bx-wallet" style={{ color: "#10b981" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    display: "block",
                  }}
                >
                  الحد الأقصى لليوم
                </span>
                <span
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: "800",
                    color: "#10b981",
                  }}
                >
                  {parking.maxDailyRate
                    ? `${parking.maxDailyRate} ج.م`
                    : "غير محدد"}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          {parking.features && parking.features.length > 0 && (
            <div className={styles.featuresWrapper}>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  fontWeight: "700",
                }}
              >
                ✨ المميزات والخدمات:
              </span>
              <div className={styles.featuresList}>
                {parking.features.map((feat, idx) => (
                  <span key={idx} className={styles.featureTag}>
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Hours Row */}
          <div className={styles.actionsRow}>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="bx bx-time-five" />
              <span>{parking.hours || "متاح 24 ساعة"}</span>
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleReportClick}
                className={styles.reportBtn}
                title="إبلاغ عن مشكلة في هذا الجراج"
              >
                <i className="bx bx-error" />
                <span>إبلاغ عن مشكلة</span>
              </button>

              <button
                type="button"
                onClick={handleDirectionsClick}
                className={styles.directionsBtn}
              >
                <i className="bx bx-navigation" />
                <span>الاتجاهات</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParkingGarageCard;
