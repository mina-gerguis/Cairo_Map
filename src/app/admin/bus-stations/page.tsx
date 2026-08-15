"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";

const DEFAULT_BUS_STATIONS: any[] = [
  {
    name: "موقف ألماظة للسوبر جيت (Almaza Terminal)",
    location: "مصر الجديدة - بجوار طريق السويس ومطار القاهرة",
    governorate: "القاهرة",
    companies: [
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "رسمي حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "شرم الشيخ", "الغردقة", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "السويس", "بورسعيد"],
    description: "أحدث محطات السوبر جيت في القاهرة. تخدم بشكل رئيسي المسافرين إلى مدن القناة، البحر الأحمر، والوجه القبلي والصعيد بتنظيم ممتاز وصالة انتظار مكيفة.",
    map_url: "https://maps.google.com/?q=Almaza+Super+Jet+Station"
  },
  {
    name: "موقف الترجمان (Cairo Gateway)",
    location: "وسط البلد - شارع الجلاء بجوار محطة مترو جمال عبد الناصر",
    governorate: "القاهرة",
    companies: [
      { name: "شركة شرق الدلتا للنقل", phone: "02-25761311", type: "حكومي" },
      { name: "شركة غرب ووسط الدلتا", phone: "02-25761211", type: "حكومي" },
      { name: "شركة الصعيد للنقل", phone: "02-25761411", type: "حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "مطروح", "المنصورة", "الزقازيق", "شبه جزيرة سيناء (العريش/طور سيناء)", "محافظات الصعيد بأكملها", "البحر الأحمر"],
    description: "المحطة المركزية الكبرى للنقل البري لجميع المحافظات والدول المجاورة. يضم مكاتب حجز لمعظم الشركات العامة والخاصة وصالة انتظار تجارية ضخمة.",
    map_url: "https://maps.google.com/?q=Torgoman+Bus+Station"
  }
];

export default function AdminBusStationsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>جاري التحميل...</div>}>
      <AdminBusStationsInner />
    </Suspense>
  );
}

function AdminBusStationsInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [busStations, setBusStations] = useState<any[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

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
        loadBusStations();
      }
    } catch (err) {
      console.error(err);
      router.push("/");
    }
  };

  const loadBusStations = async () => {
    setLoading(true);
    if (!supabase) {
      setBusStations(getLocalData());
      setDbConnected(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("bus_stations").select("*");
      if (error) {
        console.warn("Failed to fetch from bus_stations, using fallback.", error);
        setBusStations(getLocalData());
        setDbConnected(false);
      } else {
        setBusStations(data || []);
        setDbConnected(true);
      }
    } catch (err) {
      console.error(err);
      setBusStations(getLocalData());
      setDbConnected(false);
    }
    setLoading(false);
  };

  const getLocalData = () => {
    if (typeof window === "undefined") return DEFAULT_BUS_STATIONS;
    const local = localStorage.getItem("local_bus_stations");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_BUS_STATIONS;
      }
    }
    localStorage.setItem("local_bus_stations", JSON.stringify(DEFAULT_BUS_STATIONS));
    return DEFAULT_BUS_STATIONS;
  };

  const saveLocalData = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_bus_stations", JSON.stringify(data));
    }
  };

  const handleOpenAdd = () => {
    setError("");
    setSuccess("");
    setEditingItem(null);
    setFormData({
      name: "",
      location: "",
      governorate: "",
      companies: "",
      destinations: "",
      description: "",
      map_url: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      ...item,
      destinations: Array.isArray(item.destinations) ? item.destinations.join(", ") : item.destinations || "",
      companies: Array.isArray(item.companies) ? JSON.stringify(item.companies, null, 2) : item.companies || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Format fields
    let payload = { ...formData };
    payload.destinations = typeof formData.destinations === "string" 
      ? formData.destinations.split(",").map((d: string) => d.trim()).filter(Boolean)
      : formData.destinations;

    if (typeof formData.companies === "string") {
      try {
        payload.companies = JSON.parse(formData.companies);
      } catch {
        setError("خطأ في تنسيق JSON للشركات المشغلة. يجب أن يكون بتنسيق مصفوفة كائنات صالحة.");
        return;
      }
    }

    if (dbConnected && supabase) {
      try {
        const dbPayload = {
          name: payload.name || "",
          location: payload.location || "",
          governorate: payload.governorate || "",
          companies: payload.companies || [],
          destinations: payload.destinations || [],
          description: payload.description || "",
          map_url: payload.map_url || ""
        };

        const isUUID = (str: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
        const isEditingDbRecord = editingItem && editingItem.id && isUUID(editingItem.id);

        if (isEditingDbRecord) {
          const { error: dbErr } = await supabase
            .from("bus_stations")
            .update(dbPayload)
            .eq("id", editingItem.id);
          
          if (dbErr) throw dbErr;
          setSuccess("تم تعديل السجل بنجاح في قاعدة البيانات.");
        } else {
          const { error: dbErr } = await supabase
            .from("bus_stations")
            .insert(dbPayload);
          
          if (dbErr) throw dbErr;
          setSuccess("تم إضافة السجل بنجاح إلى قاعدة البيانات.");
        }

        // Reload
        const { data } = await supabase.from("bus_stations").select("*");
        setBusStations(data || []);
        setShowModal(false);
      } catch (err: any) {
        console.error(err);
        setError("فشلت العملية في قاعدة البيانات: " + err.message);
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
      setBusStations(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    setError("");
    setSuccess("");

    if (dbConnected && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("bus_stations")
          .delete()
          .eq("id", item.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف السجل بنجاح من قاعدة البيانات.");
        
        const { data } = await supabase.from("bus_stations").select("*");
        setBusStations(data || []);
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
      setBusStations(currentLocal);
      setSuccess("تم حذف السجل بنجاح محلياً (LocalStorage).");
    }
  };

  const filteredRows = busStations.filter((item: any) => {
    if (!searchQuery) return true;
    const nameMatch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const govMatch = item.governorate?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || descMatch || locationMatch || govMatch;
  });

  if (authLoading || loading) {
    return (
      <div className={styles.adminShell} style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.05)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>جاري تحميل إدارة الأتوبيسات...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>
      {/* Upper Status/Welcome banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-primary, #fff)", marginBottom: "6px" }}>
            إدارة الأتوبيسات (سوبرجيت)
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            تحرير وتحديث مواقف وحافلات سوبرجيت وشركات النقل السياحي والبرّي.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "10px 20px" }}>
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          إضافة موقف أتوبيس
        </button>
      </div>

      {/* DB Connection Status Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 18px",
        borderRadius: "14px",
        background: dbConnected ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
        border: `1px solid ${dbConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
        color: dbConnected ? "#34d399" : "#fbbf24",
        fontSize: "0.85rem",
        marginBottom: "24px"
      }}>
        <span style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: dbConnected ? "#10b981" : "#f59e0b",
          boxShadow: dbConnected ? "0 0 8px #10b981" : "0 0 8px #f59e0b"
        }} />
        <span>
          {dbConnected
            ? "متصل بقاعدة البيانات السحابية (Supabase) - يتم حفظ كافة التغييرات مباشرة."
            : "يعمل بوضع الحفظ المحلي (LocalStorage) - لم يتم الاتصال بقاعدة البيانات."}
        </span>
      </div>

      {success && (
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Quick Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <i className="bx bx-search" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "1.15rem" }} />
          <input
            type="text"
            placeholder="البحث عن موقف أتوبيس، وجهة، أو محافظة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ios-input"
            style={{ width: "100%", paddingRight: "40px" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8", fontSize: "0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", padding: "0 16px", borderRadius: "12px" }}>
          إجمالي المواقف: {filteredRows.length}
        </div>
      </div>

      {/* Main Table */}
      <div className={styles.tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr className={styles.adminTr}>
                <th className={styles.adminTh}>اسم الموقف</th>
                <th className={styles.adminTh}>المحافظة</th>
                <th className={styles.adminTh}>العنوان بالتفصيل</th>
                <th className={styles.adminTh}>الوجهات المتاحة</th>
                <th className={styles.adminTh} style={{ textAlign: "center" }}>خيارات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr className={styles.adminTr}>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    لا توجد أي سجلات متوفرة حالياً.
                  </td>
                </tr>
              ) : (
                filteredRows.map((item, idx) => (
                  <tr key={item.id || idx} className={styles.adminTr}>
                    <td className={styles.adminTd} style={{ fontWeight: "bold" }}>{item.name}</td>
                    <td className={styles.adminTd}>{item.governorate}</td>
                    <td className={styles.adminTd} title={item.location} style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.location}</td>
                    <td className={styles.adminTd} title={Array.isArray(item.destinations) ? item.destinations.join("، ") : ""} style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {Array.isArray(item.destinations) ? item.destinations.join("، ") : ""}
                    </td>
                    <td className={styles.adminTd}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={() => handleOpenEdit(item)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="تعديل">
                          <i className="bx bx-edit" />
                          <span>تعديل</span>
                        </button>
                        <button onClick={() => handleDelete(item)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="حذف">
                          <i className="bx bx-trash" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="ios-card" style={{ width: "100%", maxWidth: "600px", background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px", maxHeight: "90vh", overflowY: "auto" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#fff", margin: 0 }}>
                {editingItem ? "تعديل بيانات السجل" : "إضافة موقف أتوبيس جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", width: "32px", height: "32px", borderRadius: "50%", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>اسم الموقف *</label>
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
                  <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المحافظة *</label>
                  <input
                    type="text"
                    required
                    value={formData.governorate || ""}
                    onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                    className="ios-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>العنوان بالتفصيل *</label>
                <input
                  type="text"
                  required
                  value={formData.location || ""}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الوجهات المتاحة (افصل بينها بفاصلة) *</label>
                <input
                  type="text"
                  required
                  placeholder="الإسكندرية, شرم الشيخ, أسيوط..."
                  value={formData.destinations || ""}
                  onChange={e => setFormData({ ...formData, destinations: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الشركات المشغلة وساعات العمل (بتنسيق JSON) *</label>
                <textarea
                  required
                  placeholder='[{"name": "السوبر جيت", "phone": "19142", "type": "رسمي"}]'
                  value={formData.companies || ""}
                  onChange={e => setFormData({ ...formData, companies: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%", height: "100px", fontFamily: "monospace", direction: "ltr", textAlign: "left" }}
                />
              </div>

              <div>
                <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الوصف وملاحظات السفر</label>
                <textarea
                  value={formData.description || ""}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%", height: "80px", resize: "vertical" }}
                />
              </div>

              <div>
                <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>رابط خريطة جوجل *</label>
                <input
                  type="url"
                  required
                  value={formData.map_url || ""}
                  onChange={e => setFormData({ ...formData, map_url: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="ios-btn" style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                  إلغاء
                </button>
                <button type="submit" className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff" }}>
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
