"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFavCategory, setSelectedFavCategory] = useState<string>("الكل");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    if (!supabase || !user) return;
    setLoading(true);

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
        const mappedFavs = favPlaces.map(dbPlace => ({
          id: dbPlace.id,
          name: dbPlace.name,
          category: dbPlace.category,
          categoryLabel: dbPlace.category_label,
          briefLocation: dbPlace.brief_location,
          fullAddress: dbPlace.full_address,
          images: dbPlace.images || [],
        }));
        setFavorites(mappedFavs);
      }
    } else {
      setFavorites([]);
    }

    setLoading(false);
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    if (!supabase || !user) return;
    await supabase.from('favorite_places').delete().match({ user_id: user.id, place_id: placeId.toString() });
    setFavorites(prev => prev.filter(p => p.id !== placeId));
  };

  if (loading || authLoading) {
    return <div style={{ textAlign: "center", padding: "50px", minHeight: "100vh" }}>جاري تحميل المفضلة...</div>;
  }

  const categories = Array.from(new Set(favorites.map(f => f.categoryLabel || f.category)));

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-glass)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-glass)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%" }}>
              <i className="bx bx-chevron-right" style={{ fontSize: "1.8rem", color: "var(--text-primary)" }}></i>
            </button>
            <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>الأماكن المفضلة</h1>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255, 59, 48, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff3b30" }}>
            <i className="bx bxs-heart" style={{ fontSize: "1.2rem" }}></i>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "0 20px" }}>
        {!user ? (
          <div style={{ position: "relative" }}>
            <div style={{ filter: "blur(6px)", opacity: 0.5, pointerEvents: "none", userSelect: "none" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "60px", height: "35px", background: "var(--border-glass-bright)", borderRadius: "20px" }}></div>
                <div style={{ width: "80px", height: "35px", background: "var(--border-glass-bright)", borderRadius: "20px" }}></div>
                <div style={{ width: "70px", height: "35px", background: "var(--border-glass-bright)", borderRadius: "20px" }}></div>
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                {[1, 2, 3].map(i => (
                   <div key={i} className="glass-card" style={{ height: "114px", borderRadius: "12px", background: "var(--border-glass-bright)" }}></div>
                ))}
              </div>
            </div>
            
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, marginTop: "40px" }}>
              <div className="glass-panel" style={{ padding: "30px 20px", borderRadius: "24px", textAlign: "center", width: "95%", maxWidth: "340px", border: "1px solid rgba(108, 99, 255, 0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", color: "var(--accent-ios)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <i className="bx bxs-lock-alt" style={{ fontSize: "2rem" }}></i>
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)" }}>سجل الدخول أولاً</h3>
                <p style={{ margin: "0 0 20px", fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  يجب عليك تسجيل الدخول لتتمكن من رؤية الأماكن المفضلة لديك وإدارتها.
                </p>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button onClick={() => router.push('/login')} className="ios-btn ios-btn-primary" style={{ flex: 1, padding: "12px", fontSize: "1rem" }}>
                    تسجيل الدخول
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px", background: "var(--bg-glass-card)", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💔</div>
            <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)", fontWeight: "600" }}>لا يوجد أماكن مفضلة</p>
            <p style={{ marginTop: "8px", fontSize: "0.85rem" }}>لم تقم بإضافة أي أماكن للمفضلة بعد.</p>
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
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: selectedFavCategory === "الكل" ? "var(--accent-ios)" : "var(--border-glass-bright)",
                  color: selectedFavCategory === "الكل" ? "#fff" : "var(--text-primary)",
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
                <span style={{ background: selectedFavCategory === "الكل" ? "rgba(255,255,255,0.25)" : "var(--bg-glass)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: selectedFavCategory === "الكل" ? "#fff" : "var(--text-secondary)" }}>
                  {favorites.length}
                </span>
              </button>
              
              {categories.map(catLabel => {
                const count = favorites.filter(f => (f.categoryLabel || f.category) === catLabel).length;
                return (
                  <button
                    key={catLabel}
                    onClick={() => setSelectedFavCategory(catLabel)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "none",
                      background: selectedFavCategory === catLabel ? "var(--accent-ios)" : "var(--border-glass-bright)",
                      color: selectedFavCategory === catLabel ? "#fff" : "var(--text-primary)",
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
                    <span style={{ background: selectedFavCategory === catLabel ? "rgba(255,255,255,0.25)" : "var(--bg-glass)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: selectedFavCategory === catLabel ? "#fff" : "var(--text-secondary)" }}>
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
                    onClick={() => router.push(`/places/${place.id}`)}
                  >
                    <div style={{ width: "90px", height: "90px", position: "relative", overflow: "hidden", borderRadius: "12px", flexShrink: 0 }}>
                      <img src={place.images?.[0] || "/placeholder.jpg"} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button 
                        onClick={(e) => handleRemoveFavorite(e, place.id)}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <i className="bx bxs-heart" style={{ color: "#ff3b30", fontSize: "1.1rem" }}></i>
                      </button>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: "1.05rem", margin: "0 0 4px", color: "var(--text-primary)", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.name}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
    </div>
  );
}
