export const CONTACT_SUBJECT_OPTIONS = [
  "الإبلاغ عن مشكلة",
  "تقديم شكوى تقنية",
  "اقتراح لتحسين الخدمة",
  "تقديم شكوى من طاقم العمل",
  "مشكلة في الشحن أو السحب",
  "لا أستطيع تسجيل الدخول",
  "تم حظر حسابي",
] as const;

export type ContactSubjectType = (typeof CONTACT_SUBJECT_OPTIONS)[number];
