"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: "/admin", label: "الرئيسية والأماكن", icon: "bx bx-grid-alt" },
    { href: "/admin/directory", label: "الدليل الهاتفي والأكواد", icon: "bx bx-book-bookmark" },
    { href: "/admin/notifications", label: "الإشعارات الجماعية", icon: "bx bx-bell" },
    { href: "/admin/reports", label: "البلاغات والشكاوى", icon: "bx bx-error-circle" },
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
                alt="القاهرة ماب"
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  <i className={item.icon} style={{ fontSize: "1.1rem" }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.headerActions}>
            <Link href="/" className={styles.backToSiteBtn}>
              <i className="bx bx-left-arrow-alt" style={{ fontSize: "1.2rem" }} />
              <span>العودة للموقع</span>
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
