import { ParkingSpot } from "./types";

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
