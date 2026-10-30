import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مدونة قريب - مقالات وأدلة المواصلات، السياحة ومعالم مصر",
  description: "مقالات حصرية وإرشادات عملية حول أحدث خطوط النقل الذكي، زيارة معالم مصر السياحية، أسعار تذاكر المترو والقطارات، وأفضل أماكن الخروج والفسح في القاهرة.",
  keywords: [
    "مدونة قريب", "مقالات مواصلات", "معالم مصر", "أماكن سياحية في مصر", "أهرامات الجيزة", "المتحف المصري الكبير", "سياحة القاهرة", "نصائح السفر والتنقل في مصر",
    "Egypt Travel Blog", "Cairo Guide Blog", "Egypt Landmarks Guide", "Visit Egypt Articles", "Things to do in Cairo Blog"
  ],
  alternates: {
    canonical: "https://cairomap.vercel.app/blog",
  },
  openGraph: {
    title: "مدونة قريب - دليلك الذكي للتنقل والسياحة",
    description: "اكتشف أحدث المقالات والأدلة الإرشادية حول المواصلات وأفضل الأماكن والمعالم السياحية في مصر.",
    url: "https://cairomap.vercel.app/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
