"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Place } from "@/data/places";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getTodayWorkingHoursText, parseWorkingHours, DAYS_OF_WEEK } from "@/lib/workingHours";
import ReviewSection from "@/components/ReviewSection";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string;
  };
}

export default function PlaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

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
  
  const { user } = useAuth();

  // Theme & Location states
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchPlace = async () => {
      if (!supabase) return;
      try {
        const { data: dbPlace, error } = await supabase
          .from('places')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (dbPlace) {
          const mappedPlace: Place = {
            id: dbPlace.id,
            name: dbPlace.name,
            category: dbPlace.category,
            categoryLabel: dbPlace.category_label,
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

    // 2. Load theme
    const savedTheme = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }

    // 3. Load user location quietly if permission is already granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {}, // Ignore errors, keep userLocation as null
        { enableHighAccuracy: true }
      );
    }
  }, [id]);

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

  // Calculate distance if coordinates are available
  const currentDistance =
    userLocation && place.latitude && place.longitude
      ? calculateDistance(userLocation.latitude, userLocation.longitude, place.latitude, place.longitude)
      : null;

  return (
    <div className="app-container" style={{ maxWidth: "800px", paddingBottom: "100px" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button 
          className="ios-btn"
          onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 19 12 12 5"></polyline>
          </svg>
          العودة
        </button>

        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>تفاصيل المكان</h3>
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
            {getCategoryIcon(place.category, 14)}
            {place.categoryLabel}
          </span>
        </div>

        {/* Info Padding */}
        <div style={{ padding: "30px" }}>
          {/* Title Area */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: "1.3" }}>
                {place.name}
              </h1>
              {place.shortDescription && (
                <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginTop: "8px", fontWeight: "500" }}>
                  {place.shortDescription}
                </p>
              )}
              
              {/* Reviews & Rating Badge (Clickable) */}
              <div 
                onClick={() => {
                  const el = document.getElementById("reviews-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ 
                  display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "12px", 
                  background: "rgba(255, 159, 10, 0.12)", color: "#ff9f0a", padding: "6px 14px", 
                  borderRadius: "12px", fontSize: "1rem", fontWeight: "bold", border: "1px solid rgba(255, 159, 10, 0.2)",
                  cursor: "pointer"
                }}
              >
                <span>⭐ {Number(place.rating || 0).toFixed(1)}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "normal" }}>({place.reviewsCount || 0} تقييم)</span>
              </div>
            </div>
            
            {/* Proximity / Distance Badge */}
            {currentDistance !== null && (
              <div style={{ background: "rgba(52, 199, 89, 0.12)", color: "var(--accent-success)", padding: "6px 14px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "1rem", fontWeight: "bold", border: "1px solid rgba(52, 199, 89, 0.2)" }}>
                📍 {currentDistance < 1
                  ? `${Math.round(currentDistance * 1000)} متر`
                  : `${currentDistance.toFixed(1)} كم`}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "1rem", marginTop: "16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{place.city} / {place.governorate}</span>
          </div>

          {/* Action Call / Map Box */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", margin: "30px 0" }}>
            <a
              href={`tel:${place.phones[0]}`}
              className="ios-btn ios-btn-primary"
              style={{ textDecoration: "none", padding: "14px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              اتصال مباشر
            </a>

            <a
              href={
                place.latitude && place.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
                  : place.googleMapsUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="ios-btn"
              style={{ textDecoration: "none", padding: "14px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              {place.latitude && place.longitude ? "رسم اتجاهات الطريق" : "خرائط جوجل"}
            </a>
          </div>

          {/* Description */}
          {place.description && (
            <div style={{ background: "rgba(120, 120, 120, 0.05)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-md)", padding: "20px", marginBottom: "30px" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "10px", color: "var(--text-primary)" }}>نبذة عن المكان</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.8", textAlign: "justify" }}>
                {place.description}
              </p>
            </div>
          )}

          {/* Details Panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-md)", padding: "20px", background: "rgba(120, 120, 120, 0.03)" }}>
            {/* Working Hours */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(120,120,120,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>ساعات العمل</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>{place.workingHours ? getTodayWorkingHoursText(place.workingHours) : "غير محدد"}</span>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", borderTop: "1px solid rgba(120,120,120,0.1)", paddingTop: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(120,120,120,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>العنوان التفصيلي</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", lineHeight: "1.5" }}>{place.fullAddress}</span>
              </div>
            </div>

            {/* Coordinates */}
            {place.latitude && place.longitude && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(120,120,120,0.1)", paddingTop: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(120,120,120,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="2" x2="12" y2="22"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                  </svg>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>الإحداثيات الجغرافية</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: "bold", fontFamily: "monospace" }}>{place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}</span>
                </div>
              </div>
            )}

            {/* Phones */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", borderTop: "1px solid rgba(120,120,120,0.1)", paddingTop: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(120,120,120,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>أرقام التواصل</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {place.phones.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone}`}
                      style={{
                        background: "rgba(120, 120, 120, 0.08)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "10px",
                        padding: "6px 14px",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        color: "var(--accent-ios)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none"
                      }}
                    >
                      ☎ {phone}
                    </a>
                  ))}
                </div>
                </div>
              </div>

            {/* Working Hours Schedule */}
            {place.workingHours && (
              <div style={{ borderTop: "1px solid rgba(120,120,120,0.1)", paddingTop: "20px", marginTop: "20px" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🕐</span> مواعيد العمل
                </h4>
                {(() => {
                  const parsed = parseWorkingHours(place.workingHours);
                  if (!parsed) return <div style={{ color: "var(--text-secondary)" }}>{place.workingHours}</div>;

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
            )}
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

          {/* Menu Section */}
          {place.menuImages && place.menuImages.length > 0 && (
            <div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-primary)" }}>قائمة الطعام والخدمات (المنيو)</h4>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
                {place.menuImages.map((menuUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveMenuIndex(idx)}
                    style={{ width: "130px", height: "170px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, border: "1px solid var(--border-glass)", cursor: "pointer", position: "relative" }}
                  >
                    <img
                      src={menuUrl}
                      alt={`menu-${idx}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "8px", color: "#fff", fontSize: "0.75rem", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}>
                      تكبير 🔍
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <ReviewSection 
            place={place} 
            onRatingUpdate={(r, c) => setPlace({ ...place, rating: r, reviewsCount: c })}
          />
        </div>
      </div>

      {/* Lightbox / Zoom component */}
      {activeMenuIndex !== null && place?.menuImages && (
        <div 
          onClick={() => setActiveMenuIndex(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(12px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fade-in 0.25s ease"
          }}
        >
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
              fontSize: "1.5rem"
            }}
          >
            ✕
          </button>
          
          {place.menuImages.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveMenuIndex((activeMenuIndex - 1 + place.menuImages!.length) % place.menuImages!.length); }}
              style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1101 }}
            >
              ❯
            </button>
          )}

          <img
            src={place.menuImages[activeMenuIndex]}
            alt="Expanded Menu"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            style={{
              maxWidth: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
            }}
          />

          {place.menuImages.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveMenuIndex((activeMenuIndex + 1) % place.menuImages!.length); }}
              style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1101 }}
            >
              ❮
            </button>
          )}

          {place.menuImages.length > 1 && (
            <div style={{ position: "absolute", bottom: "24px", color: "#fff", background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: "12px", fontSize: "0.9rem" }}>
              {activeMenuIndex + 1} / {place.menuImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
