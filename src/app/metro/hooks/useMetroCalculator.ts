import { useState, useEffect, useMemo, useCallback } from "react";
import { Edge, LineId, RouteResult, StationInfo } from "../types";
import { ACTIVE_METRO_TRIP_KEY, METRO_STATION_COORDINATES } from "../constants";
import {
  findRoute,
  generateShareText,
  generateWhatsappUrl,
  getDistanceInKm,
  normalizeArabic,
} from "../utils";

export function useMetroCalculator(
  allStations: StationInfo[],
  adjacencyGraph: Map<string, Edge[]>,
  stationLinesMap: Map<string, Set<LineId>>,
  getTicketPrice: (count: number) => number
) {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);

  // Active Trip States
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTripRestored, setIsTripRestored] = useState(false);

  // GPS Location Helper
  const [locatingNearest, setLocatingNearest] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<string | null>(null);
  const [copiedRoute, setCopiedRoute] = useState(false);

  // Restore Active Metro Trip from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(ACTIVE_METRO_TRIP_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.isTripActive && data.result) {
          const isFresh = !data.savedAt || Date.now() - data.savedAt < 24 * 60 * 60 * 1000;
          if (isFresh) {
            if (data.selectedFrom) setSelectedFrom(data.selectedFrom);
            if (data.selectedTo) setSelectedTo(data.selectedTo);
            if (data.fromQuery) setFromQuery(data.fromQuery);
            if (data.toQuery) setToQuery(data.toQuery);
            setResult(data.result);
            const pathLen = data.result?.detailedPath?.length || 1;
            const stepIdx =
              typeof data.currentStepIndex === "number"
                ? Math.max(0, Math.min(data.currentStepIndex, pathLen - 1))
                : 0;
            setCurrentStepIndex(stepIdx);
            setIsTripActive(true);
          } else {
            localStorage.removeItem(ACTIVE_METRO_TRIP_KEY);
          }
        }
      }
    } catch (e) {
      console.error("Failed to restore active metro trip:", e);
    } finally {
      setIsTripRestored(true);
    }
  }, []);

  // Persist Active Metro Trip to localStorage whenever trip state or step changes
  useEffect(() => {
    if (typeof window === "undefined" || !isTripRestored) return;
    if (isTripActive && result) {
      try {
        localStorage.setItem(
          ACTIVE_METRO_TRIP_KEY,
          JSON.stringify({
            isTripActive: true,
            currentStepIndex,
            selectedFrom,
            selectedTo,
            fromQuery,
            toQuery,
            result,
            savedAt: Date.now(),
          })
        );
      } catch (e) {
        console.error("Failed to save active metro trip to localStorage:", e);
      }
    } else {
      localStorage.removeItem(ACTIVE_METRO_TRIP_KEY);
    }
  }, [
    isTripRestored,
    isTripActive,
    currentStepIndex,
    result,
    selectedFrom,
    selectedTo,
    fromQuery,
    toQuery,
  ]);

  // Filtered stations for From input
  const filteredFrom = useMemo(() => {
    if (!fromQuery.trim()) return allStations;
    const q = normalizeArabic(fromQuery);
    return allStations.filter(
      (s) =>
        normalizeArabic(s.name).includes(q) ||
        (s.landmarks && s.landmarks.some((l) => normalizeArabic(l).includes(q)))
    );
  }, [allStations, fromQuery]);

  // Filtered stations for To input
  const filteredTo = useMemo(() => {
    if (!toQuery.trim()) return allStations;
    const q = normalizeArabic(toQuery);
    return allStations.filter(
      (s) =>
        normalizeArabic(s.name).includes(q) ||
        (s.landmarks && s.landmarks.some((l) => normalizeArabic(l).includes(q)))
    );
  }, [allStations, toQuery]);

  const handleFindRoute = useCallback(() => {
    if (!selectedFrom || !selectedTo) return;
    const route = findRoute(
      selectedFrom,
      selectedTo,
      adjacencyGraph,
      stationLinesMap,
      getTicketPrice
    );
    setResult(route);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  }, [selectedFrom, selectedTo, adjacencyGraph, stationLinesMap, getTicketPrice]);

  const swapStations = useCallback(() => {
    const tempF = selectedFrom;
    const tempT = selectedTo;
    setSelectedFrom(tempT);
    setSelectedTo(tempF);
    setFromQuery(tempT || "");
    setToQuery(tempF || "");
    setResult(null);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  }, [selectedFrom, selectedTo]);

  const findNearestStation = useCallback(() => {
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

        for (const [name, coords] of Object.entries(METRO_STATION_COORDINATES)) {
          const dist = getDistanceInKm(userLat, userLng, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestStation = name;
          }
        }

        if (closestStation) {
          setSelectedFrom(closestStation);
          setFromQuery(closestStation);
          setShowFromList(false);
          setNearestDistance(
            minDistance < 1
              ? `${Math.round(minDistance * 1000)} متر`
              : `${minDistance.toFixed(1)} كم`
          );
          setResult(null);
        }
        setLocatingNearest(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("تعذر تحديد موقعك الحالي. يرجى التأكد من تشغيل الـ GPS والسماح للموقع.");
        setLocatingNearest(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const startTrip = useCallback(() => {
    setIsTripActive(true);
    setCurrentStepIndex(0);
  }, []);

  const endTrip = useCallback(() => {
    setIsTripActive(false);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => prev + 1);
  }, []);

  const handleShareRoute = useCallback(async () => {
    if (!result || !selectedFrom || !selectedTo) return;
    const shareText = generateShareText(result, selectedFrom, selectedTo);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `رحلة مترو من ${selectedFrom} إلى ${selectedTo}`,
          text: shareText,
          url: "https://cairomap.net/metro",
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedRoute(true);
      setTimeout(() => setCopiedRoute(false), 3000);
    } catch (e) {
      console.error("Failed to copy route:", e);
    }
  }, [result, selectedFrom, selectedTo]);

  const whatsappShareUrl = useMemo(() => {
    return generateWhatsappUrl(result, selectedFrom, selectedTo);
  }, [result, selectedFrom, selectedTo]);

  return {
    fromQuery,
    setFromQuery,
    toQuery,
    setToQuery,
    selectedFrom,
    setSelectedFrom,
    selectedTo,
    setSelectedTo,
    showFromList,
    setShowFromList,
    showToList,
    setShowToList,
    result,
    setResult,
    isTripActive,
    currentStepIndex,
    filteredFrom,
    filteredTo,
    locatingNearest,
    nearestDistance,
    copiedRoute,
    handleFindRoute,
    swapStations,
    findNearestStation,
    startTrip,
    endTrip,
    nextStep,
    handleShareRoute,
    whatsappShareUrl,
  };
}
