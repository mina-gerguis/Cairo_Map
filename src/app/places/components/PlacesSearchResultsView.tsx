"use client";

import React from "react";
import Image from "next/image";
import AdBanner from "@/components/AdBanner";
import { PlacesSearchResultsViewProps } from "../types";
import { CATEGORY_LABELS } from "../constants";
import PlaceCard from "./PlaceCard";

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
}: PlacesSearchResultsViewProps) {
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
        <>
          <div className="grid-places">
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

          <div style={{ marginTop: "24px" }}>
            <AdBanner placement="places_bottom" />
          </div>
        </>
      ) : (
        <div
          className="glass-panel"
          style={{ padding: "60px 20px", textAlign: "center", border: "none" }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>
            <Image
              src="/images/404.jpg"
              alt="Not Found"
              width={250}
              height={250}
              style={{ width: "250px", height: "auto" }}
            />
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
            لم يُعثر على نتائج — جرّب كلمة بحث أخرى
          </p>
        </div>
      )}
    </>
  );
}
