import React from "react";
import PageHero from "@/components/common/PageHero";
import { LrtHeaderProps } from "../types";

export default function LrtHeader({ headerRef, onOpenReportModal }: LrtHeaderProps) {
  return (
    <PageHero
      headerRef={headerRef}
      title="القطار الكهربائي الخفيف LRT"
      icon={{
        src: "/images/transit/Cairo_lrt.webp",
        alt: "Cairo LRT",
        width: 48,
        height: 48,
      }}
      pillBadge={{
        text: "شبكة القطار الكهربائي الخفيف",
        showDot: true,
      }}
      subtitle="احسب مسار وتكلفة رحلتك في ثوانٍ، تصفح محطات الجذع الرئيسي وتفريعات العاصمة الإدارية والعاشر من رمضان، واعرف محطات التبادل والمعالم الحيوية."
      statsType="tab"
      stats={[
        { label: "3 مسارات وتفريعات" },
        { label: "19 محطة" },
        { label: "سرعة تصل إلى 120 كم/س" },
      ]}
      showAmbientGlow={false}
    >
      <div style={{ marginTop: "14px", display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={onOpenReportModal}
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#ef4444",
            borderRadius: "20px",
            padding: "6px 16px",
            fontSize: "0.8rem",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)")}
        >
          <i className="fa-solid fa-triangle-exclamation" />
          <span>الإبلاغ عن مشكلة في القطار الكهربائي LRT</span>
        </button>
      </div>
    </PageHero>
  );
}
