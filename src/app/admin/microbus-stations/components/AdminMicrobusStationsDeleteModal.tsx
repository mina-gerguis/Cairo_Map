"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { AdminMicrobusStation } from "../types";

interface AdminMicrobusStationsDeleteModalProps {
  itemToDelete: AdminMicrobusStation | null;
  bulkDeleteCount?: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminMicrobusStationsDeleteModal({
  itemToDelete,
  bulkDeleteCount = 0,
  isDeleting,
  onConfirm,
  onCancel
}: AdminMicrobusStationsDeleteModalProps) {
  const isBulk = bulkDeleteCount > 0;
  const isOpen = Boolean(itemToDelete) || isBulk;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isBulk ? "تأكيد الحذف الجماعي" : "تأكيد الحذف"}
      titleColor="#ff3b30"
      iconSrc="/images/icons3d/trash.png"
      borderColor="rgba(255, 59, 48, 0.25)"
      message={
        isBulk
          ? `هل أنت متأكد من حذف (${bulkDeleteCount}) موقف محدد مع كافة خطوط السير الخاصة بها؟`
          : "هل أنت متأكد من حذف هذا السجل؟"
      }
      primaryButton={{
        label: isDeleting ? "جاري الحذف..." : isBulk ? `نعم، احذف (${bulkDeleteCount}) موقف` : "نعم، احذف",
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
