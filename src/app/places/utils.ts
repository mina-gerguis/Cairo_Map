import { Place } from "@/data/places";
import { STOP_WORDS } from "./constants";

/**
 * دالة حساب المسافة الجغرافية بين نقطتين (عرض وطول) بالكيلومترات
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * دالة توحيد وتنظيف النصوص العربية لبحث دقيق (إزالة الهمزات والتاء المربوطة والتطويل)
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove tatweel
}

/**
 * دالة إزالة السوابق والتعريفات العربية (الـ، للـ، بالـ، والـ) لضمان تطابق مرن
 */
export function cleanArabicWord(word: string): string {
  let w = word.trim();
  if (w.length <= 3) return w;

  if (w.startsWith("وال") && w.length > 4) {
    w = w.substring(3);
  } else if (w.startsWith("ال") && w.length > 3) {
    w = w.substring(2);
  } else if (w.startsWith("بال") && w.length > 4) {
    w = w.substring(3);
  } else if (w.startsWith("لل") && w.length > 3) {
    w = w.substring(2);
  }

  return w;
}

/**
 * دالة تقسيم نص البحث إلى كلمات نظيفة مفلترة
 */
export function getSearchWords(text: string): string[] {
  const normalized = normalizeArabic(text).toLowerCase();

  return normalized
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !STOP_WORDS.includes(w))
    .map(cleanArabicWord);
}

/**
 * دالة تنظيف الكلمات في النص الكامل للمقارنة
 */
export function getSearchCleanedText(text: string): string {
  if (!text) return "";
  return normalizeArabic(text)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.trim())
    .map(cleanArabicWord)
    .filter(Boolean)
    .join(" ");
}

/**
 * إرجاع اسم التصنيف المعرف باللغة العربية لعرضه بشكل سليم في رسائل المشاركة
 */
export function getDefiniteCategoryName(category: string, label: string): string {
  switch (category) {
    case "restaurant":
      return "المطعم";
    case "cafe":
      return "الكافيه";
    case "garden":
      return "الحديقة";
    case "medicalCenter":
      return "المركز الطبي";
    case "health_beauty":
      return "مكان الصحة والجمال";
    case "family":
      return "المكان العائلي";
    case "quiet_places":
      return "المكان الهادئ";
    case "kids":
      return "المكان المخصص للأطفال";
    case "amusement_aqua":
      return "الملاهي";
    case "work":
      return "مكتب العمل";
    case "courses_study":
      return "مكان الكورسات";
    case "hotel":
      return "الفندق";
    case "cinema":
      return "السينما";
    case "mall":
      return "المول";
    case "outings":
      return "المكان";
    default:
      return label || "المكان";
  }
}

/**
 * مشاركة بيانات ورابط المكان باستخدام Web Share API أو النسخ للحافظة
 */
export async function handleSharePlace(place: Place): Promise<void> {
  if (!place || typeof window === "undefined") return;

  const categoryText = getDefiniteCategoryName(place.category, place.categoryLabel);
  const shareText = `لقد وجدت هذا ${categoryText} وموجود في ${place.city} ${place.governorate} هيا نلقي نظرة عليه`;
  const shareUrl = `${window.location.origin}/places/${place.id}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: place.name,
        text: shareText,
        url: shareUrl,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Error sharing:", err);
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("تم نسخ رسالة المشاركة ورابط المكان إلى الحافظة!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("عذراً، لم نتمكن من نسخ الرابط.");
    }
  }
}
