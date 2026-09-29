"use client";

import React from "react";
import clsx from "clsx";
import { AdminBrtRoute } from "../types";
import { BRT_VEHICLE_OPTIONS } from "../constants";

interface BrtRouteItemEditorProps {
  route: AdminBrtRoute;
  index: number;
  totalRoutes: number;
  onFieldChange: (field: keyof AdminBrtRoute, value: string) => void;
  onRemove: () => void;
}

export function BrtRouteItemEditor({
  route,
  index,
  totalRoutes,
  onFieldChange,
  onRemove
}: BrtRouteItemEditorProps) {
  return (
    <div
      style={{
        background: "var(--bg-secondary, rgba(15, 23, 42, 0.6))",
        border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
        padding: "16px",
        borderRadius: "12px",
        position: "relative"
      }}
    >
      {/* Header row inside card */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }}
      >
        <span style={{ fontSize: "0.88rem", fontWeight: "bold", color: "#e0e7ff" }}>
          مسار رقم {index + 1}
        </span>
        {totalRoutes > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-danger"
            style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer" }}
          >
            <i className="bx bx-trash" style={{ marginLeft: "4px" }} />
            حذف المسار
          </button>
        )}
      </div>

      {/* Row 1: Destination & Fare */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "12px"
        }}
      >
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            الوجهة / المحطة القادمة *
          </label>
          <input
            type="text"
            required
            value={route.destination}
            onChange={(e) => onFieldChange("destination", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: كايرو فستيفال سيتي"
          />
        </div>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            سعر التذكرة (ج.م) *
          </label>
          <input
            type="text"
            required
            value={route.fare}
            onChange={(e) => onFieldChange("fare", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: 15"
          />
        </div>
      </div>

      {/* Row 2: Vehicle Type & Duration */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "12px"
        }}
      >
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            نوع الأتوبيس
          </label>
          <select
            value={route.vehicleType || "أتوبيس ترددي كهربائي سريع"}
            onChange={(e) => onFieldChange("vehicleType", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
          >
            {BRT_VEHICLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            المدة التقريبية (بالدقائق)
          </label>
          <input
            type="text"
            value={route.duration || ""}
            onChange={(e) => onFieldChange("duration", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: 18"
          />
        </div>
      </div>

      {/* Row 3: Via stops & Notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            المحطات البينية (عبر)
          </label>
          <input
            type="text"
            value={route.via || ""}
            onChange={(e) => onFieldChange("via", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: طريق السويس - أكاديمية الشرطة"
          />
        </div>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            ملاحظات المسار
          </label>
          <input
            type="text"
            value={route.notes || route.description || ""}
            onChange={(e) => onFieldChange("notes", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: تقاطر كل 3 دقائق"
          />
        </div>
      </div>
    </div>
  );
}
