import { RouteLeg, RouteOption, RouteData, TripSummary, QuickRouteItem } from "./types";
import {
  LOCATION_ALIASES_MAP,
  DEFAULT_POPULAR_ROUTES,
  POPULAR_ROUTE_COLOR_PALETTE,
  SEARCH_STATS_STORAGE_KEY
} from "./constants";

/**
 * Normalizes Arabic text by unifying Alif, Ta Marbouta, Ya, removing diacritics, tatweel, and punctuation.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[()[\]{}.,\-_/\\+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set(["موقف", "محطه", "مدينه", "طريق", "شارع", "بوابه", "امام", "بجوار", "قرب", "ميدان", "في", "الي", "من"]);

/**
 * Splits normalized Arabic text into individual non-empty keyword tokens.
 */
export function getArabicTokens(str: string): string[] {
  return normalizeArabic(str).split(" ").filter(t => t.length > 0);
}

/**
 * Resolves any known static aliases for a given query location string.
 */
export function resolveLocationAliases(rawLocation: string): string {
  if (!rawLocation) return "";
  const normalized = normalizeArabic(rawLocation);

  for (const aliasKey of Object.keys(LOCATION_ALIASES_MAP)) {
    if (normalizeArabic(aliasKey) === normalized) {
      return LOCATION_ALIASES_MAP[aliasKey];
    }
  }

  return rawLocation.trim();
}

/**
 * Calculates a relevance score (0-1000) for a candidate location given a search query,
 * taking aliases and weighted token overlaps into account.
 */
export function calculateLocationScore(candidate: string, aliases: string | undefined, rawQuery: string): number {
  if (!candidate || !rawQuery) return 0;

  const queryCandidates = [rawQuery];
  const resolved = resolveLocationAliases(rawQuery);
  if (resolved && resolved !== rawQuery) {
    queryCandidates.push(resolved);
  }

  let bestScore = 0;

  for (const query of queryCandidates) {
    const normQuery = normalizeArabic(query);
    const normCand = normalizeArabic(candidate);
    if (!normQuery || !normCand) continue;

    // 1. Exact match with primary name
    if (normCand === normQuery) {
      bestScore = Math.max(bestScore, 1000);
      continue;
    }

    // 2. Primary candidate name contains entire query
    if (normCand.includes(normQuery)) {
      bestScore = Math.max(bestScore, 940 + Math.round((normQuery.length / normCand.length) * 50));
    }

    // 3. Exact match with an alias
    const aliasList = (aliases ? aliases.split(",") : []).map(a => normalizeArabic(a)).filter(Boolean);
    for (const alias of aliasList) {
      if (alias === normQuery) {
        bestScore = Math.max(bestScore, 900);
      }
    }

    // 4. Query contains candidate name
    if (normQuery.includes(normCand)) {
      bestScore = Math.max(bestScore, 850 + Math.round((normCand.length / normQuery.length) * 40));
    }

    // 5. Alias contains query or Query contains alias
    for (const alias of aliasList) {
      if (alias.includes(normQuery)) {
        bestScore = Math.max(bestScore, 780 + Math.round((normQuery.length / alias.length) * 40));
      }
      if (normQuery.includes(alias)) {
        bestScore = Math.max(bestScore, 740 + Math.round((alias.length / normQuery.length) * 40));
      }
    }

    // 6. Token / Keyword overlap matching with stop-word penalty
    const qTokens = getArabicTokens(query);
    const cTokens = getArabicTokens(candidate);
    const candTokensSet = new Set(cTokens);
    const aliasTokensSet = new Set<string>();
    aliasList.forEach(a => getArabicTokens(a).forEach(t => aliasTokensSet.add(t)));

    let matchedWeight = 0;
    let totalQueryWeight = 0;
    let missingCritical = 0;

    for (const qt of qTokens) {
      const isStop = STOP_WORDS.has(qt);
      const weight = isStop ? 1 : 4;
      totalQueryWeight += weight;

      let foundCand = false;
      for (const ct of Array.from(candTokensSet)) {
        if (ct === qt || (ct.length >= 3 && qt.length >= 3 && (ct.includes(qt) || qt.includes(ct)))) {
          foundCand = true;
          break;
        }
      }

      if (foundCand) {
        matchedWeight += weight;
        continue;
      }

      let foundAlias = false;
      for (const at of Array.from(aliasTokensSet)) {
        if (at === qt || (at.length >= 3 && qt.length >= 3 && (at.includes(qt) || qt.includes(at)))) {
          foundAlias = true;
          break;
        }
      }

      if (foundAlias) {
        matchedWeight += weight * 0.9;
      } else if (!isStop) {
        missingCritical++;
      }
    }

    if (totalQueryWeight > 0) {
      const ratio = matchedWeight / totalQueryWeight;
      let tokenScore = 0;
      if (missingCritical > 0 && ratio < 0.6) {
        tokenScore = Math.max(0, Math.round(ratio * 120) - (missingCritical * 30));
      } else {
        tokenScore = Math.max(0, Math.round(ratio * 650) - (missingCritical * 80));
      }
      bestScore = Math.max(bestScore, tokenScore);
    }
  }

  return bestScore;
}

