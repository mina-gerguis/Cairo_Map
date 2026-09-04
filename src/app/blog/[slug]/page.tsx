"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import BlogLoader from "@/components/blog/BlogLoader";
import styles from "./singleBlog.module.css";

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

interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

const SAMPLE_POST: BlogArticle = {
  id: "sample-1",
  title: "دليل المواصلات الشامل في القاهرة والجيزة: كيف تختار وسيلتك الأسرع والأوفر؟",
  slug: "cairo-transportation-guide",
  content: `
    <h2>مقدمة عن شبكة المواصلات في القاهرة الكبرى</h2>
    <p>تُعد العاصمة القاهرة واحدة من أكبر المدن الحيوية بالشرق الأوسط، وتضم شبكة مواصلات متنوعة تمتد من مترو الأنفاق والقطار الكهربائي الخفيف LRT مروراً بالمنوريل وأتوبيسات الهيئة والسرفيس.</p>
    
    <h3>1. مترو الأنفاق (الوسيلة الأسرع للركوب اليومي)</h3>
    <p>يتضمن مترو القاهرة ثلاثة خطوط رئيسية تغطي معظم مناطق العاصمة، وتتميز بدقة المواعيد وانخفاض تكلفة التذاكر مقارنة بوسائل المواصلات الخاصة.</p>
    <ul>
      <li><strong>الخط الأول (حلوان - المرج الجديدة):</strong> يمر بمحطات رمسيس والتحرير والمعادي.</li>
      <li><strong>الخط الثاني (المنيب - شبرا الخيمة):</strong> يربط الجيزة بالقاهرة ومحطة العتبة.</li>
      <li><strong>الخط الثالث (عدلي منصور - إمبابة / جامعة القاهرة):</strong> الخط الأكثر تطوراً واستخداماً للوصول للمطار والزمالك.</li>
    </ul>

    <h3>2. المنوريل والقطار الكهربائي LRT</h3>
    <p>يتميز القطار الكهربائي بقدرته السريعة على الوصول إلى المدن الجديدة مثل العاصمة الإدارية والشروق وبدر، بنظام مريح وحديث كلياً.</p>

    <blockquote>
      "التنقل الذكي في القاهرة يوفر عليك ما يصل إلى ساعتين يومياً من الزحام المروري بتحديد أفضل وسيلة دمج بين المترو والمشاة."
    </blockquote>

    <h3>نصائح ذهبية لرحلة يومية مريحة:</h3>
    <ol>
      <li>استخدم كارت التذاكر الذكي المميكن لتجنب طوابير الشباك.</li>
      <li>تحقق من الخريطة المباشرة عبر موقع خريطة القاهرة قبل التحرك.</li>
      <li>تجنب أوقات الذروة الصباحية (8-10 صباحاً) إن أمكن.</li>
    </ol>
  `,
  excerpt: "تعرف على أحدث الخطوط والأسعار في مترو الأنفاق والقطار الكهربائي LRT والمنوريل، واستكشف أفضل الخطوط اليومية لتجنب الزحام المروري.",
  cover_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200",
  category: "مواصلات وترانزيت",
  tags: ["مترو", "منوريل", "أتوبيس", "قاهرة"],
  author_name: "فريق خريطة القاهرة",
  status: "published",
  views_count: 1420,
  likes_count: 98,
  comments_count: 2,
  reading_time: 5,
  created_at: new Date().toISOString(),
};

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    blog_id: "sample-1",
    user_id: "u1",
    user_name: "أحمد علي",
    user_avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ahmed",
    content: "مقال ممتاز وشرح مفصل جداً! شكراً لكم على هذا المجهود الرائع.",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "c2",
    blog_id: "sample-1",
    user_id: "u2",
    user_name: "سارة محمود",
    user_avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah",
    content: "هل خط المنوريل يعتمد نفس سعر تذكرة المترو أم له فئات مختلفة؟",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export default function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();

  const [blog, setBlog] = useState<BlogArticle | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // User Reactions
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Comment input
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Copy share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      setLoading(true);
      try {
        const decodedSlug = decodeURIComponent(slug);

        if (!supabase) {
          if (decodedSlug === "cairo-transportation-guide" || decodedSlug === "sample-1") {
            setBlog(SAMPLE_POST);
            setLikesCount(SAMPLE_POST.likes_count);
            setComments(SAMPLE_COMMENTS);
          } else {
            setBlog(null);
          }
          return;
        }

        // 1. Fetch Blog by slug
        let { data: blogData, error: blogErr } = await supabase
          .from("blogs")
          .select("*")
          .eq("slug", decodedSlug)
          .maybeSingle();

        // 2. If not found by slug, check if slug is a UUID ID
        if (!blogData && decodedSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
          const { data: byId } = await supabase
            .from("blogs")
            .select("*")
            .eq("id", decodedSlug)
            .maybeSingle();
          blogData = byId;
        }

        if (!blogData) {
          if (decodedSlug === "cairo-transportation-guide" || decodedSlug === "sample-1") {
            setBlog(SAMPLE_POST);
            setLikesCount(SAMPLE_POST.likes_count);
            setComments(SAMPLE_COMMENTS);
          } else {
            setBlog(null);
          }
        } else {
          setBlog(blogData);
          setLikesCount(blogData.likes_count || 0);

          // Increment view count in Supabase asynchronously
          supabase
            .from("blogs")
            .update({ views_count: (blogData.views_count || 0) + 1 })
            .eq("id", blogData.id)
            .then();

          // Fetch Comments
          const { data: commentsData } = await supabase
            .from("blog_comments")
            .select("*")
            .eq("blog_id", blogData.id)
            .order("created_at", { ascending: true });

          setComments(commentsData || []);

          // Check if user liked or bookmarked
          if (user) {
            const [likeRes, bookmarkRes] = await Promise.all([
              supabase
                .from("blog_likes")
                .select("blog_id")
                .eq("blog_id", blogData.id)
                .eq("user_id", user.id)
                .maybeSingle(),
              supabase
                .from("blog_bookmarks")
                .select("blog_id")
                .eq("blog_id", blogData.id)
                .eq("user_id", user.id)
                .maybeSingle(),
            ]);

            setIsLiked(!!likeRes.data);
            setIsBookmarked(!!bookmarkRes.data);
          }
        }
      } catch (err) {
        console.error("Fetch blog details error:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [slug, user]);

  const handleToggleLike = async () => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً للإعجاب بالمقال. هل تريد الذهاب لصفحة الدخول؟")) {
        router.push("/login");
      }
      return;
    }

    if (!blog) return;

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    const newCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLikesCount(newCount);

    if (supabase) {
      try {
        if (nextLiked) {
          await supabase.from("blog_likes").insert({ blog_id: blog.id, user_id: user.id });
        } else {
          await supabase
            .from("blog_likes")
            .delete()
            .eq("blog_id", blog.id)
            .eq("user_id", user.id);
        }
        await supabase.from("blogs").update({ likes_count: newCount }).eq("id", blog.id);
      } catch (err) {
        console.error("Like toggle error:", err);
      }
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً لحفظ المقال بالمفضلة.")) {
        router.push("/login");
      }
      return;
    }

    if (!blog) return;

    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    if (supabase) {
      try {
        if (nextBookmarked) {
          await supabase.from("blog_bookmarks").insert({ blog_id: blog.id, user_id: user.id });
        } else {
          await supabase
            .from("blog_bookmarks")
            .delete()
            .eq("blog_id", blog.id)
            .eq("user_id", user.id);
        }
      } catch (err) {
        console.error("Bookmark toggle error:", err);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!user) {
      if (confirm("يرجى تسجيل الدخول لإضافة تعليق على المقال.")) {
        router.push("/login");
      }
      return;
    }

    if (!blog) return;

    setSubmittingComment(true);
    const newCommentObj: Comment = {
      id: `c-${Date.now()}`,
      blog_id: blog.id,
      user_id: user.id,
      user_name: profile?.full_name || user.email?.split("@")[0] || "مستخدم",
      user_avatar:
        profile?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          profile?.full_name || "User"
        )}`,
      content: commentInput.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { data, error } = await supabase.from("blog_comments").insert({
          blog_id: blog.id,
          user_id: user.id,
          user_name: newCommentObj.user_name,
          user_avatar: newCommentObj.user_avatar,
          content: newCommentObj.content,
        }).select().single();

        if (!error && data) {
          setComments((prev) => [...prev, data]);
        } else {
          setComments((prev) => [...prev, newCommentObj]);
        }

        await supabase
          .from("blogs")
          .update({ comments_count: (blog.comments_count || 0) + 1 })
          .eq("id", blog.id);
      } else {
        setComments((prev) => [...prev, newCommentObj]);
      }

      setCommentInput("");
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    try {
      if (supabase) {
        await supabase.from("blog_comments").delete().eq("id", commentId);
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageShell}>
        <BlogLoader
          title="جاري تجهيز المقال..."
          subtitle="لحظات ونعرض لك كامل تفاصيل المقال والمعلومات"
          icon="bx bx-book-open"
          minHeight="85vh"
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.pageShell}>
        <div className={styles.errorBox}>
          <i className="bx bx-error-circle" />
          <h2>المقال غير موجود</h2>
          <p>عفواً، لم نتمكن من العثور على هذا المقال أو تم نحوه مؤقتاً.</p>
          <Link href="/blog" className={styles.backBtn}>
            العودة لجميع المقالات
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const shareTitle = encodeURIComponent(blog.title);

  return (
    <div className={styles.pageShell}>
      <main className={`${styles.articleWrapper} metro-animate-fade`}>
        {/* Breadcrumb Navigation */}
        <nav className={`${styles.breadcrumb} metro-animate-slide-up metro-delay-100`}>
          <Link href="/">الرئيسية</Link>
          <i className="bx bx-chevron-left" />
          <Link href="/blog">المدونة</Link>
          <i className="bx bx-chevron-left" />
          <span>{blog.category}</span>
        </nav>

        {/* Article Header Card */}
        <header className={`${styles.articleHeader} metro-animate-slide-up metro-delay-150`}>
          <span className={styles.categoryPill}>{blog.category}</span>
          <h1 className={styles.articleTitle}>{blog.title}</h1>

          <div className={styles.metaRow}>
            <div className={styles.authorInfo}>
              <img
                src={
                  blog.author_avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    blog.author_name || "Author"
                  )}`
                }
                alt={blog.author_name}
                loading="lazy"
                decoding="async"
                className={styles.authorAvatar}
              />
              <div>
                <strong className={styles.authorName}>{blog.author_name || "فريق خريطة القاهرة"}</strong>
                <span className={styles.postDate}>
                  {new Date(blog.created_at).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className={styles.readingStats}>
              <span><i className="bx bx-time" /> {blog.reading_time || 3} دقائق</span>
              <span><i className="bx bx-show" /> {blog.views_count || 0} مشاهدة</span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className={`${styles.coverWrapper} metro-animate-slide-up metro-delay-200`}>
          <img
            src={blog.cover_image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200"}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className={styles.coverImage}
          />
        </div>

        {/* Action Interaction Bar */}
        <div className={`${styles.actionsBar} metro-animate-slide-up metro-delay-250`}>
          <div className={styles.actionGroup}>
            <button
              className={`${styles.actionBtn} ${isLiked ? styles.likedBtn : ""}`}
              onClick={handleToggleLike}
            >
              <i className={`bx ${isLiked ? "bxs-heart" : "bx-heart"}`} />
              <span>{likesCount} إعجاب</span>
            </button>

            <button
              className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarkedBtn : ""}`}
              onClick={handleToggleBookmark}
            >
              <i className={`bx ${isBookmarked ? "bxs-bookmark" : "bx-bookmark"}`} />
              <span>{isBookmarked ? "محفوظ بالمفضلة" : "حفظ المقال"}</span>
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className={styles.shareGroup}>
            <span className={styles.shareLabel}>مشاركة:</span>
            <button
              className={styles.shareIconBtn}
              onClick={handleCopyLink}
              title="نسخ رابط المقال"
            >
              <i className={`bx ${copiedLink ? "bx-check" : "bx-copy"}`} />
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className={`${styles.shareIconBtn} ${styles.whatsapp}`}
              title="مشاركة عبر واتساب"
            >
              <i className="bx bxl-whatsapp" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className={`${styles.shareIconBtn} ${styles.facebook}`}
              title="مشاركة على فيسبوك"
            >
              <i className="bx bxl-facebook" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className={`${styles.shareIconBtn} ${styles.twitter}`}
              title="مشاركة على تويتر"
            >
              <i className="bx bxl-twitter" />
            </a>
          </div>
        </div>

        {/* Article Content Body Card */}
        <div className={`${styles.articleCard} metro-animate-slide-up metro-delay-300`}>
          <article
            className={styles.articleBody}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags List */}
          {blog.tags && blog.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              <span className={styles.tagsLabel}><i className="bx bx-tag-alt" /> الكلمات المفتاحية:</span>
              <div className={styles.tagsList}>
                {blog.tags.map((tag) => (
                  <span key={tag} className={styles.tagPill}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <section className={`${styles.commentsSection} metro-animate-slide-up metro-delay-350`}>
          <div className={styles.commentsHeader}>
            <h2>
              <i className="bx bx-comment-detail" style={{ color: "var(--colorSecondary)" }} /> التعليقات ({comments.length})
            </h2>
          </div>

          {/* Add Comment Box */}
          <div className={styles.addCommentBox}>
            {user ? (
              <form onSubmit={handleAddComment} className={styles.commentForm}>
                <div className={styles.userCommentHeader}>
                  <img
                    src={
                      profile?.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        profile?.full_name || "User"
                      )}`
                    }
                    alt="User"
                    loading="lazy"
                    decoding="async"
                    className={styles.commentUserAvatar}
                  />
                  <span>التعليق باسم: <strong>{profile?.full_name || user.email?.split("@")[0]}</strong></span>
                </div>

                <textarea
                  className={styles.commentTextarea}
                  rows={3}
                  placeholder="اكتب تعليقك أو استفسارك حول المقال..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className={styles.submitCommentBtn}
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <>
                      <i className="bx bx-loader-alt spin" /> جاري النشر...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send" /> نشر التعليق
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className={styles.loginPromptBox}>
                <i className="bx bx-lock-alt" />
                <div>
                  <strong>سجل دخولك لتتمكن من إضافة تعليق والتفاعل مع القراء</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem" }}>تستغرق العملية بضع ثوانٍ فقط لحفظ تعليقاتك واستفساراتك.</p>
                </div>
                <Link href="/login" className={styles.loginBtn}>
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <div className={styles.noComments}>
                <i className="bx bx-chat" />
                <p>كن أول من يضيف تعليقاً على هذا المقال!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className={styles.commentCard}>
                  <img
                    src={
                      c.user_avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        c.user_name || "User"
                      )}`
                    }
                    alt={c.user_name}
                    loading="lazy"
                    decoding="async"
                    className={styles.commentAvatar}
                  />

                  <div className={styles.commentMain}>
                    <div className={styles.commentMeta}>
                      <strong className={styles.commentAuthor}>{c.user_name || "مستخدم"}</strong>
                      <span className={styles.commentTime}>
                        {new Date(c.created_at).toLocaleDateString("ar-EG")}
                      </span>

                      {(user?.id === c.user_id || profile?.is_admin) && (
                        <button
                          className={styles.deleteCommentBtn}
                          onClick={() => handleDeleteComment(c.id)}
                          title="حذف التعليق"
                        >
                          <i className="bx bx-trash" />
                        </button>
                      )}
                    </div>

                    <p className={styles.commentBody}>{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
