"use client";

import React from "react";
import styles from "../../admin.module.css";
import { BRT_SECTORS } from "../constants";

interface AdminBrtStationsSearchProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sectorFilter: string;
  onSectorFilterChange: (sector: string) => void;
  totalCount: number;
}

export function AdminBrtStationsSearch({
  searchQuery,
  onSearchChange,
  sectorFilter,
  onSectorFilterChange,
  totalCount
}: AdminBrtStationsSearchProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "20px"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <i
            className="bx bx-search"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              right: "14px",
              color: "var(--text-muted, #94a3b8)",
              fontSize: "1.1rem"
            }}
          />
          <input
            type="text"
            className="input-fields"
            style={{
              width: "100%",
              paddingRight: "40px",
              background: "var(--bg-glass, rgba(30, 41, 59, 0.7))"
            }}
            placeholder="ابحث عن محطة، قطاع، محافظة، وجهة، معلم أو مسار..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                left: "12px",
                background: "transparent",
                border: "none",
                color: "var(--text-muted, #94a3b8)",
                cursor: "pointer"
              }}
            >
              <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
            </button>
          )}
        </div>

        {/* Sector Filter Dropdown */}
        <div style={{ minWidth: "180px" }}>
          <select
            className="input-fields"
            style={{
              width: "100%",
              background: "var(--bg-glass, rgba(30, 41, 59, 0.7))"
            }}
            value={sectorFilter}
            onChange={(e) => onSectorFilterChange(e.target.value)}
          >
            <option value="all">جميع القطاعات</option>
            {BRT_SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            fontSize: "0.88rem",
            color: "var(--text-muted, #94a3b8)",
            padding: "8px 14px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
            whiteSpace: "nowrap"
          }}
        >
          إجمالي النتائج: <strong style={{ color: "var(--text-primary, #fff)" }}>{totalCount}</strong> محطة
        </div>
      </div>

      {/* Sector Quick Pills */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #94a3b8)", marginLeft: "4px" }}>
          تصفية سريعة بالقطاع:
        </span>
        <button
          type="button"
          onClick={() => onSectorFilterChange("all")}
          style={{
            fontSize: "0.78rem",
            padding: "4px 10px",
            borderRadius: "20px",
            border: "1px solid",
            borderColor: sectorFilter === "all" ? "var(--color-primary, #6366f1)" : "rgba(255,255,255,0.1)",
            background: sectorFilter === "all" ? "rgba(99, 102, 241, 0.2)" : "transparent",
            color: sectorFilter === "all" ? "#fff" : "var(--text-muted, #94a3b8)",
            cursor: "pointer"
          }}
        >
          الكل
        </button>
        {BRT_SECTORS.map((sec) => {
          const isActive = sectorFilter === sec;
          return (
            <button
              key={sec}
              type="button"
              onClick={() => onSectorFilterChange(sec)}
              style={{
                fontSize: "0.78rem",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: isActive ? "var(--color-primary, #6366f1)" : "rgba(255,255,255,0.1)",
                background: isActive ? "rgba(99, 102, 241, 0.2)" : "transparent",
                color: isActive ? "#fff" : "var(--text-muted, #94a3b8)",
                cursor: "pointer"
              }}
            >
              {sec}
            </button>
          );
        })}
      </div>
    </div>
  );
}
