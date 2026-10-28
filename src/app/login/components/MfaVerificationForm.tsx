import React from "react";
import Image from "next/image";
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
          <Image
            src="/images/other_icon/padlock.webp"
            alt="MFA Security"
            width={60}
            height={80}
          />
        </div>
        <h2 className="font-sub fw-bold fs-2 text-black">{LOGIN_TEXTS.MFA_TITLE}</h2>
        <p className="mt-2 fs-1 text-secondary">{LOGIN_TEXTS.MFA_SUBTITLE}</p>
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
        className= "btn btn-primary bg-black text-white"
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
        className="btn btn-cancel text-black"
      >
        <i className="bx bx-arrow-back" style={{ fontSize: "1.1rem" }} />
        <span>{LOGIN_TEXTS.MFA_CANCEL}</span>
      </button>
    </form>
  );
};
