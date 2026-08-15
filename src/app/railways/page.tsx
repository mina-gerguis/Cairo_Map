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

  const currentRoute = routes.find(r => r.id === selectedRouteId) || routes[0] || RAILWAY_ROUTES[0];

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", direction: "rtl" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--accent-ios, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "24px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>جاري التحقق من تفاصيل الاشتراك الفضية...</p>
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
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)" }}>
        {/* Banner matching Metro */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bg-primary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--border-glass)",
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
                background: "var(--bg-glass-card)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
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
              color: "var(--text-primary)",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/searchBar/Cairo_train.png" alt="Cairo Train" style={{ width: "35px", height: "35px", marginLeft: "10px" }} />
              سكك حديد مصر (ENR)</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              مواعيد وأسعار قطارات السفر بين المحافظات.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
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
              <img src="/images/lock_cairo_map.png" alt="Lock" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "14px" }}>
              دليل سكك حديد مصر ميزة فضية 🥈
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح مواعيد وأسعار قطارات السفر بين المحافظات المختلفة متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية.
            </p>

            {/* Perks list */}
            <div style={{
              background: "rgba(128, 128, 128, 0.04)",
              padding: "18px 20px",
              borderRadius: "12px",
              border: "1px solid var(--border-glass)",
              textAlign: "right",
              margin: "0 auto 28px",
              maxWidth: "420px"
            }}>
              <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bxs-award" style={{ color: "#fbbf24", fontSize: "1.1rem" }}></i>
                <span>ميزات الباقة الفضية (40 ج.م/شهرياً):</span>
              </div>
              <ul style={{
                paddingRight: "16px",
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
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
                  href="/profile"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    boxShadow: "0 4px 15px rgba(251, 191, 36, 0.3)",
                    display: "block"
                  }}
                >
                  🚀 اشترك الآن ورقّ حسابك للفضية (40 ج.م)
                </Link>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                    display: "block"
                  }}
                >
                  🔑 سجل دخولك أولاً لتفعيل الاشتراك
                </Link>
              )}

              <Link
                href="/"
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  border: "1px solid var(--border-glass)",
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

  const color = selectedRouteId === "cairo-alex" ? "#ef4444" : 
                selectedRouteId === "cairo-aswan" ? "#f59e0b" : 
                selectedRouteId === "cairo-portsaid" ? "#3b82f6" : "#10b981";

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>
      {/* CSS internal styles definition for custom hover effects and keyframe animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bg-primary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--border-glass)",
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
              background: "var(--bg-glass-card)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.5rem" }}></i>
          </Link>
        </div>

        <div className="metro-animate-slide-up metro-delay-100">
          <h1 style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "bold",
            color: "var(--text-primary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/searchBar/Cairo_train.png" alt="Cairo Train" style={{ width: "40px", height: "40px", marginLeft: "10px" }} />
            سكك حديد مصر (ENR)</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            استكشف شبكة قطارات سكك حديد مصر، اعرف أسعار التذاكر وفئات القطارات، ومسارات الرحلات والمدد الزمنية للخطوط الرئيسية.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#ef4444",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>خط بحري (الإسكندرية)</span>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#f59e0b",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>خط قبلي (الصعيد)</span>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#3b82f6",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>خط القناة (بورسعيد)</span>
            <span style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>خط الدلتا (المنصورة)</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl", textAlign: "right" }}>

        {/* Route Selector Tabs Grid */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginTop: "24px",
          marginBottom: "24px"
        }}>
          {RAILWAY_ROUTES.map(route => {
            const active = selectedRouteId === route.id;
            const routeColor = route.id === "cairo-alex" ? "#ef4444" : 
                              route.id === "cairo-aswan" ? "#f59e0b" : 
                              route.id === "cairo-portsaid" ? "#3b82f6" : "#10b981";

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                style={{
                  fontFamily: "var(--font-body)",
                  background: "var(--bg-primary)",
                  border: active ? `2px solid ${routeColor}` : "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  padding: "14px 8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  boxShadow: active ? `0 0 10px ${routeColor}15` : "none",
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "var(--bg-glass-hover)";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "var(--bg-primary)";
                }}
              >
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: routeColor, margin: "0 auto 6px" }} />
                <div style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: "700", fontSize: "0.88rem" }}>
                  {route.id === "cairo-alex" ? "خط الإسكندرية" :
                   route.id === "cairo-aswan" ? "خط الصعيد" :
                   route.id === "cairo-portsaid" ? "خط القناة" : "خط الدلتا"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {route.stops.length} محطات رئيسية
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Details Panel */}
        <div className="metro-animate-slide-up metro-delay-300" style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "var(--text-primary)",
            margin: "0"
          }}>
            📍 تفاصيل الخط: {currentRoute.name}
          </h2>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute.stops[0]?.name.replace(" (رمسيس)", "")?.replace(" (محطة رمسيس)", "") || "القاهرة"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>القيام</div>
            </div>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute.stops[currentRoute.stops.length - 1]?.name.replace(" (محطة سيدي جابر / مصر)", "") || "الوصول"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>الوصول</div>
            </div>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentRoute.duration.split(" ")[0]} {currentRoute.duration.split(" ")[1] || ""}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>المدة المقدرة</div>
            </div>
          </div>

          {/* Detailed stops vertical timeline */}
          <div style={{
            background: "rgba(128, 128, 128, 0.02)",
            padding: "20px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-glass)"
          }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
              📌 المحطات الرئيسية على هذا الخط:
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {currentRoute.stops.map((stop, idx) => {
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
                          border: isUnderConstruction ? `2px dashed #ef4444` : (isFirst || isLast ? `2px solid var(--bg-primary)` : "none"),
                          boxShadow: isUnderConstruction ? "none" : (isFirst || isLast ? `0 0 0 2px ${color}` : "none")
                        }} />
                      </div>

                      {/* Text */}
                      <span style={{
                        fontSize: "0.88rem",
                        fontWeight: isFirst || isLast ? "700" : "500",
                        color: isUnderConstruction ? "#ef4444" : (isFirst || isLast ? "var(--text-primary)" : "var(--text-secondary)"),
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
              })}
            </div>
          </div>

          {/* Classes list */}
          <div style={{ marginTop: "12px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
              💵 أسعار وميزات قطارات هذا الخط:
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentRoute.classes.map((cls, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: "16px", 
                    borderRadius: "12px", 
                    background: "rgba(128, 128, 128, 0.02)", 
                    border: "1px solid var(--border-glass)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    transition: "border 0.2s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.border = `1px solid ${color}40`}
                  onMouseLeave={e => e.currentTarget.style.border = "1px solid var(--border-glass)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>{cls.name}</h4>
                    <span style={{ color: color, fontWeight: "800", fontSize: "0.85rem" }}>{cls.price}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>{cls.features}</p>
                </div>
              ))}
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
            <p style={{ margin: 0, lineHeight: "1.7", fontSize: "0.88rem", color: "var(--text-primary)" }}>
              <i className="bx bxs-info-circle" style={{ marginLeft: "6px", color: color, fontSize: "1.1rem", verticalAlign: "middle" }}></i>
              <strong>نصيحة الرحلة: </strong>
              <span style={{ color: "var(--text-secondary)" }}>{currentRoute.tips}</span>
            </p>
          </div>

        </div>

        {/* How to book section */}
        <div className="metro-animate-slide-up metro-delay-400" style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "var(--text-primary)",
            margin: "0 0 8px"
          }}>
            <i className="bx bxs-book-open" style={{ marginLeft: "8px", color: color, fontSize: "1.3rem", verticalAlign: "middle" }}></i>
            كيف يمكنني حجز تذاكر القطارات؟
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.7", margin: "0" }}>
            يمكنك الحجز بسهولة عبر عدة طرق معتمدة رسمياً من الهيئة القومية لسكك حديد مصر لمنع التكدس أمام شبابيك التذاكر:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                title: "💻 الموقع الإلكتروني الرسمي",
                desc: "يمكنك حجز التذاكر والدفع ببطاقة الائتمان عبر البوابة الرسمية للهيئة عبر الإنترنت."
              },
              {
                title: "📱 التطبيق الهاتفي (ENR)",
                desc: "حمل تطبيق الهواتف الذكية المعتمد لحجز التذاكر والاستعلام عن مواعيد رحلات القطار بكل سهولة."
              },
              {
                title: "🎟️ مكاتب فوري (Fawry)",
                desc: "أصبح بإمكانك حجز تذاكر القطارات المكيفة والروسية من أي منفذ أو ماكينة فوري منتشرة في كل أنحاء الجمهورية."
              }
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(128,128,128,0.02)",
                border: "1px solid var(--border-glass)"
              }}>
                <h4 style={{ margin: "0 0 6px 0", color: "var(--text-primary)", fontWeight: "700", fontSize: "0.88rem" }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
