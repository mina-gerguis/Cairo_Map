import { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { BrtStation, BrtRoute, RouteInteraction, VoteStats } from "../types";
import { getLocalBrtStations } from "../utils";

export function useBrtData(user: User | null, hasAccess: boolean) {
  const [stations, setStations] = useState<BrtStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<RouteInteraction[]>([]);

  // Search & Selection State
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [destinationQuery, setDestinationQuery] = useState("");

  const loadInteractions = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("route_interactions")
        .select("*");
      if (!error && data) {
        setInteractions(data);
      }
    } catch (err) {
      console.error("Failed to load interactions:", err);
    }
  }, []);

  const loadStations = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setStations(getLocalBrtStations());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("brt_stations")
        .select("*")
        .order("name", { ascending: true });

      if (error || !data || data.length === 0) {
        setStations(getLocalBrtStations());
      } else {
        setStations(data);
      }
      await loadInteractions();
    } catch (err) {
      setStations(getLocalBrtStations());
    } finally {
      setLoading(false);
    }
  }, [loadInteractions]);

  useEffect(() => {
    if (hasAccess) {
      loadStations();
    }
  }, [hasAccess, loadStations]);

  // Aggregate all individual lines
  const totalLines = useMemo(() => {
    const allRoutes: BrtRoute[] = [];
    stations.forEach(s => {
      if (s.routes && Array.isArray(s.routes)) {
        allRoutes.push(...s.routes);
      }
    });
    return allRoutes;
  }, [stations]);

  // Real-time filtered stations and routes
  const filteredStations = useMemo(() => {
    let results = stations;

    if (selectedStation && selectedStation !== "all") {
      results = results.filter(s => s.name === selectedStation);
    }

    if (destinationQuery.trim() !== "") {
      return results.map(station => {
        const routesArr = Array.isArray(station.routes) ? station.routes : [];
        const matchingRoutes = routesArr.filter(r =>
          r.destination.toLowerCase().includes(destinationQuery.toLowerCase()) ||
          (r.via && r.via.toLowerCase().includes(destinationQuery.toLowerCase()))
        );
        return {
          ...station,
          routes: matchingRoutes
        };
      }).filter(station => station.routes.length > 0);
    }

    return results;
  }, [destinationQuery, selectedStation, stations]);

  // Like / Dislike voting
  const voteOnRoute = async (stationName: string, destination: string, type: "like" | "dislike") => {
    if (!user || !supabase) return false;

    try {
      const existingVote = interactions.find(
        i =>
          i.user_id === user.id &&
          i.station_name === stationName &&
          i.route_destination === destination &&
          (i.interaction_type === "like" || i.interaction_type === "dislike")
      );

      if (existingVote) {
        if (existingVote.interaction_type === type) {
          const { error } = await supabase
            .from("route_interactions")
            .delete()
            .eq("id", existingVote.id);

          if (!error) {
            setInteractions(prev => prev.filter(i => i.id !== existingVote.id));
          }
        } else {
          const { error } = await supabase
            .from("route_interactions")
            .update({ interaction_type: type })
            .eq("id", existingVote.id);

          if (!error) {
            setInteractions(prev =>
              prev.map(i => (i.id === existingVote.id ? { ...i, interaction_type: type } : i))
            );
          }
        }
      } else {
        const payload = {
          user_id: user.id,
          station_name: stationName,
          route_destination: destination,
          interaction_type: type
        };

        const { data, error } = await supabase
          .from("route_interactions")
          .insert([payload])
          .select();

        if (!error && data && data.length > 0) {
          setInteractions(prev => [...prev, data[0] as RouteInteraction]);
        }
      }
      return true;
    } catch (err) {
      console.error("Failed to submit vote:", err);
      return false;
    }
  };

  // Get vote counts for a route
  const getRouteVotes = useCallback((stationName: string, destination: string): VoteStats => {
    const routeInteractions = interactions.filter(
      i => i.station_name === stationName && i.route_destination === destination
    );

    const likes = routeInteractions.filter(i => i.interaction_type === "like").length;
    const dislikes = routeInteractions.filter(i => i.interaction_type === "dislike").length;

    const foundVote = user
      ? routeInteractions.find(i => i.user_id === user.id && (i.interaction_type === "like" || i.interaction_type === "dislike"))?.interaction_type
      : undefined;
    const userVote = (foundVote === "like" || foundVote === "dislike") ? foundVote : null;

    return { likes, dislikes, userVote };
  }, [interactions, user]);

  return {
    stations,
    loading,
    totalLines,
    filteredStations,
    selectedStation,
    setSelectedStation,
    destinationQuery,
    setDestinationQuery,
    voteOnRoute,
    getRouteVotes,
    setInteractions,
  };
}
