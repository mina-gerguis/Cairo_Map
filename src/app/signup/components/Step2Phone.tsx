import React from "react";
import Image from "next/image";
import { SignupFormData, SignupFieldErrors } from "../types";
import styles from "../signup.module.css";

interface Step2PhoneProps {
  formData: SignupFormData;
  fieldErrors: SignupFieldErrors;
  updateField: (field: keyof SignupFormData, value: string) => void;
  isStep2Valid: boolean;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
}

export const Step2Phone: React.FC<Step2PhoneProps> = ({
  formData,
  fieldErrors,
  updateField,
  isStep2Valid,
  focusedField,
  setFocusedField,
}) => {
  return (
    <div className={styles.stepForm} style={{ gap: "16px" }}>
      <div className={styles.inputGroup} style={{ gap: "8px" }}>
        <label htmlFor="phone" className={styles.fieldLabel}>
          <i className={`bx bx-phone ${styles.fieldLabelIcon}`}></i>
          رقم الهاتف
        </label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span className={styles.phonePrefix}>
            <span className={styles.phoneDivider} />
            +20
            <Image
              src="/images/profile/flag-egypt.png"
              alt="Egypt Flag"
              width={20}
              height={20}
            />
          </span>
          <input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField(null)}
            placeholder="1xxxxxxxxx"
            className={`${styles.inputField} ${fieldErrors.phone ? styles.inputFieldError : ""}`}
            style={{
              textAlign: "left",
              direction: "ltr",
              paddingLeft: "90px",
            }}
          />
        </div>

        {fieldErrors.phone && (
          <div className={styles.fieldErrorText} style={{ marginTop: "-4px" }}>
            ⚠ {fieldErrors.phone}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button
          type="submit"
          disabled={!isStep2Valid}
          className={`${styles.submitBtn} ${isStep2Valid ? styles.submitBtnEnabled : styles.submitBtnDisabled}`}
          style={{ flex: 1 }}
        >
          التالي
        </button>
      </div>
    </div>
  );
};
