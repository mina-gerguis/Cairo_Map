import React from "react";
import { CredentialsFormProps } from "../types";
import { LOGIN_TEXTS } from "../constants";
import styles from "../login.module.css";

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
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {/* Email / Username Field */}
      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          <i className="bx bx-user" style={{ fontSize: "1rem" }} />
          {LOGIN_TEXTS.USERNAME_OR_EMAIL}
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
            placeholder={LOGIN_TEXTS.USERNAME_OR_EMAIL}
            className={`${styles.input} ${focusedField === "email" ? styles.inputFocused : ""}`}
            autoComplete="username"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>
          <i className="bx bx-lock-alt" style={{ fontSize: "1rem" }} />
          {LOGIN_TEXTS.PASSWORD}
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            placeholder="••••••••"
            className={`${styles.input} ${styles.passwordInput} ${focusedField === "password" ? styles.inputFocused : ""}`}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.togglePasswordBtn}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            <i className={showPassword ? "bx bx-hide" : "bx bx-show"} />
          </button>
        </div>
      </div>

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
            <div className={styles.spinner} />
            <span>{LOGIN_TEXTS.SUBMIT_LOADING}</span>
          </>
        ) : (
          <span>{LOGIN_TEXTS.SUBMIT_BUTTON}</span>
        )}
      </button>
    </form>
  );
};
