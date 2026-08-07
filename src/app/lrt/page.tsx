"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// LRT Stations List in Order
const LRT_MAIN_TRUNK = [
  "عدلي منصور", "العبور", "المستقبل", "الشروق", "هليوبوليس الجديدة", "بدر"
];

const LRT_BRANCH_CAPITAL = [
  "الروبيكي", "حدائق العاصمة", "مطار العاصمة", "مدينة الفنون والثقافة"
];

const LRT_BRANCH_RAMADAN = [
  "المنطقة الصناعية", "مدينة المعرفة"
];

// All stations for dropdown selection
const ALL_LRT_STATIONS = [
  ...LRT_MAIN_TRUNK,
  ...LRT_BRANCH_CAPITAL,
  ...LRT_BRANCH_RAMADAN
];

export default function LrtPage() {
  const [fromStation, setFromStation] = useState<string>("عدلي منصور");
  const [toStation, setToStation] = useState<string>("مدينة الفنون والثقافة");

  // Calculate distance & price
  const routeResult = useMemo(() => {
    if (fromStation === toStation) {
      return { stations: [fromStation], count: 0, price: 0 };
    }

    // Function to get index/path
    const getPath = (station: string): { trunkIdx: number; branch: "capital" | "ramadan" | null; branchIdx: number } => {
      const trunkIdx = LRT_MAIN_TRUNK.indexOf(station);
      if (trunkIdx !== -1) {
        return { trunkIdx, branch: null, branchIdx: -1 };
      }
      const capIdx = LRT_BRANCH_CAPITAL.indexOf(station);
      if (capIdx !== -1) {
        return { trunkIdx: LRT_MAIN_TRUNK.length - 1, branch: "capital", branchIdx: capIdx };
      }
      const ramIdx = LRT_BRANCH_RAMADAN.indexOf(station);
      if (ramIdx !== -1) {
        return { trunkIdx: LRT_MAIN_TRUNK.length - 1, branch: "ramadan", branchIdx: ramIdx };
      }
      return { trunkIdx: 0, branch: null, branchIdx: -1 };
    };

    const pFrom = getPath(fromStation);
    const pTo = getPath(toStation);

    let stationsPath: string[] = [];

    // Case 1: Both on the trunk
    if (!pFrom.branch && !pTo.branch) {
      const min = Math.min(pFrom.trunkIdx, pTo.trunkIdx);
      const max = Math.max(pFrom.trunkIdx, pTo.trunkIdx);
      stationsPath = LRT_MAIN_TRUNK.slice(min, max + 1);
      if (pFrom.trunkIdx > pTo.trunkIdx) stationsPath.reverse();
    }
    // Case 2: One on trunk, one on branch
    else if (!pFrom.branch && pTo.branch) {
      const branchList = pTo.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
      const minTrunk = Math.min(pFrom.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const maxTrunk = Math.max(pFrom.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const trunkPart = LRT_MAIN_TRUNK.slice(minTrunk, maxTrunk + 1);
      if (pFrom.trunkIdx > LRT_MAIN_TRUNK.length - 1) trunkPart.reverse();
      
      const branchPart = branchList.slice(0, pTo.branchIdx + 1);
      stationsPath = [...trunkPart.slice(0, -1), "بدر", ...branchPart];
    }
    else if (pFrom.branch && !pTo.branch) {
      const branchList = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
      const branchPart = branchList.slice(0, pFrom.branchIdx + 1).reverse();
      const minTrunk = Math.min(pTo.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const maxTrunk = Math.max(pTo.trunkIdx, LRT_MAIN_TRUNK.length - 1);
      const trunkPart = LRT_MAIN_TRUNK.slice(minTrunk, maxTrunk + 1);
      if (LRT_MAIN_TRUNK.length - 1 > pTo.trunkIdx) trunkPart.reverse();

      stationsPath = [...branchPart, "بدر", ...trunkPart.slice(1)];
    }
    // Case 3: Both on branches
    else if (pFrom.branch && pTo.branch) {
      if (pFrom.branch === pTo.branch) {
        // Same branch
        const branchList = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const min = Math.min(pFrom.branchIdx, pTo.branchIdx);
        const max = Math.max(pFrom.branchIdx, pTo.branchIdx);
        stationsPath = branchList.slice(min, max + 1);
        if (pFrom.branchIdx > pTo.branchIdx) stationsPath.reverse();
      } else {
        // Different branches (go through Badr)
        const branchListFrom = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const branchListTo = pTo.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const partFrom = branchListFrom.slice(0, pFrom.branchIdx + 1).reverse();
        const partTo = branchListTo.slice(0, pTo.branchIdx + 1);
        stationsPath = [...partFrom, "بدر", ...partTo];
      }
    }

    // Deduplicate Badr or any adjacent overlaps
    stationsPath = stationsPath.filter((v, i, a) => a.indexOf(v) === i);

    const count = stationsPath.length;
    let price = 10;
    if (count <= 3) price = 10;
    else if (count <= 7) price = 15;
    else if (count <= 12) price = 20;
    else price = 25;

    return { stations: stationsPath, count, price };
  }, [fromStation, toStation]);

  return (
    <div className="app-container" style={{ maxWidth: "900px", paddingTop: "40px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
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
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4.5rem", marginBottom: "16px" }}>🚄</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "10px", color: "var(--text-primary)" }}>
          القطار الكهربائي الخفيف LRT
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          شريان التنمية الجديد الذي يربط محطة عدلي منصور التبادلية بمدن العبور، الشروق، المستقبل، وبدر، ويتفرع إلى العاصمة الإدارية الجديدة ومدينة العاشر من رمضان.
        </p>
      </div>

      {/* Calculator Section */}
      <div className="glass-panel" style={{ padding: "32px 24px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
          🎫 حاسبة التذاكر ومخطط الرحلات
        </h2>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>محطة القيام (البداية):</label>
            <select 
              value={fromStation} 
              onChange={e => setFromStation(e.target.value)} 
              className="ios-input"
              style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid var(--border-glass)" }}
            >
              {ALL_LRT_STATIONS.map(s => <option key={s} value={s} style={{ backgroundColor: "#1e293b" }}>{s}</option>)}
            </select>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>محطة الوصول (النهاية):</label>
            <select 
              value={toStation} 
              onChange={e => setToStation(e.target.value)} 
              className="ios-input"
              style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid var(--border-glass)" }}
            >
              {ALL_LRT_STATIONS.map(s => <option key={s} value={s} style={{ backgroundColor: "#1e293b" }}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Output */}
        {fromStation !== toStation ? (
          <div style={{ background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.25)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>سعر تذكرة الرحلة</span>
                <strong style={{ fontSize: "2rem", color: "#06b6d4" }}>{routeResult.price} جنيه مصري</strong>
              </div>
              <div style={{ textAlign: "left" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>عدد المحطات</span>
                <strong style={{ fontSize: "1.5rem", color: "#fff" }}>{routeResult.count} محطة</strong>
              </div>
            </div>
            
            {/* Station Path */}
            <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
              <div style={{ fontWeight: "700", marginBottom: "12px", fontSize: "0.95rem", color: "#fff" }}>مسار الرحلة بالتفصيل:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                {routeResult.stations.map((s, idx) => (
                  <React.Fragment key={s}>
                    <span style={{ 
                      padding: "6px 12px", 
                      borderRadius: "20px", 
                      background: idx === 0 || idx === routeResult.stations.length - 1 ? "#06b6d4" : "rgba(255,255,255,0.06)", 
                      color: idx === 0 || idx === routeResult.stations.length - 1 ? "#000" : "#fff",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      border: idx === 0 || idx === routeResult.stations.length - 1 ? "none" : "1px solid rgba(255,255,255,0.1)"
                    }}>
                      {s}
                    </span>
                    {idx < routeResult.stations.length - 1 && <span style={{ color: "#06b6d4", fontWeight: "bold" }}>←</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", margin: 0, textAlign: "center" }}>يرجى اختيار محطة بداية ونهاية مختلفتين لحساب تفاصيل الرحلة.</p>
        )}
      </div>

      {/* Interactive Map/Line Layout */}
      <div className="glass-panel" style={{ padding: "32px 24px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
          🗺️ خريطة ومسارات خط القطار الكهربائي LRT
        </h2>

        {/* Stations Route Representation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative", paddingRight: "20px" }}>
          
          {/* Trunk */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#06b6d4", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📍 الخط الرئيسي (من عدلي منصور إلى بدر)</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {LRT_MAIN_TRUNK.map((s, idx) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: s === "عدلي منصور" || s === "بدر" ? "#eab308" : "#06b6d4",
                    border: "3px solid #101528",
                    boxShadow: "0 0 10px rgba(6, 182, 212, 0.5)",
                    zIndex: 2
                  }} />
                  {idx < LRT_MAIN_TRUNK.length - 1 && (
                    <div style={{
                      position: "absolute",
                      top: "16px",
                      right: "6px",
                      width: "3px",
                      height: "22px",
                      backgroundColor: "#06b6d4",
                      zIndex: 1
                    }} />
                  )}
                  <div>
                    <span style={{ fontWeight: "700", color: "#fff", fontSize: "0.95rem" }}>{s}</span>
                    {s === "عدلي منصور" && <span style={{ marginRight: "10px", fontSize: "0.75rem", padding: "2px 6px", borderRadius: "6px", background: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.3)" }}>تبادلية مع الخط الثالث للمترو 🚇</span>}
                    {s === "بدر" && <span style={{ marginRight: "10px", fontSize: "0.75rem", padding: "2px 6px", borderRadius: "6px", background: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.3)" }}>محطة تفريعة المسارين 🔀</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
            
            {/* Branch A */}
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#a855f7", marginBottom: "14px" }}>🚀 فرعة العاصمة الإدارية (جنوباً)</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {LRT_BRANCH_CAPITAL.map((s, idx) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
                    <div style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "#a855f7",
                      border: "2px solid #101528",
                      zIndex: 2
                    }} />
                    {idx < LRT_BRANCH_CAPITAL.length - 1 && (
                      <div style={{
                        position: "absolute",
                        top: "14px",
                        right: "5px",
                        width: "3px",
                        height: "22px",
                        backgroundColor: "#a855f7",
                        zIndex: 1
                      }} />
                    )}
                    <div>
                      <span style={{ fontWeight: "700", color: "#e2e8f0", fontSize: "0.9rem" }}>{s}</span>
                      {s === "مدينة الفنون والثقافة" && <span style={{ marginRight: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>(محطة نهائية)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Branch B */}
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#10b981", marginBottom: "14px" }}>🏭 فرعة العاشر من رمضان (شمالاً)</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {LRT_BRANCH_RAMADAN.map((s, idx) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
                    <div style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      border: "2px solid #101528",
                      zIndex: 2
                    }} />
                    {idx < LRT_BRANCH_RAMADAN.length - 1 && (
                      <div style={{
                        position: "absolute",
                        top: "14px",
                        right: "5px",
                        width: "3px",
                        height: "22px",
                        backgroundColor: "#10b981",
                        zIndex: 1
                      }} />
                    )}
                    <div>
                      <span style={{ fontWeight: "700", color: "#e2e8f0", fontSize: "0.9rem" }}>{s}</span>
                      {s === "مدينة المعرفة" && <span style={{ marginRight: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>(محطة نهائية)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
