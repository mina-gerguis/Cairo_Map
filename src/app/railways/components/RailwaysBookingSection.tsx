import React, { RefObject } from "react";
import { BOOKING_METHODS } from "../constants";
import styles from "../railways.module.css";

interface RailwaysBookingSectionProps {
  bookingRef: RefObject<HTMLDivElement | null>;
  themeColor: string;
}

export default function RailwaysBookingSection({
  bookingRef,
  themeColor,
}: RailwaysBookingSectionProps) {
  return (
    <div ref={bookingRef} className={styles.bookingCard}>
      <h2 className={styles.sectionHeaderTitle} style={{ fontSize: "1.2rem", margin: "0 0 6px 0" }}>
        <i className="bx bxs-book-open" style={{ color: themeColor, fontSize: "1.3rem" }} />
        <span>كيف يمكنني حجز تذاكر القطارات؟</span>
      </h2>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", lineHeight: "1.6", margin: "0 0 16px 0" }}>
        يمكنك حجز التذاكر بسهولة عبر الطرق المعتمدة رسمياً من الهيئة القومية لسكك حديد مصر لتجنب التزاحم:
      </p>

      <div className={styles.bookingGrid}>
        {BOOKING_METHODS.map((method, idx) => (
          <div key={idx} className={styles.bookingItem}>
            <div className={styles.bookingItemInfo}>
              <h3 className={styles.bookingItemTitle}>
                <span>{method.title}</span>
              </h3>
              <p className={styles.bookingItemDesc}>
                {method.desc}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {method.links.map((link, lIdx) => (
                <a
                  key={lIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bookingActionBtn}
                >
                  <i className={link.icon} style={{ color: link.iconColor || themeColor, fontSize: "1.15rem" }} />
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
