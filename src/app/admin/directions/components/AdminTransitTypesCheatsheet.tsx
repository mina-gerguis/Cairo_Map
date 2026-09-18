import React, { useState } from "react";
import { getTransitOptionIconPath } from "../utils";
import { TransitVehicleType } from "../types";

export interface TransitTypeGuideItem {
  typeKey: string;
  arabicName: string;
  acceptedArabicKeywords: string[];
  description: string;
  iconPath: string;
  badgeColor: string;
}

export const TRANSIT_TYPES_GUIDE_DATA: TransitTypeGuideItem[] = [
  {
    typeKey: "microbus",
    arabicName: "ميكروباص",
    acceptedArabicKeywords: ["ميكروباص", "ميكوباص", "مكروباص", "سرفيس", "microbus", "micro"],
    description: "سيارات الميكروباص والسرفيس وخطوط النقل الجماعي الصغير",
    iconPath: "/images/icons2d/microbus.png",
    badgeColor: "#3b82f6"
  },
  {
    typeKey: "metro",
    arabicName: "مترو الأنفاق",
    acceptedArabicKeywords: ["مترو", "مترو الأنفاق", "مترو الانفاق", "metro", "subway"],
    description: "خطوط مترو القاهرة الكبرى (الخط الأول، الثاني، الثالث)",
    iconPath: "/images/icons2d/metro.png",
    badgeColor: "#ef4444"
  },
  {
    typeKey: "bus",
    arabicName: "أتوبيس النقل العام",
    acceptedArabicKeywords: ["أتوبيس", "اتوبيس", "باص", "نقل عام", "ميني باص", "سوبر جيت", "جو باص", "bus"],
    description: "أتوبيسات هيئة النقل العام (CTA)، الميني باص، وشركات النقل بين المحافظات",
    iconPath: "/images/icons2d/bus.png",
    badgeColor: "#0284c7"
  },
  {
    typeKey: "brt",
    arabicName: "الأتوبيس الترددي (BRT)",
    acceptedArabicKeywords: ["ترددي", "الأتوبيس الترددي", "اتوبيس ترددي", "باص ترددي", "brt", "bus rapid"],
    description: "حافلات الأتوبيس الترددي السريع على الطريق الدائري",
    iconPath: "/images/icons2d/brt.png",
    badgeColor: "#10b981"
  },
  {
    typeKey: "train",
    arabicName: "قطار السكك الحديدية",
    acceptedArabicKeywords: ["قطار", "قطارات", "سكة حديد", "سكك حديد", "سكه حديد", "train", "railway"],
    description: "قطارات الهيئة القومية لسكك حديد مصر (س.ح.م) الروسي، التالجو، والمكيف",
    iconPath: "/images/icons2d/Cairo_train.png",
    badgeColor: "#d97706"
  },
  {
    typeKey: "monorail",
    arabicName: "قطار المونوريل",
    acceptedArabicKeywords: ["مونوريل", "المونوريل", "monorail"],
    description: "مونوريل شرق النيل (العاصمة الإدارية) ومونوريل غرب النيل (6 أكتوبر)",
    iconPath: "/images/icons2d/Cairo_monorail_east.png",
    badgeColor: "#06b6d4"
  },
  {
    typeKey: "lrt",
    arabicName: "القطار الكهربائي الخفيف (LRT)",
    acceptedArabicKeywords: ["lrt", "كهربائي", "القطار الكهربائي", "قطار كهربائي", "LRT", "light rail"],
    description: "القطار الكهربائي الخفيف (عدلي منصور - العاشر من رمضان - العاصمة الإدارية)",
    iconPath: "/images/icons2d/Cairo_lrt.png",
    badgeColor: "#8b5cf6"
  },
  {
    typeKey: "car",
    arabicName: "سيارة خاصة",
    acceptedArabicKeywords: ["سيارة", "سياره", "عربية", "عربيه", "ملاكي", "خاص", "car", "private"],
    description: "السيارات الخاصة والملاكي والسفر عبر الطرق والمحاور السريعة",
    iconPath: "/images/icons2d/car.png",
    badgeColor: "#64748b"
  },
  {
    typeKey: "taxi",
    arabicName: "تاكسي / أوبر / كريم",
    acceptedArabicKeywords: ["تاكسي", "تاكس", "اوبر", "أوبر", "كريم", "taxi", "cab", "uber", "careem"],
    description: "سيارات التاكسي الأبيض وتطبيقات النقل الذكي",
    iconPath: "/images/icons2d/taxi.png",
    badgeColor: "#f59e0b"
  },
  {
    typeKey: "plane",
    arabicName: "طائرة / طيران",
    acceptedArabicKeywords: ["طيران", "طائرة", "طائره", "مطار", "plane", "flight", "airport"],
    description: "رحلات الطيران والمطارات وصالات السفر الجوي",
    iconPath: "/images/icons2d/airport.png",
    badgeColor: "#ec4899"
  },
  {
    typeKey: "ship",
    arabicName: "سفينة / أتوبيس نهري",
    acceptedArabicKeywords: ["سفينة", "سفينه", "عبارة", "عباره", "مركب", "نهري", "أتوبيس نهري", "ship", "ferry"],
    description: "الأتوبيس النهري، المعديات، والرحلات النيلية والبحرية",
    iconPath: "/images/icons2d/ship.png",
    badgeColor: "#14b8a6"
  },
  {
    typeKey: "multi",
    arabicName: "مواصلات متعددة",
    acceptedArabicKeywords: ["متعدد", "تحويل", "مواصلات متعددة", "تبديل", "multi", "transfer"],
    description: "رحلات تجمع أكثر من وسيلة (مثل: مترو + ميكروباص + أتوبيس)",
    iconPath: "/images/icons2d/multi.png",
    badgeColor: "#3b82f6"
  },
  {
    typeKey: "walk",
    arabicName: "سير على الأقدام",
    acceptedArabicKeywords: ["مشي", "سير", "اقدام", "أقدام", "على الاقدام", "walk", "walking"],
    description: "مراحل المشي والتنقل سيراً على الأقدام بين المحطات",
    iconPath: "/images/icons2d/walk.png",
    badgeColor: "#10b981"
  }
];

interface AdminTransitTypesCheatsheetProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function AdminTransitTypesCheatsheet({ isModal, onClose }: AdminTransitTypesCheatsheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredItems = TRANSIT_TYPES_GUIDE_DATA.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      item.typeKey.toLowerCase().includes(term) ||
      item.arabicName.toLowerCase().includes(term) ||
      item.acceptedArabicKeywords.some((k) => k.toLowerCase().includes(term)) ||
      item.description.toLowerCase().includes(term)
    );
  });

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        direction: "rtl"
      }}
    >
      {/* Search & Info Banner */}
      <div
        style={{
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <i
            className="bx bx-bulb"
            style={{ fontSize: "1.4rem", color: "#818cf8", marginTop: "2px" }}
          />
          <div>
            <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: "800", color: "#818cf8" }}>
              دليل كتابة أنواع المواصلات في ملف الإكسل (Excel CheatSheet)
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                lineHeight: "1.5"
              }}
            >
              في عمود <strong>&quot;نوع وسيلة المواصلات&quot;</strong> أو <strong>&quot;type&quot;</strong> داخل الإكسل، يمكنك كتابة الكود الإنجليزي (مثل <code>metro</code>) أو الكلمة باللغة العربية (مثل <code>مترو</code> أو <code>ميكروباص</code>)، وسيتعرف النظام عليها فوراً ويضع الأيقونة المناسبة.
            </p>
          </div>
        </div>

        {/* Live Filter Input */}
        <div style={{ position: "relative" }}>
          <i
            className="bx bx-search"
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
              fontSize: "1.1rem"
            }}
          />
          <input
            type="text"
            placeholder="ابحث عن وسيلة مواصلات أو كلمة مفتاحية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-fields"
            style={{
              width: "100%",
              paddingRight: "38px",
              fontSize: "0.85rem"
            }}
          />
        </div>
      </div>

      {/* Grid of Transit Types */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
          maxHeight: isModal ? "50vh" : "none",
          overflowY: isModal ? "auto" : "visible",
          paddingRight: "2px"
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.typeKey}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "12px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "all 0.2s ease"
            }}
          >
            {/* Top row: Icon + Arabic Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: item.badgeColor + "15",
                  border: `1px solid ${item.badgeColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <img
                  src={item.iconPath}
                  alt=""
                  style={{ width: "22px", height: "auto", objectFit: "contain" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: "800", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                  {item.arabicName}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {item.description}
                </span>
              </div>
            </div>

            {/* Code Key & Copy Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--tab-active-bg)",
                color: "var(--tab-active-color)",
                padding: "6px 10px",
                borderRadius: "var(--radius-card)",
                border: "1px solid var(--border-glass)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem" }}>الكود الإنجليزي:</span>
                <code
                  style={{
                    color: item.badgeColor,
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    direction: "ltr"
                  }}
                >
                  {item.typeKey}
                </code>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(item.typeKey)}
                style={{
                  background: copiedKey === item.typeKey ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  color: copiedKey === item.typeKey ? "#34d399" : "var(--tab-active-color)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "600"
                }}
              >
                <i className={`bx ${copiedKey === item.typeKey ? "bx-check" : "bx-copy"}`} />
                <span>{copiedKey === item.typeKey ? "تم النسخ!" : "نسخ"}</span>
              </button>
            </div>

            {/* Accepted Keywords Chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>الكلمات المقبولة في الإكسل:</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {item.acceptedArabicKeywords.map((kw, kIdx) => (
                  <span
                    key={kIdx}
                    onClick={() => handleCopy(kw)}
                    title="انقر لنسخ الكلمة"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border-glass)",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontSize: "0.73rem",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px"
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-glass, var(--bg-secondary))",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-card, 16px)",
          padding: "24px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          color: "var(--text-primary)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900" }}>
              دليل ورموز وسائل المواصلات للإكسل
            </h3>
          </div>

          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            title="إغلاق"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Content */}
        {content}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "14px"
          }}
        >
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
