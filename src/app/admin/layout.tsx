"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingPointsCount, setPendingPointsCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

  // Global Search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState<{
    places: any[];
    profiles: any[];
    pages: any[];
  }>({ places: [], profiles: [], pages: [] });
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [showGlobalResults, setShowGlobalResults] = useState(false);

  // Debounced global search effect
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setGlobalSearchResults({ places: [], profiles: [], pages: [] });
      setShowGlobalResults(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearchingGlobal(true);
      setShowGlobalResults(true);
      try {
        const term = globalSearchQuery.toLowerCase();

        // 1. Search in local page routes (Quick Navigation Link matches)
        const allAdminPages = [
          { label: "لوحة الإحصائيات الرئيسية", href: "/admin", category: "صفحة إدارية", icon: "bx bx-grid-alt" },
          { label: "إدارة الأماكن والمواقع", href: "/admin/places", category: "صفحة إدارية", icon: "bx bx-map" },
          { label: "اقتراحات الأماكن والمواقع", href: "/admin/places/suggestions", category: "صفحة إدارية", icon: "bx bx-map-pin" },
          { label: "إدارة الإعلانات والبنرات", href: "/admin/ads", category: "صفحة إدارية", icon: "bx bx-slideshow" },
          { label: "إدارة تنبيهات الموقع", href: "/admin/alerts", category: "صفحة إدارية", icon: "bx bx-info-circle" },
          { label: "الإشعارات والرسائل الجماعية", href: "/admin/notifications", category: "صفحة إدارية", icon: "bx bx-bell" },
          { label: "البلاغات والشكاوى", href: "/admin/reports", category: "صفحة إدارية", icon: "bx bx-error-circle" },
          { label: "الرصيد والشحن المالي", href: "/admin/points?tab=users", category: "صفحة إدارية", icon: "bx bx-coin-stack" },
          { label: "طلبات الإيداع والسحب المعلقة", href: "/admin/points?tab=requests", category: "صفحة إدارية", icon: "bx bx-transfer" },
          { label: "الاشتراكات المميزة والذهبية", href: "/admin/subscriptions", category: "صفحة إدارية", icon: "bx bx-crown" },
          { label: "إدارة المطارات", href: "/admin/airports", category: "خدمة موقع", icon: "bx bx-plane" },
          { label: "إدارة الموانئ البحرية", href: "/admin/ports", category: "خدمة موقع", icon: "bx bx-anchor" },
          { label: "إدارة شبكة المنوريل", href: "/admin/monorail", category: "خدمة موقع", icon: "bx bx-navigation" },
          { label: "إدارة القطار الكهربائي LRT", href: "/admin/lrt", category: "خدمة موقع", icon: "bx bx-train" },
          { label: "إدارة مترو الأنفاق", href: "/admin/metro", category: "خدمة موقع", icon: "bx bxs-train" },
          { label: "إدارة سكك حديد مصر", href: "/admin/railways", category: "خدمة موقع", icon: "bx bx-train" },
          { label: "إدارة مواقف السرفيس", href: "/admin/microbus-stations", category: "خدمة موقع", icon: "bx bx-map-pin" },
          { label: "إدارة الأتوبيسات وسوبرجيت", href: "/admin/bus-stations", category: "خدمة موقع", icon: "bx bx-bus" },
          { label: "إدارة دليل الهواتف والأكواد", href: "/admin/directory", category: "خدمة موقع", icon: "bx bx-phone-call" },
          { label: "إدارة خطوط المواصلات والاتجاهات (ازاي اروح)", href: "/admin/directions", category: "خدمة موقع", icon: "bx bx-compass" }
        ];

        const matchedPages = allAdminPages.filter(p => p.label.includes(term));

        // 2. Fetch from places table matching term (limit 5)
        let matchedPlaces: any[] = [];
        if (supabase) {
          const { data: placesData } = await supabase
            .from("places")
            .select("id, name, description, address")
            .ilike("name", `%${term}%`)
            .limit(5);
          matchedPlaces = placesData || [];
        }

        // 3. Fetch from profiles table matching name or email (limit 5)
        let matchedProfiles: any[] = [];
        if (supabase) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email, username")
            .or(`full_name.ilike.%${term}%,email.ilike.%${term}%,username.ilike.%${term}%`)
            .limit(5);
          matchedProfiles = profilesData || [];
        }

        setGlobalSearchResults({
          pages: matchedPages,
          places: matchedPlaces,
          profiles: matchedProfiles
        });
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [globalSearchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.globalSearchContainer}`)) {
        setShowGlobalResults(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Initialize and sync sub tab and dropdown state on path changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActiveSubTab(params.get("tab"));
    }

    if (pathname === "/admin/places" || pathname === "/admin/airports" || pathname === "/admin/ports" || pathname === "/admin/directory" || pathname === "/admin/monorail" || pathname === "/admin/lrt" || pathname === "/admin/metro" || pathname === "/admin/railways" || pathname === "/admin/bus-stations" || pathname === "/admin/microbus-stations") {
      setIsServicesDropdownOpen(true);
    }
  }, [pathname]);

  // Track window resizing for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Close sidebar on mobile load
      } else {
        setIsSidebarOpen(true);  // Open sidebar on desktop load
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Theme observer: sync with localStorage & HTML class
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

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dftry_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  const fetchPendingCounts = async () => {
    if (!supabase || !user) return;
    try {
      const [placeReportsRes, appFeedbackRes, contactMessagesRes, balanceTransactionsRes] = await Promise.all([
        supabase
          .from("place_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("app_feedback")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("balance_transactions")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      const reportsCount = (placeReportsRes.count || 0) + (appFeedbackRes.count || 0) + (contactMessagesRes.count || 0);
      const pointsCount = balanceTransactionsRes.count || 0;

      setPendingReportsCount(reportsCount);
      setPendingPointsCount(pointsCount);
    } catch (err) {
      console.error("Error fetching pending counts:", err);
    }
  };

  useEffect(() => {
    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 30000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  // Helper to extract a friendly admin username
  const adminName = profile?.full_name || user?.email?.split("@")[0] || "مدير النظام";
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(adminName)}&backgroundType=gradientLinear`;

  const handleLogout = async () => {
    if (confirm("هل أنت متأكد من رغبتك في تسجيل الخروج؟")) {
      await logout();
      router.push("/login");
    }
  };

  // Get current page header title
  let pageTitle = "لوحة التحكم";
  if (pathname === "/admin") pageTitle = "لوحة الإحصائيات";
  else if (pathname === "/admin/places") pageTitle = "إدارة الأماكن";
  else if (pathname === "/admin/places/suggestions") pageTitle = "اقتراحات الأماكن";
  else if (pathname === "/admin/ads") pageTitle = "إدارة الإعلانات";
  else if (pathname === "/admin/airports") pageTitle = "إدارة المطارات";
  else if (pathname === "/admin/ports") pageTitle = "إدارة الموانئ البحرية";
  else if (pathname === "/admin/monorail") pageTitle = "إدارة شبكة المنوريل";
  else if (pathname === "/admin/lrt") pageTitle = "إدارة القطار الكهربائي LRT";
  else if (pathname === "/admin/metro") pageTitle = "إدارة مترو الأنفاق";
  else if (pathname === "/admin/railways") pageTitle = "إدارة سكك حديد مصر";
  else if (pathname === "/admin/bus-stations") pageTitle = "إدارة الأتوبيسات (سوبرجيت)";
  else if (pathname === "/admin/microbus-stations") pageTitle = "إدارة مواقف السرفيس";
  else if (pathname === "/admin/directions") pageTitle = "إدارة ازاي اروح (خطوط المواصلات)";
  else if (pathname === "/admin/directory") pageTitle = "دليل الهواتف والأكواد";
  else if (pathname === "/admin/notifications") pageTitle = "الإشعارات والرسائل";
  else if (pathname === "/admin/alerts") pageTitle = "تنبيهات الموقع";
  else if (pathname === "/admin/reports") pageTitle = "البلاغات والشكاوى";
  else if (pathname === "/admin/points") {
    if (activeSubTab === "requests") pageTitle = "طلبات الإيداع والسحب";
    else pageTitle = "الرصيد والشحن";
  }
  else if (pathname === "/admin/subscriptions") pageTitle = "الاشتراكات المميزة";

  // Compute greeting based on time
  const currentHour = new Date().getHours();
  let greetingText = "مساء الخير";
  let greetingIcon = "bx-moon";
  if (currentHour >= 5 && currentHour < 12) {
    greetingText = "صباح الخير";
    greetingIcon = "bx-sun";
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingText = "مساء الخير";
    greetingIcon = "bx-sun";
  }

  return (
    <div className={`${styles.adminShell} ${theme === "light" ? "light" : ""}`}>
      {/* ── Mobile Backdrop ── */}
      {isMobile && isSidebarOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarInner}>
          {/* Profile Section */}
          <div className={styles.sidebarProfile}>
            <div className={styles.profileAvatarWrapper}>
              <img src={avatarUrl} alt={adminName} className={styles.profileAvatar} />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>{adminName}</h3>
              <span className={styles.profileRole}>
                {profile?.is_admin ? "أدمن" : "مشرف"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={styles.sidebarNav}>
            {/* ── الرئيسية والإحصائيات ── */}
            <div className={styles.sidebarGroupLabel}>الرئيسية والإحصائيات</div>
            <Link
              href="/admin"
              className={`${styles.sidebarNavLink} ${pathname === "/admin" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-grid-alt ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>لوحة الإحصائيات</span>
              </div>
            </Link>

            {/* ── إدارة الخدمات (مسطحة) ── */}
            <div className={styles.sidebarGroupLabel}>الخدمات والمواقع</div>

            {/* إدارة الأماكن */}
            <Link
              href="/admin/places"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/places" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-map ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>إدارة الأماكن</span>
              </div>
            </Link>

            <Link
              href="/admin/places/suggestions"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/places/suggestions" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-map-pin ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>اقتراحات الأماكن</span>
              </div>
            </Link>

            {/* المطارات */}
            <Link
              href="/admin/airports"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/airports" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`fa fa-plane ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>المطارات</span>
              </div>
            </Link>

            {/* الموانئ */}
            <Link
              href="/admin/ports"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/ports" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-anchor ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>الموانئ</span>
              </div>
            </Link>

            {/* المنوريل */}
            <Link
              href="/admin/monorail"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/monorail" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`fa fa-train ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>المنوريل</span>
              </div>
            </Link>

            {/* القطار الكهربائي LRT */}
            <Link
              href="/admin/lrt"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/lrt" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-train ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>القطار الكهربائي LRT</span>
              </div>
            </Link>

            {/* مترو الأنفاق */}
            <Link
              href="/admin/metro"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/metro" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bxs-train ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>مترو الأنفاق</span>
              </div>
            </Link>

            {/* سكك حديد مصر */}
            <Link
              href="/admin/railways"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/railways" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-train ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>سكك حديد مصر</span>
              </div>
            </Link>

            {/* الأتوبيسات */}
            <Link
              href="/admin/bus-stations"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/bus-stations" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-bus ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>الأتوبيسات (سوبرجيت)</span>
              </div>
            </Link>

            {/* المواقف سرفيس */}
            <Link
              href="/admin/microbus-stations"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/microbus-stations" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                setActiveSubTab(null);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-map-pin ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>المواقف (سرفيس)</span>
              </div>
            </Link>

            {/* دليل الهواتف والأكواد */}
            <Link
              href="/admin/directory"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/directory" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-phone-call ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>دليل الهواتف والأكواد</span>
              </div>
            </Link>

            {/* إدارة ازاي اروح (خطوط المواصلات) */}
            <Link
              href="/admin/directions"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/directions" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-compass ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>إدارة ازاي اروح</span>
              </div>
            </Link>

            {/* ── إدارة المحتوى والتنبيهات ── */}
            <div className={styles.sidebarGroupLabel}>المحتوى والإعلانات</div>

            {/* إدارة الإعلانات */}
            <Link
              href="/admin/ads"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/ads" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-slideshow ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>إدارة الإعلانات</span>
              </div>
            </Link>

            {/* تنبيهات الموقع */}
            <Link
              href="/admin/alerts"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/alerts" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-info-circle ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>تنبيهات الموقع</span>
              </div>
            </Link>

            {/* ── الدعم والتفاعل ── */}
            <div className={styles.sidebarGroupLabel}>التفاعل والدعم</div>

            {/* الإشعارات والرسائل */}
            <Link
              href="/admin/notifications"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/notifications" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-bell ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>الإشعارات والرسائل</span>
              </div>
            </Link>

            {/* البلاغات والشكاوى */}
            <Link
              href="/admin/reports"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/reports" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-error-circle ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>البلاغات والشكاوى</span>
              </div>
              {pendingReportsCount > 0 && (
                <span className={styles.sidebarBadge} title={`هناك ${pendingReportsCount} معلقة`}>
                  {pendingReportsCount}
                </span>
              )}
            </Link>

            {/* ── الرصيد والاشتراكات ── */}
            <div className={styles.sidebarGroupLabel}>المالية والاشتراكات</div>

            {/* الرصيد والشحن */}
            <Link
              href="/admin/points?tab=users"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/points" && (activeSubTab === "users" || !activeSubTab) ? styles.sidebarNavLinkActive : ""
                }`}
              onClick={() => {
                setActiveSubTab("users");
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-coin-stack ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>الرصيد والشحن</span>
              </div>
            </Link>

            {/* طلبات الإيداع والسحب */}
            <Link
              href="/admin/points?tab=requests"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/points" && activeSubTab === "requests" ? styles.sidebarNavLinkActive : ""
                }`}
              onClick={() => {
                setActiveSubTab("requests");
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-transfer ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>طلبات الإيداع والسحب</span>
              </div>
              {pendingPointsCount > 0 && (
                <span className={styles.sidebarBadge} title={`هناك ${pendingPointsCount} معلقة`}>
                  {pendingPointsCount}
                </span>
              )}
            </Link>

            {/* الاشتراكات المميزة */}
            <Link
              href="/admin/subscriptions"
              className={`${styles.sidebarNavLink} ${pathname === "/admin/subscriptions" ? styles.sidebarNavLinkActive : ""}`}
              onClick={() => {
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={styles.linkLeftGroup}>
                <i className={`bx bx-crown ${styles.linkIcon}`} />
                <span className={styles.linkLabel}>الاشتراكات المميزة</span>
              </div>
            </Link>
          </nav>

          {/* Sidebar Footer Operations */}
          <div className={styles.sidebarFooter}>
            {/* Theme Toggle Button */}
            <button style={{ fontFamily: "var(--font-heading)" }} className={styles.sidebarFooterBtn} onClick={toggleTheme} title="تغيير المظهر">
              <i className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"} ${styles.footerBtnIcon}`} />
              <span>{theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}</span>
            </button>

            {/* Back to Home site */}
            <Link style={{ fontFamily: "var(--font-heading)" }} href="/" className={styles.sidebarFooterBtn} title="زيارة الموقع">
              <i className="bx bx-home-alt-2" />
              <span>العودة للموقع</span>
            </Link>

            {/* Logout Button */}
            <button style={{ fontFamily: "var(--font-heading)" }} className={`${styles.sidebarFooterBtn} ${styles.logoutBtn}`} onClick={handleLogout} title="تسجيل الخروج">
              <i className="bx bx-log-out" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className={`${styles.contentWrapper} ${isSidebarOpen ? styles.contentWithSidebar : styles.contentFullWidth}`}>
        {/* Topbar Header */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            {/* Sidebar Toggle Trigger */}
            <button
              className={styles.sidebarToggle}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              <i className={`bx ${isSidebarOpen ? "bx-menu-alt-right" : "bx-menu"}`} />
            </button>

            {/* Welcome Greeting / Page Title */}
            <div className={styles.topbarGreeting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 className={styles.greetingTitle} style={{ margin: 0 }}>{greetingText}، {adminName}</h1>
            </div>
          </div>

          <div className={styles.topbarRight}>
            {/* Global Search Box */}
            <div className={styles.globalSearchContainer}>
              <div className={styles.globalSearchInputWrapper}>
                {isSearchingGlobal
                  ? <i className="bx bx-loader-alt" style={{ fontSize: "1.1rem", animation: "spin 1s linear infinite" }} />
                  : <i className="bx bx-search" style={{ fontSize: "1.1rem" }} />
                }
                <input
                  className={styles.globalSearchInput}
                  type="text"
                  placeholder="ابحث  ..."
                  value={globalSearchQuery}
                  onChange={e => setGlobalSearchQuery(e.target.value)}
                  onFocus={() => { if (globalSearchQuery.trim()) setShowGlobalResults(true); }}
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => { setGlobalSearchQuery(""); setShowGlobalResults(false); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center" }}
                  >
                    <i className="bx bx-x" style={{ fontSize: "1.1rem" }} />
                  </button>
                )}
              </div>

              {showGlobalResults && (
                <div className={styles.globalSearchDropdown}>
                  {/* Pages */}
                  {globalSearchResults.pages.length > 0 && (
                    <div className={styles.globalSearchSection}>
                      <div className={styles.globalSearchSectionTitle}>
                        <i className="bx bx-link" /> صفحات إدارية
                      </div>
                      {globalSearchResults.pages.map((page, i) => (
                        <button
                          key={i}
                          className={styles.globalSearchItem}
                          onClick={() => { router.push(page.href); setShowGlobalResults(false); setGlobalSearchQuery(""); }}
                        >
                          <i className={`${page.icon} ${styles.globalSearchItemIcon}`} />
                          <div className={styles.globalSearchItemContent}>
                            <span className={styles.globalSearchItemLabel}>{page.label}</span>
                            <span className={styles.globalSearchItemMeta}>{page.category}</span>
                          </div>
                          <i className="bx bx-chevron-left" style={{ opacity: 0.4 }} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Places */}
                  {globalSearchResults.places.length > 0 && (
                    <div className={styles.globalSearchSection}>
                      <div className={styles.globalSearchSectionTitle}>
                        <i className="bx bx-map" /> أماكن ومواقع
                      </div>
                      {globalSearchResults.places.map((place, i) => (
                        <button
                          key={i}
                          className={styles.globalSearchItem}
                          onClick={() => { router.push("/admin/places"); setShowGlobalResults(false); setGlobalSearchQuery(""); }}
                        >
                          <i className={`bx bx-map-pin ${styles.globalSearchItemIcon}`} style={{ color: "#10b981" }} />
                          <div className={styles.globalSearchItemContent}>
                            <span className={styles.globalSearchItemLabel}>{place.name}</span>
                            <span className={styles.globalSearchItemMeta}>{place.address || "مكان مسجل"}</span>
                          </div>
                          <i className="bx bx-chevron-left" style={{ opacity: 0.4 }} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Profiles */}
                  {globalSearchResults.profiles.length > 0 && (
                    <div className={styles.globalSearchSection}>
                      <div className={styles.globalSearchSectionTitle}>
                        <i className="bx bx-user" /> مستخدمون ومشتركون
                      </div>
                      {globalSearchResults.profiles.map((p, i) => (
                        <button
                          key={i}
                          className={styles.globalSearchItem}
                          onClick={() => { router.push("/admin"); setShowGlobalResults(false); setGlobalSearchQuery(""); }}
                        >
                          <i className={`bx bx-user-circle ${styles.globalSearchItemIcon}`} style={{ color: "#818cf8" }} />
                          <div className={styles.globalSearchItemContent}>
                            <span className={styles.globalSearchItemLabel}>{p.full_name || p.username || "مستخدم"}</span>
                            <span className={styles.globalSearchItemMeta}>{p.email}</span>
                          </div>
                          <i className="bx bx-chevron-left" style={{ opacity: 0.4 }} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {!isSearchingGlobal &&
                    globalSearchResults.pages.length === 0 &&
                    globalSearchResults.places.length === 0 &&
                    globalSearchResults.profiles.length === 0 && (
                      <div className={styles.globalSearchNoResults}>
                        <i className="bx bx-search-alt" style={{ fontSize: "2rem", opacity: 0.3 }} />
                        <span>لا توجد نتائج لـ "{globalSearchQuery}"</span>
                      </div>
                    )}
                </div>
              )}
            </div>
            {/* Invite Button */}

          </div>
        </header>

        {/* Dynamic Children Content */}
        <main className={styles.mainBody}>
          {children}
        </main>
      </div>
    </div>
  );
}

