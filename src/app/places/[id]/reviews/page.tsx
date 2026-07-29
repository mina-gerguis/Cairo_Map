"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Place } from "@/data/places";
import { Review } from "@/components/ReviewSection";

export default function PlaceReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      if (!supabase) return;
      try {
        // Fetch Place details
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
            subCategories: Array.isArray(dbPlace.sub_categories) ? dbPlace.sub_categories : [],
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
            branches: dbPlace.branches ? dbPlace.branches.map((b: any) => ({
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
            })) : []
          };
          setPlace(mappedPlace);
        }

        // Fetch all reviews
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

    // Theme Setup
    const savedTheme = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }, [id]);

  const deleteReview = async (reviewId: string, ratingScore: number) => {
    if (!user) return;
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التعليق؟")) return;

    try {
      if (!supabase) throw new Error("Supabase is not initialized");

      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      // Update reviews list
      const updatedReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(updatedReviews);

      // Update local place stats
      if (place) {
        const newTotalRating = (place.rating || 0) * (place.reviewsCount || 0) - ratingScore;
        const newCount = (place.reviewsCount || 0) - 1;
        const newAverage = newCount > 0 ? newTotalRating / newCount : 0;
        setPlace({
          ...place,
          rating: newAverage,
          reviewsCount: newCount,
        });
      }
    } catch (err: any) {
      console.error("Error deleting review:", err);
      alert(err.message || "حدث خطأ أثناء حذف التقييم");
    }
  };

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

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", direction: "rtl" }}>
        <div style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="app-container" style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", gap: "20px" }}>
        <div style={{ padding: "40px", textAlign: "center" }} className="glass-panel">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "10px" }}>المكان غير موجود</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>عذراً، لم نتمكن من العثور على المكان المطلوب.</p>
          <button className="ios-btn ios-btn-primary" onClick={() => router.push("/")}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingBottom: "100px" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button 
          className="ios-btn"
          onClick={() => router.push(`/places/${place.id}`)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px" }}
        >
          <i className="bx bx-arrow-back" style={{ fontSize: "1.2rem" }}></i>
          العودة للمكان
        </button>

        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>كل التقييمات</h3>
      </div>

      {/* Place Summary Header */}
      <div className="glass-panel" style={{ padding: "24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>{place.name}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "4px" }}>
            {place.categoryLabel} • {place.city} / {place.governorate}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255, 159, 10, 0.08)", padding: "12px 20px", borderRadius: "16px", border: "1px solid rgba(255, 159, 10, 0.15)" }}>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#ff9f0a" }}>
            {Number(place.rating || 0).toFixed(1)}
          </div>
          <div>
            <div style={{ color: "#ff9f0a", fontSize: "1.1rem" }}>
              {"★".repeat(Math.round(place.rating || 0)) + "☆".repeat(5 - Math.round(place.rating || 0))}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              بناءً على {place.reviewsCount || 0} تقييم
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div style={{ 
        display: "flex", 
        gap: "12px", 
        marginBottom: "24px", 
        flexWrap: "wrap", 
        alignItems: "center",
        background: "rgba(120, 120, 120, 0.04)",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid var(--border-glass)"
      }}>
        {/* Branch Filter */}
        {place.branches && place.branches.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 180px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", whiteSpace: "nowrap" }}>📍 الفرع:</span>
            <select 
              className="ios-input help-select" 
              value={branchFilter} 
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ margin: 0, padding: "6px 12px", fontSize: "0.85rem", height: "36px", flex: 1, background: "rgba(255, 255, 255, 0.05)" }}
            >
              <option value="all">كل الفروع</option>
              {place.branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
              ))}
            </select>
          </div>
        )}

        {/* Rating Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 180px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", whiteSpace: "nowrap" }}>⭐ التقييم:</span>
          <select 
            className="ios-input help-select" 
            value={ratingFilter} 
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{ margin: 0, padding: "6px 12px", fontSize: "0.85rem", height: "36px", flex: 1, background: "rgba(255, 255, 255, 0.05)" }}
          >
            <option value="all">كل التقييمات</option>
            <option value="5">5 نجوم</option>
            <option value="4">4 نجوم</option>
            <option value="3">3 نجوم</option>
            <option value="2">2 نجوم</option>
            <option value="1">نجمة واحدة</option>
          </select>
        </div>

        {/* Sort Order */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 180px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", whiteSpace: "nowrap" }}>⇅ الترتيب:</span>
          <select 
            className="ios-input help-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ margin: 0, padding: "6px 12px", fontSize: "0.85rem", height: "36px", flex: 1, background: "rgba(255, 255, 255, 0.05)" }}
          >
            <option value="newest">الوقت: الأحدث أولاً</option>
            <option value="oldest">الوقت: الأقدم أولاً</option>
            <option value="highest">التقييم: الأعلى للأدنى</option>
            <option value="lowest">التقييم: الأدنى للأعلى</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredAndSortedReviews.length > 0 ? (
          filteredAndSortedReviews.map((review) => (
            <div key={review.id} style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ color: "#ff9f0a", fontSize: "1.1rem" }}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                    {user && user.id === review.user_id && (
                      <button
                        onClick={() => deleteReview(review.id, review.rating)}
                        style={{
                          background: "rgba(255, 59, 48, 0.1)",
                          color: "#ff3b30",
                          border: "none",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px"
                        }}
                      >
                        <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i>
                        حذف التعليق
                      </button>
                    )}
                  </div>
                  {review.branches && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", background: "rgba(120,120,120,0.1)", padding: "4px 8px", borderRadius: "8px", width: "fit-content", marginTop: "6px" }}>
                      <span>🏢</span>
                      <span style={{ fontWeight: "600" }}>{review.branches.name}</span>
                      <span>-</span>
                      <span style={{ opacity: 0.8 }}>{review.branches.city}</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: "600" }}>{review.profiles?.full_name || "مستخدم"}</span>
                  <span>•</span>
                  <span>
                    {new Date(review.created_at).toLocaleDateString("ar-EG", { month: "short", year: "numeric", day: "numeric" })}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: "1.5", marginTop: "10px" }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px", background: "rgba(120, 120, 120, 0.04)", borderRadius: "16px" }}>
            لا توجد تقييمات تطابق خيارات التصفية المحددة.
          </div>
        )}
      </div>
    </div>
  );
}
