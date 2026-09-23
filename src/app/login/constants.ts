export const LOGIN_MESSAGES = {
  DB_NOT_CONFIGURED: "لم يتم تكوين إعدادات قاعدة البيانات بعد.",
  INVALID_CREDENTIALS: "اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  INVALID_USER_OR_PWD: "اسم المستخدم أو كلمة المرور غير صحيحة.",
  ACCOUNT_SUSPENDED: "الحساب تم إيقافه، برجاء التواصل مع الإدارة لفتح الحساب.",
  MFA_INVALID_CODE: "كود المصادقة غير صحيح.",
  MFA_SETUP_ERROR: "حدث خطأ أثناء إعداد المصادقة الثنائية.",
} as const;

export const LOGIN_TEXTS = {
  TITLE: "أهلاً بك مجدداً",
  SUBTITLE: "سجّل دخولك للوصول لأماكنك المفضلة وتجربة مخصصة",
  MFA_TITLE: "التحقق الثنائي",
  MFA_SUBTITLE: "يرجى إدخال الكود المكون من 6 أرقام من تطبيق المصادقة الخاص بك",
  USERNAME_OR_EMAIL: "اسم المستخدم أو البريد الإلكتروني",
  PASSWORD: "كلمة المرور",
  KEEP_SIGNED_IN: "البقاء مسجل الدخول",
  SUBMIT_BUTTON: "تسجيل الدخول",
  SUBMIT_LOADING: "جاري الدخول...",
  MFA_CONFIRM: "تأكيد ومتابعة",
  MFA_VERIFYING: "جاري التحقق...",
  MFA_CANCEL: "رجوع وإلغاء",
  NO_ACCOUNT_PROMPT: "ليس لديك حساب؟",
  SIGNUP_BUTTON: "إنشاء حساب جديد",
  GUEST_BUTTON: "دخول كزائر",
  TERMS_PREFIX: "بالدخول أنت توافق على",
  TERMS_LABEL: "الشروط والأحكام",
  AND_SEPARATOR: "و",
  PRIVACY_LABEL: "سياسة الخصوصية",
} as const;

export const DRIFT_WALL_ITEMS = [
  { image: "https://picsum.photos/id/1015/600/400", title: "Peaks", href: "https://example.com/one" },
  { image: "https://picsum.photos/id/1025/600/400", title: "Pup", href: "https://example.com/two" },
  { image: "https://picsum.photos/id/1039/600/400", title: "Falls", href: "https://example.com/three" },
];
