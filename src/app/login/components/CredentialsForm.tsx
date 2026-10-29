import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, ScanFace } from "lucide-react";
import { CredentialsFormProps } from "../types";
import { LOGIN_TEXTS } from "../constants";
import styles from "../login.module.css";

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </svg>
);


export const CredentialsForm: React.FC<CredentialsFormProps> = ({
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
  googleLoading,
  onGoogleLogin,
  facebookLoading,
  onFacebookLogin,
  passkeyLoading,
  hasPasskeySupport,
  onPasskeyLogin,
  onSubmit,
}) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (error) {
      setIsShaking(true);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch {
          // Ignore if vibration is restricted
        }
      }
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {/* Inputs container with shake animation on error */}
      <div className={`${styles.fieldsShakeContainer} ${isShaking ? styles.shake : ""}`}>
        {/* Email / Username Field */}
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            <div className={styles.labelLeft}>
              <span>{LOGIN_TEXTS.USERNAME_OR_EMAIL}</span>
              <span className={styles.requiredAsterisk}>*</span>
            </div>
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="name@example.com"
              className={`${styles.input} ${error ? styles.inputError : ""} ${focusedField === "email" ? styles.inputFocused : ""}`}
              autoComplete="username"
              aria-invalid={Boolean(error)}
              autoFocus
            />
          </div>
        </div>

        {/* Password Field */}
        <div className={styles.fieldGroup}>
          <div className={styles.label}>
            <div className={styles.labelLeft}>
              <span>{LOGIN_TEXTS.PASSWORD}</span>
              <span className={styles.requiredAsterisk}>*</span>
            </div>
            <Link href="/forgot-password" className={styles.forgotPasswordLink}>
              {LOGIN_TEXTS.FORGOT_PASSWORD}
            </Link>
          </div>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••••••"
              className={`${styles.input} ${styles.passwordInput} ${error ? styles.inputError : ""} ${focusedField === "password" ? styles.inputFocused : ""}`}
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePasswordBtn}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Error message directly below the input fields */}
      {error && (
        <div className="error-alert" role="alert">
          <AlertCircle size={16} className="error-alert-icon" />
          <span className="error-alert-message">{error}</span>
        </div>
      )}

      {/* Keep Signed In Checkbox */}
      <div className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          id="keepSignedIn"
          checked={keepSignedIn}
          onChange={(e) => setKeepSignedIn(e.target.checked)}
          className={styles.checkbox}
        />
        <label htmlFor="keepSignedIn" className={styles.checkboxLabel}>
          {LOGIN_TEXTS.KEEP_SIGNED_IN}
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={styles.submitBtn}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            <span>{LOGIN_TEXTS.SUBMIT_LOADING}</span>
          </>
        ) : (
          <span>{LOGIN_TEXTS.SUBMIT_BUTTON}</span>
        )}
      </button>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>{LOGIN_TEXTS.OR_DIVIDER}</span>
        <div className={styles.dividerLine} />
      </div>

      {/* Social Sign In Group */}
      <div className={styles.socialButtonsGroup}>
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={loading || googleLoading || facebookLoading}
          className={styles.socialBtn}
        >
          <span className="font-sans">Google</span>
          {googleLoading ? <span className={styles.spinner} /> : <GoogleIcon />}
        </button>

        <button
          type="button"
          onClick={onFacebookLogin}
          disabled={loading || googleLoading || facebookLoading || passkeyLoading}
          className={styles.socialBtn}
        >
          <span className="font-sans">Facebook</span>
          {facebookLoading ? <span className={styles.spinner} /> : <FacebookIcon />}
        </button>
      </div>

      {/* Passkey / Face ID Button (iPhone / Biometrics) */}
      {hasPasskeySupport && (
        <button
          type="button"
          onClick={onPasskeyLogin}
          disabled={loading || googleLoading || facebookLoading || passkeyLoading}
          className={styles.passkeyBtn}
        >
          {passkeyLoading ? <span className={styles.spinner} /> : <ScanFace />} 
          <span className="font-sans">{passkeyLoading ? LOGIN_TEXTS.PASSKEY_LOADING : LOGIN_TEXTS.PASSKEY_BUTTON}</span>
        </button>
      )}
    </form>
  );
};
