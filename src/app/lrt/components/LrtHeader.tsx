import React from "react";
import PageHero from "@/components/common/PageHero";
import { LrtHeaderProps } from "../types";
import { ASSETS } from "@/constants/assets";

export default function LrtHeader({
  headerRef,
  linesCount = 3,
  stationsCount = 19,
}: LrtHeaderProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="القطار الكهربائي الخفيف"
      icon={{
        src: ASSETS.transit.lrt,
        alt: "Cairo LRT",
        width: 50,
        height: 50,
      }}
      subtitle="احسب رحلتك في ثوانٍ، تصفح مسارات وتفريعات القطار الكهربائي الخفيف (الجذع الرئيسي، العاصمة الإدارية، العاشر من رمضان)، واعرف قيمة تذكرتك ومحطات التبادل ومواعيد الرحلات."
      statsType="tab"
      stats={[
        { label: `${linesCount} مسارات وتفريعات` },
        { label: `${stationsCount} محطة` },
        { label: "سرعة تصل إلى 120 كم/س" },
      ]}
    />
  );
}
