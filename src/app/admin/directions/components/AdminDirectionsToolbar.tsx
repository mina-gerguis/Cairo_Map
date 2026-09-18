import React from "react";
import { GroupedRoute } from "../types";

interface AdminDirectionsToolbarProps {
  totalCount: number;
  visibleRoutes: GroupedRoute[];
  selectedCount: number;
  selectedRouteKeys: Record<string, boolean>;
  onToggleSelectAll: (visibleRoutes: GroupedRoute[]) => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function AdminDirectionsToolbar({
  totalCount,
  visibleRoutes,
  selectedCount,
  selectedRouteKeys,
  onToggleSelectAll,
  onClearSelection,
  onBulkDelete,
  onExpandAll,
  onCollapseAll
}: AdminDirectionsToolbarProps) {
  const isAllSelected =
    visibleRoutes.length > 0 &&
    visibleRoutes.every((r) => {
      const key = `${r.from_location.trim()}|||${r.to_location.trim()}`;
      return !!selectedRouteKeys[key];
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
        {visibleRoutes.length > 0 && (
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
              onChange={() => onToggleSelectAll(visibleRoutes)}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                accentColor: "var(--color-primary)",
              }}
            />
            <span style={{ fontFamily: "var(--font-sub)" }}>تحديد الكل</span>
          </label>
        )}

        <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-secondary)", fontFamily: "var(--font-sub)" }}>
          إجمالي المسارات المطابقة ({totalCount})
        </span>

        {selectedCount > 0 && (
          <span
            className="tab"
          >
            تم تحديد ({selectedCount}) مسار
          </span>
        )}
      </div>

      {/* Right Group: Bulk Actions & Accordion Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {/* Bulk Delete Button when items are selected */}
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
                fontSize: "0.8rem",
              }}
            >
              إلغاء التحديد
            </button>
          </> 
        )}

        {totalCount > 0 && (
          <>
            <button
              type="button"
              className="btn"
              onClick={onExpandAll}
              style={{
                padding: "6px 12px",
                fontSize: "0.78rem",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <i className="bx bx-expand-vertical" />
              <span>فتح الكل</span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={onCollapseAll}
              style={{
                padding: "6px 12px",
                fontSize: "0.78rem",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <i className="bx bx-collapse-vertical" />
              <span>إغلاق الكل</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
