import { AdminMicrobusStation, AdminMicrobusRoute } from "./types";

export const EGYPT_DESTINATIONS: string[] = [
  "6 أكتوبر",
  "الشيخ زايد",
  "التجمع الخامس",
  "التجمع الأول",
  "التجمع الثالث",
  "القاهرة الجديدة",
  "الرحاب",
  "مدينتي",
  "الشروق",
  "العبور",
  "بدر",
  "العاشر من رمضان",
  "العاصمة الإدارية",
  "رمسيس",
  "المنيب",
  "شبرا الخيمة",
  "حلوان",
  "المرج",
  "المرج الشرقية",
  "المرج الغربية",
  "مصر الجديدة",
  "ألف مسكن",
  "جسر السويس",
  "قباء",
  "الهايكستب",
  "السلام",
  "مسطرد",
  "الخصوص",
  "المعادي",
  "زهراء المعادي",
  "وسط البلد",
  "العتبة",
  "الجيزة",
  "الهرم",
  "فيصل",
  "الدقي",
  "المهندسين",
  "المنيل",
  "شبرا مصر",
  "دوران شبرا",
  "المظلات",
  "الخلفاوي",
  "عبود",
  "ألماظة",
  "شيراتون",
  "النزهة الجديدة",
  "المطرية",
  "الزيتون",
  "حدائق القبة",
  "الأميرية",
  "عين شمس",
  "المنيرة",
  "إمبابة",
  "الوراق",
  "بولاق الدكرور",
  "الكيت كات",
  "السبتية",
  "مطار القاهرة",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "الإسكندرية",
  "المنصورة",
  "الزقازيق",
  "طنطا",
  "المحلة الكبرى",
  "دمنهور",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "مطروح",
  "شرم الشيخ",
  "الغردقة"
];

export const VEHICLE_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "ميكروباص", value: "ميكروباص" },
  { label: "ميكروباص سقف عالي", value: "ميكروباص سقف عالي" },
  { label: "ميني باص", value: "ميني باص" },
  { label: "أتوبيس", value: "أتوبيس" },
  { label: "حافلة سياحية", value: "حافلة سياحية" }
];

export const STATION_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "موقف رسمي", value: "official" },
  { label: "نقطة تحميل عادية", value: "normal" }
];

export const createEmptyRoute = (): AdminMicrobusRoute => ({
  destination: "",
  fare: "",
  vehicleType: "ميكروباص",
  description: "",
  via: "",
  type: "official",
  lastUpdated: new Date().toISOString().split("T")[0],
  duration: ""
});

export const DEFAULT_MICROBUS_STATIONS: AdminMicrobusStation[] = [
  {
    name: "موقف رمسيس (موقف أحمد حلمي / رمسيس الكبرى)",
    location: "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Ramses+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "11-13 ج.م", vehicleType: "ميكروباص سقف عالي", type: "official", lastUpdated: "2026-08-16", duration: "٤٥ دقيقة", via: "طريق المحور" },
      { destination: "الشيخ زايد", fare: "12-14 ج.م", vehicleType: "ميكروباص سقف عالي", type: "official", lastUpdated: "2026-08-16", duration: "٥٠ دقيقة", via: "المحور" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص / ميني باص", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "الطريق الدائري" },
      { destination: "العبور", fare: "10-12 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٤٥ دقيقة", via: "صلاح سالم - طريق الإسماعيلية" },
      { destination: "الشروق", fare: "12-14 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٥٠ دقيقة", via: "طريق السويس" },
      { destination: "حلوان", fare: "9-11 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "كورنيش النيل - الأوتوستراد" },
      { destination: "المرج", fare: "7-8 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٠ دقيقة", via: "مترو الأنفاق الشهداء" },
      { destination: "الجيزة (ميدان الجيزة)", fare: "5-6 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٢٠ دقيقة", via: "شارع رمسيس - كوبري عباس" },
      { destination: "شبرا الخيمة", fare: "5-6 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "١٥ دقيقة", via: "شارع شبرا" },
      { destination: "مطار القاهرة", fare: "8-10 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٥ دقيقة", via: "صلاح سالم" }
    ]
  },
  {
    name: "موقف المرج الجديدة",
    location: "شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=El+Marg+Microbus+Station",
    routes: [
      { destination: "العبور", fare: "7-9 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٢٥ دقيقة", via: "عبر الدائري" },
      { destination: "الشروق", fare: "9-11 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٥ دقيقة", via: "طريق الإسماعيلية" },
      { destination: "بدر", fare: "11-13 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "طريق السويس" },
      { destination: "العاشر من رمضان", fare: "12-15 ج.م", vehicleType: "ميكروباص سقف عالي", type: "official", lastUpdated: "2026-08-16", duration: "٤٥ دقيقة", via: "الإسماعيلية الصحراوي" },
      { destination: "مدينتي", fare: "10-12 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٥ دقيقة", via: "طريق السويس" },
      { destination: "بلبيس", fare: "10-12 ج.م", vehicleType: "ميكروباص إقليمي", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "طريق بلبيس الصحراوي" },
      { destination: "الزقازيق", fare: "15-18 ج.م", vehicleType: "ميكروباص إقليمي", type: "official", lastUpdated: "2026-08-16", duration: "٦٠ دقيقة", via: "بنها الصحراوي" },
      { destination: "مسطرد", fare: "5 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "١٥ دقيقة", via: "ترعة الإسماعيلية" },
      { destination: "رمسيس", fare: "7-8 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٠ دقيقة", via: "صلاح سالم - الدائري" }
    ]
  }
];
