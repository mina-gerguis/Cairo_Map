"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";

/* ============================================================
   Cairo Metro Data — Lines 1, 2, 3 (with branch)
   ============================================================ */
const LINE1_STATIONS = [
  "حلوان", "عين حلوان", "جامعة حلوان", "وادي حوف", "حدائق حلوان",
  "المعصرة", "طرة الأسمنت", "كوتسيكا", "طرة البلد", "ثكنات المعادي",
  "المعادي", "حدائق المعادي", "دار السلام", "الزهراء", "مار جرجس",
  "الملك الصالح", "السيدة زينب", "سعد زغلول", "أنور السادات",
  "جمال عبد الناصر", "أحمد عرابي", "الشهداء", "غمرة", "الدمرداش",
  "منشية الصدر", "كوبري القبة", "حمامات القبة", "سراي القبة",
  "حدائق الزيتون", "حلمية الزيتون", "المطرية", "عين شمس",
  "عزبة النخل", "المرج", "المرج الجديدة",
];

const LINE2_STATIONS = [
  "شبرا الخيمة", "كلية الزراعة", "المظلات", "الخلفاوي", "سانت تريزا",
  "روض الفرج", "مسرة", "الشهداء", "العتبة", "محمد نجيب",
  "أنور السادات", "الأوبرا", "الدقي", "البحوث", "جامعة القاهرة",
  "فيصل", "الجيزة", "أم المصريين", "ساقية مكي", "المنيب",
];

// Line 3 main trunk (up to Kit-Kat which is branching point)
const LINE3_TRUNK = [
  "عدلي منصور", "الهايكستب", "عمر بن الخطاب", "قباء", "هشام بركات",
  "النزهة", "نادي الشمس", "ألف مسكن", "ميدان هليوبوليس", "هارون",
  "الأهرام", "كلية البنات", "استاد القاهرة", "المعرض", "العباسية",
  "عبده باشا", "الجيش", "باب الشعرية", "العتبة", "ناصر",
  "ماسبيرو", "صفاء حجازي", "الكيت كات",
];
const LINE3_BRANCH_A = [
  "الكيت كات", "السودان", "إمبابة", "البوهي", "القومية العربية",
  "الطريق الدائري", "محور روض الفرج",
];
const LINE3_BRANCH_B = [
  "الكيت كات", "التوفيقية", "وادي النيل", "جامعة الدول العربية",
  "بولاق الدكرور", "جامعة القاهرة",
];

// Combined Line 3 stations (unique)
const LINE3_STATIONS = [
  ...LINE3_TRUNK.slice(0, -1), // trunk without kit-kat
  "الكيت كات",
  ...LINE3_BRANCH_A.slice(1),
  ...LINE3_BRANCH_B.slice(1),
];

// Transfer stations
const TRANSFERS: Record<string, string[]> = {
  "أنور السادات": ["line1", "line2"],
  "الشهداء": ["line1", "line2"],
  "جمال عبد الناصر": ["line1", "line3"], // "ناصر" in L3 is same station
  "ناصر": ["line1", "line3"],
  "العتبة": ["line2", "line3"],
  "جامعة القاهرة": ["line2", "line3"],
};

type LineId = "line1" | "line2" | "line3";

interface StationInfo {
  name: string;
  lines: LineId[];
  isTransfer: boolean;
}

// Build a searchable station list with their lines
const buildStationIndex = (): StationInfo[] => {
  const map = new Map<string, Set<LineId>>();
  LINE1_STATIONS.forEach(s => {
    if (!map.has(s)) map.set(s, new Set());
    map.get(s)!.add("line1");
  });
  LINE2_STATIONS.forEach(s => {
    if (!map.has(s)) map.set(s, new Set());
    map.get(s)!.add("line2");
  });
  LINE3_STATIONS.forEach(s => {
    if (!map.has(s)) map.set(s, new Set());
    map.get(s)!.add("line3");
  });
  const result: StationInfo[] = [];
  map.forEach((lines, name) => {
    result.push({ name, lines: Array.from(lines) as LineId[], isTransfer: lines.size > 1 });
  });
  return result.sort((a, b) => a.name.localeCompare(b.name, "ar"));
};

const ALL_STATIONS = buildStationIndex();

const LINE_NAMES: Record<LineId, string> = {
  line1: "الخط الأول (الأحمر)",
  line2: "الخط الثاني (الأزرق)",
  line3: "الخط الثالث (الأخضر)",
};
const LINE_COLORS: Record<LineId, string> = {
  line1: "#e53935",
  line2: "#1e88e5",
  line3: "#43a047",
};

// Ticket price based on station count
const getTicketPrice = (stationCount: number): number => {
  if (stationCount <= 9) return 10;
  if (stationCount <= 16) return 12;
  if (stationCount <= 23) return 15;
  return 20;
};

