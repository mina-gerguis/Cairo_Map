"use client";
import React, { useEffect, useState } from "react";

interface LocationHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lat: number, lng: number) => void;
}

export default function LocationHelperModal({ isOpen, onClose, onSuccess }: LocationHelperModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ios" | "android" | "desktop">("ios");
  const [retryLoading, setRetryLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Auto-detect OS
      if (typeof window !== "undefined") {
        const ua = navigator.userAgent || "";
        if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
          setActiveTab("ios");
        } else if (/Android/.test(ua)) {
          setActiveTab("android");
        } else {
          setActiveTab("desktop");
        }
      }
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRetry = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMsg("متصفحك لا يدعم تحديد الموقع الجغرافي.");
      return;
    }

    setRetryLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRetryLoading(false);
        onSuccess(pos.coords.latitude, pos.coords.longitude);
        onClose();
      },
      (err) => {
        setRetryLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setErrorMsg("صلاحية الموقع لا تزال مرفوضة. يرجى تفعيلها من إعدادات جهازك أولاً.");
            break;
          case err.POSITION_UNAVAILABLE:
            setErrorMsg("معلومات الموقع غير متوفرة حالياً. تأكد من تفعيل الـ GPS في جهازك.");
            break;
          case err.TIMEOUT:
            setErrorMsg("انتهت مهلة طلب تحديد الموقع. يرجى المحاولة مرة أخرى.");
            break;
          default:
            setErrorMsg("حدث خطأ غير معروف أثناء تحديد موقعك.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 11000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(11, 15, 25, 0.75)",
        backdropFilter: mounted ? "blur(12px)" : "blur(0px)",
        WebkitBackdropFilter: mounted ? "blur(12px)" : "blur(0px)",
        transition: "all 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bgSecondary)",
          border: "1px solid var(--borderGlass)",
          borderRadius: "var(--cardGlassRadius)",
          padding: "24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          transform: mounted ? "scale(1) translateY(0)" : "scale(0.95) translateY(15px)",
          opacity: mounted ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "var(--font-cairo), system-ui, sans-serif",
          direction: "rtl",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--textPrimary)", margin: 0 }}>
            📍 تفعيل الموقع الجغرافي
          </h2>
          <button
            onClick={onClose}
            className="closeBtn"
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--bgGlass, rgba(255, 255, 255, 0.05))"}
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Notice Info */}
        <p style={{ fontSize: "0.9rem", color: "var(--textSecondary, #9ca3af)", lineHeight: "1.6", margin: "0 0 20px" }}>
          يبدو أن صلاحية الوصول إلى الموقع مغلقة أو مرفوضة في جهازك. لتشغيل ميزة الأماكن القريبة، يرجى اتباع التعليمات الخاصة بنوع جهازك بالأسفل:
        </p>

        {/* Device Selection Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            background: "rgba(0, 0, 0, 0.15)",
            padding: "4px",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setActiveTab("ios")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "var(--paddingBtn)",
              borderRadius: "var(--radiusBtn)",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "var(--font-sub)",
              transition: "all 0.2s",
              background: activeTab === "ios" ? "var(--colorPrimary)" : "transparent",
              color: activeTab === "ios" ? "#ffffff" : "var(--textSecondary, #9ca3af)",
            }}
          >
            <i className="bx bxl-apple" style={{ fontSize: "1.1rem" }}></i>
            آيفون
          </button>
          <button
            onClick={() => setActiveTab("android")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "var(--paddingBtn)",
              borderRadius: "var(--radiusBtn)",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "var(--font-sub)",
              transition: "all 0.2s",
              background: activeTab === "android" ? "var(--colorPrimary)" : "transparent",
              color: activeTab === "android" ? "#ffffff" : "var(--textSecondary, #9ca3af)",
            }}
          >
            <i className="bx bxl-android" style={{ fontSize: "1.1rem" }}></i>
            أندرويد
          </button>
          <button
            onClick={() => setActiveTab("desktop")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "var(--paddingBtn)",
              borderRadius: "var(--radiusBtn)",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "var(--font-sub)",
              transition: "all 0.2s",
              background: activeTab === "desktop" ? "var(--colorPrimary)" : "transparent",
              color: activeTab === "desktop" ? "#ffffff" : "var(--textSecondary, #9ca3af)",
            }}
          >
            <i className="bx bx-laptop" style={{ fontSize: "1.1rem" }}></i>
            كمبيوتر
          </button>
        </div>

        {/* Step-by-Step Instructions Content */}
        <div style={{ minHeight: "180px", marginBottom: "20px", textAlign: "start" }}>
          {activeTab === "ios" && (
            <ol style={{ listStyle: "auto", paddingRight: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "var(--textPrimary)", lineHeight: "1.6" }}>
              <li style={{ listStyle: "auto" }}>افتح تطبيق <strong>الإعدادات (Settings) ⚙️</strong> في جهازك.</li>
              <li style={{ listStyle: "auto" }}>اذهب إلى <strong>الخصوصية والأمن (Privacy & Security)</strong> &larr; <strong>خدمات الموقع (Location Services)</strong> وتأكد من تفعيلها في الأعلى.</li>
              <li style={{ listStyle: "auto" }}>قم بالتمرير للأسفل في نفس القائمة واختر المتصفح الذي تستخدمه حالياً (مثل <strong>Safari</strong> أو <strong>Chrome</strong>).</li>
              <li style={{ listStyle: "auto" }}>اختر <strong>أثناء استخدام التطبيق (While Using the App)</strong>، وتأكد من تفعيل خيار <strong>الموقع الدقيق (Precise Location)</strong> ليعمل بدقة.</li>
              <li style={{ listStyle: "auto" }}>قم بإعادة تشغيل/تحديث هذه الصفحة لتحديث الأذونات، ثم اضغط على زر "بالقرب مني".</li>
            </ol>
          )}

          {activeTab === "android" && (
            <ol style={{ paddingRight: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "var(--textPrimary)", lineHeight: "1.6" }}>
              <li style={{ listStyle: "auto" }}>اسحب لوحة التنبيهات وتأكد من تفعيل <strong>الموقع الجغرافي (Location / GPS)</strong>.</li>
              <li style={{ listStyle: "auto" }}>افتح <strong>إعدادات الهاتف (Settings)</strong> &larr; <strong>التطبيقات (Apps)</strong>.</li>
              <li style={{ listStyle: "auto" }}>اختر متصفحك الحالي من القائمة (مثل <strong>Chrome</strong> أو <strong>Samsung Internet</strong>).</li>
              <li style={{ listStyle: "auto" }}>اذهب إلى <strong>الأذونات (Permissions)</strong> &larr; <strong>الموقع (Location)</strong> وقم بتغييره إلى <strong>السماح فقط عند استخدام التطبيق (Allow only while using the app)</strong>.</li>
              <li style={{ listStyle: "auto" }}>تأكد من تفعيل خيار <strong>استخدم الموقع الدقيق (Use precise location)</strong> إذا كان متاحاً.</li>
              <li style={{ listStyle: "auto" }}>عد إلى هنا وقم بتحديث الصفحة ثم اضغط على "بالقرب مني".</li>
            </ol>
          )}

          {activeTab === "desktop" && (
            <ol style={{ listStyle: "auto", paddingRight: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "var(--textPrimary)", lineHeight: "1.6" }}>
              <li style={{ listStyle: "auto" }}>اضغط على أيقونة <strong>القفل 🔒</strong> أو <strong>الإعدادات ⚙️</strong> الموجودة بجانب رابط الموقع في شريط عنوان المتصفح (بالأعلى).</li>
              <li style={{ listStyle: "auto" }}>ستظهر لك قائمة أذونات الموقع، ابحث عن <strong>الموقع الجغرافي (Location)</strong> وقم بتغييره الإذن إلى <strong>سماح (Allow)</strong>.</li>
              <li style={{ listStyle: "auto" }}>إذا لم تجده، ادخل على <strong>إعدادات الموقع (Site Settings)</strong> وقم بالسماح للوصول للموقع.</li>
              <li style={{ listStyle: "auto" }}>قم بتحديث الصفحة (Reload) لحفظ وتطبيق التغييرات الجديدة.</li>
            </ol>
          )}
        </div>

        {/* Error message if retry fails */}
        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              fontSize: "0.85rem",
              marginBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              lineHeight: "1.5",
            }}
          >
            <i className="bx bx-error-circle" style={{ fontSize: "1.1rem", marginTop: "2px", flexShrink: 0 }}></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleRetry}
            disabled={retryLoading}
            style={{
              flex: 1,
              padding: "var(--paddingBtn)",
              borderRadius: "var(--radiusBtn)",
              border: "none",
              background: "var(--mainBtn)",
              color: "#ffffff",
              fontSize: "0.95rem",
              fontWeight: "700",
              fontFamily: "var(--font-cairo)",
              cursor: retryLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {retryLoading ? (
              <>
                <span
                  style={{
                    padding: "var(--paddingBtn)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                    fontFamily: "var(--font-sub)"
                  }}
                />
                جاري تحديد الموقع...
              </>
            ) : (
              <>
                <i className="bx bx-refresh" style={{ fontSize: "1.2rem" }}></i>
                أعد المحاولة
              </>
            )}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "var(--paddingBtn)",
              borderRadius: "var(--radiusBtn)",
              border: "1px solid var(--borderGlass)",
              background: "var(--cancelBtn)",
              color: "var(--textPrimary)",
              fontSize: "0.95rem",
              fontWeight: "700",
              fontFamily: "var(--font-sub)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