/**
 * Cleanly shortens location names for slider card chips.
 */
export function cleanLocationLabel(name: string): string {
  if (!name) return "";
  return name
    .replace(/القاهرة\s*\(([^)]+)\)/g, "$1")
    .replace(/محطة\s+/g, "")
    .replace(/موقف\s+/g, "")
    .replace(/من رمضان/g, "")
    .replace(/الخامس/g, "")
    .trim();
}

/**
 * Formats a short display label for from ⇆ to.
 */
export function formatRouteShortLabel(from: string, to: string): string {
  const shortFrom = cleanLocationLabel(from);
  const shortTo = cleanLocationLabel(to);
  return `${shortFrom} ⇆ ${shortTo}`;
}

/**
 * Formats numeric minutes into proper Arabic duration text.
 */
export function formatMinutesToArabic(mins: number): string {
  if (mins <= 0) return "0 دقيقة";
  if (mins === 1) return "دقيقة واحدة";
  if (mins === 2) return "دقيقتان";

  if (mins < 60) {
    if (mins >= 3 && mins <= 10) return `${mins} دقائق`;
    return `${mins} دقيقة`;
  }

  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;

  let hoursText = "";
  if (hours === 1) {
    hoursText = "ساعة";
  } else if (hours === 2) {
    hoursText = "ساعتان";
  } else if (hours >= 3 && hours <= 10) {
    hoursText = `${hours} ساعات`;
  } else {
    hoursText = `${hours} ساعة`;
  }

  if (remaining === 0) {
    return hoursText;
  }

  let remainingText = "";
  if (remaining === 1) {
    remainingText = "ودقيقة";
  } else if (remaining === 2) {
    remainingText = "ودقيقتان";
  } else if (remaining >= 3 && remaining <= 10) {
    remainingText = `و ${remaining} دقائق`;
  } else {
    remainingText = `و ${remaining} دقيقة`;
  }

  return `${hoursText} ${remainingText}`;
}

/**
 * Parses numeric minutes from Arabic formatted duration string.
 */
export function parseMinutesFromArabic(text: string): number | null {
  if (!text) return null;
  const normalized = text.trim();

  if (normalized === "ساعة") return 60;
  if (normalized === "ساعتان" || normalized === "ساعتين") return 120;

  const hourMatch = normalized.match(/(\d+)\s+ساع/);
  const minMatch = normalized.match(/(\d+)\s+دقيق/);

  let totalMins = 0;
  let found = false;

  if (hourMatch) {
    totalMins += parseInt(hourMatch[1], 10) * 60;
    found = true;
  } else if (normalized.includes("ساعة") || normalized.includes("ساعه")) {
    totalMins += 60;
    found = true;
  } else if (normalized.includes("ساعتان") || normalized.includes("ساعتين")) {
    totalMins += 120;
    found = true;
  }

  if (minMatch) {
    totalMins += parseInt(minMatch[1], 10);
    found = true;
  } else if (normalized.includes("ودقيقة") || normalized.includes("ودقيقه")) {
    totalMins += 1;
    found = true;
  } else if (normalized.includes("ودقيقتان") || normalized.includes("ودقيقتين")) {
    totalMins += 2;
    found = true;
  }

  if (!hourMatch && !normalized.includes("ساعة") && !normalized.includes("ساعه") && !normalized.includes("ساعتين") && !normalized.includes("ساعتان")) {
    const rawNumberMatch = normalized.match(/^(\d+)/);
    if (rawNumberMatch) {
      return parseInt(rawNumberMatch[1], 10);
    }
  }

  return found ? totalMins : null;
}

/**
 * Computes the total trip cost and duration summary across all legs.
 */
