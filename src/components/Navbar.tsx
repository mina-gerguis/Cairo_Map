"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

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

  const links = [
    { href: "/", label: "الصفحة الرئيسية" },
    { href: "/metro", label: "اعرف طريقك" },
    { href: "/directory", label: "دليل الهاتف" },
    { href: "/about", label: "عن الموقع" },
    { href: "/help", label: "مركز المساعدة" },
  ];

  /* ── AUTH PAGE: Minimal Navbar ── */
  if (isAuthPage) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <span className="navbar-logo-icon">📋</span>
            <span className="navbar-logo-text">دفتر</span>
          </Link>
          <div style={{ flex: 1 }} />
          {/* Theme toggle */}
          <button className="navbar-icon-btn" onClick={toggleTheme} title={theme === "dark" ? "الوضع المضيء" : "الوضع الداكن"} style={{ marginLeft: "10px" }}>
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            )}
          </button>
          {/* Guest browse button */}
          <Link href="/" className="ios-btn ios-btn-primary" style={{ padding: "8px 20px", fontSize: "0.9rem", height: "42px", width: "auto", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            تصفح كزائر
          </Link>
        </div>
      </nav>
    );
  }

  /* ── NORMAL Navbar ── */
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-icon">📋</span>
          <span className="navbar-logo-text">دفتر</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`navbar-link ${pathname === link.href ? "active" : ""}`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">

          {/* Auth Controls */}
          <div style={{ position: "relative" }} className="navbar-auth-dropdown">
            <button className="navbar-icon-btn" title={user ? (user.user_metadata?.full_name || user.email) : "القائمة"} style={{ gap: "8px", padding: "0 14px", position: "relative", border: "none", background: "transparent", cursor: "pointer", outline: "none" }}>
              {user ? (
                <>
                  <div style={{ position: "relative" }}>
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} />
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
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{user.user_metadata?.username || "حسابي"}</span>
                </>
              ) : (
                <>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: "var(--bg-secondary)" }}>
                    <i className="bx bx-user" style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}></i>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>تسجيل الدخول</span>
                </>
              )}
            </button>
            <div className="navbar-auth-menu heroui-dropdown">
              {user ? (
                <>
                  <div className="heroui-dropdown-header">
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>تم تسجيل الدخول كـ</p>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.user_metadata?.username || "حسابي"}
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
                  <button onClick={logout} className="heroui-dropdown-item danger">
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu" onClick={() => setMenuOpen(false)}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`navbar-mobile-link ${pathname === link.href ? "active" : ""}`}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                الملف الشخصي (@{user.user_metadata?.username || "حسابي"})
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="navbar-mobile-link" style={{ color: "#ff3f8e", textAlign: "right", background: "none", border: "none", width: "100%", fontSize: "1rem", fontWeight: "700" }}><i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i><i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i> تسجيل الخروج</button>
            </>
          ) : (
            <Link href="/login" className="navbar-mobile-link" style={{ color: "var(--accent-primary)", fontWeight: "700" }} onClick={() => setMenuOpen(false)}>
              تسجيل الدخول / حساب جديد
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
