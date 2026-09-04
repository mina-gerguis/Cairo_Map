"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface ParkingSpot {
  id: string;
  name: string;
  area: string;
  address: string;
  nearestMetro: string;
  hourlyRate: number;
  maxDailyRate?: number;
  capacity: number;
  type: "مغطى ومتعدد الطوابق 🏢" | "جراج ذكي إلكتروني 🤖" | "جراج سطحي مفتوح 🅿️";
  hours: string;
  features: string[];
  mapLocationLink?: string;
}

const DEFAULT_PARKING: ParkingSpot[] = [];

export default function ParkingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [expandedParkingId, setExpandedParkingId] = useState<string | null>(null);
  const [parkingData, setParkingData] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  const getLocalParking = (): ParkingSpot[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_parking_spots");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_PARKING;
  };

  useEffect(() => {
    const fetchParking = async () => {
      setLoading(true);
      if (!supabase) {
        setParkingData(getLocalParking());
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from("parking_spots").select("*");
        if (error || !data || data.length === 0) {
          setParkingData(getLocalParking());
        } else {
          const mapped = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            area: item.area,
            address: item.address,
            nearestMetro: item.nearest_metro || item.nearestMetro || "",
            hourlyRate: item.hourly_rate ?? item.hourlyRate ?? 0,
            maxDailyRate: item.max_daily_rate !== null && item.max_daily_rate !== undefined ? item.max_daily_rate : item.maxDailyRate,
            capacity: item.capacity ?? 0,
            type: item.type,
            hours: item.hours,
            features: Array.isArray(item.features) ? item.features : (typeof item.features === 'string' ? JSON.parse(item.features) : []),
            mapLocationLink: item.map_location_link || item.mapLocationLink || ""
          }));
          setParkingData(mapped);
        }
      } catch (err) {
        console.error("Error loading parking spots:", err);
        setParkingData(getLocalParking());
      } finally {
        setLoading(false);
      }
    };

    if (user && hasAccess) {
      fetchParking();
    } else {
      setLoading(false);
    }
  }, [user, hasAccess]);

  const filteredParking = parkingData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === "all" || p.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const areas = Array.from(new Set(parkingData.map((p) => p.area)));

  const handleParkingClick = (id: string) => {
    if (expandedParkingId === id) {
      setExpandedParkingId(null);
    } else {
      setExpandedParkingId(id);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bgPrimary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "var(--textSecondary)" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid var(--borderGlass)", borderTop: "4px solid var(--colorSecondary, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span>جاري التحقق من التفاصيل...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
        {/* Banner matching Metro Cover Style */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bgPrimary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--borderGlass)",
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
                background: "var(--bgGlass-card)",
                border: "1px solid var(--borderGlass)",
                color: "var(--textPrimary)",
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
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/parking.png" alt="Parking" loading="lazy" decoding="async" style={{ width: "60px", marginLeft: "10px" }} />
              دليل الجراجات
            </h1>
            <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto", lineHeight: "1.6" }}>
              خريطة تفاعلية ودليل جراجات وسط البلد، روكسي، ومحطات المترو التبادلية.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
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
              <img src="/images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
              دليل الجراجات يتطلب اشتراك في الباقة الفضية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح الدليل الكامل وتفاصيل مواقع الجراجات المتعددة الطوابق والذكية وخدمة اركن واركب متاح للمشتركين بالباقة الفضية أو الذهبية.
            </p>

            {/* Perks list */}
            <div style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "12px",
              padding: "16px 20px",
              textAlign: "right",
              margin: "0 auto 32px",
              maxWidth: "440px"
            }}>
              <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الفضية:</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✨ عرض مواقع وتفاصيل الجراجات المتعددة الطوابق والذكية.</li>
                <li>✨ معرفة أقرب محطات المترو التبادلية والخدمية لكل جراج.</li>
                <li>✨ استخدام ميزة التوجيه المباشر بالخرائط لمعرفة الاتجاهات.</li>
                <li>✨ ميزة اركن واركب لتوفير الوقت وتكلفة الوقود بالزحام.</li>
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "var(--bg-subscribe-button-seliver)",
                    color: "var(--color-white-50)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "var(--bs-subscribe-button-seliver)",
                    border: "1px solid var(--br-subscribe-button-seliver)",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة الفضية
                </Link>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "var(--bg-subscribe-button-base)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
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
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
      {/* CSS internal styles definition for custom hover effects and keyframe animation states */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .metro-animate-fade { animation: fadeIn 0.35s ease forwards; }
        .metro-animate-slide-up { animation: fadeIn 0.45s ease-out forwards; }
        .metro-delay-100 { animation-delay: 0.1s; }
        .metro-delay-150 { animation-delay: 0.15s; }
        .metro-delay-200 { animation-delay: 0.2s; }
        .metro-delay-250 { animation-delay: 0.25s; }
        .metro-delay-300 { animation-delay: 0.3s; }
        .metro-delay-350 { animation-delay: 0.35s; }
        .metro-delay-400 { animation-delay: 0.4s; }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
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
              background: "var(--bgGlass-card)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
              textDecoration: "none",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </div>

        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(1.5rem, 5vw, 2rem)",
            fontWeight: "bold",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/parking.png" alt="" loading="lazy" decoding="async" style={{ width: "60px", marginLeft: "10px" }} />
            دليل الجراجات
          </h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            اعثر على أقرب جراج مغطى أو ذكي بالقرب من محطات المترو والأسواق لتفادي الازدحام وركن سيارتك بأمان.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#818cf8",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>مغطى ومتعدد الطوابق 🏢</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>جراج ذكي إلكتروني 🤖</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#f59e0b",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>جراج سطحي مفتوح 🅿️</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

        {/* Search Panel Card - Styled matching Metro & Monorail searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 30,
        }}>
          {/* Search Box */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> ابحث في الجراجات
            </label>
            <input
              className="input-fields"
              type="text"
              placeholder="ابحث باسم الجراج أو المنطقة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-heading)",
                height: "50px",
              }}
            />
          </div>

          {/* Filter Area Dropdown */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
              📍 تصفية حسب المنطقة
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--bgSecondary)",
                color: "var(--textPrimary)",
                border: "1px solid var(--borderGlass)",
                fontFamily: "var(--font-heading)",
                fontSize: "0.95rem",
                height: "50px",
                outline: "none"
              }}
            >
              <option value="all">جميع المناطق</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parking Garage List */}
        <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "24px" }}>
          <h2 style={{
            fontSize: "1.2rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <i className="bx bx-parking" style={{ color: "var(--colorSecondary)", fontSize: "1.4rem" }}></i>
            الجراجات المتاحة ({filteredParking.length})
          </h2>

          {filteredParking.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--textSecondary)",
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px"
            }}>
              <p className="sub-title">لم يتم العثور على جراجات مطابقة للبحث</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredParking.map((parking) => {
                const isExpanded = expandedParkingId === parking.id;
                return (
                  <div
                    key={parking.id}
                    onClick={() => handleParkingClick(parking.id)}
                    style={{
                      backgroundColor: "var(--bgPrimary)",
                      border: isExpanded ? `1px solid var(--colorSecondary)` : "1px solid var(--borderGlass)",
                      borderRadius: "12px",
                      padding: "16px",
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
                      <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                        {parking.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          background: "rgba(99, 102, 241, 0.12)",
                          color: "#818cf8",
                          fontSize: "0.78rem",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                        }}>
                          {parking.area}
                        </span>
                        <i className={`bx bx-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: "var(--textSecondary)", fontSize: "1.3rem" }}></i>
                      </div>
                    </div>

                    {/* Summary Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", color: "var(--textSecondary)" }}>
                      <span>{parking.type}</span>
                      <span style={{ fontWeight: "700", color: "#10b981" }}>{parking.hourlyRate} ج.م / ساعة</span>
                    </div>

                    {/* Expanded details block */}
                    {isExpanded && (
                      <div style={{
                        borderTop: "1px solid var(--borderGlass)",
                        paddingTop: "12px",
                        marginTop: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        animation: "fadeIn 0.25s ease"
                      }}>
                        {/* Address */}
                        <div style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                          <span style={{ fontSize: "0.95rem" }}>📍</span>
                          <span>{parking.address}</span>
                        </div>

                        {/* Nearest Metro */}
                        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", margin: "4px 0" }}>
                          <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                            🚇 أقرب محطة مترو:
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--textPrimary)", fontWeight: "600" }}>
                            {parking.nearestMetro}
                          </span>
                        </div>

                        {/* Capacity & Rates Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>السعة الإجمالية</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--textPrimary)" }}>{parking.capacity} سيارة</span>
                          </div>
                          <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>الحد الأقصى لليوم</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#10b981" }}>{parking.maxDailyRate ? `${parking.maxDailyRate} ج.م` : "غير محدد"}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "700" }}>
                            ✨ المميزات:
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {parking.features.map((feat, idx) => (
                              <span key={idx} style={{
                                background: "var(--bgSecondary)",
                                color: "var(--textSecondary)",
                                fontSize: "0.78rem",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--borderGlass)"
                              }}>
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--borderGlass)", paddingTop: "10px", marginTop: "4px" }}>
                          <span className="sub-title" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>🕒 {parking.hours}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parking.name + " " + parking.address)}`, "_blank");
                            }}
                            className="btn btn-primary"
                            style={{ padding: "var(--paddingBtn)", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "4px", width: "30%" }}
                          >
                            <span className="sub-title"> الاتجاهات</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

