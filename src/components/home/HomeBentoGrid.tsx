"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/constants/assets";
import { DEFAULT_METRO_STATIONS } from "@/app/metro/constants";
import { buildMetroGraph, calculateTicketPrice, findRoute } from "@/app/metro/utils";
import {
  FaArrowLeft,
  FaExchangeAlt,
  FaMapMarkerAlt,
  FaCar,
  FaRoad,
  FaRobot,
  FaPhoneAlt,
  FaComments,
  FaCheckCircle,
  FaHeart,
  FaRegCommentDots,
  FaClock,
  FaTrain,
  FaParking,
} from "react-icons/fa";
import styles from "./HomeBentoGrid.module.css";
import { MapPin } from "lucide-react";
import { MdPlace } from "react-icons/md";

// ── Sample popular metro stations for quick selector ──
const POPULAR_METRO_STATIONS = [
  "الشهداء",
  "أنور السادات",
  "جمال عبد الناصر",
  "العتبة",
  "جامعة القاهرة",
  "الدقي",
  "الجيزة",
  "شبرا الخيمة",
  "حلوان",
  "المعادي",
  "عدلي منصور",
  "الكيت كات",
  "صفاء حجازي",
  "هليوبوليس",
  "كلية البنات",
  "المرج الجديدة",
];

