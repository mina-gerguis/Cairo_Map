"use client";

import React from "react";
import Image from "next/image";
import { HighwayItem } from "@/data/roads_info";
import { ROAD_REPORT_OPTIONS } from "../constants";
import { RoadReportProblemType, RoadReportScope } from "../types";

interface RoadsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  roads: HighwayItem[];
  targetScope: RoadReportScope;
  setTargetScope: (s: RoadReportScope) => void;
  selectedRoad: HighwayItem | null;
  setSelectedRoad: (r: HighwayItem | null) => void;
  customRoadName: string;
  setCustomRoadName: (name: string) => void;
  problemType: RoadReportProblemType;
  setProblemType: (p: RoadReportProblemType) => void;
  details: string;
  setDetails: (d: string) => void;
  imageFile: File | null;
  imagePreview: string | null;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  loading: boolean;
  uploading: boolean;
  success: string;
  onSubmit: () => void;
}

export function RoadsReportModal({
  isOpen,
  onClose,
  roads,
  targetScope,
  setTargetScope,
  selectedRoad,
  setSelectedRoad,
  customRoadName,
  setCustomRoadName,
  problemType,
  setProblemType,
  details,
  setDetails,
  imagePreview,
  onImageSelect,
  error,
  loading,
  uploading,
  success,
  onSubmit,
}: RoadsReportModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
        direction: "rtl",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--bgThird, #1e293b)",
          border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.15))",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          color: "var(--text-primary, #fff)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.15)",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <i className="bx bx-error-alt" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                إبلاغ عن تعديل أو مشكلة في الطريق
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                ملاحظاتك تساهم في تدقيق سرعات الرادارات وجودة الطرق
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "1.3rem",
            }}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Scope Selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: "8px",
              fontSize: "0.85rem",
              borderRadius: "10px",
              background: targetScope === "road" ? "var(--color-primary, #3b82f6)" : "var(--bg-secondary, rgba(255, 255, 255, 0.05))",
              color: targetScope === "road" ? "#fff" : "var(--text-secondary)",
              border: "1px solid var(--border-glass)",
            }}
            onClick={() => setTargetScope("road")}
          >
            طريق محدد
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: "8px",
              fontSize: "0.85rem",
              borderRadius: "10px",
              background: targetScope === "general" ? "var(--color-primary, #3b82f6)" : "var(--bg-secondary, rgba(255, 255, 255, 0.05))",
              color: targetScope === "general" ? "#fff" : "var(--text-secondary)",
              border: "1px solid var(--border-glass)",
            }}
            onClick={() => setTargetScope("general")}
          >
            ملاحظة عامة على الخدمة
          </button>
        </div>

        {targetScope === "road" && (
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
              اختر الطريق المعني:
            </label>
            <select
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                background: "var(--inputBg, rgba(15, 23, 42, 0.8))",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit",
              }}
              value={selectedRoad?.id || ""}
              onChange={(e) => {
                const found = roads.find((r) => r.id === e.target.value);
                setSelectedRoad(found || null);
              }}
            >
              <option value="">-- حدد الطريق من القائمة --</option>
              {roads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Problem Type Options */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            نوع البلاغ أو الملاحظة:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>
            {ROAD_REPORT_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setProblemType(opt.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: problemType === opt.id ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary, rgba(255, 255, 255, 0.03))",
                  border: `1px solid ${problemType === opt.id ? "#3b82f6" : "var(--border-glass)"}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.82rem",
                  color: "var(--text-primary)",
                }}
              >
                <i className={opt.icon} style={{ color: problemType === opt.id ? "#60a5fa" : "var(--text-secondary)" }} />
                <span>{opt.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details Text Area */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            تفاصيل الملاحظة أو التعديل:
          </label>
          <textarea
            rows={4}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              background: "var(--inputBg, rgba(15, 23, 42, 0.8))",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
              outline: "none",
              fontFamily: "inherit",
              resize: "vertical",
            }}
            placeholder="اكتب تفاصيل التعديل أو السرعة الصحيحة للرادار وموقعها..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        {/* Optional Image Attachment */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            إرفاق صورة (اختياري للتوثيق):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onImageSelect}
            style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
          />
          {imagePreview && (
            <div style={{ marginTop: "8px", width: "100px", height: "70px", position: "relative" }}>
              <img
                src={imagePreview}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
              />
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "12px" }}>
            <i className="bx bx-error" style={{ marginLeft: "4px" }} />
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: "#10b981", fontSize: "0.82rem", marginBottom: "12px" }}>
            <i className="bx bx-check-circle" style={{ marginLeft: "4px" }} />
            {success}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: "10px" }}
          >
            إلغاء
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={loading || uploading}
            style={{ padding: "8px 20px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            {(loading || uploading) && <i className="bx bx-loader-alt bx-spin" />}
            <span>إرسال البلاغ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
