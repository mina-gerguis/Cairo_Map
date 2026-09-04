"use client";

import React, { useState } from "react";
import Link from "next/link";

interface BusCompany {
  id: string;
  name: string;
  logo: string;
  phone: string;
  website: string;
  hubs: string[];
}

interface BusRoute {
  id: string;
  companyId: string;
  companyName: string;
  from: string;
  to: string;
  departureStation: string;
  times: string[];
  classType: string;
  price: number;
}

const companiesData: BusCompany[] = [
  {
    id: "gobus",
    name: "جو باص (Go Bus)",
    logo: "🚌",
    phone: "19567",
    website: "https://go-bus.com",
    hubs: ["عبد المنعم رياض (وسط البلد)", "ألماظة (مصر الجديدة)", "نادي الصيد (المهندسين)", "الجيزة (ميدان الرماية)"],
  },
  {
    id: "superjet",
    name: "السوبر جيت (SuperJet)",
    logo: "🚍",
    phone: "19157",
    website: "https://superjet.com.eg",
    hubs: ["موقف الترجمان (وسط البلد)", "ألماظة (مصر الجديدة)", "موقف عدلي منصور"],
  },
  {
    id: "bluebus",
    name: "بلو باص (Blue Bus)",
    logo: "🚐",
    phone: "16294",
    website: "https://bluebus.com.eg",
    hubs: ["ميدان التحرير", "نادي الصيد", "الشيخ زايد (هايبر وان)"],
  },
  {
    id: "eastdelta",
    name: "شرق الدلتا للنقل والسياحة",
    logo: "🚏",
    phone: "0225761234",
    website: "#",
    hubs: ["موقف عبود", "موقف القللي", "موقف عدلي منصور"],
  },
];

const busRoutesData: BusRoute[] = [
  {
    id: "r1",
    companyId: "gobus",
    companyName: "جو باص (Go Bus)",
    from: "القاهرة (عبد المنعم رياض)",
    to: "الإسكندرية (محرم بك / سيدي جابر)",
    departureStation: "عبد المنعم رياض - وسط البلد",
    times: ["07:00 ص", "09:00 ص", "12:00 ظ", "03:00 ع", "06:00 م", "09:00 م"],
    classType: "درجة أوريجينال / ايكونومي VIP",
    price: 130,
  },
  {
    id: "r2",
    companyId: "superjet",
    companyName: "السوبر جيت (SuperJet)",
    from: "القاهرة (الترجمان / ألماظة)",
    to: "الإسكندرية (موقف الموقف الجديد)",
    departureStation: "ألماظة - مصر الجديدة",
    times: ["06:30 ص", "08:30 ص", "11:00 ص", "02:00 ظ", "05:00 م"],
    classType: "مكيف فاخر",
    price: 110,
  },
  {
    id: "r3",
    companyId: "gobus",
    companyName: "جو باص (Go Bus)",
    from: "القاهرة (ألماظة)",
    to: "شرم الشيخ (الرويسات)",
    departureStation: "ألماظة - مصر الجديدة",
    times: ["01:00 ص", "07:30 ص", "11:30 م"],
    classType: "درجة إيليت جولد (Elite Gold)",
    price: 380,
  },
  {
    id: "r4",
    companyId: "bluebus",
    companyName: "بلو باص (Blue Bus)",
    from: "القاهرة (الشيخ زايد / التحرير)",
    to: "الغردقة (موقف النصر)",
    departureStation: "نادي الصيد - المهندسين",
    times: ["02:00 ص", "08:00 ص", "11:00 م"],
    classType: "VIP Business",
    price: 420,
  },
  {
    id: "r5",
    companyId: "eastdelta",
    companyName: "شرق الدلتا",
    from: "القاهرة (عبود / عدلي منصور)",
    to: "المنصورة (موقف الجديد)",
    departureStation: "موقف عبود",
    times: ["كل ساعة من 06:00 ص حتى 10:00 م"],
    classType: "مكيف عادي",
    price: 65,
  },
  {
    id: "r6",
    companyId: "superjet",
    companyName: "السوبر جيت",
    from: "القاهرة (الترجمان)",
    to: "أسيوط / سوهاج (الصعيد)",
    departureStation: "موقف الترجمان",
    times: ["08:00 ص", "08:00 م", "10:00 م"],
    classType: "مكيف فاخر",
    price: 220,
  },
];

export default function IntercityBusesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");

  const filteredRoutes = busRoutesData.filter((route) => {
    const matchesSearch =
      route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === "all" || route.companyId === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <div style={{ padding: "30px 16px 80px 16px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "3rem", background: "rgba(99, 102, 241, 0.15)", padding: "12px 18px", borderRadius: "20px" }}>
            🚌
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
              دليل أتوبيسات الأقاليم والسفر بين المحافظات
            </h1>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", marginTop: "6px", margin: 0 }}>
              استعلم عن مواعيد وأسعار رحلات جو باص، السوبرجيت، بلو باص، وأهم محطات الانطلاق بالقاهرة.
            </p>
          </div>
        </div>
      </div>

      {/* Main Companies Grid */}
      <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "16px" }}>
        🏢 أبرز شركات السفر والنقل الجماعي
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {companiesData.map((company) => (
          <div
            key={company.id}
            className="glass-panel"
            style={{
              padding: "20px",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "1.8rem" }}>{company.logo}</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
                  {company.name}
                </h3>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                📍 المحطات: {company.hubs.join(" • ")}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <a
                href={`tel:${company.phone}`}
                className="btn"
                style={{ flex: 1, padding: "8px", fontSize: "0.82rem", textAlign: "center" }}
              >
                📞 {company.phone}
              </a>
              {company.website !== "#" && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "8px", fontSize: "0.82rem", textAlign: "center" }}
                >
                  🌐 حجز أونلاين
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Route Schedule */}
      <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "16px" }}>
        🗺️ مواعيد الرحلات والخطوط الشائعة
      </h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="ابحث عن المحافظة أو الوجهة (مثال: الإسكندرية، شرم الشيخ، المنصورة)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 2,
            minWidth: "260px",
            padding: "12px 18px",
            borderRadius: "14px",
            background: "var(--bgGlass)",
            border: "1px solid var(--borderGlass)",
            color: "var(--textPrimary)",
            outline: "none"
          }}
        />

        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          style={{
            flex: 1,
            minWidth: "180px",
            padding: "12px 18px",
            borderRadius: "14px",
            background: "var(--bgGlass)",
            border: "1px solid var(--borderGlass)",
            color: "var(--textPrimary)"
          }}
        >
          <option value="all">جميع الشركات</option>
          {companiesData.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Routes List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="glass-panel"
            style={{
              padding: "22px",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ padding: "6px 12px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.2)", color: "#818cf8", fontSize: "0.85rem", fontWeight: "800" }}>
                  {route.companyName}
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
                  {route.from} ➔ {route.to}
                </h3>
              </div>

              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#10b981" }}>
                {route.price} ج.م <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "normal" }}>/ تذكرة</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.88rem", color: "var(--textSecondary)" }}>
              <span>📍 <strong>محطة المغادرة:</strong> {route.departureStation}</span>
              <span>💺 <strong>الفئة:</strong> {route.classType}</span>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "14px", border: "1px solid var(--borderGlass)" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                ⏰ مواعيد القيام اليومية:
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {route.times.map((time, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      background: "rgba(99, 102, 241, 0.12)",
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                      color: "var(--textPrimary)",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "700"
                    }}
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
