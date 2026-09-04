"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaUsers,
  FaRulerCombined,
  FaChartLine,
  FaThermometerHalf,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaChevronLeft,
  FaCity,
} from "react-icons/fa";
import { CityLandmark, FamousCity, isLandmarkFavorite, toggleLandmarkFavorite, fetchLiveCityTemperature } from "@/data/cities";
import LandmarkDetailModal from "./LandmarkDetailModal";
import RequireAuthModal from "@/components/common/RequireAuthModal";
import { useAuth } from "@/context/AuthContext";

interface CityDetailModalProps {
  city: FamousCity;
  onClose: () => void;
}

export default function CityDetailModal({ city, onClose }: CityDetailModalProps) {
  const { user } = useAuth();
  const [selectedLandmark, setSelectedLandmark] = useState<CityLandmark | null>(null);
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});
  const [currentTemp, setCurrentTemp] = useState<string>(city.temperature || "");
  const [isLiveTemp, setIsLiveTemp] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const landmarks = city.landmarks || [];

  useEffect(() => {
    const initialFavs: Record<string, boolean> = {};
    landmarks.forEach((l) => {
      initialFavs[l.id] = isLandmarkFavorite(l.id);
    });
    setFavMap(initialFavs);
  }, [city, landmarks]);

  // Live real-time temperature fetch & auto refresh
  useEffect(() => {
    let isMounted = true;

    async function loadLiveWeather() {
      const live = await fetchLiveCityTemperature(city.name);
      if (live && isMounted) {
        setCurrentTemp(live);
        setIsLiveTemp(true);
      }
    }

    loadLiveWeather();
    const interval = setInterval(loadLiveWeather, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [city.name]);

  const handleToggleFav = (e: React.MouseEvent, landmarkId: string) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const updated = toggleLandmarkFavorite(landmarkId);
    setFavMap((prev) => ({ ...prev, [landmarkId]: updated }));
  };

  const statsScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingStats, setIsDraggingStats] = useState(false);
  const [statsStartX, setStatsStartX] = useState(0);
  const [statsScrollLeft, setStatsScrollLeft] = useState(0);
  const animFrameId = React.useRef<number | null>(null);

  const handleStatsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!statsScrollRef.current) return;
    setIsDraggingStats(true);
    setStatsStartX(e.clientX - statsScrollRef.current.offsetLeft);
    setStatsScrollLeft(statsScrollRef.current.scrollLeft);
  };

  const handleStatsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingStats || !statsScrollRef.current) return;
    e.preventDefault();
    const x = e.clientX - statsScrollRef.current.offsetLeft;
    const walk = (x - statsStartX) * 1.6;

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    animFrameId.current = requestAnimationFrame(() => {
      if (statsScrollRef.current) {
        statsScrollRef.current.scrollLeft = statsScrollLeft - walk;
      }
    });
  };

  const handleStatsMouseUpLeave = () => {
    setIsDraggingStats(false);
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
  };

  const handleStatsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (statsScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      statsScrollRef.current.scrollBy({
        left: e.deltaY * 0.8,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <style>{`
        @keyframes cityModalBackdropFadeIn {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(14px); }
        }
        @keyframes cityModalScaleUp {
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

        .city-modal-shell {
          background-color: var(--bgPrimary);
          color: var(--textPrimary);
          border: 1px solid var(--border-color);
        }

        .city-modal-textPrimary {
          color: var(--textPrimary);
        }

        .city-modal-textSecondary {
          color: var(--textSecondary);
        }

        .city-modal-text-muted {
          color: var(--text-muted);
        }

        .city-modal-landmark-card {
          background-color: var(--bgPrimary);
          border: 1px solid var(--border-color);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .city-modal-landmark-img {
          width: 90px;
          height: 90px;
          min-width: 90px;
          min-height: 90px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
          display: block;
        }

        @media (max-width: 640px) {
          .city-modal-landmark-img {
            width: 75px !important;
            height: 75px !important;
            min-width: 75px !important;
            min-height: 75px !important;
          }
          .city-modal-landmark-card {
            padding: 8px 10px !important;
            gap: 10px !important;
          }
        }

        .scroll-container::-webkit-scrollbar {
          display: none;
        }
        .scroll-container {
          -ms-overflow-style: none; 
          scrollbar-width: none;  
        }
      `}</style>

      <div

        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(14px)",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          overflowY: "auto",
          animation: "cityModalBackdropFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={onClose}
      >
        <div
          className="city-modal-shell scroll-container"
          style={{
            borderRadius: "12px",
            width: "100%",
            maxWidth: "720px",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            animation: "cityModalScaleUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* City Cover Banner Header */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "240px",
              background: `url(${city.cover_image}) center/cover no-repeat`,
            }}
          >
            {/* Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(18, 24, 38, 1) 0%, rgba(18, 24, 38, 0.4) 60%, rgba(0, 0, 0, 0.6) 100%)",
              }}
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                zIndex: 5,
                backgroundColor: "rgba(0, 0, 0, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              <FaTimes />
            </button>

            {/* Centered City Title */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "24px",
                left: "24px",
                zIndex: 5,
                textAlign: "right",
              }}
            >
              <h1
                style={{
                  fontSize: "2.4rem",
                  fontWeight: "900",
                  margin: 0,
                  color: "#ffffff",
                  textShadow: "0 4px 12px rgba(0,0,0,0.6)",
                }}
              >
                {city.name}
              </h1>
            </div>
          </div>

          {/* Modal Main Body */}
          <div style={{ padding: "24px" }}>
            {/* FIRST: Details Cards Grid (السكان - المساحة - الكثافة - درجة الحرارة الحالية) */}
            <div style={{ margin: "28px 10px" }}>
              <div
                ref={statsScrollRef}
                onMouseDown={handleStatsMouseDown}
                onMouseMove={handleStatsMouseMove}
                onMouseUp={handleStatsMouseUpLeave}
                onMouseLeave={handleStatsMouseUpLeave}
                onWheel={handleStatsWheel}
                style={{
                  display: "flex",
                  gap: "12px",
                  overflowX: "auto",
                  padding: "4px 2px 12px 2px",
                  cursor: isDraggingStats ? "grabbing" : "grab",
                  scrollSnapType: isDraggingStats ? "none" : "x mandatory",
                  scrollBehavior: isDraggingStats ? "auto" : "smooth",
                  scrollbarWidth: "none",
                  userSelect: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* 1. Population */}
                <div
                  className="city-modal-card"
                  style={{
                    flex: "0",
                    minWidth: "150px",
                    maxWidth: "230px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div
                    style={{
                      color: "var(--textSecondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaUsers />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="city-modal-text-muted sub-title" style={{ fontSize: "0.8rem" }}>عدد السكان</div>
                    <div className="city-modal-textPrimary sub-title" style={{ fontSize: "1.02rem", fontWeight: "800", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {city.population || "غير محدد"}
                    </div>
                  </div>
                </div>

                {/* 2. Area */}
                <div
                  className="city-modal-card"
                  style={{
                    flex: "0",
                    minWidth: "150px",
                    maxWidth: "230px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div
                    style={{
                      color: "var(--textSecondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaRulerCombined />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="city-modal-text-muted sub-title" style={{ fontSize: "0.8rem" }}>المساحة</div>
                    <div className="city-modal-textPrimary sub-title" style={{ fontSize: "1.02rem", fontWeight: "800", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {city.area || "غير محدد"}
                    </div>
                  </div>
                </div>

                {/* 3. Density */}
                <div
                  className="city-modal-card"
                  style={{
                    flex: "0",
                    minWidth: "150px",
                    maxWidth: "230px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div
                    style={{
                      color: "var(--textSecondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaCity />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="city-modal-text-muted sub-title" style={{ fontSize: "0.8rem" }}>المدينة</div>
                    <div className="city-modal-textPrimary sub-title" style={{ fontSize: "1.02rem", fontWeight: "800", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {city.density || "غير محدد"}
                    </div>
                  </div>
                </div>

                {/* 4. Current Temperature */}
                <div
                  className="city-modal-card"
                  style={{
                    flex: "0",
                    minWidth: "150px",
                    maxWidth: "230px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div
                    style={{
                      color: "var(--textSecondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaThermometerHalf />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="city-modal-text-muted sub-title" style={{ fontSize: "0.8rem" }}>درجة الحرارة</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span className="city-modal-textPrimary sub-title" style={{ fontSize: "1.02rem", fontWeight: "800" }}>
                        {currentTemp || city.temperature || "غير محدد"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECOND: Overview (نبذة عن المدينة) */}
            <div
              className="city-modal-card"
              style={{
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "32px",
              }}
            >
              <h2 className="city-modal-textPrimary" style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "8px" }}>
                نبذة
              </h2>
              <p className="city-modal-textSecondary sub-title" style={{ fontSize: "0.98rem", lineHeight: "1.8", margin: 0 }}>
                {city.overview || "لا توجد نبذة متاحة حالياً للمدينة."}
              </p>
            </div>

            {/* THIRD: Famous Tourist Landmarks (المعالم السياحية الشهيرة) */}
            <div>
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
                    color: "var(--textPrimary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaMapMarkerAlt />
                  <span>المعالم السياحية الشهيرة في {city.name}</span>
                </h2>
              </div>

              {landmarks.length === 0 ? (
                <div
                  className="city-modal-card"
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    borderRadius: "16px",
                  }}
                >
                  <span className="city-modal-text-muted">لا توجد معالم سياحية مسجلة حالياً لهذه المدينة.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {landmarks.map((lm) => {
                    const isFavorite = !!favMap[lm.id];

                    return (
                      <div
                        key={lm.id}
                        onClick={() => setSelectedLandmark(lm)}
                        className="city-modal-landmark-card"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px 12px",
                          gap: "12px",
                          cursor: "pointer",
                          position: "relative",
                          borderBottom: "1px solid #cccccc77",
                        }}
                      >
                        {/* Fixed Small Thumbnail */}
                        <div
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "8px",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={lm.cover_image}
                            alt={lm.name}
                            className="city-modal-landmark-img"
                          />
                        </div>

                        {/* Content */}
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              marginBottom: "2px",
                            }}
                          >
                            <h2
                              className="city-modal-textPrimary"
                              style={{
                                fontSize: "1.05rem",
                                fontWeight: "800",
                                margin: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {lm.name}
                            </h2>

                            {/* Favorite Heart Button */}
                            <button
                              onClick={(e) => handleToggleFav(e, lm.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: isFavorite ? "#ef4444" : "#888888",
                                fontSize: "1.15rem",
                                cursor: "pointer",
                                padding: "2px",
                                flexShrink: 0,
                                transition: "all 0.2s ease",
                              }}
                              title={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                            >
                              {isFavorite ? <FaHeart /> : <FaRegHeart />}
                            </button>
                          </div>

                          <p
                            className="city-modal-textSecondary"
                            style={{
                              fontSize: "0.82rem",
                              margin: "0 0 6px 0",
                              lineHeight: "1.4",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {lm.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render Landmark Detail Modal if selected */}
      {selectedLandmark && (
        <LandmarkDetailModal
          landmark={selectedLandmark}
          city={city}
          allCityLandmarks={landmarks}
          onClose={() => setSelectedLandmark(null)}
          onSelectLandmark={(newLm: CityLandmark) => setSelectedLandmark(newLm)}
        />
      )}

      {/* Render Auth Modal if unauthenticated user tries to favorite */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