/* ============================================================
   Route Finder Algorithm
   ============================================================ */
interface RouteResult {
  found: boolean;
  path: string[];
  lines: LineId[];
  stationCount: number;
  price: number;
  needsTransfer: boolean;
  transferStation?: string;
  transferFromLine?: LineId;
  transferToLine?: LineId;
  description: string;
}

function getStationLinePositions(station: string): Array<{ line: LineId; index: number }> {
  const positions: Array<{ line: LineId; index: number }> = [];
  const idx1 = LINE1_STATIONS.indexOf(station);
  if (idx1 !== -1) positions.push({ line: "line1", index: idx1 });
  const idx2 = LINE2_STATIONS.indexOf(station);
  if (idx2 !== -1) positions.push({ line: "line2", index: idx2 });
  const idx3a = LINE3_TRUNK.indexOf(station);
  if (idx3a !== -1) positions.push({ line: "line3", index: idx3a });
  const idx3b = LINE3_BRANCH_A.indexOf(station);
  if (idx3b !== -1 && idx3a === -1) positions.push({ line: "line3", index: LINE3_TRUNK.length - 1 + idx3b });
  const idx3c = LINE3_BRANCH_B.indexOf(station);
  if (idx3c !== -1 && idx3a === -1) positions.push({ line: "line3", index: LINE3_TRUNK.length - 1 + idx3c + 100 }); // offset to distinguish branch
  return positions;
}

function stationsOnLine(line: LineId): string[] {
  if (line === "line1") return LINE1_STATIONS;
  if (line === "line2") return LINE2_STATIONS;
  return LINE3_STATIONS;
}

function getPathBetween(from: string, to: string, line: LineId): string[] | null {
  const arr = stationsOnLine(line);
  const fi = arr.indexOf(from);
  const ti = arr.indexOf(to);
  if (fi === -1 || ti === -1) return null;
  if (fi <= ti) return arr.slice(fi, ti + 1);
  return arr.slice(ti, fi + 1).reverse();
}

// Check for special name equivalents (ناصر ↔ جمال عبد الناصر)
function equivalentStations(a: string, b: string): boolean {
  const eq: [string, string][] = [["ناصر", "جمال عبد الناصر"]];
  return eq.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function findRoute(from: string, to: string): RouteResult {
  if (from === to) {
    return { found: true, path: [from], lines: [], stationCount: 1, price: 10, needsTransfer: false, description: "نفس المحطة!" };
  }

  // Check same line
  const fromPositions = getStationLinePositions(from);
  const toPositions = getStationLinePositions(to);

  for (const fp of fromPositions) {
    for (const tp of toPositions) {
      if (fp.line === tp.line) {
        const path = getPathBetween(from, to, fp.line);
        if (path) {
          const count = path.length;
          return {
            found: true, path, lines: [fp.line], stationCount: count,
            price: getTicketPrice(count), needsTransfer: false,
            description: `سافر على ${LINE_NAMES[fp.line]} من "${from}" حتى "${to}" دون تحويل.`,
          };
        }
      }
    }
  }

  // Need transfer — BFS-like: try each transfer station
  const transferStations = Object.keys(TRANSFERS);
  let bestResult: RouteResult | null = null;

  for (const transfer of transferStations) {
    // Can we reach transfer from "from"?
    for (const fp of fromPositions) {
      const pathToTransfer = getPathBetween(from, transfer, fp.line);
      if (!pathToTransfer) continue;

      // From transfer, can we reach "to"?
      const transferLines = TRANSFERS[transfer] as LineId[];
      for (const tl of transferLines) {
        if (tl === fp.line) continue; // must switch line
        const pathFromTransfer = getPathBetween(transfer, to, tl);
        if (!pathFromTransfer) continue;

        // Combine
        const fullPath = [...pathToTransfer, ...pathFromTransfer.slice(1)];
        const count = fullPath.length;
        const candidate: RouteResult = {
          found: true,
          path: fullPath,
          lines: [fp.line, tl],
          stationCount: count,
          price: getTicketPrice(count),
          needsTransfer: true,
          transferStation: transfer,
          transferFromLine: fp.line,
          transferToLine: tl,
          description: `اركب ${LINE_NAMES[fp.line]} من "${from}" وانزل عند محطة "${transfer}"، ثم انتقل إلى ${LINE_NAMES[tl]} واستكمل حتى "${to}".`,
        };
        if (!bestResult || candidate.stationCount < bestResult.stationCount) {
          bestResult = candidate;
        }
      }
    }
  }

  if (bestResult) return bestResult;

  return {
    found: false, path: [], lines: [], stationCount: 0, price: 0, needsTransfer: false,
    description: "لا يمكن الوصول بين المحطتين بالمترو حالياً.",
  };
}

/* ============================================================
   UI Component
   ============================================================ */

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove tatweel
}

