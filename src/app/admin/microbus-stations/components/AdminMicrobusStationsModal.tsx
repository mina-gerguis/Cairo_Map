"use client";

import React from "react";
import clsx from "clsx";
import CancelButton from "@/components/ui/button/CancelButton";
import SubmitButton from "@/components/ui/button/SubmitButton";
import { AdminMicrobusStation, AdminMicrobusRoute, MicrobusStationFormData } from "../types";
import { RouteItemEditor } from "./RouteItemEditor";
import { EGYPT_DESTINATIONS } from "../constants";

interface AdminMicrobusStationsModalProps {
  isOpen: boolean;
  editingItem: AdminMicrobusStation | null;
  formData: MicrobusStationFormData;
  visualRoutes: AdminMicrobusRoute[];
  onClose: () => void;
  onFormFieldChange: (field: keyof MicrobusStationFormData, value: string) => void;
  onRouteFieldChange: (index: number, field: keyof AdminMicrobusRoute, value: string) => void;
  onAddRoute: () => void;
  onRemoveRoute: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminMicrobusStationsModal({
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
}: AdminMicrobusStationsModalProps) {
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
          maxWidth: "650px",
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
          <h2 style={{ fontSize: "1.35rem", fontWeight: "900", margin: 0 }}>
            {editingItem ? "تعديل بيانات الموقف" : "إضافة موقف سرفيس جديد"}
          </h2>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label
                className={clsx("help-label", "color-white-100")}
                style={{ display: "block", marginBottom: "6px" }}
              >
                اسم الموقف *
              </label>
              <input
                type="text"
                required
                placeholder="أدخل اسم الموقف"
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
                المحافظة *
              </label>
              <input
                type="text"
                required
                placeholder="أدخل المحافظة"
                value={formData.governorate}
                onChange={(e) => onFormFieldChange("governorate", e.target.value)}
                className="input-fields"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label
              className={clsx("help-label", "color-white-100")}
              style={{ display: "block", marginBottom: "6px" }}
            >
              العنوان بالتفصيل *
            </label>
            <input
              type="text"
              required
              placeholder="أدخل العنوان بالتفصيل"
              value={formData.location}
              onChange={(e) => onFormFieldChange("location", e.target.value)}
              className="input-fields"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label
              className={clsx("help-label", "color-white-100")}
              style={{ display: "block", marginBottom: "6px" }}
            >
              رابط خريطة جوجل *
            </label>
            <input
              type="url"
              required
              placeholder="أدخل رابط خريطة جوجل"
              value={formData.map_url}
              onChange={(e) => onFormFieldChange("map_url", e.target.value)}
              className="input-fields"
              style={{ width: "100%" }}
            />
          </div>

          {/* Visual Routes Editor Section */}
          <div
            style={{
              borderTop: "1px solid var(--border-primary)",
              paddingTop: "16px",
              marginTop: "8px"
            }}
          >
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: "800",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-sub)"
              }}
            >
              <span>تحديد المسارات والتفاصيل :</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {visualRoutes.map((route, idx) => (
                <RouteItemEditor
                  key={idx}
                  route={route}
                  index={idx}
                  totalRoutes={visualRoutes.length}
                  onFieldChange={(field, val) => onRouteFieldChange(idx, field, val)}
                  onRemove={() => onRemoveRoute(idx)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onAddRoute}
              className="btn btn-purple mt-12 w-full"
            >
              + إضافة مسار سير جديد
            </button>
          </div>

          {/* Footer Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end"
            }}
          >
            <CancelButton
              onClick={onClose}
              style={{
                width: "100%",
                padding: "10px 30px",
                margin: "10px 0"
              }}
            >
              إلغاء
            </CancelButton>

            <SubmitButton
              editingItem={Boolean(editingItem)}
              style={{
                margin: "10px 0",
                padding: "10px 30px",
                width: "100%"
              }}
            />
          </div>
        </form>
      </div>

      {/* Datalist helper for common destinations */}
      <datalist id="egypt-destinations">
        {EGYPT_DESTINATIONS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
    </div>
  );
}
