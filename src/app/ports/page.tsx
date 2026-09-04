"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Port {
  id?: string;
  name: string;
  governorate: string;
  sea: string;
  type: string;
  capacity: string;
  description: string;
  berths_count?: string;
  connections?: string[];
  operator?: string;
  status?: string;
  map_url: string;
}

const DEFAULT_PORTS: Port[] = [
  {
    name: "ميناء الإسكندرية البحري",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / ركاب / سياحي / حاويات",
    capacity: "أكثر من 60% من تجارة مصر الخارجية تعبر من خلاله.",
    description: "أقدّم وأكبر ميناء بحري تجاري في مصر. يضم محطة ركاب سياحية حديثة، ومحطات متطورة لتداول الحاويات، والبضائع العامة، والصب الجاف والسائل.",
    berths_count: "أكثر من 80 رصيفاً مجهزاً بمختلف أعماق الملاحة",
    connections: ["طريق الإسكندرية - القاهرة الصحراوي", "محور التعمير الدولي", "شبكة السكك الحديدية القومية"],
    operator: "هيئة ميناء الإسكندرية",
    status: "تشغيل فعلي - تطوير شامل",
    map_url: "https://maps.google.com/?q=Alexandria+Port"
  },
  {
    name: "ميناء الدخيلة",
    governorate: "الإسكندرية",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / صناعي / صب جاف",
    capacity: "الامتداد الطبيعي والمكمل لميناء الإسكندرية لاستيعاب السفن العملاقة.",
    description: "يقع غرب ميناء الإسكندرية على موقع متميز، ويخدم بصفة خاصة المجمعات الصناعية الكبرى ومصانع الحديد والصلب والحبوب بفضل أرصفته العميقة.",
    berths_count: "أرصفة عملاقة بأعماق تصل إلى 15 متراً",
    connections: ["محور الدخيلة المباشر للطريق الساحلي الدولي", "خطوط الشحن الحديدية"],
    operator: "هيئة ميناء الإسكندرية",
    status: "تشغيل فعلي",
    map_url: "https://maps.google.com/?q=Dekheila+Port"
  },
  {
    name: "ميناء دمياط",
    governorate: "دمياط",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / حاويات / غاز طبيعي مسال",
    capacity: "مركز محوري لتداول الحاويات وتسييل الغاز بالقرب من مدخل قناة السويس.",
    description: "من أهم الموانئ المصرية الحديثة والمتطورة. يتضمن أحدث محطات تداول الحاويات، ومصنعاً لتسييل وتصدير الغاز الطبيعي، إلى جانب ممر ملاحي نهري يربطه بالنيل.",
    berths_count: "محطات حاويات وحبوب وغاز متطورة مع أرصفة متعددة",
    connections: ["الطريق الدولي الساحلي", "محور دمياط - المنصورة", "الممر الملاحي لنهر النيل"],
    operator: "هيئة ميناء دمياط",
    status: "تشغيل فعلي - مشروع محطة تحيا مصر 1",
    map_url: "https://maps.google.com/?q=Damietta+Port"
  },
  {
    name: "ميناء بورسعيد (شرق وغرب)",
    governorate: "بورسعيد",
    sea: "البحر الأبيض المتوسط / مدخل القناة",
    type: "تجاري محوري / حاويات ترانزيت عالمي",
    capacity: "موقع استراتيجي فريد مباشرة عند المدخل الشمالي لقناة السويس.",
    description: "يشمل ميناء غرب بورسعيد التاريخي وميناء شرق بورسعيد العملاق، والذي يعد من أسرع موانئ تداول الحاويات نمواً في العالم، ويعمل كمحطة ترانزيت رئيسية لربط خطوط التجارة بين الشرق والغرب.",
    berths_count: "أرصفة حاويات عملاقة بأعماق تصل إلى 18.5 متراً",
    connections: ["أنفاق بورسعيد (3 يوليو)", "محور 30 يونيو شريان سيناء", "قناة السويس الملاحية"],
    operator: "الهيئة العامة للمنطقة الاقتصادية لقناة السويس",
    status: "تشغيل فعلي - توسعات عالمية مستمرة",
    map_url: "https://maps.google.com/?q=Port+Said+Port"
  },
  {
    name: "ميناء العين السخنة",
    governorate: "السويس",
    sea: "خليج السويس / البحر الأحمر",
    type: "تجاري / صناعي / بتروكيماويات / حاويات",
    capacity: "أكبر وأعمق ميناء مائي على خليج السويس لأحدث جيل من السفن.",
    description: "ميناء محوري يخدم المنطقة الاقتصادية لقناة السويس، وتعد البوابة الجنوبية الرئيسية للبضائع القادمة من آسيا وشرق إفريقيا نحو القاهرة والدلتا. يرتبط بالقطار الكهربائي السريع.",
    berths_count: "4 أحواض رئيسية عملاقة بأعماق تصل إلى 18 متراً",
    connections: ["القطار الكهربائي السريع (HSR)", "طريق القطامية - السخنة", "طريق السويس - السخنة"],
    operator: "الهيئة العامة للمنطقة الاقتصادية لقناة السويس",
    status: "تشغيل فعلي - مشروع الميناء الكبير",
    map_url: "https://maps.google.com/?q=Sokhna+Port"
  },
  {
    name: "ميناء سفاجا البحري",
    governorate: "البحر الأحمر",
    sea: "البحر الأحمر",
    type: "ركاب / تعديني / تجاري / سياحي",
    capacity: "البوابة البحرية الرئيسية لخدمة محافظات الصعيد وحركة الركاب مع دول الخليج.",
    description: "يتميز بموقعه الاستراتيجي وقربه من مدن الصعيد والأقصر، ويعتبر الميناء الرئيسي لحركة المعتمرين والحجاج والعمالة المسافرة عبر البحر الأحمر، فضلاً عن تصدير الفوسفات والألومنيوم.",
    berths_count: "محطة ركاب حديثة وأرصفة متخصصة للصب الجاف والتعدين",
    connections: ["طريق سفاجا - قنا (المثلث الذهبي)", "طريق الغردقة - سفاجا الساحلي"],
    operator: "هيئة موانئ البحر الأحمر",
    status: "تشغيل فعلي - إنشاء ميناء سفاجا 2",
    map_url: "https://maps.google.com/?q=Safaga+Port"
  },
  {
    name: "ميناء نويبع",
    governorate: "جنوب سيناء",
    sea: "خليج العقبة / البحر الأحمر",
    type: "ركاب / شاحنات (ميناء الجسر العربي)",
    capacity: "يربط مصر بالأردن والمشرق العربي عبر خط الجسر العربي الملاحي.",
    description: "يقع على خليج العقبة ويخدم حركة التجارة والركاب والتبادل البيني للشاحنات بين مصر والأردن ودول الخليج العربي والشام بخدمة العبّارات الجاسرة.",
    berths_count: "محطة ركاب متطورة وأرصفة عبّارات الشاحنات (Ro-Ro)",
    connections: ["طريق نويبع - طابا الدولي", "طريق النفق - نويبع عبر سيناء"],
    operator: "هيئة موانئ البحر الأحمر",
    status: "تشغيل فعلي",
    map_url: "https://maps.google.com/?q=Nuweiba+Port"
  },
  {
    name: "ميناء السويس (بورتوفيق)",
    governorate: "السويس",
    sea: "خليج السويس / البحر الأحمر",
    type: "ركاب / بترول / صيانة سفن",
    capacity: "الميناء التاريخي عند المدخل الجنوبي لقناة السويس.",
    description: "يتخصص في تداول المواد البترولية وركاب العبّارات، ويضم ترسانات إصلاح وصيانة السفن ومحطة ركاب بورتوفيق التاريخية.",
    berths_count: "أرصفة بترول وركاب ورصيف ترسانة صيانة السفن",
    connections: ["طريق القاهرة - السويس الصحراوي", "أنفاق الشهيد أحمد حمدي"],
    operator: "هيئة موانئ البحر الأحمر / هيئة قناة السويس",
    status: "تشغيل فعلي",
    map_url: "https://maps.google.com/?q=Port+Tewfik+Suez"
  },
  {
    name: "ميناء جرجوب البحري (النجيلة)",
    governorate: "مطروح",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / صناعي / لوجستي حديث",
    capacity: "أحدث ميناء تجاري مصري غرب البلاد لخدمة التجارة مع أوروبا وأفريقيا.",
    description: "ميناء عملاق حديث يقع بمدينة النجيلة بمحافظة مطروح، يخدم المنطقة اللوجستية الغربية وحركة التجارة عبر المتوسط وتصدير المنتجات الزراعية والمواد الخام.",
    berths_count: "أرصفة عملاقة بأعماق تصل إلى 17 متراً",
    connections: ["طريق مطروح - السلوم الدولي", "شبكة القطار السريع (مرسى مطروح)"],
    operator: "الهيئة العامة لموانئ مصر",
    status: "تشغيل جديد / تطوير مستمر",
    map_url: "https://maps.google.com/?q=Gargoub+Port"
  },
  {
    name: "ميناء العريش البحري",
    governorate: "شمال سيناء",
    sea: "البحر الأبيض المتوسط",
    type: "تجاري / تصديري / بضائع عامة",
    capacity: "البوابة البحرية الوحيدة لشمال سيناء لتصدير المنتجات التعدينية والملح.",
    description: "شهد عمليات تطوير شاملة بأرصفة وحواجز أمواج بطول كيلومترات لتصدير الأسمنت والملح والمنتجات التعدينية من سيناء إلى الأسواق العالمية.",
    berths_count: "أرصفة مطورة وحواجز أمواج بطول 3 كم",
    connections: ["طريق القنطرة - العريش الدولي", "شبكة طرق شمال سيناء"],
    operator: "الهيئة العامة للمنطقة الاقتصادية لقناة السويس",
    status: "تطوير شامل وتشغيل",
    map_url: "https://maps.google.com/?q=Arish+Port"
  }
];

