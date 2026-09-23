import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Airport, DEFAULT_AIRPORTS } from "@/data/airports";
import { AirportTab, AirportsStats } from "../types";
import { enrichAirportData, filterAirports, getLocalAirports } from "../utils";

export function useAirportsData(user: any, hasAccess: boolean) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [activeTab, setActiveTab] = useState<AirportTab>("list");

  const loadAirports = useCallback(async () => {
    setLoading(true);

    if (!supabase) {
      setAirports(getLocalAirports());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("airports")
        .select("*")
        .order("name", { ascending: true });

      if (error || !data) {
        setAirports(getLocalAirports());
      } else {
        // Enriched DB data with local JSON defaults
        const enriched = data.map(dbAirport => {
          const localMatch = DEFAULT_AIRPORTS.find(
            la =>
              (la.iata_code &&
                dbAirport.code &&
                la.iata_code.toLowerCase() === dbAirport.code.toLowerCase()) ||
              (la.name_ar && dbAirport.name && la.name_ar.includes(dbAirport.name))
          );

          return enrichAirportData(dbAirport, localMatch);
        });

        // Add any local airports not present in the DB
        const dbCodes = new Set(
          (data || []).map(d => (d.code ? d.code.toLowerCase() : ""))
        );
        const missingLocals = DEFAULT_AIRPORTS.filter(
          la => la.iata_code && !dbCodes.has(la.iata_code.toLowerCase())
        );

        setAirports([...enriched, ...missingLocals]);
      }
    } catch {
      setAirports(getLocalAirports());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadAirports();
    }
  }, [hasAccess, loadAirports]);

  const toggleExpand = useCallback((id: number | string) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  const filteredAirports = useMemo(() => {
    return filterAirports(airports, searchQuery);
  }, [airports, searchQuery]);

  const stats: AirportsStats = useMemo(() => {
    const internationalCount = airports.filter(
      a => a.type_en === "international" || a.type === "دولي"
    ).length;
    const domesticCount = airports.length - internationalCount;

    return {
      totalAirports: airports.length,
      internationalCount,
      domesticCount: domesticCount > 0 ? domesticCount : 0
    };
  }, [airports]);

  return {
    airports,
    filteredAirports,
    loading,
    searchQuery,
    setSearchQuery,
    expandedId,
    toggleExpand,
    activeTab,
    setActiveTab,
    stats,
    refreshAirports: loadAirports
  };
}
