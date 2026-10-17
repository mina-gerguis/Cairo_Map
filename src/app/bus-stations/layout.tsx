import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مواقف أتوبيسات الأقاليم وهيئة النقل العام في القاهرة 2026",
  description: "دليل مواقف الأتوبيسات الإقليمية (موقف عبود، الترجمان، السلام، المنيب، ألماظة) وخطوط أتوبيسات هيئة النقل العام بالقاهرة والجيزة.",
  keywords: ["مواقف الاتوبيس", "موقف عبود", "موقف الترجمان", "موقف السلام", "اتوبيسات الاقاليم", "ماب القاهرة"],
  alternates: {
    canonical: "https://cairomap.vercel.app/bus-stations",
  },
};

export default function BusStationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
