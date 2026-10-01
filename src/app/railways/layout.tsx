import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سكك حديد مصر - مواعيد وأسعار تذاكر القطارات والتالجو 2026",
  description: "جدول مواعيد قطارات سكك حديد مصر، قطارات تالجو، الـ VIP، والمكيفة والروسي، وأسعار التذاكر وطريقة الحجز وخطوط بحري وقبلي.",
  keywords: ["قطارات مصر", "سكك حديد مصر", "مواعيد القطارات", "قطار تالجو", "اسعار قطارات الصعيد", "قطارات اسكندرية"],
  alternates: {
    canonical: "https://cairomap.net/railways",
  },
  openGraph: {
    title: "سكك حديد مصر - مواعيد وأسعار القطارات | ماب القاهرة",
    description: "استعلم عن مواعيد قطارات مصر وأسعار التذاكر ومحطات التوقف.",
    url: "https://cairomap.net/railways",
  },
};

export default function RailwaysLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
