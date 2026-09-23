"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ParkingSpot } from "../types";
import { DEFAULT_PARKING } from "../constants";

export function useParkingData() {
  const { user, profile, loading: authLoading, isPageOpen } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [expandedParkingId, setExpandedParkingId] = useState<string | null>(null);
  const [parkingData, setParkingData] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  const promoStatus = isPageOpen("/parking");
  const isExpired =
    Boolean(profile?.subscription_end && new Date(profile.subscription_end) < new Date());

  const hasAccess = Boolean(
    profile?.is_admin ||
      promoStatus.isOpen ||
      ((profile?.subscription_tier === "silver" ||
        profile?.subscription_tier === "gold" ||
        profile?.subscription_tier === "mishwar") &&
        !isExpired)
  );

  const getLocalParking = useCallback((): ParkingSpot[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_parking_spots");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore parsing errors
        }
      }
    }
    return DEFAULT_PARKING;
  }, []);

  useEffect(() => {
    document.title = "ماب القاهرة - دليل الجراجات";

    const fetchParking = async () => {
      setLoading(true);
      if (!supabase) {
        setParkingData(getLocalParking());
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.from("parking_spots").select("*");
        if (error || !data || data.length === 0) {
          setParkingData(getLocalParking());
        } else {
          const mapped: ParkingSpot[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            area: item.area,
            address: item.address,
            nearestMetro: item.nearest_metro || item.nearestMetro || "",
            hourlyRate: item.hourly_rate ?? item.hourlyRate ?? 0,
            maxDailyRate:
              item.max_daily_rate !== null && item.max_daily_rate !== undefined
                ? item.max_daily_rate
                : item.maxDailyRate,
            capacity: item.capacity ?? 0,
            type: item.type,
            hours: item.hours,
            features: Array.isArray(item.features)
              ? item.features
              : typeof item.features === "string"
              ? JSON.parse(item.features)
              : [],
            mapLocationLink: item.map_location_link || item.mapLocationLink || "",
          }));
          setParkingData(mapped);
        }
      } catch (err) {
        console.error("Error loading parking spots:", err);
        setParkingData(getLocalParking());
      } finally {
        setLoading(false);
      }
    };

    if (user && hasAccess) {
      fetchParking();
    } else {
      setLoading(false);
    }
  }, [user, hasAccess, getLocalParking]);

  const filteredParking = useMemo(() => {
    return parkingData.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArea = selectedArea === "all" || p.area === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [parkingData, searchTerm, selectedArea]);

  const areas = useMemo(() => {
    return Array.from(new Set(parkingData.map((p) => p.area)));
  }, [parkingData]);

  const handleParkingClick = useCallback((id: string) => {
    setExpandedParkingId((prev) => (prev === id ? null : id));
  }, []);

  return {
    user,
    profile,
    authLoading,
    loading,
    promoStatus,
    hasAccess,
    searchTerm,
    setSearchTerm,
    selectedArea,
    setSelectedArea,
    expandedParkingId,
    handleParkingClick,
    parkingData,
    filteredParking,
    areas,
  };
}
