import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دليل أرقام الطوارئ والخطوط الساخنة والأكواد في مصر 2026",
  description: "أرقام طوارئ مصر والخطوط الساخنة للشركات والخدمات الحكومية والمستشفيات والبنوك وشركات الاتصالات والإنترنت وأكواد شبكات المحمول.",
  keywords: ["ارقام الطوارئ", "الخط الساخن", "ارقام النجدة والاسعاف", "خدمة عملاء فودافون اورنج اتصالات وي", "دليل التليفونات"],
  alternates: {
    canonical: "https://cairomap.net/directory",
  },
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
