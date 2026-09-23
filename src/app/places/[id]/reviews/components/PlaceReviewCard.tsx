"use client";

import React from "react";
import { PlaceReviewCardProps } from "../types";

export function PlaceReviewCard({
  review,
  currentUserId,
  onDeleteReview,
}: PlaceReviewCardProps) {
  const isAuthor = Boolean(currentUserId && currentUserId === review.user_id);
  const ratingStars = "★".repeat(Math.max(0, Math.min(5, review.rating))) +
    "☆".repeat(Math.max(0, 5 - Math.min(5, review.rating)));

  const formattedDate = new Date(review.created_at).toLocaleDateString("ar-EG", {
    month: "short",
    year: "numeric",
    day: "numeric",
  });

  return (
    <div
      style={{
        background: "var(--bg-glass)",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#ff9f0a", fontSize: "1.1rem" }}>
              {ratingStars}
            </div>

            {isAuthor && (
              <button
                type="button"
                onClick={() => onDeleteReview(review.id, review.rating)}
                style={{
                  background: "rgba(255, 59, 48, 0.1)",
                  color: "#ff3b30",
                  border: "none",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i>
                حذف التعليق
              </button>
            )}
          </div>

          {review.branches && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(120,120,120,0.1)",
                padding: "4px 8px",
                borderRadius: "8px",
                width: "fit-content",
                marginTop: "6px",
              }}
            >
              <span>🏢</span>
              <span style={{ fontWeight: "600" }}>{review.branches.name}</span>
              <span>-</span>
              <span style={{ opacity: 0.8 }}>{review.branches.city}</span>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontWeight: "600" }}>
            {review.profiles?.full_name || "مستخدم"}
          </span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {review.comment && (
        <p
          style={{
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            lineHeight: "1.5",
            marginTop: "10px",
          }}
        >
          {review.comment}
        </p>
      )}
    </div>
  );
}
