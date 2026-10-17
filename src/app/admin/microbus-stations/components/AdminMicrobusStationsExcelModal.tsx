"use client";

import React, { useState, useRef } from "react";
import adminStyles from "../../admin.module.css";
import {
  ParsedExcelMicrobusStation,
  generateMicrobusExcelTemplate,
  parseMicrobusExcelFile
} from "../utils/excelParser";

interface AdminMicrobusStationsExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (parsedStations: ParsedExcelMicrobusStation[], replaceExisting: boolean) => Promise<void>;
}

export function AdminMicrobusStationsExcelModal({
  isOpen,
  onClose,
  onImportSuccess
}: AdminMicrobusStationsExcelModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "cheatsheet">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedStations, setParsedStations] = useState<ParsedExcelMicrobusStation[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setErrorMsg("");
    setFile(selectedFile);
    setIsParsing(true);

    try {
      const stations = await parseMicrobusExcelFile(selectedFile);
      if (stations.length === 0) {
        setErrorMsg("الملف المرفوع فارغ أو لا يحتوي على صفوف بيانات صالحة.");
      }
      setParsedStations(stations);
    } catch (err: any) {
      console.error("Failed to parse excel file:", err);
      setErrorMsg("حدث خطأ أثناء قراءة ملف الإكسل: " + (err.message || String(err)));
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    const validStations = parsedStations.filter((s) => s.isValid);
    if (validStations.length === 0) {
      setErrorMsg("لا توجد مواقف صالحة للحفظ.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      await onImportSuccess(validStations, replaceExisting);
      // Reset & Close
      setFile(null);
      setParsedStations([]);
      onClose();
    } catch (err: any) {
      console.error("Import failed:", err);
      setErrorMsg("فشل استيراد البيانات: " + (err?.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const validCount = parsedStations.filter((s) => s.isValid).length;
  const invalidCount = parsedStations.length - validCount;
  const totalRoutesCount = parsedStations.reduce((sum, s) => sum + (s.routes?.length || 0), 0);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        direction: "rtl"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-glass, var(--bg-secondary))",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card, 16px)",
          padding: "24px",
          width: "100%",
          maxWidth: "850px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          color: "var(--text-primary)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900" }}>
                استيراد مواقف وخطوط سير السرفيس من ملف إكسل
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)"
                }}
              >
                إضافة وتحديث مواقف الميكروباص وخطوط السير والتعريفة دفعة واحدة عبر ملف Excel (.xlsx / .csv)
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            title="إغلاق"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          className="tabs"
          style={{
            gap: "8px",
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "12px",
            display: "flex"
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className="btn"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "upload" ? "var(--text-primary)" : "transparent",
              border: "none",
              color: activeTab === "upload" ? "var(--bgMode, #000)" : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bx bx-upload" style={{ fontSize: "1.1rem" }} />
            <span>رفع واستيراد الملف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cheatsheet")}
            className="btn"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "cheatsheet" ? "var(--text-primary)" : "transparent",
              border: "none",
              color: activeTab === "cheatsheet" ? "var(--bgMode, #000)" : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bx bx-bulb" style={{ fontSize: "1.1rem" }} />
            <span>دليل كتابة بيانات المواقف في الإكسل</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            overflowY: "auto",
            paddingRight: "4px"
          }}
        >
          {activeTab === "cheatsheet" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  borderRadius: "12px",
                  padding: "16px",
                  lineHeight: "1.7",
                  fontSize: "0.88rem"
                }}
              >
                <h4 style={{ margin: "0 0 8px", color: "#818cf8", fontWeight: "800" }}>
                  💡 كيفية تنظيم صفوف الإكسل لمواقف السرفيس:
                </h4>
                <p style={{ margin: "0 0 10px" }}>
                  يمكنك تنظيم الملف بأي من الطريقتين التاليتين:
                </p>
                <ol style={{ margin: 0, paddingRight: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>
                    <strong>طريقة الصف لكل خط سير (موصى بها):</strong> اكتب اسم الموقف والمحافظة والعنوان في الصف الأول مع أول وجهة، ثم في الصفوف التالية كرر اسم الموقف أو اتركه فارغاً مع كتابة الوجهة التالية وسعرها. سيتم جمع كل الخطوط تلقائياً تحت نفس الموقف!
                  </li>
                  <li>
                    <strong>طريقة الخطوط المجمعة:</strong> اكتب في عمود خطوط السير المسارات مفصولة بـ <code>|</code> أو أسطر جديدة (مثال: <code>6 أكتوبر (12 ج.م) | الشيخ زايد (14 ج.م)</code>).
                  </li>
                </ol>
              </div>

              {/* Cheatsheet Table */}
              <div className={adminStyles.tableCard} style={{ overflowX: "auto", marginBottom: 0 }}>
                <table className={adminStyles.adminTable} style={{ width: "100%", fontSize: "0.82rem" }}>
                  <thead className={adminStyles.adminThead}>
                    <tr className={adminStyles.adminTr}>
                      <th className={adminStyles.adminTh}>اسم العمود المطلوب</th>
                      <th className={adminStyles.adminTh}>الحالة</th>
                      <th className={adminStyles.adminTh}>الأمثلة والصيغ المقبولة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>اسم الموقف</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#ef4444", fontWeight: "700" }}>مطلوب</span></td>
                      <td className={adminStyles.adminTd}>موقف رمسيس (أحمد حلمي)، موقف المرج، موقف السلام، موقف المنيب</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>المحافظة</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#ef4444", fontWeight: "700" }}>مطلوب</span></td>
                      <td className={adminStyles.adminTd}>القاهرة، الجيزة، القليوبية، الإسكندرية، الشرقية</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>العنوان بالتفصيل</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#ef4444", fontWeight: "700" }}>مطلوب</span></td>
                      <td className={adminStyles.adminTd}>وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>رابط خريطة جوجل</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#10b981", fontWeight: "700" }}>اختياري</span></td>
                      <td className={adminStyles.adminTd}>رابط الموقع على Google Maps (مثال: https://maps.google.com/...)</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>الوجهة</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#ef4444", fontWeight: "700" }}>مطلوب</span></td>
                      <td className={adminStyles.adminTd}>6 أكتوبر، الشيخ زايد، التجمع الخامس، العاشر من رمضان</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>الأجرة</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#ef4444", fontWeight: "700" }}>مطلوب</span></td>
                      <td className={adminStyles.adminTd}>15 أو 12-14 (يتم حفظ القيمة كما هي في الشيت تماماً)</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>نوع وسيلة المواصلات</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#10b981", fontWeight: "700" }}>اختياري</span></td>
                      <td className={adminStyles.adminTd}>ميكروباص، ميكروباص سقف عالي، ميني باص، أتوبيس</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>خط السير / عبر</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#10b981", fontWeight: "700" }}>اختياري</span></td>
                      <td className={adminStyles.adminTd}>طريق المحور، الطريق الدائري، صلاح سالم</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>المدة الزمنية</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#10b981", fontWeight: "700" }}>اختياري</span></td>
                      <td className={adminStyles.adminTd}>45 دقيقة، ساعة، 30 دقيقة</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>نوع الموقف / الخط</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#10b981", fontWeight: "700" }}>اختياري</span></td>
                      <td className={adminStyles.adminTd}>موقف رسمي، نقطة تحميل عادية</td>
                    </tr>
                    <tr className={adminStyles.adminTr}>
                      <td className={adminStyles.adminTd} style={{ fontWeight: "700" }}>ملاحظات</td>
                      <td className={adminStyles.adminTd}><span style={{ color: "#10b981", fontWeight: "700" }}>اختياري</span></td>
                      <td className={adminStyles.adminTd}>تفاصيل إضافية عن رصيف التحميل وأوقات العمل</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* Template Download Banner */}
              <div
                style={{
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className="bx bx-info-circle" style={{ fontSize: "1.4rem", color: "#818cf8" }} />
                  <div>
                    <strong style={{ fontSize: "0.9rem", color: "#818cf8" }}>
                      تحميل النموذج الإرشادي لمواقف السرفيس
                    </strong>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)"
                      }}
                    >
                      يحتوي على الأعمدة المطلوبة وتنسيق المواقف والخطوط الجاهزة للاستخدام
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setActiveTab("cheatsheet")}
                    style={{
                      padding: "8px 14px",
                      fontSize: "0.82rem",
                      color: "#34d399",
                      borderColor: "rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                      borderRadius: "8px"
                    }}
                  >
                    <i className="bx bx-bulb" style={{ marginLeft: "4px" }} />
                    عرض الأعمدة المقبولة
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={generateMicrobusExcelTemplate}
                    style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                  >
                    <i className="bx bx-download" style={{ marginLeft: "4px" }} />
                    تحميل القالب (.xlsx)
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div
                style={{
                  border: "2px dashed var(--border-glass)",
                  borderRadius: "16px",
                  padding: "32px 20px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                />

                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "0 auto 12px"
                  }}
                >
                  <i className="bx bx-cloud-upload" />
                </div>

                <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  {file ? file.name : "انقر لاختيار ملف الإكسل أو اسحبه هنا"}
                </h4>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  يدعم صيغ Microsoft Excel (.xlsx, .xls) والملفات المجدولة (.csv)
                </p>
              </div>

              {/* Parsing State */}
              {isParsing && (
                <div style={{ textAlign: "center", padding: "16px", color: "#818cf8" }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.6rem", marginLeft: "8px" }} />
                  <span>جاري قراءة ومعالجة بيانات المواقف وخطوط السير...</span>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    color: "#ef4444",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedStations.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Stats & Import Strategy Selection */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-glass)",
                      padding: "12px 16px",
                      borderRadius: "12px"
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.12)",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                          padding: "3px 10px",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          fontWeight: "800"
                        }}
                      >
                        ✓ {validCount} موقف صالح ({totalRoutesCount} مسار)
                      </span>
                      {invalidCount > 0 && (
                        <span
                          style={{
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            fontSize: "0.82rem",
                            fontWeight: "800"
                          }}
                        >
                          ✕ {invalidCount} موقف غير مكتمل
                        </span>
                      )}
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        color: "var(--text-primary)"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={replaceExisting}
                        onChange={(e) => setReplaceExisting(e.target.checked)}
                        style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                      />
                      <span>استبدال وتحديث المواقف المتطابقة الموجودة مسبقاً</span>
                    </label>
                  </div>

                  {/* Preview Table */}
                  <div className={adminStyles.tableCard} style={{ maxHeight: "260px", overflowX: "auto", overflowY: "auto", marginBottom: 0 }}>
                    <table className={adminStyles.adminTable} style={{ width: "100%", fontSize: "0.82rem" }}>
                      <thead className={adminStyles.adminThead}>
                        <tr className={adminStyles.adminTr}>
                          <th className={adminStyles.adminTh} style={{ width: "50px", textAlign: "center" }}>#</th>
                          <th className={adminStyles.adminTh}>اسم الموقف</th>
                          <th className={adminStyles.adminTh}>المحافظة</th>
                          <th className={adminStyles.adminTh}>العنوان بالتفصيل</th>
                          <th className={adminStyles.adminTh}>عدد الخطوط</th>
                          <th className={adminStyles.adminTh}>أبرز الوجهات</th>
                          <th className={adminStyles.adminTh} style={{ textAlign: "center" }}>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedStations.map((s, idx) => (
                          <tr
                            key={idx}
                            className={adminStyles.adminTr}
                            style={{
                              backgroundColor: !s.isValid ? "rgba(239, 68, 68, 0.06)" : undefined
                            }}
                          >
                            <td className={adminStyles.adminTd} style={{ textAlign: "center", fontWeight: "bold" }}>
                              {idx + 1}
                            </td>
                            <td className={adminStyles.adminTd} style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                              {s.name}
                            </td>
                            <td className={adminStyles.adminTd}>
                              {s.governorate}
                            </td>
                            <td
                              className={adminStyles.adminTd}
                              title={s.location}
                              style={{
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {s.location}
                            </td>
                            <td className={adminStyles.adminTd}>
                              <span
                                style={{
                                  background: "rgba(99, 102, 241, 0.12)",
                                  color: "#818cf8",
                                  border: "1px solid rgba(99, 102, 241, 0.25)",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700"
                                }}
                              >
                                {s.routes.length} خط سير
                              </span>
                            </td>
                            <td
                              className={adminStyles.adminTd}
                              style={{ color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              title={s.routes.map((r) => `${r.destination} (${r.fare})`).join(" ، ")}
                            >
                              {s.routes.slice(0, 3).map((r) => r.destination).join(" ، ")}
                              {s.routes.length > 3 ? "..." : ""}
                            </td>
                            <td className={adminStyles.adminTd} style={{ textAlign: "center" }}>
                              {s.isValid ? (
                                <span style={{ color: "#10b981", fontWeight: "800" }}>صالح</span>
                              ) : (
                                <span style={{ color: "#ef4444", fontSize: "0.72rem" }} title={s.validationError}>
                                  {s.validationError}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "16px"
          }}
        >
          {activeTab === "cheatsheet" ? (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => setActiveTab("upload")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#818cf8",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "0.85rem"
                }}
              >
                <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }} />
                <span>العودة لرفع ملف الإكسل</span>
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={generateMicrobusExcelTemplate}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "0.85rem",
                    color: "var(--text-primary)"
                  }}
                >
                  <i className="bx bx-download" style={{ marginLeft: "4px" }} />
                  تحميل النموذج (.xlsx)
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={onClose}
                >
                  إغلاق
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", gap: "12px" }}>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={validCount === 0 || isSaving}
                style={{
                  padding: "10px 24px",
                  opacity: validCount === 0 || isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? "جاري استيراد وحفظ المواقف..." : `حفظ واستيراد (${validCount}) موقف`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
