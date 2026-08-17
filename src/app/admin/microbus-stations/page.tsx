"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import clsx from "clsx";
import CancelButton from "@/components/ui/button/CancelButton";
import SubmitButton from "@/components/ui/button/SubmitButton";

const EGYPT_DESTINATIONS = [
  "6 أكتوبر",
  "الشيخ زايد",
  "التجمع الخامس",
  "التجمع الأول",
  "التجمع الثالث",
  "القاهرة الجديدة",
  "الرحاب",
  "مدينتي",
  "الشروق",
  "العبور",
  "بدر",
  "العاشر من رمضان",
  "العاصمة الإدارية",
  "رمسيس",
  "المنيب",
  "شبرا الخيمة",
  "حلوان",
  "المرج",
  "المرج الشرقية",
  "المرج الغربية",
  "مصر الجديدة",
  "ألف مسكن",
  "جسر السويس",
  "قباء",
  "الهايكستب",
  "السلام",
  "مسطرد",
  "الخصوص",
  "المعادي",
  "زهراء المعادي",
  "وسط البلد",
  "العتبة",
  "الجيزة",
  "الهرم",
  "فيصل",
  "الدقي",
  "المهندسين",
  "المنيل",
  "شبرا مصر",
  "دوران شبرا",
  "المظلات",
  "الخلفاوي",
  "عبود",
  "ألماظة",
  "شيراتون",
  "النزهة الجديدة",
  "المطرية",
  "الزيتون",
  "حدائق القبة",
  "الأميرية",
  "عين شمس",
  "المنيرة",
  "إمبابة",
  "الوراق",
  "بولاق الدكرور",
  "الكيت كات",
  "السبتية",
  "مطار القاهرة",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "الإسكندرية",
  "المنصورة",
  "الزقازيق",
  "طنطا",
  "المحلة الكبرى",
  "دمنهور",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "مطروح",
  "شرم الشيخ",
  "الغردقة"
];

