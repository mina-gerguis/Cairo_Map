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
  "عبده باشا", "الجيش", "باب الشعرية", "العتبة", "جمال عبد الناصر",
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

// Combined Line 3 stations (unique list)
const LINE3_STATIONS = [
  ...LINE3_TRUNK.slice(0, -1), // trunk without kit-kat
  "الكيت كات",
  ...LINE3_BRANCH_A.slice(1),
  ...LINE3_BRANCH_B.slice(1),
];

type LineId = "line1" | "line2" | "line3";

interface StationInfo {
  name: string;
  lines: LineId[];
  isTransfer: boolean;
}

const LINE_NAMES: Record<LineId, string> = {
  line1: "الخط الأول (الأحمر)",
  line2: "الخط الثاني (الأزرق)",
  line3: "الخط الثالث (الأخضر)",
};

const LINE_COLORS: Record<LineId, string> = {
  line1: "#ef4444", // Modern Red
  line2: "#3b82f6", // Modern Blue
  line3: "#10b981", // Modern Green
};

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

// Ticket price based on station count
const getTicketPrice = (stationCount: number): number => {
  if (stationCount <= 9) return 10;
  if (stationCount <= 16) return 12;
  if (stationCount <= 23) return 15;
  return 20;
};

/* ============================================================
   Graph Representation and Dijkstra Algorithm
   ============================================================ */
interface Edge {
  toStation: string;
  toLine: LineId;
  weight: number; // 1 for next station, 5 for line transfer
}

interface DijkstraState {
  station: string;
  line: LineId;
  dist: number;
  path: Array<{ station: string; line: LineId }>;
}

interface RouteResult {
  found: boolean;
  path: string[];
  lines: LineId[];
  stationCount: number;
  price: number;
  needsTransfer: boolean;
  transfers: Array<{ station: string; fromLine: LineId; toLine: LineId }>;
  description: string;
  detailedPath: Array<{ station: string; line: LineId; isTransferPoint: boolean; targetLine?: LineId }>;
}

const buildGraph = () => {
  const adj = new Map<string, Edge[]>();

  const addEdge = (s1: string, l1: LineId, s2: string, l2: LineId, weight: number) => {
    const key = `${s1}|${l1}`;
    if (!adj.has(key)) adj.set(key, []);
    adj.get(key)!.push({ toStation: s2, toLine: l2, weight });
  };

  const addLineEdges = (stations: string[], line: LineId) => {
    for (let i = 0; i < stations.length - 1; i++) {
      addEdge(stations[i], line, stations[i + 1], line, 1);
      addEdge(stations[i + 1], line, stations[i], line, 1);
    }
  };

  // Add all adjacency edges on same lines
  addLineEdges(LINE1_STATIONS, "line1");
  addLineEdges(LINE2_STATIONS, "line2");
  addLineEdges(LINE3_TRUNK, "line3");
  addLineEdges(LINE3_BRANCH_A, "line3");
  addLineEdges(LINE3_BRANCH_B, "line3");

  // Determine line mappings per station
  const stationLines = new Map<string, Set<LineId>>();
  LINE1_STATIONS.forEach(s => {
    if (!stationLines.has(s)) stationLines.set(s, new Set());
    stationLines.get(s)!.add("line1");
  });
  LINE2_STATIONS.forEach(s => {
    if (!stationLines.has(s)) stationLines.set(s, new Set());
    stationLines.get(s)!.add("line2");
  });
  LINE3_STATIONS.forEach(s => {
    if (!stationLines.has(s)) stationLines.set(s, new Set());
    stationLines.get(s)!.add("line3");
  });

  // Connect transfer edges between lines (Transfer weight = 5)
  stationLines.forEach((lines, name) => {
    if (lines.size > 1) {
      const arr = Array.from(lines);
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (i !== j) {
            addEdge(name, arr[i], name, arr[j], 5);
          }
        }
      }
    }
  });

  return { adj, stationLines };
};

