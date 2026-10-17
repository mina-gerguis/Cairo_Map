"use client";

import React from "react";
import { ParkingActionsProps } from "../types";

export function ParkingActions({
  onOpenSuggestModal,
  onOpenReportModal,
}: ParkingActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "14px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={onOpenSuggestModal}
        style={{
          background: "rgba(59, 130, 246, 0.12)",
          border: "1px solid rgba(59, 130, 246, 0.35)",
          color: "var(--color-secondary, #3b82f6)",
          borderRadius: "10px",
          padding: "6px 16px",
          fontSize: "0.82rem",
          fontWeight: "700",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
          fontFamily: "var(--font-cairo)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)")
        }
      >
        <i className="fa-solid fa-plus-circle" style={{ fontSize: "0.9rem" }}></i>
        <span>اقترح إضافة جراج جديد</span>
      </button>

      <button
        type="button"
        onClick={onOpenReportModal}
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#ef4444",
          borderRadius: "10px",
          padding: "6px 16px",
          fontSize: "0.82rem",
          fontWeight: "700",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
          fontFamily: "var(--font-cairo)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")
        }
      >
        <i
          className="fa-solid fa-triangle-exclamation"
          style={{ fontSize: "0.9rem" }}
        ></i>
        <span>الإبلاغ عن مشكلة في الجراجات</span>
      </button>
    </div>
  );
}
