"use client";

import React from "react";
import Link from "next/link";
import { OpenPageAccessOffer } from "@/lib/promotions";

interface PromotionalPageBannerProps {
  offer: OpenPageAccessOffer;
  remainingDays: number | null;
}

export default function PromotionalPageBanner({
  offer,
  remainingDays,
}: PromotionalPageBannerProps) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.12) 100%)",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        borderRadius: "14px",
        padding: "12px 18px",
        margin: "16px auto",
        maxWidth: "1200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        color: "var(--text-primary)",
        boxShadow: "0 4px 20px rgba(245, 158, 11, 0.08)",
        direction: "rtl",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "1.25rem",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
          }}
        >
          🎁
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <strong style={{ fontSize: "0.95rem", color: "#fbbf24" }}>
              {offer.title || "عرض خاص: وصول مجاني متاح الآن!"}
            </strong>
            <span
              style={{
                fontSize: "0.72rem",
                background: "rgba(245, 158, 11, 0.25)",
                color: "#fef3c7",
                padding: "2px 8px",
                borderRadius: "20px",
                fontWeight: "700",
                border: "1px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              مفتوح مجاناً للجميع 🔓
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
            {offer.banner_message || "هذه الصفحة والخدمة مفتوحة مؤقتاً لجميع المستخدمين ضمن العروض والخصومات الخاصة."}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {remainingDays !== null && (
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: "700",
              color: "#f59e0b",
              background: "var(--bg-glass-card, rgba(0, 0, 0, 0.2))",
              padding: "6px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              whiteSpace: "nowrap",
            }}
          >
            ⏳ {remainingDays === 0 ? "ينتهي اليوم!" : `متبقي ${remainingDays} يوم`}
          </div>
        )}
        <Link
          href="/profile"
          style={{
            fontSize: "0.82rem",
            fontWeight: "700",
            color: "#fff",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            padding: "7px 14px",
            borderRadius: "10px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
          }}
        >
          ترقية باقتي ⭐
        </Link>
      </div>
    </div>
  );
}
