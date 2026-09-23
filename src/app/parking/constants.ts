import { ParkingSpot } from "./types";

export const DEFAULT_PARKING: ParkingSpot[] = [];

export const GARAGE_TYPE_BADGES = [
  { label: "مغطى ومتعدد الطوابق", color: "#818cf8" },
  { label: "جراج ذكي إلكتروني", color: "#10b981" },
  { label: "جراج سطحي مفتوح", color: "#f59e0b" },
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
