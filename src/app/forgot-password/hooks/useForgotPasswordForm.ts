"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { FORGOT_PASSWORD_MESSAGES } from "../constants";
import { UseForgotPasswordFormReturn } from "../types";

export const useForgotPasswordForm = (): UseForgotPasswordFormReturn => {
  const [identifier, setIdentifier] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [sentEmail, setSentEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [focusedField, setFocusedField] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const sendResetEmail = async (targetIdentifier: string) => {
    if (!supabase) {
      setError(FORGOT_PASSWORD_MESSAGES.DB_NOT_CONFIGURED);
      return;
    }

    const trimmed = targetIdentifier.trim();
    if (!trimmed) {
      setError(FORGOT_PASSWORD_MESSAGES.EMPTY_IDENTIFIER);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let targetEmail = trimmed;
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

      if (!isEmail) {
        // Look up by username
        const cleanUsername = trimmed.replace(/^@+/, "").toLowerCase().trim();
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("email, is_suspended")
          .eq("username", cleanUsername)
          .maybeSingle();

        if (profileError || !profileData?.email) {
          setError(FORGOT_PASSWORD_MESSAGES.USER_NOT_FOUND);
          setLoading(false);
          return;
        }

        if (profileData.is_suspended) {
          setError(FORGOT_PASSWORD_MESSAGES.ACCOUNT_SUSPENDED);
          setLoading(false);
          return;
        }

        targetEmail = profileData.email;
      } else {
        // Pre-check if email is suspended
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_suspended")
          .eq("email", targetEmail)
          .maybeSingle();

        if (profileData?.is_suspended) {
          setError(FORGOT_PASSWORD_MESSAGES.ACCOUNT_SUSPENDED);
          setLoading(false);
          return;
        }
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo,
      });

      if (resetError) {
        if (
          resetError.message.toLowerCase().includes("rate limit") ||
          resetError.message.toLowerCase().includes("security purposes") ||
          resetError.status === 429
        ) {
          setError(FORGOT_PASSWORD_MESSAGES.RATE_LIMIT);
        } else {
          setError(resetError.message || FORGOT_PASSWORD_MESSAGES.SEND_ERROR);
        }
        setLoading(false);
        return;
      }

      setSentEmail(targetEmail);
      setSuccess(true);
      setCountdown(60);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err?.message || FORGOT_PASSWORD_MESSAGES.SEND_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendResetEmail(identifier);
  };

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    await sendResetEmail(sentEmail || identifier);
  };

  return {
    identifier,
    setIdentifier,
    loading,
    error,
    setError,
    success,
    sentEmail,
    countdown,
    focusedField,
    setFocusedField,
    handleSubmit,
    handleResend,
  };
};
