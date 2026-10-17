"use client";

import React from "react";
import clsx from "clsx";
import { AdminMicrobusRoute } from "../types";
import { VEHICLE_TYPE_OPTIONS, STATION_TYPE_OPTIONS } from "../constants";

interface RouteItemEditorProps {
  route: AdminMicrobusRoute;
  index: number;
  totalRoutes: number;
  onFieldChange: (field: keyof AdminMicrobusRoute, value: string) => void;
  onRemove: () => void;
}

export function RouteItemEditor({
  route,
  index,
  totalRoutes,
  onFieldChange,
  onRemove
}: RouteItemEditorProps) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-glass)",
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
        <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
         {index + 1} -  خط الـ 
        </span>
        {totalRoutes > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-danger"
            style={{padding: "6px 12px", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer"}}
          >
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
            خط الـ *
          </label>
          <input
            type="text"
            required
            value={route.destination}
            onChange={(e) => onFieldChange("destination", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="اكتب أو اختر الوجهة..."
          />
        </div>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
           الأجرة *
          </label>
          <input
            type="text"
            required
            value={route.fare}
            onChange={(e) => onFieldChange("fare", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: 12 ج.م"
          />
        </div>
      </div>

      {/* Row 2: Vehicle Type & Station Type */}
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
            نوع العربية
          </label>
          <select
            value={route.vehicleType}
            onChange={(e) => onFieldChange("vehicleType", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
          >
            {VEHICLE_TYPE_OPTIONS.map((opt) => (
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
            نوع الموقف
          </label>
          <select
            value={route.type || "official"}
            onChange={(e) => onFieldChange("type", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
          >
            {STATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Duration & Last Updated */}
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
            وقت الوصول
          </label>
          <input
            type="text"
            value={route.duration || ""}
            onChange={(e) => onFieldChange("duration", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: 45 دقيقة"
          />
        </div>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            تاريخ آخر تحديث
          </label>
          <input
            type="date"
            value={route.lastUpdated || ""}
            onChange={(e) => onFieldChange("lastUpdated", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Row 4: Description & Via */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
            وصف الخط (ملاحظات)
          </label>
          <input
            type="text"
            value={route.description || ""}
            onChange={(e) => onFieldChange("description", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="مثال: خط سريع مباشر بدون توقف"
          />
        </div>
        <div>
          <label
            className={clsx("help-label", "color-white-100")}
            style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}
          >
           خط السير
          </label>
          <input
            type="text"
            value={route.via || ""}
            onChange={(e) => onFieldChange("via", e.target.value)}
            className="input-fields"
            style={{ width: "100%" }}
            placeholder="الشوارع والمناطق: رمسيس - الدائري"
          />
        </div>
      </div>
    </div>
  );
}
