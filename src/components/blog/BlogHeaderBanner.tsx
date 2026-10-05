import React from "react";
import { User } from "@supabase/supabase-js";
import { BLOG_CATEGORIES, SAVED_ARTICLES_CATEGORY } from "@/data/blogData";
import styles from "@/app/blog/blog.module.css";

interface BlogHeaderBannerProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  user: User | null;
  savedCount: number;
}

export default function BlogHeaderBanner({
  activeCategory,
  onSelectCategory,
  user,
  savedCount,
}: BlogHeaderBannerProps) {
  return (
    <div className={`${styles.headerBanner} metro-animate-fade`}>
      <div className="metro-animate-slide-up metro-delay-100">
        <h1 className={styles.headerTitle}>
          <i
            className="bx bx-news"
            style={{
              marginLeft: "10px",
              color: "var(--color-secondary)",
              fontSize: "2rem",
            }}
          />
          مدونة خريطة القاهرة
        </h1>
        <p className={styles.headerSubtitle}>
          اكتشف أحدث النصائح، خطوط السفر، وأدلة التنقل الذكي داخل القاهرة الكبرى والمحافظات.
        </p>

        {/* Categories Bar */}
        <div className={styles.categoriesBar}>
          {BLOG_CATEGORIES.map((category) => {
            const isSavedPill = category === SAVED_ARTICLES_CATEGORY;
            const isActive = activeCategory === category;

            let pillClass = `${styles.catPill} ${isActive ? styles.catPillActive : ""}`;
            if (isSavedPill) {
              pillClass = `${styles.catPill} ${styles.savedPill} ${isActive ? styles.savedPillActive : ""}`;
            }

            return (
              <button
                key={category}
                type="button"
                className={pillClass}
                onClick={() => onSelectCategory(category)}
              >
                {category}{" "}
                {isSavedPill && user && savedCount > 0 && `(${savedCount})`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
