"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { applyNewUserTrialIfActive } from "@/lib/promotions";
import { SignupFormData, SignupFieldErrors, PasswordRules } from "../types";
import { INITIAL_FORM_DATA, INITIAL_FIELD_ERRORS } from "../constants";
import {
  generateUsernameSuggestions,
  calculateAge,
  getMaxDobDateString,
  validateName,
  validatePhone,
  validateEmail,
  checkPasswordRules,
} from "../utils";

export const useSignupForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);

  const [formData, setFormData] = useState<SignupFormData>(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>(INITIAL_FIELD_ERRORS);

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDobConfirmModal, setShowDobConfirmModal] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Email verification OTP state
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [emailOtpSent, setEmailOtpSent] = useState<boolean>(false);
  const [emailOtp, setEmailOtp] = useState<string>("");
  const [emailOtpHash, setEmailOtpHash] = useState<string>("");
  const [emailOtpExpiresAt, setEmailOtpExpiresAt] = useState<number | null>(null);
  const [emailOtpTimer, setEmailOtpTimer] = useState<number>(0);
  const [emailOtpLoading, setEmailOtpLoading] = useState<boolean>(false);
  const [emailOtpError, setEmailOtpError] = useState<string>("");
  const [emailVerificationToken, setEmailVerificationToken] = useState<string>("");
  const [emailCodeDigits, setEmailCodeDigits] = useState<string[]>(Array(6).fill(""));
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email OTP timer countdown
  useEffect(() => {
    if (emailOtpTimer <= 0) return;
    const interval = setInterval(() => {
      setEmailOtpTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [emailOtpTimer]);

  // Name validation & username suggestions
  useEffect(() => {
    setFieldErrors((prev) => ({
      ...prev,
      firstName: validateName(formData.firstName, "الاسم الأول"),
      lastName: validateName(formData.lastName, "الاسم الأخير"),
    }));

    const nextSuggestions = generateUsernameSuggestions(formData.firstName, formData.lastName);
    setSuggestions(nextSuggestions);
  }, [formData.firstName, formData.lastName]);

  // Phone validation
  useEffect(() => {
    setFieldErrors((prev) => ({
      ...prev,
      phone: validatePhone(formData.phone),
    }));
  }, [formData.phone]);

  // Email validation
  useEffect(() => {
    setFieldErrors((prev) => ({
      ...prev,
      email: validateEmail(formData.email),
    }));
  }, [formData.email]);

  const updateField = (field: keyof SignupFormData, value: string) => {
    if (field === "phone") {
      const numeric = value.replace(/[^0-9]/g, "");
      if (numeric.length <= 10) {
        setFormData((prev) => ({ ...prev, phone: numeric }));
      }
    } else if (field === "email") {
      setFormData((prev) => ({ ...prev, email: value }));
      setIsEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp("");
      setEmailCodeDigits(Array(6).fill(""));
      setEmailOtpError("");
    } else if (field === "username") {
      const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setFormData((prev) => ({ ...prev, username: cleanUsername }));
      setFieldErrors((prev) => ({
        ...prev,
        username: cleanUsername.length > 0 && cleanUsername.length < 3 ? "اسم المستخدم يجب أن يكون 3 حروف على الأقل" : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // OTP 6-Digit input handlers
  const handleEmailDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...emailCodeDigits];
    newDigits[index] = value.slice(-1);
    setEmailCodeDigits(newDigits);
    setEmailOtp(newDigits.join(""));
    if (value && index < 5) {
      emailInputRefs.current[index + 1]?.focus();
    }
  };

  const handleEmailKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !emailCodeDigits[index] && index > 0) {
      emailInputRefs.current[index - 1]?.focus();
    }
  };

  const handleEmailPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = [...emailCodeDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setEmailCodeDigits(newDigits);
      setEmailOtp(newDigits.join(""));
      const nextIndex = Math.min(pastedData.length, 5);
      emailInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailOtpError("يرجى كتابة بريد إلكتروني صحيح أولاً");
      return;
    }

    setEmailOtpLoading(true);
    setEmailOtpError("");

    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", formData.email.trim())
          .limit(1);
        if (existing && existing.length > 0) {
          setEmailOtpError("هذا البريد الإلكتروني مسجل مسبقاً لحساب آخر");
          setEmailOtpLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Error checking email uniqueness:", e);
      }
    }

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إرسال كود التحقق");
      }
      setEmailOtpHash(data.hash);
      setEmailOtpExpiresAt(data.expiresAt);
      setEmailOtpSent(true);
      setEmailOtpTimer(60);
      setEmailCodeDigits(Array(6).fill(""));
      setEmailOtp("");
    } catch (err: any) {
      setEmailOtpError(err.message || "حدث خطأ أثناء إرسال الكود");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.trim().length !== 6) {
      setEmailOtpError("يرجى إدخال كود التحقق المكون من 6 أرقام");
      return;
    }
    setEmailOtpLoading(true);
    setEmailOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: emailOtp.trim(),
          hash: emailOtpHash,
          expiresAt: emailOtpExpiresAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "كود التحقق غير صحيح");
      }
      setIsEmailVerified(true);
      setEmailVerificationToken(data.verificationToken || "");
    } catch (err: any) {
      setEmailOtpError(err.message || "كود التحقق غير صحيح");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) {
        setError("فشل رفع الصورة: " + uploadError.message);
      } else if (data) {
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
        updateField("avatarUrl", pub.publicUrl);
      }
    } catch (err: any) {
      setError("فشل رفع الصورة: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dob) {
      setError("يرجى إدخال تاريخ الميلاد.");
      return;
    }
    const age = calculateAge(formData.dob);
    if (age < 6) {
      setError("يجب أن يكون العمر 6 سنوات على الأقل للتسجيل.");
      return;
    }

    if (!supabase) {
      setShowDobConfirmModal(true);
      return;
    }

    setLoading(true);
    setError("");
    const fullPhone = `+20${formData.phone}`;
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("username, email, phone")
        .or(`username.eq.${formData.username},email.eq.${formData.email},phone.eq.${fullPhone}`)
        .limit(1);

      if (existing && existing.length > 0) {
        const match = existing[0];
        if (match.username === formData.username) {
          setError("اسم المستخدم محجوز، يرجى اختيار اسم آخر.");
          setStep(1);
        } else if (match.email === formData.email) {
          setError("البريد الإلكتروني مسجل مسبقاً.");
          setStep(1);
        } else {
          setError("رقم الهاتف مسجل مسبقاً.");
          setStep(2);
        }
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn("DB uniqueness check warning:", err);
    }

    setLoading(false);
    setShowDobConfirmModal(true);
  };

  const pwdRules: PasswordRules = checkPasswordRules(formData.password, formData.confirmPassword);
  const isPasswordValid = Object.values(pwdRules).every(Boolean);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("يرجى التأكد من استيفاء جميع شروط كلمة المرور.");
      return;
    }
    if (!supabase) {
      setError("لم يتم تكوين إعدادات قاعدة البيانات بعد.");
      return;
    }

    setLoading(true);
    setError("");

    const fullNameCombined = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const formattedPhone = `+20${formData.phone.replace(/^0+/, "")}`;

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullNameCombined,
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            username: formData.username,
            phone: formattedPhone,
            gender: formData.gender,
            governorate: formData.governorate,
            city: formData.city,
            avatar_url: formData.avatarUrl,
            dob: formData.dob,
            email_verified: isEmailVerified,
          },
        },
      });

      if (signUpError) {
        let msg = signUpError.message;
        if (typeof msg === "object") msg = JSON.stringify(msg);

        if (msg && msg.includes("User already registered")) msg = "هذا البريد الإلكتروني مسجل مسبقاً.";
        else if (msg && msg.includes("Database error saving new user")) msg = "حدث خطأ أثناء الحفظ. قد يكون رقم الهاتف أو اسم المستخدم محجوزاً.";
        else if (!msg || msg === "{}") msg = "تفاصيل الخطأ: " + JSON.stringify(signUpError);

        setError(msg);
        setLoading(false);
      } else {
        if (signUpData?.user) {
          try {
            await supabase.from("profiles").upsert(
              {
                id: signUpData.user.id,
                full_name: fullNameCombined,
                username: formData.username,
                email: formData.email,
                phone: formattedPhone,
                gender: formData.gender,
                governorate: formData.governorate,
                city: formData.city,
                avatar_url: formData.avatarUrl,
                dob: formData.dob,
                email_verified: isEmailVerified,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );

            try {
              await applyNewUserTrialIfActive(signUpData.user.id, fullNameCombined);
            } catch (trialErr) {
              console.warn("Trial application notice:", trialErr);
            }
          } catch (profileErr) {
            console.error("Error updating profile fields on signup:", profileErr);
          }
        }
        setSuccess(true);
        setLoading(false);
        setTimeout(() => router.push("/"), 2500);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء إنشاء الحساب.");
      setLoading(false);
    }
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => Math.max(0, prev - 1));
  };

  const nextStep = () => {
    setError("");
    setStep((prev) => prev + 1);
  };

  // Step validity flags
  const isStep1Valid = Boolean(
    formData.firstName.trim().length >= 2 &&
    !fieldErrors.firstName &&
    formData.lastName.trim().length >= 2 &&
    !fieldErrors.lastName &&
    formData.username.trim().length >= 3 &&
    !fieldErrors.username &&
    formData.email.trim() !== "" &&
    !fieldErrors.email &&
    isEmailVerified
  );

  const isStep2Valid = Boolean(
    formData.phone.length === 10 &&
    !fieldErrors.phone
  );

  const isStep3Valid = Boolean(
    formData.dob &&
    formData.governorate &&
    formData.city
  );

  const maxDobDateStr = getMaxDobDateString(6);

  return {
    step,
    setStep,
    prevStep,
    nextStep,
    formData,
    updateField,
    fieldErrors,
    error,
    setError,
    loading,
    success,
    focusedField,
    setFocusedField,
    suggestions,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    showDobConfirmModal,
    setShowDobConfirmModal,
    isEmailVerified,
    emailOtpSent,
    emailOtp,
    emailOtpTimer,
    emailOtpLoading,
    emailOtpError,
    emailCodeDigits,
    emailInputRefs,
    handleEmailDigitChange,
    handleEmailKeyDown,
    handleEmailPaste,
    handleSendEmailOtp,
    handleVerifyEmailOtp,
    handleFileUpload,
    handleStep3Submit,
    handleFinalSubmit,
    pwdRules,
    isPasswordValid,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    maxDobDateStr,
  };
};
