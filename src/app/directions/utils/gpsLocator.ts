import { METRO_STATION_COORDINATES } from "@/app/metro/constants";
import { getDistanceInKm } from "@/app/metro/utils";

// Comprehensive transit hubs & key Egyptian city centers with exact coordinates
export const TRANSIT_HUBS_COORDINATES: Record<string, { lat: number; lng: number; defaultName: string; aliases?: string }> = {
  // Greater Cairo Key Departures & Stations
  "القاهرة (رمسيس)": { lat: 30.0614, lng: 31.2464, defaultName: "القاهرة (رمسيس)", aliases: "رمسيس, محطة مصر, ميدان رمسيس, الشهداء" },
  "القاهرة (التحرير)": { lat: 30.0444, lng: 31.2357, defaultName: "القاهرة (التحرير)", aliases: "التحرير, وسط البلد, ميدان التحرير, السادات" },
  "الجيزة": { lat: 30.0105, lng: 31.2069, defaultName: "الجيزة", aliases: "ميدان الجيزة, محطة الجيزة" },
  "الدقي": { lat: 30.0384, lng: 31.2124, defaultName: "الدقي", aliases: "ميدان الدقي, شارع التحرير, المساحة" },
  "المهندسين": { lat: 30.0540, lng: 31.2010, defaultName: "المهندسين", aliases: "ميدان لبنان, جامعة الدول العربية" },
  "القاهرة (المعادي)": { lat: 29.9582, lng: 31.2584, defaultName: "القاهرة (المعادي)", aliases: "المعادي, دجلة, ثكنات المعادي" },
  "مدينة نصر": { lat: 30.0561, lng: 31.3413, defaultName: "مدينة نصر", aliases: "عباس العقاد, مكرم عبيد, سيتي ستارز" },
  "مصر الجديدة": { lat: 30.0920, lng: 31.3250, defaultName: "مصر الجديدة", aliases: "روكسي, الكوربة, الأهرام" },
  "التجمع الخامس (شارع التسعين)": { lat: 30.0270, lng: 31.4390, defaultName: "التجمع الخامس (شارع التسعين)", aliases: "التجمع, شارع التسعين, القاهرة الجديدة" },
  "مدينة 6 أكتوبر (ميدان الحصري)": { lat: 29.9737, lng: 30.9525, defaultName: "مدينة 6 أكتوبر (ميدان الحصري)", aliases: "6 أكتوبر, الحصري, ميدان الحصري" },
  "مدينة الشيخ زايد": { lat: 30.0450, lng: 31.0050, defaultName: "مدينة الشيخ زايد", aliases: "الشيخ زايد, هايبر وان, أركان" },
  "شبرا": { lat: 30.0805, lng: 31.2456, defaultName: "شبرا", aliases: "دوران شبرا, روض الفرج" },
  "العباسية": { lat: 30.0680, lng: 31.2820, defaultName: "العباسية", aliases: "ميدان العباسية, جامعة عين شمس" },
  "جامعة حلوان (عين حلوان)": { lat: 29.8705, lng: 31.3204, defaultName: "جامعة حلوان (عين حلوان)", aliases: "حلوان, عين حلوان" },
  "محطة عدلي منصور المركزية التبادلية": { lat: 30.1472, lng: 31.4012, defaultName: "محطة عدلي منصور المركزية التبادلية", aliases: "عدلي منصور, موقف السلام" },
  "موقف عبود": { lat: 30.1039, lng: 31.2580, defaultName: "موقف عبود", aliases: "عبود, موقف عبود الإقليمي" },
  "محطة قطارات صعيد مصر (بشتيل)": { lat: 30.0730, lng: 31.2010, defaultName: "محطة قطارات صعيد مصر (بشتيل)", aliases: "بشتيل, محطة بشتيل" },
  "موقف المنيب الإقليمي لمحافظات الصعيد بالجيزة": { lat: 29.9812, lng: 31.2121, defaultName: "موقف المنيب الإقليمي لمحافظات الصعيد بالجيزة", aliases: "المنيب, موقف المنيب" },
  "موقف الترجمان الدولي للحافلات وسوبر جيت": { lat: 30.0570, lng: 31.2350, defaultName: "موقف الترجمان الدولي للحافلات وسوبر جيت", aliases: "الترجمان" },
  "العاصمة الإدارية الجديدة": { lat: 30.0100, lng: 31.7000, defaultName: "العاصمة الإدارية الجديدة", aliases: "العاصمة الادارية, البرج الايقوني" },
  "مدينة الشروق": { lat: 30.1400, lng: 31.6200, defaultName: "مدينة الشروق", aliases: "الشروق, الجامعة البريطانية" },
  "مدينة العبور": { lat: 30.2200, lng: 31.4700, defaultName: "مدينة العبور", aliases: "العبور, سوق العبور" },
  "مدينة بدر": { lat: 30.1300, lng: 31.7400, defaultName: "مدينة بدر", aliases: "بدر" },
  "مدينتي": { lat: 30.1050, lng: 31.6250, defaultName: "مدينتي", aliases: "مدينتي" },
  "مدينة الرحاب": { lat: 30.0600, lng: 31.4900, defaultName: "مدينة الرحاب", aliases: "الرحاب" },
  "العاشر من رمضان": { lat: 30.3000, lng: 31.7400, defaultName: "العاشر من رمضان", aliases: "العاشر, موقف العاشر" },
  "حدائق الأهرام (البوابات)": { lat: 29.9700, lng: 31.1100, defaultName: "حدائق الأهرام (البوابات)", aliases: "حدائق الاهرام, البوابات" },

  // Governorates & Major Regional Hubs
  "الإسكندرية (محطة سيدي جابر ومصر)": { lat: 31.2001, lng: 29.9187, defaultName: "الإسكندرية (محطة سيدي جابر ومصر)", aliases: "الإسكندرية, اسكندرية, سيدي جابر, محطة مصر الإسكندرية" },
  "الزقازيق": { lat: 30.5877, lng: 31.5020, defaultName: "الزقازيق", aliases: "موقف الأحرار, جامعة الزقازيق" },
  "المنصورة": { lat: 31.0500, lng: 31.3800, defaultName: "المنصورة", aliases: "موقف المنصورة, طلخا" },
  "طنطا (محافظة الغربية والبدوي)": { lat: 30.7950, lng: 31.0000, defaultName: "طنطا (محافظة الغربية والبدوي)", aliases: "طنطا, موقف طنطا" },
  "محافظة الإسماعيلية (عروس القناة)": { lat: 30.6000, lng: 32.2700, defaultName: "محافظة الإسماعيلية (عروس القناة)", aliases: "الإسماعيلية, الاسماعيلية" },
  "محافظة السويس (بورتوفيق وبور إبراهيم)": { lat: 29.9700, lng: 32.5500, defaultName: "محافظة السويس (بورتوفيق وبور إبراهيم)", aliases: "السويس, بورتوفيق" },
  "بورسعيد (المدينة الباسلة وبورفؤاد)": { lat: 31.2600, lng: 32.3000, defaultName: "بورسعيد (المدينة الباسلة وبورفؤاد)", aliases: "بورسعيد, بورفؤاد" },
  "محافظة الفيوم (وادي الريان وبحيرة قارون)": { lat: 29.3100, lng: 30.8400, defaultName: "محافظة الفيوم (وادي الريان وبحيرة قارون)", aliases: "الفيوم" },
};

