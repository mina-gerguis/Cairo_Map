import { LrtStation, LrtStationDetail, LrtLineTabConfig } from "./types";

export const DEFAULT_LRT: LrtStation[] = [
  { name: "عدلي منصور", line_type: "trunk", station_order: 1 },
  { name: "العبور", line_type: "trunk", station_order: 2 },
  { name: "المستقبل", line_type: "trunk", station_order: 3 },
  { name: "الشروق", line_type: "trunk", station_order: 4 },
  { name: "هليوبوليس الجديدة", line_type: "trunk", station_order: 5 },
  { name: "بدر", line_type: "trunk", station_order: 6 },
  { name: "الروبيكي", line_type: "capital", station_order: 1 },
  { name: "حدائق العاصمة", line_type: "capital", station_order: 2 },
  { name: "مطار العاصمة", line_type: "capital", station_order: 3 },
  { name: "مدينة الفنون والثقافة", line_type: "capital", station_order: 4 },
  { name: "المنطقة الصناعية", line_type: "ramadan", station_order: 1 },
  { name: "مدينة المعرفة", line_type: "ramadan", station_order: 2 },
];

export const STATION_DETAILS: Record<string, LrtStationDetail> = {
  "عدلي منصور": {
    landmarks: [
      "محطة عدلي منصور التبادلية",
      "موقف سوبر جيت",
      "طريق مصر الإسماعيلية الصحراوي",
      "الخط الثالث للمترو",
    ],
    type: "تبادلية مع الخط الثالث للمترو ومحطة السكك الحديدية و الاتوبيس الترددي 🚇",
    status: "تشغيل فعلي",
  },
  "العبور": {
    landmarks: [
      "مدينة العبور الجولف",
      "جامعة بنها فرع العبور",
      "طريق مصر الإسماعيلية",
      "سوق العبور",
    ],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "المستقبل": {
    landmarks: ["مدينة المستقبل السكنية", "طريق الإسماعيلية الصحراوي"],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "الشروق": {
    landmarks: [
      "المدخل الرئيسي لمدينة الشروق",
      "الجامعة البريطانية في مصر (BUE)",
      "أكاديمية الشروق",
      "نادي هليوبوليس الرياضي",
    ],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "هليوبوليس الجديدة": {
    landmarks: ["مدينة هليوبوليس الجديدة", "طريق السويس الصحراوي"],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "بدر": {
    landmarks: [
      "محطة بدر التبادلية",
      "مدينة بدر السكنية",
      "طريق الروبيكي",
      "منطقة الصناعات المتوسطة",
    ],
    type: "محطة تفريعة المسارين 🔀",
    status: "تشغيل فعلي",
  },
  "الروبيكي": {
    landmarks: ["مدينة الروبيكي للجلود", "المنطقة الصناعية بالروبيكي"],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "حدائق العاصمة": {
    landmarks: ["مدينة حدائق العاصمة السكنية", "سكن لكل المصريين"],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "مطار العاصمة": {
    landmarks: ["مطار العاصمة الإدارية الدولي", "منطقة المطار الإدارية"],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "مدينة الفنون والثقافة": {
    landmarks: [
      "مدينة الفنون والثقافة بالعاصمة",
      "النهر الأخضر",
      "دار الأوبرا الجديدة",
      "فندق الماسة",
      "محطة المونوريل",
    ],
    type: "تبادلية مع المونوريل 🚄",
    status: "تشغيل فعلي",
  },
  "المنطقة الصناعية": {
    landmarks: ["المنطقة الصناعية بالعاشر من رمضان", "طريق بلبيس العاشر"],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "مدينة المعرفة": {
    landmarks: [
      "مدينة المعرفة بالعاشر من رمضان",
      "جامعة سنجور",
      "مراكز البحوث والابتكار",
      "المعهد التكنولوجي العالي",
    ],
    type: "عادية",
    status: "تشغيل فعلي",
  },
  "العاصمة المركزية": {
    landmarks: ["العاصمة المركزية"],
    type: "محطة تبادلية مخططة مع القطار الكهربائي السريع (العين السخنة–مطروح) 🚄",
    status: "تشغيل فعلي",
  },
};

export const LRT_LINE_TABS: LrtLineTabConfig[] = [
  {
    id: "all",
    label: "الكل",
    color: "#818cf8",
    title: "جميع محطات القطار الكهربائي الخفيف",
    description: "تصفح شبكة القطار بالكامل بجميع تفريعاتها الشمالية والجنوبية",
  },
  {
    id: "trunk",
    label: "الرئيسي",
    color: "#06b6d4",
    title: "الجذع الرئيسي (عدلي منصور - بدر)",
    description: "محطات الجذع الرئيسي لربط القاهرة الكبرى بالمدن الجديدة وصولاً لـ بدر التبادلية",
  },
  {
    id: "capital",
    label: "العاصمة",
    color: "#a855f7",
    title: "تفريعة العاصمة الإدارية (بدر - الفنون والثقافة)",
    description: "فرعة العاصمة الإدارية الجديدة لربط محطة بدر بمدينة الفنون والثقافة",
  },
  {
    id: "ramadan",
    label: "العاشر",
    color: "#10b981",
    title: "تفريعة العاشر من رمضان (بدر - مدينة المعرفة)",
    description: "فرعة العاشر من رمضان لربط محطة بدر بالمنطقة الصناعية ومدينة العاشر",
  },
];

export const PROBLEM_TYPE_LABELS: Record<string, string> = {
  route_error: "خطأ في حساب مسار الرحلة أو زمن الوصول",
  price: "سعر التذكرة غير صحيح أو عدد المحطات غير دقيق",
  transfer: "خطأ في محطة التبديل (عدلي منصور أو بدر)",
  station_info: "اسم المحطة أو المعالم القريبة غير دقيقة",
  construction: "محطة مغلقة أو قيد الإنشاء أو تغيرت حالة تشغيلها",
  app_bug: "مشكلة تقنية أو زر لا يستجيب في الصفحة",
  other: "ملاحظة أو مشكلة أخرى",
};

export const PROBLEM_OPTIONS = [
  { value: "route_error", label: "خطأ في حساب مسار الرحلة أو زمن الوصول" },
  { value: "price", label: "سعر التذكرة غير صحيح أو عدد المحطات غير دقيق" },
  { value: "transfer", label: "خطأ في محطة التبديل (عدلي منصور أو بدر)" },
  { value: "station_info", label: "اسم المحطة أو المعالم القريبة غير دقيقة" },
  { value: "construction", label: "محطة مغلقة أو تغيرت حالة تشغيلها" },
  { value: "app_bug", label: "مشكلة تقنية أو زر لا يستجيب في الصفحة" },
  { value: "other", label: "ملاحظة أو مشكلة أخرى" },
];

export const LRT_FARE_TIERS = [
  { maxStations: 3, price: 10, label: "حتى 3 محطات", color: "var(--colorSuccess)" },
  { maxStations: 7, price: 15, label: "من 4 إلى 7 محطات", color: "var(--colorSuccess)" },
  { maxStations: 12, price: 20, label: "من 8 إلى 12 محطة", color: "var(--accent-warning)" },
  { maxStations: Infinity, price: 25, label: "13 محطة فأكثر", color: "var(--accent-danger)" },
];
