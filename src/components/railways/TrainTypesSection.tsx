"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export interface TrainTypeItem {
  id: string;
  name: string;
  englishName: string;
  category: "luxury" | "sleep" | "express_ac" | "economy";
  categoryBadge: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  icon: string;
  image: string;
  fallbackImage: string;
  desc: string;
  specs: {
    speed: string;
    cooling: string;
    buffet: string;
    power: string;
    target: string;
    priceTier: string;
  };
  features: string[];
  routes: string[];
  travelTip: string;
}

const TRAIN_TYPES_DATA: TrainTypeItem[] = [
  {
    id: "talgo",
    name: "قطارات تالجو الفاخرة (Talgo)",
    englishName: "Talgo Luxury Express",
    category: "luxury",
    categoryBadge: "الفئة الأحدث والأفخم",
    badge: "الأحدث والأسرع 🚄",
    badgeBg: "rgba(220, 38, 38, 0.1)",
    badgeColor: "#dc2626",
    icon: "bx bx-tachometer",
    image: "/images/trains/talgo.webp",
    fallbackImage: "https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1000&q=80",
    desc: "أحدث قطارات السكك الحديدية المصرية المُصنعة من شركة تالجو الإسبانية. تعتمد على تكنولوجيا تعليق هوائي متطورة تخفض الاهتزازات لراحة فائقة وسرعة تشغيلية عالية مع خدمات درجة أولى متكاملة.",
    specs: {
      speed: "حتى 160 كم / ساعة",
      cooling: "تكييف هواء ذكي متطور ومعقم",
      buffet: "عربة بوفيه مجهزة تقدم وجبات ومشروبات",
      power: "شاشات عرض لكل مقعد + شواحن وواي فاي",
      target: "رجال الأعمال، العائلات، والباحثين عن السرعة والراحة",
      priceTier: "درجة أولى: 225-700 ج | ثانية: 150-550 ج"
    },
    features: [
      "شاشات عرض تفاعلية ترفيهية خاصة بكل مقعد بالدرجة الأولى",
      "نظام تعليق هوائي مانع للاهتزاز يوفر أعلى درجات الهدوء والثبات",
      "عربة بوفيه راقية لتقديم الوجبات الطازجة والمشروبات الساخنة والباردة",
      "عزل صوتي وحراري فائق مع نظام كاميرات مراقبة حديث للأمان",
      "مقاعد جلدية وثيرة قابلة للتعديل ودورات مياه مجهزة لذوي الهمم"
    ],
    routes: ["القاهرة ⇆ الإسكندرية (مباشر وسريع)", "القاهرة ⇆ محافظات الصعيد حتى أسوان"],
    travelTip: "يُنصح بالحجز المسبق قبل موعد الرحلة بـ 48 ساعة على الأقل نظراً لكثافة الإقبال على قطارات تالجو."
  },
  {
    id: "vip",
    name: "قطارات VIP السريعة المكيفة",
    englishName: "VIP Special Express",
    category: "luxury",
    categoryBadge: "درجة أولى وثانية ممتازة",
    badge: "سريع ومريح ⚡",
    badgeBg: "rgba(217, 119, 6, 0.1)",
    badgeColor: "#d97706",
    icon: "bx bx-crown",
    image: "/images/trains/vip.webp",
    fallbackImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1000&q=80",
    desc: "قطارات مكيفة سريعة مخصصة للرحلات الطويلة والمتوسطة بين المحافظات الكبرى، تتميز بقلة محطات التوقف ومقاعد جلدية فاخرة ومريحة مع توفر خدمات الضيافة والنظافة الدورية.",
    specs: {
      speed: "120 - 140 كم / ساعة",
      cooling: "تكييف مركزي متطور",
      buffet: "عربة بوفيه متكاملة للوجبات الخفيفة",
      power: "منافذ شحن هواتف كهربائية لكل مقعد",
      target: "المسافرين لمسافات طويلة بين القاهرة والمحافظات",
      priceTier: "درجة أولى: 145-375 ج | ثانية: 115-300 ج"
    },
    features: [
      "مقاعد جلدية مريحة قابلة للتعديل والإمالة للاسترخاء أثناء السفر",
      "منافذ كهربائية مخصصة لشحن الهواتف والأجهزة عند المقاعد",
      "عربة بوفيه تقدم ساندوتشات ومشروبات ساخنة وباردة على مدار الرحلة",
      "خدمة نظافة وأمن دورية مع مساحات واسعة ومخصصة للحقائب والأمتعة"
    ],
    routes: ["القاهرة ⇆ الإسكندرية", "القاهرة ⇆ أسيوط / سوهاج / قنا / الأقصر / أسوان", "القاهرة ⇆ بورسعيد"],
    travelTip: "الخيار الأفضل لرحلات الصعيد النهارية لمن يبحث عن توازن ممتاز بين الراحة والسرعة وسعر التذكرة."
  },
  {
    id: "sleeping",
    name: "قطارات النوم الفاخرة (Wagon-Lits)",
    englishName: "Sleeping Trains (Wagon-Lits)",
    category: "sleep",
    categoryBadge: "خدمة فندقية ليلية",
    badge: "فندقي ليلي 🛏️",
    badgeBg: "rgba(109, 40, 217, 0.1)",
    badgeColor: "#7c3aed",
    icon: "bx bx-bed",
    image: "/images/trains/sleeping.webp",
    fallbackImage: "https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=1000&q=80",
    desc: "قطارات فندقية مخصصة للسفر الليلي لمسافات طويلة بين القاهرة ومحافظات الصعيد السياحية (الأقصر وأسوان)، توفر كبائن نوم خاصة ومغلقة مع وجبتي عشاء وإفطار ساخنتين مشمولتين في التذكرة.",
    specs: {
      speed: "100 - 120 كم / ساعة",
      cooling: "تكييف هواء مستقل لكل كابينة",
      buffet: "عربة نادي وصالون + وجبات ساخنة مشمولة",
      power: "مغسلة خاصة + مقابس كهرباء وإضاءة قراءة",
      target: "السياح، العائلات، والمسافرين ليلاً للأقصر وأسوان",
      priceTier: "كبائن مفردة ومزدوجة (تشمل الوجبات)"
    },
    features: [
      "كبائن نوم خاصة ومغلقة بها أسرة مجهزة ومفروشات فندقية نظيفة",
      "وجبة عشاء وإفطار ساخنة مجانية تقدم داخل الكابينة بواسطة طاقم الضيافة",
      "مغسلة خاصة ومرآة داخل كل كابينة مع إمكانية ضبط التكييف والإضاءة",
      "عربة نادي وصالون راقية مخصصة للاسترخاء وتناول المشروبات",
      "ملاحظ كابينة مخصص على مدار 24 ساعة لخدمة الركاب والمساعدة"
    ],
    routes: ["القاهرة ⇆ الأقصر ⇆ أسوان (رحلات ليلية منتظمة)", "الإسكندرية ⇆ مطروح (موسمي صيفي)"],
    travelTip: "توفر عليك ليلة فندقية وتضمن وصولك في الصباح الباكر إلى وجهتك السياحية بكامل النشاط."
  },
  {
    id: "spanish_french",
    name: "قطارات إسباني / فرنسي مطور",
    englishName: "Upgraded Spanish & French Trains",
    category: "express_ac",
    categoryBadge: "الدرجة المكيفة الكلاسيكية",
    badge: "كلاسيكي مكيف 🚆",
    badgeBg: "rgba(37, 99, 235, 0.1)",
    badgeColor: "#2563eb",
    icon: "bx bx-train",
    image: "/images/trains/spanish.webp",
    fallbackImage: "https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1000&q=80",
    desc: "القطارات المكيفة الكلاسيكية الشهيرة التي تم تجديدها وإعادة تأهيل مقاعدها وعرباتها بالكامل لتقديم رحلات مريحة وموثوقة بتكلفة اقتصادية مناسبة للسفر اليومي والدراسي.",
    specs: {
      speed: "100 - 120 كم / ساعة",
      cooling: "تكييف مركزي مجدد بالكامل",
      buffet: "عربة بوفيه للمشروبات والمأكولات الخفيفة",
      power: "إضاءة حديثة ومقاعد مريحة ومجددة",
      target: "المسافرين بانتظام، الموظفين، والطلاب",
      priceTier: "درجة أولى: 80-200 ج | ثانية: 65-150 ج"
    },
    features: [
      "عربات مجددة بالكامل بمقاعد مريحة ومساند مريحة للرأس والأقدام",
      "تكييف هواء مركزي فعال ومناسب لكافة فصول السنة",
      "عربة بوفيه لتقديم الشاي والقهوة والمشروبات الباردة والوجبات السريعة",
      "تغطية واسعة لكافة المحافظات والمراكز الكبرى بالجمهورية"
    ],
    routes: ["القاهرة ⇆ الإسكندرية", "القاهرة ⇆ محافظات الصعيد بالكامل", "القاهرة ⇆ الدلتا والقناة"],
    travelTip: "القطار الأكثر اعتمادية وتوفراً بمواعيد متعددة على مدار اليوم وأسعار مناسبة جداً."
  },
  {
    id: "russian_ac",
    name: "قطارات روسي مكيفة (الدرجة الثالثة المكيفة)",
    englishName: "Russian AC 3rd Class",
    category: "express_ac",
    categoryBadge: "اقتصادي مكيف حديث",
    badge: "أفضل قيمة وسعر 💰",
    badgeBg: "rgba(5, 150, 105, 0.1)",
    badgeColor: "#059669",
    icon: "bx bx-badge-check",
    image: "/images/trains/russian_ac.webp",
    fallbackImage: "https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?auto=format&fit=crop&w=1000&q=80",
    desc: "عربات جديدة دخلت الخدمة حديثاً ضمن أسطول السكك الحديدية الجديد لتوفير خدمة سفر مكيفة بالكامل بأسعار اقتصادية في متناول جميع فئات المجتمع.",
    specs: {
      speed: "100 - 120 كم / ساعة",
      cooling: "تكييف هواء حديث فائق الكفاءة",
      buffet: "عربة بوفيه طعام ومشروبات خفيفة",
      power: "شاشات إلكترونية إرشادية داخل العربات",
      target: "الطلاب والعائلات والباحثين عن سفر مكيف واقتصادي",
      priceTier: "تذاكر موحدة اقتصادية (60 - 170 ج)"
    },
    features: [
      "عربات جديدة كلياً بتجهيزات أمان وتكييف هواء حديثة الصنع",
      "شاشات إلكترونية رقمية توضح المحطات القادمة وإرشادات السفر",
      "سعر تذكرة اقتصادي يجعله البديل الأمثل للسفر المكيف لمسافات طويلة",
      "رحلات كثيفة يومياً تغطي الوجهين البحري والقبلي"
    ],
    routes: ["القاهرة ⇆ الإسكندرية", "القاهرة ⇆ محافظات الصعيد", "القاهرة ⇆ مدن القناة والدلتا"],
    travelTip: "أفضل خيار اقتصادي للسفر المكيف لمسافات طويلة دون تحمل تكاليف الدرجات الفاخرة."
  },
  {
    id: "tahya_misr",
    name: "قطارات تحيا مصر (تهوية ديناميكية وعادية)",
    englishName: "Tahya Misr & Dynamic Vent",
    category: "economy",
    categoryBadge: "الدرجة الشعبية الاقتصادية",
    badge: "الأوفر للركاب 🪙",
    badgeBg: "rgba(100, 116, 139, 0.1)",
    badgeColor: "#475569",
    icon: "bx bx-trip",
    image: "/images/trains/tahya_misr.webp",
    fallbackImage: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1000&q=80",
    desc: "القطارات المخصصة للتنقلات اليومية القصيرة والمتوسطة بين القرى والمراكز والمحافظات، تتميز بتكلفتها الرمزية وتوقفها في المحطات الفرعية لخدمة ملايين الركاب يومياً.",
    specs: {
      speed: "70 - 90 كم / ساعة",
      cooling: "نظام تهوية ديناميكية + شبابيك واسعة",
      buffet: "بائعين مرخصين ومنافذ المحطات",
      power: "مقاعد متينة مخصصة للتنقل اليومي السريع",
      target: "الموظفين والعمال والركاب بين المراكز والقرى",
      priceTier: "أسعار رمزية مدعومة (تبدأ من 10 إلى 50 ج)"
    },
    features: [
      "عربات مطورة بنظام تهوية ديناميكية يوفر تدفق هواء مستمر",
      "تتوقف في كافة المحطات والقرى والمراكز الفرعية على طول الخط",
      "تكلفة سفر رمزية ومنخفضة تناسب التنقل اليومي المتكرر",
      "رحلات متكررة ومنتظمة على مدار ساعات اليوم"
    ],
    routes: ["كافة خطوط الجمهورية (خطوط الدلتا، القناة، والصعيد والمراكز)"],
    travelTip: "الخيار المفضل للوصول إلى المحطات والمراكز الفرعية التي لا تتوقف بها القطارات السريعة."
  }
];

