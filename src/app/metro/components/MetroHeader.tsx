import React from "react";
import { MetroHeaderProps } from "../types";

export default function MetroHeader({ headerRef }: MetroHeaderProps) {
  return (
    <div ref={headerRef} className="header-banner">
      <div>
        <h1 className="header-title">مترو القاهرة الكبري</h1>
        <p className="header-sub-title">
          احسب رحلتك في ثوانٍ، تصفح مسارات ومحطات خطوط المترو، واعرف قيمة تذكرتك ومحطات التبديل ومواعيد الرحلات.
        </p>
      </div>
    </div>
  );
}
