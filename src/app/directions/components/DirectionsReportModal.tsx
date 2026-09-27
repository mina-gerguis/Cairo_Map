import React, { RefObject, useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { RouteOption } from "../types";
import { REPORT_PROBLEM_OPTIONS, MAX_UPLOAD_FILE_SIZE_BYTES } from "../constants";

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
  const [reportTargetScope, setReportTargetScope] = useState<"general" | "route">(
    reportingOption ? "route" : "general"
  );
  const [reportProblemType, setReportProblemType] = useState<string>("pricing");
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState<boolean>(false);
  const [reportDetails, setReportDetails] = useState<string>("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string>("");

  if (!isOpen) return null;

  const handleImageSelect = (file: File | null) => {
    if (!file) {
      if (reportImagePreview) {
        URL.revokeObjectURL(reportImagePreview);
      }
      setReportImageFile(null);
      setReportImagePreview(null);
      return;
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      setReportError("حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setReportError("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setReportError("");
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    if (!reportLoading) {
      handleImageSelect(null);
      onClose();
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أو الخطأ.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      let finalImageUrl = "";
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `directions_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const curOpt = REPORT_PROBLEM_OPTIONS.find(o => o.id === reportProblemType);
      const typeLabel = curOpt?.title || "مشكلة في خط مواصلات";

      let scopeInfo = "";
      if (reportTargetScope === "route" && resolvedFrom) {
        scopeInfo = `من: ${resolvedFrom}
إلى: ${resolvedTo}
وسيلة المواصلات: ${reportingOption?.typeName || "غير محدد"}
الأجرة المسجلة: ${reportingOption?.cost ? `${reportingOption.cost} ج.م` : "غير محدد"}
الوقت المقدر: ${reportingOption?.duration || "غير محدد"}`;
      }

      const contentText = `بلاغ عن مشكلة في دليل الانتقال (ازاي اروح):
${scopeInfo ? scopeInfo + "\n\n" : ""}نوع المشكلة: ${typeLabel}
تفاصيل المشكلة المبلغ عنها:
${reportDetails.trim()}`;

      const reportTitle = reportTargetScope === "route" && resolvedFrom
        ? `مشكلة خط مواصلات: من ${resolvedFrom} إلى ${resolvedTo}`
        : `مشكلة في دليل ازاي اروح (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "ازاي اروح - خطوط مواصلات",
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Send confirmation notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح ",
            message: `شكراً لمساعدتنا في تدقيق دليل مسارات المواصلات. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        handleClose();
        setReportSuccess(false);
        setReportDetails("");
      }, 2200);
    } catch (err: any) {
      console.error("Error submitting directions report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-modal flex items-center justify-center p-4">
      <div
        ref={modalBoxRef}
        className="bg-surface rounded-lg border border-glass w-full max-w-lg max-h-90vh shadow-2xl flex flex-col overflow-hidden font-cairo"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-glass flex justify-between items-center bg-subtle">
          <h5 className="m-0 text-base sm:text-lg font-extrabold text-primary flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation text-danger text-lg" />
            <span>مشكلة في دليل مسارات المواصلات</span>
          </h5>
          <button
            type="button"
            onClick={handleClose}
            className="btn-close"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 max-h-80vh overflow-y-auto">
          {reportSuccess ? (
            <div className="text-center py-8 px-2.5">
              <div className="w-16 h-16 rounded-full bg-success-subtle text-success flex items-center justify-center text-3xl mx-auto mb-4">
                <i className="bx bx-check" />
              </div>
              <h4 className="m-0 mb-2 text-lg font-extrabold text-primary">
                تم استلام بلاغك بنجاح!
              </h4>
              <p className="m-0 text-sm text-secondary leading-relaxed">
                شكراً لمساهمتك في تدقيق وتحديث أسعار ومسارات المواصلات. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
              </p>
            </div>
          ) : limitChecking ? (
            <div className="text-center p-10">
              <div className="w-8 h-8 border-3 border-glass border-t-secondary rounded-full animate-spin mx-auto mb-3" />
              <span className="text-muted text-sm">جاري التحقق...</span>
            </div>
          ) : limitReached ? (
            <div className="text-center py-5 px-2.5">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-3.5">
                <img
                  src="/images/icons3d/error.png"
                  alt="error"
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>
              <h5 className="m-0 mb-2 text-lg font-extrabold text-primary">
                تم الوصول للحد الأقصى من البلاغات المعلقة
              </h5>
              <p className="m-0 mb-4 text-sm text-secondary leading-relaxed">
                لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
              </p>
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleClose}
              >
                حسناً، فهمت
              </button>
            </div>
          ) : !user ? (
            <div className="text-center py-5 px-2.5">
              <div className="w-14 h-14 rounded-full bg-brand-subtle text-brand flex items-center justify-center text-3xl mx-auto mb-3.5">
                <i className="bx bx-user" />
              </div>
              <h5 className="m-0 mb-2 text-lg font-extrabold text-primary">
                تسجيل الدخول مطلوب
              </h5>
              <p className="m-0 mb-5 text-sm text-secondary leading-relaxed">
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة ومتابعة حالته وكسب نقاط المساهمة.
              </p>
              <div className="flex gap-2.5 justify-center">
                <Link
                  href="/login"
                  className="btn btn-primary w-full"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="flex flex-col gap-4">
              {/* Scope Selector */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">
                  نطاق المشكلة:
                </label>
                <div className="tabs w-full">
                  <button
                    type="button"
                    onClick={() => setReportTargetScope("general")}
                    className={`py-1.5 px-3 rounded-lg border-none font-bold text-xs cursor-pointer font-body transition ${
                      reportTargetScope === "general"
                        ? "bg-tab-active text-tab-active"
                        : "bg-transparent text-primary"
                    }`}
                  >
                    مشكلة عامة
                  </button>

                  {resolvedFrom && (
                    <button
                      type="button"
                      onClick={() => setReportTargetScope("route")}
                      className={`py-1.5 px-3 rounded-lg border-none font-bold text-xs cursor-pointer font-body transition ${
                        reportTargetScope === "route"
                          ? "bg-tab-active text-tab-active"
                          : "bg-transparent text-primary"
                      }`}
                    >
                      المسار الحالي
                    </button>
                  )}
                </div>
              </div>

              {/* Route Summary Box */}
              {reportTargetScope === "route" && resolvedFrom && (
                <div className="p-3 px-3.5 rounded-xl bg-brand-subtle border border-brand-subtle text-sm text-primary leading-relaxed">
                  <div>من: <strong>{resolvedFrom}</strong> ← إلى: <strong>{resolvedTo}</strong></div>
                  {reportingOption && (
                    <div className="text-xs text-secondary mt-1">
                      • الوسيلة: {reportingOption.typeName} <br />• الأجرة: {reportingOption.cost} ج.م <br />• الوقت: {reportingOption.duration}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Problem Type Dropdown Selector */}
              <div className="relative">
                <label className="flex justify-between items-center text-sm font-bold text-primary mb-1.5">
                  <span>نوع المشكلة:</span>
                </label>

                {(() => {
                  const curOpt = REPORT_PROBLEM_OPTIONS.find(o => o.id === reportProblemType) || REPORT_PROBLEM_OPTIONS[0];
                  return (
                    <button
                      type="button"
                      onClick={() => setShowProblemTypeDropdown(prev => !prev)}
                      className={`w-full py-2.5 px-3 rounded-xl bg-secondary text-primary border flex items-center justify-between cursor-pointer transition text-right font-body ${
                        showProblemTypeDropdown ? "border-primary" : "border-glass"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="min-w-0 text-right">
                          <div className="text-sm font-bold text-primary truncate">
                            {curOpt.title}
                          </div>
                          <div className="text-xs text-secondary truncate">
                            {curOpt.desc}
                          </div>
                        </div>
                      </div>

                      <i
                        className={`text-xl text-secondary mr-2 shrink-0 ${
                          showProblemTypeDropdown ? "bx bx-chevron-up" : "bx bx-chevron-down"
                        }`}
                      />
                    </button>
                  );
                })()}

                {showProblemTypeDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-secondary border border-glass rounded-xl z-50 max-h-72 overflow-y-auto mt-1.5 p-1.5 flex flex-col gap-1">
                    {REPORT_PROBLEM_OPTIONS.map((opt) => {
                      const isSelected = opt.id === reportProblemType;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setReportProblemType(opt.id);
                            setShowProblemTypeDropdown(false);
                          }}
                          className={`p-2 px-2.5 rounded-lg cursor-pointer flex items-center justify-between gap-2.5 border transition ${
                            isSelected
                              ? "bg-surface border-border"
                              : "bg-transparent border-transparent hover:bg-subtle"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="min-w-0 text-right">
                              <div className={`text-sm ${isSelected ? "font-extrabold" : "font-semibold"} text-primary`}>
                                {opt.title}
                              </div>
                              <div className="text-xs text-muted">
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details Textarea */}
              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">
                  تفاصيل المشكلة : <span className="text-danger">*</span>
                </label>
                <textarea
                  placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: الأجرة زادت وأصبحت 25 جنيه بدلاً من 20، أو الميكروباص يمر بمحطة كذا)..."
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  className="input-fields w-full min-h-24 p-3 rounded-xl bg-secondary text-primary border border-glass font-body text-sm resize-y"
                  required
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="flex justify-between items-center text-sm font-bold text-primary mb-1.5">
                  <span>صورة توضيحية (اختياري):</span>
                  <span className="text-xs text-secondary font-normal font-body">
                    JPG, PNG, WEBP (Max~5MB)
                  </span>
                </label>

                {!reportImagePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) handleImageSelect(droppedFile);
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      isDraggingImage
                        ? "border-brand bg-brand-subtle"
                        : "border-glass bg-subtle hover:bg-brand-subtle"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="w-11 h-11 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-2xl">
                      <i className="bx bx-cloud-upload" />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-primary mb-0.5">
                        اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                      </div>
                      <div className="text-xs text-secondary">
                        أرسل صورة الخطأ أو موقف المواصلات إن وُجد
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative border border-glass rounded-xl bg-secondary p-2.5 px-3 flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black border border-glass flex items-center justify-center relative">
                      <img
                        src={reportImagePreview}
                        alt="معاينة الصورة المرفقة"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-primary truncate">
                        {reportImageFile?.name || "صورة توضيحية"}
                      </div>
                      <div className="text-xs text-secondary mt-1 flex items-center gap-1.5">
                        <span>
                          {reportImageFile
                            ? reportImageFile.size < 1024 * 1024
                              ? `${(reportImageFile.size / 1024).toFixed(0)} KB`
                              : `${(reportImageFile.size / (1024 * 1024)).toFixed(1)} MB`
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleImageSelect(null)}
                        title="حذف الصورة"
                        className="py-1.5 px-2.5 rounded-lg bg-danger-subtle border border-danger-subtle text-danger text-xs font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <i className="bx bx-trash" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {reportError && (
                <div className="py-2.5 px-3.5 rounded-lg bg-danger-subtle border border-danger-subtle text-danger text-sm">
                  {reportError}
                </div>
              )}

              {/* Submit and Cancel Buttons */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="submit"
                  className={`btn btn-danger font-bold text-sm flex items-center justify-center gap-1.5 w-1/2 flex-1 ${
                    reportLoading ? "cursor-wait" : "cursor-pointer"
                  }`}
                  disabled={reportLoading || reportUploading}
                >
                  {reportLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{reportUploading ? "يتم الرفع..." : "جاري الإرسال..."}</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send" />
                      <span>إرسال البلاغ</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel font-bold text-sm w-1/2"
                  disabled={reportLoading}
                  onClick={handleClose}
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
