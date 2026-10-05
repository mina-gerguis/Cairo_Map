"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import CustomModal from "@/components/common/Modals";
import { DEFAULT_HIGHWAYS, DEFAULT_ROAD_NEWS, HighwayItem, RoadNewsItem } from "@/data/roads_info";

export default function AdminRoadsInfoPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-textSecondary)" }}>جاري التحميل...</div>}>
      <AdminRoadsInfoInner />
    </Suspense>
  );
}

function AdminRoadsInfoInner() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<"roads" | "news">("roads");
  const [loading, setLoading] = useState(true);

  // Roads state
  const [roadsData, setRoadsData] = useState<HighwayItem[]>([]);
  const [roadSearch, setRoadSearch] = useState("");
  const [showRoadModal, setShowRoadModal] = useState(false);
  const [editingRoad, setEditingRoad] = useState<HighwayItem | null>(null);
  const [roadToDelete, setRoadToDelete] = useState<HighwayItem | null>(null);
  const [isDeletingRoad, setIsDeletingRoad] = useState(false);

  // Road Form Data
  const [roadForm, setRoadForm] = useState({
    name: "",
    code: "",
    type: "حر",
    lengthKm: 0,
    startPoint: "",
    endPoint: "",
    governorates: "القاهرة، الجيزة",
    speed_private_car: 120,
    speed_minibus: 100,
    speed_microbus: 100,
    speed_pickup: 90,
    speed_bus: 100,
    speed_truck: 80,
    lanesCount: 4,
    emergencyPhone: "01221110000",
    lat: 30.0444,
    lng: 31.2357,
    status: "open",
    description: "",
    radarInfo: "",
    mapUrl: "",
  });

  // News state
  const [newsData, setNewsData] = useState<RoadNewsItem[]>([]);
  const [newsSearch, setNewsSearch] = useState("");
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<RoadNewsItem | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<RoadNewsItem | null>(null);
  const [isDeletingNews, setIsDeletingNews] = useState(false);

  // News Form Data
  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    category: "weather_fog",
    severity: "warning",
    roadName: "كافة الطرق",
    source: "الإدارة العامة للمرور",
    isActive: true,
  });

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check Admin Access
  useEffect(() => {
    if (!authLoading) {
      if (!user || !profile?.is_admin) {
        router.push("/");
      }
    }
  }, [user, profile, authLoading, router]);

  // Load Data
  const loadAllData = async () => {
    try {
      setLoading(true);

      // 1. Load Roads
      let loadedRoads = DEFAULT_HIGHWAYS;
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("local_highways_info");
        if (cached) {
          try {
            loadedRoads = JSON.parse(cached);
          } catch {}
        }
      }

      if (supabase) {
        const { data: dbRoads, error: rErr } = await supabase
          .from("highways_info")
          .select("*")
          .order("length_km", { ascending: false });

        if (!rErr && dbRoads && dbRoads.length > 0) {
          loadedRoads = dbRoads.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code,
            type: d.type,
            lengthKm: Number(d.length_km) || 0,
            startPoint: d.start_point,
            endPoint: d.end_point,
            governorates: Array.isArray(d.governorates) ? d.governorates : [],
            speeds: {
              privateCar: d.speed_private_car ?? 120,
              minibus: d.speed_minibus ?? 100,
              microbus: d.speed_microbus ?? 100,
              pickup: d.speed_pickup ?? 90,
              bus: d.speed_bus ?? 100,
              truck: d.speed_truck ?? 80,
            },
            lanesCount: d.lanes_count ?? 4,
            tollGates: Array.isArray(d.toll_gates) ? d.toll_gates : [],
            gasStations: Array.isArray(d.gas_stations) ? d.gas_stations : [],
            emergencyPhone: d.emergency_phone || "01221110000",
            lat: Number(d.lat) || 30.0444,
            lng: Number(d.lng) || 31.2357,
            status: d.status || "open",
            statusText: d.status === "open" ? "مفتوح وسيولة" : "أعمال صيانة",
            description: d.description || "",
            radarInfo: d.radar_info || "",
            mapUrl: d.map_url || "",
          }));
        }
      }
      setRoadsData(loadedRoads);

      // 2. Load News
      let loadedNews = DEFAULT_ROAD_NEWS;
      if (typeof window !== "undefined") {
        const cachedN = localStorage.getItem("local_road_news");
        if (cachedN) {
          try {
            loadedNews = JSON.parse(cachedN);
          } catch {}
        }
      }

      if (supabase) {
        const { data: dbNews, error: nErr } = await supabase
          .from("road_news")
          .select("*")
          .order("published_at", { ascending: false });

        if (!nErr && dbNews && dbNews.length > 0) {
          loadedNews = dbNews.map((d: any) => ({
            id: d.id,
            title: d.title,
            summary: d.summary,
            category: d.category,
            severity: d.severity,
            roadName: d.road_name || "كافة الطرق",
            source: d.source || "الإدارة العامة للمرور",
            publishedAt: d.published_at || new Date().toISOString(),
            isActive: d.is_active ?? true,
          }));
        }
      }
      setNewsData(loadedNews);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync with LocalStorage helper
  const saveLocalRoads = (data: HighwayItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_highways_info", JSON.stringify(data));
    }
  };

  const saveLocalNews = (data: RoadNewsItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_road_news", JSON.stringify(data));
    }
  };

  // Road Modal Handlers
  const handleOpenAddRoad = () => {
    setEditingRoad(null);
    setRoadForm({
      name: "",
      code: "",
      type: "حر",
      lengthKm: 100,
      startPoint: "",
      endPoint: "",
      governorates: "القاهرة، الجيزة",
      speed_private_car: 120,
      speed_minibus: 100,
      speed_microbus: 100,
      speed_pickup: 90,
      speed_bus: 100,
      speed_truck: 80,
      lanesCount: 4,
      emergencyPhone: "01221110000",
      lat: 30.0444,
      lng: 31.2357,
      status: "open",
      description: "",
      radarInfo: "",
      mapUrl: "",
    });
    setError("");
    setSuccess("");
    setShowRoadModal(true);
  };

  const handleOpenEditRoad = (item: HighwayItem) => {
    setEditingRoad(item);
    setRoadForm({
      name: item.name,
      code: item.code || "",
      type: item.type,
      lengthKm: item.lengthKm,
      startPoint: item.startPoint,
      endPoint: item.endPoint,
      governorates: item.governorates.join("، "),
      speed_private_car: item.speeds.privateCar,
      speed_minibus: item.speeds.minibus,
      speed_microbus: item.speeds.microbus,
      speed_pickup: item.speeds.pickup,
      speed_bus: item.speeds.bus,
      speed_truck: item.speeds.truck,
      lanesCount: item.lanesCount,
      emergencyPhone: item.emergencyPhone || "01221110000",
      lat: item.lat,
      lng: item.lng,
      status: item.status,
      description: item.description,
      radarInfo: item.radarInfo || "",
      mapUrl: item.mapUrl || "",
    });
    setError("");
    setSuccess("");
    setShowRoadModal(true);
  };

  const handleSaveRoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadForm.name.trim() || !roadForm.startPoint.trim() || !roadForm.endPoint.trim()) {
      setError("يرجى ملء الحقول الإلزامية: اسم الطريق، نقطة البداية، ونقطة النهاية.");
      return;
    }

    try {
      const govArray = roadForm.governorates
        .split(/[،,]/)
        .map((g) => g.trim())
        .filter(Boolean);

      const dbPayload = {
        name: roadForm.name.trim(),
        code: roadForm.code.trim() || null,
        type: roadForm.type,
        length_km: Number(roadForm.lengthKm) || 0,
        start_point: roadForm.startPoint.trim(),
        end_point: roadForm.endPoint.trim(),
        governorates: govArray,
        speed_private_car: Number(roadForm.speed_private_car) || 120,
        speed_minibus: Number(roadForm.speed_minibus) || 100,
        speed_microbus: Number(roadForm.speed_microbus) || 100,
        speed_pickup: Number(roadForm.speed_pickup) || 90,
        speed_bus: Number(roadForm.speed_bus) || 100,
        speed_truck: Number(roadForm.speed_truck) || 80,
        lanes_count: Number(roadForm.lanesCount) || 4,
        emergency_phone: roadForm.emergencyPhone.trim() || "01221110000",
        lat: Number(roadForm.lat) || 30.0444,
        lng: Number(roadForm.lng) || 31.2357,
        status: roadForm.status,
        description: roadForm.description.trim(),
        radar_info: roadForm.radarInfo.trim() || null,
        map_url: roadForm.mapUrl.trim() || null,
      };

      if (editingRoad) {
        // Update
        if (supabase) {
          const { error: upErr } = await supabase
            .from("highways_info")
            .update(dbPayload)
            .eq("id", editingRoad.id);

          if (upErr) console.warn("Supabase update error:", upErr);
        }

        const updatedList = roadsData.map((r) =>
          r.id === editingRoad.id
            ? {
                ...r,
                name: dbPayload.name,
                code: dbPayload.code || undefined,
                type: dbPayload.type as any,
                lengthKm: dbPayload.length_km,
                startPoint: dbPayload.start_point,
                endPoint: dbPayload.end_point,
                governorates: dbPayload.governorates,
                speeds: {
                  privateCar: dbPayload.speed_private_car,
                  minibus: dbPayload.speed_minibus,
                  microbus: dbPayload.speed_microbus,
                  pickup: dbPayload.speed_pickup,
                  bus: dbPayload.speed_bus,
                  truck: dbPayload.speed_truck,
                },
                lanesCount: dbPayload.lanes_count,
                emergencyPhone: dbPayload.emergency_phone,
                lat: dbPayload.lat,
                lng: dbPayload.lng,
                status: dbPayload.status as any,
                description: dbPayload.description,
                radarInfo: dbPayload.radar_info || undefined,
                mapUrl: dbPayload.map_url || undefined,
              }
            : r
        );
        setRoadsData(updatedList);
        saveLocalRoads(updatedList);
        setSuccess("تم تحديث بيانات الطريق بنجاح!");
      } else {
        // Create
        let newId = `road_${Date.now()}`;
        if (supabase) {
          const { data: insData, error: insErr } = await supabase
            .from("highways_info")
            .insert(dbPayload)
            .select()
            .single();

          if (!insErr && insData) {
            newId = insData.id;
          }
        }

        const newRoadItem: HighwayItem = {
          id: newId,
          name: dbPayload.name,
          code: dbPayload.code || undefined,
          type: dbPayload.type as any,
          lengthKm: dbPayload.length_km,
          startPoint: dbPayload.start_point,
          endPoint: dbPayload.end_point,
          governorates: dbPayload.governorates,
          speeds: {
            privateCar: dbPayload.speed_private_car,
            minibus: dbPayload.speed_minibus,
            microbus: dbPayload.speed_microbus,
            pickup: dbPayload.speed_pickup,
            bus: dbPayload.speed_bus,
            truck: dbPayload.speed_truck,
          },
          lanesCount: dbPayload.lanes_count,
          emergencyPhone: dbPayload.emergency_phone,
          lat: dbPayload.lat,
          lng: dbPayload.lng,
          status: dbPayload.status as any,
          description: dbPayload.description,
          radarInfo: dbPayload.radar_info || undefined,
          mapUrl: dbPayload.map_url || undefined,
        };

        const updatedList = [newRoadItem, ...roadsData];
        setRoadsData(updatedList);
        saveLocalRoads(updatedList);
        setSuccess("تمت إضافة الطريق الجديد بنجاح!");
      }

      setTimeout(() => {
        setShowRoadModal(false);
      }, 1000);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "حدث خطأ أثناء الحفظ");
    }
  };

  const handleConfirmDeleteRoad = async () => {
    if (!roadToDelete) return;
    try {
      setIsDeletingRoad(true);
      if (supabase) {
        await supabase.from("highways_info").delete().eq("id", roadToDelete.id);
      }
      const updated = roadsData.filter((r) => r.id !== roadToDelete.id);
      setRoadsData(updated);
      saveLocalRoads(updated);
      setRoadToDelete(null);
    } catch (err: any) {
      alert("حدث خطأ أثناء الحذف: " + err.message);
    } finally {
      setIsDeletingRoad(false);
    }
  };

  // News Modal Handlers
  const handleOpenAddNews = () => {
    setEditingNews(null);
    setNewsForm({
      title: "",
      summary: "",
      category: "weather_fog",
      severity: "warning",
      roadName: "كافة الطرق",
      source: "الإدارة العامة للمرور",
      isActive: true,
    });
    setError("");
    setSuccess("");
    setShowNewsModal(true);
  };

  const handleOpenEditNews = (item: RoadNewsItem) => {
    setEditingNews(item);
    setNewsForm({
      title: item.title,
      summary: item.summary,
      category: item.category,
      severity: item.severity,
      roadName: item.roadName || "كافة الطرق",
      source: item.source || "الإدارة العامة للمرور",
      isActive: item.isActive,
    });
    setError("");
    setSuccess("");
    setShowNewsModal(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.summary.trim()) {
      setError("يرجى كتابة عنوان وملخص الخبر أو التنبيه.");
      return;
    }

    try {
      const dbPayload = {
        title: newsForm.title.trim(),
        summary: newsForm.summary.trim(),
        category: newsForm.category,
        severity: newsForm.severity,
        road_name: newsForm.roadName.trim() || "كافة الطرق",
        source: newsForm.source.trim() || "الإدارة العامة للمرور",
        is_active: newsForm.isActive,
      };

      if (editingNews) {
        if (supabase) {
          await supabase.from("road_news").update(dbPayload).eq("id", editingNews.id);
        }
        const updated = newsData.map((n) =>
          n.id === editingNews.id
            ? {
                ...n,
                title: dbPayload.title,
                summary: dbPayload.summary,
                category: dbPayload.category as any,
                severity: dbPayload.severity as any,
                roadName: dbPayload.road_name,
                source: dbPayload.source,
                isActive: dbPayload.is_active,
              }
            : n
        );
        setNewsData(updated);
        saveLocalNews(updated);
        setSuccess("تم تحديث الخبر بنجاح!");
      } else {
        let newId = `news_${Date.now()}`;
        if (supabase) {
          const { data: ins, error: insErr } = await supabase
            .from("road_news")
            .insert(dbPayload)
            .select()
            .single();
          if (!insErr && ins) newId = ins.id;
        }

        const newItem: RoadNewsItem = {
          id: newId,
          title: dbPayload.title,
          summary: dbPayload.summary,
          category: dbPayload.category as any,
          severity: dbPayload.severity as any,
          roadName: dbPayload.road_name,
          source: dbPayload.source,
          publishedAt: new Date().toISOString(),
          isActive: dbPayload.is_active,
        };

        const updated = [newItem, ...newsData];
        setNewsData(updated);
        saveLocalNews(updated);
        setSuccess("تم نشر الخبر والتنبيه بنجاح!");
      }

      setTimeout(() => {
        setShowNewsModal(false);
      }, 1000);
    } catch (err: any) {
      console.error("News save error:", err);
      setError(err.message || "حدث خطأ أثناء حفظ الخبر");
    }
  };

  const handleConfirmDeleteNews = async () => {
    if (!newsToDelete) return;
    try {
      setIsDeletingNews(true);
      if (supabase) {
        await supabase.from("road_news").delete().eq("id", newsToDelete.id);
      }
      const updated = newsData.filter((n) => n.id !== newsToDelete.id);
      setNewsData(updated);
      saveLocalNews(updated);
      setNewsToDelete(null);
    } catch (err: any) {
      alert("حدث خطأ أثناء الحذف: " + err.message);
    } finally {
      setIsDeletingNews(false);
    }
  };

  // Export Excel
  const handleExportRoads = async () => {
    const XLSX = await import("xlsx");
    const rows = roadsData.map((r) => ({
      "اسم الطريق": r.name,
      "كود الطريق": r.code || "",
      "النوع": r.type,
      "طول الطريق (كم)": r.lengthKm,
      "نقطة البداية": r.startPoint,
      "نقطة النهاية": r.endPoint,
      "المحافظات": r.governorates.join("، "),
      "ملاكي (كم/س)": r.speeds.privateCar,
      "ميني باص (كم/س)": r.speeds.minibus,
      "ميكروباص (كم/س)": r.speeds.microbus,
      "ربع نقل (كم/س)": r.speeds.pickup,
      "أتوبيس (كم/س)": r.speeds.bus,
      "نقل ثقيل (كم/س)": r.speeds.truck,
      "عدد الحارات": r.lanesCount,
      "طوارئ الطريق": r.emergencyPhone || "",
      "الحالة": r.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "معلومات الطرق");
    XLSX.writeFile(workbook, `CairoMap_Roads_Info_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Filter lists
  const filteredRoads = roadsData.filter(
    (r) =>
      r.name.toLowerCase().includes(roadSearch.toLowerCase()) ||
      r.startPoint.toLowerCase().includes(roadSearch.toLowerCase()) ||
      r.endPoint.toLowerCase().includes(roadSearch.toLowerCase())
  );

  const filteredNews = newsData.filter(
    (n) =>
      n.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
      n.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
      (n.roadName && n.roadName.toLowerCase().includes(newsSearch.toLowerCase()))
  );

  return (
    <div style={{ padding: "0 10px 40px 10px", direction: "rtl", textAlign: "right" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "6px" }}>
            <i className="bx bx-tachometer" style={{ marginLeft: "8px", color: "#3b82f6" }} />
            إدارة معلومات الطرق وأخبار المرور
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            إضافة وتعديل بيانات الطرق والسرعات المقررة قانوناً (ملاكي، ميني باص، ميكروباص، ربع نقل، أتوبيس)، وإدارة أخبار وحالة المرور والشبورة.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportRoads}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <i className="bx bx-download" /> تصدير إكسيل
          </button>

          {activeAdminTab === "roads" ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddRoad}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} /> إضافة طريق جديد
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddNews}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} /> إضافة خبر / تنبيه جديد
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#10b981", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
            <i className="bx bx-git-branch" />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>{roadsData.length}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>إجمالي الطرق المسجلة</div>
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
            <i className="bx bx-ruler" />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>
              {roadsData.reduce((acc, r) => acc + (r.lengthKm || 0), 0).toLocaleString("ar-EG")} كم
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>إجمالي أطوال الطرق</div>
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
            <i className="bx bx-bell" />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>{newsData.length}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>أخبار وتنبيهات المرور</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "24px", display: "flex", gap: "8px" }}>
        <button
          type="button"
          className="btn"
          onClick={() => { setActiveAdminTab("roads"); setError(""); setSuccess(""); }}
          style={{
            background: activeAdminTab === "roads" ? "var(--color-primary)" : "transparent",
            color: activeAdminTab === "roads" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            padding: "10px 20px"
          }}
        >
          <i className="bx bx-tachometer" style={{ marginLeft: "6px" }} />
          <span>إدارة الطرق والسرعات ({roadsData.length})</span>
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => { setActiveAdminTab("news"); setError(""); setSuccess(""); }}
          style={{
            background: activeAdminTab === "news" ? "var(--color-primary)" : "transparent",
            color: activeAdminTab === "news" ? "#fff" : "var(--text-secondary)",
            fontWeight: "bold",
            padding: "10px 20px"
          }}
        >
          <i className="bx bx-bell" style={{ marginLeft: "6px" }} />
          <span>إدارة أخبار وحالة الطرق ({newsData.length})</span>
        </button>
      </div>

      {/* ── TAB 1: ROADS TABLE ── */}
      {activeAdminTab === "roads" && (
        <>
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
                color: "var(--text-muted)",
                fontSize: "1.2rem"
              }} />
              <input
                type="text"
                placeholder="ابحث باسم الطريق أو البداية أو النهاية..."
                value={roadSearch}
                onChange={(e) => setRoadSearch(e.target.value)}
                className="input-fields"
                style={{
                  width: "100%",
                  paddingRight: "44px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-primary)"
                }}
              />
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              إجمالي الطرق: {filteredRoads.length}
            </div>
          </div>

          <div className={styles.tableCard} style={{ overflowX: "auto" }}>
            <table className={styles.adminTable} style={{ width: "100%" }}>
              <thead className={styles.adminThead}>
                <tr className={styles.adminTr}>
                  <th className={styles.adminTh}>اسم الطريق</th>
                  <th className={styles.adminTh}>النوع</th>
                  <th className={styles.adminTh}>الطول</th>
                  <th className={styles.adminTh}>البداية والنهاية</th>
                  <th className={styles.adminTh} style={{ color: "#38bdf8" }}>ملاكي</th>
                  <th className={styles.adminTh} style={{ color: "#34d399" }}>ميني باص</th>
                  <th className={styles.adminTh} style={{ color: "#fbbf24" }}>ميكروباص</th>
                  <th className={styles.adminTh} style={{ color: "#a78bfa" }}>ربع نقل</th>
                  <th className={styles.adminTh} style={{ color: "#06b6d4" }}>أتوبيس</th>
                  <th className={styles.adminTh} style={{ color: "#f87171" }}>نقل ثقيل</th>
                  <th className={styles.adminTh}>الحالة</th>
                  <th className={styles.adminTh} style={{ textAlign: "center" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className={styles.adminTr}>
                    <td colSpan={12} className={styles.adminTd} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.5rem", color: "var(--color-primary)" }} />
                      <div style={{ marginTop: "6px" }}>جاري التحميل...</div>
                    </td>
                  </tr>
                ) : filteredRoads.length === 0 ? (
                  <tr className={styles.adminTr}>
                    <td colSpan={12} className={styles.adminTd} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      لا توجد طرق مسجلة مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredRoads.map((r) => (
                    <tr key={r.id} className={styles.adminTr}>
                      <td className={styles.adminTd} style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                        <div>{r.name}</div>
                        {r.code && <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>كود: {r.code}</span>}
                      </td>
                      <td className={styles.adminTd}>
                        <span style={{ padding: "3px 8px", background: "rgba(59,130,246,0.15)", color: "#3b82f6", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                          {r.type}
                        </span>
                      </td>
                      <td className={styles.adminTd} style={{ fontWeight: "700", whiteSpace: "nowrap" }}>{r.lengthKm} كم</td>
                      <td className={styles.adminTd} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {r.startPoint} ← {r.endPoint}
                      </td>
                      <td className={styles.adminTd}><span style={{ color: "#0284c7", fontWeight: "800", fontSize: "0.95rem" }}>{r.speeds.privateCar}</span></td>
                      <td className={styles.adminTd}><span style={{ color: "#059669", fontWeight: "800", fontSize: "0.95rem" }}>{r.speeds.minibus}</span></td>
                      <td className={styles.adminTd}><span style={{ color: "#d97706", fontWeight: "800", fontSize: "0.95rem" }}>{r.speeds.microbus}</span></td>
                      <td className={styles.adminTd}><span style={{ color: "#7c3aed", fontWeight: "800", fontSize: "0.95rem" }}>{r.speeds.pickup}</span></td>
                      <td className={styles.adminTd}><span style={{ color: "#0891b2", fontWeight: "800", fontSize: "0.95rem" }}>{r.speeds.bus}</span></td>
                      <td className={styles.adminTd}><span style={{ color: "#dc2626", fontWeight: "800", fontSize: "0.95rem" }}>{r.speeds.truck}</span></td>
                      <td className={styles.adminTd}>
                        <span style={{ color: r.status === "open" ? "#16a34a" : "#d97706", fontSize: "0.8rem", fontWeight: "700" }}>
                          {r.status === "open" ? "مفتوح" : "صيانة"}
                        </span>
                      </td>
                      <td className={styles.adminTd} style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditRoad(r)}
                            className={styles.actionBtn}
                            title="تعديل"
                          >
                            <i className="bx bx-edit" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRoadToDelete(r)}
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            title="حذف"
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
        </>
      )}

      {/* ── TAB 2: NEWS TABLE ── */}
      {activeAdminTab === "news" && (
        <>
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
                color: "var(--text-muted)",
                fontSize: "1.2rem"
              }} />
              <input
                type="text"
                placeholder="ابحث في الأخبار والتنبيهات..."
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                className="input-fields"
                style={{
                  width: "100%",
                  paddingRight: "44px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-primary)"
                }}
              />
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              إجمالي التنبيهات: {filteredNews.length}
            </div>
          </div>

          <div className={styles.tableCard} style={{ overflowX: "auto" }}>
            <table className={styles.adminTable} style={{ width: "100%" }}>
              <thead className={styles.adminThead}>
                <tr className={styles.adminTr}>
                  <th className={styles.adminTh}>عنوان الخبر والتنبيه</th>
                  <th className={styles.adminTh}>التصنيف</th>
                  <th className={styles.adminTh}>الأهمية</th>
                  <th className={styles.adminTh}>الطريق المعني</th>
                  <th className={styles.adminTh}>المصدر</th>
                  <th className={styles.adminTh}>الحالة</th>
                  <th className={styles.adminTh} style={{ textAlign: "center" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.length === 0 ? (
                  <tr className={styles.adminTr}>
                    <td colSpan={7} className={styles.adminTd} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      لا توجد أخبار مسجلة
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((n) => (
                    <tr key={n.id} className={styles.adminTr}>
                      <td className={styles.adminTd} style={{ fontWeight: "700", maxWidth: "280px" }}>
                        <div style={{ color: "var(--text-primary)" }}>{n.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {n.summary}
                        </div>
                      </td>
                      <td className={styles.adminTd}>
                        <span style={{ fontSize: "0.8rem", color: "#3b82f6", fontWeight: "600" }}>
                          {n.category === "weather_fog" ? "طقس وشبورة" : n.category === "maintenance" ? "صيانة وتطوير" : n.category === "detour" ? "تحويلة" : n.category === "radar" ? "رادار" : "عام"}
                        </span>
                      </td>
                      <td className={styles.adminTd}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background: n.severity === "critical" ? "rgba(239,68,68,0.15)" : n.severity === "warning" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                            color: n.severity === "critical" ? "#dc2626" : n.severity === "warning" ? "#d97706" : "#2563eb",
                          }}
                        >
                          {n.severity === "critical" ? "عاجل" : n.severity === "warning" ? "تنبيه" : "معلومة"}
                        </span>
                      </td>
                      <td className={styles.adminTd} style={{ color: "var(--text-primary)" }}>{n.roadName || "كافة الطرق"}</td>
                      <td className={styles.adminTd} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{n.source}</td>
                      <td className={styles.adminTd}>
                        <span style={{ color: n.isActive ? "#16a34a" : "#94a3b8", fontWeight: "700", fontSize: "0.8rem" }}>
                          {n.isActive ? "منشور" : "معطل"}
                        </span>
                      </td>
                      <td className={styles.adminTd} style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditNews(n)}
                            className={styles.actionBtn}
                            title="تعديل"
                          >
                            <i className="bx bx-edit" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewsToDelete(n)}
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            title="حذف"
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
        </>
      )}

      {/* ── ROAD ADD / EDIT MODAL ── */}
      {showRoadModal && (
        <div
          className={styles.subModalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRoadModal(false);
          }}
        >
          <div
            className={styles.subModalBox}
            style={{ maxWidth: "750px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>
                {editingRoad ? "تعديل بيانات الطريق والسرعات" : "إضافة طريق جديد"}
              </h3>
              <button onClick={() => setShowRoadModal(false)} style={{ background: "none", border: "none", color: "var(--text-primary)", fontSize: "1.4rem", cursor: "pointer" }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSaveRoad}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    اسم الطريق (مطلوب):
                  </label>
                  <input
                    type="text"
                    required
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.name}
                    onChange={(e) => setRoadForm({ ...roadForm, name: e.target.value })}
                    placeholder="مثلاً: طريق القاهرة - السويس الصحراوي"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    كود الطريق (اختياري):
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.code}
                    onChange={(e) => setRoadForm({ ...roadForm, code: e.target.value })}
                    placeholder="مثلاً: H3 أو R1"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    نوع الطريق:
                  </label>
                  <select
                    className="input-fields"
                    style={{ width: "100%", cursor: "pointer" }}
                    value={roadForm.type}
                    onChange={(e) => setRoadForm({ ...roadForm, type: e.target.value })}
                  >
                    <option value="حر">طريق حر</option>
                    <option value="صحراوي">طريق صحراوي</option>
                    <option value="ساحلي">طريق ساحلي</option>
                    <option value="دائري">طريق دائري</option>
                    <option value="محور">محور رئيسي</option>
                    <option value="زراعي">طريق زراعي</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    طول الطريق بالكيلومتر:
                  </label>
                  <input
                    type="number"
                    required
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.lengthKm}
                    onChange={(e) => setRoadForm({ ...roadForm, lengthKm: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    عدد الحارات في الاتجاه:
                  </label>
                  <input
                    type="number"
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.lanesCount}
                    onChange={(e) => setRoadForm({ ...roadForm, lanesCount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    نقطة البداية (مطلوب):
                  </label>
                  <input
                    type="text"
                    required
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.startPoint}
                    onChange={(e) => setRoadForm({ ...roadForm, startPoint: e.target.value })}
                    placeholder="مثلاً: بوابة القاهرة الكيلو 28"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    نقطة النهاية (مطلوب):
                  </label>
                  <input
                    type="text"
                    required
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.endPoint}
                    onChange={(e) => setRoadForm({ ...roadForm, endPoint: e.target.value })}
                    placeholder="مثلاً: مدخل مدينة السويس"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  المحافظات التي يمر بها (مفصولة بفواصل):
                </label>
                <input
                  type="text"
                  className="input-fields"
                  style={{ width: "100%" }}
                  value={roadForm.governorates}
                  onChange={(e) => setRoadForm({ ...roadForm, governorates: e.target.value })}
                  placeholder="القاهرة، الجيزة، السويس"
                />
              </div>

              {/* Vehicle Speed Limits */}
              <div style={{ background: "var(--inputBg, rgba(15,23,42,0.6))", padding: "14px", borderRadius: "14px", marginBottom: "14px", border: "1px solid var(--border-glass)" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#3b82f6", marginBottom: "10px" }}>
                  السرعات المحددة للرادار (كم/ساعة لكل نوع مركبة):
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#0284c7" }}>ملاكي:</label>
                    <input
                      type="number"
                      className="input-fields"
                      style={{ width: "100%" }}
                      value={roadForm.speed_private_car}
                      onChange={(e) => setRoadForm({ ...roadForm, speed_private_car: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#059669" }}>ميني باص:</label>
                    <input
                      type="number"
                      className="input-fields"
                      style={{ width: "100%" }}
                      value={roadForm.speed_minibus}
                      onChange={(e) => setRoadForm({ ...roadForm, speed_minibus: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#d97706" }}>ميكروباص:</label>
                    <input
                      type="number"
                      className="input-fields"
                      style={{ width: "100%" }}
                      value={roadForm.speed_microbus}
                      onChange={(e) => setRoadForm({ ...roadForm, speed_microbus: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#7c3aed" }}>ربع نقل:</label>
                    <input
                      type="number"
                      className="input-fields"
                      style={{ width: "100%" }}
                      value={roadForm.speed_pickup}
                      onChange={(e) => setRoadForm({ ...roadForm, speed_pickup: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#0891b2" }}>أتوبيس:</label>
                    <input
                      type="number"
                      className="input-fields"
                      style={{ width: "100%" }}
                      value={roadForm.speed_bus}
                      onChange={(e) => setRoadForm({ ...roadForm, speed_bus: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#dc2626" }}>نقل ثقيل:</label>
                    <input
                      type="number"
                      className="input-fields"
                      style={{ width: "100%" }}
                      value={roadForm.speed_truck}
                      onChange={(e) => setRoadForm({ ...roadForm, speed_truck: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates for weather and phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    طوارئ الطريق:
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.emergencyPhone}
                    onChange={(e) => setRoadForm({ ...roadForm, emergencyPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    خط العرض (Lat للطقس):
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.lat}
                    onChange={(e) => setRoadForm({ ...roadForm, lat: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    خط الطول (Lng للطقس):
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={roadForm.lng}
                    onChange={(e) => setRoadForm({ ...roadForm, lng: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  وصف الطريق ومواصفاته:
                </label>
                <textarea
                  rows={3}
                  className="input-fields"
                  style={{ width: "100%" }}
                  value={roadForm.description}
                  onChange={(e) => setRoadForm({ ...roadForm, description: e.target.value })}
                  placeholder="وصف للطريق والمخارج ومسارات الشاحنات..."
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  معلومات وتنبيهات الرادارات:
                </label>
                <input
                  type="text"
                  className="input-fields"
                  style={{ width: "100%" }}
                  value={roadForm.radarInfo}
                  onChange={(e) => setRoadForm({ ...roadForm, radarInfo: e.target.value })}
                  placeholder="رادارات حديثة ترصد السرعة اللحظية وحزام الأمان..."
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  رابط خرائط جوجل (Google Maps URL):
                </label>
                <input
                  type="url"
                  className="input-fields"
                  style={{ width: "100%" }}
                  value={roadForm.mapUrl}
                  onChange={(e) => setRoadForm({ ...roadForm, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              {error && <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "0.85rem" }}>{error}</div>}
              {success && <div style={{ color: "#10b981", marginBottom: "12px", fontSize: "0.85rem" }}>{success}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoadModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoad ? "حفظ التعديلات" : "إضافة الطريق"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── NEWS ADD / EDIT MODAL ── */}
      {showNewsModal && (
        <div
          className={styles.subModalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewsModal(false);
          }}
        >
          <div
            className={styles.subModalBox}
            style={{ maxWidth: "600px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>
                {editingNews ? "تعديل الخبر أو التنبيه" : "إضافة خبر مروري جديد"}
              </h3>
              <button onClick={() => setShowNewsModal(false)} style={{ background: "none", border: "none", color: "var(--text-primary)", fontSize: "1.4rem", cursor: "pointer" }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSaveNews}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  عنوان الخبر / التنبيه (مطلوب):
                </label>
                <input
                  type="text"
                  required
                  className="input-fields"
                  style={{ width: "100%" }}
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="مثلاً: تنبيه شبورة مائية على طريق الإسكندرية الصحراوي"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    التصنيف:
                  </label>
                  <select
                    className="input-fields"
                    style={{ width: "100%", cursor: "pointer" }}
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                  >
                    <option value="weather_fog">طقس وشبورة مائية</option>
                    <option value="maintenance">صيانة وتطوير كباري</option>
                    <option value="detour">تحويلات مرورية</option>
                    <option value="traffic">سيولة وكثافات</option>
                    <option value="radar">رادارات وقوانين</option>
                    <option value="general">خبر عام</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    درجة الأهمية:
                  </label>
                  <select
                    className="input-fields"
                    style={{ width: "100%", cursor: "pointer" }}
                    value={newsForm.severity}
                    onChange={(e) => setNewsForm({ ...newsForm, severity: e.target.value })}
                  >
                    <option value="warning">تنبيه هام (أصفر)</option>
                    <option value="critical">عاجل وطارئ (أحمر)</option>
                    <option value="info">معلومة مرورية (أزرق)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    الطريق المرتبط (اختر من الطرق المسجلة):
                  </label>
                  <select
                    className="input-fields"
                    style={{ width: "100%", cursor: "pointer" }}
                    value={newsForm.roadName}
                    onChange={(e) => setNewsForm({ ...newsForm, roadName: e.target.value })}
                  >
                    <option value="كافة الطرق">كافة الطرق والمحاور (تنبيه عام)</option>
                    {roadsData.map((road) => (
                      <option key={road.id} value={road.name}>
                        {road.name} {road.code ? `(${road.code})` : ""}
                      </option>
                    ))}
                    {newsForm.roadName &&
                      newsForm.roadName !== "كافة الطرق" &&
                      !roadsData.some((r) => r.name === newsForm.roadName) && (
                        <option value={newsForm.roadName}>{newsForm.roadName}</option>
                      )}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    مصدر الخبر:
                  </label>
                  <input
                    type="text"
                    className="input-fields"
                    style={{ width: "100%" }}
                    value={newsForm.source}
                    onChange={(e) => setNewsForm({ ...newsForm, source: e.target.value })}
                    placeholder="الإدارة العامة للمرور"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  تفاصيل وملخص الخبر (مطلوب):
                </label>
                <textarea
                  rows={4}
                  required
                  className="input-fields"
                  style={{ width: "100%" }}
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  placeholder="اكتب نص التنبيه وإرشادات القيادة للسائقين..."
                />
              </div>

              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="isActiveNews"
                  checked={newsForm.isActive}
                  onChange={(e) => setNewsForm({ ...newsForm, isActive: e.target.checked })}
                />
                <label htmlFor="isActiveNews" style={{ fontSize: "0.85rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  نشر الخبر وجعله فعالاً في صفحة المستخدمين
                </label>
              </div>

              {error && <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "0.85rem" }}>{error}</div>}
              {success && <div style={{ color: "#10b981", marginBottom: "12px", fontSize: "0.85rem" }}>{success}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewsModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNews ? "حفظ التعديلات" : "نشر الخبر"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Road Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(roadToDelete)}
        onClose={() => setRoadToDelete(null)}
        title="تأكيد حذف الطريق"
        message={`هل أنت متأكد من حذف طريق "${roadToDelete?.name}" نهائياً من قاعدة البيانات؟`}
        iconSrc="/images/icons3d/trash.webp"
        primaryButton={{
          label: isDeletingRoad ? "جاري الحذف..." : "حذف نهائي",
          onClick: handleConfirmDeleteRoad,
          bgColor: "#ef4444",
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setRoadToDelete(null),
        }}
      />

      {/* Delete News Confirmation Modal */}
      <CustomModal
        isOpen={Boolean(newsToDelete)}
        onClose={() => setNewsToDelete(null)}
        title="تأكيد حذف الخبر"
        message={`هل أنت متأكد من حذف خبر "${newsToDelete?.title}"؟`}
        iconSrc="/images/icons3d/trash.webp"
        primaryButton={{
          label: isDeletingNews ? "جاري الحذف..." : "حذف",
          onClick: handleConfirmDeleteNews,
          bgColor: "#ef4444",
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setNewsToDelete(null),
        }}
      />
    </div>
  );
}
