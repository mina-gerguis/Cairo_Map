"use client";

import React from "react";
import { MapPlacePoint } from "../types";
import { FaStar, FaTimes, FaSearch } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { getCategoryColor, CATEGORY_EMOJIS } from "@/app/places/constants";
import styles from "../map.module.css";

interface MapSidebarListProps {
  isOpen: boolean;
  onClose: () => void;
  points: MapPlacePoint[];
  selectedPoint: MapPlacePoint | null;
  onSelectPoint: (point: MapPlacePoint) => void;
}

export default function MapSidebarList({
  isOpen,
  onClose,
  points,
  selectedPoint,
  onSelectPoint,
}: MapSidebarListProps) {
  return (
    <div className={`${styles.sidebarDrawer} ${!isOpen ? styles.collapsed : ""}`}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>
          <i className="bx bx-map-pin" style={{ color: "var(--color-primary)", fontSize: "1.2rem" }}></i>
          <span>الأماكن المتاحة ({points.length})</span>
        </div>
        <button
          className={styles.sidebarCloseBtn}
          onClick={onClose}
          aria-label="إغلاق قائمة الأماكن"
        >
          <FaTimes />
        </button>
      </div>

      {/* List Content */}
      <div className={styles.sidebarContentList}>
        {points.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaSearch style={{ fontSize: "1.8rem", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>لا توجد أماكن مطابقة للبحث الحالي</p>
          </div>
        ) : (
          points.map((point) => {
            const isSelected = selectedPoint?.id === point.id;
            const categoryColor = getCategoryColor(point.category);
            const categoryEmoji = CATEGORY_EMOJIS[point.category] || "📍";
            const thumbnail =
              point.images && point.images.length > 0
                ? point.images[0]
                : "/images/icons3d/burger.png";

            return (
              <div
                key={point.id}
                className={`${styles.placeListItem} ${isSelected ? styles.selected : ""}`}
                onClick={() => onSelectPoint(point)}
              >
                <img
                  src={thumbnail}
                  alt={point.name}
                  className={styles.placeListThumb}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/icons3d/burger.png";
                  }}
                />

                <div className={styles.placeListDetails}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "2px",
                      }}
                    >
                      <span style={{ fontSize: "0.72rem" }}>{categoryEmoji}</span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: categoryColor,
                        }}
                      >
                        {point.categoryLabel}
                      </span>
                      {point.isOpenNow !== undefined && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            marginRight: "auto",
                            color: point.isOpenNow ? "#10b981" : "#ef4444",
                          }}
                        >
                          {point.isOpenNow ? "مفتوح" : "مغلق"}
                        </span>
                      )}
                    </div>

                    <div className={styles.placeListName}>
                      {point.name}
                      {point.branchName && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            fontWeight: 500,
                            marginRight: "4px",
                          }}
                        >
                          ({point.branchName})
                        </span>
                      )}
                    </div>

                    <div className={styles.placeListAddress}>
                      <IoLocationSharp style={{ fontSize: "0.75rem", marginLeft: "2px" }} />
                      {point.fullAddress || `${point.city || ""} ${point.governorate || ""}`}
                    </div>
                  </div>

                  <div className={styles.placeListMetaRow}>
                    {point.rating ? (
                      <div className={styles.placeListRating}>
                        <FaStar />
                        <span>{point.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span />
                    )}

                    {typeof point.distanceKm === "number" && (
                      <div className={styles.placeListDistance}>
                        <i className="bx bx-navigation"></i>
                        <span>
                          {point.distanceKm < 1
                            ? `${Math.round(point.distanceKm * 1000)} م`
                            : `${point.distanceKm.toFixed(1)} كم`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
