"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_LRT: any[] = [
  { name: "عدلي منصور", line_type: "trunk", station_order: 1 },
  { name: "العبور", line_type: "trunk", station_order: 2 },
  { name: "المستقبل", line_type: "trunk", station_order: 3 },
  { name: "الشروق", line_type: "trunk", station_order: 4 },
  { name: "هليوبوليس الجديدة", line_type: "trunk", station_order: 5 },
  { name: "بدر", line_type: "trunk", station_order: 6 },
  { name: "الروبيكي", line_type: "capital", station_order: 1 },
  { name: "حدائق العاصمة", line_type: "capital", station_order: 2 },
  { name: "مطار العاصمة", line_type: "capital", station_order: 3 },
  { name: "مدينة الفنون والثقافة", line_type: "capital", station_order: 4 },
  { name: "المنطقة الصناعية", line_type: "ramadan", station_order: 1 },
  { name: "مدينة المعرفة", line_type: "ramadan", station_order: 2 }
];

export default function LrtPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromStation, setFromStation] = useState<string>("");
  const [toStation, setToStation] = useState<string>("");

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

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
        <div className="glass-panel" style={{ padding: "48px 32px", textAlign: "center", border: "1px solid rgba(99, 102, 241, 0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            left: "-20px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
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
            background: "rgba(99, 102, 241, 0.08)",
            borderRadius: "50%",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#6366f1",
            animation: "pulse 2s infinite"
          }}>
            <i className="bx bxs-lock-alt"></i>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#fff", marginBottom: "14px" }}>
            دليل القطار الكهربائي LRT ميزة فضية 🥈
          </h2>
          
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
            تصفح المحطات وجدول المواعيد وحاسبة تذاكر القطار الكهربائي LRT متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية.
          </p>

          {/* Features list */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الفضية (40 ج.م/شهرياً):</div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ تصفح جميع محطات LRT (التفريعة الرئيسية وتفريعات العاصمة ورمضان)</li>
              <li>✨ حساب أسعار التذاكر بناء على عدد المحطات تلقائياً</li>
              <li>✨ مسارات تفصيلية ومواعيد الرحلات الرسمية</li>
              <li>✨ متاح معها ميزة ازاي اروح وسكك الحديد والمونوريل بالكامل</li>
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
                  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                  display: "block"
                }}
              >
                🚀 اشترك الآن ورقّ حسابك للفضية (40 ج.م)
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
      const local = getLocalStations();
      setStations(local);
      initializeSelectors(local);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lrt_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error) {
        const local = getLocalStations();
        setStations(local);
        initializeSelectors(local);
      } else {
        const loaded = data || [];
        setStations(loaded);
        initializeSelectors(loaded);
      }
    } catch (err) {
      const local = getLocalStations();
      setStations(local);
      initializeSelectors(local);
    } finally {
      setLoading(false);
    }
  };

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_LRT;
    const local = localStorage.getItem("local_lrt");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_LRT;
      }
    }
    localStorage.setItem("local_lrt", JSON.stringify(DEFAULT_LRT));
    return DEFAULT_LRT;
  };

  const initializeSelectors = (stationList: any[]) => {
    const main = stationList.filter(s => s.line_type === "trunk").sort((a,b) => a.station_order - b.station_order);
    const cap = stationList.filter(s => s.line_type === "capital").sort((a,b) => a.station_order - b.station_order);
    if (main.length > 0) {
      setFromStation(main[0].name);
    }
    if (cap.length > 0) {
      setToStation(cap[cap.length - 1].name);
    } else if (main.length > 1) {
      setToStation(main[main.length - 1].name);
    }
  };

  const LRT_MAIN_TRUNK = useMemo(() => {
    return stations
      .filter(s => s.line_type === "trunk")
      .sort((a, b) => a.station_order - b.station_order)
      .map(s => s.name);
  }, [stations]);

  const LRT_BRANCH_CAPITAL = useMemo(() => {
    return stations
      .filter(s => s.line_type === "capital")
      .sort((a, b) => a.station_order - b.station_order)
      .map(s => s.name);
  }, [stations]);

  const LRT_BRANCH_RAMADAN = useMemo(() => {
    return stations
      .filter(s => s.line_type === "ramadan")
      .sort((a, b) => a.station_order - b.station_order)
      .map(s => s.name);
  }, [stations]);

  // All stations for dropdown selection
  const ALL_LRT_STATIONS = useMemo(() => {
    return [
      ...LRT_MAIN_TRUNK,
      ...LRT_BRANCH_CAPITAL,
      ...LRT_BRANCH_RAMADAN
    ];
  }, [LRT_MAIN_TRUNK, LRT_BRANCH_CAPITAL, LRT_BRANCH_RAMADAN]);

  // Calculate distance & price
  const routeResult = useMemo(() => {
    if (!fromStation || !toStation || fromStation === toStation) {
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
  }, [fromStation, toStation, LRT_MAIN_TRUNK, LRT_BRANCH_CAPITAL, LRT_BRANCH_RAMADAN]);

  if (loading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "100px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--accent-ios, #06b6d4)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

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
        {fromStation && toStation && fromStation !== toStation ? (
          <div style={{ background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.25)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>سعر تذكرة الرحلة</span>
                <strong style={{ fontSize: "2rem", color: "#06b6d4" }}>{routeResult.price} جنيه مصري</strong>
              </div>
              <div style={{ textAlign: "left", marginRight: "auto" }}>
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
          {LRT_MAIN_TRUNK.length > 0 && (
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
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
            
            {/* Branch A */}
            {LRT_BRANCH_CAPITAL.length > 0 && (
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
                        {idx === LRT_BRANCH_CAPITAL.length - 1 && <span style={{ marginRight: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>(محطة نهائية)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Branch B */}
            {LRT_BRANCH_RAMADAN.length > 0 && (
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
                        {idx === LRT_BRANCH_RAMADAN.length - 1 && <span style={{ marginRight: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>(محطة نهائية)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
