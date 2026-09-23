"use client";

import React from "react";
import { PlacesHeroProps } from "../types";
import PlacesSearchSuggestions from "./PlacesSearchSuggestions";

export default function PlacesHero({
  placesCount,
  searchQuery,
  setSearchQuery,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  onSelectSuggestion,
  searchRef,
  isLight,
  isProximityEnabled,
  locationLoading,
  onToggleProximity,
  onExploreClick,
}: PlacesHeroProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (
        activeSuggestionIndex >= 0 &&
        activeSuggestionIndex < suggestions.length
      ) {
        e.preventDefault();
        onSelectSuggestion(suggestions[activeSuggestionIndex]);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <section className="hero-places">
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
          ماب القاهرة هو رفيقك الأمثل لاكتشاف المطاعم، الكافيهات، الحدائق، وأكثر
          بحسب موقعك. كل مكان تحتاجه الآن بضغطة واحدة.
        </p>

        {/* Integrated Search in Hero */}
        <div
          className="hero-search-wrapper"
          ref={searchRef}
          style={{ position: "relative", zIndex: 110 }}
        >
          <div className="hero-search-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="search-input"
            type="text"
            className="hero-search-input"
            placeholder="ابحث عن مطعم، كافيه، حديقة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />

          {showSuggestions && suggestions.length > 0 && (
            <PlacesSearchSuggestions
              suggestions={suggestions}
              activeSuggestionIndex={activeSuggestionIndex}
              setActiveSuggestionIndex={setActiveSuggestionIndex}
              onSelectPlace={(place) => {
                onSelectSuggestion(place);
                setShowSuggestions(false);
              }}
              isLight={isLight}
            />
          )}
        </div>

        <div className="hero-actions" style={{ zIndex: "10" }}>
          <button
            className="hero-btn-primary sub-title"
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
            className="hero-btn-secondary sub-title"
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
