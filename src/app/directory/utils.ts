/**
 * Utility functions for Directory module
 */

export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .toLowerCase();
}

export function getDialUrl(code: string): string {
  return `tel:${code.replace(/#/g, "%23")}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !navigator?.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}
