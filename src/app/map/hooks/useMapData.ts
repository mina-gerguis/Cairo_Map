"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Place, initialPlaces, normalizePlaceCategory } from "@/data/places";
import { CATEGORY_LABELS } from "@/app/places/constants";
import { haversineDistance, getSearchWords, cleanArabicWord } from "@/app/places/utils";
import { isCurrentlyOpen } from "@/lib/workingHours";
import { MapPlacePoint, UserLocation } from "../types";

export function useMapData(user: any, onRequireAuth?: (msg?: string) => void) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // User Geolocation
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortByNearby, setSortByNearby] = useState(false);

  // Active Selection on Map
  const [selectedPoint, setSelectedPoint] = useState<MapPlacePoint | null>(null);

  // Fetch places from Supabase and merge with initial / local places
  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      let fetchedPlaces: Place[] = [];

      if (supabase) {
        const { data, error } = await supabase
          .from("places")
          .select("*, branches(*)")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          fetchedPlaces = data.map((dbPlace: any) => {
            const rawCategory = dbPlace.category;
            const initialSubCats = Array.isArray(dbPlace.sub_categories)
              ? [...dbPlace.sub_categories]
              : [];
            const { category: finalCategory, subCategories: finalSubCategories } =
              normalizePlaceCategory(rawCategory, initialSubCats);

            return {
              id: dbPlace.id,
              name: dbPlace.name,
              name_en: dbPlace.name_en || "",
              category: finalCategory,
              categoryLabel:
                dbPlace.category_label ||
                CATEGORY_LABELS[finalCategory] ||
                finalCategory,
              subCategories: finalSubCategories,
              place_type: dbPlace.place_type || "",
              place_type_icon: dbPlace.place_type_icon || "",
              governorate: dbPlace.governorate,
              city: dbPlace.city,
              shortDescription: dbPlace.short_description,
              fullAddress: dbPlace.full_address || "",
              phones: dbPlace.phones || [],
              googleMapsUrl: dbPlace.google_maps_url || "",
              images: dbPlace.images || [],
              menuImages: dbPlace.menu_images || [],
              workingHours: dbPlace.working_hours || "",
              rating: dbPlace.rating || 0,
              reviewsCount: dbPlace.reviews_count || 0,
              description: dbPlace.description || "",
              latitude: dbPlace.latitude ? Number(dbPlace.latitude) : undefined,
              longitude: dbPlace.longitude ? Number(dbPlace.longitude) : undefined,
              website_url: dbPlace.website_url,
              features: Array.isArray(dbPlace.features) ? dbPlace.features : [],
              services: Array.isArray(dbPlace.services) ? dbPlace.services : [],
              branches: dbPlace.branches
                ? dbPlace.branches.map((b: any) => ({
                    id: b.id,
                    place_id: b.place_id,
                    name: b.name,
                    governorate: b.governorate,
                    city: b.city,
                    fullAddress: b.full_address || "",
                    latitude: b.latitude ? Number(b.latitude) : undefined,
                    longitude: b.longitude ? Number(b.longitude) : undefined,
                    phones: b.phones || [],
                    googleMapsUrl: b.google_maps_url,
                    workingHours: b.working_hours,
                    isMain: b.is_main,
                    createdAt: b.created_at,
                    website_url: b.website_url,
                    features: Array.isArray(b.features) ? b.features : [],
                    services: Array.isArray(b.services) ? b.services : [],
                  }))
                : [],
            };
          });
        }
      }

      // Check localStorage for offline/locally added places
      let localPlaces: Place[] = [];
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("dftry_places");
          if (stored) {
            localPlaces = JSON.parse(stored);
          }
        } catch {
          // Ignore
        }
      }

      // Merge: Map by ID (DB places take precedence, then local, then initialPlaces)
      const placesMap = new Map<string, Place>();

      initialPlaces.forEach((p) => {
        placesMap.set(p.id.toString(), p);
      });

      localPlaces.forEach((p) => {
        placesMap.set(p.id.toString(), p);
      });

      fetchedPlaces.forEach((p) => {
        placesMap.set(p.id.toString(), p);
      });

      setPlaces(Array.from(placesMap.values()));
    } catch (err) {
      console.error("Error fetching places for map:", err);
      setPlaces(initialPlaces);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    if (user && supabase) {
      try {
        const { data } = await supabase
          .from("favorite_places")
          .select("place_id")
          .eq("user_id", user.id);
        if (data) {
          setFavoriteIds(new Set(data.map((d: any) => d.place_id.toString())));
        }
      } catch (err) {
        console.error("Error fetching favorite places:", err);
      }
    } else {
      setFavoriteIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, placeId: string) => {
      e.stopPropagation();
      if (!user || !supabase) {
        if (onRequireAuth) {
          onRequireAuth("يرجى تسجيل الدخول أولاً لإضافة الأماكن للمفضلة.");
        }
        return;
      }

      const pIdStr = placeId.toString();
      const newFavs = new Set(favoriteIds);
      if (newFavs.has(pIdStr)) {
        newFavs.delete(pIdStr);
        setFavoriteIds(newFavs);
        try {
          await supabase
            .from("favorite_places")
            .delete()
            .match({ user_id: user.id, place_id: placeId });
        } catch (err) {
          console.error("Error removing favorite:", err);
        }
      } else {
        newFavs.add(pIdStr);
        setFavoriteIds(newFavs);
        try {
          await supabase
            .from("favorite_places")
            .insert({ user_id: user.id, place_id: placeId });
        } catch (err) {
          console.error("Error adding favorite:", err);
        }
      }
    },
    [user, favoriteIds, onRequireAuth]
  );

  // Load saved location from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLoc = localStorage.getItem("cairo_user_exact_location");
        if (savedLoc) {
          const parsed: UserLocation = JSON.parse(savedLoc);
          if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
            setUserLocation(parsed);
          }
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  // Update user location and persist
  const setUserLocationManual = useCallback((loc: UserLocation | null) => {
    setUserLocation(loc);
    if (typeof window !== "undefined") {
      if (loc) {
        localStorage.setItem("cairo_user_exact_location", JSON.stringify(loc));
      } else {
        localStorage.removeItem("cairo_user_exact_location");
      }
    }
  }, []);

  // High-accuracy Geolocation request with live satellite refinement
  const requestUserLocation = useCallback((onSuccess?: (loc: UserLocation) => void) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("متصفحك لا يدعم خدمة تحديد الموقع الجغرافي.");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    let bestAccuracy = Infinity;
    let watchId: number | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const finalizePosition = (pos: GeolocationPosition) => {
      const loc: UserLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        timestamp: pos.timestamp,
      };

      setUserLocationManual(loc);
      setLocationLoading(false);

      if (onSuccess) {
        onSuccess(loc);
      }
    };

    // 1. First immediate high-accuracy request
    navigator.geolocation.getCurrentPosition(
      (position) => {
        bestAccuracy = position.coords.accuracy;
        finalizePosition(position);

        // If accuracy is already very precise (under 25 meters), no need to keep watching
        if (bestAccuracy <= 25) {
          return;
        }

        // 2. Refine with satellite watch for 6 seconds to get pinpoint accuracy
        watchId = navigator.geolocation.watchPosition(
          (refinePos) => {
            if (refinePos.coords.accuracy < bestAccuracy) {
              bestAccuracy = refinePos.coords.accuracy;
              finalizePosition(refinePos);
            }
          },
          () => {},
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 6000,
          }
        );

        timeoutId = setTimeout(() => {
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }
        }, 6000);
      },
      (error) => {
        setLocationLoading(false);
        let errorMsg = "تعذر تحديد موقعك بدقة.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "تم رفض إذن الوصول للموقع. يرجى تفعيل الموقع من إعدادات المتصفح والجهاز.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "معلومات الـ GPS غير متاحة حالياً. تأكد من تفعيل الموقع في جهازك.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "انتهت مهلة طلب تحديد الموقع.";
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Force live GPS satellite fix, no stale cache
      }
    );
  }, [setUserLocationManual]);

  // Flatten places & branches into map points
  const allMapPoints = useMemo<MapPlacePoint[]>(() => {
    const points: MapPlacePoint[] = [];

    places.forEach((place) => {
      const hasBranches = place.branches && place.branches.length > 0;

      // 1. Main place point (if it has lat & lng)
      if (typeof place.latitude === "number" && typeof place.longitude === "number") {
        const dist = userLocation
          ? haversineDistance(
              userLocation.lat,
              userLocation.lng,
              place.latitude,
              place.longitude
            )
          : undefined;

        points.push({
          id: `place-${place.id}`,
          placeId: place.id.toString(),
          isBranch: false,
          name: place.name,
          category: place.category,
          categoryLabel: place.categoryLabel,
          subCategories: place.subCategories,
          latitude: place.latitude,
          longitude: place.longitude,
          rating: place.rating,
          reviewsCount: place.reviewsCount,
          fullAddress: place.fullAddress,
          city: place.city,
          governorate: place.governorate,
          phones: place.phones || [],
          googleMapsUrl: place.googleMapsUrl,
          images: place.images || [],
          workingHours: place.workingHours,
          isOpenNow: place.workingHours ? isCurrentlyOpen(place.workingHours) : undefined,
          distanceKm: dist,
          features: place.features,
          originalPlace: place,
        });
      }

      // 2. Branches points
      if (hasBranches) {
        place.branches?.forEach((branch) => {
          if (typeof branch.latitude === "number" && typeof branch.longitude === "number") {
            const dist = userLocation
              ? haversineDistance(
                  userLocation.lat,
                  userLocation.lng,
                  branch.latitude,
                  branch.longitude
                )
              : undefined;

            points.push({
              id: `branch-${branch.id}`,
              placeId: place.id.toString(),
              branchId: branch.id.toString(),
              isBranch: true,
              name: place.name,
              branchName: branch.name,
              category: place.category,
              categoryLabel: place.categoryLabel,
              subCategories: place.subCategories,
              latitude: branch.latitude,
              longitude: branch.longitude,
              rating: place.rating,
              reviewsCount: place.reviewsCount,
              fullAddress: branch.fullAddress || place.fullAddress,
              city: branch.city || place.city,
              governorate: branch.governorate || place.governorate,
              phones: branch.phones && branch.phones.length > 0 ? branch.phones : place.phones,
              googleMapsUrl: branch.googleMapsUrl || place.googleMapsUrl,
              images: branch.media && branch.media.length > 0 ? branch.media : place.images,
              workingHours: branch.workingHours || place.workingHours,
              isOpenNow: branch.workingHours
                ? isCurrentlyOpen(branch.workingHours)
                : place.workingHours
                ? isCurrentlyOpen(place.workingHours)
                : undefined,
              distanceKm: dist,
              features: branch.features || place.features,
              originalPlace: place,
              originalBranch: branch,
            });
          }
        });
      }
    });

    return points;
  }, [places, userLocation]);

  // Filtered and searched map points
  const filteredMapPoints = useMemo<MapPlacePoint[]>(() => {
    const searchTerms = getSearchWords(searchQuery);

    return allMapPoints
      .filter((point) => {
        // Category filter
        if (selectedCategory !== "all") {
          const matchMain = point.category.toLowerCase() === selectedCategory.toLowerCase();
          const matchSub =
            point.subCategories?.some(
              (s) => s.toLowerCase() === selectedCategory.toLowerCase()
            ) || false;
          if (!matchMain && !matchSub) return false;
        }

        // Subcategory filter
        if (selectedSubCategory !== "all") {
          const matchSub =
            point.subCategories?.some(
              (s) => s.toLowerCase() === selectedSubCategory.toLowerCase()
            ) || false;
          if (!matchSub) return false;
        }

        // Only Open Now
        if (onlyOpenNow && point.isOpenNow !== true) {
          return false;
        }

        // Only Favorites
        if (onlyFavorites && !favoriteIds.has(point.placeId)) {
          return false;
        }

        // Min Rating
        if (minRating > 0 && (!point.rating || point.rating < minRating)) {
          return false;
        }

        // Text Search
        if (searchTerms.length > 0) {
          const targetStr = [
            point.name,
            point.branchName || "",
            point.categoryLabel,
            point.fullAddress,
            point.city || "",
            point.governorate || "",
          ]
            .join(" ")
            .toLowerCase();

          const allMatch = searchTerms.every((term) => targetStr.includes(term));
          if (!allMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const isSearching = searchTerms.length > 0;
        if ((isSearching || sortByNearby) && typeof a.distanceKm === "number" && typeof b.distanceKm === "number") {
          return a.distanceKm - b.distanceKm;
        }
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [
    allMapPoints,
    selectedCategory,
    selectedSubCategory,
    onlyOpenNow,
    onlyFavorites,
    favoriteIds,
    minRating,
    searchQuery,
    sortByNearby,
  ]);

  // Counts by category
  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { all: allMapPoints.length };
    allMapPoints.forEach((point) => {
      counts[point.category] = (counts[point.category] || 0) + 1;
      point.subCategories?.forEach((sub) => {
        counts[sub] = (counts[sub] || 0) + 1;
      });
    });
    return counts;
  }, [allMapPoints]);

  return {
    places,
    allMapPoints,
    filteredMapPoints,
    categoryCounts,
    loading,
    userLocation,
    locationLoading,
    locationError,
    requestUserLocation,
    setUserLocationManual,
    favoriteIds,
    toggleFavorite,
    selectedPoint,
    setSelectedPoint,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    onlyOpenNow,
    setOnlyOpenNow,
    onlyFavorites,
    setOnlyFavorites,
    minRating,
    setMinRating,
    sortByNearby,
    setSortByNearby,
    refreshPlaces: fetchPlaces,
  };
}
