"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getStoredCities, getFavoriteLandmarkIds, toggleLandmarkFavorite, syncUserFavoritesFromSupabase, CityLandmark, FamousCity } from "@/data/cities";
import LandmarkDetailModal from "@/components/cities/LandmarkDetailModal";
import RequireAuthModal from "@/components/common/RequireAuthModal";

function getFavoritedLandmarksAsItems() {
  const favIds = getFavoriteLandmarkIds();
  if (favIds.length === 0) return [];

  const cities = getStoredCities();
  const result: any[] = [];

  cities.forEach((city) => {
    (city.landmarks || []).forEach((lm) => {
      if (favIds.includes(lm.id)) {
        result.push({
          id: lm.id,
          name: lm.name,
          category: "landmark",
          categoryLabel: "معلم سياحي",
          briefLocation: `مدينة ${city.name}`,
          fullAddress: lm.description,
          images: lm.images && lm.images.length > 0 ? lm.images : [lm.cover_image],
          isLandmark: true,
          landmarkObj: lm,
          cityObj: city,
        });
      }
    });
  });

  return result;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFavCategory, setSelectedFavCategory] = useState<string>("الكل");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [activeLandmarkModal, setActiveLandmarkModal] = useState<{ landmark: CityLandmark; city: FamousCity } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      syncUserFavoritesFromSupabase(user.id).then(() => {
        fetchFavorites();
      });
    } else {
      fetchFavorites();
    }

    const handleFavsUpdated = () => {
      fetchFavorites();
    };
    window.addEventListener("favorites_updated", handleFavsUpdated);

    return () => {
      window.removeEventListener("favorites_updated", handleFavsUpdated);
    };
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    setLoading(true);
    let mappedFavs: any[] = [];

    if (supabase && user) {
      const { data: favs } = await supabase
        .from('favorite_places')
        .select('place_id')
        .eq('user_id', user.id);

      if (favs && favs.length > 0) {
        const placeIds = favs.map((f: any) => f.place_id);
        const { data: favPlaces } = await supabase
          .from('places')
          .select('*')
          .in('id', placeIds);

        if (favPlaces) {
          mappedFavs = favPlaces.map(dbPlace => ({
            id: dbPlace.id,
            name: dbPlace.name,
            category: dbPlace.category,
            categoryLabel: dbPlace.category_label,
            briefLocation: dbPlace.brief_location,
            fullAddress: dbPlace.full_address,
            images: dbPlace.images || [],
          }));
        }
      }
    }

    const landmarkFavs = getFavoritedLandmarksAsItems();
    setFavorites([...landmarkFavs, ...mappedFavs]);
    setLoading(false);
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (item.isLandmark) {
      toggleLandmarkFavorite(item.id);
      setFavorites(prev => prev.filter(p => p.id !== item.id));
    } else if (supabase) {
      await supabase.from('favorite_places').delete().match({ user_id: user.id, place_id: item.id.toString() });
      setFavorites(prev => prev.filter(p => p.id !== item.id));
    }
  };

  if (loading || authLoading) {
    return <div style={{ textAlign: "center", padding: "50px", minHeight: "100vh" }}>جاري تحميل المفضلة...</div>;
  }

  const categories = Array.from(new Set(favorites.map(f => f.categoryLabel || f.category)));

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bgGlass)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid var(--borderGlass)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%" }}>
              <i className="bx bx-chevron-right" style={{ fontSize: "1.8rem", color: "var(--textPrimary)" }}></i>
            </button>
            <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>الأماكن المفضلة</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "0 20px" }}>
        {!user ? (
          <div style={{ position: "relative" }}>
            <div style={{ filter: "blur(6px)", opacity: 0.5, pointerEvents: "none", userSelect: "none" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "60px", height: "35px", background: "var(--borderGlass-bright)", borderRadius: "20px" }}></div>
                <div style={{ width: "80px", height: "35px", background: "var(--borderGlass-bright)", borderRadius: "20px" }}></div>
                <div style={{ width: "70px", height: "35px", background: "var(--borderGlass-bright)", borderRadius: "20px" }}></div>
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card" style={{ height: "114px", borderRadius: "12px", background: "var(--borderGlass-bright)" }}></div>
                ))}
              </div>
            </div>

            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, marginTop: "40px" }}>
              <div className="glass-panel" style={{ padding: "30px 20px", borderRadius: "var(--modelCardRadius)", textAlign: "center", width: "95%", maxWidth: "340px", border: "1px solid var(--modelCardBorder)", boxShadow: "var(--modelCardShadow)" }}>
                <div style={{ width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <img
                    src="/images/icons3d/padlock.png"
                    width="64"
                    height="auto"
                    alt="lock" />
                </div>
                <h2 style={{ margin: "0 0 10px", fontSize: "1.3rem", color: "var(--textPrimary)" }}>سجل الدخول أولاً</h2>
                <p className="sub-title" style={{ margin: "0 0 20px", color: "var(--textSecondary)", lineHeight: "1.5" }}>
                  يجب عليك تسجيل الدخول لتتمكن من رؤية الأماكن المفضلة لديك وإدارتها.
                </p>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button onClick={() => router.push('/login')} className="btn btn-primary sub-title" style={{ flex: 1, fontSize: "1rem" }}>
                    تسجيل الدخول
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
            <img
              src="/images/icons3d/broken_heart.png"
              width="64"
              height="auto"
              alt="broken heart" />
            <p className="sub-title" style={{ margin: 0, fontSize: "1rem", color: "var(--textPrimary)", fontWeight: "600" }}>لا يوجد أماكن مفضلة</p>
            <p className="sub-title" style={{ marginTop: "8px", fontSize: "0.85rem" }}>لم تقم بإضافة أي أماكن للمفضلة بعد.</p>
          </div>
        ) : (
          <div>
            {/* Tabs Row */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                paddingBottom: "16px",
                marginBottom: "20px",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
              className="hide-scrollbar"
            >
              <button
                onClick={() => setSelectedFavCategory("الكل")}
                className="sub-title"
                style={{
                  padding: "var(--paddingBtn)",
                  borderRadius: "var(--radiusBtnTabs)",
                  border: "none",
                  background: selectedFavCategory === "الكل" ? "var(--mainBtn)" : "var(--secondBtn)",
                  color: selectedFavCategory === "الكل" ? "#fff" : "var(--textPrimary)",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0
                }}
              >
                الكل
                <span className="sub-title" style={{ background: selectedFavCategory === "الكل" ? "rgba(255,255,255,0.25)" : "var(--bgGlass)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: selectedFavCategory === "الكل" ? "#fff" : "var(--textSecondary)" }}>
                  {favorites.length}
                </span>
              </button>

              {categories.map(catLabel => {
                const count = favorites.filter(f => (f.categoryLabel || f.category) === catLabel).length;
                return (
                  <button
                    key={catLabel}
                    onClick={() => setSelectedFavCategory(catLabel)}
                    className="sub-title"
                    style={{
                      padding: "var(--paddingBtn)",
                      borderRadius: "var(--radiusBtnTabs)",
                      border: "none",
                      background: selectedFavCategory === catLabel ? "var(--mainBtn)" : "var(--secondBtn)",
                      color: selectedFavCategory === catLabel ? "#fff" : "var(--textPrimary)",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0
                    }}
                  >
                    {catLabel}
                    <span style={{ background: selectedFavCategory === catLabel ? "rgba(255,255,255,0.25)" : "var(--bgGlass)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: selectedFavCategory === catLabel ? "#fff" : "var(--textSecondary)" }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filtered Places Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100%, 1fr))", gap: "16px" }}>
              {favorites
                .filter(p => selectedFavCategory === "الكل" || (p.categoryLabel || p.category) === selectedFavCategory)
                .map((place) => (
                  <div
                    key={place.id}
                    className="glass-card place-card-scroll"
                    style={{ position: "relative", cursor: "pointer", width: "100%", display: "flex", padding: "12px", gap: "12px", alignItems: "center" }}
                    onClick={() => {
                      if (place.isLandmark) {
                        setActiveLandmarkModal({ landmark: place.landmarkObj, city: place.cityObj });
                      } else {
                        router.push(`/places/${place.id}`);
                      }
                    }}
                  >
                    <div style={{ width: "90px", height: "90px", position: "relative", overflow: "hidden", borderRadius: "8px", flexShrink: 0 }}>
                      <img src={place.images?.[0] || "/placeholder.jpg"} alt={place.name} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={(e) => handleRemoveFavorite(e, place)}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <i className="bx bxs-heart" style={{ color: "#ff3b30", fontSize: "1.1rem" }}></i>
                      </button>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{ fontSize: "1.05rem", margin: "0 0 4px", color: "var(--textPrimary)", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.name}</h2>
                      <p className="sub-title" style={{ fontSize: "0.85rem", color: "var(--textSecondary)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {place.briefLocation}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                        <span className="category-pill" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>{place.categoryLabel || place.category}</span>
                      </div>
                    </div>
                    <i className="bx bx-chevron-left" style={{ fontSize: "1.4rem", color: "var(--text-muted)" }}></i>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {activeLandmarkModal && (
        <LandmarkDetailModal
          landmark={activeLandmarkModal.landmark}
          city={activeLandmarkModal.city}
          allCityLandmarks={activeLandmarkModal.city.landmarks || []}
          onClose={() => setActiveLandmarkModal(null)}
          onSelectLandmark={(newLm) => setActiveLandmarkModal({ landmark: newLm, city: activeLandmarkModal.city })}
        />
      )}

      {/* Render Auth Prompt Modal */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
