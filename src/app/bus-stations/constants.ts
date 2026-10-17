import { BusStation, ReportProblemOption, ReportProblemType } from "./types";

export const DEFAULT_BUS_STATIONS: BusStation[] = [
  {
    name: "موقف ألماظة للسوبر جيت (Almaza Terminal)",
    location: "مصر الجديدة - بجوار طريق السويس ومطار القاهرة",
    governorate: "القاهرة",
    companies: [
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "رسمي حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: [
      "الإسكندرية",
      "شرم الشيخ",
      "الغردقة",
      "المنيا",
      "أسيوط",
      "سوهاج",
      "قنا",
      "الأقصر",
      "أسوان",
      "السويس",
      "بورسعيد"
    ],
    description:
      "أحدث محطات السوبر جيت في القاهرة. تخدم بشكل رئيسي المسافرين إلى مدن القناة، البحر الأحمر، والوجه القبلي والصعيد بتنظيم ممتاز وصالة انتظار مكيفة.",
    map_url: "https://maps.google.com/?q=Almaza+Super+Jet+Station"
  },
  {
    name: "موقف الترجمان (Cairo Gateway)",
    location: "وسط البلد - شارع الجلاء بجوار محطة مترو جمال عبد الناصر",
    governorate: "القاهرة",
    companies: [
      { name: "شركة شرق الدلتا للنقل", phone: "02-25761311", type: "حكومي" },
      { name: "شركة غرب ووسط الدلتا", phone: "02-25761211", type: "حكومي" },
      { name: "شركة الصعيد للنقل", phone: "02-25761411", type: "حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: [
      "الإسكندرية",
      "مطروح",
      "المنصورة",
      "الزقازيق",
      "شبه جزيرة سيناء (العريش/طور سيناء)",
      "محافظات الصعيد بأكملها",
      "البحر الأحمر"
    ],
    description:
      "المحطة المركزية الكبرى للنقل البري لجميع المحافظات والدول المجاورة. يضم مكاتب حجز لمعظم الشركات العامة والخاصة وصالة انتظار تجارية ضخمة.",
    map_url: "https://maps.google.com/?q=Torgoman+Bus+Station"
  },
  {
    name: "موقف عبد المنعم رياض (التحرير)",
    location: "وسط البلد - ميدان التحرير خلف المتاحف والمكتبة وبجوار هيلتون",
    governorate: "القاهرة",
    companies: [
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" },
      { name: "بلو باص (Blue Bus)", phone: "16148", type: "خاص فاخر" },
      { name: "سوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: [
      "الإسكندرية",
      "الساحل الشمالي",
      "شرم الشيخ",
      "دهب",
      "الغردقة",
      "المنيا",
      "أسيوط",
      "قنا",
      "الأقصر"
    ],
    description:
      "موقع استراتيجي بقلب القاهرة يتيح للمسافرين ركوب الحافلات السياحية الفاخرة مباشرة فور الخروج من محطة مترو السادات بالتحرير.",
    map_url: "https://maps.google.com/?q=Abdel+Moneim+Riad+Bus+Station"
  },
  {
    name: "موقف عبود الإقليمي",
    location: "شمال القاهرة - شبرا بمقربة من الطريق الدائري ومترو المظلات",
    governorate: "القاهرة",
    companies: [
      { name: "أتوبيسات غرب الدلتا", phone: "19142", type: "اقتصادي" },
      { name: "أتوبيسات شرق الدلتا", phone: "02-22448400", type: "اقتصادي" }
    ],
    destinations: [
      "طنطا",
      "المحلة الكبرى",
      "المنصورة",
      "دمنهور",
      "كفر الشيخ",
      "الإسكندرية",
      "بلبيس",
      "الزقازيق"
    ],
    description:
      "الموقف الرئيسي والأكبر لربط القاهرة بجميع محافظات الوجه البحري والدلتا. يضم أتوبيسات السفر الاقتصادية وسيارات الأجرة الإقليمية الكبرى.",
    map_url: "https://maps.google.com/?q=Abboud+Bus+Station"
  },
  {
    name: "موقف المنيب الإقليمي",
    location: "الجيزة - المنيب بجوار محطة مترو المنيب والطريق الدائري",
    governorate: "الجيزة",
    companies: [
      { name: "شركة الصعيد للنقل والاتوبيسات", phone: "19142", type: "حكومي" },
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: [
      "الفيوم",
      "بني سويف",
      "المنيا",
      "أسيوط",
      "سوهاج",
      "قنا",
      "الأقصر",
      "أسوان",
      "الواحات البحرية"
    ],
    description:
      "البوابة الجنوبية للقاهرة والجيزة ومركز النقل الرئيسي المتجه إلى محافظات الصعيد والوجه القبلي والفيوم والواحات.",
    map_url: "https://maps.google.com/?q=Moneeb+Bus+Station"
  }
];

export const REPORT_PROBLEM_OPTIONS: ReportProblemOption[] = [
  { id: "phone", label: "📞 رقم هاتف / خط ساخن لإحدى الشركات غير صحيح" },
  { id: "company", label: "🏢 شركة سفر غير موجودة أو ملغية أو ناقصة" },
  { id: "destinations", label: "🚌 وجهة سفر غير صحيحة أو غير متوفرة من هذا الموقف" },
  { id: "location", label: "📍 الموقع الجغرافي أو العنوان أو رابط الخريطة غير دقيق" },
  { id: "closed", label: "🚫 الموقف مغلق أو تم نقله لمكان آخر" },
  { id: "missing_station", label: "➕ موقف جديد غير مسجل في الدليل" },
  { id: "other", label: "📝 خطأ أو ملاحظة أخرى في البيانات" }
];

export const PROBLEM_LABELS: Record<ReportProblemType, string> = {
  phone: "رقم هاتف / خط ساخن لإحدى الشركات غير صحيح",
  company: "شركة سفر غير موجودة أو ملغية أو ناقصة",
  destinations: "وجهة سفر غير صحيحة أو ناقصة",
  location: "الموقع الجغرافي أو العنوان أو رابط الخريطة غير دقيق",
  closed: "الموقف مغلق أو تم نقله",
  missing_station: "موقف أتوبيسات جديد غير موجود بالدليل",
  other: "خطأ أو ملاحظة أخرى"
};

export const LOCAL_STORAGE_KEY = "local_bus_stations";
