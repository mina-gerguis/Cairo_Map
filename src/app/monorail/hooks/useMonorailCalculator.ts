import { useState, useMemo } from "react";
import { MonorailStation, TrackerStationItem } from "../types";
import { MONORAIL_STATION_COORDINATES, MONORAIL_STATION_DETAILS } from "../constants";
import { normalizeArabic, getDistanceInKm, calculateMonorailRoute } from "../utils";

export function useMonorailCalculator(
  allStationsList: MonorailStation[],
  stations: MonorailStation[]
) {
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);

  // GPS Nearest Station State
  const [locatingNearest, setLocatingNearest] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<string | null>(null);

  // Trip tracking state
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copiedRoute, setCopiedRoute] = useState(false);

  // Filtered station list for 'From' input
  const filteredFromStations = useMemo(() => {
    if (!fromQuery.trim()) return allStationsList;
    const q = normalizeArabic(fromQuery.trim());
    return allStationsList.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) =>
        normalizeArabic(l).includes(q)
      );
      return nameMatch || landmarkMatch;
    });
  }, [allStationsList, fromQuery]);

  // Filtered station list for 'To' input
  const filteredToStations = useMemo(() => {
    if (!toQuery.trim()) return allStationsList;
    const q = normalizeArabic(toQuery.trim());
    return allStationsList.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) =>
        normalizeArabic(l).includes(q)
      );
      return nameMatch || landmarkMatch;
    });
  }, [allStationsList, toQuery]);

  // Trip calculation result
  const routeResult = useMemo(() => {
    return calculateMonorailRoute(selectedFrom, selectedTo, stations);
  }, [selectedFrom, selectedTo, stations]);

  // Combined path stations for step tracking
  const trackerStationsList: TrackerStationItem[] = useMemo(() => {
    if (!routeResult) return [];
    if (routeResult.sameLine && routeResult.stations) {
      return routeResult.stations.map((name) => ({
        name,
        lineColor: routeResult.lineColor,
        isTransfer: false,
      }));
    }
    if (!routeResult.sameLine && routeResult.leg1 && routeResult.leg3) {
      const leg1Items = routeResult.leg1.stations
        ? routeResult.leg1.stations.map((name) => ({
            name,
            lineColor: routeResult.leg1?.lineColor,
            isTransfer: name === routeResult.leg1?.to,
          }))
        : [];
      const leg3Items = routeResult.leg3.stations
        ? routeResult.leg3.stations.slice(1).map((name) => ({
            name,
            lineColor: routeResult.leg3?.lineColor,
            isTransfer: false,
          }))
        : [];
      return [...leg1Items, ...leg3Items];
    }
    return [];
  }, [routeResult]);

  // Swap Stations
  const swapStations = () => {
    const tempFrom = selectedFrom;
    const tempTo = selectedTo;
    setSelectedFrom(tempTo);
    setSelectedTo(tempFrom);
    setFromQuery(tempTo || "");
    setToQuery(tempFrom || "");
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  // GPS Nearest Station
  const findNearestStation = () => {
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

        for (const [name, coords] of Object.entries(MONORAIL_STATION_COORDINATES)) {
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
        }
        setLocatingNearest(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("تعذر تحديد موقعك الحالي. يرجى التأكد من تشغيل الـ GPS والسماح للخرائط.");
        setLocatingNearest(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Share Route
  const handleShareRoute = async () => {
    if (!routeResult || !selectedFrom || !selectedTo) return;

    const shareText = `🚝 مسار رحلة المونوريل عبر تطبيق ماب القاهرة:
من: ${selectedFrom}
إلى: ${selectedTo}
⏱️ زمن الرحلة التقريبي: ${routeResult.time} دقيقة
💰 سعر التذكرة: ${routeResult.price} ج.م
🚉 عدد المحطات: ${routeResult.count}
${routeResult.description}

تصفح المزيد واحسب رحلتك عبر:
${typeof window !== "undefined" ? window.location.href : "https://cairomap.vercel.app/monorail"}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedRoute(true);
        setTimeout(() => setCopiedRoute(false), 2500);
      } catch {
        // fallback
      }
    }
  };

  // WhatsApp Share URL
  const whatsappShareUrl = useMemo(() => {
    if (!routeResult || !selectedFrom || !selectedTo) return "";
    const text = encodeURIComponent(`🚝 مسار رحلة المونوريل عبر ماب القاهرة:
من: ${selectedFrom}
إلى: ${selectedTo}
⏱️ الزمن: ${routeResult.time} دقيقة
💰 التذكرة: ${routeResult.price} ج.م
${routeResult.description}`);
    return `https://api.whatsapp.com/send?text=${text}`;
  }, [routeResult, selectedFrom, selectedTo]);

  const startTrip = () => {
    setIsTripActive(true);
    setCurrentStepIndex(0);
  };

  const endTrip = () => {
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const prevStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const nextStep = () => {
    setCurrentStepIndex((prev) => Math.min(trackerStationsList.length - 1, prev + 1));
  };

  return {
    selectedFrom,
    setSelectedFrom,
    selectedTo,
    setSelectedTo,
    fromQuery,
    setFromQuery,
    toQuery,
    setToQuery,
    showFromList,
    setShowFromList,
    showToList,
    setShowToList,
    filteredFromStations,
    filteredToStations,
    swapStations,
    findNearestStation,
    locatingNearest,
    nearestDistance,
    routeResult,
    trackerStationsList,
    isTripActive,
    currentStepIndex,
    startTrip,
    endTrip,
    prevStep,
    nextStep,
    copiedRoute,
    handleShareRoute,
    whatsappShareUrl,
  };
}
