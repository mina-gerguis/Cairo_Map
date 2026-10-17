"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial IP and local storage rate limit check with 24-hour expiration
  useEffect(() => {
    const WINDOW_MS = 24 * 60 * 60 * 1000;

    if (typeof window !== "undefined") {
      const storedBlocked = localStorage.getItem("cairomap_forgot_pwd_blocked");
      const storedBlockedAt = localStorage.getItem("cairomap_forgot_pwd_blocked_at");
      const now = Date.now();

      if (storedBlocked === "true") {
        if (storedBlockedAt && now - Number(storedBlockedAt) > WINDOW_MS) {
          // 24 hours have passed! Automatically unblock
          localStorage.removeItem("cairomap_forgot_pwd_blocked");
          localStorage.removeItem("cairomap_forgot_pwd_blocked_at");
          setIsBlocked(false);
          setError("");
        } else {
          setIsBlocked(true);
          setError(FORGOT_PASSWORD_MESSAGES.RATE_LIMIT_BLOCKED);
        }
      }
    }

    // Verify with server IP rate limit status
    fetch("/api/auth/forgot-password")
      .then((res) => res.json())
      .then((data) => {
        if (data?.blocked) {
          setIsBlocked(true);
          setError(FORGOT_PASSWORD_MESSAGES.RATE_LIMIT_BLOCKED);
          if (typeof window !== "undefined") {
            localStorage.setItem("cairomap_forgot_pwd_blocked", "true");
            if (!localStorage.getItem("cairomap_forgot_pwd_blocked_at")) {
              localStorage.setItem("cairomap_forgot_pwd_blocked_at", String(Date.now()));
            }
          }
        } else {
          // If server reports not blocked (24 hours passed or user logged in), clear local lock
          setIsBlocked(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("cairomap_forgot_pwd_blocked");
            localStorage.removeItem("cairomap_forgot_pwd_blocked_at");
          }
        }
        if (typeof data?.remaining === "number") {
          setAttemptsRemaining(data.remaining);
        }
      })
      .catch(() => {
        // Silent fallback
      });
  }, []);

  // 2. Countdown timer for resending
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
    if (isBlocked) {
      setError(FORGOT_PASSWORD_MESSAGES.RATE_LIMIT_BLOCKED);
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
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      // Check if IP is blocked after 3 attempts or 429
      if (data?.blocked || res.status === 429) {
        setIsBlocked(true);
        setAttemptsRemaining(0);
        setError(data?.error || FORGOT_PASSWORD_MESSAGES.RATE_LIMIT_BLOCKED);
        if (typeof window !== "undefined") {
          localStorage.setItem("cairomap_forgot_pwd_blocked", "true");
          localStorage.setItem("cairomap_forgot_pwd_blocked_at", String(Date.now()));
        }
        return;
      }

      if (!res.ok || !data?.success) {
        setError(data?.error || FORGOT_PASSWORD_MESSAGES.SEND_ERROR);
        return;
      }

      if (typeof data?.attemptsRemaining === "number") {
        setAttemptsRemaining(data.attemptsRemaining);
      }

      setSentEmail(trimmed);
      setSuccess(true);
      setCountdown(60);
    } catch (err: any) {
      console.error("Forgot password client error:", err);
      setError(FORGOT_PASSWORD_MESSAGES.SEND_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendResetEmail(identifier);
  };

  const handleResend = async () => {
    if (countdown > 0 || loading || isBlocked) return;
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
    isBlocked,
    attemptsRemaining,
  };
};
