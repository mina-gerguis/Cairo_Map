"use client";

import React from "react";
import { useLoginForm } from "./hooks";
import {
  LoginLayout,
  LoginGlassCard,
  LoginHeader,
  CredentialsForm,
  MfaVerificationForm,
  LoginFooterLinks,
  LoginLegalNote,
} from "./components";
import styles from "./login.module.css";

export default function LoginPage() {
  const form = useLoginForm();

  return (
    <LoginLayout>
      {/* Brand Header & Titles */}
      <LoginHeader />

      {/* Glassmorphic Form Card */}
      <LoginGlassCard>
        {/* Error Notification Banner */}
        {form.error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠️</span>
            <span>{form.error}</span>
          </div>
        )}

        {/* Step 1: Credentials (Username/Email & Password) */}
        {form.loginStep === "credentials" ? (
          <CredentialsForm
            email={form.email}
            setEmail={form.setEmail}
            password={form.password}
            setPassword={form.setPassword}
            showPassword={form.showPassword}
            setShowPassword={form.setShowPassword}
            keepSignedIn={form.keepSignedIn}
            setKeepSignedIn={form.setKeepSignedIn}
            focusedField={form.focusedField}
            setFocusedField={form.setFocusedField}
            loading={form.loading}
            onSubmit={form.handleLogin}
          />
        ) : (
          /* Step 2: Two-Factor Authentication (MFA) */
          <MfaVerificationForm
            mfaCode={form.mfaCode}
            codeDigits={form.codeDigits}
            inputRefs={form.inputRefs}
            loading={form.loading}
            onDigitChange={form.handleDigitChange}
            onKeyDown={form.handleKeyDown}
            onPaste={form.handlePaste}
            onSubmit={form.handleVerifyMfa}
            onCancel={form.handleCancelMfa}
          />
        )}

        {/* Links to Signup & Guest Entry */}
        <LoginFooterLinks />
      </LoginGlassCard>

      {/* Terms and Privacy Policy Note */}
      <LoginLegalNote />
    </LoginLayout>
  );
}
