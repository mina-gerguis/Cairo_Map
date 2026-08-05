"use client";

import React from "react";
import Link from "next/link";

export default function MonorailPage() {
  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "20px" }}>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--accent-ios)", 
            textDecoration: "none", 
            fontWeight: "600",
            fontSize: "0.95rem" 
          }}
        >
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      {/* Header */}
      <div className="glass-panel" style={{ padding: "50px 30px", marginBottom: "32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ 
          position: "absolute", 
          top: "-20px", 
          right: "-20px", 
          width: "120px", 
          height: "120px", 
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4.5rem", marginBottom: "20px" }}>🚄</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: "900", marginBottom: "12px", color: "var(--text-primary)" }}>
          خريطة المنورايل
        </h1>
        <div style={{ 
          display: "inline-block",
          padding: "6px 16px",
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "30px",
          color: "#3b82f6",
          fontSize: "0.85rem",
          fontWeight: "700",
          marginBottom: "8px"
        }}>
          ✨ قريباً في التحديث القادم
        </div>
      </div>

      {/* Content */}
      <div className="glass-panel" style={{ padding: "40px 32px", display: "flex", flexDirection: "column", gap: "28px", lineHeight: "1.8", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>مشروع خريطة المونورايل التفاعلية</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
            نعمل حالياً على إعداد وتصميم دليل وخريطة تفاعلية متكاملة لخطوط المونورايل الجديدة في مصر:
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "10px" }}>
          <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", textAlign: "right" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#3b82f6", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              📍 مونورايل شرق النيل
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              يربط مدينة نصر بالعاصمة الإدارية الجديدة، بطول 56.5 كم ويشمل 22 محطة لخدمة شرق القاهرة.
            </p>
          </div>
          <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", textAlign: "right" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#10b981", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              📍 مونورايل غرب النيل
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              يربط مدينة 6 أكتوبر بالمهندسين والجيزة، بطول 42 كم ويشمل 13 محطة لخدمة الجيزة وغرب القاهرة.
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "28px", marginTop: "12px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            بمجرد التشغيل الرسمي للمونورايل، ستتمكن من حساب رحلتك، معرفة المحطات التبادلية، ومعرفة أقصر الطرق للوصول إلى وجهتك عبر خطوط المترو والمونورايل معاً.
          </p>
        </div>
      </div>
    </div>
  );
}
