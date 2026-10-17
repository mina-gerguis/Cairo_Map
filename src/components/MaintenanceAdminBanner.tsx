"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MaintenanceItem, getPageInfo } from "@/lib/maintenance";

interface MaintenanceAdminBannerProps {
  maintenance: MaintenanceItem;
  onDeactivated?: () => void;
}

export default function MaintenanceAdminBanner({
  maintenance,
  onDeactivated,
}: MaintenanceAdminBannerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const pageInfo = getPageInfo(maintenance.page_path);

  const handleDeactivate = async () => {
    if (!supabase) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("page_maintenance")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", maintenance.id);

      if (error) {
        console.error("Failed to deactivate maintenance:", error);
        alert("تعذر إيقاف الصيانة. يرجى المحاولة من لوحة الإدارة.");
      } else {
        if (onDeactivated) onDeactivated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 9999,
          background: "#ea580c",
          color: "#fff",
          border: "none",
          borderRadius: "50px",
          padding: "8px 16px",
          fontSize: "0.8rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          direction: "rtl",
        }}
        title="إظهار شريط تنبيه الصيانة"
      >
        <i className="bx bx-wrench" />
        <span>وضع الصيانة نشط</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "sticky",
        top: "72px",
        left: 0,
        right: 0,
        zIndex: 999,
        background: "linear-gradient(90deg, #9a3412 0%, #c2410c 50%, #ea580c 100%)",
        color: "#ffffff",
        padding: "10px 16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        direction: "rtl",
        fontFamily: "var(--font-heading, inherit)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Left Message */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "0.88rem",
          fontWeight: 700,
        }}
      >
        <span
          style={{
            background: "rgba(0, 0, 0, 0.25)",
            padding: "4px 8px",
            borderRadius: "6px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="bx bx-wrench" style={{ animation: "spin 6s linear infinite" }} />
          <span>وضع الصيانة نشط</span>
        </span>

        <span>
          هذه الصفحة (
          <strong style={{ textDecoration: "underline" }}>
            {maintenance.page_path === "all" ? "كامل الموقع" : pageInfo.label}
          </strong>
          ) مغلقة حالياً أمام الزوار العاديين. أنت تشاهد محتواها بصفتك مسؤول (Admin).
        </span>
      </div>

      {/* Right Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          onClick={handleDeactivate}
          disabled={isUpdating}
          style={{
            background: "#ffffff",
            color: "#c2410c",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.82rem",
            fontWeight: 800,
            cursor: isUpdating ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "transform 0.15s ease",
          }}
        >
          <i className="bx bx-check-circle" />
          <span>{isUpdating ? "جاري الإلغاء..." : "إنهاء الصيانة وفتح الصفحة"}</span>
        </button>

        <Link
          href="/admin/maintenance"
          style={{
            background: "rgba(0, 0, 0, 0.25)",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "0.82rem",
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <i className="bx bx-cog" />
          <span>لوحة الصيانة</span>
        </Link>

        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: "transparent",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            fontSize: "1.2rem",
            opacity: 0.8,
          }}
          title="إخفاء الشريط مؤقتاً"
        >
          <i className="bx bx-x" />
        </button>
      </div>
    </div>
  );
}
