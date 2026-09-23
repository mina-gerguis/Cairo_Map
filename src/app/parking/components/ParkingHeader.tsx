"use client";

import React from "react";
import Link from "next/link";
import { GARAGE_TYPE_BADGES } from "../constants";

interface ParkingHeaderProps {
  children?: React.ReactNode;
}

export function ParkingHeader({ children }: ParkingHeaderProps) {
  return (
    <div
      className="metro-animate-fade"
      style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
      }}
    >
      {/* Back Button */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "var(--bg-glass)",
            border: "1px solid var(--border-glass)",
            color: "var(--text-primary)",
            textDecoration: "none",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
        </Link>
      </div>

      <div className="metro-animate-slide-up metro-delay-100">
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(1.5rem, 5vw, 2rem)",
            fontWeight: "bold",
            color: "var(--text-primary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-sub)",
          }}
        >
          <img
            src="/images/icons2d/parking.png"
            alt="Parking Icon"
            loading="lazy"
            decoding="async"
            style={{ width: "60px", marginLeft: "10px" }}
          />
          دليل الجراجات
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
          اعثر على أقرب جراج مغطى أو ذكي بالقرب من محطات المترو والأسواق لتفادي
          الازدحام وركن سيارتك بأمان.
        </p>

        {/* Badges indicators */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {GARAGE_TYPE_BADGES.map((badge, idx) => (
            <span
              key={idx}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                color: badge.color,
                borderRadius: "10px",
                padding: "4px 14px",
                fontSize: "0.78rem",
                fontWeight: "700",
              }}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Slot for action buttons */}
        {children}
      </div>
    </div>
  );
}
