"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  SavedLocation,
  LOCATION_CATEGORIES,
  addUserSavedLocation,
  getHighAccuracyCoordinates,
  reverseGeocodeCoords,
} from "@/lib/savedLocations";
import {
  FaMapMarkerAlt,
  FaSatellite,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaCopy,
  FaRedo,
  FaTimes,
  FaCompass,
  FaLock,
  FaUser,
} from "react-icons/fa";
import { MdOutlineSaveAlt } from "react-icons/md";

interface SaveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords?: { lat: number; lng: number } | null;
  onSaved?: (saved: SavedLocation) => void;
}

export default function SaveLocationModal({
  isOpen,
  onClose,
  initialCoords,
  onSaved,
}: SaveLocationModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // GPS coords & accuracy
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [address, setAddress] = useState<string>("");

  // Form
  const [placeName, setPlaceName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("parking");
  const [notes, setNotes] = useState("");

  // Result state
  const [savedResult, setSavedResult] = useState<SavedLocation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setSavedResult(null);
      setCopiedLink(false);
      setErrorMsg(null);

      if (initialCoords) {
        setCoords({
          latitude: initialCoords.lat,
          longitude: initialCoords.lng,
          accuracy: 5,
        });
        setStatusMsg("تم استخدام إحداثيات الخريطة الحالية");
        reverseGeocodeCoords(initialCoords.lat, initialCoords.lng).then((addr) => {
          if (addr) setAddress(addr);
        });
      } else if (user) {
        acquireHighAccuracyLocation();
      }
    } else {
      setMounted(false);
      setPlaceName("");
      setNotes("");
      setCoords(null);
      setAddress("");
      setSaving(false);
    }
  }, [isOpen, initialCoords, user]);

  const acquireHighAccuracyLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    setStatusMsg("جاري الاتصال بالأقمار الصناعية (GPS) للحصول على دقة 100%...");

    try {
      const result = await getHighAccuracyCoordinates((progress) => {
        setStatusMsg(progress.message);
      });

      setCoords(result);
      setLoading(false);
      setStatusMsg(`تم التقاط الموقع بنجاح بدقة ±${result.accuracy.toFixed(1)} متر`);

      // Try reverse geocode in background
      reverseGeocodeCoords(result.latitude, result.longitude).then((addr) => {
        if (addr) {
          setAddress(addr);
          setPlaceName((prev) => (prev ? prev : addr.split(",")[0] || ""));
        }
      });
    } catch (err: any) {
      setLoading(false);
      let msg = "تعذر تحديد الموقع بدقة.";
      if (err.code === 1) {
        msg = "يرجى السماح بصلاحية الموقع من إعدادات المتصفح أو الجهاز.";
      } else if (err.code === 2) {
        msg = "إشارة الـ GPS غير متوفرة حالياً، تأكد من تشغيل خدمات الموقع.";
      } else if (err.code === 3) {
        msg = "انتهت مهلة انتظار إشارة الـ GPS. يرجى المحاولة مرة أخرى.";
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("يرجى تسجيل الدخول أولاً لحفظ المكان على حسابك.");
      return;
    }

    if (!coords) {
      setErrorMsg("يرجى التقاط الموقع الجغرافي أولاً.");
      return;
    }

    const finalName = placeName.trim() || "موقعي المحفوظ";
    setSaving(true);
    setErrorMsg(null);

    try {
      const saved = await addUserSavedLocation(user.id, {
        name: finalName,
        category: selectedCategory,
        notes: notes.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        address: address || undefined,
      });

      setSavedResult(saved);
      if (onSaved) {
        onSaved(saved);
      }
    } catch (err: any) {
      setErrorMsg("حدث خطأ أثناء حفظ المكان. يرجى المحاولة مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!savedResult) return;
    navigator.clipboard.writeText(savedResult.googleMapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 12000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(11, 15, 25, 0.8)",
        backdropFilter: mounted ? "blur(12px)" : "blur(0px)",
        WebkitBackdropFilter: mounted ? "blur(12px)" : "blur(0px)",
        transition: "all 0.25s ease",
        direction: "rtl",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "var(--bg-secondary, #131b2e)",
          border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.12))",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
          color: "var(--text-primary, #ffffff)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            borderBottom: "1px solid var(--border-glass, rgba(255,255,255,0.08))",
            paddingBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "1.2rem",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
              }}
            >
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
                أحفظ مكاني
              </h3>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                حفظ الموقع على حسابك الشخصي مع رابط خرائط جوجل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary, #cbd5e1)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* If user is NOT logged in, show login prompt */}
        {!user ? (
          <div style={{ textAlign: "center", padding: "16px 8px" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.15)",
                border: "2px solid #3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                color: "#60a5fa",
                fontSize: "1.8rem",
              }}
            >
              <FaLock />
            </div>

            <h4
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary, #ffffff)",
                margin: "0 0 10px 0",
              }}
            >
              تسجيل الدخول مطلوب
            </h4>

            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--text-secondary, #cbd5e1)",
                margin: "0 auto 20px auto",
                lineHeight: 1.6,
                maxWidth: "380px",
              }}
            >
              لحفظ مكانك ومزامنته بأمان على <strong>حسابك الشخصي</strong> والوصول إليه من
              هاتفك أو أي جهاز في أي وقت، يرجى تسجيل الدخول أولاً.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/login?redirect=/save-location");
                }}
                style={{
                  background: "linear-gradient(135deg, #2563eb, #0284c7)",
                  color: "#ffffff",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
                }}
              >
                تسجيل الدخول إلى حسابي 🚀
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "var(--text-secondary, #cbd5e1)",
                  padding: "12px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : savedResult ? (
          /* Saved Success View */
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "2px solid #10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                color: "#10b981",
                fontSize: "2.2rem",
              }}
            >
              <FaCheckCircle />
            </div>

            <h4
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#10b981",
                margin: "0 0 8px 0",
              }}
            >
              تم حفظ المكان على حسابك بنجاح!
            </h4>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--text-secondary, #cbd5e1)",
                margin: "0 0 16px 0",
              }}
            >
              تم تسجيل <strong>{savedResult.name}</strong> ومزامنته مع حسابك بالوقت
              والتاريخ والإحداثيات الدقيقة.
            </p>

            {/* Place Card Summary */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                <span>📅 {savedResult.formattedDate}</span>
                <span>⏰ {savedResult.formattedTime}</span>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#38bdf8",
                  marginBottom: "8px",
                  direction: "ltr",
                  textAlign: "right",
                }}
              >
                📍 GPS: {savedResult.latitude.toFixed(6)}, {savedResult.longitude.toFixed(6)} (±
                {savedResult.accuracy}m)
              </div>
              {savedResult.notes && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary, #cbd5e1)",
                    background: "rgba(255, 255, 255, 0.03)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                >
                  📝 {savedResult.notes}
                </div>
              )}
            </div>

            {/* Direct Google Maps Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={savedResult.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                  transition: "transform 0.2s ease",
                }}
              >
                <FaExternalLinkAlt />
                فتح مباشرة في Google Maps 🗺️
              </a>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleCopyLink}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: copiedLink
                      ? "rgba(16, 185, 129, 0.2)"
                      : "rgba(255, 255, 255, 0.08)",
                    border: copiedLink ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.15)",
                    color: copiedLink ? "#10b981" : "var(--text-primary, #ffffff)",
                    padding: "12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <FaCopy />
                  {copiedLink ? "تم نسخ الرابط!" : "نسخ رابط الخريطة"}
                </button>

                <Link
                  href="/save-location"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "rgba(59, 130, 246, 0.15)",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    color: "#60a5fa",
                    padding: "12px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <FaCompass />
                  كل الأماكن المحفوظة
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Save Form View */
          <form onSubmit={handleSave}>
            {/* Account badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "8px 12px",
                marginBottom: "14px",
                fontSize: "0.85rem",
                color: "var(--text-secondary, #94a3b8)",
              }}
            >
              <FaUser style={{ color: "#38bdf8" }} />
              <span>
                الحفظ مرتبط بحسابك:{" "}
                <strong style={{ color: "#ffffff" }}>
                  {profile?.full_name || user.email || "المستخدم"}
                </strong>
              </span>
            </div>

            {/* GPS Status Banner */}
            <div
              style={{
                background: coords
                  ? "rgba(16, 185, 129, 0.1)"
                  : loading
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${
                  coords
                    ? "rgba(16, 185, 129, 0.3)"
                    : loading
                    ? "rgba(59, 130, 246, 0.3)"
                    : "rgba(239, 68, 68, 0.3)"
                }`,
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "1.2rem",
                    color: coords ? "#10b981" : loading ? "#60a5fa" : "#ef4444",
                    animation: loading ? "spin 1.5s linear infinite" : "none",
                  }}
                >
                  <FaSatellite />
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: coords ? "#10b981" : loading ? "#60a5fa" : "#ef4444",
                    }}
                  >
                    {coords
                      ? `🎯 تم التقاط الموقع (دقة ممتازة: ±${coords.accuracy.toFixed(1)} م)`
                      : loading
                      ? "جاري الاتصال بالأقمار الصناعية (GPS)..."
                      : "إشارة الموقع غير متوفرة"}
                  </div>
                  {coords && (
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary, #94a3b8)",
                        direction: "ltr",
                        textAlign: "right",
                      }}
                    >
                      {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={acquireHighAccuracyLocation}
                disabled={loading}
                title="إعادة فحص الموقع بدقة أعلى"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  color: "var(--text-primary, #ffffff)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                }}
              >
                <FaRedo style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                <span>إعادة القياس</span>
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#f87171",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Place Name Input */}
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="place-name-input"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "var(--text-primary, #ffffff)",
                }}
              >
                اسم المكان <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="place-name-input"
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="مثال: ركنت العربية في شارع التحرير، منزل صديقي..."
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "var(--text-primary, #ffffff)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Category selection */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "var(--text-primary, #ffffff)",
                }}
              >
                نوع أو تصنيف المكان
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {LOCATION_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "20px",
                        border: isSelected
                          ? "1px solid #3b82f6"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        background: isSelected
                          ? "rgba(59, 130, 246, 0.25)"
                          : "rgba(255, 255, 255, 0.04)",
                        color: isSelected ? "#93c5fd" : "var(--text-secondary, #cbd5e1)",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="place-notes-input"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "var(--text-primary, #ffffff)",
                }}
              >
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                id="place-notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: أمام بوابة رقم 3، بجوار الصيدلية، الطابق الثاني..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "var(--text-primary, #ffffff)",
                  fontSize: "0.9rem",
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>

            {/* Feature Highlights Info */}
            <div
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "0.82rem",
                color: "#93c5fd",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div>🔒 سيتم حفظ المكان وتأمينه على حسابك مباشرة.</div>
              <div>✨ سيتم تسجيل الوقت والتاريخ الحالي تلقائياً.</div>
              <div>🗺️ سيتم إنشاء رابط مباشر لخرائط جوجل (Google Maps) للرجوع للمكان في أي وقت.</div>
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={!coords || loading || saving}
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: !coords || loading || saving
                    ? "rgba(59, 130, 246, 0.4)"
                    : "linear-gradient(135deg, #2563eb, #0284c7)",
                  color: "#ffffff",
                  padding: "13px 20px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: !coords || loading || saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                <MdOutlineSaveAlt style={{ fontSize: "1.2rem" }} />
                <span>{saving ? "جاري الحفظ على حسابك..." : "حفظ المكان على حسابي"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "var(--text-secondary, #cbd5e1)",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
