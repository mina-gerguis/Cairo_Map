import { MicrobusStation, StationPaletteItem } from "./types";

export const STATION_PALETTE: StationPaletteItem[] = [
  { color: "#3b82f6", glow: "rgba(59, 130, 246, 0.35)", icon: "bx bx-bus" },
  { color: "#10b981", glow: "rgba(16, 185, 129, 0.35)", icon: "bx bx-map-pin" },
  { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.35)", icon: "bx bx-navigation" },
  { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.35)", icon: "bx bx-trip" },
  { color: "#ec4899", glow: "rgba(236, 72, 153, 0.35)", icon: "bx bx-directions" },
  { color: "#06b6d4", glow: "rgba(6, 182, 212, 0.35)", icon: "bx bx-compass" },
  { color: "#f97316", glow: "rgba(249, 115, 22, 0.35)", icon: "bx bx-map" },
  { color: "#6366f1", glow: "rgba(99, 102, 241, 0.35)", icon: "bx bx-transfer-alt" },
];

export const POPULAR_DESTINATIONS = [
  "6 أكتوبر",
  "التجمع الخامس",
  "العبور",
  "الشيخ زايد",
  "الشروق",
  "حلوان",
  "المعادي"
];

export const DEFAULT_MICROBUS_STATIONS: MicrobusStation[] = [
  {
    name: "موقف رمسيس (أحمد حلمي / رمسيس الكبرى)",
    location: "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Ramses+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "11-13", vehicleType: "ميكروباص سقف عالي", duration: "45-60", via: "التحرير - المحور - ميدان الحصري" },
      { destination: "الشيخ زايد", fare: "12-14", vehicleType: "ميكروباص سقف عالي", duration: "40-55", via: "المحور المركزي - هايبر وان" },
      { destination: "التجمع الخامس", fare: "15-18", vehicleType: "ميكروباص / ميني باص", duration: "50-65", via: "صلاح سالم - التسعين الجنوبي" },
      { destination: "العبور", fare: "10-12", vehicleType: "ميكروباص", duration: "40-50", via: "الإسماعيلية الصحراوي - سوق العبور" },
      { destination: "الشروق", fare: "12-14", vehicleType: "ميكروباص", duration: "50-60", via: "طريق السويس - مدخل الشروق" },
      { destination: "حلوان", fare: "9-11", vehicleType: "ميكروباص", duration: "45-55", via: "كورنيش النيل - المعادي" },
      { destination: "المرج", fare: "7-8", vehicleType: "ميكروباص", duration: "30-40", via: "كوبري أكتوبر - الدائري" },
      { destination: "الجيزة (ميدان الجيزة)", fare: "5-6", vehicleType: "ميكروباص", duration: "20-30", via: "كوبري عباس - جامعة القاهرة" },
      { destination: "شبرا الخيمة", fare: "5-6", vehicleType: "ميكروباص", duration: "20-25", via: "شارع شبرا - أحمد حلمي" },
      { destination: "مطار القاهرة", fare: "8-10", vehicleType: "ميكروباص", duration: "35-45", via: "صلاح سالم - الكلية الحربية" }
    ]
  },
  {
    name: "موقف المرج الجديدة",
    location: "شمال شرق القاهرة - أسفل محطة مترو المرج ومحور الفريق عرابي",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=El+Marg+Microbus+Station",
    routes: [
      { destination: "العبور", fare: "7-9", vehicleType: "ميكروباص", duration: "25-35", via: "الدائري - مدخل 1" },
      { destination: "الشروق", fare: "9-11", vehicleType: "ميكروباص", duration: "35-45", via: "الإسماعيلية - كارتة الشروق" },
      { destination: "بدر", fare: "11-13", vehicleType: "ميكروباص", duration: "45-55", via: "طريق السويس - الروبيكي" },
      { destination: "العاشر من رمضان", fare: "12-15", vehicleType: "ميكروباص سقف عالي", duration: "50-60", via: "طريق الإسماعيلية - الأردنية" },
      { destination: "مدينتي", fare: "10-12", vehicleType: "ميكروباص", duration: "35-45", via: "طريق السويس - بوابة 1" },
      { destination: "بلبيس", fare: "10-12", vehicleType: "ميكروباص إقليمي", duration: "40-50", via: "طريق بلبيس الصحراوي" },
      { destination: "الزقازيق", fare: "15-18", vehicleType: "ميكروباص إقليمي", duration: "60-75", via: "بلبيس - الزراعي" },
      { destination: "مسطرد", fare: "5", vehicleType: "ميكروباص", duration: "15-20", via: "ترعة الإسماعيلية" },
      { destination: "رمسيس", fare: "7-8", vehicleType: "ميكروباص", duration: "35-45", via: "الدائري - نفق الشهداء" }
    ]
  },
  {
    name: "موقف ميدان الجيزة",
    location: "الجيزة - ميدان الجيزة بجوار مسجد الاستقامة ومترو الجيزة",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Giza+Square+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "9-11", vehicleType: "ميكروباص سقف عالي", duration: "40-50", via: "شارع الهرم - المحور الموازي" },
      { destination: "الشيخ زايد", fare: "10-12", vehicleType: "ميكروباص", duration: "40-50", via: "محور 26 يوليو" },
      { destination: "الهرم / فيصل", fare: "4-5", vehicleType: "ميكروباص داخلي", duration: "15-25", via: "نصر الدين - العشرين" },
      { destination: "المنيب", fare: "3.5-4", vehicleType: "ميكروباص داخلي", duration: "10-15", via: "شارع البحر الأعظم" },
      { destination: "حدائق الأهرام", fare: "5-6", vehicleType: "ميكروباص", duration: "25-35", via: "الرماية - البوابات" },
      { destination: "رمسيس", fare: "5-6", vehicleType: "ميكروباص", duration: "25-35", via: "شارع مراد - التحرير" },
      { destination: "التجمع الخامس", fare: "15-18", vehicleType: "ميكروباص سقف عالي", duration: "50-60", via: "الدائري الجنوبي - المنيب" },
      { destination: "المعادي", fare: "7-9", vehicleType: "ميكروباص", duration: "30-40", via: "الدائري - الأوتوستراد" }
    ]
  },
  {
    name: "موقف السيدة عائشة",
    location: "وسط القاهرة - ميدان السيدة عائشة أسفل القلعة",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Sayeda+Aisha+Microbus+Station",
    routes: [
      { destination: "حلوان", fare: "8-10", vehicleType: "ميكروباص", duration: "35-45", via: "الأوتوستراد - المعصرة" },
      { destination: "المعادي (صقر قريش)", fare: "6-7", vehicleType: "ميكروباص", duration: "20-30", via: "الأوتوستراد - الجزائر" },
      { destination: "التجمع الخامس", fare: "12-14", vehicleType: "ميكروباص", duration: "40-50", via: "الدائري - محور المشير" },
      { destination: "رمسيس", fare: "5", vehicleType: "ميكروباص", duration: "20-30", via: "القلعة - العتبة" },
      { destination: "الجيزة", fare: "5-6", vehicleType: "ميكروباص", duration: "20-30", via: "الملك الصالح - قصر العيني" },
      { destination: "المرج", fare: "8-10", vehicleType: "ميكروباص", duration: "40-50", via: "الدائري - المطرية" },
      { destination: "المقطم", fare: "4-5", vehicleType: "ميكروباص", duration: "15-20", via: "صلاح الدين - النافورة" }
    ]
  },
  {
    name: "موقف المنيب الكبرى",
    location: "الجيزة - بجوار محطة مترو المنيب ومخرج الدائري الجنوبي",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Moneeb+Microbus+Station",
    routes: [
      { destination: "الفيوم", fare: "25-30", vehicleType: "ميكروباص إقليمي", duration: "70-85", via: "طريق مصر الفيوم الصحراوي" },
      { destination: "بني سويف", fare: "30-35", vehicleType: "ميكروباص إقليمي", duration: "80-100", via: "الكريمات الصحراوي الشرقي" },
      { destination: "6 أكتوبر", fare: "9-11", vehicleType: "ميكروباص سقف عالي", duration: "35-45", via: "الدائري - طريق الواحات" },
      { destination: "حلوان", fare: "7-9", vehicleType: "ميكروباص", duration: "25-35", via: "الدائري - كوبري المنيب" },
      { destination: "المعادي", fare: "5-6", vehicleType: "ميكروباص", duration: "15-25", via: "الدائري - الأوتوستراد" },
      { destination: "ميدان الجيزة", fare: "3.5-4", vehicleType: "ميكروباص داخلي", duration: "10-15", via: "شارع البحر الأعظم" }
    ]
  }
];
