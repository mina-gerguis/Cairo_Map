import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "القطار الكهربائي الخفيف LRT - المحطات، الأسعار ومواعيد الرحلات 2026",
  description: "دليل قطار LRT الكهربائي السريع: محطة عدلي منصور التبادلية، العاصمة الإدارية، الشروق، العبور، العاشر من رمضان، وبدر، مع أسعار الاشتراكات والتذاكر.",
  keywords: ["قطار LRT", "القطار الكهربائي الخفيف", "محطات القطار الكهربائي", "مواصلات العاصمة الادارية", "محطة عدلي منصور"],
  alternates: {
    canonical: "https://cairomap.net/lrt",
  },
};

export default function LrtLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
