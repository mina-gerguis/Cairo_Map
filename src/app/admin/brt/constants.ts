import { AdminBrtStation, AdminBrtRoute } from "./types";
import { DEFAULT_BRT_STATIONS } from "@/app/brt/constants";

export const BRT_SECTORS: ("شرق القاهرة" | "جنوب القاهرة" | "غرب القاهرة" | "شمال القاهرة")[] = [
  "شرق القاهرة",
  "جنوب القاهرة",
  "غرب القاهرة",
  "شمال القاهرة"
];

export const BRT_STATUS_OPTIONS = [
  { label: "تشغيل تجريبي", value: "تشغيل تجريبي" },
  { label: "يعمل بانتظام", value: "يعمل بانتظام" },
  { label: "تحت الإنشاء والتشطيب", value: "تحت الإنشاء" },
  { label: "مرحلة ثانية (مخطط)", value: "مخطط" }
];

export const BRT_TYPE_OPTIONS = [
  { label: "محطة تبادلية كبرى", value: "تبادلية كبرى (مترو 3 + LRT + سوبرجيت)" },
  { label: "محطة تبادلية مع المونوريل", value: "تبادلية مع مونوريل شرق النيل 🚝" },
  { label: "محطة تبادلية مع المترو", value: "تبادلية مع مترو الأنفاق" },
  { label: "محطة رئيسية للمراكز التجارية والأعمال", value: "محطة رئيسية للمراكز التجارية والأعمال" },
  { label: "محطة سطحية قياسية (BRT)", value: "محطة سطحية قياسية" }
];

export const BRT_VEHICLE_OPTIONS = [
  { label: "أتوبيس ترددي كهربائي سريع", value: "أتوبيس ترددي كهربائي سريع" },
  { label: "أتوبيس ترددي مفصلي مكيف", value: "أتوبيس ترددي مفصلي مكيف" },
  { label: "حافلة BRT كهربائية", value: "حافلة BRT كهربائية" }
];

export const createEmptyBrtRoute = (): AdminBrtRoute => ({
  destination: "",
  fare: "10",
  vehicleType: "أتوبيس ترددي كهربائي سريع",
  duration: "",
  via: "",
  notes: ""
});

export const DEFAULT_BRT_ADMIN_STATIONS: AdminBrtStation[] = DEFAULT_BRT_STATIONS as AdminBrtStation[];
