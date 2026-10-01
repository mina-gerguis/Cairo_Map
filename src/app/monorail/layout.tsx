import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مونوريل القاهرة - مسارات ومحطات شرق وغرب النيل 2026",
  description: "دليل مونوريل شرق النيل (العاصمة الإدارية - التجمع - الاستاد) ومونوريل غرب النيل (مدينة 6 أكتوبر - الجيزة)، المحطات والأسعار والربط بالمترو.",
  keywords: ["مونوريل القاهرة", "مونوريل العاصمة الادارية", "مونوريل 6 اكتوبر", "محطات المونوريل", "مواصلات التجمع"],
  alternates: {
    canonical: "https://cairomap.net/monorail",
  },
};

export default function MonorailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
