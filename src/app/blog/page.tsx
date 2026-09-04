"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import BlogLoader from "@/components/blog/BlogLoader";
import styles from "./blog.module.css";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string[];
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  status: "published" | "draft";
  views_count: number;
  likes_count: number;
  comments_count: number;
  reading_time: number;
  created_at: string;
}

// Sample fallback articles if database is empty or offline
const SAMPLE_ARTICLES: BlogArticle[] = [
  {
    id: "sample-1",
    title: "دليل المواصلات الشامل في القاهرة والجيزة: كيف تختار وسيلتك الأسرع والأوفر؟",
    slug: "cairo-transportation-guide",
    content: "محتوى المقال التفصيلي...",
    excerpt: "تعرف على أحدث الخطوط والأسعار في مترو الأنفاق والقطار الكهربائي LRT والمنوريل، واستكشف أفضل الخطوط اليومية لتجنب الزحام المروري.",
    cover_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
    category: "مواصلات وترانزيت",
    tags: ["مترو", "منوريل", "أتوبيس"],
    author_name: "فريق خريطة القاهرة",
    status: "published",
    views_count: 1420,
    likes_count: 98,
    comments_count: 14,
    reading_time: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "أفضل 10 أماكن للخروج والتنزه في القاهرة بعيداً عن صخب المدينة",
    slug: "top-10-places-cairo",
    content: "محتوى المقال...",
    excerpt: "استكشف حدائق ومقاهي ومتاحف هادئة توفر لك تجربة ممتعة مع العائلة أو الأصدقاء في أجمل مناطق القاهرة الكبرى.",
    cover_image: "https://images.unsplash.com/photo-1572252821143-035a7448c5c2?q=80&w=800",
    category: "دليل القاهرة والجيزة",
    tags: ["خروج", "حدائق", "أماكن"],
    author_name: "مينا جرجس",
    status: "published",
    views_count: 980,
    likes_count: 65,
    comments_count: 8,
    reading_time: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    title: "كيف تستخدم محطة القطار الكهربائي خفيف الوزن LRT بالكامل مع أسعار التذاكر",
    slug: "lrt-train-full-guide",
    content: "محتوى المقال...",
    excerpt: "كل ما تحتاج معرفته عن محطات القطار الكهربائي LRT من عدلي منصور حتى العاصمة الإدارية، أوقات العمل ورسوم التذاكر بالتفصيل.",
    cover_image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800",
    category: "مترو ومنوريل",
    tags: ["LRT", "العاصمة", "قطار"],
    author_name: "فريق خريطة القاهرة",
    status: "published",
    views_count: 2100,
    likes_count: 154,
    comments_count: 23,
    reading_time: 6,
    created_at: new Date().toISOString(),
  },
];

const CATEGORIES = [
  "الكل",
  "🔖 المقالات المحفوظة",
  "مواصلات وترانزيت",
  "دليل القاهرة والجيزة",
  "أخبار وشواهد",
  "نصائح سفر ورحلات",
  "مطارات وموانئ",
  "مترو ومنوريل",
];

