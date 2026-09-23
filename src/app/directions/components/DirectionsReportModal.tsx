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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        direction: "rtl"
      }}
    >
      <div
        ref={modalBoxRef}
        style={{
          backgroundColor: "var(--bgPrimary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--border-glass)",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--font-cairo)"
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-glass)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.02)"
          }}
        >
          <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }}></i>
            <span>مشكلة في دليل مسارات المواصلات</span>
          </h5>
          <button
            type="button"
            onClick={handleClose}
            className="btn-close"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
          {reportSuccess ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(52, 199, 89, 0.15)",
                  color: "#34c759",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 16px"
                }}
              >
                <i className="bx bx-check"></i>
              </div>
              <h4 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                تم استلام بلاغك بنجاح!
              </h4>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                شكراً لمساهمتك في تدقيق وتحديث أسعار ومسارات المواصلات. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
              </p>
            </div>
          ) : limitChecking ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  border: "3px solid rgba(255,255,255,0.1)",
                  borderTopColor: "var(--color-secondary)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px"
                }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري التحقق...</span>
            </div>
          ) : limitReached ? (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px"
                }}
              >
                <img src="/images/icons3d/error.png" alt="error" style={{ width: "100%", height: "100%", objectFit: "contain" }} loading="lazy" />
              </div>
              <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                تم الوصول للحد الأقصى من البلاغات المعلقة
              </h5>
              <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
                style={{ width: "100%" }}
              >
                حسناً، فهمت
              </button>
            </div>
          ) : !user ? (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  margin: "0 auto 14px"
                }}
              >
                <i className="bx bx-user"></i>
              </div>
              <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                تسجيل الدخول مطلوب
              </h5>
              <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة ومتابعة حالته وكسب نقاط المساهمة.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Scope Selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                  نطاق المشكلة:
                </label>
                <div
                  className="tabs"
                  style={{
                    display: "grid",
                    gridTemplateColumns: resolvedFrom ? "repeat(2, 1fr)" : "1fr",
                    gap: "6px"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setReportTargetScope("general")}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "8px",
                      border: "none",
                      background: reportTargetScope === "general" ? "var(--tab-active-bg)" : "transparent",
                      color: reportTargetScope === "general" ? "var(--tab-active-color)" : "var(--text-primary)",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)"
                    }}
                  >
                    مشكلة عامة
                  </button>

                  {resolvedFrom && (
                    <button
                      type="button"
                      onClick={() => setReportTargetScope("route")}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "8px",
                        border: "none",
                        background: reportTargetScope === "route" ? "var(--tab-active-bg)" : "transparent",
                        color: reportTargetScope === "route" ? "var(--tab-active-color)" : "var(--text-primary)",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)"
                      }}
                    >
                      المسار الحالي
                    </button>
                  )}
                </div>
              </div>

              {/* Route Summary Box */}
              {reportTargetScope === "route" && resolvedFrom && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.06)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    fontSize: "0.84rem",
                    color: "var(--text-primary)",
                    lineHeight: "1.6"
                  }}
                >
                  <div>من: <strong>{resolvedFrom}</strong> ← إلى: <strong>{resolvedTo}</strong></div>
                  {reportingOption && (
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      • الوسيلة: {reportingOption.typeName} <br />• الأجرة: {reportingOption.cost} ج.م <br />• الوقت: {reportingOption.duration}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Problem Type Dropdown Selector */}
              <div style={{ position: "relative" }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                  <span>نوع المشكلة:</span>
                </label>

                {(() => {
                  const curOpt = REPORT_PROBLEM_OPTIONS.find(o => o.id === reportProblemType) || REPORT_PROBLEM_OPTIONS[0];
                  return (
                    <button
                      type="button"
                      onClick={() => setShowProblemTypeDropdown(prev => !prev)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "var(--radius-card)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: showProblemTypeDropdown ? `1px solid var(--text-primary)` : "1px solid var(--border-glass)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "right",
                        fontFamily: "var(--font-body)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div style={{ minWidth: 0, textAlign: "right" }}>
                          <div style={{ fontSize: "0.86rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {curOpt.title}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {curOpt.desc}
                          </div>
                        </div>
                      </div>

                      <i className={showProblemTypeDropdown ? "bx bx-chevron-up" : "bx bx-chevron-down"} style={{ fontSize: "1.25rem", color: "var(--text-secondary)", marginRight: "8px", flexShrink: 0 }} />
                    </button>
                  );
                })()}

                {showProblemTypeDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "var(--radius-card)",
                      zIndex: 1200,
                      maxHeight: "360px",
                      overflowY: "auto",
                      marginTop: "6px",
                      padding: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    {REPORT_PROBLEM_OPTIONS.map((opt) => {
                      const isSelected = opt.id === reportProblemType;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setReportProblemType(opt.id);
                            setShowProblemTypeDropdown(false);
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "var(--radius-card)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            background: isSelected ? "var(--bgPrimary)" : "transparent",
                            border: isSelected ? `1px solid var(--border-primary)` : "1px solid transparent",
                            transition: "all 0.15s ease"
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                            <div style={{ minWidth: 0, textAlign: "right" }}>
                              <div style={{ fontSize: "0.84rem", fontWeight: isSelected ? "800" : "600", color: "var(--text-primary)" }}>
                                {opt.title}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
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
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                  تفاصيل المشكلة : <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: الأجرة زادت وأصبحت 25 جنيه بدلاً من 20، أو الميكروباص يمر بمحطة كذا)..."
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  className="input-fields"
                  required
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-glass)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                  <span>صورة توضيحية (اختياري):</span>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", fontWeight: "normal", fontFamily: "var(--font-body)" }}>
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
                    style={{
                      position: "relative",
                      border: isDraggingImage ? "2px dashed var(--color-secondary)" : "2px dashed var(--borderDashed)",
                      borderRadius: "12px",
                      background: isDraggingImage ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      padding: "20px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isDraggingImage) e.currentTarget.style.background = "var(--hoverBtn)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isDraggingImage) e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />

                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        background: "rgba(59, 130, 246, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-secondary)",
                        fontSize: "1.4rem"
                      }}
                    >
                      <i className="bx bx-cloud-upload"></i>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "3px" }}>
                        اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                        أرسل صورة الخطأ أو موقف المواصلات إن وُجد
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#000",
                        border: "1px solid var(--border-glass)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                      }}
                    >
                      <img
                        src={reportImagePreview}
                        alt="معاينة الصورة المرفقة"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    </div>

                    {/* File details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.86rem",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {reportImageFile?.name || "صورة توضيحية"}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleImageSelect(null)}
                        title="حذف الصورة"
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "#ef4444",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <i className="bx bx-trash"></i>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {reportError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    fontSize: "0.85rem"
                  }}
                >
                  {reportError}
                </div>
              )}

              {/* Submit and Cancel Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={reportLoading || reportUploading}
                  style={{
                    flex: 1,
                    fontWeight: "700",
                    fontSize: "0.92rem",
                    cursor: reportLoading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    width: "50%",
                  }}
                >
                  {reportLoading ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      <span>{reportUploading ? "يتم الرفع..." : "جاري الإرسال..."}</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send"></i>
                      <span>إرسال البلاغ</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  disabled={reportLoading}
                  onClick={handleClose}
                  style={{
                    fontWeight: "700",
                    fontSize: "0.92rem",
                    width: "50%",
                  }}
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
