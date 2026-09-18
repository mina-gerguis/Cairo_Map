import React, { useState, useRef } from "react";
import styles from "../directions.module.css";
import adminStyles from "../../admin.module.css";
import {
  ParsedExcelRouteRow,
  generateDirectionsExcelTemplate,
  parseDirectionsExcelFile
} from "../utils/excelParser";
import { AdminTransitTypesCheatsheet } from "./AdminTransitTypesCheatsheet";

interface AdminDirectionsExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (parsedRows: ParsedExcelRouteRow[], replaceExisting: boolean) => Promise<void>;
}

export function AdminDirectionsExcelModal({
  isOpen,
  onClose,
  onImportSuccess
}: AdminDirectionsExcelModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "cheatsheet">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedExcelRouteRow[]>([]);
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
      const rows = await parseDirectionsExcelFile(selectedFile);
      if (rows.length === 0) {
        setErrorMsg("الملف المرفوع فارغ أو لا يحتوي على صفوف بيانات صالحة.");
      }
      setParsedRows(rows);
    } catch (err: any) {
      console.error("Failed to parse excel file:", err);
      setErrorMsg("حدث خطأ أثناء قراءة ملف الإكسل: " + (err.message || String(err)));
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg("لا توجد صفوف صالحة للحفظ.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      await onImportSuccess(validRows, replaceExisting);
      // Reset & Close
      setFile(null);
      setParsedRows([]);
      onClose();
    } catch (err: any) {
      console.error("Import failed:", err);
      const msg = err?.message || String(err);
      if (msg.includes("transit_routes_type_check")) {
        setErrorMsg("فشل استيراد البيانات: قيد نوع المواصلات في Supabase لا يشمل الوسائل الجديدة (LRT أو BRT). يرجى تشغيل أمر SQL المحدث في أعلى صفحة الإدارة.");
      } else {
        setErrorMsg("فشل استيراد البيانات: " + msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

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
                استيراد مسارات وخطوات من ملف إكسل
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)"
                }}
              >
                إضافة الطرق والوسائل والمراحل والخطوات دفعة واحدة عبر ملف Excel (.xlsx / .csv)
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
            paddingBottom: "12px"
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
              color: activeTab === "upload" ? "var(--bgMode)" : "var(--text-primary)",
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
              color: activeTab === "cheatsheet" ? "var(--bgMode)" : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bx bx-bulb" style={{ fontSize: "1.1rem" }} />
            <span>دليل كتابة أنواع المواصلات في الإكسل (CheatSheet)</span>
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
            <AdminTransitTypesCheatsheet />
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
                      تحميل النموذج الإرشادي لملف الإكسل
                    </strong>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)"
                      }}
                    >
                      يحتوي على الأعمدة المطلوبة وتنسيق المراحل والخطوات الجاهزة للاستخدام
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
                    عرض الرموز والكلمات المقبولة
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={generateDirectionsExcelTemplate}
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
                  <span>جاري قراءة ومعالجة صفوف الإكسل...</span>
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
              {parsedRows.length > 0 && (
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
                        ✓ {validCount} صف صالح
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
                          ✕ {invalidCount} صف غير مكتمل
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
                      <span>استبدال وتحديث المسارات المتطابقة الموجودة مسبقاً</span>
                    </label>
                  </div>

                  {/* Preview Table matching metro */}
                  <div className={adminStyles.tableCard} style={{ maxHeight: "260px", overflowX: "auto", overflowY: "auto", marginBottom: 0 }}>
                    <table className={adminStyles.adminTable} style={{ width: "100%", fontSize: "0.82rem" }}>
                      <thead className={adminStyles.adminThead}>
                        <tr className={adminStyles.adminTr}>
                          <th className={adminStyles.adminTh} style={{ width: "50px", textAlign: "center" }}>#</th>
                          <th className={adminStyles.adminTh}>البداية</th>
                          <th className={adminStyles.adminTh}>الوجهة</th>
                          <th className={adminStyles.adminTh}>وسيلة المواصلات</th>
                          <th className={adminStyles.adminTh}>الأجرة</th>
                          <th className={adminStyles.adminTh}>المدة</th>
                          <th className={adminStyles.adminTh}>المراحل/الخطوات</th>
                          <th className={adminStyles.adminTh} style={{ textAlign: "center" }}>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((r, idx) => (
                          <tr
                            key={idx}
                            className={adminStyles.adminTr}
                            style={{
                              backgroundColor: !r.isValid ? "rgba(239, 68, 68, 0.06)" : undefined
                            }}
                          >
                            <td className={adminStyles.adminTd} style={{ textAlign: "center", fontWeight: "bold" }}>
                              {idx + 1}
                            </td>
                            <td className={adminStyles.adminTd} style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                              {r.from_location}
                            </td>
                            <td className={adminStyles.adminTd} style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                              {r.to_location}
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
                                {r.type_name}
                              </span>
                            </td>
                            <td className={adminStyles.adminTd} style={{ color: "#34d399", fontWeight: "700" }}>
                              {r.cost} ج.م
                            </td>
                            <td className={adminStyles.adminTd} style={{ color: "#818cf8" }}>
                              {r.duration}
                            </td>
                            <td className={adminStyles.adminTd} style={{ color: "var(--text-secondary)" }}>
                              {r.legs && r.legs.length > 0
                                ? `${r.legs.length} مراحل`
                                : `${r.steps?.length || 0} خطوات`}
                            </td>
                            <td className={adminStyles.adminTd} style={{ textAlign: "center" }}>
                              {r.isValid ? (
                                <span style={{ color: "#10b981", fontWeight: "800" }}>صالح</span>
                              ) : (
                                <span style={{ color: "#ef4444", fontSize: "0.72rem" }} title={r.validationError}>
                                  {r.validationError}
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
                  onClick={generateDirectionsExcelTemplate}
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
                {isSaving ? "جاري استيراد وحفظ المسارات..." : `حفظ واستيراد (${validCount}) مسار`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
