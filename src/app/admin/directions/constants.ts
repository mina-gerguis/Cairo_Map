import { FormLeg, FormOption, TransitVehicleType } from "./types";

export const LOCAL_STORAGE_ROUTES_KEY = "dftry_admin_local_routes";

export const TRANSIT_VEHICLE_CONFIG: Record<
  TransitVehicleType,
  { defaultName: string; defaultIcon: string; label: string }
> = {
  metro: {
    defaultName: "مترو الأنفاق",
    defaultIcon: "metro",
    label: "مترو الأنفاق"
  },
  train: {
    defaultName: "قطار السكك الحديدية",
    defaultIcon: "Cairo_train",
    label: "قطار"
  },
  bus: {
    defaultName: "أتوبيس النقل العام",
    defaultIcon: "bus",
    label: "أتوبيس"
  },
  monorail: {
    defaultName: "قطار المونوريل",
    defaultIcon: "Cairo_monorail_east",
    label: "مونوريل"
  },
  microbus: {
    defaultName: "ميكروباص",
    defaultIcon: "microbus",
    label: "ميكروباص"
  },
  lrt: {
    defaultName: "القطار الكهربائي الخفيف (LRT)",
    defaultIcon: "Cairo_lrt",
    label: "القطار الكهربائي (LRT)"
  },
  brt: {
    defaultName: "الأتوبيس الترددي (BRT)",
    defaultIcon: "brt",
    label: "الأتوبيس الترددي (BRT)"
  },
  taxi: {
    defaultName: "تاكسي / أوبر",
    defaultIcon: "taxi",
    label: "تاكسي / أوبر"
  },
  car: {
    defaultName: "سيارة خاصة",
    defaultIcon: "car",
    label: "عربية خاص (سيارة)"
  },
  walk: {
    defaultName: "سير على الأقدام",
    defaultIcon: "walk",
    label: "سير على الأقدام (مشي)"
  },
  plane: {
    defaultName: "طائرة / طيران",
    defaultIcon: "airport",
    label: "طائرة"
  },
  ship: {
    defaultName: "سفينة / عبارة",
    defaultIcon: "ship",
    label: "سفينة"
  },
  multi: {
    defaultName: "مواصلات متعددة",
    defaultIcon: "multi",
    label: "مواصلات متعددة"
  }
};

export const createDefaultLeg = (
  stageNumber: number = 1,
  defaultVehicle: TransitVehicleType = "microbus"
): FormLeg => {
  return {
    title: ``,
    vehicleType: defaultVehicle,
    cost: "",
    duration: "",
    steps: ["", "", ""]
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
  legs: [createDefaultLeg(1, "microbus")],
  tips: "",
  map_link: ""
});
