"use client";

import React from "react";

interface AdminMicrobusStationsHeaderProps {
  onAddClick: () => void;
  onOpenExcelModal: () => void;
  onExportExcel: () => void;
}

export function AdminMicrobusStationsHeader({
  onAddClick,
  onOpenExcelModal,
  onExportExcel
}: AdminMicrobusStationsHeaderProps) {
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

      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Export to Excel */}
        <button
          type="button"
          className="btn btn-export"
          onClick={onExportExcel}
          title="تصدير جميع مواقف السرفيس إلى ملف Excel"
        >
          <i className="bx bx-export" style={{ marginLeft: "6px" }} />
          <span>تصدير</span>
        </button>

        {/* Import from Excel */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenExcelModal}
          title="استيراد مواقف وخطوط سير من ملف Excel"
        >
          <i className="bx bx-import" style={{ marginLeft: "6px" }} />
          <span>استيراد</span>
        </button>

        {/* Add Station Button */}
        <button
          onClick={onAddClick}
          className="btn btn-purple"
          type="button"
        >
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          <span>إضافة موقف جديد</span>
        </button>
      </div>
    </div>
  );
}
