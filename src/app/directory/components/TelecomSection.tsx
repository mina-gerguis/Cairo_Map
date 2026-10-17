import React from "react";
import Image from "next/image";
import { TelecomSectionProps } from "../types";
import { COMPANY_META } from "../constants";
import TelecomAccordion from "./TelecomAccordion";
import styles from "../directory.module.css";

export default function TelecomSection({
  telecomPanelRef,
  codes,
  activeCompany,
  setActiveCompany,
  groupedCodes,
  expandedSections,
  onToggleSection,
  codeInputs,
  onInputChange,
  copiedId,
  onCopy,
  searchQuery,
  sectionIcons,
  onOpenSuggestModal,
}: TelecomSectionProps) {
  const currentCompanyMeta = COMPANY_META[activeCompany];

  return (
    <div ref={telecomPanelRef} className="details-panel">
      {/* Header */}
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
            دليل أكواد وخدمات شبكات المحمول
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            أكواد باقات الإنترنت، الرصيد، الكاش، وخدمات المكالمات
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
          اقتراح كود جديد
        </button>
      </div>

      {/* Company Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "8px",
          marginBottom: "16px",
        }}
      >
        {Object.entries(COMPANY_META).map(([key, meta]) => {
          const count = codes.filter((c) => c.company === key).length;
          const active = activeCompany === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCompany(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: active ? meta.bg : "var(--bg-secondary)",
                border: active
                  ? `2px solid ${meta.color}`
                  : "1px solid var(--border-glass)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "6px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: "700",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <Image
                src={`/images/company/${meta.logo}`}
                alt={meta.label}
                width={20}
                height={20}
                style={{ borderRadius: "50%" }}
              />
              <span>{meta.label}</span>
              <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Accordions of codes */}
      {Object.keys(groupedCodes).length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
          <h4
            style={{
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            لا توجد أكواد مطابقة لبحثك في شبكة {currentCompanyMeta?.label}
          </h4>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              margin: "0 0 14px",
            }}
          >
            إذا كنت تعرف كود هذه الخدمة، اقترحه الآن على الإدارة لإضافته للدليل!
          </p>
          <button
            type="button"
            onClick={() => onOpenSuggestModal()}
            className="btn btn-primary"
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            <i className="fa-solid fa-plus" style={{ marginLeft: "6px" }}></i>
            اقترح إضافة هذا الكود
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.entries(groupedCodes).map(([sectionName, codeList]) => {
            const isExpanded =
              searchQuery.trim() !== "" || !!expandedSections[sectionName];

            return (
              <TelecomAccordion
                key={sectionName}
                sectionName={sectionName}
                codeList={codeList}
                isExpanded={isExpanded}
                onToggle={() => onToggleSection(sectionName)}
                activeCompanyColor={currentCompanyMeta?.color}
                sectionIcon={sectionIcons[sectionName]}
                codeInputs={codeInputs}
                onInputChange={onInputChange}
                copiedId={copiedId}
                onCopy={onCopy}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
