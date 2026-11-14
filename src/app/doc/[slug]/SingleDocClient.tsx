"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { SiteDoc } from "@/types/doc";
import { DOC_TYPE_META, ROADMAP_STATUS_META, formatDocDate } from "@/lib/docs";
import styles from "./singleDoc.module.css";
import {
  ArrowRight,
  Clock,
  Sparkles,
  Share2,
  Check,
  ArrowUp,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  List,
} from "lucide-react";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface SingleDocClientProps {
  doc: SiteDoc;
  allDocs: SiteDoc[];
  prevDoc: SiteDoc | null;
  nextDoc: SiteDoc | null;
}

export default function SingleDocClient({
  doc,
  allDocs,
  prevDoc,
  nextDoc,
}: SingleDocClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  const typeMeta = DOC_TYPE_META[doc.doc_type] || DOC_TYPE_META.update;
  const statusMeta =
    ROADMAP_STATUS_META[doc.roadmap_status] || ROADMAP_STATUS_META.released;
  const isRoadmapItem = doc.doc_type === "roadmap";

  // 1. Process content HTML: dynamically extract all h1, h2, h3 and inject matching unique IDs
  const { processedHtml, tocHeadings } = useMemo(() => {
    if (!doc.content) {
      return { processedHtml: "", tocHeadings: [] };
    }

    const headings: TocHeading[] = [];
    let counter = 0;

    // Replace all h1, h2, h3 tags
    const transformed = doc.content.replace(
      /<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi,
      (fullMatch, tag, attrs, innerHtml) => {
        counter++;
        // Clean text: strip any nested HTML tags
        const text = innerHtml.replace(/<[^>]+>/g, "").trim();
        if (!text) return fullMatch;

        const level = parseInt(tag.charAt(1), 10);

        // Check if an id is already in the tag
        const existingIdMatch = attrs.match(/id=["']([^"']+)["']/i);
        const headingId = existingIdMatch
          ? existingIdMatch[1]
          : `section-${counter}`;

        headings.push({
          id: headingId,
          text,
          level,
        });

        if (existingIdMatch) {
          return fullMatch;
        }

        return `<${tag} id="${headingId}"${attrs}>${innerHtml}</${tag}>`;
      }
    );

    return { processedHtml: transformed, tocHeadings: headings };
  }, [doc.content]);

  // 2. Active Section Scroll Spy
  useEffect(() => {
    if (typeof window === "undefined" || tocHeadings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = tocHeadings.length - 1; i >= 0; i--) {
        const item = tocHeadings[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveHeadingId(item.id);
          return;
        }
      }

      if (window.scrollY < 200 && tocHeadings.length > 0) {
        setActiveHeadingId(tocHeadings[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocHeadings]);

  // 3. Smooth scroll jump to heading
  const scrollToHeading = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeadingId(id);
      setMobileTocOpen(false);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${id}`);
      }
    }
  }, []);

  // 4. Initial URL Hash Scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveHeadingId(hash);
        }
      }, 300);
    }
  }, []);

  // 5. Body scroll lock when mobile sidebar is open
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

  // Copy link handler
  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ── Top SubNavBar ── */}
      <nav className={styles.subNavBar}>
        <div className={styles.subNavBarInner}>
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
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{doc.title}</span>
          </div>

          <div className={styles.navActions}>
            <Link href="/doc" className={styles.backBtn} title="العودة لكل التوثيق">
              <ArrowRight size={14} />
              <span className={styles.backBtnText}>كل التوثيق</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              title="مشاركة ورابط التوثيق"
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
      </nav>

      {/* ── Main Layout ── */}
      <div className={styles.mainLayout}>
        {/* ── Left Sidebar (All Docs Navigator) ── */}
        <aside
          className={`${styles.sidebar} ${
            mobileSidebarOpen ? styles.sidebarOpen : ""
          }`}
        >
          {/* Mobile Close Button Header */}
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

          {/* Group 1: Updates */}
          <div className={styles.sidebarGroup}>
            <span className={styles.sidebarGroupTitle}>سجل التحديثات</span>
            <ul className={styles.sidebarList}>
              {allDocs
                .filter((d) => d.doc_type === "update")
                .slice(0, 10)
                .map((item) => {
                  const isActive = item.id === doc.id;
                  const itemUrl = `/doc/${encodeURIComponent(item.slug || item.id)}`;
                  return (
                    <li key={item.id}>
                      <Link
                        href={itemUrl}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`${styles.sidebarLink} ${
                          isActive ? styles.sidebarLinkActive : ""
                        }`}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </span>
                        {item.version && (
                          <span style={{ fontSize: "0.68rem", opacity: 0.6, fontFamily: "monospace" }}>
                            {item.version}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Group 2: Features */}
          <div className={styles.sidebarGroup}>
            <span className={styles.sidebarGroupTitle}>المميزات الجديدة</span>
            <ul className={styles.sidebarList}>
              {allDocs
                .filter((d) => d.doc_type === "feature")
                .slice(0, 10)
                .map((item) => {
                  const isActive = item.id === doc.id;
                  const itemUrl = `/doc/${encodeURIComponent(item.slug || item.id)}`;
                  return (
                    <li key={item.id}>
                      <Link
                        href={itemUrl}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`${styles.sidebarLink} ${
                          isActive ? styles.sidebarLinkActive : ""
                        }`}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Group 3: Roadmap */}
          <div className={styles.sidebarGroup}>
            <span className={styles.sidebarGroupTitle}>خريطة الطريق</span>
            <ul className={styles.sidebarList}>
              {allDocs
                .filter((d) => d.doc_type === "roadmap")
                .slice(0, 10)
                .map((item) => {
                  const isActive = item.id === doc.id;
                  const itemUrl = `/doc/${encodeURIComponent(item.slug || item.id)}`;
                  return (
                    <li key={item.id}>
                      <Link
                        href={itemUrl}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`${styles.sidebarLink} ${
                          isActive ? styles.sidebarLinkActive : ""
                        }`}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className={styles.mobileBackdrop}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Center Article Content ── */}
        <main className={styles.articleContainer}>
          {/* Header */}
          <header className={styles.articleHeader}>
            <div className={styles.badgesRow}>
              {/* Type Badge */}
              <span
                className={styles.typeBadge}
                style={{
                  backgroundColor: typeMeta.bg,
                  color: typeMeta.color,
                  borderColor: typeMeta.border,
                }}
              >
                <i className={`${typeMeta.icon} text-xs`} />
                <span>{typeMeta.label}</span>
              </span>

              {/* Status Badge */}
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

              {/* Version */}
              {doc.version && (
                <span className={styles.versionBadge}>{doc.version}</span>
              )}
            </div>

            <h1 className={styles.articleTitle}>{doc.title}</h1>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <Clock size={13} />
                <span>نُشر في: {formatDocDate(doc.release_date)}</span>
              </div>

              {doc.author_name && (
                <div className={styles.metaItem}>
                  <User size={13} />
                  <span>بواسطة: {doc.author_name}</span>
                </div>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {doc.cover_image && (
            <div className={styles.coverWrapper}>
              <img
                src={doc.cover_image}
                alt={doc.title}
                className={styles.coverImage}
              />
            </div>
          )}

          {/* Lead Summary */}
          {doc.summary && (
            <div className={styles.summaryBox}>
              <p>{doc.summary}</p>
            </div>
          )}

          {/* ── Mobile & Tablet In-Page Quick TOC Accordion ── */}
          {tocHeadings.length > 0 && (
            <div className={styles.mobileTocWrapper}>
              <button
                type="button"
                onClick={() => setMobileTocOpen((prev) => !prev)}
                className={styles.mobileTocToggleBtn}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <List size={14} style={{ color: "#60a5fa" }} />
                  <span>في هذه الصفحة ({tocHeadings.length} أقسام)</span>
                </div>
                {mobileTocOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {mobileTocOpen && (
                <div className={styles.mobileTocMenu}>
                  {tocHeadings.map((heading) => (
                    <button
                      key={heading.id}
                      type="button"
                      onClick={(e) => scrollToHeading(heading.id, e)}
                      className={`${styles.tocLink} ${
                        activeHeadingId === heading.id ? styles.tocLinkActive : ""
                      } ${
                        heading.level === 1
                          ? styles.tocLinkLevel1
                          : heading.level === 2
                          ? styles.tocLinkLevel2
                          : styles.tocLinkLevel3
                      }`}
                    >
                      {heading.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roadmap Progress Bar */}
          {isRoadmapItem && (
            <div className={styles.progressBox}>
              <div className={styles.progressInfo}>
                <span style={{ color: "#a1a1aa" }}>مرحلة ونسبة الإنجاز:</span>
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

          {/* Highlights Checklist */}
          {Array.isArray(doc.highlights) && doc.highlights.length > 0 && (
            <div id="highlights" className={styles.highlightsBox}>
              <div className={styles.highlightsTitle}>
                <Sparkles size={15} style={{ color: "#60a5fa" }} />
                <span>أبرز المميزات والتفاصيل:</span>
              </div>
              <ul className={styles.highlightsList}>
                {doc.highlights.map((h, i) => (
                  <li key={i} className={styles.highlightItem}>
                    <span className={styles.checkCircle}>✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Rich HTML Content with Injected Heading IDs */}
          {processedHtml && (
            <div
              id="content"
              className={styles.proseBody}
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          )}

          {/* Tags */}
          {Array.isArray(doc.tags) && doc.tags.length > 0 && (
            <div id="tags" className={styles.tagsBox}>
              <span style={{ fontSize: "0.75rem", color: "#71717a", marginLeft: "0.4rem" }}>
                الوسوم:
              </span>
              {doc.tags.map((tag, idx) => (
                <span key={idx} className={styles.tagPill}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Next & Previous Pagination */}
          <nav className={styles.paginationNav}>
            {prevDoc ? (
              <Link
                href={`/doc/${encodeURIComponent(prevDoc.slug || prevDoc.id)}`}
                className={styles.paginationCard}
              >
                <span className={styles.paginationLabel}>
                  <ChevronRight size={12} style={{ display: "inline" }} /> التوثيق السابق
                </span>
                <strong className={styles.paginationTitle}>{prevDoc.title}</strong>
              </Link>
            ) : (
              <div />
            )}

            {nextDoc && (
              <Link
                href={`/doc/${encodeURIComponent(nextDoc.slug || nextDoc.id)}`}
                className={styles.paginationCard}
                style={{ textAlign: "left" }}
              >
                <span className={styles.paginationLabel}>
                  التالي <ChevronLeft size={12} style={{ display: "inline" }} />
                </span>
                <strong className={styles.paginationTitle}>{nextDoc.title}</strong>
              </Link>
            )}
          </nav>
        </main>

        {/* ── Right TOC Sidebar (Desktop XL) ── */}
        <aside className={styles.tocSidebar}>
          <div className={styles.tocInner}>
            <span className={styles.tocTitle}>في هذه الصفحة</span>
            <ul className={styles.tocList}>
              {tocHeadings.length > 0 ? (
                // 1. Dynamic list extracted from user's h1, h2, h3 headings in content
                tocHeadings.map((heading) => {
                  const isActive = activeHeadingId === heading.id;
                  return (
                    <li key={heading.id}>
                      <button
                        type="button"
                        onClick={(e) => scrollToHeading(heading.id, e)}
                        className={`${styles.tocLink} ${
                          isActive ? styles.tocLinkActive : ""
                        } ${
                          heading.level === 1
                            ? styles.tocLinkLevel1
                            : heading.level === 2
                            ? styles.tocLinkLevel2
                            : styles.tocLinkLevel3
                        }`}
                        title={heading.text}
                      >
                        {heading.text}
                      </button>
                    </li>
                  );
                })
              ) : (
                // 2. Default fallback if no headings are typed inside content
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className={`${styles.tocLink} ${styles.tocLinkActive}`}
                    >
                      نظرة عامة
                    </button>
                  </li>
                  {Array.isArray(doc.highlights) && doc.highlights.length > 0 && (
                    <li>
                      <button
                        type="button"
                        onClick={(e) => scrollToHeading("highlights", e)}
                        className={styles.tocLink}
                      >
                        أبرز المميزات
                      </button>
                    </li>
                  )}
                  {doc.content && (
                    <li>
                      <button
                        type="button"
                        onClick={(e) => scrollToHeading("content", e)}
                        className={styles.tocLink}
                      >
                        التفاصيل والشرح
                      </button>
                    </li>
                  )}
                </>
              )}
            </ul>

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
    </div>
  );
}
