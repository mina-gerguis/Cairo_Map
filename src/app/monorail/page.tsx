"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const DEFAULT_MONORAIL: any[] = [
  { name: "الاستاد", line_type: "east", station_order: 1 },
  { name: "هشام بركات", line_type: "east", station_order: 2 },
  { name: "نوري خطاب", line_type: "east", station_order: 3 },
  { name: "الحي السابع", line_type: "east", station_order: 4 },
  { name: "ذاكر حسين", line_type: "east", station_order: 5 },
  { name: "المنطقة الحرة", line_type: "east", station_order: 6 },
  { name: "المشير طنطاوي", line_type: "east", station_order: 7 },
  { name: "وان قطامية", line_type: "east", station_order: 8 },
  { name: "المستثمرين", line_type: "east", station_order: 9 },
  { name: "النسيم", line_type: "east", station_order: 10 },
  { name: "الجامعة الأمريكية", line_type: "east", station_order: 11 },
  { name: "إعمار", line_type: "east", station_order: 12 },
  { name: "ميدان النافورة", line_type: "east", station_order: 13 },
  { name: "البروة", line_type: "east", station_order: 14 },
  { name: "بيت الوطن", line_type: "east", station_order: 15 },
  { name: "مسجد الفتاح العليم", line_type: "east", station_order: 16 },
  { name: "الحي السكني R2", line_type: "east", station_order: 17 },
  { name: "الدائري الإقليمي", line_type: "east", station_order: 18 },
  { name: "فندق الماسة", line_type: "east", station_order: 19 },
  { name: "الحي الحكومي", line_type: "east", station_order: 20 },
  { name: "حي السفارات", line_type: "east", station_order: 21 },
  { name: "مدينة الفنون والثقافة", line_type: "east", station_order: 22 },
  { name: "أكتوبر الجديدة", line_type: "west", station_order: 1 },
  { name: "المنطقة الصناعية", line_type: "west", station_order: 2 },
  { name: "السادات", line_type: "west", station_order: 3 },
  { name: "جهاز مدينة 6 أكتوبر", line_type: "west", station_order: 4 },
  { name: "جمعية المهندسين", line_type: "west", station_order: 5 },
  { name: "جامعة النيل", line_type: "west", station_order: 6 },
  { name: "هايبر وان", line_type: "west", station_order: 7 },
  { name: "الصحراوي", line_type: "west", station_order: 8 },
  { name: "المنصورية", line_type: "west", station_order: 9 },
  { name: "المريوطية", line_type: "west", station_order: 10 },
  { name: "الطريق الدائري", line_type: "west", station_order: 11 },
  { name: "العريش", line_type: "west", station_order: 12 },
  { name: "المطبغة", line_type: "west", station_order: 13 },
  { name: "بولاق الدكرور", line_type: "west", station_order: 14 },
  { name: "جامعة الدول العربية", line_type: "west", station_order: 15 },
  { name: "وادي النيل", line_type: "west", station_order: 16 }
];

