import React from "react";
import { MetroMapSectionProps } from "../types";
import styles from "../metro.module.css";

export default function MetroMapSection({ mapPanelRef }: MetroMapSectionProps) {
  return (
    <div ref={mapPanelRef} className={styles.stationCard}>
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h2 className={styles.stationName}>خريطة شبكة مترو القاهرة الرسمية</h2>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
              استعراض المخطط العام لجميع الخطوط والمحطات التبادلية بجودة فائقة
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-card, 14px)",
          overflow: "hidden",
          border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
          height: "230px",
          width: "100%",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <a href="/images/metro/cairo-metro-map.png" target="_blank" rel="noopener noreferrer">
          <img
            src="/images/metro/cairo-metro-map.png"
            alt="Cairo Metro Official Map"
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.35s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "#ffffff",
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <i className="bx bx-expand-alt" style={{ fontSize: "0.95rem" }}></i>
            <span>اضغط للتكبير</span>
          </div>
        </a>
      </div>

      <a
        href="/images/metro/cairo-metro-map.png"
        download="cairo-metro-map.png"
        className="btn btn-primary"
        style={{
          textDecoration: "none",
          marginTop: 0,
        }}
      >
        <i className="bx bx-download" style={{ fontSize: "1.2rem" }}></i>
        <span>تحميل خريطة المترو بجودة فائقة (PNG)</span>
      </a>
    </div>
  );
}
