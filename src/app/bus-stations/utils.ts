import { BusStation } from "./types";

/**
 * Normalizes Arabic text for flexible and accent-agnostic searching.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "") // remove kashida
    .trim()
    .toLowerCase();
}

/**
 * Filters bus stations based on a user search query matching name, location,
 * description, or destinations.
 */
export function filterBusStations(stations: BusStation[], query: string): BusStation[] {
  const normQuery = normalizeArabic(query.trim());
  if (!normQuery) return stations;

  return stations.filter((station) => {
    const nameMatch = normalizeArabic(station.name).includes(normQuery);
    const locationMatch = normalizeArabic(station.location).includes(normQuery);
    const descriptionMatch = normalizeArabic(station.description).includes(normQuery);
    const destinationMatch = station.destinations?.some((dest) =>
      normalizeArabic(dest).includes(normQuery)
    );

    return nameMatch || locationMatch || descriptionMatch || destinationMatch;
  });
}

/**
 * Formats report message content for insertion into app_feedback.
 */
export function formatReportContent(
  stationName: string,
  typeLabel: string,
  details: string
): string {
  return `بلاغ عن خطأ في بيانات موقف الأتوبيسات:
🏢 اسم الموقف: ${stationName || "موقف غير محدد"}
⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة / التصحيح المقترح:
${details.trim()}`;
}
