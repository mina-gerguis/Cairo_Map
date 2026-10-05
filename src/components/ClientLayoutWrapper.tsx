"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/lib/supabase";
import SiteAlertModal from "@/components/SiteAlertModal";
import ScrollToTop from "@/components/ScrollToTop";
import MobileInstallPrompt from "@/components/MobileInstallPrompt";
import { useAuth } from "@/context/AuthContext";
import {
  MaintenanceItem,
  isPathUnderMaintenance,
} from "@/lib/maintenance";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import MaintenanceAdminBanner from "@/components/MaintenanceAdminBanner";

interface AlertItem {
  id: string;
  title: string;
  content: string;
  type: "info" | "success" | "warning" | "danger";
  show_type: "first_time" | "every_time";
  target_page: string;
  expiry_date: string | null;
  image_url: string | null;
  is_active: boolean;
}

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const { profile, loading: authLoading } = useAuth();
  const isUserAdmin = Boolean(profile?.is_admin);

  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceItem[]>([]);
  const [maintenanceLoaded, setMaintenanceLoaded] = useState(false);

  // Global Ctrl+M keyboard shortcut for toggling between light and dark modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        const currentTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
        const next = currentTheme === "dark" ? "light" : "dark";

        localStorage.setItem("dftry_theme", next);
        document.documentElement.classList.toggle("light", next === "light");
        window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch & Subscribe to Maintenance Rules
  const fetchMaintenance = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("page_maintenance")
        .select("*")
        .eq("is_active", true);

      if (!error && data) {
        setMaintenanceRecords(data);
      }
    } catch (err) {
      console.warn("Could not check page_maintenance status:", err);
    } finally {
      setMaintenanceLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();

    if (!supabase) return;
    const channel = supabase
      .channel("public:page_maintenance_listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "page_maintenance" },
        () => {
          fetchMaintenance();
        }
      )
      .subscribe();

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchMaintenance]);

  // Check Site Alerts
  useEffect(() => {
    const client = supabase;
    if (isAdmin || isAuth || !client) return;

    const checkAndShowAlerts = async () => {
      try {
        const { data: rawAlerts, error } = await client
          .from("site_alerts")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error || !rawAlerts) {
          return;
        }

        const now = new Date();

        const eligibleAlerts = rawAlerts.filter((alert: AlertItem) => {
          if (alert.expiry_date && new Date(alert.expiry_date) < now) {
            return false;
          }

          const target = alert.target_page;
          const matchesPage = target === "all" || target === pathname || (target === "/" && pathname === "");
          if (!matchesPage) return false;

          const isPermanentlyDismissed = localStorage.getItem(`dismissed_alert_${alert.id}`) === "true";
          if (isPermanentlyDismissed) return false;

          const isSessionDismissed = sessionStorage.getItem(`dismissed_session_alert_${alert.id}`) === "true";
          if (isSessionDismissed) return false;

          return true;
        });

        if (eligibleAlerts.length > 0) {
          setActiveAlert(eligibleAlerts[0]);
        } else {
          setActiveAlert(null);
        }
      } catch (err) {
        console.error("Error in checkAndShowAlerts:", err);
      }
    };

    checkAndShowAlerts();
  }, [pathname, isAdmin, isAuth]);

  const handleAlertClose = (dontShowAgain: boolean) => {
    if (!activeAlert) return;

    if (dontShowAgain) {
      localStorage.setItem(`dismissed_alert_${activeAlert.id}`, "true");
    } else {
      if (activeAlert.show_type === "first_time") {
        localStorage.setItem(`dismissed_alert_${activeAlert.id}`, "true");
      } else {
        sessionStorage.setItem(`dismissed_session_alert_${activeAlert.id}`, "true");
      }
    }

    setActiveAlert(null);
  };

  // If Admin panel or Auth routes (login/signup), render directly
  if (isAdmin || isAuth) {
    return (
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>
    );
  }

  // Check if current page is under maintenance
  const activeMaintenance = isPathUnderMaintenance(pathname || "", maintenanceRecords);

  return (
    <>
      <Navbar />

      {/* Admin Floating Banner when visiting locked page */}
      {activeMaintenance && isUserAdmin && (
        <MaintenanceAdminBanner
          maintenance={activeMaintenance}
          onDeactivated={fetchMaintenance}
        />
      )}

      {/* Page Content: If under maintenance and not admin, show Maintenance Screen */}
      <main style={{ paddingTop: "72px" }}>
        {activeMaintenance && !isUserAdmin && !authLoading ? (
          <MaintenanceScreen
            maintenance={activeMaintenance}
            pathname={pathname || ""}
          />
        ) : (
          children
        )}
      </main>

      {/* <Footer /> */}
      <MobileBottomNav />
      <ScrollToTop />
      <MobileInstallPrompt />

      {activeAlert && (
        <SiteAlertModal alert={activeAlert} onClose={handleAlertClose} />
      )}
    </>
  );
}
