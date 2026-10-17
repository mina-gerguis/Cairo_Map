import React from "react";

export function AdminDirectionsEmptyState() {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-glass)",
        padding: "48px",
        borderRadius: "16px",
        textAlign: "center",
        color: "var(--text-muted, #94a3b8)"
      }}
    >
      <i className="bx bx-compass" style={{ fontSize: "2.5rem", color: "var(--text-muted)", marginBottom: "8px", display: "inline-block" }} />
      <div style={{ fontWeight: "bold", fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "4px" }}>
        لا توجد أي مسارات مواصلات مطابقة للتصفية الحالية
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        جرّب تغيير كلمات البحث، تصفية منطقة الانطلاق، أو أضف مساراً جديداً.
      </div>
    </div>
  );
}
