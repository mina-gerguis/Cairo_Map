"use client";

import React, { RefObject } from "react";
import PageHero from "@/components/common/PageHero";
import { ASSETS } from "@/constants/assets";

interface ParkingHeroProps {
  headerRef?: RefObject<HTMLDivElement | null>;
  parkingCount: number;
  areasCount: number;
}

export function ParkingHero({
  headerRef,
  parkingCount,
  areasCount,
}: ParkingHeroProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="دليل الجراجات"
      icon={{
        src: ASSETS.transit.parking,
        alt: "Cairo Parking",
        width: 60,
        height: 42,
      }}
      subtitle="اعثر على أقرب جراج مغطى أو ذكي بالقرب من محطات المترو والأسواق لتفادي الازدحام وركن سيارتك بأمان."
      statsType="tab"
      stats={[
        { label: `${parkingCount} جراج مسجل` },
        { label: `${areasCount} منطقة وميدان` },
      ]}
    />
  );
}

export default ParkingHero;