export default function BlogPublicPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");

  useEffect(() => {
    const fetchPublishedBlogs = async () => {
      setLoading(true);
      try {
        if (!supabase) {
          setBlogs(SAMPLE_ARTICLES);
          return;
        }

        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          setBlogs(SAMPLE_ARTICLES);
        } else {
          setBlogs(data);
        }

        // Fetch bookmarked article IDs if user is logged in
        if (user) {
          const { data: bookmarkData } = await supabase
            .from("blog_bookmarks")
            .select("blog_id")
            .eq("user_id", user.id);

          if (bookmarkData) {
            setBookmarkedIds(bookmarkData.map((b) => b.blog_id));
          }
        }
      } catch (err) {
        setBlogs(SAMPLE_ARTICLES);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedBlogs();
  }, [user]);

  const isSavedCategory = activeCategory === "🔖 المقالات المحفوظة";

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (isSavedCategory) {
      return matchesSearch && bookmarkedIds.includes(b.id);
    }

    const matchesCat = activeCategory === "الكل" || b.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featuredPost = blogs[0];

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

  return (
    <div className={styles.pageShell}>
      {/* Header Banner - Styled to match Metro & Monorail page hero */}
      <div className={`${styles.headerBanner} metro-animate-fade`}>
        <div className="metro-animate-slide-up metro-delay-100">
          <h1 className={styles.headerTitle}>
            <i className="bx bx-news" style={{ marginLeft: "10px", color: "var(--colorSecondary)", fontSize: "2rem" }}></i>
            مدونة خريطة القاهرة
          </h1>
          <p className={styles.headerSubtitle}>
            اكتشف أحدث النصائح، خطوط السفر، وأدلة التنقل الذكي داخل القاهرة الكبرى والمحافظات.
          </p>

          {/* Categories Bar with Saved Tab */}
          <div className={styles.categoriesBar}>
            {CATEGORIES.map((cat) => {
              const isSavedPill = cat === "🔖 المقالات المحفوظة";
              let pillClass = `${styles.catPill} ${activeCategory === cat ? styles.catPillActive : ""}`;
              if (isSavedPill) {
                pillClass = `${styles.catPill} ${styles.savedPill} ${activeCategory === cat ? styles.savedPillActive : ""}`;
              }

              return (
                <span
                  key={cat}
                  className={pillClass}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat} {isSavedPill && user && bookmarkedIds.length > 0 && `(${bookmarkedIds.length})`}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className={styles.mainContainer}>
        {/* Search Panel Card */}
        <div className={`${styles.searchCard} metro-animate-slide-up metro-delay-200`}>
          <div className={styles.searchInputWrapper}>
            <label className={styles.searchLabel}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i>
              ابحث في المقالات والأدلة
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="input-fields"
                type="text"
                placeholder="ابحث عن مقال أو وسيلة مواصلات أو مكان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <button className={styles.clearBtn} onClick={() => setSearchQuery("")}>
                  <i className="bx bx-x" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Featured Post (if any & no search query & not in Saved tab) */}
        {!searchQuery && activeCategory === "الكل" && featuredPost && (
          <section className={`${styles.featuredSection} metro-animate-slide-up metro-delay-300`}>
            <Link href={`/blog/${encodeURIComponent(featuredPost.slug || featuredPost.id)}`} className={styles.featuredCard}>
              <div className={styles.featuredImageWrapper}>
                <img
                  src={featuredPost.cover_image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000"}
                  alt={featuredPost.title}
                  loading="lazy"
                  decoding="async"
                  className={styles.featuredImage}
                />
                <span className={styles.featuredBadge}>🔥 مقال مميز</span>
              </div>
              <div className={styles.featuredContent}>
                <span className={styles.articleCat}>{featuredPost.category}</span>
                <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
                <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
                <div className={styles.postMeta}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <img
                      src={featuredPost.author_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(featuredPost.author_name || "Author")}`}
                      alt={featuredPost.author_name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    {featuredPost.author_name || "خريطة القاهرة"}
                  </span>
                  <span><i className="bx bx-time" /> {featuredPost.reading_time || 3} دقائق</span>
                  <span><i className="bx bx-show" /> {featuredPost.views_count || 0} مشاهدة</span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Articles List Grid */}
        <section className={`${styles.gridSection} metro-animate-slide-up metro-delay-350`}>
          <div className={styles.sectionHeader}>
            <h3>
              {isSavedCategory ? (
                <>
                  <i className="bx bxs-bookmark" style={{ color: "#f59e0b" }} /> المقالات المحفوظة ({filteredBlogs.length})
                </>
              ) : (
                <>
                  <i className="bx bx-grid-alt" style={{ color: "var(--colorSecondary)" }} /> المقالات المتاحة ({filteredBlogs.length})
                </>
              )}
            </h3>
          </div>

          {loading ? (
            <div className={styles.loadingGrid}>
              <i className="bx bx-loader-alt spin" />
              <div>جاري تحميل المقالات...</div>
            </div>
          ) : isSavedCategory && !user ? (
            /* Prompt user to login to see saved posts */
            <div className={styles.loginPromptCard}>
              <i className="bx bx-bookmark-heart" />
              <h4>سجل دخولك لعرض مقالاتك المحفوظة</h4>
              <p>يمكنك حفظ أي مقال بالضغط على زر الحفظ (🔖) في الصفحة وقراءته في أي وقت.</p>
              <Link href="/login" className={styles.loginBtn}>
                تسجيل الدخول
              </Link>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className={styles.emptyGrid}>
              <i className={isSavedCategory ? "bx bx-bookmark" : "bx bx-news"} />
              <h4>
                {isSavedCategory
                  ? "لم تقم بحفظ أي مقالات بعد"
                  : "لم نجد أي مقال يطابق بحثك"}
              </h4>
              <p>
                {isSavedCategory
                  ? "إقرأ أي مقال واضغط على زر «حفظ المقال» لتجده في هذه القائمة."
                  : "جرّب البحث باسم موضوع آخر أو اختيار قسم مختلف."}
              </p>
            </div>
          ) : (
            <div className={styles.blogsGrid}>
              {filteredBlogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${encodeURIComponent(post.slug || post.id)}`}
                  className={styles.blogCard}
                >
                  <div className={styles.cardThumbWrapper}>
                    <img
                      src={
                        post.cover_image ||
                        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600"
                      }
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className={styles.cardThumb}
                    />
                    <span className={styles.cardCategory}>{post.category}</span>
                  </div>

                  <div className={styles.cardContent}>
                    <div>
                      <h3 className={styles.cardTitle}>{post.title}</h3>
                      <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    </div>

                    <div className={styles.cardFooterMeta}>
                      <span className={styles.cardAuthor}>
                        <img
                          src={post.author_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author_name || "Author")}`}
                          alt={post.author_name}
                          loading="lazy"
                          decoding="async"
                          style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        {post.author_name || "خريطة القاهرة"}
                      </span>
                      <div className={styles.cardStats}>
                        <span><i className="bx bx-time" /> {post.reading_time || 3}د</span>
                        <span><i className="bx bx-like" /> {post.likes_count || 0}</span>
                        <span><i className="bx bx-comment" /> {post.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
