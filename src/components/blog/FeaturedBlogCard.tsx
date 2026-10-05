import React from "react";
import Link from "next/link";
import { BlogArticle } from "@/types/blog";
import { DEFAULT_COVER_IMAGE, getAuthorAvatar } from "@/data/blogData";
import styles from "@/app/blog/blog.module.css";

interface FeaturedBlogCardProps {
  post: BlogArticle;
}

export default function FeaturedBlogCard({ post }: FeaturedBlogCardProps) {
  const articleHref = `/blog/${encodeURIComponent(post.slug || post.id)}`;
  const authorAvatar = getAuthorAvatar(post.author_name, post.author_avatar);

  return (
    <section className={`${styles.featuredSection} metro-animate-slide-up metro-delay-300`}>
      <Link href={articleHref} className={styles.featuredCard}>
        <div className={styles.featuredImageWrapper}>
          <img
            src={post.cover_image || DEFAULT_COVER_IMAGE}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className={styles.featuredImage}
          />
          <span className={styles.featuredBadge}>🔥 مقال مميز</span>
        </div>
        <div className={styles.featuredContent}>
          <span className={styles.articleCat}>{post.category}</span>
          <h2 className={styles.featuredTitle}>{post.title}</h2>
          <p className={styles.featuredExcerpt}>{post.excerpt}</p>

          <div className={styles.postMeta}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src={authorAvatar}
                alt={post.author_name || "الكاتب"}
                loading="lazy"
                decoding="async"
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              {post.author_name || "خريطة القاهرة"}
            </span>
            <span>
              <i className="bx bx-time" /> {post.reading_time || 3} دقائق
            </span>
            <span>
              <i className="bx bx-show" /> {post.views_count || 0} مشاهدة
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
