import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { MonorailLineId, MonorailStation, MonorailLineConfig } from "../types";
import {
  DEFAULT_MONORAIL_STATIONS,
  MONORAIL_LINES_CONFIG,
  MONORAIL_STATION_DETAILS,
} from "../constants";
import { normalizeArabic } from "../utils";

export function useMonorailData() {
  const [stations, setStations] = useState<MonorailStation[]>(DEFAULT_MONORAIL_STATIONS);
  const [selectedLine, setSelectedLine] = useState<MonorailLineId>("east");
  const [lineSearchQuery, setLineSearchQuery] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  // Load stations from Supabase or LocalStorage fallback
  useEffect(() => {
    document.title = "ماب القاهرة - مونوريل العاصمة وأكتوبر";
    loadStations();
  }, []);

  const loadStations = async () => {
    if (!supabase) {
      setStations(getLocalStations());
      return;
    }

    try {
      const { data, error } = await supabase
        .from("monorail_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error || !data || data.length === 0) {
        setStations(getLocalStations());
      } else {
        setStations(data);
      }
    } catch {
      setStations(getLocalStations());
    }
  };

  const getLocalStations = (): MonorailStation[] => {
    if (typeof window === "undefined") return DEFAULT_MONORAIL_STATIONS;
    const local = localStorage.getItem("local_monorail");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_MONORAIL_STATIONS;
      }
    }
    localStorage.setItem("local_monorail", JSON.stringify(DEFAULT_MONORAIL_STATIONS));
    return DEFAULT_MONORAIL_STATIONS;
  };

  // Selected Line Configuration
  const selectedLineObj: MonorailLineConfig = useMemo(() => {
    return (
      MONORAIL_LINES_CONFIG.find((l) => l.id === selectedLine) ||
      MONORAIL_LINES_CONFIG[0]
    );
  }, [selectedLine]);

  // Stations belonging to selected line
  const currentLineStations = useMemo(() => {
    return stations
      .filter((s) => s.line_type === selectedLine)
      .sort((a, b) => a.station_order - b.station_order);
  }, [stations, selectedLine]);

  // Filtered stations for explorer search
  const filteredCurrentLineStations = useMemo(() => {
    if (!lineSearchQuery.trim()) return currentLineStations;
    const q = normalizeArabic(lineSearchQuery.trim());
    return currentLineStations.filter((s) => {
      const nameMatch = normalizeArabic(s.name).includes(q);
      const details = MONORAIL_STATION_DETAILS[s.name];
      const landmarkMatch = details?.landmarks?.some((l) =>
        normalizeArabic(l).includes(q)
      );
      return nameMatch || landmarkMatch;
    });
  }, [currentLineStations, lineSearchQuery]);

  // Unique list of all stations for search inputs
  const allStationsList = useMemo(() => {
    const map = new Map<string, MonorailStation>();
    stations.forEach((s) => {
      if (!map.has(s.name)) {
        map.set(s.name, s);
      }
    });
    return Array.from(map.values());
  }, [stations]);

  const toggleStationLandmarks = (stationName: string) => {
    setExpandedStation((prev) => (prev === stationName ? null : stationName));
  };

  return {
    stations,
    selectedLine,
    setSelectedLine,
    selectedLineObj,
    allLines: MONORAIL_LINES_CONFIG,
    currentLineStations,
    filteredCurrentLineStations,
    lineSearchQuery,
    setLineSearchQuery,
    expandedStation,
    setExpandedStation,
    toggleStationLandmarks,
    allStationsList,
  };
}
