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
  className?: string;
}

export const ProjectBanner = ({
  variant = "success",
  label,
  icon,
  callToAction,
  className,
}: ProjectBannerProps) => {
  const variantClass =
    variant === "warning"
      ? styles.variantWarning
      : variant === "error"
      ? styles.variantError
      : styles.variantSuccess;

  return (
    <aside className={clsx(styles.banner, variantClass, className)}>
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
                onClick={callToAction.onClick}
                className={styles.ctaLink}
              >
                {callToAction.label}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProjectBanner;
