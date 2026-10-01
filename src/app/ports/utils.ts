import { DEFAULT_PORTS } from "./constants";
import { Port } from "./types";

/**
 * Normalizes Arabic text for flexible searching (unifies alefs, yehs, teh marbuta, etc.)
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u0652]/g, "") // remove tashkeel
    .replace(/ـ/g, "")
    .trim();
}

/**
 * Retrieves cached local ports from localStorage with fallback to DEFAULT_PORTS
 */
export function getLocalPorts(): Port[] {
  if (typeof window === "undefined") return DEFAULT_PORTS;
  const local = localStorage.getItem("local_ports");
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: Port) => {
          const match = DEFAULT_PORTS.find(
            (d) => normalizeArabic(d.name) === normalizeArabic(p.name)
          );
          return { ...match, ...p };
        });
      }
    } catch {
      return DEFAULT_PORTS;
    }
  }
  try {
    localStorage.setItem("local_ports", JSON.stringify(DEFAULT_PORTS));
  } catch {
    // ignore quota errors
  }
  return DEFAULT_PORTS;
}

/**
 * Formats report content for submission to app_feedback for ports
 */
export function formatPortReportContent(
  portName: string,
  problemTypeLabel: string,
  details: string
): string {
  return `بلاغ عن خطأ في دليل الموانئ البحرية:
الميناء المعني: ${portName || "مشكلة عامة بدليل الموانئ"}
نوع المشكلة: ${problemTypeLabel}

تفاصيل البلاغ / التصحيح المقترح:
${details.trim()}`;
}
