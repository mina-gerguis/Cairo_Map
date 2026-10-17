"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_HIGHWAYS, HighwayItem } from "@/data/roads_info";
import { filterHighways } from "../utils";
import { RoadTypeFilter, RoadsStats } from "../types";

export function useRoadsData() {
  const [roads, setRoads] = useState<HighwayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<RoadTypeFilter>("all");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [selectedRoadId, setSelectedRoadId] = useState<string>("h1");

  // Load Roads from Supabase or Fallback
  useEffect(() => {
    async function loadRoads() {
      try {
        setLoading(true);

        // 1. Check local storage cache
        let initialData = DEFAULT_HIGHWAYS;
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("local_highways_info");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                initialData = parsed;
              }
            } catch {
              // ignore cache parse error
            }
          }
        }

        // 2. Fetch from Supabase if available
        if (supabase) {
          const { data, error: dbError } = await supabase
            .from("highways_info")
            .select("*")
            .order("length_km", { ascending: false });

          if (!dbError && data && data.length > 0) {
            // Map DB snake_case columns to HighwayItem camelCase
            const mapped: HighwayItem[] = data.map((d: any) => ({
              id: d.id,
              name: d.name,
              code: d.code,
              type: d.type,
              lengthKm: Number(d.length_km) || 0,
              startPoint: d.start_point,
              endPoint: d.end_point,
              governorates: Array.isArray(d.governorates) ? d.governorates : [],
              speeds: {
                privateCar: d.speed_private_car ?? 120,
                minibus: d.speed_minibus ?? 100,
                microbus: d.speed_microbus ?? 100,
                pickup: d.speed_pickup ?? 90,
                bus: d.speed_bus ?? 100,
                truck: d.speed_truck ?? 80,
              },
              lanesCount: d.lanes_count ?? 4,
              tollGates: Array.isArray(d.toll_gates) ? d.toll_gates : [],
              gasStations: Array.isArray(d.gas_stations) ? d.gas_stations : [],
              emergencyPhone: d.emergency_phone || "01221110000",
              lat: Number(d.lat) || 30.0444,
              lng: Number(d.lng) || 31.2357,
              status: d.status || "open",
              statusText: d.status === "open" ? "طريق مفتوح وسيولة مرورية" : "تنبيه أعمال صيانة",
              description: d.description || "",
              radarInfo: d.radar_info || "",
              mapUrl: d.map_url || "",
            }));

            setRoads(mapped);
            if (mapped.length > 0 && !selectedRoadId) {
              setSelectedRoadId(mapped[0].id);
            }
            return;
          }
        }

        setRoads(initialData);
        if (initialData.length > 0 && !selectedRoadId) {
          setSelectedRoadId(initialData[0].id);
        }
      } catch (err: any) {
        console.error("Error loading highways:", err);
        setError(err.message || "حدث خطأ أثناء تحميل بيانات الطرق");
        setRoads(DEFAULT_HIGHWAYS);
      } finally {
        setLoading(false);
      }
    }

    loadRoads();
  }, []);

  // Filtered Roads
  const filteredRoads = useMemo(() => {
    return filterHighways(roads, searchQuery, selectedType, selectedGovernorate);
  }, [roads, searchQuery, selectedType, selectedGovernorate]);

  // Currently Selected Road
  const selectedRoad = useMemo(() => {
    return roads.find((r) => r.id === selectedRoadId) || filteredRoads[0] || roads[0] || null;
  }, [roads, selectedRoadId, filteredRoads]);

  // Overall Statistics
  const stats: RoadsStats = useMemo(() => {
    const totalDist = roads.reduce((acc, r) => acc + (r.lengthKm || 0), 0);
    const openCount = roads.filter((r) => r.status === "open").length;

    return {
      totalRoads: roads.length,
      totalDistanceKm: Math.round(totalDist),
      openRoadsCount: openCount,
      newsCount: 5,
    };
  }, [roads]);

  // Unique Governorates for Filter Dropdown
  const allGovernorates = useMemo(() => {
    const set = new Set<string>();
    roads.forEach((r) => {
      r.governorates.forEach((g) => set.add(g));
    });
    return Array.from(set).sort();
  }, [roads]);

  return {
    roads,
    filteredRoads,
    selectedRoad,
    selectedRoadId,
    setSelectedRoadId,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedGovernorate,
    setSelectedGovernorate,
    allGovernorates,
    stats,
  };
}
