import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  DbTransitRoute,
  FormOption,
  GroupedRoute,
  RouteConnectionIdentifier,
  RouteEntry
} from "../types";
import {
  LOCAL_STORAGE_ROUTES_KEY,
  createDefaultOption
} from "../constants";
import {
  computeUniqueOrigins,
  filterGroupedRoutes,
  formatOptionCalculations,
  getErrorMessage,
  groupRoutesByEndpoints,
  mapConnectionToFormOptions,
  normalizeDbTransitRoutes
} from "../utils";
import { ParsedExcelRouteRow, exportRoutesToExcel } from "../utils/excelParser";

interface UseAdminDirectionsProps {
  isSubComponent?: boolean;
}

export function useAdminDirections({ isSubComponent = false }: UseAdminDirectionsProps = {}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Access Control & Data States
  const [isAdmin, setIsAdmin] = useState(isSubComponent);
  const [loading, setLoading] = useState(!isSubComponent);
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [dbMissing, setDbMissing] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");

  // Accordion State
  const [expandedRouteKeys, setExpandedRouteKeys] = useState<Record<string, boolean>>({});

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<RouteConnectionIdentifier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromAliases, setFromAliases] = useState("");
  const [toAliases, setToAliases] = useState("");
  const [options, setOptions] = useState<FormOption[]>([createDefaultOption()]);

  // LocalStorage Helpers
  const loadFromLocalStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(LOCAL_STORAGE_ROUTES_KEY);
    if (saved) {
      try {
        setRoutes(JSON.parse(saved));
      } catch {
        setRoutes([]);
      }
    }
  }, []);

  const saveToLocalStorage = useCallback((newRoutes: RouteEntry[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_ROUTES_KEY, JSON.stringify(newRoutes));
    setRoutes(newRoutes);
  }, []);

  // Fetch Routes
  const fetchRoutes = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchErr } = await supabase
        .from("transit_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) {
        if (fetchErr.code === "P0001" || fetchErr.message.includes("does not exist")) {
          setDbMissing(true);
          loadFromLocalStorage();
        } else {
          throw fetchErr;
        }
      } else {
        setDbMissing(false);
        const formatted = normalizeDbTransitRoutes((data || []) as unknown as DbTransitRoute[]);
        setRoutes(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setError("حدث خطأ أثناء جلب المسارات من قاعدة البيانات.");
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [loadFromLocalStorage]);

  // Verification
  const checkAdminAndFetch = useCallback(async () => {
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
  }, [user, fetchRoutes]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    checkAdminAndFetch();
  }, [user, authLoading, router, checkAdminAndFetch]);

  // Grouped & Filtered Routes
  const groupedRoutesList = useMemo(() => {
    return groupRoutesByEndpoints(routes);
  }, [routes]);

  const uniqueOrigins = useMemo(() => {
    return computeUniqueOrigins(groupedRoutesList);
  }, [groupedRoutesList]);

  const filteredGroupedRoutes = useMemo(() => {
    return filterGroupedRoutes(groupedRoutesList, searchQuery, filterType, selectedOrigin);
  }, [groupedRoutesList, searchQuery, filterType, selectedOrigin]);

  // Statistics
  const stats = useMemo(() => {
    const totalConnectionsCount = groupedRoutesList.length;
    const totalOptionsCount = routes.length;
    const totalMultiLegCount = routes.filter(
      (r) => r.type === "multi" || (r.legs && r.legs.length > 1)
    ).length;
    const avgCost =
      routes.length > 0
        ? Math.round(routes.reduce((acc, r) => acc + (r.cost || 0), 0) / routes.length)
        : 0;

    return {
      totalConnectionsCount,
      totalOptionsCount,
      totalMultiLegCount,
      avgCost
    };
  }, [groupedRoutesList, routes]);

  // Accordion Toggles
  const toggleRouteExpand = (key: string) => {
    setExpandedRouteKeys((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAllRoutes = () => {
    const allKeys: Record<string, boolean> = {};
    filteredGroupedRoutes.forEach((r) => {
      const key = `${r.from_location.trim()}|||${r.to_location.trim()}`;
      allKeys[key] = true;
    });
    setExpandedRouteKeys(allKeys);
  };

  const collapseAllRoutes = () => {
    setExpandedRouteKeys({});
  };

  // Form Management Handlers
  const resetForm = () => {
    setFromLocation("");
    setToLocation("");
    setFromAliases("");
    setToAliases("");
    setOptions([createDefaultOption()]);
    setEditingConnection(null);
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (conn: GroupedRoute) => {
    setEditingConnection({
      from_location: conn.from_location,
      to_location: conn.to_location
    });
    setFromLocation(conn.from_location);
    setToLocation(conn.to_location);
    setFromAliases(conn.from_aliases || "");
    setToAliases(conn.to_aliases || "");
    setOptions(mapConnectionToFormOptions(conn));
    setShowAddForm(true);
    setError("");
    setSuccess("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (fromVal: string, toVal: string) => {
    if (!confirm(`هل أنت متأكد من حذف طريق (من ${fromVal} إلى ${toVal}) بجميع وسائله؟`)) return;

    setError("");
    setSuccess("");

    try {
      if (dbMissing) {
        const updated = (routes || []).filter(
          (r) =>
            !(
              r.from_location.trim().toLowerCase() === fromVal.trim().toLowerCase() &&
              r.to_location.trim().toLowerCase() === toVal.trim().toLowerCase()
            )
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) {
      setError("يرجى إدخال نقطة الانطلاق والوصول.");
      return;
    }

    const computedOptions = formatOptionCalculations(options);

    // Validation
    for (let i = 0; i < computedOptions.length; i++) {
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
        const filteredLegSteps = (leg.steps || []).map((s) => s.trim()).filter(Boolean);
        if (filteredLegSteps.length === 0) {
          setError(`يجب إضافة خطوة واحدة على الأقل للمرحلة رقم ${j + 1} في الوسيلة ${i + 1}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");
    setOptions(computedOptions);

    const payloads = computedOptions.map((opt) => {
      const formattedLegs = (opt.legs || []).map((leg, lIdx) => ({
        title: leg.title.trim() || `المرحلة ${lIdx + 1}`,
        vehicleType: leg.vehicleType.trim() || undefined,
        cost: leg.cost.trim() ? parseInt(leg.cost.trim(), 10) : undefined,
        duration: leg.duration.trim() || undefined,
        steps: (leg.steps || []).map((s) => s.trim()).filter(Boolean)
      }));

      const allFlatSteps: string[] = [];
      formattedLegs.forEach((leg) => {
        (leg.steps || []).forEach((s) => allFlatSteps.push(s));
      });

      return {
        from_location: fromLocation.trim(),
        to_location: toLocation.trim(),
        type: opt.type,
        type_name: opt.type_name.trim(),
        icon: opt.icon.trim() || "microbus",
        cost: parseInt(opt.cost, 10) || 0,
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
        let updatedRoutes = [...routes];
        if (editingConnection) {
          updatedRoutes = updatedRoutes.filter(
            (r) =>
              !(
                r.from_location.trim().toLowerCase() ===
                  editingConnection.from_location.trim().toLowerCase() &&
                r.to_location.trim().toLowerCase() ===
                  editingConnection.to_location.trim().toLowerCase()
              )
          );
        }

        const newLocalEntries = payloads.map((payload, idx) => ({
          id: `local-${Date.now()}-${idx}`,
          ...payload
        }));

        updatedRoutes = [...newLocalEntries, ...updatedRoutes];
        saveToLocalStorage(updatedRoutes);
        setSuccess(
          editingConnection ? "تم تعديل الطريق محلياً بنجاح!" : "تم إضافة الطريق محلياً بنجاح!"
        );
        resetForm();
        setShowAddForm(false);
      } else {
        if (!supabase) {
          throw new Error("قاعدة البيانات غير متوفرة");
        }

        if (editingConnection) {
          const { error: deleteError } = await supabase
            .from("transit_routes")
            .delete()
            .eq("from_location", editingConnection.from_location)
            .eq("to_location", editingConnection.to_location);

          if (deleteError) throw deleteError;
        }

        let { error: insertError } = await supabase.from("transit_routes").insert(payloads);

        if (
          insertError &&
          (insertError.message?.includes("legs") || insertError.message?.includes("schema cache"))
        ) {
          console.warn("legs column missing in Supabase, retrying insert without legs field...");
          const fallbackPayloads = payloads.map((p) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { legs, ...rest } = p;
            return rest;
          });
          const retryRes = await supabase.from("transit_routes").insert(fallbackPayloads);
          insertError = retryRes.error;
          setDbMissing(true);
        }

        if (insertError) throw insertError;

        setSuccess(
          editingConnection
            ? "تم تحديث الطريق بجميع وسائله ومراحله بنجاح!"
            : "تم إضافة الطريق بجميع وسائله ومراحله بنجاح!"
        );
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

  const [showExcelModal, setShowExcelModal] = useState(false);

  // Excel Import Handler
  const handleExcelImport = async (parsedRows: ParsedExcelRouteRow[], replaceExisting: boolean) => {
    setError("");
    setSuccess("");

    const payloads = parsedRows.map((row) => ({
      from_location: row.from_location.trim(),
      to_location: row.to_location.trim(),
      type: row.type,
      type_name: row.type_name.trim(),
      icon: row.icon.trim() || "microbus",
      cost: row.cost || 0,
      duration: row.duration.trim(),
      steps: row.steps || [],
      legs: row.legs && row.legs.length > 0 ? row.legs : undefined,
      tips: row.tips?.trim() || undefined,
      from_aliases: row.from_aliases?.trim() || undefined,
      to_aliases: row.to_aliases?.trim() || undefined,
      map_link: row.map_link?.trim() || undefined
    }));

    if (dbMissing) {
      // Local Storage Import
      let updatedRoutes = [...routes];

      if (replaceExisting) {
        // Collect pairs to replace
        const pairsToReplace = new Set(
          payloads.map(
            (p) => `${p.from_location.toLowerCase()}|||${p.to_location.toLowerCase()}`
          )
        );
        updatedRoutes = updatedRoutes.filter(
          (r) =>
            !pairsToReplace.has(
              `${r.from_location.toLowerCase()}|||${r.to_location.toLowerCase()}`
            )
        );
      }

      const newLocalEntries = payloads.map((payload, idx) => ({
        id: `local-import-${Date.now()}-${idx}`,
        ...payload
      }));

      updatedRoutes = [...newLocalEntries, ...updatedRoutes];
      saveToLocalStorage(updatedRoutes);
      setSuccess(`تم استيراد وحفظ (${payloads.length}) مسار محلياً بنجاح!`);
    } else {
      // Supabase Import
      if (!supabase) {
        throw new Error("قاعدة البيانات غير متوفرة");
      }

      if (replaceExisting) {
        // Get unique pairs
        const uniquePairsMap = new Map<string, { from: string; to: string }>();
        payloads.forEach((p) => {
          const key = `${p.from_location.toLowerCase()}|||${p.to_location.toLowerCase()}`;
          if (!uniquePairsMap.has(key)) {
            uniquePairsMap.set(key, { from: p.from_location, to: p.to_location });
          }
        });

        // Delete old pairs
        for (const pair of uniquePairsMap.values()) {
          await supabase
            .from("transit_routes")
            .delete()
            .eq("from_location", pair.from)
            .eq("to_location", pair.to);
        }
      }

      // Insert all payloads
      let { error: insertError } = await supabase.from("transit_routes").insert(payloads);

      // Retry without legs column if missing from schema cache
      if (
        insertError &&
        (insertError.message?.includes("legs") || insertError.message?.includes("schema cache"))
      ) {
        console.warn("legs column missing in Supabase, retrying excel import without legs...");
        const fallbackPayloads = payloads.map((p) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { legs, ...rest } = p;
          return rest;
        });
        const retryRes = await supabase.from("transit_routes").insert(fallbackPayloads);
        insertError = retryRes.error;
        setDbMissing(true);
      }

      if (insertError) throw insertError;

      setSuccess(`تم استيراد وحفظ (${payloads.length}) مسار بنجاح في قاعدة البيانات!`);
      await fetchRoutes();
    }
  };

  // Excel Export Handler
  const handleExcelExport = () => {
    if (routes.length === 0) {
      setError("لا توجد مسارات مسجلة لتصديرها.");
      return;
    }
    exportRoutesToExcel(routes);
    setSuccess("تم تصدير ملف الإكسل بجميع المسارات بنجاح!");
  };

  // Multi-Selection State for Bulk Actions
  const [selectedRouteKeys, setSelectedRouteKeys] = useState<Record<string, boolean>>({});

  const toggleSelectRoute = (routeKey: string) => {
    setSelectedRouteKeys((prev) => ({
      ...prev,
      [routeKey]: !prev[routeKey]
    }));
  };

  const toggleSelectAll = (visibleRoutes: GroupedRoute[]) => {
    const allSelected = visibleRoutes.length > 0 && visibleRoutes.every((r) => {
      const key = `${r.from_location.trim()}|||${r.to_location.trim()}`;
      return !!selectedRouteKeys[key];
    });

    if (allSelected) {
      // Unselect all
      setSelectedRouteKeys({});
    } else {
      // Select all visible
      const newSelected: Record<string, boolean> = {};
      visibleRoutes.forEach((r) => {
        const key = `${r.from_location.trim()}|||${r.to_location.trim()}`;
        newSelected[key] = true;
      });
      setSelectedRouteKeys(newSelected);
    }
  };

  const clearSelection = () => {
    setSelectedRouteKeys({});
  };

  const selectedCount = useMemo(() => {
    return Object.values(selectedRouteKeys).filter(Boolean).length;
  }, [selectedRouteKeys]);

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    const keysToDelete = Object.keys(selectedRouteKeys).filter(
      (k) => selectedRouteKeys[k]
    );

    if (keysToDelete.length === 0) return;

    if (
      !confirm(
        `هل أنت متأكد من حذف (${keysToDelete.length}) مسار محدد بجميع وسائل المواصلات الخاصة بها نهائياً؟`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      if (dbMissing) {
        // LocalStorage bulk delete
        const pairsSet = new Set(
          keysToDelete.map((k) => k.toLowerCase())
        );

        const updated = (routes || []).filter((r) => {
          const pairKey = `${r.from_location.trim().toLowerCase()}|||${r.to_location.trim().toLowerCase()}`;
          return !pairsSet.has(pairKey);
        });

        saveToLocalStorage(updated);
        setSuccess(`تم حذف (${keysToDelete.length}) مسار محلياً بنجاح.`);
        clearSelection();
      } else {
        // Supabase bulk delete
        if (!supabase) {
          throw new Error("قاعدة البيانات غير متوفرة");
        }

        for (const key of keysToDelete) {
          const parts = key.split("|||");
          if (parts.length === 2) {
            const [fromVal, toVal] = parts;
            await supabase
              .from("transit_routes")
              .delete()
              .eq("from_location", fromVal)
              .eq("to_location", toVal);
          }
        }

        setSuccess(
          `تم حذف (${keysToDelete.length}) مسار بجميع وسائلها بنجاح من قاعدة البيانات.`
        );
        clearSelection();
        await fetchRoutes();
      }
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      console.error("Bulk delete error:", err);
      setError("فشل حذف المسارات المحددة: " + errMsg);
    }
  };

  return {
    authLoading,
    loading,
    isAdmin,
    dbMissing,
    error,
    success,
    stats,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    selectedOrigin,
    setSelectedOrigin,
    uniqueOrigins,
    groupedRoutesCount: groupedRoutesList.length,
    filteredGroupedRoutes,
    expandedRouteKeys,
    toggleRouteExpand,
    expandAllRoutes,
    collapseAllRoutes,
    selectedRouteKeys,
    selectedCount,
    toggleSelectRoute,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
    showAddForm,
    showExcelModal,
    setShowExcelModal,
    editingConnection,
    openAddForm,
    closeForm,
    fromLocation,
    setFromLocation,
    toLocation,
    setToLocation,
    fromAliases,
    setFromAliases,
    toAliases,
    setToAliases,
    options,
    setOptions,
    isSubmitting,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleExcelImport,
    handleExcelExport
  };
}
