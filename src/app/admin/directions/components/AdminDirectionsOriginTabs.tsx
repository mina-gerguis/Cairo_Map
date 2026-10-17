import React from "react";
import { OriginTabItem } from "../types";

interface AdminDirectionsOriginTabsProps {
  selectedOrigin: string;
  onSelectOrigin: (origin: string) => void;
  totalRoutesCount: number;
  uniqueOrigins: OriginTabItem[];
}

export function AdminDirectionsOriginTabs({
  selectedOrigin,
  onSelectOrigin,
  totalRoutesCount,
  uniqueOrigins
}: AdminDirectionsOriginTabsProps) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>
        تصفية حسب منطقة الانطلاق:
      </span>
      <div
        className="tabs"
        style={{
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "6px",
          scrollbarWidth: "none"
        }}
      >
        <button
          type="button"
          onClick={() => onSelectOrigin("all")}
          className="btn"
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "0.82rem",
            fontWeight: selectedOrigin === "all" ? "700" : "400",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: selectedOrigin === "all" ? "var(--text-primary)" : "transparent",
            border: "none",
            color: selectedOrigin === "all" ? "var(--bgMode)" : "var(--text-primary)",
            whiteSpace: "nowrap"
          }}
        >
          جميع المناطق ({totalRoutesCount})
        </button>

        {uniqueOrigins.map((orig, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectOrigin(orig.name)}
            className="btn"
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: selectedOrigin === orig.name ? "700" : "400",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: selectedOrigin === orig.name ? "var(--text-primary)" : "transparent",
              border: "none",
              color: selectedOrigin === orig.name ? "var(--bgMode)" : "var(--text-primary)",
              whiteSpace: "nowrap"
            }}
          >
            {orig.name} ({orig.count})
          </button>
        ))}
      </div>
    </div>
  );
}
