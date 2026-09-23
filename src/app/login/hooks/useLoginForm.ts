"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { LoginStep, FocusedField, UseLoginFormReturn } from "../types";
import { LOGIN_MESSAGES } from "../constants";
import { isEmailAddress, cleanUsername, isSuspendedNoticePresent, clearSuspensionNotice } from "../utils";

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

  // 2. Check if redirected due to account suspension notice
  useEffect(() => {
    if (isSuspendedNoticePresent()) {
      setError(LOGIN_MESSAGES.ACCOUNT_SUSPENDED);
      clearSuspensionNotice();
    }
  }, []);

  // 3. Handle pending MFA on initial page load / refresh
  useEffect(() => {
    const initMfaStep = async () => {
      if (!supabase) return;
      try {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
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
  }, []);

  // Handle individual digit input in MFA
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
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
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste in MFA inputs
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
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

    // Normal successful login
    router.push("/");
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
      router.push("/");
    }
  };

  // Cancel MFA & reset back to credentials step
  const handleCancelMfa = async () => {
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
    error,
    setError,
    mfaCode,
    codeDigits,
    inputRefs,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    handleLogin,
    handleVerifyMfa,
    handleCancelMfa,
  };
};
