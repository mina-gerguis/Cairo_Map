"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

import { MdOutlineClose } from "react-icons/md";
import { GoHome, GoHomeFill } from "react-icons/go";
import { IoTrainOutline, IoTrain, IoSearchOutline, IoSearch } from "react-icons/io5";
import { RiBookletLine, RiBookletFill } from "react-icons/ri";

const BUBBLE_W = 60;
const BUBBLE_W_DRAG = 76;
const NAV_ROUTES = ["/", "/metro", "/directory", null, "/profile"] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isShrunk, setIsShrunk] = useState(false);
  const lastScrollY = useRef(0);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Refs
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([null, null, null, null, null]);

  // Bubble position (JS-driven for pixel-perfect centering)
  const [bubbleLeft, setBubbleLeft] = useState<number | null>(null);

  // Check if any modal is active (e.g. Wallet, Points, Place sheets, custom popups)
  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    const checkModals = () => {
      const modalExists = document.querySelector(".ios-sheet-overlay, .modal-backdrop, [class*=\"modalBackdrop\"], .navbar-mobile-menu") !== null;
      setIsModalActive(modalExists);
    };

    checkModals();

    const observer = new MutationObserver(() => {
      checkModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragLeft, setDragLeft] = useState(0);
  const [dragHoverIdx, setDragHoverIdx] = useState(-1);
  const isDragActive = useRef(false);
  const capturedPointer = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route change → reset search
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsSearchOpen(false);
  }

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname?.startsWith(path + "/");

  const isHomeActive = isActive("/");
  const isMetroActive = isActive("/metro");
  const isDirectoryActive = isActive("/directory");
  const isProfileActive = isActive("/profile");

  const getActiveIndex = () => {
    if (isSearchOpen) return 3;
    if (isHomeActive) return 0;
    if (isMetroActive) return 1;
    if (isDirectoryActive) return 2;
    if (isProfileActive) return 4;
    return -1;
  };

  const activeIndex = getActiveIndex();
  // During drag, show which icon we're hovering over as "active"
  const displayActiveIndex = isDragging ? dragHoverIdx : activeIndex;

  // ── Measure static bubble position ──────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (activeIndex === -1) { setBubbleLeft(null); return; }
      const item = itemRefs.current[activeIndex] as HTMLElement | null;
      if (!item) return;
      setBubbleLeft(Math.round(item.offsetLeft + item.offsetWidth / 2 - BUBBLE_W / 2));
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
  }, [activeIndex]);

  // ── Drag helpers ─────────────────────────────────────────────────────────────
  const getItemCenter = (idx: number) => {
    const el = itemRefs.current[idx] as HTMLElement | null;
    return el ? el.offsetLeft + el.offsetWidth / 2 : 0;
  };

  const getNearestIdx = (relX: number) => {
    let nearest = 0, minDist = Infinity;
    for (let i = 0; i < 5; i++) {
      const d = Math.abs(relX - getItemCenter(i));
      if (d < minDist) { minDist = d; nearest = i; }
    }
    return nearest;
  };

  const getMagneticLeft = (rawLeft: number, nearestIdx: number): number => {
    const nearestLeft = getItemCenter(nearestIdx) - BUBBLE_W_DRAG / 2;
    const dist = Math.abs(rawLeft - nearestLeft);
    const threshold = 40;
    if (dist < threshold) {
      const pull = ((1 - dist / threshold) ** 2) * 0.6; // quadratic ease, max 60% pull
      return rawLeft + (nearestLeft - rawLeft) * pull;
    }
    return rawLeft;
  };

  // ── Pointer event handlers ────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const startClientX = e.clientX;
    const pid = e.pointerId;
    isDragActive.current = false;

    longPressTimer.current = setTimeout(() => {
      isDragActive.current = true;
      setIsDragging(true);
      if (navigator.vibrate) navigator.vibrate(14);

      // Capture pointer so pointermove keeps firing even outside pill
      if (pillRef.current) {
        try { pillRef.current.setPointerCapture(pid); } catch { /* ignore */ }
        capturedPointer.current = pid;

        const relX = startClientX - pillRef.current.getBoundingClientRect().left;
        const nearestIdx = getNearestIdx(relX);
        const raw = Math.max(0, Math.min(pillRef.current.offsetWidth - BUBBLE_W_DRAG, relX - BUBBLE_W_DRAG / 2));
        setDragLeft(getMagneticLeft(raw, nearestIdx));
        setDragHoverIdx(nearestIdx);
      }
    }, 190);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragActive.current || !pillRef.current) return;
    const pillRect = pillRef.current.getBoundingClientRect();
    const relX = e.clientX - pillRect.left;
    const nearestIdx = getNearestIdx(relX);
    const raw = Math.max(0, Math.min(pillRef.current.offsetWidth - BUBBLE_W_DRAG, relX - BUBBLE_W_DRAG / 2));
    setDragLeft(getMagneticLeft(raw, nearestIdx));
    setDragHoverIdx(nearestIdx);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    if (!isDragActive.current) return;
    isDragActive.current = false;

    if (pillRef.current && capturedPointer.current !== null) {
      try { pillRef.current.releasePointerCapture(capturedPointer.current); } catch { /* ignore */ }
      capturedPointer.current = null;
    }

    const finalIdx = dragHoverIdx;
    setIsDragging(false);
    setDragHoverIdx(-1);

    // Navigate to the snapped tab
    if (finalIdx === 3) {
      setIsSearchOpen(true);
    } else {
      const route = NAV_ROUTES[finalIdx];
      if (route && route !== pathname) router.push(route);
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    isDragActive.current = false;
    setIsDragging(false);
    setDragHoverIdx(-1);
  };

  // ── Scroll hide ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) setIsShrunk(false);
      else if (y > lastScrollY.current + 8) setIsShrunk(true);
      else if (y < lastScrollY.current - 8) setIsShrunk(false);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname?.startsWith("/admin");
  if (isAuthPage || isAdminPage) return null;

  // ── Bubble position & size ────────────────────────────────────────────────────
  const showBubble = isDragging || (bubbleLeft !== null && activeIndex !== -1);
  const computedLeft = isDragging ? dragLeft : (bubbleLeft ?? 0);
  const computedWidth = isDragging ? BUBBLE_W_DRAG : BUBBLE_W;

  const trendingSearches = [
    "مطاعم مصر الجديدة", "مطاعم التجمع الخامس", "مطاعم مدينة نصر",
    "مطاعم الزمالك", "مطاعم المعادي", "مطاعم الشيخ زايد",
    "كافيهات على النيل", "كافيهات الزمالك", "كافيهات المعادي",
    "صيدلية العزبي", "مستشفى دار الفؤاد", "حديقة الأزهر",
    "حديقة الحيوان", "الأهرامات",
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

  return (
    <>
      <div className={`mobile-bottom-nav ${isShrunk && !isDragging ? "shrunk" : ""} ${isModalActive ? "hidden-by-modal" : ""}`}>
        <div
          className="mobile-nav-pill"
          ref={pillRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{ touchAction: isDragging ? "none" : undefined, userSelect: "none" }}
        >
          {/* Sliding glassmorphic active bubble */}
          {showBubble && (
            <div
              className={`mobile-nav-active-bubble${isDragging ? " dragging" : ""}`}
              style={{ left: computedLeft, width: computedWidth }}
            />
          )}

          {/* 1. الرئيسية */}
          <Link href="/" className={`mobile-nav-item ${displayActiveIndex === 0 ? "active" : ""}`}
            ref={(el) => { itemRefs.current[0] = el; }}>
            <div className="mobile-nav-item-wrapper">
              {displayActiveIndex === 0 ? <GoHomeFill size={26} /> : <GoHome size={26} />}
            </div>
          </Link>

          {/* 2. اعرف طريقك */}
          <Link href="/metro" className={`mobile-nav-item ${displayActiveIndex === 1 ? "active" : ""}`}
            ref={(el) => { itemRefs.current[1] = el; }}>
            <div className="mobile-nav-item-wrapper">
              {displayActiveIndex === 1 ? <IoTrain size={24} /> : <IoTrainOutline size={24} />}
            </div>
          </Link>

          {/* 3. دليل الهاتف */}
          <Link href="/directory" className={`mobile-nav-item ${displayActiveIndex === 2 ? "active" : ""}`}
            ref={(el) => { itemRefs.current[2] = el; }}>
            <div className="mobile-nav-item-wrapper">
              {displayActiveIndex === 2 ? <RiBookletFill size={24} /> : <RiBookletLine size={24} />}
            </div>
          </Link>

          {/* 4. البحث */}
          <button
            className={`mobile-nav-item ${displayActiveIndex === 3 ? "active" : ""}`}
            onClick={() => { if (!isDragActive.current) setIsSearchOpen(true); }}
            style={{ background: "none", border: "none", padding: 0, outline: "none", cursor: "pointer" }}
            ref={(el) => { itemRefs.current[3] = el; }}
          >
            <div className="mobile-nav-item-wrapper">
              {displayActiveIndex === 3 ? <IoSearch size={25} /> : <IoSearchOutline size={25} />}
            </div>
          </button>

          {/* 5. البروفايل */}
          <Link href="/profile" className={`mobile-nav-item ${displayActiveIndex === 4 ? "active" : ""}`}
            ref={(el) => { itemRefs.current[4] = el; }}>
            <div className="mobile-nav-item-wrapper" style={{ position: "relative" }}>
              {user && (profile?.avatar_url || user.user_metadata?.avatar_url) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile?.avatar_url || user.user_metadata.avatar_url} alt="Profile"
                  style={{
                    width: "25px", height: "25px", borderRadius: "50%", objectFit: "cover",
                    border: displayActiveIndex === 4 ? "2px solid var(--text-primary)" : "1px solid transparent",
                    transition: "border-color 0.2s",
                  }}
                />
              ) : (
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              )}
              {unreadCount > 0 && <span className="mobile-nav-badge" />}
            </div>
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
                <input autoFocus type="text" className="ios-input"
                  placeholder="ابحث عن مكان، فئة، أو منطقة..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </form>
              <button className="ios-btn" onClick={() => setIsSearchOpen(false)}
                style={{ width: "50px", padding: "15px 14px", fontSize: "0.9rem", border: "1px solid var(--border-glass)" }}>
                <MdOutlineClose />
              </button>
            </div>
            <div className="mobile-search-trending">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-primary)" }}>
                📈 عمليات بحث شائعة
              </h3>
              <div className="trending-tags" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {trendingSearches.map((term) => (
                  <button key={term} onClick={() => handleTrendingClick(term)} className="category-pill"
                    style={{ fontSize: "0.95rem", padding: "8px 16px" }}>
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
