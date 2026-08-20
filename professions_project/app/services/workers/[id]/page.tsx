"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface WorkerDetails {
  id: string;
  specialty: string;
  experience_years: number;
  age: number;
  bio: string;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_available: boolean;
  is_emergency_available?: boolean;
  status?: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    phone: string;
    email: string;
    governorate: string;
    city: string;
    is_blocked?: boolean;
    is_suspended?: boolean;
  };
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string;
  description: string;
}

interface BeforeAfterItem {
  id: string;
  title: string;
  before_image_url: string;
  after_image_url: string;
}

interface WorkerReview {
  id: string;
  rating_quality: number;
  rating_time: number;
  rating_price: number;
  comment: string;
  created_at: string;
  client_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

function BeforeAfterSlider({ beforeUrl, afterUrl, title }: { beforeUrl: string; afterUrl: string; title: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>{title}</h4>
      <div style={{ position: "relative", width: "100%", height: "220px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
        {/* After image (background) */}
        <img src={afterUrl} alt="بعد الصيانة" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Before image (clipped) */}
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${100 - sliderPos}%`, overflow: "hidden" }}>
          <img src={beforeUrl} alt="قبل الصيانة" style={{ position: "absolute", top: 0, right: 0, height: "100%", maxWidth: "none", width: "100%", objectFit: "cover" }} />
        </div>

        {/* Divider Bar */}
        <div style={{ position: "absolute", top: 0, bottom: 0, right: `${100 - sliderPos}%`, width: "3px", background: "#ffffff", boxShadow: "0 0 10px rgba(0,0,0,0.5)", zIndex: 10 }} />

        {/* Labels */}
        <span style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", zIndex: 11 }}>
          قبل ⬅️
        </span>
        <span style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(16,185,129,0.85)", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", zIndex: 11 }}>
          بعد ✨
        </span>

        {/* Interactive Slider Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "ew-resize", zIndex: 15 }}
        />
      </div>
    </div>
  );
}

export default function WorkerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params?.id as string;
  const { user, profile } = useAuth();

  const [worker, setWorker] = useState<WorkerDetails | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfterItem[]>([]);
  const [reviews, setReviews] = useState<WorkerReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [servicesAuthActive, setServicesAuthActive] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("services_auth_active");
      setServicesAuthActive(active !== "false");
    }
  }, []);

  const isServicesUserLoggedIn = !!user && servicesAuthActive;

  // Modals & Forms State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDescription, setRequestDescription] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Add Review Modal State
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newRatingQuality, setNewRatingQuality] = useState(5);
  const [newRatingTime, setNewRatingTime] = useState(5);
  const [newRatingPrice, setNewRatingPrice] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Rating Restrictions State
  const [hasCompletedTask, setHasCompletedTask] = useState(false);
  const [completedRequestId, setCompletedRequestId] = useState<string | null>(null);
  const [hasRated, setHasRated] = useState(false);

  // Lightbox Image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchAllDetails = React.useCallback(async () => {
    if (!workerId) return;
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      // 1. Fetch worker profile
      const { data: workerData, error: workerErr } = await supabase
        .from("service_workers")
        .select("*")
        .eq("id", workerId)
        .maybeSingle();

      if (workerErr) console.error("Error fetching worker profile:", workerErr);
      if (workerData) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, phone, email, governorate, city, is_blocked, is_suspended")
          .eq("id", workerId)
          .maybeSingle();

        setWorker({
          ...workerData,
          profiles: profileData || {
            full_name: "مقدم خدمة",
            avatar_url: "",
            phone: "",
            email: "",
            governorate: "",
            city: ""
          }
        } as any);
      }

      // 2. Fetch portfolio
      const { data: portfolioData, error: portErr } = await supabase
        .from("worker_portfolio")
        .select("*")
        .eq("worker_id", workerId);

      if (portErr) console.error("Error fetching portfolio:", portErr);
      if (portfolioData) setPortfolio(portfolioData);

      // 3. Fetch Before & After portfolio items
      const { data: baData } = await supabase
        .from("before_after_portfolio")
        .select("*")
        .eq("worker_id", workerId);
      if (baData) setBeforeAfterItems(baData);

      // 4. Fetch reviews on worker
      const { data: reviewsData, error: revErr } = await supabase
        .from("worker_reviews")
        .select(`
          *,
          profiles:client_id (
            full_name,
            avatar_url
          )
        `)
        .eq("worker_id", workerId)
        .order("created_at", { ascending: false });

      if (revErr) console.error("Error fetching reviews:", revErr);
      if (reviewsData) setReviews(reviewsData as any[]);

      // 5. Check if user has a completed task & if user has already rated
      if (user && workerId) {
        const { data: compReqs } = await supabase
          .from("service_requests")
          .select("id")
          .eq("client_id", user.id)
          .eq("worker_id", workerId)
          .eq("status", "completed")
          .limit(1);

        if (compReqs && compReqs.length > 0) {
          setHasCompletedTask(true);
          setCompletedRequestId(compReqs[0].id);
        } else {
          setHasCompletedTask(false);
          setCompletedRequestId(null);
        }

        const { data: userRev } = await supabase
          .from("worker_reviews")
          .select("id")
          .eq("client_id", user.id)
          .eq("worker_id", workerId)
          .limit(1);

        setHasRated(!!userRev && userRev.length > 0);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workerId, user]);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !workerId) return;

    if (user.id === workerId) {
      alert("لا يمكنك تقييم حسابك المهني الخاص!");
      return;
    }

    if (!hasCompletedTask) {
      alert("عفواً، لا يمكنك تقديم تقييم إلا بعد إنجاز خدمة مكتملة مع هذا المهني.");
      return;
    }

    // Double check database directly to ensure user hasn't already rated
    const { data: existingCheck } = await supabase
      .from("worker_reviews")
      .select("id")
      .eq("client_id", user.id)
      .eq("worker_id", workerId)
      .limit(1);

    if (existingCheck && existingCheck.length > 0) {
      alert("عفواً، لقد قمت بتقييم هذا المهني سابقاً. يُسمح بالتقييم مرة واحدة فقط.");
      setHasRated(true);
      setShowAddReviewModal(false);
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from("worker_reviews")
        .insert({
          worker_id: workerId,
          client_id: user.id,
          request_id: completedRequestId || null,
          rating_quality: newRatingQuality,
          rating_time: newRatingTime,
          rating_price: newRatingPrice,
          comment: newReviewComment.trim()
        });

      if (error) {
        alert("فشل تقديم التقييم: " + error.message);
      } else {
        alert("تم إرسال تقييمك بنجاح! شكراً لك.");
        setShowAddReviewModal(false);
        setHasRated(true);
        setNewReviewComment("");
        setNewRatingQuality(5);
        setNewRatingTime(5);
        setNewRatingPrice(5);
        fetchAllDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !workerId) return;

    setSubmittingRequest(true);
    try {
      // Ensure profile exists for client_id to prevent service_requests_client_id_fkey violation
      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .limit(1);

      if (!profileCheck || profileCheck.length === 0) {
        const fallbackName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "عميل";
        const fallbackUsername = profile?.username || user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${user.id.slice(0, 6)}`;
        
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: fallbackName,
          username: fallbackUsername,
          email: user.email || ""
        }, { onConflict: "id" });
      }

