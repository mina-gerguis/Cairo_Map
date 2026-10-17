"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaEye, 
  FaEyeSlash, 
  FaImage, 
  FaLink, 
  FaTag, 
  FaBullhorn, 
  FaUndo, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUpload,
  FaMagic,
  FaTimes,
  FaExternalLinkAlt,
  FaSearch,
  FaFilter,
  FaCopy,
  FaSun,
  FaMoon,
  FaChartPie,
  FaPalette
} from "react-icons/fa";
import { AdSlide, DEFAULT_SLIDES } from "@/components/AdSlider";
import styles from "../admin.module.css";

// Helper function to convert Hex to RGBA
function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(59, 130, 246, ${alpha})`;
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return `rgba(59, 130, 246, ${alpha})`;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Quick color swatches palette
const COLOR_SWATCHES = [
  { name: "أحمر ناري", primary: "#ef4444", secondary: "#f59e0b" },
  { name: "وردي زاهي", primary: "#ec4899", secondary: "#8b5cf6" },
  { name: "بنفسجي ملكي", primary: "#a855f7", secondary: "#3b82f6" },
  { name: "نيلي مميز", primary: "#6366f1", secondary: "#06b6d4" },
  { name: "أزرق حاد", primary: "#3b82f6", secondary: "#10b981" },
  { name: "سماوي بوهيمي", primary: "#06b6d4", secondary: "#3b82f6" },
  { name: "زمردي هادئ", primary: "#10b981", secondary: "#06b6d4" },
  { name: "أخضر ليموني", primary: "#22c55e", secondary: "#84cc16" },
  { name: "ذهبي دافئ", primary: "#f59e0b", secondary: "#ef4444" },
  { name: "برتقالي توهج", primary: "#f97316", secondary: "#f59e0b" },
  { name: "عنابي ياقوتي", primary: "#991b1b", secondary: "#7c2d12" },
  { name: "رمادي فخم", primary: "#475569", secondary: "#0f172a" },
];

const GRADIENT_PRESETS = [
  {
    name: "أحمر / برتقالي (مطاعم وحفلات)",
    bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.15) 100%)",
    borderColor: "rgba(239, 68, 68, 0.4)",
    glowColor: "rgba(239, 68, 68, 0.25)",
    tagBg: "rgba(239, 68, 68, 0.25)",
    tagColor: "#f87171",
  },
  {
    name: "بنفسجي / أزرق (ذكاء اصطناعي وتكنولوجيا)",
    bgGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(59, 130, 246, 0.15) 100%)",
    borderColor: "rgba(168, 85, 247, 0.4)",
    glowColor: "rgba(168, 85, 247, 0.25)",
    tagBg: "rgba(168, 85, 247, 0.25)",
    tagColor: "#c084fc",
  },
  {
    name: "زمردي / سيريان (خدمات ومحلات)",
    bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.15) 100%)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    glowColor: "rgba(16, 185, 129, 0.25)",
    tagBg: "rgba(16, 185, 129, 0.25)",
    tagColor: "#34d399",
  },
  {
    name: "ذهبي / دافئ (عروض حصرية ورعاية)",
    bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.15) 100%)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    glowColor: "rgba(245, 158, 11, 0.25)",
    tagBg: "rgba(245, 158, 11, 0.25)",
    tagColor: "#fbbf24",
  },
  {
    name: "وردي / بنفسجي (أناقة وموضة)",
    bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(139, 92, 246, 0.15) 100%)",
    borderColor: "rgba(236, 72, 153, 0.4)",
    glowColor: "rgba(236, 72, 153, 0.25)",
    tagBg: "rgba(236, 72, 153, 0.25)",
    tagColor: "#f472b6",
  },
  {
    name: "أزرق نيلي / سماوي (سياحة وسفر)",
    bgGradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(6, 182, 212, 0.15) 100%)",
    borderColor: "rgba(99, 102, 241, 0.4)",
    glowColor: "rgba(99, 102, 241, 0.25)",
    tagBg: "rgba(99, 102, 241, 0.25)",
    tagColor: "#818cf8",
  },
];

export default function AdminAdsPage() {
  const [slides, setSlides] = useState<AdSlide[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<AdSlide | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal Preview Theme Toggle (Dark vs Light Preview)
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");

  // Color Customization State
  const [colorTab, setColorTab] = useState<"preset" | "swatches" | "custom">("preset");
  const [primaryColor, setPrimaryColor] = useState<string>("#ef4444");
  const [secondaryColor, setSecondaryColor] = useState<string>("#f59e0b");
  const [bgStyleType, setBgStyleType] = useState<"glass" | "solid" | "subtle">("glass");
  const [showAdvancedColors, setShowAdvancedColors] = useState<boolean>(false);

  const updateCustomColors = (pColor: string, sColor: string, style: "glass" | "solid" | "subtle" = bgStyleType) => {
    setPrimaryColor(pColor);
    setSecondaryColor(sColor);

    let bgGradient = "";
    if (style === "glass") {
      bgGradient = `linear-gradient(135deg, ${hexToRgba(pColor, 0.22)} 0%, ${hexToRgba(sColor, 0.15)} 100%)`;
    } else if (style === "solid") {
      bgGradient = `linear-gradient(135deg, ${pColor} 0%, ${sColor} 100%)`;
    } else {
      bgGradient = `linear-gradient(135deg, ${hexToRgba(pColor, 0.12)} 0%, ${hexToRgba(sColor, 0.08)} 100%)`;
    }

    setFormData((prev) => ({
      ...prev,
      bgGradient,
      borderColor: hexToRgba(pColor, 0.4),
      glowColor: hexToRgba(pColor, 0.25),
      tagBg: hexToRgba(pColor, 0.25),
      tagColor: pColor,
    }));
  };

  // Form State
  const [formData, setFormData] = useState<Partial<AdSlide>>({
    title: "",
    description: "",
    tag: "",
    badge: "",
    icon: "📢",
    ctaText: "اضغط للمزيد",
    ctaLink: "/places",
    isExternal: false,
    image: "",
    isImageOnly: false,
    bgGradient: GRADIENT_PRESETS[0].bgGradient,
    borderColor: GRADIENT_PRESETS[0].borderColor,
    glowColor: GRADIENT_PRESETS[0].glowColor,
    tagBg: GRADIENT_PRESETS[0].tagBg,
    tagColor: GRADIENT_PRESETS[0].tagColor,
    isActive: true,
    placement: "home_slider",
  });

  // Load slides from localStorage
  const loadSlides = () => {
    try {
      const stored = localStorage.getItem("cairo_map_ad_slides");
      if (stored) {
        setSlides(JSON.parse(stored));
      } else {
        setSlides(DEFAULT_SLIDES);
        localStorage.setItem("cairo_map_ad_slides", JSON.stringify(DEFAULT_SLIDES));
      }
    } catch (e) {
      console.error(e);
      setSlides(DEFAULT_SLIDES);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const saveSlidesToStorage = (updatedSlides: AdSlide[], msg: string) => {
    setSlides(updatedSlides);
    localStorage.setItem("cairo_map_ad_slides", JSON.stringify(updatedSlides));
    window.dispatchEvent(new Event("ad_slides_updated"));
    showToast(msg);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset to default preset ads
  const handleResetToDefault = () => {
    if (confirm("هل أنت تأكد من إرجاع الإعلانات للوضع الافتراضي؟ سيمحى أي إعلان تجريبي أضفته.")) {
      saveSlidesToStorage(DEFAULT_SLIDES, "تمت إعادة تعيين الإعلانات للوضع الافتراضي بنجاح ✨");
    }
  };

  // Toggle active status
  const handleToggleActive = (id: string) => {
    const updated = slides.map((s) => {
      if (s.id === id) {
        return { ...s, isActive: s.isActive === false ? true : false };
      }
      return s;
    });
    saveSlidesToStorage(updated, "تم تحديث حالة تفعيل الإعلان بنجاح");
  };

  // Delete slide
  const handleDeleteSlide = (id: string) => {
    if (confirm("هل أنت متاكد من حذف هذا الإعلان؟")) {
      const updated = slides.filter((s) => s.id !== id);
      saveSlidesToStorage(updated, "تم حذف الإعلان بنجاح 🗑️");
    }
  };

  // Copy Ad Link
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showToast("تم نسخ رابط الإعلان إلى الحافظة 📋");
  };

  // Open modal for new slide
  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setPrimaryColor("#ef4444");
    setSecondaryColor("#f59e0b");
    setBgStyleType("glass");
    setColorTab("preset");
    setShowAdvancedColors(false);
    setFormData({
      title: "",
      description: "",
      tag: "",
      badge: "خصم خاص",
      icon: "🔥",
      ctaText: "عرض التفاصيل 🚀",
      ctaLink: "/places",
      isExternal: false,
      image: "",
      isImageOnly: false,
      bgGradient: GRADIENT_PRESETS[0].bgGradient,
      borderColor: GRADIENT_PRESETS[0].borderColor,
      glowColor: GRADIENT_PRESETS[0].glowColor,
      tagBg: GRADIENT_PRESETS[0].tagBg,
      tagColor: GRADIENT_PRESETS[0].tagColor,
      isActive: true,
      placement: "home_slider",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing slide
  const handleOpenEditModal = (slide: AdSlide) => {
    setEditingSlide(slide);
    setFormData({ ...slide });
    if (slide.tagColor && slide.tagColor.startsWith("#")) {
      setPrimaryColor(slide.tagColor);
    } else {
      setPrimaryColor("#ef4444");
    }
    setSecondaryColor("#f59e0b");
    setBgStyleType("glass");
    setColorTab("custom");
    setShowAdvancedColors(false);
    setIsModalOpen(true);
  };

  // Image Upload Handler (Convert image to Base64 Data URL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 3 ميجابايت.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, image: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isImageOnly && !formData.image?.trim()) {
      alert("برجاء تحديد أو رفع صورة البانر أولاً لإنشاء إعلان صورة فقط.");
      return;
    }

    if (!formData.isImageOnly && (!formData.title?.trim() || !formData.description?.trim())) {
      alert("يرجى ملء عنوان الإعلان والوصف بشكل صحيح.");
      return;
    }

    const finalTitle = formData.title?.trim() || (formData.isImageOnly ? "إعلان صورة" : "إعلان مميز");
    const finalDesc = formData.description?.trim() || (formData.isImageOnly ? "انقر على الصورة للانتقال للرابط" : "");

    let updated: AdSlide[];
    if (editingSlide) {
      // Edit existing
      updated = slides.map((s) => {
        if (s.id === editingSlide.id) {
          return {
            ...s,
            ...(formData as AdSlide),
            title: finalTitle,
            description: finalDesc,
            id: editingSlide.id,
          };
        }
        return s;
      });
      showToast("تم تحديث بيانات الإعلان بنجاح ✨");
    } else {
      // Create new
      const newSlide: AdSlide = {
        id: `ad_${Date.now()}`,
        title: finalTitle,
        description: finalDesc,
        tag: formData.tag || "",
        badge: formData.badge || "",
        icon: formData.icon || "📢",
        ctaText: formData.ctaText || "اضغط للمزيد",
        ctaLink: formData.ctaLink || "/places",
        isExternal: formData.isExternal || false,
        image: formData.image || "",
        isImageOnly: Boolean(formData.isImageOnly),
        bgGradient: formData.bgGradient || GRADIENT_PRESETS[0].bgGradient,
        borderColor: formData.borderColor || GRADIENT_PRESETS[0].borderColor,
        glowColor: formData.glowColor || GRADIENT_PRESETS[0].glowColor,
        tagBg: formData.tagBg || GRADIENT_PRESETS[0].tagBg,
        tagColor: formData.tagColor || GRADIENT_PRESETS[0].tagColor,
        isActive: formData.isActive !== false,
        placement: formData.placement || "home_slider",
      };
      updated = [newSlide, ...slides];
      showToast("تمت إضافة الإعلان الجديد بنجاح 🎉");
    }

    saveSlidesToStorage(updated, "تم حفظ التغييرات وتحديث البانر في الموقع!");
    setIsModalOpen(false);
  };

  // Stats Calculations
  const totalCount = slides.length;
  const activeCount = slides.filter((s) => s.isActive !== false).length;
  const inactiveCount = slides.filter((s) => s.isActive === false).length;
  const imageOnlyCount = slides.filter((s) => s.isImageOnly && s.image).length;

  // Filtered Slides
  const filteredSlides = slides.filter((slide) => {
    // Placement filter
    if (placementFilter !== "all" && (slide.placement || "home_slider") !== placementFilter) {
      return false;
    }
    // Status filter
    if (statusFilter === "active" && slide.isActive === false) return false;
    if (statusFilter === "inactive" && slide.isActive !== false) return false;

    // Type filter
    if (typeFilter === "image_only" && !slide.isImageOnly) return false;
    if (typeFilter === "text" && slide.isImageOnly) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = slide.title?.toLowerCase().includes(q);
      const descMatch = slide.description?.toLowerCase().includes(q);
      const tagMatch = slide.tag?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !tagMatch) return false;
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

      {/* Header Banner Section */}
      <div className={styles.adsHeaderBanner}>
        <div>
          <h1 className={styles.adsTitle}>
            📺 إدارة بنرات الإعلانات بالسلايدات
          </h1>
          <p className={styles.adsSubtitle}>
            التحكم الشامل في إعلانات البانر المعروضة في الصفحة الرئيسية والأماكن مع التوافق الكامل مع الوضع الفاتح والداكن.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleResetToDefault}
            className={styles.adsResetBtn}
            title="إعادة ضبط السلايدات الافتراضية"
          >
            <FaUndo />
            <span>إعادة تعيين الافتراضي</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className={styles.adsAddBtn}
          >
            <FaPlus />
            <span>إضافة إعلان جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className={styles.adsStatsGrid}>
        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
            <FaBullhorn />
          </div>
          <div>
            <div className={styles.adsStatVal}>{totalCount}</div>
            <div className={styles.adsStatLabel}>إجمالي الإعلانات المسجلة</div>
          </div>
        </div>

        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <FaCheckCircle />
          </div>
          <div>
            <div className={styles.adsStatVal}>{activeCount}</div>
            <div className={styles.adsStatLabel}>إعلانات نشطة وتعرض حالياً</div>
          </div>
        </div>

        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
            <FaEyeSlash />
          </div>
          <div>
            <div className={styles.adsStatVal}>{inactiveCount}</div>
            <div className={styles.adsStatLabel}>إعلانات معطلة أو مؤقتة</div>
          </div>
        </div>

        <div className={styles.adsStatCard}>
          <div className={styles.adsStatIcon} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
            <FaImage />
          </div>
          <div>
            <div className={styles.adsStatVal}>{imageOnlyCount}</div>
            <div className={styles.adsStatLabel}>إعلانات صور تفاعلية فقط</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={styles.adsFilterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <FaSearch style={{ color: "#94a3b8", fontSize: "0.9rem" }} />
          <input
            type="text"
            placeholder="ابحث بعنوان الإعلان، الوصف، أو الوسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.adsSearchInput}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Filter by Placement */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaFilter style={{ color: "#94a3b8", fontSize: "0.8rem" }} />
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className={styles.adsSelect}
            >
              <option value="all">جميع مواضع الظهور 📍</option>
              <option value="home_slider">🏠 سلايدر الرئيسية</option>
              <option value="places_top">🔝 أعلى صفحة الأماكن</option>
              <option value="places_middle">↔️ وسط صفحة الأماكن</option>
              <option value="places_bottom">⬇️ أسفل صفحة الأماكن</option>
            </select>
          </div>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.adsSelect}
          >
            <option value="all">جميع الحالات ⚡</option>
            <option value="active">نشط فقط ●</option>
            <option value="inactive">معطل فقط ⚪</option>
          </select>

          {/* Filter by Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.adsSelect}
          >
            <option value="all">جميع الأنواع 🎨</option>
            <option value="text">نص وصورة 📝</option>
            <option value="image_only">صورة فقط 🖼️</option>
          </select>
        </div>
      </div>

      {/* Ads Cards Grid */}
      {filteredSlides.length === 0 ? (
        <div className={styles.adsEmptyState}>
          <FaBullhorn style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.5 }} />
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>لا توجد إعلانات مطابقة لمعايير البحث والفلترة</h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>جرب تغيير نص البحث أو خيارات التصفية المعروضة بالأعلى.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredSlides.map((slide) => {
            const isActive = slide.isActive !== false;
            const isImageOnly = slide.isImageOnly && slide.image;

            return (
              <div
                key={slide.id}
                className={styles.adsCardItem}
                style={{
                  background: slide.image 
                    ? "#0f172a" 
                    : (slide.bgGradient || "rgba(15, 23, 42, 0.8)"),
                  border: `1.5px solid ${isActive ? (slide.borderColor || "rgba(255,255,255,0.15)") : "rgba(239, 68, 68, 0.3)"}`,
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                {/* Background Thumbnail Image if present */}
                {slide.image && (
                  <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: isImageOnly ? "brightness(0.85)" : "brightness(0.4)",
                      }}
                    />
                    {!isImageOnly && (
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15, 23, 42, 0.66), rgba(248, 248, 248, 0.04))" }} />
                    )}
                  </div>
                )}

                {/* Card Main Body */}
                <div style={{ position: "relative", zIndex: 2, padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Header Row: Badge & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {slide.badge && !isImageOnly && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "800",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: "linear-gradient(90deg, #ef4444, #f59e0b)",
                            color: "#fff",
                          }}
                        >
                          {slide.badge}
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: isActive ? "#34d399" : "#f87171",
                          border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                        }}
                      >
                        {isActive ? "● نشط " : "معطل ⚪"}
                      </span>

                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(59, 130, 246, 0.15)",
                          color: "#60a5fa",
                          border: "1px solid rgba(59, 130, 246, 0.25)",
                        }}
                      >
                        {
                          slide.placement === "places_top" ? "أعلى الأماكن 🔝" :
                          slide.placement === "places_middle" ? "وسط الأماكن ↔️" :
                          slide.placement === "places_bottom" ? "أسفل الأماكن ⬇️" :
                          "سلايدر الرئيسية 🏠"
                        }
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div style={{ minHeight: isImageOnly ? "50px" : "auto" }}>
                    <h3
                      className={styles.adsCardBodyTextTitle}
                      style={slide.image ? { color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.9)" } : undefined}
                    >
                      <span>{slide.icon || "📢"}</span>
                      <span>{slide.title}</span>
                    </h3>
                    {!isImageOnly && (
                      <p
                        className={styles.adsCardBodyTextDesc}
                        style={slide.image ? { color: "rgba(255, 255, 255, 0.9)", textShadow: "0 1px 3px rgba(0,0,0,0.9)", fontWeight: "600" } : undefined}
                      >
                        {slide.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className={styles.adsCardFooterBar}>
                  <div className={styles.adsCardLinkCode}>
                    رابط: <code>{slide.ctaLink}</code>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      onClick={() => handleCopyLink(slide.ctaLink)}
                      title="نسخ رابط الإعلان"
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FaCopy />
                    </button>

                    <button
                      onClick={() => handleToggleActive(slide.id)}
                      title={isActive ? "تعطيل الإعلان" : "تفعيل الإعلان"}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: isActive ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: isActive ? "#f87171" : "#34d399",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {isActive ? <FaEyeSlash /> : <FaEye />}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(slide)}
                      title="تعديل الإعلان"
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        color: "#60a5fa",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      title="حذف الإعلان"
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT AD MODAL */}
      {isModalOpen && (
        <div className={styles.adsModalOverlay}>
          <div className={styles.adsModalBox}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className={styles.adsModalHeaderTitle}>
                {editingSlide ? "✏️ تعديل بيانات الإعلان" : "➕ إضافة إعلان بنر جديد"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* LIVE PREVIEW OF SLIDE BANNER WITH LIGHT / DARK MODE TOGGLE */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#38bdf8", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaMagic />
                  <span>معاينة حية لشكل البانر في الموقع:</span>
                </div>

                {/* Theme Preview Switcher */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(255,255,255,0.08)", padding: "3px 6px", borderRadius: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme("dark")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: previewTheme === "dark" ? "#1e293b" : "transparent",
                      color: previewTheme === "dark" ? "#38bdf8" : "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    <FaMoon />
                    <span>داكن</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTheme("light")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: previewTheme === "light" ? "#ffffff" : "transparent",
                      color: previewTheme === "light" ? "#2563eb" : "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    <FaSun />
                    <span>فاتح</span>
                  </button>
                </div>
              </div>

              {formData.isImageOnly && formData.image ? (
                /* LIVE PREVIEW: PURE IMAGE ONLY MODE */
                <div
                  style={{
                    position: "relative",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "2px solid #38bdf8",
                    minHeight: "180px",
                    boxShadow: previewTheme === "light" ? "0 4px 16px rgba(0,0,0,0.08)" : "0 10px 30px rgba(56, 189, 248, 0.2)",
                  }}
                >
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      backgroundColor: previewTheme === "light" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      color: previewTheme === "light" ? "#2563eb" : "#38bdf8",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FaLink />
                    <span>
                      إعلان صورة في [
                      {formData.placement === "places_top" ? "أعلى الأماكن" :
                       formData.placement === "places_middle" ? "وسط الأماكن" :
                       formData.placement === "places_bottom" ? "أسفل الأماكن" :
                       "سلايدر الرئيسية"}
                      ] (يفتح: {formData.ctaLink || "/"})
                    </span>
                  </div>
                </div>
              ) : (
                /* LIVE PREVIEW: STANDARD TEXT + IMAGE MODE */
                <div
                  style={{
                    position: "relative",
                    borderRadius: "18px",
                    overflow: "hidden",
                    background: previewTheme === "light"
                      ? (formData.bgGradient ? "linear-gradient(135deg, rgba(241, 245, 249, 0.95) 0%, rgba(226, 232, 240, 0.9) 100%)" : "#ffffff")
                      : (formData.image ? "#080c16" : (formData.bgGradient || "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.9) 100%)")),
                    border: `1.5px solid ${formData.borderColor || (previewTheme === "light" ? "#cbd5e1" : "rgba(255,255,255,0.2)")}`,
                    padding: "20px",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    color: previewTheme === "light" ? "#0f172a" : "#ffffff",
                    boxShadow: previewTheme === "light" ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {/* Background Image Preview */}
                  {formData.image && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                      <img src={formData.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: previewTheme === "light" 
                          ? "linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.85) 60%, rgba(255,255,255,0.7) 100%)" 
                          : "linear-gradient(90deg, rgba(8,12,22,0.92) 0%, rgba(15,23,42,0.82) 50%, rgba(8,12,22,0.7) 100%)"
                      }} />
                    </div>
                  )}

                  <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "4px 10px", borderRadius: "999px", backgroundColor: formData.tagBg || (previewTheme === "light" ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.15)"), color: formData.tagColor || (previewTheme === "light" ? "#2563eb" : "#fff") }}>
                        {formData.tag || "إعلان مميز"}
                      </span>
                      {formData.badge && (
                        <span style={{ fontSize: "0.7rem", fontWeight: "800", padding: "3px 8px", borderRadius: "6px", background: "linear-gradient(90deg, #ef4444, #f59e0b)", color: "#fff" }}>
                          {formData.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 style={{ margin: "4px 0", fontSize: "1.2rem", fontWeight: "800", color: previewTheme === "light" ? "#0f172a" : "#fff" }}>
                        {formData.icon} {formData.title || "عنوان الإعلان يظهر هنا"}
                      </h3>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: previewTheme === "light" ? "#475569" : "rgba(255,255,255,0.85)" }}>
                        {formData.description || "تفاصيل ووصف الإعلان تظهر هنا بأسلوب أنيق..."}
                      </p>
                    </div>
                  </div>

                  <div style={{ position: "relative", zIndex: 2, marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ padding: "8px 16px", borderRadius: "10px", background: "linear-gradient(135deg, #006fee, #005bc4)", color: "#fff", fontWeight: "700", fontSize: "0.8rem" }}>
                      {formData.ctaText || "اضغط هنا"} 🚀
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* IMAGE ONLY MODE TOGGLE SWITCH */}
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "14px",
                  backgroundColor: formData.isImageOnly ? "rgba(56, 189, 248, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  border: `1.5px solid ${formData.isImageOnly ? "#38bdf8" : "rgba(255, 255, 255, 0.12)"}`,
                  transition: "all 0.3s ease",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontWeight: "700", color: formData.isImageOnly ? "#38bdf8" : "inherit", fontSize: "0.95rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.isImageOnly || false}
                    onChange={(e) => setFormData({ ...formData, isImageOnly: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>🖼️ جعل الإعلان "صورة فقط" (بدون نصوص) - عند النقر على الصورة يتم فتح الرابط مباشرة</span>
                </label>
                <p style={{ margin: "6px 0 0 30px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.5" }}>
                  عند تفعيل هذا الخيار، سيتم عرض الصورة بالكامل دون أي كتابة أو أزرار فوقها، وتصبح الصورة نفسها رابطاً تفاعلياً قابلاً للنقر.
                </p>
              </div>

              {/* BANNER IMAGE SELECTOR & UPLOAD */}
              <div className={styles.adsFormBox}>
                <label className={styles.adsFormLabel} style={{ color: "#38bdf8" }}>
                  🖼️ صورة البانر {formData.isImageOnly ? "*" : "(اختياري)"}:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="أدخل رابط صورة (http...) أو اختر صورة موقع مثل /1.jpg أو قم بالرفع من الجهاز"
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className={styles.adsFormInput}
                  />

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    <FaUpload />
                    <span>رفع من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#34d399" }}>✓ تم تحديد صورة البانر</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}
                    >
                      إزالة الصورة
                    </button>
                  </div>
                )}
              </div>

              {/* Row: CTA Link & External Link */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "flex-end" }}>
                <div>
                  <label className={styles.adsFormLabel}>رابط الانتقال عند النقر على الإعلان *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: /places أو https://example.com"
                    value={formData.ctaLink || ""}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className={styles.adsFormInput}
                  />
                </div>

                <div style={{ paddingBottom: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input
                      type="checkbox"
                      checked={formData.isExternal || false}
                      onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>رابط خارجي (نافذة جديدة)</span>
                  </label>
                </div>
              </div>

              {/* Placement Selection */}
              <div>
                <label className={styles.adsFormLabel}>موضع ومكان ظهور الإعلان *</label>
                <select
                  value={formData.placement || "home_slider"}
                  onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                  className={styles.adsFormSelect}
                >
                  <option value="home_slider">🏠 سلايدر الصفحة الرئيسية (Home Slider)</option>
                  <option value="places_top">🔝 أعلى صفحة الأماكن (Places Top)</option>
                  <option value="places_middle">↔️ وسط صفحة الأماكن (Places Middle)</option>
                  <option value="places_bottom">⬇️ أسفل صفحة الأماكن (Places Bottom)</option>
                </select>
              </div>

              {/* Text Fields (Title, Description, CTA text) - Hide or Optional if isImageOnly */}
              {!formData.isImageOnly && (
                <>
                  {/* Row 1: Title & Icon */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px" }}>
                    <div>
                      <label className={styles.adsFormLabel}>عنوان الإعلان الرئيسي *</label>
                      <input
                        type="text"
                        placeholder="مثال: خصم خاص 20% في شاورما وصاج الشام 🌯"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={styles.adsFormInput}
                      />
                    </div>

                    <div>
                      <label className={styles.adsFormLabel}>الرمز/الأيقونة</label>
                      <input
                        type="text"
                        placeholder="مثال: 🌯"
                        value={formData.icon || ""}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className={styles.adsFormInput}
                        style={{ textAlign: "center" }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Description */}
                  <div>
                    <label className={styles.adsFormLabel}>تفاصيل ووصف الإعلان *</label>
                    <textarea
                      rows={2}
                      placeholder="اكتب وصفاً جذاباً ومختصراً للإعلان يعرض للمستخدمين..."
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={styles.adsFormInput}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {/* Row 3: Badge & CTA Text */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className={styles.adsFormLabel}>الشارة المميزة</label>
                      <input
                        type="text"
                        placeholder="خصم 25%"
                        value={formData.badge || ""}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className={styles.adsFormInput}
                      />
                    </div>

                    <div>
                      <label className={styles.adsFormLabel}>نص الزر</label>
                      <input
                        type="text"
                        placeholder="اطلب الآن 🚀"
                        value={formData.ctaText || ""}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className={styles.adsFormInput}
                      />
                    </div>
                  </div>

                  {/* COLOR & THEME SELECTION SECTION */}
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                      <label className={styles.adsFormLabel} style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaPalette style={{ color: "#a855f7" }} />
                        <span>اختيار ألوان ونمط الإعلان:</span>
                      </label>

                      {/* Color Selection Tabs */}
                      <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.3)", padding: "3px", borderRadius: "8px" }}>
                        <button
                          type="button"
                          onClick={() => setColorTab("preset")}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: colorTab === "preset" ? "#3b82f6" : "transparent",
                            color: colorTab === "preset" ? "#fff" : "#94a3b8",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          قوالب متدرجة 🎨
                        </button>

                        <button
                          type="button"
                          onClick={() => setColorTab("swatches")}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: colorTab === "swatches" ? "#3b82f6" : "transparent",
                            color: colorTab === "swatches" ? "#fff" : "#94a3b8",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          ألوان سريعة 🌈
                        </button>

                        <button
                          type="button"
                          onClick={() => setColorTab("custom")}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: colorTab === "custom" ? "#3b82f6" : "transparent",
                            color: colorTab === "custom" ? "#fff" : "#94a3b8",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          تحديد ألوان بالكامل 🖌️
                        </button>
                      </div>
                    </div>

                    {/* TAB 1: PRESET GRADIENTS */}
                    {colorTab === "preset" && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "8px" }}>
                        {GRADIENT_PRESETS.map((preset, idx) => {
                          const isSelected = formData.bgGradient === preset.bgGradient;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  bgGradient: preset.bgGradient,
                                  borderColor: preset.borderColor,
                                  glowColor: preset.glowColor,
                                  tagBg: preset.tagBg,
                                  tagColor: preset.tagColor,
                                })
                              }
                              style={{
                                padding: "10px 12px",
                                borderRadius: "10px",
                                background: preset.bgGradient,
                                border: `2px solid ${isSelected ? "#38bdf8" : preset.borderColor}`,
                                boxShadow: isSelected ? "0 0 12px rgba(56, 189, 248, 0.4)" : "none",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                textAlign: "center",
                              }}
                            >
                              {preset.name}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TAB 2: QUICK COLOR SWATCHES */}
                    {colorTab === "swatches" && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px" }}>
                        {COLOR_SWATCHES.map((swatch, idx) => {
                          const isSelected = primaryColor === swatch.primary;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => updateCustomColors(swatch.primary, swatch.secondary)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: `1.5px solid ${isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.1)"}`,
                                boxShadow: isSelected ? "0 0 10px rgba(56, 189, 248, 0.3)" : "none",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              <span
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${swatch.primary}, ${swatch.secondary})`,
                                  flexShrink: 0,
                                  border: "1px solid rgba(255,255,255,0.4)",
                                }}
                              />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{swatch.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TAB 3: CUSTOM COLOR PICKER */}
                    {colorTab === "custom" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          {/* Primary Color Picker */}
                          <div>
                            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>
                              اللون الأساسي (Primary Color):
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => updateCustomColors(e.target.value, secondaryColor)}
                                style={{ width: "40px", height: "38px", padding: "0", border: "none", borderRadius: "8px", cursor: "pointer", background: "none" }}
                              />
                              <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => updateCustomColors(e.target.value, secondaryColor)}
                                placeholder="#ef4444"
                                className={styles.adsFormInput}
                                style={{ fontFamily: "monospace", textTransform: "uppercase", fontSize: "0.85rem" }}
                              />
                            </div>
                          </div>

                          {/* Secondary Color Picker */}
                          <div>
                            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>
                              اللون الثانوي للتدرج (Secondary Color):
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => updateCustomColors(primaryColor, e.target.value)}
                                style={{ width: "40px", height: "38px", padding: "0", border: "none", borderRadius: "8px", cursor: "pointer", background: "none" }}
                              />
                              <input
                                type="text"
                                value={secondaryColor}
                                onChange={(e) => updateCustomColors(primaryColor, e.target.value)}
                                placeholder="#f59e0b"
                                className={styles.adsFormInput}
                                style={{ fontFamily: "monospace", textTransform: "uppercase", fontSize: "0.85rem" }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Gradient Style Type */}
                        <div>
                          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>
                            نمط كثافة لون الخلفية:
                          </label>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => { setBgStyleType("glass"); updateCustomColors(primaryColor, secondaryColor, "glass"); }}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${bgStyleType === "glass" ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
                                background: bgStyleType === "glass" ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.03)",
                                color: bgStyleType === "glass" ? "#38bdf8" : "#94a3b8",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              شفاف عصري (Glass) ✨
                            </button>

                            <button
                              type="button"
                              onClick={() => { setBgStyleType("solid"); updateCustomColors(primaryColor, secondaryColor, "solid"); }}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${bgStyleType === "solid" ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
                                background: bgStyleType === "solid" ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.03)",
                                color: bgStyleType === "solid" ? "#38bdf8" : "#94a3b8",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              مشبع بارز (Solid) 🎨
                            </button>

                            <button
                              type="button"
                              onClick={() => { setBgStyleType("subtle"); updateCustomColors(primaryColor, secondaryColor, "subtle"); }}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${bgStyleType === "subtle" ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
                                background: bgStyleType === "subtle" ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.03)",
                                color: bgStyleType === "subtle" ? "#38bdf8" : "#94a3b8",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              هادئ خفيف (Subtle) 🍃
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ADVANCED COLOR FINE-TUNING ACCORDION */}
                    <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setShowAdvancedColors(!showAdvancedColors)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "0",
                        }}
                      >
                        <span>⚙️ {showAdvancedColors ? "إخفاء خيارات الألوان المتقدمة" : "عرض خيارات الألوان المتقدمة (الإطار، التدرج المباشر، الشارة)"}</span>
                      </button>

                      {showAdvancedColors && (
                        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                              كود تدرج الخلفية (bgGradient):
                            </label>
                            <input
                              type="text"
                              value={formData.bgGradient || ""}
                              onChange={(e) => setFormData({ ...formData, bgGradient: e.target.value })}
                              className={styles.adsFormInput}
                              style={{ fontSize: "0.8rem", fontFamily: "monospace" }}
                            />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                                لون الإطار (borderColor):
                              </label>
                              <input
                                type="text"
                                value={formData.borderColor || ""}
                                onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                                className={styles.adsFormInput}
                                style={{ fontSize: "0.8rem", fontFamily: "monospace" }}
                              />
                            </div>

                            <div>
                              <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                                خلفية الوسم (tagBg):
                              </label>
                              <input
                                type="text"
                                value={formData.tagBg || ""}
                                onChange={(e) => setFormData({ ...formData, tagBg: e.target.value })}
                                className={styles.adsFormInput}
                                style={{ fontSize: "0.8rem", fontFamily: "monospace" }}
                              />
                            </div>

                            <div>
                              <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                                لون كتابة الوسم (tagColor):
                              </label>
                              <input
                                type="text"
                                value={formData.tagColor || ""}
                                onChange={(e) => setFormData({ ...formData, tagColor: e.target.value })}
                                className={styles.adsFormInput}
                                style={{ fontSize: "0.8rem", fontFamily: "monospace" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Form Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "none",
                    color: "inherit",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #006fee, #005bc4)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(0, 111, 238, 0.35)",
                  }}
                >
                  {editingSlide ? "حفظ التعديلات ✨" : "إضافة الإعلان الآن 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