export function computeTotalTripSummary(option: RouteOption, legs: RouteLeg[]): TripSummary {
  let totalCost = 0;
  let hasLegCost = false;

  (legs || []).forEach(leg => {
    if (typeof leg.cost === "number" && !isNaN(leg.cost) && leg.cost > 0) {
      totalCost += leg.cost;
      hasLegCost = true;
    }
  });

  const finalCost = hasLegCost ? totalCost : option.cost;

  let totalMinutes = 0;
  let hasLegDuration = false;

  (legs || []).forEach(leg => {
    if (leg.duration) {
      const mins = parseMinutesFromArabic(leg.duration);
      if (mins !== null && mins > 0) {
        totalMinutes += mins;
        hasLegDuration = true;
      }
    }
  });

  let finalDuration = option.duration;
  if (hasLegDuration && totalMinutes > 0) {
    finalDuration = formatMinutesToArabic(totalMinutes);
  }

  return {
    totalCost: finalCost,
    totalDuration: finalDuration
  };
}

/**
 * Safely constructs structured route stages (legs) from option data.
 */
export function buildLegsFromOption(option: RouteOption): RouteLeg[] {
  if (!option) return [];

  if (option.legs && Array.isArray(option.legs) && option.legs.length > 0) {
    return option.legs.map((leg, idx) => ({
      title: leg?.title || `المرحلة ${idx + 1}`,
      vehicleType: leg?.vehicleType,
      cost: leg?.cost,
      duration: leg?.duration,
      steps: Array.isArray(leg?.steps) ? leg.steps : (typeof leg?.steps === "string" ? [leg.steps] : [])
    }));
  }

  const steps = Array.isArray(option.steps) ? option.steps : [];
  if (steps.length === 0) {
    return [
      {
        title: "المرحلة الأولى: المسار المباشر",
        cost: option.cost,
        duration: option.duration,
        steps: ["توجه لموقع الانطلاق الموضح.", "انتقل عبر الطريق المباشر.", "الوصول في المحطة المقصودة."]
      }
    ];
  }

  return [
    {
      title: "المرحلة الأولى: خطوات المسار التفصيلية",
      cost: option.cost,
      duration: option.duration,
      steps: steps
    }
  ];
}

/**
 * Formats and triggers native or WhatsApp sharing for a route option.
 */
export function shareRoute(params: {
  from: string;
  to: string;
  option: RouteOption;
  legs: RouteLeg[];
  summary: TripSummary;
}) {
  const { from, to, option, legs, summary } = params;

  const stepsList = legs
    .map((leg, i) => `📌 مرحلة ${i + 1}: ${leg.title}\n` + (leg.steps || []).map((s) => `  • ${s}`).join("\n"))
    .join("\n\n");

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `🚗 *خط السير عبر ماب القاهرة (Cairo Map)* 🗺️\n\n📍 *من:* ${from}\n🎯 *إلى:* ${to}\n🚌 *نوع الوسيلة:* ${option.typeName}\n💵 *الإجمالي:* ${summary.totalCost} ج.م\n⏱️ *المدة المتوقعة:* ${summary.totalDuration}\n\n📋 *الخطوات التفصيلية:*\n${stepsList}\n\n🔗 *تصفح المسارات كاملة:* ${currentUrl}`;

  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({
      title: `مسار مواصلات: من ${from} إلى ${to}`,
      text: shareText,
    }).catch(() => { });
  } else if (typeof window !== "undefined") {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  }
}

/**
 * Retrieves search counts aggregated from client-side persistent storage.
 */
export function getStoredSearchCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SEARCH_STATS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Error reading directions search stats:", err);
    return {};
  }
}

/**
 * Increments and records search frequency for a given route (from ➔ to).
 */
export function recordRouteSearch(from: string, to: string): Record<string, number> {
  if (typeof window === "undefined" || !from?.trim() || !to?.trim()) return {};

  try {
    const counts = getStoredSearchCounts();
    const resolvedFrom = resolveLocationAliases(from.trim());
    const resolvedTo = resolveLocationAliases(to.trim());
    const key = `${resolvedFrom}|||${resolvedTo}`;

    counts[key] = (counts[key] || 0) + 1;
    localStorage.setItem(SEARCH_STATS_STORAGE_KEY, JSON.stringify(counts));
    return counts;
  } catch (err) {
    console.warn("Error writing directions search stats:", err);
    return {};
  }
}

/**
 * Dynamically computes and ranks the most searched routes based on live search counts & popularity.
 */
