"use client";

import React, { useState } from "react";
import { MetroInterchangeGuideProps, LineId } from "../types";
import { LINE_COLORS } from "../constants";
import styles from "../metro.module.css";

interface TransferStationData {
  id: string;
  name: string;
  lines: { id: LineId; name: string; color: string }[];
  summary: string;
  transferSteps: string[];
  tips: string[];
  externalHub?: string;
  hasElevator: boolean;
  estTime: string;
}

const TRANSFER_STATIONS: TransferStationData[] = [
  {
    id: "al_shohadaa",
    name: "الشهداء (رمسيس)",
    lines: [
      { id: "line1", name: "الخط الأول (حلوان - المرج)", color: LINE_COLORS.line1 },
      { id: "line2", name: "الخط الثاني (شبرا - المنيب)", color: LINE_COLORS.line2 },
    ],
    summary: "محطة تبادلية كبرى في قلب العاصمة تربط بين الخطين الأول والثاني ومحطة قطارات سكك حديد مصر.",
    transferSteps: [
      "رصيف الخط الأول يقع في المستوى العلوي، بينما يقع رصيف الخط الثاني في المستوى السفلي الأكثر عمقاً.",
      "استخدم السلالم الكهربائية والأنفاق العريضة بالوسط للنزول أو الصعود مباشرة بين رصيفي الخطين دون الخروج من بوابات التذاكر.",
      "اتبع اللوحات الإرشادية الملونة: الأسهم الحمراء لاتجاه الخط الأول، والأسهم الزرقاء لاتجاه الخط الثاني.",
    ],
    tips: [
      "تعتبر من أكثر المحطات ازدحاماً في أوقات الذروة، التزم بالجانب الأيمن على السلالم.",
      "يوجد مخرج مباشر وسهل يربط المحطة بصالة قطارات محطة مصر برمسيس.",
    ],
    externalHub: "محطة سكك حديد مصر (قطارات الصعيد والوجه البحري) وميدان رمسيس وموقف الأتوبيسات.",
    hasElevator: true,
    estTime: "2 - 4 دقائق",
  },
  {
    id: "sadat",
    name: "أنور السادات (ميدان التحرير)",
    lines: [
      { id: "line1", name: "الخط الأول (حلوان - المرج)", color: LINE_COLORS.line1 },
      { id: "line2", name: "الخط الثاني (شبرا - المنيب)", color: LINE_COLORS.line2 },
    ],
    summary: "أكبر محطة تبادلية بوسط البلد، تربط الخط الأول والثاني ومصممة بصالات تحويل رحبة وسريعة.",
    transferSteps: [
      "تقع أرصفة الخط الأول والخط الثاني في منسوبين متقاطعين.",
      "استخدم السلالم الكهربائية والممرات المركزية المتواجدة في منتصف الرصيف للتبديل بين الخطين فوراً.",
      "تأكد من اختيار اتجاه القطار الصحيح (حلوان أو المرج بالخط الأول / شبرا أو المنيب بالخط الثاني) من خلال الشاشات واللوحات أعلى مدخل كل رصيف.",
    ],
    tips: [
      "المحطة مزودة بسلالم كهربائية ومصاعد مخصصة لكبار السن وذوي الاحتياجات الخاصة.",
      "تتصل المحطة بمخارج متعددة تغطي كافة جوانب ميدان التحرير ومجمع التحرير والمتحف المصري.",
    ],
    externalHub: "ميدان التحرير، موقف عبد المنعم رياض، المتحف المصري، جامعة الدول العربية.",
    hasElevator: true,
    estTime: "2 - 3 دقائق",
  },
  {
    id: "ataba",
    name: "العتبة",
    lines: [
      { id: "line2", name: "الخط الثاني (شبرا - المنيب)", color: LINE_COLORS.line2 },
      { id: "line3", name: "الخط الثالث (عدلي منصور - الكيت كات)", color: LINE_COLORS.line3 },
    ],
    summary: "محطة الربط الحيوية بين الخط الثاني (شبرا / المنيب) والخط الثالث (الخط الأخضر الذكي).",
    transferSteps: [
      "اربط بين رصيف الخط الثاني ورصيف الخط الثالث عبر ممر التحويل المباشر والسلالم الكهربائية.",
      "رصيف الخط الثالث يقع في مستوى أعمق، اتبع المسار الموضح بالأسهم الخضراء للانتقال إليه.",
      "التحويل سلس للغاية ومزود بلوحات رقمية توضح موعد وصول القطارات القادمة.",
    ],
    tips: [
      "إذا كنت متجهاً إلى مصر الجديدة أو عدلي منصور أو مطار القاهرة، انتقل هنا للخط الثالث.",
      "تتميز محطة الخط الثالث بتكييف الهواء وأنظمة الأمان الحديثة بالكامل.",
    ],
    externalHub: "ميدان العتبة، سوق الموسكي والأزهر، جراج العتبة، المسرح القومي.",
    hasElevator: true,
    estTime: "2 - 3 دقائق",
  },
  {
    id: "gamal_abdel_nasser",
    name: "جمال عبد الناصر (الإسعاف)",
    lines: [
      { id: "line1", name: "الخط الأول (حلوان - المرج)", color: LINE_COLORS.line1 },
      { id: "line3", name: "الخط الثالث (عدلي منصور - الكيت كات)", color: LINE_COLORS.line3 },
    ],
    summary: "محطة تحويل متطورة تربط الخط الأول القديم بالخط الثالث الحديث عند تقاطع شارعي رمسيس و26 يوليو.",
    transferSteps: [
      "انتقل من رصيف الخط الأول عبر ممرات الصالة التبادلية المكيفة للنزول إلى رصيف الخط الثالث.",
      "المحطة مجهزة بمصاعد وسلالم كهربائية بانورامية لنقل الركاب بسلاسة فائقة.",
      "اتبع العلامات الحمراء للانتقال إلى رصيف الخط الأول، أو العلامات الخضراء للانتقال إلى رصيف الخط الثالث.",
    ],
    tips: [
      "أفضل وأسرع محطة لركاب الخط الأول (مثل المعادي أو حلوان أو المطرية) للتحويل إلى الخط الثالث والوصول للكيت كات أو مصر الجديدة.",
    ],
    externalHub: "شارع 26 يوليو، دار القضاء العالي، نقابة الصحفيين والمحامين، محطة الإسعاف.",
    hasElevator: true,
    estTime: "2 - 4 دقائق",
  },
  {
    id: "cairo_university",
    name: "جامعة القاهرة",
    lines: [
      { id: "line2", name: "الخط الثاني (شبرا - المنيب)", color: LINE_COLORS.line2 },
      { id: "line3_branch_b", name: "الخط الثالث (تفريعة جامعة القاهرة)", color: LINE_COLORS.line3 },
    ],
    summary: "محطة تبادلية علوية بالغة التطور تربط الخط الثاني بالجيزة مع تفريعة الخط الثالث القادمة من الكيت كات.",
    transferSteps: [
      "محطة علوية مكيفة؛ يتم التبديل بين الخط الثاني والخط الثالث عبر كباري وممرات المشاة العلوية وصالة التحويل المركزية.",
      "استخدم السلالم الكهربائية للصعود أو النزول بين أرصفة الخطين بكل يسر.",
      "تتيح لركاب الجيزة وفيصل الانتقال مباشرة للخط الثالث والوصول إلى المهندسين، الزمالك، ومصر الجديدة دون المرور بوسط البلد.",
    ],
    tips: [
      "توفر وقت تنقل هائل لطلاب جامعة القاهرة وسكان محافظة الجيزة المتجهين لغرب وشرق القاهرة.",
    ],
    externalHub: "جامعة القاهرة، ميدان النهضة، حديقة الأورمان، حديقة الحيوان.",
    hasElevator: true,
    estTime: "2 - 3 دقائق",
  },
  {
    id: "kit_kat",
    name: "الكيت كات (تفريعة الخط الثالث التبادلية)",
    lines: [
      { id: "line3", name: "الخط الثالث الرئيسي (عدلي منصور)", color: LINE_COLORS.line3 },
      { id: "line3_branch_a", name: "تفريعة روض الفرج (إمبابة)", color: LINE_COLORS.line3 },
      { id: "line3_branch_b", name: "تفريعة جامعة القاهرة (المهندسين)", color: LINE_COLORS.line3 },
    ],
    summary: "المحطة التبادلية الذكية الفاصلة بين فرعي الخط الثالث (فرع إمبابة/محور روض الفرج وفرع المهندسين/جامعة القاهرة).",
    transferSteps: [
      "إذا ركبت قطاراً يتجه إلى فرع مختلف عن وجهتك (مثلاً قطار روض الفرج بينما تريد جامعة القاهرة):",
      "انزل في محطة الكيت كات وانتظر القطار التالي المتجه لفرعك على الرصيف المناسب.",
      "المحطة نفقية عميقة مصممة بـ 3 مستويات مجهزة بسلالم كهربائية ومصاعد متكاملة.",
    ],
    tips: [
      "انتبه للإعلانات الصوتية والشاشات بمقدمة القطار قبل الركوب لتجنب النزول والتبديل بالكيت كات.",
      "زمن التقاطر بين القطارات منتظم ومتقارب جداً.",
    ],
    externalHub: "ميدان الكيت كات، كورنيش إمبابة، شارع السودان، كوبري 15 مايو.",
    hasElevator: true,
    estTime: "1 - 3 دقائق",
  },
  {
    id: "adly_mansour",
    name: "عدلي منصور المركزية",
    lines: [
      { id: "line3", name: "الخط الثالث للمترو", color: LINE_COLORS.line3 },
      { id: "line4", name: "القطار الكهربائي الخفيف (LRT)", color: "#f59e0b" },
      { id: "line5", name: "سكك حديد مصر (قطار السويس)", color: "#8b5cf6" },
    ],
    summary: "أضخم مجمع محطات تبادلي في الشرق الأوسط، يربط مترو الأنفاق والقطار الكهربائي الخفيف LRT والأتوبيس الترددي BRT والسوبرجيت.",
    transferSteps: [
      "المحطة مبنية على مساحة ضخمة بممرات مشاة مغطاة وساحات مريحة.",
      "للتحويل من المترو إلى القطار الخفيف (LRT) أو قطار السويس أو حافلات السوبرجيت، اخرج من بوابات المترو واتبع الممرات المباشرة لشراء تذكرة الوسيلة الأخرى.",
      "المحطة مجهزة بكافة الوسائل التكنولوجية، شاشات إلكترونية ومصاعد وسلالم وممرات لذوي الهمم.",
    ],
    tips: [
      "نقطة الانطلاق الرئيسية إلى العاصمة الإدارية الجديدة، الشروق، العبور، بدر، والعاشر من رمضان عبر الـ LRT.",
    ],
    externalHub: "القطار الكهربائي الخفيف (LRT)، محطة السوبرجيت، موقف الأقاليم، الأتوبيس الترددي BRT.",
    hasElevator: true,
    estTime: "3 - 5 دقائق",
  },
];

