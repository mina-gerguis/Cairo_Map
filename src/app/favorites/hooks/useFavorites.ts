import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  toggleLandmarkFavorite,
  syncUserFavoritesFromSupabase,
} from "@/data/cities";
import { FavoriteItem, ActiveLandmarkModalState } from "../types";
import { ALL_CATEGORY, ROUTES } from "../constants";
import { getFavoritedLandmarksAsItems, getItemCategoryLabel } from "../utils";

export function useFavorites() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [activeLandmarkModal, setActiveLandmarkModal] = useState<ActiveLandmarkModalState | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    let mappedFavs: FavoriteItem[] = [];

    try {
      if (supabase && user) {
        const { data: favs, error: favsError } = await supabase
          .from("favorite_places")
          .select("place_id")
          .eq("user_id", user.id);

        if (!favsError && favs && favs.length > 0) {
          const placeIds = favs.map((f: { place_id: string | number }) => f.place_id);
          const { data: favPlaces, error: placesError } = await supabase
            .from("places")
            .select("*")
            .in("id", placeIds);

          if (!placesError && favPlaces) {
            mappedFavs = favPlaces.map((dbPlace: any) => ({
              id: dbPlace.id,
              name: dbPlace.name,
              category: dbPlace.category,
              categoryLabel: dbPlace.category_label,
              briefLocation: dbPlace.brief_location,
              fullAddress: dbPlace.full_address,
              images: dbPlace.images || [],
            }));
          }
        }
      }

      const landmarkFavs = getFavoritedLandmarksAsItems();
      setFavorites([...landmarkFavs, ...mappedFavs]);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      syncUserFavoritesFromSupabase(user.id).then(() => {
        fetchFavorites();
      });
    } else {
      fetchFavorites();
    }

    const handleFavsUpdated = () => {
      fetchFavorites();
    };

    window.addEventListener("favorites_updated", handleFavsUpdated);
    return () => {
      window.removeEventListener("favorites_updated", handleFavsUpdated);
    };
  }, [user, authLoading, fetchFavorites]);

  const handleRemoveFavorite = async (e: React.MouseEvent, item: FavoriteItem) => {
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (item.isLandmark) {
      toggleLandmarkFavorite(item.id.toString());
      setFavorites((prev) => prev.filter((p) => p.id !== item.id));
    } else if (supabase) {
      await supabase
        .from("favorite_places")
        .delete()
        .match({ user_id: user.id, place_id: item.id.toString() });
      setFavorites((prev) => prev.filter((p) => p.id !== item.id));
    }
  };

  const handleItemClick = (item: FavoriteItem) => {
    if (item.isLandmark && item.landmarkObj && item.cityObj) {
      setActiveLandmarkModal({
        landmark: item.landmarkObj,
        city: item.cityObj,
      });
    } else {
      router.push(`${ROUTES.PLACES}/${item.id}`);
    }
  };

  const categories = useMemo(() => {
    return Array.from(
      new Set(favorites.map((f) => getItemCategoryLabel(f)).filter(Boolean))
    );
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) {
      return favorites;
    }
    return favorites.filter((p) => getItemCategoryLabel(p) === selectedCategory);
  }, [favorites, selectedCategory]);

  const getCategoryCount = useCallback(
    (cat: string) => {
      return favorites.filter((f) => getItemCategoryLabel(f) === cat).length;
    },
    [favorites]
  );

  return {
    user,
    authLoading,
    loading,
    favorites,
    filteredFavorites,
    categories,
    selectedCategory,
    setSelectedCategory,
    showAuthModal,
    setShowAuthModal,
    activeLandmarkModal,
    setActiveLandmarkModal,
    handleRemoveFavorite,
    handleItemClick,
    getCategoryCount,
    refreshFavorites: fetchFavorites,
    router,
  };
}
