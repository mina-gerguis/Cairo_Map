"use client";

import React from "react";
import { ParkingGarageCardProps } from "../types";

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
      style={{
        backgroundColor: "var(--bgPrimary)",
        border: isExpanded
          ? "1px solid var(--color-secondary)"
          : "1px solid var(--border-glass)",
        borderRadius: "var(--radius-card)",
        padding: "16px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        cursor: "pointer",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "1.05rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          {parking.name}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: "rgba(99, 102, 241, 0.12)",
              color: "#818cf8",
              fontSize: "0.78rem",
              padding: "3px 8px",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            {parking.area}
          </span>
          <i
            className={`bx bx-chevron-${isExpanded ? "up" : "down"}`}
            style={{ color: "var(--text-secondary)", fontSize: "1.3rem" }}
          ></i>
        </div>
      </div>

      {/* Summary Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
        }}
      >
        <span>{parking.type}</span>
        <span style={{ fontWeight: "700", color: "#10b981" }}>
          {parking.hourlyRate} ج.م / ساعة
        </span>
      </div>

      {/* Expanded details block */}
      {isExpanded && (
        <div
          style={{
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "12px",
            marginTop: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            animation: "fadeIn 0.25s ease",
          }}
        >
          {/* Address */}
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "flex-start",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "0.95rem" }}>📍</span>
            <span>{parking.address}</span>
          </div>

          {/* Nearest Metro */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.05)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              margin: "4px 0",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "#10b981",
                fontWeight: "bold",
                display: "block",
                marginBottom: "4px",
              }}
            >
              أقرب محطة مترو:
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                fontWeight: "600",
              }}
            >
              {parking.nearestMetro}
            </span>
          </div>

          {/* Capacity & Rates Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                padding: "8px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "2px",
                }}
              >
                السعة الإجمالية
              </span>
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                {parking.capacity} سيارة
              </span>
            </div>
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                padding: "8px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "2px",
                }}
              >
                الحد الأقصى لليوم
              </span>
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  color: "#10b981",
                }}
              >
                {parking.maxDailyRate
                  ? `${parking.maxDailyRate} ج.م`
                  : "غير محدد"}
              </span>
            </div>
          </div>

          {/* Features */}
          {parking.features && parking.features.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  fontWeight: "700",
                }}
              >
                ✨ المميزات:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {parking.features.map((feat, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px dashed var(--border-glass)",
              paddingTop: "10px",
              marginTop: "4px",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              className="sub-title"
              style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
            >
              🕒 {parking.hours}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleReportClick}
                title="إبلاغ عن مشكلة في هذا الجراج"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#ef4444",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: "var(--font-sub)",
                }}
              >
                <i
                  className="fa-solid fa-triangle-exclamation"
                  style={{ fontSize: "0.85rem" }}
                ></i>
                <span>إبلاغ عن مشكلة</span>
              </button>

              <button
                type="button"
                onClick={handleDirectionsClick}
                className="btn btn-primary"
                style={{
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span className="sub-title"> الاتجاهات</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
