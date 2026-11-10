"use client";

import * as React from "react";
import styles from "./AdminAnalyticsBento.module.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface QareebAllocation {
  symbol: string;
  value: number;
}

export interface QareebActivity {
  id: string;
  kind: "deposit" | "withdraw" | "subscription" | "voucher" | "user";
  title: string;
  detail: string;
  amount: string;
  status: "confirmed" | "pending" | "failed";
  time: string;
}

export interface QareebCard {
  id: string;
  label: string;
  last4: string;
  holder?: string;
  expiry?: string;
  balance?: string;
  color: string;
  color2: string;
  ink: string;
}

export interface AdminAnalyticsBentoProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeUsersNow: number;
  visitsHistory?: number[]; // Daily visits past 30 days
  visitsDailyLabels?: string[];
  allocation?: QareebAllocation[]; // e.g. Subscriptions distribution
  subscriptionsSummary?: {
    gold: number;
    silver: number;
    mishwar: number;
    free: number;
    total: number;
    paidGrowth: number;
  };
  cards?: QareebCard[];
  activity?: QareebActivity[];
  totalPlaces?: number;
  pendingActions?: number;
  uptimeSeconds?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ACCENT = "#2727ff"; // --color-primary
const ACCENT_GLOW = "rgba(39, 39, 255, 0.25)";
const ACCENT2 = "#6366f1"; // secondary indigo accent

function useReducedMotion() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const u = () => setR(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  return r;
}

function useMounted() {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return on;
}

