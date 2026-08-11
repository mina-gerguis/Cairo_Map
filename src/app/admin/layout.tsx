"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingPointsCount, setPendingPointsCount] = useState(0);

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

  const navItems = [
    { href: "/admin", label: " الأماكن", icon: "bx bx-grid-alt" },
    { href: "/admin/ads", label: "إدارة الإعلانات", icon: "bx bx-slideshow" },
    // { href: "/admin/directory", label: "دليل الهواتف", icon: "bx bx-book-bookmark" },
    // { href: "/admin/directions", label: "خطوط المواصلات", icon: "bx bx-compass" },
    { href: "/admin/services", label: "إدارة الخدمات", icon: "bx bx-git-merge" },
    { href: "/admin/notifications", label: "الإشعارات", icon: "bx bx-bell" },
    { href: "/admin/alerts", label: "تنبيهات الموقع", icon: "bx bx-info-circle" },
    { href: "/admin/reports", label: "البلاغات والشكاوى", icon: "bx bx-error-circle" },
    { href: "/admin/points", label: "الرصيد", icon: "bx bx-coin-stack" },
    { href: "/admin/subscriptions", label: "الاشتراكات", icon: "bx bx-crown" },
  ];

  return (
    <div className={styles.adminShell}>
      {/* ── Custom Admin Topbar Header ── */}
      <header className={styles.adminHeader}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup}>
            <Link href="/admin">
              <img
                src="/logo/darkMode_logo.png"
                alt="ماب القاهرة"
                className={styles.brandLogo}
              />
            </Link>
            <div className={styles.brandBadge}>
              <span className={styles.brandBadgeDot} />
              لوحة التحكم
            </div>
          </div>

          <nav className={styles.adminNav}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              let showBadge = false;
              let badgeCount = 0;
              if (item.href === "/admin/reports" && pendingReportsCount > 0) {
                showBadge = true;
                badgeCount = pendingReportsCount;
              } else if (item.href === "/admin/points" && pendingPointsCount > 0) {
                showBadge = true;
                badgeCount = pendingPointsCount;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  style={{
                    border: "1px solid var(--border-glass)",
                    borderRadius: "10px"
                  }}
                >
                  <i className={item.icon} style={{ fontSize: "1.1rem" }} />
                  <span>{item.label}</span>
                  {showBadge && (
                    <span 
                      className={styles.navBadgeDot} 
                      title={`هناك ${badgeCount} معلقة`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className={styles.headerActions}>
            <Link href="/" className={styles.backToSiteBtn}>
              <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className={styles.adminContent}>
        {children}
      </main>
    </div>
  );
}
