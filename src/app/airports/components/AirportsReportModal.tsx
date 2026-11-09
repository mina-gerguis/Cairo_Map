import React, { useState, useMemo, RefObject } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Airport, AirportReportOption, AirportReportProblemType, AirportReportScope } from "../types";
import { AIRPORT_REPORT_PROBLEM_OPTIONS } from "../constants";
import { normalizeArabic } from "../utils";

interface AirportsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef?: RefObject<HTMLDivElement | null>;
  user: User | null;
  airports: Airport[];
  targetScope: AirportReportScope;
  setTargetScope: (scope: AirportReportScope) => void;
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
  customAirportName: string;
  setCustomAirportName: (name: string) => void;
  airportQuery: string;
  setAirportQuery: (q: string) => void;
  problemType: AirportReportProblemType;
  setProblemType: (type: AirportReportProblemType) => void;
  details: string;
  setDetails: (text: string) => void;
  imageFile: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File | null) => void;
  error: string;
  loading: boolean;
  uploading: boolean;
  success: boolean;
  limitChecking: boolean;
  limitReached: boolean;
  onSubmit: (e: React.FormEvent) => void;
  color?: string;
}

export default function AirportsReportModal({
  isOpen,
  onClose,
  modalBoxRef,
  user,
  airports,
  targetScope,
  setTargetScope,
  selectedAirport,
  setSelectedAirport,
  customAirportName,
  setCustomAirportName,
  airportQuery,
  setAirportQuery,
  problemType,
  setProblemType,
  details,
  setDetails,
  imageFile,
  imagePreview,
  onImageSelect,
  error,
  loading,
  uploading,
  success,
  limitChecking,
  limitReached,
  onSubmit,
  color = "#3b82f6",
}: AirportsReportModalProps) {
  const [showAirportList, setShowAirportList] = useState(false);
  const [showProblemTypeDropdown, setShowProblemTypeDropdown] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const filteredAirports = useMemo(() => {
    const q = normalizeArabic(airportQuery.trim());
    if (!q) return airports;
    return airports.filter(
      (a) =>
        normalizeArabic(a.name_ar).includes(q) ||
        normalizeArabic(a.city_ar).includes(q) ||
        (a.iata_code && a.iata_code.toLowerCase().includes(q.toLowerCase())) ||
        (a.name_en && a.name_en.toLowerCase().includes(q.toLowerCase()))
    );
  }, [airportQuery, airports]);

  if (!isOpen) return null;

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
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        direction: "rtl",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading && !uploading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalBoxRef}
        style={{
          backgroundColor: "var(--color-bg)",
          borderRadius: "var(--radius-card, 16px)",
          border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--font-cairo, sans-serif)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <h5
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--color-fg)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }} />
            <span>الإبلاغ عن خطأ في بيانات المطارات</span>
          </h5>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="btn-close"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "1.3rem",
              cursor: "pointer",
            }}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
          {success ? (
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
                <i className="bx bx-check" />
              </div>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.15rem",
                  fontWeight: "800",
                  color: "var(--color-fg)",
                }}
              >
                تم استلام بلاغك بنجاح!
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                شكراً لمساهمتك في تدقيق وتحديث دليل المطارات المصرية. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
              </p>
            </div>
          ) : limitChecking ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  border: "3px solid rgba(255,255,255,0.1)",
                  borderTopColor: "var(--color-secondary, #3b82f6)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
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
                  margin: "0 auto 14px",
                }}
              >
                <img
                  src="/images/threeD/error.webp"
                  alt="error"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  loading="lazy"
                />
              </div>
              <h5
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "var(--color-fg)",
                }}
              >
                تم الوصول للحد الأقصى من البلاغات المعلقة
              </h5>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
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
                  color: "var(--color-secondary, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  margin: "0 auto 14px",
                }}
              >
                <i className="bx bx-user" />
              </div>
              <h5
                style={{
                  margin: "0 0 8px",
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "var(--color-fg)",
                }}
              >
                تسجيل الدخول مطلوب
              </h5>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                }}
              >
                يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ ومتابعة حالته وكسب نقاط المساهمة.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link href="/login" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Scope Segmented Control */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--color-fg)",
                    marginBottom: "8px",
                  }}
                >
                  نطاق المشكلة:
                </label>
                <div
                  className="tabs"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("general");
                      setSelectedAirport(null);
                      setAirportQuery("");
                      setShowAirportList(false);
                    }}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "8px",
                      border: "none",
                      background: targetScope === "general" ? "var(--color-fg)" : "rgba(255, 255, 255, 0.05)",
                      color: targetScope === "general" ? "var(--color-bg)" : "var(--color-fg)",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo, sans-serif)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    ملاحظة عامة
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope("airport");
                      setShowAirportList(true);
                    }}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "8px",
                      border: "none",
                      background: targetScope === "airport" ? "var(--color-fg)" : "rgba(255, 255, 255, 0.05)",
                      color: targetScope === "airport" ? "var(--color-bg)" : "var(--color-fg)",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo, sans-serif)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    مطار محدد
                  </button>
                </div>
              </div>

              {/* If Scope is Airport: Searchable airport autocomplete selector */}
              {targetScope === "airport" && (
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--color-fg)",
                      marginBottom: "6px",
                    }}
                  >
                    <span>اختر المطار المعني:</span>
                    {selectedAirport && (
                      <span style={{ fontSize: "0.74rem", color, fontWeight: "700" }}>
                        تم تحديد: {selectedAirport.name_ar} ✔
                      </span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="ابحث باسم المطار، المدينة أو الكود CAI..."
                      value={airportQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAirportQuery(val);
                        setShowAirportList(true);
                        if (selectedAirport && val !== selectedAirport.name_ar) {
                          setSelectedAirport(null);
                        }
                      }}
                      onFocus={() => setShowAirportList(true)}
                      onBlur={() => setTimeout(() => setShowAirportList(false), 250)}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 36px",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        color: "var(--color-fg)",
                        border: selectedAirport
                          ? `1px solid var(--color-fg)`
                          : "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
                        fontSize: "0.9rem",
                        direction: "rtl",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-secondary)",
                        pointerEvents: "none",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bx bx-search" style={{ fontSize: "1rem" }} />
                    </div>

                    {airportQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAirport(null);
                          setAirportQuery("");
                          setShowAirportList(true);
                        }}
                        title="مسح"
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "none",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Airport suggestions list popup */}
                  {showAirportList && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "var(--color-bg)",
                        border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.12))",
                        borderRadius: "var(--radius-card, 12px)",
                        overflow: "hidden",
                        zIndex: 1100,
                        maxHeight: "220px",
                        overflowY: "auto",
                        marginTop: "6px",
                        padding: "4px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                      }}
                    >
                      {filteredAirports.length === 0 ? (
                        <div
                          style={{
                            padding: "14px",
                            textAlign: "center",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <i
                            className="bx bx-search"
                            style={{ fontSize: "1.2rem", display: "block", marginBottom: "4px" }}
                          />
                          لا يوجد مطار مطابق لبحثك "{airportQuery}"
                        </div>
                      ) : (
                        filteredAirports.map((ap) => {
                          const isSelected = selectedAirport?.id === ap.id;
                          return (
                            <div
                              key={ap.id}
                              onMouseDown={() => {
                                setSelectedAirport(ap);
                                setAirportQuery(ap.name_ar);
                                setShowAirportList(false);
                              }}
                              style={{
                                padding: "9px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                border: isSelected
                                  ? "1px solid rgba(59, 130, 246, 0.3)"
                                  : "1px solid transparent",
                                transition: "all 0.15s ease",
                                marginBottom: "2px",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <i
                                  className="bx bxs-plane-alt"
                                  style={{
                                    color: isSelected ? "var(--color-secondary, #3b82f6)" : "var(--text-secondary)",
                                    fontSize: "1rem",
                                  }}
                                />
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.88rem",
                                      fontWeight: isSelected ? "700" : "600",
                                      color: isSelected
                                        ? "var(--color-secondary, #3b82f6)"
                                        : "var(--color-fg)",
                                    }}
                                  >
                                    {ap.name_ar}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                    {ap.city_ar} {ap.iata_code ? `• (${ap.iata_code})` : ""}
                                  </div>
                                </div>
                              </div>

                              {isSelected && (
                                <span
                                  style={{
                                    fontSize: "0.78rem",
                                    color: "var(--color-success, #10b981)",
                                    fontWeight: "700",
                                  }}
                                >
                                  ✔
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Problem Type Dropdown Selector */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--color-fg)",
                    marginBottom: "6px",
                  }}
                >
                  <span>نوع المشكلة أو التحديث:</span>
                </label>

                {/* Dropdown Trigger Box */}
                {(() => {
                  const curOpt =
                    AIRPORT_REPORT_PROBLEM_OPTIONS.find((o) => o.id === problemType) ||
                    AIRPORT_REPORT_PROBLEM_OPTIONS[0];
                  return (
                    <button
                      type="button"
                      onClick={() => setShowProblemTypeDropdown((prev) => !prev)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "var(--radius-card, 12px)",
                        background: "var(--bg-secondary)",
                        color: "var(--color-fg)",
                        border: showProblemTypeDropdown
                          ? `1px solid var(--color-fg)`
                          : "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "right",
                        fontFamily: "var(--font-cairo, sans-serif)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(59, 130, 246, 0.12)",
                            color: "var(--color-secondary, #3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            flexShrink: 0,
                          }}
                        >
                          <i className={curOpt.icon || "bx bx-detail"} />
                        </div>
                        <div style={{ minWidth: 0, textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: "700",
                              color: "var(--color-fg)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {curOpt.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.74rem",
                              color: "var(--text-muted)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {curOpt.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {curOpt.badge && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              background: "rgba(255, 255, 255, 0.06)",
                              color: "var(--text-secondary)",
                              fontWeight: "600",
                            }}
                          >
                            {curOpt.badge}
                          </span>
                        )}
                        <i
                          className={`bx bx-chevron-down`}
                          style={{
                            fontSize: "1.2rem",
                            color: "var(--text-secondary)",
                            transform: showProblemTypeDropdown ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </div>
                    </button>
                  );
                })()}

                {/* Dropdown Menu Options */}
                {showProblemTypeDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "var(--color-bg)",
                      border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.12))",
                      borderRadius: "var(--radius-card, 12px)",
                      overflow: "hidden",
                      zIndex: 1100,
                      maxHeight: "280px",
                      overflowY: "auto",
                      marginTop: "6px",
                      padding: "4px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                    }}
                  >
                    {AIRPORT_REPORT_PROBLEM_OPTIONS.map((opt) => {
                      const isSelected = problemType === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setProblemType(opt.id);
                            setShowProblemTypeDropdown(false);
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                            border: isSelected
                              ? "1px solid rgba(59, 130, 246, 0.3)"
                              : "1px solid transparent",
                            transition: "all 0.15s ease",
                            marginBottom: "2px",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                backgroundColor: isSelected
                                  ? "rgba(59, 130, 246, 0.25)"
                                  : "rgba(255, 255, 255, 0.04)",
                                color: isSelected
                                  ? "var(--color-secondary, #3b82f6)"
                                  : "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                flexShrink: 0,
                              }}
                            >
                              <i className={opt.icon || "bx bx-detail"} />
                            </div>
                            <div style={{ minWidth: 0, textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: isSelected ? "700" : "600",
                                  color: isSelected
                                    ? "var(--color-secondary, #3b82f6)"
                                    : "var(--color-fg)",
                                }}
                              >
                                {opt.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "var(--text-muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {opt.desc}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {opt.badge && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  padding: "2px 6px",
                                  borderRadius: "6px",
                                  background: "rgba(255, 255, 255, 0.06)",
                                  color: "var(--text-secondary)",
                                  fontWeight: "600",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {opt.badge}
                              </span>
                            )}
                            {isSelected && (
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--color-success, #10b981)",
                                  fontWeight: "700",
                                }}
                              >
                                ✔
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details Text Area */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--color-fg)",
                    marginBottom: "6px",
                  }}
                >
                  تفاصيل المشكلة أو الخطأ:
                </label>
                <textarea
                  className="input-fields"
                  rows={4}
                  placeholder="يرجى كتابة التفاصيل الدقيقة (مثال: رقم هاتف الصالة رقم 3 تم تغييره إلى... أو رابط الخريطة غير دقيق...)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "0.88rem",
                    background: "var(--bg-secondary)",
                    color: "var(--color-fg)",
                    border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
                    resize: "vertical",
                    direction: "rtl",
                    lineHeight: "1.5",
                  }}
                />
              </div>

              {/* Image Upload Drag & Drop Area */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--color-fg)",
                    marginBottom: "6px",
                  }}
                >
                  إرفاق صورة توضيحية (اختياري):
                </label>
                {imagePreview ? (
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
                      maxHeight: "160px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(0,0,0,0.2)",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: "160px", width: "auto", objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      onClick={() => onImageSelect(null)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        background: "rgba(0,0,0,0.7)",
                        border: "none",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="حذف الصورة"
                    >
                      <i className="bx bx-x" />
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
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        onImageSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: isDraggingImage
                        ? "2px dashed var(--color-secondary, #3b82f6)"
                        : "2px dashed var(--border-glass, rgba(255, 255, 255, 0.15))",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                      backgroundColor: isDraggingImage
                        ? "rgba(59, 130, 246, 0.05)"
                        : "rgba(255, 255, 255, 0.01)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => {
                      const input = document.getElementById("airports-report-file-input");
                      if (input) input.click();
                    }}
                  >
                    <input
                      id="airports-report-file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          onImageSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <i
                      className="bx bx-image-add"
                      style={{ fontSize: "1.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}
                    />
                    <div style={{ fontSize: "0.82rem", color: "var(--color-fg)", fontWeight: "600" }}>
                      انقر لاختيار صورة أو اسحبها هنا
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      الحد الأقصى 5 ميجابايت (PNG, JPG, WEBP)
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "#ef4444",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading || uploading}
                  style={{ flex: 1 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || uploading}
                  style={{ flex: 2 }}
                >
                  {uploading
                    ? "جاري رفع الصورة..."
                    : loading
                    ? "جاري الإرسال..."
                    : "إرسال البلاغ"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
