"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { LoginStep, FocusedField, UseLoginFormReturn } from "../types";
import { LOGIN_MESSAGES } from "../constants";
import { isEmailAddress, cleanUsername, isSuspendedNoticePresent, clearSuspensionNotice } from "../utils";
import { isPasskeySupported, loginWithPasskey, isSessionPasskeyAuthenticated, setPasskeyAuthenticated, clearPasskeyAuthentication } from "@/lib/passkey";

export const useLoginForm = (): UseLoginFormReturn => {
  const router = useRouter();
  const { user, mfaPending } = useAuth();

  // Form input state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(true);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  // Status & Feedback state
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [facebookLoading, setFacebookLoading] = useState<boolean>(false);
  const [passkeyLoading, setPasskeyLoading] = useState<boolean>(false);
  const [hasPasskeySupport, setHasPasskeySupport] = useState<boolean>(false);

  // Check Passkey/WebAuthn availability on mount
  useEffect(() => {
    isPasskeySupported().then((supported) => {
      setHasPasskeySupport(supported);
    });
  }, []);

  // MFA state
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [mfaCode, setMfaCode] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Auto-redirect if already fully authenticated
  useEffect(() => {
    if (user && !mfaPending) {
      if (isSuspendedNoticePresent()) {
        return;
      }
      router.push("/");
    }
  }, [user, mfaPending, router]);

  // 2. Check if redirected due to account suspension notice or OAuth errors
  useEffect(() => {
    if (isSuspendedNoticePresent()) {
      setError(LOGIN_MESSAGES.ACCOUNT_SUSPENDED);
      clearSuspensionNotice();
    } else if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        if (urlError === "oauth_failed") {
          setError("فشل تسجيل الدخول باستخدام Google، يرجى المحاولة مرة أخرى.");
        } else {
          try {
            setError(decodeURIComponent(urlError));
          } catch {
            setError(urlError);
          }
        }
      }
    }
  }, []);

  // 3. Handle pending MFA on initial page load / refresh
  useEffect(() => {
    const initMfaStep = async () => {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        const hasWebAuthn = aalData?.currentAuthenticationMethods?.some((m: any) => {
          const methodStr = typeof m === "string" ? m : m?.method;
          return typeof methodStr === "string" && (methodStr.includes("webauthn") || methodStr.includes("passkey"));
        });

        if (isSessionPasskeyAuthenticated(session?.user?.id) || hasWebAuthn) {
          // User authenticated via Passkey - skip MFA step and redirect to home
          router.push("/");
          return;
        }

        if (aalData && aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totpFactor = factors?.totp?.[0];
          if (totpFactor && totpFactor.status === "verified") {
            setFactorId(totpFactor.id);
            const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
            if (challenge.data) {
              setChallengeId(challenge.data.id);
              setLoginStep("mfa");
            }
          }
        }
      } catch (err) {
        console.error("MFA init error:", err);
      }
    };
    initMfaStep();
  }, [router]);

  // Handle individual digit input in MFA
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (error) setError("");
    const newDigits = [...codeDigits];
    newDigits[index] = value.slice(-1);
    setCodeDigits(newDigits);
    setMfaCode(newDigits.join(""));
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in MFA
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (error) setError("");
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste in MFA inputs
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (error) setError("");
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = [...codeDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setCodeDigits(newDigits);
      setMfaCode(newDigits.join(""));
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Primary Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearPasskeyAuthentication();
    if (!supabase) {
      setError(LOGIN_MESSAGES.DB_NOT_CONFIGURED);
      return;
    }

    setLoading(true);
    setError("");

    let loginEmail = email.trim();
    const isEmail = isEmailAddress(loginEmail);

    if (!isEmail) {
      const cleaned = cleanUsername(loginEmail);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email, is_suspended")
        .eq("username", cleaned)
        .maybeSingle();

      if (profileError || !profileData?.email) {
        setError(LOGIN_MESSAGES.INVALID_USER_OR_PWD);
        setLoading(false);
        return;
      }

      if (profileData.is_suspended) {
        setError(LOGIN_MESSAGES.ACCOUNT_SUSPENDED);
        setLoading(false);
        return;
      }

      loginEmail = profileData.email;
    } else {
      // Pre-check if email belongs to a suspended account
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("email", loginEmail)
        .maybeSingle();

      if (profileData?.is_suspended) {
        setError(LOGIN_MESSAGES.ACCOUNT_SUSPENDED);
        setLoading(false);
        return;
      }
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      setError(LOGIN_MESSAGES.INVALID_CREDENTIALS);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check if user's account is suspended
      const { data: profCheck } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profCheck?.is_suspended) {
        await supabase.auth.signOut();
        setError(LOGIN_MESSAGES.ACCOUNT_SUSPENDED);
        setLoading(false);
        return;
      }

      // Check MFA requirement
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (totpFactor && totpFactor.status === "verified") {
        setFactorId(totpFactor.id);
        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (challenge.data) {
          setChallengeId(challenge.data.id);
          setLoginStep("mfa");
          setLoading(false);
          return;
        }
        setError(LOGIN_MESSAGES.MFA_SETUP_ERROR);
        setLoading(false);
        return;
      }
    }

    // Clear forgot password attempts lock upon successful login
    if (typeof window !== "undefined") {
      localStorage.removeItem("cairomap_forgot_pwd_blocked");
      localStorage.removeItem("cairomap_forgot_pwd_blocked_at");
    }
    fetch("/api/auth/forgot-password", { method: "DELETE" }).catch(() => {});

    // Normal successful login
    router.push("/");
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError(LOGIN_MESSAGES.DB_NOT_CONFIGURED);
      return;
    }

    try {
      setGoogleLoading(true);
      setError("");

      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message || LOGIN_MESSAGES.GOOGLE_LOGIN_ERROR);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || LOGIN_MESSAGES.GOOGLE_LOGIN_ERROR);
      setGoogleLoading(false);
    }
  };

  // Facebook OAuth Login
  const handleFacebookLogin = async () => {
    if (!supabase) {
      setError(LOGIN_MESSAGES.DB_NOT_CONFIGURED);
      return;
    }

    try {
      setFacebookLoading(true);
      setError("");

      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        setError(oauthError.message || LOGIN_MESSAGES.FACEBOOK_LOGIN_ERROR);
        setFacebookLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || LOGIN_MESSAGES.FACEBOOK_LOGIN_ERROR);
      setFacebookLoading(false);
    }
  };

  // Passkey (Face ID / Touch ID) Login
  const handlePasskeyLogin = async () => {
    if (!supabase) {
      setError(LOGIN_MESSAGES.DB_NOT_CONFIGURED);
      return;
    }

    try {
      setPasskeyLoading(true);
      setError("");

      const res = await loginWithPasskey();

      if (res.cancelled) {
        setPasskeyLoading(false);
        return;
      }

      if (!res.success || !res.data?.user) {
        setError(res.error || LOGIN_MESSAGES.PASSKEY_LOGIN_ERROR);
        setPasskeyLoading(false);
        return;
      }

      setPasskeyAuthenticated(res.data.user.id);

      // Check account suspension
      const { data: profCheck } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("id", res.data.user.id)
        .maybeSingle();

      if (profCheck?.is_suspended) {
        await supabase.auth.signOut();
        setError(LOGIN_MESSAGES.ACCOUNT_SUSPENDED);
        setPasskeyLoading(false);
        return;
      }

      // Successfully authenticated with Passkey!
      router.push("/");
    } catch (err: any) {
      setError(err?.message || LOGIN_MESSAGES.PASSKEY_LOGIN_ERROR);
      setPasskeyLoading(false);
    }
  };

  // MFA Code Verification Submission
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !factorId || !challengeId) return;

    setLoading(true);
    setError("");

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: mfaCode,
    });

    if (verify.error) {
      setError(LOGIN_MESSAGES.MFA_INVALID_CODE);
      setLoading(false);
    } else {
      if (verify.data?.user) {
        const { data: profCheck } = await supabase
          .from("profiles")
          .select("is_suspended")
          .eq("id", verify.data.user.id)
          .maybeSingle();

        if (profCheck?.is_suspended) {
          await supabase.auth.signOut();
          setError(LOGIN_MESSAGES.ACCOUNT_SUSPENDED);
          setLoading(false);
          return;
        }
      }

      // Clear forgot password attempts lock upon successful login
      if (typeof window !== "undefined") {
        localStorage.removeItem("cairomap_forgot_pwd_blocked");
        localStorage.removeItem("cairomap_forgot_pwd_blocked_at");
      }
      fetch("/api/auth/forgot-password", { method: "DELETE" }).catch(() => {});

      router.push("/");
    }
  };

  // Cancel MFA & reset back to credentials step
  const handleCancelMfa = async () => {
    clearPasskeyAuthentication();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setLoginStep("credentials");
    setMfaCode("");
    setCodeDigits(Array(6).fill(""));
    setError("");
  };

  return {
    loginStep,
    setLoginStep,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    keepSignedIn,
    setKeepSignedIn,
    focusedField,
    setFocusedField,
    loading,
    googleLoading,
    facebookLoading,
    passkeyLoading,
    hasPasskeySupport,
    error,
    setError,
    mfaCode,
    codeDigits,
    inputRefs,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
    handlePasskeyLogin,
    handleVerifyMfa,
    handleCancelMfa,
  };
};
