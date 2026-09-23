"use client";

import React from "react";
import Link from "next/link";
import { ParkingSuggestModalProps } from "../types";
import { SUGGEST_GARAGE_TYPES, SUGGEST_AVAILABLE_FEATURES } from "../constants";

export function ParkingSuggestModal({
  isOpen,
  onClose,
  user,
  areas,
  suggestName,
  setSuggestName,
  suggestArea,
  setSuggestArea,
  suggestAddress,
  setSuggestAddress,
  suggestNearestMetro,
  setSuggestNearestMetro,
  suggestType,
  setSuggestType,
  suggestHourlyRate,
  setSuggestHourlyRate,
  suggestCapacity,
  setSuggestCapacity,
  suggestMapLink,
  setSuggestMapLink,
  suggestFeatures,
  onToggleFeature,
  suggestNotes,
  setSuggestNotes,
  suggestImageFile,
  suggestImagePreview,
  isDraggingSuggestImage,
  setIsDraggingSuggestImage,
  onImageSelect,
  suggestLoading,
  suggestUploading,
  suggestSuccess,
  suggestError,
  suggestLimitChecking,
  suggestLimitReached,
  onSubmit,
}: ParkingSuggestModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggest-modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
        direction: "rtl",
        fontFamily: "var(--font-cairo)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !suggestLoading) {
          onClose();
        }
      }}
    >
      <div
        className="metro-animate-slide-up"
        style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card)",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-glass)",
            position: "sticky",
            top: 0,
            backgroundColor: "var(--bgPrimary)",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-secondary, #3b82f6)",
                fontSize: "1.2rem",
              }}
            >
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <div>
              <h2
                id="suggest-modal-title"
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                اقتراح إضافة جراج جديد
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                ساعدنا في توسيع دليل جراجات القاهرة الكبرى
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={suggestLoading}
            className="btn-close"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {!user ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <i
                className="bx bx-lock-alt"
                style={{
                  fontSize: "3rem",
                  color: "var(--color-secondary)",
                  marginBottom: "12px",
                  display: "block",
                }}
              ></i>
              <h4
                style={{
                  margin: "0 0 8px",
                  color: "var(--text-primary)",
                  fontWeight: "700",
                }}
              >
                تسجيل الدخول مطلوب
              </h4>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                يرجى تسجيل الدخول أولاً لتتمكن من تقديم اقتراحات الجراجات والمتابعة مع فريق الدعم.
              </p>
              <Link
                href="/login"
                className="btn btn-primary"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "700",
                }}
              >
                تسجيل الدخول الآن
              </Link>
            </div>
          ) : suggestSuccess ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 16px",
                }}
              >
                ✓
              </div>
              <h4
                style={{
                  margin: "0 0 8px",
                  color: "var(--text-primary)",
                  fontWeight: "800",
                  fontSize: "1.2rem",
                }}
              >
                تم استلام اقتراحك بنجاح!
              </h4>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.92rem",
                  lineHeight: "1.6",
                }}
              >
                شكراً لمساهمتك القيمة. سيقوم فريقنا بمراجعة وتدقيق بيانات الجراج وإضافته للدليل قريباً.
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {suggestLimitChecking && (
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    textAlign: "center",
                  }}
                >
                  جاري التحقق من حالة الحساب...
                </div>
              )}

              {suggestLimitReached && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <img
                    src="/images/icons3d/error.png"
                    alt="Alert"
                    style={{ width: "20px", height: "20px" }}
                  />
                  <span>
                    لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها.
                  </span>
                </div>
              )}

              {suggestError && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{suggestError}</span>
                </div>
              )}

              {/* Garage Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  اسم الجراج <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-fields"
                  placeholder="مثال: جراج الأوبرا، جراج روكسي الذكي، جراج التحرير..."
                  value={suggestName}
                  onChange={(e) => setSuggestName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontSize: "0.92rem",
                    fontFamily: "var(--font-cairo)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Area & Garage Type */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    المنطقة / الحي <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={suggestArea}
                    onChange={(e) => setSuggestArea(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-cairo)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {areas
                      .filter((a) => a !== "all")
                      .map((a) => (
                        <option
                          key={a}
                          value={a}
                          style={{
                            backgroundColor: "var(--bgPrimary)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {a}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    نوع الجراج
                  </label>
                  <select
                    value={suggestType}
                    onChange={(e) => setSuggestType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-cairo)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {SUGGEST_GARAGE_TYPES.map((t) => (
                      <option
                        key={t}
                        value={t}
                        style={{
                          backgroundColor: "var(--bgPrimary)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address & Landmarks */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  العنوان بالتفصيل أو معالم الوصول{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-fields"
                  placeholder="مثال: ميدان التحرير، بجوار مجمع التحرير وأمام الجامعة الأمريكية"
                  value={suggestAddress}
                  onChange={(e) => setSuggestAddress(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontSize: "0.92rem",
                    fontFamily: "var(--font-cairo)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Nearest Metro & Price */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    أقرب محطة مترو (اختياري)
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    placeholder="مثال: محطة السادات"
                    value={suggestNearestMetro}
                    onChange={(e) => setSuggestNearestMetro(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-cairo)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    سعر الساعة التقديري (ج.م)
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    placeholder="مثال: 10 أو 15"
                    value={suggestHourlyRate}
                    onChange={(e) => setSuggestHourlyRate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-cairo)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Google Maps Link & Capacity */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    رابط خرائط جوجل (إن وجد)
                  </label>
                  <input
                    type="url"
                    className="input-fields"
                    placeholder="https://maps.app.goo.gl/..."
                    value={suggestMapLink}
                    onChange={(e) => setSuggestMapLink(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      fontFamily: "var(--font-cairo)",
                      outline: "none",
                      direction: "ltr",
                      textAlign: "right",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    السعة التقديرية (سيارة)
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    placeholder="مثال: 300 سيارة"
                    value={suggestCapacity}
                    onChange={(e) => setSuggestCapacity(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-cairo)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Available Features */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  الميزات المتوفرة بالجراج:
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {SUGGEST_AVAILABLE_FEATURES.map((feat) => {
                    const isSelected = suggestFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => onToggleFeature(feat)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          border: isSelected
                            ? "1px solid var(--color-secondary)"
                            : "1px solid var(--border-glass)",
                          backgroundColor: isSelected
                            ? "rgba(59, 130, 246, 0.15)"
                            : "var(--bg-secondary)",
                          color: isSelected
                            ? "var(--color-secondary)"
                            : "var(--text-secondary)",
                          transition: "all 0.2s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <i
                          className={
                            isSelected ? "fa-solid fa-check" : "fa-solid fa-plus"
                          }
                          style={{ fontSize: "0.72rem" }}
                        ></i>
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  className="input-fields"
                  rows={2}
                  placeholder="أي تفاصيل أخرى مثل مواعيد العمل، الاشتراكات الشهرية، أو طريقة الدخول..."
                  value={suggestNotes}
                  onChange={(e) => setSuggestNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-cairo)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Image Attachment */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  صورة للجراج أو اليافطة (اختياري)
                </label>

                {!suggestImagePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingSuggestImage(true);
                    }}
                    onDragLeave={() => setIsDraggingSuggestImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingSuggestImage(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) onImageSelect(file);
                    }}
                    style={{
                      position: "relative",
                      border: isDraggingSuggestImage
                        ? "2px dashed var(--color-secondary)"
                        : "2px dashed var(--border-glass)",
                      borderRadius: "12px",
                      background: isDraggingSuggestImage
                        ? "rgba(59, 130, 246, 0.08)"
                        : "rgba(255, 255, 255, 0.02)",
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageSelect(file);
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
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(59, 130, 246, 0.12)",
                        color: "var(--color-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                      }}
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      اضغط لاختيار صورة أو اسحبها هنا
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      يافطة الجراج، المدخل، أو قائمة الأسعار (حتى 5MB)
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
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#000",
                        border: "1px solid var(--border-glass)",
                      }}
                    >
                      <img
                        src={suggestImagePreview}
                        alt="معاينة الصورة"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {suggestImageFile?.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {((suggestImageFile?.size || 0) / 1024).toFixed(0)} كيلوبايت
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onImageSelect(null)}
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        borderRadius: "8px",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className="fa-solid fa-trash-can"
                        style={{ fontSize: "0.8rem" }}
                      ></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={suggestLoading || suggestLimitReached}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    fontWeight: "800",
                    fontSize: "0.95rem",
                    cursor: suggestLoading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "50%",
                  }}
                >
                  {suggestLoading ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #fff",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <span>
                        {suggestUploading ? "جاري الرفع..." : "جاري الإرسال..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>إرسال الاقتراح</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  disabled={suggestLoading}
                  onClick={onClose}
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
