"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PhoneEntry, TelecomCodeEntry, MainTab, UseDirectoryDataReturn } from "../types";
import { DEFAULT_PHONE_SEED, COMPANY_META } from "../constants";
import { normalizeArabic, copyToClipboard } from "../utils";

export function useDirectoryData(): UseDirectoryDataReturn {
  const [entries, setEntries] = useState<PhoneEntry[]>(DEFAULT_PHONE_SEED);
  const [codes, setCodes] = useState<TelecomCodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active view section (phones vs telecom codes)
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("phones");

  // Public Telecom Codes UI State
  const [activeCompany, setActiveCompany] = useState<string>("vodafone");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  // Recent searches with localStorage persistence
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("recent_phone_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch Data from Supabase
  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: phonesData } = await supabase
          .from("phone_directory")
          .select("*")
          .order("name", { ascending: true });

        if (phonesData && phonesData.length > 0) {
          setEntries(phonesData);
        }

        const { data: codesData } = await supabase.from("telecom_codes").select("*");
        if (codesData && codesData.length > 0) {
          setCodes(codesData);
        }
      } catch (err) {
        console.error("Error fetching directory data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle saving recent search
  const handleSaveSearch = useCallback((queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 6);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("recent_phone_searches", JSON.stringify(updated));
        } catch {
          // ignore storage error
        }
      }
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("recent_phone_searches");
      } catch {
        // ignore storage error
      }
    }
  }, []);

  // Distinct specialties extraction
  const specialties = useMemo(() => {
    const specs = entries.map((e) => e.specialty?.trim()).filter(Boolean);
    return Array.from(new Set(specs));
  }, [entries]);

  // Specialty Icons map
  const specialtyIcons = useMemo(() => {
    const map: Record<string, string> = {};
    entries.forEach((e) => {
      if (e.specialty && e.icon && !map[e.specialty]) {
        map[e.specialty] = e.icon;
      }
    });
    return map;
  }, [entries]);

  // Section Icons map for telecom
  const sectionIcons = useMemo(() => {
    const map: Record<string, string> = {};
    codes.forEach((c) => {
      if (c.section_name && c.icon && !map[c.section_name]) {
        map[c.section_name] = c.icon;
      }
    });
    return map;
  }, [codes]);

  // Auto-complete suggestions
  const searchSuggestions = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (!q) return [];
    return entries
      .filter((entry) => {
        const searchable = normalizeArabic(
          `${entry.name} ${entry.specialty || ""} ${entry.phone_number} ${entry.description || ""}`
        );
        return searchable.includes(q);
      })
      .slice(0, 5);
  }, [entries, searchQuery]);

  // Filtered phone entries
  const filteredEntries = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    let result = entries;

    if (selectedSpecialty !== "all") {
      if (selectedSpecialty === "other") {
        result = entries.filter((e) => !e.specialty || e.specialty.trim() === "");
      } else {
        result = entries.filter((e) => e.specialty === selectedSpecialty);
      }
    }

    if (q) {
      result = result.filter((entry) => {
        const searchable = normalizeArabic(
          `${entry.name} ${entry.specialty || ""} ${entry.phone_number} ${entry.description || ""}`
        );
        return searchable.includes(q);
      });
    }

    return result;
  }, [entries, searchQuery, selectedSpecialty]);

  const slicedEntries = useMemo(() => {
    return filteredEntries.slice(0, visibleCount);
  }, [filteredEntries, visibleCount]);

  // Telecom codes for active company
  const activeCompanyCodes = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    const companyCodes = codes.filter((c) => c.company === activeCompany);
    if (!q) return companyCodes;
    return companyCodes.filter((c) => {
      const searchable = normalizeArabic(
        `${c.title} ${c.code} ${c.section_name} ${COMPANY_META[c.company]?.label || ""}`
      );
      return searchable.includes(q);
    });
  }, [codes, activeCompany, searchQuery]);

  // Group codes by section_name
  const groupedCodes: Record<string, TelecomCodeEntry[]> = useMemo(() => {
    const grouped: Record<string, TelecomCodeEntry[]> = {};
    activeCompanyCodes.forEach((code) => {
      if (!grouped[code.section_name]) {
        grouped[code.section_name] = [];
      }
      grouped[code.section_name].push(code);
    });
    return grouped;
  }, [activeCompanyCodes]);

  const toggleSection = useCallback((sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  }, []);

  const handleCopyCode = useCallback(async (code: string, id: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  return {
    entries,
    codes,
    loading,
    searchQuery,
    setSearchQuery,
    isFocused,
    setIsFocused,
    selectedSpecialty,
    setSelectedSpecialty,
    visibleCount,
    setVisibleCount,
    copiedId,
    activeMainTab,
    setActiveMainTab,
    activeCompany,
    setActiveCompany,
    expandedSections,
    codeInputs,
    setCodeInputs,
    recentSearches,
    specialties,
    specialtyIcons,
    sectionIcons,
    searchSuggestions,
    filteredEntries,
    slicedEntries,
    groupedCodes,
    toggleSection,
    handleCopyCode,
    handleSaveSearch,
    clearRecentSearches,
  };
}
