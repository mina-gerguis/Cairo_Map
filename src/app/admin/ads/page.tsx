"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaVideo,
  FaLink,
  FaUndo,
  FaCheckCircle,
  FaTimes,
  FaExternalLinkAlt,
  FaSearch,
  FaCopy,
  FaLayerGroup,
  FaHome,
  FaMapMarkerAlt,
  FaGlobe,
  FaCheck,
  FaSyncAlt,
} from "react-icons/fa";
import VideoAdBanner, {
  VideoAdSlot,
  DEFAULT_VIDEO_ADS,
  STORAGE_KEY_VIDEO_ADS,
  EVENT_VIDEO_ADS_UPDATED,
  ALL_DEFINED_SLOTS,
  normalizeSlotId,
} from "@/components/VideoAdBanner";
import styles from "../admin.module.css";

// Sample video presets for quick testing
const SAMPLE_VIDEOS = [
  {
    name: "فيديو ترويجي 1 (MP4)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    name: "فيديو ترويجي 2 (MP4)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
  },
  {
    name: "يوتيوب تجريبي (YouTube)",
    url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  },
  {
    name: "صورة متحركة (GIF)",
    url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
  },
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<VideoAdSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<VideoAdSlot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [pageFilter, setPageFilter] = useState<"all" | "home" | "places" | "all_synced">("all");

  // Form State
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["[ heroTop#1 ]"]);
  const [formData, setFormData] = useState<VideoAdSlot>({
    id: "[ heroTop#1 ]",
    title: "",
    videoUrl: "",
    targetUrl: "/places",
    slots: ["[ heroTop#1 ]"],
    isExternal: false,
    isActive: true,
  });

  // Load ads from localStorage or defaults
  const loadAds = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VIDEO_ADS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAds(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error reading ads from localStorage:", e);
    }
    // Fallback to defaults
    setAds(DEFAULT_VIDEO_ADS);
    try {
      localStorage.setItem(STORAGE_KEY_VIDEO_ADS, JSON.stringify(DEFAULT_VIDEO_ADS));
    } catch { }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const saveAdsToStorage = (updatedAds: VideoAdSlot[], msg: string) => {
    setAds(updatedAds);
    try {
      localStorage.setItem(STORAGE_KEY_VIDEO_ADS, JSON.stringify(updatedAds));
      window.dispatchEvent(new Event(EVENT_VIDEO_ADS_UPDATED));
    } catch (e) {
      console.error("Failed to save ads:", e);
    }
    showToast(msg);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset to default preset video ads
  const handleResetToDefault = () => {
    if (
      confirm(
        "هل أنت متأكد من استعادة الإعلانات الافتراضية؟ سيتم تعيين مواضع الإعلانات الافتراضية."
      )
    ) {
      saveAdsToStorage(
        DEFAULT_VIDEO_ADS,
        "تمت استعادة إعلانات الفيديو الافتراضية بنجاح ✨"
      );
    }
  };

  // Toggle active status
  const handleToggleActive = (id: string) => {
    const updated = ads.map((item) => {
      if (item.id === id) {
        return { ...item, isActive: !item.isActive };
      }
      return item;
    });
    saveAdsToStorage(updated, "تم تحديث حالة تفعيل الإعلان بنجاح");
  };

  // Quick Action: Apply this ad to ALL 7 spaces at once!
  const handleApplyToAllSlots = (adItem: VideoAdSlot) => {
    const allSlotIds = ALL_DEFINED_SLOTS.map((s) => s.id);
    const updated = ads.map((item) => {
      if (item.id === adItem.id) {
        return {
          ...item,
          slots: allSlotIds,
          isActive: true,
        };
      }
      return item;
    });

    saveAdsToStorage(updated, `تم تطبيق الإعلان بنجاح على جميع المساحات الإعلانية الـ 7 دفعة واحدة! 🌐✨`);
  };

  // Delete ad
  const handleDeleteAd = (id: string) => {
    if (confirm(`هل أنت متأكد من حذف الإعلان (${id})؟`)) {
      const updated = ads.filter((item) => item.id !== id);
      saveAdsToStorage(updated, "تم حذف الإعلان بنجاح 🗑️");
    }
  };

  // Copy target link
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showToast("تم نسخ رابط الإعلان إلى الحافظة 📋");
  };

  // Open modal to add a new ad with a specific initial slot
  const handleOpenAddModal = (targetSlotId: string = "[ heroTop#1 ]") => {
    setEditingAd(null);
    const matchedSlot = ALL_DEFINED_SLOTS.find((s) => s.id === targetSlotId);
    setSelectedSlots([targetSlotId]);
    setFormData({
      id: targetSlotId,
      title: matchedSlot ? `إعلان ${matchedSlot.label}` : "إعلان فيديو جديد",
      videoUrl: SAMPLE_VIDEOS[0].url,
      targetUrl: "/places",
      slots: [targetSlotId],
      isExternal: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing ad
  const handleOpenEditModal = (adItem: VideoAdSlot) => {
    setEditingAd(adItem);
    const adSlots =
      adItem.slots && adItem.slots.length > 0
        ? adItem.slots.includes("all")
          ? ALL_DEFINED_SLOTS.map((s) => s.id)
          : adItem.slots
        : [adItem.id];
    setSelectedSlots(adSlots);
    setFormData({ ...adItem, slots: adSlots });
    setIsModalOpen(true);
  };

  // Toggle single slot selection
  const handleToggleSlotSelection = (slotId: string) => {
    setSelectedSlots((prev) => {
      let next: string[];
      if (prev.includes(slotId)) {
        next = prev.filter((id) => id !== slotId);
      } else {
        next = [...prev, slotId];
      }
      if (next.length === 0) {
        next = [slotId]; // keep at least one
      }
      setFormData((f) => ({ ...f, slots: next, id: next[0] }));
      return next;
    });
  };

  // Select ALL slots at once inside modal
  const handleSelectAllSlotsModal = () => {
    const allSlotIds = ALL_DEFINED_SLOTS.map((s) => s.id);
    setSelectedSlots(allSlotIds);
    setFormData((f) => ({ ...f, slots: allSlotIds }));
    showToast("تم تحديد جميع المواضع الـ 7 للمزامنة! 🌐");
  };

  // Form submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.videoUrl.trim()) {
      alert("يرجى إدخال رابط فيديو MP4 أو GIF أو YouTube صالح.");
      return;
    }

    if (!formData.targetUrl.trim()) {
      alert("يرجى تحديد رابط الصفحة المستهدفة عند النقر.");
      return;
    }

    if (selectedSlots.length === 0) {
      alert("يرجى اختيار موضع إعلاني واحد على الأقل.");
      return;
    }

    const payload: VideoAdSlot = {
      ...formData,
      id: formData.id || selectedSlots[0],
      slots: selectedSlots,
    };

    let updated: VideoAdSlot[];
    if (editingAd) {
      updated = ads.map((item) => (item.id === editingAd.id ? payload : item));
      showToast("تم تحديث بيانات الإعلان ومزامنته بنجاح ✨");
    } else {
      updated = [payload, ...ads];
      showToast("تم حفظ الإعلان الجديد ومزامنته بنجاح 🎉");
    }

    saveAdsToStorage(updated, "تم حفظ الإعلان وتحديث العرض في الموقع بنجاح!");
    setIsModalOpen(false);
  };

  // Helper to find the active ad that matches a slot
  const getSlotActiveAd = (slotId: string) => {
    const targetNorm = normalizeSlotId(slotId);
    return ads.find((item) => {
      if (!item.isActive || !item.videoUrl?.trim()) return false;
      if (item.slots?.includes("all")) return true;
      if (Array.isArray(item.slots) && item.slots.some((s) => normalizeSlotId(s) === targetNorm)) {
        return true;
      }
      return normalizeSlotId(item.id) === targetNorm;
    });
  };

  // Stats
  const totalCount = ads.length;
  const activeCount = ads.filter((a) => a.isActive !== false && a.videoUrl?.trim()).length;
  const allSyncedCount = ads.filter(
    (a) => a.slots?.includes("all") || (a.slots && a.slots.length >= ALL_DEFINED_SLOTS.length)
  ).length;

  // Filtered Ads
  const filteredAds = ads.filter((adItem) => {
    if (statusFilter === "active" && (!adItem.isActive || !adItem.videoUrl?.trim())) return false;
    if (statusFilter === "inactive" && adItem.isActive && adItem.videoUrl?.trim()) return false;

    const isAll = adItem.slots?.includes("all") || (adItem.slots && adItem.slots.length >= ALL_DEFINED_SLOTS.length);
    const hasHome =
      isAll ||
      adItem.slots?.some((s) => s.includes("heroTop") || s.includes("homeMid") || s.includes("homeBottom")) ||
      adItem.id.includes("home") ||
      adItem.id.includes("hero");
    const hasPlaces =
      isAll ||
      adItem.slots?.some((s) => s.includes("placesTop") || s.includes("placesFilter") || s.includes("placesMiddle") || s.includes("placesBottom")) ||
      adItem.id.includes("places");

    if (pageFilter === "home" && !hasHome) return false;
    if (pageFilter === "places" && !hasPlaces) return false;
    if (pageFilter === "all_synced" && !isAll) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = String(adItem.id).toLowerCase().includes(q);
      const titleMatch = adItem.title?.toLowerCase().includes(q);
      const urlMatch = adItem.targetUrl?.toLowerCase().includes(q);
      if (!idMatch && !titleMatch && !urlMatch) return false;
    }
    return true;
  });

  return (
    <div className={styles.adsContainer}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            backgroundColor: "#10b981",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            fontWeight: "700",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <FaCheckCircle />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={styles.adsHeaderBanner}>
        <div>
          <h1 className={styles.adsTitle}>
            🎬 إدارة ومزامنة إعلانات الفيديو (Sync Video Ads)
          </h1>
          <p className={styles.adsSubtitle}>
            إدارة مواضع الفيديو بصيغة <code>[ heroTop#1 ]</code> مع ميزة <strong>المزامنة الذكية</strong> لعرض نفس الفيديو في عدة مساحات أو في كل الموقع بنقرة واحدة!
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleResetToDefault}
            className={styles.adsResetBtn}
            title="إعادة ضبط المواضع الافتراضية"
          >
            <FaUndo />
            <span>إعادة تعيين الافتراضي</span>
          </button>

          <button onClick={() => handleOpenAddModal("[ heroTop#1 ]")} className={styles.adsAddBtn}>
            <FaPlus />
            <span>إضافة إعلان فيديو جديد</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 1: HOME PAGE SLOTS (3 SLOTS) ── */}
      <div style={{ marginBottom: "26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-fg, #ffffff)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <FaHome style={{ color: "#3b82f6" }} />
            <span>مواضع الصفحة الرئيسية (3 Home Page Slots):</span>
          </h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>
            تختفي المساحة تماماً إذا لم يكن هناك إعلان نشط
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {ALL_DEFINED_SLOTS.filter((s) => s.page === "home").map((slot) => {
            const slotAd = getSlotActiveAd(slot.id);
            return (
              <div
                key={slot.id}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: slotAd ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${slotAd ? "rgba(16, 185, 129, 0.35)" : "rgba(255, 255, 255, 0.1)"}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.85rem", color: slotAd ? "#34d399" : "#94a3b8" }}>
                      🏠 {slot.id}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: slotAd ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.15)",
                        color: slotAd ? "#34d399" : "#f87171",
                      }}
                    >
                      {slotAd ? "يظهر بالموقع ✅" : "مخفي تماماً ❌"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary, #cbd5e1)" }}>
                    {slotAd ? (
                      <span>
                        {slotAd.title}
                        {slotAd.slots && slotAd.slots.length > 1 && (
                          <span style={{ color: "#60a5fa", marginRight: "6px" }}>
                            (متزامن في {slotAd.slots.length} مواضع)
                          </span>
                        )}
                      </span>
                    ) : (
                      "لا يوجد إعلان - المساحة مخفية (0px)"
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (slotAd) handleOpenEditModal(slotAd);
                    else handleOpenAddModal(slot.id);
                  }}
                  style={{
                    background: slotAd ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                    border: `1px solid ${slotAd ? "rgba(16, 185, 129, 0.4)" : "rgba(59, 130, 246, 0.4)"}`,
                    color: slotAd ? "#34d399" : "#60a5fa",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {slotAd ? `تعديل إعلان ${slot.shortName}` : `+ إضافة إعلان ${slot.shortName}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: PLACES PAGE SLOTS (4 SLOTS) ── */}
      <div style={{ marginBottom: "26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-fg, #ffffff)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <FaMapMarkerAlt style={{ color: "#10b981" }} />
            <span>مواضع صفحة دليل الأماكن (4 Places Page Slots):</span>
          </h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>
            تظهر فقط عند وجود فيديو نشط
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {ALL_DEFINED_SLOTS.filter((s) => s.page === "places").map((slot) => {
            const slotAd = getSlotActiveAd(slot.id);
            return (
              <div
                key={slot.id}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: slotAd ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${slotAd ? "rgba(16, 185, 129, 0.35)" : "rgba(255, 255, 255, 0.1)"}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.85rem", color: slotAd ? "#34d399" : "#94a3b8" }}>
                      📍 {slot.id}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: slotAd ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.15)",
                        color: slotAd ? "#34d399" : "#f87171",
                      }}
                    >
                      {slotAd ? "يظهر بالموقع ✅" : "مخفي تماماً ❌"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary, #cbd5e1)" }}>
                    {slotAd ? (
                      <span>
                        {slotAd.title}
                        {slotAd.slots && slotAd.slots.length > 1 && (
                          <span style={{ color: "#60a5fa", marginRight: "6px" }}>
                            (متزامن في {slotAd.slots.length} مواضع)
                          </span>
                        )}
                      </span>
                    ) : (
                      "لا يوجد إعلان - المساحة مخفية (0px)"
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (slotAd) handleOpenEditModal(slotAd);
                    else handleOpenAddModal(slot.id);
                  }}
                  style={{
                    background: slotAd ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                    border: `1px solid ${slotAd ? "rgba(16, 185, 129, 0.4)" : "rgba(59, 130, 246, 0.4)"}`,
                    color: slotAd ? "#34d399" : "#60a5fa",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {slotAd ? `تعديل إعلان ${slot.shortName}` : `+ إضافة إعلان ${slot.shortName}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.adsStatsGrid}>
        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
            <FaLayerGroup />
          </div>
          <div>
            <div className={styles.adsStatVal}>{totalCount}</div>
            <div className={styles.adsStatLabel}>إجمالي إعلانات الفيديو</div>
          </div>
        </div>

        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <FaCheckCircle />
          </div>
          <div>
            <div className={styles.adsStatVal}>{activeCount}</div>
            <div className={styles.adsStatLabel}>إعلانات نشطة بالموقع</div>
          </div>
        </div>

        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
            <FaGlobe />
          </div>
          <div>
            <div className={styles.adsStatVal}>{allSyncedCount}</div>
            <div className={styles.adsStatLabel}>إعلانات معروضة بكل المساحات</div>
          </div>
        </div>

        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
            <FaSyncAlt />
          </div>
          <div>
            <div className={styles.adsStatVal}>7 مواضع</div>
            <div className={styles.adsStatLabel}>مزامنة فورية (3 رئيسية + 4 أماكن)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.adsFilterBar}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            placeholder="بحث برقم ID أو اسم الموضع أو الرابط..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.adsSearchInput}
            style={{ paddingRight: "38px" }}
          />
          <FaSearch
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted, #94a3b8)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={styles.adsSelect}
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">معطل فقط</option>
          </select>

          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value as any)}
            className={styles.adsSelect}
          >
            <option value="all">كل المواضع</option>
            <option value="home">مواضع الصفحة الرئيسية (1, 2, 3)</option>
            <option value="places">مواضع صفحة الأماكن (4, 5, 6, 7)</option>
            <option value="all_synced">المزامنة الشاملة (كل المساحات)</option>
          </select>
        </div>
      </div>

      {/* Ads List Grid */}
      {filteredAds.length === 0 ? (
        <div className={styles.adsEmptyState}>
          <FaVideo style={{ fontSize: "3rem", color: "var(--text-muted, #64748b)", marginBottom: "12px" }} />
          <h3>لا توجد إعلانات مطابقة</h3>
          <p>جرّب تعديل معايير البحث أو أضف إعلان فيديو جديد.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredAds.map((adItem) => {
            const isAllSlots =
              adItem.slots?.includes("all") ||
              (adItem.slots && adItem.slots.length >= ALL_DEFINED_SLOTS.length);
            const isGif = adItem.videoUrl?.toLowerCase().includes(".gif");
            const isYt = adItem.videoUrl?.includes("youtu");

            return (
              <div
                key={adItem.id}
                className={styles.adsCardItem}
                style={{
                  background: "var(--bg-glass-card, rgba(15, 23, 42, 0.75))",
                  border: `1px solid ${isAllSlots
                      ? "rgba(168, 85, 247, 0.45)"
                      : adItem.isActive !== false
                        ? "var(--border-glass, rgba(255, 255, 255, 0.12))"
                        : "rgba(239, 68, 68, 0.3)"
                    }`,
                }}
              >
                {/* Header: Synced Slots Tags + Format + Active Toggle */}
                <div
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", maxWidth: "80%" }}>
                    {isAllSlots ? (
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: "800",
                          padding: "3px 10px",
                          borderRadius: "8px",
                          background: "rgba(168, 85, 247, 0.25)",
                          color: "#c084fc",
                          border: "1px solid rgba(168, 85, 247, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FaGlobe />
                        <span>منشور في كل المساحات (7)</span>
                      </span>
                    ) : (
                      (adItem.slots && adItem.slots.length > 0 ? adItem.slots : [adItem.id]).map((slotId) => (
                        <span
                          key={slotId}
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: slotId.includes("heroTop") || slotId.includes("home")
                              ? "rgba(16, 185, 129, 0.2)"
                              : "rgba(59, 130, 246, 0.2)",
                            color: slotId.includes("heroTop") || slotId.includes("home")
                              ? "#34d399"
                              : "#60a5fa",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            direction: "ltr",
                          }}
                        >
                          {slotId}
                        </span>
                      ))
                    )}

                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        padding: "2px 6px",
                        borderRadius: "5px",
                        background: isGif
                          ? "rgba(168, 85, 247, 0.15)"
                          : isYt
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(255, 255, 255, 0.08)",
                        color: isGif ? "#c084fc" : isYt ? "#f87171" : "#93c5fd",
                      }}
                    >
                      {isGif ? "GIF" : isYt ? "YouTube" : "MP4"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleActive(adItem.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: adItem.isActive && adItem.videoUrl?.trim() ? "#10b981" : "#ef4444",
                    }}
                    title={adItem.isActive ? "تعطيل وإخفاء الإعلان" : "تفعيل الإعلان"}
                  >
                    {adItem.isActive && adItem.videoUrl?.trim() ? (
                      <>
                        <FaEye /> نشط
                      </>
                    ) : (
                      <>
                        <FaEyeSlash /> معطل
                      </>
                    )}
                  </button>
                </div>

                {/* Video Banner Live Preview Container */}
                <div style={{ padding: "14px 18px 8px 18px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <h3 className={styles.adsCardBodyTextTitle} style={{ margin: 0 }}>
                      {adItem.title || `إعلان ${adItem.id}`}
                    </h3>
                  </div>

                  {/* Component Preview */}
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    }}
                  >
                    {adItem.videoUrl?.trim() ? (
                      <VideoAdBanner customAd={adItem} />
                    ) : (
                      <div style={{ padding: "30px 16px", textAlign: "center", color: "#94a3b8", fontSize: "0.82rem" }}>
                        لا يوجد فيديو محدد (مخفي من الموقع)
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Link & Quick Copy */}
                <div
                  style={{
                    padding: "10px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary, #94a3b8)",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    marginTop: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      maxWidth: "240px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <FaLink style={{ fontSize: "0.75rem", flexShrink: 0 }} />
                    <span style={{ direction: "ltr" }}>{adItem.targetUrl}</span>
                    {adItem.isExternal && (
                      <FaExternalLinkAlt style={{ fontSize: "0.65rem", flexShrink: 0 }} title="رابط خارجي" />
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyLink(adItem.targetUrl)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted, #94a3b8)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="نسخ الرابط"
                  >
                    <FaCopy />
                  </button>
                </div>

                {/* Quick Action: Apply to ALL slots */}
                <div
                  style={{
                    padding: "8px 18px",
                    background: "rgba(0, 0, 0, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.78rem",
                  }}
                >
                  <span style={{ color: "var(--text-muted, #94a3b8)" }}>
                    المزامنة: {isAllSlots ? "منشور في 7 مواضع" : `${adItem.slots?.length || 1} موضع`}
                  </span>

                  {!isAllSlots && (
                    <button
                      onClick={() => handleApplyToAllSlots(adItem)}
                      title="نشر هذا الإعلان في جميع المواضع الـ 7 دفعة واحدة"
                      style={{
                        background: "rgba(168, 85, 247, 0.2)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        color: "#c084fc",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.75rem",
                      }}
                    >
                      <FaGlobe />
                      <span>تطبيق على جميع المساحات</span>
                    </button>
                  )}
                </div>

                {/* Footer Edit / Delete */}
                <div className={styles.adsCardFooterBar}>
                  <button
                    onClick={() => handleOpenEditModal(adItem)}
                    style={{
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      color: "#60a5fa",
                      padding: "7px 14px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <FaEdit />
                    <span>تعديل ومزامنة</span>
                  </button>

                  <button
                    onClick={() => handleDeleteAd(adItem.id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#f87171",
                      padding: "7px 14px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrash />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT AD WITH SYNC ══════════════ */}
      {isModalOpen && (
        <div className={styles.adsModalOverlay}>
          <div className={styles.adsModalBox} style={{ maxWidth: "820px", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <h2 className={styles.adsModalHeaderTitle}>
                {editingAd ? `✏️ تعديل ومزامنة الإعلان (${formData.id})` : "✨ إضافة إعلان ومزامنته في عدة مساحات"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted, #94a3b8)",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              {/* ── FEATURE 1 & 2: SYNC AND MULTI-SLOT SELECTION ── */}
              <div
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  borderRadius: "14px",
                  background: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <label className={styles.adsFormLabel} style={{ margin: 0, color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaSyncAlt />
                      <span>مواضع ظهور هذا الفيديو (ميزة المزامنة): *</span>
                    </label>
                    <small style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.72rem" }}>
                      اختر المساحات التي تريد عرض نفس الفيديو فيها دون الحاجة لإضافته كل مرة
                    </small>
                  </div>

                  {/* FEATURE 2: Apply to ALL slots at once button */}
                  <button
                    type="button"
                    onClick={handleSelectAllSlotsModal}
                    style={{
                      background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)",
                      border: "1px solid rgba(168, 85, 247, 0.5)",
                      color: "#ffffff",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FaGlobe />
                    <span>تطبيق على جميع المساحات الإعلانية (الكل)</span>
                  </button>
                </div>

                {/* Home Slots Multi-Checkboxes */}
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                    🏠 مواضع الصفحة الرئيسية (3):
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>
                    {ALL_DEFINED_SLOTS.filter((s) => s.page === "home").map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <div
                          key={slot.id}
                          onClick={() => handleToggleSlotSelection(slot.id)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: `2px solid ${isSelected ? "#10b981" : "rgba(255, 255, 255, 0.12)"}`,
                            background: isSelected ? "rgba(16, 185, 129, 0.2)" : "rgba(0, 0, 0, 0.3)",
                            color: isSelected ? "#34d399" : "#cbd5e1",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div>
                            <span style={{ direction: "ltr", display: "inline-block", marginRight: "6px" }}>
                              {slot.id}
                            </span>
                            <div style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "2px" }}>{slot.label}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            style={{ cursor: "pointer", accentColor: "#10b981" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Places Slots Multi-Checkboxes */}
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#60a5fa", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                    📍 مواضع صفحة الأماكن (4):
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>
                    {ALL_DEFINED_SLOTS.filter((s) => s.page === "places").map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <div
                          key={slot.id}
                          onClick={() => handleToggleSlotSelection(slot.id)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: `2px solid ${isSelected ? "#3b82f6" : "rgba(255, 255, 255, 0.12)"}`,
                            background: isSelected ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 0, 0, 0.3)",
                            color: isSelected ? "#60a5fa" : "#cbd5e1",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div>
                            <span style={{ direction: "ltr", display: "inline-block", marginRight: "6px" }}>
                              {slot.id}
                            </span>
                            <div style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "2px" }}>{slot.label}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            style={{ cursor: "pointer", accentColor: "#3b82f6" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Title & Primary Slot ID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className={styles.adsFormLabel}>
                    معرف الموضع الرئيسي (Primary ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="[ heroTop#1 ]"
                    className={styles.adsFormInput}
                    style={{ fontWeight: "800", textAlign: "center", direction: "ltr" }}
                  />
                </div>

                <div>
                  <label className={styles.adsFormLabel}>
                    اسم الإعلان (للمشرف فقط) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="مثال: إعلان عروض الصيف الشامل"
                    className={styles.adsFormInput}
                  />
                </div>
              </div>

              {/* Video URL Input */}
              <div style={{ marginBottom: "18px" }}>
                <label className={styles.adsFormLabel}>
                  رابط الفيديو (Video URL - بصيغة MP4 أو GIF أو YouTube) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://example.com/video.mp4 أو رابط يوتيوب أو GIF"
                  className={styles.adsFormInput}
                  style={{ direction: "ltr", textAlign: "left" }}
                />

                {/* Quick Presets Helpers */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)" }}>نماذج جاهزة للتجربة:</span>
                  {SAMPLE_VIDEOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, videoUrl: preset.url }))}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "var(--text-secondary, #cbd5e1)",
                        fontSize: "0.72rem",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Destination URL */}
              <div style={{ marginBottom: "18px" }}>
                <label className={styles.adsFormLabel}>
                  رابط الوصول عند النقر على الفيديو (Target URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetUrl: e.target.value,
                      isExternal: e.target.value.startsWith("http://") || e.target.value.startsWith("https://"),
                    }))
                  }
                  placeholder="مثال: /places أو https://example.com"
                  className={styles.adsFormInput}
                  style={{ direction: "ltr", textAlign: "left" }}
                />
              </div>

              {/* Checkboxes: External link & Active Status */}
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={formData.isExternal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isExternal: e.target.checked }))}
                  />
                  <span>فتح الرابط في نافذة جديدة (External Tab)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span>تفعيل هذا الإعلان في الموقع فوراً</span>
                </label>
              </div>

              {/* LIVE INTERACTIVE PREVIEW */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label className={styles.adsFormLabel} style={{ margin: 0 }}>
                    معاينة حية للإعلان (Live Preview)
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>
                    يتم تشغيله تلقائياً بدون صوت مع زر iOS زجاجي
                  </span>
                </div>

                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.15))",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                    background: "rgba(0,0,0,0.5)",
                  }}
                >
                  {formData.videoUrl?.trim() ? (
                    <VideoAdBanner customAd={formData} />
                  ) : (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted, #94a3b8)", fontSize: "0.85rem" }}>
                      أدخل رابط الفيديو لمعاينة البانر هنا
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "var(--text-secondary, #cbd5e1)",
                    padding: "9px 20px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  إلغاء
                </button>

                <button type="submit" className={styles.adsAddBtn} style={{ padding: "9px 24px" }}>
                  <FaCheckCircle />
                  <span>{editingAd ? "حفظ التعديلات والمزامنة" : "حفظ ومزامنة الإعلان"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
