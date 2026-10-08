"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageHero from "@/components/common/PageHero";
import Footer from "@/components/Footer";
import SaveLocationModal from "@/components/SaveLocationModal";
import {
  SavedLocation,
  LOCATION_CATEGORIES,
  fetchUserSavedLocations,
  deleteUserSavedLocation,
  getRelativeTimeArabic,
} from "@/lib/savedLocations";
import styles from "./save-location.module.css";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaExternalLinkAlt,
  FaCopy,
  FaTrashAlt,
  FaShareAlt,
  FaCompass,
  FaCalendarAlt,
  FaClock,
  FaSatellite,
  FaPlus,
  FaCheck,
  FaRoute,
  FaLock,
  FaUserCheck,
} from "react-icons/fa";

export default function SaveLocationPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadUserPlaces = useCallback(async () => {
    if (!user) {
      setLocations([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    try {
      const data = await fetchUserSavedLocations(user.id);
      setLocations(data);
    } catch (err) {
      console.error("Error loading user saved places:", err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadUserPlaces();
    }

    const handleUpdate = () => {
      if (user) {
        loadUserPlaces();
      }
    };

    window.addEventListener("saved_locations_updated", handleUpdate);
    return () => window.removeEventListener("saved_locations_updated", handleUpdate);
  }, [user, authLoading, loadUserPlaces]);

  const handleDelete = async (id: string, name: string) => {
    if (!user) return;
    if (typeof window !== "undefined") {
      const confirmDelete = window.confirm(
        `هل أنت متأكد من حذف "${name}" من حسابك؟`
      );
      if (confirmDelete) {
        await deleteUserSavedLocation(user.id, id);
        setLocations((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  const handleCopyLink = (loc: SavedLocation) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(loc.googleMapsUrl);
      setCopiedId(loc.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (loc: SavedLocation) => {
    if (typeof window === "undefined") return;

    const shareText = `📍 ${loc.name}\n📅 ${loc.formattedDate} - ${loc.formattedTime}\n🗺️ رابط خرائط Google Maps:\n${loc.googleMapsUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: loc.name,
          text: shareText,
          url: loc.googleMapsUrl,
        });
      } catch (err) {}
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  // Filtered locations
  const filteredLocations = locations.filter((loc) => {
    const matchesTag = selectedTag === "all" || loc.category === selectedTag;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      loc.name.toLowerCase().includes(q) ||
      (loc.notes && loc.notes.toLowerCase().includes(q)) ||
      (loc.address && loc.address.toLowerCase().includes(q));
    return matchesTag && matchesSearch;
  });

  const getCategoryInfo = (catId?: string) => {
    return (
      LOCATION_CATEGORIES.find((c) => c.id === catId) || {
        id: "other",
        label: "مكان عام",
        icon: "📌",
      }
    );
  };

  return (
    <div className={styles.container}>
      {/* Page Hero */}
      <PageHero
        title="أحفظ مكاني"
        subtitle="حدد واحفظ موقعك الحالي بدقة 100% على حسابك الشخصي مع رابط مباشر لخرائط Google Maps"
        icon={{
          src: "/cairo.webp",
          alt: "أحفظ مكاني",
          width: 60,
          height: 60,
        }}
        pillBadge={{ text: "حفظ ومزامنة على الحساب 🔒", showDot: true }}
        stats={[
          {
            label: `${locations.length} أماكن في حسابك`,
            icon: <FaMapMarkerAlt />,
            highlight: true,
          },
          {
            label: "GPS فائق الدقة بالميلي",
            icon: <FaSatellite />,
          },
          {
            label: "روابط Google Maps مباشرة",
            icon: <FaCompass />,
          },
        ]}
      />

      <main className={styles.contentWrapper}>
        {/* Loading state */}
        {authLoading ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-secondary, #94a3b8)",
              fontSize: "1rem",
            }}
          >
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem" }}></i>
            <p style={{ marginTop: "12px" }}>جاري التحقق من بيانات الحساب...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated Lock State */
          <div className={styles.lockContainer}>
            <div className={styles.lockIconBox}>
              <FaLock />
            </div>
            <h2 className={styles.lockTitle}>سجل الدخول أولاً</h2>
            <p className={styles.lockSubtitle}>
              ميزة "أحفظ مكاني" مرتبطة بحسابك الشخصي لحفظ وتأمين أماكنك الجغرافية
              بالوقت والتاريخ، ومزامنتها لتتمكن من الوصول إليها من هاتفك أو أي جهاز في أي وقت.
            </p>
            <button
              className={styles.lockLoginBtn}
              onClick={() => router.push("/login?redirect=/save-location")}
            >
              تسجيل الدخول إلى حسابي
            </button>
          </div>
        ) : (
          /* Authenticated User View */
          <>
            {/* Account Info Pill */}
            <div className={styles.accountBadge}>
              <FaUserCheck style={{ color: "#10b981" }} />
              <span>
                الحساب المتصل:{" "}
                <strong style={{ color: "#ffffff" }}>
                  {profile?.full_name || user.email}
                </strong>
              </span>
            </div>

            {/* Action Banner */}
            <section className={styles.actionBanner}>
              <div className={styles.actionBannerText}>
                <h2>📍 احفظ موقعك الحالي على حسابك</h2>
                <p>
                  نلتقط إحداثياتك بدقة 100% عبر الأقمار الصناعية (GPS)، ونحفظ اسم المكان
                  والتاريخ والوقت ورابط خرائط Google Maps مباشرة في حسابك.
                </p>
              </div>
              <button
                className={styles.saveLocationPrimaryBtn}
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus />
                <span>أحفظ مكاني الآن</span>
              </button>
            </section>

            {/* Filter and Search Bar */}
            <section className={styles.filterBar}>
              <div className={styles.searchRow}>
                <div className={styles.searchInputWrapper}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="ابحث في أماكنك المحفوظة (بالاسم، العنوان، الملاحظات)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.tagsRow}>
                <button
                  className={`${styles.tagBtn} ${selectedTag === "all" ? styles.tagBtnActive : ""}`}
                  onClick={() => setSelectedTag("all")}
                >
                  <span>🌟</span>
                  <span>الكل ({locations.length})</span>
                </button>
                {LOCATION_CATEGORIES.map((cat) => {
                  const count = locations.filter((l) => l.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      className={`${styles.tagBtn} ${selectedTag === cat.id ? styles.tagBtnActive : ""}`}
                      onClick={() => setSelectedTag(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      <span>
                        {cat.label} ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Saved Places Grid */}
            {dataLoading ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.8rem" }}></i>
                <p style={{ marginTop: "10px" }}>جاري تحميل أماكنك المحفوظة...</p>
              </div>
            ) : filteredLocations.length > 0 ? (
              <section className={styles.placesGrid}>
                {filteredLocations.map((loc) => {
                  const catInfo = getCategoryInfo(loc.category);
                  const isCopied = copiedId === loc.id;
                  const relativeTime = getRelativeTimeArabic(loc.timestamp);

                  return (
                    <article key={loc.id} className={styles.placeCard}>
                      {/* Top: Title & Delete */}
                      <div className={styles.cardTop}>
                        <div className={styles.placeTitleGroup}>
                          <span className={styles.categoryBadge}>
                            <span>{catInfo.icon}</span>
                            <span>{catInfo.label}</span>
                          </span>
                          <h3 className={styles.placeTitle} style={{ marginTop: "8px" }}>
                            {loc.name}
                          </h3>
                        </div>

                        <button
                          className={styles.cardDeleteBtn}
                          onClick={() => handleDelete(loc.id, loc.name)}
                          title="حذف المكان من حسابك"
                          aria-label="حذف المكان"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>

                      {/* Details: Date, Time, Coords */}
                      <div className={styles.cardDetails}>
                        <div className={styles.detailRow}>
                          <FaCalendarAlt style={{ color: "#38bdf8" }} />
                          <span>{loc.formattedDate}</span>
                        </div>

                        <div className={styles.detailRow}>
                          <FaClock style={{ color: "#fbbf24" }} />
                          <span>
                            {loc.formattedTime} (<strong>{relativeTime}</strong>)
                          </span>
                        </div>

                        <div className={styles.detailRow}>
                          <span className={styles.coordsBadge}>
                            🎯 دقة ±{loc.accuracy}م | {loc.latitude.toFixed(6)},{" "}
                            {loc.longitude.toFixed(6)}
                          </span>
                        </div>

                        {loc.address && (
                          <div className={styles.detailRow}>
                            <FaMapMarkerAlt style={{ color: "#f87171" }} />
                            <span style={{ fontSize: "0.82rem", lineBreak: "anywhere" }}>
                              {loc.address}
                            </span>
                          </div>
                        )}

                        {loc.notes && (
                          <div className={styles.notesBox}>📝 {loc.notes}</div>
                        )}
                      </div>

                      {/* Actions: Google Maps Link & Tools */}
                      <div className={styles.cardActions}>
                        {/* Primary Google Maps Direct Link */}
                        <a
                          href={loc.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.googleMapsDirectBtn}
                          title="فتح الموقع مباشرة في Google Maps"
                        >
                          <FaExternalLinkAlt />
                          <span>فتح في Google Maps 🗺️</span>
                        </a>

                        {/* Secondary Actions */}
                        <div className={styles.secondaryActionsRow}>
                          <a
                            href={loc.directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionSubBtn}
                            title="بدء الملاحة والاتجاهات عبر Google Maps"
                          >
                            <FaRoute style={{ color: "#38bdf8" }} />
                            <span>الاتجاهات</span>
                          </a>

                          <button
                            className={styles.actionSubBtn}
                            onClick={() => handleCopyLink(loc)}
                            title="نسخ رابط خرائط جوجل"
                          >
                            {isCopied ? (
                              <FaCheck style={{ color: "#10b981" }} />
                            ) : (
                              <FaCopy />
                            )}
                            <span>{isCopied ? "تم النسخ" : "نسخ الرابط"}</span>
                          </button>

                          <button
                            className={styles.actionSubBtn}
                            onClick={() => handleShare(loc)}
                            title="مشاركة المكان"
                          >
                            <FaShareAlt style={{ color: "#a855f7" }} />
                            <span>مشاركة</span>
                          </button>

                          <Link
                            href={`/map?lat=${loc.latitude}&lng=${loc.longitude}&zoom=17`}
                            className={styles.actionSubBtn}
                            title="عرض على خريطة القاهرة التفاعلية"
                          >
                            <FaCompass style={{ color: "#06b6d4" }} />
                            <span>الخريطة</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : locations.length > 0 ? (
              /* No search results */
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>لا توجد أماكن مطابقة للبحث</h3>
                <p className={styles.emptySubtitle}>
                  جرب تغيير كلمات البحث أو تصنيف الأماكن المحدد.
                </p>
              </div>
            ) : (
              /* Totally Empty State */
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📍</div>
                <h3 className={styles.emptyTitle}>لم تقم بحفظ أي مكان في حسابك بعد</h3>
                <p className={styles.emptySubtitle}>
                  سواء ركنت سيارتك وتريد تذكر مكانها، أو كنت في كافيه أو منزل صديق وتريد
                  العودة إليه لاحقاً، اضغط على الزر أدناه لحفظ موقعك الحالي بدقة 100% على
                  حسابك.
                </p>
                <button
                  className={styles.saveLocationPrimaryBtn}
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaPlus />
                  <span>أحفظ أول مكان لك الآن</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Features Guide Cards */}
        <section className={styles.guideSection}>
          <h3 className={styles.guideSectionTitle}>
            <span>💡</span>
            <span>مميزات خدمة "أحفظ مكاني"</span>
          </h3>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <div
                className={styles.guideCardIcon}
                style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}
              >
                🔒
              </div>
              <h4 className={styles.guideCardTitle}>حفظ سحابي على حسابك</h4>
              <p className={styles.guideCardDesc}>
                يتم حفظ جميع أماكنك بأمان في قاعدة بيانات حسابك الشخصي، لتجدها في أي وقت ومن
                أي جهاز أو هاتف تستخدمه.
              </p>
            </div>

            <div className={styles.guideCard}>
              <div
                className={styles.guideCardIcon}
                style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}
              >
                🎯
              </div>
              <h4 className={styles.guideCardTitle}>دقة 100% بالميلي (GPS)</h4>
              <p className={styles.guideCardDesc}>
                التقاط أدق إشارة أقمار صناعية مع مقياس دقة بالمتر وإحداثيات دقيقة تصل لأجزاء
                السنتيمتر.
              </p>
            </div>

            <div className={styles.guideCard}>
              <div
                className={styles.guideCardIcon}
                style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}
              >
                🗺️
              </div>
              <h4 className={styles.guideCardTitle}>رابط مباشر لـ Google Maps</h4>
              <p className={styles.guideCardDesc}>
                فتح مباشر في تطبيق خرائط جوجل بنقرة زر لبدء الملاحة، مع نسخ الرابط ومشاركته
                عبر واتساب.
              </p>
            </div>

            <div className={styles.guideCard}>
              <div
                className={styles.guideCardIcon}
                style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}
              >
                📅
              </div>
              <h4 className={styles.guideCardTitle}>تسجيل الوقت والتاريخ</h4>
              <p className={styles.guideCardDesc}>
                حفظ التاريخ بالتقويم العربي والوقت بالساعة والدقيقة مع عداد زمني يوضح المدة
                المنقضية.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Save Location Modal */}
      <SaveLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => {
          loadUserPlaces();
        }}
      />

      <Footer />
    </div>
  );
}
