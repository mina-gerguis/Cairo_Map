import {
  Edge,
  DijkstraState,
  LineId,
  MetroPriceTier,
  MetroStation,
  RouteResult,
  StationInfo,
  TransferInfo,
  DetailedPathNode,
} from "./types";
import { LINE_NAMES } from "./constants";

/**
 * Normalizes Arabic text for flexible matching across variations (alif, taa marbouta, diacritics, etc.)
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/ـ/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Calculates straight line distance in km between two GPS coordinates using Haversine formula
 */
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates official metro ticket price based on station count and price tiers
 */
export function calculateTicketPrice(
  count: number,
  ticketPrices?: MetroPriceTier[]
): number {
  if (!ticketPrices || ticketPrices.length === 0) {
    if (count <= 9) return 10;
    if (count <= 16) return 12;
    if (count <= 23) return 15;
    return 20;
  }
  const sorted = [...ticketPrices].sort((a, b) => a.max_stations - b.max_stations);
  for (const tier of sorted) {
    if (count <= tier.max_stations) return tier.price;
  }
  return sorted[sorted.length - 1]?.price || 20;
}

/**
 * Builds Adjacency Graph and Station Lines Map dynamically from metro stations array
 */
export function buildMetroGraph(stations: MetroStation[]): {
  adjacencyGraph: Map<string, Edge[]>;
  stationLinesMap: Map<string, Set<LineId>>;
  allStations: StationInfo[];
} {
  const adj = new Map<string, Edge[]>();
  const stationLines = new Map<string, Set<LineId>>();

  const addEdge = (s1: string, l1: LineId, s2: string, l2: LineId, weight: number) => {
    const key = `${s1}|${l1}`;
    if (!adj.has(key)) adj.set(key, []);
    adj.get(key)!.push({ toStation: s2, toLine: l2, weight });
  };

  const addLineEdges = (lineStations: MetroStation[], line: LineId) => {
    for (let i = 0; i < lineStations.length - 1; i++) {
      addEdge(lineStations[i].name, line, lineStations[i + 1].name, line, 1);
      addEdge(lineStations[i + 1].name, line, lineStations[i].name, line, 1);
    }
  };

  const l1Stats = stations.filter((s) => s.line_type === "line1").sort((a, b) => a.station_order - b.station_order);
  const l2Stats = stations.filter((s) => s.line_type === "line2").sort((a, b) => a.station_order - b.station_order);
  const l3Trunk = stations.filter((s) => s.line_type === "line3").sort((a, b) => a.station_order - b.station_order);
  const l3BranchA = stations.filter((s) => s.line_type === "line3_branch_a").sort((a, b) => a.station_order - b.station_order);
  const l3BranchB = stations.filter((s) => s.line_type === "line3_branch_b").sort((a, b) => a.station_order - b.station_order);
  const l4Stats = stations.filter((s) => s.line_type === "line4").sort((a, b) => a.station_order - b.station_order);
  const l5Stats = stations.filter((s) => s.line_type === "line5").sort((a, b) => a.station_order - b.station_order);
  const l6Stats = stations.filter((s) => s.line_type === "line6").sort((a, b) => a.station_order - b.station_order);

  addLineEdges(l1Stats, "line1");
  addLineEdges(l2Stats, "line2");
  addLineEdges(l3Trunk, "line3");

  if (l3BranchA.length > 0) {
    addEdge("الكيت كات", "line3", l3BranchA[0].name, "line3", 1);
    addEdge(l3BranchA[0].name, "line3", "الكيت كات", "line3", 1);
    addLineEdges(l3BranchA, "line3");
  }
  if (l3BranchB.length > 0) {
    addEdge("الكيت كات", "line3", l3BranchB[0].name, "line3", 1);
    addEdge(l3BranchB[0].name, "line3", "الكيت كات", "line3", 1);
    addLineEdges(l3BranchB, "line3");
  }

  addLineEdges(l4Stats, "line4");
  addLineEdges(l5Stats, "line5");
  addLineEdges(l6Stats, "line6");

  stations.forEach((s) => {
    const lt = s.line_type;
    let resolvedLine: LineId = "line3";
    if (lt !== "line3_branch_a" && lt !== "line3_branch_b") {
      resolvedLine = lt as LineId;
    }
    if (!stationLines.has(s.name)) stationLines.set(s.name, new Set());
    stationLines.get(s.name)!.add(resolvedLine);
  });

  // Add Transfer Edges between intersecting lines
  stationLines.forEach((lines, station) => {
    if (lines.size > 1) {
      const linesArr = Array.from(lines);
      for (let i = 0; i < linesArr.length; i++) {
        for (let j = i + 1; j < linesArr.length; j++) {
          addEdge(station, linesArr[i], station, linesArr[j], 4);
          addEdge(station, linesArr[j], station, linesArr[i], 4);
        }
      }
    }
  });

  const uniqueMap = new Map<string, StationInfo>();
  stations.forEach((s) => {
    const lt = s.line_type;
    let resolvedLine: LineId = "line3";
    if (lt !== "line3_branch_a" && lt !== "line3_branch_b") {
      resolvedLine = lt as LineId;
    }
    if (!uniqueMap.has(s.name)) {
      uniqueMap.set(s.name, {
        name: s.name,
        lines: [resolvedLine],
        isTransfer: false,
        landmarks: s.landmarks || [],
      });
    } else {
      const existing = uniqueMap.get(s.name)!;
      if (!existing.lines.includes(resolvedLine)) {
        existing.lines.push(resolvedLine);
      }
      if (s.landmarks && s.landmarks.length > 0) {
        existing.landmarks = Array.from(new Set([...(existing.landmarks || []), ...s.landmarks]));
      }
    }
  });

  uniqueMap.forEach((info) => {
    info.isTransfer = info.lines.length > 1;
  });

  return {
    adjacencyGraph: adj,
    stationLinesMap: stationLines,
    allStations: Array.from(uniqueMap.values()),
  };
}

