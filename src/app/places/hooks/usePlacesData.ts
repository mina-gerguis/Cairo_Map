"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Place, normalizePlaceCategory } from "@/data/places";
import { CATEGORY_LABELS } from "../constants";

export function usePlacesData(
  user: any,
  onRequireAuth: (message?: string) => void
) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // جلب الأماكن مع الفروع من Supabase
  const fetchPlaces = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("places")
        .select("*, branches(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedPlaces: Place[] = data.map((dbPlace: any) => {
          const rawCategory = dbPlace.category;
          const initialSubCats = Array.isArray(dbPlace.sub_categories)
            ? [...dbPlace.sub_categories]
            : [];
          const {
            category: finalCategory,
            subCategories: finalSubCategories,
          } = normalizePlaceCategory(rawCategory, initialSubCats);

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
            fullAddress: dbPlace.full_address,
            phones: dbPlace.phones || [],
            googleMapsUrl: dbPlace.google_maps_url || "",
            images: dbPlace.images || [],
            menuImages: dbPlace.menu_images || [],
            workingHours: dbPlace.working_hours || "",
            rating: dbPlace.rating || 0,
            reviewsCount: dbPlace.reviews_count || 0,
            description: dbPlace.description || "",
            latitude: dbPlace.latitude || undefined,
            longitude: dbPlace.longitude || undefined,
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
                  fullAddress: b.full_address,
                  latitude: b.latitude,
                  longitude: b.longitude,
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

        setPlaces(mappedPlaces);
      }
    } catch (err) {
      console.error("Error fetching places:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب الأماكن المفضلة للمستخدم الحالي
  const fetchFavorites = useCallback(async () => {
    if (user && supabase) {
      try {
        const { data } = await supabase
          .from("favorite_places")
          .select("place_id")
          .eq("user_id", user.id);
        if (data) {
          setFavoriteIds(new Set(data.map((d: any) => d.place_id)));
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

  // تبديل حالة المفضلة لمكان معين
  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, placeId: string) => {
      e.stopPropagation();

      if (!user || !supabase) {
        onRequireAuth("يرجى تسجيل الدخول أولاً لإضافة الأماكن المفضلة.");
        return;
      }

      const newFavs = new Set(favoriteIds);
      if (newFavs.has(placeId)) {
        newFavs.delete(placeId);
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
        newFavs.add(placeId);
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

  // إضافة مكان جديد محلياً وتخزينه
  const handleAddPlace = useCallback(
    (newPlace: Place) => {
      setPlaces((prev) => {
        const updated = [newPlace, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("dftry_places", JSON.stringify(updated));
        }
        return updated;
      });
    },
    []
  );

  return {
    places,
    setPlaces,
    favoriteIds,
    loading,
    toggleFavorite,
    handleAddPlace,
    refreshPlaces: fetchPlaces,
  };
}
