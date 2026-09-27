import React, { RefObject } from "react";
import { User } from "@supabase/supabase-js";
import TransitReportModal from "@/components/common/TransitReportModal";
import { RouteOption } from "../types";
import { REPORT_PROBLEM_OPTIONS } from "../constants";

interface DirectionsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef: RefObject<HTMLDivElement | null>;
  user: User | null;
  limitChecking: boolean;
  limitReached: boolean;
  reportingOption: RouteOption | null;
  resolvedFrom: string;
  resolvedTo: string;
}

export default function DirectionsReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  user,
  limitChecking,
  limitReached,
  reportingOption,
  resolvedFrom,
  resolvedTo,
}: DirectionsReportModalProps) {
  const scopeOptions = [
    { id: "general", label: "مشكلة عامة" },
    ...(resolvedFrom ? [{ id: "route", label: "المسار الحالي" }] : []),
  ];

  let scopeInfoText = "";
  if (resolvedFrom) {
    scopeInfoText = `من: ${resolvedFrom}
إلى: ${resolvedTo}
وسيلة المواصلات: ${reportingOption?.typeName || "غير محدد"}
الأجرة المسجلة: ${reportingOption?.cost ? `${reportingOption.cost} ج.م` : "غير محدد"}
الوقت المقدر: ${reportingOption?.duration || "غير محدد"}`;
  }

  const contextInfo = resolvedFrom ? (
    <div className="p-3 px-3.5 rounded-xl bg-brand-subtle border border-brand-subtle text-sm text-primary leading-relaxed">
      <div>من: <strong>{resolvedFrom}</strong> ← إلى: <strong>{resolvedTo}</strong></div>
      {reportingOption && (
        <div className="text-xs text-secondary mt-1">
          • الوسيلة: {reportingOption.typeName} <br />
          • الأجرة: {reportingOption.cost} ج.م <br />
          • الوقت: {reportingOption.duration}
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
      title="مشكلة في دليل مسارات المواصلات"
      titleIcon={<i className="fa-solid fa-triangle-exclamation text-danger text-lg" />}
      category="ازاي اروح - خطوط مواصلات"
      storageFolderPrefix="directions"
      problemOptions={REPORT_PROBLEM_OPTIONS}
      defaultProblemType="pricing"
      scopeOptions={scopeOptions}
      defaultScope={reportingOption ? "route" : "general"}
      contextScopeId="route"
      contextInfo={contextInfo}
      contextDetailsText={scopeInfoText}
      getReportTitle={(scope, opt) =>
        scope === "route" && resolvedFrom
          ? `مشكلة خط مواصلات: من ${resolvedFrom} إلى ${resolvedTo}`
          : `مشكلة في دليل ازاي اروح (${opt.title})`
      }
    />
  );
}
