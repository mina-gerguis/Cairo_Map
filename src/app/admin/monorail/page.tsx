"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import { STATION_DETAILS } from "@/app/monorail/page";
import clsx from "clsx";
import CustomModal from "@/components/common/Modals";

// ── Default Mock / Seed Data ──
const DEFAULT_MONORAIL: any[] = [
  { name: "الاستاد", line_type: "east", station_order: 1 },
  { name: "هشام بركات", line_type: "east", station_order: 2 },
  { name: "نوري خطاب", line_type: "east", station_order: 3 },
  { name: "الحي السابع", line_type: "east", station_order: 4 },
  { name: "ذاكر حسين", line_type: "east", station_order: 5 },
  { name: "المنطقة الحرة", line_type: "east", station_order: 6 },
  { name: "المشير طنطاوي", line_type: "east", station_order: 7 },
  { name: "وان قطامية", line_type: "east", station_order: 8 },
  { name: "المستثمرين", line_type: "east", station_order: 9 },
  { name: "النسيم", line_type: "east", station_order: 10 },
  { name: "الجامعة الأمريكية", line_type: "east", station_order: 11 },
  { name: "إعمار", line_type: "east", station_order: 12 },
  { name: "ميدان النافورة", line_type: "east", station_order: 13 },
  { name: "البروة", line_type: "east", station_order: 14 },
  { name: "بيت الوطن", line_type: "east", station_order: 15 },
  { name: "مسجد الفتاح العليم", line_type: "east", station_order: 16 },
  { name: "الحي السكني R2", line_type: "east", station_order: 17 },
  { name: "الدائري الإقليمي", line_type: "east", station_order: 18 },
  { name: "فندق الماسة", line_type: "east", station_order: 19 },
  { name: "الحي الحكومي", line_type: "east", station_order: 20 },
  { name: "حي السفارات", line_type: "east", station_order: 21 },
  { name: "مدينة الفنون والثقافة", line_type: "east", station_order: 22 },
  { name: "أكتوبر الجديدة", line_type: "west", station_order: 1 },
  { name: "المنطقة الصناعية", line_type: "west", station_order: 2 },
  { name: "السادات", line_type: "west", station_order: 3 },
  { name: "جهاز مدينة 6 أكتوبر", line_type: "west", station_order: 4 },
  { name: "جمعية المهندسين", line_type: "west", station_order: 5 },
  { name: "جامعة النيل", line_type: "west", station_order: 6 },
  { name: "هايبر وان", line_type: "west", station_order: 7 },
  { name: "الصحراوي", line_type: "west", station_order: 8 },
  { name: "المنصورية", line_type: "west", station_order: 9 },
  { name: "المريوطية", line_type: "west", station_order: 10 },
  { name: "الطريق الدائري", line_type: "west", station_order: 11 },
  { name: "العريش", line_type: "west", station_order: 12 },
  { name: "المطبغة", line_type: "west", station_order: 13 },
  { name: "بولاق الدكرور", line_type: "west", station_order: 14 },
  { name: "جامعة الدول العربية", line_type: "west", station_order: 15 },
  { name: "وادي النيل", line_type: "west", station_order: 16 }
];

export default function AdminMonorailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-textSecondary)" }}>جاري التحميل...</div>}>
      <AdminMonorailInner />
    </Suspense>
  );
}

function AdminMonorailInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<boolean>(true);

  // Table Data States
  const [monorailData, setMonorailData] = useState<any[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [adminActiveMonorailLine, setAdminActiveMonorailLine] = useState<"all" | "east" | "west">("all");

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stationToDelete, setStationToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        checkAdmin();
      }
    }
  }, [user, authLoading]);

  const checkAdmin = async () => {
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
        loadAllData();
      }
    } catch (err) {
      console.error(err);
      router.push("/");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await fetchServiceData();
    setLoading(false);
  };

  const fetchServiceData = async () => {
    if (!supabase) {
      setMonorailData(getLocalData());
      setDbStatus(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("monorail_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error) {
        console.warn("Failed to fetch from monorail_stations, using fallback.", error);
        setMonorailData(getLocalData());
        setDbStatus(false);
      } else {
        const mappedData = data ? data.map(item => {
          let updated = { ...item };
          if (item.landmarks === undefined || item.landmarks === null || (Array.isArray(item.landmarks) && item.landmarks.length === 0)) {
            const staticInfo = STATION_DETAILS[item.name];
            if (staticInfo) {
              updated.landmarks = staticInfo.landmarks;
            }
          }
          updated.status = item.status || STATION_DETAILS[item.name]?.status || "تحت الإنشاء";
          return updated;
        }) : [];

        // Sort by line_type then station_order
        mappedData.sort((a, b) => {
          if (a.line_type !== b.line_type) {
            return a.line_type.localeCompare(b.line_type);
          }
          return (a.station_order || 0) - (b.station_order || 0);
        });

        setMonorailData(mappedData);
        setDbStatus(true);
      }
    } catch (err) {
      console.error(err);
      setMonorailData(getLocalData());
      setDbStatus(false);
    }
  };

  const getLocalData = () => {
    if (typeof window === "undefined") return DEFAULT_MONORAIL;
    const local = localStorage.getItem("local_monorail");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            let updated = { ...item };
            if (item.landmarks === undefined || item.landmarks === null || (Array.isArray(item.landmarks) && item.landmarks.length === 0)) {
              const staticInfo = STATION_DETAILS[item.name];
              if (staticInfo) {
                updated.landmarks = staticInfo.landmarks;
              }
            }
            updated.status = item.status || STATION_DETAILS[item.name]?.status || "تحت الإنشاء";
            return updated;
          });
        }
        return parsed;
      } catch {
        return DEFAULT_MONORAIL;
      }
    }
    localStorage.setItem("local_monorail", JSON.stringify(DEFAULT_MONORAIL));
    return DEFAULT_MONORAIL;
  };

  const saveLocalData = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_monorail", JSON.stringify(data));
    }
  };

  const handleOpenAdd = () => {
    setError("");
    setSuccess("");
    setEditingItem(null);
    setFormData({ name: "", line_type: "east", station_order: 1, landmarks: "", status: "تحت الإنشاء" });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      ...item,
      landmarks: Array.isArray(item.landmarks) ? item.landmarks.join(", ") : item.landmarks || "",
      status: item.status || "تحت الإنشاء"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Format fields
    let payload = { ...formData };
    payload.landmarks = typeof formData.landmarks === "string"
      ? formData.landmarks.split(",").map((s: string) => s.trim()).filter(Boolean)
      : formData.landmarks || [];

    if (dbStatus && supabase) {
      try {
        let query;
        if (editingItem) {
          query = supabase
            .from("monorail_stations")
            .update(payload)
            .eq("id", editingItem.id);
        } else {
          query = supabase
            .from("monorail_stations")
            .insert([payload]);
        }

        const { error: dbErr } = await query;
        if (dbErr) throw dbErr;

        setSuccess(editingItem ? "تم تعديل المحطة بنجاح في قاعدة البيانات." : "تم إضافة المحطة بنجاح لقاعدة البيانات.");
        await fetchServiceData();
        setShowModal(false);
      } catch (err: any) {
        console.error(err);
        let errMsg = "فشلت العملية في قاعدة البيانات: " + err.message;
        if (err.message && (err.message.includes("landmarks") || err.message.includes("status") || err.message.includes("column"))) {
          errMsg += " (تنبيه: قد يكون عمود landmarks أو status غير موجود في جدول قاعدة البيانات. يرجى تشغيل كود SQL التالي في لوحة تحكم Supabase لتحديث الجداول: ALTER TABLE public.monorail_stations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'تشغيل فعلي'; ALTER TABLE public.monorail_stations ADD COLUMN IF NOT EXISTS landmarks JSONB DEFAULT '[]'::jsonb;)";
        }
        setError(errMsg);
      }
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalData();
      if (editingItem) {
        currentLocal = currentLocal.map((item: any) => {
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
        const newRecord = {
          id: Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        };
        currentLocal = [newRecord, ...currentLocal];
        setSuccess("تم إضافة السجل بنجاح محلياً (LocalStorage).");
      }
      saveLocalData(currentLocal);
      setMonorailData(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = (item: any) => {
    setStationToDelete(item);
  };

  const confirmDelete = async () => {
    if (!stationToDelete) return;
    setIsDeleting(true);
    setError("");
    setSuccess("");

    if (dbStatus && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("monorail_stations")
          .delete()
          .eq("id", stationToDelete.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف السجل بنجاح من قاعدة البيانات.");
        await fetchServiceData();
        setStationToDelete(null);
      } catch (err: any) {
        console.error(err);
        setError("فشل الحذف في قاعدة البيانات: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    } else {
      let currentLocal = getLocalData();
      currentLocal = currentLocal.filter((localItem: any) => {
        if (stationToDelete.id && localItem.id !== stationToDelete.id) return true;
        if (!stationToDelete.id && localItem.name !== stationToDelete.name) return true;
        return false;
      });
      saveLocalData(currentLocal);
      setMonorailData(currentLocal);
      setSuccess("تم حذف السجل بنجاح محلياً (LocalStorage).");
      setStationToDelete(null);
      setIsDeleting(false);
    }
  };

  // Filtered rows based on active tab and search query
  const getFilteredRows = () => {
    let raw = [...monorailData];

    // Filter by line type (east / west)
    if (adminActiveMonorailLine !== "all") {
      raw = raw.filter(item => item.line_type === adminActiveMonorailLine);
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      raw = raw.filter(item => {
        const nameMatch = item.name?.toLowerCase().includes(q);
        const landmarksMatch = Array.isArray(item.landmarks)
          ? item.landmarks.some((l: string) => l.toLowerCase().includes(q))
          : false;
        return nameMatch || landmarksMatch;
      });
    }

    // Always sort by station_order within the group/list
    return raw.sort((a, b) => (a.station_order || 0) - (b.station_order || 0));
  };

  const filteredRows = getFilteredRows();

  if (authLoading || loading) {
    return (
      <div className={styles.adminShell} style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.05)", borderTopColor: "var(--colorSecondary, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem" }}>جاري تحميل إدارة المونوريل...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>

      {/* Upper Status/Welcome banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--textPrimary, #fff)", marginBottom: "6px" }}>
            إدارة شبكة المونوريل
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            تحرير وتحديث مسار ومحطات مونوريل شرق النيل وغرب النيل بالقاهرة الكبرى.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff", padding: "10px 20px" }}>
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          إضافة محطة مونوريل
        </button>
      </div>

      {/* SQL Warning Card if DB is using LocalStorage fallback */}
      {!dbStatus && (
        <div style={{
          background: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          padding: "16px 20px",
          borderRadius: "14px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f59e0b", fontWeight: "bold" }}>
            <i className="bx bx-warning" style={{ fontSize: "1.3rem" }} />
            <span>يعمل في وضع الحفظ المحلي (LocalStorage)</span>
          </div>
          <p style={{ color: "#d97706", fontSize: "0.85rem", margin: 0, lineHeight: "1.6" }}>
            لم يتم العثور على جدول قاعدة البيانات المناسب لخدمة المونوريل في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها في متصفحك الحالي فقط كحفظ احتياطي مؤقت.
            لتفعيل حفظ التغييرات لكل مستخدمي الموقع بشكل دائم، يرجى فتح تبويب **SQL Editor** في لوحة تحكم Supabase الخاصة بك، وتشغيل السكريبت المناسب.
          </p>
        </div>
      )}

      {/* Search Input bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
          <i className="bx bx-search" style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted, #94a3b8)",
            fontSize: "1.2rem"
          }} />
          <input
            type="text"
            placeholder="البحث عن محطة، أو معالم قريبة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-fields"
            style={{
              width: "100%",
              paddingRight: "44px",
              borderRadius: "12px",
              height: "46px",
              fontSize: "0.95rem",
              outline: "none",
              transition: "all 0.2s"
            }}
          />
        </div>

        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          إجمالي المحطات المعروضة: {filteredRows.length}
        </div>
      </div>

      {/* Notification Banner */}
      {success && (
        <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "12px 16px", borderRadius: "10px", color: "#10b981", marginBottom: "16px", fontSize: "0.9rem" }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "12px 16px", borderRadius: "10px", color: "#ef4444", marginBottom: "16px", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {/* Segmented Line Control & Visual View */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>

        {/* Segmented Line Control */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", background: "var(--bgGlass)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#94a3b8" }}>عرض خط سير الرحلة:</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "جميع المحطات", color: "#818cf8" },
                { id: "east", label: "شرق النيل (العاصمة الإدارية)", color: "#3b82f6" },
                { id: "west", label: "غرب النيل (6 أكتوبر)", color: "#10b981" }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAdminActiveMonorailLine(opt.id as any)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    fontWeight: "800",
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    border: "1px solid",
                    borderColor: adminActiveMonorailLine === opt.id ? opt.color : "rgba(255,255,255,0.08)",
                    background: adminActiveMonorailLine === opt.id ? `rgba(${opt.id === "west" ? "16, 185, 129" : opt.id === "east" ? "59, 130, 246" : "99, 102, 241"}, 0.15)` : "rgba(255,255,255,0.02)",
                    color: adminActiveMonorailLine === opt.id ? opt.color : "#94a3b8"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View */}
        {filteredRows.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--borderGlass)", padding: "48px", borderRadius: "16px", textAlign: "center", color: "var(--text-muted, #94a3b8)" }}>
            لا توجد أي محطات مطابقة لخط البحث الحالي.
          </div>
        ) : (
          <div className={styles.tableCard} style={{ overflowX: "auto" }}>
            <table className={styles.adminTable} style={{ width: "100%" }}>
              <thead className={styles.adminThead}>
                <tr className={styles.adminTr}>
                  <th className={styles.adminTh} style={{ width: "80px", textAlign: "center" }}>الترتيب</th>
                  <th className={styles.adminTh}>اسم المحطة</th>
                  <th className={styles.adminTh}>الخط / المسار</th>
                  <th className={styles.adminTh}>المعالم والأماكن القريبة</th>
                  <th className={styles.adminTh} style={{ width: "120px" }}>حالة المحطة</th>
                  <th className={styles.adminTh} style={{ textAlign: "center", width: "120px" }}>خيارات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((station, index) => {
                  const isEast = station.line_type === "east";
                  const lineColor = isEast ? "#3b82f6" : "#10b981";
                  const lineName = isEast ? "شرق النيل (العاصمة)" : "غرب النيل (أكتوبر)";

                  return (
                    <tr key={station.id || index} className={styles.adminTr}>
                      <td className={styles.adminTd} style={{ textAlign: "center", fontWeight: "bold" }}>
                        <span style={{
                          background: lineColor + "15",
                          color: lineColor,
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          border: `1px solid ${lineColor}25`
                        }}>
                          {station.station_order}
                        </span>
                      </td>
                      <td className={styles.adminTd} style={{ fontWeight: "bold", color: "var(--ext-primary)" }}>
                        {station.name}
                      </td>
                      <td className={styles.adminTd}>
                        <span style={{
                          fontSize: "0.75rem",
                          background: lineColor + "15",
                          color: lineColor,
                          border: `1px solid ${lineColor}30`,
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: "bold"
                        }}>
                          {lineName}
                        </span>
                      </td>
                      <td className={styles.adminTd}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {station.landmarks && Array.isArray(station.landmarks) && station.landmarks.length > 0 ? (
                            (station.landmarks as string[]).map((landmark: string, lIdx: number) => (
                              <span key={lIdx} style={{
                                fontSize: "0.73rem",
                                background: "rgba(255,255,255,0.02)",
                                color: "var(--textPrimary, #e2e8f0)",
                                padding: "2px 6px",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                border: "1px solid var(--borderGlass)"
                              }}>
                                <i className="bx bx-map-pin" style={{ color: lineColor, fontSize: "0.75rem" }} />
                                {landmark}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "#475569", fontStyle: "italic" }}>
                              لم يتم تحديد معالم قريبة
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={styles.adminTd} style={{ width: "10%" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          background: station.status === "تحت الإنشاء" ? "rgba(239, 68, 68, 0.12)" : (station.status === "تشغيل تجريبي" ? "rgba(251, 191, 36, 0.12)" : "rgba(16, 185, 129, 0.12)"),
                          color: station.status === "تحت الإنشاء" ? "#ef4444" : (station.status === "تشغيل تجريبي" ? "#fbbf24" : "#10b981"),
                          border: `1px solid ${station.status === "تحت الإنشاء" ? "rgba(239, 68, 68, 0.25)" : (station.status === "تشغيل تجريبي" ? "rgba(251, 191, 36, 0.25)" : "rgba(16, 185, 129, 0.25)")}`,
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: "bold"
                        }}>
                          {station.status || "تشغيل فعلي"}
                        </span>
                      </td>
                      <td className={styles.adminTd} style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(station)}
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            title="تعديل"
                            style={{
                              padding: "5px 5px",
                              borderRadius: "50%",
                              background: "var(--bgSecondary)",
                            }}
                          >
                            <i className="bx bx-edit-alt" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(station)}
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            title="حذف"
                            style={{
                              padding: "5px 5px",
                              borderRadius: "50%",
                              background: "#ff000025",
                              color: "#ff0000f5",
                              border: "#ff000025",
                            }}
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add / Edit Dialog Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(5, 8, 16, 0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            background: "#0b0f19",
            border: "1px solid var(--borderGlass)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            overflow: "hidden"
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: "1px solid var(--borderGlass)"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>
                {editingItem ? "تعديل محطة مونوريل" : "إضافة محطة مونوريل جديدة"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>اسم المحطة *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المسار / الخط *</label>
                <select
                  value={formData.line_type || "east"}
                  onChange={e => setFormData({ ...formData, line_type: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%", background: "#ffffffff" }}
                >
                  <option value="east">شرق النيل (العاصمة الإدارية)</option>
                  <option value="west">غرب النيل (6 أكتوبر)</option>
                </select>
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>ترتيب المحطة في المسار *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.station_order || 1}
                  onChange={e => setFormData({ ...formData, station_order: parseInt(e.target.value) })}
                  className="input-fields"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المعالم والأماكن القريبة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="مثال: ستاد القاهرة الدولي, مسجد آل رشدان, نادي الزهور الرياضي"
                  value={formData.landmarks || ""}
                  onChange={e => setFormData({ ...formData, landmarks: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>حالة المحطة *</label>
                <select
                  value={formData.status || "تحت الإنشاء"}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%" }}
                >
                  <option value="تشغيل تجريبي">تشغيل تجريبي (تجريبي)</option>
                  <option value="تحت الإنشاء">تحت الإنشاء (ليست في الخدمة)</option>
                  <option value="تشغيل فعلي">تشغيل فعلي (في الخدمة)</option>
                </select>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "12px",
                paddingTop: "16px",
                borderTop: "1px solid var(--borderGlass)"
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff" }}
                >
                  {editingItem ? "حفظ التغييرات" : "إضافة المحطة"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(stationToDelete)}
        onClose={() => !isDeleting && setStationToDelete(null)}
        title="تأكيد الحذف"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message="هل أنت متأكد من حذف هذه المحطة؟"
        primaryButton={{
          label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
          onClick: confirmDelete,
          bgColor: "#ff3b30",
          disabled: isDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setStationToDelete(null),
          bgColor: "var(--cancelBtn)",
          disabled: isDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        {stationToDelete && (
          <p style={{ margin: "0", color: "#ff4d4d", fontSize: "1.05rem", fontWeight: "bold", textAlign: "center" }}>
            « {stationToDelete.name} »
          </p>
        )}
      </CustomModal>
    </div>
  );
}
