import { FormLeg, FormOption, TransitVehicleType } from "./types";

export const LOCAL_STORAGE_ROUTES_KEY = "dftry_admin_local_routes";

export const TRANSIT_VEHICLE_CONFIG: Record<
  TransitVehicleType,
  { defaultName: string; defaultIcon: string; label: string }
> = {
  microbus: {
    defaultName: "ميكروباص",
    defaultIcon: "microbus",
    label: "ميكروباص"
  },
  bus: {
    defaultName: "أتوبيس النقل العام",
    defaultIcon: "bus",
    label: "أتوبيس"
  },
  car: {
    defaultName: "سيارة خاصة",
    defaultIcon: "car",
    label: "عربية خاص (سيارة)"
  },
  train: {
    defaultName: "القطار المباشر",
    defaultIcon: "train",
    label: "قطار"
  },
  monorail: {
    defaultName: "قطار المونوريل",
    defaultIcon: "monorail",
    label: "مونوريل"
  },
  lrt: {
    defaultName: "القطار الكهربائي الخفيف (LRT)",
    defaultIcon: "Cairo_lrt",
    label: "القطار الكهربائي (LRT)"
  },
  brt: {
    defaultName: "الأتوبيس الترددي (BRT)",
    defaultIcon: "bus",
    label: "الأتوبيس الترددي (BRT)"
  },
  metro: {
    defaultName: "مترو الأنفاق",
    defaultIcon: "metro",
    label: "مترو"
  },
  plane: {
    defaultName: "طائرة / طيران",
    defaultIcon: "plane",
    label: "طائرة"
  },
  ship: {
    defaultName: "سفينة / عبارة",
    defaultIcon: "ship",
    label: "سفينة"
  },
  multi: {
    defaultName: "مواصلات متعددة",
    defaultIcon: "transfer",
    label: "مواصلات متعددة"
  }
};

export const createDefaultLeg = (stageNumber: number = 1): FormLeg => {
  const stageNameArabic =
    stageNumber === 1
      ? "الأولى"
      : stageNumber === 2
      ? "الثانية"
      : stageNumber === 3
      ? "الثالثة"
      : `${stageNumber}`;

  return {
    title: `المرحلة ${stageNameArabic}: تفاصيل المرحلة`,
    vehicleType: "ميكروباص",
    cost: "",
    duration: "",
    steps: ["اركب...", "اوصل...", "انزل..."]
  };
};

export const createDefaultOption = (): FormOption => ({
  type: "microbus",
  type_name: "ميكروباص مباشر",
  icon: "microbus",
  cost: "0",
  duration: "",
  durationMinutes: "",
  steps: [""],
  legs: [createDefaultLeg(1)],
  tips: "",
  map_link: ""
});
