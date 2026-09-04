"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import styles from "./directions.module.css";

interface RouteLeg {
  title: string;
  vehicleType?: string;
  cost?: number;
  duration?: string;
  steps: string[];
}

interface RouteEntry {
  id: string;
  from_location: string;
  to_location: string;
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[];
  legs?: RouteLeg[];
  tips?: string;
  from_aliases?: string;
  to_aliases?: string;
  map_link?: string;
}

interface DbTransitRoute {
  id: string;
  from_location: string;
  to_location: string;
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  type_name: string;
  icon: string;
  cost: number;
  duration: string;
  steps: string[] | string;
  legs?: RouteLeg[] | string;
  tips?: string | null;
  from_aliases?: string | null;
  to_aliases?: string | null;
  map_link?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface FormLeg {
  title: string;
  vehicleType: string;
  cost: string;
  duration: string;
  steps: string[];
}

interface FormOption {
  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
  type_name: string;
  icon: string;
  cost: string;
  duration: string;
  durationMinutes: number | "";
  steps: string[];
  legs: FormLeg[];
  tips: string;
  map_link: string;
}

interface GroupedRoute {
  from_location: string;
  to_location: string;
  from_aliases?: string;
  to_aliases?: string;
  options: Array<{
    id?: string;
    type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";
    type_name: string;
    icon: string;
    cost: number;
    duration: string;
    steps: string[];
    legs?: RouteLeg[];
    tips?: string;
    map_link?: string;
  }>;
}

function getErrorMessage(err: unknown): string {
  if (!err) return "حدث خطأ غير معروف";
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    try {
      return JSON.stringify(err);
    } catch {
      return "خطأ في قراءة تفاصيل الاستجابة";
    }
  }
  return String(err);
}

function formatMinutesToArabic(mins: number): string {
  if (mins <= 0) return "0 دقيقة";
  if (mins === 1) return "دقيقة واحدة";
  if (mins === 2) return "دقيقتان";

  if (mins < 60) {
    if (mins >= 3 && mins <= 10) return `${mins} دقائق`;
    return `${mins} دقيقة`;
  }

  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;

  let hoursText = "";
  if (hours === 1) {
    hoursText = "ساعة";
  } else if (hours === 2) {
    hoursText = "ساعتان";
  } else if (hours >= 3 && hours <= 10) {
    hoursText = `${hours} ساعات`;
  } else {
    hoursText = `${hours} ساعة`;
  }

  if (remaining === 0) {
    return hoursText;
  }

  let remainingText = "";
  if (remaining === 1) {
    remainingText = "ودقيقة";
  } else if (remaining === 2) {
    remainingText = "ودقيقتان";
  } else if (remaining >= 3 && remaining <= 10) {
    remainingText = `و ${remaining} دقائق`;
  } else {
    remainingText = `و ${remaining} دقيقة`;
  }

  return `${hoursText} ${remainingText}`;
}

function parseMinutesFromArabic(text: string): number | null {
  if (!text) return null;
  const normalized = text.trim();

  if (normalized === "ساعة") return 60;
  if (normalized === "ساعتان" || normalized === "ساعتين") return 120;

  const hourMatch = normalized.match(/(\d+)\s+ساع/);
  const minMatch = normalized.match(/(\d+)\s+دقيق/);

  let totalMins = 0;
  let found = false;

  if (hourMatch) {
    totalMins += parseInt(hourMatch[1]) * 60;
    found = true;
  } else if (normalized.includes("ساعة") || normalized.includes("ساعه")) {
    totalMins += 60;
    found = true;
  } else if (normalized.includes("ساعتان") || normalized.includes("ساعتين")) {
    totalMins += 120;
    found = true;
  }

  if (minMatch) {
    totalMins += parseInt(minMatch[1]);
    found = true;
  } else if (normalized.includes("ودقيقة") || normalized.includes("ودقيقه")) {
    totalMins += 1;
    found = true;
  } else if (normalized.includes("ودقيقتان") || normalized.includes("ودقيقتين")) {
    totalMins += 2;
    found = true;
  }

  if (!hourMatch && !normalized.includes("ساعة") && !normalized.includes("ساعه") && !normalized.includes("ساعتين") && !normalized.includes("ساعتان")) {
    const rawNumberMatch = normalized.match(/^(\d+)/);
    if (rawNumberMatch) {
      return parseInt(rawNumberMatch[1]);
    }
  }

  return found ? totalMins : null;
}

