"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface PhoneEntry {
  id: string;
  name: string;
  specialty: string;
  phone_number: string;
  logo_url: string;
  icon?: string;
}

interface TelecomCodeEntry {
  id: string;
  company: string;
  section_name: string;
  title: string;
  code: string;
  icon?: string;
}

const COMPANY_LABELS: Record<string, string> = {
  vodafone: "فودافون",
  orange: "اورنج",
  etisalat: "اتصالات",
  we: "وي",
};

export default function AdminDirectoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'phones' or 'codes'
  const [activeTab, setActiveTab] = useState<"phones" | "codes">("phones");

  // State for Customer Service Phones
  const [entries, setEntries] = useState<PhoneEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone_number: "", logo_url: "" });
  
  // Custom specialty states for dropdown
  const [specialtySelect, setSpecialtySelect] = useState("");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [customIcon, setCustomIcon] = useState("");

  // Extract unique specialties from entries
  const existingSpecialties = React.useMemo(() => {
    return Array.from(new Set(entries.map(e => e.specialty?.trim()).filter(Boolean)));
  }, [entries]);
  
  // State for Telecom Codes
  const [codes, setCodes] = useState<TelecomCodeEntry[]>([]);
  const [showAddCodeForm, setShowAddCodeForm] = useState(false);
  const [codeFormData, setCodeFormData] = useState({ company: "vodafone", title: "", code: "" });

  // Custom section states for telecom codes dropdown
  const [sectionSelect, setSectionSelect] = useState("");
  const [customSection, setCustomSection] = useState("");
  const [customSectionIcon, setCustomSectionIcon] = useState("");

  // Extract unique sections dynamically per company
  const existingSections = React.useMemo(() => {
    return Array.from(new Set(
      codes
        .filter(c => c.company === codeFormData.company)
        .map(c => c.section_name?.trim())
        .filter(Boolean)
    ));
  }, [codes, codeFormData.company]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkAdminAndFetch = async () => {
      if (!supabase) return;
      try {
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

        // Fetch phones
        const { data: phonesData, error: phonesError } = await supabase
          .from("phone_directory")
          .select("*")
          .order("created_at", { ascending: false });

        if (phonesError) throw phonesError;
        if (phonesData) setEntries(phonesData);

        // Fetch codes
        const { data: codesData, error: codesError } = await supabase
          .from("telecom_codes")
          .select("*")
          .order("created_at", { ascending: false });

        if (codesError) throw codesError;
        if (codesData) setCodes(codesData);

      } catch (err: any) {
        setError(err.message || "حدث خطأ غير معروف.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user, authLoading, router]);

  // CRUD for Phones
  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSubmitting(true);
    setError("");

    try {
      const finalSpecialty = specialtySelect === "__custom__" ? customSpecialty.trim() : specialtySelect.trim();
      
      if (!finalSpecialty) {
        throw new Error("يرجى تحديد أو كتابة تخصص.");
      }

      // Determine the icon: if new specialty, save customIcon (fallback to bx-building), if existing, copy its first non-empty icon
      let finalIcon = "bx-building";
      if (specialtySelect === "__custom__") {
        finalIcon = customIcon.trim() || "bx-building";
      } else {
        const existingEntry = entries.find(e => e.specialty === specialtySelect && e.icon);
        if (existingEntry && existingEntry.icon) {
          finalIcon = existingEntry.icon;
        }
      }

      const { data, error } = await supabase
        .from("phone_directory")
        .insert([{
          name: formData.name.trim(),
          specialty: finalSpecialty,
          phone_number: formData.phone_number.trim(),
          logo_url: formData.logo_url.trim(),
          icon: finalIcon
        }])
        .select();

      if (error) throw error;
      if (data) {
        setEntries([data[0], ...entries]);
        setShowAddForm(false);
        setFormData({ name: "", phone_number: "", logo_url: "" });
        setSpecialtySelect("");
        setCustomSpecialty("");
        setCustomIcon("");
      }
    } catch (err: any) {
      setError("فشل الإضافة: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhone = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الرقم؟")) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from("phone_directory").delete().eq("id", id);
      if (error) throw error;
      setEntries(entries.filter(e => e.id !== id));
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    }
  };

  // CRUD for Telecom Codes
  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSubmitting(true);
    setError("");

    try {
      const finalSection = sectionSelect === "__custom__" ? customSection.trim() : sectionSelect.trim();

      if (!finalSection) {
        throw new Error("يرجى تحديد أو كتابة قسم.");
      }

      // Determine the icon: if new section, save customSectionIcon (fallback to bx-folder), if existing, copy its first non-empty icon
      let finalIcon = "bx-folder";
      if (sectionSelect === "__custom__") {
        finalIcon = customSectionIcon.trim() || "bx-folder";
      } else {
        const existingEntry = codes.find(c => c.company === codeFormData.company && c.section_name === sectionSelect && c.icon);
        if (existingEntry && existingEntry.icon) {
          finalIcon = existingEntry.icon;
        }
      }

      const { data, error } = await supabase
        .from("telecom_codes")
        .insert([{
          company: codeFormData.company,
          section_name: finalSection,
          title: codeFormData.title.trim(),
          code: codeFormData.code.trim(),
          icon: finalIcon
        }])
        .select();

      if (error) throw error;
      if (data) {
        setCodes([data[0], ...codes]);
        setShowAddCodeForm(false);
        setCodeFormData({ company: "vodafone", title: "", code: "" });
        setSectionSelect("");
        setCustomSection("");
        setCustomSectionIcon("");
      }
    } catch (err: any) {
      setError("فشل إضافة الكود: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from("telecom_codes").delete().eq("id", id);
      if (error) throw error;
      setCodes(codes.filter(c => c.id !== id));
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    }
  };

  if (authLoading || loading) return <div style={{ paddingTop: "120px", textAlign: "center" }}>جاري التحميل...</div>;
  if (!isAdmin) return <div style={{ paddingTop: "120px", textAlign: "center", color: "#ff3b30" }}>عفواً، لا تملك صلاحية الوصول لهذه الصفحة.</div>;

  return (
    <div className="app-container" style={{ paddingTop: "120px", paddingBottom: "60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <div>
          <h1 className="title-ios">إدارة دليل الهاتف والخدمات ☎️</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>التحكم بأرقام الدليل وأكواد الشبكات</p>
            <Link href="/admin" className="ios-btn" style={{ padding: "4px 12px", fontSize: "0.8rem", background: "rgba(59,130,246,0.1)", color: "var(--accent-primary)", border: "1px solid rgba(59,130,246,0.2)" }}>
              ⬅️ العودة للأماكن
            </Link>
          </div>
        </div>

        {activeTab === "phones" ? (
          <button className="ios-btn ios-btn-primary" style={{ width: "auto" }} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "إلغاء الإضافة" : "+ إضافة رقم جديد"}
          </button>
        ) : (
          <button className="ios-btn ios-btn-primary" style={{ width: "auto" }} onClick={() => setShowAddCodeForm(!showAddCodeForm)}>
            {showAddCodeForm ? "إلغاء الإضافة" : "+ إضافة كود جديد"}
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "30px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px" }}>
        <button
          onClick={() => { setActiveTab("phones"); setError(""); }}
          className={`category-pill ${activeTab === "phones" ? "active" : ""}`}
        >
          📞 أرقام خدمة العملاء
        </button>
        <button
          onClick={() => { setActiveTab("codes"); setError(""); }}
          className={`category-pill ${activeTab === "codes" ? "active" : ""}`}
        >
          📱 أكواد خدمات الشركات
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(255, 59, 48, 0.15)", border: "1px solid rgba(255, 59, 48, 0.3)", padding: "16px", borderRadius: "16px", color: "#ff3b30", marginBottom: "30px", fontSize: "0.95rem" }}>
          {error}
        </div>
      )}

      {/* ==================== PHONES TAB ==================== */}
      {activeTab === "phones" && (
        <>
          {showAddForm && (
            <div className="ios-sheet" style={{ position: "static", height: "auto", marginBottom: "40px", animation: "slide-in-section 0.4s ease" }}>
              <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>إضافة جهة جديدة</h2>
              <form onSubmit={handleAddPhone} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <div>
                  <label className="help-label">الاسم (مثال: المصرية للاتصالات وي)</label>
                  <input required className="ios-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">التخصص</label>
                  <select
                    required
                    className="ios-input help-select"
                    value={specialtySelect}
                    onChange={(e) => setSpecialtySelect(e.target.value)}
                  >
                    <option value="">اختر التخصص...</option>
                    {existingSpecialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                    <option value="__custom__">+ إضافة تخصص جديد...</option>
                  </select>
                  {specialtySelect === "__custom__" && (
                    <>
                      <input
                        required
                        className="ios-input"
                        style={{ marginTop: "12px" }}
                        placeholder="اكتب التخصص الجديد هنا..."
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                      />
                      <input
                        className="ios-input"
                        style={{ marginTop: "12px", direction: "ltr", textAlign: "right" }}
                        placeholder="كود أيقونة Boxicon (مثال: bx-folder-minus)"
                        value={customIcon}
                        onChange={(e) => setCustomIcon(e.target.value)}
                      />
                    </>
                  )}
                </div>
                <div>
                  <label className="help-label">رقم الهاتف أو الخط الساخن</label>
                  <input required className="ios-input" style={{ direction: "ltr", textAlign: "right" }} value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">رابط اللوجو (اختياري)</label>
                  <input className="ios-input" style={{ direction: "ltr", textAlign: "right" }} value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmitting} className="ios-btn ios-btn-primary" style={{ width: "100%", height: "50px", fontSize: "1.05rem" }}>
                    {isSubmitting ? "جاري الإضافة..." : "حفظ الجهة"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ borderRadius: "20px", padding: "0", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ background: "rgba(108, 99, 255, 0.05)", color: "var(--accent-primary)", textAlign: "right" }}>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>اللوجو</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>الاسم</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>التخصص</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>الرقم</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem", textAlign: "left" }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        لا توجد أرقام مسجلة حالياً
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} style={{ borderBottom: "1px solid var(--border-glass)", transition: "background 0.2s" }}>
                        <td style={{ padding: "12px 20px" }}>
                          {entry.logo_url ? (
                            <img src={entry.logo_url} alt="Logo" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>🏢</div>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: "700" }}>{entry.name}</td>
                        <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          {entry.icon && <i className={`bx ${entry.icon}`} style={{ marginLeft: "8px", fontSize: "1.1rem", verticalAlign: "middle" }}></i>}
                          {entry.specialty}
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: "600", direction: "ltr", textAlign: "right" }}>{entry.phone_number}</td>
                        <td style={{ padding: "16px 20px", textAlign: "left" }}>
                          <button onClick={() => handleDeletePhone(entry.id)} className="ios-btn" style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30", padding: "6px 12px", fontSize: "0.85rem", border: "1px solid rgba(255,59,48,0.2)", width: "auto" }}>
                            حذف 🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ==================== CODES TAB ==================== */}
      {activeTab === "codes" && (
        <>
          {showAddCodeForm && (
            <div className="ios-sheet" style={{ position: "static", height: "auto", marginBottom: "40px", animation: "slide-in-section 0.4s ease" }}>
              <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>إضافة كود خدمة جديد</h2>
              <form onSubmit={handleAddCode} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <div>
                  <label className="help-label">الشركة</label>
                  <select required className="ios-input help-select" value={codeFormData.company} onChange={e => setCodeFormData({ ...codeFormData, company: e.target.value })}>
                    <option value="vodafone">فودافون</option>
                    <option value="orange">اورنج</option>
                    <option value="etisalat">اتصالات</option>
                    <option value="we">وي</option>
                  </select>
                </div>
                <div>
                  <label className="help-label">اسم القسم</label>
                  <select
                    required
                    className="ios-input help-select"
                    value={sectionSelect}
                    onChange={(e) => setSectionSelect(e.target.value)}
                  >
                    <option value="">اختر القسم...</option>
                    {existingSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                    <option value="__custom__">+ إضافة قسم جديد...</option>
                  </select>
                  {sectionSelect === "__custom__" && (
                    <>
                      <input
                        required
                        className="ios-input"
                        style={{ marginTop: "12px" }}
                        placeholder="اكتب اسم القسم الجديد هنا..."
                        value={customSection}
                        onChange={(e) => setCustomSection(e.target.value)}
                      />
                      <input
                        className="ios-input"
                        style={{ marginTop: "12px", direction: "ltr", textAlign: "right" }}
                        placeholder="كود أيقونة Boxicon للقسم (مثال: bx-wallet)"
                        value={customSectionIcon}
                        onChange={(e) => setCustomSectionIcon(e.target.value)}
                      />
                    </>
                  )}
                </div>
                <div>
                  <label className="help-label">نوع الكود/الخدمة (مثال: شحن رصيد)</label>
                  <input required className="ios-input" value={codeFormData.title} placeholder="مثال: الاستعلام عن الرصيد" onChange={e => setCodeFormData({ ...codeFormData, title: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">الكود الرقمي (مثال: *858#)</label>
                  <input required className="ios-input" style={{ direction: "ltr", textAlign: "right" }} value={codeFormData.code} placeholder="*858#" onChange={e => setCodeFormData({ ...codeFormData, code: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmitting} className="ios-btn ios-btn-primary" style={{ width: "100%", height: "50px", fontSize: "1.05rem" }}>
                    {isSubmitting ? "جاري الإضافة..." : "حفظ الكود"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ borderRadius: "20px", padding: "0", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ background: "rgba(108, 99, 255, 0.05)", color: "var(--accent-primary)", textAlign: "right" }}>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>الشركة</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>اسم القسم</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>اسم الخدمة</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem" }}>الكود</th>
                    <th style={{ padding: "16px 20px", fontWeight: "800", fontSize: "0.95rem", textAlign: "left" }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        لا توجد أكواد مسجلة حالياً
                      </td>
                    </tr>
                  ) : (
                    codes.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border-glass)", transition: "background 0.2s" }}>
                        <td style={{ padding: "16px 20px", fontWeight: "700" }}>{COMPANY_LABELS[item.company]}</td>
                         <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                           {item.icon && <i className={`bx ${item.icon}`} style={{ marginLeft: "8px", fontSize: "1.1rem", verticalAlign: "middle" }}></i>}
                           {item.section_name}
                         </td>
                        <td style={{ padding: "16px 20px", fontWeight: "700" }}>{item.title}</td>
                        <td style={{ padding: "16px 20px", fontWeight: "600", direction: "ltr", textAlign: "right" }}>{item.code}</td>
                        <td style={{ padding: "16px 20px", textAlign: "left" }}>
                          <button onClick={() => handleDeleteCode(item.id)} className="ios-btn" style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30", padding: "6px 12px", fontSize: "0.85rem", border: "1px solid rgba(255,59,48,0.2)", width: "auto" }}>
                            حذف 🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
