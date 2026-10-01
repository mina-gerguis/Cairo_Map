import { CategoryFilterType, StatusFilterType } from "./types";

export interface CategoryTabConfig {
  id: CategoryFilterType;
  label: string;
  icon?: string;
}

export const CATEGORY_TABS: CategoryTabConfig[] = [
  { id: "all", label: "🌐 كل البلاغات والوارد" },
  { id: "places", label: "📍 بلاغات الأماكن" },
  { id: "contacts", label: "📩 رسائل تواصل معنا" },
  { id: "microbus", label: "🚐 السرفيس والمواقف" },
  { id: "bus_stations", label: "🚌 مواقف الأتوبيسات" },
  { id: "brt", label: "🚍 الأتوبيس الترددي BRT" },
  { id: "metro", label: "🚇 المترو" },
  { id: "monorail", label: "🚝 المونوريل" },
  { id: "lrt", label: "🚊 القطار الكهربائي LRT" },
  { id: "railways", label: "🚆 سكك حديد مصر" },
  { id: "airports", label: "✈️ المطارات" },
  { id: "ports", label: "⚓ الموانئ البحرية" },
  { id: "parking", label: "🅿️ الجراجات والمواقف" },
  { id: "directory", label: "☎️ دليل الهاتف والأكواد" },
  { id: "bugs", label: "⚠️ بلاغات وأخطاء النظام" },
  { id: "suggestions", label: "💡 اقتراحات الميزات" },
  { id: "routes", label: "🧭 اقتراحات الطرق" },
];

export interface StatusFilterOption {
  id: StatusFilterType;
  label: string;
}

export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { id: "all", label: "كل الحالات" },
  { id: "pending", label: "قيد الانتظار" },
  { id: "reviewed", label: "تمت المراجعة" },
  { id: "action_taken", label: "تم التنفيذ / مقبول" },
  { id: "rejected", label: "مرفوض" },
];

export const PROBLEM_TYPE_LABELS: Record<string, string> = {
  name: "الاسم غير صحيح ✏️",
  address: "العنوان أو موقع الخريطة غير صحيح 📍",
  phone_website: "الهاتف أو موقع الويب غير صحيح 📞",
  working_hours: "ساعات العمل غير صحيحة 🕐",
  closed: "المكان مغلق 🔴",
  category: "الفئة غير صحيحة 🗂️",
  other: "شيء آخر أو تعديلات متعددة ⚠️",
};
