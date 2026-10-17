import { supabase } from "@/lib/supabase";

export interface PageInfo {
  path: string;
  label: string;
  category: "مواصلات" | "خدمات وأماكن" | "صفحات عامة" | "حسابات ومستخدمين" | "عام";
  icon: string;
}

export interface MaintenanceItem {
  id: string;
  page_path: string;
  title: string;
  message: string;
  is_active: boolean;
  estimated_end: string | null;
  created_at?: string;
  updated_at?: string;
}

export const SITE_PAGES_LIST: PageInfo[] = [
  { path: "all", label: "كامل الموقع (جميع الصفحات)", category: "عام", icon: "bx bx-globe" },
  { path: "/", label: "الصفحة الرئيسية", category: "صفحات عامة", icon: "bx bx-home-alt-2" },
  { path: "/map", label: "خريطة الأماكن التفاعلية", category: "خدمات وأماكن", icon: "bx bx-map-pin" },
  { path: "/places", label: "دليل الأماكن والمحلات", category: "خدمات وأماكن", icon: "bx bx-store-alt" },
  { path: "/directions", label: "ازاي أروح والمواصلات", category: "مواصلات", icon: "bx bx-compass" },
  { path: "/metro", label: "مترو الأنفاق", category: "مواصلات", icon: "bx bxs-train" },
  { path: "/monorail", label: "المنوريل", category: "مواصلات", icon: "bx bx-navigation" },
  { path: "/lrt", label: "القطار الكهربائي الخفيف (LRT)", category: "مواصلات", icon: "bx bx-train" },
  { path: "/brt", label: "الأتوبيس الترددي (BRT)", category: "مواصلات", icon: "bx bx-bus" },
  { path: "/railways", label: "سكك حديد مصر (القطارات)", category: "مواصلات", icon: "bx bx-train" },
  { path: "/bus-stations", label: "مواقف الأتوبيسات وسوبرجيت", category: "مواصلات", icon: "bx bx-bus" },
  { path: "/microbus-stations", label: "مواقف السرفيس والميكروباص", category: "مواصلات", icon: "bx bx-map-pin" },
  { path: "/parking", label: "دليل الجراجات ومواقف السيارات", category: "خدمات وأماكن", icon: "bx bx-car" },
  { path: "/directory", label: "دليل الهواتف والأكواد", category: "خدمات وأماكن", icon: "bx bx-phone-call" },
  { path: "/ai-planner", label: "مخطط الرحلات الذكي (AI)", category: "خدمات وأماكن", icon: "bx bx-bot" },
  { path: "/blog", label: "المدونة والمقالات", category: "صفحات عامة", icon: "bx bx-news" },
  { path: "/airports", label: "المطارات", category: "مواصلات", icon: "bx bx-plane" },
  { path: "/ports", label: "الموانئ البحرية والملاحية", category: "مواصلات", icon: "bx bx-anchor" },
  { path: "/propose-place", label: "اقتراح إضافة مكان", category: "خدمات وأماكن", icon: "bx bx-plus-circle" },
  { path: "/favorites", label: "الأماكن المفضلة", category: "حسابات ومستخدمين", icon: "bx bx-heart" },
  { path: "/profile", label: "الملف الشخصي", category: "حسابات ومستخدمين", icon: "bx bx-user" },
  { path: "/about", label: "من نحن", category: "صفحات عامة", icon: "bx bx-info-circle" },
  { path: "/contact", label: "اتصل بنا", category: "صفحات عامة", icon: "bx bx-envelope" },
  { path: "/help", label: "المساعدة والدعم الفني", category: "صفحات عامة", icon: "bx bx-help-circle" },
  { path: "/terms", label: "الشروط والأحكام", category: "صفحات عامة", icon: "bx bx-file" },
  { path: "/privacy", label: "سياسة الخصوصية", category: "صفحات عامة", icon: "bx bx-shield-quarter" },
  { path: "/live-updates", label: "التحديثات الحية", category: "صفحات عامة", icon: "bx bx-broadcast" },
];

export const getPageInfo = (path: string): PageInfo => {
  const found = SITE_PAGES_LIST.find((p) => p.path === path);
  if (found) return found;
  return {
    path,
    label: path === "/" ? "الصفحة الرئيسية" : path,
    category: "عام",
    icon: "bx bx-file",
  };
};

/**
 * Checks if a given pathname is currently under active maintenance based on the records list.
 */
export const isPathUnderMaintenance = (
  pathname: string,
  records: MaintenanceItem[]
): MaintenanceItem | null => {
  if (!records || records.length === 0) return null;

  const now = new Date();

  // 1. Check for whole site maintenance ('all')
  const allRecord = records.find(
    (r) =>
      r.page_path === "all" &&
      r.is_active &&
      (!r.estimated_end || new Date(r.estimated_end) > now)
  );
  if (allRecord) return allRecord;

  // Normalize path
  const normalizedPath = pathname === "" ? "/" : pathname;

  // 2. Check for exact path match
  const exactRecord = records.find((r) => {
    if (!r.is_active) return false;
    if (r.estimated_end && new Date(r.estimated_end) <= now) return false;

    const recordPath = r.page_path === "" ? "/" : r.page_path;
    return recordPath === normalizedPath;
  });

  return exactRecord || null;
};
