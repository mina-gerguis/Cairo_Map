import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حد يعرف؟ | اسأل مجتمع قريب وجاوب وتفاعل",
  description:
    "خدمة حد يعرف؟ من خريطة القاهرة (قريب): اسأل عن أي مواصلة، طريق، مكان خروجة، أو ورقة حكومية، وتفاعل بـ 6 رموز تعبيرية ولايك، وتلقى ردود وإجابات من مجتمع المستخدمين.",
  keywords: [
    "حد يعرف",
    "اسأل القاهرة",
    "مواصلات القاهرة",
    "إزاي أروح",
    "سؤال وجواب",
    "مجتمع قريب",
    "خريطة القاهرة",
  ],
  openGraph: {
    title: "حد يعرف؟ | مجتمع قريب للاستفسارات والمواصلات",
    description:
      "اسأل مجتمع قريب عن أي مكان أو طريق أو مواصلة وتفاعل مع الإجابات مع إظهار اسمك وصورتك والـ username.",
    url: "https://cairomap.vercel.app/had-yaaraf",
    siteName: "قريب - Cairo Map",
    type: "website",
  },
};

export default function HadYaarafLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
