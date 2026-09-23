"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { UserDevice } from "../../types";
import styles from "../../page.module.css";

interface ProfileDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  devicesList: UserDevice[];
  loadingDevices: boolean;
  deviceToDeactivate: {
    deviceId: string;
    sessionId: string;
    isCurrentDevice: boolean;
  } | null;
  setDeviceToDeactivate: (
    device: { deviceId: string; sessionId: string; isCurrentDevice: boolean } | null
  ) => void;
  handleDeactivateDevice: (deviceId: string, sessionId: string) => void;
  executeDeactivateDevice: (
    deviceId: string,
    sessionId: string,
    isCurrentDevice: boolean
  ) => Promise<void>;
}

export const ProfileDevicesModal: React.FC<ProfileDevicesModalProps> = ({
  isOpen,
  onClose,
  devicesList,
  loadingDevices,
  deviceToDeactivate,
  setDeviceToDeactivate,
  handleDeactivateDevice,
  executeDeactivateDevice,
}) => {
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="الجلسات النشطة"
        message="الأجهزة المسجلة حالياً بحسابك. يمكنك تسجيل الخروج من أي جهاز عن بُعد."
        iconSrc="/images/icons3d/phone.png"
        primaryButton={{
          label: "إغلاق",
          onClick: onClose,
          bgColor: "var(--btn-cancel)",
          textColor: "var(--text-primary)",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div className={styles.devicesListContainer}>
            {loadingDevices ? (
              <div className={styles.devicesSpinnerContainer}>
                <div className="spinner" />
                <p>جاري تحميل الأجهزة...</p>
              </div>
            ) : devicesList.length === 0 ? (
              <p className={styles.noDevicesText} style={{ textAlign: "center" }}>
                لا توجد أجهزة مسجلة حالياً.
              </p>
            ) : (
              <div className={styles.devicesListGap}>
                {devicesList.map((device) => {
                  const isCurrent =
                    typeof window !== "undefined" &&
                    device.session_id === localStorage.getItem("dftry_device_session_id");
                  return (
                    <div
                      key={device.id}
                      className={`${styles.deviceItem} ${
                        isCurrent ? styles.currentDeviceItem : ""
                      }`}
                    >
                      <div className={styles.deviceItemLeft}>
                        <div className={styles.deviceIconBox}>
                          <i
                            className={`bx ${
                              device.device_name.includes("iOS") ||
                              device.device_name.includes("Android")
                                ? "bx-mobile-alt"
                                : "bx-laptop"
                            } ${styles.deviceIcon}`}
                          ></i>
                        </div>
                        <div className={styles.deviceInfoTexts}>
                          <div className={styles.deviceNameRow}>
                            <span className={styles.deviceName}>{device.device_name}</span>
                            {isCurrent && (
                              <span className={styles.currentDeviceBadge}>هذا الجهاز</span>
                            )}
                            {device.is_active && !isCurrent && (
                              <span className={styles.activeDeviceBadge}>نشط</span>
                            )}
                          </div>
                          <div className={styles.deviceMetaRow}>
                            <span>📍 {device.location || "موقع غير معروف"}</span>
                            <span className={styles.metaDivider}>•</span>
                            <span style={{ fontFamily: "var(--font-heading)" }}>
                              📅{" "}
                              {new Date(device.logged_in_at).toLocaleDateString("ar-EG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {!device.is_active && device.logged_out_at && (
                            <div className={styles.loggedOutTimeText}>
                              تم تسجيل الخروج في:{" "}
                              {new Date(device.logged_out_at).toLocaleDateString("ar-EG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {device.is_active && (
                        <button
                          onClick={() => handleDeactivateDevice(device.id, device.session_id)}
                          className={styles.deactivateDeviceBtn}
                          title="تسجيل الخروج وإنهاء الجلسة"
                        >
                          <i className="bx bx-log-out"></i>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CustomModal>

      {/* Deactivation Confirmation Modal */}
      <CustomModal
        isOpen={deviceToDeactivate !== null}
        onClose={() => setDeviceToDeactivate(null)}
        title={
          deviceToDeactivate?.isCurrentDevice
            ? "تسجيل الخروج من الجهاز الحالي"
            : "إنهاء جلسة الجهاز"
        }
        message={
          deviceToDeactivate?.isCurrentDevice
            ? "هل أنت متأكد من تسجيل الخروج من جهازك الحالي؟"
            : "هل أنت متأكد من إنهاء جلسة هذا الجهاز؟ سيتم تسجيل الخروج منه فوراً."
        }
        iconSrc="/images/icons3d/alert.png"
        borderColor="var(--modelCardBorder)"
        primaryButton={{
          label: "تأكيد",
          onClick: () => {
            if (deviceToDeactivate) {
              executeDeactivateDevice(
                deviceToDeactivate.deviceId,
                deviceToDeactivate.sessionId,
                deviceToDeactivate.isCurrentDevice
              );
              setDeviceToDeactivate(null);
            }
          },
          bgColor: "var(--mainBtn)",
          icon: <i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i>,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setDeviceToDeactivate(null),
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>,
          bgColor: "var(--btn-cancel)",
        }}
      />
    </>
  );
};
