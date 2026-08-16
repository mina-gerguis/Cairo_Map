"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface BusCompany {
  name: string;
  phone: string;
  type: string;
  logo?: string;
}

interface BusStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  companies: BusCompany[];
  destinations: string[];
  description: string;
  map_url: string;
}

const DEFAULT_BUS_STATIONS: BusStation[] = [
  {
    name: "موقف ألماظة للسوبر جيت (Almaza Terminal)",
    location: "مصر الجديدة - بجوار طريق السويس ومطار القاهرة",
    governorate: "القاهرة",
    companies: [
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "رسمي حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "شرم الشيخ", "الغردقة", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "السويس", "بورسعيد"],
    description: "أحدث محطات السوبر جيت في القاهرة. تخدم بشكل رئيسي المسافرين إلى مدن القناة، البحر الأحمر، والوجه القبلي والصعيد بتنظيم ممتاز وصالة انتظار مكيفة.",
    map_url: "https://maps.google.com/?q=Almaza+Super+Jet+Station"
  },
  {
    name: "موقف الترجمان (Cairo Gateway)",
    location: "وسط البلد - شارع الجلاء بجوار محطة مترو جمال عبد الناصر",
    governorate: "القاهرة",
    companies: [
      { name: "شركة شرق الدلتا للنقل", phone: "02-25761311", type: "حكومي" },
      { name: "شركة غرب ووسط الدلتا", phone: "02-25761211", type: "حكومي" },
      { name: "شركة الصعيد للنقل", phone: "02-25761411", type: "حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "مطروح", "المنصورة", "الزقازيق", "شبه جزيرة سيناء (العريش/طور سيناء)", "محافظات الصعيد بأكملها", "البحر الأحمر"],
    description: "المحطة المركزية الكبرى للنقل البري لجميع المحافظات والدول المجاورة. يضم مكاتب حجز لمعظم الشركات العامة والخاصة وصالة انتظار تجارية ضخمة.",
    map_url: "https://maps.google.com/?q=Torgoman+Bus+Station"
  },
  {
    name: "موقف عبد المنعم رياض (التحرير)",
    location: "وسط البلد - ميدان التحرير خلف المتاحف والمكتبة وبجوار هيلتون",
    governorate: "القاهرة",
    companies: [
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" },
      { name: "بلو باص (Blue Bus)", phone: "16148", type: "خاص فاخر" },
      { name: "سوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: ["الإسكندرية", "الساحل الشمالي", "شرم الشيخ", "دهب", "الغردقة", "المنيا", "أسيوط", "قنا", "الأقصر"],
    description: "موقع استراتيجي بقلب القاهرة يتيح للمسافرين ركوب الحافلات السياحية الفاخرة مباشرة فور الخروج من محطة مترو السادات بالتحرير.",
    map_url: "https://maps.google.com/?q=Abdel+Moneim+Riad+Bus+Station"
  },
  {
    name: "موقف عبود الإقليمي",
    location: "شمال القاهرة - شبرا بمقربة من الطريق الدائري ومترو المظلات",
    governorate: "القاهرة",
    companies: [
      { name: "أتوبيسات غرب الدلتا", phone: "19142", type: "اقتصادي" },
      { name: "أتوبيسات شرق الدلتا", phone: "02-22448400", type: "اقتصادي" }
    ],
    destinations: ["طنطا", "المحلة الكبرى", "المنصورة", "دمنهور", "كفر الشيخ", "الإسكندرية", "بلبيس", "الزقازيق"],
    description: "الموقف الرئيسي والأكبر لربط القاهرة بجميع محافظات الوجه البحري والدلتا. يضم أتوبيسات السفر الاقتصادية وسيارات الأجرة الإقليمية الكبرى.",
    map_url: "https://maps.google.com/?q=Abboud+Bus+Station"
  },
  {
    name: "موقف المنيب الإقليمي",
    location: "الجيزة - المنيب بجوار محطة مترو المنيب والطريق الدائري",
    governorate: "الجيزة",
    companies: [
      { name: "شركة الصعيد للنقل والاتوبيسات", phone: "19142", type: "حكومي" },
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: ["الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "الواحات البحرية"],
    description: "البوابة الجنوبية للقاهرة والجيزة ومركز النقل الرئيسي المتجه إلى محافظات الصعيد والوجه القبلي والفيوم والواحات.",
    map_url: "https://maps.google.com/?q=Moneeb+Bus+Station"
  }
];

export default function BusStationsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<BusStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadStations();
    }
  }, [user, hasAccess]);

  const loadStations = async () => {
    setLoading(true);
    if (!supabase) {
      setStations(getLocalStations());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bus_stations")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setStations(getLocalStations());
      } else {
        setStations(data || []);
      }
    } catch (err) {
      setStations(getLocalStations());
    } finally {
      setLoading(false);
    }
  };

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_BUS_STATIONS;
    const local = localStorage.getItem("local_bus_stations");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_BUS_STATIONS;
      }
    }
    localStorage.setItem("local_bus_stations", JSON.stringify(DEFAULT_BUS_STATIONS));
    return DEFAULT_BUS_STATIONS;
  };

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ـ/g, ""); // remove kashida
  };

  const filteredStations = stations.filter(s => {
    const normQuery = normalizeArabic(searchQuery.trim());
    if (normQuery.length === 0) return true;
    return (
      normalizeArabic(s.name).includes(normQuery) ||
      normalizeArabic(s.location).includes(normQuery) ||
      normalizeArabic(s.description).includes(normQuery) ||
      s.destinations.some(d => normalizeArabic(d).includes(normQuery))
    );
  });

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
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>جاري التحقق من التفاصيل ...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)" }}>
        {/* Banner matching Metro Cover Style */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bg-primary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--border-glass)",
          direction: "rtl"
        }}>
          {/* Back Button */}
          <div style={{ position: "absolute", top: "20px", right: "8px", zIndex: 10 }}>
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

          <div className="metro-animate-slide-up metro-delay-100">
            <h1 style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginLeft: "10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/searchBar/Cairo_bus.png" alt="Cairo Bus" style={{ width: "45px", marginLeft: "10px" }} />
              مواقف الأتوبيسات
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto", lineHeight: "1.6" }}>
              دليلك لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى.
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
            <div style={{ marginBottom: "24px" }}>
              <img src="/images/lock_cairo_map.png" alt="Lock" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "14px" }}>
               مواقف الأتوبيسات يتطلب اشتراك في الباقة الذهبية
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح دليل مواقف أتوبيسات السفر بين المدن والشركات العاملة بها والوجهات متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
            </p>

            {/* Perks list */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "12px",
              padding: "16px 20px",
              textAlign: "right",
              margin: "0 auto 32px",
              maxWidth: "440px"
            }}>
              <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية:</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✨ تفاصيل مواقف الأتوبيسات الرئيسية (ألماظة، الترجمان، المنيب، عبود، إلخ)</li>
                <li>✨ دليل الشركات المتاحة (السوبر جيت، جو باص، غرب ووسط الدلتا، إلخ)</li>
                <li>✨ أرقام التليفونات والخطوط الساخنة ووجهات السفر</li>
                <li>✨ تشمل أيضاً المطارات والموانئ ومواقف الميكروباص ومخطط الرحلات بالكامل</li>
              </ul>
            </div>

            {/* Call to Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "var(--bg-subscribe-button-gold)",
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    boxShadow: "var(--bs-subscribe-button-gold)",
                    display: "block"
                  }}
                >
                  اشترك في الباقة الذهبية
                </Link>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "var(--bg-subscribe-button-base)",
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    boxShadow: "var(--bs-subscribe-button-base)",
                    display: "block"
                  }}
                >
                  سجل دخولك أولاً لتفعيل الاشتراك
                </Link>
              )}
              
              <Link
                href="/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  border: "1px solid var(--border-glass)",
                  display: "block"
                }}
              >
                الرجوع للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)" }}>
      {/* Header Banner - Cover Image Banner matching Metro / Monorail Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bg-primary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
        direction: "rtl"
      }}>
        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "600",
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/searchBar/Cairo_bus.png" alt="Cairo Bus" style={{ width: "40px", marginLeft: "10px" }} />
            مواقف الأتوبيسات 
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto", lineHeight: "1.6" }}>
            دليلك لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
        
        {/* Search Panel Card - Styled matching Metro / Monorail Search */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-card)",
          position: "relative",
          zIndex: 20,
        }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
            🔍 ابحث عن موقف أو وجهة سفر
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="ابحث باسم الموقف، أو الوجهة ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="ios-input"
              style={{
                width: "100%",
                padding: "14px 44px 14px 16px",
                borderRadius: "12px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-glass)",
                fontFamily: "var(--font-cairo)",
                fontSize: "0.95rem",
                height: "50px",
                textAlign: "right",
                direction: "rtl"
              }}
            />
            <i className="bx bx-search" style={{
              position: "absolute",
              top: "50%",
              right: "16px",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              fontSize: "1.3rem"
            }}></i>
          </div>
        </div>

        {/* Bus Stations Explorer Section - Metro style */}
        <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "24px" }}>
          <div style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "15px",
            padding: "20px",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            {/* Instruction Banner */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "0.78rem",
              color: "var(--text-secondary)"
            }}>
              <i className="bx bx-info-circle" style={{ color: "var(--accent-ios)", fontSize: "0.95rem" }} />
              <span>انقر على اسم أي موقف لعرض تفاصيله الكاملة وموقعه على الخريطة.</span>
            </div>

            {/* Stations Accordion List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-ios)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري تحميل البيانات...</span>
                </div>
              ) : filteredStations.length > 0 ? (
                filteredStations.map((station, idx) => {
                  const isExpanded = expandedStation === station.name;
                  return (
                    <div
                      key={station.id || idx}
                      style={{
                        border: "1px solid var(--border-glass)",
                        borderRadius: "12px",
                        background: "var(--bg-secondary)",
                        overflow: "hidden",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => setExpandedStation(isExpanded ? null : station.name)}
                        style={{
                          padding: "16px 20px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(255, 255, 255, 0.01)"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--accent-ios)",
                            fontSize: "1.2rem"
                          }}>
                            <i className="bx bx-bus"></i>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)" }}>
                              {station.name}
                            </h3>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                              <i className="bx bxs-location-plus" style={{ color: "var(--color-red-600)" }}></i> {station.location}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            fontSize: "0.75rem",
                            background: "var(--color-blue-600)",
                            color: "var(--color-white-50)",
                            border: "1px solid var(--border-glass)",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontWeight: "700"
                          }}>
                            {station.governorate}
                          </span>
                          <i
                            className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`}
                            style={{
                              fontSize: "1.3rem",
                              color: "var(--text-muted)",
                              transition: "transform 0.2s"
                            }}
                          />
                        </div>
                      </div>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div style={{
                          padding: "20px",
                          borderTop: "1px solid var(--border-glass)",
                          background: "var(--bg-secondary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          animation: "metro-slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
                        }}>
                          {/* Description */}
                          <div>
                            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                              {station.description}
                            </p>
                          </div>

                          {/* Companies inside the station */}
                          {Array.isArray(station.companies) && station.companies.length > 0 && (
                            <div>
                              <strong style={{ color: "var(--text-primary)", fontSize: "0.9rem", display: "block", marginBottom: "8px" }}>
                                <i className="bx bxs-bus" style={{ color: "var(--accent-ios)" }}></i> شركات السفر والحجز المتاحة بالداخل:
                              </strong>
                              <div style={{ display: "flex", flexDirection: "column", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                                {station.companies.map((company, cIdx) => (
                                  <div
                                    key={cIdx}
                                    style={{
                                      padding: "12px",
                                      borderRadius: "10px",
                                      background: "var(--bg-primary)",
                                      border: "1px solid var(--border-glass)",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center"
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "right" }}>
                                      {company.logo && (
                                        <div style={{
                                          width: "50px",
                                          height: "45px",
                                          borderRadius: "8px",
                                          background: "none",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          padding: "4px",
                                          border: "none",
                                          flexShrink: 0
                                        }}>
                                          <img
                                            src={`/images/busStations/${company.logo}`}
                                            alt={company.name}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "contain"
                                            }}
                                            onError={(e) => {
                                              (e.target as HTMLElement).parentElement!.style.display = "none";
                                            }}
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <span style={{ color: "var(--text-primary)", fontWeight: "700", fontSize: "0.85rem", display: "block" }}>
                                          {company.name}
                                        </span>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                          {company.type}
                                        </span>
                                      </div>
                                    </div>
                                    <a
                                      href={`tel:${company.phone}`}
                                      style={{
                                        background: "rgba(59, 130, 246, 0.1)",
                                        color: "var(--accent-ios)",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        fontSize: "0.8rem",
                                        fontWeight: "700",
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px"
                                      }}
                                    >
                                      <i className="bx bx-phone" style={{ fontSize: "0.95rem" }}></i>
                                      {company.phone}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Served destinations */}
                          {Array.isArray(station.destinations) && station.destinations.length > 0 && (
                            <div>
                              <strong style={{ color: "var(--text-primary)", fontSize: "0.9rem", display: "block", marginBottom: "6px" }}>
                                🚌 أهم الوجهات المباشرة من الموقف:
                              </strong>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {station.destinations.map((dest, dIdx) => (
                                  <span
                                    key={dIdx}
                                    style={{
                                      fontSize: "0.75rem",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      border: "1px solid var(--border-glass)",
                                      padding: "4px 10px",
                                      borderRadius: "8px",
                                      color: "var(--text-primary)"
                                    }}
                                  >
                                    {dest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Map Directions */}
                          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                            <a
                              href={station.map_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "8px 18px",
                                borderRadius: "8px",
                                background: "var(--accent-ios)",
                                color: "#ffffff",
                                textDecoration: "none",
                                fontWeight: "700",
                                fontSize: "0.82rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.opacity = "0.9";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.opacity = "1";
                              }}
                            >
                              <i className="bx bx-map" style={{ fontSize: "1.15rem" }}></i>
                              عرض الموقع والاتجاهات
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)"
                }}>
                  لا توجد مواقف أتوبيسات مطابقة لبحثك. يرجى تعديل الكلمات والمحاولة مجدداً.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
