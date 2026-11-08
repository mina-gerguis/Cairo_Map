import React from "react";
import { ASSETS } from "@/constants/assets";
import styles from "../lrt.module.css";

export interface LrtMapSectionProps {
  mapPanelRef?: React.RefObject<HTMLDivElement | null>;
}

export default function LrtMapSection({ mapPanelRef }: LrtMapSectionProps) {
  return (
    <div ref={mapPanelRef} className={styles.stationCard}>
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h3 className={styles.stationName}>خريطة شبكة القطار الكهربائي الخفيف</h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
              استعراض المخطط العام للجذع الرئيسي وتفريعتي العاصمة الإدارية والعاشر من رمضان والمحطات التبادلية
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
          height: "240px",
          width: "100%",
          backgroundColor: "rgba(0,0,0,0.25)",
        }}
      >
        <a href={ASSETS.maps.mapLRT} target="_blank" rel="noopener noreferrer">
          <img
            src={ASSETS.maps.mapLRT}
            alt="Cairo LRT and Transit Network Official Map"
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
              background: "rgba(0, 0, 0, 0.75)",
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

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%" }}>
        <a
          href={ASSETS.maps.mapMetro}
          download="map_metro.webp"
          className="btn btn-primary"
          style={{
            textDecoration: "none",
            marginTop: 0,
            flex: 1,
            minWidth: "180px",
          }}
        >
          <i className="bx bx-download" style={{ fontSize: "1.2rem" }}></i>
          <span>تحميل الخريطة الرسمية</span>
        </a>
      </div>
    </div>
  );
}