      // Ensure profile exists for worker_id as well
      const { data: workerProfileCheck } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", workerId)
        .limit(1);

      if (!workerProfileCheck || workerProfileCheck.length === 0) {
        await supabase.from("profiles").upsert({
          id: workerId,
          full_name: worker?.profiles?.full_name || "فني",
          username: `worker_${workerId.slice(0, 6)}`,
          email: `${workerId.slice(0, 8)}@worker.local`
        }, { onConflict: "id" });
      }

      const { error } = await supabase
        .from("service_requests")
        .insert({
          client_id: user.id,
          worker_id: workerId,
          description: requestDescription.trim(),
          scheduled_date: requestDate || null,
          scheduled_time: requestTime || null,
          status: "pending"
        });

      if (error) {
        alert("فشل إرسال الطلب: " + error.message);
      } else {
        // Create notification for worker (sound + push notification)
        const clientName = profile?.full_name || user.email?.split("@")[0] || "عميل";
        const shortDesc = requestDescription.trim().slice(0, 60);

        await supabase.from("notifications").insert({
          user_id: workerId,
          title: "🛠️ طلب خدمة جديدة!",
          message: `طلب منك ${clientName} خدمة جديدة: "${shortDesc}${requestDescription.trim().length > 60 ? "..." : ""}"${requestDate ? ` (الموعد: ${requestDate} ${requestTime || ''})` : ''}`,
          type: "info",
          link: "/services/dashboard"
        });

        setRequestSuccess(true);
        setRequestDescription("");
        setRequestDate("");
        setRequestTime("");
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)", color: "var(--text-secondary)" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "12px", fontFamily: "var(--font-almarai)" }}>جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)", color: "var(--text-secondary)", padding: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>⚠️</div>
          <h2 style={{ color: "var(--text-primary)", fontWeight: "700" }}>مقدم الخدمة غير موجود</h2>
          <p>ربما تم إلغاء تفعيل الحساب أو حذفه.</p>
          <Link href="/services" style={{ color: "var(--accent-ios, #3b82f6)", textDecoration: "none", fontWeight: "700" }}>العودة للدليل</Link>
        </div>
      </div>
    );
  }

  if (worker.status === "blocked" || worker.status === "suspended" || worker.profiles?.is_blocked || worker.profiles?.is_suspended) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)", color: "var(--text-secondary)", padding: "20px", direction: "rtl" }}>
        <div style={{ textAlign: "center", maxWidth: "450px", background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-glass)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "14px" }}>🛑</div>
          <h2 style={{ color: "var(--text-primary)", fontWeight: "700", marginBottom: "10px" }}>الحساب غير متاح حالياً</h2>
          <p style={{ lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.92rem" }}>
            عفواً، هذا الحساب موقوف أو محظور حالياً من قِبل إدارة الموقع وغير متاح لاستقبال أي طلبات جديدة.
          </p>
          <Link href="/services" style={{ display: "inline-block", background: "var(--accent-ios, #3b82f6)", color: "#fff", padding: "12px 24px", borderRadius: "12px", textDecoration: "none", fontWeight: "700" }}>
            العودة لدليل الخدمات
          </Link>
        </div>
      </div>
    );
  }

  // Calculate detailed averages
  const avgQuality = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating_quality, 0) / reviews.length).toFixed(1) : "0";
  const avgTime = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating_time, 0) / reviews.length).toFixed(1) : "0";
  const avgPrice = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating_price, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="metro-animate-fade" style={{ minHeight: "100vh", padding: "40px 20px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Back Link */}
        <Link href="/services" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-secondary)",
          textDecoration: "none",
          fontSize: "0.9rem",
          fontWeight: "700",
          marginBottom: "24px"
        }}>
          ⬅️ العودة للدليل
        </Link>

        {/* Profile Info Card */}
        <div className="metro-animate-slide-up" style={{
          background: "var(--bg-primary)",
          border: `1px solid ${worker.is_verified ? "rgba(59,130,246,0.35)" : "var(--border-glass)"}`,
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          marginBottom: "24px"
        }}>

          {/* Main top bar */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "space-between" }}>

            {/* Left: Avatar, Name, Specialty */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              {worker.profiles?.avatar_url ? (
                <img
                  src={worker.profiles.avatar_url}
                  alt={worker.profiles.full_name}
                  style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-glass)" }}
                />
              ) : (
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  fontWeight: "700"
                }}>
                  {worker.profiles?.full_name ? worker.profiles.full_name.charAt(0) : "🛠️"}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column" }}>
                <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  {worker.profiles?.full_name}
                  {worker.is_verified && (

                    <Image
                      title="حساب موثق رسمياً من الإدارة"
                      src="/images/verification.png"
                      alt="Verified"
                      width={20}
                      height={20} />

                  )}
                </h1>
                <span style={{ fontSize: "0.95rem", color: "var(--accent-ios, #3b82f6)", fontWeight: "700", marginTop: "4px" }}>
                  💼 {worker.specialty}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  📍 {worker.profiles?.governorate}، {worker.profiles?.city}
                </span>
              </div>
            </div>

            {/* Right: Actions or Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  width: "fit-content",
                  background: worker.is_available ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  color: worker.is_available ? "var(--accent-success, #10b981)" : "var(--accent-danger, #ef4444)",
                  border: `1px solid ${worker.is_available ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: worker.is_available ? "#10b981" : "#ef4444" }} />
                  {worker.is_available ? "متاح للعمل" : "مشغول حالياً"}
                </div>

                {worker.is_emergency_available && (
                  <div style={{
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "var(--accent-danger, #ef4444)",
                    border: "1px solid rgba(239, 68, 68, 0.3)"
                  }}>
                    🚨 طوارئ 24/7
                  </div>
                )}
              </div>

              {isServicesUserLoggedIn ? (
                user.id !== worker.id ? (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    style={{
                      height: "40px",
                      width: "100%",
                      borderRadius: "8px",
                      background: "var(--accent-ios, #3b82f6)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "opacity 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    🛠️ طلب خدمة محددة
                  </button>
                ) : (
                  <Link href="/services/dashboard" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "40px",
                    width: "100%",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    textDecoration: "none"
                  }}>
                    💻 إدارة أعمالك
                  </Link>
                )
              ) : (
                <Link href="/services/auth/login" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                  width: "100%",
                  borderRadius: "8px",
                  background: "var(--accent-ios, #3b82f6)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  textAlign: "center"
                }}>
                  🔐 سجل لطلب خدمة
                </Link>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            borderTop: "1px solid var(--border-glass)",
            borderBottom: "1px solid var(--border-glass)",
            padding: "16px 0"
          }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>العمر</span>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px" }}>{worker.age || "غير محدد"} سنة</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>الخبرة</span>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px" }}>{worker.experience_years} سنوات</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>رقم الهاتف</span>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px", direction: "ltr" }}>
                {worker.profiles?.phone || "غير متوفر"}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>التقييم</span>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px", color: "#facc15" }}>
                ★ {worker.rating_avg > 0 ? worker.rating_avg.toFixed(2) : "لا يوجد"}
              </div>
            </div>
          </div>

          {/* Bio */}
          {worker.bio && (
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "8px" }}>نبذة تعريفية</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
                {worker.bio}
              </p>
            </div>
          )}
        </div>

        {/* Before & After Interactive Slider Portfolio */}
        {beforeAfterItems.length > 0 && (
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--shadow-card)",
            marginBottom: "24px"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px" }}>✨ معرض الأعمال (قبل وبعد الصيانة)</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "16px"
            }}>
              {beforeAfterItems.map((item) => (
                <BeforeAfterSlider
                  key={item.id}
                  title={item.title}
                  beforeUrl={item.before_image_url}
                  afterUrl={item.after_image_url}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standard Portfolio Gallery Section */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "var(--shadow-card)",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px" }}>📸 معرض الأعمال المنجزة</h3>
          {portfolio.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, textAlign: "center", padding: "16px" }}>
              لا توجد صور أعمال مرفوعة في محفظة هذا العامل بعد.
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "12px"
            }}>
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item.image_url)}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid var(--border-glass)",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    insetInline: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    color: "#ffffff",
                    padding: "6px 8px",
                    fontSize: "0.72rem",
                    fontWeight: "700"
                  }}>
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "var(--shadow-card)"
        }}>
          <div id="reviews" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0 }}>⭐ آراء وتقييمات العملاء</h3>
            {isServicesUserLoggedIn ? (
              user.id !== worker.id ? (
                hasRated ? (
                  <span style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "var(--accent-success, #10b981)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    ✅ لقد قمت بتقييم هذا المهني سابقاً
                  </span>
                ) : !hasCompletedTask ? (
                  <span style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "var(--accent-warning, #f59e0b)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }} title="التقييم متاح فقط للعملاء الذين تم إنجاز خدمة مكتملة لهم من قِبل هذا الفني">
                    🔒 التقييم متاح فقط بعد إنجاز خدمة مكتملة
                  </span>
                ) : (
                  <button
                    onClick={() => setShowAddReviewModal(true)}
                    style={{
                      background: "var(--accent-ios, #3b82f6)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "opacity 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    ⭐ أضف تقييمك لمقدم الخدمة
                  </button>
                )
              ) : null
            ) : (
              <Link
                href="/services/auth/login"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--accent-ios, #3b82f6)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  textDecoration: "none"
                }}
              >
                🔑 سجل الدخول لإضافة تقييم
              </Link>
            )}
          </div>

          {/* Detailed rating stats */}
          {reviews.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              background: "var(--bg-secondary)",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "24px"
            }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>جودة العمل المنجز</span>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px", color: "var(--accent-ios, #3b82f6)" }}>
                  {avgQuality} / 5
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>الالتزام بالمواعيد</span>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px", color: "var(--accent-success, #10b981)" }}>
                  {avgTime} / 5
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>السعر المناسب</span>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "4px", color: "#facc15" }}>
                  {avgPrice} / 5
                </div>
              </div>
            </div>
          )}

          {/* List of reviews */}
          {reviews.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, textAlign: "center", padding: "16px" }}>
              لا توجد آراء مسجلة لهذا العامل بعد.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    borderBottom: "1px solid var(--border-glass)",
                    paddingBottom: "16px"
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    {rev.profiles?.avatar_url ? (
                      <img src={rev.profiles.avatar_url} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                        👤
                      </div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: "800", color: "var(--text-primary)" }}>{rev.profiles?.full_name}</h4>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                        {new Date(rev.created_at).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span>🛠️ جودة: {rev.rating_quality}★</span>
                    <span>⏰ مواعيد: {rev.rating_time}★</span>
                    <span>💰 سعر: {rev.rating_price}★</span>
                  </div>

                  {rev.comment && (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: 0, lineHeight: "1.5" }}>
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Request Service Modal (With Date & Time Scheduling) */}
      {showRequestModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "500px",
            padding: "24px",
            boxShadow: "0 20px 30px rgba(0, 0, 0, 0.3)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowRequestModal(false)}
              style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}
            >
              ✖️
            </button>

            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
              🛠️ طلب خدمة وتحديد موعد مع {worker.profiles?.full_name}
            </h3>

            {requestSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span style={{ fontSize: "2.2rem" }}>✅</span>
                <p style={{ color: "var(--accent-success, #10b981)", fontWeight: "700", marginTop: "10px" }}>تم إرسال طلبك بنجاح!</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>وصل إشعار صوتي للفني بمراجعة طلبك والموعد المحدد للرد عليك قريباً.</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>تفاصيل الخدمة المطلوبة</label>
                  <textarea
                    required
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    placeholder="اكتب هنا تفاصيل المشكلة أو الخدمة التي تريدها بالتفصيل..."
                    style={{
                      height: "100px",
                      padding: "10px 12px",
                      fontSize: "0.88rem",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      fontFamily: "var(--font-almarai)",
                      color: "var(--text-primary)",
                      resize: "none",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Scheduling Date & Time */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: "700" }}>تاريخ الزيارة (اختياري)</label>
                    <input
                      type="date"
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      style={{ height: "38px", padding: "0 10px", fontSize: "0.82rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: "700" }}>الوقت المفضل (اختياري)</label>
                    <input
                      type="time"
                      value={requestTime}
                      onChange={(e) => setRequestTime(e.target.value)}
                      style={{ height: "38px", padding: "0 10px", fontSize: "0.82rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    style={{
                      height: "38px",
                      padding: "0 16px",
                      borderRadius: "8px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-primary)",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    style={{
                      height: "38px",
                      padding: "0 20px",
                      borderRadius: "8px",
                      background: "var(--accent-ios, #3b82f6)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {submittingRequest ? (
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    ) : (
                      "إرسال الطلب والتاريخ"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddReviewModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "480px",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowAddReviewModal(false)}
              style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}
            >
              ✖️
            </button>

            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
              ⭐ تقييم مقدم الخدمة ({worker.profiles?.full_name})
            </h3>

            <form onSubmit={handleAddReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>جودة العمل:</span>
                  <select value={newRatingQuality} onChange={(e) => setNewRatingQuality(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>الالتزام بالمواعيد:</span>
                  <select value={newRatingTime} onChange={(e) => setNewRatingTime(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>مناسبة السعر:</span>
                  <select value={newRatingPrice} onChange={(e) => setNewRatingPrice(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>ملاحظاتك أو تعليقك (اختياري)</label>
                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="اكتب انطباعك عن المعاملة والعمل..."
                  style={{
                    height: "80px",
                    padding: "8px 10px",
                    fontSize: "0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    resize: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  style={{ height: "36px", padding: "0 14px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{ height: "36px", padding: "0 18px", borderRadius: "6px", background: "var(--accent-ios, #3b82f6)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" }}
                >
                  {submittingReview ? "جاري الحفظ..." : "إرسال التقييم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
