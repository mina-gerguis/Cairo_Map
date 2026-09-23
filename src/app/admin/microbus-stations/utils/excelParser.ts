import * as XLSX from "xlsx";
import { AdminMicrobusStation, AdminMicrobusRoute } from "../types";

export interface ParsedExcelMicrobusStation {
  name: string;
  location: string;
  governorate: string;
  map_url: string;
  routes: AdminMicrobusRoute[];
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
 * Parses an uploaded Excel / CSV file into normalized Microbus Stations and Routes.
 * Supports:
 * 1. Multi-row format (Station details on row 1, consecutive route rows for the same station)
 * 2. Flat format (Every row contains station name + 1 route, grouped automatically)
 * 3. Delimited routes in a single cell (e.g. "6 أكتوبر (12 ج.م) | الشيخ زايد (14 ج.م)")
 */
export async function parseMicrobusExcelFile(file: File): Promise<ParsedExcelMicrobusStation[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Read rows as array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  const stationMap = new Map<string, {
    name: string;
    location: string;
    governorate: string;
    map_url: string;
    routes: AdminMicrobusRoute[];
    errors: string[];
  }>();

  let lastStationName = "";

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];

    // Build a normalized key-value map for this row for reliable fuzzy matching
    const rowNormalizedMap = new Map<string, any>();
    for (const [key, val] of Object.entries(row)) {
      rowNormalizedMap.set(normalizeHeaderKey(key), val);
    }

    // Helper to get value matching any aliases
    const getVal = (...aliases: string[]): string => {
      // 1. Exact match
      for (const a of aliases) {
        if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== "") {
          return String(row[a]).trim();
        }
      }
      // 2. Normalized fuzzy match
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

