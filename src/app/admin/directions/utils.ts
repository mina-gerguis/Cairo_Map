import {
  DbTransitRoute,
  FormLeg,
  FormOption,
  GroupedRoute,
  OriginTabItem,
  RouteEntry,
  RouteLeg
} from "./types";
import { createDefaultLeg } from "./constants";

/**
 * Extracts a readable error string from any unknown caught error.
 */
export function getErrorMessage(err: unknown): string {
  if (!err) return "حدث خطأ غير معروف";
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    try {
      return JSON.stringify(err);
    } catch {
      return "خطأ في قراءة تفاصيل الاستجابة";
    }
  }
  return String(err);
}

/**
 * Converts integer duration in minutes to formal natural Arabic duration string.
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
 * Parses minutes from Arabic natural language strings (e.g. "ساعة و 30 دقيقة", "50 دقيقة").
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

  if (
    !hourMatch &&
    !normalized.includes("ساعة") &&
    !normalized.includes("ساعه") &&
    !normalized.includes("ساعتين") &&
    !normalized.includes("ساعتان")
  ) {
    const rawNumberMatch = normalized.match(/^(\d+)/);
    if (rawNumberMatch) {
      return parseInt(rawNumberMatch[1], 10);
    }
  }

  return found ? totalMins : null;
}

/**
 * Normalizes raw Supabase database rows into typed RouteEntry objects.
 */
export function normalizeDbTransitRoutes(rows: DbTransitRoute[]): RouteEntry[] {
  return (rows || []).map((item) => {
    let stepsArr: string[] = [];
    if (Array.isArray(item.steps)) {
      stepsArr = item.steps;
    } else if (typeof item.steps === "string") {
      try {
        stepsArr = JSON.parse(item.steps);
      } catch {
        stepsArr = [item.steps];
      }
    }

    let legsArr: RouteLeg[] | undefined = undefined;
    if (Array.isArray(item.legs)) {
      legsArr = item.legs;
    } else if (typeof item.legs === "string") {
      try {
        legsArr = JSON.parse(item.legs);
      } catch {
        legsArr = undefined;
      }
    }

    return {
      id: item.id,
      from_location: item.from_location,
      to_location: item.to_location,
      type: item.type,
      type_name: item.type_name,
      icon: item.icon,
      cost: item.cost,
      duration: item.duration,
      steps: Array.isArray(stepsArr) ? stepsArr : [],
      legs: Array.isArray(legsArr) ? legsArr : undefined,
      tips: item.tips || undefined,
      from_aliases: item.from_aliases || undefined,
      to_aliases: item.to_aliases || undefined,
      map_link: item.map_link || undefined
    };
  });
}

/**
 * Groups flat route records by (from_location + to_location) pair.
 */
export function groupRoutesByEndpoints(routes: RouteEntry[]): GroupedRoute[] {
  const grouped: Record<string, GroupedRoute> = {};
  (routes || []).forEach((r) => {
    const key = `${(r.from_location || "").trim()}|||${(r.to_location || "").trim()}`;
    if (!grouped[key]) {
      grouped[key] = {
        from_location: r.from_location,
        to_location: r.to_location,
        from_aliases: r.from_aliases,
        to_aliases: r.to_aliases,
        options: []
      };
    }
    grouped[key].options.push({
      id: r.id,
      type: r.type,
      type_name: r.type_name,
      icon: r.icon,
      cost: r.cost,
      duration: r.duration,
      steps: Array.isArray(r.steps) ? r.steps : [],
      legs: Array.isArray(r.legs) ? r.legs : undefined,
      tips: r.tips,
      map_link: r.map_link
    });
  });
  return Object.values(grouped);
}

/**
 * Extracts unique origin locations with their route counts.
 */
export function computeUniqueOrigins(groupedRoutes: GroupedRoute[]): OriginTabItem[] {
  const originsMap: Record<string, number> = {};
  (groupedRoutes || []).forEach((r) => {
    const origin = (r.from_location || "").trim();
    if (origin) {
      originsMap[origin] = (originsMap[origin] || 0) + 1;
    }
  });
  return Object.entries(originsMap).map(([name, count]) => ({ name, count }));
}

/**
 * Filters grouped routes based on search keywords, origin tab, and vehicle type.
 */
