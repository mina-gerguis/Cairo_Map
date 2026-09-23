"use client";

import React from "react";
import { PlaceReviewsFiltersProps, SortOption } from "../types";

export function PlaceReviewsFilters({
  branches,
  branchFilter,
  onBranchFilterChange,
  ratingFilter,
  onRatingFilterChange,
  sortBy,
  onSortByChange,
}: PlaceReviewsFiltersProps) {
  const hasBranches = branches && branches.length > 0;

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap",
        alignItems: "center",
        background: "rgba(120, 120, 120, 0.04)",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid var(--border-glass)",
      }}
    >
      {/* Branch Filter */}
      {hasBranches && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: "1 1 180px",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            📍 الفرع:
          </span>
          <select
            className="input-fields help-select"
            value={branchFilter}
            onChange={(e) => onBranchFilterChange(e.target.value)}
            style={{
              margin: 0,
              padding: "6px 12px",
              fontSize: "0.85rem",
              height: "36px",
              flex: 1,
              background: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <option value="all">كل الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rating Filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flex: "1 1 180px",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          ⭐ التقييم:
        </span>
        <select
          className="input-fields help-select"
          value={ratingFilter}
          onChange={(e) => onRatingFilterChange(e.target.value)}
          style={{
            margin: 0,
            padding: "6px 12px",
            fontSize: "0.85rem",
            height: "36px",
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <option value="all">كل التقييمات</option>
          <option value="5">5 نجوم</option>
          <option value="4">4 نجوم</option>
          <option value="3">3 نجوم</option>
          <option value="2">2 نجوم</option>
          <option value="1">نجمة واحدة</option>
        </select>
      </div>

      {/* Sort Order */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flex: "1 1 180px",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          ⇅ الترتيب:
        </span>
        <select
          className="input-fields help-select"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortOption)}
          style={{
            margin: 0,
            padding: "6px 12px",
            fontSize: "0.85rem",
            height: "36px",
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <option value="newest">الوقت: الأحدث أولاً</option>
          <option value="oldest">الوقت: الأقدم أولاً</option>
          <option value="highest">التقييم: الأعلى للأدنى</option>
          <option value="lowest">التقييم: الأدنى للأعلى</option>
        </select>
      </div>
    </div>
  );
}
