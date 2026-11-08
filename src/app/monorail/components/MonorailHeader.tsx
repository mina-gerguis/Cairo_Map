import React from "react";
import PageHero from "@/components/common/PageHero";
import { MonorailHeaderProps } from "../types";
import { ASSETS } from "@/constants/assets";

export default function MonorailHeader({
  headerRef,
  linesCount = 2,
  stationsCount = 38,
}: MonorailHeaderProps & { linesCount?: number; stationsCount?: number }) {
  return (
    <PageHero
      headerRef={headerRef}
      title="مونوريل القاهرة الكبرى"
      icon={{
        src: ASSETS.transit.monorail,
        alt: "Monorail",
        width: 50,
        height: 50,
      }}
      subtitle="احسب رحلتك في ثوانٍ، تصفح مسارات ومحطات خطوط مونوريل شرق وغرب النيل، واعرف قيمة تذكرتك ومحطات التبادل ومواعيد الرحلات."
      statsType="tab"
      stats={[
        { label: `${linesCount} خطوط رئيسية` },
        { label: `${stationsCount} محطة` },
        { label: "100 كم إجمالي الشبكة" },
      ]}
    />
  );
}
