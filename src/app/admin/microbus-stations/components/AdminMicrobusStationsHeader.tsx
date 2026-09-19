"use client";

import React from "react";

interface AdminMicrobusStationsHeaderProps {
  onAddClick: () => void;
}

export function AdminMicrobusStationsHeader({ onAddClick }: AdminMicrobusStationsHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "1.85rem",
            fontWeight: "900",
            color: "var(--text-primary, #fff)",
            marginBottom: "6px"
          }}
        >
          إدارة مواقف السرفيس
        </h1>
        <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
          إضافة وتحرير وتحديث مواقف ميكروباصات السرفيس وخطوط السير والتعريفة المحددة.
        </p>
      </div>

      <button
        onClick={onAddClick}
        className="btn btn-purple"
      >
        <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
        إضافة موقف جديد
      </button>
    </div>
  );
}
