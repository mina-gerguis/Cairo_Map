"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

import { Airport, DEFAULT_AIRPORTS } from "@/data/airports";
export default function AirportsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "guide">("list");

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadAirports();
    }
  }, [user, hasAccess]);

  const loadAirports = async () => {
    setLoading(true);
    if (!supabase) {
      setAirports(getLocalAirports());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("airports")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setAirports(getLocalAirports());
      } else {
        // Enriched DB data with the local JSON defaults
        const enriched = (data || []).map(dbAirport => {
          const localMatch = DEFAULT_AIRPORTS.find(
            la =>
              (la.iata_code && dbAirport.code && la.iata_code.toLowerCase() === dbAirport.code.toLowerCase()) ||
              (la.name_ar && dbAirport.name && la.name_ar.includes(dbAirport.name))
          );

          // Map DB columns to Frontend keys
          return {
            ...localMatch,
            ...dbAirport,
            name_ar: dbAirport.name || localMatch?.name_ar || "",
            name_en: dbAirport.name_en || localMatch?.name_en || "",
            iata_code: dbAirport.code || dbAirport.iata_code || localMatch?.iata_code || "",
            city_ar: dbAirport.city || dbAirport.city_ar || localMatch?.city_ar || "",
            city_en: dbAirport.city_en || localMatch?.city_en || "",
            governorate_ar: dbAirport.governorate || dbAirport.governorate_ar || localMatch?.governorate_ar || "",
            governorate_en: dbAirport.governorate_en || localMatch?.governorate_en || "",
            area_ar: dbAirport.region || dbAirport.area_ar || localMatch?.area_ar || "",
            type: dbAirport.type || localMatch?.type || "",
            type_en: dbAirport.type_en || localMatch?.type_en || "",

            short_description: dbAirport.short_desc || dbAirport.short_description || localMatch?.short_description || "",
            description: dbAirport.detailed_desc || dbAirport.description || localMatch?.description || "",

            address: dbAirport.address || localMatch?.address || "",
            capacity: dbAirport.capacity || localMatch?.capacity || "",
            terminals_count: dbAirport.terminals_count || dbAirport.terminals || localMatch?.terminals_count || "غير محدد",
            runways_count: dbAirport.runways_count || localMatch?.runways_count || "",
            runways_length: dbAirport.runways_length || localMatch?.runways_length || "",

            domestic_flights: dbAirport.domestic_flights || localMatch?.domestic_flights || "",
            international_flights: dbAirport.international_flights || localMatch?.international_flights || "",

            services: Array.isArray(dbAirport.services) ? dbAirport.services : (localMatch?.services || []),
            airlines: dbAirport.airlines || localMatch?.airlines || "غير محدد",
            destinations: dbAirport.destinations || localMatch?.destinations || "",
            connections: Array.isArray(dbAirport.connections) ? dbAirport.connections : (localMatch?.connections || []),

            nearby_landmarks: Array.isArray(dbAirport.landmarks) ? dbAirport.landmarks :
              (Array.isArray(dbAirport.nearby_landmarks) ? dbAirport.nearby_landmarks : (localMatch?.nearby_landmarks || [])),

            transportation: Array.isArray(dbAirport.transit) ? dbAirport.transit :
              (Array.isArray(dbAirport.transportation) ? dbAirport.transportation : (localMatch?.transportation || [])),

            parking: dbAirport.parking || localMatch?.parking || "",
            official_website: dbAirport.official_website || localMatch?.official_website || "",
            phone: dbAirport.phone || localMatch?.phone || "غير متوفر",
            map_url: dbAirport.map_url || localMatch?.map_url || "",

            keywords_ar: Array.isArray(dbAirport.keywords_ar) ? dbAirport.keywords_ar : (localMatch?.keywords_ar || []),
            keywords_en: Array.isArray(dbAirport.keywords_en) ? dbAirport.keywords_en : (localMatch?.keywords_en || [])
          } as Airport;
        });

        // Add any local airports that are not present in the DB
        const dbCodes = new Set((data || []).map(d => d.code ? d.code.toLowerCase() : ""));
        const missingLocals = DEFAULT_AIRPORTS.filter(la => la.iata_code && !dbCodes.has(la.iata_code.toLowerCase()));

        setAirports([...enriched, ...missingLocals]);
      }
    } catch (err) {
      setAirports(getLocalAirports());
    } finally {
      setLoading(false);
    }
  };

  const getLocalAirports = () => {
    if (typeof window === "undefined") return DEFAULT_AIRPORTS;
    const local = localStorage.getItem("local_airports");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_AIRPORTS;
      }
    }
    localStorage.setItem("local_airports", JSON.stringify(DEFAULT_AIRPORTS));
    return DEFAULT_AIRPORTS;
  };

  const filteredAirports = airports.filter(
    a =>
      a.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.governorate_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.area_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.iata_code && a.iata_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.icao_code && a.icao_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.keywords_ar.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.keywords_en.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExpand = (id: number | string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bgPrimary)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1rem", fontFamily: "var(--font-display)" }}>جاري التحقق من التفاصيل ...</p>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl", textAlign: "right" }}>
        {/* Header Banner */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bgPrimary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--borderGlass)",
        }}>
          <div className="metro-animate-slide-up metro-delay-100">
            <h1 style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/airport.png" alt="" loading="lazy" decoding="async" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
              دليل المطارات المصرية
            </h1>
            <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              دليلك الشامل للمطارات الدولية والمحلية في مصر.
            </p>
          </div>
        </div>

        {/* Main Container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
          {/* Back Button */}
          <div style={{ marginTop: "24px", marginBottom: "16px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--colorSecondary, #3b82f6)",
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
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "48px 32px",
            boxShadow: "var(--shadow-card)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
          }}>
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
              marginBottom: "24px",
            }}>
              <img src="images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
              دليل المطارات ميزة تتطلب اشتراك في الباقة الذهبية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "1rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
              تصفح دليل المطارات المصرية والصالات والخدمات وشركات الطيران العاملة بها متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
            </p>

            {/* Features list */}
            <div style={{ background: "var(--bgSecondary)", padding: "18px 24px", borderRadius: "12px", border: "1px solid var(--borderGlass)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
              <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية:</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✨ دليل المطارات المصرية (القاهرة، برج العرب، سفنكس، الغردقة، إلخ)</li>
                <li>✨ تفاصيل الصالات والخدمات المتاحة للمسافرين</li>
                <li>✨ دليل شركات الطيران العاملة وأرقام الهواتف الرسمية</li>
                <li>✨ تشمل أيضاً الموانئ ومواقف السفر ومخطط الرحلات الذكي بالكامل</li>
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
                    background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                    color: "var(--color-white-50)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 15px rgba(250, 204, 21, 0.3)",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة الذهبية
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
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
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
                  background: "var(--bgSecondary)",
                  color: "var(--textSecondary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  border: "1px solid var(--borderGlass)",
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
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl", textAlign: "right" }}>
      {/* Header Banner - Redesigned like Metro Cover */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
      }}>
        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "600",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/airport.png" alt="" loading="lazy" decoding="async" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
            دليل المطارات المصرية
          </h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            دليلك الشامل للمطارات الدولية والمحلية في مصر. ابحث عن معلومات الصالات، شركات الطيران المتاحة، أرقام الهواتف، والخدمات والوصول المباشر.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#af7e02ff",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>مطارات مصر ({airports.length}) ✈️</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--colorSecondary)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>الصالات والخدمات</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        {/* Back Button */}
        <div style={{ marginTop: "24px", marginBottom: "16px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--colorSecondary, #3b82f6)",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "0.95rem"
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Tabs Selector */}
        <div style={{
          display: "flex",
          background: "var(--bgSecondary)",
          padding: "4px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid var(--borderGlass)"
        }}>
          <button
            onClick={() => setActiveTab("list")}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "list" ? "var(--bgGlass-active, rgba(39, 39, 42, 0.9))" : "transparent",
              color: activeTab === "list" ? "var(--textPrimary)" : "var(--textSecondary)",
              fontFamily: "var(--font-cairo)",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            ✈️ قائمة المطارات
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            style={{
              flex: 1,
              padding: "10px 10px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "guide" ? "var(--bgGlass-active, rgba(39, 39, 42, 0.9))" : "transparent",
              color: activeTab === "guide" ? "var(--textPrimary)" : "var(--textSecondary)",
              fontFamily: "var(--font-cairo)",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            📖 دليل وإرشادات السفر
          </button>
        </div>

        {/* Search Panel Card - Styled matching Metro searchCard */}
        {activeTab === "list" && (
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
                <i className="bx bx-search" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> ابحث في المطارات المصرية
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="ابحث باسم المطار أو المدينة أو الكود ..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-fields"
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 16px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--textPrimary)",
                    border: "1px solid var(--borderGlass)",
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.95rem"
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
          </div>
        )}

        {/* Airports List */}
        {activeTab === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--colorSecondary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري تحميل البيانات...</span>
              </div>
            ) : filteredAirports.length > 0 ? (
              filteredAirports.map((airport, idx) => (
                <div
                  key={airport.id || idx}
                  className="metro-animate-slide-up"
                  style={{
                    backgroundColor: "var(--bgPrimary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "15px",
                    padding: "20px",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    animationDelay: `${Math.min(idx + 1, 5) * 80}ms`
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                    borderBottom: "1px solid var(--borderGlass)",
                    paddingBottom: "12px"
                  }}>
                    <div>
                      <h3 className="sub-title" style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                        {airport.name_ar}
                      </h3>
                      <div className="sub-title" style={{ fontSize: "0.82rem", color: "var(--textSecondary)", direction: "ltr", textAlign: "right", marginBottom: "6px" }}>
                        {airport.name_en}
                      </div>
                      <div className="sub-title" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "0.72rem",
                          color: "var(--colorSecondary)",
                          fontWeight: "700",
                          background: "rgba(59, 130, 246, 0.1)",
                          padding: "2px 8px",
                          borderRadius: "50px",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          display: "inline-block"
                        }}>
                          {airport.type}
                        </span>
                        {(airport.iata_code || airport.icao_code) && (
                          <span style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            fontWeight: "700",
                            background: "var(--bgSecondary)",
                            padding: "2px 8px",
                            borderRadius: "50px",
                            border: "1px solid var(--borderGlass)",
                            display: "inline-block"
                          }}>
                            {[airport.iata_code, airport.icao_code].filter(Boolean).join(" / ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "left", flexShrink: 0 }}>
                      <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: "600" }}>
                        المحافظة / المدينة
                      </span>
                      <span style={{ color: "var(--textPrimary)", fontSize: "0.85rem", fontWeight: "700" }}>
                        📍 {airport.city_ar}، {airport.governorate_ar}
                      </span>
                      <span style={{ display: "block", color: "var(--textSecondary)", fontSize: "0.72rem", marginTop: "2px" }}>
                        {airport.area_ar}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", lineHeight: "1.6" }}>
                    <div className="sub-title" style={{ margin: 0, color: "var(--textSecondary)" }}>{airport.short_description}</div>
                  </div>

                  {/* Collapsible Details Panel */}
                  {expandedId === airport.id && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      marginTop: "12px",
                      borderTop: "1px dashed var(--borderGlass)",
                      paddingTop: "16px",
                      animation: "fadeIn 0.25s ease"
                    }}>
                      {/* Detailed Description */}
                      <div>
                        <div style={{ color: "var(--textPrimary)", fontWeight: "700", fontSize: "0.88rem", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="bx bx-detail" style={{ color: "var(--colorSecondary)", fontSize: "1.1rem" }}></i>
                          <span>الوصف التفصيلي:</span>
                        </div>
                        <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.85rem" }}>{airport.description}</p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                        {/* Infrastructure */}
                        <div style={{ background: "var(--bgSecondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--borderGlass)" }}>
                          <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "4px" }}>📐 البنية التحتية والسعة</div>
                          <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <li>🚪 <strong>مباني الركاب:</strong> {airport.terminals_count || "غير محدد"}</li>
                            <li>👥 <strong>الطاقة الاستيعابية:</strong> {airport.capacity || "غير محدد"}</li>
                            <li>🛣️ <strong>المدارج:</strong> {airport.runways_count || "1 مدرج"} {airport.runways_length ? `(طول: ${airport.runways_length})` : ""}</li>
                          </ul>
                        </div>

                        {/* Location & Coordinates */}
                        <div style={{ background: "var(--bgSecondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--borderGlass)" }}>
                          <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "4px" }}>🌐 الموقع والعنوان</div>
                          <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <li>📍 <strong>العنوان بالتفصيل:</strong> {airport.address || `${airport.area_ar}، ${airport.city_ar}`}</li>
                            <li>🗺️ <strong>الإحداثيات الجغرافية:</strong> <span style={{ direction: "ltr", display: "inline-block" }}>{airport.latitude.toFixed(6)}° N, {airport.longitude.toFixed(6)}° E</span></li>
                            {airport.nearby_landmarks && airport.nearby_landmarks.length > 0 && (
                              <li>🏛️ <strong>أقرب معالم:</strong> {airport.nearby_landmarks.join("، ")}</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                        {/* Connections / Flight lines */}
                        <div style={{ background: "var(--bgSecondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--borderGlass)" }}>
                          <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "4px" }}>✈️ الرحلات والربط</div>
                          <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {airport.connections && airport.connections.length > 0 && (
                              <li>🔄 <strong>ربط المطارات:</strong> {airport.connections.join("، ")}</li>
                            )}
                            <li>🏠 <strong>الرحلات الداخلية:</strong> {airport.domestic_flights || (airport.type_en === "local" ? "متاح بشكل رئيسي" : "متاح")}</li>
                            <li>🌐 <strong>الرحلات الدولية:</strong> {airport.international_flights || (airport.type_en === "international" || airport.type_en === "bot" ? "متاح" : "غير متاح")}</li>
                          </ul>
                        </div>

                        {/* Transit & Parking */}
                        <div style={{ background: "var(--bgSecondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--borderGlass)" }}>
                          <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "4px" }}>🚗 المواصلات والوصول</div>
                          <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {airport.transportation && airport.transportation.length > 0 && (
                              <li>🚌 <strong>وسائل النقل المتاحة:</strong> {airport.transportation.join("، ")}</li>
                            )}
                            <li>🅿️ <strong>مواقف السيارات:</strong> {airport.parking || "متوفر موقف سيارات أمام صالة الركاب"}</li>
                          </ul>
                        </div>
                      </div>

                      {/* Airlines (if any detailed list is present) */}
                      {airport.airlines && (
                        <div>
                          <div style={{ color: "var(--textPrimary)", fontWeight: "700", fontSize: "0.88rem", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="bx bx-buildings" style={{ color: "var(--colorSecondary)", fontSize: "1.1rem" }}></i>
                            <span>شركات الطيران العاملة بالمطار:</span>
                          </div>
                          <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.85rem" }}>{airport.airlines}</p>
                        </div>
                      )}

                      {/* Services */}
                      {airport.services && airport.services.length > 0 && (
                        <div>
                          <div style={{ color: "var(--textPrimary)", fontWeight: "700", fontSize: "0.88rem", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="bx bx-grid-alt" style={{ color: "var(--colorSecondary)", fontSize: "1.1rem" }}></i>
                            <span>الخدمات والتسهيلات المتاحة:</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {airport.services.map((srv, sIdx) => (
                              <span key={sIdx} style={{
                                fontSize: "0.75rem",
                                background: "var(--bgSecondary)",
                                border: "1px solid var(--borderGlass)",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                color: "var(--textSecondary)"
                              }}>
                                ✨ {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Toggle Button */}
                  <button
                    className="sub-title"
                    onClick={() => toggleExpand(airport.id)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "8px",
                      borderRadius: "8px",
                      background: "var(--bgSecondary)",
                      border: "1px solid var(--borderGlass)",
                      color: "var(--textSecondary)",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--colorSecondary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--textSecondary)"}
                  >
                    <span>{expandedId === airport.id ? "عرض تفاصيل أقل" : "عرض التفاصيل الكاملة للمطار"}</span>
                    <i className={`bx ${expandedId === airport.id ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.1rem" }}></i>
                  </button>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    borderTop: "1px solid var(--borderGlass)",
                    paddingTop: "12px",
                    marginTop: "4px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>📞 الاستعلامات:</span>
                        <span style={{ color: "var(--textPrimary)", fontWeight: "700", fontSize: "0.9rem" }}>{airport.phone || "غير متوفر"}</span>
                      </div>
                      {airport.official_website && (
                        <a
                          href={airport.official_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--colorSecondary)", fontSize: "0.8rem", textDecoration: "none", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "3px" }}
                        >
                          <i className="bx bx-link-external"></i> الموقع الرسمي
                        </a>
                      )}
                    </div>

                    <a
                      href={airport.map_url || `https://maps.google.com/?q=${airport.latitude},${airport.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--colorSecondary)",
                        textDecoration: "none",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "var(--colorSecondary)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "var(--bgSecondary)";
                        e.currentTarget.style.color = "var(--colorSecondary)";
                      }}
                    >
                      <i className="bx bx-map" style={{ fontSize: "1rem" }}></i>
                      عرض على الخريطة
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="metro-animate-slide-up sub-title" style={{
                backgroundColor: "var(--bgPrimary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "15px",
                padding: "30px",
                textAlign: "center",
                color: "var(--text-muted)",
                boxShadow: "var(--shadow-card)",
              }}>
                لا توجد مطارات مطابقة لبحثك. يرجى تعديل العبارة والمحاولة مجدداً.
              </div>
            )}
          </div>
        )}

        {/* Traveler Guide */}
        {activeTab === "guide" && (
          <div className="metro-animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Card 1: How to book & Steps */}
            <div style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "12px" }}>
                <i className="bx bx-receipt" style={{ color: "var(--colorSecondary)", fontSize: "1.6rem" }}></i>
                <h3 className="sub-title" style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                  طرق وحجز تذاكر الطيران
                </h3>
              </div>

              <div>
                <h4 className="sub-title" style={{ color: "var(--colorSecondary)", fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>🎒 طرق الحجز المتاحة:</h4>
                <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.88rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.7" }}>
                  <li>💻 <strong>المواقع والتطبيقات الرسمية لشركات الطيران:</strong> مثل <a href="https://www.egyptair.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>مصر للطيران</a>، و<a href="https://www.nileair.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>طيران النيل</a>، و<a href="https://www.airarabia.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>العربية للطيران</a>، إلخ. وهي الأضمن للحصول على أفضل سعر ودعم مباشر.</li>
                  <li>🌐 <strong>محركات البحث ومنصات المقارنة:</strong> مثل <a href="https://www.google.com/flights" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>Google Flights</a> و <a href="https://www.skyscanner.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>Skyscanner</a> و <a href="https://www.wego.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>Wego</a> لمقارنة الأسعار بين مختلف الشركات واختيار الرحلة الأنسب.</li>
                  <li>📱 <strong>تطبيقات وكالات السفر عبر الإنترنت:</strong> مثل <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>Booking.com</a> و <a href="https://www.expedia.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>Expedia</a> و <a href="https://www.trip.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>Trip.com</a> و <a href="https://www.almosafer.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--colorSecondary)", textDecoration: "underline" }}>Almosafer</a> للبحث عن عروض تشمل الطيران والفنادق.</li>
                  <li>🏢 <strong>شركات السياحة والمكاتب المعتمدة:</strong> زيارة أحد مكاتب السياحة المحلية وحجز التذكرة يدوياً، وهو خيار جيد لمن يفضل الدفع النقدي أو المساعدة المباشرة.</li>
                </ul>
              </div>

              <div style={{ marginTop: "8px", borderTop: "1px dashed var(--borderGlass)", paddingTop: "12px" }}>
                <h4 className="sub-title" style={{ color: "var(--colorSecondary)", fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>📝 خطوات حجز التذكرة إلكترونياً:</h4>
                <ol style={{ paddingRight: "16px", margin: 0, fontSize: "0.88rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.7" }}>
                  <li>1️⃣ <strong>تحديد مسار الرحلة:</strong> اختر مدينة المغادرة (مثلاً القاهرة) ووجهة الوصول، وحدد نوع الرحلة (ذهاب فقط / ذهاب وعودة).</li>
                  <li>2️⃣ <strong>اختيار التواريخ والدرجة:</strong> حدد موعد السفر المفضل ودرجة السفر (اقتصادية، رجال أعمال، درجة أولى).</li>
                  <li>3️⃣ <strong>اختيار الرحلة المناسبة:</strong> قارن بين مواعيد الرحلات، وعدد محطات التوقف (ترانزيت)، وسياسة الأمتعة المتاحة لكل تذكرة.</li>
                  <li>4️⃣ <strong>إدخال بيانات المسافرين:</strong> اكتب الاسم الكامل (مطابقاً تماماً لجواز السفر بالإنجليزية) وتاريخ الميلاد ورقم الهاتف والبريد الإلكتروني بدقة.</li>
                  <li>5️⃣ <strong>الخدمات الإضافية (اختياري):</strong> يمكنك اختيار مقعدك المفضل، أو إضافة أوزان زائدة للأمتعة، أو طلب وجبة خاصة.</li>
                  <li>6️⃣ <strong>الدفع وتأكيد الحجز:</strong> استخدم بطاقتك الائتمانية أو وسيلة الدفع المتاحة لإتمام العملية، وسيصلك رمز الحجز (PNR) والتذكرة الإلكترونية عبر البريد الإلكتروني.</li>
                </ol>
              </div>
            </div>

            {/* Card 2: Airport entry instructions & necessary documents */}
            <div style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "12px" }}>
                <i className="bx bx-buildings" style={{ color: "var(--colorSecondary)", fontSize: "1.6rem" }}></i>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                  تعليمات دخول المطار
                </h2>
              </div>

              <div>
                <h4 className="sub-title" style={{ color: "var(--colorSecondary)", fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>🛂 المستندات اللازمة والضرورية (اللازم منه):</h4>
                <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.88rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.7" }}>
                  <li>📄 <strong>جواز السفر:</strong> يجب أن يكون صالحاً لمدة لا تقل عن 6 أشهر من تاريخ السفر.</li>
                  <li>🎫 <strong>تأشيرة الدخول (الفيزا):</strong> تأشيرة صالحة لوجهة الوصول (سواء إلكترونية، أو من السفارة، أو عند الوصول إن كانت متاحة).</li>
                  <li>🎟️ <strong>تذكرة الطيران وحجز الفندق:</strong> تأكيد حجز تذكرة العودة وحجز الفندق يطلب أحياناً في مطارات الوصول للتأكد من غرض الزيارة.</li>
                  <li>🪪 <strong>المستندات العسكرية والجهات الرسمية:</strong> (للمواطنين المصريين الذكور) تصريح السفر العسكري أو إذن السفر من جهة العمل إن وجب.</li>
                  <li>🧪 <strong>الشهادات الصحية:</strong> بعض الدول قد تتطلب شهادات تطعيمات معينة (مثل الحمى الصفراء لبعض الدول الإفريقية).</li>
                </ul>
              </div>

              <div style={{ marginTop: "8px", borderTop: "1px dashed var(--borderGlass)", paddingTop: "12px" }}>
                <h4 className="sub-title" style={{ color: "var(--colorSecondary)", fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>🚶‍♂️ الخطوات والتعليمات داخل المطار:</h4>
                <ol style={{ paddingRight: "16px", margin: 0, fontSize: "0.88rem", color: "var(--textSecondary)", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.7" }}>
                  <li>1️⃣ <strong>الحضور مبكراً:</strong> ينصح بالوصول للمطار قبل 3 ساعات من موعد الرحلات الدولية، وقبل ساعتين للرحلات الداخلية.</li>
                  <li>2️⃣ <strong>التفتيش الأمني الأول:</strong> عند بوابات الدخول، يتم تمرير جميع الحقائب عبر أجهزة الفحص الأمنية وإظهار جواز السفر وتذكرة الطيران للأمن.</li>
                  <li>3️⃣ <strong>الوزن والحصول على البوردنج (Check-in):</strong> توجه إلى كاونتر شركة الطيران الخاصة برحلتك لوزن الحقائب الكبيرة واستلام بطاقة صعود الطائرة (Boarding Pass).</li>
                  <li>4️⃣ <strong>الجوازات والتأشيرات:</strong> التوجه لصالة الجوازات لختم الخروج. قم بتعبئة كارت السفر (إن وجد) وتقديمه مع الجواز لضابط الجوازات.</li>
                  <li>5️⃣ <strong>التفتيش الأمني الثاني:</strong> قبل دخول صالة المغادرة النهائية، يتم فحص حقائب اليد والمتعلقات الشخصية (حزام، ساعات، لابتوب يوضع في سلة منفصلة).</li>
                  <li>6️⃣ <strong>الانتظار والصعود للطائرة:</strong> انتظر في صالة المغادرة أمام البوابة (Gate) المخصصة لرحلتك المكتوبة على البوردنج، وتابع الشاشات للتأكد من موعد الصعود.</li>
                </ol>
              </div>
            </div>

            {/* Card 3: Tips for first-time travelers */}
            <div style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "12px" }}>
                <i className="bx bx-info-circle" style={{ color: "var(--accent-warning)", fontSize: "1.6rem" }}></i>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                  نصائح هامة للمسافرين
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "12px", borderRadius: "10px" }}>
                  <strong style={{ color: "var(--accent-warning)", fontSize: "0.88rem", display: "block", marginBottom: "4px" }}>⚠️ قواعد حقيبة اليد (Carry-on):</strong>
                  <span style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    لا تضع أي سوائل أو معجون يزيد حجم العبوة الواحدة فيها عن 100 مل في حقيبة اليد. يمنع تماماً حمل الأدوات الحادة (كالمقصات وقصاصات الأظافر والمفكات).
                  </span>
                </div>

                <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", padding: "12px", borderRadius: "10px" }}>
                  <strong style={{ color: "var(--textPrimary)", fontSize: "0.88rem", display: "block", marginBottom: "4px" }}>💼 متعلقاتك الشخصية الثمينة:</strong>
                  <span style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    احتفظ دائماً بجواز السفر، التذاكر، الأموال، الأجهزة الإلكترونية (لابتوب، كاميرا، باوربنك) والأدوية اليومية في حقيبة يدك المصاحبة لك داخل الطائرة، وتجنب وضعها في حقيبة الشحن الكبيرة.
                  </span>
                </div>

                <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", padding: "12px", borderRadius: "10px" }}>
                  <strong style={{ color: "var(--textPrimary)", fontSize: "0.88rem", display: "block", marginBottom: "4px" }}>🏢 تأكد من مبنى الركاب (Terminal):</strong>
                  <span style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    بعض المطارات الكبيرة (مثل مطار القاهرة الدولي) تحتوي على مباني ركاب متباعدة. تحقق جيداً من تذكرتك لتعرف من أي مبنى (Terminal 1, 2, or 3) تقلع رحلتك لتتوجه إليه مباشرة وتفادي إضاعة الوقت.
                  </span>
                </div>

                <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", padding: "12px", borderRadius: "10px" }}>
                  <strong style={{ color: "var(--textPrimary)", fontSize: "0.88rem", display: "block", marginBottom: "4px" }}>📱 تفعيل التجوال أو شراء شريحة اتصال:</strong>
                  <span style={{ fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    قبل مغادرتك، تأكد من تفعيل خدمة التجوال لخطك الهاتفي أو خطط لشراء شريحة اتصال محلي من مطار الوصول لتسهيل التواصل وحجز السيارات أو تصفح الخرائط عند الهبوط.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
