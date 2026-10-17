import { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { BusStation } from "../types";
import { DEFAULT_BUS_STATIONS, LOCAL_STORAGE_KEY } from "../constants";
import { filterBusStations } from "../utils";

export function useBusStationsData(user: User | null, hasAccess: boolean) {
  const [stations, setStations] = useState<BusStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  const getLocalStations = useCallback((): BusStation[] => {
    if (typeof window === "undefined") return DEFAULT_BUS_STATIONS;
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      return DEFAULT_BUS_STATIONS;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BUS_STATIONS));
    } catch {
      // ignore storage quota errors
    }
    return DEFAULT_BUS_STATIONS;
  }, []);

  const loadStations = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setStations(getLocalStations());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bus_stations")
        .select("*")
        .order("name", { ascending: true });

      if (error || !data || data.length === 0) {
        setStations(getLocalStations());
      } else {
        setStations(data as BusStation[]);
      }
    } catch (err) {
      console.error("Failed to load bus stations:", err);
      setStations(getLocalStations());
    } finally {
      setLoading(false);
    }
  }, [getLocalStations]);

  useEffect(() => {
    if (hasAccess) {
      loadStations();
    }
  }, [hasAccess, loadStations]);

  const filteredStations = useMemo(() => {
    return filterBusStations(stations, searchQuery);
  }, [stations, searchQuery]);

  const toggleStation = useCallback((name: string) => {
    setExpandedStation((prev) => (prev === name ? null : name));
  }, []);

  // Compute summary stats
  const stats = useMemo(() => {
    const allCompanies = new Set<string>();
    const allDestinations = new Set<string>();

    stations.forEach((s) => {
      s.companies?.forEach((c) => {
        if (c.name) allCompanies.add(c.name);
      });
      s.destinations?.forEach((d) => {
        if (d) allDestinations.add(d);
      });
    });

    return {
      stationsCount: stations.length,
      companiesCount: allCompanies.size,
      destinationsCount: allDestinations.size
    };
  }, [stations]);

  return {
    stations,
    filteredStations,
    loading,
    searchQuery,
    setSearchQuery,
    expandedStation,
    setExpandedStation,
    toggleStation,
    stats,
    refreshStations: loadStations
  };
}
