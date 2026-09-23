import React from "react";
import { MetroMapSectionProps } from "../types";

export default function MetroMapSection({ mapPanelRef }: MetroMapSectionProps) {
  return (
    <div ref={mapPanelRef} className="details-panel">
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          margin: "0 0 8px",
        }}
      >
        خريطة مترو القاهرة الرسمية
      </h2>
      <p
        className="sub-title"
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          lineHeight: "1.7",
          margin: "0",
        }}
      >
        يمكنك استعراض الخريطة التوضيحية لشبكة المترو الرسمية أو تحميلها كصورة عالية الدقة للوصول إليها في أي وقت دون الحاجة لإنترنت:
      </p>

      <div
        style={{
          position: "relative",
          borderRadius: "var(--ra-8)",
          overflow: "hidden",
          border: "1px solid var(--border-glass)",
          height: "220px",
          width: "100%",
          backgroundColor: "rgba(0,0,0,0.05)",
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
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              background: "rgba(0,0,0,0.6)",
              color: "#ffffff",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backdropFilter: "blur(4px)",
            }}
          >
            <i className="bx bx-expand-alt" style={{ fontSize: "0.9rem" }}></i>
            اضغط للتكبير وعرض الخريطة كاملة
          </div>
        </a>
      </div>

      <a
        href="/images/metro/cairo-metro-map.png"
        download="cairo-metro-map.png"
        className="btn btn-primary"
        style={{
          width: "100%",
          fontSize: "0.92rem",
          fontWeight: "700",
          textAlign: "center",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <i className="bx bx-download" style={{ fontSize: "1.2rem" }}></i>
        تحميل خريطة المترو بجودة فائقة
      </a>
    </div>
  );
}
