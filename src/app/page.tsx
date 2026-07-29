"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ReviewSection from "@/components/ReviewSection";
import { getTodayWorkingHoursText, parseWorkingHours, DAYS_OF_WEEK, isCurrentlyOpen } from "@/lib/workingHours";
import { Place, PlaceCategory, initialPlaces, FEATURES_LIST } from "../data/places";
import { Pagination } from "@/components/ui/Pagination";
// Icon
import { MdDomain } from "react-icons/md";


/* ─── الدوال المساعدة (Helper Functions) ─── */
// دالة حساب المسافة الجغرافية بين نقطتين (عرض وطول) بالكيلومترات
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// دالة توحيد وتنظيف النصوص العربية لبحث دقيق (إزالة الهمزات والتاء المربوطة والتطويل)
function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove tatweel
}

// خرائط التصنيفات والأيقونات والألوان للأماكن
const CATEGORY_EMOJIS: Record<string, string> = {
  all: "🗂️",
  restaurant: "🍽️",
  cafe: "☕",
  garden: "🌳",
  medicalCenter: "🏥",
  health_beauty: "💅",
  family: "👨‍👩‍👧‍👦",
  quiet_places: "🌙",
  kids: "👶",
  amusement_aqua: "🎡",
  work: "💼",
  courses_study: "📚",
  hotel: "🏨",
  cinema: "🎬",
  mall: "🛍️",
  outings: "🧭",
};

const CATEGORY_ICONS: Record<string, string> = {
  all: "bx-grid-alt",
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
  all: "الكل",
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

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    restaurant: "#ff3b30",
    cafe: "#ff9500",
    garden: "#30b0c7",
    medicalCenter: "#007aff",
    health_beauty: "#ff2d55",
    family: "#af52de",
    quiet_places: "#5856d6",
    kids: "#ff9f0a",
    amusement_aqua: "#00c7be",
    work: "#a2845e",
    courses_study: "#34c759",
    hotel: "#5856d6",
    cinema: "#ff3f8e",
    mall: "#ff9500",
    outings: "#30b0c7",
  };
  return colors[cat] ?? "#2f80ed";
}

type PlaceWithDist = Place & { distanceKm?: number; closestBranchName?: string };

