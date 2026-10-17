import React from "react";
import styles from "../signup.module.css";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, style }) => {
  return (
    <div className={`${styles.glassCard} ${className || ""}`} style={style}>
      {children}
    </div>
  );
};
