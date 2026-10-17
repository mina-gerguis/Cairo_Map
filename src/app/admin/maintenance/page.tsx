"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";
import {
  MaintenanceItem,
  SITE_PAGES_LIST,
  PageInfo,
  getPageInfo,
} from "@/lib/maintenance";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import CustomModal from "@/components/common/Modals";

export default function AdminMaintenancePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Maintenance records state
  const [records, setRecords] = useState<MaintenanceItem[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Form states for creating / updating maintenance
  const [selectedPath, setSelectedPath] = useState<string>("/places");
  const [customPath, setCustomPath] = useState<string>("");
  const [title, setTitle] = useState<string>("الصفحة قيد الصيانة والتحديث");
  const [message, setMessage] = useState<string>(
    "نعمل حالياً على تطوير وتحديث هذه الصفحة لتقديم خدمة وتجربة أفضل. سنعود قريباً!"
  );
  const [isIndefinite, setIsIndefinite] = useState<boolean>(true);
  const [estimatedEnd, setEstimatedEnd] = useState<string>("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "inactive">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modals
  const [previewItem, setPreviewItem] = useState<MaintenanceItem | null>(null);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showGlobalToggleModal, setShowGlobalToggleModal] = useState<boolean>(false);
  const [showLockAllExceptModal, setShowLockAllExceptModal] = useState<boolean>(false);

  // Lock All Except Custom Selection State
  const [excludedPaths, setExcludedPaths] = useState<string[]>(["/"]);
  const [exceptSearchTerm, setExceptSearchTerm] = useState<string>("");
  const [exceptTitle, setExceptTitle] = useState<string>("الصفحة قيد الصيانة والتحديث");
  const [exceptMessage, setExceptMessage] = useState<string>(
    "نعمل حالياً على تطوير وتحديث هذه الصفحة لتقديم خدمة وتجربة أفضل. سنعود قريباً!"
  );
  const [exceptIsIndefinite, setExceptIsIndefinite] = useState<boolean>(true);
  const [exceptEstimatedEnd, setExceptEstimatedEnd] = useState<string>("");

  // Auth & Admin verification
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) return;
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error || !profileData?.is_admin) {
          setIsAdmin(false);
          router.push("/");
        } else {
          setIsAdmin(true);
          fetchMaintenanceRecords();
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  // Real-time listener for page_maintenance table
  useEffect(() => {
    if (!supabase || !isAdmin) return;

    const channel = supabase
      .channel("public:page_maintenance_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "page_maintenance" },
        () => {
          fetchMaintenanceRecords(false);
        }
      )
      .subscribe();

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAdmin]);

  const fetchMaintenanceRecords = async (showLoader = true) => {
    if (!supabase) return;
    if (showLoader) setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_maintenance")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not load page_maintenance table:", error);
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error("Error fetching maintenance records:", err);
    } finally {
      if (showLoader) setFetchLoading(false);
    }
  };

  // Preset quick templates
  const applyPreset = (presetType: "upgrade" | "db" | "emergency") => {
    if (presetType === "upgrade") {
      setTitle("تحديثات وتطويرات جديدة جارية 🚀");
      setMessage(
        "نقوم بإضافة مميزات جديدة وتحسينات شاملة في واجهة هذه الصفحة. انتظرونا بتجربة مميزة قريباً!"
      );
    } else if (presetType === "db") {
      setTitle("صيانة دورية لقواعد البيانات 🛠️");
      setMessage(
        "يتم حالياً إجراء صيانة دورية مجدولة وتحديث البيانات لضمان دقة وسرعة الخدمة. نعتذر عن الإزعاج المؤقت."
      );
    } else if (presetType === "emergency") {
      setTitle("الصفحة متوقفة مؤقتاً للصيانة الطارئة ⚠️");
      setMessage(
        "نعمل على حل مشكلة فنية طارئة بأسرع وقت ممكن. يرجى إعادة المحاولة بعد قليل."
      );
    }
  };

  // Submit new or update maintenance rule
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) return;

    const targetPath = selectedPath === "custom" ? customPath.trim() : selectedPath;
    if (!targetPath) {
      setStatusMessage({ text: "يرجى تحديد مسار الصفحة أو إدخال مسار مخصص", type: "error" });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        page_path: targetPath,
        title: title.trim() || "الصفحة قيد الصيانة والتحديث",
        message: message.trim() || "نعمل حالياً على تطوير وتحديث هذه الصفحة.",
        is_active: true,
        estimated_end: !isIndefinite && estimatedEnd ? new Date(estimatedEnd).toISOString() : null,
        created_by: user?.id || null,
        updated_at: new Date().toISOString(),
      };

      // Check if a record with this path already exists
      const existing = records.find((r) => r.page_path === targetPath);

      if (existing) {
        const { error } = await supabase
          .from("page_maintenance")
          .update(payload)
          .eq("id", existing.id);

        if (error) throw error;
        setStatusMessage({
          text: `تم تحديث وتفعيل وضع الصيانة لصفحة (${getPageInfo(targetPath).label}) بنجاح!`,
          type: "success",
        });
      } else {
        const { error } = await supabase.from("page_maintenance").insert([payload]);
        if (error) throw error;
        setStatusMessage({
          text: `تم قفل وتفعيل الصيانة لصفحة (${getPageInfo(targetPath).label}) بنجاح!`,
          type: "success",
        });
      }

      // Refresh list
      await fetchMaintenanceRecords(false);

      // Reset custom inputs if not custom
      if (selectedPath !== "custom") {
        setCustomPath("");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: `حدث خطأ أثناء حفظ الصيانة: ${err?.message || "يرجى التأكد من إنشاء الجدول في Supabase"}`,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle maintenance status (Active / Inactive)
  const handleToggleActive = async (record: MaintenanceItem) => {
    if (!supabase || !isAdmin) return;
    try {
      const nextState = !record.is_active;
      const { error } = await supabase
        .from("page_maintenance")
        .update({
          is_active: nextState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (error) throw error;

      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, is_active: nextState } : r))
      );

      setStatusMessage({
        text: nextState
          ? `تم تفعيل الصيانة لـ (${getPageInfo(record.page_path).label})`
          : `تم فتح صفحة (${getPageInfo(record.page_path).label}) للزوار بنجاح!`,
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: "فشل تحديث الحالة", type: "error" });
    }
  };

  // Toggle quick maintenance for whole site ('all')
  const handleToggleGlobalSite = async () => {
    if (!supabase || !isAdmin) return;
    const globalRecord = records.find((r) => r.page_path === "all");
    const isCurrentlyActive = globalRecord?.is_active || false;

    try {
      if (globalRecord) {
        const { error } = await supabase
          .from("page_maintenance")
          .update({
            is_active: !isCurrentlyActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", globalRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("page_maintenance").insert([
          {
            page_path: "all",
            title: "الموقع بالكامل قيد الصيانة والتحديث الشامل",
            message:
              "نجري حالياً أعمال صيانة ترقية شاملة لكافة خوادم وخدمات الموقع لتقديم خدمة أسرع وأكثر استقراراً. سنعود قريباً جداً!",
            is_active: true,
            estimated_end: null,
            created_by: user?.id,
          },
        ]);
        if (error) throw error;
      }

      await fetchMaintenanceRecords(false);
      setShowGlobalToggleModal(false);
      setStatusMessage({
        text: !isCurrentlyActive
          ? "⚠️ تم قفل الموقع بالكامل وتفعيل وضع الصيانة لجميع الصفحات!"
          : "✅ تم إلغاء صيانة الموقع بالكامل وفتح جميع الصفحات للزوار!",
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: "حدث خطأ أثناء تطبيق الإجراء", type: "error" });
    }
  };

  // Delete maintenance record
  const handleDeleteRecord = async () => {
    if (!deletingId || !supabase || !isAdmin) return;
    try {
      const { error } = await supabase
        .from("page_maintenance")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      setRecords((prev) => prev.filter((r) => r.id !== deletingId));
      setStatusMessage({ text: "تم حذف إعداد الصيانة بنجاح", type: "success" });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: "فشل حذف الإعداد", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  // Save changes from Edit Modal
  const handleSaveEdit = async () => {
    if (!editingItem || !supabase || !isAdmin) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("page_maintenance")
        .update({
          title: editingItem.title,
          message: editingItem.message,
          is_active: editingItem.is_active,
          estimated_end: editingItem.estimated_end,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingItem.id);

      if (error) throw error;

      setRecords((prev) =>
        prev.map((r) => (r.id === editingItem.id ? editingItem : r))
      );
      setEditingItem(null);
      setStatusMessage({ text: "تم تحديث بيانات الصيانة بنجاح!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: "فشل حفظ التعديلات", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Lock All Except Modal (optionally with a pre-selected single page)
  const handleOpenLockAllExcept = (defaultPath?: string) => {
    if (defaultPath) {
      setExcludedPaths([defaultPath]);
    } else if (excludedPaths.length === 0) {
      setExcludedPaths(["/"]);
    }
    setShowLockAllExceptModal(true);
  };

  // Toggle single path in exception list
  const handleToggleExcludePath = (path: string) => {
    setExcludedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  // Select all or clear exceptions
  const handleSelectAllExceptions = () => {
    setExcludedPaths(SITE_PAGES_LIST.filter((p) => p.path !== "all").map((p) => p.path));
  };

  const handleClearAllExceptions = () => {
    setExcludedPaths([]);
  };

  // Submit batch lock for all pages except selected exceptions
  const handleLockAllExceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) return;

    if (excludedPaths.length === 0) {
      setStatusMessage({
        text: "يرجى تحديد صفحة واحدة على الأقل لاستثنائها وإبقائها مفتوحة للزوار",
        type: "error",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const allPages = SITE_PAGES_LIST.filter((p) => p.path !== "all");

      const upsertItems = allPages.map((page) => {
        const isExcluded = excludedPaths.includes(page.path);
        return {
          page_path: page.path,
          title: isExcluded
            ? `صفحة ${page.label} متاحة`
            : exceptTitle.trim() || `صفحة ${page.label} قيد الصيانة والتحديث`,
          message: isExcluded
            ? `الصفحة تعمل بشكل طبيعي.`
            : exceptMessage.trim() || `نعمل حالياً على تطوير وتحديث هذه الصفحة.`,
          is_active: !isExcluded,
          estimated_end:
            !isExcluded && !exceptIsIndefinite && exceptEstimatedEnd
              ? new Date(exceptEstimatedEnd).toISOString()
              : null,
          created_by: user?.id,
          updated_at: new Date().toISOString(),
        };
      });

      // Also ensure global site lock ('all') is inactive so individual page rules apply
      upsertItems.push({
        page_path: "all",
        title: "الموقع قيد الصيانة والتحديث",
        message: "صيانة عامة لكافة الموقع.",
        is_active: false,
        estimated_end: null,
        created_by: user?.id,
        updated_at: new Date().toISOString(),
      });

      const { error } = await supabase
        .from("page_maintenance")
        .upsert(upsertItems, { onConflict: "page_path" });

      if (error) throw error;

      await fetchMaintenanceRecords(false);
      setShowLockAllExceptModal(false);

      const lockedCount = allPages.length - excludedPaths.length;
      setStatusMessage({
        text: `🔒 تم قفل ${lockedCount} صفحة للصيانة بنجاح، وإبقاء ${excludedPaths.length} صفحة مفتوحة ومتاحة للزوار!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Lock all except error:", err);
      setStatusMessage({
        text: `حدث خطأ أثناء تطبيق القفل: ${err?.message || "يرجى المحاولة مرة أخرى"}`,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick 1-click unlock / lock for predefined pages list
  const handleQuickTogglePageFromList = async (page: PageInfo) => {

    const existing = records.find((r) => r.page_path === page.path);
    if (existing) {
      await handleToggleActive(existing);
    } else {
      // Create new active record for this page
      if (!supabase || !isAdmin) return;
      try {
        const { error } = await supabase.from("page_maintenance").insert([
          {
            page_path: page.path,
            title: `صفحة ${page.label} قيد الصيانة والتحديث`,
            message: `نعمل حالياً على تطوير وتحديث صفحة ${page.label} لتقديم تجربة أفضل. سنعود قريباً!`,
            is_active: true,
            estimated_end: null,
            created_by: user?.id,
          },
        ]);
        if (error) throw error;
        await fetchMaintenanceRecords(false);
        setStatusMessage({
          text: `تم قفل وتفعيل الصيانة لصفحة (${page.label})!`,
          type: "success",
        });
      } catch (err: any) {
        console.error(err);
        setStatusMessage({ text: "فشل تفعيل الصيانة", type: "error" });
      }
    }
  };

  // Computed / Filtered Pages
  const combinedPagesList = useMemo(() => {
    // Map all predefined pages with their maintenance record if any
    const list = SITE_PAGES_LIST.map((p) => {
      const record = records.find((r) => r.page_path === p.path);
      const isRecordActive = record ? record.is_active : false;
      const isExpired =
        record && record.estimated_end
          ? new Date(record.estimated_end) <= new Date()
          : false;

      return {
        ...p,
        record: record || null,
        isUnderMaintenance: isRecordActive && !isExpired,
      };
    });

    // Also include custom paths from records that are not in SITE_PAGES_LIST
    records.forEach((r) => {
      const exists = list.some((item) => item.path === r.page_path);
      if (!exists) {
        const isExpired = r.estimated_end ? new Date(r.estimated_end) <= new Date() : false;
        list.push({
          path: r.page_path,
          label: r.page_path,
          category: "عام",
          icon: "bx bx-link",
          record: r,
          isUnderMaintenance: r.is_active && !isExpired,
        });
      }
    });

    return list;
  }, [records]);

  const filteredPages = useMemo(() => {
    return combinedPagesList.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (filterTab === "active" && !item.isUnderMaintenance) return false;
      if (filterTab === "inactive" && item.isUnderMaintenance) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.path.toLowerCase().includes(q) ||
          (item.record?.title && item.record.title.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [combinedPagesList, filterTab, selectedCategory, searchQuery]);

  // Statistics
  const activeCount = combinedPagesList.filter((p) => p.isUnderMaintenance).length;
  const isGlobalMaintenanceActive = Boolean(
    records.find((r) => r.page_path === "all" && r.is_active)
  );

  if (authChecking) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <i
          className="bx bx-loader-alt"
          style={{ fontSize: "2.5rem", color: "var(--color-secondary, #6366f1)", animation: "spin 1s linear infinite" }}
        />
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>جاري التحقق من صلاحيات الإدارة...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "16px 0", direction: "rtl" }}>
      {/* ── Page Header & Quick Overview ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(245, 158, 11, 0.2))",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f59e0b",
                fontSize: "1.5rem",
              }}
            >
              <i className="bx bx-wrench" />
            </div>
            <div>
              <h1 className={styles.maintHeaderTitle}>
                إدارة وضع الصيانة وحظر الصفحات
              </h1>
              <p className={styles.maintHeaderSubtitle}>
                التحكم في قفل أي صفحة بالموقع وعرض شاشة الصيانة للزوار، بينما يظل بإمكان المسؤولين
                تصفحها وتجربتها.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Lock All Except Button */}
          <button
            type="button"
            onClick={() => handleOpenLockAllExcept()}
            className={styles.maintBatchLockBtn}
            title="قفل جميع صفحات الموقع للصيانة ما عدا صفحات محددة تختارها"
          >
            <i className="bx bx-shield-quarter" style={{ fontSize: "1.15rem" }} />
            <span>قفل كل الصفحات ما عدا...</span>
          </button>

          {/* Global Emergency Toggle Button */}
          <button
            type="button"
            onClick={() => setShowGlobalToggleModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "12px",
              background: isGlobalMaintenanceActive
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #ef4444, #b91c1c)",
              color: "#ffffff",
              border: "none",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: isGlobalMaintenanceActive
                ? "0 4px 15px rgba(16, 185, 129, 0.35)"
                : "0 4px 15px rgba(239, 68, 68, 0.35)",
            }}
          >
            <i
              className={`bx ${isGlobalMaintenanceActive ? "bx-lock-open" : "bx-lock-alt"}`}
              style={{ fontSize: "1.15rem" }}
            />
            <span>
              {isGlobalMaintenanceActive
                ? "إلغاء قفل كامل الموقع (فتح للكل)"
                : "قفل كامل الموقع للصيانة الطارئة"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Status Toast / Notice ── */}
      {statusMessage && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "12px",
            background:
              statusMessage.type === "error"
                ? "rgba(239, 68, 68, 0.12)"
                : "rgba(16, 185, 129, 0.12)",
            color: statusMessage.type === "error" ? "#ef4444" : "#10b981",
            border: `1px solid ${
              statusMessage.type === "error"
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(16, 185, 129, 0.3)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i
              className={`bx ${
                statusMessage.type === "error" ? "bx-error-circle" : "bx-check-circle"
              }`}
              style={{ fontSize: "1.3rem" }}
            />
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            <i className="bx bx-x" />
          </button>
        </div>
      )}

      {/* ── Stat Cards Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Card 1 */}
        <div
          className={styles.tableCard}
          style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#818cf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
            }}
          >
            <i className="bx bx-layer" />
          </div>
          <div>
            <div className={styles.maintStatLabel}>
              إجمالي الصفحات المتاحة
            </div>
            <div className={styles.maintStatValue}>
              {combinedPagesList.length}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className={styles.tableCard}
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderColor: activeCount > 0 ? "rgba(234, 88, 12, 0.4)" : undefined,
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(234, 88, 12, 0.15)",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
            }}
          >
            <i
              className="bx bx-wrench"
              style={{ animation: activeCount > 0 ? "spin 8s linear infinite" : "none" }}
            />
          </div>
          <div>
            <div className={styles.maintStatLabel}>
              صفحات تحت الصيانة حالياً
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ea580c" }}>
              {activeCount}{" "}
              {activeCount > 0 && (
                <span style={{ fontSize: "0.8rem", color: "#ef4444" }}>● مغلقة للزوار</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div
          className={styles.tableCard}
          style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
            }}
          >
            <i className="bx bx-check-double" />
          </div>
          <div>
            <div className={styles.maintStatLabel}>
              صفحات مفتوحة للزوار
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>
              {combinedPagesList.length - activeCount}
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div
          className={styles.tableCard}
          style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: isGlobalMaintenanceActive
                ? "rgba(239, 68, 68, 0.18)"
                : "rgba(16, 185, 129, 0.18)",
              color: isGlobalMaintenanceActive ? "#ef4444" : "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
            }}
          >
            <i className={`bx ${isGlobalMaintenanceActive ? "bx-lock" : "bx-globe"}`} />
          </div>
          <div>
            <div className={styles.maintStatLabel}>
              حالة الموقع العام
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: isGlobalMaintenanceActive ? "#ef4444" : "#10b981",
              }}
            >
              {isGlobalMaintenanceActive ? "صيانة عامة لكافة الموقع" : "الموقع يعمل بشكل طبيعي"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Two Column Grid: Form & List ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* ── Left Column: Form to Lock / Configure Page Maintenance ── */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderBar}>
            <div className={styles.tableTitleGroup}>
              <div
                className={styles.tableIcon}
                style={{ background: "rgba(234, 88, 12, 0.15)", color: "#ea580c" }}
              >
                <i className="bx bx-plus-circle" />
              </div>
              <div>
                <h2 className={styles.tableTitle} style={{ fontSize: "1.2rem" }}>
                  تفعيل صيانة لصفحة
                </h2>
                <p className={styles.tableSubtitle}>
                  اختر أي صفحة في الموقع وحدد رسالة الصيانة وموعد الإتاحة.
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Page Selection */}
              <div>
                <label className={styles.maintFormLabel}>
                  الصفحة المراد قفلها / صيانتها <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="input-fields"
                  value={selectedPath}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                >
                  <optgroup label="خيارات عامة">
                    <option value="all">🌐 كامل الموقع (جميع الصفحات)</option>
                    <option value="custom">✏️ مسار مخصص (Custom Route)</option>
                  </optgroup>

                  <optgroup label="المواصلات وخطوط السير">
                    {SITE_PAGES_LIST.filter((p) => p.category === "مواصلات").map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.label} ({p.path})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="الخدمات والأماكن">
                    {SITE_PAGES_LIST.filter((p) => p.category === "خدمات وأماكن").map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.label} ({p.path})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="الصفحات العامة والمعلومات">
                    {SITE_PAGES_LIST.filter((p) => p.category === "صفحات عامة").map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.label} ({p.path})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="الحسابات والمستخدمين">
                    {SITE_PAGES_LIST.filter((p) => p.category === "حسابات ومستخدمين").map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.label} ({p.path})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Custom Path Input (if custom selected) */}
              {selectedPath === "custom" && (
                <div>
                  <label className={styles.maintFormLabel}>
                    أدخل مسار الصفحة المخصصة <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    required
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="مثال: /some-new-service أو /secret-feature"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                  />
                </div>
              )}

              {/* Quick Template Presets */}
              <div>
                <label className={styles.maintFormLabel} style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  قوالب نصوص سريعة
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => applyPreset("upgrade")}
                    className={`${styles.maintPresetBtn} ${styles.maintPresetUpgrade}`}
                  >
                    🚀 تحديث وتطوير
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("db")}
                    className={`${styles.maintPresetBtn} ${styles.maintPresetDb}`}
                  >
                    🛠️ صيانة دورية
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("emergency")}
                    className={`${styles.maintPresetBtn} ${styles.maintPresetEmergency}`}
                  >
                    ⚠️ صيانة طارئة
                  </button>
                </div>
              </div>

              {/* Custom Title */}
              <div>
                <label className={styles.maintFormLabel}>
                  عنوان شاشة الصيانة <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-fields"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: الصفحة قيد الصيانة والتحديث"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                />
              </div>

              {/* Custom Message */}
              <div>
                <label className={styles.maintFormLabel}>
                  تفاصيل الرسالة التي ستظهر للمستخدمين <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  className="input-fields"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب التوضيح الذي يظهر للزائر عند محاولة دخول الصفحة..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    minHeight: "90px",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Estimated Completion Date / Countdown */}
              <div
                style={{
                  borderTop: "1px solid var(--border-glass)",
                  paddingTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: "var(--text-primary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isIndefinite}
                    onChange={(e) => setIsIndefinite(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#f59e0b" }}
                  />
                  صيانة مفتوحة (حتى يقوم الإدمن بإلغائها يدوياً دون عد تنازلي)
                </label>

                {!isIndefinite && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#f59e0b",
                      }}
                    >
                      تاريخ ووقت الانتهاء المتوقع (سيظهر عد تنازلي حي للزوار):
                    </label>
                    <input
                      type="datetime-local"
                      className="input-fields"
                      required={!isIndefinite}
                      value={estimatedEnd}
                      onChange={(e) => setEstimatedEnd(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons: Preview & Submit */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const pathVal = selectedPath === "custom" ? customPath : selectedPath;
                    setPreviewItem({
                      id: "preview",
                      page_path: pathVal || "/places",
                      title,
                      message,
                      is_active: true,
                      estimated_end:
                        !isIndefinite && estimatedEnd ? new Date(estimatedEnd).toISOString() : null,
                    });
                  }}
                  className={styles.maintSecondaryBtn}
                  style={{ flex: 1 }}
                >
                  <i className="bx bx-show" style={{ fontSize: "1.15rem" }} />
                  <span>معاينة شاشة الزوار</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px",
                    borderRadius: "10px",
                    background: isSaving
                      ? "rgba(234, 88, 12, 0.4)"
                      : "linear-gradient(135deg, #ea580c, #c2410c)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    boxShadow: isSaving ? "none" : "0 4px 15px rgba(234, 88, 12, 0.35)",
                  }}
                >
                  <i className="bx bx-lock-alt" style={{ fontSize: "1.2rem" }} />
                  <span>{isSaving ? "جاري الحفظ والقفل..." : "قفل الصفحة وتفعيل الصيانة"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right Column: Interactive List of All Pages & Maintenance Status ── */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderBar}>
            <div className={styles.tableTitleGroup}>
              <div
                className={styles.tableIcon}
                style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}
              >
                <i className="bx bx-list-check" />
              </div>
              <div>
                <h2 className={styles.tableTitle} style={{ fontSize: "1.2rem" }}>
                  قائمة الصفحات وحالة الوصول
                </h2>
                <p className={styles.tableSubtitle}>
                  التحكم الفوري في فتح وقفل أي صفحة بضغطة زر وتعديل بياناتها.
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-glass)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <i
                className="bx bx-search"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                  fontSize: "1.1rem",
                }}
              />
              <input
                type="text"
                className="input-fields"
                placeholder="ابحث باسم الصفحة أو المسار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  paddingRight: "38px",
                  paddingLeft: "14px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            {/* Filter Tabs & Category Selector */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              {/* Status Tabs */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { id: "all", label: "الكل" },
                  { id: "active", label: `مغلقة للصيانة (${activeCount})` },
                  { id: "inactive", label: "مفتوحة للزوار" },
                ].map((tab) => {
                  const isActive = filterTab === tab.id;
                  let activeClass = "";
                  if (isActive) {
                    activeClass =
                      tab.id === "active"
                        ? styles.maintTabBtnActiveOrange
                        : styles.maintTabBtnActivePrimary;
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id as any)}
                      className={`${styles.maintTabBtn} ${activeClass}`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Category Dropdown */}
              <select
                className="input-fields"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  width: "auto",
                }}
              >
                <option value="all">كل الأقسام</option>
                <option value="مواصلات">مواصلات</option>
                <option value="خدمات وأماكن">خدمات وأماكن</option>
                <option value="صفحات عامة">صفحات عامة</option>
                <option value="حسابات ومستخدمين">حسابات</option>
              </select>
            </div>
          </div>

          {/* List of Pages */}
          <div style={{ maxHeight: "600px", overflowY: "auto", padding: "12px 16px" }}>
            {fetchLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <i
                  className="bx bx-loader-alt"
                  style={{
                    fontSize: "2rem",
                    color: "var(--color-secondary, #6366f1)",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <p style={{ marginTop: "10px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  جاري تحميل الصفحات...
                </p>
              </div>
            ) : filteredPages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                <i className="bx bx-search-alt" style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                <p style={{ marginTop: "10px" }}>لا توجد صفحات مطابقة للبحث أو الفلتر.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredPages.map((page) => {
                  const isUnder = page.isUnderMaintenance;
                  const record = page.record;

                  return (
                    <div
                      key={page.path}
                      className={`${styles.maintListItem} ${isUnder ? styles.maintListItemActive : ""}`}
                    >
                      {/* Page Info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          minWidth: "220px",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: isUnder
                              ? "rgba(234, 88, 12, 0.18)"
                              : "var(--bg-glass-active)",
                            color: isUnder ? "#ea580c" : "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.3rem",
                            flexShrink: 0,
                          }}
                        >
                          <i className={page.icon} />
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span className={styles.maintItemTitle}>{page.label}</span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: isUnder
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : "rgba(16, 185, 129, 0.15)",
                                color: isUnder ? "#ef4444" : "#10b981",
                                fontWeight: 700,
                              }}
                            >
                              {isUnder ? "🔴 مغلقة للصيانة" : "🟢 مفتوحة للزوار"}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: "0.76rem",
                              color: "var(--text-secondary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginTop: "4px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span className={styles.maintItemPathCode}>{page.path}</span>
                            <span>•</span>
                            <span>{page.category}</span>
                            {record?.estimated_end && (
                              <>
                                <span>•</span>
                                <span style={{ color: "#ea580c", fontWeight: 600 }}>
                                  ⏳ حتى:{" "}
                                  {new Date(record.estimated_end).toLocaleString("ar-EG", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </>
                            )}
                          </div>

                          {record && isUnder && (
                            <div className={styles.maintItemMessageBox}>
                              <strong>{record.title}:</strong> {record.message}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls & Quick Actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexShrink: 0,
                        }}
                      >
                        {/* 1-Click Toggle Switch */}
                        <button
                          onClick={() => handleQuickTogglePageFromList(page)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            background: isUnder
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(234, 88, 12, 0.15)",
                            color: isUnder ? "#10b981" : "#ea580c",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: isUnder
                              ? "rgba(16, 185, 129, 0.35)"
                              : "rgba(234, 88, 12, 0.35)",
                            transition: "all 0.2s ease",
                          }}
                          title={isUnder ? "فتح الصفحة للزوار" : "قفل الصفحة للصيانة"}
                        >
                          <i
                            className={`bx ${isUnder ? "bx-lock-open" : "bx-lock-alt"}`}
                            style={{ fontSize: "1rem" }}
                          />
                          <span>{isUnder ? "فتح الصفحة" : "قفل للصيانة"}</span>
                        </button>

                        {/* Quick Lock All Except This Page */}
                        <button
                          onClick={() => handleOpenLockAllExcept(page.path)}
                          className={styles.maintIconBtn}
                          title={`قفل جميع صفحات الموقع وإبقاء صفحة (${page.label}) فقط مفتوحة للزوار`}
                          style={{ color: "#818cf8" }}
                        >
                          <i className="bx bx-shield-quarter" />
                        </button>

                        {/* Edit Record Button (if record exists) */}
                        {record && (
                          <button
                            onClick={() => setEditingItem({ ...record })}
                            className={styles.maintIconBtn}
                            title="تعديل تفاصيل الصيانة"
                          >
                            <i className="bx bx-edit" />
                          </button>
                        )}

                        {/* Preview Screen Button */}
                        <button
                          onClick={() => {
                            setPreviewItem(
                              record || {
                                id: "preview",
                                page_path: page.path,
                                title: `صفحة ${page.label} قيد الصيانة والتحديث`,
                                message: `نعمل حالياً على تطوير وتحديث صفحة ${page.label} لتقديم تجربة أفضل.`,
                                is_active: true,
                                estimated_end: null,
                              }
                            );
                          }}
                          className={styles.maintIconBtn}
                          title="معاينة شاشة الصيانة"
                        >
                          <i className="bx bx-show" />
                        </button>

                        {/* Visit Page in New Tab */}
                        {page.path !== "all" && (
                          <Link
                            href={page.path}
                            target="_blank"
                            className={styles.maintIconBtn}
                            style={{ textDecoration: "none" }}
                            title="زيارة الصفحة"
                          >
                            <i className="bx bx-link-external" />
                          </Link>
                        )}

                        {/* Delete Record Button */}
                        {record && (
                          <button
                            onClick={() => setDeletingId(record.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#ef4444",
                              borderRadius: "8px",
                              padding: "6px 8px",
                              cursor: "pointer",
                              fontSize: "0.88rem",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                            }}
                            title="حذف إعداد الصيانة نهائياً"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal 1: Live Preview Modal ── */}
      {previewItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10005,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            direction: "rtl",
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "780px",
              maxHeight: "92vh",
              overflowY: "auto",
              borderRadius: "18px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Header */}
            <div className={styles.maintPreviewModalHeader}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                معاينة حية: كيف تظهر شاشة الصيانة للزوار
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                style={{
                  background: "var(--bg-muted)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-primary)",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
              </button>
            </div>

            {/* Simulated Maintenance Screen */}
            <div
              style={{
                background: "var(--bgMode, #0b0f19)",
                borderRadius: "0 0 16px 16px",
                border: "1px solid var(--border-glass)",
                borderTop: "none",
              }}
            >
              <MaintenanceScreen maintenance={previewItem} />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Edit Maintenance Details Modal ── */}
      {editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10005,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            direction: "rtl",
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            className={styles.maintModalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bx bx-edit" style={{ fontSize: "1.2rem" }} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                  تعديل بيانات صيانة: {getPageInfo(editingItem.page_path).label}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "1.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className={styles.maintFormLabel}>
                  عنوان الصيانة
                </label>
                <input
                  type="text"
                  className="input-fields"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                />
              </div>

              <div>
                <label className={styles.maintFormLabel}>
                  نص وتفاصيل الرسالة
                </label>
                <textarea
                  className="input-fields"
                  value={editingItem.message}
                  onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    minHeight: "80px",
                  }}
                />
              </div>

              <div>
                <label className={styles.maintFormLabel}>
                  تاريخ ووقت الانتهاء (اختياري)
                </label>
                <input
                  type="datetime-local"
                  className="input-fields"
                  value={
                    editingItem.estimated_end
                      ? new Date(editingItem.estimated_end).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      estimated_end: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editingItem.is_active}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, is_active: e.target.checked })
                    }
                    style={{ width: "18px", height: "18px", accentColor: "#6366f1" }}
                  />
                  تفعيل وضع الصيانة حالياً (قفل الصفحة عن الزوار)
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className={styles.maintSecondaryBtn}
                  style={{ flex: 1, padding: "10px" }}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  style={{
                    flex: 2,
                    padding: "10px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 800,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.35)",
                  }}
                >
                  {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Lock All Except Specific Pages Modal ── */}
      {showLockAllExceptModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10005,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            direction: "rtl",
          }}
          onClick={() => setShowLockAllExceptModal(false)}
        >
          <div
            className={styles.maintModalBox}
            style={{ maxWidth: "680px", maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                paddingBottom: "14px",
                borderBottom: "1px solid var(--border-glass)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2))",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                  }}
                >
                  <i className="bx bx-shield-quarter" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    قفل جميع الصفحات ما عدا صفحات محددة
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    حدد الصفحة أو الصفحات التي تريد استثناءها وإبقائها مفتوحة للزوار.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLockAllExceptModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "1.4rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleLockAllExceptSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Exceptions Selector Toolbar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <label className={styles.maintFormLabel} style={{ margin: 0 }}>
                    اختر الصفحات المستثناة (التي ستظل مفتوحة للزوار):
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setExcludedPaths(["/"])}
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.74rem",
                        borderRadius: "6px",
                        border: "1px solid var(--border-glass)",
                        background: "var(--bg-muted)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      الرئيسية فقط
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllExceptions}
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.74rem",
                        borderRadius: "6px",
                        border: "1px solid var(--border-glass)",
                        background: "var(--bg-muted)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllExceptions}
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.74rem",
                        borderRadius: "6px",
                        border: "1px solid var(--border-glass)",
                        background: "var(--bg-muted)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                {/* Filter Search for pages inside modal */}
                <div style={{ position: "relative", marginBottom: "8px" }}>
                  <i
                    className="bx bx-search"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-secondary)",
                      fontSize: "0.95rem",
                    }}
                  />
                  <input
                    type="text"
                    className="input-fields"
                    placeholder="ابحث عن صفحة لاستثنائها..."
                    value={exceptSearchTerm}
                    onChange={(e) => setExceptSearchTerm(e.target.value)}
                    style={{
                      paddingRight: "32px",
                      paddingLeft: "10px",
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      fontSize: "0.82rem",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                {/* Exception Items Grid */}
                <div className={styles.maintExceptList}>
                  {SITE_PAGES_LIST.filter((p) => p.path !== "all")
                    .filter((p) => {
                      if (!exceptSearchTerm.trim()) return true;
                      const q = exceptSearchTerm.toLowerCase();
                      return (
                        p.label.toLowerCase().includes(q) ||
                        p.path.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q)
                      );
                    })
                    .map((page) => {
                      const isSelected = excludedPaths.includes(page.path);
                      return (
                        <div
                          key={page.path}
                          onClick={() => handleToggleExcludePath(page.path)}
                          className={`${styles.maintExceptItem} ${
                            isSelected ? styles.maintExceptItemActive : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent onClick
                            style={{ accentColor: "#10b981", cursor: "pointer" }}
                          />
                          <i className={page.icon} style={{ fontSize: "1rem" }} />
                          <div style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span>{page.label}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Summary Pill Badge */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--bg-glass-active)",
                  border: "1px solid var(--border-glass)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ef4444" }}>
                    🔴 سيتم قفل: {SITE_PAGES_LIST.filter((p) => p.path !== "all").length - excludedPaths.length} صفحة
                  </span>
                  <span>|</span>
                  <span style={{ color: "#10b981" }}>
                    🟢 ستبقى مفتوحة: {excludedPaths.length} صفحة
                  </span>
                </div>
              </div>

              {/* Maintenance Title */}
              <div>
                <label className={styles.maintFormLabel}>
                  عنوان رسالة الصيانة للصفحات المقفولة
                </label>
                <input
                  type="text"
                  className="input-fields"
                  required
                  value={exceptTitle}
                  onChange={(e) => setExceptTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                />
              </div>

              {/* Maintenance Message */}
              <div>
                <label className={styles.maintFormLabel}>
                  تفاصيل الرسالة التي ستظهر للزوار على الصفحات المقفولة
                </label>
                <textarea
                  className="input-fields"
                  required
                  value={exceptMessage}
                  onChange={(e) => setExceptMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    minHeight: "75px",
                  }}
                />
              </div>

              {/* Estimated Completion Countdown */}
              <div
                style={{
                  borderTop: "1px solid var(--border-glass)",
                  paddingTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={exceptIsIndefinite}
                    onChange={(e) => setExceptIsIndefinite(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#6366f1" }}
                  />
                  صيانة مفتوحة (دون عد تنازلي محدد)
                </label>

                {!exceptIsIndefinite && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        color: "#f59e0b",
                      }}
                    >
                      تاريخ ووقت الانتهاء المتوقع:
                    </label>
                    <input
                      type="datetime-local"
                      className="input-fields"
                      required={!exceptIsIndefinite}
                      value={exceptEstimatedEnd}
                      onChange={(e) => setExceptEstimatedEnd(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px" }}
                    />
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowLockAllExceptModal(false)}
                  className={styles.maintSecondaryBtn}
                  style={{ flex: 1, padding: "11px" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving || excludedPaths.length === 0}
                  style={{
                    flex: 2,
                    padding: "11px",
                    borderRadius: "10px",
                    background: isSaving
                      ? "rgba(99, 102, 241, 0.4)"
                      : "linear-gradient(135deg, #6366f1, #4f46e5)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    cursor: isSaving || excludedPaths.length === 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.35)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bx bx-lock-alt" style={{ fontSize: "1.15rem" }} />
                  <span>
                    {isSaving
                      ? "جاري تطبيق القفل..."
                      : `قفل باقي الصفحات (${SITE_PAGES_LIST.filter((p) => p.path !== "all").length - excludedPaths.length}) وتفعيل الاستثناء`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 4: Confirm Delete Modal ── */}
      <CustomModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="تأكيد حذف إعداد الصيانة"
        message="هل أنت متأكد من رغبتك في حذف إعداد وقفل الصيانة لهذه الصفحة؟ سيتم فتح الصفحة تلقائياً لجميع الزوار."
        iconSrc="/images/icons3d/trash.webp"
        borderColor="rgba(239, 68, 68, 0.4)"
        primaryButton={{
          label: "نعم، احذف الإعداد",
          onClick: handleDeleteRecord,
          bgColor: "#ef4444",
          icon: <i className="bx bx-trash" />,
        }}
        secondaryButton={{
          label: "تراجع",
          onClick: () => setDeletingId(null),
          bgColor: "var(--btn-cancel)",
          icon: <i className="bx bx-x" />,
        }}
      />

      {/* ── Modal 5: Global Emergency Site Lock Confirmation Modal ── */}
      <CustomModal
        isOpen={showGlobalToggleModal}
        onClose={() => setShowGlobalToggleModal(false)}
        title={
          isGlobalMaintenanceActive
            ? "تأكيد إلغاء قفل كامل الموقع"
            : "تأكيد قفل كامل الموقع للصيانة الطارئة"
        }
        message={
          isGlobalMaintenanceActive
            ? "هل تريد فتح كامل الموقع للزوار وإلغاء شاشة الصيانة العامة؟"
            : "تحذير: سيتم قفل كافة صفحات الموقع (ما عدا لوحة الإدارة) وتحويل جميع الزوار لشاشة الصيانة العامة. هل أنت متأكد؟"
        }
        iconSrc="/images/icons3d/alert.webp"
        borderColor={
          isGlobalMaintenanceActive ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.5)"
        }
        primaryButton={{
          label: isGlobalMaintenanceActive ? "فتح الموقع للكل" : "نعم، اقفل كامل الموقع",
          onClick: handleToggleGlobalSite,
          bgColor: isGlobalMaintenanceActive ? "#10b981" : "#ef4444",
          icon: (
            <i className={`bx ${isGlobalMaintenanceActive ? "bx-lock-open" : "bx-lock-alt"}`} />
          ),
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setShowGlobalToggleModal(false),
          bgColor: "var(--btn-cancel)",
          icon: <i className="bx bx-x" />,
        }}
      />
    </div>
  );
}
