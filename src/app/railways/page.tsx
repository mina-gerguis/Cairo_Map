"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface TrainClass {
  name: string;
  price: string;
  features: string;
}

interface RailwayStop {
  name: string;
  status: "تشغيل فعلي" | "تحت الإنشاء";
}

interface RailwayRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  duration: string;
  stops: RailwayStop[];
  classes: TrainClass[];
  tips: string;
}

const RAILWAY_ROUTES: RailwayRoute[] = [
  {
    id: "cairo-alex",
    name: "القاهرة ⇆ الإسكندرية (خط بحري)",
    from: "القاهرة (محطة رمسيس)",
    to: "الإسكندرية (محطة سيدي جابر / مصر)",
    duration: "ساعتين إلى 3 ساعات ونصف (حسب نوع القطار)",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "بنها", status: "تشغيل فعلي" },
      { name: "طنطا", status: "تشغيل فعلي" },
      { name: "دمنهور", status: "تشغيل فعلي" },
      { name: "سيدي جابر", status: "تشغيل فعلي" },
      { name: "الإسكندرية", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطار تالجو (Talgo) الفاخر", price: "درجة أولى: 225 ج.م | درجة ثانية: 150 ج.م", features: "شاشات عرض، واي فاي، عربة بوفيه فاخرة، تكييف متطور، هدوء تام وسرعة عالية." },
      { name: "قطارات VIP السريعة", price: "درجة أولى: 145 ج.م | درجة ثانية: 115 ج.م", features: "تكييف ممتاز، مقاعد مريحة قابلة للتعديل، بوفيه، خدمة جيدة." },
      { name: "قطارات إسباني مطور / فرنسي", price: "درجة أولى: 80 ج.م | درجة ثانية: 65 ج.م", features: "تكييف، مقاعد مريحة، قطارات سريعة كلاسيكية." },
      { name: "قطار روسي مكيف", price: "تذكرة موحدة: 60 ج.م", features: "تكييف، عربات جديدة، سعر اقتصادي وسرعة متوسطة." }
    ],
    tips: "قطارات تالجو هي الخيار الأفضل والأسرع على هذا الخط. يفضل الحجز قبل موعد الرحلة بـ 24 ساعة على الأقل."
  },
  {
    id: "cairo-aswan",
    name: "القاهرة ⇆ أسوان (خط قبلي الصعيد)",
    from: "القاهرة (محطة رمسيس / الجيزة)",
    to: "أسوان",
    duration: "10 إلى 13 ساعة",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "الجيزة", status: "تشغيل فعلي" },
      { name: "بني سويف", status: "تشغيل فعلي" },
      { name: "المنيا", status: "تشغيل فعلي" },
      { name: "أسيوط", status: "تشغيل فعلي" },
      { name: "سوهاج", status: "تشغيل فعلي" },
      { name: "قنا", status: "تشغيل فعلي" },
      { name: "الأقصر", status: "تشغيل فعلي" },
      { name: "إدفو", status: "تشغيل فعلي" },
      { name: "كوم أمبو", status: "تشغيل فعلي" },
      { name: "أسوان", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطارات النوم الفاخرة (Wagon-Lits)", price: "كابينة فردية: 1200+ ج.م | كابينة مزدوجة: 850 ج.م (للمصريين)", features: "وجبة عشاء وإفطار مجانية، سرير مريح في كابينة مغلقة، هدوء وخدمة فندقية." },
      { name: "قطار تالجو (Talgo) الصعيد", price: "درجة أولى: 700 ج.م | درجة ثانية: 550 ج.م", features: "القطار الأحدث والأكثر راحة بالصعيد، هادئ وسريع ومكيف بالكامل." },
      { name: "قطارات VIP الصعيد", price: "درجة أولى: 335 ج.م | درجة ثانية: 220 ج.م", features: "تكييف ممتاز، مقاعد مريحة للمسافات الطويلة، عربة بوفيه متكاملة." },
      { name: "قطارات إسباني مكيفة", price: "درجة أولى: 175 ج.م | درجة ثانية: 125 ج.م", features: "خيار اقتصادي ممتاز للمسافات الطويلة، تكييف ومقاعد جيدة." }
    ],
    tips: "لرحلات النوم، يفضل الحجز قبل السفر بأسبوع على الأقل نظراً للإقبال الشديد خصوصاً في مواسم الشتاء والسياحة."
  },
  {
    id: "cairo-portsaid",
    name: "القاهرة ⇆ بورسعيد (خط القناة)",
    from: "القاهرة (محطة رمسيس)",
    to: "بورسعيد",
    duration: "3 إلى 4 ساعات",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "بنها", status: "تشغيل فعلي" },
      { name: "الزقازيق", status: "تشغيل فعلي" },
      { name: "الإسماعيلية", status: "تشغيل فعلي" },
      { name: "القنطرة غرب", status: "تشغيل فعلي" },
      { name: "بورسعيد", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطارات مكيفة إسباني/فرنسي", price: "درجة أولى: 80 ج.م | درجة ثانية: 65 ج.م", features: "مكيفة، كراسي مريحة، تقف في المراكز والمحافظات الرئيسية." },
      { name: "قطار روسي مكيف الجديد", price: "تذكرة موحدة: 55 ج.م", features: "تكييف، عربات جديدة مريحة واقتصادية." },
      { name: "قطارات تحيا مصر (عادية)", price: "تذكرة موحدة: 25 ج.م", features: "غير مكيفة، اقتصادية جداً وتتوقف في معظم المحطات الفرعية." }
    ],
    tips: "الرحلة تمر بمدن القناة وتوفر مناظر جميلة ومحطات ممتعة على طول قناة السويس."
  },
  {
    id: "cairo-mansoura",
    name: "القاهرة ⇆ المنصورة (خط الدلتا)",
    from: "القاهرة (محطة رمسيس)",
    to: "المنصورة",
    duration: "ساعتين إلى ساعتين ونصف",
    stops: [
      { name: "القاهرة (رمسيس)", status: "تشغيل فعلي" },
      { name: "بنها", status: "تشغيل فعلي" },
      { name: "قويسنا", status: "تشغيل فعلي" },
      { name: "بركة السبع", status: "تشغيل فعلي" },
      { name: "طنطا", status: "تشغيل فعلي" },
      { name: "المحلة الكبرى", status: "تشغيل فعلي" },
      { name: "سمنود", status: "تشغيل فعلي" },
      { name: "طلخا", status: "تشغيل فعلي" },
      { name: "المنصورة", status: "تشغيل فعلي" }
    ],
    classes: [
      { name: "قطارات VIP السريعة", price: "درجة أولى: 100 ج.م | درجة ثانية: 80 ج.م", features: "قطارات سريعة ومكيفة بالكامل ومريحة جداً." },
      { name: "قطارات مكيفة إسباني", price: "درجة أولى: 60 ج.م | درجة ثانية: 50 ج.م", features: "مكيفة ومناسبة جداً للسفر اليومي والدراسي." },
      { name: "قطار روسي مكيف", price: "تذكرة موحدة: 45 ج.م", features: "عربات مكيفة اقتصادية حديثة." }
    ],
    tips: "العديد من طلاب الجامعات يستخدمون هذا الخط يومياً، لذا ينصح بتجنب أوقات الذروة الصباحية وبعد الظهر."
  }
];

