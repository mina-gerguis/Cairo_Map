"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { DocRoadmapStatus, DocType, SiteDoc } from "@/types/doc";
import {
  DOC_TYPE_META,
  ROADMAP_STATUS_META,
  SUGGESTED_DOC_TAGS,
  DOCS_SCHEMA_SQL,
  formatDocDate,
  generateDocSlug,
} from "@/lib/docs";
import RichTextEditor from "@/components/admin/RichTextEditor";
import CustomModal from "@/components/common/Modals";
import styles from "./doc.module.css";

export default function AdminDocPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Docs state
  const [docs, setDocs] = useState<SiteDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [isCoverImageMissing, setIsCoverImageMissing] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | DocType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterRoadmapStatus, setFilterRoadmapStatus] = useState<"all" | DocRoadmapStatus>("all");

  // Form Drawer Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields (100% Complete Module)
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDocType, setFormDocType] = useState<DocType>("update");
  const [formVersion, setFormVersion] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formHighlights, setFormHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [formRoadmapStatus, setFormRoadmapStatus] = useState<DocRoadmapStatus>("released");
  const [formProgressPercent, setFormProgressPercent] = useState<number>(100);
  const [formReleaseDate, setFormReleaseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formAuthorName, setFormAuthorName] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<SiteDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check admin privileges
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error || !data?.is_admin) {
          setIsAdmin(false);
          router.push("/");
        } else {
          setIsAdmin(true);
        }
      } catch {
        setIsAdmin(false);
        router.push("/");
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  // Fetch docs from Supabase
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("site_docs")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("release_date", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        if (
          error.code === "PGRST205" ||
          error.code === "42P01" ||
          error.message?.includes("site_docs")
        ) {
          setIsTableMissing(true);
        } else {
          showToast(`خطأ في جلب التوثيقات: ${error.message}`, "error");
        }
      } else {
        setIsTableMissing(false);
        setDocs((data as SiteDoc[]) || []);
      }
    } catch (err: any) {
      showToast(`فشل الاتصال: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchDocs();
    }
  }, [isAdmin, fetchDocs]);

  // Copy SQL script to clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(DOCS_SCHEMA_SQL);
    setIsCopiedSql(true);
    showToast("تم نسخ كود SQL إلى الحافظة بنجاح!", "success");
    setTimeout(() => setIsCopiedSql(false), 3000);
  };

  // Open Form for New Item
  const handleOpenNew = () => {
    setEditingId(null);
    setFormTitle("");
    setFormSlug("");
    setFormDocType("update");
    setFormVersion("v1.0.0");
    setFormSummary("");
    setFormContent("<p>اكتب التفاصيل الكاملة للتحديث أو الميزة هنا...</p>");
    setFormCoverImage("");
    setFormHighlights([]);
    setHighlightInput("");
    setFormTags(["تحديث"]);
    setTagInput("");
    setFormRoadmapStatus("released");
    setFormProgressPercent(100);
    setFormReleaseDate(new Date().toISOString().split("T")[0]);
    setFormIsPinned(false);
    setFormIsPublished(true);
    setFormSortOrder(0);
    setFormAuthorName(profile?.full_name || user?.email?.split("@")[0] || "فريق قريب");
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (doc: SiteDoc) => {
    setEditingId(doc.id);
    setFormTitle(doc.title || "");
    setFormSlug(doc.slug || "");
    setFormDocType(doc.doc_type || "update");
    setFormVersion(doc.version || "");
    setFormSummary(doc.summary || "");
    setFormContent(doc.content || "");
    setFormCoverImage(doc.cover_image || "");
    setFormHighlights(Array.isArray(doc.highlights) ? [...doc.highlights] : []);
    setHighlightInput("");
    setFormTags(Array.isArray(doc.tags) ? [...doc.tags] : []);
    setTagInput("");
    setFormRoadmapStatus(doc.roadmap_status || "released");
    setFormProgressPercent(
      typeof doc.progress_percent === "number" ? doc.progress_percent : 100
    );
    setFormReleaseDate(
      doc.release_date || new Date().toISOString().split("T")[0]
    );
    setFormIsPinned(Boolean(doc.is_pinned));
    setFormIsPublished(Boolean(doc.is_published));
    setFormSortOrder(doc.sort_order || 0);
    setFormAuthorName(doc.author_name || "فريق قريب");
    setIsFormOpen(true);
  };

  // Auto-slug when title changes
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingId && (!formSlug || formSlug === generateDocSlug(formTitle))) {
      setFormSlug(generateDocSlug(val));
    }
  };

  // Add highlight item
  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormHighlights((prev) => [...prev, highlightInput.trim()]);
    setHighlightInput("");
  };

  const handleRemoveHighlight = (idx: number) => {
    setFormHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add tag item
  const handleAddTag = (tagToAdd?: string) => {
    const t = (tagToAdd || tagInput).trim();
    if (!t) return;
    if (!formTags.includes(t)) {
      setFormTags((prev) => [...prev, t]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Save Doc (Create / Update)
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("يرجى إدخال عنوان التوثيق", "error");
      return;
    }
    if (!supabase) {
      showToast("قاعدة البيانات غير متصلة", "error");
      return;
    }

    setSaving(true);
    try {
      const finalSlug = (formSlug || generateDocSlug(formTitle)).trim();
      const payload: any = {
        title: formTitle.trim(),
        slug: finalSlug || null,
        doc_type: formDocType,
        version: formVersion.trim() || null,
        summary: formSummary.trim() || null,
        content: formContent.trim() || "",
        cover_image: formCoverImage.trim() || null,
        highlights: formHighlights,
        tags: formTags,
        roadmap_status: formRoadmapStatus,
        progress_percent: Math.max(0, Math.min(100, Number(formProgressPercent) || 0)),
        release_date: formReleaseDate || new Date().toISOString().split("T")[0],
        is_pinned: formIsPinned,
        is_published: formIsPublished,
        sort_order: Number(formSortOrder) || 0,
        author_name: formAuthorName.trim() || "فريق قريب",
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("site_docs")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          // If cover_image column is missing in Supabase schema cache, retry without it
          if (error.message?.includes("cover_image") || error.details?.includes("cover_image")) {
            setIsCoverImageMissing(true);
            const { cover_image, ...fallbackPayload } = payload;
            const { error: retryErr } = await supabase
              .from("site_docs")
              .update(fallbackPayload)
              .eq("id", editingId);
            if (retryErr) throw retryErr;
            showToast(
              "تم الحفظ بنجاح! ملحوظة: لإتاحة صور الغلاف، يرجى تشغيل استعلام SQL أعلى الصفحة في Supabase",
              "success"
            );
            setIsFormOpen(false);
            fetchDocs();
            return;
          }
          throw error;
        }
        showToast("تم تحديث عنصر التوثيق بنجاح!", "success");
      } else {
        const insertData = {
          ...payload,
          created_by: user?.id || null,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("site_docs").insert([insertData]);

        if (error) {
          // If cover_image column is missing in Supabase schema cache, retry without it
          if (error.message?.includes("cover_image") || error.details?.includes("cover_image")) {
            setIsCoverImageMissing(true);
            const { cover_image, ...fallbackInsertData } = insertData;
            const { error: retryErr } = await supabase
              .from("site_docs")
              .insert([fallbackInsertData]);
            if (retryErr) throw retryErr;
            showToast(
              "تمت الإضافة بنجاح! ملحوظة: لإتاحة صور الغلاف، يرجى تشغيل استعلام SQL أعلى الصفحة في Supabase",
              "success"
            );
            setIsFormOpen(false);
            fetchDocs();
            return;
          }
          throw error;
        }
        showToast("تمت إضافة عنصر التوثيق الجديد بنجاح!", "success");
      }

      setIsFormOpen(false);
      fetchDocs();
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(`فشل الحفظ: ${err.message || err}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle quick publish status
  const togglePublish = async (doc: SiteDoc) => {
    if (!supabase) return;
    const nextVal = !doc.is_published;
    try {
      const { error } = await supabase
        .from("site_docs")
        .update({ is_published: nextVal, updated_at: new Date().toISOString() })
        .eq("id", doc.id);
      if (error) throw error;
      showToast(
        nextVal ? "تم نشر العنصر للزوار!" : "تم تحويل العنصر إلى مسودة خاصة!",
        "success"
      );
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, is_published: nextVal } : d))
      );
    } catch (err: any) {
      showToast(`خطأ في تغيير الحالة: ${err.message}`, "error");
    }
  };

  // Toggle quick pin
  const togglePin = async (doc: SiteDoc) => {
    if (!supabase) return;
    const nextVal = !doc.is_pinned;
    try {
      const { error } = await supabase
        .from("site_docs")
        .update({ is_pinned: nextVal, updated_at: new Date().toISOString() })
        .eq("id", doc.id);
      if (error) throw error;
      showToast(
        nextVal ? "تم تثبيت التحديث في قمة الصفحة!" : "تم إلغاء التثبيت!",
        "success"
      );
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, is_pinned: nextVal } : d))
      );
    } catch (err: any) {
      showToast(`خطأ في تعديل التثبيت: ${err.message}`, "error");
    }
  };

  // Delete Doc
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !supabase) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("site_docs")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      showToast("تم حذف عنصر التوثيق بنجاح!", "success");
      setDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(`فشل الحذف: ${err.message}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered docs
  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      if (filterType !== "all" && doc.doc_type !== filterType) return false;
      if (filterStatus === "published" && !doc.is_published) return false;
      if (filterStatus === "draft" && doc.is_published) return false;
      if (
        filterRoadmapStatus !== "all" &&
        doc.roadmap_status !== filterRoadmapStatus
      )
        return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inTitle = doc.title?.toLowerCase().includes(q);
      const inSummary = doc.summary?.toLowerCase().includes(q);
      const inVersion = doc.version?.toLowerCase().includes(q);
      const inTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
      const inHighlights = doc.highlights?.some((h) =>
        h.toLowerCase().includes(q)
      );

      return inTitle || inSummary || inVersion || inTags || inHighlights;
    });
  }, [docs, filterType, filterStatus, filterRoadmapStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = docs.length;
    const published = docs.filter((d) => d.is_published).length;
    const updates = docs.filter((d) => d.doc_type === "update").length;
    const features = docs.filter((d) => d.doc_type === "feature").length;
    const roadmap = docs.filter((d) => d.doc_type === "roadmap").length;
    return { total, published, updates, features, roadmap };
  }, [docs]);

  if (authChecking) {
    return (
      <div className={styles.loadingBox} style={{ margin: "3rem auto", maxWidth: "450px" }}>
        <i className="bx bx-loader-alt spin" />
        <h3>جاري التحقق من الصلاحيات...</h3>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`${styles.toast} ${styles[toastMessage.type]}`}>
          <i
            className={`bx ${
              toastMessage.type === "success"
                ? "bx-check-circle"
                : "bx-error-circle"
            }`}
          />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerIconWrapper}>
            <i className="bx bx-book-content" />
          </div>
          <div>
            <h1 className={styles.pageTitle}>إدارة التوثيق وسجل التحديثات</h1>
            <p className={styles.pageSub}>
              إدارة سجل التحديثات، استعراض المميزات الجديدة، ومتابعة خريطة طريق الموقع
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link
            href="/doc"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visitPublicBtn}
          >
            <i className="bx bx-external-link" />
            <span>معاينة صفحة /doc</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenNew}
            className={styles.newDocBtn}
          >
            <i className="bx bx-plus-circle" />
            <span>إضافة توثيق / ميزة جديدة</span>
          </button>
        </div>
      </div>

      {/* ── Missing Table Banner (Auto-detected) ── */}
      {isTableMissing && (
        <div className={styles.sqlBanner}>
          <div className={styles.sqlHeader}>
            <div className={styles.sqlTitleGroup}>
              <i className={`bx bx-data ${styles.sqlIcon}`} />
              <div>
                <h3 className={styles.sqlTitle}>
                  جدول قاعدة البيانات (site_docs) غير موجود بعد في Supabase
                </h3>
                <p className={styles.sqlSub}>
                  انسخ كود SQL بالأسفل والصقه في Supabase SQL Editor ثم اضغط Run
                  ليعمل النظام فوراً.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className={styles.sqlCopyBtn}
            >
              <i className={`bx ${isCopiedSql ? "bx-check" : "bx-copy"}`} />
              <span>{isCopiedSql ? "تم النسخ بنجاح!" : "نسخ كود SQL"}</span>
            </button>
          </div>

          <pre className={styles.sqlCodeBox}>{DOCS_SCHEMA_SQL}</pre>
        </div>
      )}

      {/* ── Missing cover_image Column Banner ── */}
      {isCoverImageMissing && !isTableMissing && (
        <div className={styles.sqlBanner} style={{ borderColor: "#f59e0b" }}>
          <div className={styles.sqlHeader}>
            <div className={styles.sqlTitleGroup}>
              <i className="bx bx-image-alt" style={{ color: "#f59e0b", fontSize: "1.75rem" }} />
              <div>
                <h3 className={styles.sqlTitle} style={{ color: "#f59e0b" }}>
                  ترقية قاعدة البيانات: إضافة عمود صورة الغلاف (cover_image)
                </h3>
                <p className={styles.sqlSub}>
                  تم الحفظ بنجاح بدون صورة. لتفعيل حفظ صور الغلاف، يرجى نسخ كود SQL التالي وتشغيله في Supabase SQL Editor:
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("ALTER TABLE public.site_docs ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';");
                showToast("تم نسخ كود SQL لإضافة العمود بنجاح!", "success");
              }}
              className={styles.sqlCopyBtn}
            >
              <i className="bx bx-copy" />
              <span>نسخ كود الترقية</span>
            </button>
          </div>

          <pre className={styles.sqlCodeBox}>
ALTER TABLE public.site_docs ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';
          </pre>
        </div>
      )}

      {/* ── KPI Stats Bento ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: "rgba(0, 111, 238, 0.15)",
              color: "var(--color-primary, #006FEE)",
            }}
          >
            <i className="bx bx-collection" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>إجمالي التوثيقات</span>
            <strong className={styles.statValue}>{stats.total}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
            }}
          >
            <i className="bx bx-git-commit" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>سجل التحديثات</span>
            <strong className={styles.statValue}>{stats.updates}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
            }}
          >
            <i className="bx bx-sparkles" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>مميزات جديدة</span>
            <strong className={styles.statValue}>{stats.features}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              color: "#a855f7",
            }}
          >
            <i className="bx bx-navigation" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>خريطة الطريق</span>
            <strong className={styles.statValue}>{stats.roadmap}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              color: "#22c55e",
            }}
          >
            <i className="bx bx-check-double" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>منشور للزوار</span>
            <strong className={styles.statValue}>{stats.published}</strong>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <i className="bx bx-search" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ابحث في العناوين، الإصدارات، الوسوم، أو النقاط..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <select
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">كل الأنواع</option>
            <option value="update">سجل التحديثات فقط</option>
            <option value="feature">المميزات الجديدة فقط</option>
            <option value="roadmap">خريطة الطريق فقط</option>
          </select>

          <select
            className={styles.filterSelect}
            value={filterRoadmapStatus}
            onChange={(e) => setFilterRoadmapStatus(e.target.value as any)}
          >
            <option value="all">كل مراحل التنفيذ</option>
            <option value="released">تم الإطلاق</option>
            <option value="in_progress">جاري العمل عليها</option>
            <option value="testing">قيد الاختبار (Beta)</option>
            <option value="planned">مخطط لها</option>
          </select>

          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">كل الحالات</option>
            <option value="published">منشور فقط</option>
            <option value="draft">مسودة فقط</option>
          </select>
        </div>
      </div>

      {/* ── Content Table ── */}
      {loading ? (
        <div className={styles.loadingBox}>
          <i className="bx bx-loader-alt spin" />
          <h3>جاري تحميل التوثيقات...</h3>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className={styles.emptyBox}>
          <i className="bx bx-book-open" />
          <h3>لا توجد توثيقات مطابقة</h3>
          <p>اضغط على "إضافة توثيق / ميزة جديدة" لإضافة أول تحديث في المنصة</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.docsTable}>
              <thead>
                <tr>
                  <th className={styles.th}>عنوان التوثيق والإصدار</th>
                  <th className={styles.th}>النوع</th>
                  <th className={styles.th}>المرحلة ونسبة الإنجاز</th>
                  <th className={styles.th}>تاريخ الإطلاق</th>
                  <th className={styles.th}>حالة النشر</th>
                  <th className={styles.th} style={{ textAlign: "center" }}>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => {
                  const typeMeta = DOC_TYPE_META[doc.doc_type] || DOC_TYPE_META.update;
                  const statusMeta =
                    ROADMAP_STATUS_META[doc.roadmap_status] ||
                    ROADMAP_STATUS_META.released;

                  const typeClass =
                    doc.doc_type === "update"
                      ? styles.typeUpdate
                      : doc.doc_type === "feature"
                      ? styles.typeFeature
                      : styles.typeRoadmap;

                  return (
                    <tr key={doc.id} className={styles.tr}>
                      {/* Title & Version */}
                      <td className={styles.td}>
                        <div className={styles.docTitleCell}>
                          <div className={styles.docTitleText}>
                            {doc.is_pinned && (
                              <span className={styles.pinnedBadge} title="مثبت في المقدمة">
                                <i className="bx bxs-pin" /> مثبت
                              </span>
                            )}
                            <span>{doc.title}</span>
                            {doc.version && (
                              <span className={styles.versionBadge}>{doc.version}</span>
                            )}
                          </div>
                          {doc.summary && (
                            <div className={styles.docSummarySub}>{doc.summary}</div>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className={styles.td}>
                        <span className={`${styles.typeBadge} ${typeClass}`}>
                          <i className={typeMeta.icon} />
                          <span>{typeMeta.label}</span>
                        </span>
                      </td>

                      {/* Roadmap Status & Progress */}
                      <td className={styles.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          <span
                            className={styles.statusPill}
                            style={{
                              backgroundColor: statusMeta.bg,
                              color: statusMeta.color,
                              border: `1px solid ${statusMeta.border}`,
                              alignSelf: "flex-start",
                            }}
                          >
                            <i className={statusMeta.icon} />
                            <span>{statusMeta.label}</span>
                          </span>

                          <div className={styles.progressContainer}>
                            <div className={styles.progressBarBg}>
                              <div
                                className={styles.progressBarFill}
                                style={{
                                  width: `${Math.min(100, Math.max(0, doc.progress_percent || 0))}%`,
                                  backgroundColor: statusMeta.color,
                                }}
                              />
                            </div>
                            <span className={styles.progressText}>
                              {doc.progress_percent || 0}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className={styles.td}>
                        <div style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {formatDocDate(doc.release_date)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {doc.author_name || "فريق قريب"}
                        </div>
                      </td>

                      {/* Publish Toggle Button */}
                      <td className={styles.td}>
                        <button
                          type="button"
                          className={`${styles.toggleBtn} ${
                            doc.is_published
                              ? styles.togglePublished
                              : styles.toggleDraft
                          }`}
                          onClick={() => togglePublish(doc)}
                          title="انقر لتبديل حالة النشر"
                        >
                          <i
                            className={`bx ${
                              doc.is_published ? "bx-check-circle" : "bx-time-five"
                            }`}
                          />
                          <span>{doc.is_published ? "منشور للزوار" : "مسودة"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className={styles.td}>
                        <div className={styles.actionsCell} style={{ justifyContent: "center" }}>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${
                              doc.is_pinned ? styles.actionBtnPinActive : ""
                            }`}
                            onClick={() => togglePin(doc)}
                            title={doc.is_pinned ? "إلغاء التثبيت" : "تثبيت في القمة"}
                          >
                            <i className={`bx ${doc.is_pinned ? "bxs-pin" : "bx-pin"}`} />
                          </button>

                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            onClick={() => handleOpenEdit(doc)}
                            title="تعديل التوثيق"
                          >
                            <i className="bx bx-edit" />
                          </button>

                          <Link
                            href={`/doc#${doc.slug || doc.id}`}
                            target="_blank"
                            className={styles.actionBtn}
                            title="معاينة الرابط على صفحة /doc"
                          >
                            <i className="bx bx-show" />
                          </Link>

                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            onClick={() => setDeleteTarget(doc)}
                            title="حذف نهائياً"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 100% COMPLETE MODULE: Form Drawer / Dialog ── */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setIsFormOpen(false);
            }
          }}
        >
          <div className={styles.modalContainer}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalIconBox}>
                  <i className="bx bx-edit-alt" />
                </div>
                <div>
                  <h2 className={styles.modalTitle}>
                    {editingId ? "تعديل بيانات التوثيق" : "إضافة توثيق أو ميزة جديدة"}
                  </h2>
                  <p className={styles.modalSub}>
                    املأ الحقول التالية لعرض التحديث في صفحة التوثيق العامة (/doc)
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => !saving && setIsFormOpen(false)}
                title="إغلاق النافذة"
              >
                <i className="bx bx-x" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDoc} className={styles.modalForm}>
              {/* SECTION 1: البيانات الأساسية */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <i className={`bx bx-info-circle ${styles.sectionIcon}`} />
                  <h3 className={styles.sectionTitle}>1. المعلومات الأساسية والتصنيف</h3>
                  <span className={styles.sectionSub}>العنوان، النوع، ورقم الإصدار</span>
                </div>

                <div className={styles.formRowMainSide}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>
                        عنوان التحديث أو الميزة <span className={styles.requiredStar}>*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: إطلاق محرك البحث الذكي لخطوط المترو والتبادل"
                      value={formTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>رقم الإصدار (Version)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="v2.5.0"
                      value={formVersion}
                      onChange={(e) => setFormVersion(e.target.value)}
                      className={styles.formInput}
                      style={{ fontFamily: "monospace", direction: "ltr" }}
                    />
                  </div>
                </div>

                <div className={styles.formRowThree} style={{ marginTop: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>
                        نوع التوثيق <span className={styles.requiredStar}>*</span>
                      </span>
                    </label>
                    <select
                      value={formDocType}
                      onChange={(e) => setFormDocType(e.target.value as DocType)}
                      className={styles.formSelect}
                    >
                      <option value="update">تاريخ التحديثات (Update)</option>
                      <option value="feature">ميزة جديدة (New Feature)</option>
                      <option value="roadmap">الخطط التي نعمل عليها (Roadmap)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>تاريخ التحديث / الإطلاق</span>
                    </label>
                    <input
                      type="date"
                      value={formReleaseDate}
                      onChange={(e) => setFormReleaseDate(e.target.value)}
                      className={styles.formInput}
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>رابط المعرف القصير (Slug)</span>
                    </label>
                    <div className={styles.inputWithBtn}>
                      <input
                        type="text"
                        placeholder="metro-smart-search"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        className={styles.formInput}
                        style={{ fontFamily: "monospace", direction: "ltr" }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormSlug(generateDocSlug(formTitle))}
                        className={styles.inputInlineBtn}
                        title="توليد تلقائي من العنوان"
                      >
                        توليد
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover Image URL */}
                <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                  <label className={styles.formLabel}>
                    <span>رابط صورة الغلاف أو البنر (Cover Image URL - اختياري)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/banner.webp أو /images/transit/metro.webp"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    className={styles.formInput}
                    style={{ direction: "ltr" }}
                  />
                </div>
              </div>

              {/* SECTION 2: خريطة الطريق ومستوى الإنجاز */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <i className={`bx bx-target-lock ${styles.sectionIcon}`} />
                  <h3 className={styles.sectionTitle}>2. حالة التنفيذ ونسبة الإنجاز (Roadmap Status)</h3>
                  <span className={styles.sectionSub}>تحديد مرحلة التطوير وشريط التقدم</span>
                </div>

                <div className={styles.formRowTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>مرحلة التنفيذ والحالة الحالية</span>
                    </label>
                    <select
                      value={formRoadmapStatus}
                      onChange={(e) => setFormRoadmapStatus(e.target.value as DocRoadmapStatus)}
                      className={styles.formSelect}
                    >
                      <option value="released">تم الإطلاق (Released - متاح الآن)</option>
                      <option value="in_progress">جاري العمل عليها (In Progress)</option>
                      <option value="testing">قيد التجربة والبيتا (Beta Testing)</option>
                      <option value="planned">مخطط لها قريباً (Planned)</option>
                    </select>
                  </div>

                  <div className={styles.progressSliderBox}>
                    <div className={styles.sliderHeader}>
                      <span className={styles.sliderTitle}>نسبة الإنجاز الفعلية:</span>
                      <span className={styles.sliderValueBadge}>{formProgressPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formProgressPercent}
                      onChange={(e) => setFormProgressPercent(Number(e.target.value))}
                      className={styles.rangeInput}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ملخص سريع وأبرز المزايا والوسوم */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <i className={`bx bx-list-check ${styles.sectionIcon}`} />
                  <h3 className={styles.sectionTitle}>3. الملخص والنقاط المميزة والوسوم</h3>
                  <span className={styles.sectionSub}>عرض بطاقة سريعة للمستخدم</span>
                </div>

                {/* Summary */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>ملخص سريع (يظهر في كارت التمهيد بالصفحة العامة)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="اكتب نبذة موجزة في سطر أو سطرين عن هذا التحديث..."
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    className={styles.formTextarea}
                  />
                </div>

                {/* Highlights Manager */}
                <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                  <label className={styles.formLabel}>
                    <span>أبرز النقاط والمزايا السريعة (Highlights - نقاط علامات صح)</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {formHighlights.length} نقاط مضافة
                    </span>
                  </label>

                  <div className={styles.inputWithBtn}>
                    <input
                      type="text"
                      placeholder="اكتب نقطة بارزة واضغط Enter أو إضافة..."
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddHighlight();
                        }
                      }}
                      className={styles.formInput}
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className={styles.inputInlineBtn}
                    >
                      <i className="bx bx-plus" /> إضافة نقطة
                    </button>
                  </div>

                  {formHighlights.length > 0 && (
                    <div className={styles.highlightsList}>
                      {formHighlights.map((hl, i) => (
                        <div key={i} className={styles.highlightItem}>
                          <span className={styles.highlightText}>
                            <span className={styles.highlightCheck}>✓</span>
                            <span>{hl}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(i)}
                            className={styles.removeHighlightBtn}
                            title="حذف هذه النقطة"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags Manager */}
                <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                  <label className={styles.formLabel}>
                    <span>الكلمات الدلالية والوسوم (Tags)</span>
                  </label>

                  <div className={styles.inputWithBtn}>
                    <input
                      type="text"
                      placeholder="اكتب وسماً واضغط إضافة..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className={styles.formInput}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      className={styles.inputInlineBtn}
                    >
                      <i className="bx bx-tag" /> إضافة وسم
                    </button>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className={styles.presetTagsList}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>
                      اقتراحات سريعة:
                    </span>
                    {SUGGESTED_DOC_TAGS.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleAddTag(st)}
                        className={styles.presetTagBtn}
                      >
                        + {st}
                      </button>
                    ))}
                  </div>

                  {/* Active Tags */}
                  {formTags.length > 0 && (
                    <div className={styles.activeTagsList}>
                      {formTags.map((t) => (
                        <span key={t} className={styles.activeTagChip}>
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className={styles.removeTagBtn}
                            title="إزالة الوسم"
                          >
                            <i className="bx bx-x" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: الشرح والمحتوى الكامل */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <i className={`bx bx-detail ${styles.sectionIcon}`} />
                  <h3 className={styles.sectionTitle}>4. المحتوى والشرح المفصل (Rich Text Editor)</h3>
                  <span className={styles.sectionSub}>يدعم التنسيقات الكاملة، العناوين، الصور، والجداول</span>
                </div>

                <div className={styles.formGroup}>
                  <RichTextEditor
                    value={formContent}
                    onChange={setFormContent}
                    placeholder="اكتب التوثيق الكامل والتفاصيل والأمثلة التوضيحية..."
                    minHeight="280px"
                  />
                </div>
              </div>

              {/* SECTION 5: إعدادات النشر والكاتب */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <i className={`bx bx-cog ${styles.sectionIcon}`} />
                  <h3 className={styles.sectionTitle}>5. إعدادات النشر وخيارات الظهور</h3>
                </div>

                <div className={styles.formRowTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>اسم الكاتب أو الفريق المسؤول</span>
                    </label>
                    <input
                      type="text"
                      placeholder="فريق تطوير قريب"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span>ترتيب الظهور الرقمي (Sort Order)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(Number(e.target.value))}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.togglesGroup} style={{ marginTop: "1.25rem" }}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className={styles.toggleCheckbox}
                    />
                    <div>
                      <span className={styles.toggleText}>⭐ تثبيت التحديث في مقدمة الصفحة (Pinned)</span>
                      <span className={styles.toggleDesc}>يظهر بشارة مميزة في أعلى صفحة /doc</span>
                    </div>
                  </label>

                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className={styles.toggleCheckbox}
                    />
                    <div>
                      <span className={styles.toggleText}>🌐 النشر الفوري للزوار (Published)</span>
                      <span className={styles.toggleDesc}>
                        {formIsPublished
                          ? "سيكون متاحاً لجميع الزوار على صفحة /doc"
                          : "محفوظ كمسودة خاصة بالمشرفين فقط"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsFormOpen(false)}
                  disabled={saving}
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="bx bx-loader-alt spin" /> جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-save" /> {editingId ? "حفظ التعديلات" : "نشر التوثيق"}
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
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="تأكيد حذف عنصر التوثيق"
        titleColor="#ef4444"
        iconSrc="/images/threeD/trash.webp"
        borderColor="rgba(239, 68, 68, 0.25)"
        message={`هل أنت متأكد من رغبتك في حذف التوثيق "${deleteTarget?.title}" نهائياً؟ لا يمكن التراجع عن هذه العملية.`}
        primaryButton={{
          label: deleting ? "جاري الحذف..." : "حذف نهائياً",
          onClick: handleDeleteConfirm,
          bgColor: "#ef4444",
          disabled: deleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setDeleteTarget(null),
          bgColor: "var(--btn-cancel, #27272a)",
          disabled: deleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />,
        }}
      />
    </div>
  );
}
