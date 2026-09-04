"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
  FaSubway,
  FaCheckCircle,
  FaStar,
  FaMapMarkerAlt,
  FaRandom,
  FaChevronRight,
  FaChevronLeft,
  FaWalking,
  FaBus,
  FaTrain,
  FaDotCircle,
} from "react-icons/fa";
import { CityLandmark, FamousCity, isLandmarkFavorite, toggleLandmarkFavorite } from "@/data/cities";
import { useAuth } from "@/context/AuthContext";
import RequireAuthModal from "@/components/common/RequireAuthModal";
import { IoMdClose } from "react-icons/io";

interface LandmarkDetailModalProps {
  landmark: CityLandmark;
  city: FamousCity;
  allCityLandmarks: CityLandmark[];
  onClose: () => void;
  onSelectLandmark: (landmark: CityLandmark) => void;
}

function detectTransportation(stationName: string): { typeName: string; icon: React.ReactNode; cleanName: string } {
  const rawName = stationName.trim();
  const lowerName = rawName.toLowerCase();

  let typeName = "وسيلة وصول";
  let icon = <FaSubway />;

  if (lowerName.includes("مترو")) {
    typeName = "مترو";
    icon = <FaSubway />;
  } else if (lowerName.includes("مونوريل")) {
    typeName = "مونوريل";
    icon = <FaSubway />;
  } else if (lowerName.includes("lrt") || lowerName.includes("القطار الكهربائي") || lowerName.includes("كهربائي")) {
    typeName = "قطار كهربائي LRT";
    icon = <FaSubway />;
  } else if (lowerName.includes("ترام")) {
    typeName = "ترام";
    icon = <FaSubway />;
  } else if (lowerName.includes("أتوبيس") || lowerName.includes("اتوبيس") || lowerName.includes("حافلة") || lowerName.includes("سوبر جيت") || lowerName.includes("جوباص") || lowerName.includes("موقف")) {
    typeName = "أتوبيس";
    icon = <FaBus />;
  } else if (lowerName.includes("ميكروباص")) {
    typeName = "ميكروباص";
    icon = <FaBus />;
  } else if (lowerName.includes("قطار") || lowerName.includes("سكة حديد") || lowerName.includes("القطار")) {
    typeName = "قطار";
    icon = <FaTrain />;
  }

  // Clean up common prefixes to make the title clean
  let cleanName = rawName;
  const prefixesToRemove = [
    "محطة مترو أنفاق",
    "محطة مترو الانفاق",
    "محطة مترو الأنفاق",
    "محطة القطار الكهربائي LRT",
    "محطة القطار الكهربائي",
    "محطة قطار كهربائي",
    "محطة قطار",
    "محطة مونوريل",
    "محطة ترام",
    "محطة ميكروباص",
    "محطة أتوبيس",
    "محطة اتوبيس",
    "محطة",
    "موقف أتوبيس",
    "موقف اتوبيس",
    "موقف ميكروباص",
    "موقف",
    "مترو أنفاق",
    "مترو الانفاق",
    "مترو الأنفاق",
    "قطار كهربائي LRT",
    "قطار كهربائي",
    "lrt",
    "مونوريل",
    "ميكروباص",
    "أتوبيس",
    "اتوبيس",
    "ترام",
    "قطار",
    "مترو"
  ];

  for (const prefix of prefixesToRemove) {
    if (cleanName.startsWith(prefix)) {
      cleanName = cleanName.substring(prefix.length).trim();
      break;
    }
  }

  return { typeName, icon, cleanName };
}

