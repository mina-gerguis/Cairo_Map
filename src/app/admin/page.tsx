"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { PlaceCategory, initialPlaces } from "@/data/places";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { ScheduleDay, WorkingHoursData, DAYS_OF_WEEK, generateTimeOptions } from "@/lib/workingHours";

interface AdminProfile {
  is_admin: boolean;
}

interface DBPlace {
  id: string;
  name: string;
  category: string;
  category_label: string;
  governorate?: string;
  city?: string;
  short_description?: string;
  full_address: string;
  phones: string[];
  google_maps_url: string;
  images: string[];
  menu_images: string[];
  working_hours: string;
  rating: number;
  reviews_count?: number;
  description: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  branches?: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<DBPlace[]>([]);
  const [error, setError] = useState("");
  
  // Add Place Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", category: "restaurant", category_label: "مطعم", 
    governorate: governoratesList[0] || "القاهرة", city: "", short_description: "",
    full_address: "", phones: "", google_maps_url: "", image_url: "", 
    menu_images: "", description: "", 
    latitude: "", longitude: ""
  });
  
  const [scheduleType, setScheduleType] = useState<"24/7" | "custom">("24/7");
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      isWorking: true,
      openTime: "09:00",
      openPeriod: "ص",
      closeTime: "11:00",
      closePeriod: "م"
    }))
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Branch Management States
  const [selectedPlaceForBranch, setSelectedPlaceForBranch] = useState<DBPlace | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchFormData, setBranchFormData] = useState({
    name: "", governorate: governoratesList[0] || "القاهرة", city: "",
    full_address: "", phones: "", google_maps_url: "", latitude: "", longitude: "", media: ""
  });
  const [branchScheduleType, setBranchScheduleType] = useState<"24/7" | "custom">("24/7");
  const [branchScheduleData, setBranchScheduleData] = useState<ScheduleDay[]>(
    DAYS_OF_WEEK.map(day => ({
      day, isWorking: true, openTime: "09:00", openPeriod: "ص", closeTime: "11:00", closePeriod: "م"
    }))
  );
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  // Edit Category State
  const [editingCategoryPlace, setEditingCategoryPlace] = useState<DBPlace | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // Unified Edit Place State (name + category)
  const [editingPlace, setEditingPlace] = useState<DBPlace | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPlaceCategory, setEditingPlaceCategory] = useState("");
  const [isUpdatingPlace, setIsUpdatingPlace] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdminAndFetchPlaces = async () => {
      if (!supabase) return;
      
      try {
        // Check if admin
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData?.is_admin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        // Fetch places
        const { data: placesData, error: placesError } = await supabase
          .from("places")
          .select("*, branches(*)")
          .order("created_at", { ascending: false });

        if (placesError) throw placesError;
        if (placesData) setPlaces(placesData);

      } catch (err: any) {
        setError(err.message || "حدث خطأ غير معروف.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchPlaces();
  }, [user, authLoading, router]);

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const phonesArray = formData.phones.split(",").map(p => p.trim()).filter(Boolean);
      const imagesArray = formData.image_url ? [formData.image_url.trim()] : [];
      const menuImagesArray = formData.menu_images.split(",").map(m => m.trim()).filter(Boolean);
      
      const newPlace = {
        name: formData.name,
        category: formData.category,
        category_label: formData.category_label,
        governorate: formData.governorate,
        city: formData.city,
        short_description: formData.short_description,
        full_address: formData.full_address,
        phones: phonesArray,
        google_maps_url: formData.google_maps_url,
        images: imagesArray,
        menu_images: menuImagesArray,
        working_hours: JSON.stringify({
          type: scheduleType,
          schedule: scheduleType === "custom" ? scheduleData : undefined
        }),
        description: formData.description,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
      };

      const { data, error: insertError } = await supabase
        .from("places")
        .insert([newPlace])
        .select()
        .single();

      if (insertError) throw insertError;
      
      if (data) {
        // Create initial main branch
        const { error: branchError } = await supabase
          .from("branches")
          .insert([{
            place_id: data.id,
            name: "الفرع الرئيسي",
            governorate: data.governorate,
            city: data.city,
            full_address: data.full_address,
            phones: data.phones,
            google_maps_url: data.google_maps_url,
            working_hours: data.working_hours,
            latitude: data.latitude,
            longitude: data.longitude,
            is_main: true
          }]);
        
        if (branchError) {
          console.error("Failed to create main branch:", branchError);
        }

        const newBranch = {
            id: branchError ? undefined : "temp-id",
            place_id: data.id,
            name: "الفرع الرئيسي",
            governorate: data.governorate,
            city: data.city,
            full_address: data.full_address,
            phones: data.phones,
            google_maps_url: data.google_maps_url,
            working_hours: data.working_hours,
            latitude: data.latitude,
            longitude: data.longitude,
            is_main: true
        };

        const placeWithBranch = { ...data, branches: [newBranch] };
        setPlaces([placeWithBranch, ...places]);
        setShowAddForm(false);
        // Reset form
        setFormData({
          name: "", category: "restaurant", category_label: "مطعم", 
          governorate: governoratesList[0] || "القاهرة", city: "", short_description: "",
          full_address: "", phones: "", google_maps_url: "", image_url: "", 
          menu_images: "", description: "", 
          latitude: "", longitude: ""
        });
      }
    } catch (err: any) {
      setError("فشل إضافة المكان: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedPlaceForBranch) return;

    setIsSubmittingBranch(true);
    setError("");

    try {
      const phonesArray = branchFormData.phones.split(",").map(p => p.trim()).filter(Boolean);
      const mediaArray = branchFormData.media.split(",").map(m => m.trim()).filter(Boolean);
      
      let savedData, insertOrUpdateError;

      if (editingBranchId) {
        const { data, error } = await supabase
          .from("branches")
          .update({
            name: branchFormData.name,
            governorate: branchFormData.governorate,
            city: branchFormData.city,
            full_address: branchFormData.full_address,
            phones: phonesArray,
            google_maps_url: branchFormData.google_maps_url,
            working_hours: branchScheduleType === "24/7" ? "24/7" : JSON.stringify({ type: "custom", schedule: branchScheduleData }),
            latitude: parseFloat(branchFormData.latitude) || null,
            longitude: parseFloat(branchFormData.longitude) || null,
            media: mediaArray
          })
          .eq("id", editingBranchId)
          .select()
          .single();
        savedData = data;
        insertOrUpdateError = error;
      } else {
        const newBranch = {
          place_id: selectedPlaceForBranch.id,
          name: branchFormData.name,
          governorate: branchFormData.governorate,
          city: branchFormData.city,
          full_address: branchFormData.full_address,
          phones: phonesArray,
          google_maps_url: branchFormData.google_maps_url,
          working_hours: branchScheduleType === "24/7" ? "24/7" : JSON.stringify({ type: "custom", schedule: branchScheduleData }),
          latitude: parseFloat(branchFormData.latitude) || null,
          longitude: parseFloat(branchFormData.longitude) || null,
          media: mediaArray,
          is_main: false
        };

        const { data, error } = await supabase
          .from("branches")
          .insert([newBranch])
          .select()
          .single();
        savedData = data;
        insertOrUpdateError = error;
      }

      if (insertOrUpdateError) throw insertOrUpdateError;

      if (savedData) {
        // Update local state
        const updatedPlaces = places.map(p => {
          if (p.id === selectedPlaceForBranch.id) {
            const branches = p.branches || [];
            if (editingBranchId) {
              return { ...p, branches: branches.map(b => b.id === editingBranchId ? savedData : b) };
            } else {
              return { ...p, branches: [...branches, savedData] };
            }
          }
          return p;
        });
        setPlaces(updatedPlaces);
        
        // Reset form but keep modal open
        setEditingBranchId(null);
        setBranchFormData({
          name: "", governorate: selectedPlaceForBranch.governorate || "القاهرة", city: "",
          full_address: "", phones: "", google_maps_url: "", latitude: "", longitude: "", media: ""
        });
        
        alert(editingBranchId ? "تم تعديل الفرع بنجاح!" : "تم إضافة الفرع بنجاح!");
      }
    } catch (err: any) {
      alert((editingBranchId ? "فشل تعديل الفرع: " : "فشل إضافة الفرع: ") + (err.message || ""));
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  const handleEditBranch = (b: any) => {
    setEditingBranchId(b.id);
    setBranchFormData({
      name: b.name || "",
      governorate: b.governorate || selectedPlaceForBranch?.governorate || "القاهرة",
      city: b.city || "",
      full_address: b.full_address || "",
      phones: (b.phones || []).join(", "),
      google_maps_url: b.google_maps_url || "",
      latitude: b.latitude?.toString() || "",
      longitude: b.longitude?.toString() || "",
      media: (b.media || []).join(", ")
    });

    const hw = b.working_hours;
    if (!hw || hw === "24/7") {
      setBranchScheduleType("24/7");
    } else {
      try {
        const parsed = JSON.parse(hw);
        if (parsed.type === "custom" && parsed.schedule) {
          setBranchScheduleType("custom");
          setBranchScheduleData(parsed.schedule);
        } else {
          setBranchScheduleType("24/7");
        }
      } catch(e) {
        setBranchScheduleType("24/7");
      }
    }
  };

  const handleDeleteBranch = async (branchId: string, placeId: string, isMain: boolean) => {
    if (isMain) {
      alert("لا يمكن حذف الفرع الرئيسي مباشرة. يمكنك حذف المكان بالكامل.");
      return;
    }
    if (!confirm("هل أنت متأكد من حذف هذا الفرع؟")) return;
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase.from("branches").delete().eq("id", branchId);
      if (deleteError) throw deleteError;
      
      const updatedPlaces = places.map(p => {
        if (p.id === placeId) {
          return { ...p, branches: (p.branches || []).filter(b => b.id !== branchId) };
        }
        return p;
      });
      setPlaces(updatedPlaces);
    } catch (err: any) {
      alert("فشل حذف الفرع: " + err.message);
    }
  };

  const extractCoordinates = async (url: string) => {
    if (!url || !url.includes("maps")) return;
    try {
      const res = await fetch(`/api/extract-location?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          updateForm("latitude", data.latitude.toString());
          updateForm("longitude", data.longitude.toString());
        }
      }
    } catch (err) {
      console.error("Failed to extract coordinates", err);
    }
  };

  const extractBranchCoordinates = async (url: string) => {
    if (!url || !url.includes("maps")) return;
    try {
      const res = await fetch(`/api/extract-location?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setBranchFormData(p => ({ ...p, latitude: data.latitude.toString(), longitude: data.longitude.toString() }));
        }
      }
    } catch (err) {
      console.error("Failed to extract branch coordinates", err);
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المكان؟")) return;
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase.from("places").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setPlaces(places.filter(p => p.id !== id));
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryPlace || !supabase) return;
    setIsUpdatingCategory(true);
    const labels: any = { restaurant: "مطعم", cafe: "كافيه", pharmacy: "صيدلية", hospital: "مستشفى", garden: "حديقة", family: "عائلية", entertainment: "ترفيهية" };
    try {
      const { error } = await supabase
        .from("places")
        .update({ category: editingCategory, category_label: labels[editingCategory] || editingCategory })
        .eq("id", editingCategoryPlace.id);
      if (error) throw error;
      setPlaces(places.map(p =>
        p.id === editingCategoryPlace.id
          ? { ...p, category: editingCategory, category_label: labels[editingCategory] || editingCategory }
          : p
      ));
      setEditingCategoryPlace(null);
    } catch (err: any) {
      alert("فشل تحديث التصنيف: " + err.message);
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const handleUpdatePlace = async () => {
    if (!editingPlace || !supabase || !editingName.trim()) return;
    setIsUpdatingPlace(true);
    const labels: any = { restaurant: "مطعم", cafe: "كافيه", pharmacy: "صيدلية", hospital: "مستشفى", garden: "حديقة", family: "عائلية", entertainment: "ترفيهية" };
    try {
      const { error } = await supabase
        .from("places")
        .update({
          name: editingName.trim(),
          category: editingPlaceCategory,
          category_label: labels[editingPlaceCategory] || editingPlaceCategory
        })
        .eq("id", editingPlace.id);
      if (error) throw error;
      setPlaces(places.map(p =>
        p.id === editingPlace.id
          ? { ...p, name: editingName.trim(), category: editingPlaceCategory, category_label: labels[editingPlaceCategory] || editingPlaceCategory }
          : p
      ));
      setEditingPlace(null);
    } catch (err: any) {
      alert("فشل تحديث البيانات: " + err.message);
    } finally {
      setIsUpdatingPlace(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("هل تريد إضافة البيانات التجريبية الأولية؟")) return;
    if (!supabase) return;
    
    setIsSubmitting(true);
    try {
      const formattedInitialPlaces = initialPlaces.map(p => {
        // Parse briefLocation to governorate and city as a fallback for seed data
        const parts = (p.briefLocation || "").split("/").map(s => s.trim());
        const city = parts[0] || "غير محدد";
        const gov = parts[1] || parts[0] || "غير محدد";
        
        return {
          name: p.name,
          category: p.category,
          category_label: p.categoryLabel,
          governorate: gov,
          city: city,
          short_description: p.shortDescription || p.description?.substring(0, 50) || "",
          full_address: p.fullAddress,
          phones: p.phones || [],
          google_maps_url: p.googleMapsUrl || "",
          images: p.images || [],
          menu_images: p.menuImages || [],
          working_hours: JSON.stringify({ type: "24/7" }), // Default legacy seed to 24/7 or custom

          rating: p.rating || 0,
          description: p.description || "",
          latitude: p.latitude || null,
          longitude: p.longitude || null,
        };
      });

      const { data, error: insertError } = await supabase
        .from("places")
        .insert(formattedInitialPlaces)
        .select();
        
      if (insertError) throw insertError;
      if (data) {
        setPlaces([...data, ...places]);
        alert("تم إضافة البيانات بنجاح!");
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء الإضافة: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: "40px", height: "40px" }} /></div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
        <div>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🚫</h1>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#ff3b30", marginBottom: "10px" }}>صلاحيات غير كافية</h2>
          <p style={{ color: "var(--text-secondary)" }}>عذراً، هذه الصفحة مخصصة للمشرفين فقط.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ paddingTop: "120px", paddingBottom: "60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
        <div>
          <h1 className="title-ios">لوحة تحكم المشرفين 🛠️</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>إدارة الأماكن والبيانات في تطبيق دفتري</p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          {places.length === 0 && (
            <button className="ios-btn" onClick={handleSeedData} disabled={isSubmitting} style={{ background: "rgba(255, 159, 10, 0.15)", color: "#ff9f0a", border: "1px solid rgba(255, 159, 10, 0.3)" }}>
              تفعيل بيانات تجريبية
            </button>
          )}
          <button className="ios-btn ios-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "إلغاء الإضافة" : "+ إضافة مكان جديد"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "16px", borderRadius: "16px", color: "#ff3b30", marginBottom: "30px", fontSize: "0.95rem" }}>
          {error}
        </div>
      )}

      {/* Add Place Form */}
      {showAddForm && (
        <div className="ios-sheet" style={{ position: "static", height: "auto", marginBottom: "40px", animation: "slide-in-section 0.4s ease" }}>
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>إضافة مكان جديد</h2>
          <form onSubmit={handleAddPlace} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div><label className="help-label">اسم المكان</label><input required className="ios-input" value={formData.name} onChange={e => updateForm("name", e.target.value)} /></div>
            <div>
              <label className="help-label">التصنيف</label>
              <select required className="ios-input help-select" value={formData.category} onChange={e => {
                updateForm("category", e.target.value);
                const labels: any = { restaurant: "مطعم", cafe: "كافيه", pharmacy: "صيدلية", hospital: "مستشفى", garden: "حديقة", family: "عائلية", entertainment: "ترفيهية" };
                updateForm("category_label", labels[e.target.value] || "");
              }}>
                <option value="restaurant">مطعم</option>
                <option value="cafe">كافيه</option>
                <option value="pharmacy">صيدلية</option>
                <option value="hospital">مستشفى</option>
                <option value="garden">حديقة</option>
                <option value="family">عائلية</option>
                <option value="entertainment">ترفيهية</option>
              </select>
            </div>
            <div>
              <label className="help-label">المحافظة</label>
              <select className="ios-input help-select" value={formData.governorate} onChange={e => {
                updateForm("governorate", e.target.value);
                const firstCity = egyptLocations[e.target.value]?.[0] || "";
                updateForm("city", firstCity);
              }}>
                {governoratesList.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="help-label">المدينة / المنطقة</label>
              <select className="ios-input help-select" value={formData.city} onChange={e => updateForm("city", e.target.value)}>
                {(egyptLocations[formData.governorate] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label className="help-label">العنوان بالتفصيل</label><input required className="ios-input" value={formData.full_address} onChange={e => updateForm("full_address", e.target.value)} /></div>
            
            <div><label className="help-label">أرقام الهاتف (مفصولة بفاصلة)</label><input className="ios-input" value={formData.phones} onChange={e => updateForm("phones", e.target.value)} placeholder="012.., 010.." style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div>
              <label className="help-label">رابط خرائط جوجل (سيتم استخراج الإحداثيات تلقائياً)</label>
              <input 
                className="ios-input" 
                value={formData.google_maps_url} 
                onChange={e => updateForm("google_maps_url", e.target.value)} 
                onBlur={e => extractCoordinates(e.target.value)}
                style={{ direction: "ltr", textAlign: "right" }} 
              />
            </div>
            
            {/* Image URLs */}
            <div><label className="help-label">رابط الصورة الرئيسية (URL)</label><input className="ios-input" type="url" value={formData.image_url} onChange={e => updateForm("image_url", e.target.value)} placeholder="https://..." style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label className="help-label">روابط الميديا (صور، قائمة طعام) - مفصولة بفاصلة</label><textarea className="ios-input" rows={2} value={formData.menu_images} onChange={e => updateForm("menu_images", e.target.value)} placeholder="https://..., https://..." style={{ direction: "ltr", textAlign: "left" }}></textarea></div>
            
            {/* Working Hours UI */}
            <div style={{ gridColumn: "1 / -1", background: "rgba(120, 120, 120, 0.05)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
              <label className="help-label" style={{ fontSize: "1.1rem", marginBottom: "12px", color: "var(--text-primary)" }}>ساعات العمل</label>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button type="button" onClick={() => setScheduleType("24/7")} className={`ios-btn ${scheduleType === "24/7" ? "ios-btn-primary" : ""}`} style={{ flex: 1 }}>مفتوح 24 ساعة</button>
                <button type="button" onClick={() => setScheduleType("custom")} className={`ios-btn ${scheduleType === "custom" ? "ios-btn-primary" : ""}`} style={{ flex: 1, background: scheduleType === "custom" ? "#ff9f0a" : undefined }}>مواعيد متغيرة</button>
              </div>

              {scheduleType === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {scheduleData.map((dayData, index) => (
                    <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                      <div style={{ width: "80px", fontWeight: "bold" }}>{dayData.day}</div>
                      
                      <select 
                        className="ios-input help-select" 
                        style={{ width: "100px", padding: "6px" }}
                        value={dayData.isWorking ? "working" : "off"}
                        onChange={e => {
                          const newData = [...scheduleData];
                          newData[index].isWorking = e.target.value === "working";
                          setScheduleData(newData);
                        }}
                      >
                        <option value="working">شغل</option>
                        <option value="off">إجازة</option>
                      </select>

                      {dayData.isWorking && (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>من</span>
                          <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...scheduleData]; newData[index].openTime = e.target.value; setScheduleData(newData); }}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...scheduleData]; newData[index].openPeriod = e.target.value as "ص"|"م"; setScheduleData(newData); }}>
                            <option value="ص">ص</option><option value="م">م</option>
                          </select>
                          
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 5px" }}>حتي</span>
                          <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...scheduleData]; newData[index].closeTime = e.target.value; setScheduleData(newData); }}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...scheduleData]; newData[index].closePeriod = e.target.value as "ص"|"م"; setScheduleData(newData); }}>
                            <option value="ص">ص</option><option value="م">م</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div><label className="help-label">خط العرض (Latitude)</label><input className="ios-input" type="number" step="any" value={formData.latitude} onChange={e => updateForm("latitude", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>
            <div><label className="help-label">خط الطول (Longitude)</label><input className="ios-input" type="number" step="any" value={formData.longitude} onChange={e => updateForm("longitude", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="help-label">وصف قصير (يظهر تحت اسم المكان)</label>
              <input required className="ios-input" value={formData.short_description} onChange={e => updateForm("short_description", e.target.value)} placeholder="وصف جذاب من سطر واحد..." />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="help-label">وصف المكان التفصيلي</label>
              <textarea className="ios-input" rows={3} value={formData.description} onChange={e => updateForm("description", e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" className="ios-btn" onClick={() => setShowAddForm(false)}>إلغاء</button>
              <button type="submit" className="ios-btn ios-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإضافة..." : "حفظ المكان"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Places List */}
      <div className="ios-sheet" style={{ position: "static", height: "auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>الأماكن المضافة ({places.length})</h2>
        
        {places.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
            لا يوجد أماكن حالياً. قم بإضافة بيانات تجريبية أو أضف مكاناً جديداً.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-glass)", textAlign: "right" }}>
                  <th style={{ padding: "12px", color: "var(--text-muted)", fontWeight: "600" }}>الصورة</th>
                  <th style={{ padding: "12px", color: "var(--text-muted)", fontWeight: "600" }}>الاسم</th>
                  <th style={{ padding: "12px", color: "var(--text-muted)", fontWeight: "600" }}>التصنيف</th>
                  <th style={{ padding: "12px", color: "var(--text-muted)", fontWeight: "600" }}>المنطقة</th>
                  <th style={{ padding: "12px", color: "var(--text-muted)", fontWeight: "600" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {places.map(place => (
                  <tr key={place.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px" }}>
                      {place.images && place.images.length > 0 ? (
                        <img src={place.images[0]} alt={place.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--border-glass)", display: "flex", alignItems: "center", justifyContent: "center" }}>🖼️</div>
                      )}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "600" }}>{place.name}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(108,99,255,0.1)", color: "#a78bfa", fontSize: "0.85rem" }}>
                        {place.category_label}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {place.city} / {place.governorate}
                      <br/>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-ios)", fontWeight: "bold" }}>{place.branches ? place.branches.length : 1} فروع</span>
                    </td>
                    <td style={{ padding: "12px", display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button
                        onClick={() => { setEditingPlace(place); setEditingName(place.name); setEditingPlaceCategory(place.category); }}
                        style={{ background: "rgba(52,199,89,0.1)", color: "#34c759", border: "1px solid rgba(52,199,89,0.2)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}
                      >
                        تعديل ✏️
                      </button>
                      <button 
                        onClick={() => setSelectedPlaceForBranch(place)}
                        style={{ background: "rgba(47, 128, 237, 0.1)", color: "#2f80ed", border: "1px solid rgba(47, 128, 237, 0.2)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", transition: "all 0.2s ease", fontWeight: "bold" }}
                      >
                        إدارة الفروع 🏢
                      </button>
                      <button 
                        onClick={() => handleDeletePlace(place.id)}
                        style={{ background: "rgba(255, 59, 48, 0.1)", color: "#ff3b30", border: "1px solid rgba(255, 59, 48, 0.2)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", transition: "all 0.2s ease" }}
                      >
                        حذف 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unified Edit Place Modal (Name + Category) */}
      {editingPlace && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--card-bg)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "440px", border: "1px solid var(--border-glass)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "6px" }}>تعديل المكان</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px" }}>{editingPlace.name}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label className="help-label">اسم المكان</label>
                <input
                  className="ios-input"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  placeholder="اكتب الاسم الجديد..."
                  autoFocus
                />
              </div>
              <div>
                <label className="help-label">التصنيف</label>
                <select className="ios-input help-select" value={editingPlaceCategory} onChange={e => setEditingPlaceCategory(e.target.value)}>
                  <option value="restaurant">مطعم</option>
                  <option value="cafe">كافيه</option>
                  <option value="pharmacy">صيدلية</option>
                  <option value="hospital">مستشفى</option>
                  <option value="garden">حديقة</option>
                  <option value="family">عائلية</option>
                  <option value="entertainment">ترفيهية</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleUpdatePlace} disabled={isUpdatingPlace || !editingName.trim()} className="ios-btn ios-btn-primary" style={{ flex: 1 }}>
                {isUpdatingPlace ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
              <button onClick={() => setEditingPlace(null)} className="ios-btn" style={{ flex: 1 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Branches Modal */}
      {selectedPlaceForBranch && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button
              onClick={() => setSelectedPlaceForBranch(null)}
              style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(120,120,120,0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>إدارة فروع: {selectedPlaceForBranch.name}</h2>
            
            {/* Existing Branches List */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "14px", color: "var(--text-secondary)" }}>الفروع الحالية ({selectedPlaceForBranch.branches?.length || 0})</h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {(selectedPlaceForBranch.branches || []).map(b => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(120,120,120,0.05)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{b.name} {b.is_main ? <span style={{ color: "var(--accent-success)", fontSize: "0.8rem", marginLeft: "8px" }}>(فرع رئيسي)</span> : ""}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{b.city} / {b.governorate}</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => handleEditBranch(b)}
                        style={{ background: "none", border: "none", color: "var(--accent-ios)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
                        تعديل
                      </button>
                      {!b.is_main && (
                        <button onClick={() => handleDeleteBranch(b.id, selectedPlaceForBranch.id, b.is_main)} style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>حذف</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Branch Form */}
            <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{editingBranchId ? "تعديل الفرع" : "إضافة فرع جديد"}</h3>
                {editingBranchId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingBranchId(null);
                      setBranchFormData({
                        name: "", governorate: selectedPlaceForBranch.governorate || "القاهرة", city: "",
                        full_address: "", phones: "", google_maps_url: "", latitude: "", longitude: "", media: ""
                      });
                      setBranchScheduleType("24/7");
                    }}
                    style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "0.9rem" }}>
                    إلغاء التعديل
                  </button>
                )}
              </div>
              <form onSubmit={handleAddBranch} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div><label className="help-label">اسم الفرع</label><input required className="ios-input" value={branchFormData.name} onChange={e => setBranchFormData(p => ({...p, name: e.target.value}))} placeholder="مثال: فرع مدينة نصر" /></div>
                <div><label className="help-label">المحافظة</label>
                  <select required className="ios-input" value={branchFormData.governorate} onChange={e => setBranchFormData(p => ({...p, governorate: e.target.value, city: ""}))}>
                    {governoratesList.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="help-label">المدينة / المنطقة</label>
                  <select required className="ios-input" value={branchFormData.city} onChange={e => setBranchFormData(p => ({...p, city: e.target.value}))}>
                    <option value="">اختر المدينة</option>
                    {(egyptLocations[branchFormData.governorate as keyof typeof egyptLocations] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="help-label">العنوان التفصيلي</label><input required className="ios-input" value={branchFormData.full_address} onChange={e => setBranchFormData(p => ({...p, full_address: e.target.value}))} /></div>
                <div><label className="help-label">أرقام التليفون (مفصولين بفاصلة)</label><input className="ios-input" value={branchFormData.phones} onChange={e => setBranchFormData(p => ({...p, phones: e.target.value}))} style={{ direction: "ltr", textAlign: "right" }} /></div>
                <div>
                  <label className="help-label">رابط خرائط جوجل</label>
                  <input className="ios-input" value={branchFormData.google_maps_url} 
                    onChange={e => setBranchFormData(p => ({...p, google_maps_url: e.target.value}))} 
                    onBlur={e => extractBranchCoordinates(e.target.value)}
                    style={{ direction: "ltr", textAlign: "right" }} 
                  />
                </div>
                <div><label className="help-label">خط العرض</label><input className="ios-input" type="number" step="any" value={branchFormData.latitude} onChange={e => setBranchFormData(p => ({...p, latitude: e.target.value}))} /></div>
                <div><label className="help-label">خط الطول</label><input className="ios-input" type="number" step="any" value={branchFormData.longitude} onChange={e => setBranchFormData(p => ({...p, longitude: e.target.value}))} /></div>
                
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">الميديا الخاصة بالفرع (روابط مفصولة بفاصلة)</label>
                  <textarea className="ios-input" rows={2} value={branchFormData.media} onChange={e => setBranchFormData(p => ({...p, media: e.target.value}))} placeholder="https://..., https://..." style={{ direction: "ltr", textAlign: "left" }}></textarea>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">ساعات العمل</label>
                  <select className="ios-input" value={branchScheduleType} onChange={e => setBranchScheduleType(e.target.value as any)} style={{ marginBottom: "10px" }}>
                    <option value="24/7">مفتوح طول أيام الأسبوع 24 ساعة</option>
                    <option value="custom">مواعيد مخصصة</option>
                  </select>
                  {branchScheduleType === "custom" && (
                    <div style={{ background: "rgba(120,120,120,0.05)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--border-glass)" }}>
                      {branchScheduleData.map((dayData, index) => (
                        <div key={dayData.day} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: index < branchScheduleData.length - 1 ? "1px solid rgba(120,120,120,0.1)" : "none", flexWrap: "wrap" }}>
                          <div style={{ width: "80px", fontWeight: "bold" }}>{dayData.day}</div>
                          
                          <select 
                            className="ios-input help-select" 
                            style={{ width: "100px", padding: "6px" }}
                            value={dayData.isWorking ? "working" : "off"}
                            onChange={e => {
                              const newData = [...branchScheduleData];
                              newData[index].isWorking = e.target.value === "working";
                              setBranchScheduleData(newData);
                            }}
                          >
                            <option value="working">شغل</option>
                            <option value="off">إجازة</option>
                          </select>

                          {dayData.isWorking && (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>من</span>
                              <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.openTime} onChange={e => { const newData = [...branchScheduleData]; newData[index].openTime = e.target.value; setBranchScheduleData(newData); }}>
                                {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.openPeriod} onChange={e => { const newData = [...branchScheduleData]; newData[index].openPeriod = e.target.value as "ص"|"م"; setBranchScheduleData(newData); }}>
                                <option value="ص">ص</option><option value="م">م</option>
                              </select>
                              
                              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 5px" }}>حتي</span>
                              <select className="ios-input help-select" style={{ width: "90px", padding: "6px" }} value={dayData.closeTime} onChange={e => { const newData = [...branchScheduleData]; newData[index].closeTime = e.target.value; setBranchScheduleData(newData); }}>
                                {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <select className="ios-input help-select" style={{ width: "60px", padding: "6px" }} value={dayData.closePeriod} onChange={e => { const newData = [...branchScheduleData]; newData[index].closePeriod = e.target.value as "ص"|"م"; setBranchScheduleData(newData); }}>
                                <option value="ص">ص</option><option value="م">م</option>
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmittingBranch} className="ios-btn ios-btn-primary" style={{ marginTop: "10px" }}>
                  {isSubmittingBranch ? "جاري الحفظ..." : (editingBranchId ? "حفظ التعديلات" : "إضافة الفرع")}
                </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
