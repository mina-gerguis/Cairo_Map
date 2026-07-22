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
    menu_image_url: "", description: "", 
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
          .select("*")
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
      const menuImagesArray = formData.menu_image_url.split(",").map(m => m.trim()).filter(Boolean);
      
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
        setPlaces([data, ...places]);
        setShowAddForm(false);
        // Reset form
        setFormData({
          name: "", category: "restaurant", category_label: "مطعم", 
          governorate: governoratesList[0] || "القاهرة", city: "", short_description: "",
          full_address: "", phones: "", google_maps_url: "", image_url: "", 
          menu_image_url: "", description: "", 
          latitude: "", longitude: ""
        });
      }
    } catch (err: any) {
      setError("فشل إضافة المكان: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
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
            <div><label className="help-label">روابط المنيو (مفصولة بفاصلة)</label><input className="ios-input" type="text" value={formData.menu_image_url} onChange={e => updateForm("menu_image_url", e.target.value)} placeholder="https://link1.jpg, https://link2.jpg..." style={{ direction: "ltr", textAlign: "right" }} /></div>
            
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
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button 
                        onClick={() => handleDeletePlace(place.id)}
                        style={{ background: "rgba(255, 59, 48, 0.1)", color: "#ff3b30", border: "1px solid rgba(255, 59, 48, 0.2)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", transition: "all 0.2s ease" }}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
