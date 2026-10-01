import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مترو القاهرة - خريطة الخطوط، أسعار التذاكر وحاسبة المحطات 2026",
  description: "دليلك الشامل لمترو أنفاق القاهرة: حاسبة أسرع مسار، محطات التبديل، أسعار التذاكر، مواعيد العمل، وخريطة الخط الأول والثاني والثالث.",
  keywords: ["مترو القاهرة", "اسعار تذاكر المترو", "خريطة المترو", "محطات المترو", "الخط الثالث للمترو", "محطات التبديل"],
  alternates: {
    canonical: "https://cairomap.net/metro",
  },
  openGraph: {
    title: "مترو القاهرة - خريطة الخطوط وأسعار التذاكر | ماب القاهرة",
    description: "احسب محطات رحلتك وسعر التذكرة وأقرب مسار بالمترو في القاهرة والجيزة.",
    url: "https://cairomap.net/metro",
  },
};

export default function MetroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
