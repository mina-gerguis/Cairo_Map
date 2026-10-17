import React from "react";
import { BusStation } from "../types";
import BusStationCompanyCard from "./BusStationCompanyCard";
import styles from "../bus-stations.module.css";

interface BusStationCardProps {
  station: BusStation;
  isExpanded: boolean;
  onToggle: () => void;
  onReportProblem: (station: BusStation) => void;
}

export default function BusStationCard({
  station,
  isExpanded,
  onToggle,
  onReportProblem
}: BusStationCardProps) {
  return (
    <div
      className={`${styles.stationCard} ${isExpanded ? styles.stationCardExpanded : ""}`}
    >
      {/* Accordion Header */}
      <div
        className={styles.stationHeader}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className={styles.stationMain}>
          <div className={styles.stationIconBox}>
            <i className="bx bx-bus" />
          </div>

          <div className={styles.stationMeta}>
            <h3 className={styles.stationName}>{station.name}</h3>
            <span className={styles.stationLocation}>
              <i className="bx bxs-location-plus" style={{ color: "var(--color-red-600, #ef4444)" }} />
              <span>{station.location}</span>
            </span>
          </div>
        </div>

        <div className={styles.stationSideMeta}>
          <span className={styles.governorateBadge}>{station.governorate}</span>
          <i
            className={`bx bx-chevron-down ${styles.chevronIcon} ${
              isExpanded ? styles.chevronExpanded : ""
            }`}
          />
        </div>
      </div>

      {/* Accordion Body */}
      {isExpanded && (
        <div className={styles.stationBody}>
          {/* Station Description */}
          {station.description && (
            <p className={styles.stationDescription}>{station.description}</p>
          )}

          {/* Companies inside station */}
          {Array.isArray(station.companies) && station.companies.length > 0 && (
            <div>
              <strong className={styles.sectionTitle}>
                <i className="bx bxs-bus" style={{ color: "var(--color-secondary)" }} />
                <span>شركات السفر والحجز المتاحة بالداخل:</span>
              </strong>

              <div className={styles.companiesGrid}>
                {station.companies.map((company, idx) => (
                  <BusStationCompanyCard key={`${company.name}-${idx}`} company={company} />
                ))}
              </div>
            </div>
          )}

          {/* Served Destinations */}
          {Array.isArray(station.destinations) && station.destinations.length > 0 && (
            <div>
              <strong className={styles.sectionTitle}>
                <span>🚌 أهم الوجهات المباشرة من الموقف:</span>
              </strong>

              <div className={styles.destinationsWrap}>
                {station.destinations.map((dest, idx) => (
                  <span key={`${dest}-${idx}`} className={styles.destinationTag}>
                    {dest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.reportStationBtn}
              onClick={(e) => {
                e.stopPropagation();
                onReportProblem(station);
              }}
            >
              <i className="bx bx-error-alt" style={{ fontSize: "1.1rem" }} />
              <span>الإبلاغ عن خطأ في البيانات</span>
            </button>

            {station.map_url && (
              <a
                href={station.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapDirectionsBtn}
                onClick={(e) => e.stopPropagation()}
              >
                <i className="bx bx-map" style={{ fontSize: "1.15rem" }} />
                <span>عرض الموقع والاتجاهات</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
