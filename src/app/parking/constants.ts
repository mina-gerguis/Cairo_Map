import { ParkingSpot } from "./types";

export const POPULAR_PARKING_AREAS = [
  "وسط البلد",
  "التحرير",
  "مصر الجديدة",
  "مدينة نصر",
  "الدقي",
  "المعادي",
  "المهندسين",
  "التجمع الخامس",
];

export const PARKING_AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "وسط البلد": { lat: 30.0444, lng: 31.2357 },
  "التحرير": { lat: 30.0444, lng: 31.2357 },
  "مصر الجديدة": { lat: 30.0906, lng: 31.3255 },
  "مدينة نصر": { lat: 30.0612, lng: 31.3325 },
  "الدقي": { lat: 30.0385, lng: 31.2125 },
  "المهندسين": { lat: 30.0575, lng: 31.2015 },
  "المعادي": { lat: 29.9602, lng: 31.2568 },
  "التجمع الخامس": { lat: 30.0074, lng: 31.4312 },
  "العتبة": { lat: 30.0525, lng: 31.2472 },
  "شبرا": { lat: 30.0825, lng: 31.2455 },
  "الجيزة": { lat: 30.0105, lng: 31.2065 },
  "الزمالك": { lat: 30.0615, lng: 31.2215 },
  "روكسي": { lat: 30.0935, lng: 31.3185 },
};

export const DEFAULT_PARKING: ParkingSpot[] = [];

export const GARAGE_TYPE_BADGES = [
  { label: "مغطى ومتعدد الطوابق", color: "#818cf8" },
  { label: "جراج ذكي إلكتروني", color: "#10b981" },
  { label: "جراج سطحي مفتوح", color: "#f59e0b" },
];

export const PARKING_PALETTE = [
  { color: "#3b82f6", glow: "rgba(59, 130, 246, 0.35)", icon: "bx bx-parking" },
  { color: "#10b981", glow: "rgba(16, 185, 129, 0.35)", icon: "bx bx-map-pin" },
  { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.35)", icon: "bx bx-car" },
  { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.35)", icon: "bx bx-building" },
  { color: "#ec4899", glow: "rgba(236, 72, 153, 0.35)", icon: "bx bx-navigation" },
  { color: "#06b6d4", glow: "rgba(6, 182, 212, 0.35)", icon: "bx bx-compass" },
  { color: "#f97316", glow: "rgba(249, 115, 22, 0.35)", icon: "bx bx-map" },
  { color: "#6366f1", glow: "rgba(99, 102, 241, 0.35)", icon: "bx bx-transfer-alt" },
];

export const PROBLEM_TYPE_LABELS: Record<string, string> = {
  price: "تسعيرة أو رسوم الجراج غير صحيحة",
  status: "الجراج مغلق نهائياً أو تحت الصيانة",
  capacity: "سعة الجراج غير دقيقة أو ممتلئ دائماً",
  address: "العنوان أو الموقع الجغرافي على الخريطة غير دقيق",
  metro: "أقرب محطة مترو غير صحيحة",
  app_bug: "مشكلة تقنية في صفحة الجراجات",
  other: "ملاحظة أو مشكلة أخرى",
};

export const PROBLEM_TYPE_OPTIONS = [
  { value: "price", label: "تسعيرة أو رسوم الجراج غير صحيحة" },
  { value: "status", label: "الجراج مغلق نهائياً أو تحت الصيانة" },
  { value: "capacity", label: "سعة الجراج غير دقيقة أو ممتلئ دائماً" },
  { value: "address", label: "العنوان أو الموقع الجغرافي على الخريطة غير دقيق" },
  { value: "metro", label: "أقرب محطة مترو غير صحيحة" },
  { value: "app_bug", label: "مشكلة تقنية في صفحة الجراجات" },
  { value: "other", label: "ملاحظة أو مشكلة أخرى" },
];

export const SUGGEST_GARAGE_TYPES = [
  "مغطى متعدد طوابق",
  "ذكي إلكتروني",
  "سطحي مفتوح",
  "أخرى",
];

export const SUGGEST_AVAILABLE_FEATURES = [
  "أمن وحراسة",
  "كاميرات مراقبة",
  "مصاعد كهربائية",
  "مظلات حماية",
  "غسيل سيارات",
  "شواحن سيارات كهربائية",
  "دفع إلكتروني",
  "اشتراكات شهرية",
  "متاح 24 ساعة",
];
