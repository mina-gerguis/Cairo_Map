"use client";

import React from "react";
import Link from "next/link";
import DriftWall from "@/components/ui/ElasticMesh";
import { DRIFT_WALL_ITEMS } from "@/app/login/constants";
import { FORGOT_PASSWORD_TEXTS, FORGOT_PASSWORD_MESSAGES } from "./constants";
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
          <h1 className="mb-2 text-black">{FORGOT_PASSWORD_TEXTS.TITLE}</h1>
          <p className="text-muted">{FORGOT_PASSWORD_TEXTS.SUBTITLE}</p>
        </div>

        {/* Glassmorphic Card */}
        <div className={styles.glassCard}>
          {/* Error Banner (shown for non-blocked regular errors) */}
          {form.error && !form.isBlocked && (
            <div className="error" role="alert">
              <span>{form.error}</span>
            </div>
          )}

          {form.isBlocked ? (
            /* Blocked State Screen */
            <div className={styles.blockedContainer}>
              <div className={styles.blockedIconWrapper}>
                <i className="bx bx-shield-x" />
              </div>
              <h2 className={styles.blockedTitle}>{FORGOT_PASSWORD_TEXTS.BLOCKED_TITLE}</h2>
              <p className={styles.blockedDesc}>
                {form.error || FORGOT_PASSWORD_MESSAGES.RATE_LIMIT_BLOCKED}
              </p>

              <div className={styles.blockedActions}>
                <Link href="/contact" className={styles.contactSupportBtn}>
                  <i className="bx bx-support" style={{ fontSize: "1.2rem" }} />
                  <span>{FORGOT_PASSWORD_TEXTS.CONTACT_SUPPORT_BTN}</span>
                </Link>

                <Link href="/login" className={styles.backToLoginBtn}>
                  <i className="bx bx-arrow-back" style={{ fontSize: "1.1rem" }} />
                  <span>{FORGOT_PASSWORD_TEXTS.BACK_TO_LOGIN}</span>
                </Link>
              </div>
            </div>
          ) : !form.success ? (
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
                    disabled={form.loading || form.isBlocked}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={form.loading || !form.identifier.trim() || form.isBlocked}
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
              <h2 className={styles.successTitle}>{FORGOT_PASSWORD_TEXTS.SUCCESS_TITLE}</h2>
              <p className={styles.successDesc}>
                {FORGOT_PASSWORD_TEXTS.SUCCESS_DESC}
                {form.sentEmail && (
                  <>
                    <br />
                    <span className={styles.emailHighlight}>{form.sentEmail}</span>
                  </>
                )}
              </p>
              <div className={styles.successNote}>
                 {FORGOT_PASSWORD_TEXTS.SUCCESS_NOTE}
              </div>

              <button
                type="button"
                onClick={form.handleResend}
                disabled={form.countdown > 0 || form.loading || form.isBlocked}
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
          {!form.success && !form.isBlocked && (
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
