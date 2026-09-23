import React from "react";
import { FavoriteCardProps } from "../types";
import { PLACEHOLDER_IMAGE } from "../constants";
import { getItemCategoryLabel } from "../utils";
import styles from "../favorites.module.css";

export default function FavoriteCard({
  item,
  onRemove,
  onClick,
}: FavoriteCardProps) {
  const imageUrl = item.images?.[0] || PLACEHOLDER_IMAGE;
  const categoryLabel = getItemCategoryLabel(item);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`glass-card place-card-scroll ${styles.placeCard}`}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
    >
      {/* Image & Favorite Toggle Button */}
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className={styles.placeImage}
        />
        <button
          type="button"
          aria-label="إزالة من المفضلة"
          className={styles.removeFavBtn}
          onClick={(e) => onRemove(e, item)}
        >
          <i className={`bx bxs-heart ${styles.heartIcon}`} />
        </button>
      </div>

      {/* Place Information */}
      <div className={styles.cardInfo}>
        <h2 className={styles.cardName}>{item.name}</h2>
        {item.briefLocation && (
          <p className={`sub-title ${styles.cardLocation}`}>
            {item.briefLocation}
          </p>
        )}
        <div className={styles.cardPillWrapper}>
          <span className={`category-pill ${styles.categoryPill}`}>
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Navigation Arrow */}
      <i className={`bx bx-chevron-left ${styles.chevronIcon}`} />
    </div>
  );
}
