"use client";

import React from "react";
import Link from "next/link";
import DriftWall from "@/components/ui/ElasticMesh";
import { DRIFT_WALL_ITEMS } from "@/app/login/constants";
import { RESET_PASSWORD_TEXTS } from "./constants";
import { useResetPasswordForm } from "./hooks/useResetPasswordForm";
import styles from "./reset-password.module.css";

export default function ResetPasswordPage() {
  const form = useResetPasswordForm();

  const rulesList = [
    { ok: form.pwdRules.length, label: "من 8 إلى 32 حرف" },
    { ok: form.pwdRules.upper, label: "حرف كبير (A-Z)" },
    { ok: form.pwdRules.lower, label: "حرف صغير (a-z)" },
    { ok: form.pwdRules.number, label: "رقم (0-9)" },
    { ok: form.pwdRules.special, label: "رمز خاص (@$!...)" },
    { ok: form.pwdRules.match, label: "كلمتا المرور متطابقتان" },
  ];

  return (
    <div className={styles.layout}>
      {/* Background Interactive Mesh Layer */}
      <div className={styles.driftWallWrapper}>
        <DriftWall
          items={DRIFT_WALL_ITEMS}
          columns={5}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.55}
          overlayColor="#060010"
          radius={14}
          roll={0}
          pauseOnHover={false}
          grayscale={false}
        />
      </div>

      {/* Ambient Radial Glow Orbs */}
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />

      {/* Main Container */}
      <div className={styles.formContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img
              src="/images/logo/darkMode_logo.png"
              alt="ماب القاهرة"
              className={styles.logoImgDark}
            />
            <img
              src="/images/logo/lightMode_logo.png"
              alt="ماب القاهرة"
              className={styles.logoImgLight}
            />
          </div>
          <h1 className={styles.title}>{RESET_PASSWORD_TEXTS.TITLE}</h1>
          <p className={styles.subtitle}>{RESET_PASSWORD_TEXTS.SUBTITLE}</p>
        </div>

        {/* Glassmorphic Card */}
        <div className={styles.glassCard}>
          {form.checkingSession ? (
            /* Loading State */
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} style={{ width: "32px", height: "32px", borderWidth: "3px" }} />
              <span>جاري التحقق من صلاحية الرابط...</span>
            </div>
          ) : form.isSuccess ? (
            /* Success State */
            <div className={styles.statusContainer}>
              <div className={styles.successIconWrapper}>
                <i className="bx bx-check-circle" />
              </div>
              <h2 className={styles.statusTitle}>{RESET_PASSWORD_TEXTS.SUCCESS_TITLE}</h2>
              <p className={styles.statusDesc}>{RESET_PASSWORD_TEXTS.SUCCESS_DESC}</p>
              
              <div className={styles.redirectBadge}>
                <i className="bx bx-time" />
                <span>
                  {RESET_PASSWORD_TEXTS.REDIRECT_NOTE} {form.redirectCountdown} {RESET_PASSWORD_TEXTS.SECONDS}
                </span>
              </div>

              <Link href="/login" className={styles.actionBtn}>
                <i className="bx bx-log-in" style={{ fontSize: "1.2rem" }} />
                <span>{RESET_PASSWORD_TEXTS.LOGIN_NOW_BTN}</span>
              </Link>
            </div>
          ) : !form.hasValidSession ? (
            /* Expired / Invalid Session State */
            <div className={styles.statusContainer}>
              <div className={styles.warningIconWrapper}>
                <i className="bx bx-error-circle" />
              </div>
              <h2 className={styles.statusTitle}>الرابط غير صالح أو منتهي</h2>
              <p className={styles.statusDesc}>
                عفواً، رابط إعادة تعيين كلمة المرور غير صالح أو انتهت مدة صلاحيته. يرجى طلب رابط استعادة جديد للمتابعة.
              </p>

              <Link href="/forgot-password" className={styles.actionBtn}>
                <i className="bx bx-refresh" style={{ fontSize: "1.2rem" }} />
                <span>{RESET_PASSWORD_TEXTS.REQUEST_NEW_LINK_BTN}</span>
              </Link>

              <Link href="/login" className={styles.secondaryBtn}>
                <i className="bx bx-arrow-back" />
                <span>{RESET_PASSWORD_TEXTS.BACK_TO_LOGIN}</span>
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={form.handleSubmit} className={styles.form}>
              {/* Error Banner */}
              {form.error && (
                <div className={styles.errorBanner} role="alert">
                  <span>⚠️</span>
                  <span>{form.error}</span>
                </div>
              )}

              {/* New Password Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="resetPassword" className={styles.label}>
                  <i className="bx bx-lock-alt" style={{ fontSize: "1rem" }} />
                  {RESET_PASSWORD_TEXTS.NEW_PASSWORD}
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="resetPassword"
                    type={form.showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => form.setPassword(e.target.value)}
                    onFocus={() => form.setFocusedField("password")}
                    onBlur={() => form.setFocusedField(null)}
                    placeholder="••••••••"
                    className={`${styles.input} ${form.focusedField === "password" ? styles.inputFocused : ""}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => form.setShowPassword(!form.showPassword)}
                    className={styles.togglePasswordBtn}
                    aria-label={form.showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    <i className={form.showPassword ? "bx bx-hide" : "bx bx-show"} />
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="confirmResetPassword" className={styles.label}>
                  <i className="bx bx-check-shield" style={{ fontSize: "1rem" }} />
                  {RESET_PASSWORD_TEXTS.CONFIRM_PASSWORD}
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmResetPassword"
                    type={form.showConfirmPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => form.setConfirmPassword(e.target.value)}
                    onFocus={() => form.setFocusedField("confirmPassword")}
                    onBlur={() => form.setFocusedField(null)}
                    placeholder="••••••••"
                    className={`${styles.input} ${form.focusedField === "confirmPassword" ? styles.inputFocused : ""}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => form.setShowConfirmPassword(!form.showConfirmPassword)}
                    className={styles.togglePasswordBtn}
                    aria-label={form.showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    <i className={form.showConfirmPassword ? "bx bx-hide" : "bx bx-show"} />
                  </button>
                </div>
              </div>

              {/* Rules Checklist */}
              <div className={styles.rulesBox}>
                {rulesList.map(({ ok, label }) => (
                  <div
                    key={label}
                    className={`${styles.ruleItem} ${ok ? styles.ruleValid : styles.ruleInvalid}`}
                  >
                    <i className={`bx ${ok ? "bxs-check-circle" : "bx-radio-circle"} ${styles.ruleIcon}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={form.loading || !form.isPasswordValid}
                className={styles.submitBtn}
              >
                {form.loading ? (
                  <>
                    <div className={styles.spinner} />
                    <span>{RESET_PASSWORD_TEXTS.SUBMIT_LOADING}</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-check" style={{ fontSize: "1.2rem" }} />
                    <span>{RESET_PASSWORD_TEXTS.SUBMIT_BTN}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
