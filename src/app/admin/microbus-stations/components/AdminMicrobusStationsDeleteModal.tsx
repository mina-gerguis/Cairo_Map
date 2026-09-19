"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { AdminMicrobusStation } from "../types";

interface AdminMicrobusStationsDeleteModalProps {
  itemToDelete: AdminMicrobusStation | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminMicrobusStationsDeleteModal({
  itemToDelete,
  isDeleting,
  onConfirm,
  onCancel
}: AdminMicrobusStationsDeleteModalProps) {
  return (
    <CustomModal
      isOpen={Boolean(itemToDelete)}
      onClose={onCancel}
      title="تأكيد الحذف"
      titleColor="#ff3b30"
      iconSrc="/images/icons3d/trash.png"
      borderColor="rgba(255, 59, 48, 0.25)"
      message="هل أنت متأكد من حذف هذا السجل؟"
      primaryButton={{
        label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
        onClick: onConfirm,
        bgColor: "#ff3b30",
        disabled: isDeleting,
        icon: <i className="bx bx-trash" style={{ fontSize: "1.2rem" }} />
      }}
      secondaryButton={{
        label: "إلغاء",
        onClick: onCancel,
        bgColor: "var(--btn-cancel)",
        disabled: isDeleting,
        icon: <i className="bx bx-x" style={{ fontSize: "1.2rem" }} />
      }}
    >
      {itemToDelete && (
        <p
          style={{
            margin: "0",
            color: "#ff4d4d",
            fontSize: "1.05rem",
            fontWeight: "bold",
            textAlign: "center"
          }}
        >
          « {itemToDelete.name} »
        </p>
      )}
    </CustomModal>
  );
}
