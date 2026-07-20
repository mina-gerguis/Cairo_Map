"use client";

import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="app-container" style={{ maxWidth: "900px", paddingTop: "40px" }}>
      {/* Hero Card */}
      <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: "5rem", marginBottom: "16px" }}>📋</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: "800", marginBottom: "12px", background: "linear-gradient(135deg, var(--text-primary) 50%, var(--accent-ios))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          دفتر
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto", lineHeight: "1.8" }}>
          دليلك الذكي الشامل لأرقام وعناوين ومواقع الأماكن والخدمات في جميع أنحاء مصر.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "20px", background: "rgba(52, 199, 89, 0.12)", border: "1px solid rgba(52, 199, 89, 0.25)", borderRadius: "30px", padding: "8px 20px", color: "var(--accent-success)", fontSize: "0.9rem", fontWeight: "600" }}>
          <span style={{ width: "8px", height: "8px", background: "#34c759", borderRadius: "50%", display: "inline-block" }}></span>
          خدمة نشطة — مصر بالكامل
        </div>
      </div>

      {/* Info Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "32px" }}>

        {/* Launch Date */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>🚀</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>تاريخ الإنشاء</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7" }}>
            تأسّس تطبيق دفتر في <strong style={{ color: "var(--text-primary)" }}>يوليو 2025</strong> برؤية واضحة لتوفير دليل رقمي ذكي يخدم المواطن المصري.
          </p>
        </div>

        {/* Goal */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>🎯</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>الهدف</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7" }}>
            تسهيل الوصول لجميع الأماكن والخدمات في مصر — من مطاعم وصيدليات ومستشفيات وحدائق — بضغطة واحدة وبدون تعقيد.
          </p>
        </div>

        {/* Vision */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>💡</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>الرؤية</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7" }}>
            أن يكون دفتر المرجع الرقمي الأول لكل مصري يبحث عن خدمة أو مكان، مع واجهة عصرية تشبه تطبيقات آبل الأصلية.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="glass-panel" style={{ padding: "36px", marginBottom: "32px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: "800", marginBottom: "24px", color: "var(--text-primary)" }}>ما يميز دفتر؟</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { emoji: "🔍", title: "بحث لحظي", desc: "نتائج فورية مع كل حرف تكتبه" },
            { emoji: "📍", title: "الأماكن القريبة", desc: "يحدد موقعك ويظهر الأقرب إليك" },
            { emoji: "🌙", title: "وضع داكن/فاتح", desc: "تصميم يناسب ذوقك وظروف الإضاءة" },
            { emoji: "📞", title: "اتصال مباشر", desc: "اضغط على الرقم للاتصال فوراً" },
            { emoji: "🗺️", title: "خرائط جوجل", desc: "احصل على الاتجاهات بنقرة واحدة" },
            { emoji: "➕", title: "أضف مكانك", desc: "أضف أماكن جديدة وشاركها مع الجميع" },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", background: "rgba(120,120,120,0.05)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)" }}>
              <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{item.emoji}</span>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "4px" }}>{item.title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STAGE KODE Card */}
      <div className="glass-panel" style={{ padding: "40px", marginBottom: "32px", border: "1px solid rgba(47, 128, 237, 0.25)", background: "rgba(47, 128, 237, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #2f80ed, #5856d6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
            💻
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>STAGE KODE</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>الشركة المطوّرة — صنّاع تجارب رقمية متميزة</p>
          </div>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.97rem", lineHeight: "1.8", marginBottom: "24px" }}>
          STAGE KODE شركة تقنية مصرية متخصصة في تطوير تطبيقات الويب والموبايل بأعلى معايير الجودة والأداء والجمال البصري. نؤمن بأن التكنولوجيا يجب أن تكون في متناول الجميع وأن تُحدث فرقاً حقيقياً في حياة المستخدمين.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="https://www.facebook.com/reposts3" target="_blank" rel="noopener noreferrer" className="ios-btn" style={{ textDecoration: "none", padding: "10px 20px", gap: "8px", fontSize: "0.9rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            فيسبوك
          </a>
          <Link href="/help" className="ios-btn ios-btn-primary" style={{ textDecoration: "none", padding: "10px 20px", fontSize: "0.9rem" }}>
            تواصل معنا
          </Link>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card" style={{ padding: "28px", textAlign: "center", marginBottom: "40px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>روابط التواصل</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <a href="https://www.facebook.com/reposts3" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "rgba(24, 119, 242, 0.1)", border: "1px solid rgba(24, 119, 242, 0.25)", borderRadius: "var(--radius-sm)", color: "#1877f2", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            Facebook
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "rgba(225, 48, 108, 0.1)", border: "1px solid rgba(225, 48, 108, 0.25)", borderRadius: "var(--radius-sm)", color: "#e1306c", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
