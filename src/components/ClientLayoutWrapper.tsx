"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/lib/supabase";
import SiteAlertModal from "@/components/SiteAlertModal";

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
  const isAuth = pathname === "/login" || pathname === "/signup";

  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    // If we are in admin panel or login/signup, don't show user alerts
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
          console.warn("Could not load site alerts:", error);
          return;
        }

        const now = new Date();

        // Filter alerts
        const eligibleAlerts = rawAlerts.filter((alert: AlertItem) => {
          // 1. Expiry date check
          if (alert.expiry_date && new Date(alert.expiry_date) < now) {
            return false;
          }

          // 2. Pathname match check (target_page can be 'all' or must equal pathname)
          const target = alert.target_page;
          const matchesPage = target === "all" || target === pathname || (target === "/" && pathname === "");
          if (!matchesPage) return false;

          // 3. Check dismissed status in localStorage (permanent dismiss)
          const isPermanentlyDismissed = localStorage.getItem(`dismissed_alert_${alert.id}`) === "true";
          if (isPermanentlyDismissed) return false;

          // 4. Check dismissed status in sessionStorage (session-only dismiss for every_time)
          const isSessionDismissed = sessionStorage.getItem(`dismissed_session_alert_${alert.id}`) === "true";
          if (isSessionDismissed) return false;

          return true;
        });

        if (eligibleAlerts.length > 0) {
          // Show the most recently created eligible alert
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
      // Permanent hide
      localStorage.setItem(`dismissed_alert_${activeAlert.id}`, "true");
    } else {
      // Standard close:
      if (activeAlert.show_type === "first_time") {
        // For first time only alert, closing it acts as permanent dismiss
        localStorage.setItem(`dismissed_alert_${activeAlert.id}`, "true");
      } else {
        // For every time alert, standard close hides it for the current session only
        sessionStorage.setItem(`dismissed_session_alert_${activeAlert.id}`, "true");
      }
    }

    setActiveAlert(null);
  };

  if (isAdmin || isAuth) {
    return (
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav />

      {activeAlert && (
        <SiteAlertModal alert={activeAlert} onClose={handleAlertClose} />
      )}
    </>
  );
}