function useCountUp(target: number, enabled: boolean, duration = 1200) {
  const [v, setV] = React.useState(enabled ? 0 : target);
  React.useEffect(() => {
    if (!enabled) return setV(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setV(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, duration]);
  return v;
}

function smooth(pts: ReadonlyArray<readonly [number, number]>) {
  return pts
    .map(([x, y], i) => {
      if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      const [px, py] = pts[i - 1];
      const m = (px + x) / 2;
      return `C ${m.toFixed(1)} ${py.toFixed(1)}, ${m.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const fmt = {
  currency: (v: number) =>
    new Intl.NumberFormat("ar-EG", {
      maximumFractionDigits: 0,
    }).format(Math.round(v)) + " ج.م",
  num: (v: number) =>
    new Intl.NumberFormat("ar-EG", {
      maximumFractionDigits: 0,
    }).format(Math.round(v)),
};

/* ------------------------------------------------------------------ */
/*  Tile Base                                                          */
/* ------------------------------------------------------------------ */

function Tile({
  title,
  action,
  className = "",
  style,
  children,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section className={`${styles.tile} ${className}`} style={style}>
      {(title || action) && (
        <header className={styles.tileHeader}>
          {title && <div className={styles.tileTitle}>{title}</div>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

function Pills<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={styles.pillsWrap}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={`${styles.pillBtn} ${o === value ? styles.pillBtnActive : ""}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Tile: Net Worth / Revenue & Daily Visitors Strip             */
/* ------------------------------------------------------------------ */

function HeroTile({
  totalRevenue,
  netProfit,
  visitsHistory,
  reduced,
}: {
  totalRevenue: number;
  netProfit: number;
  visitsHistory: number[];
  reduced: boolean;
}) {
  const mounted = useMounted();
  const shownRevenue = useCountUp(totalRevenue, !reduced);
  const [hover, setHover] = React.useState<number | null>(null);

  // Normalize visits data for 30 bars
  const bars = React.useMemo(() => {
    const list = visitsHistory && visitsHistory.length > 0 ? visitsHistory : Array(30).fill(12);
    const max = Math.max(...list, 1);
    return list.map((val) => ({
      val,
      pct: Math.max(12, (val / max) * 100),
    }));
  }, [visitsHistory]);

  const today = new Date();
  const dayLabel = (i: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (bars.length - 1 - i));
    return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  };

  return (
    <Tile className={styles.heroTile}>
      <div className={styles.heroHeaderRow}>
        <div className={styles.heroGreeting}>
          <p className={styles.heroTitle}>
            أهلاً، <span style={{ color: ACCENT }}>لوحة الإدارة</span>
          </p>
          <p className={styles.heroSubtitle}>
            ملخص مؤشرات منصة قريب وأداء الزيارات والإيرادات هذا الشهر.
          </p>
        </div>

        <div className={styles.heroMetrics}>
          <p className={styles.heroMetricsLabel}>إجمالي الإيرادات</p>
          <p className={styles.heroMetricsValue}>{fmt.currency(shownRevenue)}</p>
          <p className={styles.heroMetricsSub}>
            <span style={{ color: netProfit >= 0 ? "#10b981" : "#ef4444" }}>
              صافي الدخل: {fmt.currency(netProfit)}
            </span>
            <span className={styles.heroMetricsMuted}> · هذا الشهر</span>
          </p>
        </div>
      </div>

      {/* PnL/Visits 30-day Strip */}
      <div className={styles.stripContainer}>
        <div
          className={styles.stripBarsRow}
          onPointerLeave={() => setHover(null)}
        >
          {bars.map((b, i) => {
            const isHovered = hover === i;
            return (
              <button
                key={i}
                type="button"
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${dayLabel(i)}: ${b.val} زيارة`}
                className={styles.stripBar}
                style={{
                  height: mounted ? `${b.pct}%` : "10%",
                  background: isHovered ? "#38bdf8" : ACCENT,
                  opacity: hover === null ? 0.35 + (b.pct / 100) * 0.65 : isHovered ? 1 : 0.25,
                  transition: `height 800ms ${EASE} ${i * 15}ms, opacity 200ms ease, background 200ms ease`,
                }}
              />
            );
          })}
        </div>

        <div className={styles.stripFooter}>
          <span>{dayLabel(0)}</span>
          <span className={styles.stripActiveLabel} aria-live="polite">
            {hover !== null
              ? `${dayLabel(hover)} · ${fmt.num(bars[hover].val)} زيارة`
              : "نشاط الزيارات اليومية (آخر 30 يوم)"}
          </span>
          <span>اليوم</span>
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Cards Tile: Fanned Stack for Subscription Tiers / System Cards    */
/* ------------------------------------------------------------------ */

function Chip() {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden>
      <rect x="0.5" y="0.5" width="25" height="19" rx="4.5" fill="#facc15" stroke="rgba(234, 179, 8, 0.6)" />
      <path d="M0.5 7h7.5v6H0.5M25.5 7H18v6h7.5M8 0.5v19M18 0.5v19M8 10h10" fill="none" stroke="rgba(161, 98, 7, 0.5)" strokeWidth="0.9" />
    </svg>
  );
}

function CardFace({ c, glare }: { c: QareebCard; glare: number }) {
  return (
    <>
      <span
        aria-hidden
        className={styles.cardFaceBg}
        style={{
          backgroundImage: [
            "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 35%)",
            `radial-gradient(110% 90% at 100% 0%, ${c.color2} 0%, transparent 60%)`,
            `linear-gradient(135deg, ${c.color} 0%, ${c.color2} 100%)`,
          ].join(", "),
        }}
      >
        <span
          className={styles.cardHoloFilm}
          style={{
            backgroundPosition: `${glare}% 0`,
          }}
        />
      </span>

      <span className={styles.cardTopBar}>
        <span className={styles.cardLogoTitle}>
          <Chip />
          <span className={styles.cardLabel}>{c.label}</span>
        </span>
        <span className={styles.cardNumber}>**** {c.last4}</span>
      </span>

      <span className={styles.cardNfcIcon} aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M8.5 7.5a6 6 0 0 1 0 9M12 5a9.5 9.5 0 0 1 0 14M15.5 2.5a13 13 0 0 1 0 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </span>
    </>
  );
}

function CardsTile({ cards, reduced }: { cards: QareebCard[]; reduced: boolean }) {
  const [order, setOrder] = React.useState(() => cards.map((c) => c.id));
  const mounted = useMounted();
  const PEEK = 46;
  const depth = order.length - 1;
  const front = cards.find((c) => c.id === order[order.length - 1]) || cards[0];
  const [glare, setGlare] = React.useState(30);

  React.useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      setGlare((g) => (dragGlare.current ? g : 30 + Math.sin((now - t0) / 2600) * 30));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  const dragGlare = React.useRef(false);

  return (
    <Tile
      title={
        <span>
          البطاقات والباقات <sup className={styles.supCount}>{cards.length}</sup>
        </span>
      }
      className={styles.cardsTile}
    >
      <div
        className={styles.cardsContainer}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          dragGlare.current = true;
          setGlare(((e.clientX - r.left) / r.width) * 100);
        }}
        onPointerLeave={() => {
          dragGlare.current = false;
        }}
      >
        <div className={styles.cardsStackWrap}>
          {order.map((id, pos) => {
            const c = cards.find((x) => x.id === id);
            if (!c) return null;
            const fromFront = order.length - 1 - pos;
            const isFront = fromFront === 0;

            return (
              <button
                key={id}
                type="button"
                onClick={() => !isFront && setOrder((o) => [...o.filter((x) => x !== id), id])}
                aria-label={`${c.label} card ending ${c.last4}`}
                aria-pressed={isFront}
                className={styles.cardItemBtn}
                style={{
                  top: (depth - fromFront) * PEEK,
                  zIndex: pos + 1,
                  transform: `translateX(-50%) scale(${1 - fromFront * 0.055}) translateY(${mounted ? 0 : 20}px)`,
                  opacity: mounted ? 1 : 0,
                  color: c.ink,
                  transition: reduced
                    ? "none"
                    : `top 650ms cubic-bezier(0.34, 1.35, 0.64, 1), transform 650ms cubic-bezier(0.34, 1.35, 0.64, 1), opacity 500ms ease ${pos * 90}ms`,
                  cursor: isFront ? "default" : "pointer",
                }}
              >
                <span className={styles.cardAspectRatioWrapper}>
                  <span className={styles.cardInnerFace}>
                    <CardFace c={c} glare={glare + fromFront * 18} />
                  </span>
                </span>
              </button>
            );
          })}

          <div
            aria-hidden
            className={styles.cardStackSpacer}
            style={{ marginTop: depth * PEEK }}
          >
            <div style={{ paddingTop: "30%" }} />
          </div>
        </div>

        {/* Frosted panel beneath stack */}
        <div className={styles.cardFrontInfoPanel}>
          <div className={styles.cardInfoMeta}>
            <p className={styles.cardInfoNumber}>•••• •••• •••• {front.last4}</p>
            <p className={styles.cardInfoHolder}>
              {front.holder ?? front.label}
              {front.expiry ? ` · ${front.expiry}` : ""}
            </p>
          </div>
          {front.balance && <p className={styles.cardInfoBalance}>{front.balance}</p>}
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Gauge: Server Response / Live Traffic Health                      */
/* ------------------------------------------------------------------ */

function TrafficGaugeTile({
  activeUsersNow,
  reduced,
}: {
  activeUsersNow: number;
  reduced: boolean;
}) {
  const [latency, setLatency] = React.useState(38);
  const [loadTier, setLoadTier] = React.useState<"عادي" | "نشط" | "ذروة">("نشط");

  React.useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(
      () => setLatency((l) => Math.max(18, Math.min(120, l + (Math.random() - 0.5) * 6))),
      2400
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  const mult = { "عادي": 0.8, "نشط": 1, "ذروة": 1.4 }[loadTier];
  const value = latency * mult;
  const t = Math.min(1, value / 120);
  const R = 62;
  const len = Math.PI * R;
  const angle = -90 + t * 180;

  return (
    <Tile
      title="حالة السيرفر والزيارات"
      className={styles.gaugeTile}
      action={<span className={styles.liveBadgeDot}>● مباشر</span>}
    >
      <div className={styles.gaugeCenter}>
        <div className={styles.gaugeSvgWrap}>
          <svg width="150" height="86" viewBox="0 0 150 86" aria-hidden>
            <path
              d="M 13 78 A 62 62 0 0 1 137 78"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={styles.gaugeTrack}
            />
            <path
              d="M 13 78 A 62 62 0 0 1 137 78"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={len}
              style={{
                stroke: ACCENT,
                strokeDashoffset: len * (1 - t),
                transition: `stroke-dashoffset 900ms ${EASE}`,
              }}
            />
            <g
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: "75px 78px",
                transition: `transform 900ms ${EASE}`,
              }}
            >
              <line
                x1="75"
                y1="78"
                x2="75"
                y2="30"
                strokeWidth="2.5"
                strokeLinecap="round"
                stroke="currentColor"
              />
            </g>
            <circle cx="75" cy="78" r="5" fill="currentColor" />
          </svg>
        </div>
        <p className={styles.gaugeValueBig}>
          {fmt.num(value)}{" "}
          <span className={styles.gaugeUnit}>ms</span>
        </p>
        <p className={styles.gaugeSubDesc}>
          {activeUsersNow} متصل حالياً بالمنصة
        </p>
      </div>

      <div className={styles.gaugePillsWrap}>
        <Pills
          label="حالة الضغط"
          value={loadTier}
          options={["عادي", "نشط", "ذروة"]}
          onChange={setLoadTier}
        />
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart: Visits Growth Curve vs Benchmark                           */
/* ------------------------------------------------------------------ */

type Range = "1W" | "1M" | "1Y";

function ChartTile({
  visitsHistory,
  reduced,
}: {
  visitsHistory: number[];
  reduced: boolean;
}) {
  const uid = React.useId().replace(/:/g, "");
  const [range, setRange] = React.useState<Range>("1M");
  const [hover, setHover] = React.useState<number | null>(null);
  const mounted = useMounted();

  const raw = visitsHistory.length > 0 ? visitsHistory : Array(30).fill(100);

  const take = { "1W": 7, "1M": 30, "1Y": raw.length }[range];
  const step = range === "1Y" ? 4 : 1;
  const a = raw.slice(-take).filter((_, i, arr) => i % step === 0 || i === arr.length - 1);
  // Benchmark line: smooth 85% average line
  const b = a.map((val, idx) => Math.round(val * (0.8 + 0.1 * Math.sin(idx))));

  const W = 640;
  const H = 220;
  const lo = Math.min(...a, ...b);
  const hi = Math.max(...a, ...b);
  const y = (v: number) => H - 16 - ((v - lo) / (hi - lo || 1)) * (H - 40);
  const pa = a.map((v, i) => [(i / (a.length - 1 || 1)) * W, y(v)] as const);
  const pb = b.map((v, i) => [(i / (b.length - 1 || 1)) * W, y(v)] as const);
  const la = smooth(pa);
  const lb = smooth(pb);
  const idx = hover ?? a.length - 1;

  const currentVal = a[idx] || 0;
  const benchmarkVal = b[idx] || 0;
  const growth = benchmarkVal > 0 ? ((currentVal - benchmarkVal) / benchmarkVal) * 100 : 0;

  const labels =
    range === "1Y"
      ? ["يناير", "مارس", "مايو", "يوليو", "سبتمبر", "الآن"]
      : range === "1M"
        ? ["منذ 4 أسابيع", "منذ أسبوعين", "أسبوع", "الآن"]
        : ["السبت", "الإثنين", "الأربعاء", "الجمعة", "اليوم"];

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const posRatio = (e.clientX - r.left) / r.width;
    // Account for RTL vs LTR pointer coordinate
    const targetIdx = Math.max(0, Math.min(a.length - 1, Math.round(posRatio * (a.length - 1))));
    setHover(targetIdx);
  };

  const left = `${(pa[idx][0] / W) * 100}%`;

  return (
    <Tile
      title="منحنى الزيارات مقارنة بالمتوسط"
      className={styles.chartTile}
      action={
        <Pills
          label="الفترة"
          value={range}
          options={["1W", "1M", "1Y"]}
          onChange={setRange}
        />
      }
    >
      <div className={styles.chartLegendRow}>
        <div>
          <p className={styles.chartLegendLabel}>
            <span className={styles.chartDotMain} style={{ background: ACCENT }} />
            الزيارات الفعلية
          </p>
          <p className={styles.chartLegendValue}>{fmt.num(currentVal)} زيارة</p>
        </div>
        <div>
          <p className={styles.chartLegendLabel}>
            <span className={styles.chartDotDashed} />
            متوسط الفترة السابقة
          </p>
          <p className={styles.chartLegendValueMuted}>{fmt.num(benchmarkVal)} زيارة</p>
        </div>
        <span
          className={styles.chartBadgeGrowth}
          style={{
            background: "rgba(39, 39, 255, 0.12)",
            color: ACCENT,
          }}
        >
          {growth >= 0 ? "+" : "−"}
          {Math.abs(growth).toFixed(1)}% نمو
        </span>
      </div>

      <div
        className={styles.chartSvgArea}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={styles.chartSvg}>
          <defs>
            <linearGradient id={`${uid}-f`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.32" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={0}
              x2={W}
              y1={H * f}
              y2={H * f}
              strokeDasharray="2 6"
              className={styles.chartGridLine}
            />
          ))}
          <path
            d={`${la} L ${W} ${H} L 0 ${H} Z`}
            fill={`url(#${uid}-f)`}
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 900ms ease 300ms",
            }}
          />
          <path
            d={lb}
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="4 5"
            className={styles.chartBenchmarkPath}
          />
          <path
            key={range}
            d={la}
            fill="none"
            strokeWidth={2.8}
            strokeLinecap="round"
            style={{
              stroke: ACCENT,
              strokeDasharray: 1,
              strokeDashoffset: mounted || reduced ? 0 : 1,
              transition: reduced ? "none" : `stroke-dashoffset 1300ms ${EASE}`,
            }}
            pathLength={1}
          />
        </svg>

        {/* Hover indicators */}
        <span
          aria-hidden
          className={styles.chartCursorLine}
          style={{ left, opacity: hover !== null ? 1 : 0 }}
        />
        <span
          aria-hidden
          className={styles.chartCursorPointMain}
          style={{
            left,
            top: `${(pa[idx][1] / H) * 100}%`,
            background: ACCENT,
          }}
        />
        <span
          aria-hidden
          className={styles.chartCursorPointBench}
          style={{
            left,
            top: `${(pb[idx][1] / H) * 100}%`,
            opacity: hover !== null ? 1 : 0,
          }}
        />
      </div>

      <div className={styles.chartLabelsRow}>
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Allocation Tile: Subscriptions / Users Distribution Segmented Bar  */
/* ------------------------------------------------------------------ */

function AllocationTile({ allocation }: { allocation: QareebAllocation[] }) {
  const mounted = useMounted();
  const total = allocation.reduce((s, a) => s + a.value, 0) || 1;
  const colors = [ACCENT, ACCENT2, "#38bdf8", "#818cf8", "#64748b"];
  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <Tile title="توزيع الاشتراكات والخدمات" className={styles.allocationTile}>
      <p className={styles.allocationTotal}>{fmt.num(total)} مشترك وعضوية</p>

      <div className={styles.segmentedBarWrap} onPointerLeave={() => setHover(null)}>
        {allocation.map((a, i) => (
          <span
            key={a.symbol}
            onPointerEnter={() => setHover(i)}
            className={styles.segmentPiece}
            style={{
              flexBasis: mounted ? `${(a.value / total) * 100}%` : `${100 / allocation.length}%`,
              background: colors[i % colors.length],
              opacity: hover === null || hover === i ? 1 : 0.35,
              transition: `flex-basis 1000ms ${EASE} ${200 + i * 60}ms, opacity 200ms ease`,
            }}
            aria-hidden
          />
        ))}
      </div>

      <ul className={styles.allocationList}>
        {allocation.map((a, i) => (
          <li
            key={a.symbol}
            className={styles.allocationListItem}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <span className={styles.allocationItemName}>
              <span
                className={styles.allocationItemDot}
                style={{ background: colors[i % colors.length] }}
                aria-hidden
              />
              {a.symbol}
            </span>
            <span className={styles.allocationItemPct}>
              {((a.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured Tile: Subscription Growth & Active Plans (Royal Blue)    */
/* ------------------------------------------------------------------ */

function SubscriptionsFeaturedTile({
  subscriptionsSummary,
  pendingActions,
}: {
  subscriptionsSummary: NonNullable<AdminAnalyticsBentoProps["subscriptionsSummary"]>;
  pendingActions: number;
}) {
  const [claimed, setClaimed] = React.useState(false);
  const EPOCH = 5 * 60;
  const [elapsed, setElapsed] = React.useState(180);

  React.useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => (e + 1) % EPOCH), 1000);
    return () => window.clearInterval(id);
  }, [EPOCH]);

  const left = EPOCH - elapsed;
  const refreshIn = `${Math.floor(left / 60)} دقيقة و ${String(Math.floor(left % 60)).padStart(2, "0")} ثانية`;
  const payoutPct = (elapsed / EPOCH) * 100;
  const epochs = [0.45, 0.6, 0.55, 0.78, 0.72, 0.88, 0.82, 0.94, 0.89, 1];

  return (
    <section
      className={styles.featuredTile}
      style={{
        background: ACCENT,
        boxShadow: `0 12px 36px ${ACCENT_GLOW}`,
      }}
    >
      <header className={styles.featuredHeader}>
        <h3 className={styles.featuredTitle}>العضويات المميزة</h3>
        <span className={styles.featuredBadge}>
          <span className={styles.featuredBadgeDot} />
          نمو متصاعد
        </span>
      </header>

      <p className={styles.featuredBigStat}>
        {subscriptionsSummary.paidGrowth.toFixed(1)}
        <span className={styles.featuredUnit}>%</span>
      </p>
      <p className={styles.featuredSubtitle}>
        معدل نمو المشتركين من إجمالي {subscriptionsSummary.total} مستخدم
      </p>

      {/* Sync timer bar */}
      <div className={styles.featuredProgressBox}>
        <div className={styles.featuredProgressText}>
          <span>المزامنة التلقائية التالية</span>
          <span>{refreshIn}</span>
        </div>
        <div className={styles.featuredProgressBarTrack}>
          <div
            className={styles.featuredProgressBarFill}
            style={{ width: `${payoutPct}%` }}
          />
        </div>
      </div>

      <dl className={styles.featuredDl}>
        {[
          ["الباقة الذهبية", `${subscriptionsSummary.gold} مشترك`],
          ["الباقة الفضية", `${subscriptionsSummary.silver} مشترك`],
          ["باقة المشوار", `${subscriptionsSummary.mishwar} مشترك`],
        ].map(([k, v]) => (
          <div key={k} className={styles.featuredDlRow}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.featuredBottomArea}>
        <p className={styles.featuredBottomLabel}>إجمالي المشتركين المدفوعين</p>
        <p className={styles.featuredBottomValue}>
          {subscriptionsSummary.gold + subscriptionsSummary.silver + subscriptionsSummary.mishwar}{" "}
          <span>عضو</span>
        </p>

        {/* Mini epochs bars */}
        <div className={styles.miniEpochsRow}>
          {epochs.map((e, i) => (
            <span
              key={i}
              className={styles.miniEpochBar}
              style={{
                height: `${e * 100}%`,
                opacity: 0.25 + (i / epochs.length) * 0.75,
              }}
            />
          ))}
        </div>
        <p className={styles.miniEpochsSubtitle}>نشاط التجديدات الأخيرة</p>

        <button
          type="button"
          onClick={() => setClaimed(true)}
          disabled={claimed}
          className={styles.featuredActionBtn}
        >
          {claimed
            ? "تم تحديث البيانات بنجاح"
            : pendingActions > 0
            ? `مراجعة ${pendingActions} إجراءات معلقة`
            : "مراجعة جميع الحسابات"}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Liquidity Range / Directory Places Target Tile                    */
/* ------------------------------------------------------------------ */

function DirectoryPlacesTile({
  totalPlaces = 280,
  targetPlaces = 500,
}: {
  totalPlaces?: number;
  targetPlaces?: number;
}) {
  const currentRatio = Math.min(100, Math.round((totalPlaces / targetPlaces) * 100));

  return (
    <Tile
      title="مستهدف توثيق الأماكن بالدليل"
      className={styles.placesTile}
      action={
        <span
          className={styles.inRangeBadge}
          style={{
            background: "rgba(39, 39, 255, 0.12)",
            color: ACCENT,
          }}
        >
          {currentRatio}% مكتمل
        </span>
      }
    >
      <p className={styles.placesValueBig}>{fmt.num(totalPlaces)} مكان</p>
      <p className={styles.placesSubLabel}>موثق بالدليل حتى الآن</p>

      <div className={styles.placesTrackWrap}>
        <div className={styles.placesTrackLine} />
        <div
          className={styles.placesTrackTargetRange}
          style={{
            left: "20%",
            width: "60%",
          }}
        />
        <div
          className={styles.placesIndicatorPin}
          style={{
            left: `${Math.max(5, Math.min(95, currentRatio))}%`,
          }}
        />
      </div>

      <div className={styles.placesRangeLabels}>
        <span>0</span>
        <span>المستهدف: {fmt.num(targetPlaces)}</span>
      </div>

      <p className={styles.placesFooterTip}>
        متبقي <strong style={{ color: ACCENT }}>{fmt.num(Math.max(0, targetPlaces - totalPlaces))}</strong> مكان للوصول للهدف ربع السنوي.
      </p>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  System Stream / Database Transactions Stream                       */
/* ------------------------------------------------------------------ */

function SystemStreamTile({
  reduced,
}: {
  reduced: boolean;
}) {
  const seed = React.useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => 0.35 + (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1 * 0.65),
    []
  );
  const [blocks, setBlocks] = React.useState(() =>
    seed.map((f, i) => ({
      n: 184200 + i,
      fill: f,
      ops: Math.round(45 + f * 95),
    }))
  );
  const [ago, setAgo] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setBlocks((b) => {
        const f = 0.3 + Math.random() * 0.7;
        return [...b.slice(1), { n: b[b.length - 1].n + 1, fill: f, ops: Math.round(45 + f * 95) }];
      });
      setAgo(0);
    }, 3200);
    const t = window.setInterval(() => setAgo((a) => a + 1), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(t);
    };
  }, [reduced]);

  const last = blocks[blocks.length - 1];

  return (
    <Tile
      title="تدفق عمليات واستعلامات المنصة"
      className={styles.streamTile}
      action={<span className={styles.streamTimeAgo}>منذ {ago} ثوانٍ</span>}
    >
      <div className={styles.streamHeaderRow}>
        <div>
          <p className={styles.streamCountBig}>#{last.n.toLocaleString("en-US")}</p>
          <p className={styles.streamSubInfo}>
            {last.ops} استعلام · {(last.fill * 100).toFixed(0)}% قدرة التشغيل
          </p>
        </div>
        <p className={styles.streamTargetNote}>استقرار بنسبة 99.9%</p>
      </div>

      <div className={styles.streamBarsRow} aria-hidden>
        {blocks.map((b, i) => {
          const isLast = i === blocks.length - 1;
          return (
            <span
              key={b.n}
              className={styles.streamBar}
              style={{
                height: `${b.fill * 100}%`,
                background: isLast ? ACCENT : "var(--color-muted, #94a3b8)",
                opacity: isLast ? 1 : 0.15 + (i / blocks.length) * 0.45,
              }}
            />
          );
        })}
      </div>

      <dl className={styles.streamDl}>
        {[
          ["معدل الاستجابة", "42ms"],
          ["الحمل الحالي", `${Math.round((blocks.reduce((t, b) => t + b.fill, 0) / blocks.length) * 100)}%`],
          ["المعالجة المباشرة", `${(blocks.slice(-10).reduce((t, b) => t + b.ops, 0) / 32).toFixed(1)} req/s`],
        ].map(([k, v]) => (
          <div key={k} className={styles.streamDlCol}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Tile: Recent Live Platform Logs                          */
/* ------------------------------------------------------------------ */

function KindIcon({ kind }: { kind: QareebActivity["kind"] }) {
  const p = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "deposit") {
    return (
      <svg {...p}>
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    );
  }
  if (kind === "withdraw") {
    return (
      <svg {...p}>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    );
  }
  if (kind === "subscription") {
    return (
      <svg {...p}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (kind === "voucher") {
    return (
      <svg {...p}>
        <rect x="2" y="6" width="20" height="12" rx="3" />
        <path d="M12 12h.01" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ActivityTile({ activity }: { activity: QareebActivity[] }) {
  const mounted = useMounted();
  const list = activity && activity.length > 0 ? activity : [
    { id: "a1", kind: "deposit", title: "إيداع رصيد جديد", detail: "محفظة فودافون كاش", amount: "+250 ج.م", status: "confirmed", time: "الآن" },
    { id: "a2", kind: "subscription", title: "ترقية للباقة الذهبية", detail: "اشتراك سنوي", amount: "+450 ج.م", status: "confirmed", time: "منذ 15 دقيقة" },
    { id: "a3", kind: "voucher", title: "استرداد كود ترويجي", detail: "كود خصم CAIRO2026", amount: "+50 ج.م", status: "confirmed", time: "منذ ساعة" },
    { id: "a4", kind: "withdraw", title: "طلب سحب أرباح", detail: "حساب بنكي", amount: "−320 ج.م", status: "pending", time: "منذ ساعتين" },
  ] as QareebActivity[];

  return (
    <Tile title="أحدث العمليات والحركات" className={styles.activityTile}>
      <ul className={styles.activityList}>
        {list.slice(0, 4).map((a, i) => (
          <li
            key={a.id}
            className={styles.activityItem}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(6px)",
              transition: `opacity 500ms ease ${300 + i * 70}ms, transform 500ms ${EASE} ${300 + i * 70}ms`,
            }}
          >
            <span
              className={styles.activityIconWrap}
              style={{
                color: a.kind === "deposit" || a.kind === "subscription" ? ACCENT : "#a855f7",
              }}
            >
              <KindIcon kind={a.kind} />
            </span>
            <div className={styles.activityDetails}>
              <p className={styles.activityTitle}>{a.title}</p>
              <p className={styles.activityMeta}>
                {a.detail} · {a.time}
              </p>
            </div>
            <div className={styles.activityAmountCol}>
              <p className={styles.activityAmount}>{a.amount}</p>
              <p
                className={styles.activityStatus}
                style={{
                  color:
                    a.status === "confirmed"
                      ? "#10b981"
                      : a.status === "pending"
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                {a.status === "confirmed" ? "مكتمل" : a.status === "pending" ? "قيد المراجعة" : "ملغي"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Bento Component Export                                       */
/* ------------------------------------------------------------------ */

export function AdminAnalyticsBento({
  totalRevenue = 0,
  totalExpenses = 0,
  netProfit = 0,
  activeUsersNow = 0,
  visitsHistory = [],
  allocation = [
    { symbol: "الذهبية", value: 35 },
    { symbol: "الفضية", value: 45 },
    { symbol: "المشوار", value: 80 },
    { symbol: "المجانية", value: 240 },
  ],
  subscriptionsSummary = {
    gold: 35,
    silver: 45,
    mishwar: 80,
    free: 240,
    total: 400,
    paidGrowth: 14.8,
  },
  cards,
  activity = [],
  totalPlaces = 280,
  pendingActions = 0,
}: AdminAnalyticsBentoProps) {
  const reduced = useReducedMotion();

  const defaultCards: QareebCard[] = [
    {
      id: "c1",
      label: "الباقة الذهبية",
      last4: "9821",
      holder: "الأعضاء المميزين",
      expiry: "سنوي",
      balance: `${subscriptionsSummary.gold} عضو`,
      color: "#1e1b4b",
      color2: ACCENT,
      ink: "#ffffff",
    },
    {
      id: "c2",
      label: "الباقة الفضية",
      last4: "4502",
      holder: "أصحاب الأعمال",
      expiry: "شهري",
      balance: `${subscriptionsSummary.silver} عضو`,
      color: "#312e81",
      color2: ACCENT2,
      ink: "#ffffff",
    },
    {
      id: "c3",
      label: "محفظة المنصة",
      last4: "0024",
      holder: "حساب التشغيل",
      expiry: "مباشر",
      balance: fmt.currency(totalRevenue),
      color: ACCENT,
      color2: "#3b82f6",
      ink: "#ffffff",
    },
  ];

  return (
    <div className={styles.bentoWrapper}>
      {/* Top Bar Status */}
      <nav className={styles.topStatusNav} aria-label="شريط المؤشرات الحية">
        <div className={styles.statusPills}>
          <span className={styles.statusPillItem}>
            <span className={styles.statusPillDot} style={{ background: ACCENT }} />
            شبكة القاهرة الكبرى
          </span>
          <span className={styles.statusAdminBadge}>
            مباشر · {activeUsersNow} مستخدم متصل
          </span>
        </div>
      </nav>

      {/* Grid Bento Layout */}
      <div className={styles.bentoGrid}>
        <HeroTile
          totalRevenue={totalRevenue}
          netProfit={netProfit}
          visitsHistory={visitsHistory}
          reduced={reduced}
        />
        <CardsTile cards={cards ?? defaultCards} reduced={reduced} />
        <TrafficGaugeTile activeUsersNow={activeUsersNow} reduced={reduced} />
        <ChartTile visitsHistory={visitsHistory} reduced={reduced} />
        <AllocationTile allocation={allocation} />
        <SubscriptionsFeaturedTile
          subscriptionsSummary={subscriptionsSummary}
          pendingActions={pendingActions}
        />
        <DirectoryPlacesTile totalPlaces={totalPlaces} />
        <SystemStreamTile reduced={reduced} />
        <ActivityTile activity={activity} />
      </div>
    </div>
  );
}

export default AdminAnalyticsBento;
