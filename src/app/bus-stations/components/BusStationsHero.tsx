import React from "react";
import PageHero from "@/components/common/PageHero";
import { ASSETS } from "@/constants/assets";

interface BusStationsHeroProps {
  stationsCount: number;
  companiesCount: number;
  destinationsCount: number;
}

export default function BusStationsHero({
  stationsCount,
  companiesCount,
  destinationsCount
}: BusStationsHeroProps) {
  return (
    <PageHero
      title="مواقف الأتوبيسات والسفر البري"
      icon={{
        src: ASSETS.transit.bus ,
        alt: "Cairo Bus",
        width: 48,
        height: 48,
      }}

      subtitle="دليلك الشامل لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى والوجهات والمحافظات المتاحة وشركات النقل وأرقام الحجز."
      statsType="tab"
      stats={[
        { label: `${stationsCount} مواقف رئيسية` },
        { label: `${companiesCount} شركات سفر` },
        { label: `${destinationsCount}+ وجهة سفر` },
      ]}
      showAmbientGlow={false}
    />
  );
}
