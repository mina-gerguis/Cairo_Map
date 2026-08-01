"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { parseWorkingHours, DAYS_OF_WEEK, WorkingHoursData, ScheduleDay } from "@/lib/workingHours";

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: {
    id: string;
    name: string;
    category?: string;
    category_label?: string;
    working_hours?: string;
    phones?: string[];
    google_maps_url?: string;
    full_address?: string;
    latitude?: number;
    longitude?: number;
    website_url?: string | null;
  };
}

const PROBLEM_OPTIONS = [
  { id: "name", label: "الاسم غير صحيح" },
  { id: "address", label: "العنوان أو الموقع على الخريطة غير صحيح" },
  { id: "phone_website", label: "رقم الهاتف أو موقع الويب غير صحيح" },
  { id: "working_hours", label: "ساعات العمل غير صحيحة" },
  { id: "closed", label: "مغلق" },
  { id: "category", label: "الفئة غير صحيحة" },
  { id: "other", label: "شيء آخر أو العديد من الأشياء غير صحيحة" }
];

const SITE_CATEGORIES = [
  { id: "restaurant", label: "مطاعم" },
  { id: "cafe", label: "كافيهات" },
  { id: "garden", label: "حدائق" },
  { id: "medicalCenter", label: "مراكز طبية" },
  { id: "health_beauty", label: "الصحة والجمال" },
  { id: "family", label: "اماكن عائلية" },
  { id: "quiet_places", label: "اماكن هادئة" },
  { id: "kids", label: "العاب اطفال" },
  { id: "amusement_aqua", label: "مدن الملاهي والالعاب المائية" },
  { id: "work", label: "مساحات عمل مشتركة" },
  { id: "courses_study", label: "اماكن كورسات ومذاكرة" },
  { id: "hotel", label: "فنادق" },
  { id: "cinema", label: "سينما" },
  { id: "mall", label: "مولات" },
  { id: "outings", label: "فسح وخروجات" }
];

