"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface MicrobusRoute {
  destination: string;
  fare: string;
  vehicleType: string;
  notes?: string;
  via?: string;
  type?: string;
  lastUpdated?: string;
  duration?: string;
  description?: string;
}

interface MicrobusStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  routes: MicrobusRoute[];
  map_url: string;
}

interface RouteInteraction {
  id: string;
  user_id: string;
  station_name: string;
  route_destination: string;
  interaction_type: "like" | "dislike" | "report";
  report_reason?: "fare" | "via" | "location" | "other";
  comment?: string;
  created_at?: string;
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.35)",
  backdropFilter: "blur(24px)",
  borderRadius: "18px",
};

const DEFAULT_MICROBUS: MicrobusStation[] = [
  {
    name: "موقف رمسيس (موقف أحمد حلمي / رمسيس الكبرى)",
    location: "وسط البلد - بجوار محطة قطارات رمسيس ومترو الشهداء",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Ramses+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "11-13 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "الشيخ زايد", fare: "12-14 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص / ميني باص" },
      { destination: "العبور", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "الشروق", fare: "12-14 ج.م", vehicleType: "ميكروباص" },
      { destination: "حلوان", fare: "9-11 ج.م", vehicleType: "ميكروباص" },
      { destination: "المرج", fare: "7-8 ج.م", vehicleType: "ميكروباص" },
      { destination: "الجيزة (ميدان الجيزة)", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "شبرا الخيمة", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "مطار القاهرة", fare: "8-10 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف المرج الجديدة",
    location: "شمال شرق القاهرة - أسفل محطة مترو المرج الجديدة ومحور الفريق عرابي",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=El+Marg+Microbus+Station",
    routes: [
      { destination: "العبور", fare: "7-9 ج.م", vehicleType: "ميكروباص" },
      { destination: "الشروق", fare: "9-11 ج.م", vehicleType: "ميكروباص" },
      { destination: "بدر", fare: "11-13 ج.م", vehicleType: "ميكروباص" },
      { destination: "العاشر من رمضان", fare: "12-15 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "مدينتي", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "بلبيس", fare: "10-12 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "الزقازيق", fare: "15-18 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "مسطرد", fare: "5 ج.م", vehicleType: "ميكروباص" },
      { destination: "رمسيس", fare: "7-8 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف ميدان الجيزة",
    location: "الجيزة - ميدان الجيزة بجوار مسجد الاستقامة ومترو الجيزة",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Giza+Square+Microbus+Station",
    routes: [
      { destination: "6 أكتوبر", fare: "9-11 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "الشيخ زايد", fare: "10-12 ج.م", vehicleType: "ميكروباص" },
      { destination: "الهرم / فيصل", fare: "4-5 ج.م", vehicleType: "ميكروباص داخلي" },
      { destination: "المنيب", fare: "3.5-4 ج.م", vehicleType: "ميكروباص داخلي" },
      { destination: "حدائق الأهرام", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "رمسيس", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "التجمع الخامس", fare: "15-18 ج.م", vehicleType: "ميكروباص سقف عالي (عبر الدائري)" },
      { destination: "المعادي", fare: "7-9 ج.م", vehicleType: "ميكروباص (عبر الدائري)" }
    ]
  },
  {
    name: "موقف السيدة عائشة",
    location: "وسط القاهرة - ميدان السيدة عائشة أسفل القلعة",
    governorate: "القاهرة",
    map_url: "https://maps.google.com/?q=Sayeda+Aisha+Microbus+Station",
    routes: [
      { destination: "حلوان", fare: "8-10 ج.م", vehicleType: "ميكروباص" },
      { destination: "المعادي (صقر قريش)", fare: "6-7 ج.م", vehicleType: "ميكروباص" },
      { destination: "التجمع الخامس", fare: "12-14 ج.م", vehicleType: "ميكروباص (الدائري)" },
      { destination: "رمسيس", fare: "5 ج.م", vehicleType: "ميكروباص" },
      { destination: "الجيزة", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "المرج", fare: "8-10 ج.م", vehicleType: "ميكروباص" },
      { destination: "المقطم", fare: "4-5 ج.م", vehicleType: "ميكروباص" }
    ]
  },
  {
    name: "موقف المنيب الكبرى",
    location: "الجيزة - بجوار محطة مترو المنيب ومخرج الدائري للجنوب",
    governorate: "الجيزة",
    map_url: "https://maps.google.com/?q=Moneeb+Microbus+Station",
    routes: [
      { destination: "الفيوم", fare: "25-30 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "بني سويف", fare: "30-35 ج.م", vehicleType: "ميكروباص إقليمي" },
      { destination: "6 أكتوبر", fare: "9-11 ج.م", vehicleType: "ميكروباص سقف عالي" },
      { destination: "حلوان", fare: "7-9 ج.م", vehicleType: "ميكروباص (عبر الدائري)" },
      { destination: "المعادي", fare: "5-6 ج.م", vehicleType: "ميكروباص" },
      { destination: "ميدان الجيزة", fare: "3.5-4 ج.م", vehicleType: "ميكروباص داخلي" }
    ]
  }
];

export default function MicrobusStationsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<MicrobusStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<string>("all");

  // Interactions (Likes/Dislikes/Reports) State
  const [interactions, setInteractions] = useState<RouteInteraction[]>([]);

  // Report Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingStationName, setReportingStationName] = useState("");
  const [reportingRouteDestination, setReportingRouteDestination] = useState("");
  const [reportReason, setReportReason] = useState<"fare" | "via" | "location" | "other">("fare");
  const [reportComment, setReportComment] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Missing Route Report Modal States
  const [missingRouteModalOpen, setMissingRouteModalOpen] = useState(false);
  const [missingStationName, setMissingStationName] = useState("");
  const [missingDestination, setMissingDestination] = useState("");
  const [missingFare, setMissingFare] = useState("");
  const [missingNotes, setMissingNotes] = useState("");
  const [submittingMissingRoute, setSubmittingMissingRoute] = useState(false);

  // Success Card Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Accordion expansion states
  const [expandedStationId, setExpandedStationId] = useState<string | null>(null);
  const [expandedRouteKey, setExpandedRouteKey] = useState<string | null>(null);

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_MICROBUS;
    const local = localStorage.getItem("local_microbus_stations");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_MICROBUS;
      }
    }
    localStorage.setItem("local_microbus_stations", JSON.stringify(DEFAULT_MICROBUS));
    return DEFAULT_MICROBUS;
  };

  const loadInteractions = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("route_interactions")
        .select("*");
      if (!error && data) {
        setInteractions(data);
      }
    } catch (err) {
      console.error("Failed to load route interactions:", err);
    }
  };

  const loadStations = async () => {
    setLoading(true);
    if (!supabase) {
      setStations(getLocalStations());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("microbus_stations")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setStations(getLocalStations());
      } else {
        setStations(data || []);
      }

      // Fetch user ratings/reports
      await loadInteractions();
    } catch (err) {
      setStations(getLocalStations());
    } finally {
      setLoading(false);
    }
  };

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadStations();
    }
  }, [user, hasAccess]);

  // Reset expanded routes when filters change
  useEffect(() => {
    setExpandedRouteKey(null);
  }, [destinationQuery, selectedStation]);

  // Calculate total route lines across all loaded stations
  const lines = useMemo(() => {
    const allRoutes: MicrobusRoute[] = [];
    stations.forEach(s => {
      if (s.routes && Array.isArray(s.routes)) {
        allRoutes.push(...s.routes);
      }
    });
    return allRoutes;
  }, [stations]);

  // Filter logic: Search by destination or view by station
  const filteredResults = useMemo(() => {
    let results = stations;

    if (selectedStation && selectedStation !== "all") {
      results = results.filter(s => s.name === selectedStation);
    }

    if (destinationQuery.trim() !== "") {
      // Find matching routes inside stations
      return results.map(station => {
        const routesArr = Array.isArray(station.routes) ? station.routes : [];
        const matchingRoutes = routesArr.filter(r =>
          r.destination.toLowerCase().includes(destinationQuery.toLowerCase())
        );
        return {
          ...station,
          routes: matchingRoutes
        };
      }).filter(station => station.routes.length > 0);
    }

    return results;
  }, [destinationQuery, selectedStation, stations]);

  // Parse via places into individual steps
  const parseViaStops = (via?: string) => {
    if (!via) return [];
    return via
      .split(/[\-،,>]+/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  // Submit dynamic Like/Dislike vote
  const handleVote = async (stationName: string, destination: string, type: "like" | "dislike") => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً للتمكن من تقييم الخطوط.");
      return;
    }
    if (!supabase) return;

    try {
      // Find if the user has an existing vote for this route
      const existingVote = interactions.find(
        i =>
          i.user_id === user.id &&
          i.station_name === stationName &&
          i.route_destination === destination &&
          (i.interaction_type === "like" || i.interaction_type === "dislike")
      );

      if (existingVote) {
        if (existingVote.interaction_type === type) {
          // Toggle vote off if clicking the same button (Delete interaction)
          const { error } = await supabase
            .from("route_interactions")
            .delete()
            .eq("id", existingVote.id);

          if (!error) {
            setInteractions(prev => prev.filter(i => i.id !== existingVote.id));
          }
        } else {
          // Toggle vote type if clicking the other button (Update interaction)
          const { error } = await supabase
            .from("route_interactions")
            .update({ interaction_type: type })
            .eq("id", existingVote.id);

          if (!error) {
            setInteractions(prev =>
              prev.map(i => (i.id === existingVote.id ? { ...i, interaction_type: type } : i))
            );
          }
        }
      } else {
        // Create new vote (Insert interaction)
        const payload = {
          user_id: user.id,
          station_name: stationName,
          route_destination: destination,
          interaction_type: type
        };

        const { data, error } = await supabase
          .from("route_interactions")
          .insert([payload])
          .select();

        if (!error && data && data.length > 0) {
          setInteractions(prev => [...prev, data[0] as RouteInteraction]);
        }
      }
    } catch (err) {
      console.error("Failed to submit vote:", err);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً للإبلاغ عن مشكلة.");
      return;
    }
    if (!supabase) return;

    setSubmittingReport(true);
    try {
      const payload = {
        user_id: user.id,
        station_name: reportingStationName,
        route_destination: reportingRouteDestination,
        interaction_type: "report",
        report_reason: reportReason,
        comment: reportComment
      };

      const { data, error } = await supabase
        .from("route_interactions")
        .insert([payload])
        .select();

      if (error) {
        alert("فشل إرسال البلاغ، يرجى المحاولة مرة أخرى.");
      } else {
        if (data && data.length > 0) {
          setInteractions(prev => [...prev, data[0] as RouteInteraction]);
        }
        setReportModalOpen(false);
        setSuccessMessage("شكراً لك! تم إرسال البلاغ بنجاح وجاري مراجعته من قبل الإدارة لتصحيح البيانات.");
        setSuccessModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("حدث خطأ غير متوقع.");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handle missing route submission
  const handleMissingRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً للإبلاغ عن خط غير موجود.");
      return;
    }
    if (!missingStationName.trim() || !missingDestination.trim()) {
      alert("يرجى إدخال اسم الموقف والوجهة المطلوبة.");
      return;
    }
    if (!supabase) return;

    setSubmittingMissingRoute(true);
    try {
      const payload = {
        user_id: user.id,
        station_name: missingStationName.trim(),
        route_destination: missingDestination.trim(),
        interaction_type: "report",
        report_reason: "other",
        comment: `[خط غير موجود في الدليل] الأجرة المقترحة: ${missingFare.trim() || "غير محددة"} | التفاصيل/الملاحظات: ${missingNotes.trim() || "لا يوجد"}`
      };

      const { data, error } = await supabase
        .from("route_interactions")
        .insert([payload])
        .select();

      if (error) {
        alert("فشل إرسال البلاغ، يرجى المحاولة مرة أخرى.");
      } else {
        if (data && data.length > 0) {
          setInteractions(prev => [...prev, data[0] as RouteInteraction]);
        }
        setMissingRouteModalOpen(false);
        setMissingStationName("");
        setMissingDestination("");
        setMissingFare("");
        setMissingNotes("");
        setSuccessMessage("شكراً لك! تم إرسال معلومات الخط بنجاح للإدارة وجاري مراجعته وإضافته للدليل.");
        setSuccessModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to submit missing route report:", err);
      alert("حدث خطأ غير متوقع.");
    } finally {
      setSubmittingMissingRoute(false);
    }
  };

  // Helper to extract vote statistics for a specific route
  const getRouteVotes = (stationName: string, destination: string) => {
    const routeInteractions = interactions.filter(
      i => i.station_name === stationName && i.route_destination === destination
    );

    const likes = routeInteractions.filter(i => i.interaction_type === "like").length;
    const dislikes = routeInteractions.filter(i => i.interaction_type === "dislike").length;

    const userVote = user
      ? routeInteractions.find(i => i.user_id === user.id && (i.interaction_type === "like" || i.interaction_type === "dislike"))?.interaction_type
      : undefined;

    return { likes, dislikes, userVote };
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--bgPrimary)" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--borderGlass)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>جاري التحقق من التفاصيل ...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)" }}>
        {/* Banner matching Metro / Monorail */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bgPrimary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--borderGlass)",
          direction: "rtl"
        }}>
          {/* Back Button */}
          <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--bgGlass-card)",
                border: "1px solid var(--borderGlass)",
                color: "var(--textPrimary)",
                textDecoration: "none"
              }}
            >
              <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
            </Link>
          </div>

          {/* Cover Image Banner */}
          <div className="metro-animate-slide-up metro-delay-100">
            <h1 style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/microbus.png" alt="Cairo Microbus" loading="lazy" decoding="async" style={{ width: "75px", marginLeft: "10px" }} />
              مواقف الميكروباص</h1>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto", lineHeight: "1.6" }}>
              دليل القاهرة الكبرى الشعبي لمعرفة مواقف السرفيس والميكروباص.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "35px 25px",
            textAlign: "center",
            marginTop: "32px",
            boxShadow: "var(--shadow-card)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Lock Icon */}
            <div style={{
              marginBottom: "24px",
            }}>
              <img src="/images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
              دليل مواقف الميكروباص يتطلب الأشتراك في الباقة الذهبية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح دليل مواقف الميكروباص والسرفيس في القاهرة والجيزة والتعرفة الرسمية للخطوط متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
            </p>

            {/* Perks list */}
            <div style={{
              background: "rgba(128, 128, 128, 0.04)",
              padding: "18px 20px",
              borderRadius: "12px",
              border: "1px solid var(--borderGlass)",
              textAlign: "right",
              margin: "0 auto 28px",
              maxWidth: "420px"
            }}>
              <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.9rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bxs-award" style={{ color: "#fbbf24", fontSize: "1.1rem" }}></i>
                <span>ميزات الباقة الذهبية :</span>
              </div>
              <ul style={{
                paddingRight: "16px",
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--textSecondary)",
                lineHeight: "1.6",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontFamily: "var(--font-body)"
              }}>
                <li>✨ مواقف السرفيس والميكروباص الرئيسية (رمسيس، المنيب، المرج، عبود، إلخ).</li>
                <li>✨ التعرفة الرسمية التقريبية لخطوط الانتقال الداخلية والإقليمية.</li>
                <li>✨ نوع المركبات (سقف عالي، ميني باص، إلخ) والمسارات.</li>
                <li>✨ تشمل أيضاً مخطط الرحلات الذكي والمطارات والموانئ بالكامل.</li>
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "var(--bg-subscribe-button-gold)",
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "var(--bs-subscribe-button-gold)",
                    border: "1px solid var(--br-subscribe-button-gold)",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة للذهبية
                </Link>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "var(--bg-subscribe-button-base)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "var(--bs-subscribe-button-base)",
                    display: "block"
                  }}
                >
                  سجل دخولك أولاً لتفعيل الاشتراك
                </Link>
              )}

              <Link
                href="/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "var(--textSecondary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  border: "1px solid var(--borderGlass)",
                  display: "block"
                }}
              >
                الرجوع للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
      }}>

        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "bold",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/microbus.png" alt="Cairo Microbus" loading="lazy" decoding="async" style={{ width: "65px", marginLeft: "10px", objectFit: "contain" }} />
            دليل مواقف الميكروباص</h1>
          <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto 20px", lineHeight: "1.6" }}>
            دليل القاهرة الكبرى الشعبي لمعرفة مواقف السرفيس والميكروباص. تصفح جميع المواقف والخطوط المتاحة، أو اختر موقفاً محدداً لبدء رحلتك.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--color-blue-500)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>{stations.length} موقف سرفيس</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--color-gold-500)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>{lines.length} خط سير</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl", textAlign: "right" }}>

        {/* Search Panel Card - Styled matching profile sectionCard & Metro search card */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          marginBottom: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          zIndex: 20,
        }}>
          {/* Step 1: Select Starting Station */}
          <div>
            <label style={{ fontSize: "0.88rem", fontWeight: "800", color: "var(--textPrimary)", display: "block", marginBottom: "8px" }}>
              <i className="bx bx-map"></i> هتركب من موقف إيه؟
            </label>
            <select
              value={selectedStation}
              onChange={e => {
                setSelectedStation(e.target.value);
                setDestinationQuery(""); // Clear query on change
                if (e.target.value && e.target.value !== "all") {
                  setExpandedStationId(e.target.value);
                } else {
                  setExpandedStationId(null);
                }
              }}
              className="input-fields"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.02)",
                color: "var(--textPrimary)",
                border: "1px solid var(--borderGlass)",
                fontFamily: "var(--font-body)",
                height: "48px"
              }}
            >
              <option value="all" style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>اختر موقف هتركب منه ؟</option>
              {stations.map(s => (
                <option key={s.id || s.name} value={s.name} style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Destination Search Input (Always Visible) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontSize: "0.88rem", fontWeight: "800", color: "var(--textPrimary)", display: "block" }}>
              <i className="bx bx-map"></i> عايز تروح فين؟
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="اكتب وجهتك (مثال: 6 أكتوبر، التجمع، حلوان)..."
                value={destinationQuery}
                onChange={e => setDestinationQuery(e.target.value)}
                className="input-fields"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  color: "var(--textPrimary)",
                  border: "1px solid var(--borderGlass)",
                  fontFamily: "var(--font-body)",
                  height: "48px"
                }}
              />
              {destinationQuery && (
                <button
                  onClick={() => setDestinationQuery("")}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Tags for Destination */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>وجهات شائعة:</span>
              {(selectedStation && selectedStation !== "all"
                ? Array.from(new Set((stations.find(s => s.name === selectedStation)?.routes || []).map(r => r.destination)))
                : ["6 أكتوبر", "التجمع الخامس", "العبور", "الشيخ زايد", "الشروق", "حلوان"]
              ).slice(0, 6).map(tag => (
                <button
                  key={tag}
                  onClick={() => setDestinationQuery(tag)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: "var(--color-blue-700)",
                    color: "var(--color-white-100)",
                    border: "1px solid var(--color-blue-700)",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ width: "30px", height: "30px", border: "3px solid var(--borderGlass)", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <span style={{ color: "var(--textSecondary)", fontSize: "0.95rem" }}>جاري تحميل البيانات...</span>
            </div>
          ) : (() => {
            const isSpecificStation = selectedStation && selectedStation !== "all";
            const hasMatches = filteredResults.length > 0;
            const currentStation = isSpecificStation ? stations.find(s => s.name === selectedStation) : null;

            return (
              <div className="metro-animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* CASE 1: Specific station selected, but NO routes match the query */}
                {isSpecificStation && !hasMatches && destinationQuery.trim() !== "" && currentStation && (
                  <div style={{
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "15px",
                    padding: "20px",
                    textAlign: "right",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    animation: "fadeIn 0.3s ease-out forwards"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontWeight: "800", fontSize: "1rem" }}>
                      <i className="bx bx-error-circle" style={{ fontSize: "1.3rem" }}></i>
                      <span>لا تتوفر ميكروباصات مباشرة من هذا الموقف للوجهة المطلوبة</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--textSecondary)", margin: 0, lineHeight: "1.6" }}>
                      عذراً، لا تتوفر سيارات مباشرة من <strong>{selectedStation}</strong> متجهة إلى <strong>"{destinationQuery}"</strong> حالياً في دليلنا.
                    </p>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      💡 تم عرض جميع الوجهات المتاحة بالأسفل من هذا الموقف كبدائل خطوط.
                    </div>
                  </div>
                )}

                {/* CASE 2: Specific station selected, and YES routes match the query */}
                {isSpecificStation && hasMatches && destinationQuery.trim() !== "" && (
                  <div style={{
                    backgroundColor: "rgba(16, 185, 129, 0.05)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "15px",
                    padding: "16px 20px",
                    textAlign: "right",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#10b981",
                    fontWeight: "800",
                    fontSize: "0.95rem",
                    animation: "fadeIn 0.3s ease-out forwards"
                  }}>
                    <i className="bx bx-check-circle" style={{ fontSize: "1.3rem" }}></i>
                    <span>متوفر خط سير مباشر إلى {destinationQuery} من هذا الموقف!</span>
                  </div>
                )}

                {/* CASE 3: General search (All stations), but no stations match the query */}
                {!isSpecificStation && !hasMatches && destinationQuery.trim() !== "" && (
                  <div style={{
                    backgroundColor: "var(--bgPrimary)",
                    border: "1px solid var(--borderGlass)",
                    borderRadius: "15px",
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--textSecondary)",
                    boxShadow: "var(--shadow-card)"
                  }}>
                    لا توجد مواقف أو خطوط ميكروباص متجهة إلى <strong>"{destinationQuery}"</strong> حالياً في دليلنا. نعمل على التحديث المستمر لإضافة المزيد.
                  </div>
                )}

                {/* Render the stations list */}
                {(() => {
                  const stationsToRender = hasMatches
                    ? filteredResults
                    : (isSpecificStation && currentStation ? [currentStation] : []);

                  return stationsToRender.map((station, sIdx) => {
                    const isStationExpanded = expandedStationId === (station.id || station.name) || stationsToRender.length === 1;

                    return (
                      <div key={station.id || sIdx} className="metro-animate-slide-up" style={{
                        backgroundColor: "var(--bgPrimary)",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "15px",
                        padding: "20px 10px",
                        boxShadow: "var(--shadow-card)",
                      }}>
                        {/* Station Header - Clickable to expand/collapse routes */}
                        <div
                          onClick={() => {
                            setExpandedStationId(isStationExpanded ? null : (station.id || station.name));
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "12px",
                            alignItems: "center",
                            cursor: "pointer",
                            paddingBottom: isStationExpanded ? "16px" : "0px",
                            borderBottom: isStationExpanded ? "1px solid var(--borderGlass)" : "none",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div>
                            <h3 style={{
                              margin: "0",
                              fontSize: "1.2rem",
                              fontWeight: "800",
                              color: "var(--textPrimary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              <i className="bx bx-bus" style={{ color: "var(--color-blue-700)" }}></i>
                              <span>موقف {station.name}</span>
                              <i className={`bx bx-chevron-${isStationExpanded ? "up" : "down"}`} style={{
                                fontSize: "1.5rem",
                                color: "var(--color-blue-700)",
                                transition: "transform 0.2s ease"
                              }}></i>
                            </h3>

                          </div>
                        </div>
                        <a
                          href={station.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "inline-block", alignItems: "center", gap: "6px", }}>
                          <i className="bx bx-map" style={{ color: "var(--colorSecondary)" }}></i> يقع موقف <span style={{ color: "var(--colorSecondary)" }}>{station.name}</span> في {station.location}
                        </a>

                        {/* Station Content: Routes List */}
                        {isStationExpanded && (
                          <div style={{ marginTop: "18px", opacity: 0, animation: "fadeIn 0.3s ease-out forwards" }}>
                            <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "12px" }}>
                              {destinationQuery.trim() !== "" && hasMatches
                                ? <><i className="bx bx-bus" style={{ color: "var(--colorSecondary)", marginRight: "6px" }}></i> خطوط السير المتاحة للوجهة المطلوبة:</>
                                : <><i className="bx bx-bus" style={{ color: "var(--colorSecondary)", marginRight: "6px" }}></i> جميع خطوط السير المتاحة بالموقف:</>}
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {Array.isArray(station.routes) && station.routes.map((route: any, rIdx) => {
                                const routeKey = `${station.name}-${route.destination}-${rIdx}`;
                                const isRouteExpanded = expandedRouteKey === routeKey;
                                const isOfficial = route.type !== "normal";

                                return (
                                  <div
                                    key={rIdx}
                                    style={{
                                      borderRadius: "12px",
                                      background: "rgba(255, 255, 255, 0.01)",
                                      border: "1px solid var(--borderGlass)",
                                      display: "flex",
                                      flexDirection: "column",
                                      overflow: "hidden",
                                      transition: "all 0.2s ease"
                                    }}
                                  >
                                    {/* Route Header */}
                                    <div
                                      onClick={() => {
                                        setExpandedRouteKey(isRouteExpanded ? null : routeKey);
                                      }}
                                      style={{
                                        padding: "14px 8px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        flexWrap: "wrap",
                                        gap: "8px",
                                        backgroundColor: isRouteExpanded ? "rgba(255, 255, 255, 0.02)" : "transparent",
                                        transition: "background-color 0.2s ease"
                                      }}
                                      onMouseEnter={e => {
                                        if (!isRouteExpanded) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.01)";
                                      }}
                                      onMouseLeave={e => {
                                        if (!isRouteExpanded) e.currentTarget.style.backgroundColor = "transparent";
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <span style={{ color: "var(--textPrimary)", fontWeight: "800", fontSize: "0.8rem" }}>
                                          <i className="bx bx-map-pin" style={{ color: "var(--colorSecondary)", marginLeft: "6px" }}></i>
                                          من {station.name} إلي {isOfficial ? "موقف" : "نقطة"} {route.destination}
                                        </span>
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                                        <i className={`bx bx-chevron-${isRouteExpanded ? "up" : "down"}`} style={{ fontSize: "1.2rem", color: "var(--textSecondary)" }}></i>
                                      </div>
                                    </div>

                                    {/* Route Details */}
                                    {isRouteExpanded && (
                                      <div style={{
                                        padding: "16px",
                                        borderTop: "1px solid var(--borderGlass)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "14px",
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        opacity: 0,
                                        animation: "fadeIn 0.25s ease-out forwards"
                                      }}>
                                        {/* Info cards grid */}
                                        <div style={{
                                          display: "grid",
                                          gridTemplateColumns: "1fr 1fr",
                                          gap: "12px",
                                          width: "100%"
                                        }}>
                                          {/* Vehicle Card */}
                                          <div style={{
                                            background: "var(--bgGlass-card, rgba(24, 24, 27, 0.7))",
                                            border: "1px solid var(--borderGlass)",
                                            borderRadius: "14px",
                                            padding: "12px 14px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                          }}>
                                            <div style={{
                                              width: "36px",
                                              height: "36px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              color: "#3b82f6",
                                              fontSize: "1.2rem",
                                              flexShrink: 0
                                            }}>
                                              <i className="bx bx-bus" />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>نوع المركبة</span>
                                              <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--textPrimary)" }}>
                                                {route.vehicleType || "ميكروباص"}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Duration Card */}
                                          <div style={{
                                            background: "var(--bgGlass-card, rgba(24, 24, 27, 0.7))",
                                            border: "1px solid var(--borderGlass)",
                                            borderRadius: "14px",
                                            padding: "12px 14px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                          }}>
                                            <div style={{
                                              width: "36px",
                                              height: "36px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              color: "#10b981",
                                              fontSize: "1.2rem",
                                              flexShrink: 0
                                            }}>
                                              <i className="bx bx-time" />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>زمن الرحلة</span>
                                              <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--textPrimary)" }}>
                                                {(route.duration && route.duration + " " + "دقيقة") || "غير معروف"}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Fare Card - spans both columns */}
                                          <div style={{
                                            gridColumn: "span 2",
                                            background: "var(--bgGlass-card, rgba(24, 24, 27, 0.7))",
                                            border: "1px solid var(--borderGlass)",
                                            borderRadius: "14px",
                                            padding: "12px 14px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                          }}>
                                            <div style={{
                                              width: "36px",
                                              height: "36px",
                                              borderRadius: "10px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              color: "var(--colorSecondary)",
                                              fontSize: "1.2rem",
                                              flexShrink: 0
                                            }}>
                                              <i className="bx bx-money" />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>الأجرة المقدرة</span>
                                              <span style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--colorSecondary)", }}>
                                                {route.fare} جنية
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {/* Timeline */}
                                        {route.via && (
                                          <div style={{ marginTop: "6px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>
                                              <i className="fa-solid fa-route" style={{ fontSize: "0.95rem", marginLeft: "6px" }}></i> خط السير التفصيلي (نقاط المرور)
                                            </span>
                                            <div style={{ overflowX: "auto", paddingBottom: "8px", paddingTop: "8px", direction: "rtl" }} className="custom-scrollbar">
                                              <div style={{ display: "flex", alignItems: "center", position: "relative", minWidth: "480px", padding: "0 10px" }}>
                                                <div style={{
                                                  position: "absolute",
                                                  top: "13px",
                                                  left: "30px",
                                                  right: "30px",
                                                  height: "2px",
                                                  background: "rgba(88, 88, 88, 0.04)",
                                                  zIndex: 1
                                                }} />

                                                {[
                                                  station.name.split("(")[0].trim(),
                                                  ...parseViaStops(route.via),
                                                  route.destination
                                                ].map((stop, idx, arr) => {
                                                  const isStart = idx === 0;
                                                  const isEnd = idx === arr.length - 1;
                                                  const dotColor = isStart ? "#10b981" : isEnd ? "#ef4444" : "#f59e0b";

                                                  return (
                                                    <div key={idx} style={{
                                                      flex: "1 1 0%",
                                                      display: "flex",
                                                      flexDirection: "column",
                                                      alignItems: "center",
                                                      position: "relative",
                                                      zIndex: 2
                                                    }}>
                                                      <div style={{
                                                        width: "22px",
                                                        height: "22px",
                                                        borderRadius: "50%",
                                                        backgroundColor: "var(--bgPrimary)",
                                                        border: `3px solid ${dotColor}`,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                                        marginBottom: "6px"
                                                      }}>
                                                        <div style={{
                                                          width: "6px",
                                                          height: "6px",
                                                          borderRadius: "50%",
                                                          backgroundColor: dotColor
                                                        }} />
                                                      </div>

                                                      <span style={{
                                                        fontSize: "0.72rem",
                                                        fontWeight: isStart || isEnd ? "bold" : "normal",
                                                        color: isStart || isEnd ? "var(--textPrimary)" : "var(--textSecondary)",
                                                        textAlign: "center",
                                                        width: "75px",
                                                        whiteSpace: "normal",
                                                        lineHeight: "1.3"
                                                      }}>
                                                        {stop}
                                                      </span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Interactive Likes/Dislikes & Report Action Row */}
                                        <div style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          padding: "8px 12px",
                                          background: "transparent",
                                          borderRadius: "10px",
                                          border: "none",
                                          marginTop: "4px",
                                          flexWrap: "wrap",
                                          gap: "8px"
                                        }}>
                                          {/* Like & Dislike vote triggers */}
                                          {(() => {
                                            const { likes, dislikes, userVote } = getRouteVotes(station.name, route.destination);
                                            return (
                                              <>
                                                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--textPrimary)", display: "block" }}>
                                                  هل الطريق صحيح وجميع معلوماتة صحيحة؟
                                                </span>
                                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                                  {/* Like Button */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleVote(station.name, route.destination, "like");
                                                    }}
                                                    style={{
                                                      display: "inline-flex",
                                                      alignItems: "center",
                                                      gap: "6px",
                                                      background: userVote === "like" ? "rgba(16, 185, 129, 0.12)" : "rgba(128,128,128,0.05)",
                                                      border: userVote === "like" ? "1px solid #10b981" : "1px solid var(--borderGlass)",
                                                      color: userVote === "like" ? "#10b981" : "var(--textSecondary)",
                                                      padding: "6px 12px",
                                                      borderRadius: "8px",
                                                      fontSize: "0.8rem",
                                                      fontWeight: "bold",
                                                      cursor: "pointer",
                                                      transition: "all 0.2s ease"
                                                    }}
                                                  >
                                                    <i className={userVote === "like" ? "fa-solid fa-check" : "fa-solid fa-check"} style={{ fontSize: "0.95rem" }}></i>
                                                    <span> ({likes})</span>
                                                  </button>

                                                  {/* Dislike Button */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleVote(station.name, route.destination, "dislike");
                                                    }}
                                                    style={{
                                                      display: "inline-flex",
                                                      alignItems: "center",
                                                      gap: "6px",
                                                      background: userVote === "dislike" ? "rgba(239, 68, 68, 0.12)" : "rgba(128,128,128,0.05)",
                                                      border: userVote === "dislike" ? "1px solid #ef4444" : "1px solid var(--borderGlass)",
                                                      color: userVote === "dislike" ? "#ef4444" : "var(--textSecondary)",
                                                      padding: "6px 12px",
                                                      borderRadius: "8px",
                                                      fontSize: "0.8rem",
                                                      fontWeight: "bold",
                                                      cursor: "pointer",
                                                      transition: "all 0.2s ease"
                                                    }}
                                                  >
                                                    <i className={userVote === "dislike" ? "fa-solid fa-xmark" : "fa-solid fa-xmark"} style={{ fontSize: "0.95rem" }}></i>
                                                    <span>({dislikes})</span>
                                                  </button>
                                                </div>
                                              </>
                                            );
                                          })()}

                                          {/* Report problem button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!user) {
                                                alert("يرجى تسجيل الدخول أولاً للتمكن من الإبلاغ عن مشاكل البيانات.");
                                                return;
                                              }
                                              setReportingStationName(station.name);
                                              setReportingRouteDestination(route.destination);
                                              setReportReason("fare");
                                              setReportComment("");
                                              setReportModalOpen(true);
                                            }}
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "4px",
                                              background: "rgba(128,128,128,0.05)",
                                              border: "1px solid var(--borderGlass)",
                                              color: "var(--text-muted)",
                                              padding: "6px 12px",
                                              borderRadius: "8px",
                                              fontSize: "0.8rem",
                                              fontWeight: "bold",
                                              cursor: "pointer",
                                              transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.color = "#f59e0b"}
                                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                                          >
                                            <i className="bx bx-error-circle" style={{ fontSize: "0.95rem" }}></i>
                                            <span>إبلاغ عن خطأ</span>
                                          </button>
                                        </div>

                                        {/* Description */}
                                        {(route.description || route.notes) && (
                                          <div style={{
                                            fontSize: "0.8rem",
                                            color: "var(--textSecondary)",
                                            fontStyle: "italic",
                                            background: "rgba(255, 255, 255, 0.02)",
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            borderRight: "3px solid #f59e0b",
                                            lineHeight: "1.5"
                                          }}>
                                            {route.description || route.notes}
                                          </div>
                                        )}

                                        {/* Last Updated */}
                                        {route.lastUpdated && (
                                          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                            <span>📅 آخر تحديث: {route.lastUpdated}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            );
          })()}
        </div>

        {/* Missing Route Callout Section at the bottom */}
        <div className="metro-animate-slide-up" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "24px 20px",
          marginTop: "30px",
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            color: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem"
          }}>
            <i className="bx bx-bulb"></i>
          </div>

          <div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)" }}>
              عارف خط موجود في موقف بتركب منه ومش موجود في الدليل؟
            </h3>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6", maxWidth: "500px" }}>
              برجاء إخبار الإدارة! ساعدنا في تحسين وتغطية جميع خطوط القاهرة والجيزة لخدمة بقية الركاب. سنقوم بمراجعة بيانات الخط وإضافتها فوراً.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                alert("يرجى تسجيل الدخول أولاً للإبلاغ عن خط غير مدرج.");
                return;
              }
              setMissingStationName(selectedStation && selectedStation !== "all" ? selectedStation : "");
              setMissingDestination("");
              setMissingFare("");
              setMissingNotes("");
              setMissingRouteModalOpen(true);
            }}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              background: "var(--color-blue-700)",
              border: "1px solid var(--color-blue-700)",
              color: "var(--color-white-100)",
              fontWeight: "bold",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
              transition: "all 0.2s ease"
            }}
          >
            <i className="bx bx-paper-plane" style={{ fontSize: "1.1rem" }}></i>
            <span>إبلاغ الإدارة بخط جديد / غير مدرج</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          direction: "rtl"
        }}>
          <div className="metro-animate-slide-up" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--borderGlass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.01)"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                إبلاغ عن مشكلة في خط السير {reportingRouteDestination}
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="closeBtn"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleReportSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--textSecondary)", background: "rgba(255, 255, 255, 0.02)", padding: "10px 12px", }}>
                <div><strong>الموقف:</strong> {reportingStationName}</div>
                <div style={{ marginTop: "4px" }}><strong>الوجهة:</strong> {reportingRouteDestination}</div>
              </div>

              {/* Problem Type Select */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                  نوع المشكلة الملاحظة:
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value as any)}
                  className="input-fields"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--textPrimary)",
                    border: "1px solid var(--borderGlass)",
                    fontFamily: "var(--font-body)",
                    height: "42px"
                  }}
                >
                  <option value="fare" style={{ backgroundColor: "var(--bgPrimary)" }}>💰 التعرفة / الأجرة غير صحيحة</option>
                  <option value="via" style={{ backgroundColor: "var(--bgPrimary)" }}>🛣️ خط السير / المناطق غير دقيقة</option>
                  <option value="location" style={{ backgroundColor: "var(--bgPrimary)" }}>📍 مكان الموقف أو نقطة التحميل غير صحيحة</option>
                  <option value="other" style={{ backgroundColor: "var(--bgPrimary)" }}>📝 مشكلة أو ملاحظة أخرى</option>
                </select>
              </div>

              {/* Comment Input */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                  تفاصيل المشكلة (اختياري):
                </label>
                <textarea
                  placeholder="يرجى كتابة التفاصيل هنا لمساعدتنا في تحديث البيانات (مثال: الأجرة الحقيقية هي 12 ج.م)..."
                  value={reportComment}
                  onChange={e => setReportComment(e.target.value)}
                  className="input-fields"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--textPrimary)",
                    border: "1px solid var(--borderGlass)",
                    fontFamily: "var(--font-body)",
                    height: "100px",
                    resize: "none"
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "rgba(255, 0, 0, 0.16)",
                    border: "1px solid var(--borderGlass)",
                    color: "var(--textPrimary)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "bold"
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background: "var(--color-blue-700)",
                    border: "1px solid var(--color-blue-700)",
                    color: "var(--color-white-100)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                  }}
                >
                  {submittingReport ? "جاري الإرسال..." : "إرسال البلاغ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Missing Route Modal */}
      {missingRouteModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          direction: "rtl"
        }}>
          <div className="metro-animate-slide-up" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--borderGlass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.01)"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <i className="bx bx-plus-circle" style={{ color: "#3b82f6" }}></i>
                إخبار الإدارة بخط ميكروباص غير مدرج
              </h3>
              <button
                onClick={() => setMissingRouteModalOpen(false)}
                className="closeBtn"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleMissingRouteSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
                أدخل تفاصيل الخط الموجود في الموقف الذي تركب منه لمساعدة الإدارة في مراجعته وإضافته للدليل.
              </p>

              {/* Station Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                  اسم الموقف: <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: موقف رمسيس، موقف المنيب، موقف العاشر..."
                  value={missingStationName}
                  onChange={e => setMissingStationName(e.target.value)}
                  className="input-fields"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--textPrimary)",
                    border: "1px solid var(--borderGlass)",
                    fontFamily: "var(--font-body)",
                    height: "42px"
                  }}
                />
              </div>

              {/* Destination */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                  وجهة / خط الميكروباص (إلى فين؟): <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: 6 أكتوبر، العاصمة الإدارية، التجمع الخامس..."
                  value={missingDestination}
                  onChange={e => setMissingDestination(e.target.value)}
                  className="input-fields"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--textPrimary)",
                    border: "1px solid var(--borderGlass)",
                    fontFamily: "var(--font-body)",
                    height: "42px"
                  }}
                />
              </div>

              {/* Fare */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                  الأجرة التقديرية (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="مثال: 15 ج.م"
                  value={missingFare}
                  onChange={e => setMissingFare(e.target.value)}
                  className="input-fields"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--textPrimary)",
                    border: "1px solid var(--borderGlass)",
                    fontFamily: "var(--font-body)",
                    height: "42px"
                  }}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                  ملاحظات أو نقاط السير (اختياري):
                </label>
                <textarea
                  placeholder="أي تفاصيل أخرى مثل: بيمشي من المحور، أو السقف العالي فقط..."
                  value={missingNotes}
                  onChange={e => setMissingNotes(e.target.value)}
                  className="input-fields"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--textPrimary)",
                    border: "1px solid var(--borderGlass)",
                    fontFamily: "var(--font-body)",
                    height: "80px",
                    resize: "none"
                  }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setMissingRouteModalOpen(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "rgba(255, 0, 0, 0.16)",
                    border: "1px solid var(--borderGlass)",
                    color: "var(--textPrimary)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "bold"
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingMissingRoute}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background: "var(--color-blue-700)",
                    border: "1px solid var(--color-blue-700)",
                    color: "var(--color-white-100)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                  }}
                >
                  {submittingMissingRoute ? "جاري الإرسال..." : "إرسال للإدارة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Card Modal Centered */}
      {successModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: "20px",
          direction: "rtl"
        }}>
          <div className="metro-animate-slide-up" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "420px",
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative"
          }}>
            {/* Success Icon */}
            <div style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "2px solid #10b981",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem",
              marginBottom: "18px",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.35)"
            }}>
              <i className="bx bx-check"></i>
            </div>

            {/* Title */}
            <h3 style={{
              margin: "0 0 10px 0",
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "var(--textPrimary)"
            }}>
              تم الإرسال بنجاح! 🎉
            </h3>

            {/* Message */}
            <p style={{
              margin: "0 0 24px 0",
              fontSize: "0.95rem",
              color: "var(--textSecondary)",
              lineHeight: "1.6",
              fontFamily: "var(--font-body)"
            }}>
              {successMessage}
            </p>

            {/* Action Button */}
            <button
              onClick={() => setSuccessModalOpen(false)}
              style={{
                width: "100%",
                padding: "12px 24px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                transition: "transform 0.2s ease"
              }}
            >
              ممتاز، تم 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