    // Helper to extract map link
    const getMapLinkVal = (): string => {
      const mapAliases = [
        "map_url",
        "map_link",
        "mapurl",
        "maplink",
        "google_maps_url",
        "googlemapsurl",
        "map",
        "maps",
        "url",
        "link",
        "رابط خريطة Google",
        "رابط خريطة جوجل",
        "خريطة جوجل",
        "خريطه جوجل",
        "رابط الخريطة",
        "رابط الخريطه",
        "الخريطة",
        "الخريطه",
        "خريطة",
        "خريطه",
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

      for (const val of Object.values(row)) {
        if (typeof val === "string" && (val.includes("google.com/maps") || val.includes("maps.app.goo.gl") || val.includes("goo.gl/maps"))) {
          const extracted = extractCleanUrl(val);
          if (extracted) return extracted;
        }
      }

      return "";
    };

    let stationName = getVal("name", "اسم الموقف", "الموقف", "اسم موقف السرفيس", "موقف", "station_name", "station");
    const governorate = getVal("governorate", "المحافظة", "المحافظه", "محافظة", "محافظه", "city");
    const location = getVal("location", "العنوان", "العنوان بالتفصيل", "المكان", "الموقع", "موقع الموقف", "address");
    const mapUrl = getMapLinkVal();

    // Route fields
    const destination = getVal("destination", "الوجهة", "الوجهه", "المسار", "إلى", "الى", "to", "route");
    const fare = getVal("fare", "الأجرة", "الاجرة", "الأجره", "الاجره", "الأجرة (ج.م)", "الاجرة (ج.م)", "السعر", "التكلفة", "cost", "price");
    const vehicleType = getVal("vehicleType", "vehicletype", "vehicle_type", "نوع الوسيلة", "نوع وسيلة المواصلات", "نوع الوسيله", "وسيلة المواصلات", "الوسيلة", "النوع") || "ميكروباص";
    const via = getVal("via", "خط السير", "عبر", "خط السير / عبر", "طريق", "خط السير عبر", "line", "route_via");
    const duration = getVal("duration", "المدة", "المده", "المدة الزمنية", "المده الزمنيه", "الوقت", "وقت الرحلة", "time");
    const rawType = getVal("type", "نوع الموقف", "نوع الخط", "حالة الموقف", "station_type") || "official";
    const notes = getVal("notes", "description", "ملاحظات", "الوصف", "وصف", "تفاصيل");
    const multiRoutesText = getVal("routes", "خطوط السير", "المسارات", "قائمة الخطوط");

    // If row is completely empty, skip
    if (!stationName && !destination && !location && !governorate && !multiRoutesText) {
      continue;
    }

    // Determine which station this row belongs to
    if (!stationName && lastStationName) {
      stationName = lastStationName;
    } else if (stationName) {
      lastStationName = stationName;
    }

    if (!stationName) {
      stationName = "موقف غير مسمى";
    }

    const stationKey = stationName.trim().toLowerCase();

    if (!stationMap.has(stationKey)) {
      stationMap.set(stationKey, {
        name: stationName.trim(),
        location: location || "",
        governorate: governorate || "القاهرة",
        map_url: mapUrl || `https://maps.google.com/?q=${encodeURIComponent(stationName.trim())}`,
        routes: [],
        errors: []
      });
    }

    const currentStation = stationMap.get(stationKey)!;

    // Update station info if this row has fuller info
    if (location && !currentStation.location) currentStation.location = location;
    if (governorate && (!currentStation.governorate || currentStation.governorate === "القاهرة")) currentStation.governorate = governorate;
    if (mapUrl && !currentStation.map_url.includes("google.com/maps/search")) currentStation.map_url = mapUrl;

    const routeType = rawType.includes("عادي") || rawType.includes("normal") ? "normal" : "official";

    // 1. If explicit single route fields exist in this row
    if (destination || fare) {
      currentStation.routes.push({
        destination: destination || "وجهة غير محددة",
        fare: fare ? fare.trim() : "غير محدد",
        vehicleType: vehicleType,
        via: via || undefined,
        duration: duration || undefined,
        type: routeType,
        description: notes || undefined,
        lastUpdated: new Date().toISOString().split("T")[0]
      });
    }

    // 2. If multiRoutesText exists in the row (e.g. "6 أكتوبر (12) | الشيخ زايد (14 ج.م)")
    if (multiRoutesText) {
      const parts = multiRoutesText.split(/\||\n/).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        // e.g. "6 أكتوبر (12 - عبر المحور)" or "6 أكتوبر (12 ج.م)"
        const destMatch = part.match(/^([^(\[-]+)/);
        const partDest = destMatch ? destMatch[1].trim() : part;

        // Match fare text inside parenthesis/brackets or standalone
        const fareMatch = part.match(/(\d+(?:-\d+)?(?:\s*(?:ج\.م|جنيه|جنية|EGP|LE))?)/i);
        const partFare = fareMatch ? fareMatch[1].trim() : "غير محدد";

        const viaMatch = part.match(/(?:عبر|طريق)\s+([^)\],]+)/i);
        const partVia = viaMatch ? viaMatch[1].trim() : undefined;

        currentStation.routes.push({
          destination: partDest || "وجهة غير محددة",
          fare: partFare,
          vehicleType: vehicleType,
          via: partVia,
          type: routeType,
          lastUpdated: new Date().toISOString().split("T")[0]
        });
      }
    }
  }

  // Convert map to array and perform validations
  const result: ParsedExcelMicrobusStation[] = [];

  for (const [, station] of stationMap.entries()) {
    const errors: string[] = [];

    if (!station.name || station.name === "موقف غير مسمى") {
      errors.push("اسم الموقف مفقود");
    }
    if (!station.location) {
      errors.push("العنوان بالتفصيل مفقود");
    }
    if (!station.governorate) {
      errors.push("المحافظة مفقودة");
    }
    if (!station.routes || station.routes.length === 0) {
      errors.push("لا توجد خطوط سير محددة للموقف");
    }

    result.push({
      name: station.name,
      location: station.location || "العنوان غير محدد",
      governorate: station.governorate || "القاهرة",
      map_url: station.map_url || "",
      routes: station.routes.length > 0 ? station.routes : [
        {
          destination: "وجهة عامة",
          fare: "غير محدد",
          vehicleType: "ميكروباص",
          type: "official",
          lastUpdated: new Date().toISOString().split("T")[0]
        }
      ],
      isValid: errors.length === 0,
      validationError: errors.join(" - ")
    });
  }

  return result;
}

/**
 * Generates and triggers download of a standardized Excel template for Microbus Stations.
 */
