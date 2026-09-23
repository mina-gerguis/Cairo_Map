import React from "react";
import { SignupFormData } from "../types";
import { AVATARS_LIST } from "../constants";
import styles from "../signup.module.css";

interface Step4AvatarProps {
  formData: SignupFormData;
  updateField: (field: keyof SignupFormData, value: string) => void;
  loading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const Step4Avatar: React.FC<Step4AvatarProps> = ({
  formData,
  updateField,
  loading,
  handleFileUpload,
}) => {
  return (
    <div className={styles.stepForm} style={{ gap: "18px" }}>
      {/* File Upload Zone */}
      <label className={styles.avatarUploadZone}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
        <span className={styles.avatarUploadText}>
          {loading ? "جاري الرفع..." : "ارفع صورة / التقط بكاميرا الهاتف"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          disabled={loading}
        />
      </label>

      {/* Uploaded / Selected Preview */}
      {formData.avatarUrl && (
        <div style={{ textAlign: "center", animation: "popIn 0.4s ease" }}>
          <img
            src={formData.avatarUrl}
            alt="الصورة الشخصية"
            className={styles.avatarPreview}
          />
        </div>
      )}

      {/* Pre-made Avatars Grid */}
      <div>
        <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: "10px", fontWeight: "600" }}>
          أو اختر أفاتار جاهز:
        </p>
        <div className={styles.avatarGrid}>
          {AVATARS_LIST.map((url, i) => (
            <div
              key={i}
              onClick={() => updateField("avatarUrl", url)}
              className={`${styles.avatarItem} ${
                formData.avatarUrl === url
                  ? styles.avatarItemActive
                  : formData.avatarUrl
                  ? styles.avatarItemDimmed
                  : ""
              }`}
            >
              <img
                src={url}
                alt={`Avatar ${i + 1}`}
                style={{ width: "100%", height: "auto", display: "block", aspectRatio: "1" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
        <button
          type="submit"
          className={`${styles.submitBtn} ${styles.submitBtnEnabled}`}
          style={{ flex: 1 }}
        >
          التالي
        </button>
      </div>
    </div>
  );
};
