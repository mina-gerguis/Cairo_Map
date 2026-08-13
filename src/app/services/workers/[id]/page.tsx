"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

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
  profiles: {
    full_name: string;
    avatar_url: string;
    phone: string;
    email: string;
    governorate: string;
    city: string;
  };
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string;
  description: string;
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

export default function WorkerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params?.id as string;
  const { user } = useAuth();

  const [worker, setWorker] = useState<WorkerDetails | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<WorkerReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDescription, setRequestDescription] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Lightbox Image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!workerId) return;

    async function fetchAllDetails() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        // 1. Fetch worker profile
        const { data: workerData, error: workerErr } = await supabase
          .from("service_workers")
          .select(`
            *,
            profiles:id (
              full_name,
              avatar_url,
              phone,
              email,
              governorate,
              city
            )
          `)
          .eq("id", workerId)
          .maybeSingle();

        if (workerErr) console.error("Error fetching worker profile:", workerErr);
        if (workerData) setWorker(workerData as any);

        // 2. Fetch portfolio
        const { data: portfolioData, error: portErr } = await supabase
          .from("worker_portfolio")
          .select("*")
          .eq("worker_id", workerId);

        if (portErr) console.error("Error fetching portfolio:", portErr);
        if (portfolioData) setPortfolio(portfolioData);

        // 3. Fetch reviews on worker
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

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllDetails();
  }, [workerId]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !workerId) return;

    setSubmittingRequest(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        .insert({
          client_id: user.id,
          worker_id: workerId,
          description: requestDescription.trim(),
          status: "pending"
        });

      if (error) {
        alert("فشل إرسال الطلب: " + error.message);
      } else {
        setRequestSuccess(true);
        setRequestDescription("");
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

  // Calculate detailed averages
  const avgQuality = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating_quality, 0) / reviews.length).toFixed(1) : "0";
  const avgTime = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating_time, 0) / reviews.length).toFixed(1) : "0";
  const avgPrice = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating_price, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>
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
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
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
                    <span title="موثق" style={{ color: "var(--accent-ios, #3b82f6)" }}>✔️</span>
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

              {user ? (
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
                    🛠️ طلب خدمة جديدة
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

        {/* Portfolio Gallery Section */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "var(--shadow-card)",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px" }}>📸 معرض الأعمال المنجزة</h3>
          {portfolio.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, textAlign: "center", padding: "20px" }}>
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
          padding: "32px",
          boxShadow: "var(--shadow-card)"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px" }}>⭐ آراء وتقييمات العملاء</h3>
          
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
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, textAlign: "center", padding: "20px" }}>
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

                  {/* Sub-ratings row */}
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

      {/* Request Service Modal */}
      {showRequestModal && (
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
            maxWidth: "500px",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowRequestModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "var(--text-secondary)"
              }}
            >
              ✖️
            </button>

            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "12px", color: "var(--text-primary)" }}>
              طلب خدمة جديدة من {worker.profiles?.full_name}
            </h3>

            {requestSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span style={{ fontSize: "2rem" }}>✅</span>
                <p style={{ color: "var(--accent-success, #10b981)", fontWeight: "700", marginTop: "10px" }}>تم إرسال طلبك بنجاح!</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>سيقوم الفني بمراجعة تفاصيل طلبك والرد عليك قريباً.</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>اكتب تفاصيل الخدمة المطلوبة</label>
                  <textarea
                    required
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    placeholder="اكتب هنا تفاصيل المشكلة أو الخدمة التي تريدها (مثال: محتاج تصليح خلاط مياه وحنفية المطبخ...)"
                    style={{
                      height: "120px",
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

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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
                      "إرسال الطلب"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox / Image Viewer */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            cursor: "pointer"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <img
              src={selectedImage}
              alt="fullscreen"
              style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px", border: "2px solid #fff" }}
            />
            <span style={{
              position: "absolute",
              top: "-30px",
              right: "0",
              color: "#fff",
              fontSize: "1.2rem",
              fontWeight: "700"
            }}>
              ✖️ إغلاق
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