export interface NearestMetroInfo {
  station: string;
  distanceKm: number;
  distanceMeters: number;
}

export interface NearestHubInfo {
  name: string;
  defaultName: string;
  distanceKm: number;
}

export interface PreciseLocationResult {
  formattedInput: string;
  district: string;
  city?: string;
  nearestMetro?: NearestMetroInfo;
  nearestHub: NearestHubInfo;
  accuracyMeters: number;
  badgeText: string;
  coords: { lat: number; lng: number };
}

/**
 * Finds the closest Cairo Metro station to the given coordinates
 */
export function findNearestMetroStation(lat: number, lng: number): NearestMetroInfo | null {
  if (!METRO_STATION_COORDINATES) return null;

  let closest: string | null = null;
  let minDist = Infinity;

  for (const [station, coords] of Object.entries(METRO_STATION_COORDINATES)) {
    const dist = getDistanceInKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDist) {
      minDist = dist;
      closest = station;
    }
  }

  if (!closest) return null;

  return {
    station: closest,
    distanceKm: minDist,
    distanceMeters: Math.round(minDist * 1000),
  };
}

/**
 * Finds the closest transit hub or departure point to the given coordinates
 */
export function findNearestTransitHub(lat: number, lng: number): NearestHubInfo {
  let closestKey = "القاهرة (رمسيس)";
  let minDist = Infinity;

  for (const [hubKey, data] of Object.entries(TRANSIT_HUBS_COORDINATES)) {
    const dist = getDistanceInKm(lat, lng, data.lat, data.lng);
    if (dist < minDist) {
      minDist = dist;
      closestKey = hubKey;
    }
  }

  return {
    name: closestKey,
    defaultName: TRANSIT_HUBS_COORDINATES[closestKey]?.defaultName || closestKey,
    distanceKm: minDist,
  };
}

