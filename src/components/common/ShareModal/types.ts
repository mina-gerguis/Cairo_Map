import React from "react";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  shareUrl: string;
  shareText?: string;
  extraInfo?: React.ReactNode;
}
