import React from "react";
import { Airport } from "../types";
import styles from "../airports.module.css";

interface AirportCardProps {
  airport: Airport;
  isExpanded: boolean;
  onToggleExpand: (id: number | string) => void;
  onReport?: (airport: Airport) => void;
  index: number;
}

export default function AirportCard({
  airport,
  isExpanded,
  onToggleExpand,
  onReport,
  index
}: AirportCardProps) {
  const isInternational =
    airport.type_en === "international" || airport.type?.includes("دولي");

  const airportCodes = [airport.iata_code, airport.icao_code]
    .filter(Boolean)
    .join(" • ");

  const mapUrl =
    airport.map_url ||
    (airport.latitude && airport.longitude
      ? `https://maps.google.com/?q=${airport.latitude},${airport.longitude}`
      : undefined);

  return (
    <article
      id={`airport-card-${airport.slug || airport.id}`}
      className={`${styles.airportCard} ${isExpanded ? styles.airportCardExpanded : ""}`}
      style={{
        animationDelay: `${Math.min(index + 1, 6) * 60}ms`
      }}
    >
      {/* Top Header */}
      <div className={styles.cardHeader}>
        <div className={styles.airportHeaderMain}>
          <div
            className={`${styles.airportIconBox} ${
              isInternational ? styles.airportIconBoxIntl : styles.airportIconBoxLocal
            }`}
          >
            <i className={isInternational ? "bx bxs-plane-alt" : "bx bx-plane-takeoff"} />
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.titleRow}>
              <h3 className={styles.airportTitle}>{airport.name_ar}</h3>
              {airport.status && airport.status !== "active" && (
                <span className={styles.badgeInactive}>مغلق مؤقتاً</span>
              )}
            </div>

            {airport.name_en && (
              <div className={styles.airportTitleEn}>{airport.name_en}</div>
            )}

            <div className={styles.badgesRow}>
              {airport.type && (
                <span
                  className={`${styles.badgeType} ${
                    isInternational ? styles.badgeTypeIntl : styles.badgeTypeLocal
                  }`}
                >
                  <i className={isInternational ? "bx bx-globe" : "bx bx-home"} />
                  <span>{airport.type}</span>
                </span>
              )}

              {airportCodes && (
                <span className={styles.badgeCode} title="IATA / ICAO Code">
                  <i className="bx bx-barcode" />
                  <span>{airportCodes}</span>
                </span>
              )}

              <span className={styles.badgeLocation}>
                <i className="bx bx-map-pin" />
                <span>{airport.city_ar}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Location pill */}
        <div className={styles.locationCol}>
          <span className={styles.locationGov}>{airport.governorate_ar}</span>
          {airport.area_ar && (
            <span className={styles.locationArea}>{airport.area_ar}</span>
          )}
        </div>
      </div>

      {/* Short Summary Description */}
      {airport.short_description && (
        <p className={styles.shortDesc}>{airport.short_description}</p>
      )}

      {/* Quick Highlights Bar */}
      <div className={styles.quickStatsRow}>
        <div className={styles.quickStatItem}>
          <span className={styles.quickStatLabel}>
            <i className="bx bx-door-open" /> مباني الركاب:
          </span>
          <span className={styles.quickStatValue}>
            {airport.terminals_count || "صالة واحدة"}
          </span>
        </div>

        {airport.capacity && (
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>
              <i className="bx bx-group" /> الطاقة الاستيعابية:
            </span>
            <span className={styles.quickStatValue}>{airport.capacity}</span>
          </div>
        )}

        {airport.runways_count && (
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>
              <i className="bx bx-navigation" /> المدارج:
            </span>
            <span className={styles.quickStatValue}>{airport.runways_count}</span>
          </div>
        )}
      </div>

      {/* Expandable Detailed Panel */}
      {isExpanded && (
        <div className={styles.expandedPanel}>
          {/* Detailed Description */}
          {airport.description && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <i className="bx bx-detail" />
                <span>عن المطار ونشأته:</span>
              </div>
              <p className={styles.detailDesc}>{airport.description}</p>
            </div>
          )}

          {/* Infrastructure & Location Specs */}
          <div className={styles.specsGrid}>
            {/* Infrastructure */}
            <div className={styles.specCard}>
              <div className={styles.specCardTitle}>
                <i className="bx bx-building" />
                <span>البنية التحتية والمباني</span>
              </div>
              <ul className={styles.specList}>
                <li>
                  🚪 <strong>مباني الركاب:</strong> {airport.terminals_count || "غير محدد"}
                </li>
                <li>
                  👥 <strong>السعة السنوية:</strong> {airport.capacity || "غير محدد"}
                </li>
                <li>
                  🛣️ <strong>المدارج:</strong> {airport.runways_count || "1 مدرج"}{" "}
                  {airport.runways_length ? `(طول: ${airport.runways_length})` : ""}
                </li>
              </ul>
            </div>

            {/* Location & Coordinates */}
            <div className={styles.specCard}>
              <div className={styles.specCardTitle}>
                <i className="bx bx-map-alt" />
                <span>الموقع والعنوان الجغرافي</span>
              </div>
              <ul className={styles.specList}>
                <li>
                  📍 <strong>العنوان:</strong>{" "}
                  {airport.address || `${airport.area_ar}، ${airport.city_ar}`}
                </li>
                {airport.latitude && airport.longitude && (
                  <li>
                    🗺️ <strong>الإحداثيات:</strong>{" "}
                    <span className={styles.ltrText}>
                      {airport.latitude.toFixed(5)}° N, {airport.longitude.toFixed(5)}° E
                    </span>
                  </li>
                )}
                {airport.nearby_landmarks && airport.nearby_landmarks.length > 0 && (
                  <li>
                    🏛️ <strong>أبرز المعالم القريبة:</strong>{" "}
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
              <div className={styles.specCardTitle}>
                <i className="bx bx-trip" />
                <span>الرحلات والربط الجوي</span>
              </div>
              <ul className={styles.specList}>
                <li>
                  🏠 <strong>الرحلات الداخلية:</strong>{" "}
                  {airport.domestic_flights ||
                    (airport.type_en === "local" ? "متاح بشكل رئيسي" : "متاح")}
                </li>
                <li>
                  🌐 <strong>الرحلات الدولية:</strong>{" "}
                  {airport.international_flights ||
                    (isInternational ? "متاح لعدة وجهات" : "غير متاح")}
                </li>
                {airport.connections && airport.connections.length > 0 && (
                  <li>
                    🔄 <strong>ربط مباشر مع:</strong> {airport.connections.join("، ")}
                  </li>
                )}
              </ul>
            </div>

            {/* Transit & Parking */}
            <div className={styles.specCard}>
              <div className={styles.specCardTitle}>
                <i className="bx bx-car" />
                <span>المواصلات والانتظار</span>
              </div>
              <ul className={styles.specList}>
                {airport.transportation && airport.transportation.length > 0 && (
                  <li>
                    🚌 <strong>وسائل النقل:</strong>{" "}
                    {airport.transportation.join("، ")}
                  </li>
                )}
                <li>
                  🅿️ <strong>مواقف السيارات:</strong>{" "}
                  {airport.parking || "متوفر موقف سيارات أمام صالات السفر"}
                </li>
              </ul>
            </div>
          </div>

          {/* Airlines */}
          {airport.airlines && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <i className="bx bx-paper-plane" />
                <span>شركات الطيران العاملة:</span>
              </div>
              <p className={styles.detailDesc}>{airport.airlines}</p>
            </div>
          )}

          {/* Destinations */}
          {airport.destinations && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <i className="bx bx-compass" />
                <span>أبرز الوجهات والخطوط:</span>
              </div>
              <p className={styles.detailDesc}>{airport.destinations}</p>
            </div>
          )}

          {/* Services */}
          {airport.services && airport.services.length > 0 && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <i className="bx bx-grid-alt" />
                <span>الخدمات والتسهيلات المتاحة:</span>
              </div>
              <div className={styles.servicesWrapper}>
                {airport.services.map((srv, sIdx) => (
                  <span key={sIdx} className={styles.serviceChip}>
                    <i className="bx bx-check" />
                    <span>{srv}</span>
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
          {isExpanded ? "إخفاء التفاصيل الإضافية" : "عرض التفاصيل الشاملة للمطار"}
        </span>
        <i
          className={`bx ${isExpanded ? "bx-chevron-up" : "bx-chevron-down"}`}
          style={{ fontSize: "1.15rem" }}
        />
      </button>

      {/* Card Footer Contacts & Actions */}
      <div className={styles.cardFooter}>
        <div className={styles.contactGroup}>
          {airport.phone && airport.phone !== "غير متوفر" ? (
            <a
              href={`tel:${airport.phone}`}
              className={styles.phoneLink}
              title="اتصل بالاستعلامات"
            >
              <i className="bx bx-phone-call" />
              <span>{airport.phone}</span>
            </a>
          ) : (
            <div className={styles.phoneItem}>
              <i className="bx bx-phone" />
              <span className={styles.phoneLabel}>الاستعلامات:</span>
              <span className={styles.phoneValue}>غير متوفر</span>
            </div>
          )}

          {airport.official_website && (
            <a
              href={airport.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteLink}
            >
              <i className="bx bx-globe" />
              <span>الموقع الرسمي</span>
            </a>
          )}
        </div>

        <div className={styles.footerActionsRight}>
          {/* Report Button on Card */}
          {onReport && (
            <button
              type="button"
              onClick={() => onReport(airport)}
              className={styles.cardReportBtn}
              title="الإبلاغ عن خطأ في بيانات هذا المطار"
            >
              <i className="bx bx-flag" />
              <span>إبلاغ عن خطأ</span>
            </button>
          )}

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapBtn}
            >
              <i className="bx bx-map" />
              <span>الخريطة والاتجاهات</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