/* ═══════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   الصفحة الرئيسية والتفاعلات (Home Page Component)
═══════════════════════════════════════════════ */
function HomeContent() {
  // ── الحالات الأساسية (State Management) ──
  const { user } = useAuth(); // حالة المستخدم الحالي
  const searchParams = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]); // قائمة الأماكن
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set()); // الأماكن المفضلة
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null); // المكان المفتوح في تفاصيل المكان
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  useEffect(() => {
    if (activeMenuIndex === null || !selectedPlace?.menuImages) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveMenuIndex(prev => (prev! + 1) % selectedPlace.menuImages!.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveMenuIndex(prev => (prev! - 1 + selectedPlace.menuImages!.length) % selectedPlace.menuImages!.length);
      } else if (e.key === 'Escape') {
        setActiveMenuIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenuIndex, selectedPlace?.menuImages]);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isProximityEnabled, setIsProximityEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Add form states
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<PlaceCategory>("restaurant");
  const [newBriefLocation, setNewBriefLocation] = useState("");
  const [newFullAddress, setNewFullAddress] = useState("");
  const [newPhones, setNewPhones] = useState("");
  const [newMapsUrl, setNewMapsUrl] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newWorkingHours, setNewWorkingHours] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");

  /* Load places on mount */
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from('places').select('*, branches(*)').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          const mappedPlaces: Place[] = data.map(dbPlace => ({
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
              isMain: b.is_main,
              createdAt: b.created_at,
              website_url: b.website_url,
              features: Array.isArray(b.features) ? b.features : [],
            })) : []
          }));
          setPlaces(mappedPlaces);
        }
      } catch (err) {
        console.error("Error fetching places:", err);
      }
    };

    fetchPlaces();

    const fetchFavorites = async () => {
      if (user && supabase) {
        const { data } = await supabase.from('favorite_places').select('place_id').eq('user_id', user.id);
        if (data) {
          setFavoriteIds(new Set(data.map(d => d.place_id)));
        }
      }
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    if (!user || !supabase) {
      alert("يرجى تسجيل الدخول أولاً لإضافة الأماكن المفضلة.");
      return;
    }

    const newFavs = new Set(favoriteIds);
    if (newFavs.has(placeId)) {
      newFavs.delete(placeId);
      await supabase.from('favorite_places').delete().match({ user_id: user.id, place_id: placeId });
    } else {
      newFavs.add(placeId);
      await supabase.from('favorite_places').insert({ user_id: user.id, place_id: placeId });
    }
    setFavoriteIds(newFavs);
  };

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

  const handleShare = async (place: Place) => {
    if (!place) return;
    const categoryText = getDefiniteCategoryName(place.category, place.categoryLabel);
    const shareText = `لقد وجدت هذا ${categoryText} وموجود في ${place.city} ${place.governorate} هيا نلقي نظرة عليه`;
    const shareUrl = `${window.location.origin}/places/${place.id}`;

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

  /* Geolocation */
  const handleToggleProximity = () => {
    if (isProximityEnabled) {
      setIsProximityEnabled(false);
      setUserLocation(null);
      return;
    }
    if (!navigator.geolocation) { alert("متصفحك لا يدعم الموقع الجغرافي"); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setIsProximityEnabled(true);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED: alert("تم رفض طلب تحديد الموقع."); break;
          case err.POSITION_UNAVAILABLE: alert("معلومات الموقع غير متوفرة."); break;
          default: alert("حدث خطأ أثناء تحديد موقعك.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  /* Listen to Mobile Nav queries */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("nearby") === "true") {
        if (!isProximityEnabled) {
          handleToggleProximity();
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (urlParams.get("search") === "focus") {
        const input = document.getElementById("search-input");
        if (input) input.focus();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (urlParams.get("q")) {
        setSearchQuery(urlParams.get("q") as string);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isProximityEnabled, searchParams]);

  /* Enrich places with distance */
  const enrichedPlaces = React.useMemo<PlaceWithDist[]>(() => {
    return places.map((p) => {
      let minDistance: number | undefined = undefined;
      let closestBranchName: string | undefined = undefined;

      if (userLocation) {
        if (p.branches && p.branches.length > 0) {
          p.branches.forEach(b => {
            if (b.latitude && b.longitude) {
              const d = haversineDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
              if (minDistance === undefined || d < minDistance) {
                minDistance = d;
                closestBranchName = b.name;
              }
            }
          });
        } else if (p.latitude && p.longitude) {
          minDistance = haversineDistance(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude);
        }
      }

      return {
        ...p,
        distanceKm: minDistance,
        closestBranchName,
      };
    });
  }, [places, userLocation]);

  /* Main filtered + searched list */
  const filteredPlaces = React.useMemo(() => {
    const q = normalizeArabic(searchQuery.trim().toLowerCase());

    // Split query into words, ignore common stop words
    const stopWords = ["في", "من", "ب", "بـ", "بمنطقة", "بمحافظة", "مدينة", "حي"];
    const queryWords = q.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 0);

    return enrichedPlaces.filter((p) => {
      const matchCat =
        selectedCategory === "all" ||
        p.category === selectedCategory ||
        (p.subCategories && p.subCategories.includes(selectedCategory));

      if (queryWords.length === 0) return matchCat;

      // Build a comprehensive searchable string for the place
      const searchableText = normalizeArabic([
        p.name,
        p.categoryLabel,
        ...(p.subCategories || []).map(sc => CATEGORY_LABELS[sc] || sc),
        p.city,
        p.category === "restaurant" ? "مطعم مطاعم" : "",
        p.category === "cafe" ? "كافيه كافيهات مقهى قهاوي" : "",
        p.category === "pharmacy" ? "صيدلية صيدليات" : "",
        p.category === "hospital" ? "مستشفى مستشفيات عيادة مركز طبي" : "",
        p.category === "garden" ? "حديقة حدائق منتزه ملاهي" : "",
        p.city,
        p.governorate,
        p.fullAddress,
        p.description || ""
      ].filter(Boolean).join(" ").toLowerCase());

      // Check if ALL searched words exist somewhere in the searchable text
      const matchSearch = queryWords.every(word => searchableText.includes(word));

      return matchCat && matchSearch;
    });
  }, [enrichedPlaces, searchQuery, selectedCategory]);

  /* Section: Nearby (<5 km) */
  const nearbyPlaces = React.useMemo(() => {
    if (!isProximityEnabled || !userLocation) return [];
    return enrichedPlaces
      .filter((p) => p.distanceKm !== undefined && p.distanceKm < 10)
      .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
      .slice(0, 6);
  }, [enrichedPlaces, isProximityEnabled, userLocation]);

  /* Section: Top Rated */
  const topRatedPlaces = React.useMemo(() => {
    return [...enrichedPlaces].filter((p) => p.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [enrichedPlaces]);

  /* Section: Family */
  const familyPlaces = React.useMemo(() => enrichedPlaces.filter((p) => p.category === "family"), [enrichedPlaces]);

  /* Section: Entertainment */
  const entertainmentPlaces = React.useMemo(() => enrichedPlaces.filter((p) => p.category === "entertainment"), [enrichedPlaces]);

  /* Add place handler */
  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBriefLocation.trim()) return;
    const newPlace: Place = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      categoryLabel: CATEGORY_LABELS[newCategory],
      briefLocation: newBriefLocation.trim(),
      fullAddress: newFullAddress.trim(),
      phones: newPhones.split(",").map((p) => p.trim()).filter(Boolean),
      googleMapsUrl: newMapsUrl.trim() || "https://maps.google.com",
      images: newImageUrl.trim() ? [newImageUrl.trim()] : [],
      description: newDescription.trim() || undefined,
      workingHours: newWorkingHours.trim() || undefined,
      latitude: newLat ? parseFloat(newLat) : undefined,
      longitude: newLng ? parseFloat(newLng) : undefined,
    };
    const updated = [...places, newPlace];
    setPlaces(updated);
    localStorage.setItem("dftry_places", JSON.stringify(updated));
    setShowAddModal(false);
    setNewName(""); setNewBriefLocation(""); setNewFullAddress(""); setNewPhones("");
    setNewMapsUrl(""); setNewImageUrl(""); setNewDescription(""); setNewWorkingHours("");
    setNewLat(""); setNewLng("");
  };

  const showSections = !searchQuery.trim() && selectedCategory === "all";

  return (
    <>
      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Floating 3D Cards */}
        <div className="hero-3d-card hero-3d-card-1">
          <span>🏦</span>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 2 }}>مكان مميز</div>
            <div>مطعم لورا الكائن</div>
          </div>
          <span style={{ color: "#fbbf24" }}>★ 4.9</span>
        </div>
        <div className="hero-3d-card hero-3d-card-2">
          <span>🏏</span>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 2 }}>حديقة عائلية</div>
            <div>حديقة النوزها</div>
          </div>
          <span style={{ color: "#fbbf24" }}>★ 4.7</span>
        </div>
        <div className="hero-3d-card hero-3d-card-3">
          <span>☕</span>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 2 }}>كافيه ترندي</div>
            <div>ستاربكس ميدان التحرير</div>
          </div>
          <span style={{ color: "#fbbf24" }}>★ 4.8</span>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            دليلك الشامل لأفضل الأماكن في مصر ✨
          </div>

          <h1 className="hero-title">
            اكتشف أفضل<br />
            <span className="hero-title-gradient">الأماكن</span><br />
            بالقرب منك
          </h1>

          <p className="hero-subtitle">
            ماب القاهرة هو رفيقك الأمثل لاكتشاف المطاعم، الكافيهات، الحدائق، وأكثر بحسب موقعك. كل مكان تحتاجه الآن بضغطة واحدة.
          </p>

          {/* Integrated Search in Hero */}
          <div className="hero-search-wrapper">
            <div className="hero-search-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              id="search-input"
              type="text"
              className="hero-search-input"
              placeholder="ابحث عن مطعم، كافيه، حديقة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => document.getElementById('places-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ fontFamily: "Cairo" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              استكشف الأماكن
            </button>
            <button className="hero-btn-secondary" onClick={() => setIsProximityEnabled(!isProximityEnabled)} style={{ fontFamily: "Cairo" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
              {isProximityEnabled ? "إيقاف القرب" : "بالقرب مني"}
            </button>
          </div>

          {/* Stats Row */}
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">{places.length}+</div>
              <div className="hero-stat-label">مكان مسجل</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">27</div>
              <div className="hero-stat-label">محافظة</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">8</div>
              <div className="hero-stat-label">تصنيفات</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}

      </section>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className="app-container" id="places-section">

        {/* ── New Features Banners ── */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
          {/* Metro Banner */}
          <Link href="/metro" style={{ flex: "1 1 300px", textDecoration: "none", display: "block" }}>
            <div style={{
              background: "linear-gradient(135deg, #101528, #182542)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(108, 99, 255, 0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-20px", left: "-20px", width: "100px", height: "100px", background: "radial-gradient(circle, rgba(108,99,255,0.4) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontSize: "2.5rem" }}>🚇</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>اعرف طريقك بالمترو</h3>
                    <span style={{ background: "#ff3f8e", color: "#fff", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "8px", fontWeight: "800" }}>جديد</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>خريطة محطات المترو وأسعار التذاكر ومسارات الرحلات بدقة.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Phone Directory Banner */}
          <Link href="/directory" style={{ flex: "1 1 300px", textDecoration: "none", display: "block" }}>
            <div style={{
              background: "linear-gradient(135deg, #101528, #182542)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(52, 199, 89, 0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-20px", left: "-20px", width: "100px", height: "100px", background: "radial-gradient(circle, rgba(52,199,89,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontSize: "2.5rem" }}>☎️</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>دليل الهاتف والخدمات</h3>
                    <span style={{ background: "#ff3f8e", color: "#fff", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "8px", fontWeight: "800" }}>جديد</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>أرقام الشركات، الطوارئ، وخدمات العملاء في مكان واحد.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Categories + Proximity ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", flexGrow: 1 }}>
            {["all", "restaurant", "cafe", "garden", "medicalCenter", "health_beauty", "family", "quiet_places", "kids", "amusement_aqua", "work", "courses_study", "hotel", "cinema", "mall", "outings"].map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <i className={`bx ${CATEGORY_ICONS[cat] || "bx-category"}`} style={{ fontSize: "1.1rem" }}></i>
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          <button
            className={`ios-btn ${isProximityEnabled ? "ios-btn-primary" : ""}`}
            onClick={handleToggleProximity}
            disabled={locationLoading}
            style={{ padding: "10px 16px", fontSize: "0.9rem", flexShrink: 0, gap: "6px", border: "1px solid var(--border-glass)" }}
          >
            {locationLoading ? (
              <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
            )}
            {isProximityEnabled ? "قريب مني ✓" : "قريب مني"}
          </button>
        </div>

        {/* ═══════════════════════════════════ SECTIONS MODE ═══════════════════════════════════ */}
        {showSections ? (
          <>


            {/* Section 1: Nearby */}
            {isProximityEnabled && (
              <PaginatedSection
                title={<>📍 أقرب الأماكن إليك {nearbyPlaces.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginRight: "12px" }}>بحث في نطاق 10 كم</span>}</>}
                places={nearbyPlaces}
                setSelectedPlace={setSelectedPlace}
                getCategoryColor={getCategoryColor}
                toggleFavorite={toggleFavorite}
                favoriteIds={favoriteIds}
                emptyMessage="فعّل الموقع للعثور على أماكن قريبة منك 📍"
              />
            )}

            {/* Section 2: Top Rated */}
            <PaginatedSection
              title="⭐ الأكثر زيارة"
              places={topRatedPlaces}
              setSelectedPlace={setSelectedPlace}
              getCategoryColor={getCategoryColor}
              toggleFavorite={toggleFavorite}
              favoriteIds={favoriteIds}
              showRating
              itemsPerPage={3}
            />

            {/* Section 3: Family */}
            <PaginatedSection
              title="👨‍👩‍👧‍👦 أماكن عائلية"
              places={familyPlaces}
              setSelectedPlace={setSelectedPlace}
              getCategoryColor={getCategoryColor}
              toggleFavorite={toggleFavorite}
              favoriteIds={favoriteIds}
            />

            {/* Section 4: Entertainment */}
            <PaginatedSection
              title="🎭 أماكن ترفيهية"
              places={entertainmentPlaces}
              setSelectedPlace={setSelectedPlace}
              getCategoryColor={getCategoryColor}
              toggleFavorite={toggleFavorite}
              favoriteIds={favoriteIds}
            />

            {/* Section 5: All Places */}
            <PaginatedSection
              title="🗂️ جميع الأماكن"
              places={enrichedPlaces}
              setSelectedPlace={setSelectedPlace}
              getCategoryColor={getCategoryColor}
              toggleFavorite={toggleFavorite}
              favoriteIds={favoriteIds}
              itemsPerPage={6}
              forceThreeColumns={true}
            />
          </>
        ) : (
          /* ═══════════════════════════════════ SEARCH / FILTER MODE ═══════════════════════════════════ */
          <>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
              {filteredPlaces.length} نتيجة {searchQuery ? `لـ "${searchQuery}"` : ""} {selectedCategory !== "all" ? `في ${CATEGORY_LABELS[selectedCategory]}` : ""}
            </p>
            {filteredPlaces.length > 0 ? (
              <div className="grid-places">
                {filteredPlaces.map((place) => (
                  <div key={place.id} className="glass-card" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative" }}>
                    <PlaceCardContent place={place} getCategoryColor={getCategoryColor} toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: "60px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🔍</div>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>لم يُعثر على نتائج — جرّب كلمة بحث أخرى</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════════════════════════════ DETAIL SHEET ═══════════════════════════════════ */}
      {selectedPlace && (
        <div className="ios-sheet-overlay" onClick={() => { setSelectedPlace(null); setSelectedBranchId(null); }}>
          <div className="ios-sheet" onClick={(e: any) => e.stopPropagation()}>
            <div className="ios-sheet-drag-handle" onClick={() => { setSelectedPlace(null); setSelectedBranchId(null); }} />

            {/* Apple Maps Top Bar (Fixed) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", borderBottom: "1px solid var(--border-glass)", flexShrink: 0 }}>
              {/* Left: Share */}
              <button
                onClick={() => handleShare(selectedPlace)}
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
                  {selectedPlace.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {selectedPlace.categoryLabel || CATEGORY_LABELS[selectedPlace.category]}
                </span>
              </div>

              {/* Right: Close X */}
              <button
                onClick={() => { setSelectedPlace(null); setSelectedBranchId(null); }}
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

            <div className="ios-sheet-content">
              {(() => {
                const displayBranch = selectedPlace.branches?.find(b => b.id === selectedBranchId)
                  || selectedPlace.branches?.find(b => b.isMain)
                  || (selectedPlace.branches && selectedPlace.branches[0])
                  || selectedPlace;
                return (
                  <>
                    {/* Images */}
                    {selectedPlace.images && selectedPlace.images.length > 0 && (
                      <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "20px", scrollbarWidth: "none" }}>
                        {selectedPlace.images.map((img, i) => (
                          <ImageWithSkeleton key={i} src={img} alt={`${selectedPlace.name} ${i + 1}`}
                            style={{ width: "100%", minWidth: "100%", height: "230px", objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0 }}
                            onError={(e: any) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"; }} />
                        ))}
                      </div>
                    )}

                    {/* Title Area */}
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px" }}>
                        {selectedPlace.name}
                      </h2>
                      {selectedPlace.shortDescription && (
                        <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", fontWeight: "500", margin: "0 0 10px" }}>
                          {selectedPlace.shortDescription}
                        </p>
                      )}
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        <span>📍 {displayBranch.city} / {displayBranch.governorate}</span>
                      </div>
                    </div>

                    {/* Action Row - 3 Buttons (Directions, Call, Favorite) */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
                      {/* Directions */}
                      <a
                        href={displayBranch.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${displayBranch.latitude},${displayBranch.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#007aff",
                          color: "#fff",
                          borderRadius: "14px",
                          padding: "12px 8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          textDecoration: "none",
                          textAlign: "center",
                          transition: "opacity 0.2s"
                        }}
                      >
                        <i className="bx bxs-navigation" style={{ fontSize: "1.4rem" }}></i>
                        <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>الاتجاهات</span>
                      </a>

                      {/* Call */}
                      {displayBranch.phones && displayBranch.phones.length > 0 ? (
                        <a
                          href={`tel:${displayBranch.phones[0]}`}
                          style={{
                            background: "rgba(0, 45, 248, 0.05)",
                            border: "1px solid var(--border-glass)",
                            color: "#007aff",
                            borderRadius: "14px",
                            padding: "12px 8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            textDecoration: "none",
                            textAlign: "center",
                            transition: "opacity 0.2s"
                          }}
                        >
                          <i className="bx bxs-phone" style={{ fontSize: "1.4rem" }}></i>
                          <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>الهاتف</span>
                        </a>
                      ) : (
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid var(--border-glass)",
                            color: "var(--text-muted)",
                            borderRadius: "14px",
                            padding: "12px 8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            opacity: 0.5,
                            textAlign: "center"
                          }}
                        >
                          <i className="bx bx-phone-off" style={{ fontSize: "1.4rem" }}></i>
                          <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>لا يتوفر</span>
                        </div>
                      )}

                      {/* Favorite */}
                      <button
                        onClick={(e) => toggleFavorite(e, selectedPlace.id.toString())}
                        style={{
                          background: "rgba(0, 45, 248, 0.05)",
                          border: "1px solid var(--border-glass)",
                          color: favoriteIds.has(selectedPlace.id.toString()) ? "#ff3b30" : "#007aff",
                          borderRadius: "14px",
                          padding: "12px 8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          transition: "opacity 0.2s"
                        }}
                      >
                        <i className={favoriteIds.has(selectedPlace.id.toString()) ? "bx bxs-heart" : "bx bx-heart"} style={{ fontSize: "1.4rem" }}></i>
                        <span style={{ fontFamily: "var(--font-cairo)", fontSize: "0.8rem", fontWeight: "bold" }}>المفضلة</span>
                      </button>
                    </div>

                    {/* Quick Info Box */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "12px 16px", marginBottom: "24px" }}>
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
                      {selectedPlace.rating !== undefined && (
                        <div
                          onClick={() => {
                            const el = document.getElementById("reviews-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", cursor: "pointer" }}
                        >
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}> التقييمات والآراء
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}> ({selectedPlace.reviewsCount || 0}) </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#ff9f0a" }}>{Number(selectedPlace.rating).toFixed(1)} ★</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Branch Selector Chips */}
                    {selectedPlace.branches && selectedPlace.branches.length > 1 && (
                      <div style={{ marginBottom: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-glass)" }}>
                        <h4 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--text-secondary)", fontWeight: "bold" }}>الفروع</h4>
                        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", msOverflowStyle: "none", scrollbarWidth: "none" }} className="hide-scrollbar">
                          {selectedPlace.branches.map(b => {
                            const isSelected = b.id === displayBranch.id;
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
                                  fontSize: "0.8rem",
                                  fontWeight: isSelected ? "bold" : "normal",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  transition: "all 0.2s ease",
                                  boxShadow: isSelected ? "0 4px 12px rgba(0, 122, 255, 0.3)" : "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "end",
                                  gap: "6px",
                                  fontFamily: "var(--font-cairo)"
                                }}
                              >
                                {b.name} {b.city ? `- ${b.city}` : ""}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Media Images */}
                    {((displayBranch?.media && displayBranch.media.length > 0) || (selectedPlace.menuImages && selectedPlace.menuImages.length > 0)) && (
                      <div style={{ margin: "20px 0" }}>
                        <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                          {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace.menuImages!).map((img, i) => (
                            <ImageWithSkeleton key={i} src={img} alt="ميديا" onClick={() => setActiveMenuIndex(i)}
                              style={{ width: "140px", height: "180px", objectFit: "cover", borderRadius: "var(--radius-sm)", cursor: "pointer", flexShrink: 0 }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Description Section */}
                    {selectedPlace.description && (
                      <div style={{ background: "rgba(120, 120, 120, 0.03)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px" }}>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>نبذة عن المكان</h4>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
                          {selectedPlace.description}
                        </p>
                      </div>
                    )}

                    {/* Good to Know Card */}
                    <div style={{ marginBottom: "24px" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>معلومات مفيدة</h3>
                      <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(() => {
                          const activeFeatures = (displayBranch as any).features || (selectedPlace as any).features;
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
                          return selectedPlace.category === "restaurant" || selectedPlace.category === "cafe" ? (
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
                                <span>مداخل سهلة للكراسي المتحركة</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                                <span style={{ fontSize: "1.1rem" }}>👨‍👩‍👧‍👦</span>
                                <span>مناسب لجميع الأعمار</span>
                              </div>
                            </>
                          );
                        })()}

                        {/* Sub-categories Badges inside Good to Know */}
                        {selectedPlace.subCategories && selectedPlace.subCategories.length > 0 && (
                          <div style={{ borderTop: "1px solid rgba(120, 120, 120, 0.1)", paddingTop: "12px", marginTop: "4px" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "8px", fontWeight: "600" }}>التصنيفات الفرعية:</span>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {selectedPlace.subCategories.map((subCatKey) => (
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
                          {(displayBranch as any).website_url || (selectedPlace as any).website_url ? (
                            <a href={(displayBranch as any).website_url || (selectedPlace as any).website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.92rem", color: "#007aff", textDecoration: "none", fontWeight: "bold", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {(displayBranch as any).website_url || (selectedPlace as any).website_url}
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
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>مواعيد العمل</h3>
                        <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", padding: "16px 20px" }}>
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
                                          {day.isWorking ? `من ${day.openTime} ${day.openPeriod} حتي ${day.closeTime} ${day.closePeriod}` : "إجازة"}
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
                        onClick={() => alert(`تم إرسال بلاغ عن مشكلة للمكان ذو الكود #${selectedPlace.id}`)}
                        style={{
                          width: "100%",
                          background: "rgba(255, 59, 48, 0.1)",
                          border: "1px solid rgba(255, 59, 48, 0.2)",
                          borderRadius: "12px",
                          padding: "14px",
                          color: "#ff3b30",
                          fontWeight: "bold",
                          fontSize: "0.95rem",
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
                          onClick={() => alert("سيتم إضافة هذا المكان كـ Pin في خريطتك")}
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
                          <i className="bx bx-pin" style={{ fontSize: "1.1rem" }}></i>
                          <span>تثبيت الدبوس</span>
                        </button>

                        <button
                          onClick={() => alert("طلب ملكية هذا المكان تحت المراجعة")}
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
                          <i className="bx bx-badge-check" style={{ fontSize: "1.1rem" }}></i>
                          <span>امتلاك هذا المكان</span>
                        </button>
                      </div>

                      {/* Unique ID */}
                      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", fontSize: "0.78rem", color: "var(--text-muted)", opacity: 0.7, marginTop: "12px" }}>
                        <span>كود المكان: #{selectedBranchId || selectedPlace.id}</span>
                      </div>
                    </div>

                    {/* Reviews Section inside modal */}
                    <ReviewSection
                      place={selectedPlace}
                      selectedBranchId={selectedBranchId}
                      onRatingUpdate={(r, c) => setSelectedPlace({ ...selectedPlace, rating: r, reviewsCount: c })}
                    />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ MEDIA LIGHTBOX ═══════════════════════════════════ */}
      {(() => {
        const displayBranch = selectedBranchId && selectedPlace ? (selectedPlace.branches?.find(b => b.id === selectedBranchId) || selectedPlace) : selectedPlace;
        return activeMenuIndex !== null && ((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace?.menuImages) && (
          <div className="ios-sheet-overlay" onClick={() => setActiveMenuIndex(null)} style={{ alignItems: "center", justifyContent: "center" }}>

            <button
              onClick={() => setActiveMenuIndex(null)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.5rem",
                zIndex: 1102
              }}
            >
              ✕
            </button>

            {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace!.menuImages!).length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const arr = ((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace!.menuImages!);
                  setActiveMenuIndex((activeMenuIndex - 1 + arr.length) % arr.length);
                }}
                style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1101 }}
              >
                ❯
              </button>
            )}

            <ImageWithSkeleton
              src={((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace!.menuImages!)[activeMenuIndex]}
              alt="ميديا"
              onClick={(e: any) => e.stopPropagation()}
              style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "var(--radius-md)", objectFit: "contain", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}
            />

            {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace!.menuImages!).length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const arr = ((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace!.menuImages!);
                  setActiveMenuIndex((activeMenuIndex + 1) % arr.length);
                }}
                style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1101 }}
              >
                ❮
              </button>
            )}

            {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace!.menuImages!).length > 1 && (
              <div style={{ position: "absolute", bottom: "24px", color: "#fff", background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: "12px", fontSize: "0.9rem" }}>
                {activeMenuIndex + 1} / {((displayBranch?.media && displayBranch.media.length > 0) ? displayBranch.media : selectedPlace!.menuImages!).length}
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════════════════════════════ ADD PLACE MODAL ═══════════════════════════════════ */}
      {showAddModal && (
        <div className="ios-sheet-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ios-sheet" onClick={(e: any) => e.stopPropagation()}>
            <div className="ios-sheet-drag-handle" onClick={() => setShowAddModal(false)} />
            <div className="ios-sheet-content">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: "800", marginBottom: "24px" }}>➕ إضافة مكان جديد</h2>
              <form onSubmit={handleAddPlace} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="اسم المكان *" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                <select className="ios-input help-select" style={{ paddingRight: "16px" }} value={newCategory} onChange={(e) => setNewCategory(e.target.value as PlaceCategory)}>
                  {(["restaurant", "cafe", "pharmacy", "medicalCenter", "garden", "family", "entertainment", "work"] as PlaceCategory[]).map((c) => (
                    <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="الموقع المختصر (مثال: مصر الجديدة) *" value={newBriefLocation} onChange={(e) => setNewBriefLocation(e.target.value)} required />
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="العنوان التفصيلي" value={newFullAddress} onChange={(e) => setNewFullAddress(e.target.value)} />
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="أرقام التليفون (افصل بفاصلة)" value={newPhones} onChange={(e) => setNewPhones(e.target.value)} />
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="رابط خرائط جوجل" value={newMapsUrl} onChange={(e) => setNewMapsUrl(e.target.value)} />
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="رابط صورة المكان" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="مواعيد العمل" value={newWorkingHours} onChange={(e) => setNewWorkingHours(e.target.value)} />
                <textarea className="ios-input" style={{ paddingRight: "16px", minHeight: "80px", resize: "vertical" }} placeholder="وصف المكان" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="خط العرض (Lat)" value={newLat} onChange={(e) => setNewLat(e.target.value)} type="number" step="any" />
                  <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="خط الطول (Lng)" value={newLng} onChange={(e) => setNewLng(e.target.value)} type="number" step="any" />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="ios-btn ios-btn-primary" style={{ flex: 1 }}>إضافة المكان</button>
                  <button type="button" className="ios-btn" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}><i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i><i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <React.Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>جاري التحميل...</div>}>
      <HomeContent />
    </React.Suspense>
  );
}

/* ─── Shared Place Card Content ─── */


/* ── Shared Image Component ── */
function ImageWithSkeleton({ src, alt, style, className, onClick, onError }: any) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative", ...style, overflow: "hidden" }} className={className} onClick={onClick}>
      {!loaded && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg-glass-card)", animation: "pulse 1.5s infinite" }} />
      )}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: style?.objectFit || "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onLoad={() => setLoaded(true)}
        onError={(e: any) => {
          setLoaded(true);
          if (onError) onError(e);
        }}
      />
    </div>
  );
}

/* ─── مكون الأقسام المقسمة لصفحات (Paginated Section Component) ─── */
function PaginatedSection({ title, places, setSelectedPlace, getCategoryColor, toggleFavorite, favoriteIds, showRating = false, emptyMessage, itemsPerPage = 6, forceThreeColumns = false }: {
  title: React.ReactNode;
  places: any[]; // Avoid typing issues
  setSelectedPlace: (place: any) => void;
  getCategoryColor: (cat: string) => string;
  toggleFavorite: (e: React.MouseEvent, placeId: string) => void;
  favoriteIds: Set<string>;
  showRating?: boolean;
  emptyMessage?: React.ReactNode;
  itemsPerPage?: number;
  forceThreeColumns?: boolean;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(places.length / itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [places.length]);

  if (places.length === 0 && !emptyMessage) return null;

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedPlaces = places.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section style={{ animation: "slide-in-section 0.5s ease both" }}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      {places.length === 0 && emptyMessage ? (
        <div className="glass-panel" style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className={forceThreeColumns ? "grid-3-cols" : ""} style={forceThreeColumns ? { width: "100%" } : { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", width: "100%" }}>
            {paginatedPlaces.map((place) => (
              <div key={place.id} className="glass-card" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative", width: "100%", maxWidth: "320px", flex: forceThreeColumns ? "unset" : "1 1 280px" }}>
                <PlaceCardContent place={place} getCategoryColor={getCategoryColor} showRating={showRating} toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
      <hr className="section-divider" />
    </section>
  );
}

/* ─── مكون كارد المكان الفردي (Place Card Content Component) ─── */
function PlaceCardContent({ place, getCategoryColor, showRating, toggleFavorite, favoriteIds }: {
  place: PlaceWithDist;
  getCategoryColor: (cat: string) => string;
  showRating?: boolean;
  toggleFavorite?: (e: React.MouseEvent, placeId: string) => void;
  favoriteIds?: Set<string>;
}) {
  return (
    <>
      <div style={{ width: "100%", height: "180px", position: "relative", overflow: "hidden" }}>
        <ImageWithSkeleton
          src={place.images?.[0] ?? ""}
          alt={place.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e: any) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"; }}
        />
        {toggleFavorite && favoriteIds && (
          <button
            onClick={(e) => toggleFavorite(e, place.id.toString())}
            style={{
              position: "absolute", top: "12px", left: "12px", zIndex: 1, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", border: "none",
              borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.1rem"
            }}
          >
            {favoriteIds.has(place.id.toString()) ? (
              <i className="bx bxs-heart" style={{ color: "#ff3b30", fontSize: "1.2rem" }}></i>
            ) : (
              <i className="bx bx-heart" style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}></i>
            )}
          </button>
        )}
        <span style={{ position: "absolute", top: "12px", right: "12px", background: getCategoryColor(place.category), color: "#fff", fontSize: "0.78rem", fontWeight: "700", padding: "5px 10px", borderRadius: "10px", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", gap: "5px" }}>
          <i className={`bx ${CATEGORY_ICONS[place.category]}`} style={{ fontSize: "0.95rem" }}></i> {place.categoryLabel}
        </span>
        {(showRating || place.rating !== undefined) && place.rating !== undefined && (
          <span style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: "#fff", padding: "4px 10px", borderRadius: "10px", fontSize: "0.82rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
            ⭐ {Number(place.rating).toFixed(1)} {place.reviewsCount ? `(${place.reviewsCount})` : ''}
          </span>
        )}
        {place.distanceKm !== undefined && (
          <span style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(47,128,237,0.75)", backdropFilter: "blur(6px)", color: "#fff", padding: "4px 10px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "700" }}>
            {place.distanceKm < 1 ? `${Math.round(place.distanceKm * 1000)} م` : `${place.distanceKm.toFixed(1)} كم`}
            {place.closestBranchName && ` (${place.closestBranchName})`}
          </span>
        )}
      </div>
      <div style={{ padding: "16px 16px 18px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: "800", marginBottom: "4px", color: "var(--text-primary)" }}>{place.name}</h3>
        {place.shortDescription && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {place.shortDescription}
          </p>
        )}
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
          <span>📍</span> {place.city} / {place.governorate}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.76rem", opacity: 0.7, margin: "0 0 4px", display: "flex", alignItems: "center", gap: "5px" }}>
          <span>🔑</span> كود المكان: #{place.id}
        </p>
        {place.workingHours && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px", marginTop: "4px" }}>
            <span>🕐</span> {getTodayWorkingHoursText(place.workingHours)}
          </p>
        )}
        {place.branches && place.branches.length > 1 && (
          <p style={{ color: "var(--accent-ios)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px", marginTop: "4px", fontWeight: "600" }}>
            <span>🏢</span> عدد الفروع: {place.branches.length}
          </p>
        )}
      </div>
    </>
  );
}
