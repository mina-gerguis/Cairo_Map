import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "التوثيق وسجل التحديثات | قريب - خريطة ودليل مصر الذكي",
  description:
    "سجل التحديثات المستمر لمنصة قريب: تعرف على أحدث الإصدارات، المميزات الجديدة المضافة، وخريطة الطريق والخطط الجارية لتطوير أدلة النقل والخدمات والأماكن.",
  keywords: [
    "تحديثات قريب",
    "تاريخ التحديثات",
    "مميزات قريب الجديدة",
    "خريطة طريق قريب",
    "تطوير منصة قريب",
    "سجل الإصدارات",
    "changelog",
    "documentation",
    "roadmap",
  ],
  alternates: {
    canonical: "https://qareebmap.vercel.app/doc",
  },
  openGraph: {
    title: "التوثيق وسجل التحديثات | قريب",
    description:
      "تاريخ التحديثات، المميزات الجديدة المضافة، وخريطة طريق التطوير لخدمات النقل والخرائط والأماكن في مصر.",
    url: "https://qareebmap.vercel.app/doc",
    siteName: "قريب",
    locale: "ar_EG",
    type: "website",
  },
};

export default function DocLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
