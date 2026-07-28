"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

export default function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const trendingSearches = [
    "مطاعم مصر الجديدة",
    "صيدلية العزبي",
    "كافيهات على النيل",
    "مستشفى كليوباترا",
    "حديقة الأزهر",
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTrendingClick = (term: string) => {
    setIsSearchOpen(false);
    setSearchQuery(term);
    router.push(`/?q=${encodeURIComponent(term)}`);
  };

  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 8) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  return (
    <>
      <div
        className="mobile-bottom-nav"
        style={{
          transform: visible ? "translateY(0)" : "translateY(150px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
        }}
      >
        {/* Right side in RTL - Search Button (standalone circle) */}
        <button 
          onClick={() => setIsSearchOpen(true)} 
          className={`mobile-nav-search-btn ${isSearchOpen ? "active" : ""}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Left side in RTL - Pill containing other tabs */}
        <div className="mobile-nav-pill">
          {/* 1. الرئيسية */}
          <Link href="/" className={`mobile-nav-item ${pathname === "/" ? "active" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>الرئيسية</span>
          </Link>

          {/* 2. اعرف طريقك */}
          <Link href="/metro" className={`mobile-nav-item ${pathname === "/metro" ? "active" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="12" y1="6" x2="12" y2="6.01" />
              <line x1="9" y1="16" x2="15" y2="16" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>طريقك</span>
          </Link>

          {/* 3. دليل الهاتف */}
          <Link href="/directory" className={`mobile-nav-item ${pathname === "/directory" ? "active" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>الدليل</span>
          </Link>

          {/* 4. البروفايل */}
          <Link href="/profile" className={`mobile-nav-item ${pathname === "/profile" ? "active" : ""}`} style={{ position: "relative" }}>
            {user && user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                style={{ 
                  width: "22px", 
                  height: "22px", 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  border: pathname === "/profile" ? "2px solid var(--accent-ios)" : "1px solid var(--border-glass)",
                  transition: "border-color 0.2s"
                }} 
              />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            )}
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                background: "#ff3b30",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: "bold",
                minWidth: "12px",
                height: "12px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 2px",
                border: "2px solid var(--glass-bg)"
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span>حسابي</span>
          </Link>
        </div>
      </div>

      {/* Full-Screen Search Modal */}
      {isSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-modal">
            <div className="mobile-search-handle" onClick={() => setIsSearchOpen(false)} />
            <div className="mobile-search-header">
              <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, position: "relative" }}>
                <input
                  autoFocus
                  type="text"
                  className="ios-input"
                  placeholder="ابحث عن مكان، فئة، أو منطقة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </form>
              <button className="ios-btn" onClick={() => setIsSearchOpen(false)} style={{ padding: "10px 14px", fontSize: "0.9rem" }}>
                إلغاء
              </button>
            </div>

            <div className="mobile-search-trending">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-primary)" }}>
                📈 عمليات بحث شائعة
              </h3>
              <div className="trending-tags" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTrendingClick(term)}
                    className="category-pill"
                    style={{ fontSize: "0.95rem", padding: "8px 16px" }}
                  >
                    🔍 {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
