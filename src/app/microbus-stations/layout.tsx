import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مواقف الميكروباص والسرفيس في القاهرة والجيزة 2026",
  description: "دليل مواقف السرفيس والميكروباص وخطوط السير والتعريفة الرسمية وأماكن الانطلاق في كافة أحياء القاهرة الكبرى.",
  keywords: ["مواقف الميكروباص", "سرفيس القاهرة", "موقف رمسيس", "موقف الجيزة", "خطوط السرفيس"],
  alternates: {
    canonical: "https://cairomap.net/microbus-stations",
  },
};

export default function MicrobusStationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
