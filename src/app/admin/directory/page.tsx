"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import styles from "../admin.module.css";
import { formatBoxIcon } from "@/data/places";

interface PhoneEntry {
  id: string;
  name: string;
  specialty: string;
  phone_number: string;
  logo_url: string;
  icon?: string;
  description?: string;
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

export default function AdminDirectoryPage({ isSubComponent = false }: { isSubComponent?: boolean }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState(isSubComponent ? true : false);
  const [loading, setLoading] = useState(isSubComponent ? false : true);

  // Tabs: 'phones' or 'codes'
  const [activeTab, setActiveTab] = useState<"phones" | "codes">("phones");

  // State for Customer Service Phones
  const [entries, setEntries] = useState<PhoneEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone_number: "", logo_url: "", description: "" });

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
  const [codeFormData, setCodeFormData] = useState({ company: "vodafone", title: "", code: "", note: "" });

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
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);

  const startEditPhone = (entry: PhoneEntry) => {
    setEditingPhoneId(entry.id);
    setFormData({
      name: entry.name,
      phone_number: entry.phone_number,
      logo_url: entry.logo_url || "",
      description: entry.description || "",
    });
    setSpecialtySelect(entry.specialty || "");
    setCustomSpecialty("");
    setCustomIcon(entry.icon || "");
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelPhone = () => {
    setShowAddForm(false);
    setEditingPhoneId(null);
    setFormData({ name: "", phone_number: "", logo_url: "", description: "" });
    setSpecialtySelect("");
    setCustomSpecialty("");
    setCustomIcon("");
  };

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

      let finalIcon = "bx-building";
      if (specialtySelect === "__custom__") {
        finalIcon = formatBoxIcon(customIcon.trim()) || "bx-building";
      } else {
        const existingEntry = entries.find(e => e.specialty === specialtySelect && e.icon);
        if (existingEntry && existingEntry.icon) {
          finalIcon = existingEntry.icon;
        }
      }

      if (editingPhoneId) {
        // Edit Mode
        const { data, error } = await supabase
          .from("phone_directory")
          .update({
            name: formData.name.trim(),
            specialty: finalSpecialty,
            phone_number: formData.phone_number.trim(),
            logo_url: formData.logo_url.trim(),
            icon: finalIcon,
            description: formData.description.trim()
          })
          .eq("id", editingPhoneId)
          .select();

        if (error) throw error;
        if (data) {
          setEntries(entries.map(e => e.id === editingPhoneId ? data[0] : e));
          handleCancelPhone();
        }
      } else {
        // Add Mode
        const { data, error } = await supabase
          .from("phone_directory")
          .insert([{
            name: formData.name.trim(),
            specialty: finalSpecialty,
            phone_number: formData.phone_number.trim(),
            logo_url: formData.logo_url.trim(),
            icon: finalIcon,
            description: formData.description.trim()
          }])
          .select();

        if (error) throw error;
        if (data) {
          setEntries([data[0], ...entries]);
          handleCancelPhone();
        }
      }
    } catch (err: any) {
      setError("فشل الحفظ: " + err.message);
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
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);

  const startEditCode = (item: TelecomCodeEntry) => {
    setEditingCodeId(item.id);
    const parts = item.code.split(" | ");
    setCodeFormData({
      company: item.company,
      title: item.title,
      code: parts[0] || "",
      note: parts[1] || "",
    });
    setSectionSelect(item.section_name || "");
    setCustomSection("");
    setCustomSectionIcon(item.icon || "");
    setShowAddCodeForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelCode = () => {
    setShowAddCodeForm(false);
    setEditingCodeId(null);
    setCodeFormData({ company: "vodafone", title: "", code: "", note: "" });
    setSectionSelect("");
    setCustomSection("");
    setCustomSectionIcon("");
  };

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
        finalIcon = formatBoxIcon(customSectionIcon.trim()) || "bx-folder";
      } else {
        const existingEntry = codes.find(c => c.company === codeFormData.company && c.section_name === sectionSelect && c.icon);
        if (existingEntry && existingEntry.icon) {
          finalIcon = existingEntry.icon;
        }
      }

      const finalCodeValue = codeFormData.note.trim()
        ? `${codeFormData.code.trim()} | ${codeFormData.note.trim()}`
        : codeFormData.code.trim();

      if (editingCodeId) {
        // Edit Mode
        const { data, error } = await supabase
          .from("telecom_codes")
          .update({
            company: codeFormData.company,
            section_name: finalSection,
            title: codeFormData.title.trim(),
            code: finalCodeValue,
            icon: finalIcon
          })
          .eq("id", editingCodeId)
          .select();

        if (error) throw error;
        if (data) {
          setCodes(codes.map(c => c.id === editingCodeId ? data[0] : c));
          handleCancelCode();
        }
      } else {
        // Add Mode
        const { data, error } = await supabase
          .from("telecom_codes")
          .insert([{
            company: codeFormData.company,
            section_name: finalSection,
            title: codeFormData.title.trim(),
            code: finalCodeValue,
            icon: finalIcon
          }])
          .select();

        if (error) throw error;
        if (data) {
          setCodes([data[0], ...codes]);
          handleCancelCode();
        }
      }
    } catch (err: any) {
      setError("فشل حفظ الكود: " + err.message);
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

  if (!isSubComponent && (authLoading || loading)) return <div style={{ paddingTop: "120px", textAlign: "center" }}>جاري التحميل...</div>;
  if (!isSubComponent && !isAdmin) return <div style={{ paddingTop: "120px", textAlign: "center", color: "#ff3b30" }}>عفواً، لا تملك صلاحية الوصول لهذه الصفحة.</div>;

  return (
    <div className={isSubComponent ? "" : "app-container"} style={isSubComponent ? { paddingBottom: "40px" } : { paddingTop: "20px", paddingBottom: "60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        {!isSubComponent ? (
          <div>
            <h1
              style={{ fontFamily: "var(--font-cairo)", fontWeight: "600", fontSize: "26px", color: "var(--text-ios)" }}
              className="title-ios">☎️ إدارة دليل الهاتف </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            </div>
          </div>
        ) : <div />}

        {activeTab === "phones" ? (
          <button className="ios-btn ios-btn-primary" style={{ width: "auto" }} onClick={() => {
            if (showAddForm) {
              handleCancelPhone();
            } else {
              setShowAddForm(true);
            }
          }}>
            {showAddForm ? "إلغاء" : "+ إضافة رقم جديد"}
          </button>
        ) : (
          <button className="ios-btn ios-btn-primary" style={{ width: "auto" }} onClick={() => {
            if (showAddCodeForm) {
              handleCancelCode();
            } else {
              setShowAddCodeForm(true);
            }
          }}>
            {showAddCodeForm ? "إلغاء" : "+ إضافة كود جديد"}
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "30px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px" }}>
        <button
          onClick={() => { setActiveTab("phones"); setError(""); }}
          className={`category-pill ${activeTab === "phones" ? "active" : ""}`}
          style={{ fontFamily: "var(--font-cairo)", padding: "5px 16px", color: "var(--text-ios)" }}
        >
          📞 أرقام الخدمات
        </button>
        <button
          onClick={() => { setActiveTab("codes"); setError(""); }}
          className={`category-pill ${activeTab === "codes" ? "active" : ""}`}
          style={{ fontFamily: "var(--font-cairo)", padding: "5px 16px", color: "var(--text-ios)" }}
        >
          📱 أكواد الشركات
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
            <div className="ios-sheet" style={{ position: "sticky",maxWidth:"100%", padding: "20px", height: "auto", marginBottom: "40px",borderRadius:"15px", animation: "slide-in-section 0.4s ease" }}>
              <h2 style={{ fontFamily: "var(--font-cairo)", fontWeight: "600", marginBottom: "20px" }}>
                {editingPhoneId ? `تعديل جهة: ${formData.name}` : "إضافة جهة جديدة"}
              </h2>
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
                        placeholder="كود الأيقونة من Boxicon أو FontAwesome (مثال: bx-folder-minus أو fa-solid fa-address-book)"
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
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">الوصف (اختياري)</label>
                  <textarea className="ios-input" rows={2} style={{ resize: "vertical", padding: "10px 12px", height: "auto" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="اكتب وصفاً أو ملاحظات إضافية هنا..." />
                </div>
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmitting} className="ios-btn ios-btn-primary" style={{ width: "100%", height: "50px", fontSize: "1.05rem" }}>
                    {isSubmitting ? "جاري الحفظ..." : editingPhoneId ? "تعديل الجهة" : "حفظ الجهة"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.tableCard}>
            <div className={styles.tableHeaderBar}>
              <div className={styles.tableTitleGroup}>
                <div className={styles.tableIcon}>
                  <i className="bx bx-phone-call" />
                </div>
                <div>
                  <h2 className={styles.tableTitle}>أرقام الخدمات والطوارئ ({entries.length})</h2>
                  <p className={styles.tableSubtitle}>إدارة أرقام الطوارئ والخدمات</p>

                </div>
              </div>
            </div>
            <div className={styles.tableResponsive}>
              <table className={styles.adminTable}>
                <thead className={styles.adminThead}>
                  <tr>
                    <th className={styles.adminTh}>اللوجو</th>
                    <th className={styles.adminTh}>الاسم</th>
                    <th className={styles.adminTh}>التخصص</th>
                    <th className={styles.adminTh}>الرقم</th>
                    <th className={styles.adminTh} style={{ textAlign: "left" }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.adminTd} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        لا توجد أرقام مسجلة حالياً
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className={styles.adminTr}>
                        <td className={styles.adminTd}>
                          {entry.logo_url ? (
                            <img src={entry.logo_url} alt="Logo" style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>🏢</div>
                          )}
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700" }}>
                          <div>{entry.name}</div>
                          {entry.description && (
                            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal", marginTop: "4px" }}>
                              {entry.description}
                            </div>
                          )}
                        </td>
                        <td className={styles.adminTd} style={{ color: "#cbd5e1", fontWeight: "700" }}>
                          {entry.specialty}
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700", direction: "ltr", textAlign: "right", color: "#38bdf8" }}>{entry.phone_number}</td>
                        <td className={styles.adminTd} style={{ textAlign: "left" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button onClick={() => startEditPhone(entry)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`}>
                              <i className="bx bx-edit-alt" />
                            </button>
                            <button onClick={() => handleDeletePhone(entry.id)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`}>
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
          </div>
        </>
      )}

      {/* ==================== CODES TAB ==================== */}
      {activeTab === "codes" && (
        <>
          {showAddCodeForm && (
            <div className="ios-sheet" style={{position: "sticky",maxWidth:"100%", padding: "20px", height: "auto", marginBottom: "40px",borderRadius:"15px", animation: "slide-in-section 0.4s ease"  }}>
              <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>
                {editingCodeId ? `تعديل كود خدمة: ${codeFormData.title}` : "إضافة كود خدمة جديد"}
              </h2>
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
                        placeholder="كود الأيقونة من Boxicon أو FontAwesome (مثال: bx-wallet أو fa-solid fa-wallet)"
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
                <div>
                  <label className="help-label">ملاحظة / تنبيه للمستخدم (اختياري)</label>
                  <input className="ios-input" value={codeFormData.note} placeholder="مثال: ضع كود الشحن بعد النجمة" onChange={e => setCodeFormData({ ...codeFormData, note: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmitting} className="ios-btn ios-btn-primary" style={{ width: "100%", height: "50px", fontSize: "1.05rem" }}>
                    {isSubmitting ? "جاري الحفظ..." : editingCodeId ? "تعديل الكود" : "حفظ الكود"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.tableCard}>
            <div className={styles.tableHeaderBar}>
              <div className={styles.tableTitleGroup}>
                <div className={styles.tableIcon}>
                  <i className="bx bx-code-alt" />
                </div>
                <div>
                  <h2 className={styles.tableTitle}>أكواد خدمات الاتصالات ({codes.length})</h2>
                  <p className={styles.tableSubtitle}>إدارة واستعراض أكواد الاتصالات </p>
                </div>
              </div>
            </div>
            <div className={styles.tableResponsive}>
              <table className={styles.adminTable}>
                <thead className={styles.adminThead}>
                  <tr>
                    <th className={styles.adminTh}>الشركة</th>
                    <th className={styles.adminTh}>اسم القسم</th>
                    <th className={styles.adminTh}>اسم الخدمة</th>
                    <th className={styles.adminTh}>الكود</th>
                    <th className={styles.adminTh} style={{ textAlign: "left" }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.adminTd} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        لا توجد أكواد مسجلة حالياً
                      </td>
                    </tr>
                  ) : (
                    codes.map((item) => (
                      <tr key={item.id} className={styles.adminTr}>
                        <td className={styles.adminTd} style={{ fontWeight: "700" }}>
                          <span className={`${styles.badge} ${styles.badgePrimary}`}>
                            {COMPANY_LABELS[item.company]}
                          </span>
                        </td>
                        <td className={styles.adminTd} style={{ color: "#cbd5e1" }}>
                          {item.icon && <i className={formatBoxIcon(item.icon)} style={{ marginLeft: "8px", fontSize: "1.1rem", verticalAlign: "middle", color: "#818cf8" }}></i>}
                          {item.section_name}
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700" }}>{item.title}</td>
                        <td className={styles.adminTd} style={{ fontWeight: "700", direction: "ltr", textAlign: "right", color: "#4ade80", fontFamily: "monospace", fontSize: "1.05rem" }}>
                          {item.code.split(" | ")[0]}
                          {item.code.split(" | ")[1] && (
                            <div style={{ fontSize: "0.8rem", color: "#94a3b8", direction: "rtl", textAlign: "right", marginTop: "4px", fontFamily: "var(--font-cairo)" }}>
                              ({item.code.split(" | ")[1]})
                            </div>
                          )}
                        </td>
                        <td className={styles.adminTd} style={{ textAlign: "left" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button onClick={() => startEditCode(item)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`}>
                              <i className="bx bx-edit-alt" />
                            </button>
                            <button onClick={() => handleDeleteCode(item.id)} className={`${styles.actionBtn} ${styles.actionBtnDelete}`}>
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
          </div>
        </>
      )}
    </div>
  );
}
