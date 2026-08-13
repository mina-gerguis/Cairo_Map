"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

interface NavSubItem {
  href: string;
  label: string;
  icon: string;
}

interface NavLink {
  href?: string;
  label: string;
  icon: string;
  isDropdown?: boolean;
  subItems?: NavSubItem[];
}

/* ─── مكون الشريط العلوي للرأس والقوائم (Navbar Component) ─── */
export default function Navbar() {
  const pathname = usePathname();

  // ── جلب حالات المصادقة والإشعارات والمسار ──
  const { user, profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const isLinkActive = (link: NavLink) => {
    if (link.href) {
      return pathname === link.href;
    }
    if (link.isDropdown && link.subItems) {
      return link.subItems.some((sub: NavSubItem) => pathname === sub.href);
    }
    return false;
  };

  useEffect(() => {
    const saved = localStorage.getItem("dftry_theme") as "dark" | "light" | null;
    const initial = saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  // Close menu on auth pages
  useEffect(() => {
    if (isAuthPage) setMenuOpen(false);
  }, [isAuthPage]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dftry_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  };

  // ── قائمة الروابط الرئيسية للموقع ──
  const mainLinks: NavLink[] = [
    { href: "/", label: "الصفحة الرئيسية", icon: "fa-solid fa-house-chimney" },
    {
      label: "الخدمات",
      isDropdown: true,
      icon: "fa-solid fa-star-of-life",
      subItems: [
        { href: "/places", label: "دليل الأماكن", icon: "bx bx-map" },
        { href: "/directory", label: "دليل الهاتف", icon: "bx bx-phone" },
        { href: "/services", label: "دليل الحرفيين والمهن", icon: "bx bx-wrench" },
        { href: "/metro", label: "خريطة المترو", icon: "bx bx-train" },
        { href: "/monorail", label: "خريطة المنورايل", icon: "bx bx-navigation" },
        { href: "/lrt", label: "القطار الكهربائي LRT", icon: "bx bx-train" },
        { href: "/railways", label: "سكك حديد مصر", icon: "fa-solid fa-train-subway" },
        { href: "/airports", label: "المطارات", icon: "fa-solid fa-plane-departure" },
        { href: "/ports", label: "الموانئ", icon: "fa-solid fa-ship" },
        { href: "/bus-stations", label: "مواقف الأتوبيسات", icon: "fa-solid fa-bus" },
        { href: "/microbus-stations", label: "مواقف الميكروباص", icon: "bx bx-car" },
        { href: "/directions", label: "ازاي اروح ؟", icon: "bx bx-compass" },
      ]
    },
    { href: "/ai-planner", label: "مخطط الرحلات الذكي", icon: "fa-solid fa-brain" },
    { href: "/help", label: "المساعدة", icon: "fa-solid fa-question" },
  ];

  // Mobile dropdown state
  const [expandedMobileDropdowns, setExpandedMobileDropdowns] = useState<Record<number, boolean>>({});

  const toggleMobileDropdown = (idx: number) => {
    setExpandedMobileDropdowns(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  useEffect(() => {
    const initialExpanded: Record<number, boolean> = {};
    mainLinks.forEach((link, idx) => {
      if (link.isDropdown && isLinkActive(link)) {
        initialExpanded[idx] = true;
      }
    });
    setExpandedMobileDropdowns(initialExpanded);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  /* ── Navbar ── */
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <img src="images/logo/darkMode_logo.png" alt="Map Cairo" className="logo-img-dark" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
          <img src="images/logo/lightMode_logo.png" alt="Map Cairo" className="logo-img-light" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {mainLinks.map((link, idx) => {
            if (link.isDropdown) {
              const active = isLinkActive(link);
              return (
                <div key={idx} className="navbar-item-dropdown">
                  <button className={`navbar-link navbar-dropdown-toggle ${active ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-heading)" }}>
                    {link.label}
                    <i className="bx bx-chevron-down" style={{ fontSize: "0.95rem" }} />
                  </button>
                  <div className="navbar-dropdown-menu">
                    {link.subItems?.map((sub, sIdx) => (
                      <Link key={sIdx} href={sub.href} className={`heroui-dropdown-item ${pathname === sub.href ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-heading)" }}>
                        <i className={sub.icon} style={{ fontSize: "1.1rem" }} />
                        <span>{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link key={link.href || idx} href={link.href || ""} className={`navbar-link ${pathname === link.href ? "active" : ""}`} style={{ fontFamily: "var(--font-heading)", display: "flex", alignItems: "center", gap: "0px" }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">

          {/* Auth Controls */}
          <div style={{ position: "relative" }} className="navbar-auth-dropdown">
            <button className="navbar-icon-btn" title={user ? (profile?.full_name || user.user_metadata?.full_name || user.email) : "الأعدادات"} style={{ gap: "8px", padding: "0 14px", position: "relative", border: "1px solid var(--border-glass)", background: "transparent", cursor: "pointer", outline: "none" }}>
              {user ? (
                <>
                  <div style={{ position: "relative" }}>
                    {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                      <img src={profile?.avatar_url || user.user_metadata.avatar_url} alt="Avatar" style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                    )}
                    {unreadCount > 0 && (
                      <span style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "#ff3b30",
                        color: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                        minWidth: "14px",
                        height: "14px",
                        borderRadius: "7px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{profile?.username || user.user_metadata?.username || "حسابي"}</span>
                </>
              ) : (
                <>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: "var(--bg-secondary)" }}>
                    <i className="bx bx-user" style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}></i>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "500", fontFamily: "Tajawal" }}>تسجيل الدخول</span>
                </>
              )}
            </button>
            <div className="navbar-auth-menu heroui-dropdown">
              {user ? (
                <>
                  <div className="heroui-dropdown-header">
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>تم تسجيل الدخول كـ</p>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {profile?.username || user.user_metadata?.username || "حسابي"}
                    </p>
                  </div>
                  <div className="heroui-dropdown-divider"></div>
                </>
              ) : (
                <>
                  <div className="heroui-dropdown-header" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>سجل دخولك للوصول لجميع المزايا</p>
                    <Link href="/login" className="ios-btn ios-btn-primary" style={{ width: "100%", padding: "8px", fontSize: "0.9rem", height: "auto" }}>
                      <i className="bx bx-log-in" style={{ fontSize: "1.1rem" }}></i> تسجيل الدخول
                    </Link>
                  </div>
                  <div className="heroui-dropdown-divider"></div>
                </>
              )}

              <Link href="/profile" className="heroui-dropdown-item">
                <i className="bx bx-user" style={{ fontSize: "1.2rem" }}></i>
                الملف الشخصي
              </Link>
              <Link href="/favorites" className="heroui-dropdown-item">
                <i className="bx bx-heart" style={{ fontSize: "1.2rem" }}></i>
                الأماكن المفضلة
              </Link>
              <Link href="/profile" className="heroui-dropdown-item" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className="bx bx-bell" style={{ fontSize: "1.2rem" }}></i>
                  الإشعارات
                </div>
                {user && unreadCount > 0 && (
                  <span style={{
                    background: "#ff3b30",
                    color: "#fff",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "bold"
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/help" className="heroui-dropdown-item">
                <i className="bx bx-help-circle" style={{ fontSize: "1.2rem" }}></i>
                المساعدة والدعم
              </Link>
              <button onClick={(e) => { e.preventDefault(); toggleTheme(); }} className="heroui-dropdown-item">
                <i className={theme === "dark" ? "bx bx-sun" : "bx bx-moon"} style={{ fontSize: "1.2rem" }}></i>
                {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
              </button>

              {user && (
                <>
                  <div className="heroui-dropdown-divider"></div>
                  <button onClick={() => setShowLogoutModal(true)} className="heroui-dropdown-item danger">
                    <i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i>
                    تسجيل الخروج
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="القائمة">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {menuOpen ? (<path d="M18 6 6 18M6 6l12 12" />) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── قائمة الجوال الهامبرغر (Mobile Navigation Drawer) ── */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {mainLinks.map((link, idx) => {
            if (link.isDropdown) {
              const isExpanded = expandedMobileDropdowns[idx] || false;
              return (
                <div key={idx} className="navbar-mobile-dropdown-group">
                  <button
                    className="navbar-mobile-link"
                    onClick={() => toggleMobileDropdown(idx)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      textAlign: "right",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo)"
                    }}
                  >
                    <span> <i className={link.icon} style={{ fontSize: "1.1rem" }}></i> {link.label}</span>
                    <i
                      className={`bx bx-chevron-down`}
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        fontSize: "1.2rem",
                        color: "var(--text-secondary)"
                      }}
                    />
                  </button>
                  {isExpanded && (
                    <div className="navbar-mobile-dropdown-items" style={{ paddingRight: "16px" }}>
                      {link.subItems?.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`navbar-mobile-link sub-link ${pathname === sub.href ? "active" : ""}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <i className={sub.icon} style={{ fontSize: "1.1rem", marginLeft: "8px" }} />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.href || idx}
                href={link.href || ""}
                className={`navbar-mobile-link ${pathname === link.href ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className={link.icon} style={{ fontSize: "1.1rem", marginLeft: "8px" }} />
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <>
              <Link href="/profile" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                <i className="fa-solid fa-user" style={{ fontSize: "1.2rem", marginLeft: "8px" }}></i>
                الملف الشخصي ({profile?.username || user.user_metadata?.username || "حسابي"}@)
              </Link>
              <button onClick={() => { setShowLogoutModal(true); setMenuOpen(false); }} className="navbar-mobile-link" style={{ color: "#ff3f8e", textAlign: "right", background: "none",fontFamily:"var(--font-body)", border: "none", width: "100%", fontSize: "1rem", fontWeight: "700" }}><i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i> تسجيل الخروج</button>
            </>
          ) : (
            <Link href="/login" className="navbar-mobile-link" style={{ color: "var(--accent-primary)", fontWeight: "700",fontFamily:"var(--font-body)" }} onClick={() => setMenuOpen(false)}>
              تسجيل الدخول / حساب جديد
            </Link>
          )}
        </div>
      )}

      {/* ── نافذة تأكيد تسجيل الخروج المعتمة (Logout Confirmation Modal) ── */}
      {showLogoutModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          zIndex: 20000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div className="glass-panel" style={{ maxWidth: "440px", width: "100%", padding: "30px", animation: "fade-in 0.3s ease", border: "1px solid rgba(255, 149, 0, 0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", borderRadius: "28px" }}>
            <h3 style={{ fontSize: "1.3rem", color: "#ff9500", marginBottom: "16px", textAlign: "center" }}>تسجيل الخروج</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "24px", lineHeight: "1.6", textAlign: "center" }}>
              هل أنت متأكد من تسجيل الخروج؟
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="ios-btn" onClick={() => setShowLogoutModal(false)} style={{ flex: 1 }}>
                <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i> إلغاء
              </button>
              <button className="ios-btn" onClick={() => { logout(); setShowLogoutModal(false); }} style={{ flex: 1, background: "#ff9500", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i> تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
