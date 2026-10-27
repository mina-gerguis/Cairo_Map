"use client";

import React, { useCallback, useRef } from "react";
import BlogLoader from "@/components/blog/BlogLoader";
import BlogHeaderBanner from "@/components/blog/BlogHeaderBanner";
import BlogSearchBar from "@/components/blog/BlogSearchBar";
import FeaturedBlogCard from "@/components/blog/FeaturedBlogCard";
import BlogCard from "@/components/blog/BlogCard";
import BlogEmptyState from "@/components/blog/BlogEmptyState";
import { useBlogArticles } from "@/components/blog/useBlogArticles";
import { gsap, useGSAP } from "@/lib/gsap";
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

  const mainRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  // Animate featured card on mount/change
  useGSAP(() => {
    if (featuredRef.current && featuredPost) {
      gsap.from(featuredRef.current, {
        autoAlpha: 0,
        y: 25,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
      });
    }
  }, [featuredPost]);

  // Stagger animate blog cards whenever the list changes
  useGSAP(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".blog-card-item");
      if (cards.length > 0) {
        gsap.from(cards, {
          autoAlpha: 0,
          y: 35,
          stagger: 0.08,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            once: true,
          },
          clearProps: "transform,opacity,visibility",
        });
      }
    }
  }, [filteredBlogs]);

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
      <main ref={mainRef} className={styles.mainContainer}>
        {/* Search Bar */}
        <BlogSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleClearSearch}
        />

        {/* Featured Post (Visible on 'All' category without search) */}
        {featuredPost && (
          <div ref={featuredRef}>
            <FeaturedBlogCard post={featuredPost} />
          </div>
        )}

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
            <div ref={gridRef} className={styles.blogsGrid}>
              {filteredBlogs.map((post) => (
                <div key={post.id} className="blog-card-item">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
