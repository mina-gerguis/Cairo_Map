import React from "react";
import { Airport } from "../types";
import styles from "../airports.module.css";

interface AirportCardProps {
  airport: Airport;
  isExpanded: boolean;
  onToggleExpand: (id: number | string) => void;
  index: number;
}

export default function AirportCard({
  airport,
  isExpanded,
  onToggleExpand,
  index
}: AirportCardProps) {
  const airportCodes = [airport.iata_code, airport.icao_code]
    .filter(Boolean)
    .join(" / ");

  const mapUrl =
    airport.map_url ||
    (airport.latitude && airport.longitude
      ? `https://maps.google.com/?q=${airport.latitude},${airport.longitude}`
      : undefined);

  return (
    <article
      className={styles.airportCard}
      style={{
        animationDelay: `${Math.min(index + 1, 5) * 80}ms`
      }}
    >
      {/* Top Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerInfo}>
          <h3 className={styles.airportTitle}>{airport.name_ar}</h3>
          {airport.name_en && (
            <div className={styles.airportTitleEn}>{airport.name_en}</div>
          )}
          <div className={styles.badgesRow}>
            {airport.type && (
              <span className={styles.badgeType}>{airport.type}</span>
            )}
            {airportCodes && (
              <span className={styles.badgeCode}>{airportCodes}</span>
            )}
          </div>
        </div>

        <div className={styles.locationCol}>
          <span className={styles.locationLabel}>المحافظة / المدينة</span>
          <span className={styles.locationCity}>
            📍 {airport.city_ar}، {airport.governorate_ar}
          </span>
          {airport.area_ar && (
            <span className={styles.locationArea}>{airport.area_ar}</span>
          )}
        </div>
      </div>

      {/* Short Summary Description */}
      {airport.short_description && (
        <p className={styles.shortDesc}>{airport.short_description}</p>
      )}

      {/* Expandable Detailed Panel */}
      {isExpanded && (
        <div className={styles.expandedPanel}>
          {/* Detailed Description */}
          {airport.description && (
            <div>
              <div className={styles.sectionHeader}>
                <i className={`bx bx-detail ${styles.sectionIcon}`} />
                <span>الوصف التفصيلي:</span>
              </div>
              <p className={styles.detailDesc}>{airport.description}</p>
            </div>
          )}

          {/* Infrastructure & Location Specs */}
          <div className={styles.specsGrid}>
            {/* Infrastructure */}
            <div className={styles.specCard}>
              <div className={styles.specCardTitle}>📐 البنية التحتية والسعة</div>
              <ul className={styles.specList}>
                <li>
                  🚪 <strong>مباني الركاب:</strong>{" "}
                  {airport.terminals_count || "غير محدد"}
                </li>
                <li>
                  👥 <strong>الطاقة الاستيعابية:</strong>{" "}
                  {airport.capacity || "غير محدد"}
                </li>
                <li>
                  🛣️ <strong>المدارج:</strong> {airport.runways_count || "1 مدرج"}{" "}
                  {airport.runways_length
                    ? `(طول: ${airport.runways_length})`
                    : ""}
                </li>
              </ul>
            </div>

            {/* Location & Coordinates */}
            <div className={styles.specCard}>
              <div className={styles.specCardTitle}>🌐 الموقع والعنوان</div>
              <ul className={styles.specList}>
                <li>
                  📍 <strong>العنوان بالتفصيل:</strong>{" "}
                  {airport.address || `${airport.area_ar}، ${airport.city_ar}`}
                </li>
                {airport.latitude && airport.longitude && (
                  <li>
                    🗺️ <strong>الإحداثيات:</strong>{" "}
                    <span className={styles.ltrText}>
                      {airport.latitude.toFixed(6)}° N, {airport.longitude.toFixed(6)}° E
                    </span>
                  </li>
                )}
                {airport.nearby_landmarks && airport.nearby_landmarks.length > 0 && (
                  <li>
                    🏛️ <strong>أقرب معالم:</strong>{" "}
                    {airport.nearby_landmarks.join("، ")}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Flights & Connectivity Specs */}
          <div className={styles.specsGrid}>
            {/* Connections */}
            <div className={styles.specCard}>
              <div className={styles.specCardTitle}>✈️ الرحلات والربط</div>
              <ul className={styles.specList}>
                {airport.connections && airport.connections.length > 0 && (
                  <li>
                    🔄 <strong>ربط المطارات:</strong>{" "}
                    {airport.connections.join("، ")}
                  </li>
                )}
                <li>
                  🏠 <strong>الرحلات الداخلية:</strong>{" "}
                  {airport.domestic_flights ||
                    (airport.type_en === "local" ? "متاح بشكل رئيسي" : "متاح")}
                </li>
                <li>
                  🌐 <strong>الرحلات الدولية:</strong>{" "}
                  {airport.international_flights ||
                    (airport.type_en === "international" || airport.type_en === "bot"
                      ? "متاح"
                      : "غير متاح")}
                </li>
              </ul>
            </div>

            {/* Transit & Parking */}
            <div className={styles.specCard}>
              <div className={styles.specCardTitle}>🚗 المواصلات والوصول</div>
              <ul className={styles.specList}>
                {airport.transportation && airport.transportation.length > 0 && (
                  <li>
                    🚌 <strong>وسائل النقل:</strong>{" "}
                    {airport.transportation.join("، ")}
                  </li>
                )}
                <li>
                  🅿️ <strong>مواقف السيارات:</strong>{" "}
                  {airport.parking || "متوفر موقف سيارات أمام صالة الركاب"}
                </li>
              </ul>
            </div>
          </div>

          {/* Airlines */}
          {airport.airlines && (
            <div>
              <div className={styles.sectionHeader}>
                <i className={`bx bx-buildings ${styles.sectionIcon}`} />
                <span>شركات الطيران العاملة بالمطار:</span>
              </div>
              <p className={styles.detailDesc}>{airport.airlines}</p>
            </div>
          )}

          {/* Services */}
          {airport.services && airport.services.length > 0 && (
            <div>
              <div className={styles.sectionHeader}>
                <i className={`bx bx-grid-alt ${styles.sectionIcon}`} />
                <span>الخدمات والتسهيلات المتاحة:</span>
              </div>
              <div className={styles.servicesWrapper}>
                {airport.services.map((srv, sIdx) => (
                  <span key={sIdx} className={styles.serviceChip}>
                    ✨ {srv}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Toggle Button */}
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => onToggleExpand(airport.id)}
      >
        <span>
          {isExpanded ? "عرض تفاصيل أقل" : "عرض التفاصيل الكاملة للمطار"}
        </span>
        <i
          className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`}
          style={{ fontSize: "1.1rem" }}
        />
      </button>

      {/* Card Footer Contacts & Map */}
      <div className={styles.cardFooter}>
        <div className={styles.contactGroup}>
          <div className={styles.phoneItem}>
            <span className={styles.phoneLabel}>📞 الاستعلامات:</span>
            <span className={styles.phoneValue}>{airport.phone || "غير متوفر"}</span>
          </div>
          {airport.official_website && (
            <a
              href={airport.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteLink}
            >
              <i className="bx bx-link-external" />
              <span>الموقع الرسمي</span>
            </a>
          )}
        </div>

        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapBtn}
          >
            <i className="bx bx-map" style={{ fontSize: "1rem" }} />
            <span>عرض على الخريطة</span>
          </a>
        )}
      </div>
    </article>
  );
}
