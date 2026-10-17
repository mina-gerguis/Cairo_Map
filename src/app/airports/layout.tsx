import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مطارات مصر - صالات السفر، الوصول ووسائل المواصلات 2026",
  description: "دليل مطارات جمهورية مصر العربية: مطار القاهرة الدولي (مبنى 1، 2، 3 ومبنى الركاب الموسمي)، مطار سفنكس، مطار العاصمة، ومواصلات المطارات.",
  keywords: ["مطار القاهرة", "مطار سفنكس", "مبنى الركاب", "اتوبيس المطار", "مواصلات المطار", "ماب القاهرة"],
  alternates: {
    canonical: "https://cairomap.vercel.app/airports",
  },
};

export default function AirportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
