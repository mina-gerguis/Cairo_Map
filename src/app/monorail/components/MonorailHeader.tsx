import React from "react";
import { MonorailHeaderProps } from "../types";

export default function MonorailHeader({ headerRef }: MonorailHeaderProps) {
  return (
    <div ref={headerRef} className="header-banner">
      <div>
        <h1 className="header-title">قطار المونوريل الكهربائي المعلق</h1>
        <p className="header-sub-title">
          احسب مسار وتكلفة رحلتك في ثوانٍ، تصفح خطوط شرق وغرب النيل، واعرف محطات التبادل والمعالم الحيوية وأحدث حالات التشغيل.
        </p>
      </div>
    </div>
  );
}
