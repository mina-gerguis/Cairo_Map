"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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

export const STATION_DETAILS: Record<string, { landmarks: string[]; type: string; status: "تشغيل فعلي" | "تحت الإنشاء" }> = {
  "عدلي منصور": {
    landmarks: ["محطة عدلي منصور التبادلية", "موقف سوبر جيت", "طريق مصر الإسماعيلية الصحراوي", "الخط الثالث للمترو"],
    type: "تبادلية مع الخط الثالث للمترو ومحطة السكك الحديدية و الاتوبيس الترددي 🚇",
    status: "تشغيل فعلي"
  },
  "العبور": {
    landmarks: ["مدينة العبور الجولف", "جامعة بنها فرع العبور", "طريق مصر الإسماعيلية", "سوق العبور"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "المستقبل": {
    landmarks: ["مدينة المستقبل السكنية", "طريق الإسماعيلية الصحراوي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "الشروق": {
    landmarks: ["المدخل الرئيسي لمدينة الشروق", "الجامعة البريطانية في مصر (BUE)", "أكاديمية الشروق", "نادي هليوبوليس الرياضي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "هليوبوليس الجديدة": {
    landmarks: ["مدينة هليوبوليس الجديدة", "طريق السويس الصحراوي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "بدر": {
    landmarks: ["محطة بدر التبادلية", "مدينة بدر السكنية", "طريق الروبيكي", "منطقة الصناعات المتوسطة"],
    type: "محطة تفريعة المسارين 🔀",
    status: "تشغيل فعلي"
  },
  "الروبيكي": {
    landmarks: ["مدينة الروبيكي للجلود", "المنطقة الصناعية بالروبيكي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "حدائق العاصمة": {
    landmarks: ["مدينة حدائق العاصمة السكنية", "سكن لكل المصريين"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "مطار العاصمة": {
    landmarks: ["مطار العاصمة الإدارية الدولي", "منطقة المطار الإدارية"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "مدينة الفنون والثقافة": {
    landmarks: ["مدينة الفنون والثقافة بالعاصمة", "النهر الأخضر", "دار الأوبرا الجديدة", "فندق الماسة", "محطة المونوريل"],
    type: "تبادلية مع المونوريل 🚄",
    status: "تشغيل فعلي"
  },
  "المنطقة الصناعية": {
    landmarks: ["المنطقة الصناعية بالعاشر من رمضان", "طريق بلبيس العاشر"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "مدينة المعرفة": {
    landmarks: ["مدينة المعرفة بالعاشر من رمضان", "جامعة سنجور", "مراكز البحوث والابتكار", "المعهد التكنولوجي العالي"],
    type: "عادية",
    status: "تشغيل فعلي"
  },
  "العاصمة المركزية": {
    landmarks: ["العاصمة المركزية"],
    type: "محطة تبادلية مخططة مع القطار الكهربائي السريع (العين السخنة–مطروح) 🚄",
    status: "تشغيل فعلي"
  }
};

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}

export default function LrtPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search autocomplete states
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Active Trip States
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // LRT Explorer State
  const [activeLine, setActiveLine] = useState<"all" | "trunk" | "capital" | "ramadan">("all");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadStations();
    }
  }, [user, hasAccess]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    const main = stationList.filter(s => s.line_type === "trunk").sort((a, b) => a.station_order - b.station_order);
    const cap = stationList.filter(s => s.line_type === "capital").sort((a, b) => a.station_order - b.station_order);
    if (main.length > 0) {
      setSelectedFrom(main[0].name);
      setFromQuery(main[0].name);
    }
    if (cap.length > 0) {
      setSelectedTo(cap[cap.length - 1].name);
      setToQuery(cap[cap.length - 1].name);
    } else if (main.length > 1) {
      setSelectedTo(main[main.length - 1].name);
      setToQuery(main[main.length - 1].name);
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

  const ALL_LRT_STATIONS = useMemo(() => {
    return [
      ...LRT_MAIN_TRUNK,
      ...LRT_BRANCH_CAPITAL,
      ...LRT_BRANCH_RAMADAN
    ];
  }, [LRT_MAIN_TRUNK, LRT_BRANCH_CAPITAL, LRT_BRANCH_RAMADAN]);

  const filteredFrom = useMemo(() => {
    const q = normalizeArabic(fromQuery.trim());
    return ALL_LRT_STATIONS.filter(s => normalizeArabic(s).includes(q) && q.length > 0);
  }, [fromQuery, ALL_LRT_STATIONS]);

  const filteredTo = useMemo(() => {
    const q = normalizeArabic(toQuery.trim());
    return ALL_LRT_STATIONS.filter(s => normalizeArabic(s).includes(q) && q.length > 0);
  }, [toQuery, ALL_LRT_STATIONS]);

  const searchResults = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (q.length === 0) return [];
    return (stations.length > 0 ? stations : DEFAULT_LRT).filter(s => normalizeArabic(s.name).includes(q));
  }, [searchQuery, stations]);

  const handleSelectSearchStation = (station: any) => {
    setActiveLine(station.line_type);
    setExpandedStation(station.name);
    setSearchQuery("");
    setIsDropdownOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`station-${station.name}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleFind = () => {
    if (!selectedFrom || !selectedTo) return;
    const route = calculateRoute(selectedFrom, selectedTo);
    setResult(route);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const swapStations = () => {
    const tempF = selectedFrom;
    const tempT = selectedTo;
    setSelectedFrom(tempT);
    setSelectedTo(tempF);
    setFromQuery(tempT || "");
    setToQuery(tempF || "");
    setResult(null);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const handleStationClick = (stationName: string) => {
    if (expandedStation === stationName) {
      setExpandedStation(null);
    } else {
      setExpandedStation(stationName);
    }
  };

  // Calculate distance & price
  const calculateRoute = (from: string, to: string) => {
    if (!from || !to || from === to) {
      return { stations: [from], count: 0, price: 0 };
    }

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

    const pFrom = getPath(from);
    const pTo = getPath(to);

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
        const branchList = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const min = Math.min(pFrom.branchIdx, pTo.branchIdx);
        const max = Math.max(pFrom.branchIdx, pTo.branchIdx);
        stationsPath = branchList.slice(min, max + 1);
        if (pFrom.branchIdx > pTo.branchIdx) stationsPath.reverse();
      } else {
        const branchListFrom = pFrom.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const branchListTo = pTo.branch === "capital" ? LRT_BRANCH_CAPITAL : LRT_BRANCH_RAMADAN;
        const partFrom = branchListFrom.slice(0, pFrom.branchIdx + 1).reverse();
        const partTo = branchListTo.slice(0, pTo.branchIdx + 1);
        stationsPath = [...partFrom, "بدر", ...partTo];
      }
    }

    stationsPath = stationsPath.filter((v, i, a) => a.indexOf(v) === i);

    const count = stationsPath.length;
    let price = 10;
    if (count <= 3) price = 10;
    else if (count <= 7) price = 15;
    else if (count <= 12) price = 20;
    else price = 25;

    // Estimate time (average 4 mins per stop for LRT)
    const estimatedTime = (count - 1) * 4;

    return { stations: stationsPath, count, price, estimatedTime };
  };

  if (authLoading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "120px", textAlign: "center", direction: "rtl" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 24px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>جاري التحقق من التفاصيل ...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)" }}>
        {/* Banner matching Metro Cover Style */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bgPrimary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--borderGlass)",
          direction: "rtl"
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
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/Cairo_lrt.png" alt="Cairo Lrt" loading="lazy" decoding="async" style={{ width: "35px", marginLeft: "10px" }} />
              القطار الكهربائي
            </h1>
            <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "10px auto", lineHeight: "1.6" }}>
              خريطة تفاعلية تفصيلية لشبكة القطار الكهربائي الخفيف الجديدة.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
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
              دليل القطار الكهربائي يتطلب أشتراك في الباقة الفضية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح الخريطة التفصيلية والمسارات الزمنية وحاسبة التذاكر لخط القطار الكهربائي LRT متاح للمشتركين بالباقة الفضية أو الذهبية.
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
              <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الفضية</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✨ تصفح جميع محطات LRT (التفريعة الرئيسية وتفريعات العاصمة ورمضان)</li>
                <li>✨ حساب أسعار التذاكر بناء على عدد المحطات تلقائياً</li>
                <li>✨ مسارات تفصيلية ومواعيد الرحلات الرسمية</li>
                <li>✨ متاح معها ميزة ازاي اروح وسكك الحديد والمونوريل بالكامل</li>
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

  if (loading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "100px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--borderGlass)",
          borderTop: "4px solid var(--colorSecondary, #06b6d4)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1rem" }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "40px", backgroundColor: "var(--bgPrimary)" }}>
      {/* Custom styles definition */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
        direction: "rtl"
      }}>
        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "bold",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/Cairo_lrt.png" alt="" loading="lazy" decoding="async" style={{ width: "40px", height: "40px", marginLeft: "10px", objectFit: "contain" }} />
            دليل القطار الكهربائي LRT
          </h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            استكشف المحطات والاتجاهات والمعالم الهامة لخط القطار الكهربائي الخفيف.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#06b6d4",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>عدلي منصور - بدر</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#a855f7",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>تفريعة العاصمة</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>تفريعة العاشر</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl", textAlign: "right" }}>

        {/* Search Panel Card */}
        <div ref={searchContainerRef} className="metro-animate-slide-up metro-delay-200" style={{
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
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> ابحث في محطات القطار الكهربائي LRT
            </label>
            <input
              className="input-fields"
              type="text"
              placeholder="ابحث باسم المحطة..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-heading)",
                height: "50px",
              }}
            />

            {/* Instant Search Results Dropdown */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "var(--bgPrimary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                zIndex: 100,
                marginTop: "6px",
                maxHeight: "260px",
                overflowY: "auto",
                padding: "8px 0"
              }}>
                {searchResults.length === 0 ? (
                  <div style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "var(--textSecondary)",
                    fontSize: "0.9rem"
                  }}>
                    لم يتم العثور على محطات مطابقة
                  </div>
                ) : (
                  searchResults.map((station, index) => {
                    let lineColor = "#06b6d4";
                    let lineName = "الجذع الرئيسي";
                    if (station.line_type === "capital") { lineColor = "#a855f7"; lineName = "تفريعة العاصمة"; }
                    else if (station.line_type === "ramadan") { lineColor = "#10b981"; lineName = "تفريعة العاشر"; }

                    return (
                      <div
                        key={station.id || index}
                        onClick={() => handleSelectSearchStation(station)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 16px",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                          borderBottom: index < searchResults.length - 1 ? "1px solid var(--borderGlass)" : "none"
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bgSecondary)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: lineColor
                          }} />
                          <span style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.95rem" }}>
                            {station.name}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            fontSize: "0.72rem",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            backgroundColor: lineColor + "1a",
                            color: lineColor
                          }}>
                            {lineName}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Calculator Section Card */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "20px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 20,
        }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: "700", color: "var(--textPrimary)" }}>
            <i className="fa-solid fa-route" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> مخطط الرحلة وحساب التذاكر
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            {/* FROM STATION INPUT */}
            <div style={{ position: "relative", zIndex: showFromList ? 10 : 1 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
                من محطة (نقطة الانطلاق):
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="اكتب اسم محطة البداية..."
                  value={fromQuery}
                  onChange={e => { setFromQuery(e.target.value); setSelectedFrom(null); setShowFromList(true); setResult(null); }}
                  onFocus={() => setShowFromList(true)}
                  onBlur={() => setTimeout(() => setShowFromList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                    height: "50px",
                  }}
                />
                {selectedFrom && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الاختيار ✔</span>
                )}
              </div>
              {showFromList && filteredFrom.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                  borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                  boxShadow: "var(--shadow-lg)", marginTop: "6px"
                }}>
                  {filteredFrom.map(s => (
                    <div key={s} onMouseDown={() => { setSelectedFrom(s); setFromQuery(s); setShowFromList(false); }} style={{
                      padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
              <button onClick={swapStations} style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--textSecondary)",
                fontSize: "1.2rem",
                transition: "all 0.2s ease",
                marginTop: "10px",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "rotate(180deg)";
                  e.currentTarget.style.background = "var(--hoverBtn)";
                  e.currentTarget.style.color = "var(--colorSecondary)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "rotate(0deg)";
                  e.currentTarget.style.background = "var(--bgSecondary)";
                  e.currentTarget.style.color = "var(--textSecondary)";
                }}
              >
                ⇅
              </button>
            </div>

            {/* TO STATION INPUT */}
            <div style={{ position: "relative", zIndex: showToList ? 10 : 1 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "6px" }}>
                إلى محطة (الجهة المقصودة):
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-fields"
                  placeholder="اكتب اسم محطة النهاية..."
                  value={toQuery}
                  onChange={e => { setToQuery(e.target.value); setSelectedTo(null); setShowToList(true); setResult(null); }}
                  onFocus={() => setShowToList(true)}
                  onBlur={() => setTimeout(() => setShowToList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-body)",
                    height: "50px"
                  }}
                />
                {selectedTo && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--colorSecondary)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>تم الاختيار ✔</span>
                )}
              </div>
              {showToList && filteredTo.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)",
                  borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                  boxShadow: "var(--shadow-lg)", marginTop: "6px"
                }}>
                  {filteredTo.map(s => (
                    <div key={s} onMouseDown={() => { setSelectedTo(s); setToQuery(s); setShowToList(false); }} style={{
                      padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--hoverBtn)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--textPrimary)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleFind}
            disabled={!selectedFrom || !selectedTo}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: (!selectedFrom || !selectedTo) ? "rgba(255,255,255,0.05)" : "var(--colorSecondary)",
              color: (!selectedFrom || !selectedTo) ? "var(--text-muted)" : "#ffffff",
              fontSize: "0.95rem",
              fontWeight: "700",
              border: "1px solid var(--borderGlass)",
              cursor: (!selectedFrom || !selectedTo) ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-cairo)",
            }}
            onMouseEnter={e => { if (selectedFrom && selectedTo) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { if (selectedFrom && selectedTo) e.currentTarget.style.opacity = "1"; }}
          >
            اعرض الطريق
          </button>
        </div>

        {/* Calculation results display */}
        {result && (
          <div className="metro-animate-slide-up" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "20px",
            marginTop: "20px",
            boxShadow: "var(--shadow-card)",
          }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: "var(--textPrimary)" }}>
              <i className="fa-solid fa-signs-post" style={{ marginLeft: "6px", color: "var(--colorSecondary)" }}></i> تفاصيل الرحلة
            </h3>

            {/* Grid Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--colorSuccess)" }}>{result.price} ج.م</div>
                <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>سعر التذكرة</div>
              </div>
              <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--colorSecondary)" }}>{result.estimatedTime} د</div>
                <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "2px" }}>الوقت التقريبي</div>
              </div>
            </div>

            {/* Start Trip Button */}
            {!isTripActive && (
              <button
                onClick={() => {
                  setIsTripActive(true);
                  setCurrentStepIndex(0);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "var(--colorSecondary)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-cairo)"
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                <i className="fa-solid fa-play" style={{ marginLeft: "5px" }}></i>
                ابدأ تتبع الرحلة
              </button>
            )}

            {/* Active Trip Tracker Card */}
            {isTripActive && (
              <div style={{
                background: "var(--bgSecondary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "var(--shadow-card)",
                animation: "fadeIn 0.3s ease"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--colorSecondary)", background: "rgba(6, 182, 212, 0.12)", padding: "4px 10px", borderRadius: "8px" }}>
                    رحلة نشطة حالياً
                  </span>
                  <button
                    onClick={() => {
                      setIsTripActive(false);
                      setCurrentStepIndex(0);
                    }}
                    style={{
                      border: "none",
                      color: "var(--accent-red)",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      background: "rgba(246, 59, 59, 0.12)", padding: "4px 10px", borderRadius: "8px"
                    }}
                  >
                    إلغاء التتبع
                  </button>
                </div>

                <div style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "var(--textSecondary)" }}>
                  أنت الآن في محطة: <span style={{ color: "var(--textPrimary)", fontSize: "1.1rem", fontWeight: "800" }}>{result.stations[currentStepIndex]}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "8px" }}>
                    ({currentStepIndex + 1} من {result.stations.length})
                  </span>
                </div>

                {(() => {
                  const remainingStops = result.stations.length - 1 - currentStepIndex;
                  const remainingTime = Math.max(0, remainingStops * 4);
                  return (
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "16px", color: "var(--textSecondary)" }}>
                      ⏱️ الوقت المتبقي للوصول: <span style={{ color: "var(--colorSecondary)", fontSize: "1rem", fontWeight: "800" }}>{remainingTime} دقيقة</span>
                    </div>
                  );
                })()}

                {/* Controls */}
                {currentStepIndex < result.stations.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex(prev => prev + 1)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      background: "var(--colorSuccess)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      fontFamily: "var(--font-body)",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    وصلت محطة {result.stations[currentStepIndex + 1]}
                  </button>
                ) : (
                  <div style={{
                    textAlign: "center",
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "10px",
                    padding: "16px",
                  }}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
                    <h4 style={{ color: "var(--colorSuccess)", fontWeight: "800", margin: "0 0 6px" }}>حمد لله على السلامة!</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", margin: "0 0 12px" }}>لقد وصلت إلى وجهتك محطة <span style={{ color: "var(--colorSecondary)", fontSize: "1rem", fontWeight: "800" }}>{result.stations[currentStepIndex]}</span>.</p>
                    <button
                      onClick={() => {
                        setIsTripActive(false);
                        setCurrentStepIndex(0);
                      }}
                      style={{
                        background: "var(--colorSecondary)",
                        color: "#ffffff",
                        padding: "8px 24px",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "0.88rem",
                        fontFamily: "var(--font-cairo)"
                      }}
                    >
                      إنهاء الرحلة
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Station sequence timeline */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", background: "var(--bgSecondary)", padding: "14px", borderRadius: "12px", border: "1px solid var(--borderGlass)" }}>
              {result.stations.map((s: string, idx: number) => {
                const isFirst = idx === 0;
                const isLast = idx === result.stations.length - 1;
                const isPassed = isTripActive && idx < currentStepIndex;
                const isCurrent = isTripActive && idx === currentStepIndex;

                let bg = "var(--bgPrimary)";
                let color = "var(--textPrimary)";
                let border = "1px solid var(--borderGlass)";
                let boxShadow = "none";
                let icon = null;

                if (isTripActive) {
                  if (isPassed) {
                    bg = "rgba(16, 185, 129, 0.15)";
                    color = "#10b981";
                    border = "1px solid rgba(16, 185, 129, 0.4)";
                    icon = "✓";
                  } else if (isCurrent) {
                    bg = "#06b6d4";
                    color = "#ffffff";
                    border = "2px solid #06b6d4";
                    boxShadow = "0 0 10px rgba(6, 182, 212, 0.5)";
                    icon = "📍";
                  } else if (isLast) {
                    bg = "rgba(168, 85, 247, 0.2)";
                    color = "#a855f7";
                    border = "1px solid rgba(168, 85, 247, 0.5)";
                    icon = "🎯";
                  } else {
                    bg = "var(--bgPrimary)";
                    color = "var(--textPrimary)";
                    border = "1px solid var(--borderGlass)";
                  }
                } else {
                  if (isFirst) {
                    bg = "#06b6d4";
                    color = "#ffffff";
                    border = "none";
                    icon = "🚩";
                  } else if (isLast) {
                    bg = "#a855f7";
                    color = "#ffffff";
                    border = "none";
                    icon = "🎯";
                  }
                }

                return (
                  <React.Fragment key={s}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background: bg,
                      color: color,
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      border: border,
                      boxShadow: boxShadow,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.3s ease"
                    }}>
                      {icon && <span style={{ fontSize: "0.8rem" }}>{icon}</span>}
                      {s}
                    </span>
                    {idx < result.stations.length - 1 && (
                      <span style={{
                        color: isTripActive && idx < currentStepIndex ? "#10b981" : "#06b6d4",
                        fontWeight: "bold",
                        transition: "color 0.3s ease"
                      }}>
                        ←
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* LRT LINES EXPLORER */}
        <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "32px" }}>
          <h2 style={{
            fontSize: "1.3rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            marginBottom: "6px",
            textAlign: "center"
          }}>محطات القطار الكهربائي LRT</h2>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.9rem", textAlign: "center", marginBottom: "20px" }}>
            اختر المسار لاستعراض المحطات والمعالم المحيطة بها تفصيلياً.
          </p>

          {/* Explorer Tab Switcher */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
            {[
              { id: "all", label: "الكل", color: "#818cf8" },
              { id: "trunk", label: "الرئيسي", color: "#06b6d4" },
              { id: "capital", label: "العاصمة", color: "#a855f7" },
              { id: "ramadan", label: "العاشر", color: "#10b981" }
            ].map(tab => {
              const active = activeLine === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveLine(tab.id as any);
                    setExpandedStation(null);
                  }}
                  style={{
                    background: "var(--bgPrimary)",
                    border: active ? `2px solid ${tab.color}` : "1px solid var(--borderGlass)",
                    borderRadius: "12px",
                    padding: "10px 4px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    boxShadow: active ? `0 0 10px ${tab.color}15` : "none",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--hoverBtn)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "var(--bgPrimary)"; }}
                >
                  <div className="sub-title" style={{ color: active ? "var(--textPrimary)" : "var(--textSecondary)", fontWeight: "700", fontSize: "0.8rem" }}>
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stations Explorer Container */}
          <div style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "20px",
            boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ borderBottom: "1px solid var(--borderGlass)", paddingBottom: "14px", marginBottom: "16px" }}>
              <h3 className="sub-title" style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "4px" }}>
                {activeLine === "all" ? "جميع محطات القطار الكهربائي الخفيف" : activeLine === "trunk" ? "الجذع الرئيسي (عدلي منصور - بدر)" : activeLine === "capital" ? "تفريعة العاصمة الإدارية (بدر - الفنون والثقافة)" : "تفريعة العاشر من رمضان (بدر - مدينة المعرفة)"}
              </h3>
              <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.82rem", margin: 0 }}>
                {activeLine === "all" && "تصفح شبكة القطار بالكامل بجميع تفريعاتها الشمالية والجنوبية"}
                {activeLine === "trunk" && "محطات الجذع الرئيسي لربط القاهرة الكبرى بالمدن الجديدة وصولاً لـ بدر التبادلية"}
                {activeLine === "capital" && "فرعة العاصمة الإدارية الجديدة لربط محطة بدر بمدينة الفنون والثقافة"}
                {activeLine === "ramadan" && "فرعة العاشر من رمضان لربط محطة بدر بالمنطقة الصناعية ومدينة العاشر"}
              </p>
            </div>

            {/* Scrollable station timeline list */}
            <div style={{
              maxHeight: "550px", overflowY: "auto", padding: "16px 0px",
              background: "transparent"
            }}>
              {(() => {
                let stationsList: any[] = [];
                const raw = stations.length > 0 ? stations : DEFAULT_LRT;
                if (activeLine === "trunk") {
                  stationsList = raw.filter(s => s.line_type === "trunk").sort((a, b) => a.station_order - b.station_order);
                } else if (activeLine === "capital") {
                  stationsList = raw.filter(s => s.line_type === "capital").sort((a, b) => a.station_order - b.station_order);
                } else if (activeLine === "ramadan") {
                  stationsList = raw.filter(s => s.line_type === "ramadan").sort((a, b) => a.station_order - b.station_order);
                } else {
                  stationsList = [
                    ...raw.filter(s => s.line_type === "trunk").sort((a, b) => a.station_order - b.station_order),
                    ...raw.filter(s => s.line_type === "capital").sort((a, b) => a.station_order - b.station_order),
                    ...raw.filter(s => s.line_type === "ramadan").sort((a, b) => a.station_order - b.station_order),
                  ];
                }

                return stationsList.map((station, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === stationsList.length - 1;

                  let color = "#06b6d4";
                  if (station.line_type === "capital") color = "#a855f7";
                  else if (station.line_type === "ramadan") color = "#10b981";

                  const isTransfer = station.name === "عدلي منصور" || station.name === "بدر" || station.name === "مدينة الفنون والثقافة";
                  const isExpanded = expandedStation === station.name;
                  const dbLandmarks = Array.isArray(station.landmarks) && station.landmarks.length > 0 ? (station.landmarks as string[]) : null;
                  const staticDetails = STATION_DETAILS[station.name];
                  const details = (staticDetails || dbLandmarks) ? {
                    landmarks: dbLandmarks || staticDetails?.landmarks || [],
                    type: staticDetails?.type || "عادية",
                    status: station.status || staticDetails?.status || "تشغيل فعلي"
                  } : null;

                  return (
                    <div id={`station-${station.name}`} key={idx} style={{ display: "flex", flexDirection: "column", position: "relative" }}>

                      {/* Circle Node on the timeline */}
                      <div
                        style={{
                          position: "absolute",
                          right: "-29px",
                          top: "15px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: details?.status === "تحت الإنشاء" ? "var(--bgPrimary)" : color,
                          border: details?.status === "تحت الإنشاء" ? `3px dashed ${color}` : `4.5px solid var(--bgPrimary, #000)`,
                          zIndex: 2,
                          boxShadow: isExpanded ? `0 0 10px ${color}` : "none",
                          transition: "all 0.3s ease"
                        }}
                      />

                      {/* Content Box */}
                      <div
                        onClick={() => handleStationClick(station.name)}
                        style={{
                          backgroundColor: "var(--bgPrimary)",
                          border: isExpanded ? `1px solid ${color}` : (details?.status === "تحت الإنشاء" ? `1px dashed ${color}50` : "1px solid var(--borderGlass)"),
                          opacity: details?.status === "تحت الإنشاء" ? 0.75 : 1,
                          borderRadius: "8px",
                          padding: "12px 6px",
                          boxShadow: "var(--shadow-card)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          cursor: "pointer",
                          transition: "transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
                          marginBottom: "4px"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        {/* Header Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{
                              fontSize: "1.02rem",
                              fontWeight: "700",
                              color: details?.status === "تحت الإنشاء" ? "var(--textSecondary)" : "var(--textPrimary)",
                            }}>
                              {station.name}
                            </span>
                            {details?.status === "تحت الإنشاء" && (
                              <span style={{
                                background: "rgba(239, 68, 68, 0.12)",
                                color: "#ef4444",
                                fontSize: "0.68rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}>
                                تحت الإنشاء 🚧
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {isTransfer && (
                              <span style={{
                                background: "rgba(251, 191, 36, 0.12)",
                                color: "#fbbf24",
                                fontSize: "0.68rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: "bold"
                              }}>
                                تبادلية
                              </span>
                            )}
                            <i className={`bx bx-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: "var(--textSecondary)", fontSize: "1.3rem" }}></i>
                          </div>
                        </div>

                        {/* Expandable details */}
                        {isExpanded && (
                          <div style={{
                            borderTop: "1px solid var(--borderGlass)",
                            paddingTop: "12px",
                            marginTop: "4px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            animation: "fadeIn 0.25s ease"
                          }}>
                            {details ? (
                              <>
                                {/* Landmarks */}
                                <div>
                                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "700" }}>
                                    📍 المعالم القريبة:
                                  </div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {details.landmarks.map((landmark, idx) => (
                                      <span key={idx} style={{
                                        background: "var(--bgSecondary)",
                                        color: "var(--textSecondary)",
                                        fontSize: "0.78rem",
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--borderGlass)"
                                      }}>
                                        {landmark}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Connection Type */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "4px" }}>
                                  <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)" }}>
                                    🔗 نوع المحطة: <strong style={{ color: "var(--textPrimary)" }}>{details.type}</strong>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                لم يتم توفير تفاصيل إضافية لهذه المحطة حالياً.
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Rail segment */}
                      {!isLast && (
                        <div style={{ display: "flex", gap: "12px", minHeight: "14px", position: "relative" }}>
                          <div style={{
                            position: "absolute",
                            right: "-22px",
                            top: "0",
                            bottom: "0",
                            width: "2px",
                            backgroundColor: color,
                            opacity: 0.5
                          }} />
                          <div style={{ height: "14px" }} />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Prices Legend Footer */}
        <div style={{
          padding: "12px 16px",
          background: "var(--bgSecondary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "12px",
          fontSize: "0.78rem",
          color: "var(--textSecondary)",
          lineHeight: "1.5",
          marginTop: "16px"
        }}>
          <i className="fa-regular fa-lightbulb" style={{ color: "var(--accent-warning)", marginLeft: "5px" }}></i>
          <strong>تسعير تذاكر القطار الكهربائي LRT المعتمد:</strong> <br />
          البيانات مبنية على الأسعار الرسمية لوزارة النقل
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", marginTop: "8px", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--colorSuccess)" }}>حتى 3 محطات:</strong> 10 جنيهات.
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--colorSuccess)" }}>من 4 إلى 7 محطات:</strong> 15 جنيهاً.
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--accent-warning)" }}>من 8 إلى 12 محطة:</strong> 20 جنيهاً.
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.5", textAlign: "right", direction: "rtl" }}>
            • <strong style={{ color: "var(--accent-danger)" }}>13 محطة فأكثر:</strong> 25 جنيهاً.
          </div>
        </div>
      </div>
    </div>
  );
}
