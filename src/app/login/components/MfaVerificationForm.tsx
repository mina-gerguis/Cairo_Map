import React from "react";
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
      {/* MFA Header with 3D Padlock */}
      <div className={styles.mfaHeader}>
        <div className={styles.mfaIconWrapper}>
          <img
            src="/images/icons3d/padlock.png"
            alt="MFA Security"
            className={styles.mfaIcon}
          />
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

      {/* Verification Submit Button */}
      <button
        type="submit"
        disabled={loading || mfaCode.length !== 6}
        className={styles.mfaSubmitBtn}
      >
        {loading ? (
          <>
            <div className={styles.spinner} />
            <span>{LOGIN_TEXTS.MFA_VERIFYING}</span>
          </>
        ) : (
          <>
            <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }} />
            <span>{LOGIN_TEXTS.MFA_CONFIRM}</span>
          </>
        )}
      </button>

      {/* Cancel and Back to Credentials Button */}
      <button
        type="button"
        onClick={onCancel}
        className={styles.mfaCancelBtn}
      >
        <i className="bx bx-arrow-back" style={{ fontSize: "1.1rem" }} />
        <span>{LOGIN_TEXTS.MFA_CANCEL}</span>
      </button>
    </form>
  );
};
