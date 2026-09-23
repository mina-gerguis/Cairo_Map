"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import styles from "../../page.module.css";

interface ProfileAccountModalsProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  deleteConfirmation: string;
  setDeleteConfirmation: (str: string) => void;
  deleteString: string;
  loading: boolean;
  handleDeleteAccount: () => Promise<void>;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  handleLogout: () => Promise<void>;
}

export const ProfileAccountModals: React.FC<ProfileAccountModalsProps> = ({
  showDeleteModal,
  setShowDeleteModal,
  deleteConfirmation,
  setDeleteConfirmation,
  deleteString,
  loading,
  handleDeleteAccount,
  showLogoutModal,
  setShowLogoutModal,
  handleLogout,
}) => {
  return (
    <>
      {/* Delete Account Modal */}
      <CustomModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation("");
        }}
        title="تحذير: حذف الحساب"
        titleColor="#ff3b30"
        message="هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً."
        iconSrc="/images/icons3d/trash.png"
        borderColor="rgba(255, 59, 48, 0.25)"
        primaryButton={{
          label: loading ? "جاري الحذف..." : "تأكيد",
          onClick: handleDeleteAccount,
          bgColor: "#ff3b30",
          icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }}></i>,
          disabled: deleteConfirmation !== deleteString || loading,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => {
            setShowDeleteModal(false);
            setDeleteConfirmation("");
          },
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>,
          bgColor: "var(--btn-cancel)",
          disabled: loading,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p className={styles.deleteModalPromptText} style={{ marginBottom: "12px" }}>
            يرجى كتابة العبارة التالية للتأكيد:
          </p>
          <div className={styles.deletePhraseBox}>{deleteString}</div>
          <input
            type="text"
            className={`input-fields ${styles.deleteConfirmInput}`}
            style={{ margin: 0, width: "100%", boxSizing: "border-box" }}
            placeholder="اكتب العبارة هنا..."
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
          />
        </div>
      </CustomModal>

      {/* Logout Modal */}
      <CustomModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟"
        iconSrc="/images/icons3d/alert.png"
        borderColor="var(--modelCardBorder)"
        primaryButton={{
          label: loading ? "جاري الخروج..." : "تأكيد",
          onClick: handleLogout,
          bgColor: "var(--mainBtn)",
          icon: <i className="bx bx-log-out" style={{ fontSize: "1.2rem" }}></i>,
          disabled: loading,
        }}
        secondaryButton={{
          label: "إلغاء",
          onClick: () => setShowLogoutModal(false),
          icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }}></i>,
          bgColor: "var(--btn-cancel)",
          disabled: loading,
        }}
      />
    </>
  );
};
