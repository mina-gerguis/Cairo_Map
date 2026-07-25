"use client";

import React from "react";

export function Field({ 
  children, 
  className = "", 
  style 
}: { 
  children: React.ReactNode; 
  className?: string; 
  style?: React.CSSProperties 
}) {
  return (
    <div className={`field-container ${className}`} style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", position: "relative", ...style }}>
      {children}
    </div>
  );
}

export function Label({ 
  children, 
  htmlFor, 
  className = "", 
  required 
}: { 
  children: React.ReactNode; 
  htmlFor?: string; 
  className?: string; 
  required?: boolean 
}) {
  return (
    <label htmlFor={htmlFor} className={`field-label ${className}`} style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
      {children}
      {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
  );
}

export function Description({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <span className={`field-description ${className}`} style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
      {children}
    </span>
  );
}

export function FieldError({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  if (!children) return null;
  return (
    <span className={`field-error ${className}`} style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
      <i className="bx bx-error-circle" style={{ fontSize: "0.95rem" }}></i>
      {children}
    </span>
  );
}
