"use client";

import React from "react";
import AdBanner from "@/components/AdBanner";
import { PlacesSectionsViewProps } from "../types";
import PaginatedSection from "./PaginatedSection";

export default function PlacesSectionsView({
  isProximityEnabled,
  nearbyPlaces,
  enrichedPlaces,
  topRatedPlaces,
  familyPlaces,
  entertainmentPlaces,
  setSelectedPlace,
  getCategoryColor,
  toggleFavorite,
  favoriteIds,
}: PlacesSectionsViewProps) {
  return (
    <>
      {/* Section 1: Nearby */}
      {isProximityEnabled && (
        <PaginatedSection
          title={
            <>
              📍 أقرب الأماكن إليك{" "}
              {nearbyPlaces.length === 0 && (
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    marginRight: "12px",
                  }}
                >
                  بحث في نطاق 10 كم
                </span>
              )}
            </>
          }
          places={nearbyPlaces}
          setSelectedPlace={setSelectedPlace}
          getCategoryColor={getCategoryColor}
          toggleFavorite={toggleFavorite}
          favoriteIds={favoriteIds}
          emptyMessage="فعّل الموقع للعثور على أماكن قريبة منك 📍"
        />
      )}

      {/* Section 2: All Places */}
      <PaginatedSection
        title="🗂️ جميع الأماكن"
        places={enrichedPlaces}
        setSelectedPlace={setSelectedPlace}
        getCategoryColor={getCategoryColor}
        toggleFavorite={toggleFavorite}
        favoriteIds={favoriteIds}
        itemsPerPage={6}
        forceThreeColumns={true}
      />

      {/* Section 3: Top Rated */}
      <PaginatedSection
        title="⭐ الأكثر زيارة"
        places={topRatedPlaces}
        setSelectedPlace={setSelectedPlace}
        getCategoryColor={getCategoryColor}
        toggleFavorite={toggleFavorite}
        favoriteIds={favoriteIds}
        showRating
        itemsPerPage={3}
      />

      {/* Ad Space Banner (Middle) */}
      <AdBanner placement="places_middle" />

      {/* Section 4: Family */}
      <PaginatedSection
        title="👨‍👩‍👧‍👦 أماكن عائلية"
        places={familyPlaces}
        setSelectedPlace={setSelectedPlace}
        getCategoryColor={getCategoryColor}
        toggleFavorite={toggleFavorite}
        favoriteIds={favoriteIds}
      />

      {/* Section 5: Entertainment */}
      <PaginatedSection
        title="🎭 أماكن ترفيهية"
        places={entertainmentPlaces}
        setSelectedPlace={setSelectedPlace}
        getCategoryColor={getCategoryColor}
        toggleFavorite={toggleFavorite}
        favoriteIds={favoriteIds}
      />

      {/* Ad Space Banner (Bottom) */}
      <AdBanner placement="places_bottom" />
    </>
  );
}
