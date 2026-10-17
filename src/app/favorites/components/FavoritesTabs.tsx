import React from "react";
import { FavoritesTabsProps } from "../types";
import { ALL_CATEGORY } from "../constants";
import styles from "../favorites.module.css";

export default function FavoritesTabs({
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
  getCategoryCount,
}: FavoritesTabsProps) {
  return (
    <div className={`hide-scrollbar ${styles.tabsRow}`}>
      {/* "الكل" Tab */}
      <button
        type="button"
        onClick={() => onSelectCategory(ALL_CATEGORY)}
        className={`sub-title ${styles.tabButton} ${
          selectedCategory === ALL_CATEGORY
            ? styles.tabButtonActive
            : styles.tabButtonInactive
        }`}
      >
        <span>{ALL_CATEGORY}</span>
        <span
          className={`sub-title ${
            selectedCategory === ALL_CATEGORY
              ? styles.tabBadgeActive
              : styles.tabBadgeInactive
          }`}
        >
          {totalCount}
        </span>
      </button>

      {/* Dynamic Categories Tabs */}
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = getCategoryCount(cat);

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`sub-title ${styles.tabButton} ${
              isSelected ? styles.tabButtonActive : styles.tabButtonInactive
            }`}
          >
            <span>{cat}</span>
            <span
              className={
                isSelected ? styles.tabBadgeActive : styles.tabBadgeInactive
              }
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
