"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import styles from "../admin.module.css";
import { formatBoxIcon } from "@/data/places";
import CustomModal from "@/components/common/Modals";

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

const COMPANY_META: Record<string, { label: string; logo: string; color: string; activeBg: string; activeBorder: string; badgeBg: string }> = {
  vodafone: {
    label: "فودافون",
    logo: "/images/company/vodafone.png",
    color: "#ef4444",
    activeBg: "rgba(239, 68, 68, 0.12)",
    activeBorder: "rgba(239, 68, 68, 0.4)",
    badgeBg: "rgba(239, 68, 68, 0.2)",
  },
  orange: {
    label: "اورنج",
    logo: "/images/company/orange.png",
    color: "#f97316",
    activeBg: "rgba(249, 115, 22, 0.12)",
    activeBorder: "rgba(249, 115, 22, 0.4)",
    badgeBg: "rgba(249, 115, 22, 0.2)",
  },
  etisalat: {
    label: "اتصالات",
    logo: "/images/company/etisalat.png",
    color: "#22c55e",
    activeBg: "rgba(34, 197, 94, 0.12)",
    activeBorder: "rgba(34, 197, 94, 0.4)",
    badgeBg: "rgba(34, 197, 94, 0.2)",
  },
  we: {
    label: "وي",
    logo: "/images/company/we.png",
    color: "#a855f7",
    activeBg: "rgba(168, 85, 247, 0.12)",
    activeBorder: "rgba(168, 85, 247, 0.4)",
    badgeBg: "rgba(168, 85, 247, 0.2)",
  },
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneToDelete, setPhoneToDelete] = useState<PhoneEntry | null>(null);
  const [codeToDelete, setCodeToDelete] = useState<TelecomCodeEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected Company Tab for Telecom Codes: 'all' or company key
  const [selectedCompanyTab, setSelectedCompanyTab] = useState<string>("all");

  // Filter entries based on search query
  const filteredEntries = React.useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const term = searchQuery.toLowerCase().trim();
    return entries.filter(e => {
      const name = (e.name || "").toLowerCase();
      const specialty = (e.specialty || "").toLowerCase();
      const description = (e.description || "").toLowerCase();
      const phone = (e.phone_number || "").toLowerCase();
      return name.includes(term) || specialty.includes(term) || description.includes(term) || phone.includes(term);
    });
  }, [entries, searchQuery]);

  // Counts per company for telecom codes
  const companyCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: codes.length, vodafone: 0, orange: 0, etisalat: 0, we: 0 };
    codes.forEach(c => {
      if (counts[c.company] !== undefined) {
        counts[c.company]++;
      } else {
        counts[c.company] = 1;
      }
    });
    return counts;
  }, [codes]);

  // Filter codes based on selected company and search query
  const filteredCodes = React.useMemo(() => {
    let list = codes;
    if (selectedCompanyTab !== "all") {
      list = list.filter(c => c.company === selectedCompanyTab);
    }
    if (!searchQuery.trim()) return list;
    const term = searchQuery.toLowerCase().trim();
    return list.filter(c => {
      const company = (COMPANY_LABELS[c.company] || "").toLowerCase();
      const section = (c.section_name || "").toLowerCase();
      const title = (c.title || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      return company.includes(term) || section.includes(term) || title.includes(term) || code.includes(term);
    });
  }, [codes, selectedCompanyTab, searchQuery]);

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

  const handleDeletePhone = (item: PhoneEntry) => {
    setPhoneToDelete(item);
  };

  const confirmDeletePhone = async () => {
    if (!phoneToDelete || !supabase) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase.from("phone_directory").delete().eq("id", phoneToDelete.id);
      if (error) throw error;
      setEntries(entries.filter(e => e.id !== phoneToDelete.id));
      setPhoneToDelete(null);
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    } finally {
      setIsDeleting(false);
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
    setCodeFormData({
      company: selectedCompanyTab !== "all" ? selectedCompanyTab : "vodafone",
      title: "",
      code: "",
      note: ""
    });
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

  const handleDeleteCode = (item: TelecomCodeEntry) => {
    setCodeToDelete(item);
  };

  const confirmDeleteCode = async () => {
    if (!codeToDelete || !supabase) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase.from("telecom_codes").delete().eq("id", codeToDelete.id);
      if (error) throw error;
      setCodes(codes.filter(c => c.id !== codeToDelete.id));
      setCodeToDelete(null);
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isSubComponent && (authLoading || loading)) return <div style={{ paddingTop: "120px", textAlign: "center" }}>جاري التحميل...</div>;
  if (!isSubComponent && !isAdmin) return <div style={{ paddingTop: "120px", textAlign: "center", color: "#ff3b30" }}>عفواً، لا تملك صلاحية الوصول لهذه الصفحة.</div>;

  return (
    <div className={isSubComponent ? "" : "app-container"} style={isSubComponent ? { paddingBottom: "40px" } : { padding: "120px 10px", paddingTop: "60px", maxWidth: "100%", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        {!isSubComponent ? (
          <div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--textPrimary, #fff)", marginBottom: "6px" }}>
              دليل الهاتف والأكواد
            </h1>
            <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", margin: 0 }}>
              إضافة وتعديل وحذف أرقام الهواتف الخدمية وأكواد الاتصالات وتعديل بياناتها.
            </p>
          </div>
        ) : <div />}

        {activeTab === "phones" ? (
          <button
            className="btn"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none"
            }}
            onClick={() => {
              if (showAddForm) {
                handleCancelPhone();
              } else {
                setShowAddForm(true);
              }
            }}
          >
            {showAddForm ? (
              "إلغاء الإضافة"
            ) : (
              <>
                <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
                إضافة رقم جديد
              </>
            )}
          </button>
        ) : (
          <button
            className="btn"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none"
            }}
            onClick={() => {
              if (showAddCodeForm) {
                handleCancelCode();
              } else {
                setCodeFormData(prev => ({
                  ...prev,
                  company: selectedCompanyTab !== "all" ? selectedCompanyTab : prev.company || "vodafone"
                }));
                setShowAddCodeForm(true);
              }
            }}
          >
            {showAddCodeForm ? (
              "إلغاء الإضافة"
            ) : (
              <>
                <i className="bx bx-plus-circle" style={{ fontSize: "1.15rem", marginLeft: "6px" }} />
                إضافة كود جديد
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div style={{ display: "flex", gap: "12px", marginBottom: activeTab === "codes" ? "18px" : "30px", borderBottom: "1px solid var(--borderGlass)", paddingBottom: "12px" }}>
        <button
          onClick={() => { setActiveTab("phones"); setError(""); setSearchQuery(""); }}
          className={`category-pill ${activeTab === "phones" ? "active" : ""}`}
          style={{ fontFamily: "var(--font-heading)", padding: "5px 16px", color: "var(--text-ios)" }}
        >
          📞 أرقام الخدمات
        </button>
        <button
          onClick={() => { setActiveTab("codes"); setError(""); setSearchQuery(""); }}
          className={`category-pill ${activeTab === "codes" ? "active" : ""}`}
          style={{ fontFamily: "var(--font-heading)", padding: "5px 16px", color: "var(--text-ios)" }}
        >
          📱 أكواد الشركات
        </button>
      </div>

      {/* Sub-tabs for Telecom Companies (shown when activeTab === 'codes') */}
      {activeTab === "codes" && (
        <div style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "8px",
          marginBottom: "24px",
          alignItems: "center"
        }}>
          {/* All Companies */}
          <button
            type="button"
            onClick={() => setSelectedCompanyTab("all")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: "0.88rem",
              fontWeight: selectedCompanyTab === "all" ? "700" : "500",
              background: selectedCompanyTab === "all" ? "rgba(99, 102, 241, 0.16)" : "rgba(255, 255, 255, 0.03)",
              border: selectedCompanyTab === "all" ? "1px solid #6366f1" : "1px solid var(--borderGlass)",
              color: selectedCompanyTab === "all" ? "#818cf8" : "var(--textSecondary)",
              boxShadow: selectedCompanyTab === "all" ? "0 4px 14px rgba(99, 102, 241, 0.2)" : "none",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            <i className="bx bx-grid-alt" style={{ fontSize: "1.15rem" }} />
            <span>جميع الشركات</span>
            <span style={{
              fontSize: "0.75rem",
              padding: "2px 8px",
              borderRadius: "20px",
              background: selectedCompanyTab === "all" ? "#6366f1" : "rgba(255, 255, 255, 0.08)",
              color: selectedCompanyTab === "all" ? "#fff" : "var(--text-muted)",
              fontWeight: "700"
            }}>
              {codes.length}
            </span>
          </button>

          {/* Individual Companies */}
          {(Object.keys(COMPANY_META) as Array<keyof typeof COMPANY_META>).map(compKey => {
            const meta = COMPANY_META[compKey];
            const isSelected = selectedCompanyTab === compKey;
            const count = companyCounts[compKey] || 0;

            return (
              <button
                key={compKey}
                type="button"
                onClick={() => {
                  setSelectedCompanyTab(compKey);
                  if (showAddCodeForm && !editingCodeId) {
                    setCodeFormData(prev => ({ ...prev, company: compKey }));
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.88rem",
                  fontWeight: isSelected ? "700" : "500",
                  background: isSelected ? meta.activeBg : "rgba(255, 255, 255, 0.03)",
                  border: isSelected ? `1px solid ${meta.activeBorder}` : "1px solid var(--borderGlass)",
                  color: isSelected ? "var(--textPrimary)" : "var(--textSecondary)",
                  boxShadow: isSelected ? `0 4px 14px ${meta.activeBg}` : "none",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <img
                  src={meta.logo}
                  alt={meta.label}
                  style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "contain" }}
                />
                <span>{meta.label}</span>
                <span style={{
                  fontSize: "0.75rem",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  background: isSelected ? meta.badgeBg : "rgba(255, 255, 255, 0.08)",
                  color: isSelected ? meta.color : "var(--text-muted)",
                  fontWeight: "700"
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Box */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
          <input
            type="text"
            placeholder={
              activeTab === "phones"
                ? "البحث عن جهة خدمية باسمها، تخصصها، أو رقمها..."
                : selectedCompanyTab === "all"
                ? "البحث عن كود باسم الخدمة، القسم، الكود، أو الشركة..."
                : `البحث في أكواد ${COMPANY_META[selectedCompanyTab]?.label || "الشركة"} (الخدمة، القسم، الكود)...`
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-fields"
            style={{
              width: "100%",
              paddingRight: "44px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textSecondary)"
            }}
          />
          <i className="bx bx-search" style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted, #94a3b8)",
            fontSize: "1.2rem"
          }} />
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          {activeTab === "phones" ? (
            <>إجمالي الجهات: {searchQuery.trim() ? `${filteredEntries.length} من ${entries.length}` : entries.length}</>
          ) : selectedCompanyTab === "all" ? (
            <>إجمالي الأكواد: {searchQuery.trim() ? `${filteredCodes.length} من ${codes.length}` : codes.length}</>
          ) : (
            <>
              أكواد {COMPANY_META[selectedCompanyTab]?.label}: {searchQuery.trim() ? `${filteredCodes.length} من ${companyCounts[selectedCompanyTab] || 0}` : (companyCounts[selectedCompanyTab] || 0)}
            </>
          )}
        </div>
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
            <div className="ios-sheet" style={{ position: "sticky", maxWidth: "100%", padding: "20px", height: "auto", marginBottom: "40px", borderRadius: "15px", animation: "slide-in-section 0.4s ease" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: "600", marginBottom: "20px" }}>
                {editingPhoneId ? `تعديل جهة: ${formData.name}` : "إضافة جهة جديدة"}
              </h2>
              <form onSubmit={handleAddPhone} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <div>
                  <label className="help-label">الاسم (مثال: المصرية للاتصالات وي)</label>
                  <input required className="input-fields" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">التخصص</label>
                  <select
                    required
                    className="input-fields help-select"
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
                        className="input-fields"
                        style={{ marginTop: "12px" }}
                        placeholder="اكتب التخصص الجديد هنا..."
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                      />
                      <input
                        className="input-fields"
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
                  <input required className="input-fields" style={{ direction: "ltr", textAlign: "right" }} value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">رابط اللوجو (اختياري)</label>
                  <input className="input-fields" style={{ direction: "ltr", textAlign: "right" }} value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="help-label">الوصف (اختياري)</label>
                  <textarea className="input-fields" rows={2} style={{ resize: "vertical", padding: "10px 12px", height: "auto" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="اكتب وصفاً أو ملاحظات إضافية هنا..." />
                </div>
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: "100%", height: "50px", fontSize: "1.05rem" }}>
                    {isSubmitting ? "جاري الحفظ..." : editingPhoneId ? "تعديل الجهة" : "حفظ الجهة"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.tableCard}>
            <div className={styles.tableResponsive} style={{ width: "100%" }}>
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
                  ) : filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.adminTd} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        لا توجد نتائج تطابق بحثك.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className={styles.adminTr}>
                        <td className={styles.adminTd}>
                          {entry.logo_url ? (
                            <img src={entry.logo_url} alt="Logo" loading="lazy" decoding="async" style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>🏢</div>
                          )}
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700" }}>
                          <div>{entry.name}</div>
                          {entry.description && (
                            <div style={{ fontSize: "0.8rem", color: "var(--textSecondary)", fontWeight: "normal", marginTop: "4px" }}>
                              {entry.description}
                            </div>
                          )}
                        </td>
                        <td className={styles.adminTd} style={{ color: "var(--textPrimary)", fontWeight: "700" }}>
                          {entry.specialty}
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700", direction: "ltr", textAlign: "right", color: "var(--colorSecondary)", width: "20%" }}>{entry.phone_number}</td>
                        <td className={styles.adminTd} style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => startEditPhone(entry)}
                              className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                              title="تعديل"
                              style={{
                                padding: "5px 5px",
                                borderRadius: "50%",
                                background: "var(--bgSecondary)",
                              }}
                            >
                              <i className="bx bx-edit-alt" />
                            </button>
                            <button
                              onClick={() => handleDeletePhone(entry)}
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              title="حذف"
                              style={{
                                padding: "5px 5px",
                                borderRadius: "50%",
                                background: "#ff000025",
                                color: "#ff0000f5",
                                border: "#ff000025",
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
          </div>
        </>
      )}

      {/* ==================== CODES TAB ==================== */}
      {activeTab === "codes" && (
        <>
          {showAddCodeForm && (
            <div className="ios-sheet" style={{ position: "sticky", maxWidth: "100%", padding: "20px", height: "auto", marginBottom: "40px", borderRadius: "15px", animation: "slide-in-section 0.4s ease" }}>
              <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "20px" }}>
                {editingCodeId ? `تعديل كود خدمة: ${codeFormData.title}` : "إضافة كود خدمة جديد"}
              </h2>
              <form onSubmit={handleAddCode} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <div>
                  <label className="help-label">الشركة</label>
                  <select required className="input-fields help-select" value={codeFormData.company} onChange={e => setCodeFormData({ ...codeFormData, company: e.target.value })}>
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
                    className="input-fields help-select"
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
                        className="input-fields"
                        style={{ marginTop: "12px" }}
                        placeholder="اكتب اسم القسم الجديد هنا..."
                        value={customSection}
                        onChange={(e) => setCustomSection(e.target.value)}
                      />
                      <input
                        className="input-fields"
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
                  <input required className="input-fields" value={codeFormData.title} placeholder="مثال: الاستعلام عن الرصيد" onChange={e => setCodeFormData({ ...codeFormData, title: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">الكود الرقمي (مثال: *858#)</label>
                  <input required className="input-fields" style={{ direction: "ltr", textAlign: "right" }} value={codeFormData.code} placeholder="*858#" onChange={e => setCodeFormData({ ...codeFormData, code: e.target.value })} />
                </div>
                <div>
                  <label className="help-label">ملاحظة / تنبيه للمستخدم (اختياري)</label>
                  <input className="input-fields" value={codeFormData.note} placeholder="مثال: ضع كود الشحن بعد النجمة" onChange={e => setCodeFormData({ ...codeFormData, note: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: "100%", height: "50px", fontSize: "1.05rem" }}>
                    {isSubmitting ? "جاري الحفظ..." : editingCodeId ? "تعديل الكود" : "حفظ الكود"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.tableCard}>
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
                  ) : filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.adminTd} style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
                        {searchQuery.trim() ? (
                          "لا توجد نتائج تطابق بحثك."
                        ) : (
                          <div>
                            <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📱</div>
                            <div style={{ fontWeight: "700", fontSize: "1rem", color: "var(--textPrimary)", marginBottom: "6px" }}>
                              لا توجد أكواد مسجلة لشركة {COMPANY_LABELS[selectedCompanyTab] || "المحددة"} حالياً
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 16px" }}>
                              يمكنك البدء بإضافة أكواد وخدمات لهذه الشركة الآن.
                            </p>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => {
                                setCodeFormData({
                                  company: selectedCompanyTab,
                                  title: "",
                                  code: "",
                                  note: ""
                                });
                                setSectionSelect("");
                                setCustomSection("");
                                setCustomSectionIcon("");
                                setShowAddCodeForm(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                color: "#fff",
                                padding: "8px 18px",
                                borderRadius: "10px",
                                fontSize: "0.88rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              <i className="bx bx-plus" />
                              إضافة أول كود لـ {COMPANY_LABELS[selectedCompanyTab]}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((item) => (
                      <tr key={item.id} className={styles.adminTr}>
                        <td className={styles.adminTd} style={{ fontWeight: "700" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "0.82rem",
                              fontWeight: "700",
                              background: COMPANY_META[item.company]?.activeBg || "rgba(255, 255, 255, 0.05)",
                              border: `1px solid ${COMPANY_META[item.company]?.activeBorder || "var(--borderGlass)"}`,
                              color: COMPANY_META[item.company]?.color || "var(--textPrimary)",
                            }}
                          >
                            {COMPANY_META[item.company]?.logo && (
                              <img
                                src={COMPANY_META[item.company].logo}
                                alt={COMPANY_META[item.company].label}
                                style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "contain" }}
                              />
                            )}
                            {COMPANY_LABELS[item.company] || item.company}
                          </span>
                        </td>
                        <td className={styles.adminTd} style={{ color: "var(--textPrimary)", fontWeight: "700" }}>
                          {item.icon && <i className={formatBoxIcon(item.icon)} style={{ marginLeft: "8px", fontSize: "1.1rem", verticalAlign: "middle", color: "#818cf8" }}></i>}
                          {item.section_name}
                        </td>
                        <td className={styles.adminTd} style={{ fontWeight: "700" }}>{item.title}</td>
                        <td className={styles.adminTd} style={{ fontWeight: "700", direction: "ltr", textAlign: "right", color: "var(--colorSecondary)", fontSize: ".9rem" }}>
                          {item.code.split(" | ")[0]}
                          {item.code.split(" | ")[1] && (
                            <div style={{ fontSize: "0.8rem", color: "#94a3b8", direction: "rtl", textAlign: "right", marginTop: "4px" }}>
                              ({item.code.split(" | ")[1]})
                            </div>
                          )}
                        </td>
                        <td className={styles.adminTd} style={{ paddingRight: "0" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => startEditCode(item)}
                              className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                              title="تعديل"
                              style={{
                                padding: "5px 5px",
                                borderRadius: "50%",
                                background: "var(--bgSecondary)",
                              }}
                            >
                              <i className="bx bx-edit-alt" />
                            </button>
                            <button
                              onClick={() => handleDeleteCode(item)}
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              title="حذف"
                              style={{
                                padding: "5px 5px",
                                borderRadius: "50%",
                                background: "#ff000025",
                                color: "#ff0000f5",
                                border: "#ff000025",
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
          </div>
        </>
      )}

      {/* Custom Delete Confirmation Modal for Phones */}
      <CustomModal
        isOpen={Boolean(phoneToDelete)}
        onClose={() => !isDeleting && setPhoneToDelete(null)}
        title="تأكيد الحذف"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message="هل أنت متأكد من حذف هذا الرقم؟"
        primaryButton={{
          label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
          onClick: confirmDeletePhone,
          bgColor: "#ff3b30",
          disabled: isDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setPhoneToDelete(null),
          bgColor: "var(--cancelBtn)",
          disabled: isDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        {phoneToDelete && (
          <p style={{ margin: "0", color: "#ff4d4d", fontSize: "1.05rem", fontWeight: "bold", textAlign: "center" }}>
            « {phoneToDelete.name} »
          </p>
        )}
      </CustomModal>

      {/* Custom Delete Confirmation Modal for Codes */}
      <CustomModal
        isOpen={Boolean(codeToDelete)}
        onClose={() => !isDeleting && setCodeToDelete(null)}
        title="تأكيد الحذف"
        titleColor="#ff3b30"
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        message="هل أنت متأكد من حذف هذا الكود؟"
        primaryButton={{
          label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
          onClick: confirmDeleteCode,
          bgColor: "#ff3b30",
          disabled: isDeleting,
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setCodeToDelete(null),
          bgColor: "var(--cancelBtn)",
          disabled: isDeleting,
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
        }}
      >
        {codeToDelete && (
          <p style={{ margin: "0", color: "#ff4d4d", fontSize: "1.05rem", fontWeight: "bold", textAlign: "center" }}>
            « {codeToDelete.title} »
          </p>
        )}
      </CustomModal>
    </div>
  );
}

