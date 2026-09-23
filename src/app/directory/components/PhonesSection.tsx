import React from "react";
import { formatBoxIcon } from "@/data/places";
import { PhonesSectionProps } from "../types";
import PhoneCard from "./PhoneCard";
import styles from "../directory.module.css";

export default function PhonesSection({
  phonesPanelRef,
  entries,
  filteredEntries,
  slicedEntries,
  specialties,
  specialtyIcons,
  selectedSpecialty,
  setSelectedSpecialty,
  visibleCount,
  setVisibleCount,
  copiedId,
  onCopy,
  onOpenSuggestModal,
  onOpenReportModal,
}: PhonesSectionProps) {
  return (
    <div ref={phonesPanelRef} className="details-panel">
      {/* Header with Title and Specialty Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            أرقام خدمة العملاء والخطوط الساخنة
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            عرض {slicedEntries.length} من أصل {filteredEntries.length} جهة مسجلة
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenSuggestModal()}
          className="btn btn-primary"
          style={{
            fontSize: "0.78rem",
            padding: "6px 12px",
            borderRadius: "6px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <i className="fa-solid fa-plus"></i>
          اقتراح إضافة رقم جديد
        </button>
      </div>

      {/* Specialty Filter Badges Slider */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "8px",
          marginBottom: "16px",
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedSpecialty("all")}
          style={{
            background:
              selectedSpecialty === "all"
                ? "var(--color-secondary)"
                : "var(--bg-secondary)",
            border: `1px solid ${
              selectedSpecialty === "all"
                ? "var(--color-secondary)"
                : "var(--border-glass)"
            }`,
            color: selectedSpecialty === "all" ? "#ffffff" : "var(--text-secondary)",
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: "700",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s ease",
          }}
        >
          🌐 الكل ({entries.length})
        </button>
        {specialties.map((spec) => {
          const count = entries.filter((e) => e.specialty === spec).length;
          const active = selectedSpecialty === spec;
          return (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialty(spec)}
              style={{
                background: active ? "var(--color-secondary)" : "var(--bg-secondary)",
                border: `1px solid ${
                  active ? "var(--color-secondary)" : "var(--border-glass)"
                }`,
                color: active ? "#ffffff" : "var(--text-secondary)",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <i className={formatBoxIcon(specialtyIcons[spec] || "bx-building")}></i>
              {spec} ({count})
            </button>
          );
        })}
      </div>

      {/* Phone Cards Grid */}
      {slicedEntries.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
          <h4
            style={{
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            لم يتم العثور على أرقام مطابقة لبحثك
          </h4>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              margin: "0 0 14px",
            }}
          >
            إذا كنت تعرف رقم هذه الجهة أو الخدمة، ساعدنا في إضافتها ليستفيد الجميع!
          </p>
          <button
            type="button"
            onClick={() => onOpenSuggestModal()}
            className="btn btn-primary"
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            <i className="fa-solid fa-plus" style={{ marginLeft: "6px" }}></i>
            اقترح إضافة هذا الرقم الآن
          </button>
        </div>
      ) : (
        <div className={styles.phoneGrid}>
          {slicedEntries.map((entry) => (
            <PhoneCard
              key={entry.id}
              entry={entry}
              isCopied={copiedId === entry.id}
              onCopy={onCopy}
              onReport={onOpenReportModal}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredEntries.length > visibleCount && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="btn"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: "700",
              padding: "8px 24px",
            }}
          >
            عرض المزيد (+8 أرقام)
          </button>
        </div>
      )}
    </div>
  );
}
