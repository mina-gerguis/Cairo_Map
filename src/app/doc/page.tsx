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
import DocHero from "@/app/doc/components/DocHero";
import styles from "./doc.module.css";
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  RefreshCw,
  ExternalLink,
  Command,
  X,
  ArrowUp,
  BookOpen,
  Compass,
  Zap,
  Settings,
  Menu,
} from "lucide-react";
import { IconPinFilled } from "@tabler/icons-react";

export default function DocPublicPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);

  const [docs, setDocs] = useState<SiteDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<"all" | DocType>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | DocRoadmapStatus>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

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

  // Body scroll lock when mobile sidebar or command menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileSidebarOpen || commandMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen, commandMenuOpen]);

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

  const scrollToDocsExplorer = useCallback(() => {
    document.body.style.overflow = "";
    setTimeout(() => {
      const el = document.getElementById("docs-explorer");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {/* ── Hero Section ── */}
      <DocHero
        counts={counts}
        onSearchClick={() => setCommandMenuOpen(true)}
        onFilterClick={(type) => {
          setSelectedType(type);
          setSelectedStatus("all");
          setSelectedTag(null);
          scrollToDocsExplorer();
        }}
        isAdmin={isAdmin}
        onRefresh={fetchDocs}
        loading={loading}
        onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* ── Main Layout Container (Sidebar + Center Content + TOC) ── */}
      <div className={styles.mainLayout} id="docs-explorer">
        {/* ── 1. Left Navigation Sidebar ── */}
        <aside
          className={`${styles.sidebar} ${mobileSidebarOpen ? styles.sidebarOpen : ""
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
              className="btn-close"
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
                    scrollToDocsExplorer();
                  }}
                  className={`${styles.sidebarItemBtn} ${selectedType === "all" && selectedStatus === "all" && !selectedTag
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
                    scrollToDocsExplorer();
                  }}
                  className={`${styles.sidebarItemBtn} ${selectedType === "update" ? styles.sidebarItemBtnActive : ""
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
                    scrollToDocsExplorer();
                  }}
                  className={`${styles.sidebarItemBtn} ${selectedType === "feature" ? styles.sidebarItemBtnActive : ""
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
                    scrollToDocsExplorer();
                  }}
                  className={`${styles.sidebarItemBtn} ${selectedType === "roadmap" ? styles.sidebarItemBtnActive : ""
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
                        scrollToDocsExplorer();
                      }}
                      className={`${styles.sidebarItemBtn} ${isActive ? styles.sidebarItemBtnActive : ""
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
                      scrollToDocsExplorer();
                    }}
                    className={`${styles.tagChip} ${isActive ? styles.tagChipActive : ""
                      }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
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
            {selectedTag && (
              <div className={styles.toolbar}>
                <div className={styles.toolbarActions}>
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
                </div>
              </div>
            )}

          </div>

          {/* ── Toolbar: Search & View Mode Switcher ── */}

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
                className="btn btn-blue"
                style={{ margin: "0.85rem auto 0" }}
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            /* ── CARDS GRID ── */
            <div className={styles.cardsGrid}>
              {filteredDocs.map((doc) => {
                const typeMeta = DOC_TYPE_META[doc.doc_type] || DOC_TYPE_META.update;
                const statusMeta =
                  ROADMAP_STATUS_META[doc.roadmap_status] ||
                  ROADMAP_STATUS_META.released;
                const anchorId = doc.slug || doc.id;
                const docUrl = `/doc/${encodeURIComponent(anchorId)}`;
                const isRoadmapItem = doc.doc_type === "roadmap";

                return (
                  <article
                    key={doc.id}
                    id={anchorId}
                    onClick={() => router.push(docUrl)}
                    className={`${styles.docCard} ${doc.is_pinned ? styles.docCardPinned : ""
                      }`}
                  >
                    <div>
                      {/* Top Badges Row */}
                      <div className={styles.docCardHeader}>
                        <div className={styles.badgesGroup}>
                          <span
                            className={styles.typeBadge}
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
                              <IconPinFilled size={18} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title linked to single page */}
                      <h3 className={styles.cardTitle}>
                        <Link href={docUrl}>{doc.title}</Link>
                      </h3>
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
                        className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ""
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
                className="btn-close"
                aria-label="إغلاق البحث"
              >
                <span className={styles.commandEscText}>ESC</span>
                <X size={15} className={styles.commandCloseIcon} />
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
          </div>
        </div>
      )}
    </div>
  );
}
