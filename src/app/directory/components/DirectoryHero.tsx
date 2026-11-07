import React from "react";
import PageHero from "@/components/common/PageHero";
import { ASSETS } from "@/constants/assets";
import { DirectoryHeroProps } from "../types";

export default function DirectoryHero({
  headerRef,
  phonesCount = 0,
  codesCount = 0,
}: DirectoryHeroProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="دليل الهاتف"
      icon={{
        src: ASSETS.company.vodafone,
        alt: "Directory",
        width: 52,
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
