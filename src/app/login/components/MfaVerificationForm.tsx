import React from "react";
import { ShieldCheck } from "lucide-react";
import { MfaVerificationFormProps } from "../types";
import { LOGIN_TEXTS } from "../constants";
import styles from "../login.module.css";

export const MfaVerificationForm: React.FC<MfaVerificationFormProps> = ({
  mfaCode,
  codeDigits,
  inputRefs,
  loading,
  onDigitChange,
  onKeyDown,
  onPaste,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {/* MFA Header with Clean Icon Badge */}
      <div className={styles.mfaHeader}>
        <div className={styles.mfaIconWrapper}>
          <ShieldCheck size={28} />
        </div>
        <h2 className={styles.mfaTitle}>{LOGIN_TEXTS.MFA_TITLE}</h2>
        <p className={styles.mfaSubtitle}>{LOGIN_TEXTS.MFA_SUBTITLE}</p>
      </div>

      {/* 6-Digit OTP Code Inputs */}
      <div className={styles.mfaDigitsContainer}>
        {codeDigits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => onDigitChange(idx, e.target.value)}
            onKeyDown={(e) => onKeyDown(idx, e)}
            onPaste={onPaste}
            className={styles.mfaDigitInput}
            maxLength={2}
            autoFocus={idx === 0}
            aria-label={`الرقم ${idx + 1}`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className={styles.mfaActions}>
        <button
          type="submit"
          disabled={loading || mfaCode.length !== 6}
          className={styles.submitBtn}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              <span>{LOGIN_TEXTS.MFA_VERIFYING}</span>
            </>
          ) : (
            <span>{LOGIN_TEXTS.MFA_CONFIRM}</span>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={styles.cancelBtn}
        >
          {LOGIN_TEXTS.MFA_CANCEL}
        </button>
      </div>
    </form>
  );
};
