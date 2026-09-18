import React from "react";
import styles from "../directions.module.css";
import { GroupedRouteOption } from "../types";
import { getTransitOptionIconPath } from "../utils";
import { RouteCardLegTimeline } from "./RouteCardLegTimeline";

interface RouteCardOptionItemProps {
  option: GroupedRouteOption;
}

export function RouteCardOptionItem({ option }: RouteCardOptionItemProps) {
  const iconRes = getTransitOptionIconPath(option);

  return (
    <div className={styles.optionItem}>
      {/* Option Meta Bar */}
      <div className={styles.optionMeta}>
        <div className={styles.vehicleTypeGroup}>
          <div className={styles.vehicleIcon}>
            {iconRes.type === "image" && iconRes.src ? (
              <img
                src={iconRes.src}
                alt=""
                style={{ width: "22px", height: "auto", objectFit: "contain" }}
              />
            ) : (
              <i className={iconRes.iconClass || "bx bx-bus"} />
            )}
          </div>
          <span className={styles.vehicleName}>{option.type_name}</span>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <span className="tab">
            <i className="bx bx-wallet" />
            <span>{option.cost} ج.م</span>
          </span>
          <span className="tab">
            <i className="bx bx-time-five" />
            <span>{option.duration}</span>
          </span>
        </div>
      </div>

      {/* Journey Legs Stepper Timeline */}
      {option.legs && Array.isArray(option.legs) && option.legs.length > 0 ? (
        <RouteCardLegTimeline legs={option.legs} />
      ) : (
        <ol className={styles.stepList} style={{ paddingRight: "20px" }}>
          {(option.steps || []).map((step, stepIdx) => (
            <li key={stepIdx}>{step}</li>
          ))}
        </ol>
      )}

      {/* Tips Callout */}
      {option.tips && (
        <div className={styles.tipBanner}>
          <i className="bx bx-bulb" style={{ fontSize: "1.1rem" }} />
          <span>
            <strong>نصيحة للمسافرين:</strong> {option.tips}
          </span>
        </div>
      )}

      {/* Map Link Callout */}
      {option.map_link && (
        <div className={styles.mapBanner}>
          <i className="bx bx-map-pin" style={{ fontSize: "1.1rem" }} />
          <span>
            <strong>مسار بدء الرحلة:</strong>{" "}
            <a
              href={option.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              فتح الخريطة عبر Google Maps
            </a>
          </span>
        </div>
      )}
    </div>
  );
}
