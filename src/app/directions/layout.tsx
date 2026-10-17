import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إزاي أروح؟ - دليل خطوط المواصلات الشامل في القاهرة الكبرى 2026",
  description: "اعرف إزاي تروح أي مكان في القاهرة والجيزة بأسرع وأوفر وسيلة مواصلات، ميكروباصات، أتوبيسات، مترو، ومواقف الأقاليم.",
  keywords: ["ازاي اروح", "دليل المواصلات", "مواصلات القاهرة", "خطوط الميكروباص", "اتوبيسات هيئة النقل العام"],
  alternates: {
    canonical: "https://cairomap.vercel.app/directions",
  },
  openGraph: {
    title: "إزاي أروح؟ - دليل المواصلات الذكي | ماب القاهرة",
    description: "ابحث عن خطوط السير والمواصلات المباشرة بين أي منطقتين في القاهرة والجيزة.",
    url: "https://cairomap.vercel.app/directions",
  },
};

export default function DirectionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