export default function MetroPage() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);

  const filteredFrom = useMemo(() => {
    const q = normalizeArabic(fromQuery.trim());
    return ALL_STATIONS.filter(s => normalizeArabic(s.name).includes(q) && q.length > 0);
  }, [fromQuery]);
  const filteredTo = useMemo(() => {
    const q = normalizeArabic(toQuery.trim());
    return ALL_STATIONS.filter(s => normalizeArabic(s.name).includes(q) && q.length > 0);
  }, [toQuery]);

  const handleFind = () => {
    if (!selectedFrom || !selectedTo) return;
    const r = findRoute(selectedFrom, selectedTo);
    setResult(r);
  };

  const swap = () => {
    setSelectedFrom(selectedTo);
    setSelectedTo(selectedFrom);
    setFromQuery(selectedTo || "");
    setToQuery(selectedFrom || "");
    setResult(null);
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "120px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "60px 20px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 80%, rgba(108,99,255,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🚇</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
          fontWeight: "800",
          color: "#fff",
          margin: "0 0 10px",
        }}>اعرف طريقك</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", margin: 0 }}>
          مترو القاهرة الكبرى — اختر محطتك وابدأ رحلتك
        </p>
        {/* Line indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
          {(["line1", "line2", "line3"] as LineId[]).map(l => (
            <span key={l} style={{
              background: LINE_COLORS[l] + "22",
              border: `1px solid ${LINE_COLORS[l]}55`,
              color: LINE_COLORS[l],
              borderRadius: "20px",
              padding: "4px 14px",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}>{LINE_NAMES[l]}</span>
          ))}
        </div>
      </div>

      {/* Search Card */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 16px" }}>
        <div className="glass-panel" style={{ marginTop: "-20px", borderRadius: "20px", padding: "24px", position: "relative", zIndex: 10 }}>

          {/* FROM */}
          <div style={{ marginBottom: "16px", position: "relative" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              🟢 من محطة
            </label>
            <input
              className="ios-input"
              placeholder="ابحث عن المحطة..."
              value={fromQuery}
              onChange={e => { setFromQuery(e.target.value); setSelectedFrom(null); setShowFromList(true); setResult(null); }}
              onFocus={() => setShowFromList(true)}
              onBlur={() => setTimeout(() => setShowFromList(false), 200)}
              style={{ paddingRight: "14px" }}
            />
            {showFromList && filteredFrom.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "var(--card-bg)", border: "1px solid var(--border-glass)",
                borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}>
                {filteredFrom.map(s => (
                  <div key={s.name} onMouseDown={() => { setSelectedFrom(s.name); setFromQuery(s.name); setShowFromList(false); }} style={{
                    padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(108,99,255,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{s.name}</span>
                    <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                      {s.lines.map(l => (
                        <span key={l} style={{ width: "10px", height: "10px", borderRadius: "50%", background: LINE_COLORS[l], display: "inline-block" }} />
                      ))}
                    </div>
                    {s.isTransfer && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>تبادلية</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP button */}
          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 16px" }}>
            <button onClick={swap} style={{
              background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.25)",
              borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent-primary)", fontSize: "1.2rem", transition: "transform 0.3s ease",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "rotate(180deg)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "rotate(0deg)")}
            >
              ⇅
            </button>
          </div>

          {/* TO */}
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              🔴 إلى محطة
            </label>
            <input
              className="ios-input"
              placeholder="ابحث عن المحطة..."
              value={toQuery}
              onChange={e => { setToQuery(e.target.value); setSelectedTo(null); setShowToList(true); setResult(null); }}
              onFocus={() => setShowToList(true)}
              onBlur={() => setTimeout(() => setShowToList(false), 200)}
              style={{ paddingRight: "14px" }}
            />
            {showToList && filteredTo.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "var(--card-bg)", border: "1px solid var(--border-glass)",
                borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}>
                {filteredTo.map(s => (
                  <div key={s.name} onMouseDown={() => { setSelectedTo(s.name); setToQuery(s.name); setShowToList(false); }} style={{
                    padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(108,99,255,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{s.name}</span>
                    <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                      {s.lines.map(l => (
                        <span key={l} style={{ width: "10px", height: "10px", borderRadius: "50%", background: LINE_COLORS[l], display: "inline-block" }} />
                      ))}
                    </div>
                    {s.isTransfer && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>تبادلية</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleFind}
            disabled={!selectedFrom || !selectedTo}
            className="ios-btn ios-btn-primary"
            style={{ width: "100%", fontSize: "1rem", fontWeight: "800", padding: "14px", opacity: (!selectedFrom || !selectedTo) ? 0.5 : 1 }}
          >
            🔍 ابحث عن الطريق
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="glass-panel" style={{ marginTop: "20px", borderRadius: "20px", padding: "24px", animation: "slide-in-section 0.4s ease" }}>
            {!result.found ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>😕</div>
                <p style={{ fontWeight: "600" }}>لا يوجد طريق متاح حالياً</p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: "16px", color: "var(--text-primary)" }}>
                  نتيجة الرحلة
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--accent-primary)" }}>{result.stationCount}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>محطة</div>
                  </div>
                  <div style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.2)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#34c759" }}>{result.price} ج</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>سعر التذكرة</div>
                  </div>
                  <div style={{ background: result.needsTransfer ? "rgba(255,149,0,0.08)" : "rgba(52,199,89,0.08)", border: `1px solid ${result.needsTransfer ? "rgba(255,149,0,0.2)" : "rgba(52,199,89,0.2)"}`, borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: result.needsTransfer ? "#ff9500" : "#34c759" }}>
                      {result.needsTransfer ? "تحويل" : "مباشر"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>نوع الرحلة</div>
                  </div>
                </div>

                {/* Instruction */}
                <div style={{ background: "rgba(108,99,255,0.06)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", borderRight: "3px solid var(--accent-primary)" }}>
                  <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                    {result.description}
                  </p>
                </div>

                {/* Line tags */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {result.lines.map((l, i) => (
                    <span key={i} style={{
                      background: LINE_COLORS[l] + "18",
                      border: `1px solid ${LINE_COLORS[l]}44`,
                      color: LINE_COLORS[l],
                      borderRadius: "20px",
                      padding: "5px 14px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                    }}>{LINE_NAMES[l]}</span>
                  ))}
                </div>

                {/* Station path */}
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "12px" }}>
                    📍 المسار التفصيلي ({result.path.length} محطة)
                  </h4>
                  <div style={{ maxHeight: "260px", overflowY: "auto", paddingLeft: "4px" }}>
                    {result.path.map((station, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === result.path.length - 1;
                      const isTransferStation = result.needsTransfer && station === result.transferStation;
                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", paddingBottom: isLast ? 0 : "0" }}>
                          {/* Timeline dot + line */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "16px" }}>
                            <div style={{
                              width: isFirst || isLast || isTransferStation ? "14px" : "10px",
                              height: isFirst || isLast || isTransferStation ? "14px" : "10px",
                              borderRadius: "50%",
                              background: isFirst ? "#34c759" : isLast ? "#ff3b30" : isTransferStation ? "#ff9500" : "var(--text-muted)",
                              border: `2px solid ${isFirst ? "#34c759" : isLast ? "#ff3b30" : isTransferStation ? "#ff9500" : "var(--text-muted)"}`,
                              flexShrink: 0,
                              zIndex: 1,
                            }} />
                            {!isLast && (
                              <div style={{ width: "2px", flex: 1, minHeight: "18px", background: "var(--border-glass)" }} />
                            )}
                          </div>
                          {/* Station name */}
                          <div style={{ paddingBottom: "12px" }}>
                            <span style={{
                              fontSize: isFirst || isLast ? "0.95rem" : "0.88rem",
                              fontWeight: isFirst || isLast || isTransferStation ? "700" : "500",
                              color: isFirst ? "#34c759" : isLast ? "#ff3b30" : isTransferStation ? "#ff9500" : "var(--text-secondary)",
                            }}>
                              {station}
                            </span>
                            {isTransferStation && (
                              <span style={{ display: "block", fontSize: "0.74rem", color: "#ff9500", fontWeight: "600", marginTop: "2px" }}>
                                ⚡ محطة تحويل — انتقل إلى {LINE_NAMES[result.transferToLine!]}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price note */}
                <div style={{ marginTop: "16px", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  💡 الأسعار وفق تعريفة مارس 2026: حتى 9 محطات = 10ج | 10-16 = 12ج | 17-23 = 15ج | أكثر من 23 = 20ج
                </div>
              </>
            )}
          </div>
        )}

        {/* Info Cards */}
        {!result && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
            {[
              { emoji: "🔴", label: "الخط الأول", sub: "35 محطة • حلوان → المرج الجديدة", color: LINE_COLORS.line1 },
              { emoji: "🔵", label: "الخط الثاني", sub: "20 محطة • شبرا → المنيب", color: LINE_COLORS.line2 },
              { emoji: "🟢", label: "الخط الثالث", sub: "34 محطة • عدلي منصور → كيت كات (فرعين)", color: LINE_COLORS.line3 },
              { emoji: "🎟️", label: "التذاكر", sub: "من 10 إلى 20 جنيهاً حسب المسافة", color: "#a78bfa" },
            ].map((card, i) => (
              <div key={i} className="glass-panel" style={{ borderRadius: "14px", padding: "16px", borderTop: `2px solid ${card.color}` }}>
                <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{card.emoji}</div>
                <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "4px" }}>{card.label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.5" }}>{card.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
