import React from "react";
import PageHero from "@/components/common/PageHero";
import { DirectoryHeroProps } from "../types";

export default function DirectoryHero({
  headerRef,
  phonesCount = 0,
  codesCount = 0,
}: DirectoryHeroProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="دليل الهاتف والخدمات العامة"
      icon={{
        src: "/images/transit/arab_republic _of_egypt.webp",
        alt: "Egypt",
        width: 42,
        height: 52,
      }}
      subtitle="دليلك الشامل لأرقام الطوارئ، الخطوط الساخنة للجهات الحكومية والبنوك، وأكواد شبكات المحمول في مصر."
      statsType="tab"
      stats={[
        {
          label: `${phonesCount} رقم مسجل`,
        },
        {
          label: `${codesCount} كود شبكة`,
        },
      ]}
      showAmbientGlow={true}
    />
  );
}
