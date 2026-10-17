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
          <div className={styles.guideCardIconBox}>
            <i className="bx bx-receipt" />
          </div>
          <div>
            <h2 className={styles.guideCardTitle}>طرق وإجراءات حجز تذاكر الطيران</h2>
            <p className={styles.guideCardSubtitle}>
              الخيارات المتاحة والخطوات الصحيحة لحجز التذاكر بأفضل الأسعار وبأمان تام
            </p>
          </div>
        </div>

        <div>
          <h3 className={styles.guideSectionTitle}>
            <i className="bx bx-world" />
            <span>قنوات الحجز المعتمدة:</span>
          </h3>
          <ul className={styles.guideList}>
            {BOOKING_METHODS.map((method, idx) => (
              <li key={idx}>
                <strong>{method.title}</strong> {method.description}{" "}
                {method.links && method.links.length > 0 && (
                  <div className={styles.guideLinksRow}>
                    {method.links.map(link => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.guideExternalLink}
                      >
                        <i className="bx bx-link-external" />
                        <span>{link.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.guideDivider}>
          <h3 className={styles.guideSectionTitle}>
            <i className="bx bx-list-ol" />
            <span>خطوات حجز التذكرة إلكترونياً بالتفصيل:</span>
          </h3>
          <div className={styles.guideStepsList}>
            {BOOKING_STEPS.map((step, idx) => (
              <div key={idx} className={styles.guideStepItem}>
                <div className={styles.guideStepNum}>{idx + 1}</div>
                <div className={styles.guideStepText}>
                  {step.replace(/^[0-9️⃣\s]+/, "")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Card 2: Airport entry instructions & necessary documents */}
      <section className={styles.guideCard}>
        <div className={styles.guideCardHeader}>
          <div className={styles.guideCardIconBox}>
            <i className="bx bx-buildings" />
          </div>
          <div>
            <h2 className={styles.guideCardTitle}>تعليمات دخول وصالات المطارات</h2>
            <p className={styles.guideCardSubtitle}>
              المستندات المطلوبة وإجراءات الفحص والوزن والجوازات خطوة بخطوة
            </p>
          </div>
        </div>

        <div>
          <h3 className={styles.guideSectionTitle}>
            <i className="bx bx-id-card" />
            <span>المستندات اللازمة والضرورية:</span>
          </h3>
          <ul className={styles.guideList}>
            {REQUIRED_DOCUMENTS.map((doc, idx) => (
              <li key={idx}>{doc}</li>
            ))}
          </ul>
        </div>

        <div className={styles.guideDivider}>
          <h3 className={styles.guideSectionTitle}>
            <i className="bx bx-walk" />
            <span>الإجراءات والتسلسل الزمني داخل المطار:</span>
          </h3>
          <div className={styles.guideStepsList}>
            {AIRPORT_STEPS.map((step, idx) => (
              <div key={idx} className={styles.guideStepItem}>
                <div className={styles.guideStepNum}>{idx + 1}</div>
                <div className={styles.guideStepText}>
                  {step.replace(/^[0-9️⃣\s]+/, "")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Card 3: Tips for travelers */}
      <section className={styles.guideCard}>
        <div className={styles.guideCardHeader}>
          <div className={`${styles.guideCardIconBox} ${styles.guideCardIconBoxWarning}`}>
            <i className="bx bx-info-circle" />
          </div>
          <div>
            <h2 className={styles.guideCardTitle}>نصائح وإرشادات هامة للمسافرين</h2>
            <p className={styles.guideCardSubtitle}>
              توصيات وقواعد هامة لتجنب المشاكل وضمان رحلة سفر سلسة ومريحة
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {TRAVEL_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className={tip.isWarning ? styles.warningBox : styles.tipBox}
            >
              <div className={styles.tipHeader}>
                <i className={tip.isWarning ? "bx bx-error" : "bx bx-bulb"} />
                <strong
                  className={tip.isWarning ? styles.warningTitle : styles.tipTitle}
                >
                  {tip.title}
                </strong>
              </div>
              <p className={styles.tipText}>{tip.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