/**
 * Finds shortest route between two stations using Dijkstra's algorithm with line transfer penalties
 */
export function findRoute(
  from: string,
  to: string,
  adjacencyGraph: Map<string, Edge[]>,
  stationLinesMap: Map<string, Set<LineId>>,
  getTicketPrice: (count: number) => number
): RouteResult {
  if (from === to) {
    return {
      found: true,
      path: [from],
      lines: [],
      stationCount: 1,
      price: getTicketPrice(1),
      needsTransfer: false,
      transfers: [],
      description: "أنت في محطة الوصول بالفعل!",
      detailedPath: [
        {
          station: from,
          line: Array.from(stationLinesMap.get(from) || [])[0] || "line1",
          isTransferPoint: false,
        },
      ],
      estimatedTime: 0,
    };
  }

  const startLines = Array.from(stationLinesMap.get(from) || []);
  const endLines = Array.from(stationLinesMap.get(to) || []);

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
      estimatedTime: 0,
    };
  }

  const queue: DijkstraState[] = [];
  const minDistance = new Map<string, number>();

  startLines.forEach((line) => {
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
      bestState = curr;
      break;
    }

    const neighbors = adjacencyGraph.get(currKey) || [];
    for (const edge of neighbors) {
      const nextKey = `${edge.toStation}|${edge.toLine}`;
      const newDist = curr.dist + edge.weight;

      if (newDist < (minDistance.get(nextKey) ?? Infinity)) {
        minDistance.set(nextKey, newDist);
        queue.push({
          station: edge.toStation,
          line: edge.toLine,
          dist: newDist,
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
      description: "تعذر العثور على مسار مباشر أو بالتحويل بين المحطتين.",
      detailedPath: [],
      estimatedTime: 0,
    };
  }

  const pathNodes = bestState.path;
  const cleanPath: string[] = [];
  const detailedPath: DetailedPathNode[] = [];
  const transfers: TransferInfo[] = [];
  const linesUsedSet = new Set<LineId>();

  for (let i = 0; i < pathNodes.length; i++) {
    const node = pathNodes[i];
    linesUsedSet.add(node.line);

    if (cleanPath.length === 0 || cleanPath[cleanPath.length - 1] !== node.station) {
      cleanPath.push(node.station);
    }

    const nextNode = pathNodes[i + 1];
    const isTransfer = nextNode && nextNode.station === node.station && nextNode.line !== node.line;

    if (isTransfer) {
      transfers.push({
        station: node.station,
        fromLine: node.line,
        toLine: nextNode.line,
      });
      detailedPath.push({
        station: node.station,
        line: node.line,
        isTransferPoint: true,
        targetLine: nextNode.line,
      });
      i++;
    } else {
      detailedPath.push({
        station: node.station,
        line: node.line,
        isTransferPoint: false,
      });
    }
  }

  const stationCount = cleanPath.length;
  const price = getTicketPrice(stationCount);
  const needsTransfer = transfers.length > 0;
  const linesUsed = Array.from(linesUsedSet);

  let description = "";
  if (!needsTransfer) {
    description = `استقل قطار ${LINE_NAMES[linesUsed[0]]} مباشرة من محطة [${from}] حتى محطة [${to}] دون الحاجة للتبديل.`;
  } else {
    const transferDescs = transfers
      .map((t) => `انزل في محطة [${t.station}] وحوّل إلى ${LINE_NAMES[t.toLine]}`)
      .join("، ثم ");
    description = `اركَب ${LINE_NAMES[linesUsed[0]]} من محطة [${from}]، ثم ${transferDescs} حتى تصل إلى محطة [${to}].`;
  }

  const estimatedTime = (stationCount - 1) * 2 + transfers.length * 5;

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
    estimatedTime,
  };
}

/**
 * Builds formatted text summary for sharing metro route
 */
export function generateShareText(
  result: RouteResult,
  selectedFrom: string,
  selectedTo: string
): string {
  const transfersText = result.needsTransfer
    ? result.transfers
        .map((t) => `\n- تحويل في محطة [${t.station}] إلى [${LINE_NAMES[t.toLine] || t.toLine}]`)
        .join("")
    : "\n- رحلة مباشرة بدون تبديل";

  return `🚇 مسار رحلة المترو عبر تطبيق ماب القاهرة:
من: ${selectedFrom}
إلى: ${selectedTo}
• عدد المحطات: ${result.stationCount} محطة
• سعر التذكرة: ${result.price} ج.م
• الوقت المقدر: ${result.estimatedTime} دقيقة${transfersText}
• الخطوات: ${result.description}

رابط الرحلة: https://cairomap.net/metro`;
}

/**
 * Generates WhatsApp share URL for metro route
 */
export function generateWhatsappUrl(
  result: RouteResult | null,
  selectedFrom: string | null,
  selectedTo: string | null
): string {
  if (!result || !selectedFrom || !selectedTo) return "#";
  const message = `🚇 رحلة مترو من ${selectedFrom} إلى ${selectedTo} (${result.stationCount} محطة - ${result.price} ج.م - ${result.estimatedTime} دقيقة)\nتفاصيل: https://cairomap.net/metro`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
