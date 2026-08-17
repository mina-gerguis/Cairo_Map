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
      className="ios-btn"
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #ff0000",
        backgroundColor: "#ff0000",
        color: "#ffffff",
        fontSize: "14px",
        fontFamily: "var(--font-heading)",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,

        ...style,
      }}
    >
      {children}
    </button>
  );
}