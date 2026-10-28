"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { PasskeyInfo } from "../../types";
import styles from "../../page.module.css";
import { Calendar, Trash2, Fingerprint, Plus, X, Laptop, Smartphone } from "lucide-react";

interface ProfilePasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  passkeyList: PasskeyInfo[];
  loadingPasskeys: boolean;
  passkeyLoading: boolean;
  passkeyToDelete: PasskeyInfo | null;
  setPasskeyToDelete: (passkey: PasskeyInfo | null) => void;
  onAddPasskey: () => void;
  executeDeletePasskey: (id: string) => Promise<void>;
}

export const ProfilePasskeyModal: React.FC<ProfilePasskeyModalProps> = ({
  isOpen,
  onClose,
  passkeyList,
  loadingPasskeys,
  passkeyLoading,
  passkeyToDelete,
  setPasskeyToDelete,
  onAddPasskey,
  executeDeletePasskey,
}) => {
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="مفاتيح المرور (Passkeys)"
        message="الأجهزة المسجلة للدخول السريع بحسابك عبر بصمة الوجه (Face ID) أو بصمة الإصبع دون الحاجة لكلمة مرور."
        primaryButton={{
          label: "إغلاق",
          onClick: onClose,
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div className={styles.devicesListContainer}>
            {loadingPasskeys ? (
              <div className={styles.devicesSpinnerContainer}>
                <div className="spinner" />
                <p>جاري تحميل مفاتيح المرور...</p>
              </div>
            ) : passkeyList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    margin: "0 auto 10px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "var(--color-success, #34c759)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Fingerprint size={28} />
                </div>
                <p className={styles.noDevicesText} style={{ margin: "4px 0 2px" }}>
                  لا توجد مفاتيح مرور مسجلة حالياً.
                </p>
                <p className="text-muted fs-xs">
                  يمكنك تفعيل بصمة الوجه أو الإصبع لتسجيل الدخول بأمان وسرعة.
                </p>
              </div>
            ) : (
              <div className={styles.devicesListGap}>
                {passkeyList.map((pk) => {
                  const isMobile =
                    pk.name.includes("iOS") ||
                    pk.name.includes("Android") ||
                    pk.name.includes("iPhone") ||
                    pk.name.includes("Mobile");

                  const formattedDate = (() => {
                    try {
                      return new Date(pk.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch {
                      return pk.createdAt;
                    }
                  })();

                  return (
                    <div
                      key={pk.id}
                      className={`${styles.deviceItem} ${pk.isCurrent ? styles.currentDeviceItem : ""}`}
                    >
                      <div className={styles.deviceItemLeft}>
                        <div className={styles.deviceIconBox}>
                          {isMobile ? <Smartphone size={22} /> : <Laptop size={22} />}
                        </div>
                        <div className={styles.deviceInfoTexts}>
                          <div className={styles.deviceNameRow}>
                            <span className={styles.deviceName}>{pk.name}</span>
                            {pk.isCurrent && (
                              <span className={styles.currentDeviceBadge}>هذا الجهاز</span>
                            )}
                          </div>
                          <div className={styles.deviceMetaRow}>
                            <Calendar size={12} />
                            <span>تاريخ التفعيل:</span>
                            <span style={{ fontFamily: "var(--font-heading)" }}>
                              {formattedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setPasskeyToDelete(pk)}
                        className={styles.deactivateDeviceBtn}
                        title="حذف مفتاح المرور"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Another Passkey Action Button */}
          <button
            type="button"
            onClick={onAddPasskey}
            disabled={passkeyLoading}
            className={styles.addPasskeyBtn}
          >
            {passkeyLoading ? (
              <>
                <span className={styles.actionSpinner} />
                <span>يرجى التحقق عبر بصمة الهاتف / الجهاز...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <Fingerprint size={16} />
                <span>إضافة مفتاح مرور جديد (Passkey)</span>
              </>
            )}
          </button>
        </div>
      </CustomModal>

      {/* Passkey Deletion Confirmation Modal */}
      <CustomModal
        isOpen={passkeyToDelete !== null}
        onClose={() => setPasskeyToDelete(null)}
        title="حذف مفتاح المرور"
        message={
          passkeyToDelete
            ? `هل أنت متأكد من حذف مفتاح المرور الخاص بجهاز "${passkeyToDelete.name}"؟ لن تتمكن من استخدامه لتسجيل الدخول السريع بعد الآن.`
            : "هل أنت متأكد من حذف مفتاح المرور؟"
        }
        iconSrc="/images/icons3d/alert.webp"
        borderColor="var(--modelCardBorder)"
        primaryButton={{
          label: "تأكيد الحذف",
          onClick: () => {
            if (passkeyToDelete) {
              executeDeletePasskey(passkeyToDelete.id);
              setPasskeyToDelete(null);
            }
          },
          icon: <Trash2 size={16} />,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setPasskeyToDelete(null),
          icon: <X size={16} />,
        }}
      />
    </>
  );
};
