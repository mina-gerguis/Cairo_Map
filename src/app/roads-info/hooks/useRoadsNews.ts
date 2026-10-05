"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_ROAD_NEWS, RoadNewsItem } from "@/data/roads_info";

export function useRoadsNews() {
  const [news, setNews] = useState<RoadNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRoadFilter, setSelectedRoadFilter] = useState<string>("all");

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);

        // Check local storage cache
        let initialNews = DEFAULT_ROAD_NEWS;
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("local_road_news");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                initialNews = parsed;
              }
            } catch {
              // ignore cache parse
            }
          }
        }

        // Fetch from Supabase if available
        if (supabase) {
          const { data, error } = await supabase
            .from("road_news")
            .select("*")
            .eq("is_active", true)
            .order("published_at", { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped: RoadNewsItem[] = data.map((d: any) => ({
              id: d.id,
              title: d.title,
              summary: d.summary,
              category: d.category,
              severity: d.severity,
              roadName: d.road_name || "كافة الطرق",
              source: d.source || "الإدارة العامة للمرور",
              publishedAt: d.published_at || new Date().toISOString(),
              isActive: d.is_active ?? true,
            }));
            setNews(mapped);
            return;
          }
        }

        setNews(initialNews);
      } catch (err) {
        console.error("Error loading road news:", err);
        setNews(DEFAULT_ROAD_NEWS);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchRoad =
        selectedRoadFilter === "all" ||
        item.roadName === selectedRoadFilter ||
        item.roadName === "كافة الطرق";
      return matchCategory && matchRoad;
    });
  }, [news, selectedCategory, selectedRoadFilter]);

  const criticalAlertsCount = useMemo(() => {
    return news.filter((n) => n.severity === "critical" || n.severity === "warning").length;
  }, [news]);

  return {
    news,
    filteredNews,
    loading,
    selectedCategory,
    setSelectedCategory,
    selectedRoadFilter,
    setSelectedRoadFilter,
    criticalAlertsCount,
  };
}