export default function ReportProblemModal({ isOpen, onClose, place }: ReportProblemModalProps) {
  const { user } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  
  // Input fields state
  const [newName, setNewName] = useState(place.name);
  const [newAddress, setNewAddress] = useState(place.full_address || "");
  const [newMapsUrl, setNewMapsUrl] = useState(place.google_maps_url || "");
  const [newLatitude, setNewLatitude] = useState(place.latitude || 30.0444);
  const [newLongitude, setNewLongitude] = useState(place.longitude || 31.2357);
  const [newPhones, setNewPhones] = useState(place.phones ? place.phones.join(", ") : "");
  const [newWebsite, setNewWebsite] = useState(place.website_url || "");
  
  // Working Hours State
  const [hoursType, setHoursType] = useState<"24/7" | "custom">("custom");
  const [customSchedule, setCustomSchedule] = useState<ScheduleDay[]>([]);
  
  // Closed State
  const [closureStatus, setClosureStatus] = useState("permanently_closed"); // permanently_closed, temporarily_closed, not_exist
  
  // Category State
  const [newCategory, setNewCategory] = useState(place.category || "");
  const [newCategoryLabel, setNewCategoryLabel] = useState(place.category_label || "");
  
  // General inputs
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load and parse working hours
  useEffect(() => {
    if (!isOpen) return;

    // Parse existing working hours
    const parsed = parseWorkingHours(place.working_hours);
    if (parsed) {
      setHoursType(parsed.type);
      if (parsed.schedule) {
        setCustomSchedule(parsed.schedule);
      }
    } else {
      // Default empty schedule
      const defaultSchedule = DAYS_OF_WEEK.map(day => ({
        day,
        isWorking: true,
        openTime: "09:00",
        openPeriod: "ص" as const,
        closeTime: "11:00",
        closePeriod: "م" as const
      }));
      setCustomSchedule(defaultSchedule);
    }
  }, [isOpen, place]);

  if (!isOpen) return null;

  // Handle file uploads with public/avatars bucket, fallback to base64
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg("");
    try {
      if (supabase) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (publicUrl) {
            setImageUrl(publicUrl);
            setIsUploading(false);
            return;
          }
        }
      }

      // Fallback to Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImageUrl(result);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setErrorMsg("فشل قراءة الملف");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("حدث خطأ أثناء رفع الملف");
      setIsUploading(false);
    }
  };

  const handleDayWorkingChange = (index: number, val: boolean) => {
    setCustomSchedule(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], isWorking: val };
      return copy;
    });
  };

  const handleDayTimeChange = (index: number, field: "openTime" | "closeTime", val: string) => {
    setCustomSchedule(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDayPeriodChange = (index: number, field: "openPeriod" | "closePeriod", val: "ص" | "م") => {
    setCustomSchedule(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMsg("يرجى تسجيل الدخول أولاً لتتمكن من الإبلاغ عن مشكلة.");
      return;
    }
    if (!selectedProblem) {
      setErrorMsg("يرجى اختيار المشكلة المطلوب الإبلاغ عنها.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    let detailsPayload: any = {};
    
    if (selectedProblem === "name") {
      if (!newName.trim()) {
        setErrorMsg("اسم المكان مطلوب");
        setLoading(false);
        return;
      }
      detailsPayload = { newName: newName.trim() };
    } else if (selectedProblem === "address") {
      detailsPayload = {
        newAddress: newAddress.trim(),
        newMapsUrl: newMapsUrl.trim(),
        newLatitude,
        newLongitude
      };
    } else if (selectedProblem === "phone_website") {
      detailsPayload = {
        newPhones: newPhones.split(",").map(p => p.trim()).filter(Boolean),
        newWebsite: newWebsite.trim()
      };
    } else if (selectedProblem === "working_hours") {
      detailsPayload = {
        workingHours: {
          type: hoursType,
          schedule: hoursType === "custom" ? customSchedule : undefined
        }
      };
    } else if (selectedProblem === "closed") {
      detailsPayload = { closureStatus };
    } else if (selectedProblem === "category") {
      detailsPayload = {
        newCategory,
        newCategoryLabel
      };
    }

    try {
      if (!supabase) throw new Error("Supabase client is not initialized");

      const { error } = await supabase.from("place_reports").insert([{
        place_id: place.id,
        user_id: user.id,
        problem_type: selectedProblem,
        details: detailsPayload,
        comment: comment.trim() || null,
        image_url: imageUrl || null,
        status: "pending"
      }]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedProblem(null);
        setComment("");
        setImageUrl("");
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Report submit error:", err);
      setErrorMsg("فشل إرسال البلاغ: " + (err.message || "حدث خطأ غير معروف"));
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid to determine button styling
  const isFormValid = !!selectedProblem && 
    (selectedProblem !== "name" || !!newName.trim()) &&
    (selectedProblem !== "other" || !!comment.trim());

  return (
    <div className="ios-sheet-overlay" style={{ zIndex: 1050 }}>
      <div className="ios-sheet" style={{ height: "94vh", maxHeight: "94vh", maxWidth: "600px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-glass)",
          position: "sticky",
          top: 0,
          background: "var(--bg-secondary)",
          zIndex: 10
        }}>
          {/* Submit Button (Left) */}
          <button 
            onClick={handleSubmit} 
            disabled={loading || isUploading}
            style={{ 
              background: "none", 
              border: "none", 
              color: loading || isUploading || !isFormValid ? "var(--text-muted)" : "var(--accent-ios)", 
              fontSize: "1.6rem", 
              cursor: loading || isUploading ? "not-allowed" : "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s ease"
            }}
            title="إرسال البلاغ"
          >
            {loading ? <i className="bx bx-loader-alt bx-spin"></i> : <i className="bx bx-check"></i>}
          </button>

          {/* Title */}
          <span style={{ 
            fontFamily: "var(--font-cairo)", 
            fontWeight: "700", 
            fontSize: "1.15rem", 
            color: "var(--text-primary)" 
          }}>
            الإبلاغ عن مشكلة
          </span>

          {/* Close Button (Right) */}
          <button 
            onClick={onClose} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--text-primary)", 
              fontSize: "1.6rem", 
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center"
            }}
            title="إلغاء"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="ios-sheet-content" style={{ padding: "20px" }}>
          
          {success ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(52, 199, 89, 0.1)", color: "#34c759", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "2rem" }}>
                <i className="bx bx-check-shield"></i>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "8px" }}>تم إرسال بلاغك بنجاح</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>شكراً لك على مساعدتنا في تحسين جودة البيانات.</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div style={{ background: "rgba(255, 59, 48, 0.1)", border: "1px solid rgba(255, 59, 48, 0.2)", borderRadius: "12px", padding: "12px 16px", color: "#ff3b30", fontSize: "0.9rem", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }}></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Subtitle */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 4px" }}>
                  ما المشكلة المطلوب الإبلاغ عنها حول {place.name}؟
                </h3>
              </div>

              {/* Problems List */}
              <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-glass)", borderRadius: "14px", overflow: "hidden", marginBottom: "24px" }}>
                {PROBLEM_OPTIONS.map((prob) => {
                  const isSelected = selectedProblem === prob.id;
                  return (
                    <div 
                      key={prob.id} 
                      onClick={() => setSelectedProblem(prob.id)}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        padding: "14px 18px", 
                        borderBottom: "1px solid var(--border-glass)", 
                        cursor: "pointer",
                        background: isSelected ? "rgba(0, 122, 255, 0.08)" : "transparent",
                        transition: "background 0.2s"
                      }}
                    >
                      <span style={{ fontSize: "0.95rem", fontWeight: isSelected ? "700" : "500", color: isSelected ? "var(--accent-ios)" : "var(--text-primary)" }}>
                        {prob.label}
                      </span>
                      {isSelected ? (
                        <i className="bx bx-check" style={{ color: "var(--accent-ios)", fontSize: "1.4rem", fontWeight: "bold" }}></i>
                      ) : (
                        <i className="bx bx-chevron-left" style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}></i>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Expanded Input Fields Section */}
              {selectedProblem && (
                <div style={{ animation: "fade-in 0.3s ease", marginBottom: "24px" }}>
                  
                  {/* PROBLEM: Name incorrect */}
                  {selectedProblem === "name" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>مطلوب: اسم المكان</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input 
                          type="text" 
                          className="ios-input" 
                          style={{ width: "100%", paddingRight: "16px", paddingLeft: "40px" }} 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)} 
                          placeholder="اسم المكان الجديد" 
                        />
                        {newName && (
                          <button 
                            onClick={() => setNewName("")} 
                            style={{ position: "absolute", left: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center" }}
                          >
                            <i className="bx bx-x-circle"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PROBLEM: Address/Map incorrect */}
                  {selectedProblem === "address" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                      
                      {/* Map Preview */}
                      <div>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>موقع</label>
                        <iframe 
                          src={`https://maps.google.com/maps?q=${newLatitude},${newLongitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          style={{ width: "100%", height: "200px", borderRadius: "12px", border: "none", marginBottom: "6px" }}
                          title="خريطة المكان"
                        />
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4", display: "block" }}>
                          يرجى الانتقال بالخريطة إلى الموقع الصحيح. يمكنك تعديل الإحداثيات أو الرابط أدناه.
                        </span>
                      </div>

                      {/* Address Text */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>العنوان</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <input 
                            type="text" 
                            className="ios-input" 
                            style={{ width: "100%", paddingRight: "44px" }} 
                            value={newAddress} 
                            onChange={(e) => setNewAddress(e.target.value)} 
                            placeholder="العنوان التفصيلي" 
                          />
                          <i className="bx bx-search" style={{ position: "absolute", right: "16px", color: "var(--text-muted)", fontSize: "1.1rem" }}></i>
                        </div>
                      </div>

                      {/* Google Maps Link */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>رابط خرائط جوجل (إن وجد)</label>
                        <input 
                          type="text" 
                          className="ios-input" 
                          value={newMapsUrl} 
                          onChange={(e) => {
                            setNewMapsUrl(e.target.value);
                            // Try parsing lat/lng from URL if possible
                            const match = e.target.value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                            if (match) {
                              setNewLatitude(parseFloat(match[1]));
                              setNewLongitude(parseFloat(match[2]));
                            }
                          }} 
                          placeholder="رابط خرائط جوجل الجديد" 
                        />
                      </div>
                    </div>
                  )}

                  {/* PROBLEM: Phone or Website incorrect */}
                  {selectedProblem === "phone_website" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>رقم الهاتف (لفصل أرقام متعددة استخدم الفاصلة ,)</label>
                        <input 
                          type="text" 
                          className="ios-input" 
                          value={newPhones} 
                          onChange={(e) => setNewPhones(e.target.value)} 
                          placeholder="رقم الهاتف الجديد" 
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>موقع الويب</label>
                        <input 
                          type="text" 
                          className="ios-input" 
                          value={newWebsite} 
                          onChange={(e) => setNewWebsite(e.target.value)} 
                          placeholder="رابط موقع الويب الجديد" 
                        />
                      </div>
                    </div>
                  )}

                  {/* PROBLEM: Working hours incorrect */}
                  {selectedProblem === "working_hours" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>ساعات العمل</label>
                      
                      {/* Hours Type Selector */}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                          onClick={() => setHoursType("custom")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "10px",
                            border: "none",
                            background: hoursType === "custom" ? "var(--accent-ios)" : "rgba(255, 255, 255, 0.05)",
                            color: hoursType === "custom" ? "#fff" : "var(--text-primary)",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            cursor: "pointer"
                          }}
                        >
                          مواعيد مخصصة
                        </button>
                        <button 
                          onClick={() => setHoursType("24/7")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "10px",
                            border: "none",
                            background: hoursType === "24/7" ? "var(--accent-ios)" : "rgba(255, 255, 255, 0.05)",
                            color: hoursType === "24/7" ? "#fff" : "var(--text-primary)",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            cursor: "pointer"
                          }}
                        >
                          مفتوح 24/7
                        </button>
                      </div>

                      {/* Day by Day Scheduler */}
                      {hoursType === "custom" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px" }}>
                          {customSchedule.map((sched, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: idx < customSchedule.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none", gap: "10px", flexWrap: "wrap" }}>
                              
                              {/* Day check box */}
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "100px" }}>
                                <input 
                                  type="checkbox" 
                                  checked={sched.isWorking} 
                                  onChange={(e) => handleDayWorkingChange(idx, e.target.checked)} 
                                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                                />
                                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: sched.isWorking ? "var(--text-primary)" : "var(--text-muted)" }}>{sched.day}</span>
                              </div>

                              {/* Working hours inputs */}
                              {sched.isWorking ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "flex-end", flexWrap: "nowrap" }}>
                                  {/* Open Time */}
                                  <input 
                                    type="text" 
                                    className="ios-input" 
                                    style={{ width: "65px", padding: "6px", textAlign: "center", fontSize: "0.85rem" }} 
                                    value={sched.openTime} 
                                    onChange={(e) => handleDayTimeChange(idx, "openTime", e.target.value)} 
                                    placeholder="09:00" 
                                  />
                                  <select 
                                    value={sched.openPeriod} 
                                    onChange={(e) => handleDayPeriodChange(idx, "openPeriod", e.target.value as "ص" | "م")}
                                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-primary)", border: "1px solid var(--border-glass)", borderRadius: "8px", padding: "5px", fontSize: "0.85rem", cursor: "pointer" }}
                                  >
                                    <option value="ص" style={{ background: "#222" }}>ص</option>
                                    <option value="م" style={{ background: "#222" }}>م</option>
                                  </select>

                                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>إلى</span>

                                  {/* Close Time */}
                                  <input 
                                    type="text" 
                                    className="ios-input" 
                                    style={{ width: "65px", padding: "6px", textAlign: "center", fontSize: "0.85rem" }} 
                                    value={sched.closeTime} 
                                    onChange={(e) => handleDayTimeChange(idx, "closeTime", e.target.value)} 
                                    placeholder="11:00" 
                                  />
                                  <select 
                                    value={sched.closePeriod} 
                                    onChange={(e) => handleDayPeriodChange(idx, "closePeriod", e.target.value as "ص" | "م")}
                                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-primary)", border: "1px solid var(--border-glass)", borderRadius: "8px", padding: "5px", fontSize: "0.85rem", cursor: "pointer" }}
                                  >
                                    <option value="ص" style={{ background: "#222" }}>ص</option>
                                    <option value="م" style={{ background: "#222" }}>م</option>
                                  </select>
                                </div>
                              ) : (
                                <span style={{ fontSize: "0.85rem", color: "#ff3b30", fontWeight: "bold" }}>مغلق (إجازة)</span>
                              )}

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROBLEM: Closed */}
                  {selectedProblem === "closed" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>حالة المكان</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                          <input 
                            type="radio" 
                            name="closure_status" 
                            value="permanently_closed" 
                            checked={closureStatus === "permanently_closed"} 
                            onChange={(e) => setClosureStatus(e.target.value)} 
                          />
                          <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>مغلق نهائياً</span>
                        </label>
                        
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                          <input 
                            type="radio" 
                            name="closure_status" 
                            value="temporarily_closed" 
                            checked={closureStatus === "temporarily_closed"} 
                            onChange={(e) => setClosureStatus(e.target.value)} 
                          />
                          <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>مغلق مؤقتاً</span>
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                          <input 
                            type="radio" 
                            name="closure_status" 
                            value="not_exist" 
                            checked={closureStatus === "not_exist"} 
                            onChange={(e) => setClosureStatus(e.target.value)} 
                          />
                          <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>غير موجود بالمرة</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* PROBLEM: Category incorrect */}
                  {selectedProblem === "category" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>الفئة المقترحة</label>
                      <select
                        value={newCategory}
                        onChange={(e) => {
                          setNewCategory(e.target.value);
                          const selected = SITE_CATEGORIES.find(c => c.id === e.target.value);
                          if (selected) setNewCategoryLabel(selected.label);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--border-glass)",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-cairo)",
                          fontSize: "0.95rem",
                          cursor: "pointer"
                        }}
                      >
                        <option value="" style={{ background: "#222" }}>اختر الفئة الجديدة...</option>
                        {SITE_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id} style={{ background: "#222" }}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Upload Image Section */}
                  <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <div style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px dashed var(--border-glass)",
                      borderRadius: "12px",
                      padding: "16px",
                      textAlign: "center",
                      position: "relative",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: "pointer", width: "100%" }}
                        disabled={isUploading}
                      />
                      {imageUrl ? (
                        <div style={{ position: "relative", width: "100%", height: "120px" }}>
                          <img src={imageUrl} alt="صورة البلاغ" style={{ width: "100%", height: "120px", objectFit: "contain", borderRadius: "8px" }} />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setImageUrl(""); }}
                            style={{ position: "absolute", top: "4px", left: "4px", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <i className="bx bx-x"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <i className={isUploading ? "bx bx-loader-alt bx-spin" : "bx bx-camera"} style={{ fontSize: "1.8rem", color: "var(--text-muted)" }}></i>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                            {isUploading ? "جاري رفع الصورة..." : "إضافة صورة"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)" }}>إضافة تعليق</label>
                    <textarea 
                      className="ios-input" 
                      style={{ width: "100%", minHeight: "80px", padding: "12px", resize: "vertical", fontFamily: "var(--font-cairo)" }} 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      placeholder="صف بالتفصيل ما تريد تصحيحه..."
                    />
                  </div>

                </div>
              )}

              {/* Legal Notice Footer */}
              <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "16px", marginTop: "16px" }}>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.6", margin: "0 0 10px", textAlign: "justify" }}>
                  يرجى إضافة أي معلومات يمكن أن تساعدنا عند مراجعة بلاغك. يرجى عدم تضمين معلومات شخصية في تعليقاتك أو صورك.
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.6", margin: "0 0 16px", textAlign: "justify" }}>
                  البلاغات المتعلقة بمنزلك وعملك ومدرستك وبعض البلاغات المتعلقة بميزة "انظر في الأنحاء" والصور في "الخرائط" ستكون مرتبطة بحسابك لتسهيل عملية التواصل وتحديث البيانات.
                </p>
                <a href="#" style={{ fontSize: "0.8rem", color: "var(--accent-ios)", fontWeight: "bold", textDecoration: "none" }}>
                  التعرّف على كيفية إدارة بياناتك...
                </a>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
