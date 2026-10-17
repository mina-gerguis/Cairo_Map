"use client";

import React from "react";
import { AdminMicrobusStation } from "../types";

interface AdminMicrobusStationsToolbarProps {
  totalCount: number;
  visibleStations: AdminMicrobusStation[];
  selectedCount: number;
  selectedStationKeys: Record<string, boolean>;
  onToggleSelectAll: (visibleStations: AdminMicrobusStation[]) => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

export function AdminMicrobusStationsToolbar({
  totalCount,
  visibleStations,
  selectedCount,
  selectedStationKeys,
  onToggleSelectAll,
  onClearSelection,
  onBulkDelete
}: AdminMicrobusStationsToolbarProps) {
  const isAllSelected =
    visibleStations.length > 0 &&
    visibleStations.every((s) => {
      const key = s.id || s.name.trim();
      return !!selectedStationKeys[key];
    });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        padding: "0 4px",
        marginBottom: "16px"
      }}
    >
      {/* Left Group: Select All Checkbox & Count info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {visibleStations.length > 0 && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              userSelect: "none"
            }}
          >
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => onToggleSelectAll(visibleStations)}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                accentColor: "var(--color-primary)"
              }}
            />
            <span style={{ fontFamily: "var(--font-sub)" }}>تحديد الكل</span>
          </label>
        )}

        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: "800",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sub)"
          }}
        >
          إجمالي المواقف المطابقة ({totalCount})
        </span>

        {selectedCount > 0 && (
          <span
            className="tab"
            style={{
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "700"
            }}
          >
            تم تحديد ({selectedCount}) موقف
          </span>
        )}
      </div>

      {/* Right Group: Bulk Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {selectedCount > 0 && (
          <>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onBulkDelete}
              style={{
                padding: "6px 14px",
                fontSize: "0.82rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <i className="bx bx-trash" style={{ fontSize: "1rem" }} />
              <span>حذف المحدد ({selectedCount})</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearSelection}
              style={{
                padding: "6px 12px",
                fontSize: "0.8rem"
              }}
            >
              إلغاء التحديد
            </button>
          </>
        )}
      </div>
    </div>
  );
}