export default function LandmarkDetailModal({
  landmark,
  city,
  allCityLandmarks,
  onClose,
  onSelectLandmark,
}: LandmarkDetailModalProps) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [suggestedPlaces, setSuggestedPlaces] = useState<CityLandmark[]>([]);

  const galleryImages = React.useMemo(() => {
    const imgs: string[] = [];
    if (landmark.cover_image) {
      imgs.push(landmark.cover_image);
    }
    if (landmark.images && landmark.images.length > 0) {
      landmark.images.forEach((img) => {
        if (!imgs.includes(img)) {
          imgs.push(img);
        }
      });
    }
    return imgs.length > 0 ? imgs : [landmark.cover_image];
  }, [landmark]);

  useEffect(() => {
    setIsFav(isLandmarkFavorite(landmark.id));
    setActiveLightboxIndex(null);

    const otherLandmarks = allCityLandmarks.filter((l) => l.id !== landmark.id);
    if (otherLandmarks.length > 0) {
      const shuffled = [...otherLandmarks].sort(() => 0.5 - Math.random());
      setSuggestedPlaces(shuffled.slice(0, 6));
    } else {
      setSuggestedPlaces([]);
    }
  }, [landmark, allCityLandmarks]);

  useEffect(() => {
    if (activeLightboxIndex === null || galleryImages.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) => (prev !== null ? (prev === 0 ? galleryImages.length - 1 : prev - 1) : null));
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) => (prev !== null ? (prev === galleryImages.length - 1 ? 0 : prev + 1) : null));
      } else if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, galleryImages.length]);

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const newStatus = toggleLandmarkFavorite(landmark.id);
    setIsFav(newStatus);
  };

  // Drag to scroll for suggested places
  const suggestedScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingSuggested, setIsDraggingSuggested] = useState(false);
  const [suggestedStartX, setSuggestedStartX] = useState(0);
  const [suggestedScrollLeft, setSuggestedScrollLeft] = useState(0);
  const animFrameId = React.useRef<number | null>(null);

  const handleSuggestedMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!suggestedScrollRef.current) return;
    setIsDraggingSuggested(true);
    setSuggestedStartX(e.clientX - suggestedScrollRef.current.offsetLeft);
    setSuggestedScrollLeft(suggestedScrollRef.current.scrollLeft);
  };

  const handleSuggestedMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSuggested || !suggestedScrollRef.current) return;
    e.preventDefault();
    const x = e.clientX - suggestedScrollRef.current.offsetLeft;
    const walk = (x - suggestedStartX) * 1.6;

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    animFrameId.current = requestAnimationFrame(() => {
      if (suggestedScrollRef.current) {
        suggestedScrollRef.current.scrollLeft = suggestedScrollLeft - walk;
      }
    });
  };

  const handleSuggestedMouseUpLeave = () => {
    setIsDraggingSuggested(false);
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
  };

  const handleSuggestedWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (suggestedScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      suggestedScrollRef.current.scrollBy({
        left: e.deltaY * 0.8,
        behavior: "smooth",
      });
    }
  };

  // Drag to scroll for nearby stations
  const stationsScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingStations, setIsDraggingStations] = useState(false);
  const [stationsStartX, setStationsStartX] = useState(0);
  const [stationsScrollLeft, setStationsScrollLeft] = useState(0);
  const stationsAnimFrameId = React.useRef<number | null>(null);

  const handleStationsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stationsScrollRef.current) return;
    setIsDraggingStations(true);
    setStationsStartX(e.clientX - stationsScrollRef.current.offsetLeft);
    setStationsScrollLeft(stationsScrollRef.current.scrollLeft);
  };

  const handleStationsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingStations || !stationsScrollRef.current) return;
    e.preventDefault();
    const x = e.clientX - stationsScrollRef.current.offsetLeft;
    const walk = (x - stationsStartX) * 1.6;

    if (stationsAnimFrameId.current) {
      cancelAnimationFrame(stationsAnimFrameId.current);
    }
    stationsAnimFrameId.current = requestAnimationFrame(() => {
      if (stationsScrollRef.current) {
        stationsScrollRef.current.scrollLeft = stationsScrollLeft - walk;
      }
    });
  };

  const handleStationsMouseUpLeave = () => {
    setIsDraggingStations(false);
    if (stationsAnimFrameId.current) {
      cancelAnimationFrame(stationsAnimFrameId.current);
    }
  };

  const handleStationsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (stationsScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      stationsScrollRef.current.scrollBy({
        left: e.deltaY * 0.8,
        behavior: "smooth",
      });
    }
  };

  const imagesList = landmark.images && landmark.images.length > 0 ? landmark.images : [landmark.cover_image];

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes landmarkModalBackdropFadeIn {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(14px); }
        }
        }
        @keyframes landmarkModalScaleUp {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(35px);
          }
          65% {
            opacity: 1;
            transform: scale(1.01) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .landmark-modal-shell {
          background-color: var(--bgPrimary);
          color: var(--textPrimary);
          border: 1px solid var(--border-color);
        }

        .landmark-modal-topbar {
          background: var(--bgPrimary);
          border-bottom: 1px solid var(--border-color);
        }

        .landmark-modal-btn {
          background: var(--bgPrimary);
          border: 1px solid var(--border-color);
          color: var(--textPrimary);
        }

        .landmark-modal-card {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }


        .landmark-modal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .landmark-modal-textPrimary {
          color: var(--textPrimary);
        }

        .landmark-modal-textSecondary {
          color: var(--textSecondary);
        }

        .landmark-modal-text-muted {
          color: var(--text-muted);
        }

        .landmark-modal-suggested-img {
          width: 80px;
          height: 80px;
          min-width: 80px;
          min-height: 80px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
          display: block;
        }

        @media (max-width: 640px) {
          .landmark-modal-suggested-img {
            width: 70px !important;
            height: 70px !important;
            min-width: 70px !important;
            min-height: 70px !important;
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.84)",
          backdropFilter: "blur(14px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          overflowY: "auto",
          animation: "landmarkModalBackdropFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={onClose}
      >
        <div
          className="landmark-modal-shell"
          style={{
            borderRadius: "14px",
            width: "100%",
            maxWidth: "720px",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            animation: "landmarkModalScaleUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Bar */}
          <div
            className="landmark-modal-topbar"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px 10px 24px",
              backdropFilter: "blur(10px)",
            }}
          >
            <button
              onClick={onClose}
              className="landmark-modal-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "999px",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                fontFamily: "var(--font-display)"
              }}
            >
              <FaArrowRight />
              الرجوع للخلف
            </button>
          </div>

          {/* Content Container */}
          <div style={{ padding: "24px" }}>
            {/* Main Landmark Header Info */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>

                <h2 className="landmark-modal-textPrimary" style={{ fontSize: "1.8rem", fontWeight: "800", margin: "4px 0 12px 0" }}>
                  {landmark.name}
                </h2>

                <div>
                  <button
                    onClick={handleFavClick}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: isFav ? "#ef4444" : "var(--textPrimary)",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      transition: "all 0.2s ease",
                    }}
                    title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  >
                    {isFav ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>

              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                <span
                  style={{
                    backgroundColor: "rgba(0, 111, 238, 0.2)",
                    color: "#006fee",
                    border: "1px solid rgba(0, 111, 238, 0.4)",
                    borderRadius: "25px",
                    padding: "4px 12px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {landmark.type || "معلم سياحي"}
                </span>

                {landmark.is_popular && (
                  <span
                    style={{
                      backgroundColor: "rgba(245, 158, 11, 0.2)",
                      color: "#f59e0b",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                      borderRadius: "25px",
                      padding: "4px 12px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    <FaStar />
                    <span>شائع ومرغوب</span>
                  </span>
                )}

                <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-display)" }}>
                  <FaMapMarkerAlt />
                  <span>{city.name}</span>
                </span>
              </div>
            </div>

            {/* Single Cover Image */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "360px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#090d16",
                }}
              >
                <img
                  src={landmark.cover_image || galleryImages[0]}
                  alt={landmark.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
                  }}
                />
              </div>
            </div>

            {/* Media Gallery Section: صور المكان */}
            {galleryImages.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    marginBottom: "20px",
                    color: "var(--textPrimary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  صور المكان
                </h2>
                <div
                  className="scroll-container"
                  style={{
                    display: "flex",
                    gap: "12px",
                    overflowX: "auto",
                    paddingBottom: "10px",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}
                >
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveLightboxIndex(idx)}
                      style={{
                        width: "150px",
                        height: "160px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        cursor: "pointer",
                        position: "relative",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`صورة ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.2s ease",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description & Overview */}
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "var(--textPrimary)" }}>
                وصف المكان
              </h2>
              <p className="landmark-modal-textSecondary sub-title" style={{ fontSize: "0.98rem", lineHeight: "1.8", margin: 0 }}>
                {landmark.description}
              </p>
            </div>

            {/* Nearby Stations */}
            {landmark.nearby_stations && landmark.nearby_stations.length > 0 && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    marginBottom: "14px",
                    color: "var(--textPrimary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>المحطات القريبة ووسائل الوصول</span>
                </h2>
                <div
                  ref={stationsScrollRef}
                  onMouseDown={handleStationsMouseDown}
                  onMouseMove={handleStationsMouseMove}
                  onMouseUp={handleStationsMouseUpLeave}
                  onMouseLeave={handleStationsMouseUpLeave}
                  onWheel={handleStationsWheel}
                  className="hide-scrollbar"
                  style={{
                    display: "flex",
                    gap: "12px",
                    overflowX: "auto",
                    paddingBottom: "8px",
                    cursor: isDraggingStations ? "grabbing" : "grab",
                    scrollSnapType: isDraggingStations ? "none" : "x mandatory",
                    scrollBehavior: isDraggingStations ? "auto" : "smooth",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    userSelect: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {landmark.nearby_stations.map((rawSt, i) => {
                    let rawName = "";
                    let distance = "";
                    if (typeof rawSt === "object" && rawSt !== null) {
                      rawName = (rawSt as any).name || "";
                      distance = (rawSt as any).distance || "";
                    } else if (typeof rawSt === "string") {
                      if (rawSt.includes("|")) {
                        const parts = rawSt.split("|");
                        rawName = parts[0].trim();
                        distance = parts[1].trim();
                      } else {
                        rawName = rawSt.trim();
                      }
                    }

                    const transport = detectTransportation(rawName);

                    return (
                      <div
                        key={i}
                        style={{
                          padding: "12px 18px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(44, 44, 44, 0.18)",
                          borderRadius: "16px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "14px",
                          minWidth: "225px",
                          flexShrink: 0,
                          scrollSnapAlign: "start",
                          direction: "rtl",
                        }}
                      >
                        {/* Circle Icon Container (Renders on the right in RTL) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: "var(--textSecondary)",
                            fontSize: "1.2rem",
                          }}
                        >
                          {transport.icon}
                        </div>

                        {/* Text Content (Renders on the left in RTL) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              color: "var(--textPrimary)",
                              lineHeight: "1.3",
                            }}
                          >
                            <h2>{transport.cleanName}</h2>

                          </div>

                          <div
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: "500",
                              color: "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            <span>{transport.typeName}</span>
                            {distance && (
                              <>
                                <span style={{ color: "var(--text-muted)", margin: "0 2px" }}>•</span>
                                <FaWalking style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)" }} />
                                <span>{distance} كيلو متر</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activities: "اقدر اعمل اي في المكان ده" */}
            {landmark.activities && landmark.activities.length > 0 && (
              <div
                style={{
                  padding: "10px 20px",
                  marginBottom: "32px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    marginBottom: "14px",
                    color: "var(--textPrimary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>أقدر أعمل إيه في المكان ده؟ (الأنشطة المتاحة)</span>
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {landmark.activities.map((act, i) => (
                    <li
                      key={i}
                      className="landmark-modal-textSecondary sub-title"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "start",
                        gap: "10px",
                        fontSize: "0.95rem",
                        lineHeight: "1.6",
                      }}
                    >
                      <FaDotCircle />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trending / Recommended Places Section */}
            {suggestedPlaces.length > 0 && (
              <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "800",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--color-blue-700)",
                    }}
                  >
                    <FaRandom />
                    <span>الأكثر رواجاً في {city.name}</span>
                  </h2>
                </div>

                <div
                  ref={suggestedScrollRef}
                  onMouseDown={handleSuggestedMouseDown}
                  onMouseMove={handleSuggestedMouseMove}
                  onMouseUp={handleSuggestedMouseUpLeave}
                  onMouseLeave={handleSuggestedMouseUpLeave}
                  onWheel={handleSuggestedWheel}
                  style={{
                    display: "flex",
                    gap: "12px",
                    overflowX: "auto",
                    padding: "4px 2px 12px 2px",
                    cursor: isDraggingSuggested ? "grabbing" : "grab",
                    scrollSnapType: isDraggingSuggested ? "none" : "x mandatory",
                    scrollBehavior: isDraggingSuggested ? "auto" : "smooth",
                    scrollbarWidth: "none",
                    userSelect: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {suggestedPlaces.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectLandmark(item)}
                      className="landmark-modal-card"
                      style={{
                        flex: "0 0 250px",
                        minWidth: "300px",
                        borderRadius: "16px",
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        scrollSnapAlign: "start",
                      }}
                    >
                      <div style={{ position: "relative", overflow: "hidden", borderRadius: "12px", flexShrink: 0 }}>
                        <img
                          src={item.cover_image}
                          alt={item.name}
                          className="landmark-modal-suggested-img"
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <h4 className="landmark-modal-textPrimary sub-title" style={{ fontSize: "1.02rem", fontWeight: "800", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.name}
                          </h4>
                          {item.is_popular && (
                            <span
                              className="sub-title"
                              style={{
                                backgroundColor: "rgba(245, 158, 11, 0.2)",
                                color: "var(--color-orange-500)",
                                fontSize: "0.65rem",
                                fontWeight: "800",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                flexShrink: 0,
                              }}
                            >
                              شائع
                            </span>
                          )}
                        </div>
                        <p
                          className="landmark-modal-text-muted sub-title"
                          style={{
                            fontSize: "0.8rem",
                            margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: "1.3",
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Image Zoom Modal */}
      {activeLightboxIndex !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.92)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(12px)",
          }}
          onClick={() => setActiveLightboxIndex(null)}
        >
          <button
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "none",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              fontSize: "1.2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              zIndex: 10001,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxIndex(null);
            }}
            title="إغلاق"
          >
            <FaTimes />
          </button>

          {galleryImages.length > 1 && (
            <button
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "none",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                fontSize: "1.2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightboxIndex((prev) => (prev! === 0 ? galleryImages.length - 1 : prev! - 1));
              }}
              title="الصورة التابعة"
            >
              <FaChevronRight />
            </button>
          )}

          <img
            src={galleryImages[activeLightboxIndex]}
            alt="صورة مكبرة"
            style={{
              maxWidth: "90%",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: "14px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
            }}
          />

          {galleryImages.length > 1 && (
            <button
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "none",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                fontSize: "1.2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightboxIndex((prev) => (prev! === galleryImages.length - 1 ? 0 : prev! + 1));
              }}
              title="الصورة السابقة"
            >
              <FaChevronLeft />
            </button>
          )}

          {galleryImages.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: "30px",
                background: "rgba(0, 0, 0, 0.6)",
                color: "#ffffff",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600",
                fontFamily: "var(--font-display)",
              }}
            >
              {activeLightboxIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}

      {/* Auth Modal for unauthenticated users */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
