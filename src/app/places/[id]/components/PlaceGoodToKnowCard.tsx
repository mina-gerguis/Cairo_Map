"use client";

import React from "react";
import { FEATURES_LIST } from "@/data/places";
import { PlaceGoodToKnowCardProps } from "../types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../constants";

export default function PlaceGoodToKnowCard({
  place,
  displayBranch,
}: PlaceGoodToKnowCardProps) {
  const activeFeatures = displayBranch?.features || place.features;
  const activeServices = displayBranch?.services || place.services;

  return (
    <div style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          fontWeight: "700",
          marginBottom: "12px",
          color: "var(--text-primary)",
        }}
      >
        معلومات مفيدة
      </h3>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid var(--border-glass)",
          borderRadius: "14px",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {activeFeatures && activeFeatures.length > 0 ? (
          activeFeatures.map((fKey: string) => {
            const feat = FEATURES_LIST.find((f) => f.key === fKey);
            if (!feat) return null;
            return (
              <div
                key={fKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.92rem",
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{feat.icon}</span>
                <span>{feat.label}</span>
              </div>
            );
          })
        ) : place.category === "restaurant" || place.category === "cafe" ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🥗</span>
              <span>خيارات نباتية متوفرة</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>👥</span>
              <span>مناسب للمجموعات والعائلات</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>💳</span>
              <span>يقبل الدفع بالبطاقات الائتمانية</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📶</span>
              <span>شبكة واي فاي مجانية</span>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>✔️</span>
              <span>مرافق مريحة للزوار</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>♿</span>
              <span>مدخل سهل للكراسي المتحركة</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>👨‍👩‍👧‍👦</span>
              <span>مناسب لجميع الأعمار</span>
            </div>
          </>
        )}

        {/* Sub-categories Badges */}
        {place.subCategories && place.subCategories.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(120, 120, 120, 0.1)",
              paddingTop: "12px",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              التصنيفات الفرعية:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {place.subCategories.map((subCatKey) => (
                <span
                  key={subCatKey}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-glass)",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i
                    className={`bx ${CATEGORY_ICONS[subCatKey] || "bx-tag"}`}
                    style={{ fontSize: "0.95rem" }}
                  ></i>
                  {CATEGORY_LABELS[subCatKey] || subCatKey}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Services section */}
        {activeServices && activeServices.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(120, 120, 120, 0.1)",
              paddingTop: "12px",
              marginTop: "12px",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              الخدمات المتاحة:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {activeServices.map((serviceName: string) => (
                <span
                  key={serviceName}
                  style={{
                    background: "rgba(0, 111, 238, 0.08)",
                    color: "var(--color-primary)",
                    border: "1px solid rgba(0, 111, 238, 0.2)",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i
                    className="bx bx-check-double"
                    style={{ fontSize: "0.95rem" }}
                  ></i>
                  {serviceName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
