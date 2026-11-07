"use client";

import React, { useRef } from "react";
import { PlacesSearchResultsViewProps } from "../types";
import { CATEGORY_LABELS } from "../constants";
import PlaceCard from "./PlaceCard";
import PlacesNotFound from "./PlacesNotFound";
import { gsap, useGSAP } from "@/lib/gsap";

export default function PlacesSearchResultsView({
  filteredPlaces,
  searchQuery,
  selectedCategory,
  selectedSubCategory,
  selectedType,
  minRating,
  activeFeatures,
  setSelectedPlace,
  getCategoryColor,
  toggleFavorite,
  favoriteIds,
  onResetFilters,
}: PlacesSearchResultsViewProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Stagger animate search result cards
  useGSAP(() => {
    if (gridRef.current && filteredPlaces.length > 0) {
      const cards = gridRef.current.children;
      gsap.from(cards, {
        autoAlpha: 0,
        y: 20,
        scale: 0.98,
        stagger: 0.04,
        duration: 0.45,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
      });
    }
  }, [filteredPlaces, searchQuery, selectedCategory, selectedSubCategory, selectedType]);

  const currentCategoryLabel = selectedSubCategory 
    ? (CATEGORY_LABELS[selectedSubCategory] || selectedSubCategory)
    : selectedCategory !== "all" 
      ? (CATEGORY_LABELS[selectedCategory] || selectedCategory)
      : undefined;

  return (
    <>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.9rem",
          marginBottom: "16px",
          fontFamily: "var(--font-cairo)",
        }}
      >
        {filteredPlaces.length} نتيجة
        {searchQuery ? ` لـ "${searchQuery}"` : ""}
        {selectedCategory !== "all"
          ? ` في قسم ${CATEGORY_LABELS[selectedCategory] || selectedCategory}`
          : ""}
        {selectedSubCategory
          ? ` -> ${CATEGORY_LABELS[selectedSubCategory] || selectedSubCategory}`
          : ""}
        {selectedType ? ` (${selectedType})` : ""}
        {minRating > 0 ? ` بتقييم ${minRating}+` : ""}
        {activeFeatures.length > 0 ? ` مع مميزات محددة` : ""}
      </p>

      {filteredPlaces.length > 0 ? (
        <div ref={gridRef} className="grid-places">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="glass-card"
              onClick={() => setSelectedPlace(place)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <PlaceCard
                place={place}
                getCategoryColor={getCategoryColor}
                toggleFavorite={toggleFavorite}
                favoriteIds={favoriteIds}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{ padding: "40px 20px", textAlign: "center", border: "none" }}
        >
          <PlacesNotFound 
            categoryLabel={currentCategoryLabel} 
            onReset={onResetFilters} 
          />
        </div>
      )}
    </>
  );
}
