import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مواقف وساحات انتظار السيارات والجراجات في القاهرة 2026",
  description: "دليل جراجات وساحات انتظار السيارات في القاهرة والجيزة، جراجات التحرير، روكسي، العتبة، والمولات الكبرى مع الأسعار ومواقع GPS.",
  keywords: ["جراجات القاهرة", "ساحات انتظار السيارات", "جراج التحرير", "جراج روكسي", "ركن السيارات"],
  alternates: {
    canonical: "https://cairomap.vercel.app/parking",
  },
};

export default function ParkingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
