import React, { RefObject } from "react";
import PageHero from "@/components/common/PageHero";

interface MicrobusHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  stationsCount: number;
  linesCount: number;
}

export default function MicrobusHero({
  headerRef,
  stationsCount,
  linesCount,
}: MicrobusHeroProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="مواقف الميكروباص"
      icon={{
        src: "/images/icons2d/microbus.png",
        alt: "Cairo Microbus",
        width: 60,
        height: 42,
      }}
      subtitle="تقدر دلوقتي تعرف خطوط السير والأجرات الرسمية وزمن الرحلة في جميع المواقف و نقط التحميل في جمهورية مصر العربية."
      statsType="tab"
      stats={[
        { label: `${stationsCount} موقف` },
        { label: `${linesCount} خط سير` },
      ]}
    />
  );
}
