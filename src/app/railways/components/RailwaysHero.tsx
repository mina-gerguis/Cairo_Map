import React, { RefObject } from "react";
import PageHero from "@/components/common/PageHero";
import { ASSETS } from "@/constants/assets";

interface RailwaysHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  routesCount: number;
  stationsCount: number;
}

export default function RailwaysHero({
  headerRef,
  routesCount,
  stationsCount,
}: RailwaysHeroProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="سكك حديد مصر"
      icon={{
        src: ASSETS.transit.train,
        alt: "Egyptian National Railways",
        width: 50,
        height: 50,
      }}
      subtitle="استكشف شبكة قطارات سكك حديد مصر، اعرف أسعار التذاكر وفئات القطارات (تالجو، VIP، الإسباني والمكيف، والروسي)، ومسارات الرحلات والمدد الزمنية للخطوط ومحطات التوقف."
      statsType="tab"
      stats={[
        { label: `${routesCount} خطوط رئيسية` },
        { label: `${stationsCount} محطة توقف` },
      ]}
    />
  );
}
