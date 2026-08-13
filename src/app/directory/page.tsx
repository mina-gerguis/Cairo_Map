"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatBoxIcon } from "@/data/places";

interface PhoneEntry {
  id: string;
  name: string;
  specialty: string;
  phone_number: string;
  logo_url?: string;
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

const COMPANY_META: Record<string, { label: string; logo: string; color: string; border: string }> = {
  vodafone: { label: "فودافون", logo: "/images/telCompany/vodafone.png", color: "rgba(224, 0, 0, 0.08)", border: "rgba(224, 0, 0, 0.2)" },
  orange: { label: "اورنج", logo: "/images/telCompany/orange.png", color: "rgba(255, 102, 0, 0.08)", border: "rgba(255, 102, 0, 0.2)" },
  etisalat: { label: "اتصالات", logo: "/images/telCompany/etisalat.png", color: "rgba(0, 150, 0, 0.08)", border: "rgba(0, 150, 0, 0.2)" },
  we: { label: "وي", logo: "/images/telCompany/we.png", color: "rgba(108, 99, 255, 0.08)", border: "rgba(108, 99, 255, 0.2)" },
};

export default function PhoneDirectoryPage() {
  const [entries, setEntries] = useState<PhoneEntry[]>([]);
  const [codes, setCodes] = useState<TelecomCodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // New Directory UI States
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Public Telecom Codes UI State
  const [activeCompany, setActiveCompany] = useState<string>("vodafone");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load recent searches
    const saved = localStorage.getItem("recent_phone_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        // Fetch directory phones
        const { data: phonesData } = await supabase
          .from("phone_directory")
          .select("*")
          .order("name", { ascending: true });
        if (phonesData) setEntries(phonesData);

        // Fetch telecom codes
        const { data: codesData } = await supabase
          .from("telecom_codes")
          .select("*");
        if (codesData) setCodes(codesData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Reset pagination limit when search query or category tab changes
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedSpecialty]);

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ـ/g, "").toLowerCase();
  };

  const handleSaveSearch = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 6);
      localStorage.setItem("recent_phone_searches", JSON.stringify(updated));
      return updated;
    });
  };

  // Dynamically extract unique specialties
  const specialties = React.useMemo(() => {
    const specs = entries.map((e) => e.specialty?.trim()).filter(Boolean);
    return Array.from(new Set(specs));
  }, [entries]);

  // Extract Boxicon maps for specialties
  const specialtyIcons = React.useMemo(() => {
    const map: Record<string, string> = {};
    entries.forEach((e) => {
      if (e.specialty && e.icon && !map[e.specialty]) {
        map[e.specialty] = e.icon;
      }
    });
    return map;
  }, [entries]);

  // Extract Boxicon maps for telecom sections
  const sectionIcons = React.useMemo(() => {
    const map: Record<string, string> = {};
    codes.forEach((c) => {
      if (c.section_name && c.icon && !map[c.section_name]) {
        map[c.section_name] = c.icon;
      }
    });
    return map;
  }, [codes]);

  // Combined filtering logic
  const filteredEntries = React.useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());

    // 1. Specialty Filter
    let result = entries;
    if (selectedSpecialty !== "all") {
      if (selectedSpecialty === "other") {
        result = entries.filter((e) => !e.specialty || e.specialty.trim() === "");
      } else {
        result = entries.filter((e) => e.specialty === selectedSpecialty);
      }
    }

    // 2. Search Query Filter
    if (q) {
      result = result.filter((entry) => {
        const searchable = normalizeArabic(`${entry.name} ${entry.specialty || ""} ${entry.phone_number} ${entry.description || ""}`);
        return searchable.includes(q);
      });
    }

    return result;
  }, [entries, searchQuery, selectedSpecialty]);

  // Paginated elements
  const slicedEntries = React.useMemo(() => {
    return filteredEntries.slice(0, visibleCount);
  }, [filteredEntries, visibleCount]);

  // Filter codes for the active company
  const activeCompanyCodes = codes.filter((c) => c.company === activeCompany);

  // Group codes by section_name
  const groupedCodes: Record<string, TelecomCodeEntry[]> = {};
  activeCompanyCodes.forEach((code) => {
    if (!groupedCodes[code.section_name]) {
      groupedCodes[code.section_name] = [];
    }
    groupedCodes[code.section_name].push(code);
  });

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const getDialUrl = (code: string) => {
    return `tel:${code.replace(/#/g, "%23")}`;
  };

  const handleCopyCode = (code: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedId(id);
        // Open the dialer app and pre-fill the code
        window.location.href = getDialUrl(code);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      }).catch((err) => {
        console.error("Failed to copy code: ", err);
        // Fallback: still open the dialer even if copy fails
        window.location.href = getDialUrl(code);
      });
    } else {
      // Fallback for environments where clipboard API is not available
      window.location.href = getDialUrl(code);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)" }}>
      {/* Header Banner - Redesigned with a beautiful cover image matching Metro */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bg-primary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
      }}>
        {/* Cover Image Banner */}
        

        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "600",
            color: "var(--text-primary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>دليل الهاتف والخدمات</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            أرقام الطوارئ، شركات الاتصالات، وخدمات العملاء في مكان واحد.
          </p>

          {/* Directory Sections badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--accent-ios)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>☎️ أرقام خدمة العملاء</span>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--accent-success)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>📶 أكواد الشبكات</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

        {/* Search Panel Card - Styled matching Metro searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--accent-ios)" }}></i> ابحث في الدليل (الاسم، الرقم أو التخصص)
            </label>
            <input
              className="ios-input"
              type="text"
              placeholder="ابحث بالاسم، الرقم، أو التخصص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveSearch(searchQuery);
                }
              }}
              style={{
                width: "100%",
                direction: "rtl",
                fontFamily: "var(--font-cairo)",
                height: "50px",
              }}
            />
          </div>

          {/* Recent Searches Row */}
          {recentSearches.length > 0 && (
            <div style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
              animation: "slide-in-section 0.3s ease"
            }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>آخر عمليات البحث:</span>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSaveSearch(term);
                  }}
                  className="category-pill"
                  style={{ fontSize: "0.75rem", padding: "4px 12px", border: "1px solid var(--border-glass)" }}
                >
                  🔍 {term}
                </button>
              ))}
              <button
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem("recent_phone_searches");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent-danger)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
              >
                مسح 🗑️
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text-secondary)" }}>
            <span style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "10px" }}>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            {/* ==================== PHONES SECTION ==================== */}
            <div style={{ marginTop: "32px" }}>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.25rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <i style={{ color: "var(--accent-ios)" }} className="fa-solid fa-building"></i>
                أرقام خدمة العملاء والطوارئ
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.88rem" }}>
                كل أرقام الطوارئ والخدمات في مكان واحد
              </p>

              {/* Dynamic Categories Tabs */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px" }}>
                <button
                  onClick={() => setSelectedSpecialty("all")}
                  style={{
                    background: selectedSpecialty === "all" ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
                    border: `1px solid ${selectedSpecialty === "all" ? "var(--accent-ios)" : "var(--border-glass)"}`,
                    color: selectedSpecialty === "all" ? "var(--text-primary)" : "var(--text-secondary)",
                    padding: "8px 16px",
                    borderRadius: "50px",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "var(--font-cairo)",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease"
                  }}
                >
                  🌐 الكل
                </button>
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    style={{
                      background: selectedSpecialty === spec ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
                      border: `1px solid ${selectedSpecialty === spec ? "var(--accent-ios)" : "var(--border-glass)"}`,
                      color: selectedSpecialty === spec ? "var(--text-primary)" : "var(--text-secondary)",
                      padding: "8px 16px",
                      borderRadius: "50px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <i className={formatBoxIcon(specialtyIcons[spec] || 'bx-building')} style={{ fontSize: "1rem" }}></i>
                    {spec}
                  </button>
                ))}
                {entries.some((e) => !e.specialty || e.specialty.trim() === "") && (
                  <button
                    onClick={() => setSelectedSpecialty("other")}
                    style={{
                      background: selectedSpecialty === "other" ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
                      border: `1px solid ${selectedSpecialty === "other" ? "var(--accent-ios)" : "var(--border-glass)"}`,
                      color: selectedSpecialty === "other" ? "var(--text-primary)" : "var(--text-secondary)",
                      padding: "8px 16px",
                      borderRadius: "50px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    📦 أخرى
                  </button>
                )}
              </div>

              {/* Stack of phones */}
              {slicedEntries.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "15px"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}><i className="fa-solid fa-circle-notch"></i></div>
                  <p>لا توجد أرقام مطابقة لبحثك في هذا التبويب</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {slicedEntries.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "15px",
                          padding: "16px",
                          boxShadow: "var(--shadow-card)",
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        {entry.logo_url ? (
                          <img src={entry.logo_url} alt={entry.name} style={{ width: "50px", height: "50px", borderRadius: "10px", objectFit: "cover", backgroundColor: "#fff", border: "1px solid var(--border-glass)" }} />
                        ) : (
                          <div style={{ width: "50px", height: "50px", borderRadius: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                            🏢
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                          <h3 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>{entry.name}</h3>

                          {entry.description && (
                            <p style={{ margin: "0 0 10px", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", fontFamily: "var(--font-body)" }}>
                              {entry.description}
                            </p>
                          )}
                          <a href={getDialUrl(entry.phone_number)} style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-success)",
                            padding: "6px 14px", borderRadius: "20px", textDecoration: "none",
                            fontWeight: "800", fontSize: "0.85rem", width: "fit-content"
                          }}>
                            {entry.phone_number} 
                            <i className="bx bx-phone" style={{ fontSize: "1rem" }} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {filteredEntries.length > visibleCount && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 10)}
                        style={{
                          width: "auto",
                          padding: "10px 24px",
                          borderRadius: "20px",
                          background: "var(--accent-ios)",
                          color: "#ffffff",
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-cairo)",
                          transition: "opacity 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        🔄 عرض المزيد (+10)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <hr style={{ border: "none", height: "1px", background: "var(--border-glass)", margin: "32px 0" }} />

            {/* ==================== TELECOM CODES SECTION ==================== */}
            <div>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.25rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <i className="fa-solid fa-phone-volume" style={{ color: "var(--accent-ios)" }}></i>
                دليل أكواد شركات الاتصالات
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.88rem" }}>
                دليلك الشامل لجميع أكواد شركات المحمول في مصر.
              </p>

              {/* Company Tabs */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px" }}>
                {Object.entries(COMPANY_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCompany(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: activeCompany === key ? "rgba(59, 130, 246, 0.15)" : "var(--bg-secondary)",
                      border: activeCompany === key ? `1px solid ${meta.border}` : "1px solid var(--border-glass)",
                      color: activeCompany === key ? "var(--text-primary)" : "var(--text-secondary)",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Image src={meta.logo} alt={meta.label} width={18} height={18} style={{ borderRadius: "50%" }} />
                    {meta.label}
                  </button>
                ))}
              </div>

              {/* Accordions */}
              {Object.keys(groupedCodes).length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "15px",
                  border: "1px solid var(--border-glass)"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}><i className="fa-solid fa-circle-notch"></i></div>
                  <p>لا توجد أكواد مضافة لهذه الشركة بعد</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    تعمل الإدارة على تحديث البيانات وإضافة الأكواد قريباً.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {Object.entries(groupedCodes).map(([sectionName, codeList]) => {
                    const isExpanded = !!expandedSections[sectionName];
                    return (
                      <div
                        key={sectionName}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "15px",
                          overflow: "hidden",
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        {/* Header of Accordion */}
                        <div
                          onClick={() => toggleSection(sectionName)}
                          style={{
                            padding: "16px 20px",
                            background: "var(--bg-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            userSelect: "none",
                          }}
                        >
                          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={formatBoxIcon(sectionIcons[sectionName] || 'bx-folder')} style={{ fontSize: "1.1rem", color: "var(--accent-ios)" }}></i>
                            {sectionName}
                          </h3>
                          <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
                            {isExpanded ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}
                          </span>
                        </div>

                        {/* List of Codes inside Accordion */}
                        {isExpanded && (
                          <div style={{ padding: "12px 20px", background: "var(--bg-primary)", borderTop: "1px solid var(--border-glass)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                               {codeList.map((item) => {
                                const codeParts = item.code.split(" | ");
                                const displayCode = codeParts[0];
                                const displayNote = codeParts[1];

                                const placeholderMatch = displayCode.match(/\[(.*?)\]/);
                                const placeholder = placeholderMatch ? placeholderMatch[1] : null;

                                const userVal = codeInputs[item.id] || "";
                                const finalCode = userVal 
                                  ? displayCode.replace(/\[.*?\]/, userVal) 
                                  : displayCode;

                                return (
                                  <div
                                    key={item.id}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                      padding: "12px 0",
                                      borderBottom: "1px solid var(--border-glass)",
                                      width: "100%"
                                    }}
                                  >
                                    <div style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                      gap: "12px",
                                      width: "100%"
                                    }}>
                                      <div>
                                        <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.88rem" }}>
                                          {item.title}
                                        </div>
                                        <div style={{ fontSize: "1rem", color: "var(--accent-ios)", marginTop: "4px", direction: "ltr", textAlign: "right", fontWeight: "700" }}>
                                          {finalCode}
                                        </div>
                                      </div>

                                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <button
                                          onClick={() => handleCopyCode(finalCode, item.id)}
                                          style={{
                                            background: copiedId === item.id ? "rgba(16, 185, 129, 0.15)" : "var(--bg-secondary)",
                                            border: copiedId === item.id ? "1px solid var(--accent-success)" : "1px solid var(--border-glass)",
                                            color: copiedId === item.id ? "var(--accent-success)" : "var(--text-primary)",
                                            padding: "8px 16px",
                                            borderRadius: "20px",
                                            fontSize: "0.85rem",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            transition: "all 0.2s ease"
                                          }}
                                          title="نسخ الكود"
                                        >
                                          <i className={copiedId === item.id ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                                        </button>

                                        <a
                                          href={getDialUrl(finalCode)}
                                          style={{
                                            background: "var(--accent-ios)",
                                            color: "#fff",
                                            padding: "8px 16px",
                                            borderRadius: "20px",
                                            fontSize: "0.85rem",
                                            fontWeight: "800",
                                            textDecoration: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px"
                                          }}
                                        >
                                          <i className="fa-solid fa-phone"></i>
                                        </a>
                                      </div>
                                    </div>

                                    {/* Placeholder Input Field */}
                                    {placeholder && (
                                      <div style={{ marginTop: "4px", width: "100%" }}>
                                        <input
                                          type="text"
                                          className="ios-input"
                                          placeholder={`أدخل ${placeholder} هنا...`}
                                          value={codeInputs[item.id] || ""}
                                          onChange={(e) => setCodeInputs({ ...codeInputs, [item.id]: e.target.value })}
                                          style={{
                                            height: "36px",
                                            fontSize: "0.85rem",
                                            borderRadius: "8px",
                                            background: "var(--bg-secondary)",
                                            border: "1px solid var(--border-glass)",
                                            padding: "0 12px",
                                            width: "100%",
                                            fontFamily: "var(--font-cairo)"
                                          }}
                                        />
                                      </div>
                                    )}

                                    {/* Helper Note Bubble */}
                                    {displayNote && (
                                      <div style={{
                                        marginTop: "0px",
                                        padding: "0px 0px",
                                        fontSize: "0.78rem",
                                        color: "var(--text-secondary)",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        width: "100%"
                                      }}>
                                        <i className="bx bx-info-circle" style={{ fontSize: "0.9rem" }} />
                                        <span>{displayNote}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
