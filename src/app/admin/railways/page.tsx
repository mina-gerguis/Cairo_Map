"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import clsx from "clsx";

interface TrainClass {
  name: string;
  price: string;
  features: string;
}

interface RailwayStop {
  id?: string;
  name: string;
  status: "تشغيل فعلي" | "تحت الإنشاء";
}

interface RailwayRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  duration: string;
  stops: RailwayStop[];
  classes: TrainClass[];
  tips: string;
}

const DEFAULT_ROUTES: RailwayRoute[] = [
  {
    id: "cairo-alex",
    name: "القاهرة ⇆ الإسكندرية (خط بحري)",
    from: "القاهرة (محطة رمسيس)",
    to: "الإسكندرية (محطة سيدي جابر / مصر)",
    duration: "ساعتين إلى 3 ساعات ونصف (حسب نوع القطار)",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "بنها", status: "تشغيل فعلي" },
      { name: "طنطا", status: "تشغيل فعلي" },
      { name: "دمنهور", status: "تشغيل فعلي" },
      { name: "سيدي جابر", status: "تشغيل فعلي" },
      { name: "الإسكندرية", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطار تالجو (Talgo) الفاخر", price: "درجة أولى: 225 ج.م | درجة ثانية: 150 ج.م", features: "شاشات عرض، واي فاي، عربة بوفيه فاخرة، تكييف متطور، هدوء تام وسرعة عالية." },
      { name: "قطارات VIP السريعة", price: "درجة أولى: 145 ج.م | درجة ثانية: 115 ج.م", features: "تكييف ممتاز، مقاعد مريحة قابلة للتعديل، بوفيه، خدمة جيدة." },
      { name: "قطارات إسباني مطور / فرنسي", price: "درجة أولى: 80 ج.م | درجة ثانية: 65 ج.م", features: "تكييف، مقاعد مريحة، قطارات سريعة كلاسيكية." },
      { name: "قطار روسي مكيف", price: "تذكرة موحدة: 60 ج.م", features: "تكييف، عربات جديدة وسعر اقتصادي." }
    ],
    tips: "قطارات تالجو هي الخيار الأفضل والأسرع على هذا الخط. يفضل الحجز قبل موعد الرحلة بـ 24 ساعة على الأقل."
  },
  {
    id: "cairo-aswan",
    name: "القاهرة ⇆ أسوان (خط قبلي الصعيد)",
    from: "القاهرة (محطة رمسيس / الجيزة)",
    to: "أسوان",
    duration: "10 إلى 13 ساعة",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "الجيزة", status: "تشغيل فعلي" },
      { name: "بني سويف", status: "تشغيل فعلي" },
      { name: "المنيا", status: "تشغيل فعلي" },
      { name: "أسيوط", status: "تشغيل فعلي" },
      { name: "سوهاج", status: "تشغيل فعلي" },
      { name: "قنا", status: "تشغيل فعلي" },
      { name: "الأقصر", status: "تشغيل فعلي" },
      { name: "إدفو", status: "تشغيل فعلي" },
      { name: "كوم أمبو", status: "تشغيل فعلي" },
      { name: "أسوان", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطارات النوم الفاخرة (Wagon-Lits)", price: "كابينة فردية: 1200+ ج.م | كابينة مزدوجة: 850 ج.م (للمصريين)", features: "وجبة عشاء وإفطار مجانية، سرير مريح في كابينة مغلقة." },
      { name: "قطار تالجو (Talgo) الصعيد", price: "درجة أولى: 700 ج.م | درجة ثانية: 550 ج.م", features: "القطار الأحدث والأكثر راحة بالصعيد." },
      { name: "قطارات VIP الصعيد", price: "درجة أولى: 335 ج.م | درجة ثانية: 220 ج.م", features: "تكييف ممتاز ومقاعد مريحة للمسافات الطويلة." }
    ],
    tips: "لرحلات النوم، يفضل الحجز قبل السفر بأسبوع على الأقل نظراً للإقبال الشديد."
  }
];

export default function AdminRailwaysPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>جاري التحميل...</div>}>
      <AdminRailwaysInner />
    </Suspense>
  );
}

function AdminRailwaysInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<"lines" | "stations">("lines");

  const [routes, setRoutes] = useState<RailwayRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showLineModal, setShowLineModal] = useState(false);
  const [editingLine, setEditingLine] = useState<RailwayRoute | null>(null);
  const [lineForm, setLineForm] = useState({
    id: "",
    name: "",
    from: "",
    to: "",
    duration: "",
    tips: ""
  });

  const [showStationModal, setShowStationModal] = useState(false);
  const [editingStation, setEditingStation] = useState<{ id?: string; index: number; name: string; status: "تشغيل فعلي" | "تحت الإنشاء" } | null>(null);
  const [stationForm, setStationForm] = useState({
    name: "",
    status: "تشغيل فعلي" as "تشغيل فعلي" | "تحت الإنشاء"
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [lineToDelete, setLineToDelete] = useState<any | null>(null);
  const [stationToDeleteIndex, setStationToDeleteIndex] = useState<number | null>(null);
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
        setIsAdmin(true);
        loadRoutes();
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
        loadRoutes();
      }
    } catch (err) {
      console.error(err);
      router.push("/");
    }
  };

  const loadRoutes = async () => {
    setLoading(true);
    if (!supabase) {
      setDbStatus(false);
      loadLocalRoutes();
      setLoading(false);
      return;
    }

    try {
      const { data: routesData, error: routesErr } = await supabase
        .from("railway_routes")
        .select("*");

      if (routesErr) throw routesErr;

      const { data: stationsData, error: stationsErr } = await supabase
        .from("railway_stations")
        .select("*")
        .order("station_order", { ascending: true });

      if (stationsErr) throw stationsErr;

      const combined: RailwayRoute[] = (routesData || []).map((route: any) => {
        const stops = (stationsData || [])
          .filter((s: any) => s.route_id === route.id)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            status: s.status || "تشغيل فعلي"
          }));

        return {
          id: route.id,
          name: route.name,
          from: route.from_location,
          to: route.to_location,
          duration: route.duration,
          stops: stops,
          classes: route.classes || [
            { name: "درجة أولى مكيفة", price: "تحدد لاحقاً", features: "تكييف، مقاعد مريحة" },
            { name: "درجة ثانية مكيفة", price: "تحدد لاحقاً", features: "تكييف واقتصادي" }
          ],
          tips: route.tips || ""
        };
      });

      setRoutes(combined);
      setDbStatus(true);
      if (combined.length > 0 && !selectedRouteId) {
        setSelectedRouteId(combined[0].id);
      }
    } catch (err) {
      console.warn("Failed to load from Supabase, using localStorage", err);
      setDbStatus(false);
      loadLocalRoutes();
    }
    setLoading(false);
  };

  const loadLocalRoutes = () => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("local_railways_routes");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          const mapped = parsed.map((route: any) => {
            if (Array.isArray(route.stops)) {
              route.stops = route.stops.map((stop: any) => {
                if (typeof stop === "string") {
                  return { name: stop, status: "تشغيل فعلي" };
                }
                return { name: stop.name, status: stop.status || "تشغيل فعلي" };
              });
            } else {
              route.stops = [];
            }
            return route;
          });
          setRoutes(mapped);
          if (mapped.length > 0 && !selectedRouteId) {
            setSelectedRouteId(mapped[0].id);
          }
        } catch {
          setRoutes(DEFAULT_ROUTES);
          setSelectedRouteId(DEFAULT_ROUTES[0].id);
        }
      } else {
        localStorage.setItem("local_railways_routes", JSON.stringify(DEFAULT_ROUTES));
        setRoutes(DEFAULT_ROUTES);
        setSelectedRouteId(DEFAULT_ROUTES[0].id);
      }
    }
  };

  const saveRoutesData = (data: RailwayRoute[]) => {
    setRoutes(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_railways_routes", JSON.stringify(data));
    }
  };

  // Line CRUD
  const handleOpenAddLine = () => {
    setError("");
    setSuccess("");
    setEditingLine(null);
    setLineForm({ id: "", name: "", from: "", to: "", duration: "", tips: "" });
    setShowLineModal(true);
  };

  const handleOpenEditLine = (line: RailwayRoute) => {
    setError("");
    setSuccess("");
    setEditingLine(line);
    setLineForm({
      id: line.id,
      name: line.name,
      from: line.from,
      to: line.to,
      duration: line.duration,
      tips: line.tips
    });
    setShowLineModal(true);
  };

  const handleSaveLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineForm.id || !lineForm.name || !lineForm.from || !lineForm.to) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    const payload = {
      id: lineForm.id,
      name: lineForm.name,
      from_location: lineForm.from,
      to_location: lineForm.to,
      duration: lineForm.duration,
      tips: lineForm.tips
    };

    if (dbStatus && supabase) {
      try {
        let query;
        if (editingLine) {
          query = supabase
            .from("railway_routes")
            .update(payload)
            .eq("id", editingLine.id);
        } else {
          query = supabase
            .from("railway_routes")
            .insert([payload]);
        }

        const { error: dbErr } = await query;
        if (dbErr) throw dbErr;

        setSuccess(editingLine ? "تم تعديل الخط بنجاح في قاعدة البيانات." : "تم إضافة الخط بنجاح لقاعدة البيانات.");
        await loadRoutes();
        setShowLineModal(false);
      } catch (err: any) {
        console.error(err);
        setError("فشلت العملية في قاعدة البيانات: " + err.message);
      }
    } else {
      let updatedRoutes = [...routes];
      if (editingLine) {
        updatedRoutes = updatedRoutes.map(r => {
          if (r.id === editingLine.id) {
            return {
              ...r,
              id: lineForm.id,
              name: lineForm.name,
              from: lineForm.from,
              to: lineForm.to,
              duration: lineForm.duration,
              tips: lineForm.tips
            };
          }
          return r;
        });
        setSuccess("تم تعديل الخط بنجاح محلياً.");
      } else {
        if (routes.some(r => r.id === lineForm.id)) {
          setError("كود الخط هذا مستخدم بالفعل.");
          return;
        }
        updatedRoutes.push({
          id: lineForm.id,
          name: lineForm.name,
          from: lineForm.from,
          to: lineForm.to,
          duration: lineForm.duration,
          tips: lineForm.tips,
          stops: [],
          classes: [
            { name: "درجة أولى مكيفة", price: "تحدد لاحقاً", features: "تكييف، مقاعد مريحة" },
            { name: "درجة ثانية مكيفة", price: "تحدد لاحقاً", features: "تكييف واقتصادي" }
          ]
        });
        setSuccess("تم إضافة الخط الجديد بنجاح محلياً.");
      }

      saveRoutesData(updatedRoutes);
      setShowLineModal(false);
    }
  };

  const handleDeleteLine = (item: any) => {
    setLineToDelete(item);
  };

  const confirmDeleteLine = async () => {
    if (!lineToDelete) return;
    setIsDeleting(true);
    setError("");
    setSuccess("");

    if (dbStatus && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("railway_routes")
          .delete()
          .eq("id", lineToDelete.id);

        if (dbErr) throw dbErr;

        setSuccess("تم حذف الخط بنجاح من قاعدة البيانات.");
        await loadRoutes();
        setLineToDelete(null);
      } catch (err: any) {
        console.error(err);
        setError("فشل حذف الخط من قاعدة البيانات: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    } else {
      const updated = routes.filter(r => r.id !== lineToDelete.id);
      saveRoutesData(updated);
      setSuccess("تم حذف الخط بنجاح محلياً.");
      if (selectedRouteId === lineToDelete.id && updated.length > 0) {
        setSelectedRouteId(updated[0].id);
      }
      setLineToDelete(null);
      setIsDeleting(false);
    }
  };

  // Station CRUD
  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleOpenAddStation = () => {
    if (!activeRoute) {
      setError("الرجاء اختيار خط أولاً.");
      return;
    }
    setError("");
    setSuccess("");
    setEditingStation(null);
    setStationForm({ name: "", status: "تشغيل فعلي" });
    setShowStationModal(true);
  };

  const handleOpenEditStation = (index: number, stop: RailwayStop) => {
    setError("");
    setSuccess("");
    setEditingStation({ id: stop.id, index, name: stop.name, status: stop.status });
    setStationForm({ name: stop.name, status: stop.status });
    setShowStationModal(true);
  };

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationForm.name) {
      setError("الرجاء إدخال اسم المحطة.");
      return;
    }

    if (dbStatus && supabase) {
      try {
        let dbErr;
        if (editingStation && editingStation.id) {
          const { error } = await supabase
            .from("railway_stations")
            .update({
              name: stationForm.name,
              status: stationForm.status
            })
            .eq("id", editingStation.id);
          dbErr = error;
        } else {
          const order = activeRoute.stops.length + 1;
          const { error } = await supabase
            .from("railway_stations")
            .insert([{
              route_id: selectedRouteId,
              name: stationForm.name,
              status: stationForm.status,
              station_order: order
            }]);
          dbErr = error;
        }

        if (dbErr) throw dbErr;

        setSuccess(editingStation ? "تم تعديل المحطة بنجاح في قاعدة البيانات." : "تم إضافة المحطة بنجاح لقاعدة البيانات.");
        await loadRoutes();
        setShowStationModal(false);
      } catch (err: any) {
        console.error(err);
        setError("فشلت العملية في قاعدة البيانات: " + err.message);
      }
    } else {
      const updatedRoutes = routes.map(r => {
        if (r.id === selectedRouteId) {
          let updatedStops = [...r.stops];
          if (editingStation) {
            updatedStops[editingStation.index] = {
              name: stationForm.name,
              status: stationForm.status
            };
          } else {
            updatedStops.push({
              name: stationForm.name,
              status: stationForm.status
            });
          }
          return { ...r, stops: updatedStops };
        }
        return r;
      });

      saveRoutesData(updatedRoutes);
      setSuccess(editingStation ? "تم تعديل المحطة بنجاح محلياً." : "تم إضافة المحطة بنجاح محلياً.");
      setShowStationModal(false);
    }
  };

  const handleDeleteStation = (index: number) => {
    setStationToDeleteIndex(index);
  };

  const confirmDeleteStation = async () => {
    if (stationToDeleteIndex === null) return;
    setIsDeleting(true);
    setError("");
    setSuccess("");

    const stopToDelete = activeRoute.stops[stationToDeleteIndex];
    if (dbStatus && supabase && stopToDelete.id) {
      try {
        const { error: dbErr } = await supabase
          .from("railway_stations")
          .delete()
          .eq("id", stopToDelete.id);

        if (dbErr) throw dbErr;

        setSuccess("تم حذف المحطة بنجاح من قاعدة البيانات.");
        await loadRoutes();
        setStationToDeleteIndex(null);
      } catch (err: any) {
        console.error(err);
        setError("فشل حذف المحطة من قاعدة البيانات: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    } else {
      const updatedRoutes = routes.map(r => {
        if (r.id === selectedRouteId) {
          const updatedStops = r.stops.filter((_, i) => i !== stationToDeleteIndex);
          return { ...r, stops: updatedStops };
        }
        return r;
      });
      saveRoutesData(updatedRoutes);
      setSuccess("تم حذف المحطة بنجاح محلياً.");
      setStationToDeleteIndex(null);
      setIsDeleting(false);
    }
  };

  const handleMoveStation = async (index: number, direction: "up" | "down") => {
    if (!activeRoute) return;
    const stops = [...activeRoute.stops];
    let targetIndex = index;
    if (direction === "up" && index > 0) {
      targetIndex = index - 1;
    } else if (direction === "down" && index < stops.length - 1) {
      targetIndex = index + 1;
    } else {
      return;
    }

    const temp = stops[index];
    stops[index] = stops[targetIndex];
    stops[targetIndex] = temp;

    if (dbStatus && supabase) {
      try {
        const stopA = activeRoute.stops[index];
        const stopB = activeRoute.stops[targetIndex];

        if (stopA.id && stopB.id) {
          const { error: errA } = await supabase
            .from("railway_stations")
            .update({ station_order: targetIndex + 1 })
            .eq("id", stopA.id);

          const { error: errB } = await supabase
            .from("railway_stations")
            .update({ station_order: index + 1 })
            .eq("id", stopB.id);

          if (errA || errB) throw (errA || errB);

          setSuccess("تم تحديث ترتيب المحطات بنجاح في قاعدة البيانات.");
          await loadRoutes();
        }
      } catch (err: any) {
        console.error(err);
        setError("فشل تحديث الترتيب في قاعدة البيانات: " + err.message);
      }
    } else {
      const updatedRoutes = routes.map(r => {
        if (r.id === selectedRouteId) {
          return { ...r, stops };
        }
        return r;
      });
      saveRoutesData(updatedRoutes);
    }
  };

  if (authLoading || loading || !isAdmin) {
    return <div style={{ padding: "2rem", color: "var(--text-secondary)", textAlign: "center" }}>جاري تحميل البيانات...</div>;
  }

  const filteredLines = routes.filter(r =>
    r.name.includes(searchQuery) ||
    r.from.includes(searchQuery) ||
    r.to.includes(searchQuery)
  );

  return (
    <div style={{ padding: "24px", direction: "rtl", textAlign: "right" }}>
      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "900", color: "var(--text-primary)" }}>إدارة سكك حديد مصر (ENR)</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            إضافة وتعديل خطوط ومحطات القطار، والتحكم في حالة التشغيل للخطوط الرئيسية.
          </p>
        </div>
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
            <span>يعمل في وضع الحفظ المحلي (LocalStorage) لبيانات سكك الحديد.</span>
          </div>
          <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            لم يتم العثور على جداول السكك الحديدية في قاعدة بيانات Supabase. لتفعيل الحفظ الدائم لجميع المستخدمين، يرجى إنشاء الجداول عن طريق تشغيل كود الـ SQL التالي في محرِّر الاستعلامات الخاص بـ Supabase (SQL Editor):
          </p>
          <pre style={{
            background: "rgba(0, 0, 0, 0.3)",
            padding: "14px",
            borderRadius: "8px",
            fontSize: "0.78rem",
            color: "#e2e8f0",
            overflowX: "auto",
            direction: "ltr",
            textAlign: "left"
          }}>
            {`CREATE TABLE IF NOT EXISTS public.railway_routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    duration TEXT NOT NULL,
    tips TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.railway_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id TEXT NOT NULL REFERENCES public.railway_routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    station_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'تشغيل فعلي',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);`}
          </pre>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px", marginBottom: "24px" }}>
        <button
          onClick={() => { setActiveSection("lines"); setError(""); setSuccess(""); }}
          className="ios-btn"
          style={{
            padding: "8px 16px",
            background: activeSection === "lines" ? "rgba(99, 102, 241, 0.15)" : "transparent",
            color: activeSection === "lines" ? "#818cf8" : "var(--text-secondary)",
            border: activeSection === "lines" ? "1px solid #818cf8" : "1px solid transparent",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🚊 إدارة خطوط القطار
        </button>
        <button
          onClick={() => { setActiveSection("stations"); setError(""); setSuccess(""); }}
          className="ios-btn"
          style={{
            padding: "8px 16px",
            background: activeSection === "stations" ? "rgba(16, 185, 129, 0.15)" : "transparent",
            color: activeSection === "stations" ? "#34d399" : "var(--text-secondary)",
            border: activeSection === "stations" ? "1px solid #34d399" : "1px solid transparent",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🚉 إدارة محطات التوقف والحالة
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className={styles.alertSuccess} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px" }}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.3rem" }} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className={styles.alertError} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
          <i className="bx bx-error-circle" style={{ fontSize: "1.3rem" }} />
          <span>{error}</span>
        </div>
      )}

      {/* ==================== LINE MANAGEMENT SECTION ==================== */}
      {activeSection === "lines" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
              <i className="bx bx-search" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontSize: "1.1rem" }} />
              <input
                type="text"
                placeholder="ابحث باسم الخط..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ios-input"
                style={{ width: "100%", paddingRight: "36px", height: "40px" }}
              />
            </div>
            <button onClick={handleOpenAddLine} className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", width: "70%" }}>
              <i className="bx bx-plus-medical"></i> إضافة خط قطار جديد
            </button>
          </div>

          <div className={styles.tableCard} style={{ overflowX: "auto" }}>
            <table className={styles.adminTable} style={{ width: "100%" }}>
              <thead className={styles.adminThead}>
                <tr className={styles.adminTr}>
                  <th className={styles.adminTh}>كود الخط (ID)</th>
                  <th className={styles.adminTh}>اسم الخط</th>
                  <th className={styles.adminTh}>محطة القيام</th>
                  <th className={styles.adminTh}>محطة الوصول</th>
                  <th className={styles.adminTh}>المدة الزمنية</th>
                  <th className={styles.adminTh}>المحطات</th>
                  <th className={styles.adminTh} style={{ textAlign: "center", width: "120px" }}>خيارات</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.map((line) => (
                  <tr key={line.id} className={styles.adminTr}>
                    <td className={styles.adminTd} style={{ fontWeight: "bold" }}>{line.id}</td>
                    <td className={styles.adminTd}>{line.name}</td>
                    <td className={styles.adminTd}>{line.from}</td>
                    <td className={styles.adminTd}>{line.to}</td>
                    <td className={styles.adminTd}>{line.duration}</td>
                    <td className={styles.adminTd}>{line.stops.length} محطات</td>
                    <td className={styles.adminTd} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditLine(line)}
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
                          onClick={() => handleDeleteLine(line)}
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
                ))}
                {filteredLines.length === 0 && (
                  <tr className={styles.adminTr}>
                    <td colSpan={7} className={styles.adminTd} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                      لا توجد خطوط مسجلة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== STATION MANAGEMENT SECTION ==================== */}
      {activeSection === "stations" && (
        <div>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "var(--text-secondary)" }}>اختر خط سكة الحديد لإدارته:</label>
            <select
              value={selectedRouteId}
              onChange={e => { setSelectedRouteId(e.target.value); setError(""); setSuccess(""); }}
              className="ios-input"
              style={{ width: "100%", minWidth: "300px", maxWidth: "300px" }}
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {activeRoute && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", width: "50%" }}>
                  محطات التوقف لخط: <span style={{ color: "#34d399" }}>{activeRoute.name}</span>
                </h3>
                <button onClick={handleOpenAddStation} className="ios-btn" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold" }}>
                  <i className="bx bx-plus-medical"></i> إضافة محطة جديدة للخط
                </button>
              </div>

              <div className={styles.tableCard} style={{ overflowX: "auto" }}>
                <table className={styles.adminTable} style={{ width: "100%" }}>
                  <thead className={styles.adminThead}>
                    <tr className={styles.adminTr}>
                      <th className={styles.adminTh} style={{ width: "80px", textAlign: "center" }}>الترتيب</th>
                      <th className={styles.adminTh}>اسم المحطة</th>
                      <th className={styles.adminTh}>حالة التشغيل</th>
                      <th className={styles.adminTh} style={{ textAlign: "center", width: "180px" }}>تعديل الترتيب</th>
                      <th className={styles.adminTh} style={{ textAlign: "center", width: "120px" }}>خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRoute.stops.map((stop, index) => {
                      const isFirst = index === 0;
                      const isLast = index === activeRoute.stops.length - 1;
                      const isUnderConstruction = stop.status === "تحت الإنشاء";

                      return (
                        <tr key={index} className={styles.adminTr}>
                          <td className={styles.adminTd} style={{ textAlign: "center", fontWeight: "bold" }}>{index + 1}</td>
                          <td className={styles.adminTd} style={{ fontWeight: "bold", color: "var(--text-primary)" }}>{stop.name}</td>
                          <td className={styles.adminTd}>
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              background: isUnderConstruction ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                              color: isUnderConstruction ? "#ef4444" : "#10b981",
                              border: isUnderConstruction ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(16, 185, 129, 0.2)",
                            }}>
                              {stop.status || "تشغيل فعلي"}
                            </span>
                          </td>
                          <td className={styles.adminTd} style={{ textAlign: "center" }}>
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <button
                                onClick={() => handleMoveStation(index, "up")}
                                disabled={isFirst}
                                className="ios-btn"
                                style={{
                                  padding: "4px 8px",
                                  background: "var(--bg-secondary)",
                                  fontSize: "0.8rem",
                                  opacity: isFirst ? 0.3 : 1,
                                  cursor: isFirst ? "not-allowed" : "pointer"
                                }}
                              >
                                <i className="bx bx-up-arrow-alt"></i>
                              </button>
                              <button
                                onClick={() => handleMoveStation(index, "down")}
                                disabled={isLast}
                                className="ios-btn"
                                style={{
                                  background: "var(--bg-secondary)",
                                  padding: "4px 8px",
                                  fontSize: "0.8rem",
                                  opacity: isLast ? 0.3 : 1,
                                  cursor: isLast ? "not-allowed" : "pointer"
                                }}
                              >
                                <i className="bx bx-down-arrow-alt"></i>
                              </button>
                            </div>
                          </td>
                          <td className={styles.adminTd} style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditStation(index, stop)}
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
                                onClick={() => handleDeleteStation(index)}
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
                    {activeRoute.stops.length === 0 && (
                      <tr className={styles.adminTr}>
                        <td colSpan={5} className={styles.adminTd} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                          لا توجد محطات تابعة لهذا الخط. أضف بعض المحطات!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== LINE EDIT/ADD MODAL ==================== */}
      {showLineModal && (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-glass)" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>
                {editingLine ? "تعديل خط سكة الحديد" : "إضافة خط سكة حديد جديد"}
              </h3>
              <button onClick={() => setShowLineModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.5rem", cursor: "pointer" }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSaveLine} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}>
              <div>
                <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>كود معرف الخط (مثال: cairo-suez) *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingLine}
                  value={lineForm.id}
                  onChange={e => setLineForm({ ...lineForm, id: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>اسم الخط الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: القاهرة ⇆ السويس (خط القناة)"
                  value={lineForm.name}
                  onChange={e => setLineForm({ ...lineForm, name: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>محطة القيام *</label>
                  <input
                    type="text"
                    required
                    value={lineForm.from}
                    onChange={e => setLineForm({ ...lineForm, from: e.target.value })}
                    className="ios-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>محطة النهاية *</label>
                  <input
                    type="text"
                    required
                    value={lineForm.to}
                    onChange={e => setLineForm({ ...lineForm, to: e.target.value })}
                    className="ios-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>متوسط زمن الرحلة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ساعتين ونصف"
                  value={lineForm.duration}
                  onChange={e => setLineForm({ ...lineForm, duration: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>نصيحة الموقع لمستخدمي الخط</label>
                <textarea
                  value={lineForm.tips}
                  onChange={e => setLineForm({ ...lineForm, tips: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%", minHeight: "80px", resize: "vertical", padding: "10px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowLineModal(false)} className="ios-btn" style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", color: "var(--color-white-100)" }}>إلغاء</button>
                <button type="submit" className="ios-btn" style={{ padding: "8px 20px", background: "#6366f1", color: "#fff" }}>حفظ الخط</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== STATION EDIT/ADD MODAL ==================== */}
      {showStationModal && (
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
            maxWidth: "460px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-glass)" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>
                {editingStation ? "تعديل محطة توقف" : "إضافة محطة جديدة للخط"}
              </h3>
              <button onClick={() => setShowStationModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.5rem", cursor: "pointer" }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSaveStation} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}>
              <div>
                <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>اسم محطة التوقف *</label>
                <input
                  type="text"
                  required
                  value={stationForm.name}
                  onChange={e => setStationForm({ ...stationForm, name: e.target.value })}
                  className="ios-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className="help-label color-white-100" style={{ display: "block", marginBottom: "6px" }}>حالة المحطة والتشغيل *</label>
                <select
                  value={stationForm.status}
                  onChange={e => setStationForm({ ...stationForm, status: e.target.value as "تشغيل فعلي" | "تحت الإنشاء" })}
                  className="ios-input"
                  style={{ width: "100%"}}
                >
                  <option value="تشغيل فعلي">تشغيل فعلي (تعمل)</option>
                  <option value="تحت الإنشاء">تحت الإنشاء 🚧</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowStationModal(false)} className="ios-btn" style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", color: "var(--color-white-100)" }}>إلغاء</button>
                <button type="submit" className="ios-btn" style={{ padding: "8px 20px", background: "#10b981", color: "#fff" }}>حفظ المحطة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal for Lines */}
      {lineToDelete && (
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
              هل أنت متأكد من حذف هذا الخط بالكامل بكل محطاته؟
              <strong style={{ display: "block", marginTop: "10px", color: "#ff4d4d", fontSize: "1.1rem" }}>
                « {lineToDelete.name} »
              </strong>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                disabled={isDeleting}
                onClick={confirmDeleteLine}
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
                onClick={() => setLineToDelete(null)}
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

      {/* Custom Delete Confirmation Modal for Stations */}
      {stationToDeleteIndex !== null && (
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
              هل أنت متأكد من حذف هذه المحطة من الخط؟
              <strong style={{ display: "block", marginTop: "10px", color: "#ff4d4d", fontSize: "1.1rem" }}>
                « {activeRoute?.stops[stationToDeleteIndex]?.name} »
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
                onClick={() => setStationToDeleteIndex(null)}
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
