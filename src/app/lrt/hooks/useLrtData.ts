import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isPageOpenByPromotion } from "@/lib/promotions";
import { LrtStation, LrtExplorerTab } from "../types";
import { DEFAULT_LRT } from "../constants";
import { normalizeArabic } from "../utils";

export function useLrtData() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<LrtStation[]>([]);
  const [loading, setLoading] = useState(true);

  // LRT Explorer State
  const [activeLine, setActiveLine] = useState<LrtExplorerTab>("all");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const promoStatus = isPageOpenByPromotion("/lrt");
  const isExpired =
    profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess =
    Boolean(profile?.is_admin) ||
    promoStatus.isOpen ||
    Boolean(
      (profile?.subscription_tier === "silver" ||
        profile?.subscription_tier === "gold" ||
        profile?.subscription_tier === "mishwar") &&
        !isExpired
    );

  useEffect(() => {
    document.title = "ماب القاهرة - القطار الكهربي LRT";
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadStations();
    } else {
      setLoading(false);
    }
  }, [user, hasAccess]);

  const loadStations = async () => {
    setLoading(true);
    if (!supabase) {
      const local = getLocalStations();
      setStations(local);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lrt_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error || !data || data.length === 0) {
        const local = getLocalStations();
        setStations(local);
      } else {
        setStations(data);
      }
    } catch {
      const local = getLocalStations();
      setStations(local);
    } finally {
      setLoading(false);
    }
  };

  const getLocalStations = (): LrtStation[] => {
    if (typeof window === "undefined") return DEFAULT_LRT;
    const local = localStorage.getItem("local_lrt");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_LRT;
      }
    }
    localStorage.setItem("local_lrt", JSON.stringify(DEFAULT_LRT));
    return DEFAULT_LRT;
  };

  const allStationsList = useMemo(() => {
    return stations.length > 0 ? stations : DEFAULT_LRT;
  }, [stations]);

  const LRT_MAIN_TRUNK = useMemo(() => {
    return allStationsList
      .filter((s) => s.line_type === "trunk")
      .sort((a, b) => a.station_order - b.station_order)
      .map((s) => s.name);
  }, [allStationsList]);

  const LRT_BRANCH_CAPITAL = useMemo(() => {
    return allStationsList
      .filter((s) => s.line_type === "capital")
      .sort((a, b) => a.station_order - b.station_order)
      .map((s) => s.name);
  }, [allStationsList]);

  const LRT_BRANCH_RAMADAN = useMemo(() => {
    return allStationsList
      .filter((s) => s.line_type === "ramadan")
      .sort((a, b) => a.station_order - b.station_order)
      .map((s) => s.name);
  }, [allStationsList]);

  const ALL_LRT_STATIONS = useMemo(() => {
    return [...LRT_MAIN_TRUNK, ...LRT_BRANCH_CAPITAL, ...LRT_BRANCH_RAMADAN];
  }, [LRT_MAIN_TRUNK, LRT_BRANCH_CAPITAL, LRT_BRANCH_RAMADAN]);

  const searchResults = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (q.length === 0) return [];
    return allStationsList.filter((s) => normalizeArabic(s.name).includes(q));
  }, [searchQuery, allStationsList]);

  const handleSelectSearchStation = (station: LrtStation) => {
    setActiveLine(station.line_type);
    setExpandedStation(station.name);
    setSearchQuery("");
    setIsDropdownOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`station-${station.name}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const toggleStation = (stationName: string) => {
    setExpandedStation((prev) => (prev === stationName ? null : stationName));
  };

  return {
    user,
    profile,
    authLoading,
    loading,
    hasAccess,
    promoStatus,
    stations,
    allStationsList,
    LRT_MAIN_TRUNK,
    LRT_BRANCH_CAPITAL,
    LRT_BRANCH_RAMADAN,
    ALL_LRT_STATIONS,
    activeLine,
    setActiveLine,
    expandedStation,
    setExpandedStation,
    toggleStation,
    searchQuery,
    setSearchQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    searchContainerRef,
    searchResults,
    handleSelectSearchStation,
  };
}
