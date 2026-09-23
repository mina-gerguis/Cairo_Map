import React from "react";
import { DirectoryHeroProps } from "../types";

export default function DirectoryHero({ headerRef }: DirectoryHeroProps) {
  return (
    <div ref={headerRef} className="header-banner">
      <div>
        <h1 className="header-title">دليل الهاتف والخدمات العامة</h1>
        <p className="header-sub-title">
          دليلك الشامل لأرقام الطوارئ، الخطوط الساخنة للجهات الحكومية والبنوك، وأكواد شبكات المحمول في مصر.
        </p>
      </div>
    </div>
  );
}