export function filterGroupedRoutes(
  groupedRoutes: GroupedRoute[],
  searchQuery: string,
  filterType: string,
  selectedOrigin: string
): GroupedRoute[] {
  const term = searchQuery.trim().toLowerCase();
  return groupedRoutes.filter((group) => {
    // 1. Origin Location Tab Filter
    if (
      selectedOrigin !== "all" &&
      group.from_location.trim().toLowerCase() !== selectedOrigin.trim().toLowerCase()
    ) {
      return false;
    }

    // 2. Search Query Matching
    const matchesSearch =
      !term ||
      group.from_location.toLowerCase().includes(term) ||
      group.to_location.toLowerCase().includes(term) ||
      (group.from_aliases && group.from_aliases.toLowerCase().includes(term)) ||
      (group.to_aliases && group.to_aliases.toLowerCase().includes(term)) ||
      group.options.some((opt) => opt.type_name.toLowerCase().includes(term));

    // 3. Vehicle Type Filter
    const matchesType =
      filterType === "all" || group.options.some((opt) => opt.type === filterType);

    return matchesSearch && matchesType;
  });
}

/**
 * Calculates total cost and formatted duration for form options based on legs.
 */
export function formatOptionCalculations(options: FormOption[]): FormOption[] {
  return options.map((opt) => {
    let totalCost = 0;
    let totalMins = 0;
    let durationStr = opt.duration;

    (opt.legs || []).forEach((leg) => {
      const legCost = parseInt(leg.cost, 10) || 0;
      totalCost += legCost;

      if (leg.duration) {
        const mins = parseMinutesFromArabic(leg.duration);
        if (mins !== null) {
          totalMins += mins;
        }
      }
    });

    if (totalMins > 0) {
      durationStr = formatMinutesToArabic(totalMins);
    } else if (opt.legs && opt.legs.length > 0 && opt.legs[0].duration) {
      durationStr = opt.legs[0].duration;
    }

    return {
      ...opt,
      cost: totalCost.toString(),
      duration: durationStr,
      durationMinutes: totalMins > 0 ? totalMins : ""
    };
  });
}

/**
 * Maps GroupedRoute connection back to form state for editing.
 */
export function mapConnectionToFormOptions(conn: GroupedRoute): FormOption[] {
  return (conn.options || []).map((opt) => {
    const parsedMins = parseMinutesFromArabic(opt.duration);

    let formLegs: FormLeg[] = [];
    if (opt.legs && Array.isArray(opt.legs) && opt.legs.length > 0) {
      formLegs = opt.legs.map((leg) => ({
        title: leg.title || "المرحلة",
        vehicleType: leg.vehicleType || "ميكروباص",
        cost: leg.cost !== undefined ? leg.cost.toString() : "",
        duration: leg.duration || "",
        steps: leg.steps && Array.isArray(leg.steps) && leg.steps.length > 0 ? leg.steps : [""]
      }));
    } else {
      formLegs = [
        {
          title: "المرحلة الأولى: خطوات المسار",
          vehicleType: "ميكروباص",
          cost: opt.cost.toString(),
          duration: opt.duration,
          steps:
            opt.steps && Array.isArray(opt.steps) && opt.steps.length > 0
              ? opt.steps
              : [""]
        }
      ];
    }

    return {
      type: opt.type,
      type_name: opt.type_name,
      icon: opt.icon,
      cost: opt.cost.toString(),
      duration: opt.duration,
      durationMinutes: parsedMins !== null ? parsedMins : "",
      steps: Array.isArray(opt.steps) ? opt.steps : [""],
      legs: formLegs,
      tips: opt.tips || "",
      map_link: opt.map_link || ""
    };
  });
}

export interface TransitIconResult {
  type: "image" | "fontIcon";
  src?: string;
  iconClass?: string;
}

/**
 * Resolves 2D image asset or BoxIcon class for transit options in admin views.
 */
