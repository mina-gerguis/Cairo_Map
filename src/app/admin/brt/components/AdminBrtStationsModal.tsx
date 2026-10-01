"use client";

import React from "react";
import clsx from "clsx";
import CancelButton from "@/components/ui/button/CancelButton";
import SubmitButton from "@/components/ui/button/SubmitButton";
import { AdminBrtStation, AdminBrtRoute, BrtStationFormData } from "../types";
import { BrtRouteItemEditor } from "./BrtRouteItemEditor";
import { BRT_SECTORS, BRT_STATUS_OPTIONS, BRT_TYPE_OPTIONS } from "../constants";

interface AdminBrtStationsModalProps {
  isOpen: boolean;
  editingItem: AdminBrtStation | null;
  formData: BrtStationFormData;
  visualRoutes: AdminBrtRoute[];
  onClose: () => void;
  onFormFieldChange: (field: keyof BrtStationFormData, value: string) => void;
  onRouteFieldChange: (index: number, field: keyof AdminBrtRoute, value: string) => void;
  onAddRoute: () => void;
  onRemoveRoute: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminBrtStationsModal({
  isOpen,
  editingItem,
  formData,
  visualRoutes,
  onClose,
  onFormFieldChange,
  onRouteFieldChange,
  onAddRoute,
  onRemoveRoute,
  onSubmit
}: AdminBrtStationsModalProps) {
  if (!isOpen) return null;

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
          maxWidth: "720px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "30px",
          border: "1px solid var(--border-glass)",
          background: "var(--bg-glass)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)"
        }}
      >
        {/* Modal Header */}
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
            <img src="/images/icons2d/brt.webp" alt="BRT" style={{ width: "28px", height: "28px" }} />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", margin: 0 }}>
              {editingItem ? "تعديل محطة الأتوبيس الترددي" : "إضافة محطة BRT جديدة"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="btn-close"
          >
            <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Name & Sector */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "14px" }}>
            <div>
              <label
                className={clsx("help-label", "color-white-100")}
                style={{ display: "block", marginBottom: "6px" }}
              >
                اسم المحطة *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: محطة عدلي منصور التبادلية (BRT)"
                value={formData.name}
                onChange={(e) => onFormFieldChange("name", e.target.value)}
                className="input-fields"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label
                className={clsx("help-label", "color-white-100")}
                style={{ display: "block", marginBottom: "6px" }}
              >
                القطاع *
              </label>
              <select
                required
                value={formData.sector}
                onChange={(e) => onFormFieldChange("sector", e.target.value)}
                className="input-fields"
                style={{ width: "100%" }}
              >
                {BRT_SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Governorate & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label
                className={clsx("help-label", "color-white-100")}
                style={{ display: "block", marginBottom: "6px" }}
              >
                المحافظة *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: القاهرة / الجيزة / القليوبية"
                value={formData.governorate}
                onChange={(e) => onFormFieldChange("governorate", e.target.value)}
                className="input-fields"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label
                className={clsx("help-label", "color-white-100")}
                style={{ display: "block", marginBottom: "6px" }}
              >
                حالة التشغيل
              </label>
              <select
                value={formData.status}
                onChange={(e) => onFormFieldChange("status", e.target.value)}
                className="input-fields"
                style={{ width: "100%" }}
              >
                {BRT_STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Location */}
          <div>
            <label
              className={clsx("help-label", "color-white-100")}
              style={{ display: "block", marginBottom: "6px" }}
            >
              العنوان والموقع بالتفصيل على الدائري *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: تقاطع الطريق الدائري مع طريق مصر الإسماعيلية ومحور الفريق الشاذلي"
              value={formData.location}
              onChange={(e) => onFormFieldChange("location", e.target.value)}
              className="input-fields"
              style={{ width: "100%" }}
            />
          </div>

          {/* Row 4: Type & Map URL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label
                className={clsx("help-label", "color-white-100")}
                style={{ display: "block", marginBottom: "6px" }}
              >
                تصنيف / نوع المحطة
              </label>
              <input
                type="text"
                list="brt-type-suggestions"
                placeholder="اختر أو اكتب نوع المحطة"
                value={formData.type}
                onChange={(e) => onFormFieldChange("type", e.target.value)}
                className="input-fields"
                style={{ width: "100%" }}
              />
              <datalist id="brt-type-suggestions">
                {BRT_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value} />
                ))}
              </datalist>
            </div>
            <div>
              <label
                className={clsx("help-label", "color-white-100")}
                style={{ display: "block", marginBottom: "6px" }}
              >
                رابط خرائط جوجل (Google Maps)
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={formData.map_url}
                onChange={(e) => onFormFieldChange("map_url", e.target.value)}
                className="input-fields"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Row 5: Landmarks */}
          <div>
            <label
              className={clsx("help-label", "color-white-100")}
              style={{ display: "block", marginBottom: "6px" }}
            >
              أهم المعالم والربط التبادلي (مفصولة بفواصل)
            </label>
            <input
              type="text"
              placeholder="مثال: مترو الخط الثالث، القطار الكهربائي LRT، محطة السوبرجيت"
              value={formData.landmarksText}
              onChange={(e) => onFormFieldChange("landmarksText", e.target.value)}
              className="input-fields"
              style={{ width: "100%" }}
            />
          </div>

          {/* Section: BRT Routes Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: "900", color: "#e0e7ff" }}>
              مسارات وخطوط سير المحطة ({visualRoutes.length})
            </span>
            <button
              type="button"
              onClick={onAddRoute}
              className="btn btn-primary"
              style={{ padding: "6px 14px", fontSize: "0.82rem", borderRadius: "6px" }}
            >
              <i className="bx bx-plus" style={{ marginLeft: "4px" }} />
              إضافة مسار آخر
            </button>
          </div>

          {/* Dynamic Route Editors */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {visualRoutes.map((route, idx) => (
              <BrtRouteItemEditor
                key={idx}
                route={route}
                index={idx}
                totalRoutes={visualRoutes.length}
                onFieldChange={(field, val) => onRouteFieldChange(idx, field, val)}
                onRemove={() => onRemoveRoute(idx)}
              />
            ))}
          </div>

          {/* Form Actions Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <CancelButton onClick={onClose}>إلغاء</CancelButton>
            <SubmitButton onClick={onSubmit}>
              <i className="bx bx-save" style={{ marginLeft: "6px" }} />
              {editingItem ? "حفظ التعديلات" : "إضافة المحطة"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
