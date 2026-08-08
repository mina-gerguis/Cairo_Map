"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface MicrobusRoute {
  destination: string;
  fare: string;
  vehicleType: string;
  notes?: string;
}

interface MicrobusStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  routes: MicrobusRoute[];
  map_url: string;
}

const DEFAULT_MICROBUS: MicrobusStation[] = [
  {
    name: "موقف رمسيس (موقف أحمد حلمي / رمسيس الكبرى)",
    location: "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Ramses+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "11-13 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "الشيخ زايد", fare: "12-14 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص / ميني باص" },
      { destination: "العبور", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "الشروق", fare: "12-14 ج.م", vehicleType: "ميكروباص" },
      { destination: "حلوان", fare: "9-11 ج.م", vehicleType: "ميكروباص" },
      { destination: "المرج", fare: "7-8 ج.م", vehicleType: "ميكروباص" },
      { destination: "الجيزة (ميدان الجيزة)", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "شبرا الخيمة", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "مطار القاهرة", fare: "8-10 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف المرج الجديدة",
    location: "شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=El+Marg+Microbus+Station",
    routes: [
      { destination: "العبور", fare: "7-9 ج.م", vehicleType: "ميكروباص" },
      { destination: "الشروق", fare: "9-11 ج.م", vehicleType: "ميكروباص" },
      { destination: "بدر", fare: "11-13 ج.م", vehicleType: "ميكروباص" },
      { destination: "العاشر من رمضان", fare: "12-15 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "مدينتي", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "بلبيس", fare: "10-12 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "الزقازيق", fare: "15-18 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "مسطرد", fare: "5 ج.م", vehicleType: "ميكروباص" },
      { destination: "رمسيس", fare: "7-8 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف ميدان الجيزة",
    location: "الجيزة - ميدان الجيزة بجوار مسجد الاستقامة ومترو الجيزة",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Giza+Square+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "9-11 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "الشيخ زايد", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "الهرم / فيصل", fare: "4-5 ج.م", vehicleType: "ميكروباص داخلي" },
      { destination: "المنيب", fare: "3.5-4 ج.م", vehicleType: "ميكروباص داخلي" },
      { destination: "حدائق الأهرام", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "رمسيس", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص سقف عالي (عبر الدائري)" },
      { destination: "المعادي", fare: "7-9 ج.م", vehicleType: "ميكروباص (عبر الدائري)" }
    ]
  },
  {
    name: "موقف السيدة عائشة",
    location: "وسط القاهرة - ميدان السيدة عائشة أسفل القلعة",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Sayeda+Aisha+Microbus+Station",
    routes: [
      { destination: "حلوان", fare: "8-10 ج.م", vehicleType: "ميكروباص" },
      { destination: "المعادي (صقر قريش)", fare: "6-7 ج.م", vehicleType: "ميكروباص" },
      { destination: "التجمع الخامس", fare: "12-14 ج.م", vehicleType: "ميكروباص (الدائري)" },
      { destination: "رمسيس", fare: "5 ج.م", vehicleType: "ميكروباص" },
      { destination: "الجيزة", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "المرج", fare: "8-10 ج.م", vehicleType: "ميكروباص" },
      { destination: "المقطم", fare: "4-5 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف المنيب الكبرى",
    location: "الجيزة - بجوار محطة مترو المنيب ومخرج الدائري للجنوب",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Moneeb+Microbus+Station",
    routes: [
      { destination: "الفيوم", fare: "25-30 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "بني سويف", fare: "30-35 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "6 أكتوبر", fare: "9-11 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "حلوان", fare: "7-9 ج.م", vehicleType: "ميكروباص (عبر الدائري)" },
      { destination: "المعادي", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "ميدان الجيزة", fare: "3.5-4 ج.م", vehicleType: "ميكروباص داخلي" }
    ]
  }
];

export default function MicrobusStationsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<MicrobusStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<string>("all");

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadStations();
    }
  }, [user, hasAccess]);

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
            دليل مواقف الميكروباص ميزة ذهبية 🥇
          </h2>
          
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
            تصفح دليل مواقف الميكروباص والسرفيس في القاهرة والجيزة والتعرفة الرسمية للخطوط متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
          </p>

          {/* Features list */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية (60 ج.م/شهرياً):</div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ مواقف السرفيس والميكروباص الرئيسية (رمسيس، المنيب، المرج، عبود، إلخ)</li>
              <li>✨ التعرفة الرسمية التقريبية لخطوط الانتقال الداخلية والإقليمية</li>
              <li>✨ نوع المركبات (سقف عالي، ميني باص، إلخ) والمسارات</li>
              <li>✨ تشمل أيضاً مخطط الرحلات الذكي والمطارات والموانئ بالكامل</li>
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
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const loadStations = async () => {
    setLoading(true);
    if (!supabase) {
      setStations(getLocalStations());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("microbus_stations")
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
    if (typeof window === "undefined") return DEFAULT_MICROBUS;
    const local = localStorage.getItem("local_microbus_stations");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_MICROBUS;
      }
    }
    localStorage.setItem("local_microbus_stations", JSON.stringify(DEFAULT_MICROBUS));
    return DEFAULT_MICROBUS;
  };

  // 1. Get unique destinations for auto-suggest
  const allDestinations = useMemo(() => {
    const set = new Set<string>();
    stations.forEach(station => {
      if (Array.isArray(station.routes)) {
        station.routes.forEach(route => {
          set.add(route.destination);
        });
      }
    });
    return Array.from(set);
  }, [stations]);

  // 2. Filter logic: Search by destination or view by station
  const filteredResults = useMemo(() => {
    let results = stations;

    if (selectedStation !== "all") {
      results = results.filter(s => s.name.includes(selectedStation));
    }

    if (destinationQuery.trim() !== "") {
      // Find matching routes inside stations
      return results.map(station => {
        const routesArr = Array.isArray(station.routes) ? station.routes : [];
        const matchingRoutes = routesArr.filter(r =>
          r.destination.toLowerCase().includes(destinationQuery.toLowerCase())
        );
        return {
          ...station,
          routes: matchingRoutes
        };
      }).filter(station => station.routes.length > 0);
    }

    return results;
  }, [destinationQuery, selectedStation, stations]);

  return (
    <div className="app-container" style={{ maxWidth: "950px", paddingTop: "40px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "20px" }}>
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

      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: "40px 30px", marginBottom: "32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ 
          position: "absolute", 
          top: "-20px", 
          right: "-20px", 
          width: "120px", 
          height: "120px", 
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4.5rem", marginBottom: "16px" }}>🚐</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "10px", color: "var(--text-primary)" }}>
          دليل مواقف الميكروباص والسرفيس
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          دليل القاهرة الكبرى الشعبي لمعرفة مواقف السرفيس والميكروباص. أدخل وجهتك لمعرفة من أي موقف يمكنك الركوب، كم تعرفة الركوب التقريبية، ونوع السيارة.
        </p>
      </div>

      {/* Interactive Tool Widget */}
      <div className="glass-panel" style={{ padding: "28px 24px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="bx bx-search-alt" style={{ color: "#8b5cf6" }}></i>
          <span>أين تريد أن تذهب؟ (بحث ذكي بالوجهة)</span>
        </h2>
        
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div style={{ flex: "1 1 280px", position: "relative" }}>
            <input
              type="text"
              placeholder="اكتب وجهتك (مثال: 6 أكتوبر، التجمع الخامس، العبور)..."
              value={destinationQuery}
              onChange={e => setDestinationQuery(e.target.value)}
              className="ios-input"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#fff",
                border: "1px solid var(--border-glass)"
              }}
            />
            {destinationQuery && (
              <button 
                onClick={() => setDestinationQuery("")}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ×
              </button>
            )}
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <select
              value={selectedStation}
              onChange={e => setSelectedStation(e.target.value)}
              className="ios-input"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#fff",
                border: "1px solid var(--border-glass)"
              }}
            >
              <option value="all" style={{ backgroundColor: "#1e293b" }}>تصفية حسب موقف محدد (الكل)</option>
              {stations.map(s => (
                <option key={s.id || s.name} value={s.name} style={{ backgroundColor: "#1e293b" }}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tags for Destination */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>وجهات شائعة:</span>
          {["6 أكتوبر", "التجمع الخامس", "العبور", "الشيخ زايد", "الشروق", "حلوان"].map(tag => (
            <button
              key={tag}
              onClick={() => setDestinationQuery(tag)}
              style={{
                padding: "4px 10px",
                borderRadius: "20px",
                background: "rgba(139, 92, 246, 0.1)",
                color: "#8b5cf6",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-ios)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري تحميل البيانات...</span>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((station, sIdx) => (
            <div key={station.id || sIdx} className="glass-panel" style={{ padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1.25rem", fontWeight: "800", color: "#fff" }}>{station.name}</h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    📍 {station.location}
                  </span>
                </div>
                <div>
                  <a
                    href={station.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#8b5cf6",
                      textDecoration: "none",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <i className="bx bx-map" style={{ fontSize: "1rem" }}></i>
                    موقع الموقف
                  </a>
                </div>
              </div>

              {/* Routes Grid */}
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#fff", marginBottom: "12px" }}>🚐 خطوط السير والتعرفة المتاحة بالموقف:</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                  {Array.isArray(station.routes) && station.routes.map((route, rIdx) => (
                    <div 
                      key={rIdx} 
                      style={{ 
                        padding: "14px", 
                        borderRadius: "10px", 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span style={{ color: "#fff", fontWeight: "800", fontSize: "0.9rem", display: "block" }}>
                          🔀 إلى: {route.destination}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>
                          🚗 المركبة: {route.vehicleType}
                        </span>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>التعرفة المقدرة</span>
                        <strong style={{ color: "#8b5cf6", fontSize: "1rem", fontWeight: "800" }}>{route.fare}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: "45px", textAlign: "center", color: "var(--text-muted)" }}>
            لا توجد مواقف أو خطوط ميكروباص متجهة إلى <strong>"{destinationQuery}"</strong> حالياً في دليلنا. نعمل على التحديث المستمر لإضافة المزيد.
          </div>
        )}
      </div>
    </div>
  );
}
