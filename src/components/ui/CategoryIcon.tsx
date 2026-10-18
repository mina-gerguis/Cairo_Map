"use client";

import React from "react";
import * as LucideIcons from "lucide-react";

export interface CategoryIconProps {
  icon?: React.ReactNode | string | React.ElementType | null;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  fallback?: string;
}

export function CategoryIcon({
  icon,
  className = "",
  style,
  size = 18,
  fallback = "bx bx-tag",
}: CategoryIconProps) {
  if (!icon) {
    return <i className={`${fallback} ${className}`} style={style} />;
  }

  // 1. If it's already a valid React element: e.g. <CircleParking />
  if (React.isValidElement(icon)) {
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          verticalAlign: "middle",
          ...style,
        }}
      >
        {icon}
      </span>
    );
  }

  // 2. If it's a React component function or forwardRef: e.g. CircleParking
  if (typeof icon === "function" || (typeof icon === "object" && (icon as any)?.$$typeof)) {
    const IconComponent = icon as React.ElementType;
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          verticalAlign: "middle",
          ...style,
        }}
      >
        <IconComponent size={size} style={style} />
      </span>
    );
  }

  // 3. If it's a string
  if (typeof icon === "string") {
    const trimmed = icon.trim();

    // Check if it's formatted as "<IconName />" or "<IconName/>" or just "IconName"
    const lucideMatch = trimmed.match(/^<?([A-Za-z0-9_-]+)(?:\s*\/>|>)?$/);
    const potentialLucideName = lucideMatch ? lucideMatch[1] : null;

    if (potentialLucideName && (LucideIcons as Record<string, any>)[potentialLucideName]) {
      const LucideComponent = (LucideIcons as Record<string, any>)[potentialLucideName];
      return (
        <span
          className={className}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            verticalAlign: "middle",
            ...style,
          }}
        >
          <LucideComponent size={size} style={style} />
        </span>
      );
    }

    // FontAwesome icons: fa-*, fas *, far *, fab *
    if (
      trimmed.startsWith("fa-") ||
      trimmed.startsWith("fa ") ||
      trimmed.startsWith("fas ") ||
      trimmed.startsWith("far ") ||
      trimmed.startsWith("fab ")
    ) {
      return <i className={`${trimmed} ${className}`} style={style} />;
    }

    // Boxicons
    if (
      trimmed.startsWith("bx bx-") ||
      trimmed.startsWith("bxs ") ||
      trimmed.startsWith("bxl ") ||
      trimmed.startsWith("bx ")
    ) {
      return <i className={`${trimmed} ${className}`} style={style} />;
    }
    if (trimmed.startsWith("bx-")) {
      return <i className={`bx ${trimmed} ${className}`} style={style} />;
    }

    // Fallback if it's just a raw Boxicon name like "car" -> "bx bx-car"
    return <i className={`bx bx-${trimmed} ${className}`} style={style} />;
  }

  return <i className={`${fallback} ${className}`} style={style} />;
}

export default CategoryIcon;
