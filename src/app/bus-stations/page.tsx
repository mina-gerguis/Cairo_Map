"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";

interface BusCompany {
  name: string;
  phone: string;
  type: string;
  logo?: string;
}

interface BusStation {
  id?: string;
  name: string;
  location: string;
  governorate: string;
  companies: BusCompany[];
  destinations: string[];
  description: string;
  map_url: string;
}

const DEFAULT_BUS_STATIONS: BusStation[] = [
  {
    name: "موقف ألماظة للسوبر جيت (Almaza Terminal)",
    location: "مصر الجديدة - بجوار طريق السويس ومطار القاهرة",
    governorate: "القاهرة",
    companies: [
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "رسمي حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "شرم الشيخ", "الغردقة", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "السويس", "بورسعيد"],
    description: "أحدث محطات السوبر جيت في القاهرة. تخدم بشكل رئيسي المسافرين إلى مدن القناة، البحر الأحمر، والوجه القبلي والصعيد بتنظيم ممتاز وصالة انتظار مكيفة.",
    map_url: "https://maps.google.com/?q=Almaza+Super+Jet+Station"
  },
  {
    name: "موقف الترجمان (Cairo Gateway)",
    location: "وسط البلد - شارع الجلاء بجوار محطة مترو جمال عبد الناصر",
    governorate: "القاهرة",
    companies: [
      { name: "شركة شرق الدلتا للنقل", phone: "02-25761311", type: "حكومي" },
      { name: "شركة غرب ووسط الدلتا", phone: "02-25761211", type: "حكومي" },
      { name: "شركة الصعيد للنقل", phone: "02-25761411", type: "حكومي" },
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" }
    ],
    destinations: ["الإسكندرية", "مطروح", "المنصورة", "الزقازيق", "شبه جزيرة سيناء (العريش/طور سيناء)", "محافظات الصعيد بأكملها", "البحر الأحمر"],
    description: "المحطة المركزية الكبرى للنقل البري لجميع المحافظات والدول المجاورة. يضم مكاتب حجز لمعظم الشركات العامة والخاصة وصالة انتظار تجارية ضخمة.",
    map_url: "https://maps.google.com/?q=Torgoman+Bus+Station"
  },
  {
    name: "موقف عبد المنعم رياض (التحرير)",
    location: "وسط البلد - ميدان التحرير خلف المتاحف والمكتبة وبجوار هيلتون",
    governorate: "القاهرة",
    companies: [
      { name: "جو باص (Go Bus)", phone: "19567", type: "خاص فاخر" },
      { name: "بلو باص (Blue Bus)", phone: "16148", type: "خاص فاخر" },
      { name: "سوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: ["الإسكندرية", "الساحل الشمالي", "شرم الشيخ", "دهب", "الغردقة", "المنيا", "أسيوط", "قنا", "الأقصر"],
    description: "موقع استراتيجي بقلب القاهرة يتيح للمسافرين ركوب الحافلات السياحية الفاخرة مباشرة فور الخروج من محطة مترو السادات بالتحرير.",
    map_url: "https://maps.google.com/?q=Abdel+Moneim+Riad+Bus+Station"
  },
  {
    name: "موقف عبود الإقليمي",
    location: "شمال القاهرة - شبرا بمقربة من الطريق الدائري ومترو المظلات",
    governorate: "القاهرة",
    companies: [
      { name: "أتوبيسات غرب الدلتا", phone: "19142", type: "اقتصادي" },
      { name: "أتوبيسات شرق الدلتا", phone: "02-22448400", type: "اقتصادي" }
    ],
    destinations: ["طنطا", "المحلة الكبرى", "المنصورة", "دمنهور", "كفر الشيخ", "الإسكندرية", "بلبيس", "الزقازيق"],
    description: "الموقف الرئيسي والأكبر لربط القاهرة بجميع محافظات الوجه البحري والدلتا. يضم أتوبيسات السفر الاقتصادية وسيارات الأجرة الإقليمية الكبرى.",
    map_url: "https://maps.google.com/?q=Abboud+Bus+Station"
  },
  {
    name: "موقف المنيب الإقليمي",
    location: "الجيزة - المنيب بجوار محطة مترو المنيب والطريق الدائري",
    governorate: "الجيزة",
    companies: [
      { name: "شركة الصعيد للنقل والاتوبيسات", phone: "19142", type: "حكومي" },
      { name: "السوبر جيت (Super Jet)", phone: "19142", type: "حكومي" }
    ],
    destinations: ["الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "الواحات البحرية"],
    description: "البوابة الجنوبية للقاهرة والجيزة ومركز النقل الرئيسي المتجه إلى محافظات الصعيد والوجه القبلي والفيوم والواحات.",
    map_url: "https://maps.google.com/?q=Moneeb+Bus+Station"
  }
];

export default function BusStationsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stations, setStations] = useState<BusStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  // Report Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedStationForReport, setSelectedStationForReport] = useState<BusStation | null>(null);
  const [customStationName, setCustomStationName] = useState("");
  const [reportProblemType, setReportProblemType] = useState<string>("phone");
  const [reportDetails, setReportDetails] = useState("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImageUrl, setReportImageUrl] = useState("");
  const [reportUploading, setReportUploading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitChecking, setLimitChecking] = useState(false);

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  useEffect(() => {
    if (user && hasAccess) {
      loadStations();
    }
  }, [user, hasAccess]);

  const handleOpenReportModal = async (station: BusStation | null = null) => {
    setSelectedStationForReport(station);
    setCustomStationName(station ? "" : "");
    setReportProblemType("phone");
    setReportDetails("");
    setReportImageFile(null);
    setReportImageUrl("");
    setReportError("");
    setReportSuccess(false);
    setReportModalOpen(true);

    if (user) {
      setLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setLimitReached(reached);
      } catch (err) {
        console.error("Failed to check feedback limit:", err);
      } finally {
        setLimitChecking(false);
      }
    } else {
      setLimitReached(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يرجى تسجيل الدخول أولاً لتتمكن من تقديم بلاغ.");
      return;
    }

    const stationName = selectedStationForReport ? selectedStationForReport.name : customStationName.trim();
    if (!stationName && reportProblemType !== "missing_station") {
      setReportError("يرجى تحديد اسم الموقف.");
      return;
    }

    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل الخطأ أو الملاحظة لمساعدتنا في تحديث البيانات.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      // Optional image upload
      let finalImageUrl = reportImageUrl;
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split('.').pop() || 'jpg';
        const fileName = `bus_station_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, reportImageFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (publicUrl) {
            finalImageUrl = publicUrl;
          }
        }
        setReportUploading(false);
      }

      const problemLabels: Record<string, string> = {
        phone: "رقم هاتف / خط ساخن لإحدى الشركات غير صحيح",
        company: "شركة سفر غير موجودة أو ملغية أو ناقصة",
        destinations: "وجهة سفر غير صحيحة أو ناقصة",
        location: "الموقع الجغرافي أو العنوان أو رابط الخريطة غير دقيق",
        closed: "الموقف مغلق أو تم نقله",
        missing_station: "موقف أتوبيسات جديد غير موجود بالدليل",
        other: "خطأ أو ملاحظة أخرى"
      };

      const typeLabel = problemLabels[reportProblemType] || "خطأ في بيانات الموقف";

      const contentText = `بلاغ عن خطأ في بيانات موقف الأتوبيسات:
🏢 اسم الموقف: ${stationName || "موقف غير محدد"}
⚠️ نوع المشكلة: ${typeLabel}

📝 تفاصيل المشكلة / التصحيح المقترح:
${reportDetails.trim()}`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "مواقف الأتوبيسات",
          title: `خطأ في موقف: ${stationName || "مواقف الأتوبيسات"} (${typeLabel})`,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending"
        }
      ]);

      if (insertError) throw insertError;

      // Send notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 📋",
            message: `شكراً لمساعدتنا في تحسين وتدقيق دليل مواقف الأتوبيسات بخصوص "${stationName || "مواقف الأتوبيسات"}". تم تسجيل البلاغ وجاري مراجعته.`,
            type: "info",
            link: "/profile"
          }
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
        setReportImageFile(null);
        setReportImageUrl("");
      }, 2000);
    } catch (err: any) {
      console.error("Report submit error:", err);
      setReportError("حدث خطأ أثناء إرسال البلاغ: " + (err?.message || "يرجى المحاولة لاحقاً"));
    } finally {
      setReportLoading(false);
      setReportUploading(false);
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
        .from("bus_stations")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setStations(getLocalStations());
      } else {
        setStations(data || []);
      }
    } catch (err) {
      setStations(getLocalStations());
    } finally {
      setLoading(false);
    }
  };

  const getLocalStations = () => {
    if (typeof window === "undefined") return DEFAULT_BUS_STATIONS;
    const local = localStorage.getItem("local_bus_stations");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_BUS_STATIONS;
      }
    }
    localStorage.setItem("local_bus_stations", JSON.stringify(DEFAULT_BUS_STATIONS));
    return DEFAULT_BUS_STATIONS;
  };

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ـ/g, ""); // remove kashida
  };

  const filteredStations = stations.filter(s => {
    const normQuery = normalizeArabic(searchQuery.trim());
    if (normQuery.length === 0) return true;
    return (
      normalizeArabic(s.name).includes(normQuery) ||
      normalizeArabic(s.location).includes(normQuery) ||
      normalizeArabic(s.description).includes(normQuery) ||
      s.destinations.some(d => normalizeArabic(d).includes(normQuery))
    );
  });

  if (authLoading) {
    return (
      <div className="app-container" style={{ maxWidth: "800px", paddingTop: "120px", textAlign: "center", direction: "rtl" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(128,128,128,0.1)",
          borderTop: "4px solid var(--colorSecondary, #3b82f6)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 24px"
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
        {/* Banner matching Metro Cover Style */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bgPrimary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--borderGlass)",
          direction: "rtl"
        }}>
          {/* Back Button */}
          <div style={{ position: "absolute", top: "20px", right: "8px", zIndex: 10 }}>
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

          <div className="metro-animate-slide-up metro-delay-100">
            <h1 style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              marginLeft: "10px",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/bus.png" alt="Cairo Bus" loading="lazy" decoding="async" style={{ width: "45px", marginLeft: "10px" }} />
              مواقف الأتوبيسات
            </h1>
            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto", lineHeight: "1.6" }}>
              دليلك لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى.
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
            <div style={{ marginBottom: "24px" }}>
              <img src="/images/icons3d/lockPage.png" alt="Lock" loading="lazy" decoding="async" style={{ width: "150px", height: "120px", objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "14px" }}>
              مواقف الأتوبيسات يتطلب اشتراك في الباقة الذهبية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح دليل مواقف أتوبيسات السفر بين المدن والشركات العاملة بها والوجهات متاح حصرياً للمشتركين في الباقة الذهبية المميزة.
            </p>

            {/* Perks list */}
            <div style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "12px",
              padding: "16px 20px",
              textAlign: "right",
              margin: "0 auto 32px",
              maxWidth: "440px"
            }}>
              <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الذهبية:</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✨ تفاصيل مواقف الأتوبيسات الرئيسية (ألماظة، الترجمان، المنيب، عبود، إلخ)</li>
                <li>✨ دليل الشركات المتاحة (السوبر جيت، جو باص، غرب ووسط الدلتا، إلخ)</li>
                <li>✨ أرقام التليفونات والخطوط الساخنة ووجهات السفر</li>
                <li>✨ تشمل أيضاً المطارات والموانئ ومواقف الميكروباص ومخطط الرحلات بالكامل</li>
              </ul>
            </div>

            {/* Call to Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  style={{
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bg-subscribe-button-gold)",
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    boxShadow: "var(--bs-subscribe-button-gold)",
                    display: "block"
                  }}
                >
                  اشترك في الباقة الذهبية
                </Link>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bg-subscribe-button-base)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
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
                  padding: "var(--paddingBtn)",
                  borderRadius: "var(--radiusBtn)",
                  background: "var(--cancelBtn)",
                  color: "var(--textMuted)",
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
    <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)" }}>
      {/* Header Banner - Cover Image Banner matching Metro / Monorail Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
        direction: "rtl"
      }}>
        {/* Back Button */}
        <div style={{ position: "absolute", top: "20px", right: "8px", zIndex: 10 }}>
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
            <img src="/images/icons2d/bus.png" alt="Cairo Bus" style={{ width: "40px", marginLeft: "10px" }} />
            مواقف الأتوبيسات
          </h1>
          <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto", lineHeight: "1.6" }}>
            دليلك لمعرفة مواقف السفر البري الإقليمي في القاهرة الكبرى.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", direction: "rtl" }}>

        {/* Search Panel Card - Styled matching Metro / Monorail Search */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-card)",
          position: "relative",
          zIndex: 20,
        }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", display: "block", marginBottom: "8px" }}>
            🔍 ابحث عن موقف أو وجهة سفر
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="ابحث باسم الموقف، أو الوجهة ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-fields"
              style={{
                width: "100%",
                padding: "14px 44px 14px 16px",
                borderRadius: "12px",
                background: "var(--bgSecondary)",
                color: "var(--textPrimary)",
                border: "1px solid var(--borderGlass)",
                fontFamily: "var(--font-cairo)",
                fontSize: "0.95rem",
                height: "50px",
                textAlign: "right",
                direction: "rtl"
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

        {/* Bus Stations Explorer Section - Metro style */}
        <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "24px" }}>
          <div style={{
            backgroundColor: "var(--bgPrimary)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "15px",
            padding: "20px",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            {/* Instruction Banner & General Report Button */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "0.78rem",
              color: "var(--textSecondary)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <i className="bx bx-info-circle" style={{ color: "var(--colorSecondary)", fontSize: "0.95rem" }} />
                <span>انقر على اسم أي موقف لعرض تفاصيله والشركات المتاحة به.</span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenReportModal(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "0.76rem",
                  fontWeight: "700",
                  color: "#ef4444",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                }}
              >
                <i className="bx bx-error-circle" style={{ fontSize: "0.9rem" }}></i>
                <span>الإبلاغ عن خطأ</span>
              </button>
            </div>

            {/* Stations Accordion List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--colorSecondary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري تحميل البيانات...</span>
                </div>
              ) : filteredStations.length > 0 ? (
                filteredStations.map((station, idx) => {
                  const isExpanded = expandedStation === station.name;
                  return (
                    <div
                      key={station.id || idx}
                      style={{
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "12px",
                        background: "var(--bgSecondary)",
                        overflow: "hidden",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => setExpandedStation(isExpanded ? null : station.name)}
                        style={{
                          padding: "16px 20px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(255, 255, 255, 0.01)"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--colorSecondary)",
                            fontSize: "1.2rem"
                          }}>
                            <i className="bx bx-bus"></i>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                              {station.name}
                            </h3>
                            <span style={{ fontSize: "0.8rem", color: "var(--textSecondary)", display: "block", marginTop: "2px" }}>
                              <i className="bx bxs-location-plus" style={{ color: "var(--color-red-600)" }}></i> {station.location}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            fontSize: "0.75rem",
                            background: "var(--color-blue-600)",
                            color: "var(--color-white-50)",
                            border: "1px solid var(--borderGlass)",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontWeight: "700"
                          }}>
                            {station.governorate}
                          </span>
                          <i
                            className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`}
                            style={{
                              fontSize: "1.3rem",
                              color: "var(--text-muted)",
                              transition: "transform 0.2s"
                            }}
                          />
                        </div>
                      </div>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div style={{
                          padding: "20px",
                          borderTop: "1px solid var(--borderGlass)",
                          background: "var(--bgSecondary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          animation: "metro-slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
                        }}>
                          {/* Description */}
                          <div>
                            <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                              {station.description}
                            </p>
                          </div>

                          {/* Companies inside the station */}
                          {Array.isArray(station.companies) && station.companies.length > 0 && (
                            <div>
                              <strong style={{ color: "var(--textPrimary)", fontSize: "0.9rem", display: "block", marginBottom: "8px" }}>
                                <i className="bx bxs-bus" style={{ color: "var(--colorSecondary)" }}></i> شركات السفر والحجز المتاحة بالداخل:
                              </strong>
                              <div style={{ display: "flex", flexDirection: "column", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                                {station.companies.map((company, cIdx) => (
                                  <div
                                    key={cIdx}
                                    style={{
                                      padding: "12px",
                                      borderRadius: "10px",
                                      background: "var(--bgPrimary)",
                                      border: "1px solid var(--borderGlass)",
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "right" }}>
                                      {company.logo && (
                                        <div style={{
                                          width: "50px",
                                          height: "45px",
                                          borderRadius: "8px",
                                          background: "none",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          padding: "4px",
                                          border: "none",
                                          flexShrink: 0
                                        }}>
                                          <img
                                            src={`/images/busStations/${company.logo}`}
                                            alt={company.name}
                                            loading="lazy"
                                            decoding="async"
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "contain"
                                            }}
                                            onError={(e) => {
                                              (e.target as HTMLElement).parentElement!.style.display = "none";
                                            }}
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <span style={{ color: "var(--textPrimary)", fontWeight: "700", fontSize: "0.85rem", display: "block" }}>
                                          {company.name}
                                        </span>
                                        <span style={{ color: "var(--textSecondary)", fontSize: "0.75rem" }}>
                                          {company.type}
                                        </span>
                                      </div>
                                    </div>
                                    <a
                                      href={`tel:${company.phone}`}
                                      style={{
                                        background: "rgba(59, 130, 246, 0.1)",
                                        color: "var(--colorSecondary)",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        fontSize: "0.8rem",
                                        fontWeight: "700",
                                        textDecoration: "none",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "4px",
                                        width: "80%",
                                        textAlign: "center",
                                        margin: "auto"
                                      }}
                                    >
                                      <i className="bx bx-phone" style={{ fontSize: "0.95rem" }}></i>
                                      {company.phone}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Served destinations */}
                          {Array.isArray(station.destinations) && station.destinations.length > 0 && (
                            <div>
                              <strong style={{ color: "var(--textPrimary)", fontSize: "0.9rem", display: "block", marginBottom: "6px" }}>
                                🚌 أهم الوجهات المباشرة من الموقف:
                              </strong>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {station.destinations.map((dest, dIdx) => (
                                  <span
                                    key={dIdx}
                                    style={{
                                      fontSize: "0.75rem",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      border: "1px solid var(--borderGlass)",
                                      padding: "4px 10px",
                                      borderRadius: "8px",
                                      color: "var(--textPrimary)"
                                    }}
                                  >
                                    {dest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Bar (Report Problem & Map Directions) */}
                          <div style={{
                            borderTop: "1px solid var(--borderGlass)",
                            paddingTop: "14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px"
                          }}>
                            {/* Report Problem Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenReportModal(station)}
                              style={{
                                padding: "8px 14px",
                                borderRadius: "8px",
                                background: "rgba(239, 68, 68, 0.08)",
                                border: "1px solid rgba(239, 68, 68, 0.25)",
                                color: "#ef4444",
                                fontSize: "0.82rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                              }}
                            >
                              <i className="bx bx-error-alt" style={{ fontSize: "1.1rem" }}></i>
                              الإبلاغ عن خطأ في البيانات
                            </button>

                            {/* Map Directions */}
                            <a
                              href={station.map_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "8px 18px",
                                borderRadius: "8px",
                                background: "var(--colorSecondary)",
                                color: "#ffffff",
                                textDecoration: "none",
                                fontWeight: "700",
                                fontSize: "0.82rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.opacity = "0.9";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.opacity = "1";
                              }}
                            >
                              <i className="bx bx-map" style={{ fontSize: "1.15rem" }}></i>
                              عرض الموقع والاتجاهات
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "12px",
                  background: "var(--bgSecondary)"
                }}>
                  لا توجد مواقف أتوبيسات مطابقة لبحثك. يرجى تعديل الكلمات والمحاولة مجدداً.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Report Problem Modal Overlay */}
      {reportModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fade-in 0.2s ease",
            direction: "rtl"
          }}
          onClick={() => !reportLoading && setReportModalOpen(false)}
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "18px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
              overflow: "hidden",
              position: "relative",
              animation: "metro-slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--borderGlass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.02)"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-error-circle" style={{ color: "#ef4444", fontSize: "1.3rem" }}></i>
                الإبلاغ عن خطأ في بيانات المواقف
              </h3>
              <button
                type="button"
                onClick={() => !reportLoading && setReportModalOpen(false)}
                className="closeBtn"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
              {reportSuccess ? (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(52, 199, 89, 0.15)",
                    color: "#34c759",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    margin: "0 auto 16px"
                  }}>
                    <i className="bx bx-check"></i>
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تم استلام بلاغك بنجاح!
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    شكراً لمساهمتك القيمة في تحسين وتدقيق بيانات مواقف الأتوبيسات. سيتم مراجعة التقرير وتحديث البيانات في أقرب وقت.
                  </p>
                </div>
              ) : limitChecking ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--colorSecondary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>جاري التحقق...</span>
                </div>
              ) : limitReached ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 149, 0, 0.15)",
                    color: "#ff9500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "0 auto 14px"
                  }}>
                    <i className="bx bx-time-five"></i>
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تم الوصول للحد الأقصى من البلاغات المعلقة
                  </h4>
                  <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
                  </p>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    style={{
                      padding: "8px 24px",
                      borderRadius: "8px",
                      background: "var(--colorSecondary)",
                      color: "#fff",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    حسناً، فهمت
                  </button>
                </div>
              ) : !user ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    color: "var(--colorSecondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "0 auto 14px"
                  }}>
                    <i className="bx bx-user"></i>
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تسجيل الدخول مطلوب
                  </h4>
                  <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن خطأ في البيانات وكسب نقاط المساهمة.
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Link
                      href="/login"
                      style={{
                        padding: "8px 20px",
                        borderRadius: "8px",
                        background: "var(--colorSecondary)",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: "700",
                        fontSize: "0.85rem"
                      }}
                    >
                      تسجيل الدخول
                    </Link>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--textSecondary)",
                        border: "1px solid var(--borderGlass)",
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Station selector */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      الموقف المعني بالبلاغ:
                    </label>
                    <select
                      value={selectedStationForReport ? selectedStationForReport.name : (customStationName ? "other_custom" : "")}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "other_custom") {
                          setSelectedStationForReport(null);
                          setCustomStationName("موقف آخر / غير مسجل");
                        } else {
                          const found = stations.find(s => s.name === val);
                          setSelectedStationForReport(found || null);
                          setCustomStationName("");
                        }
                      }}
                      className="input-fields"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "var(--bgSecondary)",
                        color: "var(--textPrimary)",
                        border: "1px solid var(--borderGlass)",
                        fontFamily: "var(--font-cairo)",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      {stations.map((s, idx) => (
                        <option key={s.id || idx} value={s.name} style={{ background: "var(--bgSecondary)" }}>
                          {s.name} ({s.governorate})
                        </option>
                      ))}
                      <option value="other_custom" style={{ background: "var(--bgSecondary)" }}>
                        ➕ موقف آخر / غير مسجل بالدليل
                      </option>
                    </select>
                  </div>

                  {/* Custom station name if selected other */}
                  {(!selectedStationForReport || customStationName) && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        اسم الموقف أو المحطة: <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: موقف السلام، موقف المرج، موقف بنها..."
                        value={customStationName}
                        onChange={e => setCustomStationName(e.target.value)}
                        className="input-fields"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: "var(--bgSecondary)",
                          color: "var(--textPrimary)",
                          border: "1px solid var(--borderGlass)",
                          fontFamily: "var(--font-cairo)",
                          fontSize: "0.9rem"
                        }}
                      />
                    </div>
                  )}

                  {/* Problem Type */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      نوع الخطأ أو المشكلة:
                    </label>
                    <select
                      value={reportProblemType}
                      onChange={e => setReportProblemType(e.target.value)}
                      className="input-fields"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "var(--bgSecondary)",
                        color: "var(--textPrimary)",
                        border: "1px solid var(--borderGlass)",
                        fontFamily: "var(--font-cairo)",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      <option value="phone" style={{ background: "var(--bgSecondary)" }}>📞 رقم هاتف / خط ساخن لإحدى الشركات غير صحيح</option>
                      <option value="company" style={{ background: "var(--bgSecondary)" }}>🏢 شركة سفر غير موجودة أو ملغية أو ناقصة</option>
                      <option value="destinations" style={{ background: "var(--bgSecondary)" }}>🚌 وجهة سفر غير صحيحة أو غير متوفرة من هذا الموقف</option>
                      <option value="location" style={{ background: "var(--bgSecondary)" }}>📍 الموقع الجغرافي أو العنوان أو رابط الخريطة غير دقيق</option>
                      <option value="closed" style={{ background: "var(--bgSecondary)" }}>🚫 الموقف مغلق أو تم نقله لمكان آخر</option>
                      <option value="missing_station" style={{ background: "var(--bgSecondary)" }}>➕ موقف جديد غير مسجل في الدليل</option>
                      <option value="other" style={{ background: "var(--bgSecondary)" }}>📝 خطأ أو ملاحظة أخرى في البيانات</option>
                    </select>
                  </div>

                  {/* Details textarea */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      تفاصيل التصحيح / الخطأ: <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="يرجى كتابة التصحيح أو البيانات الدقيقة هنا (مثال: تم تغيير رقم هاتف جو باص إلى... أو تم إضافة خط جديد متوجه إلى الإسماعيلية)..."
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      className="input-fields"
                      required
                      style={{
                        width: "100%",
                        minHeight: "110px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "var(--bgSecondary)",
                        color: "var(--textPrimary)",
                        border: "1px solid var(--borderGlass)",
                        fontFamily: "var(--font-cairo)",
                        fontSize: "0.9rem",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  {/* Optional Image Upload */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textSecondary)", marginBottom: "6px" }}>
                      صورة توضيحية (اختياري - جدول مواعيد، لافتة، إلخ):
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setReportImageFile(file);
                        }
                      }}
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--textSecondary)",
                        width: "100%"
                      }}
                    />
                  </div>

                  {reportError && (
                    <div style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      color: "#ef4444",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <i className="bx bx-error-circle" style={{ fontSize: "1.1rem" }}></i>
                      <span>{reportError}</span>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      disabled={reportLoading}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--textSecondary)",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "700"
                      }}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={reportLoading || !reportDetails.trim()}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "8px",
                        background: "var(--mainBtn)",
                        border: "none",
                        color: "#ffffff",
                        cursor: reportLoading || !reportDetails.trim() ? "not-allowed" : "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        opacity: reportLoading || !reportDetails.trim() ? 0.7 : 1
                      }}
                    >
                      {reportLoading ? (
                        <>
                          <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <i className="bx bx-send" style={{ fontSize: "1rem" }}></i>
                          <span>إرسال البلاغ</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

