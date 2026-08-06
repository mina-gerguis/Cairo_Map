"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function MonorailPage() {
  const { user, profile, loading } = useAuth();

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold") && !isExpired);

  if (loading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "100px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--accent-ios, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>جاري التحقق من تفاصيل الاشتراك...</p>
      </div>
    );
  }

  // Paywall / Lock screen if user doesn't have access
  if (!user || !hasAccess) {
    return (
      <div className="app-container" style={{ maxWidth: "600px", paddingTop: "60px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
        {/* Back Button */}
        <div style={{ marginBottom: "24px" }}>
          <Link 
            href="/" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              color: "var(--accent-ios, #3b82f6)", 
              textDecoration: "none", 
              fontWeight: "600",
              fontSize: "0.95rem" 
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Premium Lock Panel */}
        <div className="glass-panel" style={{ padding: "48px 32px", textAlign: "center", border: "1px solid rgba(234, 179, 8, 0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            left: "-20px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)",
            borderRadius: "50%"
          }} />

          {/* Lock Icon */}
          <div style={{ 
            fontSize: "4.5rem", 
            marginBottom: "24px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            background: "rgba(234, 179, 8, 0.08)",
            borderRadius: "50%",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            color: "#eab308",
            animation: "pulse 2s infinite"
          }}>
            <i className="bx bxs-lock-alt"></i>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#fff", marginBottom: "14px" }}>
            خريطة المونورايل ميزة مدفوعة 🥈
          </h2>
          
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
            تصفح الخريطة التفاعلية التفصيلية لشبكة خطوط المونوريل الجديدة (شرق وغرب النيل) متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية.
          </p>

          {/* Features list */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الفضية (40 ج.م/شهرياً):</div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ عرض الخريطة التفاعلية الكاملة للمونوريل</li>
              <li>✨ تفاصيل المحطات التبادلية مع خطوط المترو</li>
              <li>✨ مسارات شرق النيل (العاصمة الإدارية) وغرب النيل (6 أكتوبر)</li>
            </ul>
          </div>

          {/* Call to Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
            {user ? (
              <Link
                href="/profile"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                  color: "#000",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 15px rgba(250, 204, 21, 0.3)",
                  display: "block"
                }}
              >
                🚀 اشترك الآن بالمحفظة (من 40 ج.م)
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  display: "block"
                }}
              >
                🔑 سجل دخولك أولاً لتفعيل الاشتراك
              </Link>
            )}
            
            <Link
              href="/"
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#94a3b8",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.9rem",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "block"
              }}
            >
              تصفح خطوط المترو المجانية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Allowed access - Show the normal monorail page content
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
            نعمل حالياً على إعداد وتصميم دليل وخريطة تفاعلية متكاملة لخطوط المونوريل الجديدة في مصر:
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
