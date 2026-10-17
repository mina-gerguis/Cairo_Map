"use client";

import React from "react";
import { PlaceContactDetailsCardProps } from "../types";

export default function PlaceContactDetailsCard({
  place,
  displayBranch,
}: PlaceContactDetailsCardProps) {
  const websiteUrl = displayBranch.website_url || place.website_url;

  return (
    <div style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          fontWeight: "700",
          marginBottom: "12px",
          color: "var(--text-primary)",
        }}
      >
        التفاصيل
      </h3>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid var(--border-glass)",
          borderRadius: "14px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Phone Row */}
        {displayBranch.phones && displayBranch.phones.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: "1px solid rgba(120, 120, 120, 0.1)",
            }}
          >
            <span
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
            >
              الهاتف
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "flex-end",
              }}
            >
              {displayBranch.phones.map((p: string, i: number) => (
                <a
                  key={i}
                  href={`tel:${p}`}
                  style={{
                    fontSize: "0.92rem",
                    color: "#007aff",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  {p}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Website Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(120, 120, 120, 0.1)",
          }}
        >
          <span
            style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
          >
            الموقع الإلكتروني
          </span>
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.9rem",
                color: "#007aff",
                textDecoration: "none",
                fontWeight: "bold",
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                direction: "ltr",
              }}
            >
              {websiteUrl}
            </a>
          ) : (
            <span
              style={{
                fontSize: "0.92rem",
                color: "var(--text-muted)",
                fontWeight: "bold",
              }}
            >
              لا يوجد موقع
            </span>
          )}
        </div>

        {/* Address Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "14px 16px",
          }}
        >
          <span
            style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
          >
            العنوان
          </span>
          <div
            style={{
              textAlign: "left",
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              fontWeight: "600",
              maxWidth: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "flex-end",
            }}
          >
            <span>{displayBranch.fullAddress}</span>
            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              {displayBranch.city}، {displayBranch.governorate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
