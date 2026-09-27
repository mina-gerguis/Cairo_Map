import React from "react";
import Link from "next/link";
import styles from "./CardsSlider.module.css";
import { CardsSliderProps, CardsSliderItem } from "./types";

export default function CardsSlider({
  containerRef,
  title,
  titleIcon,
  action,
  items,
  className = "",
  sliderClassName = "",
  cardClassName = "",
  emptyState = null,
  itemMinWidth = "min-w-44",
  itemMaxWidth = "max-w-56",
}: CardsSliderProps) {
  if (!items || items.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  const renderIcon = (item: CardsSliderItem, glow: string) => {
    if (!item.icon) {
      return (
        <i
          className="fa-solid fa-route"
          style={{ color: glow, fontSize: "1rem" }}
        />
      );
    }

    if (React.isValidElement(item.icon)) {
      return item.icon;
    }

    if (typeof item.icon === "string") {
      return (
        <img
          src={item.icon}
          alt={typeof item.title === "string" ? item.title : "icon"}
          className={styles.iconImg}
          loading="lazy"
        />
      );
    }

    return null;
  };

  const renderCardContent = (item: CardsSliderItem, glow: string) => (
    <>
      <div className="flex items-center justify-between w-full mb-2">
        <div className={styles.iconWrapper}>
          {renderIcon(item, glow)}
        </div>
        {item.badge && (
          <div className="shrink-0">{item.badge}</div>
        )}
      </div>

      <div>
        <div className={styles.cardTitle}>
          {item.title}
        </div>
        {item.subtitle && (
          <div className={styles.cardSubtitle}>
            {item.subtitle}
          </div>
        )}
      </div>
    </>
  );

  return (
    <section
      ref={containerRef}
      className={`${styles.sliderContainer} ${className}`.trim()}
      aria-label={typeof title === "string" ? title : undefined}
    >
      {(title || action) && (
        <div className={styles.header}>
          {title && (
            <h2 className={styles.title}>
              {titleIcon}
              <span>{title}</span>
            </h2>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`${styles.track} ${sliderClassName}`.trim()}>
        {items.map((item, idx) => {
          const glow = item.accentColor || "#3b82f6";
          const cardKey = item.id ? String(item.id) : `slider-item-${idx}`;

          const cardStyle: React.CSSProperties & { [key: string]: any } = {
            background: `radial-gradient(135px circle at top right, ${glow}28 0%, ${glow}0a 45%, transparent 75%), var(--bg-glass)`,
            "--card-glow-color": glow,
          };

          const combinedClassName = `${styles.card} ${itemMinWidth} ${itemMaxWidth} ${cardClassName}`.trim();
          const ariaLabel =
            item.ariaLabel ||
            (typeof item.title === "string" ? item.title : undefined);

          if (item.href) {
            return (
              <Link
                key={cardKey}
                href={item.href}
                className={combinedClassName}
                style={cardStyle}
                aria-label={ariaLabel}
                onClick={item.onClick}
              >
                {renderCardContent(item, glow)}
              </Link>
            );
          }

          return (
            <button
              key={cardKey}
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              className={combinedClassName}
              style={cardStyle}
              aria-label={ariaLabel}
            >
              {renderCardContent(item, glow)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
