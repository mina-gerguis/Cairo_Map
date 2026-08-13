"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";

interface WorkerEntry {
  id: string;
  specialty: string;
  experience_years: number;
  age: number;
  bio: string;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_available: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    phone: string;
    governorate: string;
    city: string;
  };
}

export default function ServicesPage() {
  const { user, logout } = useAuth();
  const [workers, setWorkers] = useState<WorkerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [sortBy, setSortBy] = useState("rating"); // rating, experience, new

  useEffect(() => {
    async function fetchWorkers() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("service_workers")
          .select(`
            *,
            profiles:id (
              full_name,
              avatar_url,
              phone,
              governorate,
              city
            )
          `);

        if (error) {
          console.error("Error fetching workers:", error);
        } else if (data) {
          setWorkers(data as any[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkers();
  }, []);

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ـ/g, "")
      .toLowerCase();
  };

  // Get unique specialties from loaded workers
  const uniqueSpecialties = React.useMemo(() => {
    const list = workers.map(w => w.specialty.trim()).filter(Boolean);
    return Array.from(new Set(list));
  }, [workers]);

  // Cities based on selected governorate
  const cities = selectedGov ? egyptLocations[selectedGov] || [] : [];

  // Filter & Sort logic
  const filteredWorkers = React.useMemo(() => {
    let result = [...workers];

    // 1. Search Query (Name, Specialty, Bio)
    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery.trim());
      result = result.filter(w => {
        const name = normalizeArabic(w.profiles?.full_name || "");
        const spec = normalizeArabic(w.specialty || "");
        const bio = normalizeArabic(w.bio || "");
        return name.includes(q) || spec.includes(q) || bio.includes(q);
      });
    }

    // 2. Governorate Filter
    if (selectedGov) {
      result = result.filter(w => w.profiles?.governorate === selectedGov);
    }

    // 3. City Filter
    if (selectedCity) {
      result = result.filter(w => w.profiles?.city === selectedCity);
    }

    // 4. Specialty Filter
    if (selectedSpecialty) {
      result = result.filter(w => w.specialty === selectedSpecialty);
    }

    // 5. Sorting
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating_avg - a.rating_avg);
    } else if (sortBy === "experience") {
      result.sort((a, b) => b.experience_years - a.experience_years);
    } else if (sortBy === "new") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [workers, searchQuery, selectedGov, selectedCity, selectedSpecialty, sortBy]);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>
      
      {/* Banner / Cover */}
      <div style={{
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(16, 185, 129, 0.95))",
        color: "#ffffff",
        padding: "48px 20px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px"
      }}>
        <h1 style={{
          fontFamily: "var(--font-almarai)",
          fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
          fontWeight: "800",
          margin: 0,
          letterSpacing: "-0.5px"
        }}>
          دليل مقدمي الخدمات والصيانة
        </h1>
        <p style={{ fontSize: "1rem", opacity: 0.9, maxWidth: "600px", lineHeight: "1.6", margin: "0 auto" }}>
          ابحث عن أفضل الفنيين والحرفيين في منطقتك. استعرض ملفاتهم الشخصية، تقييماتهم، وتواصل معهم مباشرة.
        </p>

        {/* Action Header Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {user ? (
            <>
              <Link href="/services/dashboard" style={{
                background: "#ffffff", color: "var(--accent-ios, #3b82f6)",
                padding: "8px 20px", borderRadius: "30px", textDecoration: "none",
                fontWeight: "700", fontSize: "0.85rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}>
                💻 لوحة التحكم الخاصة بك
              </Link>
              <button onClick={() => logout()} style={{
                background: "rgba(255,255,255,0.18)", color: "#ffffff",
                padding: "8px 20px", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.3)",
                fontWeight: "700", fontSize: "0.85rem", cursor: "pointer"
              }}>
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link href="/services/auth/login" style={{
                background: "#ffffff", color: "var(--accent-ios, #3b82f6)",
                padding: "8px 20px", borderRadius: "30px", textDecoration: "none",
                fontWeight: "700", fontSize: "0.85rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}>
                🔑 تسجيل الدخول
              </Link>
              <Link href="/services/auth/signup" style={{
                background: "rgba(255,255,255,0.18)", color: "#ffffff",
                padding: "8px 20px", borderRadius: "30px", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.3)", fontWeight: "700", fontSize: "0.85rem"
              }}>
                🛠️ انضم كـ مقدم خدمة
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Search and Filters Card */}
        <div style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "24px",
          marginTop: "-24px",
          boxShadow: "var(--shadow-card)",
          zIndex: 10,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {/* Main search input */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="ابحث بالاسم، التخصص، أو مهارات معينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ios-input"
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                borderRadius: "10px",
                fontSize: "0.92rem",
                fontFamily: "var(--font-almarai)",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)"
              }}
            />
          </div>

          {/* Advanced filters dropdowns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            
            {/* Specialty filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>التخصص</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                style={{ height: "40px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
              >
                <option value="">كل التخصصات</option>
                {uniqueSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Governorate filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>المحافظة</label>
              <select
                value={selectedGov}
                onChange={(e) => {
                  setSelectedGov(e.target.value);
                  setSelectedCity("");
                }}
                style={{ height: "40px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
              >
                <option value="">كل المحافظات</option>
                {governoratesList.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* City filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>المدينة / المنطقة</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedGov}
                style={{ height: "40px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
              >
                <option value="">كل المدن</option>
                {cities.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Sort filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>ترتيب حسب</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: "40px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", fontFamily: "var(--font-almarai)", color: "var(--text-primary)" }}
              >
                <option value="rating">التقييم الأعلى</option>
                <option value="experience">الأكثر خبرة</option>
                <option value="new">المنضمين حديثاً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workers Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
            <span style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", fontFamily: "var(--font-almarai)" }}>جاري تحميل مقدمي الخدمات...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            marginTop: "30px"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontWeight: "700", margin: "0 0 8px", color: "var(--text-primary)" }}>لم نجد أي مقدم خدمة مطابق لبحثك</h3>
            <p style={{ fontSize: "0.9rem" }}>يرجى تعديل الفلاتر أو إعادة البحث بكلمات مختلفة.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
            marginTop: "30px"
          }}>
            {filteredWorkers.map(worker => (
              <div
                key={worker.id}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  position: "relative"
                }}
                className="worker-card-hover"
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
              >
                {/* Available status indicator badge */}
                <div style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  padding: "4px 8px",
                  borderRadius: "20px",
                  background: worker.is_available ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  color: worker.is_available ? "var(--accent-success, #10b981)" : "var(--accent-danger, #ef4444)",
                  border: `1px solid ${worker.is_available ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: worker.is_available ? "#10b981" : "#ef4444" }} />
                  {worker.is_available ? "متاح" : "مشغول"}
                </div>

                <div>
                  {/* Top section: Avatar and Name */}
                  <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
                    {worker.profiles?.avatar_url ? (
                      <img
                        src={worker.profiles.avatar_url}
                        alt={worker.profiles.full_name}
                        style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-glass)" }}
                      />
                    ) : (
                      <div style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        fontWeight: "700"
                      }}>
                        {worker.profiles?.full_name ? worker.profiles.full_name.charAt(0) : "🛠️"}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        {worker.profiles?.full_name}
                        {worker.is_verified && (
                          <span title="مقدم خدمة موثق" style={{ color: "var(--accent-ios, #3b82f6)", fontSize: "1rem" }}>✔️</span>
                        )}
                      </h3>
                      <span style={{
                        fontSize: "0.8rem",
                        color: "var(--accent-ios, #3b82f6)",
                        fontWeight: "700",
                        marginTop: "2px"
                      }}>
                        💼 {worker.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", color: "#facc15" }}>
                      {"★".repeat(Math.round(worker.rating_avg))}
                      {"☆".repeat(5 - Math.round(worker.rating_avg))}
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      {worker.rating_avg > 0 ? worker.rating_avg.toFixed(2) : "لا توجد تقييمات"}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      ({worker.rating_count} تقييم)
                    </span>
                  </div>

                  {/* Bio */}
                  {worker.bio && (
                    <p style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                      margin: "0 0 16px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {worker.bio}
                    </p>
                  )}
                </div>

                {/* Bottom Details Footer */}
                <div>
                  <div style={{
                    borderTop: "1px solid var(--border-glass)",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginBottom: "16px"
                  }}>
                    <div>
                      📍 {worker.profiles?.governorate || "مصر"}
                      {worker.profiles?.city ? `، ${worker.profiles.city}` : ""}
                    </div>
                    <div>
                      ⏳ خبرة {worker.experience_years} سنوات
                    </div>
                  </div>

                  <Link href={`/services/workers/${worker.id}`} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "38px",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--accent-ios, #3b82f6)";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "var(--accent-ios, #3b82f6)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.borderColor = "var(--border-glass)";
                  }}
                  >
                    🔍 عرض الملف الكامل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
