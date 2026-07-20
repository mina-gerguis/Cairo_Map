"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Close modal when navigating
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="mobile-bottom-nav">
        {/* Left Pill with 3 Tabs */}
        {/* Note: In RTL layout, the first DOM element appears on the Right. */}
        <div className="mobile-nav-pill">
          <Link href="/help" className={`mobile-nav-item ${pathname === "/help" ? "active" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>المساعدة</span>
          </Link>
          <Link href="/?nearby=true" className="mobile-nav-item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>قريب مني</span>
          </Link>
          <Link href="/" className={`mobile-nav-item ${pathname === "/" ? "active" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>الرئيسية</span>
          </Link>
        </div>

        {/* Right Circular Button for Search */}
        {/* Note: In RTL layout, the second DOM element appears on the Left. */}
        <button className="mobile-nav-search-btn" onClick={() => setIsSearchOpen(true)} style={{ border: "none", outline: "none", cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Full-Screen Search Modal */}
      {isSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-modal">
            {/* Handle / Close bar */}
            <div className="mobile-search-handle" onClick={() => setIsSearchOpen(false)} />

            {/* Header */}
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

            {/* Trending */}
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
