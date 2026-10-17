import React from "react";
import Link from "next/link";
import { BlogArticle } from "@/types/blog";
import { DEFAULT_COVER_IMAGE, getAuthorAvatar } from "@/data/blogData";
import styles from "@/app/blog/blog.module.css";

interface BlogCardProps {
  post: BlogArticle;
}

export default function BlogCard({ post }: BlogCardProps) {
  const articleHref = `/blog/${encodeURIComponent(post.slug || post.id)}`;
  const authorAvatar = getAuthorAvatar(post.author_name, post.author_avatar);

  return (
    <Link href={articleHref} className={styles.blogCard}>
      <div className={styles.cardThumbWrapper}>
        <img
          src={post.cover_image || DEFAULT_COVER_IMAGE}
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
              src={authorAvatar}
              alt={post.author_name || "الكاتب"}
              loading="lazy"
              decoding="async"
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            {post.author_name || "خريطة القاهرة"}
          </span>

          <div className={styles.cardStats}>
            <span>
              <i className="bx bx-time" /> {post.reading_time || 3}د
            </span>
            <span>
              <i className="bx bx-like" /> {post.likes_count || 0}
            </span>
            <span>
              <i className="bx bx-comment" /> {post.comments_count || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
