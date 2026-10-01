import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مدونة ماب القاهرة - مقالات وأدلة المواصلات والتنقل والخدمات",
  description: "مقالات حصرية وإرشادات عملية حول أحدث خطوط النقل الذكي، أسعار تذاكر المترو والقطارات، وأفضل أماكن الخروج والفسح في القاهرة.",
  keywords: ["مدونة ماب القاهرة", "مقالات مواصلات", "اماكن خروج في القاهرة", "نصائح السفر والتنقل"],
  alternates: {
    canonical: "https://cairomap.vercel.app/blog",
  },
  openGraph: {
    title: "مدونة ماب القاهرة - دليلك الذكي للتنقل",
    description: "اكتشف أحدث المقالات والأدلة الإرشادية حول المواصلات وأفضل الأماكن والخدمات.",
    url: "https://cairomap.vercel.app/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
