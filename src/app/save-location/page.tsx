"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageHero from "@/components/common/PageHero";
import { ASSETS } from "@/constants/assets";
import Footer from "@/components/Footer/Footer";
import SaveLocationModal from "@/components/SaveLocationModal";
import {
  SavedLocation,
  LOCATION_CATEGORIES,
  fetchUserSavedLocations,
  deleteUserSavedLocation,
  getRelativeTimeArabic,
  getUserSavedPlacesLimit,
} from "@/lib/savedLocations";
import styles from "./save-location.module.css";
import { IconClearAll, IconPin, IconDots } from "@tabler/icons-react";
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
  FaThLarge,
  FaListUl,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSortAlphaDown,
  FaChevronDown,
  FaHistory,
  FaCar,
  FaLightbulb,
  FaCrown,
} from "react-icons/fa";

type SortOption = "newest" | "oldest" | "name";
type ViewMode = "grid" | "list";

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { id: "newest", label: "الأحدث أولاً", icon: <FaClock /> },
  { id: "oldest", label: "الأقدم أولاً", icon: <FaHistory /> },
  { id: "name", label: "أبجدياً (أ - ي)", icon: <FaSortAlphaDown /> },
];

export default function SaveLocationPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCoordsId, setCopiedCoordsId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<SavedLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const planLimit = useMemo(() => getUserSavedPlacesLimit(profile), [profile]);
  const isLimitReached = useMemo(
    () => !planLimit.isUnlimited && locations.length >= planLimit.limit,
    [planLimit, locations.length]
  );
  const quotaPercentage = useMemo(() => {
    if (planLimit.isUnlimited) return 100;
    return Math.min(100, Math.round((locations.length / planLimit.limit) * 100));
  }, [planLimit, locations.length]);

  // Close sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentSortOption = useMemo(
    () => SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0],
    [sortBy]
  );

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

  // Execute confirmed deletion
  const confirmDeleteLocation = async () => {
    if (!user || !deleteCandidate) return;
    setIsDeleting(true);
    try {
      await deleteUserSavedLocation(user.id, deleteCandidate.id);
      setLocations((prev) => prev.filter((item) => item.id !== deleteCandidate.id));
      setDeleteCandidate(null);
    } catch (err) {
      console.error("Failed to delete place:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (loc: SavedLocation) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(loc.googleMapsUrl);
      setCopiedId(loc.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyCoords = (loc: SavedLocation) => {
    if (typeof window !== "undefined") {
      const text = `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(text);
      setCopiedCoordsId(loc.id);
      setTimeout(() => setCopiedCoordsId(null), 2000);
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
      } catch (err) {
        // user cancelled or failed
      }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  // Filtered & Sorted locations
  const filteredAndSortedLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = locations.filter((loc) => {
      const matchesTag = selectedTag === "all" || loc.category === selectedTag;
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        (loc.notes && loc.notes.toLowerCase().includes(q)) ||
        (loc.address && loc.address.toLowerCase().includes(q));
      return matchesTag && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === "newest") {
        return (b.timestamp || 0) - (a.timestamp || 0);
      }
      if (sortBy === "oldest") {
        return (a.timestamp || 0) - (b.timestamp || 0);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "ar");
      }
      return 0;
    });
  }, [locations, selectedTag, searchQuery, sortBy]);

  const getCategoryInfo = (catId?: string) => {
    return (
      LOCATION_CATEGORIES.find((c) => c.id === catId) || {
        id: "other",
        label: "أخرى",
        icon: <IconDots stroke={2} size={18} />,
      }
    );
  };

  const parkingCount = useMemo(() => {
    return locations.filter((l) => l.category === "parking").length;
  }, [locations]);

  return (
    <div className={styles.container}>
      {/* Top Page Hero */}
      <PageHero
        title="أحفظ مكاني"
        subtitle="عديت علي مكان أو راكن عربيتك في مكان وخايف تضيع المكان..؟ سجل المكان وأرجع ليه بعد كده علطول."
        icon={{
          src: ASSETS.threeD.street,
          alt: "أحفظ مكاني",
          width: 60,
          height: 60,
        }}
      />

      <main className={styles.contentWrapper}>
        {/* Loading state */}
        {authLoading ? (
          <div
            style={{
              padding: "70px 20px",
              textAlign: "center",
              color: "var(--text-secondary, #94a3b8)",
              fontSize: "1rem",
            }}
          >
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2.4rem", color: "#3b82f6" }}></i>
            <p style={{ marginTop: "14px", fontWeight: 600 }}>جاري التحقق من بيانات الحساب...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated Lock State */
          <div className={styles.lockContainer}>
            <div className={styles.lockIconBox}>
              <FaLock />
            </div>
            <h2 className={styles.lockTitle}>سجّل دخولك لحفظ أماكنك وركناتك</h2>
            <p className={styles.lockSubtitle}>
              ميزة "أحفظ مكاني" توفر لك مساحة سحابية خاصة مرتبطة بحسابك لحفظ إحداثياتك
              بالوقت والتاريخ بدقة فائقة، ومزامنتها لتصل إليها من هاتفك أو أي جهاز بكل سهولة.
            </p>

            <div className={styles.lockBenefitsList}>
              <div className={styles.lockBenefitItem}>
                <span className={styles.lockBenefitIcon}>✓</span>
                <span>تخزين مشفر وآمن خاص بحسابك فقط، بدون ضياع بياناتك</span>
              </div>
              <div className={styles.lockBenefitItem}>
                <span className={styles.lockBenefitIcon}>✓</span>
                <span>تحديد موقع سيارتك بدقة الأقمار الصناعية (GPS) في المولات والجراجات</span>
              </div>
              <div className={styles.lockBenefitItem}>
                <span className={styles.lockBenefitIcon}>✓</span>
                <span>فتح بنقرة زر في خرائط Google Maps لبدء الاتجاهات والرجوع بسهولة</span>
              </div>
            </div>

            <div className={styles.lockBtnGroup}>
              <button
                className={styles.lockLoginBtn}
                onClick={() => router.push("/login?redirect=/save-location")}
              >
                <FaUserCheck />
                <span>تسجيل الدخول إلى حسابي</span>
              </button>

              <Link href="/signup?redirect=/save-location" className={styles.lockSignupBtn}>
                إنشاء حساب جديد مجاناً
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated User View */
          <>

            {/* Account & Subscription Quota Capsule */}
            <div className={styles.accountBar}>
              <div className={styles.accountStats}>
                <div className={styles.quotaProgressGroup}>
                  <div className={styles.quotaLabelsRow}>
                    <span>
                      {planLimit.isUnlimited ? (
                        <>الأماكن المحفوظة: <strong>{locations.length}</strong> (غير محدود ♾️)</>
                      ) : (
                        <>
                          الأماكن المحفوظة: <strong>{locations.length}</strong> من أصل{" "}
                          <strong>{planLimit.limit}</strong>
                        </>
                      )}
                    </span>
                    {isLimitReached && (
                      <span className={styles.limitReachedNotice}>⚠️ تم استهلاك الحد الأقصى</span>
                    )}
                  </div>
                  {!planLimit.isUnlimited && (
                    <div className={styles.quotaProgressBar}>
                      <div
                        className={`${styles.quotaProgressFill} ${
                          isLimitReached
                            ? styles.quotaFillFull
                            : quotaPercentage >= 66
                            ? styles.quotaFillHigh
                            : styles.quotaFillNormal
                        }`}
                        style={{ width: `${quotaPercentage}%` }}
                      />
                    </div>
                  )}
                </div>

                {!planLimit.isUnlimited && (
                  <Link
                    href="/profile?expand=subscription"
                    className={styles.upgradeBtnSmall}
                  >
                    <FaCrown style={{ color: "#facc15" }} />
                    <span>ترقية الباقة</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Limit Warning Banner if limit reached */}
            {isLimitReached && (
              <div className={styles.limitWarningBanner}>
                <div className={styles.limitWarningContent}>
                  <div className={styles.limitWarningIcon}>
                    <FaLock />
                  </div>
                  <div>
                    <h3 className={styles.limitWarningTitle}>
                      لقد بلغت الحد الأقصى للأماكن المحفوظة في باقتك ({planLimit.tierName}: {planLimit.maxAllowedText})
                    </h3>
                    <p className={styles.limitWarningText}>
                      {planLimit.tier === "silver"
                        ? "أنت حالياً على الباقة الفضية (20 مكاناً). للترقية إلى الباقة الذهبية وحفظ عدد غير محدود من الأماكن، اضغط على زر الترقية أدناه أو احذف بعض الأماكن القديمة."
                        : "أنت حالياً على الباقة المجانية (3 أماكن فقط). للترقية إلى الباقة الفضية (حتى 20 مكاناً) أو الباقة الذهبية (عدد لا نهائي من الأماكن)، اضغط على زر الترقية أدناه أو احذف بعض الأماكن القديمة."}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile?expand=subscription"
                  className={styles.limitUpgradeBtn}
                >
                  <FaCrown />
                  <span>ترقية باقتي الآن 🚀</span>
                </Link>
              </div>
            )}

            {/* Action Banner (Hero Save Card) */}
            <section className={styles.actionBanner}>
              <div className={styles.actionBannerGlow}></div>
              <div className={styles.actionBannerContent}>
                <div className={styles.actionBannerText}>
                  <h2>احفظ موقعك الحالي بضغطة زر واحدة</h2>
                  <p>
                    نلتقط إحداثياتك بدقة فائقة عبر الأقمار الصناعية <span className="font-inter">(GPS)</span>، ونوثق اسم المكان
                    والتاريخ والوقت ورابط خرائط <span className="font-inter">Google Maps</span>  مباشرة في حسابك لتصل إليه متى أردت. 
                  </p>
                </div>
              </div>

              <div className={styles.actionBannerButtons}>
                <button
                  className={`btn btn-primary ${isLimitReached ? styles.actionBtnLimitReached : ""}`}
                  onClick={() => setIsModalOpen(true)}
                >
                  {isLimitReached ? <FaLock /> : <FaPlus />}
                  <span>{isLimitReached ? "وصلت للحد الأقصى (ترقية الباقة)" : "أحفظ مكاني الحالي"}</span>
                </button>
              </div>
            </section>

            {/* Filter and Search Bar */}
            <section className={styles.filterBar}>
              <div className={styles.searchAndControlsRow}>
                <div className={styles.searchInputWrapper}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    className={`input-fields ${styles.searchInput}`}
                    placeholder="ابحث في أماكنك المحفوظة (بالاسم، العنوان، الملاحظات)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className={styles.clearSearchBtn}
                      onClick={() => setSearchQuery("")}
                      title="مسح البحث"
                      aria-label="مسح البحث"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className={styles.tagsRow} role="tablist">
                <button
                  className={`${styles.tagBtn} ${selectedTag === "all" ? styles.tagBtnActive : ""}`}
                  onClick={() => setSelectedTag("all")}
                >
                  <IconClearAll stroke={2} size={18}/>
                  <span>الكل</span>
                  <span className={styles.tagBadge}>{locations.length}</span>
                </button>
                {LOCATION_CATEGORIES.map((cat) => {
                  const count = locations.filter((l) => l.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      className={`${styles.tagBtn} ${selectedTag === cat.id ? styles.tagBtnActive : ""}`}
                      onClick={() => setSelectedTag(cat.id)}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                      <span className={styles.tagBadge}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Saved Places Grid / List */}
            {dataLoading ? (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", color: "#3b82f6" }}></i>
                <p style={{ marginTop: "12px", fontWeight: 600 }}>جاري مزامنة وتحميل أماكنك المحفوظة...</p>
              </div>
            ) : filteredAndSortedLocations.length > 0 ? (
              <section className={viewMode === "grid" ? styles.placesGrid : styles.placesList}>
                {filteredAndSortedLocations.map((loc, index) => {
                  const catInfo = getCategoryInfo(loc.category);
                  const isCopied = copiedId === loc.id;
                  const isCoordsCopied = copiedCoordsId === loc.id;
                  const relativeTime = getRelativeTimeArabic(loc.timestamp);
                  const accentClass = styles[`cardAccentBar_${loc.category}`] || "";
                  const animationDelayStyle = {
                    animationDelay: `${Math.min(index * 40, 360)}ms`,
                  };

                  if (viewMode === "list") {
                    return (
                      <article
                        key={loc.id}
                        className={`${styles.placeCard} ${styles.placeCardList}`}
                        style={animationDelayStyle}
                      >
                        {/* Right colored accent border (RTL) */}
                        <div className={`${styles.cardAccentBarList} ${accentClass}`}></div>

                        <div className={styles.listContent}>
                          {/* Main Title & Address info */}
                          <div className={styles.listMainInfo}>
                            <div className={styles.listBadgesRow}>
                              <span className={styles.categoryBadge}>
                                {catInfo.icon}
                                <span>{catInfo.label}</span>
                              </span>
                              <span className={styles.timePill}>
                                <FaClock style={{ fontSize: "0.75rem" }} />
                                <span>{relativeTime}</span>
                              </span>
                            </div>

                            <h3 className={styles.placeTitleList}>{loc.name}</h3>

                            {loc.address && (
                              <div className={styles.listAddressRow}>
                                <FaMapMarkerAlt style={{ color: "#f87171", flexShrink: 0 }} />
                                <span>{loc.address}</span>
                              </div>
                            )}

                            {loc.notes && (
                              <div className={styles.listNotesBox}>
                                <strong>ملاحظة:</strong> {loc.notes}
                              </div>
                            )}
                          </div>

                          {/* Date, Time & Coordinates */}
                          <div className={styles.listMetaColumn}>
                            <div className={styles.detailRow}>
                              <FaCalendarAlt style={{ color: "#38bdf8", flexShrink: 0 }} />
                              <span>
                                {loc.formattedDate} • <strong>{loc.formattedTime}</strong>
                              </span>
                            </div>

                            <div className={styles.coordsBadge}>
                              <span>
                                🎯 ±{loc.accuracy}م | {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                              </span>
                              <button
                                className={styles.coordsCopySmallBtn}
                                onClick={() => handleCopyCoords(loc)}
                                title="نسخ الإحداثيات"
                              >
                                {isCoordsCopied ? (
                                  <FaCheck style={{ color: "#10b981" }} />
                                ) : (
                                  <FaCopy />
                                )}
                                <span>{isCoordsCopied ? "تم" : "نسخ"}</span>
                              </button>
                            </div>
                          </div>

                          {/* List Actions Column */}
                          <div className={styles.listActionsColumn}>
                            <a
                              href={loc.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.googleMapsDirectBtnList}
                              title="فتح الموقع مباشرة في Google Maps"
                            >
                              <FaExternalLinkAlt />
                              <span>خرائط جوجل</span>
                            </a>

                            <div className={styles.listSubActionsRow}>
                              <a
                                href={loc.directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.actionSubBtn}
                                title="الاتجاهات عبر خرائط جوجل"
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
                                <span>{isCopied ? "تم" : "نسخ"}</span>
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

                              <button
                                className={styles.cardDeleteBtn}
                                onClick={() => setDeleteCandidate(loc)}
                                title="حذف المكان من حسابك"
                                aria-label={`حذف ${loc.name}`}
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }

                  // Default: Grid view
                  return (
                    <article
                      key={loc.id}
                      className={styles.placeCard}
                      style={animationDelayStyle}
                    >
                      {/* Category Accent top border */}
                      <div className={`${styles.cardAccentBar} ${accentClass}`}></div>

                      {/* Top: Category, Relative time & Delete */}
                      <div className={styles.cardTop}>
                        <div className={styles.placeTitleGroup}>
                          <div className={styles.cardHeaderBadges}>
                            <span className={styles.categoryBadge}>
                              {catInfo.icon}
                              <span>{catInfo.label}</span>
                            </span>
                            <span className={styles.timePill}>
                              <FaClock style={{ fontSize: "0.75rem" }} />
                              <span>{relativeTime}</span>
                            </span>
                          </div>

                          <h3 className={styles.placeTitle}>{loc.name}</h3>
                        </div>

                        <button
                          className={styles.cardDeleteBtn}
                          onClick={() => setDeleteCandidate(loc)}
                          title="حذف المكان من حسابك"
                          aria-label={`حذف ${loc.name}`}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>

                      {/* Details: Date, Time, Coords, Address, Notes */}
                      <div className={styles.cardDetails}>
                        <div className={styles.detailRow}>
                          <FaCalendarAlt style={{ color: "#38bdf8", flexShrink: 0 }} />
                          <span>
                            {loc.formattedDate} • <strong>{loc.formattedTime}</strong>
                          </span>
                        </div>

                        <div className={styles.coordsBadge}>
                          <span>
                            🎯 دقة ±{loc.accuracy}م | {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                          </span>
                          <button
                            className={styles.coordsCopySmallBtn}
                            onClick={() => handleCopyCoords(loc)}
                            title="نسخ الإحداثيات"
                          >
                            {isCoordsCopied ? (
                              <FaCheck style={{ color: "#10b981" }} />
                            ) : (
                              <FaCopy />
                            )}
                            <span>{isCoordsCopied ? "تم" : "نسخ"}</span>
                          </button>
                        </div>

                        {loc.address && (
                          <div className={styles.addressRow}>
                            <FaMapMarkerAlt style={{ color: "#f87171", marginTop: "3px", flexShrink: 0 }} />
                            <span>{loc.address}</span>
                          </div>
                        )}

                        {loc.notes && (
                          <div className={styles.notesBox}>
                            <strong>ملاحظة:</strong> {loc.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions: Google Maps Direct Link & Secondary tools */}
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

                        {/* Secondary Actions Row */}
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
                            title="مشاركة المكان عبر واتساب أو التطبيقات"
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
              /* No Search Results */
              <div className={styles.emptyState}>
                <div className={styles.emptyIconCircle}>
                  <FaSearch />
                </div>
                <h3 className={styles.emptyTitle}>لا توجد أماكن مطابقة لبحثك</h3>
                <p className={styles.emptySubtitle}>
                  لم نعثر على نتائج لـ "{searchQuery}". جرب تغيير كلمات البحث أو اختيار تصنيف آخر.
                </p>
                <button
                  className={styles.saveLocationSecondaryBtn}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag("all");
                  }}
                >
                  إعادة تعيين البحث والتصنيفات
                </button>
              </div>
            ) : (
              /* Completely Empty State (No Places Yet) */
              <div className={styles.emptyState}>
                <div className={styles.emptyIconCircle}>
                  <FaMapMarkerAlt />
                </div>
                <h3 className={styles.emptyTitle}>لم تقم بحفظ أي مكان في حسابك بعد</h3>
                <p className={styles.emptySubtitle}>
                  سواء ركنت سيارتك وتريد تذكر مكانها بسهولة، أو كنت في كافيه أو منزل صديق
                  وتريد العودة إليه لاحقاً، يمكنك حفظ موقعك الجغرافي الحالي بدقة 100% بنقرة زر.
                </p>

                <div className={styles.emptyStepsList}>
                  <div className={styles.emptyStepItem}>
                    <span className={styles.emptyStepNum}>1</span>
                    <div className={styles.emptyStepText}>اضغط "أحفظ مكاني الآن" وأنت في المكان</div>
                  </div>
                  <div className={styles.emptyStepItem}>
                    <span className={styles.emptyStepNum}>2</span>
                    <div className={styles.emptyStepText}>يلتقط النظام إحداثيات GPS الدقيقة بالمتر</div>
                  </div>
                  <div className={styles.emptyStepItem}>
                    <span className={styles.emptyStepNum}>3</span>
                    <div className={styles.emptyStepText}>ارجع لمكانك في أي وقت بضغطة زر على خرائط جوجل</div>
                  </div>
                </div>

                <button
                  className={styles.saveLocationPrimaryBtn}
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaPlus />
                  <span>أحفظ أول مكان لك الآن 🚀</span>
                </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div
          className={styles.deleteDialogOverlay}
          onClick={() => !isDeleting && setDeleteCandidate(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.deleteDialogBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteDialogIcon}>
              <FaTrashAlt />
            </div>
            <h3 className={styles.deleteDialogTitle}>تأكيد حذف المكان</h3>
            <p className={styles.deleteDialogDesc}>
              هل أنت متأكد من رغبتك في حذف <strong>"{deleteCandidate.name}"</strong> نهائياً من حسابك؟ لن تتمكن من استرجاعه بعد الحذف.
            </p>
            <div className={styles.deleteDialogActions}>
              <button
                className={styles.deleteDialogConfirmBtn}
                onClick={confirmDeleteLocation}
                disabled={isDeleting}
              >
                {isDeleting ? "جاري الحذف..." : "نعم، حذف المكان"}
              </button>
              <button
                className={styles.deleteDialogCancelBtn}
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Location Modal */}
      <SaveLocationModal
        isOpen={isModalOpen}
        currentCount={locations.length}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => {
          loadUserPlaces();
        }}
      />

      <Footer />
    </div>
  );
}
