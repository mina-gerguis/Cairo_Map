import { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Port, PortFilter, CategoryCounts } from "../types";
import { DEFAULT_PORTS } from "../constants";
import { getLocalPorts, normalizeArabic } from "../utils";

export function usePortsData(user: User | null, hasAccess: boolean) {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<PortFilter>("all");
  const [expandedPort, setExpandedPort] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load Ports from Supabase with fallback to local defaults
  const loadPorts = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setPorts(getLocalPorts());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("ports")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setPorts(getLocalPorts());
      } else {
        const loadedData = (data || []).map((dbItem: Port) => {
          const localMatch = DEFAULT_PORTS.find(
            (lp) => normalizeArabic(lp.name) === normalizeArabic(dbItem.name)
          );
          return {
            ...localMatch,
            ...dbItem,
            berths_count: dbItem.berths_count || localMatch?.berths_count || "أرصفة متعددة الأغراض",
            connections: Array.isArray(dbItem.connections)
              ? dbItem.connections
              : localMatch?.connections || [],
            operator: dbItem.operator || localMatch?.operator || "هيئة الموانئ البحرية",
            status: dbItem.status || localMatch?.status || "تشغيل فعلي",
          };
        });

        const dbNames = new Set((data || []).map((d: Port) => normalizeArabic(d.name)));
        const missingLocals = DEFAULT_PORTS.filter(
          (lp) => !dbNames.has(normalizeArabic(lp.name))
        );

        setPorts([...loadedData, ...missingLocals]);
      }
    } catch {
      setPorts(getLocalPorts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadPorts();
    }
  }, [hasAccess, loadPorts]);

  const allPortsList = ports.length > 0 ? ports : DEFAULT_PORTS;

  // Real-time filtered ports based on query and filter tab
  const filteredPorts = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    return allPortsList.filter((port) => {
      const matchSearch =
        !q ||
        normalizeArabic(port.name).includes(q) ||
        normalizeArabic(port.governorate).includes(q) ||
        normalizeArabic(port.sea).includes(q) ||
        normalizeArabic(port.type).includes(q) ||
        normalizeArabic(port.description).includes(q);

      if (!matchSearch) return false;

      if (selectedFilter === "mediterranean") {
        return port.sea.includes("المتوسط");
      } else if (selectedFilter === "redsea") {
        return (
          port.sea.includes("الأحمر") ||
          port.sea.includes("السويس") ||
          port.sea.includes("العقبة")
        );
      } else if (selectedFilter === "commercial") {
        return (
          port.type.includes("تجاري") ||
          port.type.includes("حاويات") ||
          port.type.includes("صناعي")
        );
      } else if (selectedFilter === "passenger") {
        return port.type.includes("ركاب") || port.type.includes("سياحي");
      }

      return true;
    });
  }, [allPortsList, searchQuery, selectedFilter]);

  // Global search autocomplete results
  const searchResults = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (!q) return [];
    return allPortsList.filter(
      (p) =>
        normalizeArabic(p.name).includes(q) ||
        normalizeArabic(p.governorate).includes(q) ||
        normalizeArabic(p.sea).includes(q)
    );
  }, [allPortsList, searchQuery]);

  // Category counts for filter tabs & slider badges
  const counts: CategoryCounts = useMemo(() => {
    return {
      all: allPortsList.length,
      mediterranean: allPortsList.filter((p) => p.sea.includes("المتوسط")).length,
      redsea: allPortsList.filter(
        (p) =>
          p.sea.includes("الأحمر") ||
          p.sea.includes("السويس") ||
          p.sea.includes("العقبة")
      ).length,
      commercial: allPortsList.filter(
        (p) =>
          p.type.includes("تجاري") ||
          p.type.includes("حاويات") ||
          p.type.includes("صناعي")
      ).length,
      passenger: allPortsList.filter(
        (p) => p.type.includes("ركاب") || p.type.includes("سياحي")
      ).length,
    };
  }, [allPortsList]);

  // Toggle card accordion
  const toggleExpand = useCallback((portName: string) => {
    setExpandedPort((prev) => (prev === portName ? null : portName));
  }, []);

  // Handle selecting a port from autocomplete dropdown
  const handleSelectSearchPort = useCallback((port: Port) => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    setExpandedPort(port.name);

    setTimeout(() => {
      const el = document.getElementById(`port-card-${encodeURIComponent(port.name)}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  return {
    ports: allPortsList,
    filteredPorts,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    expandedPort,
    setExpandedPort,
    toggleExpand,
    isDropdownOpen,
    setIsDropdownOpen,
    searchResults,
    handleSelectSearchPort,
    counts,
    refreshPorts: loadPorts,
  };
}
