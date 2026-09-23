import React, { RefObject } from "react";
import { Port } from "../types";
import PortCard from "./PortCard";
import styles from "../ports.module.css";

interface PortsResultsSectionProps {
  resultsPanelRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  ports: Port[];
  searchQuery: string;
  expandedPort: string | null;
  onToggleExpand: (name: string) => void;
}

export default function PortsResultsSection({
  resultsPanelRef,
  loading,
  ports,
  searchQuery,
  expandedPort,
  onToggleExpand,
}: PortsResultsSectionProps) {
  if (loading) {
    return (
      <div
        ref={resultsPanelRef}
        className={styles.portCard}
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <div className={styles.loadingSpinner} style={{ margin: "0 auto 12px" }} />
        <span style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
          جاري تحميل بيانات الموانئ البحرية...
        </span>
      </div>
    );
  }

  return (
    <div
      id="ports-results-section"
      ref={resultsPanelRef}
      className={styles.portsGrid}
    >
      {ports.length > 0 ? (
        ports.map((port, idx) => (
          <PortCard
            key={port.id || idx}
            port={port}
            isExpanded={expandedPort === port.name}
            onToggleExpand={() => onToggleExpand(port.name)}
          />
        ))
      ) : (
        <div className={styles.emptyNoticeCard}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⚓</div>
          <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
            لا توجد موانئ مطابقة لبحثك {searchQuery ? `"${searchQuery}"` : ""}
          </p>
          <span style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
            يرجى مراجعة كلمات البحث أو تجربة اختيار تصنيف بحري مختلف من القائمة بالأعلى.
          </span>
        </div>
      )}
    </div>
  );
}
