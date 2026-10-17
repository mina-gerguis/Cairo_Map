/**
 * Normalizes Arabic text for consistent and lenient search matching.
 * Removes harakat (tashkeel), unifies alef forms, teh marbuta, and alef maksura.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F]/g, "") // remove harakat/tashkeel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}