export function generateMicrobusExcelTemplate() {
  const sampleData = [
    {
      "اسم الموقف": "موقف رمسيس (أحمد حلمي)",
      "المحافظة": "القاهرة",
      "العنوان بالتفصيل": "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
      "رابط خريطة جوجل": "https://maps.google.com/?q=Ramses+Station",
      "الوجهة": "6 أكتوبر",
      "الأجرة": "12-14",
      "نوع وسيلة المواصلات": "ميكروباص سقف عالي",
      "خط السير / عبر": "طريق المحور",
      "المدة الزمنية": "45 دقيقة",
      "نوع الموقف / الخط": "موقف رسمي",
      "ملاحظات": "التحميل من الرصيف رقم 2 بجوار الكوبري"
    },
    {
      "اسم الموقف": "موقف رمسيس (أحمد حلمي)",
      "المحافظة": "القاهرة",
      "العنوان بالتفصيل": "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
      "رابط خريطة جوجل": "https://maps.google.com/?q=Ramses+Station",
      "الوجهة": "التجمع الخامس",
      "الأجرة": "15-18",
      "نوع وسيلة المواصلات": "ميكروباص / ميني باص",
      "خط السير / عبر": "الطريق الدائري",
      "المدة الزمنية": "40 دقيقة",
      "نوع الموقف / الخط": "موقف رسمي",
      "ملاحظات": "متوفر على مدار 24 ساعة"
    },
    {
      "اسم الموقف": "موقف المرج الجديدة",
      "المحافظة": "القاهرة",
      "العنوان بالتفصيل": "شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي",
      "رابط خريطة جوجل": "https://maps.google.com/?q=El+Marg+Station",
      "الوجهة": "العاشر من رمضان",
      "الأجرة": "12-15",
      "نوع وسيلة المواصلات": "ميكروباص سقف عالي",
      "خط السير / عبر": "طريق الإسماعيلية الصحراوي",
      "المدة الزمنية": "45 دقيقة",
      "نوع الموقف / الخط": "موقف رسمي",
      "ملاحظات": "خط سريع مباشر"
    },
    {
      "اسم الموقف": "موقف المرج الجديدة",
      "المحافظة": "القاهرة",
      "العنوان بالتفصيل": "شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي",
      "رابط خريطة جوجل": "https://maps.google.com/?q=El+Marg+Station",
      "الوجهة": "الزقازيق",
      "الأجرة": "15-18",
      "نوع وسيلة المواصلات": "ميكروباص إقليمي",
      "خط السير / عبر": "طريق بلبيس / بنها الصحراوي",
      "المدة الزمنية": "60 دقيقة",
      "نوع الموقف / الخط": "موقف رسمي",
      "ملاحظات": "ميكروباصات حديثة ومكيفة"
    },
    {
      "اسم الموقف": "موقف ميدان الجيزة",
      "المحافظة": "الجيزة",
      "العنوان بالتفصيل": "ميدان الجيزة - أسفل كوبري فيصل ومحطة مترو الجيزة",
      "رابط خريطة جوجل": "https://maps.google.com/?q=Giza+Square",
      "الوجهة": "الهرم وفيصل",
      "الأجرة": "5-6",
      "نوع وسيلة المواصلات": "ميكروباص",
      "خط السير / عبر": "شارع الهرم - شارع فيصل",
      "المدة الزمنية": "20 دقيقة",
      "نوع الموقف / الخط": "موقف رسمي",
      "ملاحظات": ""
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  worksheet["!cols"] = [
    { wch: 28 }, // اسم الموقف
    { wch: 14 }, // المحافظة
    { wch: 45 }, // العنوان بالتفصيل
    { wch: 30 }, // رابط خريطة جوجل
    { wch: 22 }, // الوجهة
    { wch: 16 }, // الأجرة
    { wch: 24 }, // نوع وسيلة المواصلات
    { wch: 28 }, // خط السير
    { wch: 16 }, // المدة
    { wch: 18 }, // نوع الموقف
    { wch: 35 }  // ملاحظات
  ];

  const guideData = [
    {
      "اسم العمود في الإكسل": "اسم الموقف",
      "مطلوب أم اختياري": "مطلوب",
      "الوصف والأمثلة": "اسم موقف السرفيس (مثال: موقف رمسيس، موقف السلام، موقف المنيب)",
      "ملاحظات إضافية": "يمكن تكرار اسم الموقف في عدة صفوف لإضافة عدة خطوط لنفس الموقف"
    },
    {
      "اسم العمود في الإكسل": "المحافظة",
      "مطلوب أم اختياري": "مطلوب",
      "الوصف والأمثلة": "المحافظة التابع لها الموقف (مثال: القاهرة، الجيزة، القليوبية، الشرقية)",
      "ملاحظات إضافية": "تستخدم في التصفية والتصنيف داخل الموقع"
    },
    {
      "اسم العمود في الإكسل": "العنوان بالتفصيل",
      "مطلوب أم اختياري": "مطلوب",
      "الوصف والأمثلة": "العنوان الدقيق وموقع الموقف (مثال: أسفل كوبري السويس، بجوار محطة المترو)",
      "ملاحظات إضافية": "يساعد الركاب في الوصول للموقف بسهولة"
    },
    {
      "اسم العمود في الإكسل": "رابط خريطة جوجل",
      "مطلوب أم اختياري": "اختياري",
      "الوصف والأمثلة": "رابط Google Maps للموقع الدقيق للموقف (مثال: https://maps.google.com/?q=...)",
      "ملاحظات إضافية": "إذا ترك فارغاً سيتم توليد رابط بحث تلقائي باسم الموقف"
    },
    {
      "اسم العمود في الإكسل": "الوجهة",
      "مطلوب أم اختياري": "مطلوب",
      "الوصف والأمثلة": "المدينة أو المنطقة التي يتجه إليها الميكروباص (مثال: 6 أكتوبر، التجمع، حلوان)",
      "ملاحظات إضافية": "لكل صف خط سير وجهة واحدة محددة"
    },
    {
      "اسم العمود في الإكسل": "الأجرة",
      "مطلوب أم اختياري": "مطلوب",
      "الوصف والأمثلة": "سعر الأجرة كرقم أو مدى (مثال: 15 أو 12-14)",
      "ملاحظات إضافية": "يتم حفظ القيمة كما هي تماماً دون إضافة أي كلمة تلقائياً"
    },
    {
      "اسم العمود في الإكسل": "نوع وسيلة المواصلات",
      "مطلوب أم اختياري": "اختياري",
      "الوصف والأمثلة": "ميكروباص / ميكروباص سقف عالي / ميني باص / أتوبيس",
      "ملاحظات إضافية": "القيمة الافتراضية: ميكروباص"
    },
    {
      "اسم العمود في الإكسل": "خط السير / عبر",
      "مطلوب أم اختياري": "اختياري",
      "الوصف والأمثلة": "الطريق أو المحاور التي يسلكها السرفيس (مثال: طريق المحور، الدائري، صلاح سالم)",
      "ملاحظات إضافية": "تظهر للراكب لمعرفة طريق الرحلة"
    },
    {
      "اسم العمود في الإكسل": "المدة الزمنية",
      "مطلوب أم اختياري": "اختياري",
      "الوصف والأمثلة": "الوقت التقريبي للوصول (مثال: 45 دقيقة، ساعة)",
      "ملاحظات إضافية": "تساعد في تقدير زمن الرحلة"
    },
    {
      "اسم العمود في الإكسل": "نوع الموقف / الخط",
      "مطلوب أم اختياري": "اختياري",
      "الوصف والأمثلة": "موقف رسمي (official) أو نقطة تحميل عادية (normal)",
      "ملاحظات إضافية": "القيمة الافتراضية: موقف رسمي"
    },
    {
      "اسم العمود في الإكسل": "ملاحظات",
      "مطلوب أم اختياري": "اختياري",
      "الوصف والأمثلة": "نصائح إضافية، رصيف التحميل، أوقات الذروة",
      "ملاحظات إضافية": "تظهر كتفاصيل مساعدة للمستخدمين"
    }
  ];

  const guideWorksheet = XLSX.utils.json_to_sheet(guideData);
  guideWorksheet["!cols"] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 45 },
    { wch: 40 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج_مواقف_السرفيس");
  XLSX.utils.book_append_sheet(workbook, guideWorksheet, "دليل_الأعمدة_والاستخدام");

  XLSX.writeFile(workbook, "Microbus_Stations_Template.xlsx");
}

/**
 * Exports existing database microbus stations and routes to a downloadable Excel file.
 */
export function exportMicrobusStationsToExcel(stations: AdminMicrobusStation[]) {
  const exportData: Record<string, any>[] = [];
  let rowIdx = 1;

  for (const station of stations) {
    const routes = Array.isArray(station.routes) && station.routes.length > 0
      ? station.routes
      : [
          {
            destination: "غير محدد",
            fare: "غير محدد",
            vehicleType: "ميكروباص",
            type: "official"
          } as AdminMicrobusRoute
        ];

    for (const route of routes) {
      exportData.push({
        "م": rowIdx++,
        "اسم الموقف": station.name || "",
        "المحافظة": station.governorate || "",
        "العنوان بالتفصيل": station.location || "",
        "رابط خريطة جوجل": station.map_url || "",
        "الوجهة": route.destination || "",
        "الأجرة": route.fare || "",
        "نوع وسيلة المواصلات": route.vehicleType || "ميكروباص",
        "خط السير / عبر": route.via || "",
        "المدة الزمنية": route.duration || "",
        "نوع الموقف / الخط": route.type === "normal" ? "نقطة تحميل عادية" : "موقف رسمي",
        "ملاحظات": route.description || route.notes || ""
      });
    }
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet["!cols"] = [
    { wch: 6 },  // م
    { wch: 28 }, // اسم الموقف
    { wch: 14 }, // المحافظة
    { wch: 45 }, // العنوان بالتفصيل
    { wch: 30 }, // رابط خريطة جوجل
    { wch: 22 }, // الوجهة
    { wch: 16 }, // الأجرة
    { wch: 24 }, // نوع وسيلة المواصلات
    { wch: 28 }, // خط السير
    { wch: 16 }, // المدة
    { wch: 18 }, // نوع الموقف
    { wch: 35 }  // ملاحظات
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "جميع_مواقف_السرفيس_المسجلة");

  const fileName = `Microbus_Stations_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