interface TrainTypesSectionProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  themeColor?: string;
  onJumpToBooking?: () => void;
}

export default function TrainTypesSection({ sectionRef, themeColor = "#2563eb", onJumpToBooking }: TrainTypesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activePreviewImage, setActivePreviewImage] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = TRAIN_TYPES_DATA.length;
  const currentTrain = TRAIN_TYPES_DATA[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      ref={sectionRef}
      style={{
        backgroundColor: "var(--bgPrimary)",
        border: "1px solid var(--borderGlass)",
        borderRadius: "16px",
        padding: "clamp(16px, 2.5vw, 24px)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "24px",
        overflow: "hidden"
      }}
    >
      {/* Classic Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          paddingBottom: "14px",
          borderBottom: "1px solid var(--borderGlass)"
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "800",
              color: "var(--textPrimary)",
              margin: "0 0 4px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="bx bx-train" style={{ color: themeColor, fontSize: "1.35rem" }} />
            أنواع ومواصفات القطارات
          </h2>
          <p style={{ margin: 0, color: "var(--textSecondary)", fontSize: "0.85rem", lineHeight: "1.6" }}>
            دليل كلاسيكي منظم لفئات وتجهيزات قطارات سكك حديد مصر
          </p>
        </div>

        {/* Slide Counter & Prev/Next Arrows */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: "700",
              color: "var(--textSecondary)",
              padding: "4px 10px",
              background: "rgba(128,128,128,0.06)",
              borderRadius: "6px",
              border: "1px solid var(--borderGlass)"
            }}
          >
            قطار {currentIndex + 1} من {totalSlides}
          </span>

          <button
            type="button"
            onClick={handlePrev}
            title="السابق"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: "rgba(128,128,128,0.06)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <i className="bx bx-chevron-right" style={{ fontSize: "1.3rem" }} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            title="التالي"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: "rgba(128,128,128,0.06)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <i className="bx bx-chevron-left" style={{ fontSize: "1.3rem" }} />
          </button>
        </div>
      </div>

      {/* Classic Tab Bar: Numbered Train Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none"
        }}
      >
        {TRAIN_TYPES_DATA.map((train, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={train.id}
              type="button"
              onClick={() => goToSlide(idx)}
              style={{
                flex: "0 0 auto",
                padding: "7px 12px",
                borderRadius: "8px",
                background: isActive ? "var(--textPrimary)" : "rgba(128,128,128,0.04)",
                color: isActive ? "var(--bgPrimary)" : "var(--textSecondary)",
                border: isActive ? "1px solid var(--textPrimary)" : "1px solid var(--borderGlass)",
                fontSize: "0.8rem",
                fontWeight: isActive ? "800" : "600",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ opacity: 0.75, fontSize: "0.75rem" }}>0{idx + 1}.</span>
              <span>{train.name.split(" ")[0]} {train.name.split(" ")[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Classic Main Showcase Box */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          border: "1px solid var(--borderGlass)",
          borderRadius: "12px",
          background: "rgba(128, 128, 128, 0.02)",
          padding: "clamp(14px, 2.5vw, 20px)",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}
      >
        {/* Top Header of Current Train */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "10px",
            paddingBottom: "12px",
            borderBottom: "1px dashed var(--borderGlass)"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  background: currentTrain.badgeBg,
                  color: currentTrain.badgeColor,
                  border: `1px solid ${currentTrain.badgeColor}40`,
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "0.72rem",
                  fontWeight: "800"
                }}
              >
                {currentTrain.badge}
              </span>
              <span style={{ fontSize: "0.74rem", color: "var(--textMuted)", fontWeight: "600" }}>
                {currentTrain.categoryBadge}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "var(--textPrimary)" }}>
              {currentTrain.name}
            </h3>
            <span style={{ fontSize: "0.74rem", color: "var(--textMuted)", direction: "ltr", display: "block", marginTop: "2px" }}>
              {currentTrain.englishName}
            </span>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--textSecondary)", textAlign: "left" }}>
            <span style={{ display: "block", fontWeight: "700", color: "var(--textPrimary)" }}>
              {currentTrain.specs.speed}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--textMuted)" }}>السرعة التشغيلية</span>
          </div>
        </div>

        {/* 2-Column Classic Layout: Image Frame & Information */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "20px",
            alignItems: "start"
          }}
        >
          {/* Classic Image Frame */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "230px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid var(--borderGlass)",
                background: "#0a0a0a",
                cursor: "pointer"
              }}
              onClick={() =>
                setActivePreviewImage({
                  src: currentTrain.image,
                  title: currentTrain.name,
                  subtitle: currentTrain.categoryBadge
                })
              }
            >
              <img
                key={currentTrain.id}
                src={currentTrain.image}
                alt={currentTrain.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== currentTrain.fallbackImage) {
                    target.src = currentTrain.fallbackImage;
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <i className="bx bx-zoom-in" />
                <span>تكبير الصورة</span>
              </div>
            </div>

            {/* Operating Routes Bar */}
            <div
              style={{
                background: "rgba(128,128,128,0.04)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "8px",
                padding: "10px 12px"
              }}
            >
              <div style={{ fontSize: "0.76rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                📍 خطوط السير المتاحة:
              </div>
              <ul style={{ margin: 0, paddingRight: "16px", fontSize: "0.75rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                {currentTrain.routes.map((rt, rIdx) => (
                  <li key={rIdx}>{rt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Details Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Description */}
            <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--textSecondary)", lineHeight: "1.7" }}>
              {currentTrain.desc}
            </p>

            {/* Classic Specs Table */}
            <div
              style={{
                border: "1px solid var(--borderGlass)",
                borderRadius: "8px",
                overflow: "hidden",
                fontSize: "0.78rem"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "rgba(128,128,128,0.04)",
                  borderBottom: "1px solid var(--borderGlass)"
                }}
              >
                <span style={{ color: "var(--textMuted)", fontWeight: "600" }}>نظام التكييف:</span>
                <span style={{ color: "var(--textPrimary)", fontWeight: "700" }}>{currentTrain.specs.cooling}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--borderGlass)"
                }}
              >
                <span style={{ color: "var(--textMuted)", fontWeight: "600" }}>البوفيه والضيافة:</span>
                <span style={{ color: "var(--textPrimary)", fontWeight: "700" }}>{currentTrain.specs.buffet}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "rgba(128,128,128,0.04)",
                  borderBottom: "1px solid var(--borderGlass)"
                }}
              >
                <span style={{ color: "var(--textMuted)", fontWeight: "600" }}>الخدمات والشواحن:</span>
                <span style={{ color: "var(--textPrimary)", fontWeight: "700" }}>{currentTrain.specs.power}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px"
                }}
              >
                <span style={{ color: "var(--textMuted)", fontWeight: "600" }}>فئة الأسعار:</span>
                <span style={{ color: currentTrain.badgeColor, fontWeight: "800" }}>{currentTrain.specs.priceTier}</span>
              </div>
            </div>

            {/* Features List */}
            <div
              style={{
                background: "rgba(128,128,128,0.02)",
                border: "1px solid var(--borderGlass)",
                borderRadius: "8px",
                padding: "10px 12px"
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--textPrimary)", marginBottom: "6px" }}>
                ✨ أهم التجهيزات والمميزات:
              </div>
              <ul style={{ margin: 0, paddingRight: "16px", fontSize: "0.76rem", color: "var(--textSecondary)", lineHeight: "1.6" }}>
                {currentTrain.features.map((feat, fIdx) => (
                  <li key={fIdx} style={{ marginBottom: "3px" }}>{feat}</li>
                ))}
              </ul>
            </div>

            {/* Travel Tip */}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(128,128,128,0.04)",
                borderRight: `3px solid ${themeColor}`,
                fontSize: "0.78rem",
                color: "var(--textPrimary)",
                lineHeight: "1.6"
              }}
            >
              <strong>💡 نصيحة السفر: </strong>
              <span style={{ color: "var(--textSecondary)" }}>{currentTrain.travelTip}</span>
            </div>

            {/* CTA Button */}
            {onJumpToBooking && (
              <button
                type="button"
                onClick={onJumpToBooking}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "var(--colorPrimary, #2563eb)",
                  color: "#fff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.15s ease"
                }}
              >
                <i className="bx bxs-book-open" />
                <span>كيفية حجز تذاكر {currentTrain.name.split(" ")[0]}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: "1px solid var(--borderGlass)",
            marginTop: "6px"
          }}
        >
          <button
            type="button"
            onClick={handlePrev}
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              background: "rgba(128,128,128,0.06)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bx bx-right-arrow-alt" />
            <span>القطار السابق</span>
          </button>

          <div style={{ display: "flex", gap: "6px" }}>
            {TRAIN_TYPES_DATA.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => goToSlide(dotIdx)}
                style={{
                  width: dotIdx === currentIndex ? "18px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: dotIdx === currentIndex ? "var(--textPrimary)" : "rgba(128,128,128,0.3)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              background: "rgba(128,128,128,0.06)",
              border: "1px solid var(--borderGlass)",
              color: "var(--textPrimary)",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>القطار التالي</span>
            <i className="bx bx-left-arrow-alt" />
          </button>
        </div>
      </div>

      {/* Classic Lightbox Image Modal */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "650px",
              width: "100%",
              background: "var(--bgPrimary, #000)",
              border: "1px solid var(--borderGlass)",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "340px", background: "#000" }}>
              <img
                src={activePreviewImage.src}
                alt={activePreviewImage.title}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => setActivePreviewImage(null)}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 2px", fontSize: "1rem", color: "var(--textPrimary)", fontWeight: "800" }}>
                  {activePreviewImage.title}
                </h4>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--textSecondary)" }}>{activePreviewImage.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewImage(null)}
                className="btn btn-cancel"
                style={{ padding: "6px 14px", fontSize: "0.8rem", borderRadius: "6px", cursor: "pointer" }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