function normalizeArabic(text: string) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "");
}

export default function PortsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "mediterranean" | "redsea" | "commercial" | "passenger">("all");
  const [expandedPort, setExpandedPort] = useState<string | null>(null);

  // Instant Search Dropdown Ref & State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadPorts();
    }
  }, [user, hasAccess]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        const loadedData = (data || []).map(dbItem => {
          const localMatch = DEFAULT_PORTS.find(
            lp => normalizeArabic(lp.name) === normalizeArabic(dbItem.name)
          );
          return {
            ...localMatch,
            ...dbItem,
            berths_count: dbItem.berths_count || localMatch?.berths_count || "أرصفة متعددة الأغراض",
            connections: Array.isArray(dbItem.connections) ? dbItem.connections : (localMatch?.connections || []),
            operator: dbItem.operator || localMatch?.operator || "هيئة الموانئ البحرية",
            status: dbItem.status || localMatch?.status || "تشغيل فعلي"
          };
        });

        const dbNames = new Set((data || []).map(d => normalizeArabic(d.name)));
        const missingLocals = DEFAULT_PORTS.filter(lp => !dbNames.has(normalizeArabic(lp.name)));

        setPorts([...loadedData, ...missingLocals]);
      }
    } catch {
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
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => {
            const match = DEFAULT_PORTS.find(d => normalizeArabic(d.name) === normalizeArabic(p.name));
            return { ...match, ...p };
          });
        }
      } catch {
        return DEFAULT_PORTS;
      }
    }
    localStorage.setItem("local_ports", JSON.stringify(DEFAULT_PORTS));
    return DEFAULT_PORTS;
  };

  const allPortsList = ports.length > 0 ? ports : DEFAULT_PORTS;

  // Filtered Ports calculation
  const filteredPorts = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    return allPortsList.filter(port => {
      const matchSearch =
        !q ||
        normalizeArabic(port.name).includes(q) ||
        normalizeArabic(port.governorate).includes(q) ||
        normalizeArabic(port.sea).includes(q) ||
        normalizeArabic(port.type).includes(q) ||
        normalizeArabic(port.description).includes(q);

      if (!matchSearch) return false;

      if (selectedFilter === "mediterranean") {
        return port.sea.includes("المتوسط");
      } else if (selectedFilter === "redsea") {
        return port.sea.includes("الأحمر") || port.sea.includes("السويس") || port.sea.includes("العقبة");
      } else if (selectedFilter === "commercial") {
        return port.type.includes("تجاري") || port.type.includes("حاويات") || port.type.includes("صناعي");
      } else if (selectedFilter === "passenger") {
        return port.type.includes("ركاب") || port.type.includes("سياحي");
      }

      return true;
    });
  }, [allPortsList, searchQuery, selectedFilter]);

  // Global search autocomplete results
  const searchResults = useMemo(() => {
    const q = normalizeArabic(searchQuery.trim());
    if (!q) return [];
    return allPortsList.filter(p => normalizeArabic(p.name).includes(q) || normalizeArabic(p.governorate).includes(q));
  }, [allPortsList, searchQuery]);

  const handleSelectSearchPort = (port: Port) => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    setExpandedPort(port.name);

    setTimeout(() => {
      const el = document.getElementById(`port-card-${encodeURIComponent(port.name)}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const toggleExpand = (portName: string) => {
    setExpandedPort(prev => (prev === portName ? null : portName));
  };

  // Category counts for filter tabs
  const counts = useMemo(() => {
    return {
      all: allPortsList.length,
      mediterranean: allPortsList.filter(p => p.sea.includes("المتوسط")).length,
      redsea: allPortsList.filter(p => p.sea.includes("الأحمر") || p.sea.includes("السويس") || p.sea.includes("العقبة")).length,
      commercial: allPortsList.filter(p => p.type.includes("تجاري") || p.type.includes("حاويات") || p.type.includes("صناعي")).length,
      passenger: allPortsList.filter(p => p.type.includes("ركاب") || p.type.includes("سياحي")).length
    };
  }, [allPortsList]);

  // Loading Screen
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bgPrimary)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", direction: "rtl" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }} />
        <p style={{ color: "var(--textSecondary)", fontSize: "1rem", fontFamily: "var(--font-cairo)" }}>جاري التحقق من التفاصيل ...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  // Paywall Screen (Consistent with Metro, Monorail, LRT & Airports)
  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl", textAlign: "right" }}>
        {/* Header Banner */}
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
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/arab_republice.png" alt="arab_republice" loading="lazy" decoding="async" style={{ width: "35px", height: "35px", marginLeft: "10px" }} />
              دليل الموانئ البحرية
            </h1>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              استكشف الموانئ المصرية على البحر المتوسط والبحر الأحمر.
            </p>
          </div>
        </div>

        {/* Main Container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
          {/* Back Button */}
          <div style={{ marginTop: "24px", marginBottom: "16px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--colorSecondary, #3b82f6)",
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
          <div className="metro-animate-slide-up metro-delay-200" style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "48px 32px",
            boxShadow: "var(--shadow-card)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "140px",
              height: "140px",
              background: "radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)",
              borderRadius: "50%"
            }} />

            {/* Lock Icon Image */}
            <div style={{ marginBottom: "24px" }}>
              <img src="/images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
              دليل الموانئ يتطلب اشتراك في الباقة الذهبية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "1rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px" }}>
              تصفح دليل الموانئ البحرية التجارية، اللوجستية، والسياحية وطاقتها الاستيعابية متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
            </p>

            {/* Features list */}
            <div style={{ background: "var(--bgSecondary)", padding: "18px 24px", borderRadius: "12px", border: "1px solid var(--borderGlass)", textAlign: "right", margin: "0 auto 32px", maxWidth: "420px" }}>
              <div style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية:</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✨ دليل الموانئ البحرية (الإسكندرية، الدخيلة، دمياط، السخنة، بورسعيد، إلخ)</li>
                <li>✨ الطاقة الاستيعابية والقدرة التشغيلية وأرصفة التداول</li>
                <li>✨ الربط مع شبكات الطرق والسكك الحديدية والقطار السريع</li>
                <li>✨ تشمل أيضاً المطارات ومواقف السفر ومخطط الرحلات الذكي بالكامل</li>
              </ul>
            </div>

            {/* Call to Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  className="btn btn-gold"
                  style={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة الذهبية
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

  // Main Authorized Interface
  return (
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl", textAlign: "right" }}>
      {/* Header Banner - Matches Metro & Monorail Cover Style */}
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
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
            fontWeight: "600",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}>
            <img src="/images/icons2d/arab_republice.png" alt="arab_republice" loading="lazy" decoding="async" style={{ width: "55px", marginLeft: "10px" }} />
            دليل الموانئ البحرية
          </h1>
          <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            استكشف الموانئ المصرية على البحرين المتوسط والأحمر. تعرف على التخصص، القدرات التشغيلية، الأرصفة المتاحة، وسبل الوصول.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#14b8a6",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>موانئ مصر البحرية ({allPortsList.length}) ⚓</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "var(--colorSecondary)",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>تداول الحاويات والبضائع والركاب</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        {/* Back Button */}
        <div style={{ marginTop: "24px", marginBottom: "16px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--colorSecondary, #3b82f6)",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "0.95rem"
            }}
          >
            <i className="bx bx-right-arrow-alt" style={{ fontSize: "1.4rem" }}></i>
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Search Panel Card - Styled matching Metro searchCard & Directory searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 30,
        }}>
          {/* Search Box */}
          <div ref={searchContainerRef} style={{ position: "relative" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: "5px", color: "var(--colorSecondary)" }}></i> ابحث في دليل الموانئ
            </label>
            <input
              className="input-fields"
              type="text"
              placeholder="ابحث باسم الميناء، المحافظة، أو البحر (مثال: دمياط، السخنة)..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              style={{
                width: "100%",
                direction: "rtl",
                height: "50px",
              }}
            />

            {/* Instant Autocomplete Results */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "var(--bgPrimary)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                zIndex: 100,
                marginTop: "6px",
                maxHeight: "260px",
                overflowY: "auto",
                padding: "8px 0"
              }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "var(--textSecondary)", fontSize: "0.9rem" }}>
                    لم يتم العثور على موانئ مطابقة لبحثك
                  </div>
                ) : (
                  searchResults.map((port, index) => (
                    <div
                      key={port.id || index}
                      onClick={() => handleSelectSearchPort(port)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        cursor: "pointer",
                        borderBottom: index < searchResults.length - 1 ? "1px solid var(--borderGlass)" : "none",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bgSecondary)"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "1.1rem" }}>⚓</span>
                        <span style={{ fontWeight: "700", color: "var(--textPrimary)", fontSize: "0.95rem" }}>
                          {port.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.72rem",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(20, 184, 166, 0.12)",
                        color: "#14b8a6",
                        fontWeight: "600"
                      }}>
                        {port.governorate}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            <button
              onClick={() => setSelectedFilter("all")}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: "700",
                border: "1px solid var(--borderGlass)",
                background: selectedFilter === "all" ? "var(--colorSecondary)" : "var(--bgSecondary)",
                color: selectedFilter === "all" ? "#fff" : "var(--textSecondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              الكل ({counts.all})
            </button>
            <button
              onClick={() => setSelectedFilter("mediterranean")}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: "700",
                border: "1px solid var(--borderGlass)",
                background: selectedFilter === "mediterranean" ? "#3b82f6" : "var(--bgSecondary)",
                color: selectedFilter === "mediterranean" ? "#fff" : "var(--textSecondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              🌊 البحر المتوسط ({counts.mediterranean})
            </button>
            <button
              onClick={() => setSelectedFilter("redsea")}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: "700",
                border: "1px solid var(--borderGlass)",
                background: selectedFilter === "redsea" ? "#ef4444" : "var(--bgSecondary)",
                color: selectedFilter === "redsea" ? "#fff" : "var(--textSecondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              🔴 البحر الأحمر وخليج السويس ({counts.redsea})
            </button>
            <button
              onClick={() => setSelectedFilter("commercial")}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: "700",
                border: "1px solid var(--borderGlass)",
                background: selectedFilter === "commercial" ? "#10b981" : "var(--bgSecondary)",
                color: selectedFilter === "commercial" ? "#fff" : "var(--textSecondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              📦 تجاري وحاويات ({counts.commercial})
            </button>
            <button
              onClick={() => setSelectedFilter("passenger")}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: "700",
                border: "1px solid var(--borderGlass)",
                background: selectedFilter === "passenger" ? "#8b5cf6" : "var(--bgSecondary)",
                color: selectedFilter === "passenger" ? "#fff" : "var(--textSecondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              🚢 ركاب وسياحة ({counts.passenger})
            </button>
          </div>
        </div>

        {/* Ports List Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "40px",
              textAlign: "center"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "var(--colorSecondary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px"
              }} />
              <span style={{ color: "var(--textSecondary)", fontSize: "0.9rem" }}>جاري تحميل بيانات الموانئ...</span>
            </div>
          ) : filteredPorts.length > 0 ? (
            filteredPorts.map((port, idx) => {
              const isExpanded = expandedPort === port.name;

              return (
                <div
                  key={port.id || idx}
                  id={`port-card-${encodeURIComponent(port.name)}`}
                  className="metro-animate-slide-up"
                  style={{
                    backgroundColor: "var(--bgPrimary)",
                    border: isExpanded ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                    borderRadius: "15px",
                    padding: "20px",
                    boxShadow: "var(--shadow-card)",
                    transition: "all 0.25 ease",
                  }}
                >
                  {/* Card Header & Title */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <h5 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                        ⚓ {port.name}
                      </h5>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          background: "rgba(20, 184, 166, 0.12)",
                          color: "#14b8a6",
                          border: "1px solid rgba(20, 184, 166, 0.25)",
                          padding: "2px 8px",
                          borderRadius: "8px",
                          fontWeight: "700"
                        }}>
                          🌊 {port.sea}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          background: "var(--bgSecondary)",
                          color: "var(--textSecondary)",
                          border: "1px solid var(--borderGlass)",
                          padding: "2px 8px",
                          borderRadius: "8px"
                        }}>
                          📍 {port.governorate}
                        </span>
                        {port.status && (
                          <span style={{
                            fontSize: "0.72rem",
                            background: "rgba(59, 130, 246, 0.12)",
                            color: "var(--colorSecondary)",
                            padding: "2px 8px",
                            borderRadius: "8px",
                            fontWeight: "600"
                          }}>
                            {port.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand/Collapse toggle */}
                    <button
                      onClick={() => toggleExpand(port.name)}
                      style={{
                        background: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "10px",
                        padding: "6px 12px",
                        color: "var(--colorSecondary)",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span>{isExpanded ? "إخفاء" : "التفاصيل"}</span>
                      <i className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.1rem" }}></i>
                    </button>
                  </div>

                  {/* Short Summary */}
                  <p style={{
                    margin: "0 0 14px 0",
                    color: "var(--textSecondary)",
                    fontSize: "0.9rem",
                    lineHeight: "1.6"
                  }}>
                    {port.description}
                  </p>

                  {/* Highlights Bar */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                    background: "var(--bgSecondary)",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--borderGlass)",
                    fontSize: "0.82rem",
                    marginBottom: isExpanded ? "16px" : "14px"
                  }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>⚙️ نوع الميناء:</span>
                      <strong style={{ color: "var(--textPrimary)", fontSize: "0.85rem" }}>{port.type}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>📈 القدرة التشغيلية:</span>
                      <strong style={{ color: "var(--textPrimary)", fontSize: "0.85rem" }}>{port.capacity}</strong>
                    </div>
                  </div>

                  {/* Accordion Expanded Section */}
                  {isExpanded && (
                    <div className="metro-animate-fade" style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      borderTop: "1px solid var(--borderGlass)",
                      paddingTop: "16px",
                      marginTop: "10px"
                    }}>
                      {/* Berths & Infrastructure */}
                      {port.berths_count && (
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px" }}>
                            🏗️ الأرصفة والتجهيزات الفنية:
                          </div>
                          <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                            {port.berths_count}
                          </p>
                        </div>
                      )}

                      {/* Connections & Transportation */}
                      {port.connections && port.connections.length > 0 && (
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                            🚍 طرق الوصول والارتباط بالشبكة القومية:
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {port.connections.map((conn, cIdx) => (
                              <span key={cIdx} style={{
                                fontSize: "0.78rem",
                                background: "var(--bgSecondary)",
                                color: "var(--textSecondary)",
                                border: "1px solid var(--borderGlass)",
                                padding: "4px 10px",
                                borderRadius: "8px"
                              }}>
                                🔗 {conn}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Operator & Authority */}
                      {port.operator && (
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "4px" }}>
                            🏢 الهيئة المشغلة:
                          </div>
                          <span style={{ color: "var(--textSecondary)", fontSize: "0.85rem" }}>
                            {port.operator}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div style={{
                    borderTop: "1px solid var(--borderGlass)",
                    paddingTop: "12px",
                    marginTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <a
                      href={port.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        textDecoration: "none",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <i className="bx bx-map" style={{ fontSize: "1.1rem" }}></i>
                      عرض الموقع والاتجاهات الجغرافية
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              padding: "40px",
              textAlign: "center",
              color: "var(--textSecondary)",
              boxShadow: "var(--shadow-card)"
            }}>
              لا توجد موانئ مطابقة لخيارات البحث المحددة. يرجى تعديل كلمات البحث أو الفلتر.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
