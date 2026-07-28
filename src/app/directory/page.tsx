"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface PhoneEntry {
  id: string;
  name: string;
  specialty: string;
  phone_number: string;
  logo_url?: string;
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

const COMPANY_META: Record<string, { label: string; logo: string; color: string; border: string }> = {
  vodafone: { label: "فودافون", logo: "/image/telCompany/vodafone-logo.png", color: "rgba(224, 0, 0, 0.08)", border: "rgba(224, 0, 0, 0.2)" },
  orange: { label: "اورنج", logo: "/image/telCompany/orange-logo.png", color: "rgba(255, 102, 0, 0.08)", border: "rgba(255, 102, 0, 0.2)" },
  etisalat: { label: "اتصالات", logo: "/image/telCompany/etisalat-logo.png", color: "rgba(0, 150, 0, 0.08)", border: "rgba(0, 150, 0, 0.2)" },
  we: { label: "وي", logo: "/image/telCompany/we-logo.png", color: "rgba(108, 99, 255, 0.08)", border: "rgba(108, 99, 255, 0.2)" },
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
        const searchable = normalizeArabic(`${entry.name} ${entry.specialty || ""} ${entry.phone_number}`);
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

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "120px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0b0f19 0%, #151c2c 100%)",
        padding: "80px 20px 50px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>☎️</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: "800", color: "#fff", margin: "0 0 10px" }}>
          دليل الهاتف والخدمات
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          أرقام الشركات وخدمات العملاء وأكواد شبكات الاتصالات
        </p>

        {/* Search Input */}
        <div style={{ maxWidth: "500px", margin: "30px auto 0", position: "relative" }}>
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
            style={{ paddingRight: "40px", height: "50px", fontSize: "1rem", borderRadius: "25px" }}
          />
          <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            🔍
          </div>
        </div>

        {/* Recent Searches Row */}
        {recentSearches.length > 0 && (
          <div style={{
            marginTop: "16px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            animation: "slide-in-section 0.3s ease"
          }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>آخر عمليات البحث:</span>
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(term);
                  handleSaveSearch(term);
                }}
                className="category-pill"
                style={{ fontSize: "0.8rem", padding: "4px 12px", border: "1px solid var(--border-glass)" }}
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
                fontSize: "0.8rem",
                cursor: "pointer",
                padding: "4px 8px"
              }}
            >
              مسح السجل 🗑️
            </button>
          </div>
        )}
      </div>

      <div className="app-container" style={{ paddingTop: "40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text-secondary)" }}>
            <span style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "10px" }}>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            {/* ==================== PHONES SECTION ==================== */}
            <div style={{ marginBottom: "50px" }}>
              <h2 className="section-title" style={{ marginBottom: "16px" }}>📞 أرقام خدمة العملاء والطوارئ</h2>

              {/* Dynamic Categories Tabs */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "24px" }}>
                <button
                  onClick={() => setSelectedSpecialty("all")}
                  className={`category-pill ${selectedSpecialty === "all" ? "active" : ""}`}
                  style={{ background: selectedSpecialty === "all" ? "" : "var(--bg-secondary)", border: "1px solid var(--border-glass)" }}
                >
                  🌐 الكل
                </button>
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`category-pill ${selectedSpecialty === spec ? "active" : ""}`}
                    style={{ background: selectedSpecialty === spec ? "" : "var(--bg-secondary)", border: "1px solid var(--border-glass)", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <i className={`bx ${specialtyIcons[spec] || 'bx-building'}`} style={{ fontSize: "1.05rem" }}></i>
                    {spec}
                  </button>
                ))}
                {entries.some((e) => !e.specialty || e.specialty.trim() === "") && (
                  <button
                    onClick={() => setSelectedSpecialty("other")}
                    className={`category-pill ${selectedSpecialty === "other" ? "active" : ""}`}
                    style={{ background: selectedSpecialty === "other" ? "" : "var(--bg-secondary)", border: "1px solid var(--border-glass)" }}
                  >
                    📦 أخرى
                  </button>
                )}
              </div>

              {/* Grid of phones */}
              {slicedEntries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>😕</div>
                  <p>لا توجد أرقام مطابقة لبحثك في هذا التبويب</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {slicedEntries.map((entry) => (
                      <div key={entry.id} className="glass-panel" style={{ borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", transition: "transform 0.2s" }}>
                        {entry.logo_url ? (
                          <img src={entry.logo_url} alt={entry.name} style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover", backgroundColor: "#fff" }} />
                        ) : (
                          <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: "rgba(108,99,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                            🏢
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "var(--text-primary)" }}>{entry.name}</h3>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                            {entry.icon && <i className={`bx ${entry.icon}`} style={{ fontSize: "0.95rem" }}></i>}
                            {entry.specialty || "غير مصنف"}
                          </div>
                          <a href={getDialUrl(entry.phone_number)} style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            background: "rgba(52,199,89,0.1)", color: "#10b981",
                            padding: "6px 12px", borderRadius: "20px", textDecoration: "none",
                            fontWeight: "800", fontSize: "0.95rem"
                          }}>
                            📞 {entry.phone_number}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {filteredEntries.length > visibleCount && (
                    <div style={{ textAlign: "center", marginTop: "30px" }}>
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 10)}
                        className="ios-btn ios-btn-primary"
                        style={{ width: "auto", padding: "12px 30px", borderRadius: "25px" }}
                      >
                        🔄 عرض المزيد (+10)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <hr style={{ border: "none", height: "1px", background: "var(--border-glass)", margin: "40px 0" }} />

            {/* ==================== TELECOM CODES SECTION ==================== */}
            <div>
              <h2 className="section-title" style={{ marginBottom: "10px" }}>📱 دليل أكواد شركات الاتصالات</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.95rem" }}>
                ابحث عن الكود واطلبه مباشرة بضغطة زر
              </p>

              {/* Company Tabs */}
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px", marginBottom: "30px" }}>
                {Object.entries(COMPANY_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCompany(key)}
                    className={`category-pill ${activeCompany === key ? "active" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: activeCompany === key ? "" : "var(--bg-secondary)",
                      border: activeCompany === key ? `1px solid ${meta.border}` : "1px solid var(--border-glass)",
                      padding: "10px 20px",
                      fontFamily: "Cairo",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}
                  >
                   

                    <Image src={meta.logo} alt={meta.label} width={50} height={50} style={{ borderRadius: "50%"}} />
                    {meta.label}
                  </button>
                ))}
              </div>

              {/* Accordions */}
              {Object.keys(groupedCodes).length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", background: "var(--bg-secondary)", borderRadius: "16px" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📱</div>
                  <p>لا توجد أكواد مضافة لهذه الشركة بعد</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {Object.entries(groupedCodes).map(([sectionName, codeList]) => {
                    const isExpanded = !!expandedSections[sectionName];
                    return (
                      <div key={sectionName} className="glass-panel" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                        {/* Header of Accordion */}
                        <div
                          onClick={() => toggleSection(sectionName)}
                          style={{
                            padding: "18px 24px",
                            background: "var(--bg-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            userSelect: "none"
                          }}
                        >
                          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={`bx ${sectionIcons[sectionName] || 'bx-folder'}`} style={{ fontSize: "1.2rem" }}></i>
                            {sectionName}
                          </h3>
                          <span style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>
                            {isExpanded ? "🔼" : "🔽"}
                          </span>
                        </div>

                        {/* List / Table of Codes inside Accordion */}
                        {isExpanded && (
                          <div style={{ padding: "16px 24px", background: "rgba(0,0,0,0.05)", borderTop: "1px solid var(--border-glass)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {codeList.map((item) => (
                                <div
                                  key={item.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 0",
                                    borderBottom: "1px solid var(--border-glass)",
                                    flexWrap: "wrap",
                                    gap: "12px"
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                                      {item.title}
                                    </div>
                                    <div style={{ fontSize: "1.1rem", fontFamily: "monospace", color: "var(--accent-primary)", marginTop: "4px", direction: "ltr", textAlign: "right" }}>
                                      {item.code}
                                    </div>
                                  </div>

                                  <a
                                    href={getDialUrl(item.code)}
                                    style={{
                                      background: "var(--accent-primary)",
                                      color: "#fff",
                                      padding: "8px 18px",
                                      borderRadius: "20px",
                                      fontSize: "0.9rem",
                                      fontWeight: "800",
                                      textDecoration: "none",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px"
                                    }}
                                  >
                                    📞 اطلب الآن
                                  </a>
                                </div>
                              ))}
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
