"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { DocRoadmapStatus, DocType, SiteDoc } from "@/types/doc";
import {
  DOC_TYPE_META,
  ROADMAP_STATUS_META,
  formatDocDate,
  stripHtmlToText,
} from "@/lib/docs";
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  Flame,
  ShieldCheck,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function DocPublicPage() {
  const { profile } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);

  const [docs, setDocs] = useState<SiteDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & search
  const [selectedType, setSelectedType] = useState<"all" | DocType>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | DocRoadmapStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Expanded items state for viewing full content inline
  const [expandedDocIds, setExpandedDocIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        // Table might not exist yet before admin runs schema SQL
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

  // Handle URL hash anchor (e.g. #slug) to auto-expand targeted doc
  useEffect(() => {
    if (typeof window === "undefined" || docs.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const match = docs.find((d) => d.slug === hash || d.id === hash);
      if (match) {
        setExpandedDocIds((prev) => ({ ...prev, [match.id]: true }));
        const el = document.getElementById(match.slug || match.id);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);
        }
      }
    }
  }, [docs]);

  // Toggle inline content expansion
  const toggleExpand = (id: string) => {
    setExpandedDocIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy direct anchor link to clipboard
  const handleCopyLink = async (doc: SiteDoc, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const anchor = doc.slug || doc.id;
    const url = `${window.location.origin}/doc#${encodeURIComponent(anchor)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(doc.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
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
      // Type filter
      if (selectedType !== "all" && doc.doc_type !== selectedType) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && doc.roadmap_status !== selectedStatus) {
        return false;
      }

      // Search term
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
  }, [docs, selectedType, selectedStatus, searchQuery]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-surface text-primary pb-24 pt-4 transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-fg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── 1. Hero Header Banner ── */}
        <header
          className="mb-8 p-6 sm:p-8 rounded-3xl border border-glass backdrop-blur-md transition-all duration-300 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--cardGlassBg) 0%, var(--bg-secondary) 100%)",
            borderColor: "var(--border-glass)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Subtle Ambient Accent Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-glass"
                style={{
                  backgroundColor: "rgba(39, 39, 255, 0.12)",
                  color: "var(--color-primary)",
                  borderColor: "rgba(39, 39, 255, 0.25)",
                }}
              >
                <i className="bx bx-book-bookmark text-base" />
                <span>مركز التوثيق والتحديثات الرسمية</span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                  }}
                >
                  LIVE
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{
                  color: "var(--color-fg)",
                  fontFamily: "var(--font-heading)",
                  lineHeight: 1.25,
                }}
              >
                سجل التحديثات والمميزات وخريطة الطريق
              </h1>

              {/* Subtitle */}
              <p
                className="text-sm sm:text-base leading-relaxed mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                تابع كل ما هو جديد في منصة <strong>قريب</strong>: تاريخ الإصدارات،
                الميزات المضافة حديثاً، والخطط التي نعمل عليها لتطوير خدمات النقل
                والخرائط والأماكن في مصر.
              </p>
            </div>

            {/* Admin Quick Action Button & Refresh */}
            <div className="flex items-center flex-wrap gap-2.5">
              {isAdmin && (
                <Link
                  href="/admin/doc"
                  className="btn btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all hover-lift"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    borderColor: "var(--color-primary)",
                  }}
                >
                  <i className="bx bx-cog text-base" />
                  <span>إدارة التوثيق في لوحة التحكم</span>
                </Link>
              )}

              <button
                type="button"
                onClick={fetchDocs}
                disabled={loading}
                className="inline-flex items-center justify-center p-2.5 rounded-xl border border-glass cursor-pointer transition-all hover-lift"
                style={{
                  backgroundColor: "var(--cardGlassBg)",
                  borderColor: "var(--border-glass)",
                  color: "var(--text-secondary)",
                }}
                title="تحديث البيانات"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin text-brand" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Metric Stats Strip */}
          <div
            className="mt-6 pt-5 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-start"
            style={{ borderColor: "var(--border-glass)" }}
          >
            <div className="p-3 rounded-2xl bg-subtle">
              <span
                className="block text-xs font-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                إجمالي التوثيقات
              </span>
              <strong
                className="text-xl sm:text-2xl font-extrabold"
                style={{
                  color: "var(--color-fg)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {counts.total}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-subtle">
              <span
                className="block text-xs font-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                تاريخ التحديثات
              </span>
              <strong
                className="text-xl sm:text-2xl font-extrabold"
                style={{
                  color: "var(--color-info)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {counts.updates}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-subtle">
              <span
                className="block text-xs font-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                مميزات تم إطلاقها
              </span>
              <strong
                className="text-xl sm:text-2xl font-extrabold"
                style={{
                  color: "var(--color-success)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {counts.features}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-subtle">
              <span
                className="block text-xs font-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                خطط قيد العمل والتنفيذ
              </span>
              <strong
                className="text-xl sm:text-2xl font-extrabold"
                style={{
                  color: "var(--warningBtn)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {counts.inProgress}
              </strong>
            </div>
          </div>
        </header>

        {/* ── 2. Filter & Search Controls Bar ── */}
        <section className="mb-8 space-y-3">
          {/* Main Category Tabs */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b pb-3"
            style={{ borderColor: "var(--border-glass)" }}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedType("all");
                setSelectedStatus("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-200"
              style={{
                backgroundColor:
                  selectedType === "all"
                    ? "var(--color-fg)"
                    : "var(--cardGlassBg)",
                color:
                  selectedType === "all"
                    ? "var(--color-bg)"
                    : "var(--text-secondary)",
                border:
                  selectedType === "all"
                    ? "1px solid var(--color-fg)"
                    : "1px solid var(--border-glass)",
              }}
            >
              <i className="bx bx-grid-alt text-base" />
              <span>الكل ({counts.total})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("update")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-200"
              style={{
                backgroundColor:
                  selectedType === "update"
                    ? "var(--color-fg)"
                    : "var(--cardGlassBg)",
                color:
                  selectedType === "update"
                    ? "var(--color-bg)"
                    : "var(--text-secondary)",
                border:
                  selectedType === "update"
                    ? "1px solid var(--color-fg)"
                    : "1px solid var(--border-glass)",
              }}
            >
              <i className="bx bx-history text-base" />
              <span>تاريخ التحديثات ({counts.updates})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("feature")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-200"
              style={{
                backgroundColor:
                  selectedType === "feature"
                    ? "var(--color-fg)"
                    : "var(--cardGlassBg)",
                color:
                  selectedType === "feature"
                    ? "var(--color-bg)"
                    : "var(--text-secondary)",
                border:
                  selectedType === "feature"
                    ? "1px solid var(--color-fg)"
                    : "1px solid var(--border-glass)",
              }}
            >
              <i className="bx bx-bolt-circle text-base" />
              <span>المميزات الجديدة ({counts.features})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("roadmap")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-200"
              style={{
                backgroundColor:
                  selectedType === "roadmap"
                    ? "var(--color-fg)"
                    : "var(--cardGlassBg)",
                color:
                  selectedType === "roadmap"
                    ? "var(--color-bg)"
                    : "var(--text-secondary)",
                border:
                  selectedType === "roadmap"
                    ? "1px solid var(--color-fg)"
                    : "1px solid var(--border-glass)",
              }}
            >
              <i className="bx bx-compass text-base" />
              <span>الخطط التي نعمل عليها ({counts.roadmap})</span>
            </button>
          </div>

          {/* Search & Sub-status Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="ابحث في التحديثات، المميزات، الإصدارات، أو الكلمات الدلالية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-fields w-full rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--border-glass)",
                  color: "var(--color-fg)",
                  paddingRight: "2.5rem",
                  paddingLeft: searchQuery ? "2.5rem" : "1rem",
                }}
              />
              <Search
                className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-xs rounded-full hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="مسح البحث"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {(
                [
                  { id: "all", label: "كل الحالات" },
                  { id: "released", label: "تم الإطلاق" },
                  { id: "in_progress", label: "جاري العمل" },
                  { id: "testing", label: "قيد التجربة" },
                  { id: "planned", label: "مخطط لها" },
                ] as const
              ).map((st) => {
                const isActive = selectedStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatus(st.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(39, 39, 255, 0.16)"
                        : "var(--cardGlassBg)",
                      color: isActive
                        ? "var(--color-primary)"
                        : "var(--text-muted)",
                      border: isActive
                        ? "1px solid var(--color-primary)"
                        : "1px solid var(--border-glass)",
                    }}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. Content Presentation (Timeline / Feed) ── */}
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-6 rounded-2xl border border-glass animate-pulse space-y-4"
                style={{
                  backgroundColor: "var(--cardGlassBg)",
                  borderColor: "var(--border-glass)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-24 h-6 rounded-lg"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    />
                    <div
                      className="w-16 h-6 rounded-lg"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    />
                  </div>
                  <div
                    className="w-28 h-5 rounded-lg"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  />
                </div>
                <div
                  className="w-3/4 h-7 rounded-lg"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                />
                <div
                  className="w-full h-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                />
                <div
                  className="w-2/3 h-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                />
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div
            className="p-8 rounded-3xl border text-center space-y-3"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              borderColor: "rgba(239, 68, 68, 0.3)",
            }}
          >
            <i className="bx bx-error-circle text-4xl text-danger" />
            <h3
              className="text-lg font-bold"
              style={{ color: "var(--color-fg)" }}
            >
              تعذر تحميل سجل التوثيق
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={fetchDocs}
              className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          /* Empty State */
          <div
            className="p-12 rounded-3xl border border-glass text-center space-y-4"
            style={{
              backgroundColor: "var(--cardGlassBg)",
              borderColor: "var(--border-glass)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl"
              style={{
                backgroundColor: "rgba(39, 39, 255, 0.1)",
                color: "var(--color-primary)",
              }}
            >
              <i className="bx bx-file-blank" />
            </div>

            <div className="max-w-md mx-auto">
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--color-fg)" }}
              >
                {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                  ? "لا توجد نتائج مطابقة لبحثك"
                  : "لا توجد عناصر منشورة بعد"}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                  ? "جرّب تغيير فلاتر التصنيف أو البحث بكلمات أخرى."
                  : "سجل التحديثات جاهز؛ سيقوم مدير النظام بنشر التحديثات والمميزات وخطط التطوير قريباً."}
              </p>
            </div>

            {searchQuery || selectedType !== "all" || selectedStatus !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedType("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-glass cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--color-fg)",
                  borderColor: "var(--border-glass)",
                }}
              >
                <i className="bx bx-reset text-base" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            ) : isAdmin ? (
              <Link
                href="/admin/doc"
                className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                }}
              >
                <i className="bx bx-plus-circle text-base" />
                <span>إضافة أول تحديث الآن</span>
              </Link>
            ) : null}
          </div>
        ) : (
          /* List of Doc Entries */
          <div className="space-y-6">
            {filteredDocs.map((doc) => {
              const typeMeta = DOC_TYPE_META[doc.doc_type] || DOC_TYPE_META.update;
              const statusMeta =
                ROADMAP_STATUS_META[doc.roadmap_status] ||
                ROADMAP_STATUS_META.released;
              const isExpanded = Boolean(expandedDocIds[doc.id]);
              const anchorId = doc.slug || doc.id;
              const isCopied = copiedId === doc.id;
              const isRoadmapItem = doc.doc_type === "roadmap";

              return (
                <article
                  key={doc.id}
                  id={anchorId}
                  className="rounded-3xl border border-glass backdrop-blur-md p-5 sm:p-7 transition-all duration-200 relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--cardGlassBg)",
                    borderColor: doc.is_pinned
                      ? "rgba(39, 39, 255, 0.4)"
                      : "var(--border-glass)",
                    boxShadow: doc.is_pinned
                      ? "0 8px 30px rgba(39, 39, 255, 0.08)"
                      : "var(--shadow-sm)",
                  }}
                >
                  {/* Pinned Accent Header Tag */}
                  {doc.is_pinned && (
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold mb-3 border"
                      style={{
                        backgroundColor: "rgba(39, 39, 255, 0.12)",
                        color: "var(--color-primary)",
                        borderColor: "rgba(39, 39, 255, 0.3)",
                      }}
                    >
                      <i className="bx bx-pin text-sm" />
                      <span>تحديث مثبت ومهم</span>
                    </div>
                  )}

                  {/* Header Row: Badges, Date & Direct Anchor Link */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    {/* Left/Start: Type badge, Roadmap Status, Version */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Doc Type Badge */}
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border"
                        style={{
                          backgroundColor: typeMeta.bg,
                          color: typeMeta.color,
                          borderColor: typeMeta.border,
                        }}
                      >
                        <i className={`${typeMeta.icon} text-sm`} />
                        <span>{typeMeta.shortLabel}</span>
                      </span>

                      {/* Status Badge */}
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                        style={{
                          backgroundColor: statusMeta.bg,
                          color: statusMeta.color,
                          borderColor: statusMeta.border,
                        }}
                      >
                        <i className={`${statusMeta.icon} text-sm`} />
                        <span>{statusMeta.label}</span>
                      </span>

                      {/* Version Pill (if available) */}
                      {doc.version && (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-mono font-bold border"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-glass)",
                            color: "var(--color-fg)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {doc.version}
                        </span>
                      )}
                    </div>

                    {/* Right/End: Date & Share Button */}
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDocDate(doc.release_date)}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(doc, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-glass cursor-pointer transition-all hover-lift"
                        style={{
                          backgroundColor: isCopied
                            ? "rgba(0, 211, 123, 0.15)"
                            : "var(--bg-secondary)",
                          borderColor: isCopied
                            ? "var(--color-success)"
                            : "var(--border-glass)",
                          color: isCopied
                            ? "var(--color-success)"
                            : "var(--text-muted)",
                        }}
                        title="نسخ رابط مباشر لهذا التحديث"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>مشاركة</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Optional Cover Banner */}
                  {doc.cover_image && (
                    <div
                      className="mb-4 rounded-2xl overflow-hidden border border-glass w-full"
                      style={{
                        borderColor: "var(--border-glass)",
                        maxHeight: "320px",
                      }}
                    >
                      <img
                        src={doc.cover_image}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        style={{ maxHeight: "320px" }}
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h2
                    className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-2"
                    style={{
                      color: "var(--color-fg)",
                      fontFamily: "var(--font-heading)",
                      lineHeight: 1.35,
                    }}
                  >
                    {doc.title}
                  </h2>

                  {/* Summary */}
                  {doc.summary && (
                    <p
                      className="text-sm sm:text-base leading-relaxed mb-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {doc.summary}
                    </p>
                  )}

                  {/* Roadmap Progress Bar (For in_progress / testing / planned roadmap items) */}
                  {isRoadmapItem && (
                    <div
                      className="mb-4 p-3.5 rounded-2xl border border-glass"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-glass)",
                      }}
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span style={{ color: "var(--text-secondary)" }}>
                          نسبة الإنجاز ومرحلة العمل:
                        </span>
                        <span
                          className="font-mono font-extrabold"
                          style={{
                            color:
                              doc.progress_percent >= 100
                                ? "var(--color-success)"
                                : "var(--color-primary)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {doc.progress_percent}%
                        </span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(4, Math.min(100, doc.progress_percent))}%`,
                            backgroundColor:
                              doc.progress_percent >= 100
                                ? "var(--color-success)"
                                : "var(--color-primary)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Highlights Checklist (if specified) */}
                  {Array.isArray(doc.highlights) && doc.highlights.length > 0 && (
                    <div className="mb-4">
                      <h4
                        className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand" />
                        <span>أبرز ما يتضمنه هذا التحديث:</span>
                      </h4>
                      <ul className="space-y-2">
                        {doc.highlights.map((point, pIdx) => (
                          <li
                            key={pIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
                            style={{ color: "var(--color-fg)" }}
                          >
                            <span
                              className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[11px]"
                              style={{
                                backgroundColor: "rgba(0, 211, 123, 0.15)",
                                color: "var(--color-success)",
                              }}
                            >
                              ✓
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Full Rich Content (Collapsible / Expandable) */}
                  {doc.content && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-glass)" }}>
                      {isExpanded ? (
                        <div className="space-y-3">
                          <div
                            className="text-sm leading-relaxed doc-content-body"
                            style={{
                              color: "var(--text-secondary)",
                              lineHeight: 1.8,
                            }}
                            dangerouslySetInnerHTML={{ __html: doc.content }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleExpand(doc.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold cursor-pointer transition-colors pt-2 hover:underline"
                            style={{ color: "var(--color-primary)" }}
                          >
                            <ChevronUp className="w-4 h-4" />
                            <span>طي التفاصيل الكاملة</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleExpand(doc.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold cursor-pointer transition-colors hover:underline"
                          style={{ color: "var(--color-primary)" }}
                        >
                          <ChevronDown className="w-4 h-4" />
                          <span>عرض التفاصيل والشرح الكامل</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Footer: Tags & Author */}
                  <div
                    className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2"
                    style={{ borderColor: "var(--border-glass)" }}
                  >
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(doc.tags || []).map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setSearchQuery(tag)}
                          className="text-[11px] px-2.5 py-0.5 rounded-full border border-glass cursor-pointer transition-colors hover-lift"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-glass)",
                            color: "var(--text-muted)",
                          }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    {/* Author note */}
                    {doc.author_name && (
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        بواسطة: {doc.author_name}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
