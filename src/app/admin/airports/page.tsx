"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "../admin.module.css";
import Link from "next/link";
import { DEFAULT_AIRPORTS } from "@/data/airports";
import clsx from "clsx";

export default function AdminAirportsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>جاري التحميل...</div>}>
      <AdminAirportsInner />
    </Suspense>
  );
}

function AdminAirportsInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [airportsData, setAirportsData] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<any>({
    name: "",
    name_en: "",
    name_ar: "",
    code: "",
    iata_code: "",
    icao_code: "",
    type: "",
    type_en: "",
    governorate_ar: "",
    governorate_en: "",
    city: "",
    city_ar: "",
    city_en: "",
    area_ar: "",
    latitude: "",
    longitude: "",
    short_description: "",
    description: "",
    connections: "",
    nearby_landmarks: "",
    transportation: "",
    services: "",
    airlines: "",
    destinations: "",
    parking: "",
    official_website: "",
    phone: "",
    map_url: "",
    keywords_ar: "",
    keywords_en: "",
    terminals_count: "",
    capacity: "",
    runways_count: "",
    runways_length: "",
    domestic_flights: "",
    international_flights: ""
  });

  const getLocalData = (): any[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_airports");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_AIRPORTS;
        }
      }
    }
    return DEFAULT_AIRPORTS;
  };

  const saveLocalData = (data: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("local_airports", JSON.stringify(data));
    }
  };

  const fetchAirportsData = async () => {
    if (!supabase) {
      setAirportsData(getLocalData());
      setDbStatus(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("airports").select("*");
      if (error) {
        console.warn("Failed to fetch airports, using fallback.", error);
        setAirportsData(getLocalData());
        setDbStatus(false);
      } else {
        const mappedData = data ? data : [];
        // Merge database records with the local default airports
        const enriched = mappedData.map(dbAirport => {
          const localMatch = DEFAULT_AIRPORTS.find(
            la =>
              (la.iata_code && dbAirport.code && la.iata_code.toLowerCase() === dbAirport.code.toLowerCase()) ||
              (la.name_ar && dbAirport.name && la.name_ar.includes(dbAirport.name))
          );

          // Map DB columns to Frontend keys
          return {
            ...localMatch,
            ...dbAirport,
            name_ar: dbAirport.name || localMatch?.name_ar || "",
            name_en: dbAirport.name_en || localMatch?.name_en || "",
            iata_code: dbAirport.code || dbAirport.iata_code || localMatch?.iata_code || "",
            city_ar: dbAirport.city || dbAirport.city_ar || localMatch?.city_ar || "",
            city_en: dbAirport.city_en || localMatch?.city_en || "",
            governorate_ar: dbAirport.governorate || dbAirport.governorate_ar || localMatch?.governorate_ar || "",
            governorate_en: dbAirport.governorate_en || localMatch?.governorate_en || "",
            area_ar: dbAirport.region || dbAirport.area_ar || localMatch?.area_ar || "",
            type: dbAirport.type || localMatch?.type || "",
            type_en: dbAirport.type_en || localMatch?.type_en || "",

            short_description: dbAirport.short_desc || dbAirport.short_description || localMatch?.short_description || "",
            description: dbAirport.detailed_desc || dbAirport.description || localMatch?.description || "",

            address: dbAirport.address || localMatch?.address || "",
            capacity: dbAirport.capacity || localMatch?.capacity || "",
            terminals_count: dbAirport.terminals_count || dbAirport.terminals || localMatch?.terminals_count || "غير محدد",
            runways_count: dbAirport.runways_count || localMatch?.runways_count || "",
            runways_length: dbAirport.runways_length || localMatch?.runways_length || "",

            domestic_flights: dbAirport.domestic_flights || localMatch?.domestic_flights || "",
            international_flights: dbAirport.international_flights || localMatch?.international_flights || "",

            services: Array.isArray(dbAirport.services) ? dbAirport.services : (localMatch?.services || []),
            airlines: dbAirport.airlines || localMatch?.airlines || "غير محدد",
            destinations: dbAirport.destinations || localMatch?.destinations || "",
            connections: Array.isArray(dbAirport.connections) ? dbAirport.connections : (localMatch?.connections || []),

            nearby_landmarks: Array.isArray(dbAirport.landmarks) ? dbAirport.landmarks :
              (Array.isArray(dbAirport.nearby_landmarks) ? dbAirport.nearby_landmarks : (localMatch?.nearby_landmarks || [])),

            transportation: Array.isArray(dbAirport.transit) ? dbAirport.transit :
              (Array.isArray(dbAirport.transportation) ? dbAirport.transportation : (localMatch?.transportation || [])),

            parking: dbAirport.parking || localMatch?.parking || "",
            official_website: dbAirport.official_website || localMatch?.official_website || "",
            phone: dbAirport.phone || localMatch?.phone || "غير متوفر",
            map_url: dbAirport.map_url || localMatch?.map_url || "",

            keywords_ar: Array.isArray(dbAirport.keywords_ar) ? dbAirport.keywords_ar : (localMatch?.keywords_ar || []),
            keywords_en: Array.isArray(dbAirport.keywords_en) ? dbAirport.keywords_en : (localMatch?.keywords_en || [])
          };
        });

        const dbCodes = new Set(mappedData.map(d => d.code ? d.code.toLowerCase() : ""));
        const missingLocals = DEFAULT_AIRPORTS.filter(la => la.iata_code && !dbCodes.has(la.iata_code.toLowerCase()));

        setAirportsData([...enriched, ...missingLocals]);
        setDbStatus(true);
      }
    } catch (err) {
      console.error(err);
      setAirportsData(getLocalData());
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
        setAirportsData(getLocalData());
        setDbStatus(false);
        return;
      }

      try {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileErr || !profile?.is_admin) {
          router.push("/");
        } else {
          setIsAdmin(true);
          await fetchAirportsData();
        }
      } catch (err) {
        console.error("Auth authorization check failed", err);
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
      name_en: "",
      name_ar: "",
      code: "",
      iata_code: "",
      icao_code: "",
      type: "",
      type_en: "",
      governorate_ar: "",
      governorate_en: "",
      city: "",
      city_ar: "",
      city_en: "",
      area_ar: "",
      latitude: "",
      longitude: "",
      short_description: "",
      description: "",
      connections: "",
      nearby_landmarks: "",
      transportation: "",
      services: "",
      airlines: "",
      destinations: "",
      parking: "",
      official_website: "",
      phone: "",
      map_url: "",
      keywords_ar: "",
      keywords_en: "",
      terminals_count: "",
      capacity: "",
      runways_count: "",
      runways_length: "",
      domestic_flights: "",
      international_flights: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setError("");
    setSuccess("");
    setEditingItem(item);
    setFormData({
      ...item,
      services: Array.isArray(item.services) ? item.services.join(", ") : item.services || "",
      connections: Array.isArray(item.connections) ? item.connections.join(", ") : item.connections || "",
      nearby_landmarks: Array.isArray(item.nearby_landmarks) ? item.nearby_landmarks.join(", ") : item.nearby_landmarks || "",
      transportation: Array.isArray(item.transportation) ? item.transportation.join(", ") : item.transportation || "",
      keywords_ar: Array.isArray(item.keywords_ar) ? item.keywords_ar.join(", ") : item.keywords_ar || "",
      keywords_en: Array.isArray(item.keywords_en) ? item.keywords_en.join(", ") : item.keywords_en || "",
      name: item.name || item.name_ar || "",
      code: item.code || item.iata_code || "",
      city: item.city || item.city_ar || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let payload = { ...formData };
    payload.services = typeof formData.services === "string"
      ? formData.services.split(",").map((s: string) => s.trim()).filter(Boolean)
      : formData.services || [];
    payload.connections = typeof formData.connections === "string"
      ? formData.connections.split(",").map((s: string) => s.trim()).filter(Boolean)
      : formData.connections || [];
    payload.nearby_landmarks = typeof formData.nearby_landmarks === "string"
      ? formData.nearby_landmarks.split(",").map((s: string) => s.trim()).filter(Boolean)
      : formData.nearby_landmarks || [];
    payload.transportation = typeof formData.transportation === "string"
      ? formData.transportation.split(",").map((s: string) => s.trim()).filter(Boolean)
      : formData.transportation || [];
    payload.keywords_ar = typeof formData.keywords_ar === "string"
      ? formData.keywords_ar.split(",").map((s: string) => s.trim()).filter(Boolean)
      : formData.keywords_ar || [];
    payload.keywords_en = typeof formData.keywords_en === "string"
      ? formData.keywords_en.split(",").map((s: string) => s.trim()).filter(Boolean)
      : formData.keywords_en || [];

    // Convert coordinates
    payload.latitude = formData.latitude ? parseFloat(formData.latitude) : 0;
    payload.longitude = formData.longitude ? parseFloat(formData.longitude) : 0;

    // Sync columns
    payload.name = formData.name || formData.name_ar || "";
    payload.name_ar = formData.name_ar || formData.name || "";
    payload.code = formData.code || formData.iata_code || "";
    payload.iata_code = formData.iata_code || formData.code || "";
    payload.city = formData.city || formData.city_ar || "";
    payload.city_ar = formData.city_ar || formData.city || "";

    payload.name_en = formData.name_en || "";
    payload.icao_code = formData.icao_code || "";
    payload.governorate = formData.governorate_ar || "";
    payload.region = formData.area_ar || "";
    payload.short_desc = formData.short_description || "";
    payload.detailed_desc = formData.description || "";
    payload.coordinates = `${formData.latitude || 30.0}° N, ${formData.longitude || 31.0}° E`;
    payload.address = formData.address || "";
    payload.capacity = formData.capacity || "";
    payload.runways_count = formData.runways_count || "";
    payload.runways_length = formData.runways_length || "";
    payload.domestic_flights = formData.domestic_flights || "";
    payload.international_flights = formData.international_flights || "";
    payload.destinations = formData.destinations || "";
    payload.landmarks = payload.nearby_landmarks;
    payload.transit = payload.transportation;
    payload.parking = formData.parking || "";
    payload.official_website = formData.official_website || "";
    payload.search_keywords = [...(payload.keywords_ar || []), ...(payload.keywords_en || [])].join(", ");

    if (dbStatus && supabase) {
      try {
        const dbPayload = {
          name: payload.name || "",
          code: payload.code || "",
          city: payload.city || "",
          type: payload.type || "",
          terminals: payload.terminals || payload.terminals_count || "",
          services: payload.services || [],
          airlines: payload.airlines || "",
          phone: payload.phone || "",
          map_url: payload.map_url || "",

          // Enriched columns
          name_en: payload.name_en || "",
          iata_code: payload.iata_code || "",
          icao_code: payload.icao_code || "",
          governorate: payload.governorate || "",
          region: payload.region || "",
          short_desc: payload.short_desc || "",
          detailed_desc: payload.detailed_desc || "",
          coordinates: payload.coordinates || "",
          address: payload.address || "",
          capacity: payload.capacity || "",
          runways_count: payload.runways_count || "",
          runways_length: payload.runways_length || "",
          domestic_flights: payload.domestic_flights || "",
          international_flights: payload.international_flights || "",
          destinations: payload.destinations || "",
          landmarks: payload.landmarks || [],
          transit: payload.transit || [],
          parking: payload.parking || "",
          official_website: payload.official_website || "",
          search_keywords: payload.search_keywords || ""
        };

        const basicPayload = {
          name: payload.name || payload.name_ar || "",
          code: payload.code || payload.iata_code || "",
          city: payload.city || payload.city_ar || "",
          type: payload.type || "",
          terminals: payload.terminals || payload.terminals_count || "",
          services: payload.services || [],
          airlines: payload.airlines || "",
          phone: payload.phone || "",
          map_url: payload.map_url || ""
        };

        const isUUID = (str: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
        const isEditingDbRecord = editingItem && editingItem.id && isUUID(editingItem.id);

        if (isEditingDbRecord) {
          let { error: dbErr } = await supabase
            .from("airports")
            .update(dbPayload)
            .eq("id", editingItem.id);

          if (dbErr) {
            const errorMsg = dbErr.message || "";
            if (errorMsg.includes("Could not find the") || errorMsg.includes("column") || dbErr.code === "PGRST102") {
              console.warn("Schema mismatch, retrying with basic columns:", errorMsg);
              const { error: retryErr } = await supabase
                .from("airports")
                .update(basicPayload)
                .eq("id", editingItem.id);
              if (retryErr) throw retryErr;
            } else {
              throw dbErr;
            }
          }
          setSuccess("تم تعديل السجل بنجاح في قاعدة البيانات.");
        } else {
          let { error: dbErr } = await supabase
            .from("airports")
            .insert(dbPayload);

          if (dbErr) {
            const errorMsg = dbErr.message || "";
            if (errorMsg.includes("Could not find the") || errorMsg.includes("column") || dbErr.code === "PGRST102") {
              console.warn("Schema mismatch, retrying with basic columns:", errorMsg);
              const { error: retryErr } = await supabase
                .from("airports")
                .insert(basicPayload);
              if (retryErr) throw retryErr;
            } else {
              throw dbErr;
            }
          }
          setSuccess("تم إضافة المطار بنجاح إلى قاعدة البيانات.");
        }
        await fetchAirportsData();
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
        setSuccess("تم تعديل السجل بنجاح محلياً.");
      } else {
        const newRecord = {
          id: Date.now().toString(),
          ...payload
        };
        currentLocal = [newRecord, ...currentLocal];
        setSuccess("تم إضافة السجل بنجاح محلياً.");
      }
      saveLocalData(currentLocal);
      setAirportsData(currentLocal);
      setShowModal(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا المطار؟")) return;
    setError("");
    setSuccess("");

    if (dbStatus && supabase) {
      try {
        const { error: dbErr } = await supabase
          .from("airports")
          .delete()
          .eq("id", item.id);
        if (dbErr) throw dbErr;
        setSuccess("تم حذف المطار بنجاح من قاعدة البيانات.");
        await fetchAirportsData();
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
      setAirportsData(currentLocal);
      setSuccess("تم حذف السجل بنجاح محلياً.");
    }
  };

  // Filter rows based on search query
  const filteredRows = airportsData.filter(item => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const nameAr = (item.name || "").toLowerCase();
    const nameEn = (item.name_en || "").toLowerCase();
    const code = (item.code || item.iata_code || "").toLowerCase();
    const city = (item.city || "").toLowerCase();
    const type = (item.type || "").toLowerCase();
    return nameAr.includes(term) || nameEn.includes(term) || code.includes(term) || city.includes(term) || type.includes(term);
  });

  if (authLoading || loading) {
    return (
      <div className={styles.adminShell} style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.05)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>جاري تحميل إدارة المطارات...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.adminShell} style={{ direction: "rtl", textAlign: "right" }}>

      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-primary, #fff)", marginBottom: "6px" }}>
            إدارة المطارات
          </h1>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
            إضافة وتعديل وحذف مطارات القاهرة ومصر وتعديل بياناتها والاتصال والرحلات.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="ios-btn" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff", padding: "10px 20px" }}>
          <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
          إضافة مطار جديد
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
            لم يتم العثور على جدول قاعدة البيانات المناسب لجدول المطارات في Supabase. التغييرات التي تقوم بها هنا سيتم حفظها في متصفحك الحالي فقط كحفظ احتياطي مؤقت.
            لتفعيل حفظ التغييرات لكل مستخدمي الموقع بشكل دائم، يرجى فتح تبويب **SQL Editor** في لوحة تحكم Supabase الخاصة بك، وتشغيل السكريبت الموجود في ملف

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
            placeholder="البحث عن مطار باسمه، الكود، أو المدينة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ios-input"
            style={{
              width: "100%",
              paddingRight: "44px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-secondary)"
            }}
          />
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          إجمالي المطارات: {filteredRows.length}
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
              <th className={styles.adminTh}>الاسم</th>
              <th className={styles.adminTh}>الكود</th>
              <th className={styles.adminTh}>المدينة</th>
              <th className={styles.adminTh}>النوع</th>
              <th className={styles.adminTh}>الهاتف</th>
              <th className={styles.adminTh}>الصالات والبنية</th>
              <th className={styles.adminTh}>خطوط الطيران</th>
              <th className={styles.adminTh} style={{ textAlign: "center" }}>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr className={styles.adminTr}>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  لا توجد أي سجلات مطارات متوفرة حالياً.
                </td>
              </tr>
            ) : (
              filteredRows.map((item, idx) => (
                <tr key={item.id || idx} className={styles.adminTr}>
                  <td className={styles.adminTd} style={{ width: "15%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontWeight: "bold" }}>{item.name}</span>
                      {item.name_en && (
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{item.name_en}</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.adminTd} style={{ width: "5%" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span className={styles.airportCodeBadge} title="كود IATA">
                        {item.code || item.iata_code || "N/A"}
                      </span>
                      {item.icao_code && (
                        <span className={styles.airportIcaoBadge} title="كود ICAO">
                          {item.icao_code}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.adminTd} style={{ width: "15%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span>{item.city}</span>
                      {item.governorate_ar && item.governorate_ar !== item.city && (
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>{item.governorate_ar}</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.adminTd} style={{ width: "10%" }}>
                    <span className={(item.type?.includes("دولي") || item.type?.toLowerCase().includes("int")) ? styles.airportTypeInt : styles.airportTypeDom}>
                      <i className={(item.type?.includes("دولي") || item.type?.toLowerCase().includes("int")) ? "bx bx-globe" : "bx bx-navigation"} />
                      {item.type}
                    </span>
                  </td>
                  <td className={styles.adminTd} style={{ width: "10%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", direction: "ltr", justifyContent: "flex-end" }}>
                      <i className="bx bx-phone" style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.95rem" }} />
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{item.phone}</span>
                    </div>
                  </td>
                  <td className={styles.adminTd} style={{
                    width: "10%", fontSize: "0.78rem",
                    maxWidth: "150px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>
                        {item.terminals_count || "غير محدد"}
                      </span>
                      {item.terminals && (
                        <span
                          title={item.terminals}
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted, #94a3b8)",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {item.terminals}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.adminTd} title={item.airlines} style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.85rem" }}>{item.airlines}</span>
                  </td>
                  <td className={styles.adminTd}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => handleOpenEdit(item)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="تعديل"
                        style={{
                          padding: "5px 5px",
                          borderRadius:"50%",
                          background: "var(--bg-secondary)",
                         
                        }}
                        >
                        <i className="bx bx-edit-alt" />
                      </button>
                      <button onClick={() => handleDelete(item)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="حذف"
                        style={{
                          padding: "5px 5px",
                          borderRadius:"50%",
                          background: "#ff000025",
                          color:"#ff0000f5",
                          border:"#ff000025",
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
                {editingItem ? "تعديل بيانات المطار" : "إضافة مطار جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", width: "32px", height: "32px", borderRadius: "50%", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bx bx-x" style={{ fontSize: "1.5rem" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "60vh", overflowY: "auto", padding: "10px 5px" }}>

                {/* Group 1: الأساسيات والتصنيف */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "0.98rem", color: "#818cf8", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bx bx-id-card" style={{ fontSize: "1.2rem" }} />
                    <span>البيانات الأساسية والتصنيف</span>
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الاسم العربي للمطار *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={e => setFormData({ ...formData, name: e.target.value, name_ar: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الاسم الإنجليزي للمطار *</label>
                      <input
                        type="text"
                        required
                        value={formData.name_en || ""}
                        onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>كود IATA (3 حروف) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: CAI"
                        value={formData.code || ""}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase(), iata_code: e.target.value.toUpperCase() })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>كود ICAO (4 حروف)</label>
                      <input
                        type="text"
                        placeholder="مثال: HECA"
                        value={formData.icao_code || ""}
                        onChange={e => setFormData({ ...formData, icao_code: e.target.value.toUpperCase() })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>نوع المطار (عربي) *</label>
                      <input
                        type="text"
                        required
                        placeholder="دولي / محلي / BOT"
                        value={formData.type || ""}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>نوع المطار (إنجليزي) *</label>
                      <input
                        type="text"
                        required
                        placeholder="international / local / bot"
                        value={formData.type_en || ""}
                        onChange={e => setFormData({ ...formData, type_en: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>حالة المطار</label>
                      <select
                        value={formData.status || "active"}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%", padding: "10px" }}
                      >
                        <option value="active">نشط / يعمل</option>
                        <option value="inactive">غير نشط / صيانة</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Group 2: الموقع والجغرافيا */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "0.98rem", color: "#3b82f6", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bx bx-map-pin" style={{ fontSize: "1.2rem" }} />
                    <span>الموقع والتفاصيل الجغرافية</span>
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المحافظة (عربي) *</label>
                      <input
                        type="text"
                        required
                        value={formData.governorate_ar || ""}
                        onChange={e => setFormData({ ...formData, governorate_ar: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المحافظة (إنجليزي) *</label>
                      <input
                        type="text"
                        required
                        value={formData.governorate_en || ""}
                        onChange={e => setFormData({ ...formData, governorate_en: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المدينة (عربي) *</label>
                      <input
                        type="text"
                        required
                        value={formData.city || formData.city_ar || ""}
                        onChange={e => setFormData({ ...formData, city: e.target.value, city_ar: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المدينة (إنجليزي) *</label>
                      <input
                        type="text"
                        required
                        value={formData.city_en || ""}
                        onChange={e => setFormData({ ...formData, city_en: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>المنطقة الجغرافية *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: مصر الجديدة / النزهة"
                        value={formData.area_ar || ""}
                        onChange={e => setFormData({ ...formData, area_ar: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>العنوان التفصيلي للمطار *</label>
                      <input
                        type="text"
                        required
                        placeholder="الشارع أو الطريق المؤدي للمطار"
                        value={formData.address || ""}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>خط العرض (Latitude) *</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        placeholder="مثال: 30.111534"
                        value={formData.latitude || ""}
                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>خط الطول (Longitude) *</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        placeholder="مثال: 31.396694"
                        value={formData.longitude || ""}
                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Group 3: الأوصاف والملخص */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "0.98rem", color: "#10b981", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bx bx-detail" style={{ fontSize: "1.2rem" }} />
                    <span>الوصف والبيانات اللوجستية</span>
                  </h3>
                  <div style={{ marginBottom: "12px" }}>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الوصف القصير *</label>
                    <input
                      type="text"
                      required
                      placeholder="ملخص يظهر ببطاقة المطار مباشرة..."
                      value={formData.short_description || ""}
                      onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الوصف التفصيلي الكامل *</label>
                    <textarea
                      required
                      placeholder="تفاصيل تاريخية، سعة ركاب، أو دور المطار استراتيجياً..."
                      value={formData.description || ""}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", height: "80px", resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* Group 4: البنية التحتية */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "0.98rem", color: "#f59e0b", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bx bx-building" style={{ fontSize: "1.2rem" }} />
                    <span>البنية التحتية والمواصفات</span>
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px", color: "#ffffffff" }}>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px",color: "#ffffffff" }}>عدد مباني الركاب (العدد الكلي) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: 3 مباني ركاب + الصالة الموسمية"
                        value={formData.terminals_count || ""}
                        onChange={e => setFormData({ ...formData, terminals_count: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>الطاقة الاستيعابية السنوية *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: 30 مليون مسافر سنوياً"
                        value={formData.capacity || ""}
                        onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>عدد مدارج الهبوط والإقلاع *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: 4 مدارج طيران"
                        value={formData.runways_count || ""}
                        onChange={e => setFormData({ ...formData, runways_count: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>طول المدارج *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: 4,000 متر"
                        value={formData.runways_length || ""}
                        onChange={e => setFormData({ ...formData, runways_length: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>تفاصيل مباني الركاب والصالات</label>
                    <textarea
                      placeholder="تفصيل بأسماء صالة 1 وصالة 2 والصالة الموسمية..."
                      value={formData.terminals || ""}
                      onChange={e => setFormData({ ...formData, terminals: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", height: "60px", resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* Group 5: الربط وحركة الطيران */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "0.98rem", color: "#ec4899", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bx bx-transfer-alt" style={{ fontSize: "1.2rem" }} />
                    <span>الربط والخطوط والوجهات</span>
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>حركة الرحلات الداخلية *</label>
                      <input
                        type="text"
                        required
                        placeholder="المدن المصرية المتاحة..."
                        value={formData.domestic_flights || ""}
                        onChange={e => setFormData({ ...formData, domestic_flights: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>حركة الرحلات الدولية *</label>
                      <input
                        type="text"
                        required
                        placeholder="رحلات مباشرة وموسمية لـ..."
                        value={formData.international_flights || ""}
                        onChange={e => setFormData({ ...formData, international_flights: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>شركات الطيران العاملة بالمطار</label>
                    <textarea
                      placeholder="مصر للطيران، طيران الإمارات، فلاي دبي..."
                      value={formData.airlines || ""}
                      onChange={e => setFormData({ ...formData, airlines: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%", height: "60px", resize: "vertical" }}
                    />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>أبرز الوجهات والخطوط</label>
                    <input
                      type="text"
                      placeholder="جدة، دبي، لندن، باريس..."
                      value={formData.destinations || ""}
                      onChange={e => setFormData({ ...formData, destinations: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>المدن المرتبطة بالمطار (افصل بفاصلة)</label>
                    <input
                      type="text"
                      placeholder="شرم الشيخ, الغردقة, القاهرة..."
                      value={formData.connections || ""}
                      onChange={e => setFormData({ ...formData, connections: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                {/* Group 6: الخدمات والمواصلات والاتصال */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "0.98rem", color: "#8b5cf6", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bx bx-car" style={{ fontSize: "1.2rem" }} />
                    <span>المواصلات والاتصال والخدمات</span>
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>هواتف الاستعلامات الرسمية *</label>
                      <input
                        type="text"
                        required
                        placeholder="رقم الخط الساخن أو الأرضي"
                        value={formData.phone || ""}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>الموقع الإلكتروني الرسمي</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.official_website || ""}
                        onChange={e => setFormData({ ...formData, official_website: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>مواقف السيارات وتفاصيلها *</label>
                      <input
                        type="text"
                        required
                        placeholder="مواقف مفتوحة أو مغطاة وسعتها"
                        value={formData.parking || ""}
                        onChange={e => setFormData({ ...formData, parking: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>رابط موقع جوجل مابز (Map URL) *</label>
                      <input
                        type="url"
                        required
                        value={formData.map_url || ""}
                        onChange={e => setFormData({ ...formData, map_url: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>وسائل النقل والمواصلات المتاحة (افصل بفاصلة) *</label>
                    <input
                      type="text"
                      required
                      placeholder="تاكسي المطار, حافلات النقل العام, ليموزين..."
                      value={formData.transportation || ""}
                      onChange={e => setFormData({ ...formData, transportation: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label className={clsx("help-label","text-white-100")} style={{ display: "block", marginBottom: "6px" }}>أقرب معالم سياحية أو جغرافية (افصل بفاصلة)</label>
                    <input
                      type="text"
                      placeholder="قصر البارون, سيتي ستارز, مصر الجديدة..."
                      value={formData.nearby_landmarks || ""}
                      onChange={e => setFormData({ ...formData, nearby_landmarks: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>الخدمات والتسهيلات المتوفرة (افصل بفاصلة) *</label>
                    <input
                      type="text"
                      required
                      placeholder="سوق حرة, صرافة, VIP Lounge, تأجير سيارات..."
                      value={formData.services || ""}
                      onChange={e => setFormData({ ...formData, services: e.target.value })}
                      className="ios-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>كلمات البحث الدلالية بالعربي (افصل بفاصلة)</label>
                      <input
                        type="text"
                        placeholder="مطار القاهرة, مطار القاهرة الدولي, مطار مصر..."
                        value={formData.keywords_ar || ""}
                        onChange={e => setFormData({ ...formData, keywords_ar: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="help-label" style={{ display: "block", marginBottom: "6px" }}>كلمات البحث الدلالية بالإنجليزي </label>
                      <input
                        type="text"
                        placeholder="Cairo Airport, CAI, HECA..."
                        value={formData.keywords_en || ""}
                        onChange={e => setFormData({ ...formData, keywords_en: e.target.value })}
                        className="ios-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="ios-btn" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                  إلغاء
                </button>
                <button type="submit" className="ios-btn" style={{ background: "linear-gradient(135deg, #30d158 0%, #24b047 100%)", color: "#fff" }}>
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
