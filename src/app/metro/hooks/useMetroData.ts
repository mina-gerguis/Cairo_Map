import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Line3BranchId,
  LineId,
  MetroPriceTier,
  MetroStation,
  StationInfo,
} from "../types";
import {
  DEFAULT_METRO_PRICES,
  DEFAULT_METRO_STATIONS,
  LINE_COLORS,
  LOCAL_METRO_PRICES_KEY,
  LOCAL_METRO_STATIONS_KEY,
  METRO_LINES_LIST,
  METRO_STATION_LANDMARKS,
} from "../constants";
import { buildMetroGraph, calculateTicketPrice } from "../utils";

export function useMetroData() {
  const [stations, setStations] = useState<MetroStation[]>([]);
  const [ticketPrices, setTicketPrices] = useState<MetroPriceTier[]>([]);
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  // Line explorer state
  const [explorerLine, setExplorerLine] = useState<LineId>("line1");
  const [line3ActiveBranch, setLine3ActiveBranch] = useState<Line3BranchId>("trunk");

  const getLocalStations = (): MetroStation[] => {
    if (typeof window === "undefined") return DEFAULT_METRO_STATIONS;
    const local = localStorage.getItem(LOCAL_METRO_STATIONS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            const updated = { ...item };
            updated.status = item.status || "تشغيل فعلي";
            if (!updated.landmarks || !Array.isArray(updated.landmarks) || updated.landmarks.length === 0) {
              updated.landmarks = METRO_STATION_LANDMARKS[updated.name] || [];
            }
            return updated;
          });
        }
        return parsed;
      } catch {
        return DEFAULT_METRO_STATIONS;
      }
    }
    return DEFAULT_METRO_STATIONS;
  };

  const getLocalPrices = (): MetroPriceTier[] => {
    if (typeof window === "undefined") return DEFAULT_METRO_PRICES;
    const local = localStorage.getItem(LOCAL_METRO_PRICES_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_METRO_PRICES;
      }
    }
    return DEFAULT_METRO_PRICES;
  };

  // Load stations & prices dynamically
  useEffect(() => {
    document.title = "ماب القاهرة - مترو الأنفاق";
    const loadData = async () => {
      let loadedStations: MetroStation[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("metro_stations").select("*");
          if (!error && data && data.length > 0) {
            loadedStations = data.map((st: any) => ({
              ...st,
              landmarks:
                st.landmarks && Array.isArray(st.landmarks) && st.landmarks.length > 0
                  ? st.landmarks
                  : METRO_STATION_LANDMARKS[st.name] || [],
            }));
          } else {
            loadedStations = getLocalStations();
          }
        } catch {
          loadedStations = getLocalStations();
        }
      } else {
        loadedStations = getLocalStations();
      }
      setStations(loadedStations);

      let loadedPrices: MetroPriceTier[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("metro_prices").select("*");
          if (!error && data && data.length > 0) {
            loadedPrices = data;
          } else {
            loadedPrices = getLocalPrices();
          }
        } catch {
          loadedPrices = getLocalPrices();
        }
      } else {
        loadedPrices = getLocalPrices();
      }
      setTicketPrices(loadedPrices);
    };

    loadData();
  }, []);

  // Build Adjacency Graph and Stations Map dynamically from stations state
  const { adjacencyGraph, stationLinesMap, allStations } = useMemo(() => {
    return buildMetroGraph(stations);
  }, [stations]);

  const getTicketPrice = useCallback(
    (count: number): number => {
      return calculateTicketPrice(count, ticketPrices);
    },
    [ticketPrices]
  );

  const selectedLineObj = useMemo(() => {
    return METRO_LINES_LIST.find((l) => l.id === explorerLine) || METRO_LINES_LIST[0];
  }, [explorerLine]);

  const color = LINE_COLORS[explorerLine] || "#ef4444";

  // Current explorer line stations list
  const currentExplorerStations = useMemo(() => {
    if (explorerLine === "line1") {
      return stations.filter((s) => s.line_type === "line1").sort((a, b) => a.station_order - b.station_order);
    } else if (explorerLine === "line2") {
      return stations.filter((s) => s.line_type === "line2").sort((a, b) => a.station_order - b.station_order);
    } else if (explorerLine === "line3") {
      if (line3ActiveBranch === "trunk") {
        return stations.filter((s) => s.line_type === "line3").sort((a, b) => a.station_order - b.station_order);
      } else if (line3ActiveBranch === "branchA") {
        return stations.filter((s) => s.line_type === "line3_branch_a").sort((a, b) => a.station_order - b.station_order);
      } else {
        return stations.filter((s) => s.line_type === "line3_branch_b").sort((a, b) => a.station_order - b.station_order);
      }
    } else {
      return stations.filter((s) => s.line_type === explorerLine).sort((a, b) => a.station_order - b.station_order);
    }
  }, [stations, explorerLine, line3ActiveBranch]);

  const toggleStation = useCallback((stationName: string) => {
    setExpandedStation((prev) => (prev === stationName ? null : stationName));
  }, []);

  return {
    stations,
    ticketPrices,
    expandedStation,
    setExpandedStation,
    toggleStation,
    explorerLine,
    setExplorerLine,
    line3ActiveBranch,
    setLine3ActiveBranch,
    selectedLineObj,
    color,
    currentExplorerStations,
    adjacencyGraph,
    stationLinesMap,
    allStations,
    getTicketPrice,
  };
}
