import React, { RefObject } from "react";
import PageHero from "@/components/common/PageHero";

interface BrtHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  stationsCount: number;
  linesCount: number;
}

export default function BrtHero({
  headerRef,
  stationsCount,
  linesCount,
}: BrtHeroProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="الأتوبيس الترددي السريع (BRT)"
      icon={{
        src: "/images/icons2d/brt.webp",
        alt: "Cairo BRT",
        width: 60,
        height: 42,
      }}
      subtitle="دليلك الشامل لخطوط ومحطات الأتوبيس الترددي السريع على الطريق الدائري، الأجرات الرسمية، زمن الرحلات، والمحطات التبادلية مع المترو والقطارات."
      statsType="tab"
      stats={[
        { label: `${stationsCount} محطة رئيسية` },
        { label: `${linesCount} خط سير مباشر` },
        { label: "106 كم مسار دائري" },
      ]}
    />
  );
}
