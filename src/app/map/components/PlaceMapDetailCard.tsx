"use client";

import React from "react";
import { MapPlacePoint } from "../types";
import { getCategoryColor, CATEGORY_EMOJIS } from "@/app/places/constants";
import { FaStar, FaPhoneAlt, FaDirections, FaInfoCircle, FaTimes, FaHeart, FaRegHeart } from "react-icons/fa";
import { IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import { getTodayWorkingHoursText } from "@/lib/workingHours";
import styles from "../map.module.css";

interface PlaceMapDetailCardProps {
  point: MapPlacePoint;
  onClose: () => void;
  onOpenDetails: (point: MapPlacePoint) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, placeId: string) => void;
}

export default function PlaceMapDetailCard({
  point,
  onClose,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
}: PlaceMapDetailCardProps) {
  const categoryColor = getCategoryColor(point.category);
  const categoryEmoji = CATEGORY_EMOJIS[point.category] || "📍";

  const thumbnail =
    point.images && point.images.length > 0
      ? point.images[0]
      : "/images/icons3d/burger.webp";

  const primaryPhone = point.phones && point.phones.length > 0 ? point.phones[0] : null;

  const todayHours = getTodayWorkingHoursText(point.workingHours);

  const googleNavUrl =
    point.googleMapsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;

  return (
    <div className={styles.selectedPlaceFloatingCard}>
      {/* Header Info */}
      <div className={styles.floatingCardHeader}>
        <img
          src={thumbnail}
          alt={point.name}
          className={styles.floatingCardCover}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/icons3d/burger.webp";
          }}
        />

        <div className={styles.floatingCardMainInfo}>
          <div
            className={styles.floatingCardCategoryBadge}
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
              border: `1px solid ${categoryColor}40`,
            }}
          >
            <span>{categoryEmoji}</span>
            <span>{point.categoryLabel}</span>
          </div>

          <h3 className={styles.floatingCardTitle}>
            {point.name}
            {point.branchName && (
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginRight: "4px" }}>
                ({point.branchName})
              </span>
            )}
          </h3>

          <div className={styles.floatingCardAddress}>
            <IoLocationSharp style={{ color: "var(--color-primary)", flexShrink: 0 }} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {point.fullAddress || `${point.city || ""} ${point.governorate || ""}`}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          className={styles.floatingCardCloseBtn}
          onClick={onClose}
          aria-label="إغلاق بطاقة المكان"
        >
          <FaTimes />
        </button>
      </div>

      {/* Meta / Stats Row */}
      <div className={styles.floatingCardStatsRow}>
        {point.rating ? (
          <div className={styles.floatingCardStat}>
            <FaStar style={{ color: "#fbbf24" }} />
            <span>{point.rating.toFixed(1)}</span>
            {point.reviewsCount ? (
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                ({point.reviewsCount})
              </span>
            ) : null}
          </div>
        ) : null}

        {typeof point.distanceKm === "number" && (
          <div className={styles.floatingCardStat} style={{ color: "#3b82f6" }}>
            <i className="bx bx-navigation" style={{ fontSize: "0.95rem" }}></i>
            <span>
              {point.distanceKm < 1
                ? `${Math.round(point.distanceKm * 1000)} م`
                : `${point.distanceKm.toFixed(1)} كم`}
            </span>
          </div>
        )}

        {point.isOpenNow !== undefined && (
          <div
            className={styles.floatingCardStat}
            style={{
              color: point.isOpenNow ? "#10b981" : "#ef4444",
              fontWeight: 700,
            }}
          >
            <span>{point.isOpenNow ? "🟢 مفتوح" : "🔴 مغلق"}</span>
          </div>
        )}

        {todayHours && (
          <div
            className={styles.floatingCardStat}
            style={{
              color: "var(--text-muted)",
              fontSize: "0.74rem",
              marginRight: "auto",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <IoTimeOutline />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
              {todayHours}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.floatingCardActionsRow}>
        {/* Full Details Modal */}
        <button
          className={styles.actionBtnPrimary}
          onClick={() => onOpenDetails(point)}
        >
          <FaInfoCircle />
          <span>التفاصيل الكاملة</span>
        </button>

        {/* Google Maps Directions */}
        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionBtnSecondary}
          title="الاتجاهات عبر خرائط جوجل"
        >
          <FaDirections style={{ color: "#3b82f6" }} />
          <span>الاتجاهات</span>
        </a>

        {/* Quick Phone Call */}
        {primaryPhone && (
          <a
            href={`tel:${primaryPhone}`}
            className={styles.actionBtnSecondary}
            title={`اتصال بـ ${primaryPhone}`}
          >
            <FaPhoneAlt style={{ color: "#10b981" }} />
          </a>
        )}

        {/* Favorite Button */}
        <button
          className={styles.actionBtnSecondary}
          onClick={(e) => onToggleFavorite(e, point.placeId)}
          title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          {isFavorite ? (
            <FaHeart style={{ color: "#ef4444" }} />
          ) : (
            <FaRegHeart />
          )}
        </button>
      </div>
    </div>
  );
}
