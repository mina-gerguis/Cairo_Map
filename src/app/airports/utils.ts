import { Airport, DEFAULT_AIRPORTS } from "@/data/airports";

/**
 * Normalizes Arabic text by unifying alef variations, taa marbuta,
 * yaa / alef maksura, and removing common diacritics.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u0652]/g, ""); // Remove Arabic tashkeel
}

/**
 * Safely retrieves local airports from localStorage with fallback to DEFAULT_AIRPORTS.
 */
export function getLocalAirports(): Airport[] {
  if (typeof window === "undefined") return DEFAULT_AIRPORTS;
  const local = localStorage.getItem("local_airports");
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_AIRPORTS;
    }
  }
  try {
    localStorage.setItem("local_airports", JSON.stringify(DEFAULT_AIRPORTS));
  } catch {
    // ignore quota errors
  }
  return DEFAULT_AIRPORTS;
}

/**
 * Enriches DB airport records with default fallback data and maps
 * disparate DB column names to the frontend Airport schema.
 */
export function enrichAirportData(dbAirport: any, localMatch?: Airport): Airport {
  return {
    ...localMatch,
    ...dbAirport,
    id: dbAirport.id || localMatch?.id || Math.random().toString(),
    name_ar: dbAirport.name || localMatch?.name_ar || "",
    name_en: dbAirport.name_en || localMatch?.name_en || "",
    iata_code: dbAirport.code || dbAirport.iata_code || localMatch?.iata_code || "",
    icao_code: dbAirport.icao_code || localMatch?.icao_code || "",
    city_ar: dbAirport.city || dbAirport.city_ar || localMatch?.city_ar || "",
    city_en: dbAirport.city_en || localMatch?.city_en || "",
    governorate_ar: dbAirport.governorate || dbAirport.governorate_ar || localMatch?.governorate_ar || "",
    governorate_en: dbAirport.governorate_en || localMatch?.governorate_en || "",
    area_ar: dbAirport.region || dbAirport.area_ar || localMatch?.area_ar || "",
    type: dbAirport.type || localMatch?.type || "",
    type_en: dbAirport.type_en || localMatch?.type_en || "",

    short_description: dbAirport.short_desc || dbAirport.short_description || localMatch?.short_description || "",
    description: dbAirport.detailed_desc || dbAirport.description || localMatch?.description || "",

    address: dbAirport.address || localMatch?.address || "",
    capacity: dbAirport.capacity || localMatch?.capacity || "",
    terminals_count: dbAirport.terminals_count || dbAirport.terminals || localMatch?.terminals_count || "غير محدد",
    runways_count: dbAirport.runways_count || localMatch?.runways_count || "",
    runways_length: dbAirport.runways_length || localMatch?.runways_length || "",

    domestic_flights: dbAirport.domestic_flights || localMatch?.domestic_flights || "",
    international_flights: dbAirport.international_flights || localMatch?.international_flights || "",

    services: Array.isArray(dbAirport.services) ? dbAirport.services : (localMatch?.services || []),
    airlines: dbAirport.airlines || localMatch?.airlines || "غير محدد",
    destinations: dbAirport.destinations || localMatch?.destinations || "",
    connections: Array.isArray(dbAirport.connections) ? dbAirport.connections : (localMatch?.connections || []),

    nearby_landmarks: Array.isArray(dbAirport.landmarks)
      ? dbAirport.landmarks
      : Array.isArray(dbAirport.nearby_landmarks)
      ? dbAirport.nearby_landmarks
      : localMatch?.nearby_landmarks || [],

    transportation: Array.isArray(dbAirport.transit)
      ? dbAirport.transit
      : Array.isArray(dbAirport.transportation)
      ? dbAirport.transportation
      : localMatch?.transportation || [],

    parking: dbAirport.parking || localMatch?.parking || "",
    official_website: dbAirport.official_website || localMatch?.official_website || "",
    phone: dbAirport.phone || localMatch?.phone || "غير متوفر",
    map_url: dbAirport.map_url || localMatch?.map_url || "",

    keywords_ar: Array.isArray(dbAirport.keywords_ar) ? dbAirport.keywords_ar : (localMatch?.keywords_ar || []),
    keywords_en: Array.isArray(dbAirport.keywords_en) ? dbAirport.keywords_en : (localMatch?.keywords_en || []),
    latitude: typeof dbAirport.latitude === "number" ? dbAirport.latitude : (localMatch?.latitude || 0),
    longitude: typeof dbAirport.longitude === "number" ? dbAirport.longitude : (localMatch?.longitude || 0),
    slug: dbAirport.slug || localMatch?.slug || "",
    status: dbAirport.status || localMatch?.status || "active"
  } as Airport;
}

/**
 * Filters a list of airports based on the user's search query across names,
 * codes, cities, governorates, areas, and keywords.
 */
export function filterAirports(airports: Airport[], query: string): Airport[] {
  if (!query.trim()) return airports;

  const normalizedQuery = normalizeArabic(query);
  const rawQueryLower = query.toLowerCase().trim();

  return airports.filter(airport => {
    const normNameAr = normalizeArabic(airport.name_ar || "");
    const normCityAr = normalizeArabic(airport.city_ar || "");
    const normGovAr = normalizeArabic(airport.governorate_ar || "");
    const normAreaAr = normalizeArabic(airport.area_ar || "");

    const rawNameEn = (airport.name_en || "").toLowerCase();
    const rawIata = (airport.iata_code || "").toLowerCase();
    const rawIcao = (airport.icao_code || "").toLowerCase();

    const matchesKeywordsAr = (airport.keywords_ar || []).some(k =>
      normalizeArabic(k).includes(normalizedQuery)
    );
    const matchesKeywordsEn = (airport.keywords_en || []).some(k =>
      k.toLowerCase().includes(rawQueryLower)
    );

    return (
      normNameAr.includes(normalizedQuery) ||
      normCityAr.includes(normalizedQuery) ||
      normGovAr.includes(normalizedQuery) ||
      normAreaAr.includes(normalizedQuery) ||
      rawNameEn.includes(rawQueryLower) ||
      rawIata.includes(rawQueryLower) ||
      rawIcao.includes(rawQueryLower) ||
      matchesKeywordsAr ||
      matchesKeywordsEn
    );
  });
}
