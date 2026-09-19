import type { CSSProperties, ReactNode } from "react";

interface CancelButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
}

export default function CancelButton({
  onClick,
  children = "إلغاء",
  disabled = false,
  style,
}: CancelButtonProps) {
  return (
    <button
      className="btn btn-cancel"
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{

        ...style,
      }}
    >
      {children}
    </button>
  );
}