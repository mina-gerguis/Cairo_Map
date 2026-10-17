import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "معلومات الطرق وسرعات الرادار | ماب القاهرة",
  description:
    "دليل شامل للطرق والمحاور المصرية وسرعات الرادارات المقررة للملاكي والميكروباص والميني باص والنقل، والطقس المباشر وأحدث أخبار المرور.",
  keywords: [
    "سرعات الرادار",
    "معلومات الطرق",
    "سرعة الملاكي",
    "سرعة الميكروباص",
    "طريق السويس",
    "طريق الإسكندرية الصحراوي",
    "الطريق الدائري",
    "طقس الطرق",
    "شبورة الطرق",
    "أخبار المرور",
  ],
};

export default function RoadsInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
