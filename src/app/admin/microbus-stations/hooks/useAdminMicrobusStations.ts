"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { AdminMicrobusStation, AdminMicrobusRoute, MicrobusStationFormData } from "../types";
import { createEmptyRoute } from "../constants";
import {
  isUUID,
  getLocalMicrobusStations,
  saveLocalMicrobusStations,
  normalizeRoutes,
  validateRoutes,
  filterMicrobusStations
} from "../utils";

const INITIAL_FORM_DATA: MicrobusStationFormData = {
  name: "",
  location: "",
  governorate: "",
  map_url: ""
};

export function useAdminMicrobusStations() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [microbusStations, setMicrobusStations] = useState<AdminMicrobusStation[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMicrobusStation | null>(null);
  const [formData, setFormData] = useState<MicrobusStationFormData>(INITIAL_FORM_DATA);
  const [visualRoutes, setVisualRoutes] = useState<AdminMicrobusRoute[]>([createEmptyRoute()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete Confirmation States
  const [itemToDelete, setItemToDelete] = useState<AdminMicrobusStation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMicrobusStations = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setMicrobusStations(getLocalMicrobusStations());
      setDbConnected(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase.from("microbus_stations").select("*");
      if (fetchErr) {
        console.warn("Failed to fetch from microbus_stations, using fallback.", fetchErr);
        setMicrobusStations(getLocalMicrobusStations());
        setDbConnected(false);
      } else {
        setMicrobusStations(data || []);
        setDbConnected(true);
      }
    } catch (err) {
      console.error("Error loading microbus stations:", err);
      setMicrobusStations(getLocalMicrobusStations());
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
        loadMicrobusStations();
      }
    } catch (err) {
      console.error("Error verifying admin status:", err);
      router.push("/");
    }
  }, [user, router, loadMicrobusStations]);

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
    setVisualRoutes([createEmptyRoute()]);
    setShowModal(true);
  };

  const handleOpenEdit = (item: AdminMicrobusStation) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      location: item.location || "",
      governorate: item.governorate || "",
      map_url: item.map_url || ""
    });
    setVisualRoutes(normalizeRoutes(item.routes));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Form field changes
  const handleFormFieldChange = (field: keyof MicrobusStationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRouteFieldChange = (
    index: number,
    field: keyof AdminMicrobusRoute,
    value: string
  ) => {
    setVisualRoutes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRoute = () => {
    setVisualRoutes(prev => [...prev, createEmptyRoute()]);
  };

  const handleRemoveRoute = (index: number) => {
    setVisualRoutes(prev => prev.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate visual routes
    const routeValidationError = validateRoutes(visualRoutes);
    if (routeValidationError) {
      setError(routeValidationError);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      governorate: formData.governorate.trim(),
      location: formData.location.trim(),
      map_url: formData.map_url.trim(),
      routes: visualRoutes
    };

    if (dbConnected && supabase) {
      try {
        const isEditingDbRecord = Boolean(editingItem?.id && isUUID(editingItem.id));

        if (isEditingDbRecord && editingItem?.id) {
          const { error: dbErr } = await supabase
            .from("microbus_stations")
            .update(payload)
            .eq("id", editingItem.id);
          if (dbErr) throw dbErr;
          setSuccess("تم تعديل الموقف بنجاح في قاعدة البيانات.");
        } else {
          const { error: dbErr } = await supabase
            .from("microbus_stations")
            .insert(payload);
          if (dbErr) throw dbErr;
          setSuccess("تم إضافة الموقف بنجاح إلى قاعدة البيانات.");
        }

        // Reload fresh data from database
        const { data } = await supabase.from("microbus_stations").select("*");
        setMicrobusStations(data || []);
        setShowModal(false);
      } catch (err: any) {
        console.error("Database save error:", err);
        setError("فشلت العملية في قاعدة البيانات: " + (err.message || "حدث خطأ غير متوقع"));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalMicrobusStations();
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
        const newRecord: AdminMicrobusStation = {
          id: Math.random().toString(36).substring(2, 11),
          ...payload,
          created_at: new Date().toISOString()
        };
        currentLocal = [newRecord, ...currentLocal];
        setSuccess("تم إضافة السجل بنجاح محلياً (LocalStorage).");
      }
      saveLocalMicrobusStations(currentLocal);
      setMicrobusStations(currentLocal);
      setShowModal(false);
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteClick = (item: AdminMicrobusStation) => {
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
          .from("microbus_stations")
          .delete()
          .eq("id", item.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف السجل بنجاح من قاعدة البيانات.");

        const { data } = await supabase.from("microbus_stations").select("*");
        setMicrobusStations(data || []);
      } catch (err: any) {
        console.error("Database delete error:", err);
        setError("فشل الحذف في قاعدة البيانات: " + (err.message || "حدث خطأ غير متوقع"));
      } finally {
        setIsDeleting(false);
        setItemToDelete(null);
      }
    } else {
      let currentLocal = getLocalMicrobusStations();
      currentLocal = currentLocal.filter((localItem) => {
        if (item.id && localItem.id !== item.id) return true;
        if (!item.id && localItem.name !== item.name) return true;
        return false;
      });
      saveLocalMicrobusStations(currentLocal);
      setMicrobusStations(currentLocal);
      setSuccess("تم حذف السجل بنجاح محلياً (LocalStorage).");
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // Filtered List
  const filteredStations = useMemo(() => {
    return filterMicrobusStations(microbusStations, searchQuery);
  }, [microbusStations, searchQuery]);

  return {
    // Auth & Status
    authLoading,
    loading,
    isAdmin,
    dbConnected,
    error,
    success,

    // Search
    searchQuery,
    setSearchQuery,
    filteredStations,
    totalStationsCount: filteredStations.length,

    // Modal & Form
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

    // Delete
    itemToDelete,
    isDeleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete
  };
}
