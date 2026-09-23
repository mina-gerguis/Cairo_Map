import { useState, useMemo, useEffect } from "react";
import { LrtRouteResult, LrtStation } from "../types";
import { normalizeArabic, calculateLrtRoute } from "../utils";

export function useLrtCalculator(
  stations: LrtStation[],
  allStations: string[],
  trunkStations: string[],
  capitalStations: string[],
  ramadanStations: string[]
) {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [result, setResult] = useState<LrtRouteResult | null>(null);

  // Active Trip Tracker
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Initialize selectors with default stations once stations are available
  useEffect(() => {
    if (stations.length > 0 && !selectedFrom && !selectedTo) {
      const main = stations
        .filter((s) => s.line_type === "trunk")
        .sort((a, b) => a.station_order - b.station_order);
      const cap = stations
        .filter((s) => s.line_type === "capital")
        .sort((a, b) => a.station_order - b.station_order);

      if (main.length > 0) {
        setSelectedFrom(main[0].name);
        setFromQuery(main[0].name);
      }
      if (cap.length > 0) {
        setSelectedTo(cap[cap.length - 1].name);
        setToQuery(cap[cap.length - 1].name);
      } else if (main.length > 1) {
        setSelectedTo(main[main.length - 1].name);
        setToQuery(main[main.length - 1].name);
      }
    }
  }, [stations, selectedFrom, selectedTo]);

  const filteredFrom = useMemo(() => {
    const q = normalizeArabic(fromQuery.trim());
    return allStations.filter((s) => normalizeArabic(s).includes(q) && q.length > 0);
  }, [fromQuery, allStations]);

  const filteredTo = useMemo(() => {
    const q = normalizeArabic(toQuery.trim());
    return allStations.filter((s) => normalizeArabic(s).includes(q) && q.length > 0);
  }, [toQuery, allStations]);

  const handleFind = () => {
    if (!selectedFrom || !selectedTo) return;
    const route = calculateLrtRoute(
      selectedFrom,
      selectedTo,
      trunkStations,
      capitalStations,
      ramadanStations
    );
    setResult(route);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const swapStations = () => {
    const tempF = selectedFrom;
    const tempT = selectedTo;
    setSelectedFrom(tempT);
    setSelectedTo(tempF);
    setFromQuery(tempT || "");
    setToQuery(tempF || "");
    setResult(null);
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const startTrip = () => {
    setIsTripActive(true);
    setCurrentStepIndex(0);
  };

  const endTrip = () => {
    setIsTripActive(false);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (result && currentStepIndex < result.stations.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

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
    filteredFrom,
    filteredTo,
    result,
    setResult,
    handleFind,
    swapStations,
    isTripActive,
    currentStepIndex,
    startTrip,
    endTrip,
    nextStep,
  };
}
