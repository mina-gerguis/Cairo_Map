"use client";

import React from "react";

interface AdminBrtStationsHeaderProps {
  onAddClick: () => void;
  onOpenExcelModal: () => void;
  onExportExcel: () => void;
}

export function AdminBrtStationsHeader({
  onAddClick,
  onOpenExcelModal,
  onExportExcel
}: AdminBrtStationsHeaderProps) {
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <img
            src="/images/icons2d/brt.webp"
            alt="BRT icon"
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: "900",
              color: "var(--text-primary, #fff)",
              margin: 0
            }}
          >
            إدارة الأتوبيس الترددي (BRT)
          </h1>
        </div>
        <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
          إضافة وتحرير ومزامنة محطات الأتوبيس الترددي السريع على الطريق الدائري، المسارات، أسعار التذاكر والمعالم.
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Export to Excel */}
        <button
          type="button"
          className="btn btn-export"
          onClick={onExportExcel}
          title="تصدير جميع محطات الأتوبيس الترددي إلى ملف Excel"
        >
          <i className="bx bx-export" style={{ marginLeft: "6px" }} />
          <span>تصدير</span>
        </button>

        {/* Import from Excel */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenExcelModal}
          title="استيراد محطات وخطوط سير من ملف Excel"
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
          <span>إضافة محطة BRT جديدة</span>
        </button>
      </div>
    </div>
  );
}
