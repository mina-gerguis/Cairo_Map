import { RoadReportOption } from "./types";

export const ROAD_TYPE_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "كافة الطرق", icon: "bx bx-grid-alt" },
  { id: "حر", label: "طرق حرة وسريعة", icon: "bx bx-bolt-circle" },
  { id: "صحراوي", label: "طرق صحراوية", icon: "bx bx-sun" },
  { id: "ساحلي", label: "طرق ساحلية", icon: "bx bx-water" },
  { id: "دائري", label: "طرق دائرية", icon: "bx bx-radar" },
  { id: "محور", label: "محاور رئيسية", icon: "bx bx-git-commit" },
  { id: "زراعي", label: "طرق زراعية", icon: "bx bx-leaf" },
];

export const VEHICLE_TYPE_META = [
  {
    key: "privateCar",
    title: "ملاكي",
    subtitle: "سيارات الركوب الخاصة",
    icon: "bx bx-car",
    badgeColor: "#3b82f6",
    desc: "الحارة اليسرى والوسطى (السرعة القصوى)",
  },
  {
    key: "minibus",
    title: "ميني باص",
    subtitle: "حافلات متوسطة",
    icon: "bx bx-bus",
    badgeColor: "#10b981",
    desc: "الحارات الوسطى مع الالتزام بالمسار",
  },
  {
    key: "microbus",
    title: "ميكروباص",
    subtitle: "سيارات الأجرة 14 راكب",
    icon: "bx bx-navigation",
    badgeColor: "#f59e0b",
    desc: "حظر القيادة في الحارة القصوى اليسرى",
  },
  {
    key: "pickup",
    title: "ربع نقل",
    subtitle: "سيارات البيك أب والجامبو",
    icon: "bx bx-package",
    badgeColor: "#8b5cf6",
    desc: "الحارات الوسطى واليمنى مع تأمين الحمولة",
  },
  {
    key: "bus",
    title: "أتوبيس",
    subtitle: "حافلات نقل الركاب الكبيرة والسياحة",
    icon: "bx bx-bus-school",
    badgeColor: "#06b6d4",
    desc: "الحارات الوسطى واليمنى المخصصة",
  },
  {
    key: "truck",
    title: "نقل ثقيل",
    subtitle: "الشاحنات والمقطورات والتريلات",
    icon: "bx bx-shield-quarter",
    badgeColor: "#ef4444",
    desc: "الحارة اليمنى أو الطريق الخرساني المنفصل",
  },
];

export const ROAD_NEWS_CATEGORIES: { id: string; label: string; icon: string; color: string }[] = [
  { id: "all", label: "كافة الأخبار والتنبيهات", icon: "bx bx-bell", color: "var(--color-primary)" },
  { id: "weather_fog", label: "طقس وشبورة مائية", icon: "bx bx-cloud-rain", color: "#38bdf8" },
  { id: "maintenance", label: "صيانة وتطوير", icon: "bx bx-wrench", color: "#fb923c" },
  { id: "detour", label: "تحويلات مرورية", icon: "bx bx-git-merge", color: "#eab308" },
  { id: "traffic", label: "سيولة وكثافات", icon: "bx bx-traffic-cone", color: "#22c55e" },
  { id: "radar", label: "رادارات وقوانين", icon: "bx bx-radar", color: "#a855f7" },
];

export const EMERGENCY_NUMBERS = [
  { name: "إغاثة الطرق السريعة والصحراوية", number: "01221110000", icon: "bx bx-phone-call", color: "#ef4444" },
  { name: "طوارئ الإدارة العامة للمرور", number: "136", icon: "bx bx-shield", color: "#3b82f6" },
  { name: "الإسعاف المصري", number: "123", icon: "bx bx-plus-medical", color: "#ef4444" },
  { name: "شرطة النجدة", number: "122", icon: "bx bx-building", color: "#10b981" },
  { name: "الحماية المدنية والمطافئ", number: "180", icon: "bx bx-flame", color: "#f97316" },
];

export const ROAD_REPORT_OPTIONS: RoadReportOption[] = [
  {
    id: "speed_error",
    title: "خطأ في السرعة المقررة أو الرادار",
    desc: "السرعة الموضحة تختلف عن لافتات المرور الحالية أو تم تغيير سرعة الرادار.",
    icon: "bx bx-tachometer",
    badge: "سرعات",
  },
  {
    id: "road_closed",
    title: "غلق للطريق أو وجود تحويلة غير مذكورة",
    desc: "الطريق مغلق بسبب إصلاحات أو شبورة أو تم تحويل مسار السير.",
    icon: "bx bx-block",
    badge: "حالة الطريق",
  },
  {
    id: "toll_fee",
    title: "تحديث رسوم الكارتة أو البوابات",
    desc: "تم تعديل سعر الكارتة أو إضافة بوابات جديدة على الطريق.",
    icon: "bx bx-wallet",
    badge: "رسوم",
  },
  {
    id: "distance_error",
    title: "خطأ في طول الطريق أو المسارات",
    desc: "المسافة بالكيلومتر أو نقاط البداية والنهاية تحتاج لتعديل وتدقيق.",
    icon: "bx bx-map-pin",
    badge: "بيانات",
  },
  {
    id: "pavement_issue",
    title: "بلاغ عن هبوط أو عائق في الرصف",
    desc: "وجود أعمال صيانة أو تلفيات في الطريق تستوجب تنبيه السائقين.",
    icon: "bx bx-error-alt",
    badge: "أمان",
  },
  {
    id: "other",
    title: "ملاحظة أو اقتراح آخر",
    desc: "أي استفسار أو إضافة تخص خدمات واستراحات الطريق.",
    icon: "bx bx-help-circle",
    badge: "عام",
  },
];
