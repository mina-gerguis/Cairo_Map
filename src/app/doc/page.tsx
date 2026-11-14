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
  formatDocDate,
  stripHtmlToText,
  SUGGESTED_DOC_TAGS,
} from "@/lib/docs";
import DocHero from "@/components/doc/DocHero";
import styles from "./doc.module.css";
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Check,
  RefreshCw,
  ExternalLink,
  Command,
  X,
  LayoutGrid,
  ListFilter,
  ArrowUp,
  BookOpen,
  Compass,
  Zap,
  Settings,
  Menu,
  ArrowLeft,
} from "lucide-react";

export default function DocPublicPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);

  const [docs, setDocs] = useState<SiteDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & view modes
  const [selectedType, setSelectedType] = useState<"all" | DocType>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | DocRoadmapStatus>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Global Command Menu (⌘K) modal
  const [commandMenuOpen, setCommandMenuOpen] = useState<boolean>(false);
  const [activeArticleId, setActiveArticleId] = useState<string>("");

  // Fetch docs from Supabase
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (!supabase) {
        setDocs([]);
        return;
      }

      const { data, error } = await supabase
        .from("site_docs")
        .select("*")
        .eq("is_published", true)
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
          setDocs([]);
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setDocs((data as SiteDoc[]) || []);
      }
    } catch (err: any) {
      console.error("Error fetching docs:", err);
      setErrorMsg(err.message || "فشل الاتصال بقاعدة البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandMenuOpen(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // Track active section for table of contents
  useEffect(() => {
    if (typeof window === "undefined" || docs.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const doc of docs) {
        const anchor = doc.slug || doc.id;
        const el = document.getElementById(anchor);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveArticleId(doc.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [docs]);

  // Copy direct link to clipboard
  const handleCopyLink = async (doc: SiteDoc, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof window === "undefined") return;
    const path = `/doc/${encodeURIComponent(doc.slug || doc.id)}`;
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(doc.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  // Navigate to single doc page
  const navigateToDoc = (doc: SiteDoc) => {
    setCommandMenuOpen(false);
    setMobileSidebarOpen(false);
    router.push(`/doc/${encodeURIComponent(doc.slug || doc.id)}`);
  };

  // Counts for summary metrics
  const counts = useMemo(() => {
    const total = docs.length;
    const updates = docs.filter((d) => d.doc_type === "update").length;
    const features = docs.filter((d) => d.doc_type === "feature").length;
    const roadmap = docs.filter((d) => d.doc_type === "roadmap").length;
    const inProgress = docs.filter(
      (d) => d.roadmap_status === "in_progress" || d.roadmap_status === "testing"
    ).length;
    return { total, updates, features, roadmap, inProgress };
  }, [docs]);

  // Filtered docs list
  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      if (selectedType !== "all" && doc.doc_type !== selectedType) {
        return false;
      }
      if (selectedStatus !== "all" && doc.roadmap_status !== selectedStatus) {
        return false;
      }
      if (selectedTag && !(doc.tags || []).includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const inTitle = doc.title.toLowerCase().includes(query);
        const inSummary = (doc.summary || "").toLowerCase().includes(query);
        const inVersion = (doc.version || "").toLowerCase().includes(query);
        const inTags = (doc.tags || []).some((t) => t.toLowerCase().includes(query));
        const inHighlights = (doc.highlights || []).some((h) =>
          h.toLowerCase().includes(query)
        );
        const inContent = stripHtmlToText(doc.content).toLowerCase().includes(query);
        if (!inTitle && !inSummary && !inVersion && !inTags && !inHighlights && !inContent) {
          return false;
        }
      }
      return true;
    });
  }, [docs, selectedType, selectedStatus, selectedTag, searchQuery]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => {
      (d.tags || []).forEach((t) => set.add(t));
    });
    SUGGESTED_DOC_TAGS.forEach((t) => set.add(t));
    return Array.from(set);
  }, [docs]);

  // Command Menu search items
  const commandSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return docs.slice(0, 8);
    const q = searchQuery.trim().toLowerCase();
    return docs
      .filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.summary || "").toLowerCase().includes(q) ||
          (d.version || "").toLowerCase().includes(q) ||
          (d.tags || []).some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [docs, searchQuery]);

  return (
    <div className={styles.pageWrapper}>
      {/* ── Neo-Brutalist High-Energy Hero Section ── */}
      <DocHero
        counts={counts}
        onSearchClick={() => setCommandMenuOpen(true)}
        onFilterClick={(type) => {
          setSelectedType(type);
          setSelectedStatus("all");
          setSelectedTag(null);
        }}
      />

      {/* ── Top Vercel Sub-Header / Breadcrumb Navigation Bar ── */}
      <nav className={styles.subNavBar} id="docs-explorer">
        <div className={styles.subNavBarInner}>
          {/* Breadcrumb & Mobile Menu Toggle */}
          <div className={styles.breadcrumbNav}>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className={styles.mobileMenuToggle}
              aria-label="فتح قائمة التوثيق"
            >
              <Menu size={16} />
            </button>

            <Link href="/" className={styles.breadcrumbLink}>
              <span>قريب</span>
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <Link href="/doc" className={styles.breadcrumbLink}>
              التوثيق
            </Link>
            {selectedType !== "all" && (
              <>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>
                  {DOC_TYPE_META[selectedType]?.shortLabel || selectedType}
                </span>
              </>
            )}
          </div>

          {/* Quick Search Trigger & Header Action Buttons */}
          <div className={styles.navActions}>
            {/* Search Docs Button (⌘K) */}
            <button
              type="button"
              onClick={() => setCommandMenuOpen(true)}
              className={styles.searchTriggerBtn}
              title="بحث سريع (⌘K)"
            >
              <div className={styles.searchTriggerInner}>
                <Search size={14} />
                <span className={styles.searchTriggerText}>بحث في التوثيق...</span>
              </div>
              <kbd className={styles.searchKbdBadge}>
                <Command size={10} />
                <span>K</span>
              </kbd>
            </button>

            {/* Admin Link if Admin */}
            {isAdmin && (
              <Link href="/admin/doc" className={styles.adminBtn} title="إدارة التوثيق">
                <Settings size={14} />
                <span>إدارة التوثيق</span>
              </Link>
            )}

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchDocs}
              disabled={loading}
              title="تحديث المحتوى"
              className={styles.actionIconBtn}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Layout Container (Sidebar + Center Content + TOC) ── */}
      <div className={styles.mainLayout}>
        {/* ── 1. Left Navigation Sidebar ── */}
        <aside
          className={`${styles.sidebar} ${
            mobileSidebarOpen ? styles.sidebarOpen : ""
          }`}
        >
          {/* Mobile Close Button */}
          <div className={styles.sidebarMobileHeader}>
            <span className={styles.sidebarGroupTitle} style={{ margin: 0 }}>
              فهرس التوثيق
            </span>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className={styles.sidebarCloseBtn}
              aria-label="إغلاق القائمة"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Group 1: General Sections */}
          <div className={styles.sidebarGroup}>
            <span className={styles.sidebarGroupTitle}>نظرة عامة</span>
            <ul className={styles.sidebarList}>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("all");
                    setSelectedStatus("all");
                    setSelectedTag(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`${styles.sidebarItemBtn} ${
                    selectedType === "all" && selectedStatus === "all" && !selectedTag
                      ? styles.sidebarItemBtnActive
                      : ""
                  }`}
                >
                  <div className={styles.sidebarItemLabel}>
                    <BookOpen size={15} />
                    <span>جميع التوثيقات</span>
                  </div>
                  <span className={styles.sidebarItemCount}>{counts.total}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("update");
                    setMobileSidebarOpen(false);
                  }}
                  className={`${styles.sidebarItemBtn} ${
                    selectedType === "update" ? styles.sidebarItemBtnActive : ""
                  }`}
                >
                  <div className={styles.sidebarItemLabel}>
                    <Clock size={15} />
                    <span>سجل التحديثات</span>
                  </div>
                  <span className={styles.sidebarItemCount}>{counts.updates}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("feature");
                    setMobileSidebarOpen(false);
                  }}
                  className={`${styles.sidebarItemBtn} ${
                    selectedType === "feature" ? styles.sidebarItemBtnActive : ""
                  }`}
                >
                  <div className={styles.sidebarItemLabel}>
                    <Zap size={15} />
                    <span>المميزات الجديدة</span>
                  </div>
                  <span className={styles.sidebarItemCount}>{counts.features}</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("roadmap");
                    setMobileSidebarOpen(false);
                  }}
                  className={`${styles.sidebarItemBtn} ${
                    selectedType === "roadmap" ? styles.sidebarItemBtnActive : ""
                  }`}
                >
                  <div className={styles.sidebarItemLabel}>
                    <Compass size={15} />
                    <span>خريطة الطريق</span>
                  </div>
                  <span className={styles.sidebarItemCount}>{counts.roadmap}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Group 2: Statuses */}
          <div className={styles.sidebarGroup}>
            <span className={styles.sidebarGroupTitle}>حالة التنفيذ</span>
            <ul className={styles.sidebarList}>
              {(
                [
                  { id: "released", label: "تم الإطلاق", icon: CheckCircle2 },
                  { id: "in_progress", label: "قيد التطوير", icon: RefreshCw },
                  { id: "testing", label: "مرحلة التجربة", icon: Sparkles },
                  { id: "planned", label: "مخطط لها", icon: Clock },
                ] as const
              ).map((st) => {
                const Icon = st.icon;
                const isActive = selectedStatus === st.id;
                return (
                  <li key={st.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatus(isActive ? "all" : st.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`${styles.sidebarItemBtn} ${
                        isActive ? styles.sidebarItemBtnActive : ""
                      }`}
                    >
                      <div className={styles.sidebarItemLabel}>
                        <Icon size={14} />
                        <span>{st.label}</span>
                      </div>
                      {isActive && <Check size={14} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Nav Group 3: Popular Tags */}
          <div className={styles.sidebarGroup}>
            <span className={styles.sidebarGroupTitle}>الموضوعات الشائعة</span>
            <div className={styles.tagsCloud}>
              {allTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSelectedTag(isActive ? null : tag);
                      setMobileSidebarOpen(false);
                    }}
                    className={`${styles.tagChip} ${
                      isActive ? styles.tagChipActive : ""
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Admin Footer */}
          {isAdmin && (
            <div
              className={styles.sidebarGroup}
              style={{
                paddingTop: "0.85rem",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Link href="/admin/doc" className={styles.sidebarItemBtn}>
                <div className={styles.sidebarItemLabel}>
                  <Settings size={15} />
                  <span>لوحة تحكم التوثيق</span>
                </div>
                <ExternalLink size={13} />
              </Link>
            </div>
          )}
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className={styles.mobileBackdrop}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── 2. Center Content Area ── */}
        <main className={styles.centerContent}>
          {/* ── Explorer Section Header ── */}
          <div className={styles.heroSection}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgePulse} />
              <span>مستكشف التوثيقات</span>
              <span>•</span>
              <span>الإصدار 2.4.0</span>
            </div>

            <h2 className={styles.heroTitle} style={{ fontSize: "1.75rem" }}>
              {selectedType === "all"
                ? "جميع التوثيقات وسجل التحديثات"
                : DOC_TYPE_META[selectedType]?.label || "التوثيق"}
            </h2>

            <p className={styles.heroSubtitle}>
              {selectedType === "update"
                ? "تصفح سجل التحديثات الدورية وتفاصيل الإصدارات السابقة والحالية."
                : selectedType === "feature"
                ? "تعرف على الأدوات والمميزات الجديدة التي تمت إضافتها للمنصة."
                : selectedType === "roadmap"
                ? "تابع خطط التطوير والمشاريع الجاري العمل عليها والخطط المستقبلية."
                : "دليل شامل وموثق لجميع التحديثات المستمرة، الأدوات والميزات التي أُطلقت حديثاً، والخطط الجارية لتطوير خدمات النقل والخرائط."}
            </p>
          </div>

          {/* ── Toolbar: Search & View Mode Switcher ── */}
          <div className={styles.toolbar}>
            <div className={styles.searchInputWrapper}>
              <input
                type="text"
                placeholder="ابحث في التحديثات، المميزات، أو الإصدارات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <Search className={styles.searchIcon} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={styles.searchClearBtn}
                  aria-label="مسح البحث"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.toolbarActions}>
              {selectedTag && (
                <div
                  className={styles.tagChipActive}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.3rem 0.6rem",
                  }}
                >
                  <span>#{selectedTag}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      display: "inline-flex",
                    }}
                    aria-label="إزالة الوسم"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* View Mode Switcher */}
              <div className={styles.viewModeSwitcher}>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`${styles.viewModeBtn} ${
                    viewMode === "grid" ? styles.viewModeBtnActive : ""
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>بطاقات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={`${styles.viewModeBtn} ${
                    viewMode === "timeline" ? styles.viewModeBtnActive : ""
                  }`}
                >
                  <ListFilter size={14} />
                  <span>خط زمني</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Content Presentation ── */}
          {loading ? (
            <div className={styles.emptyStateBox}>
              <p>جاري تحميل سجل التوثيق...</p>
            </div>
          ) : errorMsg ? (
            <div className={styles.errorStateBox}>
              <h3>تعذر تحميل سجل التوثيق</h3>
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={fetchDocs}
                className={styles.adminBtn}
                style={{ marginTop: "1rem" }}
              >
                إعادة المحاولة
              </button>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <BookOpen size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
              <h3 style={{ fontSize: "1rem" }}>لا توجد نتائج مطابقة لبحثك</h3>
              <p style={{ marginTop: "0.4rem", fontSize: "0.8rem" }}>
                جرّب إزالة الفلاتر أو استخدام كلمات بحث أخرى.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("all");
                  setSelectedStatus("all");
                  setSelectedTag(null);
                  setSearchQuery("");
                }}
                className={styles.searchTriggerBtn}
                style={{ margin: "0.85rem auto 0" }}
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* ── VIEW 1: VERCEL SIGNATURE CARDS GRID ── */
            <div className={styles.cardsGrid}>
              {filteredDocs.map((doc) => {
                const typeMeta = DOC_TYPE_META[doc.doc_type] || DOC_TYPE_META.update;
                const statusMeta =
                  ROADMAP_STATUS_META[doc.roadmap_status] ||
                  ROADMAP_STATUS_META.released;
                const anchorId = doc.slug || doc.id;
                const docUrl = `/doc/${encodeURIComponent(anchorId)}`;
                const isCopied = copiedId === doc.id;
                const isRoadmapItem = doc.doc_type === "roadmap";

                return (
                  <article
                    key={doc.id}
                    id={anchorId}
                    className={`${styles.docCard} ${
                      doc.is_pinned ? styles.docCardPinned : ""
                    }`}
                  >
                    <div>
                      {/* Top Badges Row */}
                      <div className={styles.docCardHeader}>
                        <div className={styles.badgesGroup}>
                          <span
                            className={styles.typeBadge}
                            style={{
                              backgroundColor: typeMeta.bg,
                              color: typeMeta.color,
                              borderColor: typeMeta.border,
                            }}
                          >
                            <i className={`${typeMeta.icon} text-xs`} />
                            <span>{typeMeta.shortLabel}</span>
                          </span>

                          {doc.version && (
                            <span className={styles.versionBadge}>
                              {doc.version}
                            </span>
                          )}

                          {doc.is_pinned && (
                            <span className={styles.pinnedMarker}>
                              مثبت
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(doc, e)}
                          title="نسخ رابط مباشر"
                          className={styles.actionIconBtn}
                        >
                          {isCopied ? (
                            <Check size={14} style={{ color: "#10b981" }} />
                          ) : (
                            <Share2 size={14} />
                          )}
                        </button>
                      </div>

                      {/* Optional Cover Image */}
                      {doc.cover_image && (
                        <Link href={docUrl} className={styles.coverWrapper} style={{ display: "block" }}>
                          <img
                            src={doc.cover_image}
                            alt={doc.title}
                            className={styles.coverImage}
                            loading="lazy"
                          />
                        </Link>
                      )}

                      {/* Title linked to single page */}
                      <h3 className={styles.cardTitle}>
                        <Link href={docUrl}>{doc.title}</Link>
                      </h3>

                      {/* Summary */}
                      {doc.summary && (
                        <p className={styles.cardSummary}>{doc.summary}</p>
                      )}

                      {/* Roadmap Progress Bar */}
                      {isRoadmapItem && (
                        <div className={styles.progressBox}>
                          <div className={styles.progressInfo}>
                            <span>مرحلة الإنجاز:</span>
                            <span style={{ color: "#10b981", fontWeight: "bold" }}>
                              {doc.progress_percent}%
                            </span>
                          </div>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressBar}
                              style={{
                                width: `${Math.max(5, Math.min(100, doc.progress_percent))}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Highlights */}
                      {Array.isArray(doc.highlights) && doc.highlights.length > 0 && (
                        <div className={styles.highlightsWrapper}>
                          {doc.highlights.slice(0, 3).map((h, i) => (
                            <div key={i} className={styles.highlightRow}>
                              <span className={styles.highlightCheckIcon}>✓</span>
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Link to Full Doc Page */}
                      <div style={{ paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <Link
                          href={docUrl}
                          className={styles.expandToggleBtn}
                        >
                          <span>فتح التوثيق في صفحة مستقلة</span>
                          <ArrowLeft size={13} />
                        </Link>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.cardFooter}>
                      <div className={styles.dateRow}>
                        <Clock size={12} />
                        <span>{formatDocDate(doc.release_date)}</span>
                      </div>

                      <div className={styles.tagsMiniRow}>
                        {(doc.tags || []).slice(0, 2).map((t, idx) => (
                          <span key={idx}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ── VIEW 2: VERCEL CHANGELOG TIMELINE FEED ── */
            <div className={styles.timelineFeed}>
              {filteredDocs.map((doc) => {
                const typeMeta = DOC_TYPE_META[doc.doc_type] || DOC_TYPE_META.update;
                const statusMeta =
                  ROADMAP_STATUS_META[doc.roadmap_status] ||
                  ROADMAP_STATUS_META.released;
                const anchorId = doc.slug || doc.id;
                const docUrl = `/doc/${encodeURIComponent(anchorId)}`;
                const isCopied = copiedId === doc.id;

                return (
                  <article
                    key={doc.id}
                    id={anchorId}
                    className={styles.timelineArticle}
                  >
                    {/* Node Dot */}
                    <div className={styles.timelineNode}>
                      <div className={styles.timelineNodeDot} />
                    </div>

                    {/* Timeline Article Header */}
                    <div className={styles.docCardHeader}>
                      <div className={styles.badgesGroup}>
                        <span
                          className={styles.typeBadge}
                          style={{
                            backgroundColor: typeMeta.bg,
                            color: typeMeta.color,
                            borderColor: typeMeta.border,
                          }}
                        >
                          <i className={`${typeMeta.icon} text-xs`} />
                          <span>{typeMeta.shortLabel}</span>
                        </span>

                        <span
                          className={styles.typeBadge}
                          style={{
                            backgroundColor: statusMeta.bg,
                            color: statusMeta.color,
                            borderColor: statusMeta.border,
                          }}
                        >
                          <span>{statusMeta.label}</span>
                        </span>

                        {doc.version && (
                          <span className={styles.versionBadge}>
                            {doc.version}
                          </span>
                        )}
                      </div>

                      <div className={styles.navActions}>
                        <div className={styles.dateRow} style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
                          <Clock size={13} />
                          <span>{formatDocDate(doc.release_date)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(doc, e)}
                          className={styles.actionIconBtn}
                        >
                          {isCopied ? (
                            <Check size={14} style={{ color: "#10b981" }} />
                          ) : (
                            <Share2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className={styles.cardTitle} style={{ fontSize: "1.2rem", marginBottom: "0.6rem" }}>
                      <Link href={docUrl}>{doc.title}</Link>
                    </h2>

                    {/* Summary */}
                    {doc.summary && (
                      <p className={styles.cardSummary} style={{ WebkitLineClamp: "unset" }}>
                        {doc.summary}
                      </p>
                    )}

                    {/* Highlights */}
                    {Array.isArray(doc.highlights) && doc.highlights.length > 0 && (
                      <div className={styles.progressBox} style={{ margin: "0.85rem 0" }}>
                        <span className={styles.sidebarGroupTitle} style={{ padding: 0 }}>
                          أبرز ما يتضمنه هذا التحديث:
                        </span>
                        <div className={styles.highlightsWrapper} style={{ marginTop: "0.45rem" }}>
                          {doc.highlights.map((point, pIdx) => (
                            <div key={pIdx} className={styles.highlightRow}>
                              <span className={styles.highlightCheckIcon}>✓</span>
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Open in Dedicated Page Link */}
                    <div style={{ paddingTop: "0.65rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <Link
                        href={docUrl}
                        className={styles.expandToggleBtn}
                      >
                        <span>فتح المقال والتفاصيل الكاملة في صفحة مستقلة</span>
                        <ArrowLeft size={13} />
                      </Link>
                    </div>

                    {/* Footer */}
                    <div className={styles.cardFooter}>
                      <div className={styles.tagsMiniRow}>
                        {(doc.tags || []).map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedTag(t)}
                            className={styles.tagChip}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>

                      {doc.author_name && (
                        <span>بواسطة: {doc.author_name}</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* ── 3. Right Sticky "On This Page" TOC ── */}
        <aside className={styles.tocSidebar}>
          <div className={styles.tocInner}>
            <span className={styles.tocTitle}>في هذه الصفحة</span>
            {filteredDocs.length === 0 ? (
              <span style={{ color: "#71717a", fontSize: "0.75rem" }}>لا توجد عناصر</span>
            ) : (
              <ul className={styles.tocList}>
                {filteredDocs.slice(0, 15).map((doc) => {
                  const isActive = activeArticleId === doc.id;
                  const docUrl = `/doc/${encodeURIComponent(doc.slug || doc.id)}`;
                  return (
                    <li key={doc.id}>
                      <Link
                        href={docUrl}
                        className={`${styles.tocLink} ${
                          isActive ? styles.tocLinkActive : ""
                        }`}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={styles.backToTopBtn}
            >
              <ArrowUp size={14} />
              <span>العودة للأعلى</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ── 4. Global Command Palette Modal (⌘K) ── */}
      {commandMenuOpen && (
        <div
          className={styles.commandBackdrop}
          onClick={() => setCommandMenuOpen(false)}
        >
          <div
            className={styles.commandBox}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className={styles.commandInputBar}>
              <Search size={18} style={{ color: "#71717a", marginLeft: "0.65rem", flexShrink: 0 }} />
              <input
                type="text"
                autoFocus
                placeholder="ما الذي تبحث عنه في التوثيق؟..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.commandInput}
              />
              <button
                type="button"
                onClick={() => setCommandMenuOpen(false)}
                className={styles.commandEscBadge}
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className={styles.commandResultsList}>
              <div className={styles.commandGroupTitle}>
                {searchQuery ? "نتائج البحث" : "مقترحات سريعة"}
              </div>

              {commandSearchResults.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#71717a", fontSize: "0.8rem" }}>
                  لم يتم العثور على أي نتيجة مطابقة لـ "{searchQuery}"
                </div>
              ) : (
                commandSearchResults.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => navigateToDoc(doc)}
                    className={styles.commandItem}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
                      <div className={styles.commandItemIconBox}>
                        {doc.doc_type === "feature" ? (
                          <Zap size={15} style={{ color: "#34d399" }} />
                        ) : doc.doc_type === "roadmap" ? (
                          <Compass size={15} style={{ color: "#fbbf24" }} />
                        ) : (
                          <Clock size={15} style={{ color: "#60a5fa" }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0, textAlign: "right" }}>
                        <div className={styles.commandItemTitle}>{doc.title}</div>
                        {doc.summary && (
                          <div className={styles.commandItemSubtitle}>
                            {doc.summary}
                          </div>
                        )}
                      </div>
                    </div>

                    {doc.version && (
                      <span className={styles.versionBadge}>{doc.version}</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={styles.commandFooter}>
              <span>اضغط على أي نتيجة لفتح صفحة التوثيق الخاصة بها</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>إغلاق</span>
                <span className={styles.commandEscBadge}>ESC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
