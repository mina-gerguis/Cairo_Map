import { PasswordRules } from "./types";

/**
 * Transliterates Arabic characters to phonetic English equivalents for username suggestions
 */
export const transliterateArabicToEnglish = (text: string): string => {
  const map: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'k', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
    'ة': 'a', 'ى': 'a', 'ئ': 'e', 'ء': 'a', 'ؤ': 'o'
  };
  return text
    .split('')
    .map((c) => map[c] || c)
    .join('')
    .replace(/[^a-z0-9_]/gi, '');
};

/**
 * Generates smart username suggestions based on user first and last name
 */
export const generateUsernameSuggestions = (firstName: string, lastName: string): string[] => {
  const combinedName = `${firstName} ${lastName}`.trim();
  if (combinedName.length >= 3) {
    const base = transliterateArabicToEnglish(combinedName.toLowerCase().replace(/\s+/g, '_'));
    if (base) {
      return [base, `${base}${Math.floor(Math.random() * 100)}`, `${base}_eg`];
    }
  }
  return [];
};

/**
 * Calculates user age from birth date string (YYYY-MM-DD)
 */
export const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  const dobDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Returns ISO date string of the maximum allowed DOB (e.g. at least 6 years old)
 */
export const getMaxDobDateString = (minAge: number = 6): string => {
  const maxDobDate = new Date();
  maxDobDate.setFullYear(maxDobDate.getFullYear() - minAge);
  return maxDobDate.toISOString().split("T")[0];
};

/**
 * Validates a name field (First name or Last name)
 */
export const validateName = (name: string, fieldTitle: string): string => {
  if (!name || name.trim().length === 0) return "";
  const trimmed = name.trim();
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);
  const hasEnglish = /[a-zA-Z]/.test(trimmed);

  if (trimmed.length < 2) {
    return `${fieldTitle} يجب أن يكون حرفين على الأقل`;
  }
  if (/[0-9]/.test(trimmed)) {
    return "لا يسمح باستخدام الأرقام";
  }
  if (hasArabic && hasEnglish) {
    return "يجب كتابة الاسم بلغة واحدة فقط";
  }
  return "";
};

/**
 * Validates Egyptian phone number (without country code)
 */
export const validatePhone = (phone: string): string => {
  if (!phone) return "";
  if (!phone.startsWith("1")) {
    return "يجب أن يبدأ الرقم بـ 1";
  }
  if (phone.length !== 10) {
    return "يجب أن يتكون الرقم من 10 أرقام";
  }
  return "";
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): string => {
  if (!email) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? "" : "صيغة البريد الإلكتروني غير صحيحة";
};

/**
 * Evaluates password strength against security rules
 */
export const checkPasswordRules = (password: string, confirmPassword: string): PasswordRules => {
  return {
    length: password.length >= 8 && password.length <= 32,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#^]/.test(password),
    match: password === confirmPassword && password !== "",
  };
};