const STATION_DETAILS: Record<string, { landmarks: string[]; type: string; timeFromStart: number; status: "تشغيل تجريبي" | "تحت الإنشاء" }> = {
  // East Line
  "الاستاد": { landmarks: ["ستاد القاهرة الدولي", "مسجد آل رشدان", "نادي الزهور الرياضي"], type: "نهائية - تبادلية مع الخط الثالث للمترو", timeFromStart: 0, status: "تشغيل تجريبي" },
  "هشام بركات": { landmarks: ["شارع الطيران", "سوق السيارات الجديد", "محور شينزو آبي"], type: "عادية", timeFromStart: 4, status: "تشغيل تجريبي" },
  "نوري خطاب": { landmarks: ["حي الواحة بمدينة نصر", "عمارات الفتح", "محور المشير طنطاوي"], type: "عادية", timeFromStart: 8, status: "تشغيل تجريبي" },
  "الحي السابع": { landmarks: ["المنطقة الحرة بمدينة نصر", "عمارات عثمان", "شارع مصطفى النحاس"], type: "عادية", timeFromStart: 11, status: "تشغيل تجريبي" },
  "ذاكر حسين": { landmarks: ["شارع ذاكر حسين الرئيسي", "سوق السيارات القديم", "طريق الوفاء والأمل"], type: "عادية", timeFromStart: 15, status: "تشغيل تجريبي" },
  "المنطقة الحرة": { landmarks: ["المنطقة الاستثمارية الحرة بمصر الجديدة", "محور المشير طنطاوي"], type: "عادية", timeFromStart: 18, status: "تشغيل تجريبي" },
  "المشير طنطاوي": { landmarks: ["مركز مصر للمعارض الدولية (EIEC)", "مسجد المشير طنطاوي", "استاد الدفاع الجوي"], type: "تبادلية", timeFromStart: 22, status: "تشغيل تجريبي" },
  "وان قطامية": { landmarks: ["الطريق الدائري بمحيط المعادي", "مجمع وان قطامية الإداري", "توكيل مرسيدس"], type: "عادية", timeFromStart: 27, status: "تشغيل تجريبي" },
  "المستثمرين": { landmarks: ["منطقة المستثمرين الشمالية بالتجمع", "شارع التسعين الشمالي"], type: "عادية", timeFromStart: 32, status: "تحت الإنشاء" },
  "النسيم": { landmarks: ["محيط كمبوند ديار والتسعين الجنوبي", "المنطقة التجارية بالتجمع الخامس"], type: "عادية", timeFromStart: 36, status: "تحت الإنشاء" },
  "الجامعة الأمريكية": { landmarks: ["حرم الجامعة الأمريكية الجديد بالتجمع", "بوينت 90 مول", "شارع التسعين الجنوبي"], type: "تبادلية", timeFromStart: 40, status: "تحت الإنشاء" },
  "إعمار": { landmarks: ["كمبوند إعمار ميفيدا", "كمبوند هايد بارك التجمع", "شارع التسعين الجنوبي"], type: "عادية", timeFromStart: 44, status: "تحت الإنشاء" },
  "ميدان النافورة": { landmarks: ["ميدان النافورة الشهير بالتجمع", "منطقة البنوك والأعمال بالمستثمرين"], type: "عادية", timeFromStart: 48, status: "تحت الإنشاء" },
  "البروة": { landmarks: ["محور محمد بن زايد الشمالي", "النادي الأهلي بالتجمع الخامس"], type: "عادية", timeFromStart: 52, status: "تحت الإنشاء" },
  "بيت الوطن": { landmarks: ["مدخل منطقة بيت الوطن بالتجمع", "طريق السويس الصحراوي"], type: "عادية", timeFromStart: 56, status: "تحت الإنشاء" },
  "مسجد الفتاح العليم": { landmarks: ["مسجد الفتاح العليم الشهير", "مدخل العاصمة الإدارية الجديد من طريق السويس"], type: "عادية", timeFromStart: 60, status: "تحت الإنشاء" },
  "الحي السكني R2": { landmarks: ["الحي السكني الثاني R2 بالعاصمة", "المدينة الرياضية بالعاصمة الإدارية"], type: "عادية", timeFromStart: 65, status: "تحت الإنشاء" },
  "الدائري الإقليمي": { landmarks: ["الطريق الدائري الإقليمي بمحيط العاصمة", "بوابات العاصمة الإدارية الرئيسية"], type: "عادية", timeFromStart: 69, status: "تحت الإنشاء" },
  "فندق الماسة": { landmarks: ["فندق الماسة كابيتال الشهير", "منطقة السي آي دي (حي المال والأعمال)"], type: "عادية", timeFromStart: 73, status: "تحت الإنشاء" },
  "الحي الحكومي": { landmarks: ["مجلس النواب ومجلس الوزراء بالعاصمة", "الحي الوزاري", "ساحة الشعب"], type: "عادية", timeFromStart: 77, status: "تحت الإنشاء" },
  "حي السفارات": { landmarks: ["حي السفارات والبعثات الدبلوماسية", "الكاتدرائية الكبرى بالعاصمة"], type: "عادية", timeFromStart: 80, status: "تحت الإنشاء" },
  "مدينة الفنون والثقافة": { landmarks: ["مدينة الفنون والثقافة بالعاصمة", "محطة القطار الكهربائي LRT", "النهر الأخضر الكبير"], type: "نهائية - تبادلية مع القطار الكهربائي الخفيف LRT", timeFromStart: 84, status: "تشغيل تجريبي" },

  // West Line
  "أكتوبر الجديدة": { landmarks: ["منطقة حدائق أكتوبر الجديدة", "أحياء أكتوبر السكنية الغربية", "المنطقة الصناعية"], type: "نهائية", timeFromStart: 0, status: "تحت الإنشاء" },
  "المنطقة الصناعية": { landmarks: ["المنطقة الصناعية الكبرى بالسادس من أكتوبر", "مجمع المصانع والمعارض"], type: "عادية", timeFromStart: 5, status: "تحت الإنشاء" },
  "السادات": { landmarks: ["محور السادات الرئيسي بأكتوبر", "محيط الأحياء السكنية (الثاني والثالث)"], type: "عادية", timeFromStart: 10, status: "تحت الإنشاء" },
  "جهاز مدينة 6 أكتوبر": { landmarks: ["مقر جهاز مدينة 6 أكتوبر", "أكتوبر سيتي سنتر", "شارع المحور المركزي"], type: "عادية", timeFromStart: 14, status: "تحت الإنشاء" },
  "جمعية المهندسين": { landmarks: ["كمبوند جمعية المهندسين بأكتوبر", "محور جمال عبد الناصر الرئيسي"], type: "عادية", timeFromStart: 18, status: "تحت الإنشاء" },
  "جامعة النيل": { landmarks: ["جامعة النيل الأهلية", "مول العرب الشهير", "ميدان جهينة محور 26 يوليو"], type: "تبادلية", timeFromStart: 22, status: "تحت الإنشاء" },
  "هايبر وان": { landmarks: ["هايبر وان الشيخ زايد", "المدخل الرئيسي للشيخ زايد", "جامعة القاهرة فرع زايد"], type: "عادية", timeFromStart: 26, status: "تحت الإنشاء" },
  "الصحراوي": { landmarks: ["طريق مصر إسكندرية الصحراوي", "القرية الذكية بالتجمع الغربي", "داندي مول"], type: "عادية", timeFromStart: 30, status: "تحت الإنشاء" },
  "المنصورية": { landmarks: ["طريق المنصورية الريفي والسياحي", "منطقة أبو رواش الأثرية"], type: "عادية", timeFromStart: 35, status: "تحت الإنشاء" },
  "المريوطية": { landmarks: ["ترعة المريوطية السياحية", "منطقة الهرم السياحية", "فنادق المريوطية"], type: "عادية", timeFromStart: 39, status: "تحت الإنشاء" },
  "الطريق الدائري": { landmarks: ["الطريق الدائري الغربي حول الجيزة", "منطقة المنيب والمريوطية"], type: "عادية", timeFromStart: 43, status: "تحت الإنشاء" },
  "العريش": { landmarks: ["شارع الهرم الرئيسي (تقاطع العريش)", "سينما رادوبيس والمنطقة التجارية"], type: "عادية", timeFromStart: 47, status: "تحت الإنشاء" },
  "المطبغة": { landmarks: ["شارع الملك فيصل الرئيسي (منطقة المطبغة)", "حي بولاق الدكرور الجنوبي"], type: "عادية", timeFromStart: 51, status: "تحت الإنشاء" },
  "بولاق الدكرور": { landmarks: ["شارع همفرس بولاق الدكرور", "محطة مترو بولاق الدكرور (الخط الثالث)"], type: "تبادلية", timeFromStart: 55, status: "تحت الإنشاء" },
  "جامعة الدول العربية": { landmarks: ["شارع جامعة الدول العربية بالمهندسين", "ميدان مصطفى محمود", "نادي الصيد المصري"], type: "عادية", timeFromStart: 59, status: "تحت الإنشاء" },
  "وادي النيل": { landmarks: ["شارع وادي النيل بالمهندسين", "محطة مترو وادي النيل (الخط الثالث)", "تقاطع المهندسين والعجوزة"], type: "نهائية - تبادلية مع الخط الثالث للمترو", timeFromStart: 63, status: "تشغيل تجريبي" }
};

