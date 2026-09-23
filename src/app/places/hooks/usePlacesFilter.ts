"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Place, CATEGORIES_STRUCTURE, FEATURES_LIST } from "@/data/places";
import { PlaceWithDist, UserLocation } from "../types";
import { CATEGORY_LABELS } from "../constants";
import {
  haversineDistance,
  getSearchWords,
  getSearchCleanedText,
} from "../utils";

export function usePlacesFilter(
  places: Place[],
  userLocation: UserLocation,
  isProximityEnabled: boolean,
  onTriggerProximity?: () => void
) {
  const searchParams = useSearchParams();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);

  // 1. حساب المسافات وإثراء الأماكن (Enrich places with distance)
  const enrichedPlaces = useMemo<PlaceWithDist[]>(() => {
    return places.map((p) => {
      let minDistance: number | undefined = undefined;
      let closestBranchName: string | undefined = undefined;

      if (userLocation) {
        if (p.branches && p.branches.length > 0) {
          p.branches.forEach((b) => {
            if (b.latitude && b.longitude) {
              const d = haversineDistance(
                userLocation.latitude,
                userLocation.longitude,
                b.latitude,
                b.longitude
              );
              if (minDistance === undefined || d < minDistance) {
                minDistance = d;
                closestBranchName = b.name;
              }
            }
          });
        } else if (p.latitude && p.longitude) {
          minDistance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            p.latitude,
            p.longitude
          );
        }
      }

      return {
        ...p,
        distanceKm: minDistance,
        closestBranchName,
      };
    });
  }, [places, userLocation]);

  // 2. تصفية الاقتراحات الفورية للبحث
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const queryWords = getSearchWords(searchQuery);
    if (queryWords.length === 0) return [];

    return enrichedPlaces
      .filter((p) => {
        const searchableText = getSearchCleanedText(
          [
            p.name,
            p.name_en || "",
            p.categoryLabel,
            ...(p.subCategories || []).map(
              (sc) => CATEGORY_LABELS[sc] || sc
            ),
            p.city,
            p.governorate,
          ]
            .filter(Boolean)
            .join(" ")
        );

        return queryWords.every((word) => searchableText.includes(word));
      })
      .slice(0, 5);
  }, [enrichedPlaces, searchQuery]);

  // 3. القائمة الرئيسية المفلترة
  const filteredPlaces = useMemo(() => {
    const queryWords = getSearchWords(searchQuery);

    return enrichedPlaces.filter((p) => {
      // Main Category filter
      const mainCat = CATEGORIES_STRUCTURE.find(
        (m) => m.name === selectedCategory
      );
      const subCatNames = mainCat
        ? new Set(mainCat.subCategories.map((s) => s.name))
        : new Set();

      const matchCat =
        selectedCategory === "all" ||
        p.category === selectedCategory ||
        p.categoryLabel === selectedCategory ||
        (mainCat &&
          (p.category === mainCat.name ||
            subCatNames.has(p.category) ||
            p.subCategories?.some((sub) => subCatNames.has(sub))));

      // Subcategory filter
      const matchSub =
        selectedSubCategory === null ||
        (p.subCategories && p.subCategories.includes(selectedSubCategory));

      // Type filter
      const matchType =
        selectedType === null || p.place_type === selectedType;

      // Rating filter
      const matchRating =
        minRating === 0 || (p.rating !== undefined && p.rating >= minRating);

      // Features filter
      const matchFeatures =
        activeFeatures.length === 0 ||
        activeFeatures.every((fKey) => p.features && p.features.includes(fKey));

      const matchAllFilters =
        matchCat && matchSub && matchType && matchRating && matchFeatures;
      if (!matchAllFilters) return false;

      if (queryWords.length === 0) return true;

      // Searchable keywords
      const searchableText = getSearchCleanedText(
        [
          p.name,
          p.name_en || "",
          p.categoryLabel,
          ...(p.subCategories || []).map((sc) => CATEGORY_LABELS[sc] || sc),
          p.place_type || "",
          ...(p.features || []).map(
            (fKey) => FEATURES_LIST.find((f) => f.key === fKey)?.label || ""
          ),
          ...(p.services || []),
          p.city,
          p.governorate,
          p.fullAddress,
          p.description || "",
          p.shortDescription || "",
          p.category === "food_drinks"
            ? "اكل مشروبات مطعم مطاعم كافيه كافيهات مقهى قهاوي"
            : "",
          p.subCategories?.includes("restaurant") ? "مطعم مطاعم اكل" : "",
          p.subCategories?.includes("cafe")
            ? "كافيه كافيهات مقهى قهاوي مشروبات"
            : "",
          p.subCategories?.includes("pharmacy")
            ? "صيدلية صيدليات علاج دواء"
            : "",
          p.subCategories?.includes("hospital")
            ? "مستشفى مستشفيات عيادة مركز طبي صحة"
            : "",
          p.subCategories?.includes("park")
            ? "حديقة حدائق منتزه ملاهي اماكن عامة"
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      );

      return queryWords.every((word) => searchableText.includes(word));
    });
  }, [
    enrichedPlaces,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    selectedType,
    minRating,
    activeFeatures,
  ]);

  // الأقسام الفرعية الجاهزة للعرض
  const nearbyPlaces = useMemo(() => {
    if (!isProximityEnabled || !userLocation) return [];
    return enrichedPlaces
      .filter((p) => p.distanceKm !== undefined && p.distanceKm < 10)
      .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
      .slice(0, 6);
  }, [enrichedPlaces, isProximityEnabled, userLocation]);

  const topRatedPlaces = useMemo(() => {
    return [...enrichedPlaces]
      .filter((p) => p.rating)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [enrichedPlaces]);

  const familyPlaces = useMemo(
    () =>
      enrichedPlaces.filter(
        (p) => p.features && p.features.includes("family_friendly")
      ),
    [enrichedPlaces]
  );

  const entertainmentPlaces = useMemo(
    () => enrichedPlaces.filter((p) => p.category === "entertainment"),
    [enrichedPlaces]
  );

  const showSections =
    !searchQuery.trim() &&
    selectedCategory === "all" &&
    selectedSubCategory === null &&
    selectedType === null &&
    minRating === 0 &&
    activeFeatures.length === 0;

  // مراقبة معلمات الرابط المتنقلة (Mobile Nav Queries)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("nearby") === "true") {
        if (!isProximityEnabled && onTriggerProximity) {
          onTriggerProximity();
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (urlParams.get("search") === "focus") {
        const input = document.getElementById("search-input");
        if (input) input.focus();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (urlParams.get("q")) {
        setSearchQuery(urlParams.get("q") as string);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isProximityEnabled, onTriggerProximity, searchParams]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    selectedType,
    setSelectedType,
    minRating,
    setMinRating,
    activeFeatures,
    setActiveFeatures,
    enrichedPlaces,
    suggestions,
    filteredPlaces,
    nearbyPlaces,
    topRatedPlaces,
    familyPlaces,
    entertainmentPlaces,
    showSections,
  };
}