export default function AdminDirectionsPage({ isSubComponent = false }: { isSubComponent?: boolean }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(isSubComponent ? true : false);
  const [loading, setLoading] = useState(isSubComponent ? false : true);
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [dbMissing, setDbMissing] = useState(false);

  // Search & Filter & Tab States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");

  // Accordion State: Track which routes are expanded (key: from|||to)
  const [expandedRouteKeys, setExpandedRouteKeys] = useState<Record<string, boolean>>({});

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<{ from_location: string; to_location: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromAliases, setFromAliases] = useState("");
  const [toAliases, setToAliases] = useState("");

  const defaultLeg = (num: number = 1): FormLeg => ({
    title: `المرحلة ${num === 1 ? "الأولى" : num === 2 ? "الثانية" : num === 3 ? "الثالثة" : `${num}`}: تفاصيل المرحلة`,
    vehicleType: "ميكروباص",
    cost: "",
    duration: "",
    steps: ["اركب...", "اوصل...", "انزل..."]
  });

  const defaultOption = (): FormOption => ({
    type: "microbus",
    type_name: "ميكروباص مباشر",
    icon: "bx bx-bus",
    cost: "0",
    duration: "",
    durationMinutes: "",
    steps: [""],
    legs: [defaultLeg(1)],
    tips: "",
    map_link: ""
  });

  const [options, setOptions] = useState<FormOption[]>([defaultOption()]);

  const resetForm = () => {
    setFromLocation("");
    setToLocation("");
    setFromAliases("");
    setToAliases("");
    setOptions([defaultOption()]);
    setEditingConnection(null);
    setError("");
  };

  const checkAdminAndFetch = async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await fetchRoutes();
    } catch (err) {
      console.error("Verification error:", err);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("transit_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "P0001" || error.message.includes("does not exist")) {
          setDbMissing(true);
          loadFromLocalStorage();
        } else {
          throw error;
        }
      } else {
        setDbMissing(false);
        const formatted = ((data || []) as unknown as DbTransitRoute[]).map((item) => {
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

          return {
            id: item.id,
            from_location: item.from_location,
            to_location: item.to_location,
            type: item.type,
            type_name: item.type_name,
            icon: item.icon,
            cost: item.cost,
            duration: item.duration,
            steps: Array.isArray(stepsArr) ? stepsArr : [],
            legs: Array.isArray(legsArr) ? legsArr : undefined,
            tips: item.tips || undefined,
            from_aliases: item.from_aliases || undefined,
            to_aliases: item.to_aliases || undefined,
            map_link: item.map_link || undefined
          };
        });
        setRoutes(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setError("حدث خطأ أثناء جلب المسارات من قاعدة البيانات.");
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("dftry_admin_local_routes");
    if (saved) {
      try {
        setRoutes(JSON.parse(saved));
      } catch {
        setRoutes([]);
      }
    }
  };

  const saveToLocalStorage = (newRoutes: RouteEntry[]) => {
    localStorage.setItem("dftry_admin_local_routes", JSON.stringify(newRoutes));
    setRoutes(newRoutes);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const init = async () => {
      await checkAdminAndFetch();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  // Group routes list for UI display
  const groupedRoutesList = useMemo(() => {
    const grouped: Record<string, GroupedRoute> = {};
    (routes || []).forEach(r => {
      const key = `${(r.from_location || "").trim()}|||${(r.to_location || "").trim()}`;
      if (!grouped[key]) {
        grouped[key] = {
          from_location: r.from_location,
          to_location: r.to_location,
          from_aliases: r.from_aliases,
          to_aliases: r.to_aliases,
          options: []
        };
      }
      grouped[key].options.push({
        id: r.id,
        type: r.type,
        type_name: r.type_name,
        icon: r.icon,
        cost: r.cost,
        duration: r.duration,
        steps: Array.isArray(r.steps) ? r.steps : [],
        legs: Array.isArray(r.legs) ? r.legs : undefined,
        tips: r.tips,
        map_link: r.map_link
      });
    });
    return Object.values(grouped);
  }, [routes]);

  // Compute Unique Origin Locations Tabs Dynamically
  const uniqueOrigins = useMemo(() => {
    const originsMap: Record<string, number> = {};
    (groupedRoutesList || []).forEach(r => {
      const origin = (r.from_location || "").trim();
      if (origin) {
        originsMap[origin] = (originsMap[origin] || 0) + 1;
      }
    });
    return Object.entries(originsMap).map(([name, count]) => ({ name, count }));
  }, [groupedRoutesList]);

  // Filtered Grouped Routes (Filter by Search, Vehicle Type, AND Origin Location Tab)
  const filteredGroupedRoutes = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return groupedRoutesList.filter(group => {
      // 1. Origin Location Tab Filter
      if (selectedOrigin !== "all" && group.from_location.trim().toLowerCase() !== selectedOrigin.trim().toLowerCase()) {
        return false;
      }

      // 2. Search Query
      const matchesSearch = !term || (
        group.from_location.toLowerCase().includes(term) ||
        group.to_location.toLowerCase().includes(term) ||
        (group.from_aliases && group.from_aliases.toLowerCase().includes(term)) ||
        (group.to_aliases && group.to_aliases.toLowerCase().includes(term)) ||
        group.options.some(opt => opt.type_name.toLowerCase().includes(term))
      );

      // 3. Type Filter
      const matchesType = filterType === "all" || group.options.some(opt => opt.type === filterType);

      return matchesSearch && matchesType;
    });
  }, [groupedRoutesList, searchQuery, filterType, selectedOrigin]);

  // Key Statistics
  const totalConnectionsCount = groupedRoutesList.length;
  const totalOptionsCount = routes.length;
  const totalMultiLegCount = routes.filter(r => r.type === "multi" || (r.legs && r.legs.length > 1)).length;
  const avgCost = routes.length > 0 ? Math.round(routes.reduce((acc, r) => acc + (r.cost || 0), 0) / routes.length) : 0;

  // Accordion Toggle Helpers
  const toggleRouteExpand = (key: string) => {
    setExpandedRouteKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAllRoutes = () => {
    const allKeys: Record<string, boolean> = {};
    filteredGroupedRoutes.forEach(r => {
      const key = `${r.from_location.trim()}|||${r.to_location.trim()}`;
      allKeys[key] = true;
    });
    setExpandedRouteKeys(allKeys);
  };

  const collapseAllRoutes = () => {
    setExpandedRouteKeys({});
  };

  // Options Helper Functions
  const updateOption = (index: number, field: keyof FormOption, value: FormOption[keyof FormOption]) => {
    setOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateOptionFields = (index: number, updates: Partial<FormOption>) => {
    setOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const addOptionField = () => {
    setOptions([...options, defaultOption()]);
  };

  const removeOptionField = (index: number) => {
    if (options.length === 1) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  // Leg Management Helpers
  const addLegToOption = (optIdx: number) => {
    const updated = [...options];
    const newLegNum = (updated[optIdx]?.legs || []).length + 1;
    updated[optIdx].legs.push(defaultLeg(newLegNum));
    setOptions(updated);
  };

  const removeLegFromOption = (optIdx: number, legIdx: number) => {
    const updated = [...options];
    if ((updated[optIdx]?.legs || []).length === 1) return;
    updated[optIdx].legs = updated[optIdx].legs.filter((_, idx) => idx !== legIdx);
    setOptions(updated);
  };

  const updateLegField = (optIdx: number, legIdx: number, field: keyof FormLeg, val: string) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx]) {
      legsCopy[legIdx] = { ...legsCopy[legIdx], [field]: val };
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const updateLegStep = (optIdx: number, legIdx: number, stepIdx: number, val: string) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx]) {
      const stepsCopy = [...(legsCopy[legIdx].steps || [])];
      stepsCopy[stepIdx] = val;
      legsCopy[legIdx].steps = stepsCopy;
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const addLegStep = (optIdx: number, legIdx: number) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx]) {
      legsCopy[legIdx].steps = [...(legsCopy[legIdx].steps || []), ""];
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const removeLegStep = (optIdx: number, legIdx: number, stepIdx: number) => {
    const updated = [...options];
    const legsCopy = [...(updated[optIdx]?.legs || [])];
    if (legsCopy[legIdx] && (legsCopy[legIdx].steps || []).length > 1) {
      legsCopy[legIdx].steps = legsCopy[legIdx].steps.filter((_, idx) => idx !== stepIdx);
      updated[optIdx].legs = legsCopy;
      setOptions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) {
      setError("يرجى إدخال نقطة الانطلاق والوصول.");
      return;
    }

    // Auto-calculate option duration and cost from legs
    const computedOptions: FormOption[] = options.map(opt => {
      let totalCost = 0;
      let totalMins = 0;
      let durationStr = opt.duration;

      (opt.legs || []).forEach(leg => {
        const legCost = parseInt(leg.cost) || 0;
        totalCost += legCost;

        if (leg.duration) {
          const mins = parseMinutesFromArabic(leg.duration);
          if (mins !== null) {
            totalMins += mins;
          }
        }
      });

      if (totalMins > 0) {
        durationStr = formatMinutesToArabic(totalMins);
      } else if (opt.legs && opt.legs.length > 0 && opt.legs[0].duration) {
        // Fallback to the first leg's duration if parsing failed but it has a value
        durationStr = opt.legs[0].duration;
      }

      return {
        ...opt,
        cost: totalCost.toString(),
        duration: durationStr,
        durationMinutes: totalMins > 0 ? totalMins : ""
      };
    });

    // Validate all options & legs
    for (let i = 0; i < (computedOptions || []).length; i++) {
      const opt = computedOptions[i];
      if (!opt.type_name.trim() || !opt.duration.trim()) {
        setError(`يرجى إكمال بيانات وسيلة المواصلات رقم ${i + 1}`);
        return;
      }
      if (!opt.legs || opt.legs.length === 0) {
        setError(`يجب إضافة مرحلة سفر واحدة على الأقل لوسيلة المواصلات رقم ${i + 1}`);
        return;
      }
      for (let j = 0; j < opt.legs.length; j++) {
        const leg = opt.legs[j];
        const filteredLegSteps = (leg.steps || []).map(s => s.trim()).filter(Boolean);
        if (filteredLegSteps.length === 0) {
          setError(`يجب إضافة خطوة واحدة على الأقل للمرحلة رقم ${j + 1} في الوسيلة ${i + 1}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // Update form state with computed options so UI shows calculated values
    setOptions(computedOptions);

    // Prepare payloads
    const payloads = (computedOptions || []).map(opt => {
      const formattedLegs = (opt.legs || []).map((leg, lIdx) => ({
        title: leg.title.trim() || `المرحلة ${lIdx + 1}`,
        vehicleType: leg.vehicleType.trim() || undefined,
        cost: leg.cost.trim() ? parseInt(leg.cost.trim()) : undefined,
        duration: leg.duration.trim() || undefined,
        steps: (leg.steps || []).map(s => s.trim()).filter(Boolean)
      }));

      // Flatten all leg steps for backward compatibility in flat `steps`
      const allFlatSteps: string[] = [];
      formattedLegs.forEach(leg => {
        (leg.steps || []).forEach(s => allFlatSteps.push(s));
      });

      return {
        from_location: fromLocation.trim(),
        to_location: toLocation.trim(),
        type: opt.type,
        type_name: opt.type_name.trim(),
        icon: opt.icon.trim() || "bx bx-bus",
        cost: parseInt(opt.cost) || 0,
        duration: opt.duration.trim(),
        steps: allFlatSteps,
        legs: formattedLegs,
        tips: opt.tips.trim() || undefined,
        from_aliases: fromAliases.trim() || undefined,
        to_aliases: toAliases.trim() || undefined,
        map_link: opt.map_link.trim() || undefined
      };
    });

    try {
      if (dbMissing) {
        // LocalStorage Mode
        let updatedRoutes = [...routes];

        // If editing, delete old connection first
        if (editingConnection) {
          updatedRoutes = updatedRoutes.filter(
            r => !(r.from_location.trim().toLowerCase() === editingConnection.from_location.trim().toLowerCase() &&
                   r.to_location.trim().toLowerCase() === editingConnection.to_location.trim().toLowerCase())
          );
        }

        const newLocalEntries = payloads.map((payload, idx) => ({
          id: `local-${Date.now()}-${idx}`,
          ...payload
        }));

        updatedRoutes = [...newLocalEntries, ...updatedRoutes];
        saveToLocalStorage(updatedRoutes);
        setSuccess(editingConnection ? "تم تعديل الطريق محلياً بنجاح!" : "تم إضافة الطريق محلياً بنجاح!");
        resetForm();
        setShowAddForm(false);
      } else {
        // Supabase Mode
        if (!supabase) {
          throw new Error("قاعدة البيانات غير متوفرة");
        }
        // If editing, delete old rows first
        if (editingConnection) {
          const { error: deleteError } = await supabase
            .from("transit_routes")
            .delete()
            .eq("from_location", editingConnection.from_location)
            .eq("to_location", editingConnection.to_location);

          if (deleteError) throw deleteError;
        }

        // Insert new payloads
        let { error: insertError } = await supabase
          .from("transit_routes")
          .insert(payloads);

        // Auto fallback if legs column does not exist in Supabase schema cache
        if (insertError && (
          insertError.message?.includes("legs") ||
          insertError.message?.includes("schema cache")
        )) {
          console.warn("legs column missing in Supabase, retrying insert without legs payload field...");
          const fallbackPayloads = payloads.map(p => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { legs, ...rest } = p;
            return rest;
          });
          const retryRes = await supabase
            .from("transit_routes")
            .insert(fallbackPayloads);

          insertError = retryRes.error;
          setDbMissing(true);
        }

        if (insertError) throw insertError;

        setSuccess(editingConnection ? "تم تحديث الطريق بجميع وسائله ومراحله بنجاح!" : "تم إضافة الطريق بجميع وسائله ومراحله بنجاح!");
        await fetchRoutes();
        resetForm();
        setShowAddForm(false);
      }
    } catch (err) {
      const errMsg = getErrorMessage(err);
      console.error("Save error:", err);
      setError("حدث خطأ أثناء حفظ البيانات: " + errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (conn: GroupedRoute) => {
    setEditingConnection({ from_location: conn.from_location, to_location: conn.to_location });
    setFromLocation(conn.from_location);
    setToLocation(conn.to_location);
    setFromAliases(conn.from_aliases || "");
    setToAliases(conn.to_aliases || "");

    // Map options to form structure
    const mapped: FormOption[] = (conn.options || []).map(opt => {
      const parsedMins = parseMinutesFromArabic(opt.duration);

      let formLegs: FormLeg[] = [];
      if (opt.legs && Array.isArray(opt.legs) && opt.legs.length > 0) {
        formLegs = opt.legs.map(leg => ({
          title: leg.title || "المرحلة",
          vehicleType: leg.vehicleType || "ميكروباص",
          cost: leg.cost !== undefined ? leg.cost.toString() : "",
          duration: leg.duration || "",
          steps: leg.steps && Array.isArray(leg.steps) && leg.steps.length > 0 ? leg.steps : [""]
        }));
      } else {
        formLegs = [
          {
            title: "المرحلة الأولى: خطوات المسار",
            vehicleType: "ميكروباص",
            cost: opt.cost.toString(),
            duration: opt.duration,
            steps: opt.steps && Array.isArray(opt.steps) && opt.steps.length > 0 ? opt.steps : ["اركب...", "اوصل...", "انزل..."]
          }
        ];
      }

      return {
        type: opt.type,
        type_name: opt.type_name,
        icon: opt.icon,
        cost: opt.cost.toString(),
        duration: opt.duration,
        durationMinutes: parsedMins !== null ? parsedMins : "",
        steps: Array.isArray(opt.steps) ? opt.steps : [""],
        legs: formLegs,
        tips: opt.tips || "",
        map_link: opt.map_link || ""
      };
    });
    setOptions(mapped);

    setShowAddForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (fromVal: string, toVal: string) => {
    if (!confirm(`هل أنت متأكد من حذف طريق (من ${fromVal} إلى ${toVal}) بجميع وسائله؟`)) return;

    setError("");
    setSuccess("");

    try {
      if (dbMissing) {
        const updated = (routes || []).filter(
          r => !(r.from_location.trim().toLowerCase() === fromVal.trim().toLowerCase() &&
                 r.to_location.trim().toLowerCase() === toVal.trim().toLowerCase())
        );
        saveToLocalStorage(updated);
        setSuccess("تم حذف الطريق محلياً.");
      } else {
        if (!supabase) {
          throw new Error("قاعدة البيانات غير متوفرة");
        }
        const { error: deleteError } = await supabase
          .from("transit_routes")
          .delete()
          .eq("from_location", fromVal)
          .eq("to_location", toVal);

        if (deleteError) throw deleteError;
        setSuccess("تم حذف الطريق وجميع وسائله بنجاح من قاعدة البيانات.");
        await fetchRoutes();
      }
    } catch (err) {
      const errMsg = getErrorMessage(err);
      console.error("Delete error:", err);
      setError("فشل حذف الطريق: " + errMsg);
    }
  };

  if (!isSubComponent && (loading || authLoading)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" }}>
        <i className="bx bx-loader-alt" style={{ fontSize: "2.5rem", color: "#3b82f6", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#94a3b8", fontWeight: "600" }}>جاري تحميل لوحة إدارة المسارات والطرق...</p>
      </div>
    );
  }

  if (!isSubComponent && !isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2 style={{ marginTop: "16px", color: "#f8fafc" }}>غير مصرح بالدخول</h2>
        <p style={{ color: "#94a3b8" }}>عذراً، هذه الصفحة مخصصة لمديري النظام فقط.</p>
        <Link href="/" className={styles.primaryActionBtn} style={{ display: "inline-flex", marginTop: "20px", textDecoration: "none" }}>
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.directionsContainer}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon}>
              <i className="bx bx-compass" />
            </div>
            <div>
              <h1 className={styles.pageTitle}>إدارة خطوط ومسارات المواصلات (ازاي اروح)</h1>
              <p className={styles.pageSubtitle}>إضافة وتعديل خطوط مواصلات الانتقال بين المدن، المراحل، والأجرة والخطوات التفصيلية.</p>
            </div>
          </div>
        </div>

        <button
          className={showAddForm ? styles.secondaryActionBtn : styles.primaryActionBtn}
          onClick={() => {
            if (showAddForm) {
              resetForm();
              setShowAddForm(false);
            } else {
              setShowAddForm(true);
            }
          }}
        >
          <i className={`bx ${showAddForm ? "bx-x" : "bx-plus-circle"}`} style={{ fontSize: "1.2rem" }} />
          <span>{showAddForm ? "إلغاء الإضافة" : "+ إضافة طريق جديد"}</span>
        </button>
      </div>

      {/* ── Statistics Summary Bar ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <i className="bx bx-map-pin" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalConnectionsCount}</span>
            <span className={styles.statLabel}>إجمالي الوصلات والطرق</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <i className="bx bx-bus" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalOptionsCount}</span>
            <span className={styles.statLabel}>وسائل المواصلات المسجلة</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
            <i className="bx bx-git-repo-forked" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalMultiLegCount}</span>
            <span className={styles.statLabel}>مسارات متعددة المراحل</span>
          </div>
        </div>
      </div>

      {/* ── SQL Setup Banner (If column/table missing) ── */}
      {dbMissing && (
        <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "14px", padding: "18px 22px" }}>
          <h4 style={{ color: "#fbbf24", margin: "0 0 8px", fontSize: "1.05rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="bx bx-error" style={{ fontSize: "1.3rem" }} />
            <span>⚠️ تنبيه: جدول قاعدة البيانات غير منشأ أو ينقصه العمود `legs`</span>
          </h4>
          <p style={{ fontSize: "0.86rem", color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
            لتفعيل تقسيم المراحل وتخفيضات التذاكر الدائمة لجميع المستخدمين، يرجى إضافة عمود `legs` أو إنشاء الجدول في Supabase عبر الأمر التالية:
          </p>
          <pre style={{ background: "rgba(0,0,0,0.4)", padding: "12px", borderRadius: "10px", fontSize: "0.78rem", overflowX: "auto", marginTop: "10px", direction: "ltr", textAlign: "left", color: "#a7f3d0", border: "1px solid rgba(255,255,255,0.06)" }}>
{`ALTER TABLE public.transit_routes ADD COLUMN IF NOT EXISTS legs JSONB DEFAULT '[]'::jsonb;`}
          </pre>
        </div>
      )}

      {/* ── Notifications ── */}
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: "14px 18px", borderRadius: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "14px 18px", borderRadius: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }} />
          <span>{success}</span>
        </div>
      )}

      {/* ── Add / Edit Form Modal/Drawer ── */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              <i className={`bx ${editingConnection ? "bx-edit-alt" : "bx-plus-circle"}`} style={{ color: "#3b82f6" }} />
              <span>{editingConnection ? "تعديل بيانات الطريق ومراحل المسار" : "إضافة طريق ومسارات مواصلات ومراحل جديدة"}</span>
            </h2>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
              style={{ padding: "6px 14px", fontSize: "0.82rem" }}
            >
              إلغاء
            </button>
          </div>

          {/* From & To inputs */}
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span>من (نقطة البداية) *</span>
              </label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="مثال: الزقازيق"
                value={fromLocation}
                onChange={e => setFromLocation(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span>إلى (الوجهة النهائية) *</span>
              </label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="مثال: أرض المعارض"
                value={toLocation}
                onChange={e => setToLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Aliases Inputs */}
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span>الأسماء والكلمات البديلة لنقطة البداية (مفصولة بفاصلة)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="مثال: موقف الأحرار، الاحرار، جامعة الزقازيق"
                value={fromAliases}
                onChange={e => setFromAliases(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span>الأسماء والكلمات البديلة للوجهة (مفصولة بفاصلة)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="مثال: معرض الكتاب، ارض المعارض، مركز المعارض"
                value={toAliases}
                onChange={e => setToAliases(e.target.value)}
              />
            </div>
          </div>

          {/* Options Sublist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                وسائل المواصلات المتاحة لهذا الطريق ({(options || []).length})
              </h3>
              <button
                type="button"
                className={styles.addOptionBtn}
                onClick={addOptionField}
              >
                <i className="bx bx-plus" />
                <span>إضافة وسيلة مواصلات أخرى</span>
              </button>
            </div>

            {(options || []).map((opt, optIdx) => (
              <div key={optIdx} className={styles.optionBox}>
                <div className={styles.optionHeader}>
                  <span className={styles.optionTag}>
                    <i className="bx bx-bus" />
                    <span>وسيلة المواصلات رقم {optIdx + 1}</span>
                  </span>
                  {(options || []).length > 1 && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeOptionField(optIdx)}
                    >
                      <i className="bx bx-trash" style={{ marginLeft: "4px" }} />
                      حذف الوسيلة
                    </button>
                  )}
                </div>

                {/* Type, Name, Icon Grid */}
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>نوع وسيلة المواصلات *</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <select
                        className={styles.input}
                        value={opt.type}
                        onChange={e => {
                          const newType = e.target.value as FormOption["type"];
                          let defaultName = opt.type_name;
                          let defaultIcon = opt.icon;
                          if (newType === "microbus") {
                            defaultIcon = "microbus";
                            defaultName = "ميكروباص";
                          } else if (newType === "bus") {
                            defaultIcon = "bus";
                            defaultName = "أتوبيس النقل العام";
                          } else if (newType === "car") {
                            defaultIcon = "car";
                            defaultName = "سيارة خاصة";
                          } else if (newType === "train") {
                            defaultIcon = "train";
                            defaultName = "القطار المباشر";
                          } else if (newType === "monorail") {
                            defaultIcon = "monorail";
                            defaultName = "قطار المونوريل";
                          } else if (newType === "metro") {
                            defaultIcon = "metro";
                            defaultName = "مترو الأنفاق";
                          } else if (newType === "plane") {
                            defaultIcon = "plane";
                            defaultName = "طائرة / طيران";
                          } else if (newType === "ship") {
                            defaultIcon = "ship";
                            defaultName = "سفينة / عبارة";
                          } else if (newType === "multi") {
                            defaultIcon = "transfer";
                            defaultName = "مواصلات متعددة";
                          }
                          updateOptionFields(optIdx, {
                            type: newType,
                            type_name: defaultName,
                            icon: defaultIcon
                          });
                        }}
                        style={{ flex: 1 }}
                      >
                        <option value="microbus">ميكروباص</option>
                        <option value="bus">أتوبيس</option>
                        <option value="car">عربية خاص (سيارة)</option>
                        <option value="train">قطار</option>
                        <option value="monorail">مونوريل</option>
                        <option value="metro">مترو</option>
                        <option value="plane">طائرة</option>
                        <option value="ship">سفينة</option>
                        <option value="multi">مواصلات متعددة</option>
                      </select>
                      <div className={styles.vehicleIcon}>
                        <img src={`/images/icons2d/${opt.icon}.png`} alt="" style={{ width: "80%", height: "auto" }} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>اسم وسيلة المواصلات المخصص *</label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      placeholder="مثال: ميكروباص مباشر"
                      value={opt.type_name}
                      onChange={e => updateOption(optIdx, "type_name", e.target.value)}
                    />
                  </div>
                </div>

                {/* Visual feedback of calculated totals */}
                <div style={{ display: "flex", gap: "16px", marginTop: "4px", marginBottom: "12px", padding: "8px 12px", backgroundColor: "rgba(30, 41, 59, 0.5)", border: "1px solid #334155", borderRadius: "6px", fontSize: "0.85rem" }}>
                  <span style={{ color: "#94a3b8" }}>
                    الإجمالي التلقائي للوسيلة:
                  </span>
                  <span style={{ color: "#34d399", fontWeight: "bold" }}>
                    💰 التكلفة: {(() => {
                      let totalCost = 0;
                      (opt.legs || []).forEach(leg => {
                        totalCost += parseInt(leg.cost) || 0;
                      });
                      return `${totalCost} ج.م`;
                    })()}
                  </span>
                  <span style={{ color: "#60a5fa", fontWeight: "bold" }}>
                    ⏱️ الوقت: {(() => {
                      let totalMins = 0;
                      (opt.legs || []).forEach(leg => {
                        if (leg.duration) {
                          const mins = parseMinutesFromArabic(leg.duration);
                          if (mins !== null) {
                            totalMins += mins;
                          }
                        }
                      });
                      return totalMins > 0 ? formatMinutesToArabic(totalMins) : (opt.legs && opt.legs.length > 0 && opt.legs[0].duration ? opt.legs[0].duration : "لم يحدد بعد");
                    })()}
                  </span>
                </div>

                {/* Map Link / Google Maps URL */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span>رابط بدء الرحلة ومسار خريطة Google </span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="https://www.google.com/maps/dir/..."
                    value={opt.map_link}
                    onChange={e => updateOption(optIdx, "map_link", e.target.value)}
                  />
                </div>

                {/* Stages / Legs Breakdown Editor */}
                <div className={styles.legsSection}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#38bdf8", display: "flex", alignItems: "center", gap: "6px" }}>
                      <i className="bx bx-git-repo-forked" />
                      <span>مراحل الرحلة والخطوات التفصيلية (المرحلة الأولى، الثانية...)</span>
                    </h4>
                    <button
                      type="button"
                      className={styles.secondaryActionBtn}
                      onClick={() => addLegToOption(optIdx)}
                      style={{ padding: "4px 12px", fontSize: "0.8rem", fontFamily:"var(--font-heading)" }}
                    >
                      + إضافة مرحلة جديدة
                    </button>
                  </div>

                  {(opt.legs || []).map((leg, legIdx) => (
                    <div key={legIdx} className={styles.legBox}>
                      <div className={styles.legHeader}>
                        <span className={styles.legTitle}>
                          <i className="bx bx-current-location" />
                          <span>المرحلة رقم {legIdx + 1}</span>
                        </span>
                        {(opt.legs || []).length > 1 && (
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => removeLegFromOption(optIdx, legIdx)}
                            style={{ padding: "3px 10px", fontSize: "0.75rem", fontFamily:"var(--font-heading)" }}
                          >
                           <i className="bx bx-trash" />
                          </button>
                        )}
                      </div>

                      {/* Leg Title, Cost, Duration */}
                      <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>عنوان المرحلة *</label>
                          <input
                            type="text"
                            required
                            className={styles.input}
                            placeholder="مثال: المرحلة الأولى: ميكروباص من الزقازيق للسلام"
                            value={leg.title}
                            onChange={e => updateLegField(optIdx, legIdx, "title", e.target.value)}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>أجرة هذه المرحلة (ج.م)</label>
                          <input
                            type="number"
                            min="0"
                            className={styles.input}
                            placeholder="20"
                            value={leg.cost}
                            onChange={e => updateLegField(optIdx, legIdx, "cost", e.target.value)}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>وقت هذه المرحلة</label>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="50 دقيقة"
                            value={leg.duration}
                            onChange={e => updateLegField(optIdx, legIdx, "duration", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Leg Sub-Steps */}
                      <div className={styles.inputGroup}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <label className={styles.label}>خطوات هذه المرحلة بالتفصيل *</label>
                          <button
                            type="button"
                            className={styles.secondaryActionBtn}
                            onClick={() => addLegStep(optIdx, legIdx)}
                            style={{ padding: "2px 10px", fontSize: "0.75rem" }}
                          >
                            + إضافة خطوة
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(leg.steps || []).map((stepVal, stepIdx) => (
                            <div key={stepIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", minWidth: "22px", textAlign: "center" }}>
                                {stepIdx + 1}.
                              </span>
                              <input
                                type="text"
                                required
                                className={styles.input}
                                placeholder="اكتب تفاصيل هذه الخطوة..."
                                value={stepVal}
                                onChange={e => updateLegStep(optIdx, legIdx, stepIdx, e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => removeLegStep(optIdx, legIdx, stepIdx)}
                                style={{ padding: "8px 12px" }}
                                disabled={(leg.steps || []).length === 1}
                              >
                                <i className="bx bx-trash" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>نصيحة ذهبية للمسافرين (اختياري)</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="اكتب أي نصيحة إضافية..."
                    value={opt.tips}
                    onChange={e => updateOption(optIdx, "tips", e.target.value)}
                  />
                </div>

              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px" }}>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={styles.primaryActionBtn}
              disabled={isSubmitting}
              style={{ padding: "12px 32px" }}
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ الطريق والخطوات بالكامل"}
            </button>
          </div>
        </form>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className={styles.filterCard}>
        <div className={styles.searchWrapper}>
          <i className={`bx bx-search ${styles.searchIcon}`} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ابحث بالنقطة، الوجهة، أو الكلمات البديلة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">كل وسائل المواصلات</option>
          <option value="microbus">ميكروباص</option>
          <option value="bus">أتوبيس</option>
          <option value="metro">مترو</option>
          <option value="train">قطار</option>
          <option value="monorail">مونوريل</option>
          <option value="multi">مواصلات متعددة</option>
          <option value="car">عربية خاص</option>
        </select>
      </div>

      {/* ── Origin Locations Dynamic Tabs ── */}
      <div className={styles.originTabsContainer}>
        <button
          type="button"
          className={`${styles.originTab} ${selectedOrigin === "all" ? styles.originTabActive : ""}`}
          onClick={() => setSelectedOrigin("all")}
        >
          <i className="bx bx-grid-alt" />
          <span>كل مناطق الانطلاق</span>
          <span className={styles.tabBadge}>{groupedRoutesList.length}</span>
        </button>

        {uniqueOrigins.map((orig, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.originTab} ${selectedOrigin === orig.name ? styles.originTabActive : ""}`}
            onClick={() => setSelectedOrigin(orig.name)}
          >
            <i className="bx bx-map-pin" />
            <span>منطقة {orig.name}</span>
            <span className={styles.tabBadge}>{orig.count}</span>
          </button>
        ))}
      </div>

      {/* ── List Actions Toolbar (Expand All / Collapse All) ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "#64748b" }}>
          الطرق والمسارات ({(filteredGroupedRoutes || []).length})
        </span>

        {filteredGroupedRoutes.length > 0 && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={expandAllRoutes}
              style={{ padding: "5px 12px", fontSize: "0.78rem" }}
            >
              <i className="bx bx-expand-vertical" />
              <span>فتح الكل</span>
            </button>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={collapseAllRoutes}
              style={{ padding: "5px 12px", fontSize: "0.78rem" }}
            >
              <i className="bx bx-collapse-vertical" />
              <span>إغلاق الكل</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Routes & Paths Collapsible Accordion List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredGroupedRoutes.length === 0 ? (
          <div className={styles.emptyState}>
            <i className={`bx bx-compass ${styles.emptyIcon}`} />
            <h3 style={{ margin: "0", color: "#f8fafc", fontWeight: "800" }}>لا توجد مسارات مطابقة</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>جرّب تغيير تبويب نقطة الانطلاق، كلمات البحث، أو أضف مساراً جديداً.</p>
          </div>
        ) : (
          filteredGroupedRoutes.map((route, idx) => {
            const routeKey = `${route.from_location.trim()}|||${route.to_location.trim()}`;
            const isExpanded = !!expandedRouteKeys[routeKey];

            // Summary calculations for collapsed view
            const optionCosts = (route.options || []).map(o => o.cost).filter(c => typeof c === "number");
            const minCost = optionCosts.length > 0 ? Math.min(...optionCosts) : 0;
            const maxCost = optionCosts.length > 0 ? Math.max(...optionCosts) : 0;
            const costSummary = minCost === maxCost ? `${minCost} ج.م` : `${minCost} - ${maxCost} ج.م`;

            return (
              <div key={idx} className={styles.routeCard}>

                {/* Route Card Clickable Accordion Header */}
                <div
                  className={`${styles.accordionHeader} ${!isExpanded ? styles.accordionHeaderCollapsed : ""}`}
                  onClick={() => toggleRouteExpand(routeKey)}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h3 className={styles.routeTitle}>
                        <span>من</span>
                        <span className={styles.locationBadge}>{route.from_location}</span>
                        <i className="bx bx-left-arrow-alt" style={{ color: "#3b82f6" }} />
                        <span>إلى</span>
                        <span className={styles.locationBadge}>{route.to_location}</span>
                      </h3>

                      {/* Chevron Indicator */}
                      <div className={`${styles.chevronIcon} ${isExpanded ? styles.chevronRotated : ""}`}>
                        <i className="bx bx-chevron-down" />
                      </div>
                    </div>

                    {/* Summary Info Pill Bar */}
                    <div className={styles.collapsedSummaryBar}>
                      <span className={styles.summaryPill}>
                        <i className="bx bx-bus" style={{ color: "#3b82f6" }} />
                        <span>{route.options.length} وسائل مواصلات</span>
                      </span>

                      <span className={styles.summaryPill}>
                        <i className="bx bx-wallet" style={{ color: "#10b981" }} />
                        <span>الأجرة {costSummary}</span>
                      </span>

                      {(route.from_aliases || route.to_aliases) && (
                        <span className={styles.summaryPill} style={{ opacity: 0.8 }}>
                          <i className="bx bx-tag-alt" />
                          <span>يتضمن كلمات بديلة للبحث</span>
                        </span>
                      )}
                    </div>

                    {/* Expanded Aliases Preview */}
                    {isExpanded && (route.from_aliases || route.to_aliases) && (
                      <div className={styles.aliasesBar} style={{ marginTop: "6px" }}>
                        <span>الكلمات البديلة:</span>
                        {route.from_aliases && (
                          <span>البداية ({route.from_aliases.split(",").map((a, i) => <span key={i} className={styles.aliasChip}>{a.trim()}</span>)})</span>
                        )}
                        {route.to_aliases && (
                          <span>الوجهة ({route.to_aliases.split(",").map((a, i) => <span key={i} className={styles.aliasChip}>{a.trim()}</span>)})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions (with stopPropagation so clicking action buttons doesn't toggle accordion) */}
                  <div style={{ display: "flex", gap: "8px" }} onClick={e => e.stopPropagation()}>
                    <button
                      className={styles.secondaryActionBtn}
                      onClick={() => handleEdit(route)}
                      style={{ padding: "8px 16px", fontSize: "0.82rem", color: "#60a5fa" }}
                      title="تعديل بيانات هذا الطريق"
                    >
                      <i className="bx bx-edit-alt" />
                      <span>تعديل</span>
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleDelete(route.from_location, route.to_location)}
                      style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                      title="حذف هذا الطريق"
                    >
                      <i className="bx bx-trash" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Content Section */}
                {isExpanded && (
                  <div className={styles.optionsGrid} style={{ marginTop: "12px", animation: "slideDown 0.2s ease" }}>
                    {(route.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className={styles.optionItem}>

                        {/* Option Meta Bar */}
                        <div className={styles.optionMeta}>
                          <div className={styles.vehicleTypeGroup}>
                            <div className={styles.vehicleIcon}>
                              <i className={opt.icon} />
                            </div>
                            <span className={styles.vehicleName}>{opt.type_name}</span>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <span className={`${styles.badgePill} ${styles.badgeCost}`}>
                              <i className="bx bx-wallet" />
                              <span>{opt.cost} ج.م</span>
                            </span>
                            <span className={`${styles.badgePill} ${styles.badgeDuration}`}>
                              <i className="bx bx-time-five" />
                              <span>{opt.duration}</span>
                            </span>
                          </div>
                        </div>

                        {/* Journey Legs Stepper Timeline */}
                        {opt.legs && Array.isArray(opt.legs) && opt.legs.length > 0 ? (
                          <div className={styles.timelineStepper}>
                            {(opt.legs || []).map((leg, lIdx) => (
                              <div key={lIdx} className={styles.timelineStep}>
                                <div className={styles.stepDot} />
                                <div className={styles.stepContent}>
                                  <div className={styles.stepHeader}>
                                    <span>📍 {leg.title}</span>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                      {leg.cost !== undefined && <span style={{ color: "#34d399" }}>{leg.cost} ج.م</span>}
                                      {leg.duration && <span style={{ color: "#60a5fa" }}>{leg.duration}</span>}
                                    </div>
                                  </div>
                                  <ol className={styles.stepList}>
                                    {(leg.steps || []).map((step, sIdx) => (
                                      <li key={sIdx}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ol className={styles.stepList} style={{ paddingRight: "20px" }}>
                            {(opt.steps || []).map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        )}

                        {/* Tips Callout */}
                        {opt.tips && (
                          <div className={styles.tipBanner}>
                            <i className="bx bx-bulb" style={{ fontSize: "1.1rem" }} />
                            <span><strong>نصيحة للمسافرين:</strong> {opt.tips}</span>
                          </div>
                        )}

                        {/* Map Link Callout */}
                        {opt.map_link && (
                          <div className={styles.mapBanner}>
                            <i className="bx bx-map-pin" style={{ fontSize: "1.1rem" }} />
                            <span><strong>مسار بدء الرحلة:</strong> <a href={opt.map_link} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>فتح الخريطة عبر Google Maps</a></span>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
