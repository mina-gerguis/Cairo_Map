"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Place, PlaceCategory, initialPlaces } from "../data/places";

/* ─── Helpers ─── */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const CATEGORY_EMOJIS: Record<string, string> = {
  restaurant: "🍽️", cafe: "☕", pharmacy: "💊",
  hospital: "🏥", garden: "🌳", family: "👨‍👩‍👧‍👦", entertainment: "🎭", all: "🗂️",
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "الكل", restaurant: "مطاعم", cafe: "كافيهات",
  pharmacy: "صيدليات", hospital: "مستشفيات", garden: "حدائق",
  family: "عائلية", entertainment: "ترفيهية",
};

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    restaurant: "#ff6b35", cafe: "#c67c52", pharmacy: "#34c759",
    hospital: "#ff3b30", garden: "#30d158", family: "#af52de", entertainment: "#ff9f0a",
  };
  return colors[cat] ?? "#2f80ed";
}

type PlaceWithDist = Place & { distanceKm?: number };

/* ═══════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════ */
function HomeContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuImage, setActiveMenuImage] = useState<string | null>(null);

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
    const saved = localStorage.getItem("dftry_places");
    if (saved) {
      try { setPlaces(JSON.parse(saved)); } catch { setPlaces(initialPlaces); }
    } else {
      setPlaces(initialPlaces);
      localStorage.setItem("dftry_places", JSON.stringify(initialPlaces));
    }

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
    return places.map((p) => ({
      ...p,
      distanceKm:
        userLocation && p.latitude && p.longitude
          ? haversineDistance(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude)
          : undefined,
    }));
  }, [places, userLocation]);

  /* Main filtered + searched list */
  const filteredPlaces = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedPlaces.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.briefLocation.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.fullAddress.toLowerCase().includes(q);
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
    return [...enrichedPlaces].filter((p) => p.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6);
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
            دفتري هو رفيقك الأمثل لاكتشاف المطاعم، الكافيهات، الحدائق، وأكثر بحسب موقعك. كل مكان تحتاجه الآن بضغطة واحدة.
          </p>

          {/* Integrated Search in Hero */}
          <div className="hero-search-wrapper">
            <div className="hero-search-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
            <button className="hero-btn-primary" onClick={() => document.getElementById('places-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              استكشف الأماكن
            </button>
            <button className="hero-btn-secondary" onClick={() => setIsProximityEnabled(!isProximityEnabled)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
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
        <div className="hero-scroll-indicator">
          <span>اكتشف</span>
          <div className="hero-scroll-arrow" />
        </div>
      </section>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className="app-container" id="places-section">

        {/* ── Categories + Proximity ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", flexGrow: 1 }}>
            {["all", "restaurant", "cafe", "pharmacy", "hospital", "garden", "family", "entertainment"].map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>{CATEGORY_EMOJIS[cat]}</span>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <button
            className={`ios-btn ${isProximityEnabled ? "ios-btn-primary" : ""}`}
            onClick={handleToggleProximity}
            disabled={locationLoading}
            style={{ padding: "10px 16px", fontSize: "0.9rem", flexShrink: 0, gap: "6px" }}
          >
            {locationLoading ? (
              <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            )}
            {isProximityEnabled ? "قريب مني ✓" : "قريب مني"}
          </button>
        </div>

        {/* ═══════════════════════════════════ SECTIONS MODE ═══════════════════════════════════ */}
        {showSections ? (
          <>
            {/* Section 1: Nearby */}
            {isProximityEnabled && (
              <section style={{ animation: "slide-in-section 0.5s ease both" }}>
                <div className="section-header">
                  <h2 className="section-title">📍 أماكن بالقرب منك</h2>
                  {nearbyPlaces.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>لا توجد أماكن في نطاق 10 كم</span>}
                </div>
                {nearbyPlaces.length > 0 ? (
                  <div className="places-scroll-row">
                    {nearbyPlaces.map((place) => (
                      <div key={place.id} className="glass-card place-card-scroll" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative" }}>
                        <PlaceCardContent place={place} getCategoryColor={getCategoryColor} toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    فعّل الموقع للعثور على أماكن قريبة منك 📍
                  </div>
                )}
                <hr className="section-divider" />
              </section>
            )}

            {/* Section 2: Top Rated */}
            <section style={{ animation: "slide-in-section 0.5s 0.05s ease both" }}>
              <div className="section-header">
                <h2 className="section-title">⭐ الأكثر زيارة</h2>
              </div>
              <div className="places-scroll-row">
                {topRatedPlaces.map((place) => (
                  <div key={place.id} className="glass-card place-card-scroll" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative" }}>
                    <PlaceCardContent place={place} getCategoryColor={getCategoryColor} showRating toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
                  </div>
                ))}
              </div>
              <hr className="section-divider" />
            </section>

            {/* Section 3: Family */}
            {familyPlaces.length > 0 && (
              <section style={{ animation: "slide-in-section 0.5s 0.1s ease both" }}>
                <div className="section-header">
                  <h2 className="section-title">👨‍👩‍👧‍👦 أماكن عائلية</h2>
                </div>
                <div className="places-scroll-row">
                  {familyPlaces.map((place) => (
                    <div key={place.id} className="glass-card place-card-scroll" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative" }}>
                      <PlaceCardContent place={place} getCategoryColor={getCategoryColor} toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
                    </div>
                  ))}
                </div>
                <hr className="section-divider" />
              </section>
            )}

            {/* Section 4: Entertainment */}
            {entertainmentPlaces.length > 0 && (
              <section style={{ animation: "slide-in-section 0.5s 0.15s ease both" }}>
                <div className="section-header">
                  <h2 className="section-title">🎭 أماكن ترفيهية</h2>
                </div>
                <div className="places-scroll-row">
                  {entertainmentPlaces.map((place) => (
                    <div key={place.id} className="glass-card place-card-scroll" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative" }}>
                      <PlaceCardContent place={place} getCategoryColor={getCategoryColor} toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
                    </div>
                  ))}
                </div>
                <hr className="section-divider" />
              </section>
            )}

            {/* Section 5: All Places */}
            <section style={{ animation: "slide-in-section 0.5s 0.2s ease both" }}>
              <div className="section-header">
                <h2 className="section-title">🗂️ جميع الأماكن</h2>
              </div>
              <div className="grid-places">
                {enrichedPlaces.map((place) => (
                  <div key={place.id} className="glass-card" onClick={() => setSelectedPlace(place)} style={{ cursor: "pointer", position: "relative" }}>
                    <PlaceCardContent place={place} getCategoryColor={getCategoryColor} toggleFavorite={toggleFavorite} favoriteIds={favoriteIds} />
                  </div>
                ))}
              </div>
            </section>
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
        <div className="ios-sheet-overlay" onClick={() => setSelectedPlace(null)}>
          <div className="ios-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ios-sheet-drag-handle" onClick={() => setSelectedPlace(null)} />
            <div className="ios-sheet-content">
              {/* Images */}
              {selectedPlace.images && selectedPlace.images.length > 0 && (
                <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "20px", scrollbarWidth: "none" }}>
                  {selectedPlace.images.map((img, i) => (
                    <img key={i} src={img} alt={`${selectedPlace.name} ${i + 1}`}
                      style={{ width: "100%", minWidth: "100%", height: "230px", objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"; }} />
                  ))}
                </div>
              )}

              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: "800" }}>{selectedPlace.name}</h2>
                <span style={{ background: getCategoryColor(selectedPlace.category), color: "#fff", padding: "5px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
                  {CATEGORY_EMOJIS[selectedPlace.category]} {selectedPlace.categoryLabel}
                </span>
              </div>

              {selectedPlace.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ color: "#ff9f0a", fontSize: "1.1rem" }}>⭐</span>
                  <span style={{ fontWeight: "700" }}>{selectedPlace.rating}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>/ 5.0</span>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "6px" }}>
                <span>📍</span> {selectedPlace.briefLocation}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: selectedPlace.workingHours ? "6px" : "20px" }}>
                {selectedPlace.fullAddress}
              </div>
              {selectedPlace.workingHours && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
                  <span>🕐</span> {selectedPlace.workingHours}
                </div>
              )}

              {selectedPlace.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", marginBottom: "20px", padding: "14px", background: "rgba(120,120,120,0.05)", borderRadius: "var(--radius-sm)", borderRight: "3px solid var(--accent-ios)" }}>
                  {selectedPlace.description}
                </p>
              )}

              {/* Phones */}
              {selectedPlace.phones && selectedPlace.phones.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: "700", marginBottom: "10px" }}>📞 أرقام التليفون</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedPlace.phones.map((phone, i) => (
                      <a key={i} href={`tel:${phone}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.2)", borderRadius: "var(--radius-sm)", color: "var(--accent-success)", fontWeight: "600", fontSize: "1.1rem", direction: "ltr", textDecoration: "none" }}>
                        📞 {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                <a href={selectedPlace.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="ios-btn ios-btn-primary" style={{ flex: 1, textDecoration: "none", minWidth: "140px" }}>
                  🗺️ فتح الخريطة
                </a>
                {userLocation && selectedPlace.latitude && selectedPlace.longitude && (
                  <a href={`https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${selectedPlace.latitude},${selectedPlace.longitude}`}
                    target="_blank" rel="noopener noreferrer" className="ios-btn" style={{ flex: 1, textDecoration: "none", minWidth: "140px" }}>
                    🧭 الاتجاهات
                  </a>
                )}
              </div>

              {/* Menu Images */}
              {selectedPlace.menuImages && selectedPlace.menuImages.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: "700", marginBottom: "10px" }}>📋 المنيو</h3>
                  <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                    {selectedPlace.menuImages.map((img, i) => (
                      <img key={i} src={img} alt="منيو" onClick={() => setActiveMenuImage(img)}
                        style={{ width: "140px", height: "180px", objectFit: "cover", borderRadius: "var(--radius-sm)", cursor: "pointer", flexShrink: 0 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ MENU IMAGE LIGHTBOX ═══════════════════════════════════ */}
      {activeMenuImage && (
        <div className="ios-sheet-overlay" onClick={() => setActiveMenuImage(null)} style={{ alignItems: "center" }}>
          <img src={activeMenuImage} alt="منيو" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "var(--radius-md)", objectFit: "contain" }} />
        </div>
      )}

      {/* ═══════════════════════════════════ ADD PLACE MODAL ═══════════════════════════════════ */}
      {showAddModal && (
        <div className="ios-sheet-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ios-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ios-sheet-drag-handle" onClick={() => setShowAddModal(false)} />
            <div className="ios-sheet-content">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: "800", marginBottom: "24px" }}>➕ إضافة مكان جديد</h2>
              <form onSubmit={handleAddPlace} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input className="ios-input" style={{ paddingRight: "16px" }} placeholder="اسم المكان *" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                <select className="ios-input help-select" style={{ paddingRight: "16px" }} value={newCategory} onChange={(e) => setNewCategory(e.target.value as PlaceCategory)}>
                  {(["restaurant","cafe","pharmacy","hospital","garden","family","entertainment"] as PlaceCategory[]).map((c) => (
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
                  <button type="button" className="ios-btn" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>إلغاء</button>
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
        <img
          src={place.images?.[0] ?? ""}
          alt={place.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"; }}
        />
        {toggleFavorite && favoriteIds && (
          <button
            onClick={(e) => toggleFavorite(e, place.id.toString())}
            style={{
              position: "absolute", top: "12px", left: "12px", zIndex: 1, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", border: "none",
              borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.1rem"
            }}
          >
            {favoriteIds.has(place.id.toString()) ? "❤️" : "🤍"}
          </button>
        )}
        <span style={{ position: "absolute", top: "12px", right: "12px", background: getCategoryColor(place.category), color: "#fff", fontSize: "0.78rem", fontWeight: "700", padding: "5px 10px", borderRadius: "10px", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", gap: "5px" }}>
          {CATEGORY_EMOJIS[place.category]} {place.categoryLabel}
        </span>
        {(showRating || place.rating) && place.rating && (
          <span style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: "#fff", padding: "4px 10px", borderRadius: "10px", fontSize: "0.82rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
            ⭐ {place.rating}
          </span>
        )}
        {place.distanceKm !== undefined && (
          <span style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(47,128,237,0.75)", backdropFilter: "blur(6px)", color: "#fff", padding: "4px 10px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "700" }}>
            {place.distanceKm < 1 ? `${Math.round(place.distanceKm * 1000)} م` : `${place.distanceKm.toFixed(1)} كم`}
          </span>
        )}
      </div>
      <div style={{ padding: "16px 16px 18px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: "800", marginBottom: "6px", color: "var(--text-primary)" }}>{place.name}</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px" }}>
          <span>📍</span> {place.briefLocation}
        </p>
      </div>
    </>
  );
}
