"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import CustomModal from "@/components/common/Modals";
import { useGSAP, gsap } from "@/lib/gsap";
import { ASSETS } from "@/constants/assets";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import "./Navbar.css";

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // GSAP Smooth Navigation Entrance
  useGSAP(
    () => {
      if (navRef.current) {
        gsap.fromTo(
          navRef.current,
          { y: -16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out", clearProps: "transform,opacity,visibility" }
        );
      }
    },
    { scope: navRef }
  );

  // GSAP Mobile Drawer reveal
  useGSAP(
    () => {
      if (menuOpen && mobileMenuRef.current) {
        gsap.fromTo(
          mobileMenuRef.current,
          { autoAlpha: 0, y: -12 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
        const links = mobileMenuRef.current.querySelectorAll(".navbar-mobile-link");
        if (links.length > 0) {
          gsap.fromTo(
            links,
            { autoAlpha: 0, x: -10 },
            { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.03, ease: "power2.out" }
          );
        }
      }
    },
    { scope: navRef, dependencies: [menuOpen] }
  );

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

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
    { href: "/map", label: "الخريطة", icon: "fa-solid fa-map-location-dot" },
    {
      label: "الخدمات",
      isDropdown: true,
      icon: "fa-solid fa-star-of-life",
      subItems: [
        { href: "/save-location", label: "أحفظ مكاني", subtitle: "حفظ موقعك الحالي بدقة 100% ورابط خرائط جوجل", imgLogo: ASSETS.icons2d.cairo },
        { href: "/map", label: "خريطة الأماكن التفاعلية", subtitle: "استكشاف الأماكن وموقعي على الخريطة", imgLogo: ASSETS.icons2d.cairo },
        { href: "/places", label: "دليل الأماكن", subtitle: "المتاجر والمحلات والأماكن", imgLogo: ASSETS.icons2d.shop },
        { href: "/directory", label: "دليل الهاتف", subtitle: "أرقام الخدمات وأكواد الشبكات", imgLogo: ASSETS.icons2d.cairo },
        { href: "/parking", label: "دليل الجراجات", subtitle: "أقرب جراج وركنة بجوار المترو", imgLogo: ASSETS.icons2d.parking },
        { href: "/metro", label: "مترو الأنفاق", subtitle: "محطات وأسعار تذاكر المترو", imgLogo: ASSETS.icons2d.metro },
        { href: "/monorail", label: "خريطة المنورايل", subtitle: "محطات وأسعار تذاكر المونوريل", imgLogo: ASSETS.icons2d.monorailEast },
        { href: "/lrt", label: "القطار الكهربائي LRT", subtitle: "محطات ومواعيد القطار الكهربائي", imgLogo: ASSETS.icons2d.lrt },
        { href: "/brt", label: "الأتوبيس الترددي BRT", subtitle: "محطات ومسارات الأتوبيس على الدائري", imgLogo: ASSETS.icons2d.brt },
        { href: "/railways", label: "سكك حديد مصر", subtitle: "قطارات القاهرة والمحافظات", imgLogo: ASSETS.icons2d.train },
        { href: "/airports", label: "المطارات", subtitle: "معلومات مطار القاهرة والرحلات", imgLogo: ASSETS.icons2d.airport },
        { href: "/ports", label: "الموانئ", subtitle: "الموانئ المائية والملاحية المصرية", imgLogo: ASSETS.icons2d.ports },
        { href: "/bus-stations", label: "مواقف الأتوبيسات", subtitle: "محطات النقل العام بالقاهرة والجيزة", imgLogo: ASSETS.icons2d.bus },
        { href: "/microbus-stations", label: "مواقف الميكروباص", subtitle: "خطوط السرفيس بين المحافظات", imgLogo: ASSETS.icons2d.microbus },
        { href: "/roads-info", label: "معلومات الطرق والسرعات", subtitle: "الطقس، السرعات المقررة، وأخبار الطرق", imgLogo: ASSETS.icons2d.car },
        { href: "/directions", label: "أزاي أروح ؟", subtitle: "ازاي اروح من ... ل ...", imgLogo: ASSETS.icons2d.egypt },
        { href: "/ai-planner", label: "مخطط الرحلات الذكي", subtitle: "تخطيط خروجتك بالذكاء الاصطناعي", imgLogo: ASSETS.icons2d.ai },
        { href: "/help", label: "المساعدة والدعم", subtitle: "الأسئلة الشائعة والدعم الفني", imgLogo: ASSETS.icons2d.cairoLogo },
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

  const servicesColumns = [
    {
      title: "شبكة النقل والقطارات",
      items: [
        { href: "/metro", label: "مترو الأنفاق", description: "محطات وأسعار تذاكر المترو", imgLogo: ASSETS.icons2d.metro },
        { href: "/monorail", label: "خريطة المونوريل", description: "محطات وأسعار تذاكر المونوريل", imgLogo: ASSETS.icons2d.monorailEast },
        { href: "/lrt", label: "القطار الكهربائي LRT", description: "محطات ومواعيد قطار العاصمة", imgLogo: ASSETS.icons2d.lrt },
        { href: "/brt", label: "الأتوبيس الترددي BRT", description: "محطات ومسارات الأتوبيس على الدائري", imgLogo: ASSETS.icons2d.brt },
        { href: "/railways", label: "سكك حديد مصر", description: "قطارات القاهرة والمحافظات", imgLogo: ASSETS.icons2d.train },
        { href: "/airports", label: "المطارات والموانئ", description: "مطار القاهرة والموانئ المصرية", imgLogo: ASSETS.icons2d.airport },
      ],
    },
    {
      title: "المواقف والطرق",
      items: [
        { href: "/bus-stations", label: "مواقف الأتوبيسات", description: "محطات النقل العام بالقاهرة والجيزة", imgLogo: ASSETS.icons2d.bus },
        { href: "/microbus-stations", label: "مواقف الميكروباص", description: "خطوط السرفيس بين المحافظات", imgLogo: ASSETS.icons2d.microbus },
        { href: "/parking", label: "دليل الجراجات", description: "أقرب جراج وركنة بجوار المترو", imgLogo: ASSETS.icons2d.parking },
        { href: "/roads-info", label: "معلومات الطرق والسرعات", description: "الطقس، السرعات المقررة، وأخبار الطرق", imgLogo: ASSETS.icons2d.car },
        { href: "/directory", label: "دليل الهاتف", description: "أرقام الخدمات وأكواد الشبكات", imgLogo: ASSETS.icons2d.cairo },
      ],
    },
    {
      title: "استكشاف وأدوات ذكية",
      items: [
        { href: "/save-location", label: "أحفظ مكاني", description: "حفظ موقعك الحالي بدقة 100%", imgLogo: ASSETS.icons2d.cairo },
        { href: "/directions", label: "أزاي أروح ؟", description: "تخطيط رحلتك واختيار المسار الأسرع", imgLogo: ASSETS.icons2d.egypt },
        { href: "/ai-planner", label: "مخطط الرحلات الذكي", description: "تخطيط خروجتك بالذكاء الاصطناعي", imgLogo: ASSETS.icons2d.ai },
        { href: "/places", label: "دليل الأماكن", description: "المتاجر والمحلات والأماكن الحيوية", imgLogo: ASSETS.icons2d.shop },
        { href: "/map", label: "الخريطة التفاعلية", description: "استكشاف الأماكن وموقعي على الخريطة", imgLogo: ASSETS.icons2d.cairo },
        { href: "/help", label: "المساعدة والدعم", description: "الأسئلة الشائعة والدعم الفني", imgLogo: ASSETS.icons2d.cairoLogo },
      ],
    },
  ];

  const isServicesActive = servicesColumns.some(col => col.items.some(item => pathname === item.href));

  if (pathname?.startsWith("/admin")) return null;

  /* ── Navbar ── */
  return (
    <nav ref={navRef} className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <Image
            src={ASSETS.branding.qareebNoBGLight}
            alt="قريب"
            width={160}
            height={48}
            priority
            className="logo-img-dark"
            style={{ height: "48px", width: "auto", objectFit: "contain" }}
          />
          <Image
            src={ASSETS.branding.qareebNoBGDark}
            alt="قريب "
            width={160}
            height={48}
            priority
            className="logo-img-light"
            style={{ height: "48px", width: "auto", objectFit: "contain" }}
          />
        </Link>

        {/* Desktop Links (Modern Animated Dropdown Navigation) */}
        <div
          className="navbar-links"
          onMouseLeave={() => {
            setOpenDropdown(null);
            setHoveredLink(null);
          }}
        >
          {/* Main Link: Home */}
          <Link
            href="/"
            className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-300 rounded-full flex items-center ${
              pathname === "/" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
            onMouseEnter={() => {
              setHoveredLink("/");
              setOpenDropdown(null);
            }}
          >
            <span className="relative z-10">الصفحة الرئيسية</span>
            {(hoveredLink === "/" || (pathname === "/" && !hoveredLink)) && (
              <motion.div
                layoutId="navbar-hover-capsule"
                className="absolute inset-0 size-full bg-primary/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
          </Link>

          {/* Main Link: Map */}
          <Link
            href="/map"
            className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-300 rounded-full flex items-center ${
              pathname === "/map" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
            onMouseEnter={() => {
              setHoveredLink("/map");
              setOpenDropdown(null);
            }}
          >
            <span className="relative z-10">الخريطة</span>
            {(hoveredLink === "/map" || (pathname === "/map" && !hoveredLink)) && (
              <motion.div
                layoutId="navbar-hover-capsule"
                className="absolute inset-0 size-full bg-primary/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
          </Link>

          {/* Dropdown: Services Mega Menu */}
          <div
            className="relative"
            onMouseEnter={() => {
              setOpenDropdown("services");
              setHoveredLink("services");
            }}
          >
            <button
              type="button"
              className={`relative px-4 py-1.5 text-sm font-medium bg-transparent duration-300 rounded-full flex items-center gap-1 cursor-pointer group border-none ${
                openDropdown === "services" || isServicesActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="relative z-10">الخدمات</span>
              <ChevronDown
                className={`h-4 w-4 relative z-10 transition-transform duration-300 ${
                  openDropdown === "services" ? "rotate-180" : "group-hover:rotate-180"
                }`}
              />
              {(hoveredLink === "services" || openDropdown === "services" || (isServicesActive && !hoveredLink)) && (
                <motion.div
                  layoutId="navbar-hover-capsule"
                  className="absolute inset-0 size-full bg-primary/10 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </button>

            <AnimatePresence>
              {openDropdown === "services" && (
                <div className="bg-secondary absolute right-0 top-full mt-3 z-50 rounded-2xl">
                  <motion.div
                    className="bg-background/95 backdrop-blur-xl border border-border p-5 rounded-2xl shadow-2xl w-max"
                    layoutId="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex gap-7 overflow-hidden text-right">
                      {servicesColumns.map((col) => (
                        <motion.div layout className="w-60" key={col.title}>
                          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                            {col.title}
                          </h3>
                          <ul className="space-y-2.5">
                            {col.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className="flex items-start gap-3 p-1.5 rounded-xl group transition-colors duration-200 hover:bg-accent"
                                >
                                  <div className="border border-border text-foreground rounded-lg flex items-center justify-center size-9 shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                                    <Image
                                      src={item.imgLogo ? (item.imgLogo.startsWith("/") ? item.imgLogo : `/images/icons2d/${item.imgLogo}`) : ""}
                                      alt={item.label}
                                      width={20}
                                      height={20}
                                      className="object-contain"
                                    />
                                  </div>
                                  <div className="leading-5 w-max">
                                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors shrink-0">
                                      {item.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors shrink-0 line-clamp-1 max-w-[170px]">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Link: Blog */}
          <Link
            href="/blog"
            className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-300 rounded-full flex items-center ${
              pathname === "/blog" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
            onMouseEnter={() => {
              setHoveredLink("/blog");
              setOpenDropdown(null);
            }}
          >
            <span className="relative z-10">المدونة والمقالات</span>
            {(hoveredLink === "/blog" || (pathname === "/blog" && !hoveredLink)) && (
              <motion.div
                layoutId="navbar-hover-capsule"
                className="absolute inset-0 size-full bg-primary/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
          </Link>
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
                  <span style={{ fontSize: "0.85rem", fontWeight: "500", fontFamily: "var(--font-body)" }}>تسجيل الدخول</span>
                </>
              )}
            </button>
            <div className="navbar-auth-menu heroui-dropdown">
              {user ? (
                <>
                  <div className="heroui-dropdown-header">
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>تم تسجيل الدخول كـ</p>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "var(--color-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
        <div ref={mobileMenuRef} className="navbar-mobile-menu">
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
                          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px" }}
                        >
                          {sub.imgLogo ? (
                            <Image
                              src={sub.imgLogo.startsWith("/") ? sub.imgLogo : `/images/icons2d/${sub.imgLogo}`}
                              alt={sub.label}
                              width={22}
                              height={22}
                              style={{ width: "22px", height: "22px", objectFit: "contain", flexShrink: 0 }}
                            />
                          ) : (
                            <i className={sub.icon} style={{ fontSize: "1.1rem", marginLeft: "8px" }} />
                          )}
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "700", fontSize: "0.86rem" }}>{sub.label}</span>
                            {sub.subtitle && (
                              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "1px" }}>{sub.subtitle}</span>
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
            <Link href="/login" className="navbar-mobile-link" style={{ color: "var(--color-primary)", fontWeight: "700" }} onClick={() => setMenuOpen(false)}>
              تسجيل الدخول
            </Link>
          )}
          <button
            onClick={() => { toggleTheme(); }}
            className="navbar-mobile-link"
            style={{
              width: "100%",
              background: "none",
              border: "none",
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              color: "var(--color-foreground)",
              marginTop: "6px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-glass)"
            }}
          >
            <i className={theme === "dark" ? "bx bx-sun" : "bx bx-moon"} style={{ fontSize: "1.2rem", marginLeft: "8px" }} />
            <span>{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</span>
          </button>
        </div>
      )}

      {/* ── نافذة تأكيد تسجيل الخروج المعتمة (Logout Confirmation Modal) ── */}
      <CustomModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟"
        iconSrc={ASSETS.icons3d.alert}
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
          bgColor: "var(--btn-cancel)",
        }}
      />
    </nav>
  );
}
