import React from "react";
import PageHero from "@/components/common/PageHero";
import { MetroHeaderProps } from "../types";

export default function MetroHeader({
  headerRef,
  linesCount = 3,
  stationsCount = 84,
}: MetroHeaderProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="مترو القاهرة الكبرى"
      icon={{
        src: "/images/transit/metro.png",
        alt: "Cairo Metro",
        width: 50,
        height: 50,
      }}
      subtitle="احسب رحلتك في ثوانٍ، تصفح مسارات ومحطات خطوط المترو، واعرف قيمة تذكرتك ومحطات التبديل ومواعيد الرحلات."
      statsType="tab"
      stats={[
        { label: `${linesCount} خطوط رئيسية` },
        { label: `${stationsCount} محطة` },
      ]}
    />
  );
}
