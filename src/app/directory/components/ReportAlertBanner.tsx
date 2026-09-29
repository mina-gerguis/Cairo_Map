import React from "react";
import { ReportAlertBannerProps } from "../types";

export default function ReportAlertBanner({
  reportBannerRef,
  onOpenModal,
}: ReportAlertBannerProps) {
  return (
    <div
      ref={reportBannerRef}
      onClick={onOpenModal}
      className="bg-alert border border-secondary duration-200 cursor-pointer p-8 rounded-md flex items-center justify-between flex-wrap gap-4 mt-6 relative overflow-hidden"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-1.5">
          <img
            src="/images/icons3d/alert.png"
            alt="Report"
            className="w-8 h-8 object-contain shrink-0"
          />
          <h3 className="m-0 text-lg font-extrabold text-primary font-sub">
            الإبلاغ عن مشكلة في دليل الهاتف والخدمات
          </h3>
        </div>
        <p className="m-0 text-sm text-secondary leading-relaxed">
          هل لاحظت أي رقم غير صالح أو خطأ في أكواد الشبكات؟ شاركنا ملاحظتك لمساعدتنا في تدقيق الدليل وتحديثه باستمرار.
        </p>
      </div>
    </div>
  );
}

