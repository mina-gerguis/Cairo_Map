import React from "react";
import { RouteOption } from "../types";
import {
  buildLegsFromOption,
  computeTotalTripSummary,
  shareRoute,
  getTransitOptionIconPath
} from "../utils";
import RouteLegTimeline from "./RouteLegTimeline";

interface RouteOptionCardProps {
  option: RouteOption;
  resolvedFrom: string;
  resolvedTo: string;
  onOpenReportModal: (option: RouteOption) => void;
}

export default function RouteOptionCard({
  option,
  resolvedFrom,
  resolvedTo,
  onOpenReportModal,
}: RouteOptionCardProps) {
  const legs = buildLegsFromOption(option);
  const summary = computeTotalTripSummary(option, legs);
  const iconData = getTransitOptionIconPath(option);

  const handleShare = () => {
    shareRoute({
      from: resolvedFrom,
      to: resolvedTo,
      option,
      legs,
      summary
    });
  };

  return (
    <div className="details-panel" style={{ margin: 0 }}>
      {/* Option Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "1px solid var(--border-glass)",
          paddingBottom: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {iconData.type === "image" && iconData.src ? (
            <img
              src={iconData.src}
              loading="lazy"
              decoding="async"
              style={{ width: "40px", height: "auto", objectFit: "contain" }}
              alt={option.typeName}
            />
          ) : (
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.12)",
                color: "var(--color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem"
              }}
            >
              <i className={iconData.iconClass || "bx bx-bus"} />
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", fontFamily: "var(--font-sub)" }}>
              {option.typeName}
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <span
            style={{
              background: "var(--tab-active-bg)",
              border: "1px solid var(--border-glass)",
              color: "var(--tab-active-color)",
              padding: "4px 10px",
              borderRadius: "var(--ra-8)",
              fontSize: "0.82rem",
              fontWeight: "700"
            }}
          >
            مصاريف: {summary.totalCost} ج.م
          </span>
          <span
            style={{
              background: "var(--tab-active-bg)",
              border: "1px solid var(--border-glass)",
              color: "var(--tab-active-color)",
              padding: "4px 10px",
              borderRadius: "var(--ra-8)",
              fontSize: "0.82rem",
              fontWeight: "700"
            }}
          >
            الوقت: {summary.totalDuration}
          </span>
        </div>
      </div>

      {/* Multi-stage vertical timeline */}
      <RouteLegTimeline legs={legs} />

      {/* Trip Summary Box */}
      <div
        style={{
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--ra-8)",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-glass)",
            padding: "8px 12px",
            borderRadius: "var(--ra-8)",
            border: "1px solid var(--border-glass)"
          }}
        >
          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-muted)" }}>
            هتصرف أجرة بقيمة :
          </span>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#10b981" }}>
            {summary.totalCost} جنيه
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-glass)",
            padding: "8px 12px",
            borderRadius: "var(--ra-8)",
            border: "1px solid var(--border-glass)"
          }}
        >
          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-muted)" }}>
            وقت الوصول المقدر :
          </span>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-secondary)" }}>
            {summary.totalDuration}
          </span>
        </div>
      </div>

      {/* Tips section if available */}
      {option.tips && (
        <div
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "12px 14px"
          }}
        >
          <p style={{ margin: 0, lineHeight: "1.6", fontSize: "0.85rem" }}>
            <i
              className="bx bxs-info-circle"
              style={{ marginLeft: "6px", color: "var(--color-secondary)", fontSize: "1.1rem", verticalAlign: "middle" }}
            />
            <strong>نصيحة الطريق: </strong>
            <span style={{ color: "var(--text-muted)" }}>{option.tips}</span>
          </p>
        </div>
      )}

      {/* Action Buttons: WhatsApp Share, Maps, Report */}
      <div>
        <div style={{ display: "flex", gap: "8px", margin: "var(--mg-8) 0" }}>
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-primary"
            style={{
              width: "100%",
            }}
          >
            <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }} />
            <span>مشاركة الخط</span>
          </button>
          {/* Map Link Button */}
          {option.map_link && (
            <a
              href={option.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                width: "100%",
              }}
            >
              <i className="bx bx-navigation" style={{ fontSize: "1.1rem" }} />
              <span>خريطة Google</span>
            </a>
          )}
        </div>
        {/* Report Problem Button */}
        <button
          type="button"
          className="btn btn-report"
          onClick={() => onOpenReportModal(option)}
          style={{
            width: "100%",
            padding: "var(--padding-btn)",
          }}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>الإبلاغ عن خطأ</span>
        </button>
      </div>
    </div>
  );
}
