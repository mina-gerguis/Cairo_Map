"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";
import { DeletePlaceDbData } from "../types";

interface DeletePlaceDbModalProps {
  data: DeletePlaceDbData | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeletePlaceDbModal({ data, isDeleting, onConfirm, onClose }: DeletePlaceDbModalProps) {
  if (!data) return null;

  return (
    <CustomModal
      isOpen={true}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title="حذف المكان نهائياً من الموقع"
    >
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 16px",
          }}
        >
          <i className="bx bx-error-alt"></i>
        </div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "8px", color: "#ef4444" }}>
          تحذير: حذف المكان بالكامل من قاعدة البيانات
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.6", marginBottom: "20px" }}>
          أنت على وشك حذف مكان « <strong>{data.placeName}</strong> » وكافة تقييماته وفروعه ومعلوماته نهائياً من دليل الأماكن. هل تريد المتابعة؟
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
              padding: "10px 24px",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "0.9rem",
              cursor: isDeleting ? "not-allowed" : "pointer",
            }}
          >
            {isDeleting ? "جاري حذف المكان..." : "تأكيد الحذف النهائي للمكان"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="btn btn-cancel"
            style={{ padding: "10px 20px", borderRadius: "10px", fontWeight: "700" }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
