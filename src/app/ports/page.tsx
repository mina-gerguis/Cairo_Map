"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Port {
  id?: string;
  name: string;
  governorate: string;
  sea: string;
  type: string;
  capacity: string;
  description: string;
  map_url: string;
}

const DEFAULT_PORTS: Port[] = [
  {
    name: "ميناء الإسكندرية البحري",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / ركاب / سياحي",
    capacity: "أكثر من 60% من تجارة مصر الخارجية تعبر من خلاله.",
    description: "أقدم وأهم ميناء بحري تجاري في مصر. يضم الميناء أرصفة مخصصة للحاويات، البضائع العامة، الفحم، ومحطة ركاب سياحية حديثة تستقبل السفن السياحية العالمية.",
    map_url: "https://maps.google.com/?q=Alexandria+Port"
  },
  {
    name: "ميناء الدخيلة",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / صناعي",
    capacity: "يعتبر الامتداد الطبيعي لميناء الإسكندرية لتقليل التكدس.",
    description: "يقع غرب ميناء الإسكندرية ويخدم بشكل كبير المجمعات الصناعية المجاورة، مثل مصانع الحديد والصلب وغيرها، ويمتلك أرصفة عميقة لاستقبال السفن الضخمة.",
    map_url: "https://maps.google.com/?q=Dekheila+Port"
  },
  {
    name: "ميناء دمياط",
    governorate: "دمياط",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / حاويات / غاز مسال",
    capacity: "يتميز بوجود أحدث محطة لتداول الحاويات والبضائع العامة والغاز.",
    description: "من أهم الموانئ المصرية الحديثة، يقع بالقرب من مدخل قناة السويس. يحتوي على تسهيلات متطورة لتداول الحاويات ومصنع رائد لتسييل وتصدير الغاز الطبيعي.",
    map_url: "https://maps.google.com/?q=Damietta+Port"
  },
  {
    name: "ميناء بورسعيد (شرق وغرب)",
    governorate: "بورسعيد",
    sea: "البحر الأبيض المتوسط / مدخل القناة",
    type: "تجاري / حاويات عالمي",
    capacity: "يقع مباشرة على المجرى الملاحي لقناة السويس.",
    description: "ينقسم إلى ميناء غرب بورسعيد وميناء شرق بورسعيد المحوري العملاق الذي يعد من أسرع موانئ تداول الحاويات نمواً في العالم، ويعمل كمحطة ترانزيت رئيسية لربط قارات العالم.",
    map_url: "https://maps.google.com/?q=Port+Said+Port"
  },
  {
    name: "ميناء العين السخنة",
    governorate: "السويس",
    sea: "خليج السويس / البحر الأحمر",
    type: "تجاري / صناعي حديث",
    capacity: "يتميز بأعماق تصل إلى 17 متراً لاستيعاب سفن الجيل الثالث.",
    description: "ميناء محوري يخدم المنطقة الاقتصادية لقناة السويس ويعد البوابة الجنوبية الرئيسية للبضائع القادمة من آسيا وشرق إفريقيا باتجاه القاهرة والدلتا.",
    map_url: "https://maps.google.com/?q=Sokhna+Port"
  },
  {
    name: "ميناء سفاجا البحري",
    governorate: "البحر الأحمر",
    sea: "البحر الأحمر",
    type: "ركاب / بضائع / سياحي",
    capacity: "البوابة الرئيسية لخدمة محافظات الصعيد وحركة الركاب مع دول الخليج.",
    description: "يتميز بموقعه الاستراتيجي وقربه من مدن الصعيد والأقصر، ويعتبر الميناء الرئيسي لحركة المعتمرين والحجاج والعمالة المصرية المسافرة عبر البحر الأحمر، بالإضافة لتداول الفوسفات والألومنيوم.",
    map_url: "https://maps.google.com/?q=Safaga+Port"
  },
  {
    name: "ميناء نويبع",
    governorate: "جنوب سيناء",
    sea: "خليج العقبة / البحر الأحمر",
    type: "ركاب / شاحنات (ميناء ربط عربي)",
    capacity: "يربط مصر بالأردن والمشرق العربي عبر خط الجسر العربي الملاحي.",
    description: "يقع على خليج العقبة ويخدم حركة التجارة والركاب والتبادل البيني للشاحنات بين مصر والأردن ودول الخليج العربي والشام.",
    map_url: "https://maps.google.com/?q=Nuweiba+Port"
  }
];

