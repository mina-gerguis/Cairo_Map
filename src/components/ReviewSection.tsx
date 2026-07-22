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
  const [reviewError, setReviewError] = useState("");

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
    
    if (userReview) {
      const lastUpdate = new Date(userReview.updated_at).getTime();
      const now = new Date().getTime();
      const diffDays = (now - lastUpdate) / (1000 * 60 * 60 * 24);
      
      if (diffDays < 7) {
        setReviewError(`لا يمكنك تعديل التقييم إلا بعد مرور 7 أيام. متبقي ${Math.ceil(7 - diffDays)} أيام.`);
        return;
      }
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

  return (
    <div id="reviews-section" style={{ marginTop: "40px", borderTop: "1px solid rgba(120,120,120,0.1)", paddingTop: "24px" }}>
      <h4 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "20px", color: "var(--text-primary)" }}>
        التقييمات والتعليقات ({reviews.length})
      </h4>

      {user ? (
        <div style={{ background: "rgba(120, 120, 120, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "20px", marginBottom: "30px" }}>
          <h5 style={{ fontSize: "1.1rem", marginBottom: "16px", fontWeight: "700" }}>
            {userReview ? "تعديل تقييمك" : "أضف تقييمك"}
          </h5>
          <form onSubmit={submitReview}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", direction: "ltr", justifyContent: "flex-end" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => setRatingInput(star)}
                  style={{ fontSize: "2rem", cursor: "pointer", color: star <= ratingInput ? "#ff9f0a" : "var(--border-glass)", transition: "color 0.2s" }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea 
              className="ios-input"
              placeholder="اكتب تعليقك هنا (اختياري)..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={3}
              style={{ marginBottom: "12px", background: "rgba(255,255,255,0.03)" }}
            />
            {reviewError && <div style={{ color: "#ff3b30", fontSize: "0.85rem", marginBottom: "12px" }}>{reviewError}</div>}
            <button 
              type="submit" 
              disabled={submittingReview || ratingInput === 0}
              className="ios-btn ios-btn-primary"
              style={{ width: "100%" }}
            >
              {submittingReview ? "جاري الإرسال..." : "حفظ التقييم"}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px", background: "rgba(120, 120, 120, 0.04)", borderRadius: "16px", marginBottom: "30px" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>سجل دخولك لتتمكن من تقييم هذا المكان</p>
          <button className="ios-btn ios-btn-primary" onClick={() => router.push("/login")}>تسجيل الدخول</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ color: "#ff9f0a", fontSize: "1.1rem", marginBottom: "4px" }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                  {review.branches && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", background: "rgba(120,120,120,0.1)", padding: "4px 8px", borderRadius: "8px", width: "fit-content" }}>
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
                    {new Date(review.created_at).toLocaleDateString("ar-EG", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: "1.5", marginTop: "10px", paddingRight: review.branches ? "4px" : "0" }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "20px" }}>
            لا توجد تقييمات حتى الآن. كن أول من يقيّم!
          </div>
        )}
      </div>
    </div>
  );
}
