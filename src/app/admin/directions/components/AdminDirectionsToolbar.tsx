import React from "react";
import styles from "../directions.module.css";
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
        padding: "0 4px"
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
                accentColor: "var(--colorPrimary, #2563eb)"
              }}
            />
            <span>تحديد الكل</span>
          </label>
        )}

        <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--textSecondary, #64748b)" }}>
          الطرق والمسارات ({totalCount})
        </span>

        {selectedCount > 0 && (
          <span
            style={{
              background: "rgba(0, 111, 238, 0.15)",
              color: "#3b82f6",
              border: "1px solid rgba(0, 111, 238, 0.3)",
              padding: "3px 10px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: "800"
            }}
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
              className={styles.removeBtn}
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
              className={styles.secondaryActionBtn}
              onClick={onClearSelection}
              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            >
              إلغاء التحديد
            </button>
          </>
        )}

        {totalCount > 0 && (
          <>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={onExpandAll}
              style={{ padding: "6px 12px", fontSize: "0.78rem" }}
            >
              <i className="bx bx-expand-vertical" />
              <span>فتح الكل</span>
            </button>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={onCollapseAll}
              style={{ padding: "6px 12px", fontSize: "0.78rem" }}
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
