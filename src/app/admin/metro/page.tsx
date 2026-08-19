"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import clsx from "clsx";

// ── Default Mock / Seed Data ──
const DEFAULT_METRO_STATIONS: any[] = [
  // Line 1
  { name: "حلوان", line_type: "line1", station_order: 1 },
  { name: "عين حلوان", line_type: "line1", station_order: 2 },
  { name: "جامعة حلوان", line_type: "line1", station_order: 3 },
  { name: "وادي حوف", line_type: "line1", station_order: 4 },
  { name: "حدائق حلوان", line_type: "line1", station_order: 5 },
  { name: "المعصرة", line_type: "line1", station_order: 6 },
  { name: "طرة الأسمنت", line_type: "line1", station_order: 7 },
  { name: "كوتسيكا", line_type: "line1", station_order: 8 },
  { name: "طرة البلد", line_type: "line1", station_order: 9 },
  { name: "ثكنات المعادي", line_type: "line1", station_order: 10 },
  { name: "المعادي", line_type: "line1", station_order: 11 },
  { name: "حدائق المعادي", line_type: "line1", station_order: 12 },
  { name: "دار السلام", line_type: "line1", station_order: 13 },
  { name: "الزهراء", line_type: "line1", station_order: 14 },
  { name: "مار جرجس", line_type: "line1", station_order: 15 },
  { name: "الملك الصالح", line_type: "line1", station_order: 16 },
  { name: "السيدة زينب", line_type: "line1", station_order: 17 },
  { name: "سعد زغلول", line_type: "line1", station_order: 18 },
  { name: "أنور السادات", line_type: "line1", station_order: 19 },
  { name: "جمال عبد الناصر", line_type: "line1", station_order: 20 },
  { name: "أحمد عرابي", line_type: "line1", station_order: 21 },
  { name: "الشهداء", line_type: "line1", station_order: 22 },
  { name: "غمرة", line_type: "line1", station_order: 23 },
  { name: "الدمرداش", line_type: "line1", station_order: 24 },
  { name: "منشية الصدر", line_type: "line1", station_order: 25 },
  { name: "كوبري القبة", line_type: "line1", station_order: 26 },
  { name: "حمامات القبة", line_type: "line1", station_order: 27 },
  { name: "سراي القبة", line_type: "line1", station_order: 28 },
  { name: "حدائق الزيتون", line_type: "line1", station_order: 29 },
  { name: "حلمية الزيتون", line_type: "line1", station_order: 30 },
  { name: "المطرية", line_type: "line1", station_order: 31 },
  { name: "عين شمس", line_type: "line1", station_order: 32 },
  { name: "عزبة النخل", line_type: "line1", station_order: 33 },
  { name: "المرج", line_type: "line1", station_order: 34 },
  { name: "المرج الجديدة", line_type: "line1", station_order: 35 },

  // Line 2
  { name: "شبرا الخيمة", line_type: "line2", station_order: 1 },
  { name: "كلية الزراعة", line_type: "line2", station_order: 2 },
  { name: "المظلات", line_type: "line2", station_order: 3 },
  { name: "الخلفاوي", line_type: "line2", station_order: 4 },
  { name: "سانت تريزا", line_type: "line2", station_order: 5 },
  { name: "روض الفرج", line_type: "line2", station_order: 6 },
  { name: "مسرة", line_type: "line2", station_order: 7 },
  { name: "الشهداء", line_type: "line2", station_order: 8 },
  { name: "العتبة", line_type: "line2", station_order: 9 },
  { name: "محمد نجيب", line_type: "line2", station_order: 10 },
  { name: "أنور السادات", line_type: "line2", station_order: 11 },
  { name: "الأوبرا", line_type: "line2", station_order: 12 },
  { name: "الدقي", line_type: "line2", station_order: 13 },
  { name: "البحوث", line_type: "line2", station_order: 14 },
  { name: "جامعة القاهرة", line_type: "line2", station_order: 15 },
  { name: "فيصل", line_type: "line2", station_order: 16 },
  { name: "الجيزة", line_type: "line2", station_order: 17 },
  { name: "أم المصريين", line_type: "line2", station_order: 18 },
  { name: "ساقية مكي", line_type: "line2", station_order: 19 },
  { name: "المنيب", line_type: "line2", station_order: 20 },

  // Line 3 Trunk
  { name: "عدلي منصور", line_type: "line3", station_order: 1 },
  { name: "الهايكستب", line_type: "line3", station_order: 2 },
  { name: "عمر بن الخطاب", line_type: "line3", station_order: 3 },
  { name: "قباء", line_type: "line3", station_order: 4 },
  { name: "هشام بركات", line_type: "line3", station_order: 5 },
  { name: "النزهة", line_type: "line3", station_order: 6 },
  { name: "نادي الشمس", line_type: "line3", station_order: 7 },
  { name: "ألف مسكن", line_type: "line3", station_order: 8 },
  { name: "ميدان هليوبوليس", line_type: "line3", station_order: 9 },
  { name: "هارون", line_type: "line3", station_order: 10 },
  { name: "الأهرام", line_type: "line3", station_order: 11 },
  { name: "كلية البنات", line_type: "line3", station_order: 12 },
  { name: "استاد القاهرة", line_type: "line3", station_order: 13 },
  { name: "المعرض", line_type: "line3", station_order: 14 },
  { name: "العباسية", line_type: "line3", station_order: 15 },
  { name: "عبده باشا", line_type: "line3", station_order: 16 },
  { name: "الجيش", line_type: "line3", station_order: 17 },
  { name: "باب الشعرية", line_type: "line3", station_order: 18 },
  { name: "العتبة", line_type: "line3", station_order: 19 },
  { name: "جمال عبد الناصر", line_type: "line3", station_order: 20 },
  { name: "ماسبيرو", line_type: "line3", station_order: 21 },
  { name: "صفاء حجازي", line_type: "line3", station_order: 22 },
  { name: "الكيت كات", line_type: "line3", station_order: 23 },

  // Line 3 Branch A
  { name: "السودان", line_type: "line3_branch_a", station_order: 1 },
  { name: "إمبابة", line_type: "line3_branch_a", station_order: 2 },
  { name: "البوهي", line_type: "line3_branch_a", station_order: 3 },
  { name: "القومية العربية", line_type: "line3_branch_a", station_order: 4 },
  { name: "الطريق الدائري", line_type: "line3_branch_a", station_order: 5 },
  { name: "محور روض الفرج", line_type: "line3_branch_a", station_order: 6 },

  // Line 3 Branch B
  { name: "التوفيقية", line_type: "line3_branch_b", station_order: 1 },
  { name: "وادي النيل", line_type: "line3_branch_b", station_order: 2 },
  { name: "جامعة الدول العربية", line_type: "line3_branch_b", station_order: 3 },
  { name: "بولاق الدكرور", line_type: "line3_branch_b", station_order: 4 },
  { name: "جامعة القاهرة", line_type: "line3_branch_b", station_order: 5 },
];

