import React from "react";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editingItem?: boolean;
}

export default function SubmitButton({
  editingItem = false,
  children,
  style,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="ios-btn"
      {...props}
      style={{
        margin: 0,
        background:
          "linear-gradient(135deg, #1100ffff 0%, #1100ffff 100%)",
        color: "#fff",
        padding: "10px 24px",
        ...style,
      }}
    >
      {children ?? (editingItem ? "حفظ التغييرات" : "إضافة الموقف")}
    </button>
  );
}