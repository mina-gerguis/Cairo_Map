"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FamousCity, CityLandmark, INITIAL_FAMOUS_CITIES, getStoredCities, saveStoredCities } from "@/data/cities";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCity,
  FaMapMarkerAlt,
  FaUsers,
  FaRulerCombined,
  FaThermometerHalf,
  FaStar,
  FaCheck,
  FaTimes,
  FaImages,
  FaSubway,
  FaList,
} from "react-icons/fa";

const isUUID = (str: string): boolean => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

function detectTransportation(stationName: string): { typeName: string; cleanName: string } {
  const rawName = stationName.trim();
  const lowerName = rawName.toLowerCase();

  let typeName = "مترو";

  if (lowerName.includes("مترو")) {
    typeName = "مترو";
  } else if (lowerName.includes("مونوريل")) {
    typeName = "مونوريل";
  } else if (lowerName.includes("lrt") || lowerName.includes("القطار الكهربائي") || lowerName.includes("كهربائي")) {
    typeName = "قطار كهربائي LRT";
  } else if (lowerName.includes("ترام")) {
    typeName = "ترام";
  } else if (lowerName.includes("أتوبيس") || lowerName.includes("اتوبيس") || lowerName.includes("حافلة") || lowerName.includes("سوبر جيت") || lowerName.includes("جوباص") || lowerName.includes("موقف")) {
    typeName = "أتوبيس";
  } else if (lowerName.includes("ميكروباص")) {
    typeName = "ميكروباص";
  } else if (lowerName.includes("قطار") || lowerName.includes("سكة حديد") || lowerName.includes("القطار")) {
    typeName = "قطار";
  } else {
    typeName = "أخرى";
  }

  // Clean up common prefixes to make the title clean
  let cleanName = rawName;
  const prefixesToRemove = [
    "محطة مترو أنفاق",
    "محطة مترو الانفاق",
    "محطة مترو الأنفاق",
    "محطة القطار الكهربائي LRT",
    "محطة القطار الكهربائي",
    "محطة قطار كهربائي",
    "محطة قطار",
    "محطة مونوريل",
    "محطة ترام",
    "محطة ميكروباص",
    "محطة أتوبيس",
    "محطة اتوبيس",
    "محطة",
    "موقف أتوبيس",
    "موقف اتوبيس",
    "موقف ميكروباص",
    "موقف",
    "مترو أنفاق",
    "مترو الانفاق",
    "مترو الأنفاق",
    "قطار كهربائي LRT",
    "قطار كهربائي",
    "lrt",
    "مونوريل",
    "ميكروباص",
    "أتوبيس",
    "اتوبيس",
    "ترام",
    "قطار",
    "مترو"
  ];

  for (const prefix of prefixesToRemove) {
    if (cleanName.startsWith(prefix)) {
      cleanName = cleanName.substring(prefix.length).trim();
      break;
    }
  }

  return { typeName, cleanName };
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<FamousCity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [editingCity, setEditingCity] = useState<FamousCity | null>(null);

  const [selectedCityForLandmarks, setSelectedCityForLandmarks] = useState<FamousCity | null>(null);
  const [isLandmarkModalOpen, setIsLandmarkModalOpen] = useState<boolean>(false);
  const [editingLandmark, setEditingLandmark] = useState<CityLandmark | null>(null);

  // Form states for City
  const [cityName, setCityName] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [cityCoverImage, setCityCoverImage] = useState("");
  const [cityPopulation, setCityPopulation] = useState("");
  const [cityArea, setCityArea] = useState("");
  const [cityDensity, setCityDensity] = useState("");
  const [cityTemperature, setCityTemperature] = useState("");
  const [cityOverview, setCityOverview] = useState("");

  // Form states for Landmark
  const [landmarkName, setLandmarkName] = useState("");
  const [landmarkCoverImage, setLandmarkCoverImage] = useState("");
  const [landmarkDescription, setLandmarkDescription] = useState("");
  const [landmarkType, setLandmarkType] = useState("معلم سياحي");
  const [landmarkIsPopular, setLandmarkIsPopular] = useState(false);
  const [landmarkNearbyStations, setLandmarkNearbyStations] = useState("");
  const [landmarkStationRows, setLandmarkStationRows] = useState<{ type: string; name: string; distance: string }[]>([
    { type: "مترو", name: "", distance: "" }
  ]);
  const [landmarkImages, setLandmarkImages] = useState("");
  const [landmarkActivities, setLandmarkActivities] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Cities from LocalStorage + Supabase
  const fetchCities = async () => {
    setLoading(true);

    // 1. Initial load from local storage or fallback
    const local = getStoredCities();
    setCities(local);

    // 2. Try fetching from Supabase if available
    try {
      if (supabase) {
        const { data: dbCities, error: citiesErr } = await supabase
          .from("famous_cities")
          .select("*")
          .order("order_index", { ascending: true });

        const { data: dbLandmarks } = await supabase
          .from("city_landmarks")
          .select("*");

        if (!citiesErr && dbCities && dbCities.length > 0) {
          // تجميع المعالم السياحية حسب معرّف المدينة
          const landmarksByCity: Record<string, any[]> = {};
          if (dbLandmarks) {
            dbLandmarks.forEach((lm: any) => {
              const cid = lm.city_id;
              if (!landmarksByCity[cid]) {
                landmarksByCity[cid] = [];
              }
              landmarksByCity[cid].push(lm);
            });
          }

          const mapped: FamousCity[] = dbCities.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            cover_image: c.cover_image,
            population: c.population || "",
            area: c.area || "",
            density: c.density || "",
            temperature: c.temperature || "",
            overview: c.overview || "",
            order_index: c.order_index || 0,
            landmarks: Array.isArray(landmarksByCity[c.id])
              ? landmarksByCity[c.id].map((l: any) => ({
                id: l.id,
                city_id: l.city_id,
                name: l.name,
                cover_image: l.cover_image,
                description: l.description || "",
                type: l.type || "معلم سياحي",
                is_popular: !!l.is_popular,
                nearby_stations: Array.isArray(l.nearby_stations) ? l.nearby_stations : [],
                images: Array.isArray(l.images) ? l.images : [l.cover_image],
                activities: Array.isArray(l.activities) ? l.activities : [],
              }))
              : [],
          }));
          setCities(mapped);
          saveStoredCities(mapped);
        }
      }
    } catch (err) {
      console.warn("Supabase fetch failed or table doesn't exist yet, using local storage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // ── Open City Modal ──
  const openCityModal = (cityToEdit?: FamousCity) => {
    if (cityToEdit) {
      setEditingCity(cityToEdit);
      setCityName(cityToEdit.name);
      setCitySlug(cityToEdit.slug);
      setCityCoverImage(cityToEdit.cover_image);
      setCityPopulation(cityToEdit.population);
      setCityArea(cityToEdit.area);
      setCityDensity(cityToEdit.density);
      setCityTemperature(cityToEdit.temperature);
      setCityOverview(cityToEdit.overview);
    } else {
      setEditingCity(null);
      setCityName("");
      setCitySlug("");
      setCityCoverImage("https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80");
      setCityPopulation("");
      setCityArea("");
      setCityDensity("");
      setCityTemperature("28° م");
      setCityOverview("");
    }
    setIsCityModalOpen(true);
  };

  // ── Save City ──
  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return alert("يرجى إدخال اسم المدينة");

    const payload = {
      name: cityName.trim(),
      slug: citySlug.trim() || cityName.trim().toLowerCase().replace(/\s+/g, "-"),
      cover_image: cityCoverImage.trim() || "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80",
      population: cityPopulation.trim(),
      area: cityArea.trim(),
      density: cityDensity.trim(),
      temperature: cityTemperature.trim(),
      overview: cityOverview.trim(),
    };

    let updatedCities: FamousCity[] = [];

    if (editingCity) {
      updatedCities = cities.map((c) =>
        c.id === editingCity.id ? { ...c, ...payload } : c
      );
    } else {
      const newCityObj: FamousCity = {
        id: "city-" + Date.now(),
        ...payload,
        landmarks: [],
      };
      updatedCities = [newCityObj, ...cities];
    }

    // Save locally first so UI updates instantly & survives refresh
    setCities(updatedCities);
    saveStoredCities(updatedCities);
    setIsCityModalOpen(false);
    showToast(editingCity ? "تم تحديث بيانات المدينة بنجاح! ✨" : "تمت إضافة المدينة الجديدة بنجاح! 🎉");

    // Persist to Supabase asynchronously
    try {
      if (supabase) {
        if (editingCity && isUUID(editingCity.id)) {
          await supabase.from("famous_cities").update(payload).eq("id", editingCity.id);
        } else {
          const { data: dbData, error } = await supabase.from("famous_cities").insert([payload]).select();
          if (!error && dbData && dbData.length > 0) {
            const dbId = dbData[0].id;
            setCities((prev) => {
              const synced = prev.map((c) => {
                if (c.name === payload.name) {
                  // Update city id and all its landmarks city_id as well
                  const updatedLms = (c.landmarks || []).map((lm) => ({ ...lm, city_id: dbId }));
                  return { ...c, id: dbId, landmarks: updatedLms };
                }
                return c;
              });
              saveStoredCities(synced);
              return synced;
            });
          }
        }
      }
    } catch (err) {
      console.warn("Could not save city to Supabase DB:", err);
    }
  };

  // ── Delete City ──
  const handleDeleteCity = async (cityId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف مدينة "${name}" وكافة معالمها السياحية؟`)) return;

    const updatedCities = cities.filter((c) => c.id !== cityId);
    setCities(updatedCities);
    saveStoredCities(updatedCities);

    if (selectedCityForLandmarks?.id === cityId) {
      setSelectedCityForLandmarks(null);
    }

    showToast(`تم حذف مدينة ${name} بنجاح.`);

    try {
      if (supabase) {
        await supabase.from("famous_cities").delete().eq("id", cityId);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // ── Open Landmark Modal ──
  const openLandmarkModal = (landmarkToEdit?: CityLandmark) => {
    if (landmarkToEdit) {
      setEditingLandmark(landmarkToEdit);
      setLandmarkName(landmarkToEdit.name);
      setLandmarkCoverImage(landmarkToEdit.cover_image);
      setLandmarkDescription(landmarkToEdit.description);
      setLandmarkType(landmarkToEdit.type);
      setLandmarkIsPopular(landmarkToEdit.is_popular);

      if (landmarkToEdit.nearby_stations && landmarkToEdit.nearby_stations.length > 0) {
        const rows = landmarkToEdit.nearby_stations.map((st) => {
          let name = "";
          let distance = "";
          if (typeof st === "object" && st !== null) {
            name = (st as any).name || "";
            distance = (st as any).distance || "";
          } else if (typeof st === "string") {
            if (st.includes("|")) {
              const parts = st.split("|");
              name = parts[0].trim();
              distance = parts[1].trim();
            } else {
              name = st.trim();
            }
          }
          const detected = detectTransportation(name);
          return {
            type: detected.typeName,
            name: detected.cleanName,
            distance: distance
          };
        });
        setLandmarkStationRows(rows);
        setLandmarkNearbyStations(
          rows.map((r) => {
            const fullName = r.type === "أخرى" ? r.name : `${r.type} ${r.name}`;
            return r.distance ? `${fullName} | ${r.distance}` : fullName;
          }).join("\n")
        );
      } else {
        setLandmarkStationRows([{ type: "مترو", name: "", distance: "" }]);
        setLandmarkNearbyStations("");
      }

      setLandmarkImages(landmarkToEdit.images ? landmarkToEdit.images.join("\n") : "");
      setLandmarkActivities(landmarkToEdit.activities ? landmarkToEdit.activities.join("\n") : "");
    } else {
      setEditingLandmark(null);
      setLandmarkName("");
      setLandmarkCoverImage("https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80");
      setLandmarkDescription("");
      setLandmarkType("معلم سياحي");
      setLandmarkIsPopular(false);
      setLandmarkStationRows([{ type: "مترو", name: "", distance: "" }]);
      setLandmarkNearbyStations("");
      setLandmarkImages("");
      setLandmarkActivities("");
    }
    setIsLandmarkModalOpen(true);
  };

  // ── Save Landmark ──
  const handleSaveLandmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityForLandmarks) return;
    if (!landmarkName.trim()) return alert("يرجى إدخال اسم المعلم السياحي");

    // Gather stations from structured rows first, fallback to text area lines
    let stationsArr: string[] = [];
    const validRows = landmarkStationRows.filter((r) => r.name.trim().length > 0);

    if (validRows.length > 0) {
      stationsArr = validRows.map((r) => {
        const typePrefix = r.type === "أخرى" ? "" : `${r.type.trim()} `;
        const fullName = `${typePrefix}${r.name.trim()}`;
        return r.distance.trim() ? `${fullName} | ${r.distance.trim()}` : fullName;
      });
    } else if (landmarkNearbyStations.trim()) {
      stationsArr = landmarkNearbyStations
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const imagesArr = landmarkImages.split("\n").map((s) => s.trim()).filter(Boolean);
    const activitiesArr = landmarkActivities.split("\n").map((s) => s.trim()).filter(Boolean);

    let targetCityId = selectedCityForLandmarks.id;

    // Check if the city has a valid UUID in the DB. If not, insert it first.
    if (supabase && !isUUID(targetCityId)) {
      const cityPayload = {
        name: selectedCityForLandmarks.name,
        slug: selectedCityForLandmarks.slug,
        cover_image: selectedCityForLandmarks.cover_image,
        population: selectedCityForLandmarks.population || "",
        area: selectedCityForLandmarks.area || "",
        density: selectedCityForLandmarks.density || "",
        temperature: selectedCityForLandmarks.temperature || "",
        overview: selectedCityForLandmarks.overview || "",
      };
      const { data: dbCityData, error: cityErr } = await supabase.from("famous_cities").insert([cityPayload]).select();
      if (!cityErr && dbCityData && dbCityData.length > 0) {
        targetCityId = dbCityData[0].id;
        // Sync local storage with new city UUID
        setCities((prev) => {
          const synced = prev.map((c) => (c.name === cityPayload.name ? { ...c, id: targetCityId } : c));
          saveStoredCities(synced);
          return synced;
        });
      } else {
        console.error("Failed inserting city during landmark save:", cityErr);
      }
    }

    const payload = {
      city_id: targetCityId,
      name: landmarkName.trim(),
      cover_image: landmarkCoverImage.trim() || "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80",
      description: landmarkDescription.trim(),
      type: landmarkType.trim(),
      is_popular: landmarkIsPopular,
      nearby_stations: stationsArr,
      images: imagesArr.length > 0 ? imagesArr : [landmarkCoverImage.trim()],
      activities: activitiesArr,
    };

    let updatedCityObj: FamousCity | null = null;

    const updatedCities = cities.map((city) => {
      // Find matches using name if city id was updated
      if (city.name !== selectedCityForLandmarks.name) return city;

      const currentLandmarks = city.landmarks || [];
      let updatedLandmarks: CityLandmark[] = [];

      if (editingLandmark) {
        updatedLandmarks = currentLandmarks.map((l) =>
          l.id === editingLandmark.id ? { ...l, ...payload } : l
        );
      } else {
        const newLmObj: CityLandmark = {
          id: "lm-" + Date.now(),
          ...payload,
        };
        updatedLandmarks = [newLmObj, ...currentLandmarks];
      }

      updatedCityObj = { ...city, id: targetCityId, landmarks: updatedLandmarks };
      return updatedCityObj;
    });

    setCities(updatedCities);
    saveStoredCities(updatedCities);
    if (updatedCityObj) setSelectedCityForLandmarks(updatedCityObj);
    setIsLandmarkModalOpen(false);
    showToast(editingLandmark ? "تم تحديث المعلم السياحي بنجاح!" : "تمت إضافة المعلم السياحي بنجاح! 🏛️");

    // Supabase update/insert
    try {
      if (supabase) {
        if (editingLandmark && isUUID(editingLandmark.id)) {
          await supabase.from("city_landmarks").update(payload).eq("id", editingLandmark.id);
        } else {
          const { data: dbData, error } = await supabase.from("city_landmarks").insert([payload]).select();
          if (!error && dbData && dbData.length > 0) {
            const dbId = dbData[0].id;
            setCities((prev) => {
              const synced = prev.map((city) => {
                if (city.id !== targetCityId) return city;
                const updatedLms = (city.landmarks || []).map((l) =>
                  l.name === payload.name ? { ...l, id: dbId, city_id: targetCityId } : l
                );
                return { ...city, landmarks: updatedLms };
              });
              saveStoredCities(synced);
              return synced;
            });
          }
        }
      }
    } catch (err) {
      console.warn("Error saving landmark to Supabase DB:", err);
    }
  };

  // ── Delete Landmark ──
  const handleDeleteLandmark = async (landmarkId: string, name: string) => {
    if (!selectedCityForLandmarks) return;
    if (!confirm(`هل أنت متأكد من حذف المعلم "${name}"؟`)) return;

    let updatedCityObj: FamousCity | null = null;

    const updatedCities = cities.map((city) => {
      if (city.id !== selectedCityForLandmarks.id) return city;
      const updatedLandmarks = (city.landmarks || []).filter((l) => l.id !== landmarkId);
      updatedCityObj = { ...city, landmarks: updatedLandmarks };
      return updatedCityObj;
    });

    setCities(updatedCities);
    saveStoredCities(updatedCities);
    if (updatedCityObj) setSelectedCityForLandmarks(updatedCityObj);
    showToast(`تم حذف المعلم ${name} بنجاح.`);

    try {
      if (supabase) {
        await supabase.from("city_landmarks").delete().eq("id", landmarkId);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: "16px 0", color: "var(--textPrimary, #fff)", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#10b981",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "999px",
            fontWeight: "700",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaCheck />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 6px 0", color: "#fff" }}>
            🏙️ إدارة المدن الشهيرة والمعالم السياحية
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted, #94a3b8)", margin: 0 }}>
            إضافة وتعديل المدن المعروضة في الصفحة الرئيسية وإدارة معالمها وأنشطتها ومحطاتها القريبة.
          </p>
        </div>

        <button
          onClick={() => openCityModal()}
          style={{
            backgroundColor: "var(--colorPrimary, #006fee)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "0.95rem",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(0, 111, 238, 0.4)",
          }}
        >
          <FaPlus />
          <span>إضافة مدينة جديدة</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px", maxWidth: "450px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "8px 14px",
          }}
        >
          <FaSearch style={{ color: "var(--text-muted, #94a3b8)", marginLeft: "10px" }} />
          <input
            type="text"
            placeholder="ابحث باسم المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "0.95rem",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Cities Grid List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {filteredCities.map((city) => {
          const landmarkCount = city.landmarks?.length || 0;

          return (
            <div
              key={city.id}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                transition: "all 0.2s ease",
              }}
            >
              {/* Cover Image */}
              <div style={{ width: "100%", height: "170px", position: "relative" }}>
                <img
                  src={city.cover_image}
                  alt={city.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "16px",
                    color: "#fff",
                  }}
                >
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "900", margin: 0, textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>
                    {city.name}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{city.slug}</span>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  <button
                    onClick={() => openCityModal(city)}
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                    title="تعديل المدينة"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCity(city.id, city.name)}
                    style={{
                      background: "rgba(239, 68, 68, 0.7)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                    title="حذف المدينة"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* City Body Info */}
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "0.85rem",
                    color: "var(--text-muted, #94a3b8)",
                    marginBottom: "12px",
                  }}
                >
                  <div>👥 السكان: <strong style={{ color: "#fff" }}>{city.population || "-"}</strong></div>
                  <div>📐 المساحة: <strong style={{ color: "#fff" }}>{city.area || "-"}</strong></div>
                  <div>🏙️ الكثافة: <strong style={{ color: "#fff" }}>{city.density || "-"}</strong></div>
                  <div>🌡️ الحرارة: <strong style={{ color: "#f59e0b" }}>{city.temperature || "-"}</strong></div>
                </div>

                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#cbd5e1",
                    margin: "0 0 16px 0",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: "1.5",
                  }}
                >
                  {city.overview || "لا توجد نبذة مدونة."}
                </p>

                {/* Manage Landmarks Button */}
                <button
                  onClick={() => setSelectedCityForLandmarks(city)}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 111, 238, 0.15)",
                    border: "1px solid rgba(0, 111, 238, 0.3)",
                    color: "#3b82f6",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <FaMapMarkerAlt />
                  <span>إدارة المعالم السياحية ({landmarkCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── LANDMARKS MANAGEMENT MODAL ── */}
      {selectedCityForLandmarks && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            zIndex: 950,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setSelectedCityForLandmarks(null)}
        >
          <div
            style={{
              backgroundColor: "var(--card-glass, #121826)",
              border: "1px solid var(--borderGlass-bright, rgba(255, 255, 255, 0.15))",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "24px",
              color: "#fff",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "800", margin: 0 }}>
                  المعالم السياحية في مدينة {selectedCityForLandmarks.name}
                </h2>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)" }}>
                  إضافة وتعديل الأماكن المعروضة في الكروت المستطيلة للمدينة
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => openLandmarkModal()}
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 16px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaPlus />
                  <span>إضافة معلم سياحي</span>
                </button>
                <button
                  onClick={() => setSelectedCityForLandmarks(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Landmarks list inside selected city */}
            {(!selectedCityForLandmarks.landmarks || selectedCityForLandmarks.landmarks.length === 0) ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted, #94a3b8)" }}>
                لا توجد معالم سياحية مسجلة لهذه المدينة بعد. انقر على "إضافة معلم سياحي" لإضافة مكان جديد.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedCityForLandmarks.landmarks.map((lm) => (
                  <div
                    key={lm.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      padding: "12px 16px",
                      gap: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                      <img
                        src={lm.cover_image}
                        alt={lm.name}
                        style={{ width: "64px", height: "64px", borderRadius: "10px", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: "800", margin: 0, color: "#fff" }}>
                            {lm.name}
                          </h4>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              backgroundColor: "rgba(0, 111, 238, 0.2)",
                              color: "#3b82f6",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontWeight: "700",
                            }}
                          >
                            {lm.type}
                          </span>
                          {lm.is_popular && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                backgroundColor: "rgba(245, 158, 11, 0.2)",
                                color: "#f59e0b",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontWeight: "700",
                              }}
                            >
                              ⭐ شائع
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text-muted, #94a3b8)",
                            margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {lm.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => openLandmarkModal(lm)}
                        style={{
                          backgroundColor: "rgba(59, 130, 246, 0.2)",
                          border: "1px solid rgba(59, 130, 246, 0.4)",
                          color: "#60a5fa",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                        }}
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteLandmark(lm.id, lm.name)}
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          color: "#f87171",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                        }}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CITY ADD/EDIT FORM MODAL ── */}
      {isCityModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsCityModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "var(--card-glass, #121826)",
              border: "1px solid var(--borderGlass-bright, rgba(255, 255, 255, 0.15))",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "16px" }}>
              {editingCity ? `تعديل مدينة "${editingCity.name}"` : "إضافة مدينة جديدة"}
            </h2>

            <form onSubmit={handleSaveCity} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  اسم المدينة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الأقصر"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  الـ Slug (رابط مختصر بالإنجليزية)
                </label>
                <input
                  type="text"
                  placeholder="مثال: luxor"
                  value={citySlug}
                  onChange={(e) => setCitySlug(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  رابط صورة الغلاف (Cover Image URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={cityCoverImage}
                  onChange={(e) => setCityCoverImage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                    عدد السكان (السكان)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 1.3 مليون نسمة"
                    value={cityPopulation}
                    onChange={(e) => setCityPopulation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                    المساحة (المساحة)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 416 كم²"
                    value={cityArea}
                    onChange={(e) => setCityArea(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                    الكثافة السكانية (الكثافة)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 3,100 نسمة/كم²"
                    value={cityDensity}
                    onChange={(e) => setCityDensity(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                    درجة الحرارة الحالية
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 32° م"
                    value={cityTemperature}
                    onChange={(e) => setCityTemperature(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  نبذة عن المدينة (الوصف التعريفى)
                </label>
                <textarea
                  rows={4}
                  placeholder="نبذة كاملة عن موقع وحضارة وتاريخ المدينة..."
                  value={cityOverview}
                  onChange={(e) => setCityOverview(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "8px 18px",
                    cursor: "pointer",
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#006fee",
                    border: "none",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "8px 22px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LANDMARK ADD/EDIT FORM MODAL ── */}
      {isLandmarkModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsLandmarkModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "var(--card-glass, #121826)",
              border: "1px solid var(--borderGlass-bright, rgba(255, 255, 255, 0.15))",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "16px" }}>
              {editingLandmark ? `تعديل معلم "${editingLandmark.name}"` : "إضافة معلم سياحي جديد"}
            </h2>

            <form onSubmit={handleSaveLandmark} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  اسم المكان / المعلم السياحي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: معبد الكرنك"
                  value={landmarkName}
                  onChange={(e) => setLandmarkName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                    نوع المكان (مثلاً: معلم سياحي، متحف، حديقة)
                  </label>
                  <input
                    type="text"
                    placeholder="معلم سياحي"
                    value={landmarkType}
                    onChange={(e) => setLandmarkType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95rem" }}>
                    <input
                      type="checkbox"
                      checked={landmarkIsPopular}
                      onChange={(e) => setLandmarkIsPopular(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#f59e0b" }}
                    />
                    <span style={{ color: "#f59e0b", fontWeight: "700" }}>علامة "شائع" (الأكثر رواجاً)</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  رابط صورة الغلاف للمعلم *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={landmarkCoverImage}
                  onChange={(e) => setLandmarkCoverImage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  وصف المكان
                </label>
                <textarea
                  rows={3}
                  placeholder="شرح موجز لموقع وأهمية المعلم السياحي..."
                  value={landmarkDescription}
                  onChange={(e) => setLandmarkDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "8px", fontWeight: "700" }}>
                  🚇 المحطات القريبة والمسافة بينها وبين المكان
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                  {landmarkStationRows.map((row, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr auto", gap: "8px", alignItems: "center" }}>
                      <select
                        value={row.type}
                        onChange={(e) => {
                          const updated = [...landmarkStationRows];
                          updated[idx].type = e.target.value;
                          setLandmarkStationRows(updated);
                          setLandmarkNearbyStations(
                            updated.map((r) => {
                              const fullName = r.type === "أخرى" ? r.name : `${r.type} ${r.name}`;
                              return r.distance ? `${fullName} | ${r.distance}` : fullName;
                            }).join("\n")
                          );
                        }}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "0.88rem",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="مترو" style={{ backgroundColor: "#1f2937", color: "#fff" }}>مترو</option>
                        <option value="أتوبيس" style={{ backgroundColor: "#1f2937", color: "#fff" }}>أتوبيس</option>
                        <option value="قطار كهربائي LRT" style={{ backgroundColor: "#1f2937", color: "#fff" }}>قطار كهربائي LRT</option>
                        <option value="مونوريل" style={{ backgroundColor: "#1f2937", color: "#fff" }}>مونوريل</option>
                        <option value="ميكروباص" style={{ backgroundColor: "#1f2937", color: "#fff" }}>ميكروباص</option>
                        <option value="ترام" style={{ backgroundColor: "#1f2937", color: "#fff" }}>ترام</option>
                        <option value="قطار" style={{ backgroundColor: "#1f2937", color: "#fff" }}>قطار</option>
                        <option value="أخرى" style={{ backgroundColor: "#1f2937", color: "#fff" }}>أخرى</option>
                      </select>
                      <input
                        type="text"
                        placeholder="اسم المحطة (مثال: الأوبرا)"
                        value={row.name}
                        onChange={(e) => {
                          const updated = [...landmarkStationRows];
                          updated[idx].name = e.target.value;
                          setLandmarkStationRows(updated);
                          setLandmarkNearbyStations(
                            updated.map((r) => {
                              const fullName = r.type === "أخرى" ? r.name : `${r.type} ${r.name}`;
                              return r.distance ? `${fullName} | ${r.distance}` : fullName;
                            }).join("\n")
                          );
                        }}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "0.88rem",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="المسافة/الوقت (مثال: 5 دقائق مشي)"
                        value={row.distance}
                        onChange={(e) => {
                          const updated = [...landmarkStationRows];
                          updated[idx].distance = e.target.value;
                          setLandmarkStationRows(updated);
                          setLandmarkNearbyStations(
                            updated.map((r) => {
                              const fullName = r.type === "أخرى" ? r.name : `${r.type} ${r.name}`;
                              return r.distance ? `${fullName} | ${r.distance}` : fullName;
                            }).join("\n")
                          );
                        }}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "0.88rem",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = landmarkStationRows.filter((_, i) => i !== idx);
                          setLandmarkStationRows(updated.length > 0 ? updated : [{ type: "مترو", name: "", distance: "" }]);
                          setLandmarkNearbyStations(
                            updated.map((r) => {
                              const fullName = r.type === "أخرى" ? r.name : `${r.type} ${r.name}`;
                              return r.distance ? `${fullName} | ${r.distance}` : fullName;
                            }).join("\n")
                          );
                        }}
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="حذف المحطة"
                      >
                        <FaTrash style={{ fontSize: "0.85rem" }} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLandmarkStationRows([...landmarkStationRows, { type: "مترو", name: "", distance: "" }]);
                  }}
                  style={{
                    backgroundColor: "rgba(0, 111, 238, 0.15)",
                    color: "#3b82f6",
                    border: "1px solid rgba(0, 111, 238, 0.3)",
                    borderRadius: "10px",
                    padding: "6px 14px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  <FaPlus />
                  <span>إضافة محطة قريبة جديدة</span>
                </button>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  الأنشطة وماذا تفعل هناك ("واقدر اعمل اي في المكان ده" - اكتب كل نشاط في سطر)
                </label>
                <textarea
                  rows={3}
                  placeholder="مشاهدة طريق الكباش الأثري&#10;التقاط أروع الصور الفوتوغرافية"
                  value={landmarkActivities}
                  onChange={(e) => setLandmarkActivities(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)", display: "block", marginBottom: "4px" }}>
                  ألبوم صور المكان (روابط إضافية، اكتب كل رابط في سطر)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://...&#10;https://..."
                  value={landmarkImages}
                  onChange={(e) => setLandmarkImages(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsLandmarkModalOpen(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "8px 18px",
                    cursor: "pointer",
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#10b981",
                    border: "none",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "8px 22px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  حفظ المعلم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
