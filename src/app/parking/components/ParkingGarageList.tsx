"use client";

import React from "react";
import { ParkingGarageListProps } from "../types";
import { ParkingGarageCard } from "./ParkingGarageCard";

export function ParkingGarageList({
  parkings,
  expandedParkingId,
  onToggleParking,
  onReportParking,
  searchTerm,
  onOpenSuggestModal,
}: ParkingGarageListProps) {
  return (
    <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "24px" }}>
      {/* Title */}
      <div
        style={{
          fontSize: "1.2rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <i
          className="bx bx-parking"
          style={{ color: "var(--color-secondary)", fontSize: "1.4rem" }}
        ></i>
        الجراجات المتاحة ({parkings.length})
      </div>

      {parkings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "36px 20px",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.1)",
              color: "var(--color-secondary, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
            }}
          >
            <i className="bx bx-search-alt"></i>
          </div>

          <div>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "1.05rem",
                fontWeight: "700",
                color: "var(--text-primary)",
              }}
            >
              لم يتم العثور على جراجات مطابقة للبحث
            </p>
            {searchTerm.trim() && (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                لا يوجد جراج مسجل باسم &ldquo;
                <span
                  style={{
                    color: "var(--color-secondary)",
                    fontWeight: "700",
                  }}
                >
                  {searchTerm.trim()}
                </span>
                &rdquo;
              </p>
            )}
          </div>

          <div
            style={{
              marginTop: "6px",
              padding: "14px 18px",
              background: "var(--bg-secondary)",
              border: "1px dashed var(--border-glass)",
              borderRadius: "12px",
              maxWidth: "420px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "0.88rem",
                color: "var(--text-primary)",
                fontWeight: "600",
              }}
            >
              هل تعرف هذا الجراج أو ترغب في إضافته إلى الدليل؟
            </div>
            <button
              type="button"
              onClick={() => onOpenSuggestModal(searchTerm.trim())}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--color-secondary, #3b82f6)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "9px 20px",
                fontSize: "0.9rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                transition: "all 0.2s ease",
                fontFamily: "var(--font-cairo)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-1px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <i className="fa-solid fa-lightbulb"></i>
              <span>اقترح إضافة هذا الجراج</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {parkings.map((parking) => (
            <ParkingGarageCard
              key={parking.id}
              parking={parking}
              isExpanded={expandedParkingId === parking.id}
              onToggle={() => onToggleParking(parking.id)}
              onReportParking={onReportParking}
            />
          ))}
        </div>
      )}
    </div>
  );
}
