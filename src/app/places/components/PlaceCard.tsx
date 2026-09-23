"use client";

import React from "react";
import { FaMapPin } from "react-icons/fa";
import { AiOutlineBranches } from "react-icons/ai";
import { PlaceCardProps } from "../types";
import { CATEGORY_ICONS } from "../constants";
import ImageWithSkeleton from "./ImageWithSkeleton";

export default function PlaceCard({
  place,
  getCategoryColor,
  showRating,
  toggleFavorite,
  favoriteIds,
}: PlaceCardProps) {
  const isFav = favoriteIds?.has(place.id.toString());

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "180px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ImageWithSkeleton
          src={place.images?.[0] ?? ""}
          alt={place.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
          }}
        />

        {toggleFavorite && favoriteIds && (
          <button
            onClick={(e) => toggleFavorite(e, place.id.toString())}
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              zIndex: 1,
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(4px)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
            aria-label={isFav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            {isFav ? (
              <i
                className="bx bxs-heart"
                style={{ color: "#ff3b30", fontSize: "1.2rem" }}
              />
            ) : (
              <i
                className="bx bx-heart"
                style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}
              />
            )}
          </button>
        )}

        <span
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: getCategoryColor(place.category),
            color: "#fff",
            fontSize: "0.78rem",
            fontWeight: "700",
            padding: "5px 10px",
            borderRadius: "10px",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i
            className={`bx ${CATEGORY_ICONS[place.category] || "bx-tag"}`}
            style={{ fontSize: "0.95rem" }}
          />
          {place.categoryLabel}
        </span>

        {(showRating || place.rating !== undefined) &&
          place.rating !== undefined && (
            <span
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ⭐ {Number(place.rating).toFixed(1)}{" "}
              {place.reviewsCount ? `(${place.reviewsCount})` : ""}
            </span>
          )}

        {place.distanceKm !== undefined && (
          <span
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              background: "rgba(47,128,237,0.75)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: "10px",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}
          >
            {place.distanceKm < 1
              ? `${Math.round(place.distanceKm * 1000)} م`
              : `${place.distanceKm.toFixed(1)} كم`}
            {place.closestBranchName && ` (${place.closestBranchName})`}
          </span>
        )}
      </div>

      <div style={{ padding: "16px 16px 18px" }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            fontWeight: "800",
            marginBottom: "4px",
            color: "var(--text-primary)",
          }}
        >
          {place.name}
        </h3>

        {place.name_en && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "4px",
              direction: "ltr",
              textAlign: "right",
            }}
          >
            {place.name_en}
          </div>
        )}

        {place.shortDescription && (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              marginBottom: "6px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {place.shortDescription}
          </p>
        )}

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "2px",
          }}
        >
          <span>
            <FaMapPin />
          </span>{" "}
          {place.city} / {place.governorate}
        </p>

        {place.branches && place.branches.length > 1 && (
          <p
            style={{
              color: "var(--color-secondary)",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "4px",
              fontWeight: "600",
            }}
          >
            <span>
              <AiOutlineBranches />
            </span>{" "}
            عدد الفروع: {place.branches.length}
          </p>
        )}
      </div>
    </>
  );
}