export function buildDynamicPopularRoutes(
  availableRoutes: RouteData[],
  liveSearchCounts: Record<string, number>
): QuickRouteItem[] {
  // Map of normalized key -> aggregated item
  const map: Map<string, { from: string; to: string; label: string; count: number }> = new Map();

  // 1. Seed with default baseline popular routes
  DEFAULT_POPULAR_ROUTES.forEach((item) => {
    const key = `${item.from}|||${item.to}`;
    map.set(key, {
      from: item.from,
      to: item.to,
      label: item.label,
      count: item.searchCount || 10
    });
  });

  // 2. Add routes from loaded database dataset
  availableRoutes.forEach((r) => {
    const key = `${r.from}|||${r.to}`;
    if (!map.has(key)) {
      map.set(key, {
        from: r.from,
        to: r.to,
        label: formatRouteShortLabel(r.from, r.to),
        count: (r.options?.length || 1) * 5
      });
    }
  });

  // 3. Layer in actual user search counts
  Object.keys(liveSearchCounts).forEach((key) => {
    const [f, t] = key.split("|||");
    if (f && t) {
      const existing = map.get(key);
      const userSearches = liveSearchCounts[key] || 0;
      if (existing) {
        existing.count += userSearches * 10; // Boost weight of real active searches
      } else {
        map.set(key, {
          from: f,
          to: t,
          label: formatRouteShortLabel(f, t),
          count: userSearches * 10
        });
      }
    }
  });

  // 4. Sort by count descending (Most searched first!)
  const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count);

  // 5. Build QuickRouteItems with glowing color palette and trending badges
  return sorted.slice(0, 10).map((item, idx) => {
    const glowColor = POPULAR_ROUTE_COLOR_PALETTE[idx % POPULAR_ROUTE_COLOR_PALETTE.length];
    return {
      from: item.from,
      to: item.to,
      label: item.label,
      glowColor,
      searchCount: item.count,
      isTrending: idx < 3
    };
  });
}

export interface TransitIconResult {
  type: "image" | "fontIcon";
  src?: string;
  iconClass?: string;
}

/**
 * Resolves the accurate 2D image asset or FontAwesome/BoxIcon class for any transit option.
 */
export function getTransitOptionIconPath(option: { type?: string; icon?: string }): TransitIconResult {
  const t = (option.type || "").toLowerCase();
  const icon = (option.icon || "").toLowerCase();

  // 1. Metro (uses SVG)
  if (t === "metro" || icon === "metro" || icon.includes("subway") || icon.includes("metro")) {
    return { type: "image", src: "/images/icons2d/metro.png" };
  }

  // 2. Microbus
  if (t === "microbus" || icon === "microbus") {
    return { type: "image", src: "/images/icons2d/microbus.png" };
  }

  // 3. Public Bus / Superjet
  if (t === "bus" || icon === "bus") {
    return { type: "image", src: "/images/icons2d/bus.png" };
  }

  // 4. Railways / Trains
  if (t === "train" || icon === "train" || icon.includes("railway")) {
    return { type: "image", src: "/images/icons2d/Cairo_train.png" };
  }

  // 5. Monorail
  if (t === "monorail" || icon === "monorail") {
    return { type: "image", src: "/images/icons2d/Cairo_monorail_east.png" };
  }

  // 6. LRT / Electric Train
  if (t === "lrt" || icon === "lrt") {
    return { type: "image", src: "/images/icons2d/Cairo_lrt.png" };
  }

  // 7. BRT / Bus Rapid Transit (الأتوبيس الترددي)
  if (t === "brt" || icon === "brt" || icon.includes("brt")) {
    return { type: "image", src: "/images/icons2d/bus.png" };
  }

  // 8. Plane / Airport
  if (t === "plane" || icon === "plane" || icon.includes("airport")) {
    return { type: "image", src: "/images/icons2d/airport.png" };
  }

  // 8. Explicit BoxIcon or FontAwesome classes
  if (icon.startsWith("bx ") || icon.startsWith("fa-") || icon.startsWith("bx-")) {
    return { type: "fontIcon", iconClass: icon.startsWith("bx-") ? `bx ${icon}` : icon };
  }

  // 9. Fallback by vehicle type
  if (t === "multi") {
    return { type: "fontIcon", iconClass: "bx bx-transfer" };
  }
  if (t === "car") {
    return { type: "fontIcon", iconClass: "bx bx-car" };
  }

  return { type: "image", src: "/images/icons2d/bus.png" };
}

