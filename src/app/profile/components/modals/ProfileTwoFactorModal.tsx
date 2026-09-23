"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { MfaFactorsState, MfaStep } from "../../types";
import styles from "../../page.module.css";

interface ProfileTwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMfaFactors: MfaFactorsState;
  mfaStep: MfaStep;
  setMfaStep: (step: MfaStep) => void;
  mfaPasswordConfirm: string;
  setMfaPasswordConfirm: (pwd: string) => void;
  qrCode: string;
  mfaSecret: string;
  codeDigits: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  mfaLoading: boolean;
  mfaError: string;
  setMfaError: (err: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleDigitChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleEnrollTOTP: () => Promise<void>;
  handleVerifyTOTP: () => Promise<void>;
  handleUnenrollClick: (e: React.MouseEvent) => void;
  handleUnenrollTOTP: () => Promise<void>;
}

export const ProfileTwoFactorModal: React.FC<ProfileTwoFactorModalProps> = ({
  isOpen,
  onClose,
  activeMfaFactors,
  mfaStep,
  setMfaStep,
  mfaPasswordConfirm,
  setMfaPasswordConfirm,
  qrCode,
  mfaSecret,
  codeDigits,
  inputRefs,
  mfaLoading,
  mfaError,
  setMfaError,
  verificationCode,
  setVerificationCode,
  showPassword,
  setShowPassword,
  handleDigitChange,
  handleKeyDown,
  handlePaste,
  handleEnrollTOTP,
  handleVerifyTOTP,
  handleUnenrollClick,
  handleUnenrollTOTP,
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      title={
        mfaStep === "selection"
          ? "المصادقة الثنائية"
          : mfaStep === "enroll"
          ? "تفعيل المصادقة الثنائية"
          : "إلغاء تفعيل المصادقة الثنائية"
      }
      titleColor={mfaStep === "unenroll_confirm" ? "#ff3b30" : "var(--text-primary)"}
      iconSrc="/images/icons3d/padlock.png"
      borderColor={
        mfaStep === "unenroll_confirm" ? "rgba(255, 59, 48, 0.25)" : "var(--modelCardBorder)"
      }
      primaryButton={
        mfaStep === "selection"
          ? {
              label: "إغلاق",
              onClick: onClose,
              bgColor: "var(--btn-cancel)",
              textColor: "var(--text-primary)",
            }
          : mfaStep === "enroll"
          ? {
              label: mfaLoading ? "جاري التفعيل..." : "تأكيد وتفعيل",
              onClick: handleVerifyTOTP,
              bgColor: "var(--mainBtn)",
              disabled: mfaLoading || verificationCode.length !== 6,
            }
          : {
              label: mfaLoading ? "جاري الإلغاء..." : "تأكيد الإلغاء",
              onClick: handleUnenrollTOTP,
              bgColor: "#ff3b30",
              disabled: mfaLoading || verificationCode.length !== 6 || !mfaPasswordConfirm,
            }
      }
      secondaryButton={
        mfaStep === "enroll"
          ? {
              label: "رجوع",
              onClick: () => setMfaStep("selection"),
              bgColor: "var(--btn-cancel)",
              disabled: mfaLoading,
            }
          : mfaStep === "unenroll_confirm"
          ? {
              label: "تراجع",
              onClick: () => {
                setMfaStep("selection");
                setVerificationCode("");
                setMfaPasswordConfirm("");
                setMfaError("");
              },
              bgColor: "var(--btn-cancel)",
              disabled: mfaLoading,
            }
          : undefined
      }
    >
      <div style={{ textAlign: "right" }}>
        {mfaError && (
          <div className={styles.mfaErrorBanner} style={{ textAlign: "center" }}>
            {mfaError}
          </div>
        )}

        {mfaStep === "selection" && (
          <>
            <p
              className={styles.mfaStepText}
              style={{ textAlign: "center", marginBottom: "20px" }}
            >
              اختر الطريقة التي تفضلها لاستلام كود التحقق الإضافي عند تسجيل الدخول.
            </p>

            <div className={styles.mfaListGap}>
              {/* Email */}
              <div className={styles.mfaOptionItemDisabled}>
                <div className={styles.mfaOptionLeft}>
                  <div className={styles.mfaOptionIconDisabled}>
                    <i className={`bx bx-envelope ${styles.securityIcon}`}></i>
                  </div>
                  <div className={styles.profileInfoText}>
                    <h4 className={styles.mfaOptionTitle}>البريد الإلكتروني</h4>
                  </div>
                </div>
                <span className={styles.mfaOptionBadgeSoon}>قريباً</span>
              </div>

              {/* WhatsApp */}
              <div className={styles.mfaOptionItemDisabled}>
                <div className={styles.mfaOptionLeft}>
                  <div className={styles.mfaOptionIconDisabled}>
                    <i className={`bx bxl-whatsapp ${styles.securityIcon}`}></i>
                  </div>
                  <div className={styles.profileInfoText}>
                    <h4 className={styles.mfaOptionTitle}>تطبيق واتساب</h4>
                  </div>
                </div>
                <span className={styles.mfaOptionBadgeSoon}>قريباً</span>
              </div>

              {/* Authenticator App */}
              <div
                onClick={() => (activeMfaFactors.totp ? null : handleEnrollTOTP())}
                className={`${styles.mfaOptionBase} ${
                  activeMfaFactors.totp
                    ? styles.mfaOptionItemActive
                    : styles.mfaOptionItemInactive
                }`}
              >
                <div className={styles.mfaOptionLeft}>
                  <div
                    className={
                      activeMfaFactors.totp
                        ? styles.mfaOptionIconActive
                        : styles.mfaOptionIconInactive
                    }
                  >
                    <i className={`bx bx-check-shield ${styles.securityIcon}`}></i>
                  </div>
                  <div className={styles.profileInfoText}>
                    <h4 className={styles.mfaOptionTitle}>تطبيق مصادقة خارجية</h4>
                    <p
                      className={
                        activeMfaFactors.totp
                          ? styles.mfaOptionSubActive
                          : styles.mfaOptionSubInactive
                      }
                    >
                      {activeMfaFactors.totp ? "مفعل" : "موثوق"}
                    </p>
                  </div>
                </div>
                {mfaLoading ? (
                  <div
                    className={`spinner ${
                      activeMfaFactors.totp
                        ? styles.mfaSpinnerActive
                        : styles.mfaSpinnerInactive
                    }`}
                  />
                ) : activeMfaFactors.totp ? (
                  <button onClick={handleUnenrollClick} className={styles.mfaUnenrollBtn}>
                    إلغاء
                  </button>
                ) : (
                  <i className={`bx bx-chevron-left ${styles.securityIcon}`}></i>
                )}
              </div>
            </div>
          </>
        )}

        {mfaStep === "enroll" && (
          <div className={styles.mfaEnrollColumn}>
            <p className={styles.mfaStepText}>
              1. قم بتحميل تطبيق مصادقة مثل Google Authenticator أو Authy.
              <br />
              2. امسح رمز الاستجابة السريعة (QR Code) التالي:
            </p>

            {qrCode ? (
              <div className={styles.mfaQrBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="QR Code" className={styles.mfaQrImg} />
              </div>
            ) : (
              <div className={styles.mfaQrPlaceholder}>
                <div className="spinner" />
              </div>
            )}

            <p className={styles.mfaSecretText}>
              أو يمكنك إدخال الرمز السري يدوياً:
              <br />
              <code className={styles.mfaSecretCode}>{mfaSecret}</code>
            </p>

            <div className={styles.digitsRow}>
              {codeDigits.map((digit, idx) => (
                <input
                  key={`enroll-${idx}`}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`input-fields ${styles.digitInput}`}
                  maxLength={2}
                />
              ))}
            </div>
          </div>
        )}

        {mfaStep === "unenroll_confirm" && (
          <div className={styles.mfaUnenrollForm}>
            <p className={styles.mfaStepText}>
              لأسباب أمنية، يرجى إدخال كلمة المرور والكود المكون من 6 أرقام لتأكيد الإلغاء.
            </p>
            <div className={styles.formGap} style={{ width: "100%", marginTop: "8px" }}>
              <div className={styles.relativeFullWidth}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input-fields ${styles.passwordInputPaddedRight}`}
                  placeholder="كلمة المرور الحالية"
                  value={mfaPasswordConfirm}
                  onChange={(e) => setMfaPasswordConfirm(e.target.value)}
                />
                <i
                  className={`bx ${showPassword ? "bx-hide" : "bx-show"} ${styles.eyeIconToggle}`}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
              <div className={styles.digitsRow}>
                {codeDigits.map((digit, idx) => (
                  <input
                    key={`unenroll-${idx}`}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`input-fields ${styles.digitInput}`}
                    maxLength={2}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomModal>
  );
};