export default function MetroInterchangeGuide({
  guideRef,
  onSelectLine,
}: MetroInterchangeGuideProps) {
  const [activeTab, setActiveTab] = useState<"lines" | "platforms" | "tips">("lines");
  const [selectedStationId, setSelectedStationId] = useState<string>("al_shohadaa");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeStation =
    TRANSFER_STATIONS.find((s) => s.id === selectedStationId) || TRANSFER_STATIONS[0];

  const filteredStations = TRANSFER_STATIONS.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.lines.some((l) => l.name.toLowerCase().includes(q))
    );
  });

  return (
    <div ref={guideRef} className={styles.stationCard} style={{ marginTop: "16px" }}>
      {/* Header Section */}
      <div className={styles.stationHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className={styles.stationIconBadge} style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.25)" }}>
            <i className="fa-solid fa-repeat"></i>
          </div>
          <div>
            <h2 className={styles.stationName}>دليل التبديل بين الخطوط والأرصفة</h2>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
              إرشادات تفصيلية للتحويل بين خطوط المترو وتغيير الأرصفة والاتجاهات بدون دفع تذكرة إضافية
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className={styles.branchTabs}>
          <button
            type="button"
            onClick={() => setActiveTab("lines")}
            className={`${styles.branchTab} ${activeTab === "lines" ? styles.branchTabActive : ""}`}
          >
            <i className="fa-solid fa-shuffle" style={{ marginLeft: "4px" }}></i>
            التبديل بين الخطوط
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("platforms")}
            className={`${styles.branchTab} ${activeTab === "platforms" ? styles.branchTabActive : ""}`}
          >
            <i className="fa-solid fa-arrows-left-right" style={{ marginLeft: "4px" }}></i>
            التبديل بين الأرصفة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tips")}
            className={`${styles.branchTab} ${activeTab === "tips" ? styles.branchTabActive : ""}`}
          >
            <i className="fa-regular fa-lightbulb" style={{ marginLeft: "4px" }}></i>
            قواعد وتفريعات هامة
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: التبديل بين الخطوط (محطات التحويل)
          ========================================================= */}
      {activeTab === "lines" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Hubs Horizontal Selector Chips */}
          <div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                paddingBottom: "6px",
                scrollbarWidth: "none",
              }}
            >
              {filteredStations.map((station) => {
                const isSelected = station.id === activeStation.id;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setSelectedStationId(station.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "0.82rem",
                      fontWeight: isSelected ? "800" : "600",
                      cursor: "pointer",
                      border: isSelected
                        ? "1px solid var(--border-primary, rgba(59, 130, 246, 0.6))"
                        : "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                      background: isSelected
                        ? "rgba(59, 130, 246, 0.16)"
                        : "rgba(255, 255, 255, 0.03)",
                      color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i
                      className="fa-solid fa-train-subway"
                      style={{
                        fontSize: "0.8rem",
                        color: isSelected ? "var(--color-secondary, #3b82f6)" : "var(--text-muted)",
                      }}
                    ></i>
                    <span>{station.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Station Comprehensive Details Card */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
              borderRadius: "var(--radius-card, 14px)",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Station Title & Connecting Lines Badges */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "10px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                paddingBottom: "12px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    color: "var(--text-primary)",
                    margin: 0,
                    fontFamily: "var(--font-sub, inherit)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="fa-solid fa-location-dot" style={{ color: "var(--color-secondary, #3b82f6)" }}></i>
                  <span>محطة {activeStation.name}</span>
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {activeStation.summary}
                </p>
              </div>

              {/* Badges of Intersecting Lines */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {activeStation.lines.map((l, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "0.74rem",
                      fontWeight: "700",
                      background: `${l.color}18`,
                      border: `1px solid ${l.color}40`,
                      color: l.color,
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: l.color,
                        display: "inline-block",
                      }}
                    />
                    {l.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Metrics Bar (Time, Accessibility, External) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "8px",
              }}
            >
              <div className={styles.metricTile} style={{ padding: "10px 12px", gap: "8px" }}>
                <i className="fa-regular fa-clock" style={{ color: "#3b82f6", fontSize: "1rem" }}></i>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>زمن التحويل التقديري</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {activeStation.estTime}
                  </div>
                </div>
              </div>

              <div className={styles.metricTile} style={{ padding: "10px 12px", gap: "8px" }}>
                <i className="fa-solid fa-wheelchair" style={{ color: "#10b981", fontSize: "1rem" }}></i>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>المصاعد والسلالم الكهربائية</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {activeStation.hasElevator ? "متوفرة بالكامل" : "سلالم عادية"}
                  </div>
                </div>
              </div>

              {activeStation.externalHub && (
                <div className={styles.metricTile} style={{ padding: "10px 12px", gap: "8px", gridColumn: "span 1" }}>
                  <i className="fa-solid fa-bus-simple" style={{ color: "#f59e0b", fontSize: "1rem" }}></i>
                  <div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>الربط بوسائل النقل الأخرى</div>
                    <div style={{ fontSize: "0.76rem", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.3 }}>
                      {activeStation.externalHub}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step-by-Step Walkthrough Steps */}
            <div>
              <h4
                style={{
                  fontSize: "0.88rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  margin: "0 0 10px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-sub, inherit)",
                }}
              >
                <i className="fa-solid fa-route" style={{ color: "var(--color-secondary, #3b82f6)" }}></i>
                <span>خطوات التحويل والتبديل داخل المحطة:</span>
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeStation.transferSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(59, 130, 246, 0.15)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        color: "#3b82f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips Callout for this station */}
            {activeStation.tips.length > 0 && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.06)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "10px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "0.82rem", fontWeight: "700" }}>
                  <i className="fa-solid fa-circle-info"></i>
                  <span>نصائح إضافية للمحطة:</span>
                </div>
                <ul style={{ margin: 0, paddingRight: "18px", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {activeStation.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: التبديل بين الأرصفة (عكس الاتجاه)
          ========================================================= */}
      {activeTab === "platforms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Main Alert / Key Rule */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)" }}>
                القاعدة الأهم: إياك وتمرير تذكرتك في بوابات الخروج!
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                إذا ركبت قطاراً في الاتجاه الخاطئ أو تجاوزت محطتك، يمكنك التبديل للرصيف المقابل داخل معظم المحطات دون دفع تذكرة جديدة، بشرط البقاء داخل نطاق صالة المحطة الداخلي وعدم الخروج من بوابات التذاكر الإلكترونية (Turnstiles).
              </p>
            </div>
          </div>

          {/* 3 Platform Layout Scenarios Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {/* Scenario 1: Island Platform */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                  }}
                >
                  الأسهل والأسرع
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                1. محطات الرصيف الجزيرة (الأوسط)
              </h4>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                الرصيف في المنتصف بين مساري القطارين (مثل أغلب محطات الخط الثالث وبعض محطات الخط الثاني).
              </p>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>طريقة التبديل:</strong> انزل من القطار والتفت للجانب المقابل من نفس الرصيف، واركب القطار المتجه للاتجاه المعاكس فوراً دون صعود أو نزول أي سلالم!
              </div>
            </div>

            {/* Scenario 2: Deep / Elevated Side Platforms */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#3b82f6",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                  }}
                >
                  الأكثر شيوعاً
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                2. المحطات النفقية والعلوية (الرصيفان الجانبيان)
              </h4>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                سكة القطارين بالمنتصف ورصيف على كل جانب (مثل السادات، الشهداء، الدقي، ناصر، إلخ).
              </p>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>طريقة التبديل:</strong> اصعد بالسلم أو المصعد لصالة التوزيع العلوية، وسر للممر المقابل وانزل بالسلم المؤدي للرصيف المعاكس (كل هذا قبل ماكينات الخروج).
              </div>
            </div>

            {/* Scenario 3: Surface Stations Bridge */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                  }}
                >
                  المحطات السطحية
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                3. المحطات السطحية المكشوفة (الخط الأول)
              </h4>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                محطات فوق سطح الأرض (مثل المعادي، حلوان، المطرية، عين شمس، طرة، إلخ).
              </p>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>طريقة التبديل:</strong> استخدم كوبري المشاة الداخلي العلوي أو النفق السفلي المشيد فوق/أسفل السكة للانتقال بين الرصيفين بأمان تام.
              </div>
            </div>
          </div>

          {/* Special Edge Case Helper */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed var(--border-glass, rgba(255, 255, 255, 0.12))",
              borderRadius: "10px",
              padding: "12px 14px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="fa-solid fa-user-shield" style={{ color: "var(--color-secondary, #3b82f6)", fontSize: "1.1rem" }}></i>
            <div>
              <strong style={{ color: "var(--text-primary)" }}>ماذا لو دخلت صالة رصيف منفصل بالخطأ من الشارع؟</strong> في بعض المحطات السطحية النادرة ذات المداخل المنفصلة، لا تقطع تذكرة جديدة؛ توجه لناظر المحطة أو أفراد الأمن عند البوابة لتسهيل عبورك للرصيف المقابل.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: قواعد وتفريعات هامة (الخط الثالث والتذاكر)
          ========================================================= */}
      {activeTab === "tips" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {/* Branching of Line 3 Explained */}
            <div
              style={{
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981" }}>
                <i className="fa-solid fa-code-branch" style={{ fontSize: "1.1rem" }}></i>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  كيف تتعامل مع تفريعة الخط الثالث بعد الكيت كات؟
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                الخط الثالث ينقسم بعد محطة <strong>الكيت كات</strong> إلى فرعين:
              </p>
              <ul style={{ margin: 0, paddingRight: "18px", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <li>
                  <strong style={{ color: "#10b981" }}>فرع 1 (محور روض الفرج):</strong> يمر بمحطات (السودان، إمبابة، البوهي، القومية العربية، الدائري، روض الفرج).
                </li>
                <li>
                  <strong style={{ color: "#10b981" }}>فرع 2 (جامعة القاهرة):</strong> يمر بمحطات (التوفيقية، وادي النيل، جامعة الدول، بولاق الدكرور، جامعة القاهرة).
                </li>
              </ul>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "0.76rem",
                  color: "var(--text-primary)",
                }}
              >
                💡 <strong>الحل السريع:</strong> انظر للشاشة الإلكترونية على مقدمة القطار. إذا ركبت قطار فرع بالخطأ، انزل في محطة <strong>الكيت كات</strong> وانتظر القطار التالي للفرع الآخر.
              </div>
            </div>

            {/* Single Ticket Transfer Rule */}
            <div
              style={{
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6" }}>
                <i className="fa-solid fa-ticket" style={{ fontSize: "1.1rem" }}></i>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  تذكرة واحدة تشمل كافة التحويلات
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                تذكرة مترو القاهرة تتيح لك التبديل بين الخطوط (الأول، الثاني، والثالث) مجاناً بالكامل دون أي رسوم إضافية، ويتم تحديد سعر التذكرة بناءً على <strong>إجمالي عدد المحطات</strong> في مسارك من محطة الركوب وحتى محطة الوصول النهائية.
              </p>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "0.76rem",
                  color: "var(--text-primary)",
                }}
              >
                ⏱️ صلاحية التذكرة تبدأ من لحظة المرور من بوابات الدخول وتكفي لإتمام رحلتك والتحويلات براحة تامة.
              </div>
            </div>

            {/* Ladies Cabins Guide */}
            <div
              style={{
                background: "rgba(236, 72, 153, 0.05)",
                border: "1px solid rgba(236, 72, 153, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ec4899" }}>
                <i className="fa-solid fa-person-dress" style={{ fontSize: "1.1rem" }}></i>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  أماكن عربات السيدات على الأرصفة
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                توجد عربتان مخصصتان للسيدات في منتصف كل قطار:
              </p>
              <ul style={{ margin: 0, paddingRight: "18px", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <li>عربة مخصصة للسيدات فقط طوال ساعات التشغيل اليومية.</li>
                <li>عربة مخصصة للسيدات حتى الساعة 9:00 مساءً ثم تصبح مشتركة.</li>
              </ul>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "0.76rem",
                  color: "var(--text-primary)",
                }}
              >
                📍 تجدين لافتات وعلامات أرضية وردية واضحة في منتصف الرصيف تحدد موضع توقف أبواب عربات السيدات.
              </div>
            </div>

            {/* Color-Coded Signs */}
            <div
              style={{
                background: "rgba(245, 158, 11, 0.05)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f59e0b" }}>
                <i className="fa-solid fa-signs-post" style={{ fontSize: "1.1rem" }}></i>
                <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  دلالات الألوان الإرشادية في المحطات
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                تعتمد الهيئة القومية للأنفاق نظام ترميز لوني موحد على كافة اللوحات والأسهم المعلقة والأرضية:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.78rem" }}>
                <span style={{ color: "#ef4444", fontWeight: "700" }}>🔴 الخط الأول (الأحمر): حلوان ⇆ المرج الجديدة</span>
                <span style={{ color: "#3b82f6", fontWeight: "700" }}>🔵 الخط الثاني (الأزرق): شبرا الخيمة ⇆ المنيب</span>
                <span style={{ color: "#10b981", fontWeight: "700" }}>🟢 الخط الثالث (الأخضر): عدلي منصور ⇆ الكيت كات / التفريعات</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
