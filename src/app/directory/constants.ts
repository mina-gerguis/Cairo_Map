import { CompanyMetaConfig, DirectoryTopCard, EmergencyNumber, PhoneEntry } from "./types";

export const COMPANY_META: Record<string, CompanyMetaConfig> = {
  vodafone: {
    label: "فودافون",
    logo: "vodafone.png",
    color: "#ef4444",
    border: "rgba(239, 68, 68, 0.3)",
    bg: "rgba(239, 68, 68, 0.08)",
  },
  orange: {
    label: "اورنج",
    logo: "orange.png",
    color: "#f97316",
    border: "rgba(249, 115, 22, 0.3)",
    bg: "rgba(249, 115, 22, 0.08)",
  },
  etisalat: {
    label: "اتصالات",
    logo: "etisalat.png",
    color: "#10b981",
    border: "rgba(16, 185, 129, 0.3)",
    bg: "rgba(16, 185, 129, 0.08)",
  },
  we: {
    label: "وي",
    logo: "we.png",
    color: "#8b5cf6",
    border: "rgba(139, 92, 246, 0.3)",
    bg: "rgba(139, 92, 246, 0.08)",
  },
};

export const DIRECTORY_TOP_CARDS: DirectoryTopCard[] = [
  {
    id: "emergency",
    title: "طوارئ وخدمات عاجلة",
    subtitle: "شرطة، إسعاف، مطافئ، غاز، كهرباء",
    icon: "fa-solid fa-truck-medical",
    color: "#ef4444",
    specialtyFilter: "طوارئ",
  },
  {
    id: "government",
    title: "جهات حكومية ومرافق",
    subtitle: "المرور، السكة الحديد، حماية المستهلك",
    icon: "fa-solid fa-building-columns",
    color: "#3b82f6",
    specialtyFilter: "حكومي",
  },
  {
    id: "banks",
    title: "بنوك ومحافظ إلكترونية",
    subtitle: "الأهلي، مصر، CIB، فودافون كاش",
    icon: "fa-solid fa-credit-card",
    color: "#f59e0b",
    specialtyFilter: "بنوك",
  },
  {
    id: "health",
    title: "صحة ومستشفيات",
    subtitle: "مستشفيات، بنك الدم، صيدليات كبرى",
    icon: "fa-solid fa-heart-pulse",
    color: "#10b981",
    specialtyFilter: "صحة",
  },
  {
    id: "telecom",
    title: "أكواد شبكات المحمول",
    subtitle: "فودافون، أورنج، اتصالات، وي",
    icon: "fa-solid fa-sim-card",
    color: "#8b5cf6",
    specialtyFilter: "telecom_codes",
  },
];

export const TOP_EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { name: "شرطة النجدة", number: "122", icon: "fa-solid fa-shield-halved", color: "#3b82f6" },
  { name: "الإسعاف المصري", number: "123", icon: "fa-solid fa-truck-medical", color: "#ef4444" },
  { name: "المطافئ والدفاع المدني", number: "180", icon: "fa-solid fa-fire-extinguisher", color: "#f97316" },
  { name: "طوارئ الغاز الطبيعي", number: "129", icon: "fa-solid fa-fire-flame-simple", color: "#eab308" },
  { name: "طوارئ الكهرباء", number: "121", icon: "fa-solid fa-bolt", color: "#06b6d4" },
  { name: "طوارئ مياه الشرب", number: "125", icon: "fa-solid fa-faucet-drip", color: "#3b82f6" },
];

export const DEFAULT_PHONE_SEED: PhoneEntry[] = [
  { id: "em-1", name: "شرطة النجدة", specialty: "طوارئ", phone_number: "122", description: "بلاغات النجدة والأمن العام على مدار 24 ساعة في جميع المحافظات." },
  { id: "em-2", name: "هيئة الإسعاف المصرية", specialty: "طوارئ", phone_number: "123", description: "طلب سيارات الإسعاف للحالات الحرجة والحوادث مجاناً." },
  { id: "em-3", name: "المطافئ والحماية المدنية", specialty: "طوارئ", phone_number: "180", description: "بلاغات الحرائق وحوادث الانهيار والإنقاذ السريع." },
  { id: "em-4", name: "طوارئ الغاز الطبيعي", specialty: "طوارئ", phone_number: "129", description: "الإبلاغ الفوري عن تسريب الغاز الطبيعي أو أعطال الشبكات." },
  { id: "em-5", name: "طوارئ الكهرباء", specialty: "طوارئ", phone_number: "121", description: "أعطال شبكة الكهرباء وانقطاع التيار والشكاوى الفنية." },
  { id: "em-6", name: "طوارئ مياه الشرب والصرف", specialty: "طوارئ", phone_number: "125", description: "بلاغات كسر مواسير المياه وانقطاع الخدمة وطفح الصرف." },
  { id: "em-7", name: "الإدارة العامة للمرور", specialty: "حكومي", phone_number: "128", description: "الإغاثة المرورية على الطرق السريعة والمحاور الرئيسية." },
  { id: "em-8", name: "الهيئة القومية لسكك حديد مصر", specialty: "حكومي", phone_number: "15047", description: "استعلامات مواعيد القطارات وأسعار التذاكر والشكاوى." },
  { id: "em-9", name: "جهاز حماية المستهلك", specialty: "حكومي", phone_number: "19588", description: "تقديم شكاوى الغش التجاري وعيوب السلع والخدمات." },
  { id: "em-10", name: "المركز القومي لخدمات نقل الدم", specialty: "صحة", phone_number: "15366", description: "الاستعلام عن أكياس الدم وفصائله والتبرع بالدم." },
  { id: "em-11", name: "خدمات وزارة الصحة (105)", specialty: "صحة", phone_number: "105", description: "الخط الساخن لوزارة الصحة المصرية واستشارات الأمراض واللقاحات." },
  { id: "em-12", name: "دليل التليفون المصري", specialty: "حكومي", phone_number: "140", description: "الاستعلام عن أرقام الهواتف الأرضية والمؤسسات." },
  { id: "em-13", name: "مباحث الإنترنت والجرائم الإلكترونية", specialty: "حكومي", phone_number: "108", description: "الإبلاغ عن جرائم الابتزاز والقرصنة والنصب الإلكتروني." },
  { id: "em-14", name: "خدمة عملاء البنك الأهلي المصري", specialty: "بنوك", phone_number: "19623", description: "استعلامات الحسابات، كروت الائتمان والخدمات المصرفية." },
  { id: "em-15", name: "خدمة عملاء بنك مصر", specialty: "بنوك", phone_number: "19888", description: "الدعم الفني والخدمات المصرفية للأفراد والشركات." },
  { id: "em-16", name: "خدمة عملاء البنك التجاري الدولي (CIB)", specialty: "بنوك", phone_number: "19666", description: "خدمة عملاء CIB على مدار 24 ساعة." },
  { id: "em-17", name: "خدمة عملاء فودافون كاش", specialty: "بنوك", phone_number: "7001", description: "استعلامات محفظة فودافون كاش والمعاملات المالية." },
];
