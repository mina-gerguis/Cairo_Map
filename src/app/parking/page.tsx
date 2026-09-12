"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";

function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F]/g, "") // remove harakat/tashkeel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}

interface ParkingSpot {
  id: string;
  name: string;
  area: string;
  address: string;
  nearestMetro: string;
  hourlyRate: number;
  maxDailyRate?: number;
  capacity: number;
  type: "مغطى ومتعدد الطوابق" | "جراج ذكي إلكتروني" | "جراج سطحي مفتوح";
  hours: string;
  features: string[];
  mapLocationLink?: string;
}

const DEFAULT_PARKING: ParkingSpot[] = [];

export default function ParkingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [expandedParkingId, setExpandedParkingId] = useState<string | null>(null);
  const [parkingData, setParkingData] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  // Report Problem State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetScope, setReportTargetScope] = useState<"general" | "parking">("general");
  const [reportSelectedParking, setReportSelectedParking] = useState<string>("");
  const [reportParkingSearchQuery, setReportParkingSearchQuery] = useState<string>("");
  const [showReportParkingList, setShowReportParkingList] = useState<boolean>(false);
  const [reportProblemType, setReportProblemType] = useState<string>("price");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string>("");
  const [limitChecking, setLimitChecking] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // Suggest Garage State
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestArea, setSuggestArea] = useState("وسط البلد");
  const [suggestAddress, setSuggestAddress] = useState("");
  const [suggestNearestMetro, setSuggestNearestMetro] = useState("");
  const [suggestType, setSuggestType] = useState("مغطى متعدد طوابق");
  const [suggestHourlyRate, setSuggestHourlyRate] = useState("");
  const [suggestCapacity, setSuggestCapacity] = useState("");
  const [suggestMapLink, setSuggestMapLink] = useState("");
  const [suggestFeatures, setSuggestFeatures] = useState<string[]>(["أمن وحراسة", "كاميرات مراقبة"]);
  const [suggestNotes, setSuggestNotes] = useState("");
  const [suggestImageFile, setSuggestImageFile] = useState<File | null>(null);
  const [suggestImagePreview, setSuggestImagePreview] = useState<string | null>(null);
  const [isDraggingSuggestImage, setIsDraggingSuggestImage] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestUploading, setSuggestUploading] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [suggestLimitChecking, setSuggestLimitChecking] = useState(false);
  const [suggestLimitReached, setSuggestLimitReached] = useState(false);

  const isExpired = profile?.subscription_end && new Date(profile.subscription_end) < new Date();
  const hasAccess = profile?.is_admin ||
    ((profile?.subscription_tier === "silver" || profile?.subscription_tier === "gold" || profile?.subscription_tier === "mishwar") && !isExpired);

  const getLocalParking = (): ParkingSpot[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_parking_spots");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_PARKING;
  };

  useEffect(() => {
    document.title = "ماب القاهرة - دليل الجراجات";
    const fetchParking = async () => {
      setLoading(true);
      if (!supabase) {
        setParkingData(getLocalParking());
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from("parking_spots").select("*");
        if (error || !data || data.length === 0) {
          setParkingData(getLocalParking());
        } else {
          const mapped = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            area: item.area,
            address: item.address,
            nearestMetro: item.nearest_metro || item.nearestMetro || "",
            hourlyRate: item.hourly_rate ?? item.hourlyRate ?? 0,
            maxDailyRate: item.max_daily_rate !== null && item.max_daily_rate !== undefined ? item.max_daily_rate : item.maxDailyRate,
            capacity: item.capacity ?? 0,
            type: item.type,
            hours: item.hours,
            features: Array.isArray(item.features) ? item.features : (typeof item.features === 'string' ? JSON.parse(item.features) : []),
            mapLocationLink: item.map_location_link || item.mapLocationLink || ""
          }));
          setParkingData(mapped);
        }
      } catch (err) {
        console.error("Error loading parking spots:", err);
        setParkingData(getLocalParking());
      } finally {
        setLoading(false);
      }
    };

    if (user && hasAccess) {
      fetchParking();
    } else {
      setLoading(false);
    }
  }, [user, hasAccess]);

  const filteredParking = parkingData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === "all" || p.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const areas = Array.from(new Set(parkingData.map((p) => p.area)));

  const handleParkingClick = (id: string) => {
    if (expandedParkingId === id) {
      setExpandedParkingId(null);
    } else {
      setExpandedParkingId(id);
    }
  };

  const filteredReportParking = React.useMemo(() => {
    const q = normalizeArabic(reportParkingSearchQuery.trim());
    if (!q) return parkingData;
    return parkingData.filter((p) => {
      const n = normalizeArabic(p.name);
      const a = normalizeArabic(p.area);
      const addr = normalizeArabic(p.address);
      const m = normalizeArabic(p.nearestMetro);
      return n.includes(q) || a.includes(q) || addr.includes(q) || m.includes(q);
    });
  }, [parkingData, reportParkingSearchQuery]);

  const handleReportImageSelect = (file: File | null) => {
    if (reportImagePreview) {
      URL.revokeObjectURL(reportImagePreview);
    }
    if (!file) {
      setReportImageFile(null);
      setReportImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب ألا يتجاوز 5 ميجابايت.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
      return;
    }
    setReportImageFile(file);
    setReportImagePreview(URL.createObjectURL(file));
  };

  const handleOpenReportModal = async (scope: "general" | "parking" = "general", parkingName?: string) => {
    setReportError("");
    setReportSuccess(false);
    setReportTargetScope(scope);
    if (parkingName) {
      setReportSelectedParking(parkingName);
      setReportParkingSearchQuery(parkingName);
    } else {
      setReportSelectedParking("");
      setReportParkingSearchQuery("");
    }
    setShowReportParkingList(false);
    setReportProblemType("price");
    setReportModalOpen(true);

    if (user?.id) {
      setLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setLimitReached(reached);
      } catch (err) {
        console.error("Failed to check feedback limit:", err);
      } finally {
        setLimitChecking(false);
      }
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReportError("يجب تسجيل الدخول أولاً لتقديم بلاغ.");
      return;
    }
    if (!supabase) {
      setReportError("تعذر الاتصال بقاعدة البيانات حالياً.");
      return;
    }
    if (limitReached) {
      setReportError("لقد تجاوزت الحد الأقصى للبلاغات المعلقة (5 بلاغات). يرجى الانتظار لحين مراجعتها.");
      return;
    }
    if (!reportDetails.trim()) {
      setReportError("يرجى كتابة تفاصيل المشكلة أولاً.");
      return;
    }
    if (reportTargetScope === "parking" && !reportSelectedParking.trim()) {
      setReportError("يرجى اختيار الجراج الذي توجد به المشكلة.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      let finalImageUrl: string | null = null;

      // Upload image if selected
      if (reportImageFile) {
        setReportUploading(true);
        const fileExt = reportImageFile.name.split(".").pop() || "jpg";
        const fileName = `reports/parking_${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, reportImageFile, { upsert: true });

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          finalImageUrl = publicUrlData?.publicUrl || null;
        }
        setReportUploading(false);
      }

      const problemTypeLabels: Record<string, string> = {
        price: "تسعيرة أو رسوم الجراج غير صحيحة",
        status: "الجراج مغلق نهائياً أو تحت الصيانة",
        capacity: "سعة الجراج غير دقيقة أو ممتلئ دائماً",
        address: "العنوان أو الموقع الجغرافي على الخريطة غير دقيق",
        metro: "أقرب محطة مترو غير صحيحة",
        app_bug: "مشكلة تقنية في صفحة الجراجات",
        other: "ملاحظة أو مشكلة أخرى",
      };

      const typeLabel = problemTypeLabels[reportProblemType] || reportProblemType;

      const selectedSpot = reportSelectedParking ? parkingData.find(p => p.name === reportSelectedParking) : null;

      let contentText = `نوع المشكلة: ${typeLabel}\n`;
      if (reportTargetScope === "parking" && reportSelectedParking) {
        contentText += `الجراج المستهدف: ${reportSelectedParking}\n`;
        if (selectedSpot) {
          contentText += `المنطقة: ${selectedSpot.area} | العنوان: ${selectedSpot.address}\n`;
          contentText += `أقرب مترو: ${selectedSpot.nearestMetro} | السعر المسجل: ${selectedSpot.hourlyRate} ج.م/ساعة\n`;
        }
      } else {
        contentText += `نطاق البلاغ: مشكلة عامة في دليل الجراجات\n`;
      }
      contentText += `\n📝 تفاصيل المشكلة المبلغ عنها:\n${reportDetails.trim()}`;

      const reportTitle = reportTargetScope === "parking" && reportSelectedParking
        ? `مشكلة جراج: ${reportSelectedParking}`
        : `مشكلة في دليل الجراجات (${typeLabel})`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "bug",
          category: "باركينج",
          title: reportTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // Send notification to user
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام بلاغك بنجاح 🅿️",
            message: `شكراً لمساعدتنا في تحسين وتدقيق دليل الجراجات والمواقف. تم تسجيل بلاغك بخصوص "${reportTitle}" وجاري مراجعته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
        if (reportImagePreview) {
          URL.revokeObjectURL(reportImagePreview);
        }
        setReportImageFile(null);
        setReportImagePreview(null);
      }, 2200);
    } catch (err: any) {
      console.error("Error submitting parking report:", err);
      setReportError(err?.message || "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    } finally {
      setReportLoading(false);
      setReportUploading(false);
    }
  };

  const handleSuggestImageSelect = (file: File | null) => {
    if (suggestImagePreview) {
      URL.revokeObjectURL(suggestImagePreview);
    }
    if (!file) {
      setSuggestImageFile(null);
      setSuggestImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSuggestError("حجم الصورة يجب ألا يتجاوز 5 ميجابايت.");
      return;
    }
    setSuggestImageFile(file);
    setSuggestImagePreview(URL.createObjectURL(file));
    setSuggestError("");
  };

  const handleOpenSuggestModal = async (initialName = "") => {
    setSuggestError("");
    setSuggestSuccess(false);
    setSuggestName(initialName || (searchTerm.trim() ? searchTerm.trim() : ""));
    if (selectedArea && selectedArea !== "all") {
      setSuggestArea(selectedArea);
    }
    setSuggestModalOpen(true);

    if (user?.id) {
      setSuggestLimitChecking(true);
      try {
        const reached = await isFeedbackLimitReached(user.id);
        setSuggestLimitReached(reached);
      } catch (err) {
        console.error("Failed to check feedback limit:", err);
      } finally {
        setSuggestLimitChecking(false);
      }
    }
  };

  const toggleSuggestFeature = (feat: string) => {
    setSuggestFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSuggestError("يجب تسجيل الدخول أولاً لتقديم اقتراح.");
      return;
    }
    if (!supabase) {
      setSuggestError("تعذر الاتصال بقاعدة البيانات حالياً.");
      return;
    }
    if (suggestLimitReached) {
      setSuggestError("لقد تجاوزت الحد الأقصى للاقتراحات/البلاغات المعلقة (5 طلبات). يرجى الانتظار لحين مراجعتها.");
      return;
    }
    if (!suggestName.trim()) {
      setSuggestError("يرجى كتابة اسم الجراج.");
      return;
    }
    if (!suggestAddress.trim()) {
      setSuggestError("يرجى كتابة العنوان أو معالم الوصول للجراج.");
      return;
    }

    setSuggestLoading(true);
    setSuggestError("");

    try {
      let finalImageUrl: string | null = null;

      if (suggestImageFile) {
        setSuggestUploading(true);
        const fileExt = suggestImageFile.name.split(".").pop() || "jpg";
        const fileName = `suggestions/parking_${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, suggestImageFile, { upsert: true });

        if (uploadError) {
          console.error("Suggestion image upload failed:", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          finalImageUrl = publicUrlData?.publicUrl || null;
        }
        setSuggestUploading(false);
      }

      let contentText = `🏷️ اسم الجراج المقترح: ${suggestName.trim()}\n`;
      contentText += `📍 المنطقة / الحي: ${suggestArea}\n`;
      contentText += `🏢 العنوان والمعالم: ${suggestAddress.trim()}\n`;
      if (suggestNearestMetro.trim()) {
        contentText += `🚇 أقرب محطة مترو: ${suggestNearestMetro.trim()}\n`;
      }
      contentText += `🏗️ نوع الجراج: ${suggestType}\n`;
      if (suggestHourlyRate.trim()) {
        contentText += `💰 سعر الساعة التقديري: ${suggestHourlyRate.trim()} ج.م/ساعة\n`;
      }
      if (suggestCapacity.trim()) {
        contentText += `🚗 السعة التقديرية: ${suggestCapacity.trim()}\n`;
      }
      if (suggestMapLink.trim()) {
        contentText += `🗺️ رابط خرائط جوجل: ${suggestMapLink.trim()}\n`;
      }
      if (suggestFeatures.length > 0) {
        contentText += `✨ الميزات المتوفرة: ${suggestFeatures.join("، ")}\n`;
      }
      if (suggestNotes.trim()) {
        contentText += `\n📝 ملاحظات إضافية:\n${suggestNotes.trim()}`;
      }

      const suggestionTitle = `اقتراح جراج جديد: ${suggestName.trim()}`;

      const { error: insertError } = await supabase.from("app_feedback").insert([
        {
          user_id: user.id,
          type: "suggestion",
          category: "باركينج",
          title: suggestionTitle,
          content: contentText,
          image_url: finalImageUrl || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      // In-app notification
      try {
        await supabase.from("notifications").insert([
          {
            user_id: user.id,
            title: "تم استلام اقتراح الجراج بنجاح 💡🅿️",
            message: `شكراً لمساهمتك! تم إرسال اقتراح إضافة "${suggestName.trim()}" إلى فريق الإدارة وسنقوم بمراجعته وتدقيقه تمهيداً لإضافته.`,
            type: "info",
            link: "/profile",
          },
        ]);
      } catch (notifErr) {
        console.error("Failed to insert notification:", notifErr);
      }

      setSuggestSuccess(true);
      setTimeout(() => {
        setSuggestModalOpen(false);
        setSuggestSuccess(false);
        setSuggestName("");
        setSuggestAddress("");
        setSuggestNearestMetro("");
        setSuggestHourlyRate("");
        setSuggestCapacity("");
        setSuggestMapLink("");
        setSuggestNotes("");
        if (suggestImagePreview) {
          URL.revokeObjectURL(suggestImagePreview);
        }
        setSuggestImageFile(null);
        setSuggestImagePreview(null);
      }, 2300);
    } catch (err: any) {
      console.error("Error submitting garage suggestion:", err);
      setSuggestError(err?.message || "حدث خطأ أثناء إرسال الاقتراح. يرجى المحاولة لاحقاً.");
    } finally {
      setSuggestLoading(false);
      setSuggestUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bgPrimary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "var(--textSecondary)" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid var(--borderGlass)", borderTop: "4px solid var(--colorSecondary, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span>جاري التحقق من التفاصيل...</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: "50px", backgroundColor: "var(--bgPrimary)", direction: "rtl" }}>
        {/* Banner matching Metro Cover Style */}
        <div className="metro-animate-fade" style={{
          backgroundColor: "var(--bgPrimary)",
          padding: "24px 20px 24px",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid var(--borderGlass)",
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

          <div className="metro-animate-slide-up metro-delay-100">
            <h1 style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              fontWeight: "600",
              color: "var(--textPrimary)",
              letterSpacing: "-0.5px",
            }}>
              <img src="/images/icons2d/parking.png" alt="Parking" loading="lazy" decoding="async" style={{ width: "60px", marginLeft: "10px" }} />
              دليل الجراجات
            </h1>
            <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "5px auto", lineHeight: "1.6" }}>
              خريطة تفاعلية ودليل جراجات وسط البلد، روكسي، ومحطات المترو التبادلية.
            </p>
          </div>
        </div>

        {/* Lock Panel centered container */}
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
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
              دليل الجراجات يتطلب اشتراك في الباقة الفضية
            </h2>

            <p style={{ color: "var(--textSecondary)", fontSize: "0.95rem", lineHeight: "1.7", maxWidth: "460px", margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
              تصفح الدليل الكامل وتفاصيل مواقع الجراجات المتعددة الطوابق والذكية وخدمة اركن واركب متاح للمشتركين بالباقة الفضية أو الذهبية.
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
              <div style={{ fontWeight: "800", color: "var(--textPrimary)", fontSize: "0.92rem", marginBottom: "10px" }}>ميزات الباقة الفضية:</div>
              <ul style={{ paddingRight: "16px", margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>✨ عرض مواقع وتفاصيل الجراجات المتعددة الطوابق والذكية.</li>
                <li>✨ معرفة أقرب محطات المترو التبادلية والخدمية لكل جراج.</li>
                <li>✨ استخدام ميزة التوجيه المباشر بالخرائط لمعرفة الاتجاهات.</li>
                <li>✨ ميزة اركن واركب لتوفير الوقت وتكلفة الوقود بالزحام.</li>
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              {user ? (
                <Link
                  href="/profile?expand=subscription"
                  style={{
                    padding: "var(--paddingBtn)",
                    borderRadius: "var(--radiusBtn)",
                    background: "var(--bg-subscribe-button-seliver)",
                    color: "var(--color-white-50)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    boxShadow: "var(--bs-subscribe-button-seliver)",
                    border: "1px solid var(--br-subscribe-button-seliver)",
                    display: "block"
                  }}
                >
                  اشترك الآن في الباقة الفضية
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
                  padding: "var(--paddingBtn)",
                  borderRadius: "var(--radiusBtn)",
                  background: "var(--bgSecondary)",
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
      {/* CSS internal styles definition for custom hover effects and keyframe animation states */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .metro-animate-fade { animation: fadeIn 0.35s ease forwards; }
        .metro-animate-slide-up { animation: fadeIn 0.45s ease-out forwards; }
        .metro-delay-100 { animation-delay: 0.1s; }
        .metro-delay-150 { animation-delay: 0.15s; }
        .metro-delay-200 { animation-delay: 0.2s; }
        .metro-delay-250 { animation-delay: 0.25s; }
        .metro-delay-300 { animation-delay: 0.3s; }
        .metro-delay-350 { animation-delay: 0.35s; }
        .metro-delay-400 { animation-delay: 0.4s; }
      `}} />

      {/* Header Banner - Matches Metro Cover Style */}
      <div className="metro-animate-fade" style={{
        backgroundColor: "var(--bgPrimary)",
        padding: "24px 20px 24px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid var(--borderGlass)",
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
              background: "var(--bgGlass)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
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
            fontSize: "clamp(1.5rem, 5vw, 2rem)",
            fontWeight: "bold",
            color: "var(--textPrimary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-sub)"
          }}>
            <img src="/images/icons2d/parking.png" alt="" loading="lazy" decoding="async" style={{ width: "60px", marginLeft: "10px" }} />
            دليل الجراجات
          </h1>
          <p className="sub-title" style={{ color: "var(--textSecondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 20px", lineHeight: "1.6", }}>
            اعثر على أقرب جراج مغطى أو ذكي بالقرب من محطات المترو والأسواق لتفادي الازدحام وركن سيارتك بأمان.
          </p>

          {/* Badges indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#818cf8",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>مغطى ومتعدد الطوابق</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#10b981",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>جراج ذكي إلكتروني</span>
            <span style={{
              background: "var(--bgSecondary)",
              border: "1px solid var(--borderGlass)",
              color: "#f59e0b",
              borderRadius: "10px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: "700",
            }}>جراج سطحي مفتوح </span>
          </div>

          {/* Action Buttons in Header Banner */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleOpenSuggestModal()}
              style={{
                background: "rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                color: "var(--colorSecondary, #3b82f6)",
                borderRadius: "10px",
                padding: "6px 16px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                fontFamily: "var(--font-cairo)"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)"}
            >
              <i className="fa-solid fa-plus-circle" style={{ fontSize: "0.9rem" }}></i>
              <span>اقترح إضافة جراج جديد</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenReportModal("general")}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                borderRadius: "10px",
                padding: "6px 16px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                fontFamily: "var(--font-cairo)"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
            >
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.9rem" }}></i>
              <span>الإبلاغ عن مشكلة في الجراجات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

        {/* Search Panel Card - Styled matching Metro & Monorail searchCard */}
        <div className="metro-animate-slide-up metro-delay-200" style={{
          backgroundColor: "var(--bgPrimary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "15px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "var(--shadow-sm)",
          position: "relative",
          zIndex: 30,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <i
                className="bx bx-search"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--textSecondary)",
                  fontSize: "1.2rem",
                }}
              ></i>
              <input
                type="text"
                placeholder="ابحث باسم الجراج أو الشارع أو أقرب محطة مترو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  backgroundColor: "var(--bgSecondary)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "10px",
                  color: "var(--textPrimary)",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-cairo)",
                  outline: "none",
                }}
              />
            </div>

            {/* Area Filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", color: "var(--textSecondary)", fontWeight: "600" }}>
                تصفية حسب المنطقة:
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bgSecondary)",
                  border: "1px solid var(--borderGlass)",
                  borderRadius: "10px",
                  color: "var(--textPrimary)",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-cairo)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {areas.map((area) => (
                  <option key={area} value={area} style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>
                    {area === "all" ? "جميع المناطق" : area}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Parking Garage List */}
        <div className="metro-animate-slide-up metro-delay-300" style={{ marginTop: "24px" }}>
          <div style={{
            fontSize: "1.2rem",
            fontWeight: "800",
            color: "var(--textPrimary)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <i className="bx bx-parking" style={{ color: "var(--colorSecondary)", fontSize: "1.4rem" }}></i>
            الجراجات المتاحة ({filteredParking.length})
          </div>

          {filteredParking.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "36px 20px",
              color: "var(--textSecondary)",
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "15px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.1)",
                color: "var(--colorSecondary, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem"
              }}>
                <i className="bx bx-search-alt"></i>
              </div>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                  لم يتم العثور على جراجات مطابقة للبحث
                </p>
                {searchTerm.trim() && (
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--textSecondary)" }}>
                    لا يوجد جراج مسجل باسم &ldquo;<span style={{ color: "var(--colorSecondary)", fontWeight: "700" }}>{searchTerm.trim()}</span>&rdquo;
                  </p>
                )}
              </div>

              <div style={{
                marginTop: "6px",
                padding: "14px 18px",
                background: "var(--bgSecondary)",
                border: "1px dashed var(--borderGlass)",
                borderRadius: "12px",
                maxWidth: "420px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px"
              }}>
                <div style={{ fontSize: "0.88rem", color: "var(--textPrimary)", fontWeight: "600" }}>
                  هل تعرف هذا الجراج أو ترغب في إضافته إلى الدليل؟
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSuggestModal(searchTerm.trim())}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--colorSecondary, #3b82f6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "9px 20px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                    transition: "all 0.2s ease",
                    fontFamily: "var(--font-cairo)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <i className="fa-solid fa-lightbulb"></i>
                  <span>اقترح إضافة هذا الجراج</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredParking.map((parking) => {
                const isExpanded = expandedParkingId === parking.id;
                return (
                  <div
                    key={parking.id}
                    onClick={() => handleParkingClick(parking.id)}
                    style={{
                      backgroundColor: "var(--bgPrimary)",
                      border: isExpanded ? `1px solid var(--colorSecondary)` : "1px solid var(--borderGlass)",
                      borderRadius: "var(--radius-card)",
                      padding: "16px",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      cursor: "pointer",
                      transition: "transform 0.2s ease, border-color 0.2s ease",
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                        {parking.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          background: "rgba(99, 102, 241, 0.12)",
                          color: "#818cf8",
                          fontSize: "0.78rem",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                        }}>
                          {parking.area}
                        </span>
                        <i className={`bx bx-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: "var(--textSecondary)", fontSize: "1.3rem" }}></i>
                      </div>
                    </div>

                    {/* Summary Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", color: "var(--textSecondary)" }}>
                      <span>{parking.type}</span>
                      <span style={{ fontWeight: "700", color: "#10b981" }}>{parking.hourlyRate} ج.م / ساعة</span>
                    </div>

                    {/* Expanded details block */}
                    {isExpanded && (
                      <div style={{
                        borderTop: "1px solid var(--borderGlass)",
                        paddingTop: "12px",
                        marginTop: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        animation: "fadeIn 0.25s ease"
                      }}>
                        {/* Address */}
                        <div style={{ fontSize: "0.85rem", color: "var(--textSecondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                          <span style={{ fontSize: "0.95rem" }}>📍</span>
                          <span>{parking.address}</span>
                        </div>

                        {/* Nearest Metro */}
                        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", margin: "4px 0" }}>
                          <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                            أقرب محطة مترو:
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--textPrimary)", fontWeight: "600" }}>
                            {parking.nearestMetro}
                          </span>
                        </div>

                        {/* Capacity & Rates Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>السعة الإجمالية</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--textPrimary)" }}>{parking.capacity} سيارة</span>
                          </div>
                          <div style={{ background: "var(--bgSecondary)", border: "1px solid var(--borderGlass)", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>الحد الأقصى لليوم</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#10b981" }}>{parking.maxDailyRate ? `${parking.maxDailyRate} ج.م` : "غير محدد"}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "700" }}>
                            ✨ المميزات:
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {parking.features.map((feat, idx) => (
                              <span key={idx} style={{
                                background: "var(--bgSecondary)",
                                color: "var(--textSecondary)",
                                fontSize: "0.78rem",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--borderGlass)"
                              }}>
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--borderGlass)", paddingTop: "10px", marginTop: "4px", gap: "8px", flexWrap: "wrap" }}>
                          <span className="sub-title" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>🕒 {parking.hours}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReportModal("parking", parking.name);
                              }}
                              title="إبلاغ عن مشكلة في هذا الجراج"
                              style={{
                                background: "rgba(239, 68, 68, 0.08)",
                                border: "1px solid rgba(239, 68, 68, 0.25)",
                                color: "#ef4444",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontFamily: "var(--font-sub)"
                              }}
                            >
                              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.85rem" }}></i>
                              <span>إبلاغ عن مشكلة</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parking.name + " " + parking.address)}`, "_blank");
                              }}
                              className="btn btn-primary"
                              style={{
                                borderRadius: "8px",
                                padding: "6px 10px",
                                fontSize: "0.78rem",
                                fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px"
                              }}
                            >
                              <span className="sub-title"> الاتجاهات</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Report Problem Modal for Parking */}
      {reportModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          direction: "rtl"
        }}>
          <div style={{
            backgroundColor: "var(--bgPrimary)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--borderGlass)",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease",
            fontFamily: "var(--font-cairo)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--borderGlass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.02)"
            }}>
              <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--textPrimary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: "1.1rem" }}></i>
                <span>مشكلة في دليل الجراجات والمواقف</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  if (!reportLoading) {
                    setReportModalOpen(false);
                    handleReportImageSelect(null);
                  }
                }}
                className="closeBtn"
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
                    شكراً لمساهمتك في تدقيق وتحديث دليل الجراجات والمواقف. سيتم مراجعة تقريرك وتحديث البيانات في أقرب وقت.
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
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px"
                  }}>
                    <img src="/images/icons3d/error.png" alt="error" style={{ width: "100%", height: "100%", objectFit: "contain" }} loading="lazy" />
                  </div>
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تم الوصول للحد الأقصى من البلاغات المعلقة
                  </h5>
                  <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها من قبل الإدارة قبل تقديم بلاغات جديدة.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setReportModalOpen(false)}
                    style={{ width: "100%" }}
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
                  <h5 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    تسجيل الدخول مطلوب
                  </h5>
                  <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                    يرجى تسجيل الدخول إلى حسابك لتتمكن من تقديم بلاغ عن أي مشكلة في الجراجات ومتابعة حالته وكسب نقاط المساهمة.
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Link
                      href="/login"
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Scope Segmented Control */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "8px" }}>
                      نطاق المشكلة:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("general");
                          setReportSelectedParking("");
                          setReportParkingSearchQuery("");
                          setShowReportParkingList(false);
                        }}
                        style={{
                          padding: "8px 4px",
                          borderRadius: "8px",
                          border: `1px solid ${reportTargetScope === "general" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                          background: reportTargetScope === "general" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                          color: reportTargetScope === "general" ? "var(--textPrimary)" : "var(--textSecondary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        مشكلة عامة في الدليل
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetScope("parking");
                          setShowReportParkingList(true);
                        }}
                        style={{
                          padding: "8px 4px",
                          borderRadius: "8px",
                          border: `1px solid ${reportTargetScope === "parking" ? "var(--colorSecondary)" : "var(--borderGlass)"}`,
                          background: reportTargetScope === "parking" ? "rgba(59, 130, 246, 0.12)" : "var(--bgSecondary)",
                          color: reportTargetScope === "parking" ? "var(--textPrimary)" : "var(--textSecondary)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)"
                        }}
                      >
                        جراج / موقف معين
                      </button>
                    </div>
                  </div>

                  {/* If Scope is Parking: Searchable parking garage autocomplete selector */}
                  {reportTargetScope === "parking" && (
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        <span>اختر أو ابحث عن الجراج:</span>
                        {reportSelectedParking && (
                          <span style={{ fontSize: "0.74rem", color: "var(--colorSecondary)", fontWeight: "700" }}>
                            تم تحديد: {reportSelectedParking} ✔
                          </span>
                        )}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          className="input-fields"
                          placeholder="ابحث باسم الجراج أو المنطقة أو أقرب مترو..."
                          value={reportParkingSearchQuery}
                          onChange={e => {
                            const val = e.target.value;
                            setReportParkingSearchQuery(val);
                            setShowReportParkingList(true);
                            if (reportSelectedParking && val !== reportSelectedParking) {
                              setReportSelectedParking("");
                            }
                          }}
                          onFocus={() => setShowReportParkingList(true)}
                          onBlur={() => setTimeout(() => setShowReportParkingList(false), 250)}
                          style={{
                            width: "100%",
                            padding: "10px 15px 10px 36px",
                            background: "var(--bgSecondary)",
                            color: "var(--textPrimary)",
                            border: reportSelectedParking ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                            fontFamily: "var(--font-body)",
                            fontSize: "0.9rem",
                            direction: "rtl"
                          }}
                        />

                        {reportParkingSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setReportSelectedParking("");
                              setReportParkingSearchQuery("");
                              setShowReportParkingList(true);
                            }}
                            title="مسح"
                            style={{
                              position: "absolute",
                              left: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(255, 255, 255, 0.08)",
                              border: "none",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              color: "var(--textSecondary)",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Parking suggestions list popup */}
                      {showReportParkingList && (
                        <div style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          borderRadius: "var(--radius-card)",
                          overflow: "hidden",
                          zIndex: 1100,
                          maxHeight: "200px",
                          overflowY: "auto",
                          boxShadow: "var(--shadow-lg)",
                          marginTop: "4px",
                          fontFamily: "var(--font-body)"
                        }}>
                          {filteredReportParking.length === 0 ? (
                            <div style={{ padding: "12px", textAlign: "center", fontSize: "0.82rem", color: "var(--textSecondary)" }}>
                              لا يوجد جراج مطابق لبحثك "{reportParkingSearchQuery}"
                            </div>
                          ) : (
                            filteredReportParking.map((p) => {
                              const isSelected = reportSelectedParking === p.name;
                              return (
                                <div
                                  key={p.id}
                                  onMouseDown={() => {
                                    setReportSelectedParking(p.name);
                                    setReportParkingSearchQuery(p.name);
                                    setShowReportParkingList(false);
                                  }}
                                  style={{
                                    padding: "9px 14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                                    background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                    transition: "background 0.15s ease"
                                  }}
                                  onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.background = "var(--hoverBtn)";
                                  }}
                                  onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span style={{ fontSize: "0.88rem", fontWeight: isSelected ? "700" : "600", color: isSelected ? "var(--colorSecondary)" : "var(--textPrimary)" }}>
                                      {p.name}
                                    </span>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {isSelected && (
                                      <span style={{ fontSize: "0.75rem", color: "var(--colorSuccess)", fontWeight: "700" }}>✔</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Problem Type dropdown */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      نوع المشكلة:
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
                      <option value="price" style={{ background: "var(--bgSecondary)" }}>تسعيرة أو رسوم الجراج غير صحيحة</option>
                      <option value="status" style={{ background: "var(--bgSecondary)" }}>الجراج مغلق نهائياً أو تحت الصيانة</option>
                      <option value="capacity" style={{ background: "var(--bgSecondary)" }}>سعة الجراج غير دقيقة أو ممتلئ دائماً</option>
                      <option value="address" style={{ background: "var(--bgSecondary)" }}>العنوان أو الموقع الجغرافي على الخريطة غير دقيق</option>
                      <option value="metro" style={{ background: "var(--bgSecondary)" }}>أقرب محطة مترو غير صحيحة</option>
                      <option value="app_bug" style={{ background: "var(--bgSecondary)" }}>مشكلة تقنية في صفحة الجراجات</option>
                      <option value="other" style={{ background: "var(--bgSecondary)" }}>ملاحظة أو مشكلة أخرى</option>
                    </select>
                  </div>

                  {/* Details Textarea */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      تفاصيل المشكلة / التصحيح المقترح: <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="يرجى كتابة المشكلة بالتفصيل واقتراح التصحيح إن وُجد (مثال: سعر الساعة أصبح كذا، أو الجراج مغلق، أو العنوان الأصح هو كذا)..."
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      className="input-fields"
                      required
                      style={{
                        width: "100%",
                        minHeight: "100px",
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

                  {/* Enhanced Image File Upload */}
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      <span>صورة توضيحية للمشكلة (اختياري):</span>
                      <span style={{ fontSize: "0.74rem", color: "var(--textSecondary)", fontWeight: "normal" }}>
                        JPG, PNG, WEBP (الحد الأقصى 5MB)
                      </span>
                    </label>

                    {!reportImagePreview ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(true);
                        }}
                        onDragLeave={() => setIsDraggingImage(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(false);
                          const droppedFile = e.dataTransfer.files?.[0];
                          if (droppedFile) handleReportImageSelect(droppedFile);
                        }}
                        style={{
                          position: "relative",
                          border: isDraggingImage ? "2px dashed var(--colorSecondary)" : "1.5px dashed var(--borderGlass)",
                          borderRadius: "12px",
                          background: isDraggingImage ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          padding: "20px 16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isDraggingImage) e.currentTarget.style.background = "var(--hoverBtn)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isDraggingImage) e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReportImageSelect(file);
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />

                        <div style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "50%",
                          background: "rgba(59, 130, 246, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--colorSecondary)",
                          fontSize: "1.4rem"
                        }}>
                          <i className="bx bx-cloud-upload"></i>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "3px" }}>
                            اضغط لاختيار صورة أو اسحبها وأفلتها هنا
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "var(--textSecondary)" }}>
                            يافطة الجراج، لائحة الأسعار، أو صورة توضيحية للخطأ
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        position: "relative",
                        border: "1px solid var(--borderGlass)",
                        borderRadius: "12px",
                        background: "var(--bgSecondary)",
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}>
                        {/* Thumbnail */}
                        <div style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#000",
                          border: "1px solid var(--borderGlass)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative"
                        }}>
                          <img
                            src={reportImagePreview}
                            alt="معاينة الصورة المرفقة"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        </div>

                        {/* File details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "0.86rem",
                            fontWeight: "700",
                            color: "var(--textPrimary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {reportImageFile?.name || "صورة توضيحية"}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--textSecondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>
                              {reportImageFile
                                ? reportImageFile.size < 1024 * 1024
                                  ? `${(reportImageFile.size / 1024).toFixed(0)} KB`
                                  : `${(reportImageFile.size / (1024 * 1024)).toFixed(1)} MB`
                                : ""}
                            </span>
                            <span>•</span>
                            <span style={{ color: "var(--colorSuccess)", fontWeight: "600" }}>جاهزة للإرسال ✔</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* Change button */}
                          <label style={{
                            cursor: "pointer",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--borderGlass)",
                            color: "var(--textPrimary)",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <i className="bx bx-sync"></i>
                            <span>تغيير</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReportImageSelect(file);
                              }}
                              style={{ display: "none" }}
                            />
                          </label>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleReportImageSelect(null)}
                            title="حذف الصورة"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#ef4444",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <i className="bx bx-trash"></i>
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {reportError && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      fontSize: "0.85rem"
                    }}>
                      {reportError}
                    </div>
                  )}

                  {/* Submit and Cancel Buttons */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="submit"
                      className="btn actionBtnDelete"
                      disabled={reportLoading || reportUploading}
                      style={{
                        flex: 1,
                        fontWeight: "700",
                        fontSize: "0.92rem",
                        cursor: reportLoading ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "50%",
                      }}
                    >
                      {reportLoading ? (
                        <>
                          <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                          <span>{reportUploading ? "جاري الرفع ..." : "جاري الإرسال..."}</span>
                        </>
                      ) : (
                        <>
                          <i className="bx bx-send"></i>
                          <span>إرسال البلاغ</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancle"
                      disabled={reportLoading}
                      onClick={() => {
                        setReportModalOpen(false);
                        handleReportImageSelect(null);
                      }}
                      style={{
                        fontWeight: "700",
                        fontSize: "0.92rem",
                        width: "50%",
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggest Garage Modal */}
      {suggestModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggest-modal-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
            direction: "rtl",
            fontFamily: "var(--font-cairo)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !suggestLoading) {
              setSuggestModalOpen(false);
              handleSuggestImageSelect(null);
            }
          }}
        >
          <div
            className="metro-animate-slide-up"
            style={{
              backgroundColor: "var(--bgPrimary)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "var(--radius-card)",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              position: "relative",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid var(--borderGlass)",
                position: "sticky",
                top: 0,
                backgroundColor: "var(--bgPrimary)",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--colorSecondary, #3b82f6)",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className="fa-solid fa-lightbulb"></i>
                </div>
                <div>
                  <h2 id="suggest-modal-title" style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--textPrimary)" }}>
                    اقتراح إضافة جراج جديد
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--textSecondary)" }}>
                    ساعدنا في توسيع دليل جراجات القاهرة الكبرى
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!suggestLoading) {
                    setSuggestModalOpen(false);
                    handleSuggestImageSelect(null);
                  }
                }}
                className="closeBtn"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              {!user ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <i className="bx bx-lock-alt" style={{ fontSize: "3rem", color: "var(--colorSecondary)", marginBottom: "12px", display: "block" }}></i>
                  <h4 style={{ margin: "0 0 8px", color: "var(--textPrimary)", fontWeight: "700" }}>تسجيل الدخول مطلوب</h4>
                  <p style={{ margin: "0 0 20px", color: "var(--textSecondary)", fontSize: "0.9rem" }}>
                    يرجى تسجيل الدخول أولاً لتتمكن من تقديم اقتراحات الجراجات والمتابعة مع فريق الدعم.
                  </p>
                  <Link
                    href="/login"
                    className="btn btn-primary"
                    style={{
                      display: "inline-block",
                      padding: "10px 24px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      fontWeight: "700",
                    }}
                  >
                    تسجيل الدخول الآن
                  </Link>
                </div>
              ) : suggestSuccess ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      margin: "0 auto 16px",
                    }}
                  >
                    ✓
                  </div>
                  <h4 style={{ margin: "0 0 8px", color: "var(--textPrimary)", fontWeight: "800", fontSize: "1.2rem" }}>
                    تم استلام اقتراحك بنجاح!
                  </h4>
                  <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.92rem", lineHeight: "1.6" }}>
                    شكراً لمساهمتك القيمة. سيقوم فريقنا بمراجعة وتدقيق بيانات الجراج وإضافته للدليل قريباً.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitSuggestion} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {suggestLimitChecking && (
                    <div style={{ fontSize: "0.82rem", color: "var(--textSecondary)", textAlign: "center" }}>
                      جاري التحقق من حالة الحساب...
                    </div>
                  )}

                  {suggestLimitReached && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <img
                        src="/images/icons3d/error.png"
                        alt="Alert"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                      <span>لديك 5 بلاغات أو اقتراحات معلقة قيد المراجعة حالياً. يرجى الانتظار حتى يتم فحصها.</span>
                    </div>
                  )}

                  {suggestError && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      <span>{suggestError}</span>
                    </div>
                  )}

                  {/* Garage Name */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      اسم الجراج <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="مثال: جراج الأوبرا، جراج روكسي الذكي، جراج التحرير..."
                      value={suggestName}
                      onChange={(e) => setSuggestName(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--textPrimary)",
                        fontSize: "0.92rem",
                        fontFamily: "var(--font-cairo)",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Area & Garage Type */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        المنطقة / الحي <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select
                        value={suggestArea}
                        onChange={(e) => setSuggestArea(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          backgroundColor: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          color: "var(--textPrimary)",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-cairo)",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {areas.filter(a => a !== "all").map((a) => (
                          <option key={a} value={a} style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        نوع الجراج
                      </label>
                      <select
                        value={suggestType}
                        onChange={(e) => setSuggestType(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          backgroundColor: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          color: "var(--textPrimary)",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-cairo)",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="مغطى متعدد طوابق" style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>مغطى متعدد طوابق</option>
                        <option value="ذكي إلكتروني" style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>ذكي إلكتروني</option>
                        <option value="سطحي مفتوح" style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>سطحي مفتوح</option>
                        <option value="أخرى" style={{ backgroundColor: "var(--bgPrimary)", color: "var(--textPrimary)" }}>أخرى</option>
                      </select>
                    </div>
                  </div>

                  {/* Address & Landmarks */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      العنوان بالتفصيل أو معالم الوصول <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="مثال: ميدان التحرير، بجوار مجمع التحرير وأمام الجامعة الأمريكية"
                      value={suggestAddress}
                      onChange={(e) => setSuggestAddress(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--textPrimary)",
                        fontSize: "0.92rem",
                        fontFamily: "var(--font-cairo)",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Nearest Metro & Price */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        أقرب محطة مترو (اختياري)
                      </label>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder="مثال: محطة السادات"
                        value={suggestNearestMetro}
                        onChange={(e) => setSuggestNearestMetro(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          backgroundColor: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          color: "var(--textPrimary)",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-cairo)",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        سعر الساعة التقديري (ج.م)
                      </label>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder="مثال: 10 أو 15"
                        value={suggestHourlyRate}
                        onChange={(e) => setSuggestHourlyRate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          backgroundColor: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          color: "var(--textPrimary)",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-cairo)",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Google Maps Link & Capacity */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        رابط خرائط جوجل (إن وجد)
                      </label>
                      <input
                        type="url"
                        className="input-fields"
                        placeholder="https://maps.app.goo.gl/..."
                        value={suggestMapLink}
                        onChange={(e) => setSuggestMapLink(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          backgroundColor: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          color: "var(--textPrimary)",
                          fontSize: "0.88rem",
                          fontFamily: "var(--font-cairo)",
                          outline: "none",
                          direction: "ltr",
                          textAlign: "right"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                        السعة التقديرية (سيارة)
                      </label>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder="مثال: 300 سيارة"
                        value={suggestCapacity}
                        onChange={(e) => setSuggestCapacity(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          backgroundColor: "var(--bgSecondary)",
                          border: "1px solid var(--borderGlass)",
                          color: "var(--textPrimary)",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-cairo)",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Available Features */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "8px" }}>
                      الميزات المتوفرة بالجراج:
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {[
                        "أمن وحراسة",
                        "كاميرات مراقبة",
                        "مصاعد كهربائية",
                        "مظلات حماية",
                        "غسيل سيارات",
                        "شواحن سيارات كهربائية",
                        "دفع إلكتروني",
                        "اشتراكات شهرية",
                        "متاح 24 ساعة"
                      ].map((feat) => {
                        const isSelected = suggestFeatures.includes(feat);
                        return (
                          <button
                            key={feat}
                            type="button"
                            onClick={() => toggleSuggestFeature(feat)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              border: isSelected ? "1px solid var(--colorSecondary)" : "1px solid var(--borderGlass)",
                              backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--bgSecondary)",
                              color: isSelected ? "var(--colorSecondary)" : "var(--textSecondary)",
                              transition: "all 0.2s ease",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <i className={isSelected ? "fa-solid fa-check" : "fa-solid fa-plus"} style={{ fontSize: "0.72rem" }}></i>
                            <span>{feat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      ملاحظات إضافية (اختياري)
                    </label>
                    <textarea
                      className="input-fields"
                      rows={2}
                      placeholder="أي تفاصيل أخرى مثل مواعيد العمل، الاشتراكات الشهرية، أو طريقة الدخول..."
                      value={suggestNotes}
                      onChange={(e) => setSuggestNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bgSecondary)",
                        border: "1px solid var(--borderGlass)",
                        color: "var(--textPrimary)",
                        fontSize: "0.9rem",
                        fontFamily: "var(--font-cairo)",
                        outline: "none",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  {/* Image Attachment */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)", marginBottom: "6px" }}>
                      صورة للجراج أو اليافطة (اختياري)
                    </label>

                    {!suggestImagePreview ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingSuggestImage(true);
                        }}
                        onDragLeave={() => setIsDraggingSuggestImage(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingSuggestImage(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleSuggestImageSelect(file);
                        }}
                        style={{
                          position: "relative",
                          border: isDraggingSuggestImage ? "2px dashed var(--colorSecondary)" : "2px dashed var(--borderGlass)",
                          borderRadius: "12px",
                          background: isDraggingSuggestImage ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          padding: "16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSuggestImageSelect(file);
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "rgba(59, 130, 246, 0.12)",
                            color: "var(--colorSecondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                          }}
                        >
                          <i className="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--textPrimary)" }}>
                          اضغط لاختيار صورة أو اسحبها هنا
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)" }}>
                          يافطة الجراج، المدخل، أو قائمة الأسعار (حتى 5MB)
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          position: "relative",
                          border: "1px solid var(--borderGlass)",
                          borderRadius: "12px",
                          background: "var(--bgSecondary)",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            flexShrink: 0,
                            background: "#000",
                            border: "1px solid var(--borderGlass)",
                          }}
                        >
                          <img
                            src={suggestImagePreview}
                            alt="معاينة الصورة"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textPrimary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {suggestImageFile?.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--textSecondary)" }}>
                            {((suggestImageFile?.size || 0) / 1024).toFixed(0)} كيلوبايت
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSuggestImageSelect(null)}
                          style={{
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            borderRadius: "8px",
                            width: "30px",
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-trash-can" style={{ fontSize: "0.8rem" }}></i>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={suggestLoading || suggestLimitReached}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        fontWeight: "800",
                        fontSize: "0.95rem",
                        cursor: suggestLoading ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "50%",
                      }}
                    >
                      {suggestLoading ? (
                        <>
                          <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                          <span>{suggestUploading ? "جاري الرفع..." : "جاري الإرسال..."}</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane"></i>
                          <span>إرسال الاقتراح</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancle"
                      disabled={suggestLoading}
                      onClick={() => {
                        setSuggestModalOpen(false);
                        handleSuggestImageSelect(null);
                      }}
                      style={{
                        fontWeight: "700",
                        fontSize: "0.92rem",
                        width: "50%",
                      }}
                    >
                      إلغاء
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

