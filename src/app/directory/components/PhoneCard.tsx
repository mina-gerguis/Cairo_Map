import React from "react";
import { PhoneCardProps } from "../types";
import { getDialUrl } from "../utils";
import styles from "../directory.module.css";

export default function PhoneCard({
  entry,
  isCopied,
  onCopy,
  onReport,
}: PhoneCardProps) {
  return (
    <div className={styles.phoneCard}>
      {/* Top row: Icon/Logo + Name & Specialty */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {entry.logo_url ? (
          <img
            src={entry.logo_url}
            alt={entry.name}
            loading="lazy"
            decoding="async"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              objectFit: "cover",
              flexShrink: 0,
              background: "#fff",
            }}
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              color: "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-headset"></i>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "0.92rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {entry.name}
            </h4>
            {entry.specialty && (
              <span
                style={{
                  fontSize: "0.68rem",
                  background: "var(--border-glass)",
                  color: "var(--text-secondary)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}
              >
                {entry.specialty}
              </span>
            )}
          </div>

          {entry.description && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {entry.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom row: Number, Copy and Call actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "8px",
          borderTop: "1px solid var(--border-glass)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: "800",
              color: "var(--colorSuccess)",
              direction: "ltr",
            }}
          >
            {entry.phone_number}
          </span>
          <button
            type="button"
            onClick={() => onCopy(entry.phone_number, entry.id)}
            style={{
              background: isCopied ? "rgba(16, 185, 129, 0.15)" : "transparent",
              border: "none",
              color: isCopied ? "var(--colorSuccess)" : "var(--text-muted)",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.75rem",
            }}
            title="نسخ الرقم"
          >
            <i className={isCopied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
          </button>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => onReport(entry.name, entry.phone_number)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              fontSize: "0.78rem",
            }}
            title="الإبلاغ عن خطأ في هذا الرقم"
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
          </button>

          <a
            href={getDialUrl(entry.phone_number)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "var(--colorSuccess)",
              color: "#ffffff",
              padding: "4px 10px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}
          >
            <i className="fa-solid fa-phone"></i>
            اتصال
          </a>
        </div>
      </div>
    </div>
  );
}