const DEFAULT_MICROBUS: any[] = [
  {
    name: "موقف رمسيس (موقف أحمد حلمي / رمسيس الكبرى)",
    location: "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Ramses+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "11-13 ج.م", vehicleType: "ميكروباص سقف عالي", type: "official", lastUpdated: "2026-08-16", duration: "٤٥ دقيقة", via: "طريق المحور" },
      { destination: "الشيخ زايد", fare: "12-14 ج.م", vehicleType: "ميكروباص سقف عالي", type: "official", lastUpdated: "2026-08-16", duration: "٥٠ دقيقة", via: "المحور" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص / ميني باص", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "الطريق الدائري" },
      { destination: "العبور", fare: "10-12 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٤٥ دقيقة", via: "صلاح سالم - طريق الإسماعيلية" },
      { destination: "الشروق", fare: "12-14 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٥٠ دقيقة", via: "طريق السويس" },
      { destination: "حلوان", fare: "9-11 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "كورنيش النيل - الأوتوستراد" },
      { destination: "المرج", fare: "7-8 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٠ دقيقة", via: "مترو الأنفاق الشهداء" },
      { destination: "الجيزة (ميدان الجيزة)", fare: "5-6 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٢٠ دقيقة", via: "شارع رمسيس - كوبري عباس" },
      { destination: "شبرا الخيمة", fare: "5-6 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "١٥ دقيقة", via: "شارع شبرا" },
      { destination: "مطار القاهرة", fare: "8-10 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٥ دقيقة", via: "صلاح سالم" }
    ]
  },
  {
    name: "موقف المرج الجديدة",
    location: "شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=El+Marg+Microbus+Station",
    routes: [
      { destination: "العبور", fare: "7-9 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٢٥ دقيقة", via: "عبر الدائري" },
      { destination: "الشروق", fare: "9-11 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٥ دقيقة", via: "طريق الإسماعيلية" },
      { destination: "بدر", fare: "11-13 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "طريق السويس" },
      { destination: "العاشر من رمضان", fare: "12-15 ج.م", vehicleType: "ميكروباص سقف عالي", type: "official", lastUpdated: "2026-08-16", duration: "٤٥ دقيقة", via: "الإسماعيلية الصحراوي" },
      { destination: "مدينتي", fare: "10-12 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٥ دقيقة", via: "طريق السويس" },
      { destination: "بلبيس", fare: "10-12 ج.م", vehicleType: "ميكروباص إقليمي", type: "official", lastUpdated: "2026-08-16", duration: "٤٠ دقيقة", via: "طريق بلبيس الصحراوي" },
      { destination: "الزقازيق", fare: "15-18 ج.م", vehicleType: "ميكروباص إقليمي", type: "official", lastUpdated: "2026-08-16", duration: "٦٠ دقيقة", via: "بنها الصحراوي" },
      { destination: "مسطرد", fare: "5 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "١٥ دقيقة", via: "ترعة الإسماعيلية" },
      { destination: "رمسيس", fare: "7-8 ج.م", vehicleType: "ميكروباص", type: "official", lastUpdated: "2026-08-16", duration: "٣٠ دقيقة", via: "صلاح سالم - الدائري" }
    ]
  }
];

export default function AdminMicrobusStationsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>جاري التحميل...</div>}>
      <AdminMicrobusStationsInner />
    </Suspense>
  );
}

function AdminMicrobusStationsInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [microbusStations, setMicrobusStations] = useState<any[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [visualRoutes, setVisualRoutes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete Confirmation States
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
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
        loadMicrobusStations();
      }
    } catch (err) {
      console.error(err);
      router.push("/");
    }
  };

  const loadMicrobusStations = async () => {
    setLoading(true);
    if (!supabase) {
      setMicrobusStations(getLocalData());
      setDbConnected(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("microbus_stations").select("*");
      if (error) {
        console.warn("Failed to fetch from microbus_stations, using fallback.", error);
        setMicrobusStations(getLocalData());
        setDbConnected(false);
      } else {
        setMicrobusStations(data || []);
        setDbConnected(true);
      }
    } catch (err) {
      console.error(err);
      setMicrobusStations(getLocalData());
      setDbConnected(false);
    }
    setLoading(false);
  };

  const getLocalData = () => {
    if (typeof window === "undefined") return DEFAULT_MICROBUS;
    const local = localStorage.getItem("local_microbus_stations");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_MICROBUS;
      }
    }
    localStorage.setItem("local_microbus_stations", JSON.stringify(DEFAULT_MICROBUS));
    return DEFAULT_MICROBUS;
  };

  const saveLocalData = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_microbus_stations", JSON.stringify(data));
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
      map_url: ""
    });
    setVisualRoutes([{
      destination: "",
      fare: "",
      vehicleType: "ميكروباص",
      description: "",
      via: "",
      type: "official",
      lastUpdated: new Date().toISOString().split("T")[0],
      duration: ""
    }]);
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      location: item.location || "",
      governorate: item.governorate || "",
      map_url: item.map_url || ""
    });
    const parsedRoutes = Array.isArray(item.routes) ? item.routes.map((r: any) => ({
      destination: r.destination || "",
      fare: r.fare || "",
      vehicleType: r.vehicleType || "ميكروباص",
      description: r.description || r.notes || "",
      via: r.via || "",
      type: r.type || "official",
      lastUpdated: r.lastUpdated || new Date().toISOString().split("T")[0],
      duration: r.duration || ""
    })) : [];
    setVisualRoutes(parsedRoutes.length > 0 ? parsedRoutes : [{
      destination: "",
      fare: "",
      vehicleType: "ميكروباص",
      description: "",
      via: "",
      type: "official",
      lastUpdated: new Date().toISOString().split("T")[0],
      duration: ""
    }]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate visual routes
    for (let i = 0; i < visualRoutes.length; i++) {
      if (!visualRoutes[i].destination.trim()) {
        setError(`يرجى تحديد وجهة المسار رقم ${i + 1}`);
        return;
      }
      if (!visualRoutes[i].fare.trim()) {
        setError(`يرجى تحديد الأجرة للمسار رقم ${i + 1}`);
        return;
      }
    }

    let payload = {
      ...formData,
      routes: visualRoutes
    };

    if (dbConnected && supabase) {
      try {
        const dbPayload = {
          name: payload.name || "",
          governorate: payload.governorate || "",
          location: payload.location || "",
          routes: payload.routes || [],
          map_url: payload.map_url || ""
        };

        const isUUID = (str: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
        const isEditingDbRecord = editingItem && editingItem.id && isUUID(editingItem.id);

        if (isEditingDbRecord) {
          const { error: dbErr } = await supabase
            .from("microbus_stations")
            .update(dbPayload)
            .eq("id", editingItem.id);
          if (dbErr) throw dbErr;
          setSuccess("تم تعديل الموقف بنجاح في قاعدة البيانات.");
        } else {
          const { error: dbErr } = await supabase
            .from("microbus_stations")
            .insert(dbPayload);
          if (dbErr) throw dbErr;
          setSuccess("تم إضافة الموقف بنجاح إلى قاعدة البيانات.");
        }

        // Reload
        const { data } = await supabase.from("microbus_stations").select("*");
        setMicrobusStations(data || []);
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
      setMicrobusStations(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
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

        // Reload
        const { data } = await supabase.from("microbus_stations").select("*");
        setMicrobusStations(data || []);
      } catch (err: any) {
        console.error(err);
        setError("فشل الحذف في قاعدة البيانات: " + err.message);
      } finally {
        setIsDeleting(false);
        setItemToDelete(null);
      }
    } else {
      let currentLocal = getLocalData();
      currentLocal = currentLocal.filter((localItem: any) => {
        if (item.id && localItem.id !== item.id) return true;
        if (!item.id && localItem.name !== item.name) return true;
        return false;
      });
      saveLocalData(currentLocal);
      setMicrobusStations(currentLocal);
      setSuccess("تم حذف السجل بنجاح محلياً (LocalStorage).");
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // Filtered rows
  const getFilteredRows = () => {
    if (!searchQuery) return microbusStations;
    return microbusStations.filter((item: any) => {
      const nameMatch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = item.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const govMatch = item.governorate?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || locationMatch || govMatch;
    });
  };

  const filteredRows = getFilteredRows();

  if (authLoading || loading) {
    return (
      <div className={styles.adminShell} style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.05)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>جاري تحميل إدارة مواقف السرفيس...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>
      {/* Upper Title Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-primary, #fff)", marginBottom: "6px" }}>
            إدارة مواقف السرفيس
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            إضافة وتحرير وتحديث مواقف ميكروباصات السرفيس وخطوط السير والتعريفة المحددة.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "10px 20px" }}>
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          إضافة موقف سرفيس
        </button>
      </div>

      {/* SQL Warning Card if DB is using LocalStorage fallback */}
      {!dbConnected && (
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
            لم يتم العثور على جدول قاعدة البيانات المناسب في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها في متصفحك الحالي فقط كحفظ احتياطي مؤقت.
            لتفعيل حفظ التغييرات لكل مستخدمي الموقع بشكل دائم، يرجى فتح تبويب **SQL Editor** في لوحة تحكم Supabase وتشغيل سكريبت `[supabase_transport_services.sql](file:///d:/Development/Project/Cairo%20Map/supabase_transport_services.sql)`.
          </p>
        </div>
      )}

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
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            fontSize: "1.1rem"
          }} />
          <input
            type="text"
            className="ios-input"
            placeholder="البحث عن موقف، مسار..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingRight: "40px" }}
          />
        </div>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
          إجمالي المواقف: {filteredRows.length}
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.tableCard} style={{ overflowX: "auto" }}>
        <table className={styles.adminTable} style={{ width: "100%" }}>
          <thead className={styles.adminThead}>
            <tr className={styles.adminTr}>
              <th className={styles.adminTh}>اسم الموقف</th>
              <th className={styles.adminTh}>المحافظة</th>
              <th className={styles.adminTh}>العنوان بالتفصيل</th>
              <th className={styles.adminTh}>عدد الخطوط</th>
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
                  <td className={styles.adminTd}>
                    <span className={styles.microbusRouteBadge}>{Array.isArray(item.routes) ? item.routes.length : 0} مساراً</span>
                  </td>
                  <td className={styles.adminTd}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => handleOpenEdit(item)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="تعديل"
                        style={{
                          padding: "5px 5px",
                          borderRadius: "50%",
                          background: "var(--bg-secondary)",

                        }}
                      >
                        <i className="bx bx-edit-alt" />
                      </button>
                      <button onClick={() => handleDelete(item)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="حذف"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Forms Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
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
            border: "1px solid var(--border-glass)",
            background: "#0f172a",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#fff", margin: 0 }}>
                {editingItem ? "تعديل بيانات الموقف" : "إضافة موقف سرفيس جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", width: "32px", height: "32px", borderRadius: "50%", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>اسم الموقف *</label>
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
                  <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المحافظة *</label>
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
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>العنوان بالتفصيل *</label>
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
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>رابط خريطة جوجل *</label>
                <input
                  type="url"
                  required
                  value={formData.map_url || ""}
                  onChange={e => setFormData({ ...formData, map_url: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Visual Routes Editor Section */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginTop: "8px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#fff", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="bx bx-git-compare" style={{ color: "#818cf8" }} />
                  <span>تحديد مسارات السير والتعريفة المتاحة:</span>
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {visualRoutes.map((route, idx) => (
                    <div key={idx} style={{
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      padding: "16px",
                      borderRadius: "12px",
                      position: "relative"
                    }}>
                      {/* Header row inside card */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#94a3b8" }}>المسار #{idx + 1}</span>
                        {visualRoutes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setVisualRoutes(visualRoutes.filter((_, i) => i !== idx))}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              color: "#ef4444",
                              fontSize: "0.75rem",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            حذف المسار
                          </button>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>الوجهة (المدينة/المحافظة) *</label>
                          <input
                            type="text"
                            required
                            list="egypt-destinations"
                            value={route.destination}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].destination = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                            placeholder="اكتب أو اختر الوجهة..."
                          />
                        </div>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>التعريفة / الأجرة *</label>
                          <input
                            type="text"
                            required
                            value={route.fare}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].fare = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                            placeholder="مثال: 12 ج.م"
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>نوع المركبة</label>
                          <select
                            value={route.vehicleType}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].vehicleType = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                          >
                            <option value="ميكروباص">ميكروباص</option>
                            <option value="ميكروباص سقف عالي">ميكروباص سقف عالي</option>
                            <option value="ميني باص">ميني باص</option>
                            <option value="أتوبيس">أتوبيس</option>
                            <option value="حافلة سياحية">حافلة سياحية</option>
                          </select>
                        </div>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>نوع الموقف</label>
                          <select
                            value={route.type}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].type = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                          >
                            <option value="official">موقف رسمي</option>
                            <option value="normal">نقطة تحميل عادية</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>زمن الرحلة</label>
                          <input
                            type="text"
                            value={route.duration}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].duration = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                            placeholder="مثال: 45 دقيقة"
                          />
                        </div>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>تاريخ آخر تحديث</label>
                          <input
                            type="date"
                            value={route.lastUpdated}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].lastUpdated = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>وصف الخط (ملاحظات)</label>
                          <input
                            type="text"
                            value={route.description}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].description = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                            placeholder="مثال: خط سريع مباشر بدون توقف"
                          />
                        </div>
                        <div>
                          <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "4px", fontSize: "0.78rem" }}>يمر عبر (via)</label>
                          <input
                            type="text"
                            value={route.via}
                            onChange={e => {
                              const updated = [...visualRoutes];
                              updated[idx].via = e.target.value;
                              setVisualRoutes(updated);
                            }}
                            className="ios-input"
                            style={{ width: "100%" }}
                            placeholder="الشوارع والمناطق: رمسيس - الدائري"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setVisualRoutes([...visualRoutes, {
                    destination: "",
                    fare: "",
                    vehicleType: "ميكروباص",
                    description: "",
                    via: "",
                    type: "official",
                    lastUpdated: new Date().toISOString().split("T")[0],
                    duration: ""
                  }])}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px dashed rgba(99, 102, 241, 0.3)",
                    color: "#818cf8",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    marginTop: "8px"
                  }}
                >
                  + إضافة مسار سير جديد
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px", justifyContent: "flex-end" }}>
                <CancelButton onClick={() => setShowModal(false)}
                  style={{
                    width: "50%",
                    padding: "12px 30px",
                    margin: 10
                  }}>
                  إلغاء
                </CancelButton>

                <SubmitButton
                  editingItem={editingItem}
                  style={{
                    margin: 10,
                    padding: "12px 30px",
                    width: "50%",
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 4000,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "fade-in 0.2s ease"
        }}>
          <div style={{
            background: "rgba(18, 24, 52, 0.95)",
            borderRadius: "24px",
            padding: "32px",
            width: "100%",
            maxWidth: "450px",
            border: "1px solid rgba(255, 59, 48, 0.3)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            textAlign: "center",
            direction: "rtl"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(255, 59, 48, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              border: "1px solid rgba(255, 59, 48, 0.3)"
            }}>
              <span style={{ fontSize: "2rem" }}>⚠️</span>
            </div>

            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.4rem",
              color: "#fff",
              marginBottom: "12px",
              fontWeight: "700"
            }}>
              تأكيد الحذف
            </h3>

            <p style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: "1.6",
              marginBottom: "24px"
            }}>
              هل أنت متأكد من حذف هذا السجل؟
              {itemToDelete && (
                <strong style={{ display: "block", marginTop: "10px", color: "#ff4d4d", fontSize: "1.1rem" }}>
                  « {itemToDelete.name} »
                </strong>
              )}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#ff3b30",
                  color: "#fff",
                  fontSize: "1rem",
                  fontFamily: "var(--font-heading)",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  opacity: isDeleting ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {isDeleting ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "transparent",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontFamily: "var(--font-heading)",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datalist helper for common destinations */}
      <datalist id="egypt-destinations">
        {EGYPT_DESTINATIONS.map(d => (
          <option key={d} value={d} />
        ))}
      </datalist>
    </div>
  );
}