const ROUTE_COLORS: Record<string, string> = {
  "cairo-alex": "#ef4444",
  "cairo-aswan": "#f59e0b",
  "cairo-portsaid": "#3b82f6",
  "cairo-mansoura": "#10b981",
};

const COLOR_PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#6366f1",
];

function getRouteColor(routeId: string, index: number): string {
  if (ROUTE_COLORS[routeId]) {
    return ROUTE_COLORS[routeId];
  }
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

function getRouteShortName(route: RailwayRoute): string {
  if (route.id === "cairo-alex") return "خط الإسكندرية";
  if (route.id === "cairo-aswan") return "خط الصعيد";
  if (route.id === "cairo-portsaid") return "خط القناة";
  if (route.id === "cairo-mansoura") return "خط الدلتا";

  const match = route.name.match(/\((خط [^)]+)\)/);
  if (match) {
    return match[1];
  }

  if (route.name.includes("⇆")) {
    const parts = route.name.split("⇆");
    return `خط ${parts[1].trim()}`;
  }

  if (route.name.includes("-")) {
    const parts = route.name.split("-");
    return `خط ${parts[parts.length - 1].trim()}`;
  }

  return route.name;
}

export default function RailwaysPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [selectedRouteId, setSelectedRouteId] = useState<string>("cairo-alex");
  const [routes, setRoutes] = useState<RailwayRoute[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!supabase) {
        loadLocalRoutes();
        return;
      }

      try {
        const { data: routesData, error: routesErr } = await supabase
          .from("railway_routes")
          .select("*");

        if (routesErr) throw routesErr;

        const { data: stationsData, error: stationsErr } = await supabase
          .from("railway_stations")
          .select("*")
          .order("station_order", { ascending: true });

        if (stationsErr) throw stationsErr;

        const combined: RailwayRoute[] = (routesData || []).map((route: any) => {
          const stops = (stationsData || [])
            .filter((s: any) => s.route_id === route.id)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              status: s.status || "تشغيل فعلي"
            }));

          return {
            id: route.id,
            name: route.name,
            from: route.from_location,
            to: route.to_location,
            duration: route.duration,
            stops: stops,
            classes: route.classes || [
              { name: "درجة أولى مكيفة", price: "تحدد لاحقاً", features: "تكييف، مقاعد مريحة" },
              { name: "درجة ثانية مكيفة", price: "تحدد لاحقاً", features: "تكييف واقتصادي" }
            ],
            tips: route.tips || ""
          };
        });

        if (combined.length > 0) {
          setRoutes(combined);
          setSelectedRouteId(prev => (combined.some(r => r.id === prev) ? prev : combined[0].id));
        } else {
          loadLocalRoutes();
        }
      } catch (err) {
        console.warn("Failed to load railways from Supabase, using localStorage", err);
        loadLocalRoutes();
      }
    };

    const loadLocalRoutes = () => {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("local_railways_routes");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const mapped = parsed.map((route: any) => {
              if (Array.isArray(route.stops)) {
                route.stops = route.stops.map((stop: any) => {
                  if (typeof stop === "string") {
                    return { name: stop, status: "تشغيل فعلي" };
                  }
                  return { name: stop.name, status: stop.status || "تشغيل فعلي" };
                });
              } else {
                route.stops = [];
              }
              return route;
            });
            setRoutes(mapped);
            if (mapped.length > 0) {
              setSelectedRouteId(prev => (mapped.some((r: any) => r.id === prev) ? prev : mapped[0].id));
            }
          } catch {
            setRoutes(RAILWAY_ROUTES);
          }
        } else {
          localStorage.setItem("local_railways_routes", JSON.stringify(RAILWAY_ROUTES));
          setRoutes(RAILWAY_ROUTES);
        }
      } else {
        setRoutes(RAILWAY_ROUTES);
      }
    };

    fetchRoutes();
  }, []);

  const activeRoutesList = routes.length > 0 ? routes : RAILWAY_ROUTES;
  const currentRoute = activeRoutesList.find(r => r.id === selectedRouteId) || activeRoutesList[0];

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", direction: "rtl" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "24px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>جاري التحقق من التفاصيل ...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  // Paywall / Lock screen matching Metro & Directory premium view style
  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)" }}>
        {/* Banner matching Metro */}
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
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/Cairo_train.png" alt="Cairo Train" loading="lazy" decoding="async" style={{ width: "35px", height: "35px", marginLeft: "10px" }} />
              سكك حديد مصر</h1>
            <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              مواعيد وأسعار قطارات السفر بين المحافظات.
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
              دليل سكك حديد مصر يتطلب أشتراك في الباقة فضية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح مواعيد وأسعار قطارات السفر بين المحافظات المختلفة متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية.
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
                <span>ميزات الباقة الفضية :</span>
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
                <li>✨ مواعيد وجداول تحرك القطارات (تالجو، VIP، إسباني ومكيف)</li>
                <li>✨ أسعار التذاكر التفصيلية لكافة درجات السفر</li>
                <li>✨ نصائح الحجز ومسارات التوقف والمحطات البينية</li>
                <li>✨ تشمل أيضاً خريطة المونوريل وخطوط LRT ومحرك البحث</li>
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  className="btn btn-silver"
                  style={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة الفضية
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    display: "block"
                  }}
                >
                  سجل دخولك أولاً لتفعيل الاشتراك
                </Link>
              )}

              <Link
                href="/"
                className="btn btn-cancel"
                style={{
                  color: "var(--textPrimary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
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

  const activeIndex = activeRoutesList.findIndex(r => r.id === selectedRouteId);
  const color = getRouteColor(selectedRouteId, activeIndex >= 0 ? activeIndex : 0);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
      {/* CSS internal styles definition for custom hover effects and keyframe animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "bold",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/Cairo_train.png" alt="Cairo Train" loading="lazy" decoding="async" style={{ width: "40px", height: "40px", marginLeft: "10px" }} />
            سكك حديد مصر</h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            استكشف شبكة قطارات سكك حديد مصر، اعرف أسعار التذاكر وفئات القطارات، ومسارات الرحلات والمدد الزمنية للخطوط الرئيسية.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {activeRoutesList.map((route, idx) => {
              const routeColor = getRouteColor(route.id, idx);
              const shortName = getRouteShortName(route);
              return (
                <span
                  key={route.id}
                  style={{
                    background: "var(--bgSecondary)",
                    border: "1px solid var(--borderGlass)",
                    color: routeColor,
                    borderRadius: "10px",
                    padding: "4px 14px",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                  }}
                >
                  {shortName}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl", textAlign: "right" }}>

        {/* Route Selector Tabs Grid */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          display: "grid",
          gridTemplateColumns: activeRoutesList.length > 4 ? "repeat(auto-fill, minmax(130px, 1fr))" : "repeat(2, 1fr)",
          gap: "12px",
          marginTop: "24px",
          marginBottom: "24px"
        }}>
          {activeRoutesList.map((route, idx) => {
            const active = selectedRouteId === route.id;
            const routeColor = getRouteColor(route.id, idx);
            const shortName = getRouteShortName(route);

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                style={{
                  fontFamily: "var(--font-body)",
                  background: "var(--bgPrimary)",
                  border: active ? `2px solid ${routeColor}` : "1px solid var(--borderGlass)",
                  borderRadius: "12px",
                  padding: "14px 8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  boxShadow: active ? `0 0 10px ${routeColor}15` : "none",
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "var(--hoverBtn)";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "var(--bgPrimary)";
                }}
              >
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: routeColor, margin: "0 auto 6px" }} />
                <div className="sub-title" style={{ color: active ? "var(--textPrimary)" : "var(--textSecondary)", fontWeight: "700", fontSize: "0.88rem" }}>
                  {shortName}
                </div>
                <div className="sub-title" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {route.stops ? route.stops.length : 0} محطات رئيسية
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Details Panel */}
        <div className="metro-animate-slide-up metro-delay-300" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginBottom: "24px"
        }}>
          <h5 style={{
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            margin: "0"
          }}>
            تفاصيل خط {currentRoute?.name || ""}
          </h5>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute?.stops?.[0]?.name?.replace(" (رمسيس)", "")?.replace(" (محطة رمسيس)", "") || currentRoute?.from || "القاهرة"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "4px" }}>القيام</div>
            </div>
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute?.stops?.[currentRoute.stops.length - 1]?.name?.replace(" (محطة سيدي جابر / مصر)", "") || currentRoute?.to || "الوصول"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "4px" }}>الوصول</div>
            </div>
            <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--textPrimary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute?.duration || "غير معددة"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)", fontWeight: "600", marginTop: "4px" }}>المدة المقدرة</div>
            </div>
          </div>

          {/* Detailed stops vertical timeline */}
          <div style={{
            background: "rgba(128, 128, 128, 0.02)",
            padding: "20px 16px",
            borderRadius: "12px",
            border: "1px solid var(--borderGlass)"
          }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "16px" }}>
              📌 المحطات الرئيسية على هذا الخط:
            </h2>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {currentRoute?.stops && currentRoute.stops.length > 0 ? (
                currentRoute.stops.map((stop, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === currentRoute.stops.length - 1;
                  const isUnderConstruction = stop.status === "تحت الإنشاء";
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "32px" }}>
                        {/* Dot */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                          <div style={{
                            width: isFirst || isLast ? "12px" : "8px",
                            height: isFirst || isLast ? "12px" : "8px",
                            borderRadius: "50%",
                            backgroundColor: isUnderConstruction ? "transparent" : color,
                            border: isUnderConstruction ? `2px dashed #ef4444` : (isFirst || isLast ? `2px solid var(--bgPrimary)` : "none"),
                            boxShadow: isUnderConstruction ? "none" : (isFirst || isLast ? `0 0 0 2px ${color}` : "none")
                          }} />
                        </div>

                        {/* Text */}
                        <span style={{
                          fontSize: "0.88rem",
                          fontWeight: isFirst || isLast ? "700" : "500",
                          color: isUnderConstruction ? "#ef4444" : (isFirst || isLast ? "var(--textPrimary)" : "var(--textSecondary)"),
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          {stop.name}
                          {isUnderConstruction && (
                            <span style={{
                              fontSize: "0.68rem",
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: "bold"
                            }}>
                              تحت الإنشاء 🚧
                            </span>
                          )}
                          {isFirst && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "8px" }}>(محطة القيام)</span>}
                          {isLast && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: "8px" }}>(محطة الوصول)</span>}
                        </span>
                      </div>

                      {/* Connective Line */}
                      {!isLast && (
                        <div style={{ display: "flex", gap: "12px", minHeight: "14px" }}>
                          <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
                            <div style={{
                              width: "2px",
                              backgroundColor: color,
                              minHeight: "14px",
                              opacity: 0.4,
                            }} />
                          </div>
                          <div style={{ flexGrow: 1 }} />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.88rem", textAlign: "center", padding: "12px" }}>
                  لا توجد محطات مضافة لهذا الخط بعد.
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div style={{
            marginTop: "12px",
            background: "rgba(59, 130, 246, 0.04)",
            border: "1px solid rgba(59, 130, 246, 0.15)",
            borderRadius: "12px",
            padding: "16px"
          }}>
            <p className="sub-title" style={{ margin: 0, lineHeight: "1.7", fontSize: "0.88rem", color: "var(--textPrimary)" }}>
              <i className="bx bxs-info-circle" style={{ marginLeft: "6px", color: color, fontSize: "1.1rem", verticalAlign: "middle" }}></i>
              <strong>نصيحة الرحلة: </strong>
              <span style={{ color: "var(--textSecondary)" }}>{currentRoute.tips}</span>
            </p>
          </div>

        </div>

        {/* Train Types & Features Section */}
        <div className="metro-animate-slide-up metro-delay-350" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            margin: "0 0 4px",
            display: "flex",
            alignItems: "center"
          }}>
            <i className="bx bx-train" style={{ marginLeft: "8px", color: color, fontSize: "1.4rem" }}></i>
            أنواع القطارات والمميزات
          </h2>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.85rem", lineHeight: "1.7", margin: "0" }}>
            تتنوع قطارات مصر لتناسب جميع الفئات والاحتياجات، إليك تفاصيل أنواع القطارات ومميزات كل نوع:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              {
                name: "قطار تالجو (Talgo) الفاخر",
                badge: "الأحدث والأسرع 🚄",
                badgeBg: "rgba(239, 68, 68, 0.12)",
                badgeColor: "#ef4444",
                desc: "أحدث وأفخم قطارات شبكة سكك حديد مصر المصنعة من شركة تالجو الإسبانية وتعتمد على تكنولوجيا فاخرة خفيفة الوزن ونظام تعليق هوائي يقلل الاهتزازات لراحة فائقة.",
                features: [
                  "شاشات عرض تفاعلية لكل مقعد في الدرجة الأولى",
                  "خدمة واي فاي وعربة بوفيه فاخرة للمشروبات والمأكولات",
                  "تكييف هوائي متطور ونظام عزل صوت يعطي هدوء تام",
                  "دورات مياه حديثة مجهزة ومخصصة لذوي الهمم"
                ]
              },
              {
                name: "قطارات VIP السريعة",
                badge: "درجة أولى ممتازة 🎖️",
                badgeBg: "rgba(245, 158, 11, 0.12)",
                badgeColor: "#f59e0b",
                desc: "قطارات مكيفة بالكامل مخصصة للمسافات الطويلة بين المحافظات الرئيسية وتتميز بالسرعة وقلة محطات التوقف.",
                features: [
                  "مقاعد جلدية فاخرة قابلة للتعديل والميل للراحة",
                  "منافذ شاحن كهربائي لكل مقعد وكاميرات مراقبة أمان",
                  "عربة بوفيه متكاملة تقدم وجبات خفيفة ومشروبات",
                  "تكييف ممتاز وخدمة نظافة دورية طوال الرحلة"
                ]
              },
              {
                name: "قطارات النوم الفاخرة (Wagon-Lits)",
                badge: "للرحلات الطويلة 🌙",
                badgeBg: "rgba(139, 92, 246, 0.12)",
                badgeColor: "#8b5cf6",
                desc: "قطارات مخصصة لرحلات النوم الليلية إلى محافظات الصعيد (الأقصر وأسوان) وتوفر راحة فندقية أثناء السفر.",
                features: [
                  "كابينات نوم مغلقة بها سريرين ومغسلة خاصة",
                  "وجبة عشاء وإفطار ساخنة مجانية شاملة التذكرة",
                  "عربة نادي وبوفيه مخصصة للسمر وتناول المشروبات",
                  "ملاحظ كابينة مخصص لخدمة الركاب طوال فترة السفر"
                ]
              },
              {
                name: "قطارات إسباني / فرنسي مطور",
                badge: "درجة أولى وثانية مكيفة ❄️",
                badgeBg: "rgba(59, 130, 246, 0.12)",
                badgeColor: "#3b82f6",
                desc: "القطارات المكيفة الكلاسيكية الشهيرة التي تم تجديدها بالكامل لتقديم رحلات مريحة بأسعار مناسبة.",
                features: [
                  "تكييف مريح ومقاعد مجددة بالكامل",
                  "أسعار اقتصادية ومناسبة للسفر اليومي والدراسي",
                  "عربة بوفيه لتقديم المشروبات والسندويشات",
                  "تغطي كافة المحافظات والمراكز الكبرى"
                ]
              },
              {
                name: "قطارات روسي مكيفة (الدرجة الثالثة المكيفة)",
                badge: "اقتصادي ومكيف ❄️🚌",
                badgeBg: "rgba(16, 185, 129, 0.12)",
                badgeColor: "#10b981",
                desc: "عربات جديدة دخلت الخدمة حديثاً لتوفير خدمة مكيفة بسعر اقتصادي يناسب كافة فئات المجتمع.",
                features: [
                  "عربات حديثة ومريحة بتكييف كامل",
                  "شاشات إلكترونية داخل العربات لإرشادات السفر",
                  "سعر تذكرة اقتصادي جداً وموحد",
                  "متوفرة بكثرة على خطوط الصعيد والدلتا والوجه البحري"
                ]
              },
              {
                name: "قطارات تحيا مصر (الدرجة العادية / تهوية ديناميكية)",
                badge: "درجة شعبية اقتصادية 🚂",
                badgeBg: "rgba(156, 163, 175, 0.12)",
                badgeColor: "var(--textSecondary)",
                desc: "القطارات الاقتصادية التي تربط بين القرى والمراكز وتتوقف في كافة المحطات الفرعية على مستوى الجمهورية.",
                features: [
                  "تكلفتها منخفضة جداً وتناسب التنقل اليومي",
                  "شبابيك تهوية طبيعية وعربات حديثة مطورة",
                  "تربط كافة القرى والمراكز بالمحافظات",
                  "رحلات متكررة على مدار اليوم"
                ]
              }
            ].map((train, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(128, 128, 128, 0.02)",
                  border: "1px solid var(--borderGlass)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--textPrimary)" }}>{train.name}</h2>
                  <span style={{
                    background: train.badgeBg,
                    color: train.badgeColor,
                    border: `1px solid ${train.badgeColor}30`,
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                    fontWeight: "bold"
                  }}>
                    {train.badge}
                  </span>
                </div>

                <p className="sub-title" style={{ margin: 0, fontSize: "0.82rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                  {train.desc}
                </p>

                <div style={{
                  background: "rgba(0,0,0,0.02)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  borderRight: `3px solid ${train.badgeColor}`
                }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>✨ أهم المميزات:</div>
                  <ul style={{ margin: 0, paddingRight: "16px", fontSize: "0.78rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    {train.features.map((feat, fIdx) => (
                      <li key={fIdx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to book section */}
        <div className="metro-animate-slide-up metro-delay-400" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            margin: "0 0 8px"
          }}>
            <i className="bx bxs-book-open" style={{ marginLeft: "8px", color: color, fontSize: "1.3rem", verticalAlign: "middle" }}></i>
            كيف يمكنني حجز التذاكر ؟
          </h2>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.85rem", lineHeight: "1.7", margin: "0" }}>
            يمكنك الحجز بسهولة عبر عدة طرق معتمدة رسمياً من الهيئة القومية لسكك حديد مصر لمنع التكدس أمام شبابيك التذاكر:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {([
              {
                title: "💻 الموقع الإلكتروني الرسمي",
                desc: "يمكنك حجز التذاكر والدفع ببطاقة الائتمان عبر البوابة الرسمية للهيئة عبر الإنترنت.",
                links: [
                  {
                    name: "الموقع الرسمي",
                    url: "https://enr.gov.eg/o-city/obs/enr/railway/ar/booktickets",
                    icon: "bx bx-globe",
                    iconColor: color || "#3b82f6"
                  }
                ]
              },
              {
                title: "📱 التطبيق الهاتفي الرسمي (ENR Trains)",
                desc: "حمل تطبيق الهواتف الذكية المعتمد لحجز التذاكر والاستعلام عن مواعيد رحلات القطار بكل سهولة عبر الأندرويد والآيفون.",
                links: [
                  {
                    name: "Google Play",
                    url: "https://play.google.com/store/apps/details?id=enr.transit.maf",
                    icon: "bx bxl-android",
                    iconColor: "#10b981"
                  },
                  {
                    name: "App Store",
                    url: "https://apps.apple.com/eg/app/سكك-حديد-مصر-التطبيق-الرسمى/id1486815902?l=ar",
                    icon: "bx bxl-apple",
                    iconColor: "var(--textPrimary)"
                  }
                ]
              },
              {
                title: "🎟️ مكاتب فوري (Fawry)",
                desc: "أصبح بإمكانك حجز تذاكر القطارات المكيفة والروسية من أي منفذ أو ماكينة فوري منتشرة في كل أنحاء الجمهورية.",
                links: [
                  {
                    name: "فوري للخدمات",
                    url: "https://fawry.com/",
                    icon: "bx bx-store-alt",
                    iconColor: "#f59e0b"
                  }
                ]
              }
            ] as { title: string; desc: string; links: { name: string; url: string; icon: string; iconColor?: string }[] }[]).map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(128,128,128,0.03)",
                  border: "1px solid var(--borderGlass)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <h3 className="sub-title" style={{ margin: "0 0 6px 0", color: "var(--textPrimary)", fontWeight: "700", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    {item.title}
                  </h3>
                  <p className="sub-title" style={{ margin: 0, fontSize: "0.8rem", color: "var(--textSecondary)", lineHeight: "1.5" }}>
                    {item.desc}
                  </p>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  {item.links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        color: "var(--textPrimary)",
                        textDecoration: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: "rgba(128, 128, 128, 0.06)",
                        border: "1px solid var(--borderGlass)",
                        transition: "all 0.2s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(128, 128, 128, 0.12)";
                        e.currentTarget.style.borderColor = color || "#3b82f6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(128, 128, 128, 0.06)";
                        e.currentTarget.style.borderColor = "var(--borderGlass)";
                      }}
                    >
                      <i className={link.icon} style={{ fontSize: "1.15rem", color: link.iconColor || color || "#3b82f6" }}></i>
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
