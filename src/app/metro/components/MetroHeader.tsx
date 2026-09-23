import React, { RefObject } from "react";
import PageHero from "@/components/common/PageHero";

interface MetroHeaderProps {
  headerRef: RefObject<HTMLDivElement | null>;
  stationsCount?: number;
  linesCount?: number;
}

export default function MetroHeader({
  headerRef,
  stationsCount = 90,
  linesCount = 3,
}: MetroHeaderProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="مترو القاهرة الكبرى"
      icon={{
        src: "/images/transit/metro.png",
        alt: "Cairo Metro",
        width: 52,
        height: 42,
        priority: true,
      }}
      subtitle="احسب رحلتك في ثوانٍ، تصفح مسارات ومحطات خطوط المترو، واعرف قيمة تذكرتك ومحطات التبديل وأقرب محطة لموقعك."
    />
  );
}