const { adj: ADJACENCY_GRAPH, stationLines: STATION_LINES_MAP } = buildGraph();

function findRoute(from: string, to: string): RouteResult {
  if (from === to) {
    return {
      found: true,
      path: [from],
      lines: [],
      stationCount: 1,
      price: 10,
      needsTransfer: false,
      transfers: [],
      description: "أنت في محطة الوصول بالفعل!",
      detailedPath: [{ station: from, line: Array.from(STATION_LINES_MAP.get(from) || [])[0] || "line1", isTransferPoint: false }],
    };
  }

  const startLines = Array.from(STATION_LINES_MAP.get(from) || []);
  const endLines = Array.from(STATION_LINES_MAP.get(to) || []);

  if (startLines.length === 0 || endLines.length === 0) {
    return {
      found: false,
      path: [],
      lines: [],
      stationCount: 0,
      price: 0,
      needsTransfer: false,
      transfers: [],
      description: "المحطة المحددة غير موجودة في قاعدة البيانات.",
      detailedPath: [],
    };
  }

  // Priority Queue initialization
  const queue: DijkstraState[] = [];
  const minDistance = new Map<string, number>();

  startLines.forEach(line => {
    const key = `${from}|${line}`;
    queue.push({
      station: from,
      line,
      dist: 0,
      path: [{ station: from, line }],
    });
    minDistance.set(key, 0);
  });

  let bestState: DijkstraState | null = null;

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const curr = queue.shift()!;
    const currKey = `${curr.station}|${curr.line}`;

    if ((minDistance.get(currKey) ?? Infinity) < curr.dist) {
      continue;
    }

    if (curr.station === to) {
      if (!bestState || curr.dist < bestState.dist) {
        bestState = curr;
      }
    }

    if (bestState && curr.dist >= bestState.dist) {
      break;
    }

    const edges = ADJACENCY_GRAPH.get(currKey) || [];
    for (const edge of edges) {
      const nextKey = `${edge.toStation}|${edge.toLine}`;
      const nextDist = curr.dist + edge.weight;

      if (nextDist < (minDistance.get(nextKey) ?? Infinity)) {
        minDistance.set(nextKey, nextDist);
        queue.push({
          station: edge.toStation,
          line: edge.toLine,
          dist: nextDist,
          path: [...curr.path, { station: edge.toStation, line: edge.toLine }],
        });
      }
    }
  }

  if (!bestState) {
    return {
      found: false,
      path: [],
      lines: [],
      stationCount: 0,
      price: 0,
      needsTransfer: false,
      transfers: [],
      description: "لا يمكن إيجاد مسار بين هاتين المحطتين بالمترو حالياً.",
      detailedPath: [],
    };
  }

  // Parse Dijkstra path to retrieve transitions
  const rawPath = bestState.path;
  const cleanPath: string[] = [];
  const linesUsed: LineId[] = [];
  const transfers: Array<{ station: string; fromLine: LineId; toLine: LineId }> = [];
  const detailedPath: Array<{ station: string; line: LineId; isTransferPoint: boolean; targetLine?: LineId }> = [];

  let currentLine = rawPath[0].line;
  linesUsed.push(currentLine);

  for (let i = 0; i < rawPath.length; i++) {
    const step = rawPath[i];
    const isLineChange = i > 0 && step.station === rawPath[i - 1].station && step.line !== rawPath[i - 1].line;

    if (isLineChange) {
      const fromLine = rawPath[i - 1].line;
      const toLine = step.line;
      transfers.push({
        station: step.station,
        fromLine,
        toLine,
      });
      // Mark the last added station in detailedPath as a transfer station
      if (detailedPath.length > 0) {
        detailedPath[detailedPath.length - 1].isTransferPoint = true;
        detailedPath[detailedPath.length - 1].targetLine = toLine;
      }
      currentLine = toLine;
      if (!linesUsed.includes(currentLine)) {
        linesUsed.push(currentLine);
      }
    } else {
      if (cleanPath.length === 0 || cleanPath[cleanPath.length - 1] !== step.station) {
        cleanPath.push(step.station);
      }
      detailedPath.push({
        station: step.station,
        line: step.line,
        isTransferPoint: false,
      });
    }
  }

  const stationCount = cleanPath.length;
  const price = getTicketPrice(stationCount);
  const needsTransfer = transfers.length > 0;

  // Build Arabic Description
  let description = "";
  if (!needsTransfer) {
    description = `اسلك ${LINE_NAMES[rawPath[0].line]} من محطة "${from}" حتى محطة "${to}" مباشرة بدون أي تبديل.`;
  } else {
    description = `اركـب ${LINE_NAMES[rawPath[0].line]} من محطة "${from}"، `;
    transfers.forEach((t, idx) => {
      description += `ثم قم بالانتقال والتحويل في محطة "${t.station}" إلى ${LINE_NAMES[t.toLine]}`;
      if (idx < transfers.length - 1) description += "، ";
    });
    description += `، وواصل رحلتك حتى محطة "${to}".`;
  }

  return {
    found: true,
    path: cleanPath,
    lines: linesUsed,
    stationCount,
    price,
    needsTransfer,
    transfers,
    description,
    detailedPath,
  };
}

