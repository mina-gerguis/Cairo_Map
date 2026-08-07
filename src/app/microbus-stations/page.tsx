"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface MicrobusRoute {
  destination: string;
  fare: string;
  vehicleType: string;
  notes?: string;
}

interface MicrobusStation {
  name: string;
  location: string;
  governorate: string;
  routes: MicrobusRoute[];
  mapUrl: string;
}

const MICROBUS_STATIONS_DATA: MicrobusStation[] = [
  {
    name: "موقف رمسيس (موقف أحمد حلمي / رمسيس الكبرى)",
    location: "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
    governorate: "القاهرة",
    mapUrl: "https://maps.google.com/?q=Ramses+Microbus+Station",
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
    mapUrl: "https://maps.google.com/?q=El+Marg+Microbus+Station",
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
    mapUrl: "https://maps.google.com/?q=Giza+Square+Microbus+Station",
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
    mapUrl: "https://maps.google.com/?q=Sayeda+Aisha+Microbus+Station",
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
    mapUrl: "https://maps.google.com/?q=Moneeb+Microbus+Station",
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
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<string>("all");

  // 1. Get unique destinations for auto-suggest
  const allDestinations = useMemo(() => {
    const set = new Set<string>();
    MICROBUS_STATIONS_DATA.forEach(station => {
      station.routes.forEach(route => {
        set.add(route.destination);
      });
    });
    return Array.from(set);
  }, []);

  // 2. Filter logic: Search by destination or view by station
  const filteredResults = useMemo(() => {
    let results = MICROBUS_STATIONS_DATA;

    if (selectedStation !== "all") {
      results = results.filter(s => s.name.includes(selectedStation));
    }

    if (destinationQuery.trim() !== "") {
      // Find matching routes inside stations
      return results.map(station => {
        const matchingRoutes = station.routes.filter(r =>
          r.destination.toLowerCase().includes(destinationQuery.toLowerCase())
        );
        return {
          ...station,
          routes: matchingRoutes
        };
      }).filter(station => station.routes.length > 0);
    }

    return results;
  }, [destinationQuery, selectedStation]);

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
              <option value="رمسيس" style={{ backgroundColor: "#1e293b" }}>موقف رمسيس</option>
              <option value="المرج" style={{ backgroundColor: "#1e293b" }}>موقف المرج</option>
              <option value="الجيزة" style={{ backgroundColor: "#1e293b" }}>موقف ميدان الجيزة</option>
              <option value="السيدة عائشة" style={{ backgroundColor: "#1e293b" }}>موقف السيدة عائشة</option>
              <option value="المنيب" style={{ backgroundColor: "#1e293b" }}>موقف المنيب</option>
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
        {filteredResults.length > 0 ? (
          filteredResults.map((station, sIdx) => (
            <div key={sIdx} className="glass-panel" style={{ padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1.25rem", fontWeight: "800", color: "#fff" }}>{station.name}</h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    📍 {station.location}
                  </span>
                </div>
                <div>
                  <a
                    href={station.mapUrl}
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
                  {station.routes.map((route, rIdx) => (
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
