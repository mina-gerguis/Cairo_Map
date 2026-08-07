"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Airport {
  name: string;
  code: string;
  city: string;
  type: string;
  terminals: string;
  services: string[];
  airlines: string;
  phone: string;
  mapUrl: string;
}

const AIRPORTS_DATA: Airport[] = [
  {
    name: "مطار القاهرة الدولي (CAI)",
    code: "CAI",
    city: "القاهرة",
    type: "مطار دولي رئيسي",
    terminals: "مبنى الركاب 1 (القديم)، مبنى الركاب 2 (المطور)، مبنى الركاب 3 (الجديد)، الصالة الموسمية (للحج والعمرة).",
    services: ["مواقف سيارات متعددة الطوابق", "إنترنت واي فاي مجاني", "صالات كبار الشخصيات (VIP Lounge)", "بنوك وصرافة 24 ساعة", "سوق حرة (Duty Free)", "تأجير سيارات", "فنادق ملاصقة للمطار"],
    airlines: "مصر للطيران (المركز الرئيسي)، طيران الإمارات، الخطوط السعودية، لوفتهانزا، الخطوط البريطانية، الخطوط الفرنسية، طيران الخليج، وغيرها.",
    phone: "19934",
    mapUrl: "https://maps.google.com/?q=Cairo+International+Airport"
  },
  {
    name: "مطار برج العرب الدولي (HBE)",
    code: "HBE",
    city: "الإسكندرية",
    type: "مطار دولي إقليمي",
    terminals: "مبنى ركاب رئيسي مجهز، ويجري حالياً إنشاء مبنى ركاب صديق للبيئة جديد.",
    services: ["صالة سفر ووصول مكيفة", "مكتب صرافة وماكينات ATM", "كافيهات ومطاعم", "مواقف سيارات", "سوق حرة مبسطة"],
    airlines: "مصر للطيران، طيران العربية، فلاي دبي، طيران النيل، الخطوط السعودية، طيران الجزيرة.",
    phone: "03-4631000",
    mapUrl: "https://maps.google.com/?q=Borg+El+Arab+International+Airport"
  },
  {
    name: "مطار سفنكس الدولي (SPX)",
    code: "SPX",
    city: "الجيزة (الشيخ زايد / 6 أكتوبر)",
    type: "مطار دولي جديد",
    terminals: "مبنى ركاب رئيسي يخدم غرب القاهرة ومحافظات الدلتا ويخدم المتحف المصري الكبير والأهرامات.",
    services: ["مواقف سيارات", "خدمات بنكية ومكينات ATM", "كافيهات وقاعة ركاب حديثة", "سوق حرة"],
    airlines: "مصر للطيران (رحلات داخلية وخارجية)، ويز إير (Wizz Air)، طيران أديل، طيران العربية.",
    phone: "02-35391645",
    mapUrl: "https://maps.google.com/?q=Sphinx+International+Airport"
  },
  {
    name: "مطار العاصمة الدولي (CCE)",
    code: "CCE",
    city: "العاصمة الإدارية الجديدة",
    type: "مطار دولي جديد",
    terminals: "مبنى ركاب رئيسي مجهز بأحدث تكنولوجيا التفتيش والخدمات يخدم العاصمة الجديدة والقناة.",
    services: ["تكييف مركزي متطور", "خدمات بنكية وصرافة", "صالات انتظار متميزة", "منطقة مطاعم وكافيهات"],
    airlines: "مصر للطيران، ورحلات شارتر وسياحية خاصة وخطوط طيران إقليمية.",
    phone: "02-38594700",
    mapUrl: "https://maps.google.com/?q=Capital+International+Airport+Egypt"
  },
  {
    name: "مطار الغردقة الدولي (HRG)",
    code: "HRG",
    city: "البحر الأحمر (الغردقة)",
    type: "مطار دولي سياحي",
    terminals: "مبنى الركاب 1 (الجديد والمميز بتصميمه)، مبنى الركاب 2 (القديم).",
    services: ["صالات سفر ووصول واسعة", "إنترنت واي فاي متاح", "سوق حرة سياحية ضخمة", "مكاتب تأجير سيارات وشركات سياحة", "بنوك وصرافة"],
    airlines: "مصر للطيران، طيران إيزي جيت، طيران كورندون، طيران التكثيف الإقليمي والرحلات الشارتر الروسية والأوروبية.",
    phone: "065-3412000",
    mapUrl: "https://maps.google.com/?q=Hurghada+International+Airport"
  },
  {
    name: "مطار شرم الشيخ الدولي (SSH)",
    code: "SSH",
    city: "جنوب سيناء (شرم الشيخ)",
    type: "مطار دولي سياحي",
    terminals: "مبنى الركاب 1 (المطور والجديد)، ومبنى الركاب 2.",
    services: ["خدمات سياحية متكاملة", "سوق حرة متنوعة", "صالات VIP مخصصة للوفود", "بنوك وصرافة 24 ساعة", "منطقة كافيهات خارجية ممتازة"],
    airlines: "مصر للطيران، طيران الخليج، الخطوط السعودية، والعديد من شركات الطيران الأوروبية والشارتر والروسية.",
    phone: "069-3601140",
    mapUrl: "https://maps.google.com/?q=Sharm+El-Sheikh+International+Airport"
  },
  {
    name: "مطار الأقصر الدولي (LXR)",
    code: "LXR",
    city: "الأقصر",
    type: "مطار دولي أثري",
    terminals: "مبنى ركاب رئيسي مصمم بطراز يتماشى مع الطابع الأثري لمدينة الأقصر.",
    services: ["سوق حرة للهدايا والتحف", "صالات انتظار مريحة ومكيفة", "ماكينات صرف آلي وبنوك", "مواقف حافلات سياحية واسعة"],
    airlines: "مصر للطيران، طيران النيل، وطيران مصر للطيران إكسبريس، ورحلات سياحية عارضة من أوروبا والخليج.",
    phone: "095-2374655",
    mapUrl: "https://maps.google.com/?q=Luxor+International+Airport"
  }
];

