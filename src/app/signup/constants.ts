import { OnboardingSlide, StepInfo, SignupFormData, SignupFieldErrors } from "./types";

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    imageUrl: "images/signUp/welcome1.jpg",
    title: "أنشئ حسابك الآن مجاناً",
    desc: "استمتع بتجربة فريدة ومخصصة لحفظ أماكنك المفضلة وملاحظاتك الشخصية.",
  },
  {
    imageUrl: "images/signUp/welcome2.jpg",
    title: "اكتشف أفضل الأماكن حولك",
    desc: "ابحث عن المطاعم، الكافيهات، والوجهات التاريخية القريبة منك بكل سهولة.",
  },
  {
    imageUrl: "images/signUp/welcome3.jpg",
    title: "تذكيرات وملاحظات ذكية للأماكن",
    desc: "أضف ملاحظات وتذكيرات هامة لأي مكان لتعود إليها في أي وقت.",
  },
];

export const AVATARS_LIST: string[] = [
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

export const STEP_INFO: Record<number, StepInfo> = {
  1: {
    label: "عرفنا بنفسك",
    headerTitle: "عرفنا بنفسك؟",
    subTitle: "أدخل بياناتك الشخصية الأساسية",
    gradient: "linear-gradient(135deg, #6c63ff, #3b82f6)",
  },
  2: {
    label: "رقم الهاتف",
    headerTitle: "إيه هو رقم تليفونك؟",
    subTitle: "سنحتاج رقم هاتفك للتحقق والتواصل",
    gradient: "linear-gradient(135deg, #3b82f6, #00d4aa)",
  },
  3: {
    label: "الإقامة والسِن",
    headerTitle: "منين وعندك كام سنه؟",
    subTitle: "حدد تاريخ ميلادك ومكان إقامتك",
    gradient: "linear-gradient(135deg, #00d4aa, #ffa500)",
  },
  4: {
    label: "الصورة الشخصية",
    headerTitle: "الصورة الشخصية",
    subTitle: "اختر صورتك المفضلة أو ارفع صورة جديدة",
    gradient: "linear-gradient(135deg, #ff3f8e, #6c63ff)",
  },
  5: {
    label: "حماية الحساب",
    headerTitle: "حماية الحساب",
    subTitle: "أنشئ كلمة مرور قوية لحماية حسابك",
    gradient: "linear-gradient(135deg, #6c63ff, #10b981)",
  },
};

export const INITIAL_FORM_DATA: SignupFormData = {
  firstName: "",
  lastName: "",
  username: "",
  phone: "",
  email: "",
  dob: "",
  gender: "ذكر",
  governorate: "",
  city: "",
  avatarUrl: "",
  password: "",
  confirmPassword: "",
};

export const INITIAL_FIELD_ERRORS: SignupFieldErrors = {
  firstName: "",
  lastName: "",
  username: "",
  phone: "",
  email: "",
};
