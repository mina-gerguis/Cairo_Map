"use client";

import React from "react";
import CustomModal from "@/components/common/Modals";

interface PreviewImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function PreviewImageModal({ imageUrl, onClose }: PreviewImageModalProps) {
  if (!imageUrl) return null;

  return (
    <CustomModal isOpen={true} onClose={onClose} title="معاينة الصورة المرفقة">
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="مرفق مكبر"
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            borderRadius: "12px",
            objectFit: "contain",
          }}
        />
      </div>
    </CustomModal>
  );
}
