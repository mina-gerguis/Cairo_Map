import React from "react";
import PageHero from "@/components/common/PageHero";
import { MonorailHeaderProps } from "../types";

export default function MonorailHeader({ headerRef }: MonorailHeaderProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="مونوريل القاهرة الكبرى"
      icon={{
        src: "/images/transit/Cairo_monorail_east.webp",
        alt: "Cairo Monorail",
        width: 48,
        height: 48,
      }}
      pillBadge={{
        text: "أطول شبكة مونوريل بدون سائق في العالم",
        showDot: true,
      }}
      subtitle="احسب مسار وتكلفة رحلتك في ثوانٍ، تصفح خطوط شرق وغرب النيل، واعرف محطات التبادل مع المترو والـ LRT والمعالم الحيوية."
      statsType="tab"
      stats={[
        { label: "2 خطوط رئيسية" },
        { label: "38 محطة" },
        { label: "طول إجمالي 100 كم" },
      ]}
      showAmbientGlow={false}
    />
  );
}
