"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/components/admin/RichTextEditor";
import styles from "./blogs.module.css";
import CustomModal from "@/components/common/Modals";

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

const CATEGORIES = [
  "عام",
  "مواصلات وترانزيت",
  "دليل القاهرة والجيزة",
  "أخبار وشواهد",
  "نصائح سفر ورحلات",
  "مطارات وموانئ",
  "مترو ومنوريل",
];

export default function AdminBlogsPage() {
  const { user, profile } = useAuth();
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("الكل");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("الكل");

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("عام");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [readingTime, setReadingTime] = useState(3);
  const [tagsInput, setTagsInput] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");

  const [deleteBlogId, setDeleteBlogId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isTableMissing, setIsTableMissing] = useState(false);

  // Success & Error feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("blogs")) {
          setIsTableMissing(true);
        }
        console.error("Error fetching blogs:", error);
      } else {
        setIsTableMissing(false);
        setBlogs(data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Auto-generate slug from title if writing a new article
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingBlogId) {
      const generatedSlug = val
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  };

  const handleOpenNewForm = () => {
    setEditingBlogId(null);
    setTitle("");
    setSlug("");
    setCategory("عام");
    setExcerpt("");
    setCoverImage("");
    setContent("<p>اكتب تفاصيل ومحتوى المقال الجديد هنا...</p>");
    setStatus("published");
    setReadingTime(3);
    setTagsInput("");
    const defaultName = profile?.full_name || user?.email?.split("@")[0] || "فريق خريطة القاهرة";
    const defaultAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}`;
    setAuthorName(defaultName);
    setAuthorAvatar(defaultAvatar);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (blog: BlogArticle) => {
    setEditingBlogId(blog.id);
    setTitle(blog.title || "");
    setSlug(blog.slug || "");
    setCategory(blog.category || "عام");
    setExcerpt(blog.excerpt || "");
    setCoverImage(blog.cover_image || "");
    setContent(blog.content || "");
    setStatus(blog.status || "published");
    setReadingTime(blog.reading_time || 3);
    setTagsInput((blog.tags || []).join(", "));
    const name = blog.author_name || profile?.full_name || "فريق خريطة القاهرة";
    const avatar = blog.author_avatar || profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    setAuthorName(name);
    setAuthorAvatar(avatar);
    setIsFormOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("يرجى كتابة عنوان المقال", "error");
      return;
    }
    if (!content.trim()) {
      showToast("يرجى كتابة محتوى المقال", "error");
      return;
    }

    if (!supabase) {
      showToast("قاعدة البيانات غير متصلة حالياً", "error");
      return;
    }

    setSaving(true);
    try {
      const formattedSlug = (slug || title)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const finalAuthorName = authorName.trim() || profile?.full_name || user?.email?.split("@")[0] || "فريق خريطة القاهرة";
      const finalAuthorAvatar = authorAvatar.trim() || profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalAuthorName)}`;

      const payload = {
        title: title.trim(),
        slug: formattedSlug,
        content,
        excerpt: excerpt.trim() || title.trim(),
        cover_image: coverImage.trim() || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
        category,
        tags: tagsArray,
        author_id: user?.id || null,
        author_name: finalAuthorName,
        author_avatar: finalAuthorAvatar,
        status,
        reading_time: Number(readingTime) || 3,
        updated_at: new Date().toISOString(),
      };

      let saveErr: any = null;

      if (editingBlogId) {
        // Update existing article
        const { error } = await supabase
          .from("blogs")
          .update(payload)
          .eq("id", editingBlogId);

        if (error) {
          saveErr = error;
          // Fallback if author_avatar column doesn't exist yet
          if (error.message?.includes("author_avatar") || error.code === "PGRST204") {
            const fallbackPayload = { ...payload };
            delete (fallbackPayload as any).author_avatar;
            const { error: retryErr } = await supabase.from("blogs").update(fallbackPayload).eq("id", editingBlogId);
            if (!retryErr) saveErr = null;
          }
        }
      } else {
        // Insert new article
        const { error } = await supabase.from("blogs").insert([
          {
            ...payload,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          saveErr = error;
          // Fallback if author_avatar column doesn't exist yet
          if (error.message?.includes("author_avatar") || error.code === "PGRST204") {
            const fallbackPayload = { ...payload };
            delete (fallbackPayload as any).author_avatar;
            const { error: retryErr } = await supabase.from("blogs").insert([{ ...fallbackPayload, created_at: new Date().toISOString() }]);
            if (!retryErr) saveErr = null;
          }
        }
      }

      if (saveErr) throw saveErr;

      showToast(editingBlogId ? "تم تحديث المقال بنجاح!" : "تم نشر المقال الجديد بنجاح!", "success");
      setIsFormOpen(false);
      fetchBlogs();
    } catch (err: any) {
      console.error("Save error:", err);
      if (err.message?.includes("author_avatar")) {
        showToast("يرجى تشغيل أمر السطر التالي في SQL Editor لإنشاء عمود الصورة: ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_avatar TEXT;", "error");
      } else {
        showToast(`حدث خطأ أثناء حفظ المقال: ${err.message || err}`, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!deleteBlogId || !supabase) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", deleteBlogId);
      if (error) throw error;
      showToast("تم حذف المقال بنجاح!", "success");
      setDeleteBlogId(null);
      fetchBlogs();
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(`حدث خطأ أثناء الحذف: ${err.message || err}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (blog: BlogArticle) => {
    if (!supabase) return;
    const nextStatus = blog.status === "published" ? "draft" : "published";
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ status: nextStatus })
        .eq("id", blog.id);

      if (error) throw error;
      showToast(`تم تغيير حالة المقال إلى (${nextStatus === "published" ? "منشور" : "مسودة"})`, "success");
      fetchBlogs();
    } catch (err: any) {
      showToast(`عفواً، فشل تغيير الحالة`, "error");
    }
  };

  // Filtering
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === "الكل" || b.category === selectedCategoryFilter;

    const matchesStatus =
      selectedStatusFilter === "الكل" || b.status === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPublished = blogs.filter((b) => b.status === "published").length;
  const totalDrafts = blogs.filter((b) => b.status === "draft").length;
  const totalViews = blogs.reduce((acc, b) => acc + (b.views_count || 0), 0);

  return (
    <div className={styles.container}>
      {/* Toast message */}
      {toastMessage && (
        <div className={`${styles.toast} ${styles[toastMessage.type]}`}>
          <i className={`bx ${toastMessage.type === "success" ? "bx-check-circle" : "bx-error-circle"}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerIconWrapper}>
            <i className="bx bx-news" />
          </div>
          <div>
            <h1 className={styles.pageTitle}>إدارة المدونة والمقالات</h1>
            <p className={styles.pageSub}>
              لوحة التحكم الكاملة لكتابة المقالات، تعديلها، وتخصيص تنسيقات النصوص والصور
            </p>
          </div>
        </div>

        <button className={styles.newArticleBtn} onClick={handleOpenNewForm}>
          <i className="bx bx-plus-circle" />
          <span>كتابة مقال جديد</span>
        </button>
      </div>

      {/* Table Missing Alert Banner */}
      {isTableMissing && (
        <div style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: "1px solid #ef4444",
          borderRadius: "14px",
          padding: "1.2rem 1.5rem",
          marginBottom: "2rem",
          color: "#fecaca",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <i className="bx bx-error-circle" style={{ fontSize: "2rem", color: "#ef4444" }} />
          <div>
            <strong style={{ fontSize: "1.05rem", display: "block", color: "#ffffff" }}>
              جدول المقالات (public.blogs) غير موجود في قاعدة بيانات Supabase بعد
            </strong>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", opacity: 0.9 }}>
              من فضلك قم بنسخ محتوى ملف <code>supabase_blogs_schema.sql</code> الموجود في المجلد الرئيسي للمشروع، ولصقه وتفيذه في لوحة تحكم Supabase الخاصة بك: 
              <br />
              <strong>Supabase Dashboard ➔ SQL Editor ➔ New Query ➔ Run</strong>
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
            <i className="bx bx-file" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>إجمالي المقالات</span>
            <strong className={styles.statValue}>{blogs.length}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <i className="bx bx-check-double" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>مقالات منشورة</span>
            <strong className={styles.statValue}>{totalPublished}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
            <i className="bx bx-edit" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>مسودات قيد الكتابة</span>
            <strong className={styles.statValue}>{totalDrafts}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
            <i className="bx bx-show" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>إجمالي المشاهدات</span>
            <strong className={styles.statValue}>{totalViews}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <i className="bx bx-search" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ابحث في عناوين وأقسام المقالات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <select
            className={styles.filterSelect}
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="الكل">كل الأقسام</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
          >
            <option value="الكل">كل الحالات</option>
            <option value="published">منشور فقط</option>
            <option value="draft">مسودة فقط</option>
          </select>
        </div>
      </div>

      {/* Articles List / Grid */}
      {loading ? (
        <div className={styles.loadingBox}>
          <i className="bx bx-loader-alt spin" />
          <span>جاري تحميل المقالات...</span>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className={styles.emptyBox}>
          <i className="bx bx-news" />
          <h3>لا توجد مقالات تطابق هذا البحث</h3>
          <p>اضغط على "كتابة مقال جديد" لإضافة أول مقال في المدونة</p>
        </div>
      ) : (
        <div className={styles.articlesGrid}>
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className={styles.articleCard}>
              <div className={styles.cardHeader}>
                <img
                  src={
                    blog.cover_image ||
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600"
                  }
                  alt={blog.title}
                  className={styles.cardCover}
                />
                <span
                  className={`${styles.statusBadge} ${
                    blog.status === "published" ? styles.badgePublished : styles.badgeDraft
                  }`}
                  onClick={() => toggleStatus(blog)}
                  title="انقر لتغيير حالة المقال"
                >
                  {blog.status === "published" ? "منشور" : "مسودة"}
                </span>
                <span className={styles.categoryBadge}>{blog.category}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.articleTitle}>{blog.title}</h3>
                <p className={styles.articleExcerpt}>
                  {blog.excerpt || "لا يوجد ملخص للمقال..."}
                </p>

                <div className={styles.articleMeta}>
                  <span>
                    <i className="bx bx-time" /> {blog.reading_time || 3} دقائق قراءة
                  </span>
                  <span>
                    <i className="bx bx-show" /> {blog.views_count || 0}
                  </span>
                  <span>
                    <i className="bx bx-like" /> {blog.likes_count || 0}
                  </span>
                  <span>
                    <i className="bx bx-comment-detail" /> {blog.comments_count || 0}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Link
                  href={`/blog/${encodeURIComponent(blog.slug || blog.id)}`}
                  target="_blank"
                  className={styles.previewBtn}
                  title="معاينة المقال في الموقع"
                >
                  <i className="bx bx-link-external" /> معاينة
                </Link>

                <div className={styles.footerActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleOpenEditForm(blog)}
                    title="تعديل المقال والمحتوى"
                  >
                    <i className="bx bx-edit-alt" /> تعديل
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeleteBlogId(blog.id)}
                    title="حذف المقال"
                  >
                    <i className="bx bx-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal / Full Drawer for Create or Edit Article ── */}
      {isFormOpen && (
        <div className={styles.editorModalOverlay}>
          <div className={styles.editorModalContainer}>
            <div className={styles.editorModalHeader}>
              <h2>
                <i className="bx bx-edit" />
                {editingBlogId ? "تعديل المقال" : "كتابة مقال جديد"}
              </h2>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setIsFormOpen(false)}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className={styles.editorModalForm}>
              <div className={styles.formRowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>عنوان المقال *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثال: أفضل طرق المواصلات من وسط البلد للمطار"
                    value={title}
                    onChange={handleTitleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>القسم التصنيفي</label>
                  <select
                    className={styles.formSelect}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رابط المقال (Slug)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="best-transport-routes-cairo"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    dir="ltr"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رابط صورة الغلاف (Cover Image URL)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="https://example.com/cover.jpg"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className={styles.formRowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>اسم الكاتب / الناشر</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثال: أحمد محمود أو فريق الموقع"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رابط صورة الكاتب (Avatar URL)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="https://example.com/avatar.jpg"
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className={styles.formRowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>وقت القراءة (بالدقائق)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className={styles.formInput}
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>حالة المقال</label>
                  <select
                    className={styles.formSelect}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                  >
                    <option value="published">منشور فوراً (Published)</option>
                    <option value="draft">مسودة فقط (Draft)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الملخص السريع (Excerpt)</label>
                <textarea
                  className={styles.formTextarea}
                  rows={2}
                  placeholder="موجز قصير جداً يظهر في كارت المقال وصفحة الرئيسية..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              {/* Rich Text Editor Component */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  محتوى المقال الرئيسي (استخدم محرر النصوص لتنسيق الألوان والأحجام والصور) *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={(html) => setContent(html)}
                  placeholder="ابدأ في كتابة المقال وتنسيقه بالصور والألوان..."
                  minHeight="350px"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الكلمات المفتاحية (Tags - مفصولة بفواصل)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="مترو, اتوبيس, التجمع, وسط البلد"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <div className={styles.formSubmitRow}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsFormOpen(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? (
                    <>
                      <i className="bx bx-loader-alt spin" /> جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-save" /> {editingBlogId ? "حفظ التعديلات" : "نشر المقال"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Confirmation ── */}
      <CustomModal
        isOpen={Boolean(deleteBlogId)}
        onClose={() => !deleting && setDeleteBlogId(null)}
        title="تأكيد حذف المقال"
        titleColor="#ef4444"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(239, 68, 68, 0.25)"
        message="هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً؟ لا يمكن التراجع عن هذه العملية."
        primaryButton={{
          label: deleting ? "جاري الحذف..." : "حذف المقال نهائياً",
          onClick: handleDeleteBlog,
          bgColor: "#ef4444",
          disabled: deleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setDeleteBlogId(null),
          bgColor: "var(--cancelBtn)",
          disabled: deleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      />
    </div>
  );
}