export default function HomeBentoGrid() {
  // Metro quick calculator states
  const [fromStation, setFromStation] = useState("الشهداء");
  const [toStation, setToStation] = useState("جامعة القاهرة");

  // Memoize graph building so it runs once
  const metroGraphData = useMemo(() => {
    return buildMetroGraph(DEFAULT_METRO_STATIONS);
  }, []);

  // Compute live route and fare
  const metroRouteResult = useMemo(() => {
    if (!fromStation || !toStation) return null;
    if (fromStation === toStation) {
      return {
        found: true,
        stationCount: 0,
        estimatedTime: 0,
        price: 0,
        transfers: [],
        path: [fromStation],
        lines: [],
        needsTransfer: false,
        description: "نفس المحطة",
        detailedPath: [],
      };
    }

    try {
      return findRoute(
        fromStation,
        toStation,
        metroGraphData.adjacencyGraph,
        metroGraphData.stationLinesMap,
        calculateTicketPrice
      );
    } catch {
      return null;
    }
  }, [fromStation, toStation, metroGraphData]);

  const handleSwapStations = () => {
    setFromStation(toStation);
    setToStation(fromStation);
  };

  return (
    <section className={styles.bentoContainer} aria-label="خدمات المنصة الشاملة">
      {/* Section Header */}
      <div className={styles.headerWrapper}>
        <h2 className={styles.headerTitle}>
          كل خدمات المدينة في مكان واحد
        </h2>
        <p className={styles.headerSubtitle}>
          شوف بص أحنا بنقدم أي .
        </p>
      </div>

      {/* 21st.dev Style Responsive Bento Grid */}
      <div className={styles.bentoGrid}>

        {/* ── CARD 1: «حد يعرف؟» مجتمع وتجارب الناس (7 COLS) ── */}
        <div className={`${styles.bentoCard} ${styles.colSpan7} active:scale-[0.99] transition-transform`}>
          <div className={styles.ambientGlowOrange} />
          <div>
            <h2 className={styles.cardTitle}>
              حد يعرف؟ اسأل الشارع وجاوب وتفاعل
            </h2>
            <p className={styles.cardDesc}>
              أول منصة مجتمعية تفاعلية لطرح استفسارات المواصلات، أفضل أماكن الخروج، وأسرع الطرق من واقع تجارب ناس زيك.
            </p>

            {/* Simulated Live Question Preview Card */}
            <div className={styles.interactivePreview}>
              <div className={styles.questionMeta}>
                <span style={{ fontWeight: 700, color: "var(--color-foreground)" }} className="font-sub">م. أحمد كمال · التجمع الخامس</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }} className="font-sub">
                  <FaClock style={{ fontSize: "0.75rem" }} /> منذ 12 دقيقة
                </span>
              </div>
              <div className={`${styles.questionText} font-sub`}>
                &quot;أحسن وأسرع طريق من التجمع لمدينة نصر الساعة 8 الصبح عشان الزحمة؟&quot;
              </div>
              <div className={styles.bestAnswerBox}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#10b981", marginBottom: "4px" }}>
                  <FaCheckCircle style={{ fontSize: "0.85rem" }} />
                  <span className="font-sub">أفضل إجابة موثقة من المجتمع:</span>
                </div>
                <span className="font-sub">«محور شينزو آبي ثم كوبري الميثاق هيوفر معاك حوالي 25 دقيقة ومفيش إشارات.»</span>
              </div>
              <div className={styles.questionStats}>
                <span className="font-sub" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaRegCommentDots /> 18 إجابة
                </span>
                <span className="font-sub" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaHeart style={{ color: "#ef4444" }} /> 42 تفاعل
                </span>
              </div>
            </div>
          </div>

          <div className={styles.cardActionRow} style={{ gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/had-yaaraf"
              className="btn btn-primary active:scale-[0.96] transition-transform "
              style={{
                padding: "8px 18px",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                textDecoration: "none",
              }}
            >
              <FaComments />
              <span>اطرح سؤالك للشارع</span>
            </Link>
          </div>
        </div>

        {/* ── CARD 2: «حاسبة تذاكر ومحطات المترو» (5 COLS) ── */}
        <div className={`${styles.bentoCard} ${styles.colSpan5} active:scale-[0.99] transition-transform`}>
          <div className={styles.ambientGlow} />
          <div>
            <h2 className={styles.cardTitle}>
              احسب تذكرتك ومسار المترو
            </h2>
            <p className={`${styles.cardDesc} font-sub`}>
              اختر محطة البداية والوصول لمعرفة عدد المحطات وسعر التذكرة ومحطة التحويل فوراً:
            </p>

            {/* Interactive Selectors */}
            <div className={styles.metroCalculatorWrapper}>
              <div className={styles.metroSelectRow}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }} className="font-sub">
                    من محطة:
                  </label>
                  <select
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    className={styles.metroSelectField}
                    aria-label="محطة الانطلاق"
                  >
                    {POPULAR_METRO_STATIONS.map((st) => (
                      <option key={`from-${st}`} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSwapStations}
                  className={`${styles.metroSwapBtn} active:scale-[0.96]`}
                  title="تبديل المحطتين"
                  aria-label="تبديل المحطات"
                >
                  <FaExchangeAlt />
                </button>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }} className="font-sub">
                    إلى محطة:
                  </label>
                  <select
                    value={toStation}
                    onChange={(e) => setToStation(e.target.value)}
                    className={styles.metroSelectField}
                    aria-label="محطة الوصول"
                  >
                    {POPULAR_METRO_STATIONS.map((st) => (
                      <option key={`to-${st}`} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Instant Calculation Panel */}
              <div className={styles.metroResultCard}>
                <div className={styles.metroResultItem}>
                  <span className={`${styles.metroResultLabel} font-sub`}>سعر التذكرة</span>
                  <span className={`${styles.metroResultValue} font-sub`} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {metroRouteResult ? `${metroRouteResult.price} ج.م` : "--"}
                  </span>
                </div>

                <div className={styles.metroResultItem}>
                  <span className={`${styles.metroResultLabel} font-sub`}>عدد المحطات</span>
                  <span className={`${styles.metroResultValue} font-sub`} style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-foreground)" }}>
                    {metroRouteResult ? `${metroRouteResult.stationCount}` : "--"}
                  </span>
                </div>

                <div className={styles.metroResultItem}>
                  <span className={`${styles.metroResultLabel} font-sub`}>زمن الرحلة</span>
                  <span className={`${styles.metroResultValue} font-sub`} style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-foreground)" }}>
                    {metroRouteResult ? `~ ${metroRouteResult.estimatedTime} د` : "--"}
                  </span>
                </div>

                <div className={styles.metroResultItem}>
                  <span className={`${styles.metroResultLabel} font-sub`}>التحويل</span>
                  <span
                    className={`${styles.metroResultValue} font-sub`}
                    style={{
                      fontSize: "0.85rem",
                      color: metroRouteResult?.transfers && metroRouteResult.transfers.length > 0 ? "#f59e0b" : "#10b981",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {metroRouteResult?.transfers && metroRouteResult.transfers.length > 0
                      ? metroRouteResult.transfers[0].station
                      : "مباشر"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardActionRow}>
            <Link
              href={`/metro?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}`}
              className="btn btn-primary active:scale-[0.96] transition-transform "
              style={{
                padding: "8px 18px",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                textDecoration: "none",
              }}
            >
              <FaTrain />
              <span className="font-sub">شوف صفحة مترو القاهرة الكبري الكاملة</span>

            </Link>
          </div>
        </div>

        {/* ── CARD 3: «دليل الجراجات وأماكن الركنة» (4 COLS) ── */}
        <div className={`${styles.bentoCard} ${styles.colSpan4} active:scale-[0.99] transition-transform`}>
          <div className={styles.ambientGlow} />
          <div>
            <h2 className={styles.cardTitle}>
              دليل الجراجات وأماكن الركنة
            </h2>
            <p className={styles.cardDesc}>
              اعثر على أقرب جراج آمن وموقف سيارات متعدد الطوابق ملاصق للمترو والأسواق والمستشفيات مع الأسعار ومواقع المداخل.
            </p>

            <div className={styles.featurePills}>
              <span className={`${styles.pillItem} font-sub`}>🅿️ جراجات المترو</span>
              <span className={`${styles.pillItem} font-sub`}>📍 مواقع المداخل</span>
              <span className={`${styles.pillItem} font-sub`}>⏱️ أسعار الساعة</span>
            </div>
          </div>

          <div className={styles.cardActionRow}>
            <Link href="/parking" className="btn btn-primary active:scale-[0.96] transition-transform "
              style={{
                padding: "8px 18px",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                textDecoration: "none",
              }}>
              <FaParking />
              <span>استكشف الجراجات القريبة</span>

            </Link>
          </div>
        </div>

        {/* ── CARD 4: «معلومات الطرق والسرعات والرادارات» (4 COLS) ── */}
        <div className={`${styles.bentoCard} ${styles.colSpan4} active:scale-[0.99] transition-transform`}>
          <div className={styles.ambientGlowOrange} />
          <div>
            <h2 className={styles.cardTitle}>
              رادارات وسرعات الطرق
            </h2>
            <p className={styles.cardDesc}>
              دليل السرعات المقررة، مواقع الرادارات الحديثة، وأحوال الطقس والشبورة على المحاور والطرق السريعة قبل التحرك.
            </p>

            <div className={styles.featurePills}>
              <span className={`${styles.pillItem} font-sub`} style={{ fontVariantNumeric: "tabular-nums" }}>الدائري: 90 كم/س</span>
              <span className={`${styles.pillItem} font-sub`} style={{ fontVariantNumeric: "tabular-nums" }}>السويس: 120 كم/س</span>
              <span className={`${styles.pillItem} font-sub`} style={{ fontVariantNumeric: "tabular-nums" }}>المحور: 90 كم/س</span>
            </div>
          </div>

          <div className={styles.cardActionRow}>
            <Link href="/roads-info" className="btn btn-primary active:scale-[0.96] transition-transform "
              style={{
                padding: "8px 18px",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                textDecoration: "none",
              }}>
              <FaCar />
              <span>تحديثات الرادارات والسرعات</span>
            </Link>
          </div>
        </div>

        {/* ── CARD 5: «احفظ مكاني وركنتي» (4 COLS) ── */}
        <div className={`${styles.bentoCard} ${styles.colSpan4} active:scale-[0.99] transition-transform`}>
          <div className={styles.ambientGlowGreen} />
          <div>
            <h2 className={styles.cardTitle}>
              أحفظ مكاني وركنتي
            </h2>
            <p className={styles.cardDesc}>
              عديت على مكان مميز أو ركنت عربيتك وخايف تتوه؟ احفظ موقعك بنقرة واحدة وارجعله عبر خرائط جوجل وقت ما تحب.
            </p>

            <div className={styles.featurePills}>
              <span className={`${styles.pillItem} font-sub`}>🎯 دقة عالية</span>
              <span className={`${styles.pillItem} font-sub`}>🗺️ ربط مباشر بجوجل</span>
              <span className={`${styles.pillItem} font-sub`}>⚡ بدون إنترنت</span>
            </div>
          </div>

          <div className={styles.cardActionRow}>
            <Link href="/save-location" className="btn btn-primary active:scale-[0.96] transition-transform "
              style={{
                padding: "8px 18px",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                textDecoration: "none",
              }}>
              <MapPin />
              <span>احفظ موقعك الحالي الآن</span>
            </Link>
          </div>
        </div>

        {/* ── CARD 6: «مخطط الرحلات بالذكاء الاصطناعي» (6 COLS) ── */}
        <div className={`${styles.bentoCard} ${styles.colSpan6} active:scale-[0.99] transition-transform`}>
          <div className={styles.ambientGlowPurple} />
          <div>
            <h2 className={styles.cardTitle}>
              فكر في خطة بالذكاء الاصطناعي
            </h2>
            <p className={styles.cardDesc}>
              مش عارف تخرج فين؟ حدد ميزانيتك، عدد الأفراد، والمنطقة المفضلة، وسيقوم المساعد الذكي بتنسيق برنامج يومك بالكامل مع أفضل المطاعم والمواصلات.
            </p>
          </div>

          <div className={styles.cardActionRow}>
            <Link href="/ai-planner" className="btn btn-primary active:scale-[0.96] transition-transform" style={{ padding: "8px 18px", borderRadius: "12px", textDecoration: "none" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaRobot /> جرب المخطط الذكي
              </span>
            </Link>
          </div>
        </div>

        {/* ── CARD 7: «دليل الأماكن والأنشطة» (6 COLS) ── */}
        <div className={`${styles.bentoCard} ${styles.colSpan6} active:scale-[0.99] transition-transform`}>
          <div className={styles.ambientGlow} />
          <div>
            <h2 className={styles.cardTitle}>
              دليل الأماكن والمتاجر والخدمات
            </h2>
            <p className={styles.cardDesc}>
              استكشف آلاف المطاعم، الكافيهات، الصيدليات، المستشفيات، والمولات في القاهرة والجيزة مع أرقام التليفونات، المواعيد، والفروع المعتمدة.
            </p>
          </div>

          <div className={styles.cardActionRow}>
            <Link href="/places" className="btn btn-primary active:scale-[0.96] transition-transform "
              style={{
                padding: "8px 18px",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                textDecoration: "none",
              }}>
                <MdPlace />
              <span>تصفح دليل الأماكن بالكامل</span>

            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
