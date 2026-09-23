import { InterestItem, SubscriptionPlan, ProfileFormData, ContactFormData, PasswordForm } from "./types";

export const PROFILE_AVATARS: string[] = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ahmed&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Omar&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Tarek&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Youssef&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ali&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Nour&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Layla&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Hala&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mona&backgroundColor=ffdfbf",
];

export const AVAILABLE_INTERESTS: InterestItem[] = [
  { id: "restaurants", label: "مطاعم", icon: "bx bx-restaurant" },
  { id: "drinks", label: "مشروبات", icon: "bx bx-coffee" },
  { id: "family", label: "اماكن عائلية", icon: "bx bx-home-heart" },
  { id: "kids", label: "اماكن للأطفال", icon: "bx bx-child" },
  { id: "hotels_aqua", label: "فنادق واكوا بارك", icon: "bx bx-building-house" },
  { id: "activities", label: "أنشطة وترفيه", icon: "bx bx-party" },
  { id: "offers", label: "اقوي العروض", icon: "bx bxs-discount" },
  { id: "cinema", label: "السينما", icon: "bx bx-camera-movie" },
  { id: "medical", label: "خدمات طبية", icon: "bx bx-plus-medical" },
  { id: "health_beauty", label: "الصحة والجمال", icon: "bx bx-spa" },
  { id: "parks", label: "الحدائق", icon: "fa-solid fa-tree" },
  { id: "work", label: "شغل", icon: "bx bx-briefcase" },
  { id: "courses_study", label: "كورسات ودراسة", icon: "bx bx-book-reader" },
  { id: "quiet_places", label: "اماكن هادئه", icon: "bx bx-moon" },
];

export const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "الباقة المجانية",
    price_daily: 0,
    price_monthly: 0,
    price_yearly: 0,
    features: [
      "تصفح خطوط المترو الأساسية والبحث",
      "عرض جداول المواعيد والمحطات التبادلية",
      "تصفح الأماكن العامة",
    ],
  },
  {
    id: "mishwar",
    name: "باقة المشوار",
    price_daily: 9,
    price_monthly: 0,
    price_yearly: 0,
    features: [
      "صلاحية كاملة لمدة 24 ساعة",
      "تصفح خطوط المترو الأساسية والبحث",
      "خريطة المونوريل التفاعلية الكاملة",
      "محرك البحث المتقدم \"ازاي اروح\" للمواصلات",
      "كافه المميزات التي في الباقة الذهبية",
    ],
  },
  {
    id: "silver",
    name: "الباقة الفضية",
    price_daily: 0,
    price_monthly: 40,
    price_yearly: 450,
    features: [
      "تصفح خطوط المترو الأساسية والبحث",
      "عرض جداول المواعيد والمحطات التبادلية",
      "خريطة المونوريل التفاعلية الكاملة 🚄",
      "دليل سكك حديد مصر ومواعيد القطارات 🚂",
      "دليل محطات وتعرفة القطار الكهربائي LRT 🚄",
      "محرك البحث \"ازاي اروح\" للمواصلات 🗺️",
      "إضافة تذكيرات وملاحظات للأماكن 📝",
    ],
  },
  {
    id: "gold",
    name: "الباقة الذهبية",
    price_daily: 0,
    price_monthly: 60,
    price_yearly: 700,
    features: [
      "تصفح خطوط المترو الأساسية والبحث",
      "عرض جداول المواعيد والمحطات التبادلية",
      "خريطة المونوريل التفاعلية الكاملة 🚄",
      "دليل مواعيد وأسعار سكك حديد مصر 🚂",
      "دليل محطات وتعرفة القطار الكهربائي LRT 🚄",
      "محرك البحث المتقدم \"ازاي اروح\" 🗺️",
      "إضافة تذكيرات وملاحظات للأماكن 📝",
      "دليل المطارات المصرية والصالات ✈️",
      "دليل الموانئ البحرية التجارية والسياحية ⚓",
      "دليل مواقف وأتوبيسات السفر 🚌",
      "دليل مواقف الميكروباص والسرفيس والتعرفة 🚐",
      "مخطط الرحلات الذكي بالذكاء الاصطناعي 🤖",
    ],
  },
];

export const INITIAL_PROFILE_FORM: ProfileFormData = {
  fullName: "",
  username: "",
  phone: "",
  email: "",
  governorate: "",
  city: "",
  dob: "",
  avatarUrl: "",
  interests: [],
};

export const INITIAL_CONTACT_FORM: ContactFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  governorate: "",
  city: "",
  contactType: "",
  message: "",
};

export const INITIAL_PASSWORD_FORM: PasswordForm = {
  new: "",
  confirm: "",
};

export const SUPPORTED_PAYMENT_PROVIDERS = [
  { name: "vodafone cash", title: "فودافون كاش", icon: "/images/payment/vodafone.jpg" },
  { name: "instapay", title: "انستاباي", icon: "/images/payment/instapay.png" },
  { name: "meeza", title: "ميزة", icon: "/images/payment/meeza.png" },
  { name: "fawry", title: "فوري", icon: "/images/payment/fawry.png" },
  { name: "visa", title: "فيزا", icon: "/images/payment/visa.png" },
  { name: "mastercard", title: "ماستركارد", icon: "/images/payment/mastercard.png" },
  { name: "applepay", title: "ابل باي", icon: "/images/payment/applepay.png" },
  { name: "telda", title: "تيلدا", icon: "/images/payment/telda.jpg" },
];
