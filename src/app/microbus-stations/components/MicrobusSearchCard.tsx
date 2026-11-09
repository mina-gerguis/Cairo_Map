"use client";

import React, { RefObject, useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import VoiceInputButton from "@/components/VoiceInputButton";
import { MicrobusStation } from "../types";
import { POPULAR_DESTINATIONS, MICROBUS_STATION_COORDINATES } from "../constants";
import { normalizeArabic, getDistanceInKm } from "../utils";
import styles from "../microbus.module.css";
import searchStyles from "@/components/common/RouteSearchCard/RouteSearchCard.module.css";

interface MicrobusSearchCardProps {
  searchPanelRef: RefObject<HTMLDivElement | null>;
  stations: MicrobusStation[];
  selectedStation: string;
  onStationChange: (station: string) => void;
  destinationQuery: string;
  onDestinationChange: (query: string) => void;
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

export default function MicrobusSearchCard({
  searchPanelRef,
  stations,
  selectedStation,
  onStationChange,
  destinationQuery,
  onDestinationChange,
}: MicrobusSearchCardProps) {
  const swapIconRef = useRef<SVGSVGElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);

  // Focus and dropdown states
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [fromQuery, setFromQuery] = useState(
    selectedStation === "all" ? "" : selectedStation
  );

  // GPS Nearest Station State
  const [locatingNearest, setLocatingNearest] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<string | null>(null);

  // Sync external selectedStation changes into local fromQuery
  useEffect(() => {
    if (selectedStation === "all") {
      setFromQuery("");
    } else {
      setFromQuery(selectedStation);
    }
  }, [selectedStation]);

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
        setShowFromList(false);
        setShowToList(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  // GPS Find Nearest Station
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
        let closestStation: string | null = null;
        let minDistance = Infinity;

        // Compare against registered coordinates in constants
        for (const [name, coords] of Object.entries(MICROBUS_STATION_COORDINATES)) {
          const dist = getDistanceInKm(userLat, userLng, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestStation = name;
          }
        }

        // If stations from props match
        if (closestStation) {
          onStationChange(closestStation);
          setFromQuery(closestStation);
          setShowFromList(false);
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

  // Preset destination tags based on current station or top popular destinations
  const presetTags = useMemo(() => {
    if (selectedStation && selectedStation !== "all") {
      const current = stations.find((s) => s.name === selectedStation);
      if (current?.routes) {
        return Array.from(new Set(current.routes.map((r) => r.destination))).slice(0, 6);
      }
    }
    return POPULAR_DESTINATIONS.slice(0, 6);
  }, [selectedStation, stations]);

  // Filtered station suggestions for "From"
  const filteredFromStations = useMemo(() => {
    const q = normalizeArabic(fromQuery.trim());
    if (!q) return stations;
    return stations.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const locationMatch = normalizeArabic(s.location || "").includes(q);
      return nameMatch || locationMatch;
    });
  }, [stations, fromQuery]);

  // Filtered destination suggestions for "To"
  const filteredDestinations = useMemo(() => {
    const q = normalizeArabic(destinationQuery.trim());
    const destSet = new Set<string>();

    stations.forEach((s) => {
      if (selectedStation !== "all" && s.name !== selectedStation) return;
      s.routes?.forEach((r) => {
        if (r.destination) destSet.add(r.destination);
      });
    });

    POPULAR_DESTINATIONS.forEach((d) => destSet.add(d));
    const allDestinations = Array.from(destSet);

    if (!q) return allDestinations;
    return allDestinations.filter((d) => normalizeArabic(d).includes(q));
  }, [stations, selectedStation, destinationQuery]);

  const handleSwapClick = () => {
    if (swapIconRef.current) {
      gsap.to(swapIconRef.current, {
        rotation: "+=180",
        duration: 0.35,
        ease: "back.out(1.5)",
      });
    }

    const currentFrom = fromQuery;
    const currentTo = destinationQuery;

    // Swap values
    setFromQuery(currentTo);
    onDestinationChange(currentFrom);

    const matchedStation = stations.find(
      (s) => normalizeArabic(s.name) === normalizeArabic(currentTo)
    );
    if (matchedStation) {
      onStationChange(matchedStation.name);
    } else if (!currentTo.trim()) {
      onStationChange("all");
    }
  };

  const handleSelectFrom = (stationName: string) => {
    onStationChange(stationName);
    setFromQuery(stationName);
    setShowFromList(false);
  };

  const handleSelectTo = (dest: string) => {
    onDestinationChange(dest);
    setShowToList(false);
  };

  const scrollToResults = () => {
    const targetEl = document.getElementById("stations-results-section");
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      ref={searchPanelRef}
      className={styles.searchBentoCard}
      style={{
        zIndex: showFromList || showToList ? 50 : 20,
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
          zIndex: showFromList || showToList ? 40 : 5,
        }}
      >
        {/* FROM STATION INPUT */}
        <div
          className={searchStyles.fieldContainer}
          style={{ zIndex: showFromList ? 100 : 2 }}
        >
          <div className={searchStyles.inputWrapper}>
            {/* Left Origin Icon (Clickable for GPS) */}
            <div className={searchStyles.inputStartIcon}>
              <button
                type="button"
                onClick={handleFindNearest}
                disabled={locatingNearest}
                title="تحديد أقرب موقف ميكروباص بالـ GPS"
                aria-label="تحديد أقرب موقف بالـ GPS"
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
              placeholder="هركب من... (موقف الانطلاق أو جميع المواقف)"
              value={fromQuery}
              onChange={(e) => {
                const val = e.target.value;
                setFromQuery(val);
                setShowFromList(true);
                const matched = stations.find(
                  (s) => normalizeArabic(s.name) === normalizeArabic(val.trim())
                );
                if (matched) {
                  onStationChange(matched.name);
                } else if (!val.trim()) {
                  onStationChange("all");
                }
              }}
              onFocus={() => setShowFromList(true)}
              onBlur={() => setTimeout(() => setShowFromList(false), 250)}
              style={{
                paddingRight: "74px",
                outline: "none",
                border: "none",
                boxShadow: "none",
              }}
            />

            {/* End actions: Clear button or Voice Input */}
            <div className={searchStyles.inputEndActions}>
              {fromQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setFromQuery("");
                    onStationChange("all");
                    setNearestDistance(null);
                  }}
                  title="مسح"
                  aria-label="مسح الموقف"
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
                    setFromQuery(text);
                    const matched = stations.find((s) =>
                      normalizeArabic(s.name).includes(normalizeArabic(text))
                    );
                    if (matched) {
                      onStationChange(matched.name);
                    }
                  }}
                />
              )}
            </div>

            {/* From Suggestions Dropdown */}
            {showFromList && (
              <div className={searchStyles.suggestionsDropdown}>
                {/* Option for All Stations */}
                <button
                  type="button"
                  onMouseDown={() => {
                    onStationChange("all");
                    setFromQuery("");
                    setShowFromList(false);
                  }}
                  className={searchStyles.suggestionItem}
                  style={{
                    background:
                      selectedStation === "all"
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
                      جميع المواقف ({stations.length} موقف)
                    </span>
                  </div>
                </button>

                {filteredFromStations.slice(0, 10).map((s) => {
                  return (
                    <button
                      key={s.id || s.name}
                      type="button"
                      onMouseDown={() => handleSelectFrom(s.name)}
                      className={searchStyles.suggestionItem}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.92rem",
                            fontWeight: "700",
                            color: "var(--color-fg)",
                          }}
                        >
                          {s.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {s.location}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            background: "rgba(59, 130, 246, 0.12)",
                            color: "var(--color-secondary, #3b82f6)",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            fontWeight: "700",
                          }}
                        >
                          موقف
                        </span>
                        <i
                          className="bx bx-chevron-left"
                          style={{
                            color: "var(--text-muted, #71717a)",
                            fontSize: "1.1rem",
                          }}
                        />
                      </div>
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
            title="تبديل موقف القيام والوجهة"
            className={searchStyles.swapBtn}
            aria-label="تبديل موقف القيام والوجهة"
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

        {/* TO STATION / DESTINATION INPUT */}
        <div
          className={searchStyles.fieldContainer}
          style={{ zIndex: showToList ? 100 : 1 }}
        >
          <div className={searchStyles.inputWrapper}>
            {/* Left Destination Icon */}
            <span className={searchStyles.inputStartIcon}>
              <DefaultDestIcon />
            </span>

            {/* Input field */}
            <input
              className={`input-fields ${searchStyles.input}`}
              placeholder="هروح لـِ... (الوجهة أو المحطة المطلوبة)"
              value={destinationQuery}
              onChange={(e) => {
                onDestinationChange(e.target.value);
                setShowToList(true);
              }}
              onFocus={() => setShowToList(true)}
              onBlur={() => setTimeout(() => setShowToList(false), 250)}
              style={{
                paddingRight: "74px",
                outline: "none",
                border: "none",
                boxShadow: "none",
              }}
            />

            {/* End actions: Clear button or Voice Input */}
            <div className={searchStyles.inputEndActions}>
              {destinationQuery ? (
                <button
                  type="button"
                  onClick={() => onDestinationChange("")}
                  title="مسح"
                  aria-label="مسح الوجهة"
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
                    onDestinationChange(text);
                  }}
                />
              )}
            </div>

            {/* To Suggestions Dropdown */}
            {showToList && filteredDestinations.length > 0 && (
              <div className={searchStyles.suggestionsDropdown}>
                {filteredDestinations.slice(0, 10).map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onMouseDown={() => handleSelectTo(dest)}
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
                        {dest}
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
                ))}
              </div>
            )}
          </div>

          {/* Quick Preset Destination Chips */}
          <div ref={presetsRef} className={searchStyles.presetChipsWrapper}>
            <span className={searchStyles.presetLabel}>وجهات رائجة:</span>
            {presetTags.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => onDestinationChange(dest)}
                className={`${searchStyles.chipTag} ${
                  destinationQuery === dest ? searchStyles.chipTagActive : ""
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location Badge (GPS Nearest Station Result) */}
      {nearestDistance && selectedStation && selectedStation !== "all" && (
        <div
          className={searchStyles.locationBadge}
          style={{ marginTop: "12px" }}
        >
          <i
            className="fa-solid fa-location-dot"
            style={{ fontSize: "1rem", flexShrink: 0 }}
          />
          <span>
            أقرب موقف ميكروباص لموقعك: <strong>{selectedStation}</strong> (
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
        <span>اعرض خطوط الميكروباص المتاحة</span>
      </button>
    </div>
  );
}
