import React from "react";
import { SignupFormData, PasswordRules } from "../types";
import styles from "../signup.module.css";

interface Step5PasswordProps {
  formData: SignupFormData;
  updateField: (field: keyof SignupFormData, value: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  pwdRules: PasswordRules;
  isPasswordValid: boolean;
  loading: boolean;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
}

export const Step5Password: React.FC<Step5PasswordProps> = ({
  formData,
  updateField,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  pwdRules,
  isPasswordValid,
  loading,
  focusedField,
  setFocusedField,
}) => {
  const rulesList = [
    { ok: pwdRules.length, label: "من 8 إلى 32 حرف" },
    { ok: pwdRules.upper, label: "حرف كبير (A-Z)" },
    { ok: pwdRules.lower, label: "حرف صغير (a-z)" },
    { ok: pwdRules.number, label: "رقم (0-9)" },
    { ok: pwdRules.special, label: "رمز خاص (@$!...)" },
    { ok: pwdRules.match, label: "كلمتا المرور متطابقتان" },
  ];

  return (
    <div className={styles.stepForm}>
      {/* Password Field */}
      <div className={styles.inputGroup}>
        <label htmlFor="signupPassword" className={styles.fieldLabel}>
          <i className={`bx bx-lock-alt ${styles.fieldLabelIcon}`}></i>
          كلمة المرور
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="signupPassword"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            placeholder="••••••••"
            className={styles.inputField}
            style={{ textAlign: "left", direction: "ltr", paddingRight: "44px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggleBtn}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword" className={styles.fieldLabel}>
          <i className={`bx bx-check-shield ${styles.fieldLabelIcon}`}></i>
          تأكيد كلمة المرور
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            placeholder="••••••••"
            className={styles.inputField}
            style={{ textAlign: "left", direction: "ltr", paddingRight: "44px" }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={styles.passwordToggleBtn}
            aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
          >
            {showConfirmPassword ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}
          </button>
        </div>
      </div>

      {/* Security Checklist Rules */}
      <div className={styles.passwordRulesBox}>
        {rulesList.map(({ ok, label }) => (
          <div
            key={label}
            className={`${styles.passwordRuleItem} ${ok ? styles.ruleValid : styles.ruleInvalid}`}
          >
            <span style={{ fontSize: "0.85rem" }}>
              {ok ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-circle"></i>}
            </span>
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className={`${styles.submitBtn} ${
            isPasswordValid && !loading ? styles.submitBtnEnabled : styles.submitBtnDisabled
          }`}
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: "18px", height: "18px" }} />
              جاري الإنشاء...
            </>
          ) : (
            "إنشاء الحساب"
          )}
        </button>
      </div>
    </div>
  );
};
