import React, { RefObject } from "react";
import { User } from "@supabase/supabase-js";
import TransitReportModal from "@/components/common/TransitReportModal";
import { ReportProblemOption } from "@/components/common/TransitReportModal/types";

export const DIRECTORY_REPORT_PROBLEM_OPTIONS: ReportProblemOption[] = [
  {
    id: "wrong_number",
    title: "رقم هاتف غير صحيح أو مفصول",
    desc: "الرقم غير متاح، لا يرد، أو تم تغييره",
    icon: "fa-solid fa-phone-slash",
  },
  {
    id: "wrong_details",
    title: "بيانات الجهة غير دقيقة",
    desc: "اسم الجهة، التخصص، أو الوصف يحتاج إلى تعديل",
    icon: "fa-solid fa-pen-to-square",
  },
  {
    id: "add_service",
    title: "اقتراح إضافة رقم أو جهة جديدة",
    desc: "إضافة جهة خدمية، طوارئ، مستشفى أو بنك غير متوفر بالدليل",
    icon: "fa-solid fa-plus",
  },
  {
    id: "telecom_code",
    title: "كود شبكة محمول خاطئ أو غير متاح",
    desc: "كود باقة، خدمة، أو شحن لشركات (فودافون، أورنج، اتصالات، وي)",
    icon: "fa-solid fa-sim-card",
  },
  {
    id: "other",
    title: "مشكلة أو اقتراح آخر",
    desc: "أي مشكلة فنية أو ملاحظة تود مشاركتها معنا",
    icon: "fa-solid fa-comment-dots",
  },
];

export interface DirectoryReportTarget {
  type: "phone" | "code" | "general";
  name?: string;
  numberOrCode?: string;
  specialty?: string;
}

interface DirectoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef?: RefObject<HTMLDivElement | null>;
  user?: User | null;
  limitChecking?: boolean;
  limitReached?: boolean;
  reportingTarget?: DirectoryReportTarget | null;
}

export default function DirectoryReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  user,
  limitChecking,
  limitReached,
  reportingTarget,
}: DirectoryReportModalProps) {
  const scopeOptions = [
    { id: "general", label: "بلاغ عام" },
    ...(reportingTarget?.name ? [{ id: "target", label: reportingTarget.name }] : []),
  ];

  let scopeInfoText = "";
  if (reportingTarget?.name) {
    scopeInfoText = `الجهة / الرقم: ${reportingTarget.name}
${reportingTarget.specialty ? `التصنيف: ${reportingTarget.specialty}\n` : ""}${reportingTarget.numberOrCode ? `الرقم أو الكود: ${reportingTarget.numberOrCode}` : ""}`;
  }

  const contextInfo = reportingTarget?.name ? (
    <div className="p-3 px-3.5 rounded-xl bg-brand-subtle border border-brand-subtle text-sm text-primary leading-relaxed">
      <div>الجهة: <strong>{reportingTarget.name}</strong> {reportingTarget.specialty ? `(${reportingTarget.specialty})` : ""}</div>
      {reportingTarget.numberOrCode && (
        <div className="text-xs text-secondary mt-1">
          • الرقم / الكود: <span dir="ltr">{reportingTarget.numberOrCode}</span>
        </div>
      )}
    </div>
  ) : null;

  return (
    <TransitReportModal
      isOpen={isOpen}
      onClose={onClose}
      modalBoxRef={modalBoxRef}
      user={user}
      limitChecking={limitChecking}
      limitReached={limitReached}
      title="الإبلاغ عن مشكلة في دليل الهاتف"
      titleIcon={<i className="fa-solid fa-triangle-exclamation text-danger text-lg" />}
      category="دليل الهاتف والخدمات العامة"
      storageFolderPrefix="directory"
      problemOptions={DIRECTORY_REPORT_PROBLEM_OPTIONS}
      defaultProblemType={
        reportingTarget?.type === "code"
          ? "telecom_code"
          : reportingTarget?.type === "phone"
          ? "wrong_number"
          : "wrong_number"
      }
      scopeOptions={scopeOptions}
      defaultScope={reportingTarget?.name ? "target" : "general"}
      contextScopeId="target"
      contextInfo={contextInfo}
      contextDetailsText={scopeInfoText}
      getReportTitle={(scope, opt) =>
        scope === "target" && reportingTarget?.name
          ? `مشكلة دليل الهاتف: ${reportingTarget.name} (${opt.title})`
          : `مشكلة في دليل الهاتف (${opt.title})`
      }
    />
  );
}
