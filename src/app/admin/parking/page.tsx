"use client";

import React, { useState, useEffect, Suspense } from "react";
import clxs from "clsx";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import CustomModal from "@/components/common/Modals";

const DEFAULT_PARKING: any[] = [];

export default function AdminParkingPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-textSecondary)" }}>جاري التحميل...</div>}>
      <AdminParkingInner />
    </Suspense>
  );
}

function AdminParkingInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parkingData, setParkingData] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    area: "",
    address: "",
    nearestMetro: "",
    hourlyRate: 0,
    maxDailyRate: "",
    capacity: 0,
    type: "مغطى ومتعدد الطوابق 🏢",
    hours: "24 ساعة طوال الأسبوع",
    features: "",
    mapLocationLink: ""
  });

  const getLocalData = (): any[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_parking_spots");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          return DEFAULT_PARKING;
        }
      }
    }
    return DEFAULT_PARKING;
  };

  const saveLocalData = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_parking_spots", JSON.stringify(data));
    }
  };

  const mapDBToJs = (dbItem: any) => ({
    id: dbItem.id,
    name: dbItem.name,
    area: dbItem.area,
    address: dbItem.address,
    nearestMetro: dbItem.nearest_metro || dbItem.nearestMetro || "",
    hourlyRate: dbItem.hourly_rate ?? dbItem.hourlyRate ?? 0,
    maxDailyRate: dbItem.max_daily_rate !== null && dbItem.max_daily_rate !== undefined ? dbItem.max_daily_rate : (dbItem.maxDailyRate !== undefined ? dbItem.maxDailyRate : ""),
    capacity: dbItem.capacity ?? 0,
    type: dbItem.type,
    hours: dbItem.hours,
    features: Array.isArray(dbItem.features) ? dbItem.features : (typeof dbItem.features === 'string' ? JSON.parse(dbItem.features) : []),
    mapLocationLink: dbItem.map_location_link || dbItem.mapLocationLink || ""
  });

  const mapJsToDB = (jsItem: any) => ({
    name: jsItem.name,
    area: jsItem.area,
    address: jsItem.address,
    nearest_metro: jsItem.nearestMetro || "",
    hourly_rate: Number(jsItem.hourlyRate ?? 0),
    max_daily_rate: jsItem.maxDailyRate !== "" && jsItem.maxDailyRate !== null && jsItem.maxDailyRate !== undefined ? Number(jsItem.maxDailyRate) : null,
    capacity: Number(jsItem.capacity ?? 0),
    type: jsItem.type,
    hours: jsItem.hours,
    features: Array.isArray(jsItem.features) ? jsItem.features : (typeof jsItem.features === "string" ? jsItem.features.split(",").map((f: string) => f.trim()).filter(Boolean) : []),
    map_location_link: jsItem.mapLocationLink || ""
  });

  const fetchParkingData = async () => {
    if (!supabase) {
      setParkingData(getLocalData());
      setDbStatus(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("parking_spots").select("*");
      if (error) {
        console.warn("Failed to fetch parking spots, using fallback.", error);
        setParkingData(getLocalData());
        setDbStatus(false);
      } else {
        const mappedData = data ? data.map(mapDBToJs) : [];

        // Match up with default local array for complete seed coverage
        const dbNames = new Set(mappedData.map(d => (d.name || "").toLowerCase()));
        const missingLocals = DEFAULT_PARKING.filter(lp => !dbNames.has((lp.name || "").toLowerCase()));

        setParkingData([...mappedData, ...missingLocals]);
        setDbStatus(true);
      }
    } catch (err) {
      console.error(err);
      setParkingData(getLocalData());
      setDbStatus(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      if (!supabase) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error || !data?.is_admin) {
          router.push("/");
        } else {
          setIsAdmin(true);
          await fetchParkingData();
        }
      } catch (err) {
        console.error("Admin status error:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  const handleOpenAdd = () => {
    setError("");
    setSuccess("");
    setEditingItem(null);
    setFormData({
      name: "",
      area: "",
      address: "",
      nearestMetro: "",
      hourlyRate: 0,
      maxDailyRate: "",
      capacity: 0,
      type: "مغطى ومتعدد الطوابق 🏢",
      hours: "24 ساعة طوال الأسبوع",
      features: "",
      mapLocationLink: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      ...item,
      features: Array.isArray(item.features) ? item.features.join(", ") : item.features || "",
      maxDailyRate: item.maxDailyRate !== null && item.maxDailyRate !== undefined ? item.maxDailyRate : ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const mapped = mapJsToDB(formData);

    if (dbStatus && supabase) {
      try {
        let query;
        if (editingItem) {
          query = supabase
            .from("parking_spots")
            .update(mapped)
            .eq("id", editingItem.id);
        } else {
          query = supabase
            .from("parking_spots")
            .insert([mapped]);
        }

        const { error: dbErr } = await query;
        if (dbErr) throw dbErr;

        setSuccess(editingItem ? "تم تحديث بيانات الجراج بنجاح." : "تم إضافة الجراج بنجاح.");
        await fetchParkingData();
        setShowModal(false);
      } catch (err: any) {
        console.error(err);
        setError("فشلت العملية في قاعدة البيانات: " + err.message);
      }
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalData();
      const updatedFeatures = typeof formData.features === "string"
        ? formData.features.split(",").map((f: string) => f.trim()).filter(Boolean)
        : formData.features;

      const preparedItem = {
        ...formData,
        features: updatedFeatures,
        hourlyRate: Number(formData.hourlyRate),
        maxDailyRate: formData.maxDailyRate !== "" ? Number(formData.maxDailyRate) : null,
        capacity: Number(formData.capacity)
      };

      if (editingItem) {
        currentLocal = currentLocal.map((item) => {
          if (editingItem.id && item.id === editingItem.id) {
            return { ...item, ...preparedItem };
          }
          if (!editingItem.id && item.name === editingItem.name) {
            return { ...item, ...preparedItem };
          }
          return item;
        });
        setSuccess("تم تحديث بيانات الجراج محلياً بنجاح.");
      } else {
        const newRecord = {
          id: "p_" + Math.random().toString(36).substr(2, 9),
          ...preparedItem
        };
        currentLocal.push(newRecord);
        setSuccess("تم إضافة الجراج محلياً بنجاح.");
      }
      saveLocalData(currentLocal);
      setParkingData(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setError("");
    setSuccess("");

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(itemToDelete.id));

    if (dbStatus && supabase && isUUID) {
      try {
        const { error: dbErr } = await supabase
          .from("parking_spots")
          .delete()
          .eq("id", itemToDelete.id);

        if (dbErr) throw dbErr;

        setSuccess("تم حذف الجراج بنجاح.");
        await fetchParkingData();
        setItemToDelete(null);
      } catch (err: any) {
        console.error(err);
        setError("فشل حذف الجراج: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    } else {
      // Local Storage delete
      let currentLocal = getLocalData();
      currentLocal = currentLocal.filter((s: any) => {
        if (itemToDelete.id && s.id === itemToDelete.id) return false;
        if (!itemToDelete.id && s.name === itemToDelete.name) return false;
        return true;
      });
      saveLocalData(currentLocal);
      setParkingData(currentLocal);
      setSuccess("تم حذف الجراج محلياً بنجاح.");
      setItemToDelete(null);
      setIsDeleting(false);
    }
  };

  const filteredRows = parkingData.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.area && item.area.toLowerCase().includes(q)) ||
      (item.address && item.address.toLowerCase().includes(q)) ||
      (item.nearestMetro && item.nearestMetro.toLowerCase().includes(q))
    );
  });

  if (loading || authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <span>جاري تحميل الجراجات ...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminSectionWrapper} style={{ padding: "24px" }}>
      {/* Sub header operations */}
      <div className={styles.sectionHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--textPrimary)", margin: 0, fontFamily: "var(--font-heading)" }}>
            إدارة الجراجات وخدمة "اركن واركب" (Park & Ride)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px", margin: 0 }}>
            يمكنك إضافة، تعديل، وحذف بيانات الجراجات المتاحة في التطبيق وربطها بمحطات المترو والأسعار.
          </p>
        </div>
        <button onClick={handleOpenAdd} className={styles.addButton} style={{ fontFamily: "var(--font-heading)" }}>
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          إضافة جراج جديد
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
            لم يتم العثور على جدول قاعدة البيانات المناسب للجراجات (`parking_spots`) في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها في متصفحك الحالي فقط كحفظ احتياطي مؤقت.
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
            placeholder="البحث باسم الجراج، المنطقة، أقرب محطة مترو..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-fields"
            style={{
              width: "100%",
              paddingRight: "44px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textSecondary)"
            }}
          />
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          إجمالي الجراجات: {filteredRows.length}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)", color: "#ff453a", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.2)", color: "#30d158", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem" }}>
          {success}
        </div>
      )}

      {/* Table grid */}
      <div className={styles.tableCard} style={{ overflowX: "auto" }}>
        <table className={styles.adminTable} style={{ width: "100%" }}>
          <thead className={styles.adminThead}>
            <tr className={styles.adminTr}>
              <th className={styles.adminTh}>اسم الجراج</th>
              <th className={styles.adminTh}>المنطقة</th>
              <th className={styles.adminTh}>النوع</th>
              <th className={styles.adminTh}>سعر الساعة</th>
              <th className={styles.adminTh}>السعة</th>
              <th className={styles.adminTh}>أقرب مترو</th>
              <th className={styles.adminTh} style={{ textAlign: "center" }}>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr className={styles.adminTr}>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  لا توجد أي سجلات جراجات متوفرة حالياً.
                </td>
              </tr>
            ) : (
              filteredRows.map((item, idx) => (
                <tr key={item.id || idx} className={styles.adminTr}>
                  <td className={styles.adminTd} style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="bx bx-parking" style={{ color: "#3b82f6", fontSize: "1.1rem" }} />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className={styles.adminTd}>
                    <span>{item.area}</span>
                  </td>
                  <td className={styles.adminTd}>
                    <span>{item.type}</span>
                  </td>
                  <td className={styles.adminTd}>
                    <span style={{ fontWeight: "bold", color: "#10b981" }}>{item.hourlyRate} ج.م</span>
                  </td>
                  <td className={styles.adminTd}>
                    <span>{item.capacity} سيارة</span>
                  </td>
                  <td className={styles.adminTd} title={item.nearestMetro} style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.nearestMetro}</span>
                  </td>
                  <td className={styles.adminTd}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => handleOpenEdit(item)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="تعديل"
                        style={{
                          padding: "5px",
                          borderRadius: "50%",
                          background: "var(--bgSecondary)",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        <i className="bx bx-edit-alt" />
                      </button>
                      <button onClick={() => handleDelete(item)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="حذف"
                        style={{
                          padding: "5px",
                          borderRadius: "50%",
                          background: "#ff000025",
                          color: "#ff0000f5",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        <i className="bx bx-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !isDeleting && setItemToDelete(null)}
        title="تأكيد حذف الجراج"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message={itemToDelete ? `هل أنت متأكد من رغبتك في حذف جراج "${itemToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : undefined}
        primaryButton={{
          label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
          onClick: confirmDelete,
          bgColor: "#ff3b30",
          disabled: isDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setItemToDelete(null),
          bgColor: "var(--cancelBtn)",
          disabled: isDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      />

      {/* Forms Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div className="glass-panel" style={{
            width: "100%",
            maxWidth: "650px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "30px",
            border: "1px solid var(--borderGlass)",
            background: "#0f172a",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#fff", margin: 0 }}>
                {editingItem ? "تعديل بيانات الجراج" : "إضافة جراج جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", width: "32px", height: "32px", borderRadius: "50%", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>اسم الجراج *</label>
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
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المنطقة *</label>
                  <input
                    type="text"
                    required
                    value={formData.area || ""}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>العنوان *</label>
                <input
                  type="text"
                  required
                  value={formData.address || ""}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>أقرب محطة مترو *</label>
                  <input
                    type="text"
                    required
                    value={formData.nearestMetro || ""}
                    onChange={e => setFormData({ ...formData, nearestMetro: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>نوع الجراج *</label>
                  <select
                    value={formData.type || "مغطى ومتعدد الطوابق 🏢"}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%", height: "46px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--borderGlass)", color: "#fff", borderRadius: "10px", padding: "0 10px" }}
                  >
                    <option value="مغطى ومتعدد الطوابق 🏢" style={{ color: "#000" }}>مغطى ومتعدد الطوابق 🏢</option>
                    <option value="جراج ذكي إلكتروني 🤖" style={{ color: "#000" }}>جراج ذكي إلكتروني 🤖</option>
                    <option value="جراج سطحي مفتوح 🅿️" style={{ color: "#000" }}>جراج سطحي مفتوح 🅿️</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>سعر الساعة (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.hourlyRate ?? 0}
                    onChange={e => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>الحد الأقصى اليومي (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="اختياري"
                    value={formData.maxDailyRate ?? ""}
                    onChange={e => setFormData({ ...formData, maxDailyRate: e.target.value !== "" ? Number(e.target.value) : "" })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>السعة الإجمالية (سيارات) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.capacity ?? 0}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>ساعات العمل *</label>
                  <input
                    type="text"
                    required
                    value={formData.hours || ""}
                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>رابط خرائط جوجل</label>
                  <input
                    type="text"
                    placeholder="رابط الموقع الجغرافي"
                    value={formData.mapLocationLink || ""}
                    onChange={e => setFormData({ ...formData, mapLocationLink: e.target.value })}
                    className="input-fields"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label className={clxs("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>الميزات (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="كاميرات مراقبة, أمن وحراسة, مصاعد..."
                  value={formData.features || ""}
                  onChange={e => setFormData({ ...formData, features: e.target.value })}
                  className="input-fields"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  style={{
                    background: "var(--colorSecondary, #3b82f6)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    fontFamily: "var(--font-heading)",
                    cursor: "pointer"
                  }}
                >
                  حفظ البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontFamily: "var(--font-heading)",
                    cursor: "pointer"
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
