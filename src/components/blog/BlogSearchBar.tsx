import React from "react";
import styles from "@/app/blog/blog.module.css";

interface BlogSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}

export default function BlogSearchBar({
  searchQuery,
  onSearchChange,
  onClear,
}: BlogSearchBarProps) {
  return (
    <div className={`${styles.searchCard} metro-animate-slide-up metro-delay-200`}>
      <div className={styles.searchInputWrapper}>
        <label className={styles.searchLabel} htmlFor="blog-search-input">
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ marginLeft: "5px", color: "var(--color-secondary)" }}
          />
          ابحث في المقالات والأدلة
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="blog-search-input"
            className="input-fields"
            type="text"
            placeholder="ابحث عن مقال أو وسيلة مواصلات أو مكان..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              direction: "rtl",
              fontFamily: "var(--font-body)",
              height: "50px",
              paddingRight: "16px",
              paddingLeft: searchQuery ? "40px" : "16px",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={onClear}
              aria-label="مسح البحث"
            >
              <i className="bx bx-x" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
