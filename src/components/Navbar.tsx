"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import CustomModal from "@/components/common/Modals";


interface NavSubItem {
  href: string;
  label: string;
  subtitle?: string;
  imgLogo?: string;
  icon?: string;
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

    const handleGlobalThemeChange = (e: any) => {
      setTheme(e.detail);
    };
    window.addEventListener("themechange", handleGlobalThemeChange);
    return () => window.removeEventListener("themechange", handleGlobalThemeChange);
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
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  // ── قائمة الروابط الرئيسية للموقع ──
  const mainLinks: NavLink[] = [
    { href: "/", label: "الصفحة الرئيسية", icon: "fa-solid fa-house-chimney" },
    {
      label: "الخدمات",
      isDropdown: true,
      icon: "fa-solid fa-star-of-life",
      subItems: [
        { href: "/places", label: "دليل الأماكن", subtitle: "المتاجر والمحلات والأماكن", imgLogo: "shop.png" },
        { href: "/directory", label: "دليل الهاتف", subtitle: "أرقام الخدمات وأكواد الشبكات", imgLogo: "Cairo_directory.png" },
        { href: "/parking", label: "دليل الجراجات (اركن واركب)", subtitle: "أقرب جراج وركنة بجوار المترو", imgLogo: "parking.png" },
        { href: "/metro", label: "مترو الأنفاق", subtitle: "محطات وأسعار تذاكر المترو", imgLogo: "metro.svg" },
        { href: "/monorail", label: "خريطة المنورايل", subtitle: "محطات وأسعار تذاكر المونوريل", imgLogo: "Cairo_monorail_east.png" },
        { href: "/lrt", label: "القطار الكهربائي LRT", subtitle: "محطات ومواعيد القطار الكهربائي", imgLogo: "Cairo_lrt.png" },
        { href: "/railways", label: "سكك حديد مصر", subtitle: "قطارات القاهرة والمحافظات", imgLogo: "Cairo_train.png" },
        { href: "/airports", label: "المطارات", subtitle: "معلومات مطار القاهرة والرحلات", imgLogo: "airport.png" },
        { href: "/ports", label: "الموانئ", subtitle: "الموانئ المائية والملاحية المصرية", imgLogo: "arab_republice.png" },
        { href: "/bus-stations", label: "مواقف الأتوبيسات", subtitle: "محطات النقل العام بالقاهرة والجيزة", imgLogo: "bus.png" },
        { href: "/microbus-stations", label: "مواقف الميكروباص", subtitle: "خطوط السرفيس بين المحافظات", imgLogo: "microbus.png" },
        { href: "/directions", label: "أزاي أروح ؟", subtitle: "ازاي اروح من ... ل ...", imgLogo: "Cairo_directions.svg" },
        { href: "/ai-planner", label: "مخطط الرحلات الذكي", subtitle: "تخطيط خروجتك بالذكاء الاصطناعي", imgLogo: "ai.webp" },
        { href: "/help", label: "المساعدة والدعم", subtitle: "الأسئلة الشائعة والدعم الفني", imgLogo: "Cairo_logo.png" },
      ]
    },
    { href: "/blog", label: "المدونة والمقالات", icon: "bx bx-news" },
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
                  <button className={`navbar-link navbar-dropdown-toggle ${active ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)" }}>
                    {link.label}
                    <i className="bx bx-chevron-down" style={{ fontSize: "0.95rem" }} />
                  </button>
                  <div className="navbar-dropdown-menu">
                    {link.subItems?.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        href={sub.href}
                        className={`heroui-dropdown-item ${pathname === sub.href ? "active" : ""}`}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "10px", fontFamily: "var(--font-body)" }}
                      >
                        {sub.imgLogo ? (
                          <img
                            src={`images/icons2d/${sub.imgLogo}`}
                            alt={sub.label}
                            style={{ width: "24px", height: "24px", objectFit: "contain", flexShrink: 0 }}
                          />
                        ) : (
                          <i className={sub.icon} style={{ fontSize: "1.1rem" }} />
                        )}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span className="sub-title" style={{ fontWeight: "700", fontSize: "0.88rem", color: "var(--textPrimary)" }}>{sub.label}</span>
                          {sub.subtitle && (
                            <span style={{ fontSize: "0.65rem", color: "var(--textSecondary)", marginTop: "1px" }}>{sub.subtitle}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link key={link.href || idx} href={link.href || ""} className={`navbar-link ${pathname === link.href ? "active" : ""}`} style={{ fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: "0px" }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">

          {/* Auth Controls */}
          <div style={{ position: "relative" }} className="navbar-auth-dropdown">
            <button className="navbar-icon-btn" title={user ? (profile?.full_name || user.user_metadata?.full_name || user.email) : "الأعدادات"} style={{ gap: "8px", padding: "0 14px", position: "relative", border: "1px solid var(--borderGlass)", background: "transparent", cursor: "pointer", outline: "none" }}>
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
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: "var(--bgSecondary)" }}>
                    <i className="bx bx-user" style={{ fontSize: "1.2rem", color: "var(--textSecondary)" }}></i>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "500", fontFamily: "var(--font-body)" }}>تسجيل الدخول</span>
                </>
              )}
            </button>
            <div className="navbar-auth-menu heroui-dropdown">
              {user ? (
                <>
                  <div className="heroui-dropdown-header">
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>تم تسجيل الدخول كـ</p>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "var(--textPrimary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {profile?.username || user.user_metadata?.username || "حسابي"}
                    </p>
                  </div>
                  <div className="heroui-dropdown-divider"></div>
                </>
              ) : (
                <>
                  <div className="heroui-dropdown-header" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>سجل دخولك للوصول لجميع المزايا</p>
                    <Link href="/login" className="btn btn-primary" style={{ width: "100%", padding: "8px", fontSize: "0.9rem", height: "auto" }}>
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
                      fontFamily: "var(--font-heading)"
                    }}
                  >
                    <span> <i className={link.icon} style={{ fontSize: "1.1rem" }}></i> {link.label}</span>
                    <i
                      className={`bx bx-chevron-down`}
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        fontSize: "1.2rem",
                        color: "var(--textSecondary)"
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
                          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px" }}
                        >
                          {sub.imgLogo ? (
                            <img
                              src={`/images/icons2d/${sub.imgLogo}`}
                              alt={sub.label}
                              style={{ width: "22px", height: "22px", objectFit: "contain", flexShrink: 0 }}
                            />
                          ) : (
                            <i className={sub.icon} style={{ fontSize: "1.1rem", marginLeft: "8px" }} />
                          )}
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "700", fontSize: "0.86rem" }}>{sub.label}</span>
                            {sub.subtitle && (
                              <span style={{ fontSize: "0.72rem", color: "var(--textSecondary)", marginTop: "1px" }}>{sub.subtitle}</span>
                            )}
                          </div>
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
                الحساب ({profile?.username || user.user_metadata?.username || "حسابي"}@)
              </Link>
              <button onClick={() => { setShowLogoutModal(true); setMenuOpen(false); }} className="navbar-mobile-link" style={{ color: "#ff3f8e", textAlign: "right", background: "none", border: "none", width: "100%", fontSize: "1rem", fontWeight: "700" }}><i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i> تسجيل الخروج</button>
            </>
          ) : (
            <Link href="/login" className="navbar-mobile-link" style={{ color: "var(--colorPrimary)", fontWeight: "700" }} onClick={() => setMenuOpen(false)}>
              تسجيل الدخول
            </Link>
          )}
        </div>
      )}

      {/* ── نافذة تأكيد تسجيل الخروج المعتمة (Logout Confirmation Modal) ── */}
      <CustomModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟"
        iconSrc="/images/icons3d/alert.png"
        borderColor="var(--modelCardBorder)"
        primaryButton={{
          label: "تأكيد",
          onClick: () => {
            logout();
            setShowLogoutModal(false);
          },
          bgColor: "var(--mainBtn)",
          icon: <i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i>,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setShowLogoutModal(false),
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>,
          bgColor: "var(--cancelBtn)",
        }}
      />
    </nav>
  );
}
