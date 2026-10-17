"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import styles from "./TransitReportModal.module.css";
import { TransitReportModalProps, ReportProblemOption } from "./types";

const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function TransitReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  title = "إبلاغ عن مشكلة",
  titleIcon = <i className="fa-solid fa-triangle-exclamation text-danger text-lg" />,
  category,
  user: userProp,
  limitChecking: limitCheckingProp,
  limitReached: limitReachedProp,
  problemOptions,
  defaultProblemType,
  scopeOptions = [],
  defaultScope,
  contextScopeId,
  contextInfo,
  contextDetailsText,
  getReportTitle,
  storageFolderPrefix = "transit",
  onSuccess,
}: TransitReportModalProps) {
  const { user: authUser } = useAuth();
  const currentUser = userProp !== undefined ? userProp : authUser;

  // Active Scope
  const initialScope = defaultScope || (scopeOptions.length > 0 ? scopeOptions[0].id : "general");
  const [activeScope, setActiveScope] = useState<string>(initialScope);

  // Active Problem Type
  const initialProblemType = defaultProblemType || (problemOptions.length > 0 ? problemOptions[0].id : "");
  const [selectedProblemType, setSelectedProblemType] = useState<string>(initialProblemType);
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState<boolean>(false);

  // Report fields
  const [details, setDetails] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  // Limit checking state (internal if not managed by parent)
  const [internalLimitChecking, setInternalLimitChecking] = useState(false);
  const [internalLimitReached, setInternalLimitReached] = useState(false);

  const isCheckingLimits = limitCheckingProp !== undefined ? limitCheckingProp : internalLimitChecking;
  const isLimitExceeded = limitReachedProp !== undefined ? limitReachedProp : internalLimitReached;

  // Check limits automatically on open if not managed by parent
  useEffect(() => {
    if (!isOpen || !currentUser || limitCheckingProp !== undefined) return;

    let isMounted = true;
    setInternalLimitChecking(true);

    isFeedbackLimitReached(currentUser.id)
      .then((reached) => {
        if (isMounted) {
          setInternalLimitReached(reached);
          setInternalLimitChecking(false);
        }
      })
      .catch((err) => {
        console.error("Error checking feedback limit:", err);
        if (isMounted) setInternalLimitChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser, limitCheckingProp]);

  // Sync initial scope / problem type if props change
  useEffect(() => {
    if (defaultScope) setActiveScope(defaultScope);
  }, [defaultScope]);

  useEffect(() => {
    if (defaultProblemType) setSelectedProblemType(defaultProblemType);
  }, [defaultProblemType]);

  if (!isOpen) return null;

  const handleImageSelect = (file: File | null) => {
    if (!file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      setError("حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    if (!loading) {
      handleImageSelect(null);
      setError("");
      setShowProblemTypeDropdown(false);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }
    if (!details.trim()) {
      setError("يرجى كتابة تفاصيل المشكلة أو الخطأ.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      let finalImageUrl = "";
      if (imageFile) {
        setUploading(true);
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const fileName = `${storageFolderPrefix}_${currentUser.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, imageFile, { upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (data?.publicUrl) {
            finalImageUrl = data.publicUrl;
          }
        }
        setUploading(false);
      }

      const curProblem =
        problemOptions.find((p) => p.id === selectedProblemType) || problemOptions[0];
      const problemTitle = curProblem?.title || "مشكلة غير محددة";

      // Build Report Title
      let reportTitle = "";
      if (getReportTitle) {
        reportTitle = getReportTitle(activeScope, curProblem);
      } else {
        reportTitle = `بلاغ ${category} (${problemTitle})`;
      }

      // Build Report Body
      const contentText = `بلاغ في (${category}):
${contextDetailsText ? contextDetailsText + "\n\n" : ""}نوع المشكلة: ${problemTitle}
نطاق البلاغ: ${activeScope}
تفاصيل المشكلة المبلغ عنها:
${details.trim()}`;

      // Insert into app_feedback table
      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: currentUser.id,
          type: "bug",
          category: category,
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Insert confirmation notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: currentUser.id,
            title: "تم استلام بلاغك بنجاح ",
            message: `شكراً لمساعدتنا في تدقيق البيانات. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        handleClose();
        setSuccess(false);
        setDetails("");
      }, 2200);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      setError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const currentProblemOption =
    problemOptions.find((p) => p.id === selectedProblemType) || problemOptions[0];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalBoxRef}
        className={styles.modal}
      >
        {/* Modal Header */}
        <div className={styles.header}>
          <h5 className={styles.title}>
            {titleIcon}
            <span>{title}</span>
          </h5>
          <button
            type="button"
            onClick={handleClose}
            className="btn-close"
            aria-label="إغلاق"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Modal Content */}
        <div className={styles.body}>
          {success ? (
            <div className={styles.stateWrapper}>
              <div className={styles.successIconBox}>
                <i className="bx bx-check" />
              </div>
              <h4 className={styles.stateTitle}>
                تم استلام بلاغك بنجاح!
              </h4>
              <p className={styles.stateDesc}>
                شكراً لمساهمتك في تدقيق وتحديث البيانات. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
              </p>
            </div>
          ) : isCheckingLimits ? (
            <div className={styles.stateWrapper}>
              <div className={styles.loadingSpinner} />
              <span className={styles.stateDesc}>جاري التحقق...</span>
            </div>
          ) : isLimitExceeded ? (
            <div className={styles.stateWrapper}>
              <div className={styles.stateIconImg}>
                <img
                  src="/images/icons3d/error.webp"
                  alt="error"
                  loading="lazy"
                />
              </div>
              <h5 className={styles.stateTitle}>
                تم الوصول للحد الأقصى من البلاغات المعلقة
              </h5>
              <p className={styles.stateDesc}>
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
          ) : !currentUser ? (
            <div className={styles.stateWrapper}>
              <div className={styles.loginIconBox}>
                <i className="bx bx-user" />
              </div>
              <h5 className={styles.stateTitle}>
                تسجيل الدخول مطلوب
              </h5>
              <p className={styles.stateDesc}>
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة ومتابعة حالته وكسب نقاط المساهمة.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/login"
                  className="btn btn-primary w-full"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Scope Selector */}
              {scopeOptions.length > 1 && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    نطاق المشكلة:
                  </label>
                  <div className={styles.scopeTabs}>
                    {scopeOptions.map((scope) => (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => setActiveScope(scope.id)}
                        className={`${styles.scopeBtn} ${
                          activeScope === scope.id ? styles.scopeBtnActive : ""
                        }`}
                      >
                        {scope.icon && <i className={`${scope.icon} ml-1`} />}
                        {scope.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Info Box (Route or Station summary) */}
              {(!contextScopeId || activeScope === contextScopeId) && contextInfo && (
                <div>{contextInfo}</div>
              )}

              {/* Custom Problem Type Dropdown Selector */}
              <div className={styles.dropdownContainer}>
                <label className={styles.fieldLabel}>
                  <span>نوع المشكلة:</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowProblemTypeDropdown((prev) => !prev)}
                  className={`${styles.dropdownTrigger} ${
                    showProblemTypeDropdown ? styles.dropdownTriggerActive : ""
                  }`}
                >
                  <div className={styles.dropdownContent}>
                    <div>
                      <div className={styles.dropdownTitle}>
                        {currentProblemOption?.title}
                      </div>
                      {currentProblemOption?.desc && (
                        <div className={styles.dropdownDesc}>
                          {currentProblemOption.desc}
                        </div>
                      )}
                    </div>
                  </div>

                  <i
                    className={`${styles.chevron} bx ${
                      showProblemTypeDropdown ? "bx-chevron-up" : "bx-chevron-down"
                    }`}
                  />
                </button>

                {showProblemTypeDropdown && (
                  <div className={styles.dropdownMenu}>
                    {problemOptions.map((opt) => {
                      const isSelected = opt.id === selectedProblemType;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedProblemType(opt.id);
                            setShowProblemTypeDropdown(false);
                          }}
                          className={`${styles.dropdownItem} ${
                            isSelected ? styles.dropdownItemSelected : ""
                          }`}
                        >
                          <div className={styles.dropdownContent}>
                            {opt.icon && <i className={`${opt.icon} text-secondary`} />}
                            <div>
                              <div className={styles.dropdownItemTitle}>
                                {opt.title}
                              </div>
                              {opt.desc && (
                                <div className={styles.dropdownItemDesc}>
                                  {opt.desc}
                                </div>
                              )}
                            </div>
                          </div>
                          {opt.badge && (
                            <span
                              className={styles.badge}
                              style={{
                                backgroundColor: opt.badgeColor
                                  ? `${opt.badgeColor}22`
                                  : "rgba(255,255,255,0.1)",
                                color: opt.badgeColor || "var(--text-secondary)",
                              }}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details Textarea */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span>
                    تفاصيل المشكلة : <span className={styles.required}>*</span>
                  </span>
                </label>
                <textarea
                  placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className={styles.textarea}
                  required
                />
              </div>

              {/* Image Upload Area */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span>صورة توضيحية (اختياري):</span>
                  <span className={styles.hint}>
                    JPG, PNG, WEBP (Max~5MB)
                  </span>
                </label>

                {!imagePreview ? (
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
                    className={`${styles.dropzone} ${
                      isDraggingImage ? styles.dropzoneDragging : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                      className={styles.fileInputHidden}
                    />

                    <div className={styles.uploadIconBox}>
                      <i className="bx bx-cloud-upload" />
                    </div>

                    <div>
                      <div className={styles.uploadPromptTitle}>
                        اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                      </div>
                      <div className={styles.uploadPromptDesc}>
                        أرسل صورة توضيحية للمشكلة إن وُجدت
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.previewBox}>
                    {/* Thumbnail */}
                    <div className={styles.thumbnailBox}>
                      <img
                        src={imagePreview}
                        alt="معاينة الصورة المرفقة"
                        className={styles.thumbnailImg}
                      />
                    </div>

                    {/* File details */}
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>
                        {imageFile?.name || "صورة توضيحية"}
                      </div>
                      <div className={styles.fileSize}>
                        <span>
                          {imageFile
                            ? imageFile.size < 1024 * 1024
                              ? `${(imageFile.size / 1024).toFixed(0)} KB`
                              : `${(imageFile.size / (1024 * 1024)).toFixed(1)} MB`
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => handleImageSelect(null)}
                      title="حذف الصورة"
                      className={styles.removeBtn}
                    >
                      <i className="bx bx-trash" />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className={styles.errorAlert}>
                  {error}
                </div>
              )}

              {/* Submit and Cancel Buttons */}
              <div className={styles.actionsRow}>
                <button
                  type="submit"
                  className={`btn btn-danger ${styles.btnSubmit}`}
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{uploading ? "يتم الرفع..." : "جاري الإرسال..."}</span>
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
                  className={`btn btn-cancel ${styles.btnCancel}`}
                  disabled={loading}
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
