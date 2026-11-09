import React, { RefObject } from "react";
import PageHero from "@/components/common/PageHero";
import { ASSETS } from "@/constants/assets";

interface AirportsHeroProps {
  headerRef?: RefObject<HTMLDivElement | null>;
  totalAirports: number;
  internationalCount?: number;
  domesticCount?: number;
}

export default function AirportsHero({
  headerRef,
  totalAirports,
  internationalCount,
  domesticCount,
}: AirportsHeroProps) {
  const stats = [
    { label: `${totalAirports} مطار في مصر` },
    ...(internationalCount ? [{ label: `${internationalCount} مطار دولي` }] : []),
    ...(domesticCount ? [{ label: `${domesticCount} مطار محلي / إقليمي` }] : []),
  ];

  return (
    <PageHero
      headerRef={headerRef}
      title="دليل المطارات المصرية"
      icon={{
        src: ASSETS.transit.airport,
        alt: "مطارات مصر",
        width: 50,
        height: 50,
      }}
      subtitle="دليلك الشامل لكافة المطارات الدولية والداخلية في جمهورية مصر العربية، استعرض بيانات الصالات، أرقام الهواتف الرسمية للاستعلامات، خطوط الطيران المتاحة ووسائل الوصول المباشرة."
      statsType="tab"
      stats={stats}
    />
  );
}