/**
 * Fetches the Arabic locality / neighborhood name using reverse geocoding
 */
async function fetchReverseGeocode(lat: number, lng: number): Promise<{ locality?: string; city?: string; state?: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    // 1. Try BigDataCloud (fast, lightweight, highly accurate for Egyptian localities)
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || data.district || data.suburb;
      const city = data.city || data.principalSubdivision;
      if (locality || city) {
        return {
          locality: locality || undefined,
          city: city || undefined,
          state: data.principalSubdivision || undefined,
        };
      }
    }
  } catch {
    // Silently fall through to secondary Nominatim lookup
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const nomController = new AbortController();
    const nomTimeout = setTimeout(() => nomController.abort(), 3500);

    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`,
      { signal: nomController.signal, headers: { "User-Agent": "CairoMapDirections/2.0" } }
    );
    clearTimeout(nomTimeout);

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.village;
      const city = addr.city || addr.town || addr.county || addr.state;
      if (locality || city) {
        return {
          locality: locality || undefined,
          city: city || undefined,
          state: addr.state || undefined,
        };
      }
    }
  } catch {
    // Fallback to geometric hubs if network requests fail
  }

  return null;
}

/**
 * High-precision GPS resolver:
 * Combines browser hardware coordinates, reverse-geocoding, nearest metro station,
 * and nearest transit hubs into a single accurate location identity.
 */
export async function resolvePreciseLocation(
  lat: number,
  lng: number,
  accuracyMeters: number
): Promise<PreciseLocationResult> {
  // 1. Nearest metro station (< 3km considered close)
  const nearestMetro = findNearestMetroStation(lat, lng);
  const isNearMetro = nearestMetro && nearestMetro.distanceKm <= 2.5;

  // 2. Nearest transit hub
  const nearestHub = findNearestTransitHub(lat, lng);

  // 3. Online Reverse Geocode
  const geoResult = await fetchReverseGeocode(lat, lng);

  // Clean district name
  let district = geoResult?.locality || "";
  let city = geoResult?.city || "";

  // Normalize common administrative prefixes if returned (e.g. "قسم أول شبرا" -> "شبرا")
  if (district) {
    district = district
      .replace(/^قسم\s+(أول|ثاني|ثالث|رابع|\d+)?\s*/g, "")
      .replace(/^مركز\s+/g, "")
      .replace(/^حي\s+/g, "")
      .trim();
  }

  // If no reverse geocode locality found, fallback to closest hub
  if (!district) {
    district = nearestHub.name;
  }

  // Choose the best matching input representation for "fromInput"
  let formattedInput = district;

  // If the user is within 1.2 km of a known transit hub, match that transit hub directly
  if (nearestHub.distanceKm <= 1.2) {
    formattedInput = nearestHub.defaultName;
  } else if (isNearMetro && nearestMetro && nearestMetro.distanceKm <= 0.6) {
    // If literally next to a metro station (within 600m), format as District / Metro Station
    formattedInput = district || nearestMetro.station;
  } else if (district) {
    formattedInput = district;
  } else {
    formattedInput = nearestHub.defaultName;
  }

  // Construct readable, informative status badge text
  let badgeText = `📍 ${district || formattedInput}`;
  if (city && city !== district && !district.includes(city)) {
    badgeText += `، ${city}`;
  }

  if (isNearMetro && nearestMetro) {
    badgeText += ` (محطة مترو ${nearestMetro.station} • ${nearestMetro.distanceMeters}م)`;
  } else if (nearestHub.distanceKm <= 2.5) {
    badgeText += ` (بالقرب من ${nearestHub.defaultName})`;
  }

  badgeText += ` • دقة GPS: ±${Math.round(accuracyMeters)}م`;

  return {
    formattedInput,
    district,
    city,
    nearestMetro: isNearMetro && nearestMetro ? nearestMetro : undefined,
    nearestHub,
    accuracyMeters: Math.round(accuracyMeters),
    badgeText,
    coords: { lat, lng }
  };
}
