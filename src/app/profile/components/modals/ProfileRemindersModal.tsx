"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/common/Modals";
import { getMainCategoryImage } from "@/data/places";
import { ReminderItem } from "../../types";
import styles from "../../page.module.css";
import { Trash } from "lucide-react";

interface ProfileRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  hasRemindersAccess: boolean;
  reminders: ReminderItem[];
  loadingReminders: boolean;
  onOpenSubModal: () => void;
  handleDeleteReminder: (e: React.MouseEvent, noteId: string) => Promise<void>;
}

export const ProfileRemindersModal: React.FC<ProfileRemindersModalProps> = ({
  isOpen,
  onClose,
  user,
  hasRemindersAccess,
  reminders,
  loadingReminders,
  onOpenSubModal,
  handleDeleteReminder,
}) => {
  const router = useRouter();

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="تذكيراتي وملاحظاتي"
      message={
        hasRemindersAccess
          ? `لديك ${reminders.length} تذكير أو ملاحظة`
          : undefined
      }
      iconSrc={hasRemindersAccess ? "/images/icons3d/book.webp" : "/images/icons3d/padlock.webp"}
      borderColor="var(--modelCardBorder)"
      primaryButton={
        !hasRemindersAccess
          ? !user
            ? {
              label: " سجل دخولك أولاً",
              onClick: () => {
                onClose();
                router.push("/login");
              },
              bgColor: "var(--accentBtn)",
              textColor: "var(--color-foreground)",
            }
            : {
              label: " اشترك أو رقّي حسابك الآن",
              onClick: () => {
                onClose();
                onOpenSubModal();
              },
              bgColor: "var(--accentBtn)",
              textColor: "var(--color-bg)",
            }
          : {
            label: "إغلاق",
            onClick: onClose,
            bgColor: "var(--btn-cancel)",
            textColor: "var(--color-foreground)",
          }
      }
    >
      <div style={{ textAlign: "right" }}>
        {!hasRemindersAccess ? (
          <div style={{ textAlign: "center", padding: "10px 15px", direction: "rtl" }}>
            <h4
              style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: "var(--color-foreground)",
                marginBottom: "10px",
                fontFamily: "var(--font-cairo)",
              }}
            >
              {!user ? "يجب تسجيل الدخول أولاً" : "تنبيه: باقة غير صالحة"}
            </h4>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                marginBottom: "8px",
                fontFamily: "var(--font-cairo)",
              }}
            >
              {!user
                ? "يجب تسجيل الدخول أولاً لكي تتمكن من استخدام ميزة التذكيرات والملاحظات الخاصة بالأماكن."
                : "ميزة التذكيرات والملاحظات الخاصة بالأماكن متوفرة فقط لمشتركي باقة المشوار، الفضية، والذهبية. يرجى الاشتراك أو الترقية لتفعيلها!"}
            </p>
          </div>
        ) : (
          <div className={styles.devicesListContainer}>
            {loadingReminders ? (
              <div className={styles.devicesSpinnerContainer}>
                <div className="spinner" />
                <p>جاري تحميل التذكيرات...</p>
              </div>
            ) : reminders.length === 0 ? (
              <p className={styles.noDevicesText}>لا يوجد أي ملاحظات أو تذكيرات مضافة بعد.</p>
            ) : (
              <div className={styles.devicesListGap}>
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => {
                      onClose();
                      router.push(`/places/${rem.placeId}`);
                    }}
                    className={styles.deviceItem}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.deviceItemLeft}>
                      <div>
                        <img
                          src={getMainCategoryImage(rem.category || "", rem.subCategories || [])}
                          alt={rem.placeName}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: "30px",
                            height: "30px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div className={styles.deviceInfoTexts}>
                        <div className={styles.deviceNameRow}>
                          <span className={styles.deviceName}>{rem.placeName}</span>
                        </div>
                        <p
                          style={{
                            margin: "4px 0",
                            fontSize: "0.88rem",
                            color: "var(--text-secondary)",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {rem.note}
                        </p>
                        <div className={styles.deviceMetaRow}>
                          <span>
                            <i className="bx bx-calendar" style={{ fontSize: "0.95rem" }}></i>{" "}
                            {new Date(rem.updatedAt).toLocaleDateString("ar-EG", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteReminder(e, rem.id)}
                      className={styles.deactivateDeviceBtn}
                      title="حذف الملاحظة"
                    >
                      <Trash size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CustomModal>
  );
};
