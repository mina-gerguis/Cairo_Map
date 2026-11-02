"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUp, CircleCheck } from "lucide-react";
import { useGSAP, gsap } from "@/lib/gsap";
import "./CommunityOrbit.css";

/* ─────────────────── Types ─────────────────── */
export type OrbitRing = "outer" | "inner";

interface OrbitBase {
  ring: OrbitRing;
  angle: number;
}

export interface OrbitAvatarItem extends OrbitBase {
  kind: "avatar";
  src: string;
  alt?: string;
  color?: string;
  size?: number;
  hasHalo?: boolean;
  haloColor?: string;
}

export interface OrbitPillItem extends OrbitBase {
  kind: "pill";
  icon: ReactNode;
  label: string;
}

export interface OrbitCardItem extends OrbitBase {
  kind: "card";
  emoji: string;
  badge?: string | number;
}

export interface OrbitStatusItem extends OrbitBase {
  kind: "status";
  label: string;
}

export interface OrbitCheckItem extends OrbitBase {
  kind: "check";
}

export type OrbitItem =
  | OrbitAvatarItem
  | OrbitPillItem
  | OrbitCardItem
  | OrbitStatusItem
  | OrbitCheckItem;

export interface OrbitStat {
  value: string;
  label: string;
}

export interface OrbitTag {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface CommunityOrbitProps {
  items?: OrbitItem[];
  stats?: OrbitStat[];
  headline?: ReactNode;
  subheadline?: ReactNode;
  tags?: OrbitTag[];
  minScale?: number;
  className?: string;
  children?: ReactNode;
}

/* ─────────────────── Geometry Constants ─────────────────── */
const STAGE_W = 1200;
const STAGE_H = 490;
const CENTER = { x: 600, y: 620 };
const RADIUS: Record<OrbitRing, number> = { outer: 492, inner: 404 };

/**
 * Returns exact coordinates so the mathematical center of the element
 * sits directly on the arc curve.
 */
function positionOnRing(ring: OrbitRing, angle: number): CSSProperties {
  const rad = (angle * Math.PI) / 180;
  const r = RADIUS[ring];
  return {
    left: `${CENTER.x + r * Math.cos(rad)}px`,
    top: `${CENTER.y - r * Math.sin(rad)}px`,
  };
}

/** SVG circular arc path clipping cleanly at the stage boundary */
function arcPath(r: number): string {
  const dy = CENTER.y - STAGE_H;
  const dx = Math.sqrt(r * r - dy * dy);
  return `M ${CENTER.x - dx} ${STAGE_H} A ${r} ${r} 0 0 1 ${CENTER.x + dx} ${STAGE_H}`;
}

/* ─────────────────── Sub-components ─────────────────── */
function OrbitAvatar({
  src,
  alt,
  color = "#ffffff",
  size = 68,
  hasHalo = false,
  haloColor = "rgba(214, 205, 252, 0.65)",
}: OrbitAvatarItem) {
  return (
    <div
      className="orbit-avatar-wrapper"
      style={{
        width: size,
        height: size,
        ...(hasHalo
          ? {
              boxShadow: `0 0 0 7px ${haloColor}, 0 4px 14px rgba(0,0,0,0.08)`,
            }
          : {}),
      }}
    >
      <div className="orbit-avatar-inner" style={{ backgroundColor: color }}>
        <img
          src={src}
          alt={alt ?? ""}
          draggable={false}
          className="orbit-avatar-img"
        />
      </div>
    </div>
  );
}

function OrbitPill({ icon, label }: OrbitPillItem) {
  return (
    <div className="orbit-pill">
      <span className="orbit-pill-icon">{icon}</span>
      <span className="orbit-pill-label">{label}</span>
    </div>
  );
}

function OrbitCard({ emoji, badge }: OrbitCardItem) {
  return (
    <div className="orbit-card">
      <span className="orbit-card-emoji">{emoji}</span>
      {badge !== undefined && (
        <span className="orbit-card-badge">
          <ArrowUp size={10} strokeWidth={2.4} />
          {badge}
        </span>
      )}
    </div>
  );
}

function OrbitStatus({ label }: OrbitStatusItem) {
  return (
    <div className="orbit-status">
      <span className="orbit-status-icon-wrap">
        <CircleCheck size={15} strokeWidth={2.4} className="orbit-status-icon" />
      </span>
      <span className="orbit-status-label">{label}</span>
    </div>
  );
}

function OrbitCheck() {
  return (
    <div className="orbit-check">
      <CircleCheck size={18} strokeWidth={2.4} className="orbit-check-icon" />
    </div>
  );
}

function renderItem(item: OrbitItem) {
  switch (item.kind) {
    case "avatar":
      return <OrbitAvatar {...item} />;
    case "pill":
      return <OrbitPill {...item} />;
    case "card":
      return <OrbitCard {...item} />;
    case "status":
      return <OrbitStatus {...item} />;
    case "check":
      return <OrbitCheck />;
  }
}

/* ─────────────────── Number CountUp via GSAP ─────────────────── */
function splitValue(value: string) {
  const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, "");
  const decimals = (raw.split(".")[1] ?? "").length;
  return { prefix: m[1], target: parseFloat(raw), decimals, suffix: m[3] };
}

