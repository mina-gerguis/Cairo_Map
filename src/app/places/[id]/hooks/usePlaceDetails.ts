"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Place, OLD_CATEGORY_TO_MAIN_MAP } from "@/data/places";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { haversineDistance, getDefiniteCategoryName } from "@/app/places/utils";
import { CATEGORY_LABELS } from "../constants";

export function usePlaceDetails(id: string) {
  const router = useRouter();
  const { user, profile, isPageOpen } = useAuth();

  const [place, setPlace] = useState<Place | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  // Access status
  const promoStatus = isPageOpen("/places")?.isOpen
    ? isPageOpen("/places")
    : isPageOpen("/directions");
  const isExpired =
    profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = Boolean(
    profile?.is_admin ||
      promoStatus?.isOpen ||
      ((profile?.subscription_tier === "mishwar" ||
        profile?.subscription_tier === "silver" ||
        profile?.subscription_tier === "gold") &&
        !isExpired)
  );

  // 1. Fetch place from Supabase
  useEffect(() => {
    if (!id) return;

    const fetchPlace = async () => {
      if (!supabase) return;
      try {
        const { data: dbPlace, error } = await supabase
          .from("places")
          .select("*, branches(*)")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (dbPlace) {
          const oldCat = dbPlace.category;
          let finalCategory = oldCat;
          let finalCategoryLabel =
            dbPlace.category_label || CATEGORY_LABELS[oldCat] || oldCat;
          let finalSubCategories = Array.isArray(dbPlace.sub_categories)
            ? [...dbPlace.sub_categories]
            : [];

          // Old flat category mapping
          const mainCatKey = Object.keys(OLD_CATEGORY_TO_MAIN_MAP).find(
            (key) => key === oldCat
          );
          if (mainCatKey) {
            finalCategory = OLD_CATEGORY_TO_MAIN_MAP[mainCatKey];
            finalCategoryLabel = CATEGORY_LABELS[finalCategory] || finalCategory;
            if (!finalSubCategories.includes(oldCat)) {
              finalSubCategories.push(oldCat);
            }
          }

          const mappedPlace: Place = {
            id: dbPlace.id,
            name: dbPlace.name,
            name_en: dbPlace.name_en || "",
            category: finalCategory,
            categoryLabel: finalCategoryLabel,
            subCategories: finalSubCategories,
            place_type: dbPlace.place_type || null,
            place_type_icon: dbPlace.place_type_icon || null,
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
                  media: b.media || [],
                  isMain: b.is_main,
                  createdAt: b.created_at,
                  website_url: b.website_url,
                  features: Array.isArray(b.features) ? b.features : [],
                  services: Array.isArray(b.services) ? b.services : [],
                }))
              : [],
          };
          setPlace(mappedPlace);
        } else {
          setPlace(null);
        }
      } catch (err) {
        console.error("Error fetching place:", err);
        setPlace(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();

    // Setup theme from localStorage
    const savedTheme = localStorage.getItem("dftry_theme") as
      | "dark"
      | "light"
      | null;
    if (savedTheme) {
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, [id]);

  // 2. Select initial branch (nearest or main)
  useEffect(() => {
    if (place && place.branches && place.branches.length > 0 && !selectedBranchId) {
      if (userLocation) {
        let minDist = Infinity;
        let closestId = place.branches[0].id;
        place.branches.forEach((b) => {
          if (b.latitude && b.longitude) {
            const d = haversineDistance(
              userLocation.latitude,
              userLocation.longitude,
              b.latitude,
              b.longitude
            );
            if (d < minDist) {
              minDist = d;
              closestId = b.id;
            }
          }
        });
        setSelectedBranchId(closestId);
      } else {
        const main = place.branches.find((b) => b.isMain);
        setSelectedBranchId(main ? main.id : place.branches[0].id);
      }
    }
  }, [place, userLocation, selectedBranchId]);

  // 3. Check if favorite
  useEffect(() => {
    if (!user || !id || !supabase) return;

    const checkFavorite = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("favorite_places")
          .select("id")
          .eq("place_id", id)
          .eq("user_id", user.id);

        if (error) throw error;
        setIsFavorite(data && data.length > 0);
      } catch (err) {
        console.error("Error checking favorite:", err);
      }
    };

    checkFavorite();
  }, [id, user]);

  // 4. Toggle favorite
  const toggleFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (togglingFav) return;
    setTogglingFav(true);
    try {
      if (!supabase) throw new Error("Supabase is not initialized");

      if (isFavorite) {
        const { error } = await supabase
          .from("favorite_places")
          .delete()
          .match({ user_id: user.id, place_id: id });
        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from("favorite_places")
          .insert({ user_id: user.id, place_id: id });
        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setTogglingFav(false);
    }
  };

  // 5. Active branch & display calculations
  const selectedBranch = place?.branches?.find((b) => b.id === selectedBranchId);
  const displayBranch = {
    ...place,
    ...(selectedBranch || {}),
    phones:
      selectedBranch?.phones && selectedBranch.phones.length > 0
        ? selectedBranch.phones
        : place?.phones || [],
    workingHours: selectedBranch?.workingHours || place?.workingHours || "",
    fullAddress: selectedBranch?.fullAddress || place?.fullAddress || "",
  };

  const currentDistance =
    userLocation && displayBranch.latitude && displayBranch.longitude
      ? haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          displayBranch.latitude,
          displayBranch.longitude
        )
      : null;

  // 6. Media list for slider and lightbox
  const mediaList =
    displayBranch?.media && displayBranch.media.length > 0
      ? displayBranch.media
      : place?.menuImages || [];

  // 7. Lightbox controls
  const nextMedia = () => {
    if (activeMenuIndex === null || mediaList.length === 0) return;
    setActiveMenuIndex((prev) => ((prev ?? 0) + 1) % mediaList.length);
  };

  const prevMedia = () => {
    if (activeMenuIndex === null || mediaList.length === 0) return;
    setActiveMenuIndex(
      (prev) => ((prev ?? 0) - 1 + mediaList.length) % mediaList.length
    );
  };

  useEffect(() => {
    if (activeMenuIndex === null || mediaList.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextMedia();
      } else if (e.key === "ArrowLeft") {
        prevMedia();
      } else if (e.key === "Escape") {
        setActiveMenuIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMenuIndex, mediaList]);

  // 8. Share place
  const handleShare = async () => {
    if (!place) return;
    const categoryText = getDefiniteCategoryName(
      place.category,
      place.categoryLabel
    );
    const shareText = `لقد وجدت هذا ${categoryText} وموجود في ${place.city} ${place.governorate} هيا نلقي نظرة عليه`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert("تم نسخ رسالة المشاركة ورابط المكان إلى الحافظة!");
      } catch (err) {
        console.error("Failed to copy:", err);
        alert("عذراً، لم نتمكن من نسخ الرابط.");
      }
    }
  };

  // 9. Update rating & reviews count
  const handleRatingUpdate = (newRating: number, newCount: number) => {
    if (place) {
      setPlace({ ...place, rating: newRating, reviewsCount: newCount });
    }
  };

  return {
    place,
    setPlace,
    loading,
    selectedBranchId,
    setSelectedBranchId,
    displayBranch,
    currentDistance,
    isFavorite,
    togglingFav,
    toggleFavorite,
    activeMenuIndex,
    setActiveMenuIndex,
    mediaList,
    nextMedia,
    prevMedia,
    handleShare,
    handleRatingUpdate,
    hasAccess,
    user,
  };
}