export default function PortsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin || 
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadPorts();
    }
  }, [user, hasAccess]);

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
        <div className="glass-panel" style={{ padding: "48px 32px", textAlign: "center", border: "1px solid rgba(234, 179, 8, 0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: "-20px",
            left: "-20px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)",
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
            background: "rgba(234, 179, 8, 0.08)",
            borderRadius: "50%",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            color: "#eab308",
            animation: "pulse 2s infinite"
          }}>
            <i className="bx bxs-lock-alt"></i>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#fff", marginBottom: "14px" }}>
            دليل الموانئ ميزة ذهبية 🥇
          </h2>
          
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
            تصفح دليل الموانئ البحرية التجارية والسياحية في مصر ومعلومات سعتها التشغيلية متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
          </p>

          {/* Features list */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية (60 ج.م/شهرياً):</div>
            <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>✨ دليل الموانئ البحرية (الإسكندرية، الدخيلة، دمياط، بورتوفيق، نويبع، إلخ)</li>
              <li>✨ تفاصيل الموانئ التجارية والسياحية وركاب السفن</li>
              <li>✨ الطاقة الاستيعابية والبيانات الجغرافية لكل ميناء</li>
              <li>✨ تشمل أيضاً المطارات ومواقف السفر ومخطط الرحلات الذكي بالكامل</li>
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
                  background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                  color: "#000",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 15px rgba(250, 204, 21, 0.3)",
                  display: "block"
                }}
              >
                🚀 اشترك الآن ورقّ حسابك للذهبية (60 ج.م)
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

  const loadPorts = async () => {
    setLoading(true);
    if (!supabase) {
      setPorts(getLocalPorts());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("ports")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setPorts(getLocalPorts());
      } else {
        setPorts(data || []);
      }
    } catch (err) {
      setPorts(getLocalPorts());
    } finally {
      setLoading(false);
    }
  };

  const getLocalPorts = () => {
    if (typeof window === "undefined") return DEFAULT_PORTS;
    const local = localStorage.getItem("local_ports");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_PORTS;
      }
    }
    localStorage.setItem("local_ports", JSON.stringify(DEFAULT_PORTS));
    return DEFAULT_PORTS;
  };

  const filteredPorts = ports.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.governorate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container" style={{ maxWidth: "950px", paddingTop: "40px", paddingBottom: "60px", direction: "rtl", textAlign: "right" }}>
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
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)", 
          borderRadius: "50%" 
        }} />
        <div style={{ fontSize: "4.5rem", marginBottom: "16px" }}>⚓</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: "900", marginBottom: "10px", color: "var(--text-primary)" }}>
          دليل الموانئ البحرية المصرية
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          استكشف الموانئ المصرية على البحر المتوسط والبحر الأحمر. تعرف على التخصص، القدرات الاستيعابية، الأهمية الاستراتيجية، ومواقعها الجغرافية.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ position: "relative", maxWidth: "450px" }}>
          <input
            type="text"
            placeholder="ابحث باسم الميناء، المحافظة، أو البحر (مثال: دمياط)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ios-input"
            style={{
              width: "100%",
              padding: "14px 44px 14px 16px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              border: "1px solid var(--border-glass)",
              fontFamily: "var(--font-cairo)",
              fontSize: "0.95rem"
            }}
          />
          <i className="bx bx-search" style={{
            position: "absolute",
            top: "50%",
            right: "16px",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontSize: "1.3rem"
          }}></i>
        </div>
      </div>

      {/* Ports List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", gridColumn: "1/-1" }}>
            <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-ios)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري تحميل البيانات...</span>
          </div>
        ) : filteredPorts.length > 0 ? (
          filteredPorts.map((port, idx) => (
            <div key={port.id || idx} className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "14px" }}>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: "800", color: "#fff" }}>{port.name}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", background: "rgba(20, 184, 166, 0.12)", color: "#14b8a6", border: "1px solid rgba(20, 184, 166, 0.25)", padding: "2px 8px", borderRadius: "12px", fontWeight: "700" }}>
                      🌊 {port.sea}
                    </span>
                    <span style={{ fontSize: "0.75rem", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-secondary)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "2px 8px", borderRadius: "12px" }}>
                      📍 {port.governorate}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem", lineHeight: "1.6", marginBottom: "20px" }}>
                  <div>
                    <strong style={{ color: "#fff", display: "block", marginBottom: "2px" }}>⚙️ نوع الميناء وتخصصه:</strong>
                    <span style={{ color: "var(--text-secondary)" }}>{port.type}</span>
                  </div>
                  <div>
                    <strong style={{ color: "#fff", display: "block", marginBottom: "2px" }}>📈 القدرة التشغيلية:</strong>
                    <span style={{ color: "var(--text-secondary)" }}>{port.capacity}</span>
                  </div>
                  <div>
                    <strong style={{ color: "#fff", display: "block", marginBottom: "2px" }}>📝 نبذة وتفاصيل:</strong>
                    <p style={{ margin: 0, color: "var(--text-muted)" }}>{port.description}</p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", marginTop: "auto" }}>
                <a
                  href={port.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#14b8a6",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#14b8a6";
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.color = "#14b8a6";
                  }}
                >
                  <i className="bx bx-map" style={{ fontSize: "1.1rem" }}></i>
                  عرض الموقع والاتجاهات
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: "40px", gridColumn: "1/-1", textAlign: "center", color: "var(--text-muted)" }}>
            لا توجد موانئ مطابقة لبحثك. يرجى تعديل العبارة والمحاولة مجدداً.
          </div>
        )}
      </div>
    </div>
  );
}