function CountUp({ value, delay }: { value: string; delay: number }) {
  const parts = splitValue(value);
  const spanRef = useRef<HTMLSpanElement>(null);
  const countObj = useRef({ val: 0 });

  useEffect(() => {
    if (!parts || !spanRef.current) return;
    countObj.current.val = 0;
    const tween = gsap.to(countObj.current, {
      val: parts.target,
      delay,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        if (spanRef.current) {
          const v = countObj.current.val;
          spanRef.current.textContent =
            parts.prefix +
            (parts.decimals > 0
              ? v.toFixed(parts.decimals)
              : Math.round(v).toLocaleString("en-US")) +
            parts.suffix;
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, delay]);

  if (!parts) return <>{value}</>;
  return (
    <span ref={spanRef}>
      {parts.prefix}0{parts.suffix}
    </span>
  );
}

/* ─────────────────── Default Orbit Data ─────────────────── */
export const DEFAULT_ORBIT_ITEMS: OrbitItem[] = [
  // ── Outer Ring (Radius: 492) ──
  {
    kind: "card",
    ring: "outer",
    angle: 158,
    emoji: "🚀",
    badge: "12",
  },
  {
    kind: "avatar",
    ring: "outer",
    angle: 135,
    src: "/images/transit/metro.webp",
    alt: "مترو القاهرة",
    color: "#ffffff",
    size: 66,
  },
  {
    kind: "pill",
    ring: "outer",
    angle: 112,
    icon: "🚇",
    label: "مترو القاهرة الكبرى",
  },
  {
    kind: "avatar",
    ring: "outer",
    angle: 90,
    src: "/images/locations/governorates/egypt.webp",
    alt: "شعار جمهورية مصر العربية",
    color: "#ffffff",
    size: 72,
  },
  {
    kind: "card",
    ring: "outer",
    angle: 68,
    emoji: "⭐",
    badge: "240",
  },
  {
    kind: "avatar",
    ring: "outer",
    angle: 42,
    src: "/images/memoji/memo_1.webp",
    alt: "مسافرة قريبة",
    color: "#ede9fe",
    size: 74,
    hasHalo: true,
    haloColor: "rgba(214, 205, 252, 0.7)",
  },
  {
    kind: "avatar",
    ring: "outer",
    angle: 20,
    src: "/images/transit/monorail_west.webp",
    alt: "مونوريل غرب النيل",
    color: "#ffffff",
    size: 66,
  },

  // ── Inner Ring (Radius: 404) ──
  {
    kind: "status",
    ring: "inner",
    angle: 155,
    label: "دليلك الشامل جاهز",
  },
  {
    kind: "avatar",
    ring: "inner",
    angle: 130,
    src: "/images/memoji/memo_3.webp",
    alt: "مستكشفة القاهرة",
    color: "#fef3c7",
    size: 70,
  },
  {
    kind: "pill",
    ring: "inner",
    angle: 110,
    icon: "🔥",
    label: "18 خدمة",
  },
  {
    kind: "avatar",
    ring: "inner",
    angle: 90,
    src: "/images/memoji/memo_2.webp",
    alt: "مستخدم جديد",
    color: "#dbeafe",
    size: 58,
  },
  {
    kind: "card",
    ring: "inner",
    angle: 70,
    emoji: "📦",
  },
  {
    kind: "check",
    ring: "inner",
    angle: 45,
  },
  {
    kind: "pill",
    ring: "inner",
    angle: 22,
    icon: "💬",
    label: "36 تحديث",
  },
];

export const DEFAULT_ORBIT_STATS: OrbitStat[] = [
  { value: "2,500+", label: "مكان مسجل ومُوثّق" },
  { value: "1,200+", label: "رقم هاتف وكود سريع" },
  { value: "9+", label: "عدد خدمات الموقع" },
];

/* ─────────────────── Main Component ─────────────────── */
export default function CommunityOrbit({
  items = DEFAULT_ORBIT_ITEMS,
  stats = DEFAULT_ORBIT_STATS,
  headline,
  subheadline,
  tags = [],
  minScale = 0.55,
  className,
  children,
}: CommunityOrbitProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const outerArcRef = useRef<SVGPathElement>(null);
  const innerArcRef = useRef<SVGPathElement>(null);
  const [scale, setScale] = useState(1);

  /* ── 1. Responsive Stage Scaling ── */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const handleResize = () => {
      const parentWidth = frame.clientWidth;
      const targetScale = Math.min(1, Math.max(minScale, parentWidth / STAGE_W));
      setScale(targetScale);
    };
    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [minScale]);

  /* ── 2. GSAP Orchestrated Animation ── */
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      /* Arc SVG drawing */
      [outerArcRef, innerArcRef].forEach((ref, idx) => {
        const path = ref.current;
        if (!path) return;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(
          path,
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.inOut",
          },
          idx * 0.1
        );
      });

      /* Staggered Pop-in of Items */
      const itemReveals = section.querySelectorAll(".orbit-item-reveal");
      if (itemReveals.length) {
        gsap.set(itemReveals, { autoAlpha: 0, scale: 0.4 });
        tl.to(
          itemReveals,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.05,
            ease: "back.out(1.5)",
            clearProps: "transform,opacity,visibility",
          },
          0.45
        );
      }

      /* Infinite Floating Bobbing (independent on float wrapper) */
      const itemFloats = section.querySelectorAll(".orbit-item-float");
      itemFloats.forEach((el, i) => {
        gsap.to(el, {
          y: -5,
          duration: 3 + (i % 4) * 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: (i * 0.3) % 2,
        });
      });

      /* Stats Reveal */
      const statItems = section.querySelectorAll(".orbit-stat-item");
      if (statItems.length) {
        gsap.set(statItems, { autoAlpha: 0, y: 20 });
        tl.to(
          statItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          },
          0.85
        );
      }

      /* Headline Reveal */
      const headEl = section.querySelector(".orbit-headline");
      if (headEl) {
        gsap.set(headEl, { autoAlpha: 0, y: 22 });
        tl.to(
          headEl,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            clearProps: "transform,opacity,visibility",
          },
          1.2
        );
      }

      /* Subheadline Reveal */
      const subEl = section.querySelector(".orbit-subheadline");
      if (subEl) {
        gsap.set(subEl, { autoAlpha: 0, y: 16 });
        tl.to(
          subEl,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            clearProps: "transform,opacity,visibility",
          },
          1.35
        );
      }

      /* Children Slot (Search box) */
      const childSlot = section.querySelector(".orbit-children-slot");
      if (childSlot) {
        gsap.set(childSlot, { autoAlpha: 0, y: 20, scale: 0.98 });
        tl.to(
          childSlot,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            clearProps: "transform,opacity,visibility",
          },
          1.45
        );
      }

      /* Tag Pills Stagger */
      const tagPills = section.querySelectorAll(".orbit-tag-pill");
      if (tagPills.length) {
        gsap.set(tagPills, { autoAlpha: 0, y: 14 });
        tl.to(
          tagPills,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.05,
            clearProps: "transform,opacity,visibility",
          },
          1.55
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={`orbit-section ${className ?? ""}`}>
      {/* ── Visual Arc Stage ── */}
      <div
        ref={frameRef}
        className="orbit-frame"
        style={{ height: `${STAGE_H * scale}px` }}
      >
        <div
          className="orbit-stage"
          style={{
            transform: `translateX(-50%) scale(${scale})`,
          }}
        >
          {/* SVG Arcs */}
          <svg
            className="orbit-svg"
            width={STAGE_W}
            height={STAGE_H}
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            fill="none"
          >
            <path
              ref={outerArcRef}
              d={arcPath(RADIUS.outer)}
              className="orbit-arc-outer"
            />
            <path
              ref={innerArcRef}
              d={arcPath(RADIUS.inner)}
              className="orbit-arc-inner"
            />
          </svg>

          {/* Orbiting Items – Placed EXACTLY on the Arc Lines */}
          {items.map((item, i) => (
            <div
              key={i}
              className="orbit-item-anchor"
              style={{
                ...positionOnRing(item.ring, item.angle),
                position: "absolute",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="orbit-item-reveal">
                <div className="orbit-item-float">{renderItem(item)}</div>
              </div>
            </div>
          ))}

          {/* Stats Semicircle Hub */}
          <div className="orbit-stats-grid">
            {stats.map((s, i) => (
              <div key={s.label} className="orbit-stat-item">
                <span className="orbit-stat-value">
                  <CountUp value={s.value} delay={0.85 + i * 0.1} />
                </span>
                <span className="orbit-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Headline ── */}
      {headline && <h1 className="orbit-headline">{headline}</h1>}

      {/* ── Subheadline ── */}
      {subheadline && <p className="orbit-subheadline">{subheadline}</p>}

      {/* ── Search Box / Children Slot ── */}
      {children && <div className="orbit-children-slot">{children}</div>}

      {/* ── Quick Search Tag Pills ── */}
      {tags.length > 0 && (
        <div className="orbit-tags-container">
          {tags.map((t) => {
            const isLink = !!t.href;
            const Tag = isLink ? "a" : "button";
            return (
              <Tag
                key={t.label}
                {...(isLink ? { href: t.href } : { type: "button" as const })}
                onClick={t.onClick}
                className="orbit-tag-pill"
              >
                <span className="orbit-tag-icon-bubble">{t.icon}</span>
                <span>{t.label}</span>
              </Tag>
            );
          })}
        </div>
      )}
    </section>
  );
}

export { CommunityOrbit as Component };
