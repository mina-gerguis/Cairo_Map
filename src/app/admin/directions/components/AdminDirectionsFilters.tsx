import React from "react";
import styles from "../directions.module.css";
import { TRANSIT_VEHICLE_CONFIG } from "../constants";

interface AdminDirectionsFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: string;
  onFilterTypeChange: (val: string) => void;
}

export function AdminDirectionsFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange
}: AdminDirectionsFiltersProps) {
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-card)", padding: "20px", marginBottom: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search Input bar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <i
            className="bx bx-search"
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              fontSize: "1.2rem",
              pointerEvents: "none"
            }}
          />
          <input
            type="text"
            className="input-fields"
            style={{ width: "100%", paddingRight: "44px" }}
            placeholder="ابحث باسم نقطة البداية، الوجهة، أو الكلمات البديلة..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            وسيلة المواصلات:
          </span>
          <select
            className="input-fields"
            style={{ width: "auto", minWidth: "160px", padding: "8px 12px", fontSize: "0.85rem" }}
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
          >
            <option value="all">جميع الوسائل</option>
            {Object.entries(TRANSIT_VEHICLE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
