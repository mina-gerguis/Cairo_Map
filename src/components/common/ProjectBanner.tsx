import React from "react";
import clsx from "clsx";
import styles from "./ProjectBanner.module.css";

export interface ProjectBannerProps {
  variant?: "success" | "warning" | "error";
  label: React.ReactNode;
  icon?: React.ReactNode;
  callToAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  onClick?: () => void;
  href?: string;
  className?: string;
}

export const ProjectBanner = ({
  variant = "success",
  label,
  icon,
  callToAction,
  onClick,
  href,
  className,
}: ProjectBannerProps) => {
  const variantClass =
    variant === "warning"
      ? styles.variantWarning
      : variant === "error"
      ? styles.variantError
      : styles.variantSuccess;

  const isClickable = Boolean(onClick || href);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const content = (
    <div className={styles.container}>
      <div className={styles.content}>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
        <p className={styles.label}>{label}</p>
      </div>
      {callToAction && (
        <div className={styles.ctaWrapper}>
          {callToAction.href ? (
            <a href={callToAction.href} className={styles.ctaLink}>
              {callToAction.label}
            </a>
          ) : callToAction.onClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                callToAction.onClick?.();
              }}
              className={styles.ctaLink}
            >
              {callToAction.label}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className={clsx(
          styles.banner,
          styles.isClickable,
          variantClass,
          className
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <aside
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={clsx(
        styles.banner,
        isClickable && styles.isClickable,
        variantClass,
        className
      )}
    >
      {content}
    </aside>
  );
};

export default ProjectBanner;
