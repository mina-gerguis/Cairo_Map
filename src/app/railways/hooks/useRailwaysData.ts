import { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { RailwayRoute, RailwayStop, StationListItem } from "../types";
import { RAILWAY_ROUTES } from "../constants";
import { getLocalRoutes, getRouteColor, getRouteShortName } from "../utils";

export function useRailwaysData(user: User | null, hasAccess: boolean) {
  const [routes, setRoutes] = useState<RailwayRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("cairo-alex");

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setRoutes(getLocalRoutes());
      setLoading(false);
      return;
    }

    try {
      const { data: routesData, error: routesErr } = await supabase
        .from("railway_routes")
        .select("*");

      if (routesErr) throw routesErr;

      const { data: stationsData, error: stationsErr } = await supabase
        .from("railway_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (stationsErr) throw stationsErr;

      const combined: RailwayRoute[] = (routesData || []).map((route: any) => {
        const stops: RailwayStop[] = (stationsData || [])
          .filter((s: any) => s.route_id === route.id)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            status: (s.status === "تحت الإنشاء" ? "تحت الإنشاء" : "تعمل") as "تعمل" | "تحت الإنشاء"
          }));

        return {
          id: route.id,
          name: route.name,
          from: route.from_location || route.from,
          to: route.to_location || route.to,
          duration: route.duration,
          stops: stops,
          classes: route.classes || [
            { name: "درجة أولى مكيفة", price: "تحدد لاحقاً", features: "تكييف، مقاعد مريحة" },
            { name: "درجة ثانية مكيفة", price: "تحدد لاحقاً", features: "تكييف واقتصادي" }
          ],
          tips: route.tips || ""
        };
      });

      if (combined.length > 0) {
        setRoutes(combined);
        setSelectedRouteId(prev => (combined.some(r => r.id === prev) ? prev : combined[0].id));
      } else {
        setRoutes(getLocalRoutes());
      }
    } catch (err) {
      console.warn("Failed to load railways from Supabase, using local defaults", err);
      setRoutes(getLocalRoutes());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadRoutes();
    }
  }, [hasAccess, loadRoutes]);

  const activeRoutesList = routes.length > 0 ? routes : RAILWAY_ROUTES;
  const currentRoute = activeRoutesList.find(r => r.id === selectedRouteId) || activeRoutesList[0];
  const activeIndex = activeRoutesList.findIndex(r => r.id === selectedRouteId);
  const color = getRouteColor(selectedRouteId, activeIndex >= 0 ? activeIndex : 0);

  // Memoized unique list of all stations across lines for search & reporting
  const allStationsList = useMemo<StationListItem[]>(() => {
    const list: StationListItem[] = [];
    const seen = new Set<string>();

    activeRoutesList.forEach(r => {
      if (Array.isArray(r.stops)) {
        r.stops.forEach(s => {
          const key = `${r.id}-${s.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            list.push({ name: s.name, routeName: getRouteShortName(r), routeId: r.id });
          }
        });
      }
    });

    return list;
  }, [activeRoutesList]);

  // Overall Statistics
  const totalStationsCount = useMemo(() => {
    const uniqueNames = new Set<string>();
    activeRoutesList.forEach(r => {
      if (Array.isArray(r.stops)) {
        r.stops.forEach(s => uniqueNames.add(s.name));
      }
    });
    return uniqueNames.size;
  }, [activeRoutesList]);

  return {
    routes,
    loading,
    selectedRouteId,
    setSelectedRouteId,
    activeRoutesList,
    currentRoute,
    activeIndex,
    color,
    allStationsList,
    totalStationsCount,
    reloadRoutes: loadRoutes,
  };
}
