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
          borderBottom: "1px solid var(--borderGlass)",
          paddingBottom: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {iconData.type === "image" && iconData.src ? (
            <img
              src={iconData.src}
              loading="lazy"
              decoding="async"
              style={{ width: "38px", height: "38px", objectFit: "contain" }}
              alt={option.typeName}
            />
          ) : (
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.12)",
                color: "var(--colorSecondary)",
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
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)" }}>
              {option.typeName}
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <span
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#10b981",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "700"
            }}
          >
            💵 الإجمالي: {summary.totalCost} ج.م
          </span>
          <span
            style={{
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              color: "var(--colorSecondary)",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "700"
            }}
          >
            ⏱️ {summary.totalDuration}
          </span>
        </div>
      </div>

      {/* Multi-stage vertical timeline */}
      <RouteLegTimeline legs={legs} />

      {/* Trip Summary Box */}
      <div
        style={{
          background: "var(--bgGlass)",
          border: "1px solid var(--borderGlass)",
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
            background: "var(--bgSecondary)",
            padding: "8px 12px",
            borderRadius: "var(--ra-8)",
            border: "1px solid var(--borderGlass)"
          }}
        >
          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textMuted)" }}>
            هتصرف أجرة بقيمة :
          </span>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#10b981" }}>
            💵 {summary.totalCost} ج.م
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bgSecondary)",
            padding: "8px 12px",
            borderRadius: "var(--ra-8)",
            border: "1px solid var(--borderGlass)"
          }}
        >
          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--textMuted)" }}>
            وقت الوصول المقدر :
          </span>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--colorSecondary)" }}>
            ⏱️ {summary.totalDuration}
          </span>
        </div>
      </div>

      {/* Tips section if available */}
      {option.tips && (
        <div
          style={{
            background: "var(--bgGlass)",
            border: "1px solid var(--borderGlass)",
            borderRadius: "var(--ra-8)",
            padding: "12px 14px"
          }}
        >
          <p style={{ margin: 0, lineHeight: "1.6", fontSize: "0.85rem" }}>
            <i
              className="bx bxs-info-circle"
              style={{ marginLeft: "6px", color: "var(--colorSecondary)", fontSize: "1.1rem", verticalAlign: "middle" }}
            />
            <strong>نصيحة الطريق: </strong>
            <span style={{ color: "var(--textMuted)" }}>{option.tips}</span>
          </p>
        </div>
      )}

      {/* Action Buttons: WhatsApp Share, Maps, Report */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
        <button
          type="button"
          onClick={handleShare}
          style={{
            flex: "1 1 130px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            height: "40px",
            fontWeight: "700",
            fontSize: "0.85rem",
            borderRadius: "var(--ra-8)",
            color: "#ffffff",
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <i className="bx bxl-whatsapp" style={{ fontSize: "1.2rem" }} />
          <span>مشاركة الخط</span>
        </button>

        {option.map_link && (
          <a
            href={option.map_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              flex: "1 1 130px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              height: "40px",
              fontSize: "0.85rem",
            }}
          >
            <i className="bx bx-navigation" style={{ fontSize: "1.1rem" }} />
            <span>خريطة Google</span>
          </a>
        )}

        <button
          type="button"
          className="btn btn-reportProblem"
          onClick={() => onOpenReportModal(option)}
          style={{
            flex: "1 1 130px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            height: "40px",
            fontSize: "0.85rem",
          }}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>الإبلاغ عن خطأ</span>
        </button>
      </div>
    </div>
  );
}
