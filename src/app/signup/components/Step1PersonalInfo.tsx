import React, { useState, useEffect } from "react";
import { SignupFormData, SignupFieldErrors } from "../types";
import styles from "../signup.module.css";
import { IconExclamationCircle, IconShieldCheckFilled } from "@tabler/icons-react";
import { AlertCircle } from "lucide-react";

interface Step1PersonalInfoProps {
  formData: SignupFormData;
  fieldErrors: SignupFieldErrors;
  updateField: (field: keyof SignupFormData, value: string) => void;
  suggestions: string[];
  isEmailVerified: boolean;
  emailOtpSent: boolean;
  emailOtp: string;
  emailOtpTimer: number;
  emailOtpLoading: boolean;
  emailOtpError: string;
  emailCodeDigits: string[];
  emailInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleEmailDigitChange: (index: number, value: string) => void;
  handleEmailKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEmailPaste: (e: React.ClipboardEvent) => void;
  handleSendEmailOtp: () => Promise<void>;
  handleVerifyEmailOtp: () => Promise<void>;
  isStep1Valid: boolean;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  emailOtpDevNotice?: string;
  fillDevOtpCode?: (code: string) => void;
}

export const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  formData,
  fieldErrors,
  updateField,
  suggestions,
  isEmailVerified,
  emailOtpSent,
  emailOtp,
  emailOtpTimer,
  emailOtpLoading,
  emailOtpError,
  emailOtpDevNotice,
  fillDevOtpCode,
  emailCodeDigits,
  emailInputRefs,
  handleEmailDigitChange,
  handleEmailKeyDown,
  handleEmailPaste,
  handleSendEmailOtp,
  handleVerifyEmailOtp,
  isStep1Valid,
  focusedField,
  setFocusedField,
}) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (emailOtpError && emailOtpSent) {
      setIsShaking(true);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch {
          // Ignore if vibration is restricted by browser policy
        }
      }
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [emailOtpError, emailOtpSent]);

  return (
    <div className={styles.stepForm}>
      {/* First Name & Last Name */}
      <div className={styles.twoColGrid}>
        {/* First Name */}
        <div className={styles.inputGroup}>
          <label htmlFor="firstName" className={styles.fieldLabel}>
            <i className={`bx bx-user ${styles.fieldLabelIcon}`}></i>
            الاسم الأول
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            onFocus={() => setFocusedField("firstName")}
            onBlur={() => setFocusedField(null)}
            placeholder="أحمد"
            className={`${styles.inputField} ${fieldErrors.firstName ? styles.inputFieldError : ""}`}
          />
          {fieldErrors.firstName && (
            <div className={styles.fieldErrorText}>{fieldErrors.firstName}</div>
          )}
        </div>

        {/* Last Name */}
        <div className={styles.inputGroup}>
          <label htmlFor="lastName" className={styles.fieldLabel}>
            <i className={`bx bx-user ${styles.fieldLabelIcon}`}></i>
            الاسم الأخير
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            onFocus={() => setFocusedField("lastName")}
            onBlur={() => setFocusedField(null)}
            placeholder="محمود"
            className={`${styles.inputField} ${fieldErrors.lastName ? styles.inputFieldError : ""}`}
          />
          {fieldErrors.lastName && (
            <div className={styles.fieldErrorText}>{fieldErrors.lastName}</div>
          )}
        </div>
      </div>

      {/* Username */}
      <div className={styles.inputGroup}>
        <label htmlFor="username" className={styles.fieldLabel}>
          <i className={`bx bx-at ${styles.fieldLabelIcon}`}></i>
          اسم المستخدم
        </label>
        <input
          id="username"
          type="text"
          required
          minLength={3}
          value={formData.username}
          onChange={(e) => updateField("username", e.target.value)}
          onFocus={() => setFocusedField("username")}
          onBlur={() => setFocusedField(null)}
          placeholder="ahmed_mahmoud"
          className={`${styles.inputField} ${fieldErrors.username ? styles.inputFieldError : ""}`}
          style={{ textAlign: "left", direction: "ltr" }}
        />
        {fieldErrors.username && (
          <div className={styles.fieldErrorText}> {fieldErrors.username}</div>
        )}
        {suggestions.length > 0 && !fieldErrors.username && (
          <div className={styles.suggestionsRow}>
            <span className={styles.suggestionsLabel}>مقترحات:</span>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => updateField("username", s)}
                className={styles.suggestionPill}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Email */}
      <div className={styles.inputGroup}>
        <label htmlFor="signupEmail" className={styles.fieldLabel}>
          <i className={`bx bx-envelope ${styles.fieldLabelIcon}`}></i>
          البريد الإلكتروني
        </label>
        <div className={styles.emailInputRow}>
          <input
            id="signupEmail"
            type="email"
            required
            disabled={isEmailVerified}
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            placeholder="example@email.com"
            className={`${styles.inputField} ${fieldErrors.email || (!emailOtpSent && emailOtpError) ? styles.inputFieldError : ""}`}
            style={{
              textAlign: "left",
              direction: "ltr",
              background: isEmailVerified ? "#f0fdf4" : undefined,
              borderColor: isEmailVerified ? "#86efac" : undefined,
            }}
          />
          {!isEmailVerified && (
            <button
              type="button"
              onClick={handleSendEmailOtp}
              disabled={!formData.email || !!fieldErrors.email || emailOtpLoading || emailOtpTimer > 0}
              className={`btn btn-primary pt-1 pb-1 fs-xxs font-sub rounded-xl ${!formData.email || !!fieldErrors.email || emailOtpTimer > 0
                ? styles.sendOtpBtnDisabled
                : styles.sendOtpBtnActive
                }`}
            >
              {emailOtpLoading ? (
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.1rem" }}></i>
              ) : emailOtpTimer > 0 ? (
                `${emailOtpTimer}s`
              ) : emailOtpSent ? (
                "إعادة الإرسال"
              ) : (
                "تأكيد"
              )}
            </button>
          )}
        </div>
        {fieldErrors.email && (
          <div className="error-alert">
            <AlertCircle size={16} className="error-alert-icon" />
            <span className="error-alert-message"> {fieldErrors.email}</span>
          </div>
        )}
        {!emailOtpSent && emailOtpError && (
          <div className="error-alert">
            <AlertCircle size={16} className="error-alert-icon" />
            <span className="error-alert-message">{emailOtpError}</span>
          </div>
        )}

        {/* Email OTP Verification Box (2FA Style) */}
        {emailOtpSent && !isEmailVerified && (
          <div className={styles.otpBox}>
            <div className={styles.otpHeader}>
              <div className={styles.otpIconBadge}>
                <i className="bx bx-envelope"></i>
              </div>
              <div className="text-black font-sub">كود التحقق من البريد</div>
              <p className={styles.otpDesc}>
                أدخل الـ 6 أرقام المرسلة إلى{" "}
                <span className={styles.otpEmailHighlight}>{formData.email}</span>
              </p>
            </div>

            {/* Dev Mode Notification if active
            {emailOtpDevNotice && (
              <div
                style={{
                  background: "rgba(234, 179, 8, 0.12)",
                  border: "1px solid rgba(234, 179, 8, 0.3)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "0.82rem",
                  color: "#eab308",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  alignItems: "center",
                  margin: "8px 0",
                }}
              >
                <div>
                  🛠️ <strong>وضع التطوير:</strong> كود التحقق هو{" "}
                  <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: "bold", color: "#facc15", letterSpacing: "2px" }}>
                    {emailOtpDevNotice}
                  </span>
                </div>
                {fillDevOtpCode && (
                  <button
                    type="button"
                    onClick={() => fillDevOtpCode(emailOtpDevNotice)}
                    style={{
                      background: "rgba(234, 179, 8, 0.2)",
                      border: "1px solid #eab308",
                      color: "#fef08a",
                      borderRadius: "6px",
                      padding: "4px 12px",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    إدخال الكود تلقائياً
                  </button>
                )}
              </div>
            )} */}

            {/* 6 Digits Inputs */}
            <div className={`${styles.otpDigitsRow} ${isShaking ? styles.shake : ""}`}>
              {emailCodeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    emailInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleEmailDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleEmailKeyDown(idx, e)}
                  onPaste={handleEmailPaste}
                  maxLength={2}
                  className={`otp-input ${digit ? 'otp-input-filled' : ""} ${emailOtpError ? 'otp-input-error' : ""}`}
                  aria-invalid={Boolean(emailOtpError)}
                />
              ))}
            </div>

            {emailOtpError && (
              <div className="error-alert" role="alert">
                <AlertCircle size={16} className="error-alert-icon" />
                <span className="error-alert-message">{emailOtpError}</span>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyEmailOtp}
              disabled={emailOtp.length !== 6 || emailOtpLoading}
              className="btn btn-black w-full"
            >
              {emailOtpLoading ? (
                <>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.1rem" }}></i>
                  جاري التحقق...
                </>
              ) : (
                <>
                  <i className="bx bx-check-circle" style={{ fontSize: "1.2rem" }}></i>
                  تأكيد ومتابعة
                </>
              )}
            </button>
          </div>
        )}

        {/* Email Verified Badge */}
        {isEmailVerified && (
          <div className="success-alert">
            <IconShieldCheckFilled size={16} className="success-alert-icon" />
            <span className="success-alert-message">تم التحقق من ملكية البريد الإلكتروني بنجاح</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!isStep1Valid}
        className={`${styles.submitBtn} ${isStep1Valid ? styles.submitBtnEnabled : styles.submitBtnDisabled}`}
      >
        {isEmailVerified ? "التالي" : "يرجى تأكيد البريد أولاً"}
      </button>
    </div>
  );
};
