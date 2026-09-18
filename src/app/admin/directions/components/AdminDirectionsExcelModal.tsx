import React, { useState, useRef } from "react";
import styles from "../directions.module.css";
import {
  ParsedExcelRouteRow,
  generateDirectionsExcelTemplate,
  parseDirectionsExcelFile
} from "../utils/excelParser";

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
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
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
          background: "var(--bgSecondary, #18181b)",
          border: "1px solid var(--border-glass-bright, rgba(255, 255, 255, 0.15))",
          borderRadius: "20px",
          padding: "28px",
          width: "100%",
          maxWidth: "850px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          color: "var(--text-primary, #f4f4f5)",
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
            borderBottom: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
            paddingBottom: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem"
              }}
            >
              <i className="bx bx-file" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900" }}>
                استيراد مسارات وطرق وخطوات من ملف إكسل
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.82rem",
                  color: "var(--textSecondary, #a1a1aa)"
                }}
              >
                إضافة الطرق والوسائل والمراحل والخطوات دفعة واحدة عبر ملف Excel (.xlsx / .csv)
              </p>
            </div>
          </div>

          <button
            type="button"
            className="closeBtn"
            onClick={onClose}
            title="إغلاق"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid var(--border-glass)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <i className="bx bx-x" style={{ fontSize: "1.3rem" }} />
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
          {/* Template Download Banner */}
          <div
            style={{
              background: "rgba(0, 111, 238, 0.08)",
              border: "1px solid rgba(0, 111, 238, 0.25)",
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
              <i className="bx bx-info-circle" style={{ fontSize: "1.4rem", color: "#3b82f6" }} />
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#60a5fa" }}>
                  تحميل النموذج الإرشادي لملف الإكسل
                </strong>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.8rem",
                    color: "var(--textSecondary, #cbd5e1)"
                  }}
                >
                  يحتوي على الأعمدة المطلوبة وتنسيق المراحل والخطوات الجاهزة للاستخدام
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={generateDirectionsExcelTemplate}
              style={{
                padding: "8px 16px",
                fontSize: "0.82rem",
                color: "#38bdf8",
                borderColor: "rgba(56, 189, 248, 0.4)"
              }}
            >
              <i className="bx bx-download" />
              <span>تحميل النموذج (.xlsx)</span>
            </button>
          </div>

          {/* Upload Zone */}
          <div
            style={{
              border: "2px dashed rgba(255, 255, 255, 0.18)",
              borderRadius: "16px",
              padding: "28px 20px",
              textAlign: "center",
              background: "var(--bgPrimary, rgba(0, 0, 0, 0.3))",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <i
              className="bx bx-cloud-upload"
              style={{ fontSize: "2.8rem", color: "#3b82f6", marginBottom: "8px" }}
            />
            <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: "800" }}>
              {file ? file.name : "اضغط هنا لاختيار ملف الإكسل أو قم بسحبه وإفلاته"}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--textSecondary, #94a3b8)"
              }}
            >
              يدعم ملفات بصيغة Excel (.xlsx, .xls) أو ملفات القيم المفصولة (.csv)
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsing Spinner */}
          {isParsing && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "20px"
              }}
            >
              <i
                className="bx bx-loader-alt"
                style={{
                  fontSize: "1.8rem",
                  color: "#3b82f6",
                  animation: "spin 1s linear infinite"
                }}
              />
              <span style={{ fontWeight: "700", color: "#94a3b8" }}>
                جاري فحص وقراءة بيانات ملف الإكسل...
              </span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && !isParsing && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "700"
                    }}
                  >
                    جاهز للاستيراد: {validCount} مسار
                  </span>
                  {invalidCount > 0 && (
                    <span
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#f87171",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: "700"
                      }}
                    >
                      أخطاء: {invalidCount}
                    </span>
                  )}
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.84rem",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                  />
                  <span>تحديث وحذف المسارات القديمة المطابقة لنفس النقطة والوجهة</span>
                </label>
              </div>

              {/* Preview Table */}
              <div
                style={{
                  maxHeight: "220px",
                  overflowY: "auto",
                  border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
                  borderRadius: "12px",
                  background: "var(--bgPrimary, #09090b)"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr
                      style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        borderBottom: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
                        textAlign: "right"
                      }}
                    >
                      <th style={{ padding: "10px 14px" }}>#</th>
                      <th style={{ padding: "10px 14px" }}>نقطة البداية</th>
                      <th style={{ padding: "10px 14px" }}>الوجهة</th>
                      <th style={{ padding: "10px 14px" }}>الوسيلة</th>
                      <th style={{ padding: "10px 14px" }}>الأجرة</th>
                      <th style={{ padding: "10px 14px" }}>المدة</th>
                      <th style={{ padding: "10px 14px" }}>المراحل / الخطوات</th>
                      <th style={{ padding: "10px 14px" }}>رابط الخريطة</th>
                      <th style={{ padding: "10px 14px" }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom:
                            "1px solid var(--border-glass, rgba(255, 255, 255, 0.05))",
                          background: r.isValid ? "transparent" : "rgba(239, 68, 68, 0.06)"
                        }}
                      >
                        <td style={{ padding: "8px 14px", color: "#64748b" }}>{idx + 1}</td>
                        <td style={{ padding: "8px 14px", fontWeight: "700" }}>
                          {r.from_location}
                        </td>
                        <td style={{ padding: "8px 14px", fontWeight: "700" }}>{r.to_location}</td>
                        <td style={{ padding: "8px 14px" }}>{r.type_name}</td>
                        <td style={{ padding: "8px 14px", color: "#34d399", fontWeight: "700" }}>
                          {r.cost} ج.م
                        </td>
                        <td style={{ padding: "8px 14px", color: "#60a5fa" }}>{r.duration}</td>
                        <td style={{ padding: "8px 14px" }}>
                          {r.legs.length > 1
                            ? `${r.legs.length} مراحل (${r.steps.length} خطوات)`
                            : `${r.steps.length} خطوات`}
                        </td>
                        <td style={{ padding: "8px 14px" }}>
                          {r.map_link ? (
                            <a
                              href={r.map_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#38bdf8",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                textDecoration: "none",
                                fontWeight: "700"
                              }}
                              title={r.map_link}
                            >
                              <i className="bx bx-map-pin" />
                              <span>متوفر</span>
                            </a>
                          ) : (
                            <span style={{ color: "#64748b" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "8px 14px" }}>
                          {r.isValid ? (
                            <span style={{ color: "#34d399", fontWeight: "bold" }}>✓ صالح</span>
                          ) : (
                            <span style={{ color: "#f87171", fontWeight: "bold" }}>
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
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            borderTop: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
            paddingTop: "16px"
          }}
        >
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={onClose}
            disabled={isSaving}
          >
            إلغاء
          </button>
          <button
            type="button"
            className={styles.primaryActionBtn}
            onClick={handleSave}
            disabled={validCount === 0 || isSaving}
            style={{
              padding: "10px 28px",
              opacity: validCount === 0 || isSaving ? 0.6 : 1
            }}
          >
            {isSaving ? "جاري استيراد وحفظ المسارات..." : `حفظ واستيراد (${validCount}) مسار`}
          </button>
        </div>
      </div>
    </div>
  );
}
