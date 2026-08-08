"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface TrainClass {
  name: string;
  price: string;
  features: string;
}

interface RailwayRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  duration: string;
  stops: string[];
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
    stops: ["القاهرة (رمسيس)", "بنها", "طنطا", "دمنهور", "سيدي جابر", "الإسكندرية"],
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
    stops: ["القاهرة (رمسيس)", "الجيزة", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "إدفو", "كوم أمبو", "أسوان"],
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
    stops: ["القاهرة (رمسيس)", "بنها", "الزقازيق", "الإسماعيلية", "القنطرة غرب", "بورسعيد"],
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
    stops: ["القاهرة (رمسيس)", "بنها", "قويسنا", "بركة السبع", "طنطا", "المحلة الكبرى", "سمنود", "طلخا", "المنصورة"],
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

  const currentRoute = RAILWAY_ROUTES.find(r => r.id === selectedRouteId) || RAILWAY_ROUTES[0];

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  if (authLoading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "100px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--accent-ios, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>جاري التحقق من تفاصيل الاشتراك...</p>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="app-container" style={{ maxWidth: "600px", paddingTop: "60px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
        {/* Back Button */}
        <div style={{ marginBottom: "24px" }}>
          <Link 
            href="/" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              color: "var(--accent-ios, #3b82f6)", 
              textDecoration: "none", 
              fontWeight: "600",
              fontSize: "0.95rem" 
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Premium Lock Panel */}
        <div className="glass-panel" style={{ padding: "48px 32px", textAlign: "center", border: "1px solid rgba(99, 102, 241, 0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            left: "-20px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
            borderRadius: "50%"
          }} />

          {/* Lock Icon */}
          <div style={{ 
            fontSize: "4.5rem", 
            marginBottom: "24px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            background: "rgba(99, 102, 241, 0.08)",
            borderRadius: "50%",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#6366f1",
            animation: "pulse 2s infinite"
          }}>
            <i className="bx bxs-lock-alt"></i>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#fff", marginBottom: "14px" }}>
            دليل سكك حديد مصر ميزة فضية 🥈
          </h2>
          
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
            تصفح مواعيد وأسعار قطارات السفر بين المحافظات المختلفة متاح حصرياً للمشتركين في الباقة الفضية أو الذهبية.
          </p>

          {/* Features list */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الفضية (40 ج.م/شهرياً):</div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ مواعيد وجداول تحرك القطارات (تالجو، VIP، إسباني ومكيف)</li>
              <li>✨ أسعار التذاكر التفصيلية لكافة درجات السفر</li>
              <li>✨ نصائح الحجز ومسارات التوقف والمحطات البينية</li>
              <li>✨ تشمل أيضاً خريطة المونوريل وخطوط LRT ومحرك البحث</li>
            </ul>
          </div>

          {/* Call to Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
            {user ? (
              <Link
                href="/profile"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
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
                color: "#94a3b8",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.9rem",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "block"
              }}
            >
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ maxWidth: "900px", paddingTop: "40px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "20px" }}>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--accent-ios, #3b82f6)", 
            textDecoration: "none", 
            fontWeight: "600",
            fontSize: "0.95rem" 
          }}
        >
          <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: "40px 30px", marginBottom: "32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ 
          position: "absolute", 
          top: "-20px", 
          right: "-20px", 
          width: "120px", 
          height: "120px", 
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4.5rem", marginBottom: "16px" }}>🚂</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "10px", color: "var(--text-primary)" }}>
          سكك حديد مصر (ENR)
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          استكشف شبكة قطارات سكك حديد مصر، اعرف أسعار التذاكر وفئات القطارات، ومسارات الرحلات والمدد الزمنية للخطوط الرئيسية.
        </p>
      </div>

      {/* Route Selector Tabs */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "24px", scrollbarWidth: "none" }}>
        {RAILWAY_ROUTES.map(route => (
          <button
            key={route.id}
            onClick={() => setSelectedRouteId(route.id)}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              background: selectedRouteId === route.id ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" : "rgba(255, 255, 255, 0.04)",
              color: selectedRouteId === route.id ? "#fff" : "var(--text-secondary)",
              border: selectedRouteId === route.id ? "none" : "1px solid var(--border-glass)",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            {route.name}
          </button>
        ))}
      </div>

      {/* Main Details Panel */}
      <div className="glass-panel" style={{ padding: "32px 24px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginBottom: "10px" }}>
          📍 تفاصيل الخط: {currentRoute.name}
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" }}>
          <div>
            <strong style={{ color: "#ef4444" }}>🚉 محطة القيام: </strong>
            <span style={{ color: "#e2e8f0" }}>{currentRoute.from}</span>
          </div>
          <div>
            <strong style={{ color: "#ef4444" }}>🏁 محطة النهاية: </strong>
            <span style={{ color: "#e2e8f0" }}>{currentRoute.to}</span>
          </div>
          <div>
            <strong style={{ color: "#ef4444" }}>⏱️ متوسط زمن الرحلة: </strong>
            <span style={{ color: "#e2e8f0" }}>{currentRoute.duration}</span>
          </div>
        </div>

        {/* Route Stops Visualizer */}
        <div style={{ marginTop: "28px", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#fff", marginBottom: "12px" }}>📌 المحطات الرئيسية على هذا الخط:</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            {currentRoute.stops.map((stop, idx) => (
              <React.Fragment key={stop}>
                <span style={{ 
                  padding: "5px 12px", 
                  borderRadius: "14px", 
                  background: idx === 0 || idx === currentRoute.stops.length - 1 ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.05)", 
                  color: idx === 0 || idx === currentRoute.stops.length - 1 ? "#ef4444" : "#e2e8f0",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  {stop}
                </span>
                {idx < currentRoute.stops.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)" }}>←</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Classes Table */}
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff", marginBottom: "16px" }}>💵 أسعار وميزات قطارات هذا الخط:</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {currentRoute.classes.map((cls, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: "18px", 
                  borderRadius: "12px", 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#fff" }}>{cls.name}</h4>
                  <span style={{ color: "#ef4444", fontWeight: "800", fontSize: "0.95rem" }}>{cls.price}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>{cls.features}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips section */}
        <div style={{ marginTop: "28px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <strong style={{ color: "#fff", display: "block", marginBottom: "6px" }}>💡 نصيحة الموقع للرحلة:</strong>
          {currentRoute.tips}
        </div>
      </div>

      {/* How to book section */}
      <div className="glass-panel" style={{ padding: "28px 24px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff", marginBottom: "16px" }}>
          📲 كيف يمكنني حجز تذاكر القطارات؟
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7", margin: "0 0 20px 0" }}>
          يمكنك الحجز بسهولة عبر عدة طرق معتمدة رسمياً من الهيئة القومية لسكك حديد مصر لمنع التكدس أمام شبابيك التذاكر:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#fff", fontWeight: "700" }}>💻 الموقع الإلكتروني الرسمي</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              يمكنك حجز التذاكر والدفع ببطاقة الائتمان عبر البوابة الرسمية للهيئة عبر الإنترنت.
            </p>
          </div>
          
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#fff", fontWeight: "700" }}>📱 التطبيق الهاتفي (ENR)</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              حمل تطبيق الهواتف الذكية المعتمد لحجز التذاكر والاستعلام عن مواعيد رحلات القطار بكل سهولة.
            </p>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#fff", fontWeight: "700" }}>🎟️ مكاتب فوري (Fawry)</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              أصبح بإمكانك حجز تذاكر القطارات المكيفة والروسية من أي منفذ أو ماكينة فوري منتشرة في كل أنحاء الجمهورية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
