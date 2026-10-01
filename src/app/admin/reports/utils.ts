import { UnifiedReport, CategoryFilterType } from "./types";
import { PROBLEM_TYPE_LABELS } from "./constants";

/**
 * Determine the specific category/section for a given report
 */
export function getItemSection(item: UnifiedReport): CategoryFilterType {
  const cat = (item.category || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const content = (item.content || "").toLowerCase();

  // 1. BRT (Check first so BRT reports from route_interactions or app_feedback are categorized into BRT)
  if (
    cat.includes("ترددي") ||
    cat.includes("brt") ||
    title.includes("ترددي") ||
    title.includes("brt") ||
    content.includes("ترددي") ||
    content.includes("brt") ||
    content.includes("الأتوبيس الترددي") ||
    content.includes("الاتوبيس الترددي")
  ) {
    return "brt";
  }

  // 2. Bus Stations (مواقف وهيئات الأتوبيس)
  if (
    cat.includes("مواقف الأتوبيس") ||
    cat.includes("موقف أتوبيس") ||
    cat.includes("مواقف الاتوبيس") ||
    cat.includes("موقف اتوبيس") ||
    cat.includes("bus_stations") ||
    cat.includes("bus-stations") ||
    cat.includes("أتوبيسات") ||
    cat.includes("اتوبيسات") ||
    title.includes("مواقف الأتوبيس") ||
    title.includes("موقف أتوبيس") ||
    title.includes("مواقف الاتوبيس") ||
    title.includes("موقف اتوبيس") ||
    title.includes("أتوبيسات") ||
    title.includes("اتوبيسات") ||
    content.includes("مواقف الأتوبيس") ||
    content.includes("مواقف الاتوبيس") ||
    content.includes("موقف الأتوبيس") ||
    content.includes("موقف الاتوبيس") ||
    content.includes("دليل مواقف الأتوبيسات") ||
    content.includes("دليل مواقف الاتوبيسات")
  ) {
    return "bus_stations";
  }

  if (item.source === "place") return "places";
  if (item.source === "contact") return "contacts";
  if (item.source === "microbus") return "microbus";

  // 3. Parking
  if (
    cat.includes("باركينج") ||
    cat.includes("جراج") ||
    cat.includes("parking") ||
    title.includes("باركينج") ||
    title.includes("جراج") ||
    title.includes("parking") ||
    content.includes("باركينج") ||
    content.includes("جراج")
  ) {
    return "parking";
  }

  // 2. Monorail
  if (cat.includes("مونوريل") || title.includes("مونوريل") || content.includes("مونوريل")) {
    return "monorail";
  }

  // 3. LRT
  if (
    cat.includes("lrt") ||
    cat.includes("القطار الكهربائي") ||
    cat.includes("القطار الكهربي") ||
    title.includes("lrt") ||
    title.includes("القطار الكهربائي") ||
    content.includes("lrt")
  ) {
    return "lrt";
  }

  // 4. Railways
  if (
    cat.includes("سكك حديد") ||
    cat.includes("سكة حديد") ||
    cat.includes("railway") ||
    cat.includes("قطارات") ||
    cat.includes("تالجو") ||
    title.includes("سكك حديد") ||
    title.includes("قطار") ||
    title.includes("تالجو") ||
    content.includes("سكك حديد") ||
    content.includes("قطار")
  ) {
    return "railways";
  }

  // 5. Airports
  if (
    cat.includes("مطار") ||
    cat.includes("مطارات") ||
    cat.includes("airport") ||
    title.includes("مطار") ||
    title.includes("المطارات") ||
    title.includes("airport") ||
    content.includes("دليل المطارات") ||
    content.includes("المطار:") ||
    content.includes("اسم المطار")
  ) {
    return "airports";
  }

  // 6. Ports
  if (
    cat.includes("ميناء") ||
    cat.includes("موانئ") ||
    cat.includes("مواني") ||
    cat.includes("port") ||
    title.includes("ميناء") ||
    title.includes("الموانئ") ||
    title.includes("المواني") ||
    title.includes("port") ||
    content.includes("دليل الموانئ") ||
    content.includes("دليل المواني") ||
    content.includes("الميناء:") ||
    content.includes("اسم الميناء")
  ) {
    return "ports";
  }

  // 7. Metro
  if (cat.includes("مترو") || title.includes("مترو") || content.includes("مترو")) {
    return "metro";
  }

  // 8. Phone Directory & Codes
  if (
    cat.includes("دليل الهاتف") ||
    cat.includes("دليل الأرقام") ||
    cat.includes("هاتف") ||
    cat.includes("كود") ||
    title.includes("دليل الهاتف") ||
    title.includes("إضافة رقم") ||
    title.includes("كود") ||
    content.includes("دليل الهاتف")
  ) {
    return "directory";
  }

  // 7. Routes
  if (
    cat.includes("مواصلات") ||
    cat.includes("طريق") ||
    title.includes("طريق") ||
    cat.includes("موقف") ||
    cat.includes("سرفيس")
  ) {
    return "routes";
  }

  // 8. Bugs
  if (item.feedback_type === "bug" || cat.includes("خطأ") || cat.includes("مشكلة") || title.includes("خطأ")) {
    return "bugs";
  }

  return "suggestions";
}

/**
 * Return human-readable label for a place report problem type
 */
export function getPlaceProblemLabel(type: string, details?: any): string {
  if ((type === "other" || details?.isMultiReport) && details?.selectedIssues && details.selectedIssues.length > 0) {
    return `بلاغ متعدد (${details.selectedIssues.length} مشاكل) 📝`;
  }
  return PROBLEM_TYPE_LABELS[type] || PROBLEM_TYPE_LABELS.other;
}
