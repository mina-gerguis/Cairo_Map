"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Place, DEFAULT_CATEGORIES, FEATURES_LIST } from "@/data/places";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getTodayWorkingHoursText, parseWorkingHours, DAYS_OF_WEEK, isCurrentlyOpen } from "@/lib/workingHours";
import ReviewSection from "@/components/ReviewSection";
import ReportProblemModal from "@/components/ReportProblemModal";
import PlaceNoteModal from "@/components/PlaceNoteModal";

// Icon
import { FaMapMarkerAlt, FaPhoneAlt  } from "react-icons/fa";
import { BiSolidMapPin } from "react-icons/bi";
import { GrFavorite } from "react-icons/gr";
import { MdOutlineFavorite } from "react-icons/md";
import { TbListDetailsFilled } from "react-icons/tb";

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: "bx-restaurant",
  cafe: "bx-coffee",
  garden: "bx-tree",
  medicalCenter: "bx-plus-medical",
  health_beauty: "bx-spa",
  family: "bx-group",
  quiet_places: "bx-moon",
  kids: "bx-child",
  amusement_aqua: "bx-party",
  work: "bx-briefcase",
  courses_study: "bx-book-open",
  hotel: "bx-hotel",
  cinema: "bx-film",
  mall: "bx-shopping-bag",
  outings: "bx-compass",
};

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "مطاعم",
  cafe: "كافيهات",
  garden: "حدائق",
  medicalCenter: "مراكز طبية",
  health_beauty: "الصحة والجمال",
  family: "اماكن عائلية",
  quiet_places: "اماكن هادئه",
  kids: "اماكن للاطفال",
  amusement_aqua: "ملاهي وأكوابارك",
  work: "مكاتب عمل",
  courses_study: "كورسات ودراسة",
  hotel: "فنادق",
  cinema: "سينما",
  mall: "مولات",
  outings: "أماكن للخروجات",
};

