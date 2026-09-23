import React from "react";
import {
  BOOKING_METHODS,
  BOOKING_STEPS,
  REQUIRED_DOCUMENTS,
  AIRPORT_STEPS,
  TRAVEL_TIPS
} from "../constants";
import styles from "../airports.module.css";

export default function AirportsTravelGuide() {
  return (
    <div className={styles.guideCardsList}>
      {/* Card 1: How to book & Steps */}
      <section className={styles.guideCard}>
        <div className={styles.guideCardHeader}>
          <i
            className="bx bx-receipt"
            style={{ color: "var(--color-secondary)", fontSize: "1.6rem" }}
          />
          <h2 className={styles.guideCardTitle}>طرق وحجز تذاكر الطيران</h2>
        </div>

        <div>
          <h3 className={styles.guideSectionTitle}>🎒 طرق الحجز المتاحة:</h3>
          <ul className={styles.guideList}>
            {BOOKING_METHODS.map((method, idx) => (
              <li key={idx}>
                <strong>{method.title}</strong> {method.description}{" "}
                {method.links && method.links.length > 0 && (
                  <span>
                    (
                    {method.links.map((link, lIdx) => (
                      <React.Fragment key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.guideExternalLink}
                        >
                          {link.name}
                        </a>
                        {lIdx < (method.links?.length ?? 0) - 1 ? "، " : ""}
                      </React.Fragment>
                    ))}
                    )
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.guideDivider}>
          <h3 className={styles.guideSectionTitle}>
            📝 خطوات حجز التذكرة إلكترونياً:
          </h3>
          <ol className={styles.guideList}>
            {BOOKING_STEPS.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* Card 2: Airport entry instructions & necessary documents */}
      <section className={styles.guideCard}>
        <div className={styles.guideCardHeader}>
          <i
            className="bx bx-buildings"
            style={{ color: "var(--color-secondary)", fontSize: "1.6rem" }}
          />
          <h2 className={styles.guideCardTitle}>تعليمات دخول المطار</h2>
        </div>

        <div>
          <h3 className={styles.guideSectionTitle}>
            🛂 المستندات اللازمة والضرورية (اللازم منه):
          </h3>
          <ul className={styles.guideList}>
            {REQUIRED_DOCUMENTS.map((doc, idx) => (
              <li key={idx}>{doc}</li>
            ))}
          </ul>
        </div>

        <div className={styles.guideDivider}>
          <h3 className={styles.guideSectionTitle}>
            🚶‍♂️ الخطوات والتعليمات داخل المطار:
          </h3>
          <ol className={styles.guideList}>
            {AIRPORT_STEPS.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* Card 3: Tips for travelers */}
      <section className={styles.guideCard}>
        <div className={styles.guideCardHeader}>
          <i
            className="bx bx-info-circle"
            style={{ color: "#f59e0b", fontSize: "1.6rem" }}
          />
          <h2 className={styles.guideCardTitle}>نصائح هامة للمسافرين</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {TRAVEL_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className={tip.isWarning ? styles.warningBox : styles.tipBox}
            >
              <strong
                className={tip.isWarning ? styles.warningTitle : styles.tipTitle}
              >
                {tip.title}
              </strong>
              <span className={styles.tipText}>{tip.description}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
