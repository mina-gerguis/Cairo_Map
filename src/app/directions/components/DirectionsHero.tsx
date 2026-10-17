import React, { RefObject } from "react";
import PageHero from "@/components/common/PageHero";

interface DirectionsHeroProps {
  headerRef: RefObject<HTMLDivElement | null>;
  popularRoutesCount?: number;
}

export default function DirectionsHero({
  headerRef,
  popularRoutesCount = 0,
}: DirectionsHeroProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="ازاي اروح ..؟"
      icon={{
        src: "/images/transit/arab_republic _of_egypt.webp",
        alt: "Egypt",
        width: 42,
        height: 52,
      }}
      subtitle="دليل السفر والانتقال الذكي لمختلف وسائل المواصلات بالقاهرة والمحافظات. ابحث عن أي مكان وسنوجهك لأفضل طريق وأقل تكلفة ."
      statsType="tab"
      stats={[
        {
          label: "مسارات ذكية ومباشرة",
        },
        {
          label: "ميكروباص • مترو • أتوبيسات",
        },
        ...(popularRoutesCount > 0
          ? [
            {
              label: `${popularRoutesCount} مسار شائع`,
            },
          ]
          : []),
      ]}
    />
  );
}

