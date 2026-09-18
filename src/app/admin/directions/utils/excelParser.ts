import * as XLSX from "xlsx";
import { RouteEntry, RouteLeg, TransitVehicleType } from "../types";
import { parseMinutesFromArabic, formatMinutesToArabic } from "../utils";

export interface ParsedExcelRouteRow {
  from_location: string;
  to_location: string;
  type: TransitVehicleType;
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
  legs: RouteLeg[];
  tips?: string;
  from_aliases?: string;
  to_aliases?: string;
  map_link?: string;
  isValid: boolean;
  validationError?: string;
}

/**
 * Normalizes header string for fuzzy matching (removes accents, spaces, underscores, symbols).
 */
export function normalizeHeaderKey(key: string): string {
  return (key || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\s\-_]/g, "")
    .replace(/[\(\)\[\]]/g, "")
    .trim();
}

/**
 * Extracts a clean URL from a string, cell object, or Excel formula.
 */
export function extractCleanUrl(val: any): string {
  if (!val) return "";

  // Handle cell hyperlink objects from XLSX
  if (typeof val === "object") {
    const target = val?.l?.Target || val?.Target || val?.url || val?.link || val?.href;
    if (target) return String(target).trim();
  }

  const str = String(val).trim();
  if (!str) return "";

  // 1. If wrapped in HYPERLINK formula: =HYPERLINK("https://...", "...")
  const formulaMatch = str.match(/HYPERLINK\(\s*["']([^"']+)["']/i);
  if (formulaMatch && formulaMatch[1]) {
    return formulaMatch[1].trim();
  }

  // 2. If contains a full URL inside text
  const urlMatch = str.match(/(https?:\/\/[^\s"'<>]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].trim();
  }

  // 3. If starts with www. or maps.app.goo.gl or goo.gl
  if (str.startsWith("www.") || str.startsWith("maps.") || str.startsWith("goo.gl/")) {
    return `https://${str}`;
  }

  return str;
}

/**
 * Maps Arabic / English vehicle string to strictly typed TransitVehicleType and icon
 */
export function normalizeVehicleType(rawType: string): {
  type: TransitVehicleType;
  defaultName: string;
  icon: string;
} {
  const norm = (rawType || "").trim().toLowerCase();

  // 1. Microbus (Check first because "ميكروباص" and "ميكوباص" end with "باص")
  if (
    norm.includes("ميكرو") ||
    norm.includes("ميكو") ||
    norm.includes("مكروباص") ||
    norm.includes("سرفيس") ||
    norm.includes("micro") ||
    norm === "microbus"
  ) {
    return { type: "microbus", defaultName: "ميكروباص", icon: "microbus" };
  }

  // 2. Metro
  if (norm.includes("مترو") || norm.includes("metro") || norm.includes("subway")) {
    return { type: "metro", defaultName: "مترو الأنفاق", icon: "metro" };
  }

  // 3. Monorail (Check before train to prevent confusion)
  if (norm.includes("مونوريل") || norm.includes("monorail")) {
    return { type: "monorail", defaultName: "قطار المونوريل", icon: "monorail" };
  }

  // 4. LRT (Light Rail Transit / القطار الكهربائي الخفيف)
  if (
    norm.includes("lrt") ||
    norm.includes("كهربائي") ||
    norm.includes("القطار الكهربائي") ||
    norm.includes("قطار كهربائي") ||
    norm.includes("light rail")
  ) {
    return { type: "lrt", defaultName: "القطار الكهربائي الخفيف (LRT)", icon: "Cairo_lrt" };
  }

  // 5. BRT (Bus Rapid Transit / الأتوبيس الترددي)
  if (
    norm.includes("brt") ||
    norm.includes("ترددي") ||
    norm.includes("الترددي") ||
    norm.includes("الأتوبيس الترددي") ||
    norm.includes("اتوبيس ترددي") ||
    norm.includes("باص ترددي") ||
    norm.includes("bus rapid")
  ) {
    return { type: "brt", defaultName: "الأتوبيس الترددي (BRT)", icon: "bus" };
  }

  // 6. Railways / Trains
  if (
    norm.includes("قطار") ||
    norm.includes("قطارات") ||
    norm.includes("train") ||
    norm.includes("سكة حديد") ||
    norm.includes("سكه حديد") ||
    norm.includes("سكك حديد")
  ) {
    return { type: "train", defaultName: "قطار السكك الحديدية", icon: "train" };
  }

  // 7. Public Bus
  if (
    norm.includes("أتوبيس") ||
    norm.includes("اتوبيس") ||
    norm.includes("نقل عام") ||
    norm === "bus" ||
    norm.includes("باص")
  ) {
    return { type: "bus", defaultName: "أتوبيس النقل العام", icon: "bus" };
  }

  // 6. Car / Private
  if (
    norm.includes("عربية") ||
    norm.includes("عربيه") ||
    norm.includes("سيارة") ||
    norm.includes("سياره") ||
    norm.includes("car") ||
    norm.includes("خاص") ||
    norm.includes("تاكسي")
  ) {
    return { type: "car", defaultName: "سيارة خاصة", icon: "car" };
  }

  // 7. Plane / Airport
  if (
    norm.includes("طيران") ||
    norm.includes("طائرة") ||
    norm.includes("طائره") ||
    norm.includes("plane") ||
    norm.includes("flight") ||
    norm.includes("مطار")
  ) {
    return { type: "plane", defaultName: "طائرة / طيران", icon: "plane" };
  }

  // 8. Ship / Ferry
  if (
    norm.includes("سفينة") ||
    norm.includes("سفينه") ||
    norm.includes("عبارة") ||
    norm.includes("عباره") ||
    norm.includes("ship") ||
    norm.includes("ferry") ||
    norm.includes("مركب")
  ) {
    return { type: "ship", defaultName: "سفينة / عبارة", icon: "ship" };
  }

  // 9. Multi Transit
  if (
    norm.includes("متعدد") ||
    norm.includes("تحويل") ||
    norm.includes("multi") ||
    norm.includes("transfer")
  ) {
    return { type: "multi", defaultName: "مواصلات متعددة", icon: "transfer" };
  }

  // Default fallback: microbus
  return { type: "microbus", defaultName: "ميكروباص", icon: "microbus" };
}

/**
 * Parses legs and steps from raw cell text.
 * Handles both stage syntax (e.g. "المرحلة 1: ... | المرحلة 2: ...") and step lists (separated by newline / semicolon / bullet).
 */
export function parseLegsAndStepsFromText(rawText: string, defaultVehicleType: string): {
  legs: RouteLeg[];
  allFlatSteps: string[];
} {
  if (!rawText || !rawText.trim()) {
    return {
      legs: [
        {
          title: "المرحلة الأولى: خطوات المسار",
          vehicleType: defaultVehicleType,
          steps: ["اتباع المسار المحدد"]
        }
      ],
      allFlatSteps: ["اتباع المسار المحدد"]
    };
  }

  const text = rawText.trim();

  // 1. Check if structured with stages divider (e.g. '|' or 'المرحلة')
  if (text.includes("|") || text.includes("المرحلة") || text.includes("مرحلة")) {
    const rawLegs = text.split(/\||\n(?=المرحلة|مرحلة)/).map(s => s.trim()).filter(Boolean);
    const parsedLegs: RouteLeg[] = [];
    const flatSteps: string[] = [];

    rawLegs.forEach((legStr, idx) => {
      let title = `المرحلة ${idx + 1}`;
      let cost: number | undefined = undefined;
      let duration: string | undefined = undefined;
      let legSteps: string[] = [];

      // Extract title before brackets/parentheses or colon
      const titleMatch = legStr.match(/^([^:(\[]+)/);
      if (titleMatch && titleMatch[1].trim()) {
        title = titleMatch[1].trim();
      }

      // Extract cost if present (e.g. "(20 ج.م)" or "20 ج.م" or "20 جنية")
      const costMatch = legStr.match(/(\d+)\s*(ج\.م|جنيه|جنية|EGP|LE)/i);
      if (costMatch) {
        cost = parseInt(costMatch[1], 10);
      }

      // Extract duration if present (e.g. "50 دقيقة" or "ساعة")
      const durMatch = legStr.match(/(\d+\s*(?:دقيقة|دقائق|ساعة|ساعات|ساعتين|ساعتان)|ساعة|ساعتان|ساعتين)/);
      if (durMatch) {
        duration = durMatch[1].trim();
      }

      // Extract steps from brackets [step 1 / step 2] or after colon
      const bracketMatch = legStr.match(/\[(.*?)\]/);
      if (bracketMatch) {
        legSteps = bracketMatch[1]
          .split(/[\/\n;،,]/)
          .map(s => s.trim())
          .filter(Boolean);
      } else if (legStr.includes(":")) {
        const afterColon = legStr.split(":")[1];
        legSteps = afterColon
          .split(/[\/\n;،,•-]/)
          .map(s => s.trim())
          .filter(Boolean);
      }

      if (legSteps.length === 0) {
        legSteps = [legStr.replace(/\[.*?\]/g, "").trim() || "اتباع خطوات هذه المرحلة"];
      }

      parsedLegs.push({
        title,
        vehicleType: defaultVehicleType,
        cost,
        duration,
        steps: legSteps
      });

      legSteps.forEach(s => flatSteps.push(s));
    });

    if (parsedLegs.length > 0) {
      return { legs: parsedLegs, allFlatSteps: flatSteps };
    }
  }

  // 2. Simple list of steps separated by newline, semicolon, or bullets
  const steps = text
    .split(/\n|;|؛|•|\r/)
    .map(s => s.replace(/^\d+[\.\-\)]\s*/, "").trim())
    .filter(Boolean);

  const finalSteps = steps.length > 0 ? steps : [text];
  return {
    legs: [
      {
        title: "المرحلة الأولى: خطوات المسار",
        vehicleType: defaultVehicleType,
        steps: finalSteps
      }
    ],
    allFlatSteps: finalSteps
  };
}

/**
 * Parses an uploaded Excel / CSV file into normalized Route rows.
 */
export async function parseDirectionsExcelFile(file: File): Promise<ParsedExcelRouteRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Read rows as array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  const parsedRoutes: ParsedExcelRouteRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];

    // Build a normalized key-value map for this row for reliable fuzzy matching
    const rowNormalizedMap = new Map<string, any>();
    for (const [key, val] of Object.entries(row)) {
      rowNormalizedMap.set(normalizeHeaderKey(key), val);
    }

    // Helper to get value matching any aliases
    const getVal = (...aliases: string[]): string => {
      // 1. Try exact match in raw row
      for (const a of aliases) {
        if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== "") {
          return String(row[a]).trim();
        }
      }
      // 2. Try normalized fuzzy match
      for (const a of aliases) {
        const normAlias = normalizeHeaderKey(a);
        if (rowNormalizedMap.has(normAlias)) {
          const val = rowNormalizedMap.get(normAlias);
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            return String(val).trim();
          }
        }
      }
      return "";
    };

    // Helper to get map link (checks raw cell, formulas, and fuzzy headers)
    const getMapLinkVal = (): string => {
      const mapAliases = [
        "map_link",
        "maplink",
        "google_maps_url",
        "googlemapsurl",
        "map_url",
        "mapurl",
        "map",
        "maps",
        "url",
        "link",
        "رابط خريطة Google",
        "رابط خريطة جوجل",
        "رابط خريطة جول",
        "خريطة جوجل",
        "خريطه جوجل",
        "رابط الخريطة",
        "رابط الخريطه",
        "الخريطة",
        "الخريطه",
        "خريطة",
        "خريطه",
        "رابط Google Maps",
        "Google Maps",
        "GoogleMaps",
        "رابط جوجل ماب",
        "جوجل ماب",
        "مسار الخريطة",
        "رابط اللوكيشن",
        "لوكيشن",
        "الموقع على الخريطة",
        "موقع الخريطة"
      ];

      for (const a of mapAliases) {
        if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== "") {
          const extracted = extractCleanUrl(row[a]);
          if (extracted) return extracted;
        }
        const normAlias = normalizeHeaderKey(a);
        if (rowNormalizedMap.has(normAlias)) {
          const rawVal = rowNormalizedMap.get(normAlias);
          if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
            const extracted = extractCleanUrl(rawVal);
            if (extracted) return extracted;
          }
        }
      }

      // Fallback: check if ANY cell in the row contains a google maps URL
      for (const val of Object.values(row)) {
        if (typeof val === "string" && (val.includes("google.com/maps") || val.includes("maps.app.goo.gl") || val.includes("goo.gl/maps"))) {
          const extracted = extractCleanUrl(val);
          if (extracted) return extracted;
        }
      }

      return "";
    };

    const fromLocation = getVal("from_location", "from", "من", "نقطة البداية", "البداية", "نقطة الانطلاق", "نقطه البدايه", "نقطه الانطلاق");
    const toLocation = getVal("to_location", "to", "إلى", "الى", "الوجهة", "الوجهه", "نقطة الوصول", "نقطه الوصول");
    const rawType = getVal("type", "نوع الوسيلة", "نوع وسيلة المواصلات", "وسيلة المواصلات", "النوع", "وسيله المواصلات", "نوع الوسيله");
    const customName = getVal("type_name", "name", "اسم الوسيلة", "اسم وسيلة المواصلات", "الاسم", "اسم الوسيله", "اسم وسيله المواصلات");
    const rawCost = getVal("cost", "الأجرة", "الاجرة", "السعر", "التكلفة", "أجرة", "اجرة", "سعر التذكرة", "الاجره", "الأجره", "الأجرة (ج.م)", "الاجرة (ج.م)", "الاجره (ج.م)", "الأجره (ج.م)");
    const rawDuration = getVal("duration", "الوقت", "المدة", "المدة الزمنية", "وقت الرحلة", "المده", "المده الزمنيه", "وقت الرحله");
    const rawStepsOrLegs = getVal("legs", "steps", "الخطوات", "المراحل", "مراحل وخطوات المسار", "خطوات المسار", "المسار", "مراحل وخطوات");
    const tips = getVal("tips", "نصيحة", "نصائح", "ملاحظات", "نصيحة ذهبية", "نصيحه", "نصيحه ذهبيه للمسافرين", "نصيحة ذهبية للمسافرين");
    const fromAliases = getVal("from_aliases", "كلمات بديلة للبداية", "كلمات بديله للبدايه", "أسماء بديلة للبداية", "اسماء بديله للبدايه", "مرادفات البداية", "مرادفات البدايه");
    const toAliases = getVal("to_aliases", "كلمات بديلة للوجهة", "كلمات بديله للوجهه", "أسماء بديلة للوجهة", "اسماء بديله للوجهه", "مرادفات الوجهة", "مرادفات الوجهه");
    const mapLink = getMapLinkVal();

    // Validation
    if (!fromLocation && !toLocation) {
      // Empty row, skip
      continue;
    }

    const errors: string[] = [];
    if (!fromLocation) errors.push("نقطة البداية مفقودة");
    if (!toLocation) errors.push("نقطة الوجهة مفقودة");

    const vehicleMeta = normalizeVehicleType(rawType);
    const typeName = customName || vehicleMeta.defaultName;

    const { legs, allFlatSteps } = parseLegsAndStepsFromText(rawStepsOrLegs, vehicleMeta.defaultName);

    // Calculate total cost if not explicitly given
    let finalCost = parseInt(rawCost, 10);
    if (isNaN(finalCost)) {
      let sumLegCost = 0;
      legs.forEach(l => {
        if (typeof l.cost === "number") sumLegCost += l.cost;
      });
      finalCost = sumLegCost;
    }

    // Calculate total duration if not explicitly given
    let finalDuration = rawDuration;
    if (!finalDuration) {
      let totalMins = 0;
      legs.forEach(l => {
        if (l.duration) {
          const mins = parseMinutesFromArabic(l.duration);
          if (mins !== null) totalMins += mins;
        }
      });
      if (totalMins > 0) {
        finalDuration = formatMinutesToArabic(totalMins);
      } else {
        finalDuration = "غير محدد";
      }
    }

    parsedRoutes.push({
      from_location: fromLocation,
      to_location: toLocation,
      type: vehicleMeta.type,
      type_name: typeName,
      icon: vehicleMeta.icon,
      cost: finalCost,
      duration: finalDuration,
      steps: allFlatSteps,
      legs: legs,
      tips: tips || undefined,
      from_aliases: fromAliases || undefined,
      to_aliases: toAliases || undefined,
      map_link: mapLink || undefined,
      isValid: errors.length === 0,
      validationError: errors.join(" - ")
    });
  }

  return parsedRoutes;
}

