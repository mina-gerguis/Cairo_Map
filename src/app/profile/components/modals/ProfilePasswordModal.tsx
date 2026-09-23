"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { PasswordForm, PasswordRules } from "../../types";
import styles from "../../page.module.css";

interface ProfilePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwordForm: PasswordForm;
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
  passwordLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  pwdRules: PasswordRules;
  isPasswordValid: boolean;
  handleChangePassword: () => Promise<void>;
}

export const ProfilePasswordModal: React.FC<ProfilePasswordModalProps> = ({
  isOpen,
  onClose,
  passwordForm,
  setPasswordForm,
  passwordLoading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  pwdRules,
  isPasswordValid,
  handleChangePassword,
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="تغيير كلمة المرور"
      message="الرجاء إدخال كلمة المرور الجديدة."
      iconSrc="/images/icons3d/padlock.png"
      borderColor="var(--modelCardBorder)"
      primaryButton={{
        label: passwordLoading ? "جاري التغيير..." : "تأكيد",
        onClick: handleChangePassword,
        bgColor: "var(--mainBtn)",
        disabled: passwordLoading || !isPasswordValid,
      }}
      secondaryButton={{
        label: "إلغاء",
        onClick: onClose,
        bgColor: "var(--btn-cancel)",
      }}
    >
      <div style={{ textAlign: "right" }}>
        <div className={styles.passwordInputRelative} style={{ marginBottom: "12px" }}>
          <input
            type={showPassword ? "text" : "password"}
            className={`input-fields ${styles.passwordInputLeftPadded}`}
            placeholder="كلمة المرور الجديدة"
            value={passwordForm.new}
            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeIconBtn}
          >
            <i className={`bx ${showPassword ? "bx-hide" : "bx-show"}`}></i>
          </button>
        </div>

        <div className={styles.passwordInputConfirmRelative} style={{ marginBottom: "16px" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            className={`input-fields ${styles.passwordInputLeftPadded}`}
            placeholder="تأكيد كلمة المرور الجديدة"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={styles.eyeIconBtn}
          >
            <i className={`bx ${showConfirmPassword ? "bx-hide" : "bx-show"}`}></i>
          </button>
        </div>

        <div className={styles.pwdRulesBox} style={{ margin: "0 0 8px 0" }}>
          {[
            { ok: pwdRules.length, label: "من 8 إلى 32 حرف" },
            { ok: pwdRules.upper, label: "حرف كبير (A-Z)" },
            { ok: pwdRules.lower, label: "حرف صغير (a-z)" },
            { ok: pwdRules.number, label: "رقم (0-9)" },
            { ok: pwdRules.special, label: "رمز خاص (@$!...)" },
            { ok: pwdRules.match, label: "كلمتا المرور متطابقتان" },
          ].map(({ ok, label }) => (
            <div
              key={label}
              className={`${styles.pwdRuleItem} ${ok ? styles.pwdRuleSuccess : styles.pwdRuleMuted}`}
            >
              <i
                className={`bx ${ok ? "bxs-check-circle" : "bx-radio-circle"} ${styles.ruleCheckIcon}`}
              ></i>{" "}
              {label}
            </div>
          ))}
        </div>
      </div>
    </CustomModal>
  );
};
