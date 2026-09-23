import React from "react";
import { MonorailOverviewPanelProps } from "../types";

export default function MonorailOverviewPanel({
  panelRef,
}: MonorailOverviewPanelProps) {
  return (
    <div ref={panelRef} className="details-panel">
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          margin: "0 0 8px",
        }}
      >
        عن مشروع مونوريل القاهرة الكبرى
      </h2>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          lineHeight: "1.7",
          margin: "0 0 14px",
        }}
      >
        يعد مونوريل القاهرة أطول شبكة مونوريل بدون سائق في العالم بطول إجمالي يقارب
        100 كم لخطيه (شرق وغرب النيل)، حيث ينقل ما يقارب 500 ألف راكب يومياً بوسيلة
        مواصلات حضارية صديقة للبيئة تعمل بقطارات Alstom Innovia 300 فائقة التطور.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              color: "var(--color-secondary)",
              fontSize: "0.88rem",
              marginBottom: "4px",
            }}
          >
            ⚡ سرعة تشغيلية عالية
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              lineHeight: "1.6",
            }}
          >
            سرعة تصميمية تصل إلى 80 كم/ساعة، مما يختصر زمن الرحلة بين نصر والعاصمة
            إلى نحو 60 دقيقة فقط.
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--ra-8)",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              color: "var(--colorSuccess)",
              fontSize: "0.88rem",
              marginBottom: "4px",
            }}
          >
            🔄 تكامل ذكي مع المترو والـ LRT
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              lineHeight: "1.6",
            }}
          >
            محطات تبادلية كبرى في الاستاد ووادي النيل مع الخط الثالث، ومدينة الفنون مع
            القطار الخفيف LRT.
          </div>
        </div>
      </div>
    </div>
  );
}