export default function MonorailPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [activeLine, setActiveLine] = useState<"east" | "west">("east");
  const [loadingStations, setLoadingStations] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStations();
    }
  }, [user]);

  const loadStations = async () => {
    setLoadingStations(true);
    if (!supabase) {
      setStations(getLocalStations());
      setLoadingStations(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("monorail_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error) {
        setStations(getLocalStations());
      } else {
        setStations(data || []);
      }
    } catch (err) {
      setStations(getLocalStations());
    } finally {
      setLoadingStations(false);
    }
  };

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_MONORAIL;
    const local = localStorage.getItem("local_monorail");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_MONORAIL;
      }
    }
    localStorage.setItem("local_monorail", JSON.stringify(DEFAULT_MONORAIL));
    return DEFAULT_MONORAIL;
  };

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "mishwar" || profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold") && !isExpired);

  if (authLoading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "120px", textAlign: "center", direction: "rtl" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--accent-ios, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 24px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>جاري التحقق من تفاصيل الاشتراك الفضي...</p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  // Paywall / Lock screen matching Metro & Directory premium view style
  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)" }}>
        {/* Banner matching Metro */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bg-primary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--border-glass)",
          direction: "rtl"
        }}>
          {/* Back Button */}
          <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
            <Link 
              href="/" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--bg-glass-card)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
                textDecoration: "none"
              }}
            >
              <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
            </Link>
          </div>

          {/* Cover Image Banner */}
          <div className="metro-animate-slide-down" style={{
            position: "relative",
            width: "100%",
            maxWidth: "800px",
            height: "clamp(140px, 22vh, 200px)",
            margin: "0 auto 20px",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border-glass)",
            boxShadow: "var(--shadow-card)",
            background: "var(--bg-glass-card)",
          }}>
            <img
              src="/images/metro/metro_cover.jpeg"
              alt="Cairo Metro Cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)",
              pointerEvents: "none",
            }} />
          </div>

          <div className="metro-animate-slide-up metro-delay-100">
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--text-primary)",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>قطار المونوريل</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              خريطة تفاعلية تفصيلية لشبكة المونوريل الجديدة.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
          <div className="metro-animate-slide-up metro-delay-200" style={{ 
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)", 
            borderRadius: "15px",
            padding: "35px 25px", 
            textAlign: "center",
            marginTop: "32px",
            boxShadow: "var(--shadow-card)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Lock Icon */}
            <div style={{ 
              fontSize: "4rem", 
              marginBottom: "24px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "90px",
              height: "90px",
              background: "rgba(251, 191, 36, 0.08)",
              borderRadius: "50%",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              color: "#fbbf24",
              animation: "pulse-gold 2s infinite"
            }}>
              <i className="bx bxs-lock-alt"></i>
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-display)" }}>
              دليل المونوريل ميزة مدفوعة 🥈
            </h2>
            
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح الخريطة التفصيلية والمسارات الزمنية لخطوط المونوريل (شرق وغرب النيل) متاح للمشتركين بالباقة الفضية أو الذهبية.
            </p>

            {/* Perks list */}
            <div style={{ 
              background: "rgba(128, 128, 128, 0.04)", 
              padding: "18px 20px", 
              borderRadius: "12px", 
              border: "1px solid var(--border-glass)", 
              textAlign: "right", 
              margin: "0 auto 28px", 
              maxWidth: "420px" 
            }}>
              <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bxs-award" style={{ color: "#fbbf24", fontSize: "1.1rem" }}></i>
                <span>ميزات الباقة الفضية (40 ج.م/شهرياً):</span>
              </div>
              <ul style={{ 
                paddingRight: "16px", 
                margin: 0, 
                fontSize: "0.85rem", 
                color: "var(--text-secondary)", 
                lineHeight: "1.6", 
                display: "flex", 
                flexDirection: "column", 
                gap: "6px",
                fontFamily: "var(--font-body)"
              }}>
                <li>✨ عرض تفاصيل ومحطات خطوط المونوريل كاملة.</li>
                <li>✨ معرفة المحطات التبادلية والاتجاهات ومعالم المحيط.</li>
                <li>✨ حساب أوقات الرحلات التقديرية بالدقائق.</li>
              </ul>
            </div>

            {/* CTAs */}
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
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 15px rgba(250, 204, 21, 0.2)",
                    display: "block"
                  }}
                >
                  🚀 اشترك الآن ورقّ حسابك
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
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.2)",
                    display: "block"
                  }}
                >
                  🔑 سجل دخولك لتفعيل المزايا
                </Link>
              )}
              
              <Link
                href="/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(128, 128, 128, 0.05)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  border: "1px solid var(--border-glass)",
                  display: "block"
                }}
              >
                تصفح خطوط المترو المجانية
              </Link>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse-gold {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.3); }
            50% { transform: scale(1.03); box-shadow: 0 0 15px 8px rgba(251, 191, 36, 0.12); }
          }
        `}} />
      </div>
    );
  }

  // Filter stations based on active line and search query
  const lineStations = stations
    .filter(s => s.line_type === activeLine)
    .sort((a, b) => a.station_order - b.station_order)
    .filter(s => s.name.includes(searchQuery.trim()));

  // Active line statistics
  const lineStats = {
    east: {
      length: "56.5 كم",
      stationsCount: 22,
      designSpeed: "80 كم/س",
      time: "60 دقيقة",
      color: "#3b82f6",
      colorLight: "rgba(59, 130, 246, 0.12)",
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)"
    },
    west: {
      length: "42 كم",
      stationsCount: 16,
      designSpeed: "80 كم/س",
      time: "45 دقيقة",
      color: "#10b981",
      colorLight: "rgba(16, 185, 129, 0.12)",
      gradient: "linear-gradient(135deg, #10b981, #34d399)"
    }
  };

  const currentStats = lineStats[activeLine];

  const handleStationClick = (stationName: string) => {
    if (expandedStation === stationName) {
      setExpandedStation(null);
    } else {
      setExpandedStation(stationName);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>
      {/* CSS internal styles definition for custom hover effects and keyframe animation states */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .pulse-node-east {
          animation: pulse-node-east-anim 2.5s infinite;
        }
        .pulse-node-west {
          animation: pulse-node-west-anim 2.5s infinite;
        }

        @keyframes pulse-node-east-anim {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 12px 6px rgba(59, 130, 246, 0.25); }
        }
        @keyframes pulse-node-west-anim {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 12px 6px rgba(16, 185, 129, 0.25); }
        }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bg-primary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
      }}>
        {/* Back Button
        <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
          <Link 
            href="/" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--bg-glass-card)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </div> */}

        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "bold",
            color: "var(--text-primary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/searchBar/Cairo_monorail.png" alt="" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
            دليل قطار المونوريل</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            استكشف المحطات والاتجاهات والمعالم الهامة لخطوط شرق وغرب النيل.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#3b82f6",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>شرق النيل (العاصمة)</span>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>غرب النيل (أكتوبر)</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

        {/* Search Panel Card - Styled matching Metro searchCard & Directory searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--accent-ios)" }}></i> ابحث في محطات المونوريل
            </label>
            <input
              className="ios-input"
              type="text"
              placeholder="ابحث باسم المحطة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-cairo)",
                height: "50px",
              }}
            />
          </div>

          {/* Line Selector Tab Switcher (Matching Directory Categories Tabs style) */}
          <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-glass)", paddingTop: "14px" }}>
            <button
              onClick={() => {
                setActiveLine("east");
                setExpandedStation(null);
              }}
              style={{
                background: activeLine === "east" ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
                border: `1px solid ${activeLine === "east" ? "var(--accent-ios)" : "var(--border-glass)"}`,
                color: activeLine === "east" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "8px 16px",
                borderRadius: "50px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "var(--font-cairo)",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              📍 شرق النيل (العاصمة)
            </button>

            <button
              onClick={() => {
                setActiveLine("west");
                setExpandedStation(null);
              }}
              style={{
                background: activeLine === "west" ? "rgba(16, 185, 129, 0.15)" : "var(--bg-secondary)",
                border: `1px solid ${activeLine === "west" ? "var(--accent-success)" : "var(--border-glass)"}`,
                color: activeLine === "west" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "8px 16px",
                borderRadius: "50px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "var(--font-cairo)",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              📍 غرب النيل (أكتوبر)
            </button>
          </div>
        </div>

        {/* Route Info & Stats - Beautiful clean directory matching rows */}
        <div className="metro-animate-slide-up metro-delay-300" style={{ 
          marginTop: "20px", 
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "16px",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              📏 طول المسار: <strong style={{ color: "var(--text-primary)" }}>{currentStats.length}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              🚉 إجمالي المحطات: <strong style={{ color: "var(--text-primary)" }}>{currentStats.stationsCount} محطة</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              ⏱️ زمن الرحلة: <strong style={{ color: "var(--text-primary)" }}>~ {currentStats.time}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              ⚡ السرعة التصميمية: <strong style={{ color: "var(--text-primary)" }}>{currentStats.designSpeed}</strong>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border-glass)", marginTop: "12px", paddingTop: "12px", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            ℹ️ {activeLine === "east" ? (
              <span>يربط مدينة نصر (الاستاد) بالعاصمة الإدارية الجديدة لخدمة أحياء شرق القاهرة والتجمع الخامس.</span>
            ) : (
              <span>يربط الجيزة (وادي النيل) بمدينة السادس من أكتوبر لخدمة مواطني الجيزة وضواحي أكتوبر.</span>
            )}
          </div>
        </div>

        {/* Timeline list of stations styled matching Directory item cards */}
        <div className="metro-animate-slide-up metro-delay-400" style={{ marginTop: "24px" }}>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.2rem",
            fontWeight: "800",
            color: "var(--text-primary)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <i style={{ color: currentStats.color }} className="bx bx-station"></i>
            محطات الخط ({lineStations.length})
          </h2>

          {loadingStations ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              <span style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid var(--border-glass)", borderTopColor: currentStats.color, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>جاري تحميل محطات المونوريل...</p>
            </div>
          ) : lineStations.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "15px"
            }}>
              <p>لم يتم العثور على محطات مطابقة للبحث</p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingRight: "35px" }}>
              {/* Timeline Vertical Line with Neon Glow */}
              <div style={{
                position: "absolute",
                top: "12px",
                bottom: "12px",
                right: "13px",
                width: "4px",
                background: `linear-gradient(to bottom, ${currentStats.color}, var(--border-glass))`,
                borderRadius: "4px",
                filter: `drop-shadow(0 0 3px ${currentStats.color})`
              }} />

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {lineStations.map((station, index) => {
                  const details = STATION_DETAILS[station.name];
                  const isExpanded = expandedStation === station.name;
                  const isFirst = station.station_order === 1;
                  const isLast = station.station_order === currentStats.stationsCount;
                  const isTerminal = isFirst || isLast;
                  const isTransfer = station.name.includes("الاستاد") || station.name.includes("الفنون") || station.name.includes("وادي النيل") || station.name.includes("الجامعة الأمريكية") || station.name.includes("المشير") || station.name.includes("جامعة النيل") || station.name.includes("بولاق");

                  return (
                    <div key={station.id || index} style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                      
                      {/* Circle Node on the timeline */}
                      <div 
                        className={`${isTerminal ? (activeLine === "east" ? "pulse-node-east" : "pulse-node-west") : ""}`}
                        style={{
                          position: "absolute",
                          right: "-29px",
                          top: "15px",
                          width: isTerminal ? "22px" : "16px",
                          height: isTerminal ? "22px" : "16px",
                          borderRadius: "50%",
                          background: isTerminal ? "#fff" : (isTransfer ? "rgba(255,255,255,0.9)" : currentStats.color),
                          border: `4.5px solid var(--bg-primary, #000)`,
                          boxShadow: isTransfer ? "0 0 8px rgba(255,255,255,0.5)" : "none",
                          zIndex: 2,
                          transform: isTerminal ? "translateY(-3px)" : "none",
                          transition: "all 0.3s ease"
                        }} 
                      />

                      {/* Content Box - Styled matching Directory item cards */}
                      <div
                        onClick={() => handleStationClick(station.name)}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          border: isExpanded ? `1px solid ${currentStats.color}` : "1px solid var(--border-glass)",
                          borderRadius: "15px",
                          padding: "16px",
                          marginRight: "10px",
                          boxShadow: "var(--shadow-card)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          cursor: "pointer",
                          transition: "transform 0.2s ease, border-color 0.2s ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        {/* Header Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ 
                              fontSize: "1.02rem", 
                              fontWeight: "700", 
                              color: "var(--text-primary)",
                              fontFamily: "var(--font-heading)" 
                            }}>
                              {station.name}
                            </span>
                            
                            {isTerminal && (
                              <span style={{ 
                                background: "rgba(239, 68, 68, 0.12)", 
                                color: "#ef4444", 
                                fontSize: "0.68rem", 
                                padding: "2px 6px", 
                                borderRadius: "4px", 
                                fontWeight: "bold"
                              }}>
                                نهائية
                              </span>
                            )}

                            {isTransfer && !isTerminal && (
                              <span style={{ 
                                background: "rgba(251, 191, 36, 0.12)", 
                                color: "#fbbf24", 
                                fontSize: "0.68rem", 
                                padding: "2px 6px", 
                                borderRadius: "4px", 
                                fontWeight: "bold"
                              }}>
                                تبادلية
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ 
                              fontSize: "0.78rem", 
                              color: "var(--text-muted)", 
                              background: "rgba(128, 128, 128, 0.08)", 
                              padding: "4px 8px", 
                              borderRadius: "6px",
                              fontWeight: "bold" 
                            }}>
                              محطة {station.station_order}
                            </span>
                            <i className={`bx bx-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: "var(--text-secondary)", fontSize: "1.3rem" }}></i>
                          </div>
                        </div>

                        {/* Expandable landmarks and details block matching Directory entries expansion */}
                        {isExpanded && (
                          <div style={{ 
                            borderTop: "1px solid var(--border-glass)", 
                            paddingTop: "12px", 
                            marginTop: "4px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            animation: "fadeIn 0.25s ease"
                          }}>
                            {details ? (
                              <>
                                {/* Landmarks */}
                                <div>
                                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "700" }}>
                                    📍 المعالم القريبة:
                                  </div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {details.landmarks.map((landmark, idx) => (
                                      <span key={idx} style={{ 
                                        background: "var(--bg-secondary)", 
                                        color: "var(--text-secondary)", 
                                        fontSize: "0.78rem", 
                                        padding: "4px 10px", 
                                        borderRadius: "6px",
                                        border: "1px solid var(--border-glass)"
                                      }}>
                                        {landmark}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Additional metadata info row */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "4px" }}>
                                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                                    ⏱️ زمن الوصول التقريبي: <strong style={{ color: "var(--text-primary)" }}>{details.timeFromStart} دقيقة</strong>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                                    🔗 الربط والتبادل: <strong style={{ color: "var(--text-primary)" }}>{details.type}</strong>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                                    🟢 حالة التشغيل: <strong style={{ color: details.status === "تشغيل تجريبي" ? "#10b981" : "#fbbf24" }}>{details.status}</strong>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                لا توجد تفاصيل إضافية مسجلة لهذه المحطة.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