const DEFAULT_METRO_PRICES = [
  { tier_name: "من 1 إلى 9 محطات", max_stations: 9, price: 10 },
  { tier_name: "من 10 إلى 16 محطة", max_stations: 16, price: 12 },
  { tier_name: "من 17 إلى 23 محطة", max_stations: 23, price: 15 },
  { tier_name: "أكثر من 23 محطة", max_stations: 999, price: 20 },
];

export default function AdminMetroPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>جاري التحميل...</div>}>
      <AdminMetroInner />
    </Suspense>
  );
}

function AdminMetroInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<boolean>(true);

  // Section Navigation: stations or pricing
  const [activeSection, setActiveSection] = useState<"stations" | "pricing">("stations");

  // Table Data States
  const [metroStations, setMetroStations] = useState<any[]>([]);
  const [ticketPrices, setTicketPrices] = useState<any[]>([]);
  const [adminActiveLine, setAdminActiveLine] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form States for Station
  const [showStationModal, setShowStationModal] = useState(false);
  const [editingStation, setEditingStation] = useState<any | null>(null);
  const [stationForm, setStationForm] = useState<any>({
    name: "",
    line_type: "line1",
    station_order: 1,
    landmarks: "",
    status: "تشغيل فعلي",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stationToDelete, setStationToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      checkAdminStatus();
    }
  }, [authLoading, user]);

  const checkAdminStatus = async () => {
    try {
      if (!user) {
        router.push("/login");
        return;
      }
      if (!supabase) {
        router.push("/");
        return;
      }
      const { data, error: profileErr } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileErr || !data?.is_admin) {
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
    await Promise.all([fetchStationsData(), fetchPricesData()]);
    setLoading(false);
  };

  const fetchStationsData = async () => {
    if (!supabase) {
      setMetroStations(getLocalStations());
      setDbStatus(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("metro_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (error) {
        console.warn("Failed to fetch from metro_stations, using fallback.", error);
        setMetroStations(getLocalStations());
        setDbStatus(false);
      } else {
        const mappedData = data ? data.map(item => {
          let updated = { ...item };
          updated.status = item.status || "تشغيل فعلي";
          return updated;
        }) : [];

        // Sort by line_type then station_order
        mappedData.sort((a, b) => {
          if (a.line_type !== b.line_type) {
            return a.line_type.localeCompare(b.line_type);
          }
          return (a.station_order || 0) - (b.station_order || 0);
        });

        setMetroStations(mappedData);
        setDbStatus(true);
      }
    } catch (err) {
      console.error(err);
      setMetroStations(getLocalStations());
      setDbStatus(false);
    }
  };

  const fetchPricesData = async () => {
    if (!supabase) {
      setTicketPrices(getLocalPrices());
      return;
    }

    try {
      const { data, error } = await supabase
        .from("metro_prices")
        .select("*")
        .order("max_stations", { ascending: true });

      if (error) {
        console.warn("Failed to fetch from metro_prices, using fallback.", error);
        setTicketPrices(getLocalPrices());
      } else {
        setTicketPrices(data && data.length > 0 ? data : getLocalPrices());
      }
    } catch (err) {
      console.error(err);
      setTicketPrices(getLocalPrices());
    }
  };

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_METRO_STATIONS;
    const local = localStorage.getItem("local_metro_stations");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            let updated = { ...item };
            updated.status = item.status || "تشغيل فعلي";
            return updated;
          });
        }
        return parsed;
      } catch {
        return DEFAULT_METRO_STATIONS;
      }
    }
    localStorage.setItem("local_metro_stations", JSON.stringify(DEFAULT_METRO_STATIONS));
    return DEFAULT_METRO_STATIONS;
  };

  const saveLocalStations = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_metro_stations", JSON.stringify(data));
    }
  };

  const getLocalPrices = () => {
    if (typeof window === "undefined") return DEFAULT_METRO_PRICES;
    const local = localStorage.getItem("local_metro_prices");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_METRO_PRICES;
      }
    }
    localStorage.setItem("local_metro_prices", JSON.stringify(DEFAULT_METRO_PRICES));
    return DEFAULT_METRO_PRICES;
  };

  const saveLocalPrices = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_metro_prices", JSON.stringify(data));
    }
  };

  const handleOpenAddStation = () => {
    setError("");
    setSuccess("");
    setEditingStation(null);
    setStationForm({
      name: "",
      line_type: "line1",
      station_order: 1,
      landmarks: "",
      status: "تشغيل فعلي",
    });
    setShowStationModal(true);
  };

  const handleOpenEditStation = (item: any) => {
    setError("");
    setSuccess("");
    setEditingStation(item);
    setStationForm({
      ...item,
      landmarks: Array.isArray(item.landmarks) ? item.landmarks.join(", ") : item.landmarks || "",
      status: item.status || "تشغيل فعلي",
    });
    setShowStationModal(true);
  };

  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let payload = { ...stationForm };
    payload.landmarks = typeof stationForm.landmarks === "string"
      ? stationForm.landmarks.split(",").map((s: string) => s.trim()).filter(Boolean)
      : stationForm.landmarks || [];

    if (dbStatus && supabase) {
      try {
        let query;
        if (editingStation) {
          query = supabase
            .from("metro_stations")
            .update(payload)
            .eq("id", editingStation.id);
        } else {
          query = supabase
            .from("metro_stations")
            .insert([payload]);
        }

        const { error: dbErr } = await query;
        if (dbErr) throw dbErr;

        setSuccess(editingStation ? "تم تعديل المحطة بنجاح في قاعدة البيانات." : "تم إضافة المحطة بنجاح لقاعدة البيانات.");
        await fetchStationsData();
        setShowStationModal(false);
      } catch (err: any) {
        console.error(err);
        let errMsg = "فشلت العملية في قاعدة البيانات: " + err.message;
        if (err.message && (err.message.includes("metro_stations") || err.message.includes("relation") || err.message.includes("column"))) {
          errMsg += " (تنبيه: قد لا يكون جدول metro_stations مهيئاً في قاعدة البيانات. يرجى تشغيل كود SQL الخاص بالمترو في لوحة تحكم Supabase لتفعيله).";
        }
        setError(errMsg);
      }
    } else {
      // LocalStorage Fallback
      let currentLocal = getLocalStations();
      if (editingStation) {
        currentLocal = currentLocal.map((item: any) => {
          if (editingStation.id && item.id === editingStation.id) {
            return { ...item, ...payload };
          }
          if (!editingStation.id && item.name === editingStation.name && item.line_type === editingStation.line_type) {
            return { ...item, ...payload };
          }
          return item;
        });
        setSuccess("تم تعديل المحطة بنجاح محلياً (LocalStorage).");
      } else {
        const newRecord = {
          id: Math.random().toString(36).substr(2, 9),
          ...payload,
        };
        currentLocal.push(newRecord);
        setSuccess("تم إضافة المحطة بنجاح محلياً (LocalStorage).");
      }
      saveLocalStations(currentLocal);
      setMetroStations(currentLocal);
      setShowStationModal(false);
    }
  };

  const handleStationDelete = (item: any) => {
    setStationToDelete(item);
  };

  const confirmDeleteStation = async () => {
    if (!stationToDelete) return;
    setIsDeleting(true);
    setError("");
    setSuccess("");

    if (dbStatus && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("metro_stations")
          .delete()
          .eq("id", stationToDelete.id);

        if (dbErr) throw dbErr;

        setSuccess("تم حذف المحطة بنجاح من قاعدة البيانات.");
        await fetchStationsData();
        setStationToDelete(null);
      } catch (err: any) {
        console.error(err);
        setError("فشلت عملية الحذف: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    } else {
      // Local Storage delete
      let currentLocal = getLocalStations();
      currentLocal = currentLocal.filter((s: any) => {
        if (stationToDelete.id && s.id === stationToDelete.id) return false;
        if (!stationToDelete.id && s.name === stationToDelete.name && s.line_type === stationToDelete.line_type) return false;
        return true;
      });
      saveLocalStations(currentLocal);
      setMetroStations(currentLocal);
      setSuccess("تم حذف المحطة بنجاح محلياً.");
      setStationToDelete(null);
      setIsDeleting(false);
    }
  };

  const handlePricesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (dbStatus && supabase) {
      try {
        // Upsert all tiers
        for (const tier of ticketPrices) {
          let query;
          if (tier.id) {
            query = supabase
              .from("metro_prices")
              .update({ price: Number(tier.price), max_stations: Number(tier.max_stations) })
              .eq("id", tier.id);
          } else {
            query = supabase
              .from("metro_prices")
              .insert([{ tier_name: tier.tier_name, max_stations: Number(tier.max_stations), price: Number(tier.price) }]);
          }
          const { error: dbErr } = await query;
          if (dbErr) throw dbErr;
        }
        setSuccess("تم حفظ أسعار التذاكر في قاعدة البيانات بنجاح.");
        await fetchPricesData();
      } catch (err: any) {
        console.error(err);
        setError("فشل حفظ أسعار التذاكر: " + err.message);
      }
    } else {
      saveLocalPrices(ticketPrices);
      setSuccess("تم حفظ أسعار التذاكر محلياً بنجاح.");
    }
  };

  const handlePriceFieldChange = (index: number, field: string, val: any) => {
    const updated = [...ticketPrices];
    updated[index] = { ...updated[index], [field]: val };
    setTicketPrices(updated);
  };

  if (loading || authLoading) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px"
      }}>
        <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2.5rem", color: "#6366f1" }} />
        <span style={{ fontWeight: "bold" }}>جاري تحميل إدارة شبكة مترو الأنفاق...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  // Filtered rows for station view
  let filteredRows = [...metroStations];
  if (adminActiveLine !== "all") {
    filteredRows = filteredRows.filter(s => s.line_type === adminActiveLine);
  }
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    filteredRows = filteredRows.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.landmarks && Array.isArray(s.landmarks) && s.landmarks.some((l: string) => l.toLowerCase().includes(q)))
    );
  }

  const getLineLabel = (line: string) => {
    switch (line) {
      case "line1": return "الخط الأول";
      case "line2": return "الخط الثاني";
      case "line3": return "الخط الثالث (الجذع)";
      case "line3_branch_a": return "الخط الثالث (تفريعة روض الفرج)";
      case "line3_branch_b": return "الخط الثالث (تفريعة جامعة القاهرة)";
      case "line4": return "الخط الرابع (تحت الإنشاء)";
      case "line5": return "الخط الخامس (تحت الإنشاء)";
      case "line6": return "الخط السادس (تحت الإنشاء)";
      default: return line;
    }
  };

  const getLineColor = (line: string) => {
    switch (line) {
      case "line1": return "#ef4444";
      case "line2": return "#3b82f6";
      case "line3":
      case "line3_branch_a":
      case "line3_branch_b": return "#10b981";
      case "line4": return "#f59e0b";
      case "line5": return "#8b5cf6";
      case "line6": return "#ec4899";
      default: return "#6366f1";
    }
  };

  return (
    <div style={{ padding: "0 10px 40px 10px" }}>

      {/* Upper Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "16px", marginBottom: "24px" }}>
        <button
          onClick={() => { setActiveSection("stations"); setError(""); setSuccess(""); }}
          className="ios-btn"
          style={{
            background: activeSection === "stations" ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "rgba(255,255,255,0.05)",
            color: activeSection === "stations" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            padding: "10px 20px"
          }}
        >
          <i className="bx bx-map-alt" style={{ marginLeft: "6px" }} />
          إدارة المحطات والخطوط
        </button>
        <button
          onClick={() => { setActiveSection("pricing"); setError(""); setSuccess(""); }}
          className="ios-btn"
          style={{
            background: activeSection === "pricing" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "rgba(255,255,255,0.05)",
            color: activeSection === "pricing" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            padding: "10px 20px"
          }}
        >
          <i className="bx bx-credit-card" style={{ marginLeft: "6px" }} />
          إدارة أسعار التذاكر
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className={styles.alertSuccess} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px" }}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.3rem" }} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className={styles.alertError} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
          <i className="bx bx-error" style={{ fontSize: "1.3rem" }} />
          <span style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{error}</span>
        </div>
      )}

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
        </div>
      )}

      {/* ============================================================
         SECTION 1: Manage Stations
         ============================================================ */}
      {activeSection === "stations" && (
        <div>
          {/* Header Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>إدارة محطات المترو</h2>
              <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
                إضافة وتعديل وحذف محطات مترو الأنفاق في خطوطها الستة.
              </p>
            </div>
            <button onClick={handleOpenAddStation} className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "10px 20px" }}>
              <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
              <span>إضافة محطة مترو جديدة</span>
            </button>
          </div>

          {/* Filtering Controls */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "20px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Search Input bar */}
            <div style={{ position: "relative", width: "100%" }}>
              <i className="bx bx-search" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "1.2rem" }} />
              <input
                type="text"
                placeholder="ابحث باسم المحطة أو المعلم القريب..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ios-input"
                style={{ width: "100%", paddingRight: "44px" }}
              />
            </div>

            {/* Line Selection Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>تصفية حسب الخط:</span>
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
                {[
                  { id: "all", label: "جميع الخطوط", color: "#818cf8" },
                  { id: "line1", label: "الخط الأول (الأحمر)", color: "#ef4444" },
                  { id: "line2", label: "الخط الثاني (الأزرق)", color: "#3b82f6" },
                  { id: "line3", label: "الخط الثالث (الرئيسي)", color: "#10b981" },
                  { id: "line3_branch_a", label: "الثالث (روض الفرج)", color: "#10b981" },
                  { id: "line3_branch_b", label: "الثالث (جامعة القاهرة)", color: "#10b981" },
                  { id: "line4", label: "الخط الرابع", color: "#f59e0b" },
                  { id: "line5", label: "الخط الخامس", color: "#8b5cf6" },
                  { id: "line6", label: "الخط السادس", color: "#ec4899" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAdminActiveLine(opt.id)}
                    className="ios-btn"
                    style={{
                      padding: "6px 14px",
                      borderRadius: "10px",
                      fontSize: "0.82rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: "1px solid",
                      borderColor: adminActiveLine === opt.id ? opt.color : "var(--border-glass)",
                      background: adminActiveLine === opt.id ? `${opt.color}1c` : "var(--bg-secondary)",
                      color: adminActiveLine === opt.id ? opt.color : "var(--text-secondary)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stations Table */}
          {filteredRows.length === 0 ? (
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", padding: "48px", borderRadius: "16px", textAlign: "center", color: "var(--text-muted, #94a3b8)" }}>
              لا توجد أي محطات مترو مطابقة للتصفية الحالية.
            </div>
          ) : (
            <div className={styles.tableCard} style={{ overflowX: "auto" }}>
              <table className={styles.adminTable} style={{ width: "100%" }}>
                <thead className={styles.adminThead}>
                  <tr className={styles.adminTr}>
                    <th className={styles.adminTh} style={{ width: "80px", textAlign: "center" }}>الترتيب</th>
                    <th className={styles.adminTh}>اسم المحطة</th>
                    <th className={styles.adminTh}>الخط المترو</th>
                    <th className={styles.adminTh}>المعالم والأماكن القريبة</th>
                    <th className={styles.adminTh} style={{ width: "120px" }}>حالة المحطة</th>
                    <th className={styles.adminTh} style={{ textAlign: "center", width: "120px" }}>خيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((station, index) => {
                    const lineColor = getLineColor(station.line_type);
                    const lineLabel = getLineLabel(station.line_type);

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
                        <td className={styles.adminTd} style={{ fontWeight: "bold", color: "var(--text-primary)" }}>
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
                            {lineLabel}
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
                              onClick={() => handleOpenEditStation(station)}
                              className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                              title="تعديل"
                              style={{ padding: "5px 5px", borderRadius: "50%", background: "var(--bg-secondary)" }}
                            >
                              <i className="bx bx-edit-alt" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStationDelete(station)}
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              title="حذف"
                              style={{ padding: "5px 5px", borderRadius: "50%", background: "#ff000031", color: "#ff0000" }}
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
      )}

      {/* ============================================================
         SECTION 2: Manage Prices
         ============================================================ */}
      {activeSection === "pricing" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>إدارة أسعار تذاكر المترو</h2>
            <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
              تعديل شرائح أسعار التذاكر بناءً على عدد محطات الرحلة التي يقطعها العميل.
            </p>
          </div>

          <form onSubmit={handlePricesSubmit} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }}>
              {ticketPrices.map((tier, idx) => (
                <div key={tier.id || idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", alignItems: "end", borderBottom: idx !== ticketPrices.length - 1 ? "1px solid var(--border-glass)" : "none", paddingBottom: idx !== ticketPrices.length - 1 ? "16px" : "0" }}>
                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>اسم الشريحة</label>
                    <input
                      type="text"
                      disabled
                      value={tier.tier_name || ""}
                      className="ios-input"
                      style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)" }}
                    />
                  </div>
                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>أقصى عدد محطات</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tier.max_stations || 1}
                      onChange={e => handlePriceFieldChange(idx, "max_stations", parseInt(e.target.value))}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>السعر (ج.م)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={tier.price || 0}
                      onChange={e => handlePriceFieldChange(idx, "price", parseInt(e.target.value))}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="ios-btn" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", padding: "10px 24px", fontWeight: "bold" }}>
                <i className="bx bx-save" style={{ marginLeft: "6px" }} />
                حفظ تعديلات أسعار التذاكر
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================
         MODAL: Add / Edit Station Form
         ============================================================ */}
      {showStationModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#0c111d",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-glass)"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>
                {editingStation ? "تعديل محطة مترو" : "إضافة محطة مترو جديدة"}
              </h3>
              <button
                onClick={() => setShowStationModal(false)}
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

            <form onSubmit={handleStationSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>اسم المحطة *</label>
                <input
                  type="text"
                  required
                  value={stationForm.name || ""}
                  onChange={e => setStationForm({ ...stationForm, name: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>الخط المترو *</label>
                <select
                  value={stationForm.line_type || "line1"}
                  onChange={e => setStationForm({ ...stationForm, line_type: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                >
                  <option value="line1">الخط الأول (حلوان - المرج)</option>
                  <option value="line2">الخط الثاني (شبرا - المنيب)</option>
                  <option value="line3">الخط الثالث (عدلي منصور - الكيت كات)</option>
                  <option value="line3_branch_a">الخط الثالث (تفريعة روض الفرج)</option>
                  <option value="line3_branch_b">الخط الثالث (تفريعة جامعة القاهرة)</option>
                  <option value="line4">الخط الرابع (تحت الإنشاء)</option>
                  <option value="line5">الخط الخامس (تحت الإنشاء)</option>
                  <option value="line6">الخط السادس (تحت الإنشاء)</option>
                </select>
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>ترتيب المحطة في الخط *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={stationForm.station_order || 1}
                  onChange={e => setStationForm({ ...stationForm, station_order: parseInt(e.target.value) })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>المعالم والأماكن القريبة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="مثال: جامعة القاهرة، حديقة الأورمان"
                  value={stationForm.landmarks || ""}
                  onChange={e => setStationForm({ ...stationForm, landmarks: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className={clsx("help-label", "color-white-100")} style={{ display: "block", marginBottom: "6px" }}>حالة المحطة *</label>
                <select
                  value={stationForm.status || "تشغيل فعلي"}
                  onChange={e => setStationForm({ ...stationForm, status: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                >
                  <option value="تشغيل فعلي">تشغيل فعلي (في الخدمة)</option>
                  <option value="تشغيل تجريبي">تشغيل تجريبي (تجريبي)</option>
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
                  onClick={() => setShowStationModal(false)}
                  className="ios-btn"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="ios-btn"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff" }}
                >
                  {editingStation ? "حفظ التغييرات" : "إضافة المحطة"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {stationToDelete && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
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
              fontFamily: "var(--font-display)",
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
              هل أنت متأكد من حذف هذه المحطة؟
              <strong style={{ display: "block", marginTop: "10px", color: "#ff4d4d", fontSize: "1.1rem" }}>
                « {stationToDelete.name} »
              </strong>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                disabled={isDeleting}
                onClick={confirmDeleteStation}
                style={{
                  flex: 1,
                  padding: "var(--pa-btn)",
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
                onClick={() => setStationToDelete(null)}
                style={{
                  flex: 1,
                  padding: "var(--pa-btn)",
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
    </div>
  );
}
