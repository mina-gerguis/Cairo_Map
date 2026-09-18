"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { comprehensiveRoutesDataset } from "@/data/directions_routes";
import { RouteData, DbTransitRoute, CitySuggestion, RouteLeg, QuickRouteItem } from "../types";
import {
  normalizeArabic,
  resolveLocationAliases,
  getStoredSearchCounts,
  recordRouteSearch,
  buildDynamicPopularRoutes
} from "../utils";
import { LOCATION_ALIASES_MAP } from "../constants";

export function useDirectionsData() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCounts, setSearchCounts] = useState<Record<string, number>>({});

  // Load stored search counts on mount
  useEffect(() => {
    setSearchCounts(getStoredSearchCounts());
  }, []);

  // Load routes from Supabase or static dataset
  useEffect(() => {
    let isMounted = true;

    async function fetchRoutes() {
      if (!supabase) {
        if (isMounted) {
          setRoutes(comprehensiveRoutesDataset);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("transit_routes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const grouped: Record<string, RouteData["options"]> = {};
          const groupMeta: Record<string, { from_aliases: string; to_aliases: string }> = {};

          (data as unknown as DbTransitRoute[]).forEach((item) => {
            const key = `${item.from_location}|||${item.to_location}`;
            if (!grouped[key]) {
              grouped[key] = [];
              groupMeta[key] = { from_aliases: "", to_aliases: "" };
            }

            if (item.from_aliases) {
              const existing = groupMeta[key].from_aliases ? groupMeta[key].from_aliases.split(",") : [];
              const newAliases = item.from_aliases.split(",");
              const combined = Array.from(new Set([...existing, ...newAliases].map(a => a.trim()).filter(Boolean))).join(", ");
              groupMeta[key].from_aliases = combined;
            }
            if (item.to_aliases) {
              const existing = groupMeta[key].to_aliases ? groupMeta[key].to_aliases.split(",") : [];
              const newAliases = item.to_aliases.split(",");
              const combined = Array.from(new Set([...existing, ...newAliases].map(a => a.trim()).filter(Boolean))).join(", ");
              groupMeta[key].to_aliases = combined;
            }

            let stepsArr: string[] = [];
            if (Array.isArray(item.steps)) {
              stepsArr = item.steps;
            } else if (typeof item.steps === "string") {
              try {
                stepsArr = JSON.parse(item.steps);
              } catch {
                stepsArr = [item.steps];
              }
            }

            let legsArr: RouteLeg[] | undefined = undefined;
            if (Array.isArray(item.legs)) {
              legsArr = item.legs;
            } else if (typeof item.legs === "string") {
              try {
                legsArr = JSON.parse(item.legs);
              } catch {
                legsArr = undefined;
              }
            }

            grouped[key].push({
              type: item.type,
              typeName: item.type_name,
              icon: item.icon,
              cost: item.cost,
              duration: item.duration,
              steps: stepsArr,
              legs: legsArr,
              tips: item.tips || undefined,
              map_link: item.map_link || undefined
            });
          });

          const formatted: RouteData[] = Object.keys(grouped).map(key => {
            const [from, to] = key.split("|||");
            return {
              from,
              to,
              from_aliases: groupMeta[key]?.from_aliases || undefined,
              to_aliases: groupMeta[key]?.to_aliases || undefined,
              options: grouped[key] || []
            };
          });

          if (isMounted) setRoutes(formatted);
        } else {
          if (isMounted) setRoutes(comprehensiveRoutesDataset);
        }
      } catch (err) {
        console.warn("Failed to fetch routes from Supabase, using local static dataset:", err);
        if (isMounted) setRoutes(comprehensiveRoutesDataset);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRoutes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Track a user search event and update search stats
  const trackSearch = useCallback((from: string, to: string) => {
    if (!from?.trim() || !to?.trim()) return;
    const updated = recordRouteSearch(from, to);
    setSearchCounts({ ...updated });
  }, []);

  // Compute dynamic popular routes (ranked by highest search frequency)
  const popularRoutes = useMemo<QuickRouteItem[]>(() => {
    return buildDynamicPopularRoutes(routes, searchCounts);
  }, [routes, searchCounts]);

  // Compute unique cities list with all associated aliases
  const uniqueCitiesList = useMemo<CitySuggestion[]>(() => {
    const list: CitySuggestion[] = [];

    (routes || []).forEach(r => {
      // From Location Aliases
      const fromAliasesArr = r.from_aliases ? r.from_aliases.split(",").map(a => a.trim()).filter(Boolean) : [];
      Object.keys(LOCATION_ALIASES_MAP).forEach(aliasKey => {
        if (LOCATION_ALIASES_MAP[aliasKey] === r.from && !fromAliasesArr.includes(aliasKey)) {
          fromAliasesArr.push(aliasKey);
        }
      });

      const fromObj = list.find(item => item.name === r.from);
      if (!fromObj) {
        list.push({ name: r.from, searchNames: Array.from(new Set([r.from, ...fromAliasesArr])) });
      } else {
        fromAliasesArr.forEach(a => {
          if (!fromObj.searchNames.includes(a)) fromObj.searchNames.push(a);
        });
      }

      // To Location Aliases
      const toAliasesArr = r.to_aliases ? r.to_aliases.split(",").map(a => a.trim()).filter(Boolean) : [];
      Object.keys(LOCATION_ALIASES_MAP).forEach(aliasKey => {
        if (LOCATION_ALIASES_MAP[aliasKey] === r.to && !toAliasesArr.includes(aliasKey)) {
          toAliasesArr.push(aliasKey);
        }
      });

      const toObj = list.find(item => item.name === r.to);
      if (!toObj) {
        list.push({ name: r.to, searchNames: Array.from(new Set([r.to, ...toAliasesArr])) });
      } else {
        toAliasesArr.forEach(a => {
          if (!toObj.searchNames.includes(a)) toObj.searchNames.push(a);
        });
      }
    });

    return list;
  }, [routes]);

  // Search logic matching normalized text and aliases
  const searchRoute = useCallback((fromInput: string, toInput: string) => {
    if (!fromInput.trim() || !toInput.trim()) {
      return { matchedRoute: null, resolvedFrom: "", resolvedTo: "" };
    }

    const searchFrom = resolveLocationAliases(fromInput);
    const searchTo = resolveLocationAliases(toInput);

    const normFromResolved = normalizeArabic(searchFrom);
    const normToResolved = normalizeArabic(searchTo);

    let foundRoute: RouteData | null = null;
    let resolvedFrom = "";
    let resolvedTo = "";

    for (const route of (routes || [])) {
      const routeFromNorm = normalizeArabic(route.from);
      const isFromDirectMatch = routeFromNorm === normFromResolved || routeFromNorm.includes(normFromResolved) || normFromResolved.includes(routeFromNorm);
      const isFromAliasMatch = route.from_aliases && route.from_aliases.split(",").some(alias => {
        const normAlias = normalizeArabic(alias);
        return normAlias === normFromResolved || normAlias.includes(normFromResolved);
      });

      const routeToNorm = normalizeArabic(route.to);
      const isToDirectMatch = routeToNorm === normToResolved || routeToNorm.includes(normToResolved) || normToResolved.includes(routeToNorm);
      const isToAliasMatch = route.to_aliases && route.to_aliases.split(",").some(alias => {
        const normAlias = normalizeArabic(alias);
        return normAlias === normToResolved || normAlias.includes(normToResolved);
      });

      if ((isFromDirectMatch || isFromAliasMatch) && (isToDirectMatch || isToAliasMatch)) {
        foundRoute = route;
        resolvedFrom = route.from;
        resolvedTo = route.to;
        break;
      }
    }

    return {
      matchedRoute: foundRoute,
      resolvedFrom: resolvedFrom || searchFrom,
      resolvedTo: resolvedTo || searchTo
    };
  }, [routes]);

  return {
    routes,
    loading,
    popularRoutes,
    uniqueCitiesList,
    searchRoute,
    trackSearch,
  };
}