export default function PlaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  const { user } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  useEffect(() => {
    if (activeMenuIndex === null || !place?.menuImages) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveMenuIndex(prev => (prev! + 1) % place.menuImages!.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveMenuIndex(prev => (prev! - 1 + place.menuImages!.length) % place.menuImages!.length);
      } else if (e.key === 'Escape') {
        setActiveMenuIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenuIndex, place?.menuImages]);

  useEffect(() => {
    if (!id) return;

    const fetchPlace = async () => {
      if (!supabase) return;
      try {
        const { data: dbPlace, error } = await supabase
          .from('places')
          .select('*, branches(*)')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (dbPlace) {
          const mappedPlace: Place = {
            id: dbPlace.id,
            name: dbPlace.name,
            category: dbPlace.category,
            categoryLabel: dbPlace.category_label || CATEGORY_LABELS[dbPlace.category] || dbPlace.category,
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
            latitude: dbPlace.latitude || undefined,
            longitude: dbPlace.longitude || undefined,
            website_url: dbPlace.website_url,
            features: Array.isArray(dbPlace.features) ? dbPlace.features : [],
            services: Array.isArray(dbPlace.services) ? dbPlace.services : [],
            branches: dbPlace.branches ? dbPlace.branches.map((b: any) => ({
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
            })) : []
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

    const savedTheme = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => { },
        { enableHighAccuracy: true }
      );
    }
  }, [id]);

  useEffect(() => {
    if (place && place.branches && place.branches.length > 0 && !selectedBranchId) {
      if (userLocation) {
        let minDist = Infinity;
        let closestId = place.branches[0].id;
        place.branches.forEach(b => {
          if (b.latitude && b.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
            if (d < minDist) { minDist = d; closestId = b.id; }
          }
        });
        setSelectedBranchId(closestId);
      } else {
        const main = place.branches.find(b => b.isMain);
        setSelectedBranchId(main ? main.id : place.branches[0].id);
      }
    }
  }, [place, userLocation, selectedBranchId]);

  // Haversine distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!user || !id || !supabase) return;

    const checkFavorite = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('favorite_places')
          .select('id')
          .eq('place_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsFavorite(data && data.length > 0);
      } catch (err) {
        console.error("Error checking favorite:", err);
      }
    };

    checkFavorite();
  }, [id, user]);

  const getDefiniteCategoryName = (category: string, label: string) => {
    switch (category) {
      case "restaurant": return "المطعم";
      case "cafe": return "الكافيه";
      case "garden": return "الحديقة";
      case "medicalCenter": return "المركز الطبي";
      case "health_beauty": return "مكان الصحة والجمال";
      case "family": return "المكان العائلي";
      case "quiet_places": return "المكان الهادئ";
      case "kids": return "المكان المخصص للأطفال";
      case "amusement_aqua": return "الملاهي";
      case "work": return "مكتب العمل";
      case "courses_study": return "مكان الكورسات";
      case "hotel": return "الفندق";
      case "cinema": return "السينما";
      case "mall": return "المول";
      case "outings": return "المكان";
      default: return label || "المكان";
    }
  };

  const handleShare = async () => {
    if (!place) return;
    const categoryText = getDefiniteCategoryName(place.category, place.categoryLabel);
    const shareText = `لقد وجدت هذا ${categoryText} وموجود في ${place.city} ${place.governorate} هيا نلقي نظرة عليه`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error("Error sharing:", err);
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
          .from('favorite_places')
          .delete()
          .match({ user_id: user.id, place_id: id });
        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorite_places')
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

  const getCategoryIcon = (category: string, size = 18) => {
    switch (category) {
      case "restaurant":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case "cafe":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        );
      case "pharmacy":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        );
      case "hospital":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );
      case "garden":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 6v12M8 10h8" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "restaurant": return "#ff9500";
      case "cafe": return "#5856d6";
      case "pharmacy": return "#34c759";
      case "hospital": return "#ff3b30";
      case "garden": return "#30b0c7";
      default: return "#007aff";
    }
  };

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
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>عذراً، لم نتمكن من العثور على المكان المطلوب في الدليل.</p>
          <button className="ios-btn ios-btn-primary" onClick={() => router.push("/")}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const selectedBranch = place.branches?.find(b => b.id === selectedBranchId);
  const displayBranch = {
    ...place,
    ...(selectedBranch || {}),
    phones: (selectedBranch?.phones && selectedBranch.phones.length > 0) ? selectedBranch.phones : (place.phones || []),
    workingHours: selectedBranch?.workingHours || place.workingHours || "",
    fullAddress: selectedBranch?.fullAddress || place.fullAddress || "",
  };

  // Calculate distance if coordinates are available
  const currentDistance =
    userLocation && displayBranch.latitude && displayBranch.longitude
      ? calculateDistance(userLocation.latitude, userLocation.longitude, displayBranch.latitude, displayBranch.longitude)
      : null;

  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingBottom: "100px" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "10px 16px" }}>
        {/* Left: Share */}
        <button
          onClick={handleShare}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid var(--border-glass)",
            color: "var(--text-primary)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.1rem",
            transition: "all 0.2s"
          }}
          title="مشاركة المكان"
        >
          <i className="bx bx-share-alt"></i>
        </button>

        {/* Center: Centered Place Name */}
        <div style={{ textAlign: "center", flex: 1, minWidth: 0, padding: "0 10px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-primary)" }}>
            {place.name}
          </h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {place.categoryLabel || CATEGORY_LABELS[place.category]}
          </span>
        </div>

        {/* Right: Close X */}
        <button
          onClick={() => router.push("/")}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid var(--border-glass)",
            color: "var(--text-primary)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.2rem",
            transition: "all 0.2s"
          }}
          title="إغلاق"
        >
          <i className="bx bx-x"></i>
        </button>
      </div>

      {/* Main Glass Details Box */}
      <div className="glass-panel" style={{ overflow: "hidden", padding: "0" }}>
        {/* Cover Image Area */}
        <div style={{ height: "340px", width: "100%", position: "relative" }}>
          <img
            src={place.images && place.images[0] ? place.images[0] : "/placeholder.jpg"}
            alt={place.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
            }}
          />
          {/* Category Badge overlay */}
          <span
            style={{
              position: "absolute",
              bottom: "20px",
              right: "24px",
              background: getCategoryColor(place.category),
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: "bold",
              padding: "6px 14px",
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className={`bx ${CATEGORY_ICONS[place.category] || "bx-category"}`} style={{ fontSize: "1rem" }}></i>
            {place.categoryLabel || CATEGORY_LABELS[place.category]}
          </span>
        </div>

        {/* Info Padding */}
        <div style={{ padding: "20px" }}>
          {/* Title Area */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{ fontFamily: "var(--font-cairo)", fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px" }}>
              {place.name}
            </h1>
            {place.shortDescription && (
              <p style={{ fontSize: ".9rem", color: "var(--text-secondary)", fontWeight: "500", margin: "0 0 10px" }}>
                {place.shortDescription}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <span><FaMapMarkerAlt /> {displayBranch.city} / {displayBranch.governorate}</span>
              {currentDistance !== null && (
                <>
                  <span>•</span>
                  <span style={{ color: "var(--accent-success)", fontWeight: "600" }}>
                    تبعد {currentDistance < 1 ? `${Math.round(currentDistance * 1000)} متر` : `${currentDistance.toFixed(1)} كم`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Row - 3 Buttons (Directions, Call, Favorite) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
            {/* Directions */}
            <a
              href={displayBranch.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${displayBranch.latitude},${displayBranch.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#007aff",
                color: "#fff",
                borderRadius: "12px",
                padding: "5px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                cursor: "pointer",
                textDecoration: "none",
                textAlign: "center",
                transition: "opacity 0.2s"
              }}
            >
              <BiSolidMapPin style={{ fontSize: "1rem" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: "bold" }}>الاتجاهات</span>
            </a>

            {/* Call */}
            {displayBranch.phones && displayBranch.phones.length > 0 ? (
              <a
                href={`tel:${displayBranch.phones[0]}`}
                style={{
                  background: "rgba(0, 45, 248, 0.05)",
                  border: "1px solid var(--border-glass)",
                  color: "#007aff",
                  borderRadius: "12px",
                  padding: "5px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  cursor: "pointer",
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "opacity 0.2s"
                }}
              >
                <FaPhoneAlt style={{ fontSize: "1rem" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: "500" }}>الهاتف</span>
              </a>
            ) : (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-muted)",
                  borderRadius: "12px",
                  padding: "5px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  opacity: 0.5,
                  textAlign: "center"
                }}
              >
                <i className="bx bx-phone-off" style={{ fontSize: "1rem" }}></i>
                <span style={{ fontSize: "0.7rem", fontWeight: "500" }}>لا يتوفر</span>
              </div>
            )}

            {/* Favorite */}
            <button
              onClick={toggleFavorite}
              disabled={togglingFav}
              style={{
                background: "rgba(0, 45, 248, 0.05)",
                border: "1px solid var(--border-glass)",
                color: isFavorite ? "#ff3b30" : "#007aff",
                borderRadius: "12px",
                padding: "5px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
            >
              {isFavorite ? <MdOutlineFavorite style={{ fontSize: "1rem" }}/> : <GrFavorite style={{ fontSize: "1rem" }}/>}
              <span style={{ fontFamily: "var(--font-cairo)", fontSize: "0.7rem", fontWeight: "500" }}>المفضلة</span>
            </button>
          </div>

          {/* Quick Info Box */}
          <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", background: "rgba(255, 255, 255, 0.04)", borderRadius: "14px", padding: "10px", marginBottom: "10px" }}>
            {/* Hours */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>حالة المكان</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {displayBranch.workingHours ? (
                  isCurrentlyOpen(displayBranch.workingHours) ? (
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#34c759" }}>مفتوح</span>
                  ) : (
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#ff3b30" }}>مغلق</span>
                  )
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>غير محدد</span>
                )}
              </div>
            </div>

            {/* Ratings */}
            {place.rating !== undefined && (
              <div
                onClick={() => {
                  const el = document.getElementById("reviews-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", cursor: "pointer" }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}> التقييمات والآراء
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}> ({place.reviewsCount || 0})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#ff9f0a" }}>{Number(place.rating).toFixed(1)} ★</span>
                </div>
              </div>
            )}
          </div>

          {/* Branch Selector Chips */}
          {place.branches && place.branches.length > 1 && (
            <div style={{ marginBottom: "24px", paddingTop: "20px" }}>
              <h4 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--text-secondary)", fontWeight: "bold" }}>اختر الفرع:</h4>
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", msOverflowStyle: "none", scrollbarWidth: "none" }} className="hide-scrollbar">
                {place.branches.map(b => {
                  const isSelected = b.id === selectedBranchId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBranchId(b.id)}
                      style={{
                        background: isSelected ? "var(--accent-ios)" : "rgba(120,120,120,0.1)",
                        color: isSelected ? "#fff" : "var(--text-primary)",
                        border: isSelected ? "none" : "1px solid var(--border-glass)",
                        borderRadius: "20px",
                        padding: "8px 16px",
                        fontSize: "0.95rem",
                        fontWeight: isSelected ? "bold" : "normal",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {b.isMain && <span style={{ fontSize: "0.8rem" }}>⭐</span>}
                      {b.name} {b.city ? `- ${b.city}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Media Section */}
          {((displayBranch?.media && displayBranch.media.length > 0) || (place.menuImages && place.menuImages.length > 0)) && (
            <div>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
                {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!).map((mediaUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveMenuIndex(idx)}
                    style={{ width: "150px", height: "160px", borderRadius: "18px", overflow: "hidden", flexShrink: 0, cursor: "pointer", position: "relative" }}
                  >
                    <img
                      src={mediaUrl}
                      alt={`ميديا-${idx}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Description Section */}
          {place.description && (
            <div style={{ background: "rgba(120, 120, 120, 0.03)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>نبذة عن المكان</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
                {place.description}
              </p>
            </div>
          )}

          {/* Good to Know Card */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>معلومات مفيدة</h3>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {(() => {
                const activeFeatures = (displayBranch as any).features || (place as any).features;
                if (activeFeatures && activeFeatures.length > 0) {
                  return activeFeatures.map((fKey: string) => {
                    const feat = FEATURES_LIST.find(f => f.key === fKey);
                    if (!feat) return null;
                    return (
                      <div key={fKey} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                        <span style={{ fontSize: "1.1rem" }}>{feat.icon}</span>
                        <span>{feat.label}</span>
                      </div>
                    );
                  });
                }
                return place.category === "restaurant" || place.category === "cafe" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      <span style={{ fontSize: "1.1rem" }}>🥗</span>
                      <span>خيارات نباتية متوفرة</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      <span style={{ fontSize: "1.1rem" }}>👥</span>
                      <span>مناسب للمجموعات والعائلات</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      <span style={{ fontSize: "1.1rem" }}>💳</span>
                      <span>يقبل الدفع بالبطاقات الائتمانية</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      <span style={{ fontSize: "1.1rem" }}>📶</span>
                      <span>شبكة واي فاي مجانية</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      <span style={{ fontSize: "1.1rem" }}>✔️</span>
                      <span>مرافق مريحة للزوار</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      <span style={{ fontSize: "1.1rem" }}>♿</span>
                      <span>مدخل سهلة للكراسي المتحركة</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      <span style={{ fontSize: "1.1rem" }}>👨‍👩‍👧‍👦</span>
                      <span>مناسب لجميع الأعمار</span>
                    </div>
                  </>
                );
              })()}

              {/* Sub-categories Badges inside Good to Know */}
              {place.subCategories && place.subCategories.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(120, 120, 120, 0.1)", paddingTop: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "8px", fontWeight: "600" }}>التصنيفات الفرعية:</span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {place.subCategories.map((subCatKey) => (
                      <span
                        key={subCatKey}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-glass)",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <i className={`bx ${CATEGORY_ICONS[subCatKey] || "bx-tag"}`} style={{ fontSize: "0.95rem" }}></i>
                        {CATEGORY_LABELS[subCatKey] || subCatKey}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services section inside Good to Know */}
              {((displayBranch as any)?.services || (place as any)?.services) && ((displayBranch as any)?.services || (place as any)?.services).length > 0 && (
                <div style={{ borderTop: "1px solid rgba(120, 120, 120, 0.1)", paddingTop: "12px", marginTop: "12px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "8px", fontWeight: "600" }}>الخدمات المتاحة:</span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {((displayBranch as any)?.services || (place as any)?.services).map((serviceName: string) => (
                      <span
                        key={serviceName}
                        style={{
                          background: "rgba(0, 111, 238, 0.08)",
                          color: "var(--accent-primary)",
                          border: "1px solid rgba(0, 111, 238, 0.2)",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <i className="bx bx-check-double" style={{ fontSize: "0.95rem" }}></i>
                        {serviceName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Card (Phone, Website, Address) */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>التفاصيل</h3>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Phone Row */}
              {displayBranch.phones && displayBranch.phones.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(120, 120, 120, 0.1)" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>الهاتف</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                    {displayBranch.phones.map((p: string, i: number) => (
                      <a key={i} href={`tel:${p}`} style={{ fontSize: "0.92rem", color: "#007aff", textDecoration: "none", fontWeight: "bold" }}>{p}</a>
                    ))}
                  </div>
                </div>
              )}

              {/* Website Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(120, 120, 120, 0.1)" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>الموقع الإلكتروني</span>
                {(displayBranch as any).website_url || (place as any).website_url ? (
                  <a href={(displayBranch as any).website_url || (place as any).website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9rem", color: "#007aff", textDecoration: "none", fontWeight: "bold", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr" }}>
                    {(displayBranch as any).website_url || (place as any).website_url}
                  </a>
                ) : (
                  <span style={{ fontSize: "0.92rem", color: "var(--text-muted)", fontWeight: "bold" }}>لا يوجد موقع</span>
                )}
              </div>

              {/* Address Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 16px" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>العنوان</span>
                <div style={{ textAlign: "left", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600", maxWidth: "220px", display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
                  <span>{displayBranch.fullAddress}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{displayBranch.city}، {displayBranch.governorate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          {displayBranch.workingHours && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>ساعات العمل</h3>
              <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "16px 12px" }}>
                {(() => {
                  const parsed = parseWorkingHours(displayBranch.workingHours);
                  if (!parsed) return <div style={{ color: "var(--text-secondary)" }}>{displayBranch.workingHours}</div>;

                  if (parsed.type === "24/7") {
                    return <div style={{ color: "var(--accent-success)", fontWeight: "bold", background: "rgba(52, 199, 89, 0.1)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>مفتوح طول أيام الأسبوع 24 ساعة</div>;
                  }

                  if (parsed.type === "custom" && parsed.schedule) {
                    const todayName = DAYS_OF_WEEK[new Date().getDay()];
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {parsed.schedule.map((day) => {
                          const isToday = day.day === todayName;
                          return (
                            <div
                              key={day.day}
                              style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "8px 12px", borderRadius: "8px",
                                background: isToday ? "rgba(47, 128, 237, 0.1)" : "rgba(120, 120, 120, 0.04)",
                                border: isToday ? "1px solid rgba(47, 128, 237, 0.3)" : "1px solid transparent"
                              }}
                            >
                              <div style={{ fontWeight: isToday ? "bold" : "normal", color: isToday ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                {day.day} {isToday && <span style={{ fontSize: "0.75rem", color: "var(--accent-ios)", marginRight: "6px" }}>(اليوم)</span>}
                              </div>
                              <div style={{ fontWeight: "600", color: day.isWorking ? "var(--text-primary)" : "#ff3b30", fontSize: "0.95rem" }}>
                                {day.isWorking ? ` ${day.openTime} ${day.openPeriod} : ${day.closeTime} ${day.closePeriod}` : "إجازة"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* Bottom Dock / Report & Claim Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px", marginBottom: "20px" }}>
            <button
              onClick={() => setIsReportModalOpen(true)}
              style={{
                width: "100%",
                background: "rgba(255, 59, 48, 0.1)",
                border: "1px solid rgba(255, 59, 48, 0.2)",
                borderRadius: "12px",
                padding: "14px",
                color: "#ff3b30",
                fontWeight: "700",
                fontSize: "0.9rem",
                fontFamily: "var(--font-cairo)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }}></i>
              <span>الإبلاغ عن مشكلة في البيانات</span>
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  if (!user) {
                    alert("يرجى تسجيل الدخول أولاً لإضافة ملاحظة.");
                    return;
                  }
                  setIsNoteModalOpen(true);
                }}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "12px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <i className="bx bx-notepad" style={{ fontSize: "1.1rem", color: "#34c759" }}></i>
                <span style={{ fontFamily:"var(--font-cairo)"}}>أضف تذكير</span>
              </button>

              <button
                onClick={handleShare}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "12px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <i className="bx bx-share-alt" style={{ fontSize: "1.1rem" }}></i>
                <span style={{ fontFamily:"var(--font-cairo)"}}>مشاركة هذا المكان</span>
              </button>
            </div>

            {/* Unique ID */}
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", fontSize: "0.78rem", color: "var(--text-muted)", opacity: 0.7, marginTop: "12px" }}>
              <span>كود المكان: #{selectedBranchId || place.id}</span>
            </div>
          </div>

          {/* Photo Gallery */}
          {place.images && place.images.length > 1 && (
            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-primary)" }}>معرض الصور</h4>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
                {place.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    style={{ width: "160px", height: "107px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, border: "1px solid var(--border-glass)" }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${place.name}-${idx}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Reviews Section */}
          <ReviewSection
            place={place}
            selectedBranchId={selectedBranchId}
            onRatingUpdate={(r, c) => {
              if (place) setPlace({ ...place, rating: r, reviewsCount: c });
            }}
          />
        </div>
      </div>

      {/* Lightbox / Zoom component */}
      {activeMenuIndex !== null && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.9)", zIndex: 10000,
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          backdropFilter: "blur(10px)"
        }} onClick={() => setActiveMenuIndex(null)}>

          <button style={{
            position: "absolute", top: "20px", right: "20px",
            background: "rgba(255,255,255,0.2)", color: "#fff", border: "none",
            width: "40px", height: "40px", borderRadius: "50%",
            fontSize: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center",
            cursor: "pointer", zIndex: 10001
          }} onClick={(e) => { e.stopPropagation(); setActiveMenuIndex(null); }}>
            <i className="bx bx-x"></i>
          </button>

          {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!).length > 1 && (
            <button style={{
              position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.2)", color: "#fff", border: "none",
              width: "40px", height: "40px", borderRadius: "50%",
              fontSize: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer"
            }} onClick={(e) => {
              e.stopPropagation();
              const arr = ((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!);
              setActiveMenuIndex((activeMenuIndex - 1 + arr.length) % arr.length);
            }}>
              <i className="bx bx-chevron-right"></i>
            </button>
          )}

          <img
            src={((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!)[activeMenuIndex]}
            alt="ميديا مكبرة"
            style={{ maxWidth: "90%", maxHeight: "80vh", objectFit: "contain", borderRadius: "12px" }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
            }}
          />

          {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!).length > 1 && (
            <button style={{
              position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.2)", color: "#fff", border: "none",
              width: "40px", height: "40px", borderRadius: "50%",
              fontSize: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer"
            }} onClick={(e) => {
              e.stopPropagation();
              const arr = ((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!);
              setActiveMenuIndex((activeMenuIndex + 1) % arr.length);
            }}>
              <i className="bx bx-chevron-left"></i>
            </button>
          )}

          {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!).length > 1 && (
            <div style={{
              position: "absolute", bottom: "30px", background: "rgba(0,0,0,0.6)",
              color: "#fff", padding: "6px 16px", borderRadius: "20px", fontSize: "0.9rem", fontWeight: "600"
            }}>
              {activeMenuIndex + 1} / {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : place.menuImages!).length}
            </div>
          )}
        </div>
      )}
      {isReportModalOpen && place && (
        <ReportProblemModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          place={place}
        />
      )}
      {isNoteModalOpen && place && (
        <PlaceNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          placeId={place.id}
          placeName={place.name}
        />
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
