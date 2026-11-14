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
import { IconCircleCaretDownFilled, IconFolderOpenFilled, IconHomeFilled, IconLibraryFilled, IconLogout, IconMapPinFilled, IconTableFilled, IconUserFilled } from "@tabler/icons-react";

interface NavSubItem {
  href: string;
  label: string;
  subtitle?: string;
  imgLogo?: string;
  icon?: React.ReactNode;
}

interface NavLink {
  href?: string;
  label: string;
  icon: React.ReactNode;
  isDropdown?: boolean;
  subItems?: NavSubItem[];
}

function renderNavIcon(icon?: React.ReactNode, extraStyle?: React.CSSProperties) {
  if (!icon) return null;
  if (typeof icon === "string") {
    return <i className={icon} style={{ fontSize: "1.15rem", marginLeft: "8px", flexShrink: 0, ...extraStyle }} />;
  }
  return (
    <span
      className="nav-icon-wrapper"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "8px",
        flexShrink: 0,
        ...extraStyle,
      }}
    >
      {React.isValidElement(icon) && !(icon.props as any).size
        ? React.cloneElement(icon as React.ReactElement<any>, { size: 19 })
        : icon}
    </span>
  );
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
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on screen resize to mobile or click outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setOpenDropdown(null);
        setHoveredLink(null);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    const initial =
      pathname === "/map"
        ? "light"
        : saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
    document.documentElement.classList.toggle("dark", initial !== "light");

    const handleGlobalThemeChange = (e: any) => {
      const nextTheme = pathname === "/map" ? "light" : e.detail;
      setTheme(nextTheme);
      document.documentElement.classList.toggle("light", nextTheme === "light");
      document.documentElement.classList.toggle("dark", nextTheme !== "light");
    };
    window.addEventListener("themechange", handleGlobalThemeChange);
    return () => window.removeEventListener("themechange", handleGlobalThemeChange);
  }, [pathname]);

  // Close menu on auth pages
  useEffect(() => {
    if (isAuthPage) setMenuOpen(false);
  }, [isAuthPage]);

  const toggleTheme = () => {
    if (pathname === "/map") return;
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dftry_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next !== "light");
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  // ── قائمة الروابط الرئيسية للموقع ──
  const mainLinks: NavLink[] = [
    { href: "/", label: "الصفحة الرئيسية", icon: <IconHomeFilled /> },
    { href: "/map", label: "الخريطة", icon: <IconMapPinFilled /> },
    {
      label: "الخدمات",
      isDropdown: true,
      icon: <IconFolderOpenFilled />,
      subItems: [
        { href: "/save-location", label: "أحفظ مكاني", subtitle: "حفظ موقعك الحالي بدقة 100% ورابط خرائط جوجل", imgLogo: ASSETS.threeD.street },
        { href: "/map", label: "خريطة الأماكن التفاعلية", subtitle: "استكشاف الأماكن وموقعي على الخريطة", imgLogo: ASSETS.threeD.maps },
        { href: "/places", label: "دليل الأماكن", subtitle: "المتاجر والمحلات والأماكن", imgLogo: ASSETS.services.places },
        { href: "/directory", label: "دليل الهاتف", subtitle: "أرقام الخدمات وأكواد الشبكات", imgLogo: ASSETS.company.vodafone },
        { href: "/parking", label: "دليل الجراجات", subtitle: "أقرب جراج وركنة بجوار المترو", imgLogo: ASSETS.transit.parking },
        { href: "/metro", label: "مترو الأنفاق", subtitle: "محطات وأسعار تذاكر المترو", imgLogo: ASSETS.transit.metro },
        { href: "/monorail", label: "خريطة المنورايل", subtitle: "محطات وأسعار تذاكر المونوريل", imgLogo: ASSETS.transit.monorail },
        { href: "/lrt", label: "القطار الكهربائي", subtitle: "محطات ومواعيد القطار الكهربائي", imgLogo: ASSETS.transit.lrt },
        { href: "/brt", label: "الأتوبيس الترددي", subtitle: "محطات ومسارات الأتوبيس على الدائري", imgLogo: ASSETS.transit.brt },
        { href: "/railways", label: "سكك حديد مصر", subtitle: "قطارات القاهرة والمحافظات", imgLogo: ASSETS.transit.train },
        { href: "/airports", label: "المطارات", subtitle: "معلومات مطار القاهرة والرحلات", imgLogo: ASSETS.transit.airport },
        { href: "/ports", label: "الموانئ", subtitle: "الموانئ المائية والملاحية المصرية", imgLogo: ASSETS.transit.ports },
        { href: "/bus-stations", label: "مواقف الأتوبيسات", subtitle: "محطات النقل العام بالقاهرة والجيزة", imgLogo: ASSETS.transit.bus },
        { href: "/microbus-stations", label: "مواقف الميكروباص", subtitle: "خطوط السرفيس بين المحافظات", imgLogo: ASSETS.transit.microbus },
        { href: "/roads-info", label: "معلومات الطرق والسرعات", subtitle: "الطقس، السرعات المقررة، وأخبار الطرق", imgLogo: ASSETS.transit.car },
        { href: "/directions", label: "أزاي أروح ؟", subtitle: "ازاي اروح من ... ل ...", imgLogo: ASSETS.locations.governorates.egypt },
        { href: "/ai-planner", label: "مخطط الرحلات الذكي", subtitle: "تخطيط خروجتك بالذكاء الاصطناعي", imgLogo: ASSETS.threeD.robot },
        { href: "/had-yaaraf", label: "حد يعرف ؟", subtitle: "اسأل مجتمع قريب وجاوب وتفاعل مع الناس", imgLogo: ASSETS.threeD.lamp },
        { href: "/doc", label: "التوثيق وسجل التحديثات", subtitle: "سجل التحديثات والمميزات وخريطة الطريق", imgLogo: ASSETS.threeD.book },
        { href: "/help", label: "المساعدة والدعم", subtitle: "الأسئلة الشائعة والدعم الفني", imgLogo: ASSETS.branding.qareebNoBgBlue },
      ]
    },
    { href: "/blog", label: "المدونة والمقالات", icon: <IconLibraryFilled /> },
    { href: "/doc", label: "التوثيق والتحديثات", icon: <IconTableFilled /> },
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
        { href: "/metro", label: "مترو الأنفاق", description: "محطات وأسعار تذاكر المترو", imgLogo: ASSETS.transit.metro },
        { href: "/monorail", label: "خريطة المونوريل", description: "محطات وأسعار تذاكر المونوريل", imgLogo: ASSETS.transit.monorail },
        { href: "/lrt", label: "القطار الكهربائي", description: "محطات ومواعيد قطار العاصمة", imgLogo: ASSETS.transit.lrt },
        { href: "/brt", label: "الأتوبيس الترددي", description: "محطات ومسارات الأتوبيس على الدائري", imgLogo: ASSETS.transit.brt },
        { href: "/railways", label: "سكك حديد مصر", description: "قطارات القاهرة والمحافظات", imgLogo: ASSETS.transit.train },
        { href: "/airports", label: "المطارات والموانئ", description: "مطار القاهرة والموانئ المصرية", imgLogo: ASSETS.transit.airport },
        { href: "/ports", label: "الموانئ البحرية", description: "الموانئ البحرية المصرية", imgLogo: ASSETS.transit.ports },
      ],
    },
    {
      title: "المواقف والطرق",
      items: [
        { href: "/bus-stations", label: "مواقف الأتوبيسات", description: "محطات النقل العام بالقاهرة والجيزة", imgLogo: ASSETS.transit.bus },
        { href: "/microbus-stations", label: "مواقف الميكروباص", description: "خطوط السرفيس بين المحافظات", imgLogo: ASSETS.transit.microbus },
        { href: "/parking", label: "دليل الجراجات", description: "أقرب جراج وركنة بجوار المترو", imgLogo: ASSETS.transit.parking },
        { href: "/roads-info", label: "معلومات الطرق والسرعات", description: "الطقس، السرعات المقررة، وأخبار الطرق", imgLogo: ASSETS.transit.car },
        { href: "/directory", label: "دليل الهاتف", description: "أرقام الخدمات وأكواد الشبكات", imgLogo: ASSETS.company.vodafone },
      ],
    },
    {
      title: "استكشاف وأدوات ذكية",
      items: [
        { href: "/save-location", label: "أحفظ مكاني", description: "حفظ موقعك الحالي بدقة 100%", imgLogo: ASSETS.services.saveLocation },
        { href: "/directions", label: "أزاي أروح ؟", description: "تخطيط رحلتك واختيار المسار الأسرع", imgLogo: ASSETS.locations.governorates.egypt },
        { href: "/ai-planner", label: "مخطط الرحلات الذكي", description: "تخطيط خروجتك بالذكاء الاصطناعي", imgLogo: ASSETS.threeD.robot },
        { href: "/places", label: "دليل الأماكن", description: "المتاجر والمحلات والأماكن الحيوية", imgLogo: ASSETS.services.places },
        { href: "/map", label: "الخريطة التفاعلية", description: "استكشاف الأماكن وموقعي على الخريطة", imgLogo: ASSETS.threeD.maps },
        { href: "/had-yaaraf", label: "حد يعرف ؟", description: "اسأل مجتمع قريب وجاوب وتفاعل", imgLogo: ASSETS.threeD.lamp },
        { href: "/doc", label: "التوثيق والتحديثات", description: "سجل التحديثات والمميزات وخريطة الطريق", imgLogo: ASSETS.threeD.book },
        { href: "/help", label: "المساعدة والدعم", description: "الأسئلة الشائعة والدعم الفني", imgLogo: ASSETS.branding.qareebNoBgBlue },
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
            className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-300 rounded-full flex items-center ${pathname === "/" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
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
            className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-300 rounded-full flex items-center ${pathname === "/map" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
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
            ref={servicesDropdownRef}
            className="navbar-item-dropdown relative"
            onMouseEnter={() => {
              if (typeof window !== "undefined" && window.innerWidth > 768) {
                setOpenDropdown("services");
                setHoveredLink("services");
              }
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpenDropdown((prev) => (prev === "services" ? null : "services"));
              }}
              className={`relative px-4 py-1.5 text-sm font-medium bg-transparent duration-300 rounded-full flex items-center gap-1 cursor-pointer group border-none outline-none ${openDropdown === "services" || isServicesActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
                }`}
              aria-expanded={openDropdown === "services"}
              aria-haspopup="true"
            >
              <span className="relative z-10">الخدمات</span>
              <ChevronDown
                className={`h-4 w-4 relative z-10 transition-transform duration-300 ${openDropdown === "services" ? "rotate-180" : "group-hover:rotate-180"
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
                <div className="services-dropdown-wrapper">
                  <motion.div
                    className="services-megamenu-panel shadow-2xl"
                    layoutId="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="services-megamenu-grid">
                      {servicesColumns.map((col) => (
                        <div className="services-megamenu-col" key={col.title}>
                          <h3 className="services-megamenu-col-title">
                            {col.title}
                          </h3>
                          <ul className="services-megamenu-items">
                            {col.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className="services-megamenu-item-link group"
                                >
                                  <div className="services-megamenu-icon-box">
                                    <Image
                                      src={item.imgLogo}
                                      alt={item.label}
                                      width={20}
                                      height={20}
                                      className="object-contain"
                                    />
                                  </div>
                                  <div className="services-megamenu-info">
                                    <p className="services-megamenu-item-title">
                                      {item.label}
                                    </p>
                                    <p className="services-megamenu-item-desc">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
          {/* Main Link: Docs */}
          <Link
            href="/doc"
            className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-300 rounded-full flex items-center ${pathname === "/" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            onMouseEnter={() => {
              setHoveredLink("/");
              setOpenDropdown(null);
            }}
          >
            <span className="relative z-10"> التوثيقات</span>
            {(hoveredLink === "/" || (pathname === "/" && !hoveredLink)) && (
              <motion.div
                layoutId="navbar-hover-capsule"
                className="absolute inset-0 size-full bg-primary/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
          </Link>
          {/* Main Link: Blog */}
          <Link
            href="/blog"
            className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-300 rounded-full flex items-center ${pathname === "/blog" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
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
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>أهلا يا</p>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "var(--color-fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} className="font-inter">
                      {profile?.name || user.user_metadata?.username || "حسابي"}
                    </p>
                  </div>
                  <div className="heroui-dropdown-divider"></div>
                </>
              ) : (
                <>
                  <div className="heroui-dropdown-header" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>سجل دخولك للوصول لجميع المزايا</p>
                    <Link href="/login" className="btn btn-primary w-100 py-2 fs-sm min-h-min">
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
                    className="flex py-3 px-4 rounded-md font-display fw-700 fs-md border-none bg-transparent color-fg"
                    onClick={() => toggleMobileDropdown(idx)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      {renderNavIcon(link.icon)}
                      <span>{link.label}</span>
                    </span>
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
                              src={sub.imgLogo}
                              alt={sub.label}
                              width={28}
                              height={28}
                              style={{ width: "28px", height: "28px", objectFit: "contain", flexShrink: 0 }}
                            />
                          ) : (
                            renderNavIcon(sub.icon)
                          )}
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className="fw-700 font-sub">{sub.label}</span>
                            {/* {sub.subtitle && (
                              <span className="fs-xs mt-1 font-sub">{sub.subtitle}</span>
                            )} */}
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
                className={`navbar-mobile-link font-display fw-700 fs-md border-none ${pathname === link.href ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center" }}
              >
                {renderNavIcon(link.icon)}
                <span>{link.label}</span>
              </Link>
            );
          })}
          {user ? (
            <>
              <Link href="/profile" className="flex py-3 px-4 font-display fw-700 fs-md border-none" onClick={() => setMenuOpen(false)}>
                <IconUserFilled />
                الحساب ({profile?.username || user.user_metadata?.username || "حسابي"}@)
              </Link>
              {/* Log Out */}
              <button
                onClick={() => { setShowLogoutModal(true); setMenuOpen(false); }}
                className="flex py-3 px-4 font-display fw-700 fs-md border-none color-error bg-transparent">
                <IconCircleCaretDownFilled size={24} className="ml-1" />
                تسجيل الخروج
              </button>
            </>
          ) : (
            <Link href="/login" className="flex py-3 px-4 font-display fw-700 fs-md border-none btn-primary rounded-xl" onClick={() => setMenuOpen(false)}>
              <IconUserFilled />
              تسجيل الدخول
            </Link>
          )}
          <button
            onClick={() => { toggleTheme(); }}
            className="flex py-3 px-4 font-display fw-700 fs-md border-none bg-transparent color-fg "
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
        iconSrc={ASSETS.threeD.alert}
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
