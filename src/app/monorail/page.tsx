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

export default function MonorailPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [activeLine, setActiveLine] = useState<"east" | "west">("east");
  const [loadingStations, setLoadingStations] = useState(true);

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
            خريطة المنورايل ميزة مدفوعة 🥈
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

  const lineStations = stations
    .filter(s => s.line_type === activeLine)
    .sort((a, b) => a.station_order - b.station_order);

  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingTop: "40px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
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
      <div className="glass-panel" style={{ padding: "40px 30px", marginBottom: "32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ 
          position: "absolute", 
          top: "-20px", 
          right: "-20px", 
          width: "120px", 
          height: "120px", 
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🚄</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "8px", color: "var(--text-primary)" }}>
          دليل محطات المنورايل
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto" }}>
          استكشف محطات المونوريل الجديد لخطوط شرق وغرب النيل. يمكنك تعديل هذه البيانات وتحديثها عبر لوحة الأدمن.
        </p>
      </div>

      {/* Line Selector Buttons */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveLine("east")}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.25s",
            fontSize: "1rem",
            border: "1px solid",
            borderColor: activeLine === "east" ? "rgba(59, 130, 246, 0.3)" : "var(--border-glass)",
            background: activeLine === "east" ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
            color: activeLine === "east" ? "#3b82f6" : "var(--text-secondary)"
          }}
        >
          📍 شرق النيل (العاصمة الإدارية)
        </button>
        <button
          onClick={() => setActiveLine("west")}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.25s",
            fontSize: "1rem",
            border: "1px solid",
            borderColor: activeLine === "west" ? "rgba(16, 185, 129, 0.3)" : "var(--border-glass)",
            background: activeLine === "west" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
            color: activeLine === "west" ? "#10b981" : "var(--text-secondary)"
          }}
        >
          📍 غرب النيل (6 أكتوبر)
        </button>
      </div>

      {/* Info card about the active line */}
      <div className="glass-panel" style={{ padding: "20px 24px", marginBottom: "24px" }}>
        {activeLine === "east" ? (
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.7", color: "var(--text-secondary)" }}>
            <strong>خط شرق النيل (العاصمة الإدارية):</strong> يربط مدينة نصر (محطة الاستاد التبادلية مع الخط الثالث للمترو) بالعاصمة الإدارية الجديدة، بطول 56.5 كم لخدمة أحياء شرق القاهرة والتجمع الخامس والمدن الجديدة.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.7", color: "var(--text-secondary)" }}>
            <strong>خط غرب النيل (6 أكتوبر):</strong> يربط محافظة الجيزة (محطة وادي النيل التبادلية) بمدينة 6 أكتوبر والشيخ زايد والتوسعات الغربية بطول 42 كم لخدمة ضيوف ومواطني الجيزة وغرب العاصمة.
          </p>
        )}
      </div>

      {/* Stations Timeline */}
      <div className="glass-panel" style={{ padding: "30px 24px" }}>
        {loadingStations ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-ios)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري تحميل قائمة المحطات...</span>
          </div>
        ) : lineStations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            لا توجد محطات مسجلة لهذا الخط حالياً في لوحة الإدارة.
          </div>
        ) : (
          <div style={{ position: "relative", paddingRight: "30px" }}>
            {/* Timeline Vertical Line */}
            <div style={{
              position: "absolute",
              top: "10px",
              bottom: "10px",
              right: "12px",
              width: "4px",
              background: activeLine === "east" ? "linear-gradient(to bottom, #3b82f6, #60a5fa)" : "linear-gradient(to bottom, #10b981, #34d399)",
              borderRadius: "2px"
            }} />

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {lineStations.map((station, index) => {
                const isTransfer = station.name.includes("الاستاد") || station.name.includes("الفنون") || station.name.includes("وادي النيل") || station.name.includes("بدر");
                return (
                  <div key={station.id || index} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                    
                    {/* Circle Dot */}
                    <div style={{
                      position: "absolute",
                      right: "-25px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: isTransfer ? "#fff" : (activeLine === "east" ? "#3b82f6" : "#10b981"),
                      border: "4px solid #111827",
                      boxShadow: isTransfer ? "0 0 10px rgba(255,255,255,0.6)" : "none",
                      zIndex: 2
                    }} />

                    {/* Content Box */}
                    <div style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      padding: "12px 18px",
                      marginRight: "10px",
                      flexGrow: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <span style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#fff" }}>
                          {station.name}
                        </span>
                        {isTransfer && (
                          <span style={{ marginRight: "10px", background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "20px", fontWeight: "bold" }}>
                            🔄 محطة تبادلية
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "6px" }}>
                        محطة {station.station_order}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
