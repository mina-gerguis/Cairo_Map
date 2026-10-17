import * as XLSX from "xlsx";
import { AdminBrtStation, AdminBrtRoute, ParsedExcelBrtStation } from "../types";

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

  if (typeof val === "object") {
    const target = val?.l?.Target || val?.Target || val?.url || val?.link || val?.href;
    if (target) return String(target).trim();
  }

  const str = String(val).trim();
  if (!str) return "";

  const formulaMatch = str.match(/HYPERLINK\(\s*["']([^"']+)["']/i);
  if (formulaMatch && formulaMatch[1]) {
    return formulaMatch[1].trim();
  }

  const urlMatch = str.match(/(https?:\/\/[^\s"'<>]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].trim();
  }

  if (str.startsWith("www.") || str.startsWith("maps.") || str.startsWith("goo.gl/")) {
    return `https://${str}`;
  }

  return str;
}

/**
 * Parses an uploaded Excel / CSV file into normalized BRT Stations and Routes.
 */
export async function parseBrtExcelFile(file: File): Promise<ParsedExcelBrtStation[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  const stationMap = new Map<string, {
    name: string;
    location: string;
    governorate: string;
    sector: "شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة";
    type: string;
    status: string;
    map_url: string;
    landmarks: string[];
    routes: AdminBrtRoute[];
    errors: string[];
  }>();

  let lastStationName = "";

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];

    const rowNormalizedMap = new Map<string, any>();
    for (const [key, val] of Object.entries(row)) {
      rowNormalizedMap.set(normalizeHeaderKey(key), val);
    }

    const getVal = (...aliases: string[]): string => {
      for (const a of aliases) {
        if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== "") {
          return String(row[a]).trim();
        }
      }
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

    const getMapLinkVal = (): string => {
      const mapAliases = [
        "map_url", "map_link", "mapurl", "maplink", "google_maps_url", "googlemapsurl",
        "map", "maps", "url", "link", "رابط خريطة Google", "رابط خريطة جوجل",
        "خريطة جوجل", "رابط الخريطة", "الخريطة", "رابط اللوكيشن", "الموقع على الخريطة"
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

    let stationName = getVal("name", "اسم المحطة", "المحطة", "اسم محطة BRT", "اسم المحطة الترددي", "station_name", "station");
    const governorate = getVal("governorate", "المحافظة", "المحافظه", "محافظة", "محافظه", "city") || "القاهرة";
    const rawSector = getVal("sector", "القطاع", "قطاع المحطة", "نطاق المحطة", "المنطقة");
    const location = getVal("location", "العنوان", "العنوان بالتفصيل", "المكان", "الموقع", "موقع المحطة", "address");
    const stationType = getVal("type", "نوع المحطة", "تصنيف المحطة", "station_type") || "محطة سطحية قياسية";
    const status = getVal("status", "حالة التشغيل", "الحالة", "حالة المحطة") || "تشغيل تجريبي";
    const landmarksStr = getVal("landmarks", "أهم المعالم", "المعالم القريبة", "معالم مجاورة", "landmarks_text");
    const mapUrl = getMapLinkVal();

    // Route fields
    const destination = getVal("destination", "الوجهة", "الوجهه", "المسار", "إلى", "الى", "to", "route");
    const fare = getVal("fare", "الأجرة", "سعر التذكرة", "التذكرة", "سعر التذكره", "الأجرة (ج.م)", "cost", "price");
    const vehicleType = getVal("vehicleType", "vehicletype", "vehicle_type", "نوع الأتوبيس", "نوع الوسيلة", "النوع") || "أتوبيس ترددي كهربائي سريع";
    const via = getVal("via", "خط السير", "المحطات البينية", "عبر", "خط السير / عبر", "line", "route_via");
    const duration = getVal("duration", "المدة", "زمن الرحلة", "المدة الزمنية (بالدقائق)", "الوقت", "time");
    const notes = getVal("notes", "description", "ملاحظات", "الوصف", "وصف");
    const multiRoutesText = getVal("routes", "خطوط السير", "المسارات", "قائمة الخطوط");

    if (!stationName && !destination && !location && !governorate && !multiRoutesText) {
      continue;
    }

    if (!stationName && lastStationName) {
      stationName = lastStationName;
    } else if (stationName) {
      lastStationName = stationName;
    }

    if (!stationName) {
      stationName = "محطة ترددية غير مسماة";
    }

    // Determine clean sector
    let sector: "شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة" = "شرق القاهرة";
    if (rawSector.includes("جنوب")) sector = "جنوب القاهرة";
    else if (rawSector.includes("غرب") || rawSector.includes("أكتوبر") || rawSector.includes("زايد")) sector = "غرب القاهرة";
    else if (rawSector.includes("شمال") || rawSector.includes("شبرا") || rawSector.includes("المرج")) sector = "شمال القاهرة";
    else if (rawSector.includes("شرق") || rawSector.includes("نصر") || rawSector.includes("التجمع")) sector = "شرق القاهرة";

    const stationKey = stationName.trim().toLowerCase();

    if (!stationMap.has(stationKey)) {
      const landmarks = landmarksStr ? landmarksStr.split(/[\،,\|\n]+/).map(s => s.trim()).filter(Boolean) : [];
      stationMap.set(stationKey, {
        name: stationName.trim(),
        location: location || "",
        governorate: governorate || "القاهرة",
        sector: sector,
        type: stationType,
        status: status,
        map_url: mapUrl || `https://maps.google.com/?q=${encodeURIComponent(stationName.trim())}`,
        landmarks: landmarks,
        routes: [],
        errors: []
      });
    }

    const currentStation = stationMap.get(stationKey)!;

    if (location && !currentStation.location) currentStation.location = location;
    if (governorate && (!currentStation.governorate || currentStation.governorate === "القاهرة")) currentStation.governorate = governorate;
    if (rawSector && currentStation.sector === "شرق القاهرة") currentStation.sector = sector;
    if (stationType && currentStation.type === "محطة سطحية قياسية") currentStation.type = stationType;
    if (status && currentStation.status === "تشغيل تجريبي") currentStation.status = status;
    if (mapUrl && !currentStation.map_url.includes("google.com/maps/search")) currentStation.map_url = mapUrl;

    if (landmarksStr && currentStation.landmarks.length === 0) {
      currentStation.landmarks = landmarksStr.split(/[\،,\|\n]+/).map(s => s.trim()).filter(Boolean);
    }

    if (destination || fare) {
      currentStation.routes.push({
        destination: destination || "وجهة غير محددة",
        fare: fare ? fare.trim() : "10",
        vehicleType: vehicleType,
        via: via || undefined,
        duration: duration || undefined,
        notes: notes || undefined
      });
    }

    if (multiRoutesText) {
      const parts = multiRoutesText.split(/\||\n/).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        const destMatch = part.match(/^([^(\[-]+)/);
        const partDest = destMatch ? destMatch[1].trim() : part;

        const fareMatch = part.match(/(\d+(?:-\d+)?(?:\s*(?:ج\.م|جنيه|جنية|EGP|LE))?)/i);
        const partFare = fareMatch ? fareMatch[1].trim() : "10";

        const viaMatch = part.match(/(?:عبر|طريق)\s+([^)\],]+)/i);
        const partVia = viaMatch ? viaMatch[1].trim() : undefined;

        currentStation.routes.push({
          destination: partDest || "وجهة غير محددة",
          fare: partFare,
          vehicleType: vehicleType,
          via: partVia
        });
      }
    }
  }

  const result: ParsedExcelBrtStation[] = [];

  for (const [, station] of stationMap.entries()) {
    const errors: string[] = [];

    if (!station.name || station.name === "محطة ترددية غير مسماة") {
      errors.push("اسم المحطة مفقود");
    }
    if (!station.location) {
      errors.push("موقع وعنوان المحطة مفقود");
    }
    if (!station.routes || station.routes.length === 0) {
      errors.push("لا توجد مسارات محددة للمحطة");
    }

    result.push({
      name: station.name,
      location: station.location || "الطريق الدائري",
      governorate: station.governorate || "القاهرة",
      sector: station.sector,
      type: station.type || "محطة سطحية قياسية",
      status: station.status || "تشغيل تجريبي",
      map_url: station.map_url || "",
      landmarks: station.landmarks,
      routes: station.routes.length > 0 ? station.routes : [
        {
          destination: "محطة مجاورة",
          fare: "10",
          vehicleType: "أتوبيس ترددي كهربائي سريع"
        }
      ],
      isValid: errors.length === 0,
      validationError: errors.join(" - ")
    });
  }

  return result;
}

/**
 * Generates and triggers download of a standardized Excel template for BRT Stations.
 */
export function generateBrtExcelTemplate() {
  const sampleData = [
    {
      "اسم المحطة": "محطة عدلي منصور التبادلية (BRT)",
      "القطاع": "شرق القاهرة",
      "المحافظة": "القاهرة",
      "العنوان بالتفصيل": "شرق القاهرة - تقاطع الطريق الدائري مع طريق مصر الإسماعيلية ومحور الفريق الشاذلي",
      "نوع المحطة": "تبادلية كبرى (مترو 3 + LRT + سوبرجيت)",
      "حالة التشغيل": "تشغيل تجريبي",
      "أهم المعالم": "مترو الخط الثالث، القطار الكهربائي LRT، محطة السوبرجيت",
      "رابط خريطة جوجل": "https://maps.google.com/?q=Adly+Mansour+Central+Station",
      "الوجهة": "كايرو فستيفال سيتي",
      "سعر التذكرة": "15",
      "نوع الأتوبيس": "أتوبيس ترددي كهربائي سريع",
      "المحطات البينية / عبر": "طريق السويس - أكاديمية الشرطة",
      "المدة الزمنية (بالدقائق)": "18",
      "ملاحظات": "التقاطر كل 3 دقائق في أوقات الذروة"
    },
    {
      "اسم المحطة": "محطة عدلي منصور التبادلية (BRT)",
      "القطاع": "شرق القاهرة",
      "المحافظة": "القاهرة",
      "العنوان بالتفصيل": "شرق القاهرة - تقاطع الطريق الدائري مع طريق مصر الإسماعيلية ومحور الفريق الشاذلي",
      "نوع المحطة": "تبادلية كبرى (مترو 3 + LRT + سوبرجيت)",
      "حالة التشغيل": "تشغيل تجريبي",
      "أهم المعالم": "مترو الخط الثالث، القطار الكهربائي LRT، محطة السوبرجيت",
      "رابط خريطة جوجل": "https://maps.google.com/?q=Adly+Mansour+Central+Station",
      "الوجهة": "المنيب (الخط الثاني للمترو)",
      "سعر التذكرة": "25",
      "نوع الأتوبيس": "أتوبيس ترددي كهربائي سريع",
      "المحطات البينية / عبر": "كارفور المعادي - الأوتوستراد - كوبري المنيب",
      "المدة الزمنية (بالدقائق)": "50",
      "ملاحظات": "خط دائري كامل"
    },
    {
      "اسم المحطة": "محطة كايرو فستيفال سيتي (CFC)",
      "القطاع": "شرق القاهرة",
      "المحافظة": "القاهرة",
      "العنوان بالتفصيل": "القاهرة الجديدة - الدائري تقاطع شارع التسعين الجنوبي والداون تاون",
      "نوع المحطة": "محطة رئيسية للمراكز التجارية والأعمال",
      "حالة التشغيل": "تشغيل تجريبي",
      "أهم المعالم": "كايرو فستيفال سيتي مول، إيكيا مصر، الداون تاون",
      "رابط خريطة جوجل": "https://maps.google.com/?q=Cairo+Festival+City+Mall",
      "الوجهة": "المشير طنطاوي",
      "سعر التذكرة": "10",
      "نوع الأتوبيس": "أتوبيس ترددي كهربائي سريع",
      "المحطات البينية / عبر": "التسعين الشمالي - محور المشير",
      "المدة الزمنية (بالدقائق)": "6",
      "ملاحظات": "أمام بوابات المول مباشرة"
    },
    {
      "اسم المحطة": "محطة المنيب التبادلية (BRT)",
      "القطاع": "جنوب القاهرة",
      "المحافظة": "الجيزة",
      "العنوان بالتفصيل": "جنوب الجيزة - مطلع كوبري المنيب وتقاطع الدائري مع البحر الأعظم",
      "نوع المحطة": "تبادلية مع الخط الثاني لمترو الأنفاق 🚇",
      "حالة التشغيل": "تشغيل تجريبي",
      "أهم المعالم": "مترو المنيب، موقف المنيب الإقليمي، كورنيش النيل",
      "رابط خريطة جوجل": "https://maps.google.com/?q=El+Moneeb+Metro+Station",
      "الوجهة": "محور 26 يوليو (أكتوبر)",
      "سعر التذكرة": "15",
      "نوع الأتوبيس": "أتوبيس ترددي كهربائي سريع",
      "المحطات البينية / عبر": "المريوطية - اللبيني - صفط اللبن",
      "المدة الزمنية (بالدقائق)": "22",
      "ملاحظات": "ربط مباشر بين غرب وجنوب القاهرة"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  worksheet["!cols"] = [
    { wch: 30 }, // اسم المحطة
    { wch: 16 }, // القطاع
    { wch: 14 }, // المحافظة
    { wch: 45 }, // العنوان بالتفصيل
    { wch: 32 }, // نوع المحطة
    { wch: 18 }, // حالة التشغيل
    { wch: 35 }, // أهم المعالم
    { wch: 30 }, // رابط خريطة جوجل
    { wch: 22 }, // الوجهة
    { wch: 14 }, // سعر التذكرة
    { wch: 26 }, // نوع الأتوبيس
    { wch: 32 }, // المحطات البينية / عبر
    { wch: 22 }, // المدة
    { wch: 32 }  // ملاحظات
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج_محطات_الأتوبيس_الترددي");

  XLSX.writeFile(workbook, "BRT_Stations_Template.xlsx");
}

/**
 * Exports existing database BRT stations and routes to a downloadable Excel file.
 */
export function exportBrtStationsToExcel(stations: AdminBrtStation[]) {
  const exportData: Record<string, any>[] = [];
  let rowIdx = 1;

  for (const station of stations) {
    const routes = Array.isArray(station.routes) && station.routes.length > 0
      ? station.routes
      : [
          {
            destination: "غير محدد",
            fare: "10",
            vehicleType: "أتوبيس ترددي كهربائي سريع"
          } as AdminBrtRoute
        ];

    const landmarksText = Array.isArray(station.landmarks) ? station.landmarks.join("، ") : "";

    for (const route of routes) {
      exportData.push({
        "م": rowIdx++,
        "اسم المحطة": station.name || "",
        "القطاع": station.sector || "شرق القاهرة",
        "المحافظة": station.governorate || "القاهرة",
        "العنوان بالتفصيل": station.location || "",
        "نوع المحطة": station.type || "",
        "حالة التشغيل": station.status || "تشغيل تجريبي",
        "أهم المعالم": landmarksText,
        "رابط خريطة جوجل": station.map_url || "",
        "الوجهة": route.destination || "",
        "سعر التذكرة (ج.م)": route.fare || "",
        "نوع الأتوبيس": route.vehicleType || "أتوبيس ترددي كهربائي سريع",
        "المحطات البينية / عبر": route.via || "",
        "المدة الزمنية (بالدقائق)": route.duration || "",
        "ملاحظات": route.notes || route.description || ""
      });
    }
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet["!cols"] = [
    { wch: 6 },  // م
    { wch: 30 }, // اسم المحطة
    { wch: 16 }, // القطاع
    { wch: 14 }, // المحافظة
    { wch: 45 }, // العنوان بالتفصيل
    { wch: 32 }, // نوع المحطة
    { wch: 18 }, // حالة التشغيل
    { wch: 35 }, // أهم المعالم
    { wch: 30 }, // رابط خريطة جوجل
    { wch: 22 }, // الوجهة
    { wch: 16 }, // سعر التذكرة
    { wch: 26 }, // نوع الأتوبيس
    { wch: 32 }, // المحطات البينية / عبر
    { wch: 22 }, // المدة
    { wch: 32 }  // ملاحظات
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "محطات_الأتوبيس_الترددي");

  const fileName = `BRT_Stations_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
