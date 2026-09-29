"use client";

import React, { useState, useRef } from "react";
import CancelButton from "@/components/ui/button/CancelButton";
import SubmitButton from "@/components/ui/button/SubmitButton";
import { ParsedExcelBrtStation } from "../types";
import {
  parseBrtExcelFile,
  generateBrtExcelTemplate
} from "../utils/excelParser";

interface AdminBrtStationsExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (stations: ParsedExcelBrtStation[], replaceExisting: boolean) => Promise<void>;
}

export function AdminBrtStationsExcelModal({
  isOpen,
  onClose,
  onImportSuccess
}: AdminBrtStationsExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedStations, setParsedStations] = useState<ParsedExcelBrtStation[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg("");
    setIsParsing(true);

    try {
      const parsed = await parseBrtExcelFile(file);
      if (parsed.length === 0) {
        setErrorMsg("لم يتم العثور على أي بيانات صالحة لمحطات الأتوبيس الترددي داخل الملف.");
      }
      setParsedStations(parsed);
    } catch (err: any) {
      console.error("Excel parse error:", err);
      setErrorMsg("حدث خطأ أثناء قراءة ملف الإكسل: " + (err?.message || String(err)));
    } finally {
      setIsParsing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedStations([]);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmImport = async () => {
    if (parsedStations.length === 0) return;
    setIsImporting(true);
    setErrorMsg("");

    try {
      await onImportSuccess(parsedStations, replaceExisting);
      handleReset();
      onClose();
    } catch (err: any) {
      console.error("Import error:", err);
      setErrorMsg("فشل استيراد البيانات: " + (err?.message || String(err)));
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedStations.filter((s) => s.isValid).length;
  const invalidCount = parsedStations.length - validCount;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "750px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "30px",
          border: "1px solid var(--border-glass)",
          background: "var(--bg-glass)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="bx bx-file" style={{ fontSize: "1.6rem", color: "#10b981" }} />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", margin: 0 }}>
              استيراد محطات الأتوبيس الترددي من Excel
            </h2>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="btn-close">
            <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
          </button>
        </div>

        {/* Template Download Prompt */}
        <div
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div>
            <div style={{ fontWeight: "bold", fontSize: "0.92rem", color: "#34d399", marginBottom: "3px" }}>
              هل تحتاج إلى النموذج القياسي؟
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
              قم بتحميل نموذج ملف Excel الجاهز بالأعمدة والبيانات التوضيحية لتعبئته مباشرة.
            </div>
          </div>
          <button
            type="button"
            onClick={generateBrtExcelTemplate}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bx bx-download" />
            <span>تحميل النموذج</span>
          </button>
        </div>

        {/* File Dropzone / Select */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed rgba(255,255,255,0.15)",
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: "rgba(255,255,255,0.02)",
              transition: "border-color 0.2s"
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              style={{ display: "none" }}
            />
            <i className="bx bx-cloud-upload" style={{ fontSize: "3rem", color: "#6366f1", marginBottom: "10px" }} />
            <div style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-primary, #fff)" }}>
              اضغط هنا لاختيار ملف Excel أو CSV
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted, #94a3b8)", marginTop: "6px" }}>
              يدعم الامتدادات: .xlsx, .xls, .csv
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                marginBottom: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="bx bx-file" style={{ fontSize: "1.5rem", color: "#10b981" }} />
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{selectedFile.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.78rem" }}
              >
                تغيير الملف
              </button>
            </div>

            {/* Parsing State */}
            {isParsing && (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted, #94a3b8)" }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.5rem", marginBottom: "8px" }} />
                <div>جاري قراءة وتحليل بيانات المحطات...</div>
              </div>
            )}

            {/* Parsed Preview */}
            {!isParsing && parsedStations.length > 0 && (
              <div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "8px",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#34d399" }}>{validCount}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>محطات صالحة</div>
                  </div>
                  {invalidCount > 0 && (
                    <div
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "8px",
                        textAlign: "center"
                      }}
                    >
                      <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#f87171" }}>{invalidCount}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>تحتوي ملاحظات</div>
                    </div>
                  )}
                </div>

                {/* Replace toggle */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                  />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-primary, #fff)" }}>
                    استبدال بيانات المحطات والمسارات المتطابقة بدلاً من دمجها
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "0.85rem",
              marginTop: "14px"
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <CancelButton onClick={onClose}>إلغاء</CancelButton>
          <SubmitButton
            onClick={handleConfirmImport}
            disabled={parsedStations.length === 0 || isImporting || isParsing}
          >
            <i className="bx bx-check" style={{ marginLeft: "6px" }} />
            {isImporting ? "جاري الاستيراد..." : `استيراد (${validCount}) محطة`}
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}
