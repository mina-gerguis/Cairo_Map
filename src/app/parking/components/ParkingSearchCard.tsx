"use client";

import React, { RefObject, useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import VoiceInputButton from "@/components/VoiceInputButton";
import { POPULAR_PARKING_AREAS, PARKING_AREA_COORDINATES } from "../constants";
import { normalizeArabic, getDistanceInKm } from "../utils";
import styles from "../parking.module.css";
import searchStyles from "@/components/common/RouteSearchCard/RouteSearchCard.module.css";

interface ParkingSearchCardProps {
  searchPanelRef?: RefObject<HTMLDivElement | null>;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedArea: string;
  onSelectedAreaChange: (value: string) => void;
  areas: string[];
}

const DefaultOriginIcon = () => (
  <svg
    className={searchStyles.inputIconSvg}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="7" />
  </svg>
);

const DefaultDestIcon = () => (
  <svg
    className={searchStyles.inputIconSvg}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);

export function ParkingSearchCard({
  searchPanelRef,
  searchTerm,
  onSearchTermChange,
  selectedArea,
  onSelectedAreaChange,
  areas,
}: ParkingSearchCardProps) {
  const swapIconRef = useRef<SVGSVGElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);

  // Focus and dropdown states
  const [showAreaList, setShowAreaList] = useState(false);
  const [areaQuery, setAreaQuery] = useState(
    selectedArea === "all" ? "" : selectedArea
  );

  // GPS Nearest Area State
  const [locatingNearest, setLocatingNearest] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<string | null>(null);

  // Clean areas list (excluding "all")
  const filteredAreasList = useMemo(
    () => areas.filter((a) => a !== "all"),
    [areas]
  );

  // Sync external selectedArea changes into local areaQuery
  useEffect(() => {
    if (selectedArea === "all") {
      setAreaQuery("");
    } else {
      setAreaQuery(selectedArea);
    }
  }, [selectedArea]);

  // Entrance animation for preset chips
  useEffect(() => {
    if (presetsRef.current) {
      const chips = presetsRef.current.querySelectorAll(`.${searchStyles.chipTag}`);
      if (chips.length > 0) {
        gsap.fromTo(
          chips,
          { autoAlpha: 0, scale: 0.9 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
            stagger: 0.03,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          }
        );
      }
    }
  }, []);

  // Click outside to dismiss dropdown suggestions
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowAreaList(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  // GPS Find Nearest Area
  const handleFindNearest = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك");
      return;
    }
    setLocatingNearest(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        let closestArea: string | null = null;
        let minDistance = Infinity;

        // Check if available areas match coordinates
        for (const [name, coords] of Object.entries(PARKING_AREA_COORDINATES)) {
          const dist = getDistanceInKm(userLat, userLng, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestArea = name;
          }
        }

        if (closestArea) {
          onSelectedAreaChange(closestArea);
          setAreaQuery(closestArea);
          setShowAreaList(false);
          setNearestDistance(
            minDistance < 1
              ? `${Math.round(minDistance * 1000)} متر`
              : `${minDistance.toFixed(1)} كم`
          );
        }
        setLocatingNearest(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("تعذر تحديد موقعك الحالي. يرجى التأكد من تفعيل إذن الـ GPS وإعادة المحاولة.");
        setLocatingNearest(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Preset chips list combining popular areas with available areas
  const presetChips = useMemo(() => {
    const list = [...POPULAR_PARKING_AREAS];
    filteredAreasList.forEach((a) => {
      if (!list.includes(a)) list.push(a);
    });
    return list.slice(0, 7);
  }, [filteredAreasList]);

  // Filtered area suggestions
  const matchingAreas = useMemo(() => {
    const q = normalizeArabic(areaQuery.trim());
    if (!q) return filteredAreasList;
    return filteredAreasList.filter((a) => normalizeArabic(a).includes(q));
  }, [filteredAreasList, areaQuery]);

  const handleSwapClick = () => {
    if (swapIconRef.current) {
      gsap.to(swapIconRef.current, {
        rotation: "+=180",
        duration: 0.35,
        ease: "back.out(1.5)",
      });
    }

    const currentArea = areaQuery;
    const currentSearch = searchTerm;

    setAreaQuery(currentSearch);
    onSearchTermChange(currentArea);

    const matchedArea = filteredAreasList.find(
      (a) => normalizeArabic(a) === normalizeArabic(currentSearch)
    );
    if (matchedArea) {
      onSelectedAreaChange(matchedArea);
    } else if (!currentSearch.trim()) {
      onSelectedAreaChange("all");
    }
  };

  const handleSelectArea = (areaName: string) => {
    onSelectedAreaChange(areaName);
    setAreaQuery(areaName);
    setShowAreaList(false);
  };

  const scrollToResults = () => {
    const targetEl = document.getElementById("parking-results-section");
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      ref={searchPanelRef}
      className={styles.searchBentoCard}
      style={{
        zIndex: showAreaList ? 50 : 20,
        position: "relative",
      }}
    >
      {/* Title */}
      <div className={searchStyles.header}>
        <h2 className={searchStyles.title}>
          <span>علي فين كدا .؟</span>
        </h2>
      </div>

      {/* Search Boxes Container (Identical to Metro, Monorail, LRT & BRT) */}
      <div
        ref={searchContainerRef}
        className={searchStyles.searchBoxContainer}
        style={{
          position: "relative",
          zIndex: showAreaList ? 40 : 5,
        }}
      >
        {/* AREA SELECTION INPUT */}
        <div
          className={searchStyles.fieldContainer}
          style={{ zIndex: showAreaList ? 100 : 2 }}
        >
          <div className={searchStyles.inputWrapper}>
            {/* Left Origin Icon (Clickable for GPS) */}
            <div className={searchStyles.inputStartIcon}>
              <button
                type="button"
                onClick={handleFindNearest}
                disabled={locatingNearest}
                title="تحديد أقرب منطقة جراجات لموقعي بالـ GPS"
                aria-label="تحديد أقرب منطقة بالـ GPS"
                className={searchStyles.inputStartBtn}
              >
                {locatingNearest ? (
                  <i
                    className="bx bx-loader-alt bx-spin"
                    style={{
                      fontSize: "1.25rem",
                      color: "var(--color-secondary, #3b82f6)",
                    }}
                  />
                ) : (
                  <DefaultOriginIcon />
                )}
              </button>
            </div>

            {/* Input field */}
            <input
              className={`input-fields ${searchStyles.input}`}
              placeholder="المنطقة أو الحي... (وسط البلد، الدقي، التحرير أو جميع المناطق)"
              value={areaQuery}
              onChange={(e) => {
                const val = e.target.value;
                setAreaQuery(val);
                setShowAreaList(true);
                const matched = filteredAreasList.find(
                  (a) => normalizeArabic(a) === normalizeArabic(val.trim())
                );
                if (matched) {
                  onSelectedAreaChange(matched);
                } else if (!val.trim()) {
                  onSelectedAreaChange("all");
                }
              }}
              onFocus={() => setShowAreaList(true)}
              onBlur={() => setTimeout(() => setShowAreaList(false), 250)}
              style={{
                paddingRight: "74px",
                outline: "none",
                border: "none",
                boxShadow: "none",
              }}
            />

            {/* End actions: Clear button or Voice Input */}
            <div className={searchStyles.inputEndActions}>
              {areaQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setAreaQuery("");
                    onSelectedAreaChange("all");
                    setNearestDistance(null);
                  }}
                  title="مسح المنطقة"
                  aria-label="مسح المنطقة"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted, #71717a)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              ) : (
                <VoiceInputButton
                  onTranscript={(text) => {
                    setAreaQuery(text);
                    const matched = filteredAreasList.find((a) =>
                      normalizeArabic(a).includes(normalizeArabic(text))
                    );
                    if (matched) {
                      onSelectedAreaChange(matched);
                    }
                  }}
                />
              )}
            </div>

            {/* Area Suggestions Dropdown */}
            {showAreaList && (
              <div className={searchStyles.suggestionsDropdown}>
                {/* Option for All Areas */}
                <button
                  type="button"
                  onMouseDown={() => {
                    onSelectedAreaChange("all");
                    setAreaQuery("");
                    setShowAreaList(false);
                  }}
                  className={searchStyles.suggestionItem}
                  style={{
                    background:
                      selectedArea === "all"
                        ? "rgba(59, 130, 246, 0.08)"
                        : "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      textAlign: "right",
                    }}
                  >
                    <i
                      className="bx bx-layer"
                      style={{ color: "var(--color-secondary, #3b82f6)" }}
                    />
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: "700",
                        color: "var(--color-fg)",
                      }}
                    >
                      جميع المناطق ({filteredAreasList.length} منطقة)
                    </span>
                  </div>
                </button>

                {matchingAreas.map((areaName) => {
                  return (
                    <button
                      key={areaName}
                      type="button"
                      onMouseDown={() => handleSelectArea(areaName)}
                      className={searchStyles.suggestionItem}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          textAlign: "right",
                        }}
                      >
                        <i
                          className="bx bx-map-pin"
                          style={{ color: "var(--color-secondary, #3b82f6)" }}
                        />
                        <span
                          style={{
                            fontSize: "0.92rem",
                            fontWeight: "700",
                            color: "var(--color-fg)",
                          }}
                        >
                          {areaName}
                        </span>
                      </div>

                      <i
                        className="bx bx-chevron-left"
                        style={{
                          color: "var(--text-muted, #71717a)",
                          fontSize: "1.1rem",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SWAP BUTTON - Right Junction centered between inputs */}
        <div className={searchStyles.swapBtnAnchor} style={{ top: "54px" }}>
          <button
            type="button"
            onClick={handleSwapClick}
            title="تبديل المنطقة والبحث"
            className={searchStyles.swapBtn}
            aria-label="تبديل المنطقة والبحث"
          >
            <svg
              ref={swapIconRef}
              className={searchStyles.swapIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 20V4M7 4L3 8M7 4L11 8M17 4V20M17 20L21 16M17 20L13 16" />
            </svg>
          </button>
        </div>

        {/* GARAGE NAME / SEARCH TERM INPUT */}
        <div
          className={searchStyles.fieldContainer}
          style={{ zIndex: 1 }}
        >
          <div className={searchStyles.inputWrapper}>
            {/* Left Destination Icon */}
            <span className={searchStyles.inputStartIcon}>
              <DefaultDestIcon />
            </span>

            {/* Input field */}
            <input
              className={`input-fields ${searchStyles.input}`}
              placeholder="اسم الجراج، شارع، أو محطة مترو... (التحرير، العتبة، روكسي)"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              style={{
                paddingRight: "74px",
                outline: "none",
                border: "none",
                boxShadow: "none",
              }}
            />

            {/* End actions: Clear button or Voice Input */}
            <div className={searchStyles.inputEndActions}>
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => onSearchTermChange("")}
                  title="مسح البحث"
                  aria-label="مسح البحث"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted, #71717a)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              ) : (
                <VoiceInputButton
                  onTranscript={(text) => {
                    onSearchTermChange(text);
                  }}
                />
              )}
            </div>
          </div>

          {/* Quick Preset Destination Chips */}
          <div ref={presetsRef} className={searchStyles.presetChipsWrapper}>
            <span className={searchStyles.presetLabel}>مناطق مميزة:</span>
            {presetChips.map((dest) => {
              const isActive = selectedArea === dest;
              return (
                <button
                  key={dest}
                  type="button"
                  onClick={() => onSelectedAreaChange(isActive ? "all" : dest)}
                  className={`${searchStyles.chipTag} ${
                    isActive ? searchStyles.chipTagActive : ""
                  }`}
                >
                  {dest}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location Badge (GPS Nearest Area Result) */}
      {nearestDistance && selectedArea && selectedArea !== "all" && (
        <div
          className={searchStyles.locationBadge}
          style={{ marginTop: "12px" }}
        >
          <i
            className="fa-solid fa-location-dot"
            style={{ fontSize: "1rem", flexShrink: 0 }}
          />
          <span>
            أقرب منطقة جراجات لموقعك: <strong>{selectedArea}</strong> (
            {nearestDistance})
          </span>
        </div>
      )}

      {/* SEARCH ACTION BUTTON */}
      <button
        type="button"
        onClick={scrollToResults}
        className={`btn btn-primary w-full ${searchStyles.submitBtn}`}
        style={{ marginTop: "12px" }}
      >
        <i className="bx bx-search-alt" style={{ fontSize: "1.25rem" }} />
        <span>اعرض الجراجات المتاحة</span>
      </button>
    </div>
  );
}

export default ParkingSearchCard;
