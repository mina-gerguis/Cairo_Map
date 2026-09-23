import React from "react";
import { LrtHeaderProps } from "../types";

export default function LrtHeader({ headerRef, onOpenReportModal }: LrtHeaderProps) {
  return (
    <div
      ref={headerRef}
      className="metro-animate-fade"
      style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
        direction: "rtl",
      }}
    >
      <div className="metro-animate-slide-up metro-delay-100">
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "bold",
            color: "var(--text-primary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}
        >
          <img
            src="/images/icons2d/Cairo_lrt.png"
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: "40px", height: "40px", marginLeft: "10px", objectFit: "contain" }}
          />
          دليل القطار الكهربائي LRT
        </h1>
        <p
          className="sub-title"
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            maxWidth: "600px",
            margin: "0 auto 20px",
            lineHeight: "1.6",
          }}
        >
          استكشف المحطات والاتجاهات والمعالم الهامة لخط القطار الكهربائي الخفيف.
        </p>

        {/* Badges indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#06b6d4",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}
          >
            عدلي منصور - بدر
          </span>
          <span
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#a855f7",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}
          >
            تفريعة العاصمة
          </span>
          <span
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}
          >
            تفريعة العاشر
          </span>
        </div>

        {/* Report Problem Button */}
        <div style={{ marginTop: "14px" }}>
          <button
            type="button"
            onClick={onOpenReportModal}
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#ef4444",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-cairo)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)")}
          >
            <i className="fa-solid fa-triangle-exclamation" />
            <span>الإبلاغ عن مشكلة في القطار الكهربائي LRT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
