import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأتوبيس الترددي السريع BRT - محطات الطريق الدائري ومواعيد الخدمة 2026",
  description: "دليل الأتوبيس الترددي السريع BRT على الطريق الدائري حول القاهرة الكبرى، قائمة المحطات، نقاط الربط بالمترو ومواقف الأقاليم وتفاصيل الخدمة.",
  keywords: ["الاتوبيس الترددي", "BRT الطريق الدائري", "محطات الاتوبيس الترددي", "مواصلات الدائري", "ماب القاهرة"],
  alternates: {
    canonical: "https://cairomap.vercel.app/brt",
  },
};

export default function BrtLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
