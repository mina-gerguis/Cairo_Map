"use client";

import React from "react";

interface RoadsReportBannerProps {
  onOpenReport: () => void;
}

export function RoadsReportBanner({ onOpenReport }: RoadsReportBannerProps) {
  return (
    <div
      style={{
        background: "var(--cardGlassBg, rgba(30, 41, 59, 0.7))",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(59, 130, 246, 0.15)",
            color: "var(--color-secondary, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            flexShrink: 0,
          }}
        >
          <i className="bx bx-error-alt" />
        </div>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>
            هل لاحظت تغييراً في سرعة رادار أو كارتة طريق؟
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            ساعدنا في إبقاء بيانات الطرق دقيقة ومحدثة دائماً بإرسال ملاحظاتك أو تقرير عن الطريق.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenReport}
        className="btn btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.85rem",
          padding: "10px 18px",
          borderRadius: "10px",
          whiteSpace: "nowrap",
        }}
      >
        <i className="bx bx-edit" />
        <span>إبلاغ عن تعديل / مشكلة</span>
      </button>
    </div>
  );
}
