import React, { useState } from "react";
import { BusCompany } from "../types";
import styles from "../bus-stations.module.css";

interface BusStationCompanyCardProps {
  company: BusCompany;
}

export default function BusStationCompanyCard({ company }: BusStationCompanyCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={styles.companyCard}>
      <div className={styles.companyInfoRow}>
        {company.logo && !imgError && (
          <div className={styles.companyLogoBox}>
            <img
              src={`/images/busStations/${company.logo}`}
              alt={company.name}
              loading="lazy"
              decoding="async"
              className={styles.companyLogo}
              onError={() => setImgError(true)}
            />
          </div>
        )}

        <div>
          <span className={styles.companyName}>{company.name}</span>
          <span className={styles.companyType}>{company.type}</span>
        </div>
      </div>

      {company.phone && (
        <a
          href={`tel:${company.phone}`}
          className={styles.companyCallBtn}
          title={`اتصال بـ ${company.name}`}
        >
          <i className="bx bx-phone" style={{ fontSize: "0.95rem" }} />
          <span>{company.phone}</span>
        </a>
      )}
    </div>
  );
}
