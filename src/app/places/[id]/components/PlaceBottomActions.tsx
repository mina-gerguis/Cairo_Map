"use client";

import React from "react";
import { PlaceBottomActionsProps } from "../types";

export default function PlaceBottomActions({
  onReportClick,
  onNoteClick,
  onShareClick,
  hasAccess,
  placeCode,
}: PlaceBottomActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "24px",
        marginBottom: "20px",
      }}
    >
      {/* Report Button */}
      <button
        onClick={onReportClick}
        style={{
          width: "100%",
          background: "rgba(255, 59, 48, 0.1)",
          border: "1px solid rgba(255, 59, 48, 0.2)",
          borderRadius: "12px",
          padding: "14px",
          color: "#ff3b30",
          fontWeight: "700",
          fontSize: "0.9rem",
          fontFamily: "var(--font-cairo)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }}></i>
        <span>الإبلاغ عن مشكلة في البيانات</span>
      </button>

      {/* Reminder & Share row */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onNoteClick}
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-glass)",
            borderRadius: "12px",
            padding: "12px",
            color: "var(--text-primary)",
            fontWeight: "600",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <i
            className="bx bx-notepad"
            style={{ fontSize: "1.1rem", color: "#34c759" }}
          ></i>
          <span style={{ fontFamily: "var(--font-cairo)" }}>أضف تذكير</span>
          {!hasAccess && (
            <i
              className="bx bxs-crown"
              style={{ fontSize: "0.95rem", color: "#fbbf24" }}
            ></i>
          )}
        </button>

        <button
          onClick={onShareClick}
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-glass)",
            borderRadius: "12px",
            padding: "12px",
            color: "var(--text-primary)",
            fontWeight: "600",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <i className="bx bx-share-alt" style={{ fontSize: "1.1rem" }}></i>
          <span style={{ fontFamily: "var(--font-cairo)" }}>مشاركة</span>
        </button>
      </div>

      {/* Unique ID */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          opacity: 0.7,
          marginTop: "12px",
        }}
      >
        <span>كود المكان: #{placeCode}</span>
      </div>
    </div>
  );
}
