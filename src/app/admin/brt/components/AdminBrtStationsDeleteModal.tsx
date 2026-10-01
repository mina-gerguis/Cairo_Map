"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { AdminBrtStation } from "../types";

interface AdminBrtStationsDeleteModalProps {
  itemToDelete?: AdminBrtStation | null;
  bulkDeleteCount?: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminBrtStationsDeleteModal({
  itemToDelete,
  bulkDeleteCount = 0,
  isDeleting,
  onConfirm,
  onCancel
}: AdminBrtStationsDeleteModalProps) {
  const isBulk = bulkDeleteCount > 0;
  const isOpen = Boolean(itemToDelete || isBulk);

  const title = isBulk ? "تأكيد الحذف الجماعي" : "تأكيد حذف المحطة";
  const message = isBulk
    ? `هل أنت متأكد من رغبتك في حذف (${bulkDeleteCount}) محطة محددة مع جميع مساراتها؟ لا يمكن التراجع عن هذا الإجراء.`
    : `هل أنت متأكد من حذف محطة "${itemToDelete?.name || ""}" مع كافة مساراتها وتفاصيلها؟`;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      message={message}
      iconSrc="/images/icons3d/trash.webp"
      borderColor="#ff000030"
      primaryButton={{
        label: isDeleting ? "جاري الحذف..." : "نعم، احذف",
        onClick: onConfirm,
        bgColor: "#ef4444",
        disabled: isDeleting,
        icon: <i className="bx bx-trash" style={{ fontSize: "1.1rem" }} />
      }}
      secondaryButton={{
        label: "إلغاء",
        onClick: onCancel,
        bgColor: "var(--btn-cancel)",
        disabled: isDeleting,
        icon: <i className="bx bx-x" style={{ fontSize: "1.1rem" }} />
      }}
    />
  );
}
