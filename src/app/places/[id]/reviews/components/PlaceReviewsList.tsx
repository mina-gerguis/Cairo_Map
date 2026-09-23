"use client";

import React from "react";
import { PlaceReviewsListProps } from "../types";
import { PlaceReviewCard } from "./PlaceReviewCard";

export function PlaceReviewsList({
  reviews,
  currentUserId,
  onDeleteReview,
}: PlaceReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "var(--text-secondary)",
          padding: "40px",
          background: "rgba(120, 120, 120, 0.04)",
          borderRadius: "16px",
        }}
      >
        لا توجد تقييمات تطابق خيارات التصفية المحددة.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {reviews.map((review) => (
        <PlaceReviewCard
          key={review.id}
          review={review}
          currentUserId={currentUserId}
          onDeleteReview={onDeleteReview}
        />
      ))}
    </div>
  );
}
