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
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--accent-ios, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", fontFamily: "var(--font-cairo)" }}>جاري التحقق من تفاصيل الاشتراك...</p>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)", direction: "rtl", textAlign: "right" }}>
        {/* Header Banner */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bg-primary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--border-glass)",
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
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/searchBar/Cairo_airport.png" alt="" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
              دليل المطارات المصرية
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
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
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
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
              fontSize: "3.5rem", 
              marginBottom: "24px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "90px",
              height: "90px",
              background: "rgba(234, 179, 8, 0.08)",
              borderRadius: "50%",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              color: "#eab308",
            }}>
              <i className="bx bxs-lock-alt"></i>
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "14px" }}>
              دليل المطارات ميزة ذهبية 🥇
            </h2>
            
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
              تصفح دليل المطارات المصرية والصالات والخدمات وشركات الطيران العاملة بها متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
            </p>

            {/* Features list */}
            <div style={{ background: "var(--bg-secondary)", padding: "18px 24px", borderRadius: "12px", border: "1px solid var(--border-glass)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
              <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية (60 ج.م/شهرياً):</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
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
                  href="/profile"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 15px rgba(250, 204, 21, 0.3)",
                    display: "block"
                  }}
                >
                  🚀 اشترك الآن ورقّ حسابك للذهبية (60 ج.م)
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
                  🔑 سجل دخولك أولاً لتفعيل الاشتراك
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
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)", direction: "rtl", textAlign: "right" }}>
      {/* Header Banner - Redesigned like Metro Cover */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bg-primary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
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
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/searchBar/Cairo_airport.png" alt="" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
            دليل المطارات المصرية
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            دليلك الشامل للمطارات الدولية والمحلية في مصر. ابحث عن معلومات الصالات، شركات الطيران المتاحة، أرقام الهواتف، والخدمات والوصول المباشر.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#fbbf24",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>مطارات مصر ({airports.length}) ✈️</span>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--accent-ios)",
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

        {/* Search Panel Card - Styled matching Metro searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              <i className="bx bx-search" style={{ marginLeft: "5px", color: "var(--accent-ios)" }}></i> ابحث في المطارات المصرية
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="ابحث باسم المطار أو المدينة أو الكود أو المحافظة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ios-input"
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  border: "1px solid var(--border-glass)",
                  fontFamily: "var(--font-cairo)",
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

        {/* Airports List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-ios)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري تحميل البيانات...</span>
            </div>
          ) : filteredAirports.length > 0 ? (
            filteredAirports.map((airport, idx) => (
              <div
                key={airport.id || idx}
                className="metro-animate-slide-up"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
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
                  borderBottom: "1px solid var(--border-glass)",
                  paddingBottom: "12px"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      {airport.name_ar}
                    </h3>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", direction: "ltr", textAlign: "right", marginBottom: "6px" }}>
                      {airport.name_en}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "0.72rem",
                        color: "var(--accent-ios)",
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
                          background: "var(--bg-secondary)",
                          padding: "2px 8px",
                          borderRadius: "50px",
                          border: "1px solid var(--border-glass)",
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
                    <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "700" }}>
                      📍 {airport.city_ar}، {airport.governorate_ar}
                    </span>
                    <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.72rem", marginTop: "2px" }}>
                      {airport.area_ar}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", lineHeight: "1.6" }}>
                  <div>
                    <p style={{ margin: 0, color: "var(--text-secondary)" }}>{airport.short_description}</p>
                  </div>
                </div>

                {/* Collapsible Details Panel */}
                {expandedId === airport.id && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    marginTop: "12px",
                    borderTop: "1px dashed var(--border-glass)",
                    paddingTop: "16px",
                    animation: "fadeIn 0.25s ease"
                  }}>
                    {/* Detailed Description */}
                    <div>
                      <div style={{ color: "var(--text-primary)", fontWeight: "700", fontSize: "0.88rem", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="bx bx-detail" style={{ color: "var(--accent-ios)", fontSize: "1.1rem" }}></i>
                        <span>الوصف التفصيلي:</span>
                      </div>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>{airport.description}</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                      {/* Infrastructure */}
                      <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "4px" }}>📐 البنية التحتية والسعة</div>
                        <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <li>🚪 <strong>مباني الركاب:</strong> {airport.terminals_count || "غير محدد"}</li>
                          <li>👥 <strong>الطاقة الاستيعابية:</strong> {airport.capacity || "غير محدد"}</li>
                          <li>🛣️ <strong>المدارج:</strong> {airport.runways_count || "1 مدرج"} {airport.runways_length ? `(طول: ${airport.runways_length})` : ""}</li>
                        </ul>
                      </div>

                      {/* Location & Coordinates */}
                      <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "4px" }}>🌐 الموقع والعنوان</div>
                        <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
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
                      <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "4px" }}>✈️ الرحلات والربط</div>
                        <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {airport.connections && airport.connections.length > 0 && (
                            <li>🔄 <strong>ربط المطارات:</strong> {airport.connections.join("، ")}</li>
                          )}
                          <li>🏠 <strong>الرحلات الداخلية:</strong> {airport.domestic_flights || (airport.type_en === "local" ? "متاح بشكل رئيسي" : "متاح")}</li>
                          <li>🌐 <strong>الرحلات الدولية:</strong> {airport.international_flights || (airport.type_en === "international" || airport.type_en === "bot" ? "متاح" : "غير متاح")}</li>
                        </ul>
                      </div>

                      {/* Transit & Parking */}
                      <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "4px" }}>🚗 المواصلات والوصول</div>
                        <ul style={{ paddingRight: "14px", margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
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
                        <div style={{ color: "var(--text-primary)", fontWeight: "700", fontSize: "0.88rem", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="bx bx-buildings" style={{ color: "var(--accent-ios)", fontSize: "1.1rem" }}></i>
                          <span>شركات الطيران العاملة بالمطار:</span>
                        </div>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>{airport.airlines}</p>
                      </div>
                    )}

                    {/* Services */}
                    {airport.services && airport.services.length > 0 && (
                      <div>
                        <div style={{ color: "var(--text-primary)", fontWeight: "700", fontSize: "0.88rem", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="bx bx-grid-alt" style={{ color: "var(--accent-ios)", fontSize: "1.1rem" }}></i>
                          <span>الخدمات والتسهيلات المتاحة:</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {airport.services.map((srv, sIdx) => (
                            <span key={sIdx} style={{
                              fontSize: "0.75rem",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-glass)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              color: "var(--text-secondary)"
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
                  onClick={() => toggleExpand(airport.id)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "8px",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--accent-ios)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
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
                  borderTop: "1px solid var(--border-glass)",
                  paddingTop: "12px",
                  marginTop: "4px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>📞 الاستعلامات:</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: "700", fontSize: "0.9rem" }}>{airport.phone || "غير متوفر"}</span>
                    </div>
                    {airport.official_website && (
                      <a 
                        href={airport.official_website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: "var(--accent-ios)", fontSize: "0.8rem", textDecoration: "none", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "3px" }}
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
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--accent-ios)",
                      textDecoration: "none",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "var(--accent-ios)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "var(--bg-secondary)";
                      e.currentTarget.style.color = "var(--accent-ios)";
                    }}
                  >
                    <i className="bx bx-map" style={{ fontSize: "1rem" }}></i>
                    عرض على الخريطة
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="metro-animate-slide-up" style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-glass)",
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
      </div>
    </div>
  );
}
