"use client";

import React from "react";

interface AdminMicrobusStationsSearchProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  totalCount: number;
}

export function AdminMicrobusStationsSearch({
  searchQuery,
  onSearchChange,
  totalCount
}: AdminMicrobusStationsSearchProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "16px"
      }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
        <i
          className="bx bx-search"
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            fontSize: "1.1rem"
          }}
        />
        <input
          type="text"
          className="input-fields"
          placeholder="البحث عن موقف، مسار، محافظة..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: "100%", paddingRight: "40px" }}
        />
      </div>
      <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
        إجمالي المواقف: {totalCount}
      </div>
    </div>
  );
}
