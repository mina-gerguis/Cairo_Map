"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Place } from "@/data/places";
import { Review } from "@/components/ReviewSection";
import { SortOption } from "../types";

export function usePlaceReviews(id: string) {
  const router = useRouter();
  const { user } = useAuth();

  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Fetch Place and Reviews
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      if (!supabase) return;
      try {
        // Fetch Place details with branches
        const { data: dbPlace, error: placeError } = await supabase
          .from("places")
          .select("*, branches(*)")
          .eq("id", id)
          .single();

        if (placeError) throw placeError;

        if (dbPlace) {
          const mappedPlace: Place = {
            id: dbPlace.id,
            name: dbPlace.name,
            category: dbPlace.category,
            categoryLabel: dbPlace.category_label || dbPlace.category,
            subCategories: Array.isArray(dbPlace.sub_categories)
              ? dbPlace.sub_categories
              : [],
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
            branches: dbPlace.branches
              ? dbPlace.branches.map((b: any) => ({
                  id: b.id,
                  place_id: b.place_id,
                  name: b.name,
                  governorate: b.governorate,
                  city: b.city,
                  fullAddress: b.full_address,
                  phones: b.phones || [],
                  googleMapsUrl: b.google_maps_url,
                  workingHours: b.working_hours,
                  isMain: b.is_main,
                  createdAt: b.created_at,
                }))
              : [],
          };
          setPlace(mappedPlace);
        }

        // Fetch all reviews with profiles and branch details
        const { data: dbReviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("*, profiles(full_name), branches(name, city, governorate, full_address)")
          .eq("place_id", id)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews((dbReviews as unknown as Review[]) || []);
      } catch (err) {
        console.error("Error fetching place reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Theme Setup fallback
    const savedTheme = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
    if (savedTheme) {
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }, [id]);

  // Delete Review Action
  const deleteReview = useCallback(
    async (reviewId: string, ratingScore: number) => {
      if (!user) return;
      if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التعليق؟")) return;

      try {
        if (!supabase) throw new Error("Supabase is not initialized");

        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("id", reviewId);

        if (error) throw error;

        // Update reviews list locally
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));

        // Update local place rating stats
        setPlace((prev) => {
          if (!prev) return prev;
          const currentReviewsCount = prev.reviewsCount || 0;
          const currentRating = prev.rating || 0;
          const newTotalRating = currentRating * currentReviewsCount - ratingScore;
          const newCount = currentReviewsCount - 1;
          const newAverage = newCount > 0 ? newTotalRating / newCount : 0;
          return {
            ...prev,
            rating: newAverage,
            reviewsCount: newCount,
          };
        });
      } catch (err: any) {
        console.error("Error deleting review:", err);
        alert(err.message || "حدث خطأ أثناء حذف التقييم");
      }
    },
    [user]
  );

  // Filtered and Sorted Reviews computation
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by branch
    if (branchFilter !== "all") {
      result = result.filter((r) => r.branch_id === branchFilter);
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      result = result.filter((r) => r.rating === Number(ratingFilter));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });

    return result;
  }, [reviews, branchFilter, ratingFilter, sortBy]);

  // Navigation handlers
  const handleBackToPlace = useCallback(() => {
    if (id) {
      router.push(`/places/${id}`);
    }
  }, [router, id]);

  const handleBackHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    place,
    reviews,
    loading,
    currentUserId: user?.id,
    branchFilter,
    setBranchFilter,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy,
    filteredAndSortedReviews,
    deleteReview,
    handleBackToPlace,
    handleBackHome,
  };
}