/**
 * Generates and triggers download of a standardized Excel template for directions.
 */
export function generateDirectionsExcelTemplate() {
  const sampleData = [
    {
      "نقطة البداية": "الزقازيق",
      "الوجهة": "أرض المعارض (مدينة نصر)",
      "نوع وسيلة المواصلات": "ميكروباص",
      "اسم وسيلة المواصلات": "ميكروباص مباشر ثم مترو",
      "الأجرة (ج.م)": 32,
      "المدة الزمنية": "ساعة و 15 دقيقة",
      "مراحل وخطوات المسار":
        "المرحلة الأولى: ميكروباص من الزقازيق إلى موقف السلام (22 ج.م - 50 دقيقة) [اركب من موقف الأحرار / انزل موقف السلام الجديد] | المرحلة الثانية: مترو الخط الثالث إلى أرض المعارض (10 ج.م - 25 دقيقة) [اركب من محطة عدلي منصور / انزل محطة المعرض]",
      "كلمات بديلة للبداية": "موقف الأحرار، الاحرار، جامعة الزقازيق",
      "كلمات بديلة للوجهة": "معرض الكتاب، مركز مصر للمعارض، مركز المنارة",
      "نصيحة ذهبية للمسافرين": "يفضل ركوب المترو من محطة عدلي منصور لتفادي زحام طريق السويس",
      "رابط خريطة Google": "https://maps.google.com"
    },
    {
      "نقطة البداية": "رمسيس",
      "الوجهة": "التجمع الخامس",
      "نوع وسيلة المواصلات": "أتوبيس",
      "اسم وسيلة المواصلات": "أتوبيس النقل العام M5",
      "الأجرة (ج.م)": 15,
      "المدة الزمنية": "45 دقيقة",
      "مراحل وخطوات المسار":
        "اركب أتوبيس رقم 1018 أو M5 من موقف رمسيس; انزل في شارع التسعين الشمالي; امشي 3 دقائق للوجهة",
      "كلمات بديلة للبداية": "ميدان رمسيس، محطة مصر",
      "كلمات بديلة للوجهة": "الجامعة الأمريكية، التسعين، التجمع",
      "نصيحة ذهبية للمسافرين": "الأتوبيسات المكيفة متوفرة أمام مسجد الفتح كل 15 دقيقة",
      "رابط خريطة Google": ""
    },
    {
      "نقطة البداية": "الجيزة",
      "الوجهة": "مطار القاهرة الدولي",
      "نوع وسيلة المواصلات": "مترو",
      "اسم وسيلة المواصلات": "مترو الأنفاق + أتوبيس المطار",
      "الأجرة (ج.م)": 20,
      "المدة الزمنية": "ساعة",
      "مراحل وخطوات المسار":
        "المرحلة الأولى: مترو الخط الثاني من الجيزة إلى العتبة (10 ج.م) [اركب محطة مترو الجيزة / بدل في العتبة للخط الثالث] | المرحلة الثانية: مترو الخط الثالث إلى الأهرام (10 ج.م) [انزل محطة الأهرام / اركب ميني باص المطار]",
      "كلمات بديلة للبداية": "محطة الجيزة، ميدان الجيزة",
      "كلمات بديلة للوجهة": "المطار، صالة 1، صالة 2، صالة 3",
      "نصيحة ذهبية للمسافرين": "احرص على الوصول قبل موعد الرحلة بساعتين ونصف",
      "رابط خريطة Google": ""
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for readability
  worksheet["!cols"] = [
    { wch: 18 }, // from
    { wch: 22 }, // to
    { wch: 18 }, // type
    { wch: 26 }, // name
    { wch: 14 }, // cost
    { wch: 18 }, // duration
    { wch: 65 }, // legs/steps
    { wch: 30 }, // from aliases
    { wch: 30 }, // to aliases
    { wch: 35 }, // tips
    { wch: 25 }  // map
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج_مسارات_المواصلات");

  XLSX.writeFile(workbook, "Directions_Routes_Template.xlsx");
}

/**
 * Exports existing database routes to a downloadable Excel file.
 */
export function exportRoutesToExcel(routes: RouteEntry[]) {
  const exportData = (routes || []).map((r, idx) => {
    // Format legs or steps text
    let legsText = "";
    if (r.legs && Array.isArray(r.legs) && r.legs.length > 0) {
      legsText = r.legs
        .map((leg, lIdx) => {
          const costStr = leg.cost !== undefined ? ` (${leg.cost} ج.م)` : "";
          const durStr = leg.duration ? ` - ${leg.duration}` : "";
          const stepsStr = leg.steps && leg.steps.length > 0 ? ` [${leg.steps.join(" / ")}]` : "";
          return `${leg.title || `المرحلة ${lIdx + 1}`}${costStr}${durStr}${stepsStr}`;
        })
        .join(" | ");
    } else if (r.steps && Array.isArray(r.steps)) {
      legsText = r.steps.join(" ; ");
    }

    return {
      "م": idx + 1,
      "نقطة البداية": r.from_location,
      "الوجهة": r.to_location,
      "نوع وسيلة المواصلات": r.type,
      "اسم وسيلة المواصلات": r.type_name,
      "الأجرة (ج.م)": r.cost,
      "المدة الزمنية": r.duration,
      "مراحل وخطوات المسار": legsText,
      "كلمات بديلة للبداية": r.from_aliases || "",
      "كلمات بديلة للوجهة": r.to_aliases || "",
      "نصيحة ذهبية للمسافرين": r.tips || "",
      "رابط خريطة Google": r.map_link || ""
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 18 },
    { wch: 60 },
    { wch: 28 },
    { wch: 28 },
    { wch: 30 },
    { wch: 25 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "جميع_المسارات_المسجلة");

  const fileName = `Transit_Routes_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
