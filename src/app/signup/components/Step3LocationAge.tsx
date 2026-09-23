import React from "react";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { SignupFormData } from "../types";
import styles from "../signup.module.css";

interface Step3LocationAgeProps {
  formData: SignupFormData;
  updateField: (field: keyof SignupFormData, value: string) => void;
  isStep3Valid: boolean;
  loading: boolean;
  maxDobDateStr: string;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
}

export const Step3LocationAge: React.FC<Step3LocationAgeProps> = ({
  formData,
  updateField,
  isStep3Valid,
  loading,
  maxDobDateStr,
  focusedField,
  setFocusedField,
}) => {
  return (
    <div className={styles.stepForm}>
      {/* Date of Birth & Gender in 2 columns */}
      <div className={styles.twoColGrid}>
        {/* DOB */}
        <div className={styles.inputGroup}>
          <label htmlFor="dob" className={styles.fieldLabel}>
            <i className={`bx bx-calendar ${styles.fieldLabelIcon}`}></i>
            تاريخ الميلاد
          </label>
          <input
            id="dob"
            type="date"
            required
            max={maxDobDateStr}
            lang="en-US"
            value={formData.dob}
            onChange={(e) => updateField("dob", e.target.value)}
            onFocus={() => setFocusedField("dob")}
            onBlur={() => setFocusedField(null)}
            className={`date-field-input ${styles.inputField}`}
            style={{ direction: "ltr" }}
          />
        </div>

        {/* Gender */}
        <div className={styles.inputGroup}>
          <label htmlFor="gender" className={styles.fieldLabel}>
            <i className={`bx bx-male-female ${styles.fieldLabelIcon}`}></i>
            الجنس
          </label>
          <select
            id="gender"
            required
            value={formData.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            className={styles.inputField}
            style={{ appearance: "auto", cursor: "pointer" }}
          >
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
          </select>
        </div>
      </div>

      {/* Governorate */}
      <div className={styles.inputGroup}>
        <label htmlFor="governorate" className={styles.fieldLabel}>
          <i className={`bx bx-map ${styles.fieldLabelIcon}`}></i>
          المحافظة
        </label>
        <select
          id="governorate"
          required
          value={formData.governorate}
          onChange={(e) => {
            updateField("governorate", e.target.value);
            updateField("city", "");
          }}
          className={styles.inputField}
          style={{ appearance: "auto", cursor: "pointer" }}
        >
          <option value="" disabled>اختر المحافظة...</option>
          {governoratesList.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      {formData.governorate && (
        <div className={styles.inputGroup}>
          <label htmlFor="city" className={styles.fieldLabel}>
            <i className={`bx bx-buildings ${styles.fieldLabelIcon}`}></i>
            المدينة
          </label>
          <select
            id="city"
            required
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={styles.inputField}
            style={{ appearance: "auto", cursor: "pointer" }}
          >
            <option value="" disabled>اختر المدينة...</option>
            {egyptLocations[formData.governorate]?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button
          type="submit"
          disabled={loading || !isStep3Valid}
          className={`${styles.submitBtn} ${isStep3Valid && !loading ? styles.submitBtnEnabled : styles.submitBtnDisabled}`}
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: "18px", height: "18px" }} />
              جاري التحقق...
            </>
          ) : (
            "التالي"
          )}
        </button>
      </div>
    </div>
  );
};
