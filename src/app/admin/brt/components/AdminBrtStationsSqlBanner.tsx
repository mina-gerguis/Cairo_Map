"use client";

import React, { useState } from "react";

export function AdminBrtStationsSqlBanner() {
  const [copied, setCopied] = useState(false);

  const sqlScript = `CREATE TABLE IF NOT EXISTS public.brt_stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  governorate TEXT NOT NULL DEFAULT 'القاهرة',
  sector TEXT NOT NULL DEFAULT 'شرق القاهرة',
  map_url TEXT,
  type TEXT,
  status TEXT DEFAULT 'تشغيل تجريبي',
  landmarks JSONB DEFAULT '[]'::jsonb,
  routes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brt_stations ENABLE ROW LEVEL SECURITY;

-- Allow read for everyone
CREATE POLICY "Allow public read on brt_stations"
  ON public.brt_stations FOR SELECT USING (true);

-- Allow full access for authenticated admins
CREATE POLICY "Allow admin full access on brt_stations"
  ON public.brt_stations FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      style={{
        background: "rgba(245, 158, 11, 0.08)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
        color: "#fbbf24"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "1rem" }}>
            <i className="bx bx-info-circle" style={{ fontSize: "1.25rem" }} />
            <span>تنبيه التخزين المحلي / جدول قاعدة البيانات</span>
          </div>
          <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>
            يتم الحفظ حالياً على التخزين المحلي (LocalStorage) لعدم توفر جدول <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>brt_stations</code> في Supabase. يمكنك إنشاء الجدول بالاستعلام التالي:
          </p>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          style={{
            background: copied ? "#10b981" : "rgba(245, 158, 11, 0.2)",
            border: "1px solid rgba(245, 158, 11, 0.5)",
            color: copied ? "#fff" : "#fbbf24",
            padding: "6px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.82rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap"
          }}
        >
          <i className={copied ? "bx bx-check" : "bx bx-copy"} />
          <span>{copied ? "تم النسخ!" : "نسخ استعلام SQL"}</span>
        </button>
      </div>
    </div>
  );
}