/* ============================================================
   UI Helpers
   ============================================================ */
function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}

export default function MetroPage() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);

  // Metro Explorer State
  const [explorerLine, setExplorerLine] = useState<LineId>("line1");
  const [line3ActiveBranch, setLine3ActiveBranch] = useState<"trunk" | "branchA" | "branchB">("trunk");

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
    const route = findRoute(selectedFrom, selectedTo);
    setResult(route);
  };

  const swapStations = () => {
    const tempF = selectedFrom;
    const tempT = selectedTo;
    setSelectedFrom(tempT);
    setSelectedTo(tempF);
    setFromQuery(tempT || "");
    setToQuery(tempF || "");
    setResult(null);
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "140px", backgroundColor: "var(--bg-primary)" }}>
      {/* Header Banner - Redesigned to be flat and calm matching the Profile page */}
      <div style={{
        backgroundColor: "var(--bg-primary)",
        padding: "48px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🚇</div>
        <h1 style={{
          fontFamily: "var(--font-cairo)",
          fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
          fontWeight: "800",
          color: "var(--text-primary)",
          margin: "0 0 10px",
          letterSpacing: "-0.5px",
        }}>مستكشف مترو القاهرة</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
          احسب رحلتك في ثوانٍ، تصفح المسارات، واعرف قيمة التذكرة والتحويلات الأنسب بفضل خوارزمية ذكية متكاملة.
        </p>

        {/* Lines Indicator Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {(["line1", "line2", "line3"] as LineId[]).map(l => (
            <span key={l} style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: LINE_COLORS[l],
              borderRadius: "20px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>{LINE_NAMES[l]}</span>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Search Panel Card - Styled matching profile sectionCard */}
        <div style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            
            {/* FROM STATION INPUT */}
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                🟢 من محطة (نقطة الانطلاق)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="ios-input"
                  placeholder="اكتب اسم محطة البداية... (مثال: حلوان)"
                  value={fromQuery}
                  onChange={e => { setFromQuery(e.target.value); setSelectedFrom(null); setShowFromList(true); setResult(null); }}
                  onFocus={() => setShowFromList(true)}
                  onBlur={() => setTimeout(() => setShowFromList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-cairo)",
                  }}
                />
                {selectedFrom && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-ios)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>جاهز</span>
                )}
              </div>
              {showFromList && filteredFrom.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "var(--bg-secondary)", border: "1px solid var(--border-glass)",
                  borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                  boxShadow: "var(--shadow-lg)", marginTop: "6px"
                }}>
                  {filteredFrom.map(s => (
                    <div key={s.name} onMouseDown={() => { setSelectedFrom(s.name); setFromQuery(s.name); setShowFromList(false); }} style={{
                      padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-glass-hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)" }}>{s.name}</span>
                      <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                        {s.lines.map(l => (
                          <span key={l} style={{ width: "6px", height: "6px", borderRadius: "50%", background: LINE_COLORS[l], display: "inline-block" }} />
                        ))}
                      </div>
                      {s.isTransfer && <span style={{ fontSize: "0.72rem", background: "var(--border-glass)", color: "var(--text-secondary)", padding: "2px 6px", borderRadius: "4px" }}>تبادلية</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP BUTTON - Calm iOS Style */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0" }}>
              <button onClick={swapStations} style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "1.2rem",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "rotate(180deg)";
                  e.currentTarget.style.background = "var(--bg-glass-hover)";
                  e.currentTarget.style.color = "var(--accent-ios)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "rotate(0deg)";
                  e.currentTarget.style.background = "var(--bg-secondary)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                ⇅
              </button>
            </div>

            {/* TO STATION INPUT */}
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                🔴 إلى محطة (الجهة المقصودة)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="ios-input"
                  placeholder="اكتب اسم محطة النهاية... (مثال: العباسية)"
                  value={toQuery}
                  onChange={e => { setToQuery(e.target.value); setSelectedTo(null); setShowToList(true); setResult(null); }}
                  onFocus={() => setShowToList(true)}
                  onBlur={() => setTimeout(() => setShowToList(false), 250)}
                  style={{
                    width: "100%",
                    direction: "rtl",
                    fontFamily: "var(--font-cairo)",
                  }}
                />
                {selectedTo && (
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-ios)", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>جاهز</span>
                )}
              </div>
              {showToList && filteredTo.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "var(--bg-secondary)", border: "1px solid var(--border-glass)",
                  borderRadius: "12px", overflow: "hidden", zIndex: 100, maxHeight: "220px", overflowY: "auto",
                  boxShadow: "var(--shadow-lg)", marginTop: "6px"
                }}>
                  {filteredTo.map(s => (
                    <div key={s.name} onMouseDown={() => { setSelectedTo(s.name); setToQuery(s.name); setShowToList(false); }} style={{
                      padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-glass-hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)" }}>{s.name}</span>
                      <div style={{ marginRight: "auto", display: "flex", gap: "4px" }}>
                        {s.lines.map(l => (
                          <span key={l} style={{ width: "6px", height: "6px", borderRadius: "50%", background: LINE_COLORS[l], display: "inline-block" }} />
                        ))}
                      </div>
                      {s.isTransfer && <span style={{ fontSize: "0.72rem", background: "var(--border-glass)", color: "var(--text-secondary)", padding: "2px 6px", borderRadius: "4px" }}>تبادلية</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* SEARCH BUTTON - Calm accent iOS Button */}
          <button
            onClick={handleFind}
            disabled={!selectedFrom || !selectedTo}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              borderRadius: "12px",
              background: (!selectedFrom || !selectedTo) ? "rgba(255,255,255,0.05)" : "var(--accent-ios)",
              color: (!selectedFrom || !selectedTo) ? "var(--text-muted)" : "#ffffff",
              fontSize: "0.95rem",
              fontWeight: "700",
              border: "none",
              cursor: (!selectedFrom || !selectedTo) ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-cairo)",
            }}
            onMouseEnter={e => {
              if (selectedFrom && selectedTo) {
                e.currentTarget.style.opacity = "0.9";
              }
            }}
            onMouseLeave={e => {
              if (selectedFrom && selectedTo) {
                e.currentTarget.style.opacity = "1";
              }
            }}
          >
            🔍 ابحث عن أفضل مسار
          </button>
        </div>

        {/* RESULTS SECTION - Styled matching profile sectionCard */}
        {result && (
          <div style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "15px",
            padding: "20px",
            marginTop: "20px",
            boxShadow: "var(--shadow-card)",
            animation: "slide-in-section 0.3s ease",
          }}>
            {!result.found ? (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "20px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>😕</div>
                <h3 style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>عذراً، تعذر العثور على طريق</h3>
                <p style={{ fontSize: "0.88rem" }}>{result.description}</p>
              </div>
            ) : (
              <>
                {/* Result Title */}
                <h3 style={{ fontFamily: "var(--font-cairo)", fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
                  📊 تفاصيل الرحلة المقترحة
                </h3>

                {/* Grid Summary Cards - Calm design like Device Info List */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--accent-ios)" }}>{result.stationCount}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "2px" }}>محطات المرور</div>
                  </div>
                  <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--accent-success)" }}>{result.price} ج.م</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "2px" }}>قيمة التذكرة</div>
                  </div>
                  <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: result.needsTransfer ? "var(--accent-warning)" : "var(--accent-success)" }}>
                      {result.needsTransfer ? result.transfers.length : "مباشر"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "2px" }}>مرات التحويل</div>
                  </div>
                </div>

                {/* Informative Guidance Bubble - Soft colors */}
                <div style={{
                  background: "rgba(59, 130, 246, 0.04)",
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  borderRight: "4px solid var(--accent-ios)",
                  borderRadius: "12px",
                  padding: "16px 18px",
                  marginBottom: "20px"
                }}>
                  <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500" }}>
                    {result.description}
                  </p>
                </div>

                {/* Dynamic Path Timeline */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    📍 محطات المسار بالتفصيل:
                  </h4>
                  
                  <div style={{
                    maxHeight: "350px", overflowY: "auto", padding: "16px",
                    background: "var(--bg-secondary)", border: "1px solid var(--border-glass)",
                    borderRadius: "12px"
                  }}>
                    {result.detailedPath.map((node, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === result.detailedPath.length - 1;
                      const isTransfer = node.isTransferPoint;
                      const activeColor = LINE_COLORS[node.line];

                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                          
                          {/* Station Row */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "32px" }}>
                            
                            {/* Dot / Indicator */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                              <div style={{
                                width: isFirst || isLast || isTransfer ? "14px" : "8px",
                                height: isFirst || isLast || isTransfer ? "14px" : "8px",
                                borderRadius: "50%",
                                backgroundColor: isFirst ? "var(--accent-success)" : isLast ? "var(--accent-red)" : isTransfer ? "var(--accent-warning)" : "var(--text-muted)",
                                border: `2px solid ${isFirst ? "var(--accent-success)" : isLast ? "var(--accent-red)" : isTransfer ? "var(--accent-warning)" : "transparent"}`,
                                zIndex: 1,
                              }} />
                            </div>

                            {/* Station Name and Badge */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1 }}>
                              <span style={{
                                fontSize: isFirst || isLast ? "0.95rem" : "0.88rem",
                                fontWeight: isFirst || isLast || isTransfer ? "700" : "500",
                                color: isFirst ? "var(--accent-success)" : isLast ? "var(--accent-red)" : isTransfer ? "var(--accent-warning)" : "var(--text-primary)",
                              }}>
                                {node.station}
                              </span>
                              
                              {isFirst && <span style={{ fontSize: "0.68rem", background: "rgba(16,185,129,0.12)", color: "var(--accent-success)", padding: "1px 6px", borderRadius: "4px" }}>ركوب</span>}
                              {isLast && <span style={{ fontSize: "0.68rem", background: "rgba(239,68,68,0.12)", color: "var(--accent-red)", padding: "1px 6px", borderRadius: "4px" }}>وصول</span>}
                              
                              <span style={{
                                fontSize: "0.68rem",
                                color: "#ffffff",
                                background: activeColor + "33",
                                border: `1px solid ${activeColor}44`,
                                padding: "1px 6px",
                                borderRadius: "6px",
                                marginRight: "auto"
                              }}>
                                {LINE_NAMES[node.line].split(" ")[0] + " " + LINE_NAMES[node.line].split(" ")[1]}
                              </span>
                            </div>
                          </div>

                          {/* Link line to next station or transfer card */}
                          {!isLast && (
                            <div style={{ display: "flex", gap: "12px", minHeight: "18px" }}>
                              <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                                <div style={{
                                  width: "2px",
                                  backgroundColor: activeColor,
                                  minHeight: "18px",
                                  opacity: 0.7,
                                }} />
                              </div>

                              <div style={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                                {isTransfer && (
                                  <div style={{
                                    background: "rgba(245, 158, 11, 0.05)",
                                    border: "1px solid rgba(245, 158, 11, 0.2)",
                                    borderRadius: "10px",
                                    padding: "6px 12px",
                                    margin: "4px 0",
                                    fontSize: "0.8rem",
                                    color: "var(--accent-warning)",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: "100%"
                                  }}>
                                    <span>🔄 تحويل الخط: قم بالانتقال إلى {LINE_NAMES[node.targetLine!]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prices Legend Footer - Styled matching profile cards details */}
                <div style={{
                  padding: "12px 16px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5",
                  marginTop: "16px"
                }}>
                  💡 <strong>تسعير التذاكر المعتمد (مارس 2026):</strong><br />
                  حتى 9 محطات = 10 ج.م | 10 إلى 16 محطة = 12 ج.م | 17 إلى 23 محطة = 15 ج.م | أكثر من 23 محطة = 20 ج.م
                </div>
              </>
            )}
          </div>
        )}

        {/* METRO LINES EXPLORER */}
        <div style={{ marginTop: "32px" }}>
          <h2 style={{
            fontFamily: "var(--font-cairo)",
            fontSize: "1.3rem",
            fontWeight: "800",
            color: "var(--text-primary)",
            marginBottom: "6px",
            textAlign: "center"
          }}>🗺️ مستعرض خطوط المترو الكاملة</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", marginBottom: "20px" }}>
            اضغط على الخط لاستعراض كافة محطاته المسجلة وترتيبها في الشبكة
          </p>

          {/* Explorer Tab Pills - Redesigned to match Verified security cards in profile */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
            {(["line1", "line2", "line3"] as LineId[]).map(lineId => {
              const active = explorerLine === lineId;
              const color = LINE_COLORS[lineId];
              return (
                <button
                  key={lineId}
                  onClick={() => setExplorerLine(lineId)}
                  style={{
                    background: "var(--bg-primary)",
                    border: active ? `2px solid ${color}` : "1px solid var(--border-glass)",
                    borderRadius: "12px",
                    padding: "14px 8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    boxShadow: active ? `0 0 10px ${color}15` : "none",
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = "var(--bg-glass-hover)";
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = "var(--bg-primary)";
                  }}
                >
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, margin: "0 auto 6px" }} />
                  <div style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: "700", fontSize: "0.9rem", fontFamily: "var(--font-cairo)" }}>
                    {lineId === "line1" ? "الخط الأول" : lineId === "line2" ? "الخط الثاني" : "الخط الثالث"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {lineId === "line1" ? "35 محطة" : lineId === "line2" ? "20 محطة" : "34 محطة"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explorer Station Container - Styled matching profile sectionCard */}
          <div style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "15px",
            padding: "20px",
            boxShadow: "var(--shadow-card)",
          }}>
            
            {/* Line Summary in Explorer */}
            <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
                {LINE_NAMES[explorerLine]}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: 0 }}>
                {explorerLine === "line1" && "اتجاه الحركة الرئيسي: حلوان ↔ المرج الجديدة"}
                {explorerLine === "line2" && "اتجاه الحركة الرئيسي: شبرا الخيمة ↔ المنيب"}
                {explorerLine === "line3" && "الخط الذكي الجديد مع تفريعتين بالكيت كات غرباً"}
              </p>

              {/* Sub-tabs for Line 3 branches - iOS Style using var(--accent-ios) */}
              {explorerLine === "line3" && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  {[
                    { id: "trunk", name: "الفرع الرئيسي" },
                    { id: "branchA", name: "اتجاه روض الفرج" },
                    { id: "branchB", name: "اتجاه جامعة القاهرة" },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setLine3ActiveBranch(tab.id as any)}
                      style={{
                        background: line3ActiveBranch === tab.id ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
                        border: `1px solid ${line3ActiveBranch === tab.id ? "var(--accent-ios)" : "var(--border-glass)"}`,
                        color: line3ActiveBranch === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "var(--font-cairo)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vertically Scrollable List of Explorer Stations */}
            <div style={{
              maxHeight: "350px", overflowY: "auto", padding: "16px",
              background: "var(--bg-secondary)", border: "1px solid var(--border-glass)",
              borderRadius: "12px"
            }}>
              {(() => {
                let stationsList: string[] = [];
                if (explorerLine === "line1") stationsList = LINE1_STATIONS;
                else if (explorerLine === "line2") stationsList = LINE2_STATIONS;
                else {
                  if (line3ActiveBranch === "trunk") stationsList = LINE3_TRUNK;
                  else if (line3ActiveBranch === "branchA") stationsList = LINE3_BRANCH_A;
                  else stationsList = LINE3_BRANCH_B;
                }

                return stationsList.map((station, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === stationsList.length - 1;
                  const color = LINE_COLORS[explorerLine];
                  
                  // Check if station is transfer
                  const allLinesForStation = Array.from(STATION_LINES_MAP.get(station) || []);
                  const isTransfer = allLinesForStation.length > 1;

                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "32px" }}>
                        
                        {/* Dot */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                          <div style={{
                            width: isTransfer ? "12px" : "8px",
                            height: isTransfer ? "12px" : "8px",
                            borderRadius: "50%",
                            backgroundColor: isTransfer ? "var(--accent-warning)" : color,
                            border: `2px solid ${isTransfer ? "#ffffff" : "transparent"}`,
                          }} />
                        </div>

                        {/* Station Text & Transfer Badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1 }}>
                          <span style={{
                            fontSize: "0.88rem",
                            fontWeight: isTransfer || isFirst || isLast ? "700" : "500",
                            color: isTransfer ? "var(--accent-warning)" : "var(--text-primary)",
                          }}>{station}</span>

                          {isTransfer && (
                            <div style={{ display: "flex", gap: "4px" }}>
                              {allLinesForStation.filter(l => l !== explorerLine).map(l => (
                                <button
                                  key={l}
                                  onClick={() => {
                                    setExplorerLine(l);
                                    if (l === "line3") setLine3ActiveBranch("trunk");
                                  }}
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: "700",
                                    color: LINE_COLORS[l],
                                    background: LINE_COLORS[l] + "1a",
                                    border: `1px solid ${LINE_COLORS[l]}33`,
                                    padding: "2px 6px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontFamily: "var(--font-cairo)",
                                  }}
                                  title={`انقر للانتقال إلى ${LINE_NAMES[l]}`}
                                >
                                  تبادل مع {l === "line1" ? "الخط الأول" : l === "line2" ? "الخط الثاني" : "الخط الثالث"}
                                </button>
                              ))}
                            </div>
                          )}

                          {isFirst && <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>البداية</span>}
                          {isLast && <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>النهاية</span>}
                        </div>
                      </div>

                      {/* Rail segment */}
                      {!isLast && (
                        <div style={{ display: "flex", gap: "12px", minHeight: "14px" }}>
                          <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                            <div style={{
                              width: "2px",
                              backgroundColor: color,
                              minHeight: "14px",
                              opacity: 0.4,
                            }} />
                          </div>
                          <div style={{ flexGrow: 1 }} />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
