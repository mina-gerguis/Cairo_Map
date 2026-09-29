"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RESET_PASSWORD_MESSAGES } from "../constants";
import { PasswordRules, FocusedResetField, UseResetPasswordFormReturn } from "../types";

export const checkResetPasswordRules = (password: string, confirmPassword: string): PasswordRules => {
  return {
    length: password.length >= 8 && password.length <= 32,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#^]/.test(password),
    match: password === confirmPassword && password !== "",
  };
};

export const useResetPasswordForm = (): UseResetPasswordFormReturn => {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<FocusedResetField>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(4);

  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Listen for Supabase session and recovery events
  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      setHasValidSession(false);
      return;
    }

    let isMounted = true;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        setHasValidSession(true);
        setCheckingSession(false);
      }
    });

    // Listen to auth state changes (e.g. PASSWORD_RECOVERY event or SIGNED_IN)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasValidSession(true);
        setCheckingSession(false);
      }
    });

    // Timeout safety fallback: if no session or event detected in 3 seconds
    const timeout = setTimeout(() => {
      if (isMounted) {
        setCheckingSession(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // 2. Countdown redirect on success
  useEffect(() => {
    if (isSuccess && redirectCountdown > 0) {
      redirectTimerRef.current = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && redirectCountdown === 0) {
      router.push("/login");
    }
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [isSuccess, redirectCountdown, router]);

  const pwdRules = checkResetPasswordRules(password, confirmPassword);
  const isPasswordValid = Object.values(pwdRules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setError(RESET_PASSWORD_MESSAGES.DB_NOT_CONFIGURED);
      return;
    }

    if (!hasValidSession) {
      setError(RESET_PASSWORD_MESSAGES.NO_SESSION);
      return;
    }

    if (password !== confirmPassword) {
      setError(RESET_PASSWORD_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    if (!isPasswordValid) {
      setError(RESET_PASSWORD_MESSAGES.PASSWORD_INVALID);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || RESET_PASSWORD_MESSAGES.UPDATE_ERROR);
        setLoading(false);
        return;
      }

      // Successful password change
      setIsSuccess(true);
      setRedirectCountdown(4);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err?.message || RESET_PASSWORD_MESSAGES.UPDATE_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return {
    checkingSession,
    hasValidSession,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    focusedField,
    setFocusedField,
    loading,
    error,
    setError,
    isSuccess,
    pwdRules,
    isPasswordValid,
    redirectCountdown,
    handleSubmit,
  };
};