export function getTransitOptionIconPath(option: { type?: string; icon?: string; vehicleType?: string }): TransitIconResult {
  const t = (option.type || option.vehicleType || "").toLowerCase();
  const icon = (option.icon || "").toLowerCase();

  // 1. Metro (مترو الأنفاق)
  if (t === "metro" || icon === "metro" || icon.includes("subway") || icon.includes("metro") || t.includes("مترو")) {
    return { type: "image", src: "/images/icons2d/metro.png" };
  }

  // 2. Microbus (ميكروباص)
  if (t === "microbus" || icon === "microbus" || t.includes("ميكروباص") || t.includes("سرفيس")) {
    return { type: "image", src: "/images/icons2d/microbus.png" };
  }

  // 3. BRT (الأتوبيس الترددي السريع)
  if (t === "brt" || icon === "brt" || icon.includes("brt") || t.includes("ترددي") || t.includes("brt")) {
    return { type: "image", src: "/images/icons2d/brt.png" };
  }

  // 4. Public Bus / Superjet / Minibus (أتوبيس النقل العام)
  if (
    t === "bus" ||
    icon === "bus" ||
    icon.includes("bus") ||
    t.includes("أتوبيس") ||
    t.includes("اتوبيس") ||
    t.includes("باص") ||
    t.includes("ميني باص") ||
    t.includes("سوبر جيت") ||
    t.includes("جو باص")
  ) {
    return { type: "image", src: "/images/icons2d/bus.png" };
  }

  // 5. Railways / Train (قطار السكك الحديدية)
  if (t === "train" || icon === "train" || icon.includes("railway") || icon.includes("cairo_train") || t.includes("قطار") || t.includes("قطارات") || t.includes("سكك حديد")) {
    return { type: "image", src: "/images/icons2d/Cairo_train.png" };
  }

  // 6. Monorail (مونوريل)
  if (t === "monorail" || icon === "monorail" || icon.includes("cairo_monorail") || icon.includes("monorail") || t.includes("مونوريل")) {
    return { type: "image", src: "/images/icons2d/Cairo_monorail_east.png" };
  }

  // 7. LRT (Light Rail Transit / القطار الكهربائي الخفيف)
  if (t === "lrt" || icon === "lrt" || icon.includes("cairo_lrt") || icon.includes("lrt") || t.includes("lrt") || t.includes("كهربائي")) {
    return { type: "image", src: "/images/icons2d/Cairo_lrt.png" };
  }

  // 8. Airport / Plane (طيران / مطار)
  if (t === "plane" || icon === "plane" || icon.includes("airport") || icon.includes("flight") || t.includes("طائر") || t.includes("طيران") || t.includes("مطار")) {
    return { type: "image", src: "/images/icons2d/airport.png" };
  }

  // 9. Ship / Ferry / Nile Bus (سفينة / معدية / أتوبيس نهري)
  if (t === "ship" || icon === "ship" || icon.includes("ferry") || icon.includes("boat") || t.includes("سفين") || t.includes("عبار") || t.includes("نهري") || t.includes("مركب")) {
    return { type: "image", src: "/images/icons2d/ship.png" };
  }

  // 10. Taxi / Cab (تاكسي / أوبر)
  if (t === "taxi" || icon === "taxi" || icon.includes("taxi") || t.includes("تاكسي") || t.includes("اوبر") || t.includes("كريم")) {
    return { type: "image", src: "/images/icons2d/taxi.png" };
  }

  // 11. Car / Private vehicle (سيارة خاصة)
  if (t === "car" || icon === "car" || icon.includes("car") || t.includes("سيار") || t.includes("عربي")) {
    return { type: "image", src: "/images/icons2d/car.png" };
  }

  // 12. Walking / Pedestrian (مشي / سير على الأقدام)
  if (t === "walk" || icon === "walk" || icon.includes("walk") || t.includes("مشي") || t.includes("اقدام") || t.includes("أقدام")) {
    return { type: "image", src: "/images/icons2d/walk.png" };
  }

  // 13. Multi-modal / Transfer (مواصلات متعددة)
  if (t === "multi" || t === "transfer" || icon === "multi" || icon === "transfer" || icon.includes("transfer") || t.includes("متعدد") || t.includes("تحويل")) {
    return { type: "image", src: "/images/icons2d/multi.png" };
  }

  // 14. BoxIcon string fallback
  if (icon.includes("bx") || icon.startsWith("fa-")) {
    return { type: "fontIcon", iconClass: option.icon };
  }

  // 15. Standard 2D icon fallback
  return { type: "image", src: `/images/icons2d/${option.icon || "microbus"}.png` };
}

