"use client";

import React, { useState } from "react";
import Link from "next/link";
import GlassFolder, { FolderFile } from "@/components/ui/GlassFolder";
import { FaFolderOpen, FaCompass, FaArrowLeft } from "react-icons/fa";

export default function HomeGlassFolders() {
  // Folder data representing Qareeb's main transport and local services
  const transportFiles: FolderFile[] = [
    { name: "مترو أنفاق القاهرة", meta: "٣ خطوط · الأسعار والمحطات", art: "aurora", href: "/metro" },
    { name: "القطار الكهربائي LRT", meta: "العاصمة الإدارية والعاشر", art: "glacier", href: "/lrt" },
    { name: "مونوريل العاصمة وأكتوبر", meta: "شرق النيل وغرب النيل", art: "ember", href: "/monorail" },
    { name: "سكك حديد مصر (القطارات)", meta: "الوجهين البحري والقبلي", art: "verdant", href: "/railways" },
    { name: "الأتوبيس الترددي BRT", meta: "مسار ومحطات الطريق الدائري", href: "/brt" },
  ];

  const placesFiles: FolderFile[] = [
    { name: "المطاعم والكافيهات", meta: "أشهر الفروع وقوائم الأسعار", art: "ember", href: "/places?category=restaurants" },
    { name: "المستشفيات والصيدليات", meta: "طوارئ ٢٤ ساعة وأقرب رعاية", art: "dusk", href: "/places?category=hospitals" },
    { name: "البنوك وماكينات ATM", meta: "فروع البنوك والصراف الآلي", href: "/directory?category=banks" },
    { name: "المولات ومراكز التسوق", meta: "أكبر المجمعات والماركات", art: "aurora", href: "/places?category=malls" },
    { name: "المعالم والحدائق العامة", meta: "ممشى أهل مصر والمتنزهات", href: "/places?category=tourism" },
  ];

  const aiPlannerFiles: FolderFile[] = [
    { name: "خطة خروجة ذكية (AI)", meta: "حسب ميزانيتك وعدد الأفراد", art: "dusk", href: "/ai-planner" },
    { name: "دليل إزاي أروح (Directions)", meta: "أدق مسار وخط سير بين مكانين", art: "aurora", href: "/directions" },
    { name: "مجتمع «حد يعرف؟»", meta: "سؤال وجواب وتجارب المواطنين", art: "ember", href: "/had-yaaraf" },
    { name: "حفظ الأماكن المخصصة", meta: "تسجيل موقع سيارتك ومفضلاتك", href: "/save-location" },
  ];

  const roadsParkingFiles: FolderFile[] = [
    { name: "معلومات وتحويلات الطرق", meta: "أحدث أعمال وتطويرات المحاور", art: "verdant", href: "/roads-info" },
    { name: "ساحات ومواقف السيارات", meta: "مواقف الانتظار الرسمية وأسعارها", art: "glacier", href: "/parking" },
    { name: "محطات الأتوبيس والميكروباص", meta: "مواقف الأقاليم وخطوط السيرفيس", art: "ember", href: "/bus-stations" },
    { name: "الموانئ والمطارات المصرية", meta: "صالات السفر ووسائل الانتقال", href: "/airports" },
  ];

  return (
    <section
      aria-label="ملفات خدمات قريب التفاعلية"
      style={{
        position: "relative",
        padding: "60px 20px 40px 20px",
        maxWidth: "1320px",
        margin: "0 auto",
        overflow: "visible",
      }}
    >
      {/* ── SECTION HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: "42px" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)",
            fontWeight: 800,
            color: "var(--color-fg)",
            marginBottom: "12px",
            letterSpacing: "-0.5px",
            lineHeight: 1.25,
          }}
        >
          لكل قريب ملف خاص بيه
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sub)",
            fontSize: "clamp(0.88rem, 1.8vw, 1.02rem)",
            color: "var(--text-secondary)",
            maxWidth: "680px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          اضغط على أي مجلد لفتحه واستعراض المحتويات والتنقل مباشرة بين خطوط المترو،
          دليل الأماكن، ساحات الركن، ومخطط الرحلات الذكي.
        </p>
      </div>

      {/* ── FOLDERS SHOWCASE GRID ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px 28px",
          padding: "10px 0 20px 0",
        }}
      >
        {/* FOLDER 1: شبكة المواصلات */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
          <GlassFolder
            label="شبكة المواصلات"
            meta="٥ شبكات نقل رئيسية"
            art="aurora"
            seed={42}
            width={310}
            files={transportFiles}
            action="more"
            menu={[
              { label: "مترو القاهرة", onSelect: () => (window.location.href = "/metro") },
              { label: "القطار الخفيف LRT", onSelect: () => (window.location.href = "/lrt") },
              { label: "مونوريل العاصمة", onSelect: () => (window.location.href = "/monorail") },
              { label: "قطارات مصر", onSelect: () => (window.location.href = "/railways") },
            ]}
          />
        </div>

        {/* FOLDER 2: دليل الأماكن والخدمات */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <GlassFolder
            label="دليل الأماكن والخدمات"
            meta="آلاف العناوين والمواعيد"
            art="ember"
            seed={88}
            width={310}
            files={placesFiles}
            action="more"
            menu={[
              { label: "المطاعم والكافيهات", onSelect: () => (window.location.href = "/places?category=restaurants") },
              { label: "المستشفيات والصيدليات", onSelect: () => (window.location.href = "/places?category=hospitals") },
              { label: "المولات ومراكز التسوق", onSelect: () => (window.location.href = "/places?category=malls") },
              { label: "البنوك و ATM", onSelect: () => (window.location.href = "/directory?category=banks") },
            ]}
          />
        </div>

        {/* FOLDER 3: مخطط الرحلات الذكي */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <GlassFolder
            label="مخطط الرحلات الذكي"
            meta="خروجات وبرامج بالذكاء الاصطناعي"
            art="dusk"
            seed={173}
            width={310}
            files={aiPlannerFiles}
            action="more"
            menu={[
              { label: "تجربة المخطط الذكي", onSelect: () => (window.location.href = "/ai-planner") },
              { label: "دليل إزاي أروح", onSelect: () => (window.location.href = "/directions") },
              { label: "مجتمع حد يعرف؟", onSelect: () => (window.location.href = "/had-yaaraf") },
            ]}
          />
        </div>

        {/* FOLDER 4: الطرق ومواقف السيارات */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <GlassFolder
            label="الطرق وساحات الركن"
            meta="تحديثات المرور والمواقف"
            art="verdant"
            seed={256}
            width={310}
            files={roadsParkingFiles}
            action="more"
            menu={[
              { label: "معلومات وتحويلات الطرق", onSelect: () => (window.location.href = "/roads-info") },
              { label: "ساحات ومواقف السيارات", onSelect: () => (window.location.href = "/parking") },
              { label: "محطات الأتوبيس", onSelect: () => (window.location.href = "/bus-stations") },
            ]}
          />
        </div>
      </div>

      {/* ── BOTTOM QUICK HELPER NOTE ── */}
      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          fontFamily: "var(--font-sub)",
        }}
      >
        <FaCompass style={{ color: "var(--color-primary)" }} />
        <span>انقر على أي مجلد لفتحه واستكشاف ملفات الخدمة، أو اختر وسيلة النقل للانتقال لصفحتها مباشرة</span>
      </div>
    </section>
  );
}
