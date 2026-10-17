import React from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { DirectoryModalProps } from "../types";
import { COMPANY_META } from "../constants";
import styles from "../directory.module.css";

export default function DirectoryModal({
  modalBoxRef,
  modalState,
  specialties,
}: DirectoryModalProps) {
  const { user } = useAuth();

  const {
    modalOpen,
    setModalOpen,
    modalMode,
    setModalMode,
    modalType,
    setModalType,
    itemName,
    setItemName,
    itemNumberOrCode,
    setItemNumberOrCode,
    itemSpecialty,
    setItemSpecialty,
    customSpecialty,
    setCustomSpecialty,
    itemCompany,
    setItemCompany,
    modalNotes,
    setModalNotes,
    modalImagePreview,
    isDraggingImage,
    setIsDraggingImage,
    modalLoading,
    modalUploading,
    modalSuccess,
    modalError,
    limitReached,
    handleModalImageSelect,
    handleSubmitModal,
  } = modalState;

  if (!modalOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div ref={modalBoxRef} className={styles.modalBox}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h5
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i
              className={
                modalMode === "suggest"
                  ? "fa-solid fa-lightbulb"
                  : "fa-solid fa-triangle-exclamation"
              }
              style={{
                color: modalMode === "suggest" ? "#f59e0b" : "#ef4444",
                fontSize: "1.1rem",
              }}
            ></i>
            <span>
              {modalMode === "suggest"
                ? "اقتراح إضافة رقم أو كود جديد"
                : "الإبلاغ عن خطأ في دليل الهاتف"}
            </span>
          </h5>
          <button
            type="button"
            onClick={() => {
              if (!modalLoading) {
                setModalOpen(false);
                handleModalImageSelect(null);
              }
            }}
            className="btn-close"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          {modalSuccess ? (
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
                  margin: "0 auto 16px",
                }}
              >
                <i className="bx bx-check"></i>
              </div>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                تم إرسال طلبك بنجاح!
              </h4>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.88rem",
                  lineHeight: "1.6",
                }}
              >
                شكراً جزيلاً لمساعدتك في إثراء وتدقيق دليل الهاتف. سيقوم فريقنا بمراجعته وإضافته قريباً.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitModal}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Auth Warning */}
              {!user && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "#ef4444",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }}></i>
                  <span>يرجى تسجيل الدخول بحسابك أولاً لتتمكن من إرسال طلبك.</span>
                </div>
              )}

              {/* Limit Warning */}
              {limitReached && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    color: "var(--colorWarning, #f59e0b)",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }}></i>
                  <span>
                    لقد بلغت الحد الأقصى للبلاغات اليومية (3 طلبات). يرجى المحاولة غداً.
                  </span>
                </div>
              )}

              {/* Error Alert */}
              {modalError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "#ef4444",
                    fontSize: "0.82rem",
                  }}
                >
                  {modalError}
                </div>
              )}

              {/* Mode Selector */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalMode("suggest")}
                  style={{
                    padding: "7px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    background:
                      modalMode === "suggest"
                        ? "var(--color-secondary)"
                        : "var(--bg-secondary)",
                    color:
                      modalMode === "suggest" ? "#ffffff" : "var(--text-secondary)",
                    border:
                      modalMode === "suggest"
                        ? "1px solid var(--color-secondary)"
                        : "1px solid var(--border-glass)",
                  }}
                >
                  💡 اقتراح رقم / كود جديد
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode("report")}
                  style={{
                    padding: "7px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    background:
                      modalMode === "report"
                        ? "var(--color-secondary)"
                        : "var(--bg-secondary)",
                    color:
                      modalMode === "report" ? "#ffffff" : "var(--text-secondary)",
                    border:
                      modalMode === "report"
                        ? "1px solid var(--color-secondary)"
                        : "1px solid var(--border-glass)",
                  }}
                >
                  ⚠️ إبلاغ عن خطأ موجود
                </button>
              </div>

              {/* Type Selector (Phone vs Code) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalType("phone")}
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    fontSize: "0.76rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    background:
                      modalType === "phone"
                        ? "rgba(59, 130, 246, 0.12)"
                        : "var(--bg-secondary)",
                    color:
                      modalType === "phone"
                        ? "var(--color-secondary)"
                        : "var(--text-secondary)",
                    border:
                      modalType === "phone"
                        ? "1px solid var(--color-secondary)"
                        : "1px solid var(--border-glass)",
                  }}
                >
                  <i className="fa-solid fa-phone" style={{ marginLeft: "4px" }}></i>
                  رقم هاتف / خط ساخن
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("code")}
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    fontSize: "0.76rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    background:
                      modalType === "code"
                        ? "rgba(59, 130, 246, 0.12)"
                        : "var(--bg-secondary)",
                    color:
                      modalType === "code"
                        ? "var(--color-secondary)"
                        : "var(--text-secondary)",
                    border:
                      modalType === "code"
                        ? "1px solid var(--color-secondary)"
                        : "1px solid var(--border-glass)",
                  }}
                >
                  <i className="fa-solid fa-hashtag" style={{ marginLeft: "4px" }}></i>
                  كود شبكة محمول
                </button>
              </div>

              {/* Item Name */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  {modalType === "phone"
                    ? "اسم الجهة أو الخدمة:"
                    : "اسم الخدمة أو الغرض من الكود:"}
                </label>
                <input
                  type="text"
                  className="input-fields"
                  placeholder={
                    modalType === "phone"
                      ? "مثال: بنك مصر، طوارئ الغاز، مستشفى..."
                      : "مثال: معرفة الرصيد، باقة فليكس..."
                  }
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  style={{ width: "100%", fontSize: "0.85rem" }}
                />
              </div>

              {/* Item Number or Code */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  {modalType === "phone"
                    ? "رقم الهاتف / الخط الساخن:"
                    : "الكود المطلوب:"}
                </label>
                <input
                  type="text"
                  className="input-fields"
                  placeholder={
                    modalType === "phone"
                      ? "مثال: 19888 أو 0233333333"
                      : "مثال: *888# أو *86*..."
                  }
                  value={itemNumberOrCode}
                  onChange={(e) => setItemNumberOrCode(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    direction: "ltr",
                    textAlign: "right",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              {/* Specialty / Company Picker */}
              {modalType === "phone" ? (
                <div>
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    التخصص أو الفئة:
                  </label>
                  <select
                    className="input-fields"
                    value={itemSpecialty}
                    onChange={(e) => setItemSpecialty(e.target.value)}
                    style={{ width: "100%", fontSize: "0.85rem" }}
                  >
                    <option value="">اختر التخصص (اختياري)...</option>
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                    <option value="other">تخصص آخر...</option>
                  </select>
                  {itemSpecialty === "other" && (
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="اكتب التخصص هنا..."
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: "6px",
                        fontSize: "0.85rem",
                      }}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    شركة الاتصالات:
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "6px",
                    }}
                  >
                    {Object.entries(COMPANY_META).map(([key, meta]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setItemCompany(key)}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          border:
                            itemCompany === key
                              ? `2px solid ${meta.color}`
                              : "1px solid var(--border-glass)",
                          background:
                            itemCompany === key ? meta.bg : "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Image
                          src={`/images/company/${meta.logo}`}
                          alt={meta.label}
                          width={18}
                          height={18}
                          style={{ borderRadius: "50%" }}
                        />
                        {meta.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Textarea */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  ملاحظات أو تفاصيل إضافية:
                </label>
                <textarea
                  className="input-fields"
                  rows={2}
                  placeholder="أوقات العمل، طريقة الاستخدام، أو تفاصيل الخطأ..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  style={{
                    width: "100%",
                    fontSize: "0.85rem",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Image Attachment Dropzone */}
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  إرفاق صورة توضيحية (اختياري):
                </label>
                {modalImagePreview ? (
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <img
                      src={modalImagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "120px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleModalImageSelect(null)}
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        background: "rgba(239, 68, 68, 0.8)",
                        border: "none",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        color: "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      if (e.dataTransfer.files?.[0])
                        handleModalImageSelect(e.dataTransfer.files[0]);
                    }}
                    className={styles.dropzone}
                    style={{
                      border: isDraggingImage
                        ? "2px dashed var(--color-secondary)"
                        : "2px dashed var(--border-glass)",
                      background: isDraggingImage
                        ? "rgba(59, 130, 246, 0.05)"
                        : "transparent",
                    }}
                    onClick={() => {
                      const input = document.getElementById(
                        "directory-modal-img-input"
                      );
                      if (input) input.click();
                    }}
                  >
                    <i
                      className="fa-solid fa-cloud-arrow-up"
                      style={{
                        fontSize: "1.3rem",
                        color: "var(--text-muted)",
                        marginBottom: "2px",
                      }}
                    ></i>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      اسحب الصورة هنا أو اضغط للاختيار من جهازك
                    </div>
                    <input
                      id="directory-modal-img-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          handleModalImageSelect(e.target.files[0]);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    handleModalImageSelect(null);
                  }}
                  className="btn"
                  style={{
                    flex: 1,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !user || limitReached}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor:
                      modalLoading || !user || limitReached
                        ? "not-allowed"
                        : "pointer",
                    opacity: modalLoading || !user || limitReached ? 0.6 : 1,
                  }}
                >
                  {modalLoading ? (
                    <span>
                      <i
                        className="fa-solid fa-spinner fa-spin"
                        style={{ marginLeft: "6px" }}
                      ></i>
                      {modalUploading
                        ? "جاري رفع الصورة..."
                        : "جاري الإرسال..."}
                    </span>
                  ) : (
                    <span>
                      <i
                        className="fa-solid fa-paper-plane"
                        style={{ marginLeft: "6px" }}
                      ></i>
                      إرسال الطلب للإدارة
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
