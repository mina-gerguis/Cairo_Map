"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  SavedLocation,
  LOCATION_CATEGORIES,
  addUserSavedLocation,
  getUserSavedPlacesLimit,
  fetchUserSavedLocations,
  getHighAccuracyCoordinates,
  reverseGeocodeCoords,
} from "@/lib/savedLocations";
import styles from "./SaveLocationModal.module.css";
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
  FaCrown,
} from "react-icons/fa";
import { MdOutlineSaveAlt } from "react-icons/md";

interface SaveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords?: { lat: number; lng: number } | null;
  onSaved?: (saved: SavedLocation) => void;
  currentCount?: number;
}

export default function SaveLocationModal({
  isOpen,
  onClose,
  initialCoords,
  onSaved,
  currentCount,
}: SaveLocationModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [userPlacesCount, setUserPlacesCount] = useState<number>(0);

  // GPS coords & accuracy
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Form
  const [placeName, setPlaceName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("parking");
  const [notes, setNotes] = useState("");

  // Result state
  const [savedResult, setSavedResult] = useState<SavedLocation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const planLimit = getUserSavedPlacesLimit(profile);
  const isLimitReached = !planLimit.isUnlimited && userPlacesCount >= planLimit.limit;

  useEffect(() => {
    if (isOpen) {
      setSavedResult(null);
      setCopiedLink(false);
      setErrorMsg(null);

      if (currentCount !== undefined) {
        setUserPlacesCount(currentCount);
      } else if (user) {
        fetchUserSavedLocations(user.id).then((places) => {
          setUserPlacesCount(places.length);
        });
      }

      if (initialCoords) {
        setCoords({
          latitude: initialCoords.lat,
          longitude: initialCoords.lng,
          accuracy: 5,
        });
        setStatusMsg("تم استخدام إحداثيات الخريطة الحالية");
        setLoadingAddress(true);
        reverseGeocodeCoords(initialCoords.lat, initialCoords.lng)
          .then((addr) => {
            if (addr) {
              setAddress(addr);
              setPlaceName((prev) => (prev ? prev : addr.split(",")[0] || ""));
            }
          })
          .finally(() => {
            setLoadingAddress(false);
          });
      } else if (user) {
        acquireHighAccuracyLocation();
      }
    } else {
      setPlaceName("");
      setNotes("");
      setCoords(null);
      setAddress("");
      setLoadingAddress(false);
      setSaving(false);
    }
  }, [isOpen, initialCoords, user, currentCount]);

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
      setLoadingAddress(true);
      reverseGeocodeCoords(result.latitude, result.longitude)
        .then((addr) => {
          if (addr) {
            setAddress(addr);
            setPlaceName((prev) => (prev ? prev : addr.split(",")[0] || ""));
          }
        })
        .finally(() => {
          setLoadingAddress(false);
        });
    } catch (err: any) {
      setLoading(false);
      setLoadingAddress(false);
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

    if (isLimitReached) {
      setErrorMsg(
        `لقد بلغت الحد الأقصى للأماكن المحفوظة في باقتك (${planLimit.tierName}: ${planLimit.maxAllowedText}). يرجى الترقية لحفظ المزيد.`
      );
      return;
    }

    const finalName = placeName.trim() || "موقعي المحفوظ";
    setSaving(true);
    setErrorMsg(null);

    try {
      const saved = await addUserSavedLocation(
        user.id,
        {
          name: finalName,
          category: selectedCategory,
          notes: notes.trim(),
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          address: address || undefined,
        },
        profile
      );

      setUserPlacesCount((prev) => prev + 1);
      setSavedResult(saved);
      if (onSaved) {
        onSaved(saved);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ المكان. يرجى المحاولة مرة أخرى.");
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
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div>
              <h3 className={styles.modalTitle}>شوف أنا فين ..؟</h3>
            </div>
          </div>

          <button onClick={onClose} aria-label="إغلاق النافذة" className="btn-close">
            <FaTimes />
          </button>
        </div>

        {/* If user is NOT logged in */}
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
                fontWeight: 800,
                color: "inherit",
                margin: "0 0 10px 0",
              }}
            >
              تسجيل الدخول مطلوب
            </h4>

            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--text-secondary, #94a3b8)",
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
                className={styles.modalSubmitBtn}
                onClick={() => {
                  onClose();
                  router.push("/login?redirect=/save-location");
                }}
              >
                تسجيل الدخول إلى حسابي 🚀
              </button>

              <button type="button" className={styles.modalCancelBtn} onClick={onClose}>
                إلغاء
              </button>
            </div>
          </div>
        ) : savedResult ? (
          /* Saved Success View */
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div className={styles.successCircle}>
              <FaCheckCircle />
            </div>

            <h4
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "#10b981",
                margin: "0 0 8px 0",
              }}
            >
              تم حفظ المكان على حسابك بنجاح!
            </h4>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--text-secondary, #94a3b8)",
                margin: "0 0 18px 0",
              }}
            >
              تم تسجيل <strong>{savedResult.name}</strong> ومزامنته بالوقت والتاريخ
              والإحداثيات الدقيقة.
            </p>

            {/* Place Card Summary */}
            <div className={styles.successCardPreview}>
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
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "inherit",
                  marginBottom: "6px",
                }}
              >
                {savedResult.name}
              </div>
              {savedResult.address && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary, #94a3b8)",
                    marginBottom: "8px",
                  }}
                >
                  📍 {savedResult.address}
                </div>
              )}
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary, #94a3b8)",
                  direction: "ltr",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                📍 GPS: {savedResult.latitude.toFixed(6)}, {savedResult.longitude.toFixed(6)} (±
                {savedResult.accuracy}م)
              </div>
              {savedResult.notes && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "inherit",
                    background: "rgba(59, 130, 246, 0.08)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                >
                  📝 {savedResult.notes}
                </div>
              )}
            </div>

            {/* Actions */}
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
                  borderRadius: "14px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                <FaExternalLinkAlt />
                فتح مباشرة في Google Maps 🗺️
              </a>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={styles.modalCancelBtn}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <FaCopy />
                  <span>{copiedLink ? "تم نسخ الرابط!" : "نسخ رابط الخريطة"}</span>
                </button>

                <Link
                  href="/save-location"
                  onClick={onClose}
                  className={styles.modalCancelBtn}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                    color: "#3b82f6",
                    borderColor: "rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <FaCompass />
                  <span>كل الأماكن</span>
                </Link>
              </div>
            </div>
          </div>
        ) : isLimitReached ? (
          /* Limit Reached Full State */
          <div className={styles.limitReachedBox}>
            <div className={styles.limitReachedIcon}>
              <FaCrown />
            </div>

            <h4 className={styles.limitReachedTitle}>
              بلغت الحد الأقصى لحفظ الأماكن ({planLimit.maxAllowedText})
            </h4>

            <div className={styles.limitReachedBadge}>
              {planLimit.tier === "silver" ? "🥈 الباقة الفضية (20 مكان)" : "⚪ الباقة المجانية (3 أماكن)"}
            </div>

            <p className={styles.limitReachedDesc}>
              {planLimit.tier === "silver"
                ? "لقد استنفدت السعة المتاحة في باقتك الفضية (20 مكاناً). للترقية إلى الباقة الذهبية وحفظ عدد غير محدود من الأماكن في أي وقت، اضغط على زر الترقية أدناه، أو قم بحذف بعض الأماكن القديمة."
                : "لقد استنفدت السعة المتاحة في باقتك المجانية (3 أماكن فقط). للترقية إلى الباقة الفضية (حتى 20 مكاناً) أو الباقة الذهبية (عدد لا نهائي من الأماكن)، اضغط على زر الترقية أدناه، أو قم بحذف بعض الأماكن القديمة."}
            </p>

            <div className={styles.limitReachedActions}>
              <button
                type="button"
                className={styles.modalSubmitBtn}
                onClick={() => {
                  onClose();
                  router.push("/profile?expand=subscription");
                }}
              >
                <FaCrown />
                <span>ترقية باقتي الآن 🚀</span>
              </button>

              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => {
                  onClose();
                  router.push("/save-location");
                }}
              >
                إدارة وحذف الأماكن المحفوظة
              </button>
            </div>
          </div>
        ) : (
          /* Save Form View */
          <form onSubmit={handleSave}>
            {/* GPS Status Banner */}
            <div
              className={`${styles.gpsStatusBox} ${
                coords ? styles.gpsSuccess : loading ? styles.gpsLoading : styles.gpsError
              }`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "1.2rem",
                    flexShrink: 0,
                  }}
                >
                  <FaSatellite />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className={styles.gpsStatusText} title={address || undefined}>
                    {coords
                      ? address || (loadingAddress ? "جاري تحديد اسم المكان..." : "تم تحديد موقعك بنجاح")
                      : loading
                      ? "أستني بشوف أنت فين"
                      : "إشارة الموقع غير متوفرة"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={acquireHighAccuracyLocation}
                disabled={loading}
                title="إعادة فحص الموقع بدقة أعلى"
                className={styles.refreshGpsBtn}
              >
                <FaRedo style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              </button>
            </div>

            {errorMsg && <div className={styles.alertBox}>⚠️ {errorMsg}</div>}

            {/* Place Name Input */}
            <div className={styles.formGroup}>
              <label htmlFor="place-name-input" className={styles.formLabel}>
                اسم المكان <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="place-name-input"
                type="text"
                className="input-fields"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="مثال: ركنت العربية في شارع التحرير، منزل صديقي..."
                required
              />
            </div>

            {/* Category selection */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>نوع أو تصنيف المكان</label>
              <div className={styles.categoriesGrid}>
                {LOCATION_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`${styles.categoryBtn} ${isSelected ? styles.categoryBtnActive : ""}`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div className={styles.formGroup}>
              <label htmlFor="place-notes-input" className={styles.formLabel}>
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                id="place-notes-input"
                className={styles.textareaInput}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: أمام بوابة رقم 3، بجوار الصيدلية، الطابق الثاني، رقم العمود B-12..."
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <div className={styles.modalActionsRow}>
              <button
                type="submit"
                disabled={!coords || loading || saving}
                className="btn btn-primary w-full"
              >
                <MdOutlineSaveAlt style={{ fontSize: "1.2rem" }} />
                <span>{saving ? "جاري الحفظ ..." : "حفظ المكان"}</span>
              </button>

              <button type="button" onClick={onClose} className="btn btn-cancel w-full">
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
