import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مخطط الرحلات الذكي بالذكاء الاصطناعي - ماب القاهرة",
  description: "خطط لرحلتك وخروجاتك في القاهرة والجيزة بمساعدة الذكاء الاصطناعي: اقتراحات أفضل مسار، الميزانية المتوقعة، ووسائل المواصلات المناسبة.",
  keywords: ["مخطط الرحلات الذكي", "ذكاء اصطناعي مواصلات", "خروجات القاهرة", "تخطيط مشاوير"],
  alternates: {
    canonical: "https://cairomap.vercel.app/ai-planner",
  },
};

export default function AiPlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
