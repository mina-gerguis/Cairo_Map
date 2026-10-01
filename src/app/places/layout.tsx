import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دليل الأماكن والخدمات - مطاعم، كافيهات، مستشفيات وصيدليات القاهرة 2026",
  description: "دليلك الشامل لجميع الأماكن والأنشطة والخدمات في القاهرة والجيزة ومصر الجديدة والمعادي والتجمع وأكتوبر والشيخ زايد.",
  keywords: ["دليل الاماكن", "مطاعم القاهرة", "كافيهات التجمع", "مستشفيات القاهرة", "صيدليات 24 ساعة"],
  alternates: {
    canonical: "https://cairomap.net/places",
  },
  openGraph: {
    title: "دليل الأماكن والخدمات الشامل | ماب القاهرة",
    description: "ابحث في آلاف الأماكن والخدمات الموثقة مع أرقام الهواتف واللوكيشن ومواعيد العمل.",
    url: "https://cairomap.net/places",
  },
};

export default function PlacesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
