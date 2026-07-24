"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "20px" }}>
        <Link 
          href="/profile" 
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
          <span>العودة للملف الشخصي</span>
        </Link>
      </div>

      {/* Header */}
      <div className="glass-panel" style={{ padding: "40px 30px", marginBottom: "32px", textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🛡️</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "800", marginBottom: "8px", color: "var(--text-primary)" }}>
          سياسة الخصوصية
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", margin: 0 }}>
          تاريخ آخر تحديث: يوليو 2026
        </p>
      </div>

      {/* Content */}
      <div className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", lineHeight: "1.8" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>1. مقدمة</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            نحن في تطبيق <strong style={{ color: "var(--text-primary)" }}>دفتر (Dftry)</strong> نولي أهمية قصوى لخصوصية وأمان بيانات مستخدمينا. توضح هذه السياسة كيف نقوم بجمع معلوماتك الشخصية، استخدامها، وحمايتها عند استخدامك لخدمات الدليل المتاحة على منصتنا.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>2. البيانات التي نجمعها</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "8px" }}>
            لتوفير أفضل تجربة استخدام ودليل ذكي، نقوم بجمع البيانات التالية:
          </p>
          <ul style={{ paddingRight: "20px", color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><strong>البيانات الشخصية:</strong> مثل الاسم الكامل، اسم المستخدم، البريد الإلكتروني، رقم الهاتف، وتاريخ الميلاد الذي تقدمه لنا طواعية عند تسجيل حساب جديد.</li>
            <li><strong>بيانات الموقع الجغرافي:</strong> نطلب الوصول لموقعك الجغرافي (GPS) لنتمكن من عرض الفروع والأماكن الخدمية "القريبة منك" بشكل تلقائي ودقيق.</li>
            <li><strong>بيانات التفاعل:</strong> تشمل الأماكن التي تضيفها للمفضلة، والتقييمات، والتعليقات التي تكتبها على الأماكن والخدمات.</li>
          </ul>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>3. كيف نستخدم معلوماتك</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "8px" }}>
            نستخدم هذه المعلومات في الأغراض التالية:
          </p>
          <ul style={{ paddingRight: "20px", color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>توفير وتطوير وتحسين خدمات دليل الهواتف والأماكن.</li>
            <li>تخصيص تجربتك وعرض المحتوى الأكثر ملاءمة لموقعك الجغرافي.</li>
            <li>التواصل معك وإرسال الإشعارات التقنية أو الإجابة على استفساراتك عبر البريد الإلكتروني.</li>
            <li>تأمين حسابك والحد من إساءة الاستخدام أو الممارسات الضارة بالتقييمات.</li>
          </ul>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>4. حماية البيانات ومشاركتها</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            نحن نستخدم تقنيات تشفير متطورة لحماية بياناتك الشخصية من الوصول غير المصرح به. **لا نقوم ببيع أو تأجير أو مشاركة بياناتك الشخصية مع أي أطراف ثالثة** لأغراض تسويقية على الإطلاق.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>5. حقوقك وحذف الحساب</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            لديك الحق الكامل في الوصول لبياناتك وتعديلها في أي وقت من خلال صفحة الملف الشخصي. كما نتيح لك خيار حذف الحساب نهائياً، والذي يقوم بمسح فوري وكامل لكافة بياناتك وتعليقاتك وأماكنك المفضلة من خوادمنا بشكل لا يمكن التراجع عنه.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>6. التعديلات على السياسة</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لمواكبة التغييرات القانونية أو التقنية. سنقوم بإبلاغك بأي تغييرات جوهرية عبر نشرها على هذه الصفحة أو عبر إرسال بريد إلكتروني.
          </p>
        </div>
      </div>
    </div>
  );
}
