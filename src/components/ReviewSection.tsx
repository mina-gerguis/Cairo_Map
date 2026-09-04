"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Place } from "@/data/places";

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  branch_id?: string;
  profiles?: {
    full_name: string;
  };
  branches?: {
    name: string;
    city: string;
    governorate: string;
    full_address: string;
  };
}

interface ReviewSectionProps {
  place: Place;
  onRatingUpdate?: (newTotalRating: number, newCount: number) => void;
  selectedBranchId?: string | null;
}

export default function ReviewSection({ place, onRatingUpdate, selectedBranchId }: ReviewSectionProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const [ratingInput, setRatingInput] = useState<number>(0);
  const [commentInput, setCommentInput] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (selectedBranchId) {
      setBranchFilter(selectedBranchId);
    } else {
      setBranchFilter("all");
    }
  }, [selectedBranchId]);

  const filteredAndSortedReviews = React.useMemo(() => {
    let result = [...reviews];

    if (branchFilter !== "all") {
      result = result.filter(r => r.branch_id === branchFilter);
    }

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
  }, [reviews, branchFilter, sortBy]);

  useEffect(() => {
    if (!place?.id || !supabase) return;

    const fetchReviews = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, profiles(full_name), branches(name, city, governorate, full_address)')
          .eq('place_id', place.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews((data as unknown as Review[]) || []);

        if (user) {
          const myReview = data?.find(r => r.user_id === user.id);
          if (myReview) {
            setUserReview(myReview as unknown as Review);
            setRatingInput(myReview.rating);
            setCommentInput(myReview.comment || "");
          }
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [place?.id, user]);

  const deleteReview = async () => {
    if (!user || !userReview) return;
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف تقييمك؟")) return;

    setDeletingReview(true);
    setReviewError("");
    try {
      if (!supabase) throw new Error("Supabase is not initialized");

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      // Update reviews list
      const updatedReviews = reviews.filter(r => r.id !== userReview.id);
      setReviews(updatedReviews);

      // Reset form and user review
      setUserReview(null);
      setRatingInput(0);
      setCommentInput("");

      // Update place average rating & reviewsCount in parent component
      if (onRatingUpdate) {
        const newTotalRating = (place.rating || 0) * (place.reviewsCount || 0) - userReview.rating;
        const newCount = (place.reviewsCount || 0) - 1;
        onRatingUpdate(newCount > 0 ? newTotalRating / newCount : 0, newCount);
      }
    } catch (err: any) {
      console.error("Error deleting review:", err);
      setReviewError(err.message || "حدث خطأ أثناء حذف التقييم");
    } finally {
      setDeletingReview(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError("يجب تسجيل الدخول لإضافة تقييم");
      return;
    }
    if (ratingInput < 1 || ratingInput > 5) {
      setReviewError("الرجاء اختيار تقييم من 1 إلى 5 نجوم");
      return;
    }



    setSubmittingReview(true);
    setReviewError("");
    try {
      if (!supabase) throw new Error("Supabase is not initialized");

      const payload = {
        place_id: place.id,
        user_id: user.id,
        branch_id: selectedBranchId || (place.branches?.find(b => b.isMain)?.id) || (place.branches?.[0]?.id) || null,
        rating: ratingInput,
        comment: commentInput,
        updated_at: new Date().toISOString()
      };

      let newReviewData: any;

      if (userReview) {
        const { data, error } = await supabase
          .from('reviews')
          .update(payload)
          .eq('id', userReview.id)
          .select('*, profiles(full_name), branches(name, city, governorate, full_address)')
          .single();
        if (error) throw error;
        newReviewData = data;
        setReviews(reviews.map(r => r.id === newReviewData.id ? newReviewData : r) as unknown as Review[]);
      } else {
        const { data, error } = await supabase
          .from('reviews')
          .insert(payload)
          .select('*, profiles(full_name), branches(name, city, governorate, full_address)')
          .single();
        if (error) throw error;
        newReviewData = data;
        setReviews([newReviewData, ...reviews] as unknown as Review[]);
      }

      setUserReview(newReviewData as unknown as Review);

      if (onRatingUpdate) {
        const newTotalRating = (place.rating || 0) * (place.reviewsCount || 0) - (userReview?.rating || 0) + ratingInput;
        const newCount = userReview ? (place.reviewsCount || 0) : (place.reviewsCount || 0) + 1;
        onRatingUpdate(newCount > 0 ? newTotalRating / newCount : 0, newCount);
      }

    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError(err.message || "حدث خطأ أثناء إرسال التقييم");
    } finally {
      setSubmittingReview(false);
    }
  };

  const displayedReviews = filteredAndSortedReviews.slice(0, 5);

  return (
    <div id="reviews-section" style={{ marginTop: "40px", borderTop: "1px solid rgba(120,120,120,0.1)", paddingTop: "24px" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "20px", color: "var(--textPrimary)" }}>
        التقييمات والتعليقات ({filteredAndSortedReviews.length !== reviews.length ? `${filteredAndSortedReviews.length} من ${reviews.length}` : reviews.length})
      </h2>

      {user ? (
        <div style={{ background: "rgba(120, 120, 120, 0.04)", border: "1px solid var(--borderGlass)", borderRadius: "16px", padding: "20px", marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h5 style={{ fontSize: "1.1rem", margin: 0, fontWeight: "700" }}>
              {userReview ? "تعديل تقييمك" : "أضف تقييمك"}
            </h5>
            {userReview && (
              <button
                type="button"
                onClick={deleteReview}
                disabled={deletingReview}
                style={{
                  background: "rgba(255, 59, 48, 0.1)",
                  color: "#ff3b30",
                  border: "1px solid rgba(255, 59, 48, 0.2)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-cairo)"
                }}
              >
                <i className="bx bx-trash" style={{ fontSize: ".99rem" }}></i>
                {deletingReview ? "جاري الحذف..." : "حذف التقييم"}
              </button>
            )}
          </div>
          <form onSubmit={submitReview}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", direction: "ltr", justifyContent: "flex-end" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRatingInput(star)}
                  style={{ fontSize: "2rem", cursor: "pointer", color: star <= ratingInput ? "#ff9f0a" : "var(--borderGlass)", transition: "color 0.2s" }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="input-fields"
              placeholder="اكتب تعليقك هنا..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={3}
              style={{ marginBottom: "12px", background: "rgba(255,255,255,0.03)" }}
            />
            {reviewError && <div style={{ color: "#ff3b30", fontSize: "0.85rem", marginBottom: "12px" }}>{reviewError}</div>}
            <button
              type="submit"
              disabled={submittingReview || ratingInput === 0}
              className="btn btn-primary"
              style={{ width: "100%", padding: "var(--paddingBtn)", borderRadius: "8px" }}
            >
              {submittingReview ? "جاري الإرسال..." : <><i className="bx bx-save" style={{ fontSize: "1.2rem" }}></i> حفظ التقييم</>}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px", background: "rgba(120, 120, 120, 0.04)", borderRadius: "16px", marginBottom: "30px" }}>
          <p style={{ color: "var(--textSecondary)", marginBottom: "12px" }}>سجل دخولك لتتمكن من تقييم هذا المكان</p>
          <button className="btn btn-primary" onClick={() => router.push("/login")} style={{ padding: "var(--paddingBtn)", borderRadius: "8px" }}><i className="bx bx-log-in" style={{ fontSize: "1.2rem" }}></i> تسجيل الدخول</button>
        </div>
      )}

      {/* Reviews List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "50px" }}>
        {displayedReviews.length > 0 ? (
          displayedReviews.map(review => (
            <div key={review.id} style={{ background: "var(--bgGlass)", border: "1px solid var(--borderGlass)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{
                    color: "#ff9f0a", fontSize: "1.1rem", marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}>

                    <div>
                      {review.branches && (
                        <div style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "flex", alignItems: "center", gap: "6px", background: "rgba(120,120,120,0.1)", padding: "4px 8px", borderRadius: "8px" }}>
                          <span style={{ opacity: 0.8 }}>فرع {review.branches.city}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ alignItems: "left", alignContent: "right" }}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>

                  </div>

                </div>

              </div>
              {review.comment && (
                <p style={{ color: "var(--textPrimary)", fontSize: "0.95rem", lineHeight: "1.5", marginTop: "10px", paddingRight: review.branches ? "4px" : "0" }}>
                  {review.comment}
                </p>
              )}
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: "600" }}>{review.profiles?.full_name || "مستخدم"}</span>
                <span>•</span>
                <span>
                  {new Date(review.created_at).toLocaleDateString("ar-EG", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "var(--textSecondary)", padding: "40px", background: "rgba(120, 120, 120, 0.04)", borderRadius: "16px" }}>
            {reviews.length > 0 ? "لا توجد تعليقات تطابق خيارات التصفية المحددة." : "لا توجد تقييمات حتى الآن. كن أول من يقيّم!"}
          </div>
        )}
      </div>

      {reviews.length > 5 && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            type="button"
            className="btn"
            onClick={() => router.push(`/places/${place.id}/reviews`)}
            style={{
              width: "100%",
              padding: "14px",
              background: "rgba(120, 120, 120, 0.08)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "14px",
              fontWeight: "600",
              color: "var(--colorSecondary)",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <i className="bx bx-show" style={{ fontSize: "1.2rem" }}></i>
            عرض كل التقييمات ({reviews.length})
          </button>
        </div>
      )}
    </div>
  );
}
