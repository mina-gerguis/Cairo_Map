"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserProfile, UserDevice, MfaFactorsState, MfaStep, PasswordForm, ProfileAlertMessage } from "../types";
import { INITIAL_PASSWORD_FORM } from "../constants";
import { checkPasswordRules } from "../utils";

interface UseProfileSecurityProps {
  user: any;
  profile: UserProfile | null;
  setMessage: (msg: ProfileAlertMessage | null) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useProfileSecurity = ({
  user,
  profile,
  setMessage,
  setGlobalLoading,
}: UseProfileSecurityProps) => {
  const router = useRouter();

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(INITIAL_PASSWORD_FORM);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const deleteString = `أريد حذف حسابي أنا ${profile?.full_name || ""}`;

  // 2FA States
  const [activeMfaFactors, setActiveMfaFactors] = useState<MfaFactorsState>({
    totp: false,
    email: false,
    whatsapp: false,
  });
  const activeCount = Object.values(activeMfaFactors).filter(Boolean).length;
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [mfaStep, setMfaStep] = useState<MfaStep>("selection");
  const [mfaPasswordConfirm, setMfaPasswordConfirm] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState("");

  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Devices States
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [devicesList, setDevicesList] = useState<UserDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [deviceToDeactivate, setDeviceToDeactivate] = useState<{
    deviceId: string;
    sessionId: string;
    isCurrentDevice: boolean;
  } | null>(null);

  const pwdRules = checkPasswordRules(passwordForm.new, passwordForm.confirm);
  const isPasswordValid = Object.values(pwdRules).every(Boolean);

  const fetchMfaStatus = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactor = data?.totp?.[0];
      setActiveMfaFactors((prev) => ({
        ...prev,
        totp: totpFactor && totpFactor.status === "verified" ? true : false,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMfaStatus();
    }
  }, [user]);

  const fetchDevices = async () => {
    if (!supabase || !user) return;
    setLoadingDevices(true);
    try {
      const { data } = await supabase
        .from("user_devices")
        .select("*")
        .order("logged_in_at", { ascending: false });
      if (data) {
        setDevicesList(data);
      }
    } catch (e) {
      console.error("Error fetching devices:", e);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleDeactivateDevice = async (deviceId: string, sessionId: string) => {
    if (!supabase) return;
    const isCurrentDevice = sessionId === localStorage.getItem("dftry_device_session_id");
    setDeviceToDeactivate({ deviceId, sessionId, isCurrentDevice });
  };

  const executeDeactivateDevice = async (
    deviceId: string,
    sessionId: string,
    isCurrentDevice: boolean
  ) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("user_devices")
        .update({
          is_active: false,
          logged_out_at: new Date().toISOString(),
        })
        .eq("id", deviceId);

      if (!error) {
        setDevicesList((prev) =>
          prev.map((d) =>
            d.id === deviceId
              ? { ...d, is_active: false, logged_out_at: new Date().toISOString() }
              : d
          )
        );

        if (isCurrentDevice) {
          setShowDevicesModal(false);
          handleLogout();
        }
      } else {
        alert("فشل تسجيل خروج الجهاز: " + error.message);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    if (!supabase) return;
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: "error", text: "كلمة المرور غير متطابقة" });
      return;
    }
    if (passwordForm.new.length < 6) {
      setMessage({ type: "error", text: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء تغيير كلمة المرور" });
    } else {
      setMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح" });
      setShowPasswordModal(false);
      setPasswordForm(INITIAL_PASSWORD_FORM);
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!supabase || !user) return;
    if (deleteConfirmation !== deleteString) {
      setMessage({ type: "error", text: "عبارة التأكيد غير متطابقة." });
      return;
    }
    setGlobalLoading(true);
    const { error } = await supabase.rpc("delete_user");
    if (error) {
      setMessage({ type: "error", text: "فشل حذف الحساب. يرجى المحاولة لاحقاً." });
      setGlobalLoading(false);
    } else {
      await supabase.auth.signOut();
      router.push("/");
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setGlobalLoading(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...codeDigits];
    newDigits[index] = value.slice(-1);
    setCodeDigits(newDigits);
    setVerificationCode(newDigits.join(""));
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = [...codeDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setCodeDigits(newDigits);
      setVerificationCode(newDigits.join(""));
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleEnrollTOTP = async () => {
    if (!supabase) return;
    setMfaLoading(true);
    setMfaError("");
    try {
      const factorsList = await supabase.auth.mfa.listFactors();
      if (factorsList.data?.all) {
        const unverifiedTotp = factorsList.data.all.filter(
          (f) => f.factor_type === "totp" && f.status === "unverified"
        );
        for (const factor of unverifiedTotp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "ماب القاهرة",
        friendlyName: "Cairo Map",
      });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setMfaSecret(data.totp.secret);
      setCodeDigits(Array(6).fill(""));
      setVerificationCode("");
      setMfaStep("enroll");
    } catch (err: any) {
      setMfaError(err.message || "حدث خطأ أثناء البدء بتفعيل المصادقة");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!supabase || !verificationCode || !factorId) return;
    setMfaLoading(true);
    setMfaError("");
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verificationCode,
      });
      if (verify.error) throw verify.error;

      setActiveMfaFactors((prev) => ({ ...prev, totp: true }));
      setShow2FAModal(false);
      setMfaStep("selection");
      setVerificationCode("");
      setMfaError("");
      setMessage({ type: "success", text: "تم تفعيل المصادقة الثنائية بنجاح!" });
    } catch (err: any) {
      setMfaError("الكود غير صحيح أو انتهت صلاحيته. تأكد من التطبيق وحاول مجدداً.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleUnenrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMfaStep("unenroll_confirm");
    setMfaError("");
    setVerificationCode("");
    setCodeDigits(Array(6).fill(""));
    setMfaPasswordConfirm("");
  };

  const handleUnenrollTOTP = async () => {
    if (!supabase || !profile) return;
    if (verificationCode.length !== 6 || !mfaPasswordConfirm) return;
    setMfaLoading(true);
    setMfaError("");
    try {
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        { auth: { persistSession: false } }
      );

      const { error: signInError } = await tempSupabase.auth.signInWithPassword({
        email: profile.email || "",
        password: mfaPasswordConfirm,
      });

      if (signInError) throw new Error("كلمة المرور غير صحيحة");

      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactor = data.totp?.[0];
      if (!totpFactor) throw new Error("لا يوجد عامل مصادقة مفعل");

      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: verificationCode,
      });
      if (verify.error) throw new Error("الكود غير صحيح");

      const unenroll = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
      if (unenroll.error) throw unenroll.error;

      setActiveMfaFactors((prev) => ({ ...prev, totp: false }));
      setMfaStep("selection");
      setVerificationCode("");
      setMfaPasswordConfirm("");
      setMessage({ type: "success", text: "تم تعطيل المصادقة عبر التطبيق بنجاح" });
    } catch (err: any) {
      setMfaError(
        err.message === "الكود غير صحيح"
          ? "الكود غير صحيح أو انتهت صلاحيته"
          : err.message || "حدث خطأ أثناء إلغاء التفعيل"
      );
    } finally {
      setMfaLoading(false);
    }
  };

  return {
    showPasswordModal,
    setShowPasswordModal,
    passwordForm,
    setPasswordForm,
    passwordLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    pwdRules,
    isPasswordValid,
    showDeleteModal,
    setShowDeleteModal,
    showLogoutModal,
    setShowLogoutModal,
    deleteConfirmation,
    setDeleteConfirmation,
    deleteString,
    activeMfaFactors,
    activeCount,
    show2FAModal,
    setShow2FAModal,
    mfaStep,
    setMfaStep,
    mfaPasswordConfirm,
    setMfaPasswordConfirm,
    qrCode,
    mfaSecret,
    codeDigits,
    inputRefs,
    mfaLoading,
    mfaError,
    setMfaError,
    verificationCode,
    setVerificationCode,
    showDevicesModal,
    setShowDevicesModal,
    devicesList,
    loadingDevices,
    deviceToDeactivate,
    setDeviceToDeactivate,
    fetchDevices,
    handleDeactivateDevice,
    executeDeactivateDevice,
    handleChangePassword,
    handleDeleteAccount,
    handleLogout,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    handleEnrollTOTP,
    handleVerifyTOTP,
    handleUnenrollClick,
    handleUnenrollTOTP,
  };
};
