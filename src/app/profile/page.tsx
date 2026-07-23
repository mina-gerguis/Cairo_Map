"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    dob: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const deleteString = `أريد حذف حسابي أنا ${profile?.full_name}`;

  // Folding sections
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

  // Help Section: Tabs
  const [helpTab, setHelpTab] = useState<"faq" | "social" | "contact">("faq");

  // FAQ State
  const [faqs, setFaqs] = useState<any[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    governorate: "",
    city: "",
    contactType: "",
    message: ""
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
      const initial = saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      setTheme(initial);

      const handleThemeChange = (e: any) => {
        setTheme(e.detail);
      };
      window.addEventListener("themechange", handleThemeChange);
      return () => window.removeEventListener("themechange", handleThemeChange);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dftry_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    
    fetchProfileData();
    fetchFAQs();

    // Check for parameter to expand help
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expand") === "help") {
        setIsHelpExpanded(true);
      }
    }
  }, [user, authLoading]);

  const fetchFAQs = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) {
      setFaqs(data);
    }
  };

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !faqQuestion.trim() || !faqAnswer.trim()) return;
    setFaqLoading(true);
    try {
      const { data, error } = await supabase
        .from("faqs")
        .insert([{ question: faqQuestion.trim(), answer: faqAnswer.trim() }])
        .select();
      if (error) throw error;
      if (data) {
        setFaqs([...faqs, data[0]]);
        setFaqQuestion("");
        setFaqAnswer("");
      }
    } catch (err: any) {
      alert("فشل إضافة السؤال الشائع: " + err.message);
    } finally {
      setFaqLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال الشائع؟")) return;
    if (!supabase) return;
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    // Simulate sending email
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
    }, 1500);
  };

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
        dob: profileData.dob || "",
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
      dob: formData.dob || null,
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
      {/* ─── 1. PROFILE RECTANGLE CARD ─── */}
      <div 
        className="glass-panel" 
        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: isProfileExpanded ? "1px solid var(--accent-ios)" : "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-ios)" }} />
            ) : (
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--border-glass-bright)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--accent-ios)" }}>
                <span style={{ fontSize: "1.5rem" }}>👤</span>
              </div>
            )}
            <div style={{ textAlign: "right" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>{profile?.full_name}</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem" }}>{profile?.email}</p>
            </div>
          </div>
          <i className={`bx ${isProfileExpanded ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>

        {/* Expanded Profile Info / Form */}
        {isProfileExpanded && (
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default", borderTop: "1px solid var(--border-glass)", paddingTop: "16px" }}>
            {message && (
              <div style={{ background: message.type === 'error' ? "rgba(255, 59, 48, 0.15)" : "rgba(52, 199, 89, 0.15)", border: `1px solid ${message.type === 'error' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(52, 199, 89, 0.3)'}`, padding: "12px", borderRadius: "var(--radius-sm)", color: message.type === 'error' ? "#ff3b30" : "#34c759", marginBottom: "20px", fontSize: "0.85rem", textAlign: "center" }}>
                {message.text}
              </div>
            )}

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
                  <label className="help-label">تاريخ الميلاد</label>
                  <input type="date" className="ios-input" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} style={{ textAlign: "left", direction: "ltr" }} />
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>اسم المستخدم</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>@{profile?.username}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>رقم الهاتف</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }} dir="ltr">{profile?.phone}</span>
                </div>
                {profile?.dob && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>تاريخ الميلاد</span>
                    <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile.dob}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>الجنس</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile?.gender}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>المنطقة</span>
                  <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{profile?.city}، {profile?.governorate}</span>
                </div>
                
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button className="ios-btn ios-btn-primary" onClick={() => setEditMode(true)} style={{ flex: 1 }}>
                    تعديل البيانات
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 2. APPEARANCE SECTION ─── */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>العرض</div>
      <div 
        className="glass-panel" 
        onClick={toggleTheme}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
            <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
              {theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              {theme === "dark" ? "الموقع حالياً بالوضع الداكن" : "الموقع حالياً بالوضع الفاتح"}
            </p>
          </div>
        </div>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
      </div>

      {/* ─── 3. SUPPORT & HELP SECTION ─── */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>المساعدة</div>
      <div 
        className="glass-panel" 
        onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
          transition: "transform 0.2s, background-color 0.2s",
          border: isHelpExpanded ? "1px solid var(--accent-ios)" : "1px solid var(--border-glass)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
              <i className="bx bx-help-circle" style={{ fontSize: "1.4rem" }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>التواصل والمساعدة</h3>
          </div>
          <i className={`bx ${isHelpExpanded ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>

        {/* Expanded Help Center (Tabs) */}
        {isHelpExpanded && (
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default", borderTop: "1px solid var(--border-glass)", paddingTop: "16px" }}>
            {/* Tabs Selector */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "12px", marginBottom: "20px" }}>
              <button 
                onClick={() => setHelpTab("faq")} 
                style={{ 
                  flex: 1, padding: "8px", border: "none", borderRadius: "10px", 
                  background: helpTab === "faq" ? "var(--accent-ios)" : "transparent",
                  color: helpTab === "faq" ? "#fff" : "var(--text-secondary)",
                  fontWeight: "600", fontSize: "0.88rem", cursor: "pointer"
                }}
              >
                الأسئلة الشائعة
              </button>
              <button 
                onClick={() => setHelpTab("social")} 
                style={{ 
                  flex: 1, padding: "8px", border: "none", borderRadius: "10px", 
                  background: helpTab === "social" ? "var(--accent-ios)" : "transparent",
                  color: helpTab === "social" ? "#fff" : "var(--text-secondary)",
                  fontWeight: "600", fontSize: "0.88rem", cursor: "pointer"
                }}
              >
                مواقع التواصل
              </button>
              <button 
                onClick={() => setHelpTab("contact")} 
                style={{ 
                  flex: 1, padding: "8px", border: "none", borderRadius: "10px", 
                  background: helpTab === "contact" ? "var(--accent-ios)" : "transparent",
                  color: helpTab === "contact" ? "#fff" : "var(--text-secondary)",
                  fontWeight: "600", fontSize: "0.88rem", cursor: "pointer"
                }}
              >
                مراسلتنا
              </button>
            </div>

            {/* TAB CONTENT 1: FAQ */}
            {helpTab === "faq" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {faqs.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "12px" }}>لا توجد أسئلة شائعة حالياً.</p>
                ) : (
                  faqs.map((faq, index) => {
                    const isFaqExpanded = expandedFaq === index;
                    return (
                      <div key={faq.id} style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px" }}>
                        <div 
                          onClick={() => setExpandedFaq(isFaqExpanded ? null : index)}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "4px 0" }}
                        >
                          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>{faq.question}</h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {profile?.is_admin && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteFAQ(faq.id); }}
                                style={{ background: "transparent", border: "none", color: "var(--accent-danger)", cursor: "pointer", fontSize: "0.9rem" }}
                              >
                                🗑️
                              </button>
                            )}
                            <span style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                              {isFaqExpanded ? "−" : "+"}
                            </span>
                          </div>
                        </div>
                        {isFaqExpanded && (
                          <p style={{ margin: "8px 0 0", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>{faq.answer}</p>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Admin Add FAQ Form */}
                {profile?.is_admin && (
                  <form onSubmit={handleAddFAQ} style={{ marginTop: "20px", borderTop: "1px dashed var(--border-glass)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-ios)" }}>💡 إضافة سؤال شائع جديد (المسؤولين فقط)</h4>
                    <input 
                      required className="ios-input" placeholder="السؤال..." 
                      value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} 
                    />
                    <textarea 
                      required className="ios-input" placeholder="الإجابة..." 
                      value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} 
                      style={{ minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
                    />
                    <button type="submit" disabled={faqLoading} className="ios-btn ios-btn-primary" style={{ height: "40px", fontSize: "0.9rem" }}>
                      {faqLoading ? "جاري الإضافة..." : "حفظ السؤال الشائع"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: SOCIAL LINKS */}
            {helpTab === "social" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-whatsapp" style={{ fontSize: "1.3rem", color: "#25d366" }}></i>
                  <span>واتساب</span>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-facebook-circle" style={{ fontSize: "1.3rem", color: "#1877f2" }}></i>
                  <span>فيسبوك</span>
                </a>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-telegram" style={{ fontSize: "1.3rem", color: "#0088cc" }}></i>
                  <span>تلجرام</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none" }}>
                  <i className="bx bxl-instagram" style={{ fontSize: "1.3rem", color: "#e1306c" }}></i>
                  <span>إنستغرام</span>
                </a>
                <a href="https://stagekode.com" target="_blank" rel="noopener noreferrer" className="category-pill" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", border: "1px solid var(--border-glass)", textDecoration: "none", gridColumn: "1 / -1" }}>
                  <i className="bx bx-globe" style={{ fontSize: "1.2rem", color: "var(--accent-ios)" }}></i>
                  <span>الموقع الرسمي (STAGE KODE)</span>
                </a>
              </div>
            )}

            {/* TAB CONTENT 3: CONTACT FORM */}
            {helpTab === "contact" && (
              <div>
                {contactSubmitted ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✅</div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "8px" }}>تم إرسال رسالتك بنجاح!</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 16px" }}>شكراً لتواصلك معنا. سيقوم فريق الدعم الفني بالرد عليك في أقرب وقت.</p>
                    <button className="ios-btn" onClick={() => setContactSubmitted(false)}>إرسال رسالة أخرى</button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <input 
                        required className="ios-input" placeholder="الاسم الأول" 
                        value={contactForm.firstName} onChange={e => setContactForm({ ...contactForm, firstName: e.target.value })} 
                      />
                      <input 
                        required className="ios-input" placeholder="الاسم الأخير" 
                        value={contactForm.lastName} onChange={e => setContactForm({ ...contactForm, lastName: e.target.value })} 
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <input 
                        required className="ios-input" placeholder="رقم الهاتف" style={{ direction: "ltr", textAlign: "right" }}
                        value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} 
                      />
                      <input 
                        required className="ios-input" type="email" placeholder="البريد الإلكتروني" style={{ direction: "ltr", textAlign: "right" }}
                        value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} 
                      />
                    </div>
                    <select 
                      required className="ios-input help-select" 
                      value={contactForm.contactType} onChange={e => setContactForm({ ...contactForm, contactType: e.target.value })}
                    >
                      <option value="">نوع التواصل...</option>
                      <option value="إبلاغ">إبلاغ</option>
                      <option value="شكوى">شكوى</option>
                      <option value="طلب مساعدة">طلب مساعدة</option>
                      <option value="اقتراح تطوير">اقتراح تطوير</option>
                    </select>
                    <textarea 
                      required className="ios-input" placeholder="اكتب تفاصيل رسالتك هنا..." 
                      value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} 
                      style={{ minHeight: "100px", resize: "vertical", fontFamily: "inherit" }}
                    />
                    <button type="submit" disabled={contactLoading} className="ios-btn ios-btn-primary" style={{ height: "45px", fontSize: "0.95rem" }}>
                      {contactLoading ? "جاري الإرسال..." : "إرسال الرسالة"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 4. INFORMATION SECTION ─── */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>معلومات</div>
      <Link href="/privacy" style={{ textDecoration: "none" }}>
        <div 
          className="glass-panel" 
          style={{ 
            borderRadius: "20px", 
            padding: "20px", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "12px",
            transition: "transform 0.2s, background-color 0.2s",
            border: "1px solid var(--border-glass)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
              <i className="bx bx-shield-quarter" style={{ fontSize: "1.4rem" }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>سياسة الخصوصية</h3>
          </div>
          <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>
      </Link>
      <Link href="/terms" style={{ textDecoration: "none" }}>
        <div 
          className="glass-panel" 
          style={{ 
            borderRadius: "20px", 
            padding: "20px", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "24px",
            transition: "transform 0.2s, background-color 0.2s",
            border: "1px solid var(--border-glass)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ios)" }}>
              <i className="bx bx-file" style={{ fontSize: "1.4rem" }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>شروط الاستخدام</h3>
          </div>
          <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}></i>
        </div>
      </Link>

      {/* ─── 5. ADVANCED SECTION ─── */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", marginRight: "6px" }}>متقدم</div>
      <div 
        className="glass-panel" 
        onClick={() => { setShowDeleteModal(true); setDeleteConfirmation(""); }}
        style={{ 
          borderRadius: "20px", 
          padding: "20px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "16px",
          transition: "transform 0.2s, background-color 0.2s",
          border: "1px solid rgba(255, 59, 48, 0.2)",
          background: "rgba(255, 59, 48, 0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255, 59, 48, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff3b30" }}>
            <i className="bx bx-user-minus" style={{ fontSize: "1.4rem" }}></i>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#ff3b30" }}>حذف الحساب نهائياً</h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>حذف كافة البيانات وإلغاء تنشيط الحساب</p>
          </div>
        </div>
        <i className="bx bx-chevron-left" style={{ fontSize: "1.5rem", color: "#ff3b30" }}></i>
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
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: "rgba(10, 15, 30, 0.72)", 
          backdropFilter: "blur(16px)", 
          WebkitBackdropFilter: "blur(16px)", 
          zIndex: 1000, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "20px" 
        }}>
          <div className="glass-panel" style={{ maxWidth: "440px", width: "100%", padding: "30px", animation: "fade-in 0.3s ease", border: "1px solid rgba(255, 59, 48, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", borderRadius: "28px" }}>
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
