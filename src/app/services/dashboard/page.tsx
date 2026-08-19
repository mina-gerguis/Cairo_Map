"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

interface WorkerProfile {
  id: string;
  specialty: string;
  experience_years: number;
  age: number;
  bio: string;
  is_verified: boolean;
  is_available: boolean;
  rating_avg: number;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string;
  created_at: string;
}

interface ServiceRequest {
  id: string;
  client_id: string;
  worker_id: string;
  description: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  created_at: string;
  client_profile?: {
    full_name: string;
    phone: string;
    governorate: string;
    city: string;
  };
  worker_profile?: {
    full_name: string;
    phone: string;
    specialty?: string;
  };
}

const SPECIALTIES_LIST = [
  "سباك",
  "كهربائي",
  "ميكانيكي",
  "طبيب",
  "نجار",
  "نقاش",
  "بناء",
  "فني تكييف",
  "فني دش",
  "خياط"
];

export default function ServicesDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isWorker, setIsWorker] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ServiceRequest[]>([]); // sent to Worker
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]); // placed by Client

  // Worker edit state
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editExp, setEditExp] = useState("0");
  const [editAge, setEditAge] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [deletingWorkerProfile, setDeletingWorkerProfile] = useState(false);

  // New portfolio upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");

  // Review Modals State
  const [activeReviewRequest, setActiveReviewRequest] = useState<ServiceRequest | null>(null);
  const [reviewType, setReviewType] = useState<"client_review" | "worker_review">("worker_review"); // client_review = worker reviewing client
  
  // Review rating fields
  const [rating1, setRating1] = useState(5); // quality / respect
  const [rating2, setRating2] = useState(5); // time / clarity
  const [rating3, setRating3] = useState(5); // price / payment
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Upgrade user to Worker fields
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradeSpecialty, setUpgradeSpecialty] = useState(SPECIALTIES_LIST[0]);
  const [upgradeCustomSpecialty, setUpgradeCustomSpecialty] = useState("");
  const [upgradeExp, setUpgradeExp] = useState("0");
  const [upgradeAge, setUpgradeAge] = useState("");
  const [upgradeBio, setUpgradeBio] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("services_auth_active");
      if (active === "false" || !user) {
        router.push("/services/auth/login");
        return;
      }
    } else if (!user) {
      router.push("/services/auth/login");
      return;
    }

    async function loadDashboardData() {
      if (!supabase || !user) return;
      try {
        // 1. Check if user is worker
        const { data: wProfile, error: wErr } = await supabase
          .from("service_workers")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (wProfile) {
          setIsWorker(true);
          setWorkerProfile(wProfile);
          setEditSpecialty(wProfile.specialty);
          setEditExp(String(wProfile.experience_years));
          setEditAge(String(wProfile.age || ""));
          setEditBio(wProfile.bio || "");
          setEditAvailable(wProfile.is_available);

          // Fetch worker portfolio
          const { data: portData } = await supabase
            .from("worker_portfolio")
            .select("*")
            .eq("worker_id", user.id)
            .order("created_at", { ascending: false });
          if (portData) setPortfolio(portData);

          // Fetch incoming requests sent to worker
          const { data: incData } = await supabase
            .from("service_requests")
            .select(`
              *,
              client_profile:profiles!service_requests_client_id_fkey (
                full_name,
                phone,
                governorate,
                city
              )
            `)
            .eq("worker_id", user.id)
            .order("created_at", { ascending: false });

          if (incData) setIncomingRequests(incData as any[]);
        }

        // 2. Fetch requests placed by user as a Client
        const { data: clientData } = await supabase
          .from("service_requests")
          .select(`
            *,
            worker_profile:profiles!service_requests_worker_id_fkey (
              full_name,
              phone
            ),
            service_workers:worker_id (
              specialty
            )
          `)
          .eq("client_id", user.id)
          .order("created_at", { ascending: false });

        if (clientData) {
          const mapped = clientData.map(item => ({
            ...item,
            worker_profile: {
              ...item.worker_profile,
              specialty: (item.service_workers as any)?.specialty
            }
          }));
          setMyRequests(mapped as any[]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, router]);

  const handleUpdateWorkerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from("service_workers")
        .update({
          specialty: editSpecialty.trim(),
          experience_years: parseInt(editExp) || 0,
          age: parseInt(editAge) || null,
          bio: editBio.trim(),
          is_available: editAvailable
        })
        .eq("id", user.id);

      if (error) {
        alert("فشل تحديث البيانات: " + error.message);
      } else {
        alert("تم تحديث الملف المهني بنجاح!");
        // Refresh profile state
        setWorkerProfile(prev => prev ? {
          ...prev,
          specialty: editSpecialty,
          experience_years: parseInt(editExp) || 0,
          age: parseInt(editAge) || 0,
          bio: editBio,
          is_available: editAvailable
        } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteWorkerProfile = async () => {
    if (!supabase || !user) return;

    const confirmed = window.confirm(
      "هل أنت متأكد من رغبتك في حذف حسابك من سجلات مقدمي الخدمات؟\n\nلن يظهر اسمك أو تخصصك في دليل الخدمات بعد الآن ولن تتلقى طلبات عمل جديدة."
    );
    if (!confirmed) return;

    setDeletingWorkerProfile(true);
    try {
      // 1. Delete portfolio items
      await supabase.from("worker_portfolio").delete().eq("worker_id", user.id);

      // 2. Delete worker profile from service_workers
      const { error } = await supabase
        .from("service_workers")
        .delete()
        .eq("id", user.id);

      if (error) {
        alert("فشل حذف الحساب: " + error.message);
      } else {
        alert("تم حذف حسابك من سجلات مقدمي الخدمات بنجاح.");
        setIsWorker(false);
        setWorkerProfile(null);
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف.");
    } finally {
      setDeletingWorkerProfile(false);
    }
  };

  const handleServicesLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("services_auth_active", "false");
    }
    router.push("/services/auth/login?logged_out=true");
  };

  const handleAddPortfolioImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_port_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to portfolio bucket
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, file);

      if (uploadError) {
        alert("فشل رفع الصورة: " + uploadError.message);
        setUploadingImage(false);
        return;
      }

      // Get public URL
      const { data: pubUrl } = supabase.storage
        .from("portfolio")
        .getPublicUrl(filePath);

      if (pubUrl && pubUrl.publicUrl) {
        const titleToUse = portfolioTitle.trim() || file.name.split('.')[0] || "عمل منجز";
        const { data: insertData, error: dbErr } = await supabase
          .from("worker_portfolio")
          .insert({
            worker_id: user.id,
            image_url: pubUrl.publicUrl,
            title: titleToUse
          })
          .select()
          .single();

        if (dbErr) {
          alert("تم رفع الصورة ولكن فشل حفظها في معرض الأعمال: " + dbErr.message);
        } else if (insertData) {
          setPortfolio(prev => [insertData, ...prev]);
          setPortfolioTitle("");
          alert("تمت إضافة العمل إلى معرض أعمالك بنجاح!");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ أثناء الرفع.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    if (!supabase || !window.confirm("هل أنت متأكد من رغبتك في حذف هذا العمل من محفظتك؟")) return;

    try {
      const { error } = await supabase
        .from("worker_portfolio")
        .delete()
        .eq("id", id);

      if (error) {
        alert("فشل الحذف: " + error.message);
      } else {
        setPortfolio(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: "accepted" | "completed" | "cancelled", isIncoming: boolean) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) {
        alert("فشل تحديث حالة الطلب: " + error.message);
      } else {
        // Update local state
        const updateList = (list: ServiceRequest[]) =>
          list.map(req => req.id === requestId ? { ...req, status: newStatus } : req);

        if (isIncoming) {
          setIncomingRequests(updateList(incomingRequests));
        } else {
          setMyRequests(updateList(myRequests));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReviewModal = (req: ServiceRequest, type: "client_review" | "worker_review") => {
    setActiveReviewRequest(req);
    setReviewType(type);
    setRating1(5);
    setRating2(5);
    setRating3(5);
    setReviewComment("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !activeReviewRequest) return;

    setSubmittingReview(true);
    try {
      if (reviewType === "worker_review") {
        // Client reviews worker
        const { error } = await supabase
          .from("worker_reviews")
          .insert({
            request_id: activeReviewRequest.id,
            client_id: user.id,
            worker_id: activeReviewRequest.worker_id,
            rating_quality: rating1,
            rating_time: rating2,
            rating_price: rating3,
            comment: reviewComment.trim()
          });

        if (error) {
          alert("فشل تقديم التقييم: " + error.message);
        } else {
          alert("تم تقييم الفني بنجاح! شكراً لك.");
          setActiveReviewRequest(null);
        }
      } else {
        // Worker reviews client
        const { error } = await supabase
          .from("client_reviews")
          .insert({
            request_id: activeReviewRequest.id,
            worker_id: user.id,
            client_id: activeReviewRequest.client_id,
            rating_respect: rating1,
            rating_clarity: rating2,
            rating_payment: rating3,
            comment: reviewComment.trim()
          });

        if (error) {
          alert("فشل تقديم التقييم: " + error.message);
        } else {
          alert("تم تقييم العميل بنجاح! شكراً لك.");
          setActiveReviewRequest(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpgradeToWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setUpgrading(true);
    const finalSpecialty = upgradeSpecialty === "أخرى (كتابة تخصص جديد)" ? upgradeCustomSpecialty : upgradeSpecialty;

    if (!finalSpecialty.trim()) {
      alert("يرجى إدخال التخصص الخاص بك.");
      setUpgrading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("service_workers")
        .insert({
          id: user.id,
          specialty: finalSpecialty.trim(),
          experience_years: parseInt(upgradeExp) || 0,
          age: parseInt(upgradeAge) || null,
          bio: upgradeBio.trim(),
          is_available: true
        });

      if (error) {
        alert("فشل تفعيل حساب العامل: " + error.message);
      } else {
        alert("🎉 مبروك! تم تفعيل حساب مقدم الخدمة بنجاح.");
        setIsWorker(true);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <span style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "12px" }}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header Dashboard */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-glass)",
          paddingBottom: "20px"
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-almarai)", fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>
              لوحة تحكم الخدمات
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "4px 0 0" }}>
              مرحباً بك، {profile?.full_name || "مستخدم ماب"} | حساب {isWorker ? "مقدم خدمة (فني)" : "عميل"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link href="/services" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              textDecoration: "none",
              fontWeight: "700"
            }}>
              🔍 تصفح دليل الخدمات
            </Link>
            <button
              onClick={handleServicesLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "var(--accent-danger, #ef4444)",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "700",
                fontFamily: "var(--font-almarai)"
              }}
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>

        {/* WORKER DASHBOARD */}
        {isWorker && workerProfile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Split layout: Profile edit & portfolio */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
              
              {/* Column 1: Manage Profile */}
              <div style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "var(--shadow-card)"
              }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--accent-ios, #3b82f6)" }}>
                  📝 إدارة بياناتك المهنية
                </h2>
                
                <form onSubmit={handleUpdateWorkerProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>التخصص الحالي</label>
                    <input
                      type="text"
                      required
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                      className="ios-input"
                      style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>سنوات الخبرة</label>
                      <input
                        type="number"
                        min="0"
                        value={editExp}
                        onChange={(e) => setEditExp(e.target.value)}
                        className="ios-input"
                        style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>العمر</label>
                      <input
                        type="number"
                        min="16"
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        className="ios-input"
                        style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>نبذة عنك (Bio)</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      style={{
                        height: "80px",
                        padding: "10px",
                        fontSize: "0.85rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        resize: "none",
                        color: "var(--text-primary)",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <input
                      type="checkbox"
                      id="available"
                      checked={editAvailable}
                      onChange={(e) => setEditAvailable(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="available" style={{ fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}>
                      أنا متاح لاستلام طلبات خدمات جديدة الآن
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    style={{
                      height: "38px",
                      borderRadius: "8px",
                      background: "var(--accent-ios, #3b82f6)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "6px"
                    }}
                  >
                    {updatingProfile ? "جاري التحديث..." : "حفظ التعديلات"}
                  </button>

                  <hr style={{ border: "none", height: "1px", background: "var(--border-glass)", margin: "12px 0 6px" }} />

                  <button
                    type="button"
                    onClick={handleDeleteWorkerProfile}
                    disabled={deletingWorkerProfile}
                    style={{
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "var(--accent-danger, #ef4444)",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--accent-danger, #ef4444)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      e.currentTarget.style.color = "var(--accent-danger, #ef4444)";
                    }}
                  >
                    {deletingWorkerProfile ? "جاري الحذف..." : "🗑️ إلغاء التفعيل وحذف الحساب من سجل مقدمي الخدمات"}
                  </button>
                </form>
              </div>

              {/* Column 2: Manage Portfolio / Gallery */}
              <div style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "var(--shadow-card)"
              }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--accent-success, #10b981)" }}>
                  📸 معرض الأعمال المنجزة
                </h2>
                
                {/* Upload Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <input
                    type="text"
                    placeholder="اكتب عنوان الصورة (مثال: تركيب سباكة مطبخ)"
                    value={portfolioTitle}
                    onChange={(e) => setPortfolioTitle(e.target.value)}
                    className="ios-input"
                    style={{ height: "36px", padding: "0 10px", fontSize: "0.82rem" }}
                  />
                  <div style={{
                    border: "2px dashed var(--border-glass)",
                    borderRadius: "10px",
                    padding: "12px",
                    textAlign: "center",
                    position: "relative",
                    backgroundColor: "var(--bg-secondary)",
                    cursor: "pointer"
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddPortfolioImage}
                      disabled={uploadingImage}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {uploadingImage ? "جاري الرفع..." : "➕ اضغط هنا لرفع صورة عمل منجز"}
                    </span>
                  </div>
                </div>

                {/* Portfolio List */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px", maxHeight: "180px", overflowY: "auto", paddingInlineEnd: "4px" }}>
                  {portfolio.map((item) => (
                    <div key={item.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                      <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={() => handleDeletePortfolioItem(item.id)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "rgba(239, 68, 68, 0.8)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          fontSize: "0.6rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Incoming Requests Sent to Worker */}
            <div style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--shadow-card)"
            }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px" }}>
                📥 طلبات الخدمات الواردة إليك
              </h2>

              {incomingRequests.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", margin: 0, padding: "20px" }}>
                  لا توجد طلبات واردة في الوقت الحالي.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {incomingRequests.map((req) => (
                    <div key={req.id} style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>👤 العميل: {req.client_profile?.full_name}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                            📍 {req.client_profile?.governorate}، {req.client_profile?.city} | 📱 {req.client_profile?.phone}
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div style={{
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "15px",
                          height: "fit-content",
                          background: req.status === "pending" ? "rgba(250,204,21,0.15)" : req.status === "accepted" ? "rgba(59,130,246,0.15)" : req.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                          color: req.status === "pending" ? "#d97706" : req.status === "accepted" ? "var(--accent-ios, #3b82f6)" : req.status === "completed" ? "var(--accent-success, #10b981)" : "var(--accent-danger, #ef4444)"
                        }}>
                          {req.status === "pending" ? "قيد الانتظار" : req.status === "accepted" ? "مقبول" : req.status === "completed" ? "مكتمل" : "ملغي"}
                        </div>
                      </div>

                      <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: "4px 0", lineHeight: "1.4" }}>
                        💬 الوصف: {req.description}
                      </p>

                      <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "10px", display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, "cancelled", true)}
                              style={{ height: "32px", padding: "0 14px", borderRadius: "6px", background: "none", border: "1px solid var(--accent-danger, #ef4444)", color: "var(--accent-danger, #ef4444)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}
                            >
                              رفض الطلب
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, "accepted", true)}
                              style={{ height: "32px", padding: "0 14px", borderRadius: "6px", background: "var(--accent-ios, #3b82f6)", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}
                            >
                              قبول الطلب
                            </button>
                          </>
                        )}

                        {req.status === "accepted" && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, "completed", true)}
                            style={{ height: "32px", padding: "0 14px", borderRadius: "6px", background: "var(--accent-success, #10b981)", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}
                          >
                            ✔️ تم إنهاء الخدمة
                          </button>
                        )}

                        {req.status === "completed" && (
                          <button
                            onClick={() => handleOpenReviewModal(req, "client_review")}
                            style={{ height: "32px", padding: "0 14px", borderRadius: "6px", background: "var(--bg-primary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}
                          >
                            ⭐ تقييم هذا العميل
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* CLIENT DASHBOARD */}
        {(!isWorker || myRequests.length > 0) && (
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--shadow-card)",
            marginTop: "28px"
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px" }}>
              📤 طلبات الخدمات التي أرسلتها (الطلبات الصادرة)
            </h2>

            {myRequests.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", margin: 0, padding: "20px" }}>
                لا توجد لديك أي طلبات خدمات صادرة حالياً.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myRequests.map((req) => (
                  <div key={req.id} style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <strong style={{ color: "var(--text-primary)" }}>🛠️ الفني: {req.worker_profile?.full_name} ({req.worker_profile?.specialty})</strong>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                          📱 رقم الهاتف: {req.worker_profile?.phone}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div style={{
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        padding: "4px 10px",
                        borderRadius: "15px",
                        height: "fit-content",
                        background: req.status === "pending" ? "rgba(250,204,21,0.15)" : req.status === "accepted" ? "rgba(59,130,246,0.15)" : req.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                        color: req.status === "pending" ? "#d97706" : req.status === "accepted" ? "var(--accent-ios, #3b82f6)" : req.status === "completed" ? "var(--accent-success, #10b981)" : "var(--accent-danger, #ef4444)"
                      }}>
                        {req.status === "pending" ? "قيد الانتظار" : req.status === "accepted" ? "مقبول" : req.status === "completed" ? "مكتمل" : "ملغي"}
                      </div>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: "4px 0", lineHeight: "1.4" }}>
                      💬 تفاصيل الطلب: {req.description}
                    </p>

                    <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "10px", display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {req.status === "pending" && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "cancelled", false)}
                          style={{ height: "32px", padding: "0 14px", borderRadius: "6px", background: "none", border: "1px solid var(--accent-danger, #ef4444)", color: "var(--accent-danger, #ef4444)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}
                        >
                          إلغاء الطلب
                        </button>
                      )}

                      {req.status === "completed" && (
                        <button
                          onClick={() => handleOpenReviewModal(req, "worker_review")}
                          style={{ height: "32px", padding: "0 14px", borderRadius: "6px", background: "var(--accent-ios, #3b82f6)", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}
                        >
                          ⭐ تقييم الفني وكتابة رأيك
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upgrade to Worker CTA Form (If normal client) */}
        {!isWorker && (
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--shadow-card)",
            marginTop: "28px"
          }}>
            {!showUpgradeForm ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>هل تقدم خدمات وترغب في الانضمام كـ فني / مقدم خدمة؟</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "16px" }}>
                  سجل بيانات مهنتك وخبراتك وابدأ في استقبال طلبات العملاء مجاناً على ماب القاهرة!
                </p>
                <button
                  onClick={() => setShowUpgradeForm(true)}
                  style={{
                    height: "40px",
                    padding: "0 24px",
                    borderRadius: "8px",
                    background: "var(--accent-success, #10b981)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "var(--font-almarai)"
                  }}
                >
                  🛠️ تفعيل حساب فني / مزود خدمة
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-success, #10b981)", marginBottom: "16px" }}>تفعيل الملف المهني كـ مقدم خدمة</h3>
                
                <form onSubmit={handleUpgradeToWorker} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>التخصص المهني</label>
                      <select
                        value={upgradeSpecialty}
                        onChange={(e) => setUpgradeSpecialty(e.target.value)}
                        style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
                      >
                        {SPECIALTIES_LIST.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                        <option value="أخرى (كتابة تخصص جديد)">أخرى (كتابة تخصص جديد)</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>سنوات الخبرة</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={upgradeExp}
                        onChange={(e) => setUpgradeExp(e.target.value)}
                        className="ios-input"
                        style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  {upgradeSpecialty === "أخرى (كتابة تخصص جديد)" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>اكتب تخصصك الجديد</label>
                      <input
                        type="text"
                        required
                        value={upgradeCustomSpecialty}
                        onChange={(e) => setUpgradeCustomSpecialty(e.target.value)}
                        placeholder="مثال: فني كاميرات"
                        className="ios-input"
                        style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>العمر (بالسنوات)</label>
                    <input
                      type="number"
                      min="16"
                      required
                      value={upgradeAge}
                      onChange={(e) => setUpgradeAge(e.target.value)}
                      placeholder="العمر"
                      className="ios-input"
                      style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>نبذة تعريفية مهنية (Bio)</label>
                    <textarea
                      value={upgradeBio}
                      onChange={(e) => setUpgradeBio(e.target.value)}
                      placeholder="اكتب نبذة تجذب العملاء لخدماتك..."
                      style={{
                        height: "80px",
                        padding: "10px",
                        fontSize: "0.85rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        resize: "none",
                        color: "var(--text-primary)",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => setShowUpgradeForm(false)}
                      style={{ height: "36px", padding: "0 16px", borderRadius: "8px", background: "none", border: "1px solid var(--border-glass)", color: "var(--text-secondary)", cursor: "pointer" }}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={upgrading}
                      style={{ height: "36px", padding: "0 20px", borderRadius: "8px", background: "var(--accent-success, #10b981)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" }}
                    >
                      {upgrading ? "جاري التفعيل..." : "تفعيل الحساب كـ فني"}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Review & Rating Modal */}
      {activeReviewRequest && (
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
              onClick={() => setActiveReviewRequest(null)}
              style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}
            >
              ✖️
            </button>

            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px" }}>
              {reviewType === "worker_review" ? "⭐️ تقييم أداء مقدم الخدمة" : "⭐️ تقييم العميل وأسلوب تعامله"}
            </h3>

            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Star Rating Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                {/* Score 1 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: "700" }}>
                    {reviewType === "worker_review" ? "🛠️ جودة العمل المنجز" : "🤝 الاحترام في المعاملة"}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating1(star)}
                        style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: star <= rating1 ? "#facc15" : "var(--text-secondary)" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score 2 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: "700" }}>
                    {reviewType === "worker_review" ? "⏰ الالتزام بالوقت والمواعيد" : "💬 وضوح متطلبات الخدمة"}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating2(star)}
                        style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: star <= rating2 ? "#facc15" : "var(--text-secondary)" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score 3 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: "700" }}>
                    {reviewType === "worker_review" ? "💰 سعر الخدمة المناسب" : "💵 الدفع في الوقت المحدد"}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating3(star)}
                        style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: star <= rating3 ? "#facc15" : "var(--text-secondary)" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Comment text area */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>تعليقك / ملاحظاتك</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="اكتب هنا رأيك بصدق ليفيد الآخرين..."
                  style={{
                    height: "80px",
                    padding: "10px",
                    fontSize: "0.85rem",
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

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setActiveReviewRequest(null)}
                  style={{ height: "36px", padding: "0 16px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", cursor: "pointer" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    height: "36px",
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
                  {submittingReview ? "جاري الإرسال..." : "حفظ التقييم"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
