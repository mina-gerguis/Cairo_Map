import React from "react";
import { formatBoxIcon } from "@/data/places";
import { TelecomAccordionProps } from "../types";
import { getDialUrl } from "../utils";
import styles from "../directory.module.css";

export default function TelecomAccordion({
  sectionName,
  codeList,
  isExpanded,
  onToggle,
  activeCompanyColor = "var(--color-secondary)",
  sectionIcon = "bx-folder",
  codeInputs,
  onInputChange,
  copiedId,
  onCopy,
}: TelecomAccordionProps) {
  return (
    <div className={styles.accordionItem}>
      {/* Accordion Header */}
      <div onClick={onToggle} className={styles.accordionHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <i
            className={formatBoxIcon(sectionIcon)}
            style={{ fontSize: "1.1rem", color: activeCompanyColor }}
          ></i>
          <h4
            style={{
              margin: 0,
              fontSize: "0.92rem",
              fontWeight: "700",
              color: "var(--text-primary)",
            }}
          >
            {sectionName}
          </h4>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            ({codeList.length} كود)
          </span>
        </div>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {isExpanded ? (
            <i className="fa-solid fa-chevron-up"></i>
          ) : (
            <i className="fa-solid fa-chevron-down"></i>
          )}
        </span>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className={styles.accordionContent}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {codeList.map((item) => {
              const codeParts = item.code.split(" | ");
              const displayCode = codeParts[0];
              const displayNote = codeParts[1];

              const placeholderMatch = displayCode.match(/\[(.*?)\]/);
              const placeholder = placeholderMatch ? placeholderMatch[1] : null;

              const userVal = codeInputs[item.id] || "";
              const finalCode = userVal
                ? displayCode.replace(/\[.*?\]/, userVal)
                : displayCode;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-glass)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          fontSize: "0.88rem",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.98rem",
                          color: activeCompanyColor,
                          marginTop: "2px",
                          direction: "ltr",
                          textAlign: "right",
                          fontWeight: "800",
                        }}
                      >
                        {finalCode}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => onCopy(finalCode, item.id)}
                        style={{
                          background: isCopied
                            ? "rgba(16, 185, 129, 0.15)"
                            : "var(--bg-secondary)",
                          border: isCopied
                            ? "1px solid var(--colorSuccess)"
                            : "1px solid var(--border-glass)",
                          color: isCopied
                            ? "var(--colorSuccess)"
                            : "var(--text-primary)",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        title="نسخ الكود"
                      >
                        <i
                          className={isCopied ? "fa-solid fa-check" : "fa-solid fa-copy"}
                        ></i>
                        {isCopied ? "تم النسخ" : "نسخ"}
                      </button>

                      <a
                        href={getDialUrl(finalCode)}
                        style={{
                          background: activeCompanyColor,
                          color: "#ffffff",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <i className="fa-solid fa-phone"></i>
                        طلب الكود
                      </a>
                    </div>
                  </div>

                  {/* Dynamic Placeholder Input */}
                  {placeholder && (
                    <div style={{ marginTop: "4px" }}>
                      <input
                        type="text"
                        className="input-fields"
                        placeholder={`أدخل ${placeholder} هنا ثم اضغط طلب الكود...`}
                        value={codeInputs[item.id] || ""}
                        onChange={(e) => onInputChange(item.id, e.target.value)}
                        style={{
                          height: "34px",
                          fontSize: "0.82rem",
                          borderRadius: "6px",
                          width: "100%",
                          direction: "ltr",
                          textAlign: "right",
                        }}
                      />
                    </div>
                  )}

                  {/* Helper Note */}
                  {displayNote && (
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <i className="bx bx-info-circle" />
                      <span>{displayNote}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
