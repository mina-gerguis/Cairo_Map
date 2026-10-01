import React from "react";

interface BottomReportBannerProps {
  onOpenReportModal: () => void;
}

export default function BottomReportBanner({ onOpenReportModal }: BottomReportBannerProps) {
  return (
    <div
      onClick={onOpenReportModal}
      className="bg-alert border border-secondary duration-200 cursor-pointer p-8 rounded-md flex items-center justify-between flex-wrap gap-4 mt-6 relative overflow-hidden"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-1.5">
          <img
            src="/images/icons3d/alert.webp"
            alt="Report"
            className="w-8 h-8 object-contain shrink-0"
          />
          <h3 className="m-0 text-lg font-extrabold text-primary font-sub">
            الإبلاغ عن مشكلة في خطوط المواصلات
          </h3>
        </div>
        <p className="m-0 text-sm text-secondary leading-relaxed">
          هل لاحظت أي خطأ في الأسعار، خطوات الطريق، أو وسائل المواصلات؟ شاركنا ملاحظتك لمساعدتنا في تدقيق الدليل وتحديثه باستمرار.
        </p>
      </div>
    </div>
  );
}
