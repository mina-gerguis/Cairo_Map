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
      className="btn btn-primary"
      {...props}
      style={{
        ...style,
      }}
    >
      {children ?? (editingItem ? "حفظ التغييرات" : "إضافة الموقف")}
    </button>
  );
}