"use client";

import React from "react";

export function AdminMicrobusStationsSqlBanner() {
  return (
    <div
      style={{
        background: "rgba(245, 158, 11, 0.08)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        padding: "16px 20px",
        borderRadius: "14px",
        marginBottom: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#f59e0b",
          fontWeight: "bold"
        }}
      >
        <i className="bx bx-warning" style={{ fontSize: "1.3rem" }} />
        <span>يعمل في وضع الحفظ المحلي (LocalStorage)</span>
      </div>
      <p style={{ color: "#d97706", fontSize: "0.85rem", margin: 0, lineHeight: "1.6" }}>
        لم يتم العثور على جدول قاعدة البيانات المناسب في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها
        في متصفحك الحالي فقط كحفظ احتياطي مؤقت. لتفعيل حفظ التغييرات لكل مستخدمي الموقع بشكل دائم، يرجى
        فتح تبويب <strong>SQL Editor</strong> في لوحة تحكم Supabase وتشغيل سكريبت{" "}
        <code>supabase_transport_services.sql</code>.
      </p>
    </div>
  );
}
