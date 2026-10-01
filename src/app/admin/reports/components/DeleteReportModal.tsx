"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { UnifiedReport } from "../types";

interface DeleteReportModalProps {
  item: UnifiedReport | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteReportModal({ item, isDeleting, onConfirm, onClose }: DeleteReportModalProps) {
  if (!item) return null;

  return (
    <CustomModal
      isOpen={true}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title="تأكيد حذف البلاغ"
    >
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            margin: "0 auto 16px",
          }}
        >
          <i className="bx bx-trash"></i>
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "8px", color: "var(--text-primary)" }}>
          هل أنت متأكد من حذف هذا البلاغ؟
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
          سيتم حذف البلاغ نهائياً من سجلات الإدارة ولا يمكن استعادته.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "9px 24px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.88rem",
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isDeleting ? "جاري الحذف..." : "نعم، حذف نهائياً"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="btn btn-cancel"
            style={{ padding: "9px 20px", borderRadius: "10px", fontWeight: "700", fontSize: "0.88rem" }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
