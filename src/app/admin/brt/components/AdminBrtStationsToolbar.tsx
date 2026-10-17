"use client";

import React from "react";
import styles from "../../admin.module.css";
import { AdminBrtStation } from "../types";

interface AdminBrtStationsToolbarProps {
  totalCount: number;
  visibleStations: AdminBrtStation[];
  selectedCount: number;
  selectedStationKeys: Record<string, boolean>;
  onToggleSelectAll: (stations: AdminBrtStation[]) => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

export function AdminBrtStationsToolbar({
  visibleStations,
  selectedCount,
  selectedStationKeys,
  onToggleSelectAll,
  onClearSelection,
  onBulkDelete
}: AdminBrtStationsToolbarProps) {
  if (selectedCount === 0) return null;

  const isAllVisibleSelected =
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
        padding: "12px 18px",
        background: "rgba(99, 102, 241, 0.12)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        borderRadius: "10px",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <input
          type="checkbox"
          checked={isAllVisibleSelected}
          onChange={() => onToggleSelectAll(visibleStations)}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <span style={{ fontSize: "0.9rem", color: "#e0e7ff", fontWeight: "bold" }}>
          تم تحديد <strong style={{ color: "#fff" }}>{selectedCount}</strong> محطة
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          type="button"
          onClick={onClearSelection}
          className="btn btn-secondary"
          style={{ padding: "6px 14px", fontSize: "0.82rem" }}
        >
          إلغاء التحديد
        </button>

        <button
          type="button"
          onClick={onBulkDelete}
          className="btn btn-danger"
          style={{ padding: "6px 14px", fontSize: "0.82rem" }}
        >
          <i className="bx bx-trash" style={{ marginLeft: "4px" }} />
          <span>حذف المحطات المحددة ({selectedCount})</span>
        </button>
      </div>
    </div>
  );
}
