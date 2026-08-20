"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

interface WorkerEntry {
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
  latitude?: number;
  longitude?: number;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    phone: string;
    governorate: string;
    city: string;
  };
  distanceKm?: number;
}

interface PriceEstimateItem {
  id: string;
  specialty: string;
  service_name: string;
  min_price: number;
  max_price: number;
  unit: string;
}

const SPECIALTY_ICONS: Record<string, string> = {
  "سباك": "🚰",
  "كهربائي": "⚡",
  "ميكانيكي": "🔧",
  "طبيب": "🩺",
  "نجار": "🪚",
  "نقاش": "🎨",
  "بناء": "🧱",
  "فني تكييف": "❄️",
  "فني دش": "📡",
  "خياط": "🧵"
};

// Haversine Distance calculation helper
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

interface ClientRequestItem {
  id: string;
  worker_id: string;
  description: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  created_at: string;
  hasRated?: boolean;
  worker_profile?: {
    full_name: string;
    phone: string;
    avatar_url: string;
    specialty?: string;
  };
}

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [workers, setWorkers] = useState<WorkerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceEstimates, setPriceEstimates] = useState<PriceEstimateItem[]>([]);

  const [servicesAuthActive, setServicesAuthActive] = useState<boolean>(true);

  // User GPS coordinates
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("services_auth_active");
      setServicesAuthActive(active !== "false");
    }
  }, []);

  const handleServicesLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("services_auth_active", "false");
    }
    setServicesAuthActive(false);
    router.push("/services/auth/login?logged_out=true");
  };

  const isServicesLoggedIn = !!user && servicesAuthActive;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [isEmergencyOnly, setIsEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating"); // rating, experience, proximity, new

  // Price Estimator state
  const [showPriceEstimator, setShowPriceEstimator] = useState(false);
  const [selectedEstimateSpecialty, setSelectedEstimateSpecialty] = useState("");
  const [isWorker, setIsWorker] = useState(false);

  // Client Requests Tracking State
  const [showMyRequestsModal, setShowMyRequestsModal] = useState(false);
  const [myClientRequests, setMyClientRequests] = useState<ClientRequestItem[]>([]);
  const [fetchingRequests, setFetchingRequests] = useState(false);

  // Rating Modal inside My Requests Modal
  const [activeRatingReq, setActiveRatingReq] = useState<ClientRequestItem | null>(null);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingTime, setRatingTime] = useState(5);
  const [ratingPrice, setRatingPrice] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingClientReview, setSubmittingClientReview] = useState(false);

  const fetchMyClientRequests = React.useCallback(async () => {
    if (!user || !supabase) return;
    setFetchingRequests(true);
    try {
      // Fetch user reviews
      const { data: myReviews } = await supabase
        .from("worker_reviews")
        .select("worker_id, request_id")
        .eq("client_id", user.id);

      const reviewedWorkerIds = new Set((myReviews || []).map(r => r.worker_id));
      const reviewedReqIds = new Set((myReviews || []).map(r => r.request_id).filter(Boolean));

      // Fetch requests placed by user
      const { data: reqsData } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (reqsData && reqsData.length > 0) {
        const workerIds = Array.from(new Set(reqsData.map(r => r.worker_id)));

        const { data: workerProfiles } = await supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url")
          .in("id", workerIds);

        const { data: workerSpecs } = await supabase
          .from("service_workers")
          .select("id, specialty")
          .in("id", workerIds);

        const profMap = new Map((workerProfiles || []).map(p => [p.id, p]));
        const specMap = new Map((workerSpecs || []).map(w => [w.id, w.specialty]));

        const mapped = reqsData.map(item => {
          const prof = profMap.get(item.worker_id);
          const spec = specMap.get(item.worker_id);
          return {
            ...item,
            hasRated: reviewedReqIds.has(item.id) || reviewedWorkerIds.has(item.worker_id),
            worker_profile: {
              full_name: prof?.full_name || "فني",
              phone: prof?.phone || "",
              avatar_url: prof?.avatar_url || "",
              specialty: spec || ""
            }
          };
        });
        setMyClientRequests(mapped as any[]);
      } else {
        setMyClientRequests([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingRequests(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isServicesLoggedIn) {
      fetchMyClientRequests();
    }
  }, [user, isServicesLoggedIn, fetchMyClientRequests]);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        // Fetch workers
        const { data: workersData, error: wErr } = await supabase
          .from("service_workers")
          .select("*");

        if (workersData && workersData.length > 0) {
          const workerIds = workersData.map(w => w.id);
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, phone, governorate, city, is_blocked, is_suspended")
            .in("id", workerIds);

          const profMap = new Map((profilesData || []).map(p => [p.id, p]));
          const mappedWorkers = workersData.map(w => ({
            ...w,
            profiles: profMap.get(w.id) || {
              full_name: "مقدم خدمة",
              avatar_url: "",
              phone: "",
              governorate: "",
              city: ""
            }
          }));

          setWorkers(mappedWorkers as any[]);
          if (user) {
            setIsWorker(mappedWorkers.some((w: any) => w.id === user.id));
          }
        } else {
          setWorkers([]);
        }

        // Fetch price estimates
        const { data: priceData } = await supabase
          .from("service_price_estimates")
          .select("*")
          .order("specialty");

        if (priceData) {
          setPriceEstimates(priceData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSendClientRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !activeRatingReq) return;

    if (activeRatingReq.status !== "completed") {
      alert("يمكنك التقييم فقط بعد إنجاز الخدمة وتغير حالتها إلى مكتملة.");
      return;
    }

    // Pre-check DB for existing review
    const { data: existingCheck } = await supabase
      .from("worker_reviews")
      .select("id")
      .eq("client_id", user.id)
      .eq("worker_id", activeRatingReq.worker_id)
      .limit(1);

    if (existingCheck && existingCheck.length > 0) {
      alert("عفواً، لقد قمت بتقييم هذا المهني سابقاً. يُسمح بالتقييم مرة واحدة فقط.");
      setActiveRatingReq(null);
      setMyClientRequests(prev => prev.map(r => r.worker_id === activeRatingReq.worker_id ? { ...r, hasRated: true } : r));
      return;
    }

    setSubmittingClientReview(true);
    try {
      const { error } = await supabase
        .from("worker_reviews")
        .insert({
          worker_id: activeRatingReq.worker_id,
          client_id: user.id,
          request_id: activeRatingReq.id,
          rating_quality: ratingQuality,
          rating_time: ratingTime,
          rating_price: ratingPrice,
          comment: ratingComment.trim()
        });

      if (error) {
        alert("فشل إرسال التقييم: " + error.message);
      } else {
        alert("تم إرسال تقييمك بنجاح! شكراً لك.");
        setActiveRatingReq(null);
        setRatingComment("");
        setRatingQuality(5);
        setRatingTime(5);
        setRatingPrice(5);

        setMyClientRequests(prev => prev.map(r =>
          r.id === activeRatingReq.id || r.worker_id === activeRatingReq.worker_id
            ? { ...r, hasRated: true }
            : r
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingClientReview(false);
    }
  };

  const handleGetUserLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("خاصية تحديد الموقع غير مدعومة في متصفحك.");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGettingLocation(false);
        setSortBy("proximity");
        alert("تم تحديد موقعك الجغرافي بنجاح! تم ترتيب الفنيين حسب الأقرب إليك.");
      },
      (err) => {
        setGettingLocation(false);
        alert("تعذر تحديد موقعك الجغرافي. يرجى تفعيل إذن الموقع في المتصفح.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ـ/g, "")
      .toLowerCase();
  };

  // Get unique specialties from loaded workers
  const uniqueSpecialties = React.useMemo(() => {
    const defaultList = ["سباك", "كهربائي", "فني تكييف", "ميكانيكي", "نجار", "نقاش", "بناء", "فني دش", "خياط"];
    const fetched = workers.map(w => w.specialty.trim()).filter(Boolean);
    return Array.from(new Set([...defaultList, ...fetched]));
  }, [workers]);

  // Helper to check if a worker is blocked or suspended
  const isWorkerBlockedOrSuspended = (w: any) => {
    return (
      w.status === "blocked" ||
      w.status === "suspended" ||
      w.profiles?.is_blocked === true ||
      w.profiles?.is_suspended === true
    );
  };

  // Search Suggestions matching search query
  const suggestions = React.useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (!q) return [];
    return workers
      .filter((w) => {
        if (isWorkerBlockedOrSuspended(w)) return false;
        const name = normalizeArabic(w.profiles?.full_name || "");
        const spec = normalizeArabic(w.specialty || "");
        const bio = normalizeArabic(w.bio || "");
        return name.includes(q) || spec.includes(q) || bio.includes(q);
      })
      .slice(0, 5);
  }, [workers, searchQuery]);

  // Cities based on selected governorate
  const cities = selectedGov ? egyptLocations[selectedGov] || [] : [];

  // Filter & Sort logic
  const filteredWorkers = React.useMemo(() => {
    // Exclude blocked or suspended workers from public listings
    let activeWorkers = workers.filter(w => !isWorkerBlockedOrSuspended(w));

    let result = activeWorkers.map(w => {
      let dist: number | undefined = undefined;
      if (userCoords && w.latitude && w.longitude) {
        dist = haversineDistance(userCoords.lat, userCoords.lng, w.latitude, w.longitude);
      }
      return { ...w, distanceKm: dist };
    });

    // 1. Search Query (Name, Specialty, Bio)
    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery.trim());
      result = result.filter(w => {
        const name = normalizeArabic(w.profiles?.full_name || "");
        const spec = normalizeArabic(w.specialty || "");
        const bio = normalizeArabic(w.bio || "");
        return name.includes(q) || spec.includes(q) || bio.includes(q);
      });
    }

    // 2. Emergency 24/7 Filter
    if (isEmergencyOnly) {
      result = result.filter(w => w.is_emergency_available);
    }

    // 3. Governorate Filter
    if (selectedGov) {
      result = result.filter(w => w.profiles?.governorate === selectedGov);
    }

    // 4. City Filter
    if (selectedCity) {
      result = result.filter(w => w.profiles?.city === selectedCity);
    }

    // 5. Specialty Filter
    if (selectedSpecialty) {
      result = result.filter(w => w.specialty === selectedSpecialty);
    }

    // 6. Sorting
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating_avg - a.rating_avg);
    } else if (sortBy === "experience") {
      result.sort((a, b) => b.experience_years - a.experience_years);
    } else if (sortBy === "proximity") {
      result.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else if (sortBy === "new") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [workers, searchQuery, isEmergencyOnly, selectedGov, selectedCity, selectedSpecialty, sortBy, userCoords]);

  const filteredPriceEstimates = priceEstimates.filter(p =>
    !selectedEstimateSpecialty || p.specialty === selectedEstimateSpecialty
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>

      {/* Header Banner */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bg-primary)",
        padding: "28px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
      }}>
        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "600",
            color: "var(--text-primary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <span style={{ fontSize: "2rem" }}>🛠️</span>
            دليل مقدمي الخدمات والصيانة
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "620px", margin: "0 auto 18px", lineHeight: "1.6" }}>
            ابحث عن أفضل الفنيين والحرفيين الموثوقين في منطقتك. استعرض ملفاتهم، تقييماتهم، وتواصل معهم مباشرة.
          </p>

          {/* Directory Stats Badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--accent-ios, #3b82f6)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}>👨‍🔧 {loading ? "..." : workers.length} مقدم خدمة مسجّل</span>

            <span style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "var(--accent-danger, #ef4444)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}>🚨 {workers.filter(w => w.is_emergency_available).length} طوارئ 24/7</span>

            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--accent-success, #10b981)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}>💼 {uniqueSpecialties.length} تخصص مهني</span>
          </div>

          {/* Action Header Buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowPriceEstimator(!showPriceEstimator)}
              style={{
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.35)",
                color: "var(--accent-warning, #f59e0b)",
                padding: "8px 18px",
                borderRadius: "20px",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              📊 حاسبة أسعار الخدمات الشائعة
            </button>

            <button
              onClick={handleGetUserLocation}
              disabled={gettingLocation}
              style={{
                background: userCoords ? "rgba(16,185,129,0.15)" : "var(--bg-secondary)",
                border: `1px solid ${userCoords ? "rgba(16,185,129,0.3)" : "var(--border-glass)"}`,
                color: userCoords ? "var(--accent-success, #10b981)" : "var(--text-primary)",
                padding: "8px 18px",
                borderRadius: "20px",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              📍 {gettingLocation ? "جاري التحديد..." : userCoords ? "تم تحديد الأقرب إليك" : "الأقرب لموقعي (GPS)"}
            </button>

            {isServicesLoggedIn ? (
              <>
                <button
                  onClick={() => setShowMyRequestsModal(true)}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    padding: "8px 18px",
                    borderRadius: "20px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "var(--shadow-card)"
                  }}
                >
                  📋 متابعة طلباتي ({myClientRequests.length})
                </button>

                {isWorker ? (
                  <Link href="/services/dashboard" style={{
                    background: "var(--accent-ios, #3b82f6)", color: "#ffffff",
                    padding: "8px 18px", borderRadius: "20px", textDecoration: "none",
                    fontWeight: "700", fontSize: "0.85rem", boxShadow: "var(--shadow-card)",
                    display: "inline-flex", alignItems: "center", gap: "6px"
                  }}>
                    💻 لوحة التحكم الخاصة بك
                  </Link>
                ) : (
                  <Link href="/services/auth/signup?role=worker" style={{
                    background: "var(--accent-ios, #3b82f6)", color: "#ffffff",
                    padding: "8px 18px", borderRadius: "20px", textDecoration: "none",
                    fontWeight: "700", fontSize: "0.85rem", boxShadow: "var(--shadow-card)",
                    display: "inline-flex", alignItems: "center", gap: "6px"
                  }}>
                    🛠️ انضم كـ مقدم خدمة
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/services/auth/login" style={{
                  background: "var(--accent-ios, #3b82f6)", color: "#ffffff",
                  padding: "8px 18px", borderRadius: "20px", textDecoration: "none",
                  fontWeight: "700", fontSize: "0.85rem", boxShadow: "var(--shadow-card)"
                }}>
                  🔑 تسجيل الدخول
                </Link>
                <Link href="/services/auth/signup?role=worker" style={{
                  background: "var(--bg-secondary)", color: "var(--text-primary)",
                  padding: "8px 18px", borderRadius: "20px", textDecoration: "none",
                  border: "1px solid var(--border-glass)", fontWeight: "700", fontSize: "0.85rem"
                }}>
                  🛠️ انضم كـ مقدم خدمة
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>

        {/* Price Estimator Collapsible Card */}
        {showPriceEstimator && (
          <div className="metro-animate-slide-up" style={{
            background: "var(--bg-primary)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "16px",
            padding: "20px",
            marginTop: "20px",
            boxShadow: "var(--shadow-card)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-warning, #f59e0b)", display: "flex", alignItems: "center", gap: "8px" }}>
                📊 دليل ومتوسط أسعار الخدمات الصيانة بمصر
              </h3>
              <select
                value={selectedEstimateSpecialty}
                onChange={(e) => setSelectedEstimateSpecialty(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 10px",
                  fontSize: "0.82rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "8px",
                  color: "var(--text-primary)"
                }}
              >
                <option value="">جميع التخصصات</option>
                {uniqueSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {filteredPriceEstimates.map(est => (
                <div key={est.id} style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--accent-ios, #3b82f6)", fontWeight: "700" }}>
                    {SPECIALTY_ICONS[est.specialty] || "💼"} {est.specialty}
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {est.service_name}
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-success, #10b981)", marginTop: "4px" }}>
                    {est.min_price} - {est.max_price} ج.م
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                    {est.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters Card */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {/* Main search input */}
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "6px", color: "var(--accent-ios, #3b82f6)" }}></i>
              ابحث عن فني أو مهنة (بالاسم، التخصص، أو المنطقة)
            </label>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="مثال: سباك في المعادي، كهربائي، فني تكييف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="ios-input"
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 14px 0 40px",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-body)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-primary)"
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "1.1rem",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Suggestions list */}
            {isFocused && searchQuery.trim() !== "" && suggestions.length > 0 && (
              <div
                className="metro-animate-fade"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "14px",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                  maxHeight: "320px",
                  overflowY: "auto",
                  padding: "6px 0",
                  direction: "rtl",
                }}
              >
                {suggestions.map((w) => (
                  <div
                    key={w.id}
                    onMouseDown={() => {
                      setSearchQuery(w.profiles?.full_name || "");
                      setIsFocused(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border-glass)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {w.profiles?.avatar_url ? (
                        <img
                          src={w.profiles.avatar_url}
                          alt={w.profiles.full_name}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid var(--border-glass)"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-glass)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem"
                        }}>
                          👨‍🔧
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "2px" }}>
                          {w.profiles?.full_name}
                          {w.is_verified && <Image src="/images/verification.png" alt="Verified"
                            width={15}
                            height={15} />}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--accent-ios, #3b82f6)" }}>
                          💼 {w.specialty}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {w.profiles?.phone && (
                        <a
                          href={`tel:${w.profiles.phone}`}
                          style={{
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "var(--accent-success, #10b981)",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            padding: "4px 10px",
                            borderRadius: "14px",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          📞 اتصل
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency 24/7 & Specialty Filter Chips Bar */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>

            {/* Emergency 24/7 Quick Toggle Button */}
            <button
              onClick={() => setIsEmergencyOnly(!isEmergencyOnly)}
              style={{
                background: isEmergencyOnly ? "rgba(239, 68, 68, 0.9)" : "rgba(239, 68, 68, 0.12)",
                color: isEmergencyOnly ? "#ffffff" : "var(--accent-danger, #ef4444)",
                border: `1px solid ${isEmergencyOnly ? "#ef4444" : "rgba(239, 68, 68, 0.3)"}`,
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "0.82rem",
                fontWeight: "800",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s"
              }}
            >
              🚨 طوارئ 24/7 {isEmergencyOnly ? "(مفعّل)" : ""}
            </button>

            <button
              onClick={() => setSelectedSpecialty("")}
              style={{
                background: selectedSpecialty === "" && !isEmergencyOnly ? "var(--accent-ios, #3b82f6)" : "var(--bg-secondary)",
                color: selectedSpecialty === "" && !isEmergencyOnly ? "#ffffff" : "var(--text-primary)",
                border: `1px solid ${selectedSpecialty === "" && !isEmergencyOnly ? "var(--accent-ios, #3b82f6)" : "var(--border-glass)"}`,
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}
            >
              الكل ✨
            </button>

            {uniqueSpecialties.map((spec) => {
              const active = selectedSpecialty === spec;
              const icon = SPECIALTY_ICONS[spec] || "🛠️";
              return (
                <button
                  key={spec}
                  onClick={() => {
                    setSelectedSpecialty(active ? "" : spec);
                  }}
                  style={{
                    background: active ? "var(--accent-ios, #3b82f6)" : "var(--bg-secondary)",
                    color: active ? "#ffffff" : "var(--text-primary)",
                    border: `1px solid ${active ? "var(--accent-ios, #3b82f6)" : "var(--border-glass)"}`,
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s"
                  }}
                >
                  <span>{icon}</span> {spec}
                </button>
              );
            })}
          </div>

          {/* Dropdown Filters Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px", borderTop: "1px solid var(--border-glass)", paddingTop: "14px" }}>

            {/* Governorate filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>المحافظة</label>
              <select
                value={selectedGov}
                onChange={(e) => {
                  setSelectedGov(e.target.value);
                  setSelectedCity("");
                }}
                style={{
                  height: "40px",
                  padding: "0 10px",
                  fontSize: "0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "10px",
                  fontFamily: "var(--font-body)",
                  color: "var(--text-primary)"
                }}
              >
                <option value="">كل المحافظات 📍</option>
                {governoratesList.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* City filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>المدينة / المنطقة</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedGov}
                style={{
                  height: "40px",
                  padding: "0 10px",
                  fontSize: "0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "10px",
                  fontFamily: "var(--font-body)",
                  color: "var(--text-primary)",
                  opacity: selectedGov ? 1 : 0.6
                }}
              >
                <option value="">كل المدن 🏙️</option>
                {cities.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Sort filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>ترتيب حسب</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  height: "40px",
                  padding: "0 10px",
                  fontSize: "0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "10px",
                  fontFamily: "var(--font-body)",
                  color: "var(--text-primary)"
                }}
              >
                <option value="rating">⭐ التقييم الأعلى</option>
                {userCoords && <option value="proximity">📍 الأقرب إليك أولاً (GPS)</option>}
                <option value="experience">⏳ الأكثر خبرة</option>
                <option value="new">✨ المنضمين حديثاً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workers Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
            <span style={{ display: "inline-block", width: "36px", height: "36px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "14px", fontFamily: "var(--font-body)" }}>جاري تحميل دليل مقدمي الخدمات...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            marginTop: "30px",
            boxShadow: "var(--shadow-card)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontWeight: "700", margin: "0 0 8px", color: "var(--text-primary)" }}>لم نجد أي مقدم خدمة مطابق لبحثك</h3>
            <p style={{ fontSize: "0.9rem" }}>يرجى تعديل خيارات البحث أو الفلاتر المختارة.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
            marginTop: "30px"
          }}>
            {filteredWorkers.map(worker => (
              <div
                key={worker.id}
                style={{
                  backgroundColor: "var(--bg-glass-card, var(--bg-primary))",
                  border: `1px solid ${worker.is_verified ? "rgba(59, 130, 246, 0.35)" : "var(--border-glass)"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, boxShadow 0.2s ease",
                  position: "relative"
                }}
                className="worker-card-hover"
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.1))";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
              >
                {/* Status Badges */}
                <div style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "6px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: worker.is_available ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                    color: worker.is_available ? "var(--accent-success, #10b981)" : "var(--accent-danger, #ef4444)",
                    border: `1px solid ${worker.is_available ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`
                  }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: worker.is_available ? "#10b981" : "#ef4444" }} />
                    {worker.is_available ? "متاح للعمل" : "مشغول حالياً"}
                  </div>

                  {worker.is_emergency_available && (
                    <div style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      padding: "3px 8px",
                      borderRadius: "14px",
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "var(--accent-danger, #ef4444)",
                      border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}>
                      🚨 طوارئ 24/7
                    </div>
                  )}
                </div>

                <div>
                  {/* Top Header: Avatar, Name, Verified */}
                  <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
                    {worker.profiles?.avatar_url ? (
                      <img
                        src={worker.profiles.avatar_url}
                        alt={worker.profiles.full_name}
                        style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-glass)" }}
                      />
                    ) : (
                      <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.3rem",
                        fontWeight: "700"
                      }}>
                        {worker.profiles?.full_name ? worker.profiles.full_name.charAt(0) : "🛠️"}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        {worker.profiles?.full_name}
                        {worker.is_verified && (
                          <Image
                            title="موثوق"
                            src="/images/verification.png" alt="Verified"
                            width={20}
                            height={20} />
                        )}
                      </h3>
                      <span style={{
                        fontSize: "0.82rem",
                        color: "var(--accent-ios, #3b82f6)",
                        fontWeight: "700",
                        marginTop: "2px"
                      }}>
                        {SPECIALTY_ICONS[worker.specialty] || "💼"} {worker.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Ratings & Distance */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", color: "#facc15", fontSize: "0.95rem" }}>
                      {"★".repeat(Math.round(worker.rating_avg))}
                      {"☆".repeat(5 - Math.round(worker.rating_avg))}
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      {worker.rating_avg > 0 ? worker.rating_avg.toFixed(2) : "جديد"}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      ({worker.rating_count} تقييم)
                    </span>

                    {worker.distanceKm !== undefined && (
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: "rgba(16,185,129,0.12)",
                        color: "var(--accent-success, #10b981)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        marginRight: "auto"
                      }}>
                        📍 يبعد {worker.distanceKm.toFixed(1)} كم
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {worker.bio && (
                    <p style={{
                      fontSize: "0.84rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                      margin: "0 0 16px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {worker.bio}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div>
                  <div style={{
                    borderTop: "1px solid var(--border-glass)",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginBottom: "16px"
                  }}>
                    <div>
                      📍 {worker.profiles?.governorate || "مصر"}
                      {worker.profiles?.city ? `، ${worker.profiles.city}` : ""}
                    </div>
                    <div>
                      ⏳ خبرة {worker.experience_years} سنوات
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <Link href={`/services/workers/${worker.id}`} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "38px",
                      borderRadius: "10px",
                      background: "var(--accent-ios, #3b82f6)",
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      textDecoration: "none",
                      transition: "all 0.2s"
                    }}>
                      🔍 التفاصيل والطلب
                    </Link>

                    {worker.profiles?.phone ? (
                      <a href={`tel:${worker.profiles.phone}`} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "var(--accent-success, #10b981)",
                        fontWeight: "700",
                        fontSize: "0.82rem",
                        textDecoration: "none",
                        transition: "all 0.2s"
                      }}>
                        📞 اتصل بالفني
                      </a>
                    ) : (
                      <Link href={`/services/workers/${worker.id}#reviews`} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "38px",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-glass)",
                        color: "var(--text-primary)",
                        fontWeight: "700",
                        fontSize: "0.82rem",
                        textDecoration: "none"
                      }}>
                        ⭐ إضافة تقييم
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Requests Tracking Modal */}
      {showMyRequestsModal && (
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
            maxWidth: "620px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            boxShadow: "0 20px 30px rgba(0,0,0,0.3)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowMyRequestsModal(false)}
              style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}
            >
              ✖️
            </button>

            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              📋 متابعة طلباتي المرسلة للفنيين ({myClientRequests.length})
            </h3>

            <div style={{ overflowY: "auto", flex: 1, paddingLeft: "4px" }}>
              {fetchingRequests ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-secondary)" }}>
                  <span style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid var(--border-glass)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <p style={{ marginTop: "10px", fontSize: "0.85rem" }}>جاري جلب طلباتك...</p>
                </div>
              ) : myClientRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📭</div>
                  <p style={{ margin: 0, fontWeight: "700" }}>لم تقم بطلب أي خدمات حتى الآن</p>
                  <p style={{ fontSize: "0.82rem", marginTop: "4px" }}>تصفح دليل الفنيين بالأسفل واطلب الخدمة المناسبة لك بسهولة.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {myClientRequests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                            🛠️ {req.worker_profile?.full_name || "فني"}
                            {req.worker_profile?.specialty && (
                              <span style={{ fontSize: "0.78rem", color: "var(--accent-ios, #3b82f6)", fontWeight: "700" }}>
                                ({req.worker_profile.specialty})
                              </span>
                            )}
                          </h4>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            تاريخ الطلب: {new Date(req.created_at).toLocaleDateString("ar-EG")}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "0.78rem",
                          fontWeight: "800",
                          background: req.status === "completed"
                            ? "rgba(16,185,129,0.15)"
                            : req.status === "accepted"
                            ? "rgba(59,130,246,0.15)"
                            : req.status === "cancelled"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",
                          color: req.status === "completed"
                            ? "#10b981"
                            : req.status === "accepted"
                            ? "#3b82f6"
                            : req.status === "cancelled"
                            ? "#ef4444"
                            : "#f59e0b"
                        }}>
                          {req.status === "completed"
                            ? "✨ مكتمل بنجاح"
                            : req.status === "accepted"
                            ? "⚡ تم القبول من الفني"
                            : req.status === "cancelled"
                            ? "❌ ملغي"
                            : "⌛ قيد الانتظار"}
                        </span>
                      </div>

                      {/* Description & Schedule */}
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        "{req.description}"
                      </p>

                      {req.scheduled_date && (
                        <div style={{ fontSize: "0.78rem", color: "var(--accent-ios, #3b82f6)", fontWeight: "700" }}>
                          📅 الموعد المحدد: {req.scheduled_date} {req.scheduled_time || ''}
                        </div>
                      )}

                      {/* Phone & Rating Action Row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--border-glass)", paddingTop: "10px", marginTop: "4px", flexWrap: "wrap", gap: "8px" }}>
                        <a
                          href={`tel:${req.worker_profile?.phone}`}
                          style={{ fontSize: "0.8rem", color: "var(--accent-success, #10b981)", textDecoration: "none", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          📞 هاتف الفني: {req.worker_profile?.phone || "غير متوفر"}
                        </a>

                        {req.status === "completed" && (
                          req.hasRated ? (
                            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: "6px" }}>
                              ✅ تم التقييم
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveRatingReq(req)}
                              style={{ padding: "5px 12px", borderRadius: "8px", background: "var(--accent-ios, #3b82f6)", color: "#fff", border: "none", fontWeight: "700", fontSize: "0.78rem", cursor: "pointer" }}
                            >
                              ⭐ تقييم الفني
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal inside My Requests */}
      {activeRatingReq && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "480px",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            position: "relative"
          }}>
            <button
              onClick={() => setActiveRatingReq(null)}
              style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}
            >
              ✖️
            </button>

            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
              ⭐ تقييم الفني ({activeRatingReq.worker_profile?.full_name || "الفني"})
            </h3>

            <form onSubmit={handleSendClientRating} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>جودة العمل:</span>
                  <select value={ratingQuality} onChange={(e) => setRatingQuality(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>الالتزام بالمواعيد:</span>
                  <select value={ratingTime} onChange={(e) => setRatingTime(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>مناسبة السعر:</span>
                  <select value={ratingPrice} onChange={(e) => setRatingPrice(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>ملاحظاتك أو تعليقك (اختياري)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="اكتب انطباعك عن الخدمة المنجزة والتعامل..."
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
                  onClick={() => setActiveRatingReq(null)}
                  style={{ height: "36px", padding: "0 14px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingClientReview}
                  style={{ height: "36px", padding: "0 18px", borderRadius: "6px", background: "var(--accent-ios, #3b82f6)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" }}
                >
                  {submittingClientReview ? "جاري الحفظ..." : "إرسال التقييم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
