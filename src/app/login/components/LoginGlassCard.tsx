import React from "react";
import { LoginGlassCardProps } from "../types";
import styles from "../login.module.css";

export const LoginGlassCard: React.FC<LoginGlassCardProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <div
      className={`${styles.glassCard} ${className || ""}`}
      style={style}
    >
      {children}
    </div>
  );
};
