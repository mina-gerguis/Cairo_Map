"use client";

import React from "react";
import Link from "next/link";
import DriftWall from "@/components/ui/ElasticMesh";
import { DRIFT_WALL_ITEMS } from "@/app/login/constants";
import { FORGOT_PASSWORD_TEXTS } from "./constants";
import { useForgotPasswordForm } from "./hooks/useForgotPasswordForm";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const form = useForgotPasswordForm();

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
              src="/images/logo/darkMode_logo.webp"
              alt="ماب القاهرة"
              className={styles.logoImgDark}
            />
            <img
              src="/images/logo/lightMode_logo.webp"
              alt="ماب القاهرة"
              className={styles.logoImgLight}
            />
          </div>
          <h1 className={styles.title}>{FORGOT_PASSWORD_TEXTS.TITLE}</h1>
          <p className={styles.subtitle}>{FORGOT_PASSWORD_TEXTS.SUBTITLE}</p>
        </div>

        {/* Glassmorphic Card */}
        <div className={styles.glassCard}>
          {/* Error Banner */}
          {form.error && (
            <div className={styles.errorBanner} role="alert">
              <span>⚠️</span>
              <span>{form.error}</span>
            </div>
          )}

          {!form.success ? (
            /* Input Form */
            <form onSubmit={form.handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="identifier" className={styles.label}>
                  <i className="bx bx-envelope" style={{ fontSize: "1rem" }} />
                  {FORGOT_PASSWORD_TEXTS.IDENTIFIER_LABEL}
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={form.identifier}
                    onChange={(e) => form.setIdentifier(e.target.value)}
                    onFocus={() => form.setFocusedField(true)}
                    onBlur={() => form.setFocusedField(false)}
                    placeholder={FORGOT_PASSWORD_TEXTS.IDENTIFIER_PLACEHOLDER}
                    className={`${styles.input} ${form.focusedField ? styles.inputFocused : ""}`}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={form.loading || !form.identifier.trim()}
                className={styles.submitBtn}
              >
                {form.loading ? (
                  <>
                    <div className={styles.spinner} />
                    <span>{FORGOT_PASSWORD_TEXTS.SUBMIT_LOADING}</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-paper-plane" style={{ fontSize: "1.1rem" }} />
                    <span>{FORGOT_PASSWORD_TEXTS.SUBMIT_BTN}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success Confirmation Screen */
            <div className={styles.successContainer}>
              <div className={styles.successIconWrapper}>
                <i className="bx bx-mail-send" />
              </div>
              <h2 className={styles.successTitle}>{FORGOT_PASSWORD_TEXTS.SUCCESS_TITLE}</h2>
              <p className={styles.successDesc}>
                تم إرسال رابط استعادة كلمة المرور إلى:
                <br />
                <span className={styles.emailHighlight}>{form.sentEmail}</span>
              </p>
              <div className={styles.successNote}>
                ℹ️ {FORGOT_PASSWORD_TEXTS.SUCCESS_NOTE}
              </div>

              <button
                type="button"
                onClick={form.handleResend}
                disabled={form.countdown > 0 || form.loading}
                className={styles.resendBtn}
              >
                <i className="bx bx-refresh" style={{ fontSize: "1.2rem" }} />
                <span>
                  {form.countdown > 0
                    ? `${FORGOT_PASSWORD_TEXTS.RESEND_BTN} (${form.countdown} ثانية)`
                    : FORGOT_PASSWORD_TEXTS.RESEND_BTN}
                </span>
              </button>

              <Link href="/login" className={styles.backToLoginBtn}>
                <i className="bx bx-arrow-back" style={{ fontSize: "1.1rem" }} />
                <span>{FORGOT_PASSWORD_TEXTS.BACK_TO_LOGIN}</span>
              </Link>
            </div>
          )}

          {/* Bottom Login Link */}
          {!form.success && (
            <div className={styles.footerLinkWrapper}>
              <span>{FORGOT_PASSWORD_TEXTS.REMEMBER_PASSWORD}</span>{" "}
              <Link href="/login" className={styles.loginLink}>
                {FORGOT_PASSWORD_TEXTS.LOGIN_LINK}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