export default function AirportsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAirports = AIRPORTS_DATA.filter(
    a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4.5rem", marginBottom: "16px" }}>✈️</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "10px", color: "var(--text-primary)" }}>
          دليل المطارات المصرية
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          دليلك الشامل للمطارات الدولية والمحلية في مصر. ابحث عن معلومات الصالات، شركات الطيران المتاحة، أرقام الهواتف، والخدمات والوصول المباشر.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ position: "relative", maxWidth: "450px" }}>
          <input
            type="text"
            placeholder="ابحث باسم المطار أو المدينة أو كود المطار (مثال: Cairo)..."
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

      {/* Airports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {filteredAirports.length > 0 ? (
          filteredAirports.map((airport, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1.3rem", fontWeight: "800", color: "#fff" }}>{airport.name}</h3>
                  <span style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: "700", background: "rgba(99, 102, 241, 0.12)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
                    {airport.type}
                  </span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8rem" }}>المدينة / المحافظة</span>
                  <strong style={{ color: "#fff", fontSize: "1rem" }}>📍 {airport.city}</strong>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", lineHeight: "1.6" }}>
                
                {/* Terminals */}
                <div>
                  <strong style={{ color: "#fff", fontSize: "0.92rem", display: "block", marginBottom: "4px" }}>🚪 صالات السفر ومباني الركاب:</strong>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem" }}>{airport.terminals}</p>
                </div>

                {/* Airlines */}
                <div>
                  <strong style={{ color: "#fff", fontSize: "0.92rem", display: "block", marginBottom: "4px" }}>✈️ أهم خطوط الطيران العاملة بالمطار:</strong>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem" }}>{airport.airlines}</p>
                </div>

                {/* Services */}
                <div>
                  <strong style={{ color: "#fff", fontSize: "0.92rem", display: "block", marginBottom: "6px" }}>⚙️ الخدمات والتسهيلات المتاحة:</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {airport.services.map((srv, sIdx) => (
                      <span key={sIdx} style={{ fontSize: "0.78rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "8px", color: "var(--text-secondary)" }}>
                        ✨ {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Phone & Directions */}
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "18px", marginTop: "8px" }}>
                  <div>
                    <strong style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>📞 رقم الهاتف/الاستعلامات: </strong>
                    <span style={{ color: "#fff", fontWeight: "700", fontSize: "0.95rem" }}>{airport.phone}</span>
                  </div>
                  
                  <a
                    href={airport.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#6366f1",
                      textDecoration: "none",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#6366f1";
                      e.currentTarget.style.color = "#000";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "#6366f1";
                    }}
                  >
                    <i className="bx bx-map" style={{ fontSize: "1.1rem" }}></i>
                    عرض على الخريطة والاتجاهات
                  </a>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            لا توجد مطارات مطابقة لبحثك. يرجى تعديل العبارة والمحاولة مجدداً.
          </div>
        )}
      </div>
    </div>
  );
}
