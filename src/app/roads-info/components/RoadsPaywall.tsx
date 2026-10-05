"use client";

import React from "react";
import Link from "next/link";
import styles from "../roads-info.module.css";

interface RoadsPaywallProps {
  user: any;
}

export function RoadsPaywall({ user }: RoadsPaywallProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />
      <div
        style={{
          maxWidth: "500px",
          margin: "80px auto",
          padding: "32px 24px",
          background: "var(--bg-glass, rgba(30, 41, 59, 0.8))",
          border: "1px solid var(--border-glass)",
          borderRadius: "24px",
          textAlign: "center",
          backdropFilter: "blur(16px)",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            background: "rgba(59, 130, 246, 0.15)",
            color: "#60a5fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 16px",
          }}
        >
          <i className="bx bx-lock-alt" />
        </div>

        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "8px" }}>
          دليل وسرعات الطرق متاح للمشتركين
        </h2>

        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
          استمتع ببيانات دقيقة لكافة سرعات الرادار، الطقس اللحظي، وأخبار وتنبيهات المرور الحية عند الترقية للباقات المميزة.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {user ? (
            <Link
              href="/profile?tab=subscription"
              className="btn btn-primary"
              style={{ padding: "12px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700" }}
            >
              ترقية الباقة الآن
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary"
              style={{ padding: "12px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700" }}
            >
              تسجيل الدخول للوصول للخدمة
            </Link>
          )}

          <Link
            href="/"
            className="btn btn-secondary"
            style={{ padding: "12px", borderRadius: "12px", fontSize: "0.9rem" }}
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
