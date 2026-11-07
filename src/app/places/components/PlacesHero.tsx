"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaInbox } from "react-icons/fa";
import { IconBookmarkPlus, IconMoodSadDizzy, IconRefresh } from "@tabler/icons-react";
import { AppleSpotlight, SearchResult } from "@/components/ui/AppleSpotlight";
import { getMainCategoryImage, CATEGORIES_STRUCTURE } from "@/data/places";
import { PlacesHeroProps } from "../types";
import { getSearchWords, getSearchCleanedText } from "../utils";
import { useGSAP, gsap } from "@/lib/gsap";

const HERO_PLACEHOLDERS = [
  "ابحث عن مطعم، كافيه، أو حديقة...",
  "ابحث باسم المكان، المنطقة، أو المدينة...",
  "ابحث عن أماكن عائلية أو هادئة...",
  "ابحث بالأنشطة: سينما، ألعاب، صيدلية..."
];

export default function PlacesHero({
  placesCount,
  searchQuery,
  setSearchQuery,
  suggestions,
  onSelectSuggestion,
  searchRef,
  isProximityEnabled,
  locationLoading,
  onToggleProximity,
  onExploreClick,
}: PlacesHeroProps) {
  const heroContainerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [heroPlaceholderIndex, setHeroPlaceholderIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPlaceholderIndex((prev) => (prev + 1) % HERO_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // تحويل اقتراحات البحث والفئات إلى بنية AppleSpotlight
  const spotlightResults = useMemo<SearchResult[] | undefined>(() => {
    if (!searchQuery.trim()) return undefined;
    const queryWords = getSearchWords(searchQuery);
    if (queryWords.length === 0) return undefined;

    const list: SearchResult[] = [];

    // 1. الأماكن المطابقة
    suggestions.forEach((place) => {
      list.push({
        label: place.name + (place.name_en ? ` (${place.name_en})` : ""),
        description: `${place.categoryLabel || ""} ${place.briefLocation ? `• ${place.briefLocation}` : place.city ? `• ${place.city}` : ""}`.trim(),
        link: `/places/${place.id}`,
        image: getMainCategoryImage(place.category, place.subCategories),
        badge: place.categoryLabel || "مكان مسجل",
        onClick: () => {
          onSelectSuggestion(place);
        },
      });
    });

    // 2. الفئات المتطابقة
    const matchedCategories = CATEGORIES_STRUCTURE.filter((cat) => {
      const categorySearchable = getSearchCleanedText(
        [cat.label, ...cat.subCategories.map((sub) => sub.label)].join(" ")
      );
      return queryWords.every((word) => categorySearchable.includes(word));
    }).slice(0, 2);

    matchedCategories.forEach((cat) => {
      list.push({
        label: cat.label,
        description: `تصفح كل أماكن ومحلات ${cat.label}`,
        link: `/places?category=${encodeURIComponent(cat.name)}`,
        image: `/images/threeD/${cat.image}`,
        badge: "تصنيف",
      });
    });

    return list;
  }, [searchQuery, suggestions, onSelectSuggestion]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      onSelectSuggestion(suggestions[0]);
    }
  };

  useGSAP(
    () => {
      const el = heroContainerRef.current;
      if (!el) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      const badge = el.querySelector(".hero-badge");
      const title = el.querySelector(".hero-title");
      const subtitle = el.querySelector(".hero-subtitle");
      const searchBox = el.querySelector(".hero-search-wrapper");
      const actions = el.querySelector(".hero-actions");
      const stats = el.querySelectorAll(".hero-stat");

      if (badge) tl.fromTo(badge, { autoAlpha: 0, y: -14, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45 });
      if (title) tl.fromTo(title, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.25");
      if (subtitle) tl.fromTo(subtitle, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35");
      if (searchBox) tl.fromTo(searchBox, { autoAlpha: 0, y: 18, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, "-=0.3");
      if (actions) tl.fromTo(actions, { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.25");
      if (stats.length > 0) {
        tl.fromTo(stats, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4 }, "-=0.2");
      }

      // Floating ambient 3D cards
      const card1 = el.querySelector(".hero-3d-card-1");
      const card2 = el.querySelector(".hero-3d-card-2");
      const card3 = el.querySelector(".hero-3d-card-3");

      if (card1) {
        gsap.to(card1, {
          y: -12,
          rotation: 1.5,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (card2) {
        gsap.to(card2, {
          y: 10,
          rotation: -2,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.4,
        });
      }
      if (card3) {
        gsap.to(card3, {
          y: -8,
          rotation: 1,
          duration: 3.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.8,
        });
      }
    },
    { scope: heroContainerRef }
  );

  return (
    <section ref={heroContainerRef} className="hero-places">
      <div className="hero-bg" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Floating 3D Cards */}
      <div className="hero-3d-card hero-3d-card-1">
        <span>🏦</span>
        <div className="sub-title">
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 2 }}>
            مكان مميز
          </div>
          <div>مطعم لورا الكائن</div>
        </div>
        <span style={{ color: "#fbbf24" }}>★ 4.9</span>
      </div>

      <div className="hero-3d-card hero-3d-card-2">
        <span>🏏</span>
        <div className="sub-title">
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 2 }}>
            حديقة عائلية
          </div>
          <div>حديقة النوزها</div>
        </div>
        <span style={{ color: "#fbbf24" }}>★ 4.7</span>
      </div>

      <div className="hero-3d-card hero-3d-card-3">
        <span>☕</span>
        <div className="sub-title">
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 2 }}>
            كافيه ترندي
          </div>
          <div>ستاربكس ميدان التحرير</div>
        </div>
        <span style={{ color: "#fbbf24" }}>★ 4.8</span>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          دليلك الشامل لأفضل الأماكن في مصر ✨
        </div>

        <h1 className="hero-title">
          اكتشف أفضل
          <br />
          <span className="hero-title-gradient">الأماكن</span>
          <br />
          بالقرب منك
        </h1>

        <p className="hero-subtitle">
          قريب هو رفيقك الأمثل لاكتشاف المطاعم، الكافيهات، الحدائق، وأكثر
          بحسب موقعك. كل مكان تحتاجه الآن بضغطة واحدة.
        </p>

        {/* Integrated Apple Spotlight Search in Hero */}
        <div
          className="hero-search-wrapper w-full"
          ref={searchRef}
          style={{ position: "relative", zIndex: 9999 }}
        >
          <AppleSpotlight
            inputRef={searchInputRef}
            searchValue={searchQuery}
            onSearchChange={(val) => setSearchQuery(val)}
            onSubmit={handleSearchSubmit}
            searchResults={spotlightResults}
            isMac={isMac}
            placeholder={HERO_PLACEHOLDERS[heroPlaceholderIndex]}
            emptyState={
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>
                  <FaInbox style={{ fontSize: "1.8rem", margin: "0 auto 6px auto", opacity: 0.5 }} />
                </div>
                <div style={{ fontWeight: "600", fontSize: "1rem", color: "var(--color-fg)", marginBottom: "4px" }} className="font-sub">
                  أنت بتبحث عن&nbsp;<strong>&quot;{searchQuery}&quot;</strong>
                </div>
                <div style={{ fontSize: "0.82rem", marginBottom: "14px", color: "var(--text-secondary)" }} className="flex items-center justify-center font-sub">
                  <p>
                    دورنا كتير بس للاسف ملقناش اللي أنت بدور عليه، لكن جرب تبحث من تاني أو أضف المكان بنفسك{" "}
                  </p>
                  <IconMoodSadDizzy stroke={2} />
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="btn btn-primary fs-sm py-0"
                  >
                    جرب أبحث من جديد <IconRefresh stroke={2} />
                  </button>
                  <Link
                    href="/propose-place"
                    className="btn btn-blue fs-sm py-0"
                  >
                    ده مكان ؟ تعاله نضيفة
                    <IconBookmarkPlus stroke={2} />
                  </Link>
                </div>
              </div>
            }
            footer={
              <div
                style={{
                  padding: "16px 18px",
                  borderTop: "1px solid rgba(120, 120, 128, 0.15)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ gap: "12px", alignItems: "center" }} className="flex media-max-sm">
                  <span><kbd className="apple-spotlight-kbd">↵</kbd> للانتقال</span>
                  <span><kbd className="apple-spotlight-kbd">↑↓</kbd> للتنقل</span>
                  <span><kbd className="apple-spotlight-kbd">ESC</kbd> للمسح</span>
                </div>
                {searchQuery.trim() && (
                  <Link
                    href={`/map?search=${encodeURIComponent(searchQuery.trim())}`}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-primary, #006fee)",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      textDecoration: "none",
                    }}
                  >
                    <span>عرض كل النتائج في الخريطة</span>
                    <span>←</span>
                  </Link>
                )}
              </div>
            }
          />
        </div>

        <div className="hero-actions" style={{ position: "relative", zIndex: 1 }}>
          <button
            className="btn btn-primary w-full flex-1"
            onClick={onExploreClick}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            اكتشف الأماكن
          </button>
          <button
            className="btn btn-secondary w-full flex-1"
            onClick={onToggleProximity}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <span
                className="btn-secondary"
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                  marginLeft: "8px",
                }}
              />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
            )}
            {isProximityEnabled ? "إيقاف القرب" : "بالقرب مني"}
          </button>
        </div>

        {/* Stats Row */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number sub-title">{placesCount}+</div>
            <div className="hero-stat-label sub-title">مكان مسجل</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-number sub-title">27</div>
            <div className="hero-stat-label sub-title">محافظة</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-number sub-title">8</div>
            <div className="hero-stat-label sub-title">تصنيفات</div>
          </div>
        </div>
      </div>
    </section>
  );
}
