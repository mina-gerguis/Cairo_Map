"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { AdminBrtStation, AdminBrtRoute, BrtStationFormData, ParsedExcelBrtStation } from "../types";
import { createEmptyBrtRoute } from "../constants";
import {
  isUUID,
  getLocalBrtStations,
  saveLocalBrtStations,
  normalizeBrtRoutes,
  validateBrtRoutes,
  filterBrtStations
} from "../utils";
import {
  exportBrtStationsToExcel
} from "../utils/excelParser";

const INITIAL_FORM_DATA: BrtStationFormData = {
  name: "",
  location: "",
  governorate: "القاهرة",
  sector: "شرق القاهرة",
  map_url: "",
  type: "محطة سطحية قياسية",
  status: "تشغيل تجريبي",
  landmarksText: ""
};

export function useAdminBrtStations() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [brtStations, setBrtStations] = useState<AdminBrtStation[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");

  // Selection & Bulk Actions
  const [selectedStationKeys, setSelectedStationKeys] = useState<Record<string, boolean>>({});
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Excel Modal State
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminBrtStation | null>(null);
  const [formData, setFormData] = useState<BrtStationFormData>(INITIAL_FORM_DATA);
  const [visualRoutes, setVisualRoutes] = useState<AdminBrtRoute[]>([createEmptyBrtRoute()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete Confirmation States
  const [itemToDelete, setItemToDelete] = useState<AdminBrtStation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBrtStations = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setBrtStations(getLocalBrtStations());
      setDbConnected(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from("brt_stations")
        .select("*")
        .order("name", { ascending: true });

      if (fetchErr) {
        console.warn("Failed to fetch from brt_stations, using fallback.", fetchErr);
        setBrtStations(getLocalBrtStations());
        setDbConnected(false);
      } else if (!data || data.length === 0) {
        // Empty DB, fall back to initial default stations
        const locals = getLocalBrtStations();
        setBrtStations(locals);
        setDbConnected(true);
      } else {
        setBrtStations(data);
        setDbConnected(true);
      }
    } catch (err) {
      console.error("Error loading BRT stations:", err);
      setBrtStations(getLocalBrtStations());
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdmin = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      const { data, error: profileErr } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileErr || !data?.is_admin) {
        setIsAdmin(false);
        router.push("/");
      } else {
        setIsAdmin(true);
        loadBrtStations();
      }
    } catch (err) {
      console.error("Error verifying admin status:", err);
      router.push("/");
    }
  }, [user, router, loadBrtStations]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        checkAdmin();
      }
    }
  }, [user, authLoading, checkAdmin, router]);

  // Modal actions
  const handleOpenAdd = () => {
    setError("");
    setSuccess("");
    setEditingItem(null);
    setFormData(INITIAL_FORM_DATA);
    setVisualRoutes([createEmptyBrtRoute()]);
    setShowModal(true);
  };

  const handleOpenEdit = (item: AdminBrtStation) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      location: item.location || "",
      governorate: item.governorate || "القاهرة",
      sector: item.sector || "شرق القاهرة",
      map_url: item.map_url || "",
      type: item.type || "محطة سطحية قياسية",
      status: item.status || "تشغيل تجريبي",
      landmarksText: Array.isArray(item.landmarks) ? item.landmarks.join("، ") : ""
    });
    setVisualRoutes(normalizeBrtRoutes(item.routes));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Form field changes
  const handleFormFieldChange = (field: keyof BrtStationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRouteFieldChange = (
    index: number,
    field: keyof AdminBrtRoute,
    value: string
  ) => {
    setVisualRoutes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRoute = () => {
    setVisualRoutes((prev) => [...prev, createEmptyBrtRoute()]);
  };

  const handleRemoveRoute = (index: number) => {
    setVisualRoutes((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const routeValidationError = validateBrtRoutes(visualRoutes);
    if (routeValidationError) {
      setError(routeValidationError);
      return;
    }

    setIsSubmitting(true);

    const landmarksArray = formData.landmarksText
      ? formData.landmarksText.split(/[\،,\|\n]+/).map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name.trim(),
      governorate: formData.governorate.trim(),
      sector: formData.sector,
      location: formData.location.trim(),
      map_url: formData.map_url.trim(),
      type: formData.type.trim(),
      status: formData.status.trim(),
      landmarks: landmarksArray,
      routes: visualRoutes
    };

    if (dbConnected && supabase) {
      try {
        const isEditingDbRecord = Boolean(editingItem?.id && isUUID(editingItem.id));

        if (isEditingDbRecord && editingItem?.id) {
          const { error: dbErr } = await supabase
            .from("brt_stations")
            .update(payload)
            .eq("id", editingItem.id);
          if (dbErr) throw dbErr;
          setSuccess("تم تعديل المحطة بنجاح في قاعدة البيانات.");
        } else {
          const { error: dbErr } = await supabase
            .from("brt_stations")
            .insert(payload);
          if (dbErr) throw dbErr;
          setSuccess("تم إضافة المحطة بنجاح إلى قاعدة البيانات.");
        }

        const { data } = await supabase.from("brt_stations").select("*").order("name", { ascending: true });
        setBrtStations(data || []);
        setShowModal(false);
      } catch (err: any) {
        console.error("Database save error:", err);
        setError("فشلت العملية في قاعدة البيانات: " + (err.message || "حدث خطأ غير متوقع"));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalBrtStations();
      if (editingItem) {
        currentLocal = currentLocal.map((item) => {
          if (editingItem.id && item.id === editingItem.id) {
            return { ...item, ...payload };
          }
          if (!editingItem.id && item.name === editingItem.name) {
            return { ...item, ...payload };
          }
          return item;
        });
        setSuccess("تم تعديل السجل بنجاح محلياً (LocalStorage).");
      } else {
        const newRecord: AdminBrtStation = {
          id: Math.random().toString(36).substring(2, 11),
          ...payload,
          created_at: new Date().toISOString()
        };
        currentLocal = [newRecord, ...currentLocal];
        setSuccess("تم إضافة السجل بنجاح محلياً (LocalStorage).");
      }
      saveLocalBrtStations(currentLocal);
      setBrtStations(currentLocal);
      setShowModal(false);
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteClick = (item: AdminBrtStation) => {
    setItemToDelete(item);
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setItemToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const item = itemToDelete;
    setIsDeleting(true);
    setError("");
    setSuccess("");

    if (dbConnected && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("brt_stations")
          .delete()
          .eq("id", item.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف المحطة بنجاح من قاعدة البيانات.");

        const { data } = await supabase.from("brt_stations").select("*").order("name", { ascending: true });
        setBrtStations(data || []);
      } catch (err: any) {
        console.error("Database delete error:", err);
        setError("فشل الحذف في قاعدة البيانات: " + (err.message || "حدث خطأ غير متوقع"));
      } finally {
        setIsDeleting(false);
        setItemToDelete(null);
      }
    } else {
      let currentLocal = getLocalBrtStations();
      currentLocal = currentLocal.filter((localItem) => {
        if (item.id && localItem.id !== item.id) return true;
        if (!item.id && localItem.name !== item.name) return true;
        return false;
      });
      saveLocalBrtStations(currentLocal);
      setBrtStations(currentLocal);
      setSuccess("تم حذف المحطة بنجاح محلياً (LocalStorage).");
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // Excel Modal Actions
  const handleOpenExcelModal = () => {
    setError("");
    setSuccess("");
    setShowExcelModal(true);
  };

  const handleCloseExcelModal = () => {
    setShowExcelModal(false);
  };

  // Export to Excel Action
  const handleExportExcel = () => {
    try {
      exportBrtStationsToExcel(brtStations);
      setSuccess("تم تصدير ملف الإكسل بنجاح.");
    } catch (err: any) {
      console.error("Export error:", err);
      setError("فشل تصدير ملف الإكسل: " + (err?.message || String(err)));
    }
  };

  // Import from Excel Action
  const handleImportExcel = async (
    parsedStations: ParsedExcelBrtStation[],
    replaceExisting: boolean
  ) => {
    if (parsedStations.length === 0) return;

    if (dbConnected && supabase) {
      const { data: currentDbStations, error: fetchErr } = await supabase
        .from("brt_stations")
        .select("*");

      if (fetchErr) {
        throw new Error("فشل التحقق من السجلات السابقة في قاعدة البيانات: " + fetchErr.message);
      }

      const existingMap = new Map<string, AdminBrtStation>();
      (currentDbStations || []).forEach((st: AdminBrtStation) => {
        if (st.name) {
          existingMap.set(st.name.trim().toLowerCase(), st);
        }
      });

      for (const st of parsedStations) {
        const key = st.name.trim().toLowerCase();
        const existing = existingMap.get(key);

        const payload = {
          name: st.name.trim(),
          location: st.location.trim(),
          governorate: st.governorate.trim(),
          sector: st.sector,
          map_url: st.map_url.trim(),
          type: st.type.trim(),
          status: st.status.trim(),
          landmarks: st.landmarks,
          routes: st.routes
        };

        if (existing && existing.id) {
          if (replaceExisting) {
            const { error: updateErr } = await supabase
              .from("brt_stations")
              .update(payload)
              .eq("id", existing.id);
            if (updateErr) throw updateErr;
          } else {
            const existingRoutes = Array.isArray(existing.routes) ? existing.routes : [];
            const mergedRoutes = [...existingRoutes, ...st.routes];
            const { error: updateErr } = await supabase
              .from("brt_stations")
              .update({ routes: mergedRoutes })
              .eq("id", existing.id);
            if (updateErr) throw updateErr;
          }
        } else {
          const { error: insertErr } = await supabase
            .from("brt_stations")
            .insert(payload);
          if (insertErr) throw insertErr;
        }
      }

      const { data: refreshed } = await supabase.from("brt_stations").select("*").order("name", { ascending: true });
      setBrtStations(refreshed || []);
      setSuccess(`تم استيراد وحفظ (${parsedStations.length}) محطة بنجاح في قاعدة البيانات.`);
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalBrtStations();
      const localMap = new Map<string, AdminBrtStation>();
      currentLocal.forEach((st) => {
        if (st.name) {
          localMap.set(st.name.trim().toLowerCase(), st);
        }
      });

      for (const st of parsedStations) {
        const key = st.name.trim().toLowerCase();
        const existing = localMap.get(key);

        if (existing) {
          if (replaceExisting) {
            existing.location = st.location;
            existing.governorate = st.governorate;
            existing.sector = st.sector;
            existing.map_url = st.map_url;
            existing.type = st.type;
            existing.status = st.status;
            existing.landmarks = st.landmarks;
            existing.routes = st.routes;
          } else {
            const existingRoutes = Array.isArray(existing.routes) ? existing.routes : [];
            existing.routes = [...existingRoutes, ...st.routes];
          }
        } else {
          const newRecord: AdminBrtStation = {
            id: Math.random().toString(36).substring(2, 11),
            name: st.name.trim(),
            location: st.location.trim(),
            governorate: st.governorate.trim(),
            sector: st.sector,
            map_url: st.map_url.trim(),
            type: st.type.trim(),
            status: st.status.trim(),
            landmarks: st.landmarks,
            routes: st.routes,
            created_at: new Date().toISOString()
          };
          currentLocal = [newRecord, ...currentLocal];
          localMap.set(key, newRecord);
        }
      }

      saveLocalBrtStations(currentLocal);
      setBrtStations(currentLocal);
      setSuccess(`تم استيراد وحفظ (${parsedStations.length}) محطة بنجاح محلياً (LocalStorage).`);
    }
  };

  // Selection Actions
  const toggleSelectStation = (stationKey: string) => {
    setSelectedStationKeys((prev) => {
      const updated = { ...prev };
      if (updated[stationKey]) {
        delete updated[stationKey];
      } else {
        updated[stationKey] = true;
      }
      return updated;
    });
  };

  const toggleSelectAll = (stations: AdminBrtStation[]) => {
    const allSelected =
      stations.length > 0 &&
      stations.every((s) => {
        const key = s.id || s.name.trim();
        return !!selectedStationKeys[key];
      });

    if (allSelected) {
      setSelectedStationKeys((prev) => {
        const updated = { ...prev };
        stations.forEach((s) => {
          const key = s.id || s.name.trim();
          delete updated[key];
        });
        return updated;
      });
    } else {
      setSelectedStationKeys((prev) => {
        const updated = { ...prev };
        stations.forEach((s) => {
          const key = s.id || s.name.trim();
          updated[key] = true;
        });
        return updated;
      });
    }
  };

  const clearSelection = () => {
    setSelectedStationKeys({});
  };

  const selectedCount = Object.keys(selectedStationKeys).filter(
    (k) => !!selectedStationKeys[k]
  ).length;

  // Bulk Delete Actions
  const handleOpenBulkDelete = () => {
    if (selectedCount === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleCancelBulkDelete = () => {
    if (!isBulkDeleting) {
      setShowBulkDeleteModal(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedCount === 0) return;
    setIsBulkDeleting(true);
    setError("");
    setSuccess("");

    const selectedKeysSet = new Set(
      Object.keys(selectedStationKeys).filter((k) => !!selectedStationKeys[k])
    );

    if (dbConnected && supabase) {
      try {
        const idsToDelete: string[] = [];
        const namesToDelete: string[] = [];

        brtStations.forEach((st) => {
          const key = st.id || st.name.trim();
          if (selectedKeysSet.has(key)) {
            if (st.id && isUUID(st.id)) {
              idsToDelete.push(st.id);
            } else {
              namesToDelete.push(st.name);
            }
          }
        });

        if (idsToDelete.length > 0) {
          const { error: delErr } = await supabase
            .from("brt_stations")
            .delete()
            .in("id", idsToDelete);
          if (delErr) throw delErr;
        }

        if (namesToDelete.length > 0) {
          const { error: delErr } = await supabase
            .from("brt_stations")
            .delete()
            .in("name", namesToDelete);
          if (delErr) throw delErr;
        }

        const { data: refreshed } = await supabase.from("brt_stations").select("*").order("name", { ascending: true });
        setBrtStations(refreshed || []);
        setSuccess(`تم حذف (${selectedCount}) محطة بنجاح من قاعدة البيانات.`);
        clearSelection();
      } catch (err: any) {
        console.error("Bulk delete error:", err);
        setError("فشل الحذف الجماعي: " + (err?.message || String(err)));
      } finally {
        setIsBulkDeleting(false);
        setShowBulkDeleteModal(false);
      }
    } else {
      let currentLocal = getLocalBrtStations();
      currentLocal = currentLocal.filter((localItem) => {
        const key = localItem.id || localItem.name.trim();
        return !selectedKeysSet.has(key);
      });
      saveLocalBrtStations(currentLocal);
      setBrtStations(currentLocal);
      setSuccess(`تم حذف (${selectedCount}) محطة بنجاح محلياً (LocalStorage).`);
      clearSelection();
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  // Filtered List
  const filteredStations = useMemo(() => {
    return filterBrtStations(brtStations, searchQuery, sectorFilter);
  }, [brtStations, searchQuery, sectorFilter]);

  return {
    authLoading,
    loading,
    isAdmin,
    dbConnected,
    error,
    success,

    searchQuery,
    setSearchQuery,
    sectorFilter,
    setSectorFilter,
    filteredStations,
    totalStationsCount: filteredStations.length,

    selectedStationKeys,
    selectedCount,
    toggleSelectStation,
    toggleSelectAll,
    clearSelection,
    showBulkDeleteModal,
    isBulkDeleting,
    handleOpenBulkDelete,
    handleCancelBulkDelete,
    handleConfirmBulkDelete,

    showExcelModal,
    handleOpenExcelModal,
    handleCloseExcelModal,
    handleExportExcel,
    handleImportExcel,

    showModal,
    editingItem,
    formData,
    visualRoutes,
    isSubmitting,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleFormFieldChange,
    handleRouteFieldChange,
    handleAddRoute,
    handleRemoveRoute,
    handleSubmit,

    itemToDelete,
    isDeleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete
  };
}
