import React from "react";

export function AdminDirectionsSqlBanner() {
  return (
    <div
      style={{
        background: "rgba(245, 158, 11, 0.08)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      <div
        style={{
          color: "#f59e0b",
          margin: 0,
          fontSize: "1rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <i className="bx bx-warning" style={{ fontSize: "1.3rem" }} />
        <span>تنبيه: تحديث هيكل قاعدة بيانات المسارات (Supabase SQL)</span>
      </div>
      <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
        لدعم وسائل المواصلات الجديدة (القطار الكهربائي LRT والأتوبيس الترددي BRT) وتفعيل تقسيم المراحل والروابط، يرجى تشغيل الأوامر التالية في <strong>Supabase SQL Editor</strong>:
      </p>
      <pre
        style={{
          background: "rgba(0,0,0,0.4)",
          padding: "14px",
          borderRadius: "10px",
          fontSize: "0.82rem",
          overflowX: "auto",
          marginTop: "6px",
          direction: "ltr",
          textAlign: "left",
          color: "#a7f3d0",
          border: "1px solid var(--border-glass)",
          lineHeight: "1.5"
        }}
      >
        {`-- 1. إضافة الأعمدة الناقصة
ALTER TABLE public.transit_routes ADD COLUMN IF NOT EXISTS legs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.transit_routes ADD COLUMN IF NOT EXISTS map_link TEXT;

-- 2. تحديث قيد أنواع المواصلات لدعم LRT و BRT
ALTER TABLE public.transit_routes DROP CONSTRAINT IF EXISTS transit_routes_type_check;
ALTER TABLE public.transit_routes ADD CONSTRAINT transit_routes_type_check 
    CHECK (type IN ('microbus', 'bus', 'car', 'train', 'monorail', 'metro', 'plane', 'ship', 'multi', 'lrt', 'brt'));`}
      </pre>
    </div>
  );
}
