"use client";

import React, { useCallback } from "react";
import BlogLoader from "@/components/blog/BlogLoader";
import BlogHeaderBanner from "@/components/blog/BlogHeaderBanner";
import BlogSearchBar from "@/components/blog/BlogSearchBar";
import FeaturedBlogCard from "@/components/blog/FeaturedBlogCard";
import BlogCard from "@/components/blog/BlogCard";
import BlogEmptyState from "@/components/blog/BlogEmptyState";
import { useBlogArticles } from "@/components/blog/useBlogArticles";
import styles from "./blog.module.css";

export default function BlogPublicPage() {
  const {
    user,
    filteredBlogs,
    featuredPost,
    bookmarkedIds,
    loading,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    isSavedCategory,
  } = useBlogArticles();

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  if (loading) {
    return (
      <div className={styles.pageShell}>
        <BlogLoader
          title="جاري تحميل المدونة والمقالات..."
          subtitle="نجهز لك أحدث الأدلة والمعلومات وخطوط المواصلات في القاهرة"
          icon="bx bx-news"
          minHeight="85vh"
        />
      </div>
    );
  }

  const showLoginPrompt = isSavedCategory && !user;
  const isListEmpty = filteredBlogs.length === 0;

  return (
    <div className={styles.pageShell}>
      {/* Header Banner with Category Filtering */}
      <BlogHeaderBanner
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        user={user}
        savedCount={bookmarkedIds.length}
      />

      {/* Main Content Area */}
      <main className={styles.mainContainer}>
        {/* Search Bar */}
        <BlogSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleClearSearch}
        />

        {/* Featured Post (Visible on 'All' category without search) */}
        {featuredPost && <FeaturedBlogCard post={featuredPost} />}

        {/* Articles List Section */}
        <section
          className={`${styles.gridSection} metro-animate-slide-up metro-delay-350`}
        >
          <div className={styles.sectionHeader}>
            <h3>
              {isSavedCategory ? (
                <>
                  <i className="bx bxs-bookmark" style={{ color: "#f59e0b" }} />
                  المقالات المحفوظة ({filteredBlogs.length})
                </>
              ) : (
                <>
                  <i
                    className="bx bx-grid-alt"
                    style={{ color: "var(--color-secondary)" }}
                  />
                  المقالات المتاحة ({filteredBlogs.length})
                </>
              )}
            </h3>
          </div>

          {showLoginPrompt ? (
            <BlogEmptyState isSavedCategory isUnauthenticated />
          ) : isListEmpty ? (
            <BlogEmptyState isSavedCategory={isSavedCategory} />
          ) : (
            <div className={styles.blogsGrid}>
              {filteredBlogs.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
