"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { calculateAge, getMaxDobDateString } from "@/app/signup/utils";
import styles from "./completeProfileModal.module.css";
import { AlertCircle } from "lucide-react";

interface CompleteProfileModalProps {
  isOpen: boolean;
}

export default function CompleteProfileModal({ isOpen }: CompleteProfileModalProps) {
  const router = useRouter();
  const { user, profile, logout, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<string>("ذكر");
  const [dob, setDob] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [governorate, setGovernorate] = useState<string>("");
  const [city, setCity] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string>("");
  const [errorField, setErrorField] = useState<
    "fullName" | "gender" | "dob" | "phone" | "governorate" | "city" | null
  >(null);
  const [isShaking, setIsShaking] = useState(false);
  const [success, setSuccess] = useState(false);

  const clearError = () => {
    if (error || errorField) {
      setError("");
      setErrorField(null);
    }
  };

  const triggerError = (
    msg: string,
    field: "fullName" | "gender" | "dob" | "phone" | "governorate" | "city" | null,
    focusId?: string
  ) => {
    setError(msg);
    setErrorField(field);
    setIsShaking(true);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {
        // ignore
      }
    }

    if (focusId) {
      setTimeout(() => {
        document.getElementById(focusId)?.focus();
      }, 50);
    }

    setTimeout(() => {
      setIsShaking(false);
    }, 600);
  };

  // Initialize form fields when profile or user changes
  useEffect(() => {
    if (profile || user) {
      const meta = user?.user_metadata || {};
      const initialName =
        profile?.full_name ||
        meta.full_name ||
        meta.name ||
        user?.email?.split("@")[0] ||
        "";
      setFullName(initialName);

      if (profile?.gender) {
        setGender(profile.gender);
      }

      if (profile?.dob) {
        setDob(profile.dob);
      }

      if (profile?.governorate) {
        setGovernorate(profile.governorate);
      }

      if (profile?.city) {
        setCity(profile.city);
      }

      if (profile?.phone) {
        // Strip country code and leading 0 if present
        const cleaned = String(profile.phone).replace(/^\+20/, "").replace(/^0/, "");
        setPhone(cleaned);
      }
    }
  }, [profile, user]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const maxDobDateStr = useMemo(() => getMaxDobDateString(6), []);
  const calculatedAge = useMemo(() => (dob ? calculateAge(dob) : null), [dob]);

  // Determine avatar and provider
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture?.data?.url ||
    (typeof user?.user_metadata?.picture === "string" ? user?.user_metadata?.picture : "") ||
    "";

  const provider =
    user?.app_metadata?.provider ||
    (user?.identities && user.identities[0]?.provider) ||
    "oauth";

  // Phone input handler (Egyptian format: 10 digits starting with 1)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    // If user enters leading 0 (e.g. 010...), strip it automatically
    if (val.startsWith("0")) {
      val = val.slice(1);
    }
    // Limit to 10 digits
    if (val.length <= 10) {
      setPhone(val);
      clearError();
    }
  };

  // Governorate change handler
  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGovernorate(e.target.value);
    setCity("");
    clearError();
  };

  // Submit profile completion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) {
      triggerError("تعذر الاتصال بقاعدة البيانات. يرجى إعادة المحاولة.", null);
      return;
    }

    clearError();

    // Validations
    const trimmedName = fullName.trim();
    if (trimmedName.length < 3) {
      triggerError("يرجى إدخال اسم ثلاثي أو من 3 أحرف على الأقل.", "fullName", "comp-fullname");
      return;
    }

    if (!gender) {
      triggerError("يرجى تحديد النوع (ذكر أو أنثى).", "gender");
      return;
    }

    if (!dob) {
      triggerError("يرجى إدخال تاريخ الميلاد.", "dob", "comp-dob");
      return;
    }

    const age = calculateAge(dob);
    if (age < 6 || age > 110) {
      triggerError("يرجى إدخال تاريخ ميلاد صحيح.", "dob", "comp-dob");
      return;
    }

    if (!phone) {
      triggerError("يرجى إدخال رقم الهاتف.", "phone", "comp-phone");
      return;
    }

    if (!phone.startsWith("1") || phone.length !== 10) {
      triggerError("رقم الهاتف يجب أن يتكون من 10 أرقام ويبدأ بـ 1 (مثال: 1012345678).", "phone", "comp-phone");
      return;
    }

    if (!governorate) {
      triggerError("يرجى اختيار المحافظة.", "governorate", "comp-gov");
      return;
    }

    if (!city) {
      triggerError("يرجى اختيار المدينة / المنطقة.", "city", "comp-city");
      return;
    }

    setSaving(true);

    try {
      const formattedPhone = `+20${phone}`;

      // Check phone uniqueness
      const { data: existingPhone, error: phoneCheckErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", formattedPhone)
        .neq("id", user.id)
        .maybeSingle();

      if (phoneCheckErr) {
        console.warn("Phone check error:", phoneCheckErr);
      }

      if (existingPhone) {
        triggerError("رقم الهاتف هذا مسجل لحساب آخر بالفعل. يرجى إدخال رقم هاتف آخر.", "phone", "comp-phone");
        setSaving(false);
        return;
      }

      // Update in profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          gender: gender,
          governorate: governorate,
          city: city,
          dob: dob,
          phone: formattedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Sync metadata in Supabase Auth
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: trimmedName,
            gender: gender,
            governorate: governorate,
            city: city,
            dob: dob,
            phone: formattedPhone,
          },
        });
      } catch (authMetaErr) {
        console.warn("Auth updateUser metadata warning:", authMetaErr);
      }

      // Refresh AuthContext profile
      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      console.error("Error saving complete profile:", err);
      triggerError(err?.message || "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.", null);
      setSaving(false);
    }
  };

  // Complete Later -> Logout and continue as guest
  const handleCompleteLater = async () => {
    try {
      setLoggingOut(true);
      setError("");
      await logout();
      if (typeof window !== "undefined") {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Error during logout as guest:", err);
      // Fallback
      if (supabase) {
        await supabase.auth.signOut();
      }
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } finally {
      setLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <i className="bx bxs-user"></i>
              </div>
            )}
            <div className={styles.badgeOAuth} title={`مسجل عبر ${provider}`}>
              {provider === "google" ? (
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              ) : provider === "facebook" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              ) : (
                <i className="bx bxs-check-shield" style={{ color: "#3b82f6", fontSize: "14px" }}></i>
              )}
            </div>
          </div>

          <h2 id="modal-title" className={styles.title}>
            استكمال بيانات الحساب
          </h2>
          <div className={styles.subtitle}>
            مرحباً بك {fullName ? `يا ${fullName}` : ""} 🎉
          </div>
          <p className={styles.description}>
            لتفعيل حسابك بالكامل والاستفادة من جميع مميزات قريب ماب ، يرجى استكمال البيانات الإلزامية التالية:
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={`${styles.modalBody} ${isShaking ? styles.shake : ""}`}>
          {success && (
            <div className={styles.successBanner} role="status">
              <i className="bx bx-check-circle" style={{ fontSize: "1.3rem" }}></i>
              <span>تم حفظ وتحديث بياناتك بنجاح! جاري المتابعة...</span>
            </div>
          )}

          {/* Full Name */}
          <div className={styles.fieldGroup}>
            <label htmlFor="comp-fullname" className={styles.label}>
              <span className={styles.labelLeft}>
                <i className={`bx bx-user ${styles.labelIcon}`}></i>
                الاسم بالكامل
                <span className={styles.requiredAsterisk}>*</span>
              </span>
            </label>
            <input
              id="comp-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearError();
              }}
              placeholder="مثال: أحمد محمد علي"
              className={`${styles.input} ${errorField === "fullName" ? styles.inputError : ""}`}
              aria-invalid={errorField === "fullName"}
            />
          </div>

          {/* Gender & DOB in 2 cols */}
          <div className={styles.twoCols}>
            {/* Gender */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelLeft}>
                  <i className={`bx bx-male-female ${styles.labelIcon}`}></i>
                  النوع
                  <span className={styles.requiredAsterisk}>*</span>
                </span>
              </label>
              <div className={styles.genderGrid}>
                <button
                  type="button"
                  onClick={() => {
                    setGender("ذكر");
                    clearError();
                  }}
                  className={`${styles.genderButton} ${gender === "ذكر" ? styles.genderButtonActive : ""} ${errorField === "gender" ? styles.genderButtonError : ""}`}
                >
                  <i className="bx bx-male" style={{ fontSize: "1.2rem" }}></i>
                  <span>ذكر</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGender("أنثى");
                    clearError();
                  }}
                  className={`${styles.genderButton} ${gender === "أنثى" ? styles.genderButtonActive : ""} ${errorField === "gender" ? styles.genderButtonError : ""}`}
                >
                  <i className="bx bx-female" style={{ fontSize: "1.2rem" }}></i>
                  <span>أنثى</span>
                </button>
              </div>
            </div>

            {/* DOB & Age */}
            <div className={styles.fieldGroup}>
              <label htmlFor="comp-dob" className={styles.label}>
                <span className={styles.labelLeft}>
                  <i className={`bx bx-calendar ${styles.labelIcon}`}></i>
                  تاريخ الميلاد
                  <span className={styles.requiredAsterisk}>*</span>
                </span>
                {calculatedAge !== null && calculatedAge > 0 && (
                  <span className={styles.badgeAge}>
                    العمر: {calculatedAge} سنة
                  </span>
                )}
              </label>
              <input
                id="comp-dob"
                type="date"
                required
                max={maxDobDateStr}
                lang="en-US"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  clearError();
                }}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {
                    // ignore
                  }
                }}
                className={`${styles.input} ${styles.dateInput} ${errorField === "dob" ? styles.inputError : ""}`}
                style={{ direction: "ltr" }}
                aria-invalid={errorField === "dob"}
              />
              <span className={styles.fieldNote}>
                تأكد من صحة تاريخ الميلاد (لا يمكن تعديله لاحقاً).
              </span>
            </div>
          </div>

          {/* Phone Number */}
          <div className={styles.fieldGroup}>
            <label htmlFor="comp-phone" className={styles.label}>
              <span className={styles.labelLeft}>
                <i className={`bx bx-phone ${styles.labelIcon}`}></i>
                رقم الهاتف المحمول
                <span className={styles.requiredAsterisk}>*</span>
              </span>
            </label>
            <div className={styles.phoneWrapper}>
              <span className={styles.phonePrefix}>
                <Image
                  src="/images/profile/flag-egypt.webp"
                  alt="Egypt"
                  width={20}
                  height={15}
                  style={{ borderRadius: "2px" }}
                />
                <span>+20</span>
                <span className={styles.phoneDivider}></span>
              </span>
              <input
                id="comp-phone"
                type="tel"
                required
                placeholder="1xxxxxxxxx"
                value={phone}
                onChange={handlePhoneChange}
                className={`${styles.input} ${styles.phoneInput} ${errorField === "phone" ? styles.inputError : ""}`}
                aria-invalid={errorField === "phone"}
              />
            </div>
            <span className={styles.fieldNote}>
              أدخل 10 أرقام تبدأ بـ 1 (مثال: 1012345678 أو 01012345678).
            </span>
          </div>

          {/* Governorate & City in 2 cols */}
          <div className={styles.twoCols}>
            {/* Governorate */}
            <div className={styles.fieldGroup}>
              <label htmlFor="comp-gov" className={styles.label}>
                <span className={styles.labelLeft}>
                  <i className={`bx bx-map-pin ${styles.labelIcon}`}></i>
                  المحافظة
                  <span className={styles.requiredAsterisk}>*</span>
                </span>
              </label>
              <select
                id="comp-gov"
                required
                value={governorate}
                onChange={handleGovChange}
                className={`${styles.input} ${styles.select} ${errorField === "governorate" ? styles.inputError : ""}`}
                aria-invalid={errorField === "governorate"}
              >
                <option value="" disabled>
                  اختر المحافظة...
                </option>
                {governoratesList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className={styles.fieldGroup}>
              <label htmlFor="comp-city" className={styles.label}>
                <span className={styles.labelLeft}>
                  <i className={`bx bx-buildings ${styles.labelIcon}`}></i>
                  المدينة / الحي
                  <span className={styles.requiredAsterisk}>*</span>
                </span>
              </label>
              <select
                id="comp-city"
                required
                disabled={!governorate}
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  clearError();
                }}
                className={`${styles.input} ${styles.select} ${errorField === "city" ? styles.inputError : ""}`}
                aria-invalid={errorField === "city"}
              >
                <option value="" disabled>
                  {governorate ? "اختر المدينة / الحي..." : "اختر المحافظة أولاً"}
                </option>
                {governorate &&
                  egyptLocations[governorate]?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Error Banner directly under fields, above the footer */}
          {error && (
            <div className="error-alert" role="alert">
              <AlertCircle size={16} className="error-alert-icon" />
              <span className="error-alert-message">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className={styles.modalFooter}>
            <button
              type="submit"
              disabled={saving || loggingOut || success}
              className={styles.submitBtn}
            >
              {saving ? (
                <>
                  <span className={styles.spinner} />
                  <span>جاري حفظ البيانات...</span>
                </>
              ) : (
                <>
                  <i className="bx bx-check-shield" style={{ fontSize: "1.2rem" }}></i>
                  <span>حفظ واستكمال الدخول</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={saving || loggingOut}
              onClick={handleCompleteLater}
              className={styles.completeLaterBtn}
            >
              {loggingOut ? (
                <>
                  <span className={styles.spinner} style={{ borderColor: "rgba(239, 68, 68, 0.4)", borderTopColor: "#ef4444" }} />
                  <span>جاري تسجيل الخروج...</span>
                </>
              ) : (
                <>
                  <i className="bx bx-log-out" style={{ fontSize: "1.1rem" }}></i>
                  <span>الإكمال لاحقاً (تسجيل الخروج والمتابعة كضيف)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
