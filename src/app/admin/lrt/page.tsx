"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import clsx from "clsx";
import { STATION_DETAILS } from "@/app/lrt/page";

// ── Default Mock / Seed Data ──
const DEFAULT_LRT: any[] = [
  { name: "عدلي منصور", line_type: "trunk", station_order: 1 },
  { name: "العبور", line_type: "trunk", station_order: 2 },
  { name: "المستقبل", line_type: "trunk", station_order: 3 },
  { name: "الشروق", line_type: "trunk", station_order: 4 },
  { name: "هليوبوليس الجديدة", line_type: "trunk", station_order: 5 },
  { name: "بدر", line_type: "trunk", station_order: 6 },
  { name: "الروبيكي", line_type: "capital", station_order: 1 },
  { name: "حدائق العاصمة", line_type: "capital", station_order: 2 },
  { name: "مطار العاصمة", line_type: "capital", station_order: 3 },
  { name: "مدينة الفنون والثقافة", line_type: "capital", station_order: 4 },
  { name: "المنطقة الصناعية", line_type: "ramadan", station_order: 1 },
  { name: "مدينة المعرفة", line_type: "ramadan", station_order: 2 }
];

export default function AdminLrtPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>جاري التحميل...</div>}>
      <AdminLrtInner />
    </Suspense>
  );
}

function AdminLrtInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<boolean>(true);

  // Table Data States
  const [lrtData, setLrtData] = useState<any[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [adminActiveLrtLine, setAdminActiveLrtLine] = useState<"all" | "trunk" | "capital" | "ramadan">("all");

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setLrtData(getLocalData());
      setDbStatus(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lrt_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error) {
        console.warn("Failed to fetch from lrt_stations, using fallback.", error);
        setLrtData(getLocalData());
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
          updated.status = item.status || STATION_DETAILS[item.name]?.status || "تشغيل فعلي";
          return updated;
        }) : [];

        // Sort by line_type then station_order
        mappedData.sort((a, b) => {
          if (a.line_type !== b.line_type) {
            return a.line_type.localeCompare(b.line_type);
          }
          return (a.station_order || 0) - (b.station_order || 0);
        });

        setLrtData(mappedData);
        setDbStatus(true);
      }
    } catch (err) {
      console.error(err);
      setLrtData(getLocalData());
      setDbStatus(false);
    }
  };

  const getLocalData = () => {
    if (typeof window === "undefined") return DEFAULT_LRT;
    const local = localStorage.getItem("local_lrt");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            let updated = { ...item };
            if (item.landmarks === undefined || item.landmarks === null || (Array.isArray(item.landmarks) && item.landmarks.length === 0)) {
              const staticInfo = STATION_DETAILS[item.name];
              if (staticInfo) {
                updated.landmarks = staticInfo.landmarks;
              }
            }
            updated.status = item.status || STATION_DETAILS[item.name]?.status || "تشغيل فعلي";
            return updated;
          });
        }
        return parsed;
      } catch {
        return DEFAULT_LRT;
      }
    }
    localStorage.setItem("local_lrt", JSON.stringify(DEFAULT_LRT));
    return DEFAULT_LRT;
  };

  const saveLocalData = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_lrt", JSON.stringify(data));
    }
  };

  const handleOpenAdd = () => {
    setError("");
    setSuccess("");
    setEditingItem(null);
    setFormData({ name: "", line_type: "trunk", station_order: 1, landmarks: "", status: "تشغيل فعلي" });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      ...item,
      landmarks: Array.isArray(item.landmarks) ? item.landmarks.join(", ") : item.landmarks || "",
      status: item.status || "تشغيل فعلي"
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
            .from("lrt_stations")
            .update(payload)
            .eq("id", editingItem.id);
        } else {
          query = supabase
            .from("lrt_stations")
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
        if (err.message && (err.message.includes("status") || err.message.includes("column"))) {
          errMsg += " (تنبيه: قد يكون عمود status غير موجود في جدول قاعدة البيانات. يرجى تشغيل كود SQL التالي في لوحة تحكم Supabase لتحديث الجداول: ALTER TABLE public.lrt_stations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'تشغيل فعلي'; ALTER TABLE public.monorail_stations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'تشغيل فعلي';)";
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
        setSuccess("تم تعديل المحطة بنجاح محلياً (LocalStorage).");
      } else {
        const newRecord = {
          id: Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        };
        currentLocal = [newRecord, ...currentLocal];
        setSuccess("تم إضافة المحطة بنجاح محلياً (LocalStorage).");
      }
      saveLocalData(currentLocal);
      setLrtData(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("هل أنت متأكد من حذف هذه المحطة؟")) return;
    setError("");
    setSuccess("");

    if (dbStatus && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("lrt_stations")
          .delete()
          .eq("id", item.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف المحطة بنجاح من قاعدة البيانات.");
        await fetchServiceData();
      } catch (err: any) {
        console.error(err);
        setError("فشل الحذف في قاعدة البيانات: " + err.message);
      }
    } else {
      let currentLocal = getLocalData();
      currentLocal = currentLocal.filter((localItem: any) => {
        if (item.id && localItem.id !== item.id) return true;
        if (!item.id && localItem.name !== item.name) return true;
        return false;
      });
      saveLocalData(currentLocal);
      setLrtData(currentLocal);
      setSuccess("تم حذف المحطة بنجاح محلياً (LocalStorage).");
    }
  };

  // Filtered rows
  const getFilteredRows = () => {
    let raw = [...lrtData];
    if (adminActiveLrtLine !== "all") {
      raw = raw.filter((item: any) => item.line_type === adminActiveLrtLine);
    }

    // Sort by line_type and order
    raw.sort((a, b) => {
      if (a.line_type !== b.line_type) {
        return a.line_type.localeCompare(b.line_type);
      }
      return (a.station_order || 0) - (b.station_order || 0);
    });

    if (!searchQuery) return raw;
    return raw.filter((item: any) => {
      const nameMatch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const landmarkMatch = Array.isArray(item.landmarks)
        ? item.landmarks.some((l: string) => l.toLowerCase().includes(searchQuery.toLowerCase()))
        : false;
      return nameMatch || landmarkMatch;
    });
  };

  const filteredRows = getFilteredRows();

  if (authLoading || loading) {
    return (
      <div className={styles.adminShell} style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.05)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>جاري تحميل إدارة القطار الكهربائي...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>

      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-primary, #fff)", marginBottom: "6px" }}>
            إدارة القطار الكهربائي LRT
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            إضافة وتعديل وحذف محطات القطار الكهربائي الخفيف (LRT) والمعالم القريبة.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "10px 20px" }}>
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          <span>إضافة محطة جديدة</span>
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
            لم يتم العثور على جدول قاعدة البيانات المناسب لـ `lrt_stations` في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها في متصفحك الحالي فقط كحفظ احتياطي مؤقت.
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
            placeholder="البحث عن محطة أو معلم قريب..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ios-input"
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
          إجمالي المحطات: {filteredRows.length}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>عرض خط سير الرحلة:</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "جميع المحطات", color: "#818cf8" },
                { id: "trunk", label: "الجذع الرئيسي (عدلي منصور - بدر)", color: "#3b82f6" },
                { id: "capital", label: "تفريعة العاصمة (بدر - الفنون)", color: "#8b5cf6" },
                { id: "ramadan", label: "تفريعة العاشر (بدر - المعرفة)", color: "#ec4899" }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAdminActiveLrtLine(opt.id as any)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    fontWeight: "800",
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    border: "1px solid",
                    borderColor: adminActiveLrtLine === opt.id ? opt.color : "var(--border-glass)",
                    background: adminActiveLrtLine === opt.id ? `rgba(${opt.id === "trunk" ? "59, 130, 246" : opt.id === "capital" ? "139, 92, 246" : opt.id === "ramadan" ? "236, 72, 153" : "99, 102, 241"}, 0.15)` : "var(--bg-secondary)",
                    color: adminActiveLrtLine === opt.id ? opt.color : "var(--text-secondary)"
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
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", padding: "48px", borderRadius: "16px", textAlign: "center", color: "var(--text-muted, #94a3b8)" }}>
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
                  let lineColor = "#6366f1";
                  let lineName = "";
                  if (station.line_type === "trunk") { lineColor = "#3b82f6"; lineName = "الجذع الرئيسي"; }
                  else if (station.line_type === "capital") { lineColor = "#8b5cf6"; lineName = "تفريعة العاصمة"; }
                  else if (station.line_type === "ramadan") { lineColor = "#ec4899"; lineName = "تفريعة العاشر"; }

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
                      <td className={styles.adminTd} style={{ fontWeight: "bold", color: "var(--text-primary)", width: "13%" }}>
                        {station.name}
                      </td>
                      <td className={styles.adminTd} style={{ width: "12%" }}>
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
                                color: "var(--text-primary, #e2e8f0)",
                                padding: "2px 6px",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                border: "1px solid var(--border-glass)"
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
                          background: station.status === "تحت الإنشاء" ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                          color: station.status === "تحت الإنشاء" ? "#ef4444" : "#10b981",
                          border: `1px solid ${station.status === "تحت الإنشاء" ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.25)"}`,
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
                              background: "var(--bg-secondary)",
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
            border: "1px solid var(--border-glass)",
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
              borderBottom: "1px solid var(--border-glass)"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>
                {editingItem ? "تعديل محطة القطار الكهربائي" : "إضافة محطة قطار كهربائي جديدة"}
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
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المسار / الخط *</label>
                <select
                  value={formData.line_type || "trunk"}
                  onChange={e => setFormData({ ...formData, line_type: e.target.value })}
                  className="ios-input"

                >
                  <option value="trunk">الجذع الرئيسي (عدلي منصور - بدر)</option>
                  <option value="capital">تفريعة العاصمة (بدر - الفنون)</option>
                  <option value="ramadan">تفريعة العاشر (بدر - المعرفة)</option>
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
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المعالم والأماكن القريبة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="مثال: مدينة المعرفة، جامعة السويدي"
                  value={formData.landmarks || ""}
                  onChange={e => setFormData({ ...formData, landmarks: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>حالة المحطة *</label>
                <select
                  value={formData.status || "تشغيل فعلي"}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                >
                  <option value="تشغيل فعلي">تشغيل فعلي (في الخدمة)</option>
                  <option value="تحت الإنشاء">تحت الإنشاء (ليست في الخدمة)</option>
                </select>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "12px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-glass)"
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="ios-btn"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="ios-btn"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff" }}
                >
                  {editingItem ? "حفظ التغييرات" : "إضافة المحطة"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
