"use client";

import React, { useState } from "react";
import Link from "next/link";

interface BusCompany {
  name: string;
  phone: string;
  type: string;
}

interface BusStation {
  name: string;
  location: string;
  governorate: string;
  companies: BusCompany[];
  destinations: string[];
  description: string;
  mapUrl: string;
}

const BUS_STATIONS_DATA: BusStation[] = [
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
    mapUrl: "https://maps.google.com/?q=Almaza+Super+Jet+Station"
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
    mapUrl: "https://maps.google.com/?q=Torgoman+Bus+Station"
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
    mapUrl: "https://maps.google.com/?q=Abdel+Moneim+Riad+Bus+Station"
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
    mapUrl: "https://maps.google.com/?q=Abboud+Bus+Station"
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
    mapUrl: "https://maps.google.com/?q=Moneeb+Bus+Station"
  }
];

export default function BusStationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStations = BUS_STATIONS_DATA.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destinations.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
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
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4.5rem", marginBottom: "16px" }}>🚌</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "10px", color: "var(--text-primary)" }}>
          مواقف الأتوبيسات وشركات السفر
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          دليلك لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى. ابحث عن الشركات المتواجدة بكل موقف، أرقام الحجز السريع والخطوط المتاحة.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ position: "relative", maxWidth: "450px" }}>
          <input
            type="text"
            placeholder="ابحث باسم الموقف، الوجهة (مثال: الإسكندرية، سوهاج)..."
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

      {/* Bus Stations List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {filteredStations.length > 0 ? (
          filteredStations.map((station, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1.25rem", fontWeight: "800", color: "#fff" }}>{station.name}</h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    📍 {station.location}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.25)", padding: "4px 10px", borderRadius: "20px", fontWeight: "700" }}>
                    {station.governorate}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Description */}
                <div>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>{station.description}</p>
                </div>

                {/* Companies inside the station */}
                <div>
                  <strong style={{ color: "#fff", fontSize: "0.92rem", display: "block", marginBottom: "8px" }}>🎫 شركات السفر والحجز المتاحة بالداخل:</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                    {station.companies.map((company, cIdx) => (
                      <div key={cIdx} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ color: "#fff", fontWeight: "700", fontSize: "0.88rem", display: "block" }}>{company.name}</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{company.type}</span>
                        </div>
                        <a 
                          href={`tel:${company.phone}`} 
                          style={{ 
                            background: "rgba(245, 158, 11, 0.1)", 
                            color: "#f59e0b", 
                            padding: "4px 10px", 
                            borderRadius: "6px", 
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

                {/* Served destinations */}
                <div>
                  <strong style={{ color: "#fff", fontSize: "0.92rem", display: "block", marginBottom: "6px" }}>🚌 أهم الوجهات المباشرة من الموقف:</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {station.destinations.map((dest, dIdx) => (
                      <span key={dIdx} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "3px 8px", borderRadius: "6px", color: "var(--text-secondary)" }}>
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Map Directions */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginTop: "4px", display: "flex", justifyContent: "flex-end" }}>
                  <a
                    href={station.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#f59e0b",
                      textDecoration: "none",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#f59e0b";
                      e.currentTarget.style.color = "#000";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.color = "#f59e0b";
                    }}
                  >
                    <i className="bx bx-map" style={{ fontSize: "1.15rem" }}></i>
                    عرض الموقع والاتجاهات
                  </a>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            لا توجد مواقف أتوبيسات مطابقة لبحثك. يرجى تعديل الكلمات والمحاولة مجدداً.
          </div>
        )}
      </div>
    </div>
  );
}
