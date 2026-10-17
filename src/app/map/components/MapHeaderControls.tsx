"use client";

import React, { useState, useRef, useEffect } from "react";
import { CATEGORIES_STRUCTURE } from "@/data/places";
import { MapLayerType, MapPlacePoint } from "../types";
import { IoSearchOutline, IoClose, IoLayersOutline } from "react-icons/io5";
import { FaLocationArrow, FaHeart, FaStar, FaStore, FaCompass } from "react-icons/fa";
import { getCategoryColor, CATEGORY_EMOJIS } from "@/app/places/constants";
import styles from "../map.module.css";

interface MapHeaderControlsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
  onlyOpenNow: boolean;
  setOnlyOpenNow: (val: boolean) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: (val: boolean) => void;
  sortByNearby: boolean;
  setSortByNearby: (val: boolean) => void;
  onLocateUser: () => void;
  locationLoading: boolean;
  userHasLocation: boolean;
  onResetView: () => void;
  mapLayer: MapLayerType;
  setMapLayer: (layer: MapLayerType) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  totalFilteredCount: number;
  points?: MapPlacePoint[];
  onSelectPoint?: (point: MapPlacePoint) => void;
}

export default function MapHeaderControls({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  onlyOpenNow,
  setOnlyOpenNow,
  onlyFavorites,
  setOnlyFavorites,
  sortByNearby,
  setSortByNearby,
  onLocateUser,
  locationLoading,
  userHasLocation,
  onResetView,
  mapLayer,
  setMapLayer,
  onToggleSidebar,
  isSidebarOpen,
  totalFilteredCount,
  points = [],
  onSelectPoint,
}: MapHeaderControlsProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const layerMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        layerMenuRef.current &&
        !layerMenuRef.current.contains(event.target as Node)
      ) {
        setShowLayerMenu(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const topSuggestions = searchQuery.trim() ? points.slice(0, 6) : [];

  return (
    <div className={styles.floatingTopBar}>
      {/* ── Row 1: Search & Main Action Controls ── */}
      <div className={styles.searchBarRow}>
        {/* Search Field */}
        <div className={styles.searchInputWrapper} ref={searchContainerRef}>
          <IoSearchOutline className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ابحث عن مكان، مطعم، صيدلية، مول، أو عنوان بالخريطة..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              aria-label="مسح البحث"
            >
              <IoClose />
            </button>
          )}

          {/* Auto Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div className={styles.searchSuggestionsDropdown}>
              {topSuggestions.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                  }}
                >
                  لا توجد نتائج مطابقة — تم تصغير الخريطة لعرض كامل المدينة
                </div>
              ) : (
                topSuggestions.map((point) => {
                  const emoji = CATEGORY_EMOJIS[point.category] || "📍";
                  const thumb =
                    point.images && point.images.length > 0
                      ? point.images[0]
                      : "/images/icons3d/burger.webp";

                  return (
                    <button
                      key={point.id}
                      className={styles.searchSuggestionItem}
                      onClick={() => {
                        if (onSelectPoint) {
                          onSelectPoint(point);
                        }
                        setShowSuggestions(false);
                      }}
                    >
                      <img
                        src={thumb}
                        alt={point.name}
                        className={styles.suggestionThumb}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/icons3d/burger.webp";
                        }}
                      />
                      <div className={styles.suggestionInfo}>
                        <div className={styles.suggestionName}>
                          {point.name}
                          {point.branchName ? ` (${point.branchName})` : ""}
                        </div>
                        <div className={styles.suggestionMeta}>
                          <span>{emoji} {point.categoryLabel}</span>
                          <span>•</span>
                          <span>{point.city || point.governorate || ""}</span>
                          {typeof point.distanceKm === "number" && (
                            <>
                              <span>•</span>
                              <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                                {point.distanceKm < 1
                                  ? `${Math.round(point.distanceKm * 1000)} م`
                                  : `${point.distanceKm.toFixed(1)} كم`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Group */}
        <div className={styles.topActionsGroup}>
          {/* Locate Me Button */}
          <button
            className={`${styles.topBtn} ${userHasLocation ? styles.active : ""}`}
            onClick={onLocateUser}
            title="تحديد موقعي الحالي على الخريطة"
            disabled={locationLoading}
          >
            <FaLocationArrow
              style={{
                transform: "rotate(-45deg)",
                animation: locationLoading ? "spin 1s linear infinite" : "none",
              }}
            />
            <span className="hidden-mobile">
              {locationLoading ? "جاري التحديد..." : userHasLocation ? "موقعي محدد" : "موقعي"}
            </span>
          </button>

          {/* Sidebar Toggle Button */}
          <button
            className={`${styles.topBtn} ${isSidebarOpen ? styles.active : ""}`}
            onClick={onToggleSidebar}
            title="عرض قائمة الأماكن"
          >
            <i className="bx bx-list-ul" style={{ fontSize: "1.1rem" }}></i>
            <span>
              الأماكن <span className={styles.chipCount}>{totalFilteredCount}</span>
            </span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Category Chips Bar ── */}
      <div className={styles.categoriesBar}>
        {/* All Chip */}
        <button
          className={`${styles.categoryChip} ${selectedCategory === "all" ? styles.active : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          <span>🗂️</span>
          <span>الكل</span>
          <span className={styles.chipCount}>{categoryCounts["all"] || 0}</span>
        </button>

        {/* Nearby Filter Chip (Only when location is available or triggers locate) */}
        <button
          className={`${styles.categoryChip} ${sortByNearby ? styles.active : ""}`}
          onClick={() => {
            if (!userHasLocation) {
              onLocateUser();
            }
            setSortByNearby(!sortByNearby);
          }}
        >
          <span>🧭</span>
          <span>الأقرب لي</span>
        </button>

        {/* Open Now Filter Chip */}
        <button
          className={`${styles.categoryChip} ${onlyOpenNow ? styles.active : ""}`}
          onClick={() => setOnlyOpenNow(!onlyOpenNow)}
        >
          <span>🟢</span>
          <span>مفتوح الآن</span>
        </button>

        {/* Favorites Filter Chip */}
        <button
          className={`${styles.categoryChip} ${onlyFavorites ? styles.active : ""}`}
          onClick={() => setOnlyFavorites(!onlyFavorites)}
        >
          <span>❤️</span>
          <span>المفضلة</span>
        </button>

        {/* Categories from CATEGORIES_STRUCTURE */}
        {CATEGORIES_STRUCTURE.map((cat) => {
          const count = categoryCounts[cat.name] || 0;
          if (count === 0 && selectedCategory !== cat.name) return null;

          return (
            <button
              key={cat.name}
              className={`${styles.categoryChip} ${
                selectedCategory === cat.name ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className={styles.chipCount}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
