import React, { CSSProperties, ReactNode, ButtonHTMLAttributes } from "react";

export interface PrimaryButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  loadingText?: ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent | any) => void;
  className?: string;
  style?: CSSProperties;
}

export default function PrimaryButton({
  label,
  children,
  icon,
  loading = false,
  loadingText,
  disabled = false,
  type = "button",
  className = "",
  style,
  onClick,
  ...props
}: PrimaryButtonProps) {
  const content = children ?? label;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`btn btn-primary ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.1rem" }} />
          {loadingText ? <span>{loadingText}</span> : content ? <span>{content}</span> : null}
        </>
      ) : (
        <>
          {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
          {content}
        </>
      )}
    </button>
  );
}
