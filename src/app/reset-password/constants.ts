export const RESET_PASSWORD_MESSAGES = {
  DB_NOT_CONFIGURED: "لم يتم تكوين إعدادات قاعدة البيانات بعد.",
  NO_SESSION: "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط استعادة جديد.",
  PASSWORD_MISMATCH: "كلمتا المرور غير متطابقتين.",
  PASSWORD_INVALID: "يرجى استيفاء جميع شروط كلمة المرور المطلوبة.",
  UPDATE_ERROR: "حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة لاحقاً.",
  SUCCESS_UPDATE: "تم تحديث كلمة المرور بنجاح!",
} as const;

export const RESET_PASSWORD_TEXTS = {
  TITLE: "تعيين كلمة مرور جديدة",
  SUBTITLE: "أدخل كلمة المرور الجديدة لحسابك وقم بتأكيدها للمتابعة",
  NEW_PASSWORD: "كلمة المرور الجديدة",
  CONFIRM_PASSWORD: "تأكيد كلمة المرور الجديدة",
  SUBMIT_BTN: "تحديث كلمة المرور",
  SUBMIT_LOADING: "جاري الحفظ...",
  SUCCESS_TITLE: "تم تغيير كلمة المرور بنجاح 🎉",
  SUCCESS_DESC: "تم تحديث كلمة مرور حسابك بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
  REDIRECT_NOTE: "سيتم تحويلك تلقائياً إلى صفحة تسجيل الدخول خلال",
  SECONDS: "ثوانٍ...",
  LOGIN_NOW_BTN: "تسجيل الدخول الآن",
  REQUEST_NEW_LINK_BTN: "طلب رابط استعادة جديد",
  BACK_TO_LOGIN: "العودة لتسجيل الدخول",
} as const;
