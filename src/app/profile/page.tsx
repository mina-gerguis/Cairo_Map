"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

export default function ProfilePage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [selectedFavCategory, setSelectedFavCategory] = useState<string>("الكل");

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    email: "", // Added email to editable fields
    governorate: "",
    city: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const deleteString = `أريد حذف حسابي أنا ${profile?.full_name}`;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    
    fetchProfileData();
  }, [user, authLoading]);

  const fetchProfileData = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile({ ...profileData, email: user.email }); // Combine with auth email
      setFormData({
        fullName: profileData.full_name || "",
        username: profileData.username || "",
        phone: profileData.phone?.replace('+20', '') || "", // Strip +20 for editing
        email: user.email || "",
        governorate: profileData.governorate || "",
        city: profileData.city || "",
      });
    }

    // Fetch favorites
    const { data: favs } = await supabase
      .from('favorite_places')
      .select('place_id')
      .eq('user_id', user.id);

    if (favs && favs.length > 0) {
      const placeIds = favs.map((f: any) => f.place_id);
      const { data: favPlaces } = await supabase
        .from('places')
        .select('*')
        .in('id', placeIds);
      
      if (favPlaces) {
        const mappedFavs = favPlaces.map(dbPlace => ({
          id: dbPlace.id,
          name: dbPlace.name,
          category: dbPlace.category,
          categoryLabel: dbPlace.category_label,
          briefLocation: dbPlace.brief_location,
          fullAddress: dbPlace.full_address,
          phones: dbPlace.phones || [],
          googleMapsUrl: dbPlace.google_maps_url || "",
          images: dbPlace.images || [],
          menuImages: dbPlace.menu_images || [],
          workingHours: dbPlace.working_hours || "",
          rating: dbPlace.rating || 0,
          description: dbPlace.description || "",
          latitude: dbPlace.latitude || undefined,
          longitude: dbPlace.longitude || undefined,
        }));
        setFavorites(mappedFavs);
      }
    } else {
      setFavorites([]);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!supabase || !user || !profile) return;
    setSaving(true);
    setMessage(null);

    // Validate 30 days username change
    const now = new Date();
    const lastChange = profile.last_username_change ? new Date(profile.last_username_change) : null;
    let isUsernameChanged = formData.username !== profile.username;

    if (isUsernameChanged) {
      if (lastChange) {
        const daysSinceChange = (now.getTime() - lastChange.getTime()) / (1000 * 3600 * 24);
        if (daysSinceChange < 30) {
          setMessage({ type: 'error', text: `لا يمكنك تغيير اسم المستخدم إلا مرة واحدة كل 30 يوم. متبقي ${Math.ceil(30 - daysSinceChange)} يوم.` });
          setSaving(false);
          return;
        }
      }

      // Check if username is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', formData.username)
        .neq('id', user.id);
      
      if (existing && existing.length > 0) {
        setMessage({ type: 'error', text: "اسم المستخدم هذا مأخوذ مسبقاً." });
        setSaving(false);
        return;
      }
    }

    // Check phone uniqueness if changed
    const newPhone = `+20${formData.phone}`;
    if (newPhone !== profile.phone) {
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', newPhone)
        .neq('id', user.id);
      if (existingPhone && existingPhone.length > 0) {
        setMessage({ type: 'error', text: "رقم الهاتف هذا مسجل لحساب آخر." });
        setSaving(false);
        return;
      }
    }

    // Update Email in Auth if changed
    let emailChanged = false;
    if (formData.email !== profile.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
      if (emailError) {
        setMessage({ type: 'error', text: "حدث خطأ أثناء طلب تغيير البريد. قد يكون مسجلاً مسبقاً." });
        setSaving(false);
        return;
      }
      emailChanged = true;
    }

    // Update Profile
    const updatePayload: any = {
      full_name: formData.fullName,
      phone: newPhone,
      governorate: formData.governorate,
      city: formData.city,
    };

    if (isUsernameChanged) {
      updatePayload.username = formData.username;
      updatePayload.last_username_change = now.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: "حدث خطأ أثناء حفظ البيانات." });
    } else {
      setMessage({ 
        type: 'success', 
        text: emailChanged 
          ? "تم حفظ البيانات. راجع بريدك الإلكتروني لتأكيد العنوان الجديد." 
          : "تم تحديث البيانات بنجاح!" 
      });
      setEditMode(false);
      fetchProfileData(); // Refresh data
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!supabase || !user) return;
    if (deleteConfirmation !== deleteString) {
      setMessage({ type: 'error', text: "عبارة التأكيد غير متطابقة." });
      return;
    }
    setLoading(true);
    // Call RPC to delete user
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      setMessage({ type: 'error', text: "فشل حذف الحساب. يرجى المحاولة لاحقاً." });
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  if (loading || authLoading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>جاري تحميل الملف الشخصي...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      <div className="ios-sheet" style={{ position: "static", height: "auto", padding: "32px", animation: "fade-in 0.4s ease" }}>
        
        {/* Profile Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--accent-ios)" }} />
          ) : (
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid var(--accent-ios)" }}>
              <span style={{ fontSize: "2rem" }}>👤</span>
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <h1 className="title-ios" style={{ fontSize: "1.8rem", marginBottom: "4px" }}>{profile?.full_name}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>@{profile?.username}</p>
          </div>
          
          {!editMode && (
            <button className="ios-btn" onClick={() => setEditMode(true)} style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
              تعديل البيانات
            </button>
          )}
        </div>

        {message && (
          <div style={{ background: message.type === 'error' ? "rgba(255, 59, 48, 0.15)" : "rgba(52, 199, 89, 0.15)", border: `1px solid ${message.type === 'error' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(52, 199, 89, 0.3)'}`, padding: "12px", borderRadius: "var(--radius-sm)", color: message.type === 'error' ? "#ff3b30" : "#34c759", marginBottom: "20px", fontSize: "0.85rem", textAlign: "center" }}>
            {message.text}
          </div>
        )}

        {/* User Info Form */}
        {editMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="help-label">الاسم بالكامل</label>
              <input type="text" className="ios-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="help-label">اسم المستخدم (مرة كل 30 يوم)</label>
              <input type="text" className="ios-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} style={{ textAlign: "left", direction: "ltr" }} />
            </div>
            <div>
              <label className="help-label">البريد الإلكتروني (يتطلب تأكيد)</label>
              <input type="email" className="ios-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ textAlign: "left", direction: "ltr" }} />
            </div>
            <div>
              <label className="help-label">رقم الهاتف (بدون صفر البداية)</label>
              <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <div style={{ position: "absolute", left: "12px", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", zIndex: 1, direction: "ltr" }}>
                  <span>🇪🇬</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>+20</span>
                  <span style={{ height: "20px", width: "1px", background: "var(--border-glass-bright)", margin: "0 4px" }} />
                </div>
                <input type="tel" className="ios-input" value={formData.phone} onChange={e => {
                  const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                  if (numbersOnly.length <= 10) setFormData({...formData, phone: numbersOnly});
                }} style={{ textAlign: "left", direction: "ltr", paddingLeft: "85px" }} />
              </div>
            </div>
            <div>
              <label className="help-label">المحافظة</label>
              <select className="ios-input help-select" value={formData.governorate} onChange={(e) => setFormData({...formData, governorate: e.target.value, city: ""})}>
                {governoratesList.map(gov => <option key={gov} value={gov}>{gov}</option>)}
              </select>
            </div>
            {formData.governorate && (
              <div>
                <label className="help-label">المدينة</label>
                <select className="ios-input help-select" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                  <option value="" disabled>اختر المدينة...</option>
                  {egyptLocations[formData.governorate]?.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button className="ios-btn" onClick={() => setEditMode(false)} style={{ flex: 1 }}>إلغاء</button>
              <button className="ios-btn ios-btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--border-glass-bright)", padding: "20px", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>البريد الإلكتروني</span>
              <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile?.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>رقم الهاتف</span>
              <span style={{ fontWeight: "500", fontSize: "0.95rem" }} dir="ltr">{profile?.phone}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>الجنس</span>
              <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile?.gender}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>المنطقة</span>
              <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile?.city}، {profile?.governorate}</span>
            </div>
            
            <button className="ios-btn" onClick={() => setShowDeleteModal(true)} style={{ marginTop: "20px", background: "rgba(255, 59, 48, 0.1)", color: "#ff3b30", border: "1px solid rgba(255, 59, 48, 0.3)" }}>
              حذف الحساب نهائياً
            </button>
          </div>
        )}
      </div>

      {/* Favorite Places Section */}
      <div style={{ marginTop: "40px" }}>
        <h2 className="title-ios" style={{ fontSize: "1.5rem", marginBottom: "20px" }}>الأماكن المفضلة 🤍</h2>
        {favorites.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px", background: "var(--bg-glass)", borderRadius: "var(--radius-md)" }}>
            لم تقم بإضافة أي أماكن للمفضلة بعد.
          </div>
        ) : (
          <div>
            {/* Tabs Row */}
            <div 
              style={{ 
                display: "flex", 
                gap: "10px", 
                overflowX: "auto", 
                paddingBottom: "16px", 
                marginBottom: "20px", 
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
              className="hide-scrollbar"
            >
              <button
                onClick={() => setSelectedFavCategory("الكل")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: selectedFavCategory === "الكل" ? "var(--accent-ios)" : "var(--border-glass-bright)",
                  color: selectedFavCategory === "الكل" ? "#fff" : "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0
                }}
              >
                الكل
                <span style={{ background: selectedFavCategory === "الكل" ? "rgba(255,255,255,0.25)" : "var(--bg-glass)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: selectedFavCategory === "الكل" ? "#fff" : "var(--text-secondary)" }}>
                  {favorites.length}
                </span>
              </button>
              
              {Array.from(new Set(favorites.map(f => f.categoryLabel || f.category))).map(catLabel => {
                const count = favorites.filter(f => (f.categoryLabel || f.category) === catLabel).length;
                return (
                  <button
                    key={catLabel}
                    onClick={() => setSelectedFavCategory(catLabel)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "none",
                      background: selectedFavCategory === catLabel ? "var(--accent-ios)" : "var(--border-glass-bright)",
                      color: selectedFavCategory === catLabel ? "#fff" : "var(--text-primary)",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0
                    }}
                  >
                    {catLabel}
                    <span style={{ background: selectedFavCategory === catLabel ? "rgba(255,255,255,0.25)" : "var(--bg-glass)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: selectedFavCategory === catLabel ? "#fff" : "var(--text-secondary)" }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filtered Places Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {favorites
                .filter(p => selectedFavCategory === "الكل" || (p.categoryLabel || p.category) === selectedFavCategory)
                .map((place) => (
                  <div 
                    key={place.id} 
                    className="glass-card place-card-scroll" 
                    style={{ position: "relative", cursor: "pointer", width: "100%" }} 
                    onClick={() => router.push(`/places/${place.id}`)}
                  >
                    <div style={{ width: "100%", height: "160px", position: "relative", overflow: "hidden" }}>
                      <img src={place.images?.[0] || "/placeholder.jpg"} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!supabase || !user) return;
                          supabase.from('favorite_places').delete().match({ user_id: user.id, place_id: place.id.toString() }).then(() => {
                            setFavorites(prev => prev.filter(p => p.id !== place.id));
                          });
                        }}
                        style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.1rem" }}
                      >
                        ❤️
                      </button>
                    </div>
                    <div style={{ padding: "12px" }}>
                      <h4 style={{ fontSize: "1.1rem", marginBottom: "4px", color: "var(--text-primary)", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.name}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <span>📍</span> {place.briefLocation}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="ios-sheet" style={{ maxWidth: "400px", width: "100%", padding: "24px", animation: "fade-in 0.3s ease" }}>
            <h3 style={{ fontSize: "1.3rem", color: "#ff3b30", marginBottom: "16px", textAlign: "center" }}>⚠️ تحذير: حذف الحساب</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "12px", lineHeight: "1.6" }}>
              أنت على وشك حذف حسابك نهائياً. سيؤدي ذلك إلى فقدان كافة بياناتك، صورك، وأماكنك المفضلة ولا يمكن التراجع عن هذه الخطوة.
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              يرجى كتابة العبارة التالية بدقة للتأكيد:<br/>
              <strong style={{ userSelect: "none", color: "var(--text-primary)", display: "block", marginTop: "8px", padding: "8px", background: "var(--border-glass-bright)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>{deleteString}</strong>
            </p>
            
            <input 
              type="text" 
              className="ios-input" 
              placeholder="اكتب العبارة هنا..." 
              value={deleteConfirmation} 
              onChange={e => setDeleteConfirmation(e.target.value)} 
              style={{ marginBottom: "20px", textAlign: "center" }}
            />
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="ios-btn" onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }} style={{ flex: 1 }}>إلغاء</button>
              <button className="ios-btn" onClick={handleDeleteAccount} disabled={deleteConfirmation !== deleteString || loading} style={{ flex: 1, background: "#ff3b30", color: "#fff", opacity: deleteConfirmation !== deleteString ? 0.5 : 1 }}>
                {loading ? "جاري الحذف..." : "حذف نهائي"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
