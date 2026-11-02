"use client";

import * as React from "react";
import { createPortal, flushSync } from "react-dom";

export interface MetroStation {
  id: string;
  title: string;
  /** Short tag shown on the card and in the detail view, such as a team or a phase. */
  label?: string;
  /** Free-form date text, for example "2026 Q2". */
  date?: string;
  description?: string;
  image?: string;
  /** Zero-based line index. */
  line: number;
  /** Position within the line. Stations without it keep their input order. */
  order?: number;
}

export interface MetroLine {
  name: string;
  /** Chart token 1–5 used for the line colour. Defaults to the line position. */
  tone?: 1 | 2 | 3 | 4 | 5;
}

export interface MetroMapGalleryLabels {
  close: string;
  previous: string;
  next: string;
  line: string;
  station: string;
}

export interface MetroMapGalleryProps extends React.ComponentProps<"section"> {
  items: MetroStation[];
  lines?: MetroLine[];
  eyebrow?: string;
  heading?: string;
  /** Shown under the map while no station is selected. */
  caption?: string;
  /** Cruising speed of the trains in map units (viewBox pixels) per second. 0 parks them. */
  trainSpeed?: number;
  /** Milliseconds a train waits at every station. */
  dwell?: number;
  /** Walks the stations one after another until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds each autoplay station stays selected. */
  interval?: number;
  /** Controlled selected station id; pair it with onActiveChange. */
  active?: string | null;
  onActiveChange?: (id: string | null) => void;
  /** Controlled open station id; pair it with onOpenChange. */
  open?: string | null;
  onOpenChange?: (id: string | null) => void;
  labels?: MetroMapGalleryLabels;
}

type Pt = { x: number; y: number };
type Box = { l: number; t: number; r: number; b: number };
type Arc = { c: Pt; r: number; a0: number; da: number };
type Piece = { a: Pt; b: Pt; len: number; arc: Arc | null };
type Route = { points: Pt[]; pieces: Piece[]; length: number; d: string };
type Orientation = "landscape" | "portrait";
type Side = 1 | -1;
type StationGeo = {
  station: MetroStation;
  id: string;
  line: number;
  index: number;
  count: number;
  distance: number;
  t: number;
  x: number;
  y: number;
  nx: number;
  ny: number;
  side: Side;
  terminus: boolean;
  out: Pt | null;
};
type LineGeo = { index: number; tone: number; name: string; route: Route; stations: StationGeo[]; roundels: Pt[] };
type Geometry = { orientation: Orientation; w: number; h: number; lines: LineGeo[]; crossings: Pt[]; byId: { [id: string]: StationGeo } };
type Train = { at: number; to: number; dir: Side; moving: boolean; clock: number; pos: number; hold: boolean };
type BubbleItem = { key: number; id: string };
type Spot = { x: number; y: number; side: "above" | "below" | "right" | "left" };
type LabelSpot = { dx: number; dy: number; offset: number; chip: boolean };
type LabelLayout = { [id: string]: { spot: number; sx: number; sy: number } };

const VIEW = { landscape: { w: 1200, h: 560 }, portrait: { w: 560, h: 900 } };
const PORTRAIT_BELOW = 480;
const MAX_LINES = 5;
const CORNER = 42;
const CLEAR_OF_CROSSING = 48;
const CLEAR_OF_STATION = 64;
const MIN_STATION_GAP = 72;
const START_DELAY = 1200;
const BUBBLE_MS = 900;
const CARD_W = 190;
const FIRST_STOP = [3, 1, 2, 2, 1];
const FIRST_ARRIVAL = [0.6, 2.4, 4.2, 6, 7.8];
const DEFAULT_LABELS: MetroMapGalleryLabels = {
  close: "إغلاق",
  previous: "المحطة السابقة",
  next: "المحطة التالية",
  line: "الخط",
  station: "محطة",
};

const LANDSCAPE: number[][][] = [
  [[90, 380, 470, 380, 670, 180, 1110, 180]],
  [
    [90, 150, 480, 150, 740, 410, 1110, 410],
    [90, 410, 420, 410, 680, 150, 1110, 150],
  ],
  [
    [90, 330, 400, 330, 530, 200, 1110, 200],
    [90, 110, 590, 110, 860, 380, 1110, 380],
    [90, 450, 560, 450, 890, 120, 1110, 120],
  ],
  [
    [90, 330, 400, 330, 530, 200, 1110, 200],
    [90, 110, 590, 110, 860, 380, 1110, 380],
    [90, 450, 560, 450, 890, 120, 1110, 120],
    [330, 60, 330, 160, 230, 260, 230, 500],
  ],
  [
    [90, 330, 400, 330, 530, 200, 1110, 200],
    [90, 110, 590, 110, 860, 380, 1110, 380],
    [90, 450, 560, 450, 890, 120, 1110, 120],
    [330, 60, 330, 160, 230, 260, 230, 500],
    [700, 500, 960, 500, 1040, 420, 1040, 60],
  ],
];
const PORTRAIT: number[][][] = [
  [[200, 80, 200, 400, 380, 580, 380, 830]],
  [
    [150, 80, 150, 330, 410, 590, 410, 830],
    [410, 80, 410, 280, 150, 540, 150, 830],
  ],
  [
    [250, 80, 250, 270, 330, 350, 330, 830],
    [470, 80, 470, 420, 110, 780, 110, 840],
    [90, 80, 90, 430, 480, 820, 480, 850],
  ],
  [
    [250, 80, 250, 270, 330, 350, 330, 830],
    [470, 80, 470, 420, 110, 780, 110, 840],
    [90, 80, 90, 430, 480, 820, 480, 850],
    [70, 260, 160, 260, 280, 140, 490, 140],
  ],
  [
    [250, 80, 250, 270, 330, 350, 330, 830],
    [470, 80, 470, 420, 110, 780, 110, 840],
    [90, 80, 90, 430, 480, 820, 480, 850],
    [70, 260, 160, 260, 280, 140, 490, 140],
    [70, 760, 200, 760, 260, 700, 490, 700],
  ],
];

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function distance(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function toPoints(flat: number[]) {
  const points = [] as Pt[];
  for (let i = 0; i + 1 < flat.length; i += 2) points.push({ x: flat[i]!, y: flat[i + 1]! });
  return points;
}

function buildRoute(points: Pt[], radius: number): Route {
  const pieces = [] as Piece[];
  const first = points[0] ?? { x: 0, y: 0 };
  let cursor = first;
  let d = `M${round(first.x)} ${round(first.y)}`;
  const line = (to: Pt) => {
    const len = distance(cursor, to);
    if (len > 0.01) {
      pieces.push({ a: cursor, b: to, len, arc: null });
      d += ` L${round(to.x)} ${round(to.y)}`;
    }
    cursor = to;
  };
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    const next = points[i + 1];
    const prev = points[i - 1]!;
    if (!next) {
      line(p);
      break;
    }
    const lenIn = distance(prev, p);
    const lenOut = distance(p, next);
    const u = { x: (p.x - prev.x) / lenIn, y: (p.y - prev.y) / lenIn };
    const v = { x: (next.x - p.x) / lenOut, y: (next.y - p.y) / lenOut };
    const turn = Math.acos(clamp(u.x * v.x + u.y * v.y, -1, 1));
    if (turn < 0.001) {
      line(p);
      continue;
    }
    const tanHalf = Math.tan(turn / 2);
    const cut = Math.min(radius * tanHalf, lenIn / 2, lenOut / 2);
    const r = cut / tanHalf;
    const s = { x: p.x - u.x * cut, y: p.y - u.y * cut };
    const e = { x: p.x + v.x * cut, y: p.y + v.y * cut };
    line(s);
    const side = u.x * v.y - u.y * v.x > 0 ? 1 : -1;
    const c = { x: s.x - u.y * side * r, y: s.y + u.x * side * r };
    pieces.push({ a: s, b: e, len: r * turn, arc: { c, r, a0: Math.atan2(s.y - c.y, s.x - c.x), da: side * turn } });
    d += ` A${round(r)} ${round(r)} 0 0 ${side > 0 ? 1 : 0} ${round(e.x)} ${round(e.y)}`;
    cursor = e;
  }
  return { points, pieces, length: pieces.reduce((sum, piece) => sum + piece.len, 0), d };
}

function pointAt(route: Route, at: number) {
  let left = clamp(at, 0, route.length);
  const last = route.pieces[route.pieces.length - 1];
  for (const piece of route.pieces) {
    if (left <= piece.len || piece === last) {
      const k = piece.len ? clamp(left / piece.len, 0, 1) : 0;
      if (piece.arc) {
        const { c, r, a0, da } = piece.arc;
        const angle = a0 + da * k;
        return { x: c.x + r * Math.cos(angle), y: c.y + r * Math.sin(angle), angle: angle + (Math.sign(da) * Math.PI) / 2 };
      }
      return { x: piece.a.x + (piece.b.x - piece.a.x) * k, y: piece.a.y + (piece.b.y - piece.a.y) * k, angle: Math.atan2(piece.b.y - piece.a.y, piece.b.x - piece.a.x) };
    }
    left -= piece.len;
  }
  return { x: 0, y: 0, angle: 0 };
}

function along(route: Route, target: Pt) {
  let best = 0;
  let bestDist = Infinity;
  for (let at = 0; at <= route.length; at += 3) {
    const d = distance(pointAt(route, at), target);
    if (d < bestDist) {
      bestDist = d;
      best = at;
    }
  }
  return best;
}

function intersect(a: Pt, b: Pt, c: Pt, d: Pt) {
  const rx = b.x - a.x;
  const ry = b.y - a.y;
  const sx = d.x - c.x;
  const sy = d.y - c.y;
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den;
  const u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: a.x + rx * t, y: a.y + ry * t };
}

function segmentDistance(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  const t = len ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / len, 0, 1) : 0;
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

function snap(x: number, y: number) {
  const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4)) * (Math.PI / 4);
  return { x: Math.round(Math.cos(angle) * 1000) / 1000, y: Math.round(Math.sin(angle) * 1000) / 1000 };
}

function buildGeometry(orientation: Orientation, groups: MetroStation[][], lines: MetroLine[]): Geometry {
  const view = VIEW[orientation];
  const set = (orientation === "portrait" ? PORTRAIT : LANDSCAPE)[Math.max(0, groups.length - 1)] ?? [];
  const routes = groups.map((_, n) => buildRoute(toPoints(set[n] ?? []), CORNER));
  const polylines = routes.map((route) => route.points);
  const crossings = [] as Pt[];
  const crossingsOn = routes.map(() => [] as number[]);
  for (let i = 0; i < polylines.length; i++) {
    for (let j = i + 1; j < polylines.length; j++) {
      const pa = polylines[i]!;
      const pb = polylines[j]!;
      for (let a = 0; a + 1 < pa.length; a++) {
        for (let b = 0; b + 1 < pb.length; b++) {
          const hit = intersect(pa[a]!, pa[a + 1]!, pb[b]!, pb[b + 1]!);
          if (!hit) continue;
          crossings.push(hit);
          crossingsOn[i]!.push(along(routes[i]!, hit));
          crossingsOn[j]!.push(along(routes[j]!, hit));
        }
      }
    }
  }
  const placed = [] as Pt[];
  const byId: { [id: string]: StationGeo } = {};
  const lineGeos = groups.map((stations, n) => {
    const route = routes[n]!;
    const count = stations.length;
    const length = route.length;
    const spacing = count > 1 ? length / (count - 1) : length;
    const ok = (at: number, previous: number | undefined) => {
      const p = pointAt(route, at);
      return (
        (crossingsOn[n] ?? []).every((c) => Math.abs(c - at) >= CLEAR_OF_CROSSING) &&
        placed.every((other) => distance(other, p) >= CLEAR_OF_STATION) &&
        (previous === undefined || at - previous >= Math.min(MIN_STATION_GAP, spacing * 0.6))
      );
    };
    const distances = [] as number[];
    for (let k = 0; k < count; k++) {
      const base = count === 1 ? length / 2 : (length * k) / (count - 1);
      let at = base;
      const previous = distances[k - 1];
      if (k > 0 && k < count - 1 && !ok(base, previous)) {
        for (let step = 6; step <= spacing * 0.42; step += 6) {
          if (ok(base + step, previous)) { at = base + step; break; }
          if (ok(base - step, previous)) { at = base - step; break; }
        }
      }
      distances.push(at);
    }
    const start = pointAt(route, 0);
    const end = pointAt(route, length);
    const outStart = snap(-Math.cos(start.angle), -Math.sin(start.angle));
    const outEnd = snap(Math.cos(end.angle), Math.sin(end.angle));
    const geos = stations.map((station, k) => {
      const at = distances[k] ?? 0;
      const p = pointAt(route, at);
      placed.push(p);
      const normal = snap(-Math.sin(p.angle), Math.cos(p.angle));
      const terminus = count > 1 && (k === 0 || k === count - 1);
      const outward = k === 0 ? outStart : outEnd;
      const out = terminus && Math.abs(outward.y) > 0.7 ? outward : null;
      return { station, id: station.id, line: n, index: k, count, distance: at, t: length ? at / length : 0, x: p.x, y: p.y, nx: normal.x, ny: normal.y, side: (k % 2 === 0 ? 1 : -1) as Side, terminus, out };
    });
    const roundels = [
      { x: start.x + outStart.x * 40, y: start.y + outStart.y * 40, vertical: Math.abs(outStart.y) > 0.7 },
      { x: end.x + outEnd.x * 40, y: end.y + outEnd.y * 40, vertical: Math.abs(outEnd.y) > 0.7 },
    ].filter((roundel) => !roundel.vertical).map(({ x, y }) => ({ x, y }));
    const tone = clamp((lines[n]?.tone ?? ((n % 5) + 1)) - 1, 0, 4);
    return { index: n, tone, name: lines[n]?.name ?? `${n + 1}`, route, stations: geos, roundels };
  });
  for (const line of lineGeos) {
    for (const st of line.stations) {
      const clearance = (side: Side) => {
        const probe = { x: st.x + st.nx * side * 34, y: st.y + st.ny * side * 34 };
        let min = Infinity;
        for (const other of lineGeos) {
          if (other === line) continue;
          const pts = other.route.points;
          for (let i = 0; i + 1 < pts.length; i++) min = Math.min(min, segmentDistance(probe, pts[i]!, pts[i + 1]!));
        }
        const edge = Math.min(probe.x, view.w - probe.x, probe.y, view.h - probe.y);
        return Math.min(min, edge + 20);
      };
      const mine = clearance(st.side);
      if (mine < 30 && clearance((-st.side) as Side) > mine) st.side = (-st.side) as Side;
      byId[st.id] = st;
    }
  }
  return { orientation, w: view.w, h: view.h, lines: lineGeos, crossings, byId };
}

function profile(length: number, speed: number, accel: number) {
  const tAcc = speed / accel;
  const dAcc = 0.5 * accel * tAcc * tAcc;
  if (length >= 2 * dAcc) return { total: 2 * tAcc + (length - 2 * dAcc) / speed, tAcc, dAcc, peak: speed };
  const peak = Math.sqrt(accel * length);
  return { total: (2 * peak) / accel, tAcc: peak / accel, dAcc: length / 2, peak };
}

function travelled(length: number, speed: number, accel: number, time: number) {
  const p = profile(length, speed, accel);
  if (time <= 0) return 0;
  if (time >= p.total) return length;
  if (time < p.tAcc) return 0.5 * accel * time * time;
  if (time > p.total - p.tAcc) {
    const r = p.total - time;
    return length - 0.5 * accel * r * r;
  }
  return p.dAcc + p.peak * (time - p.tAcc);
}

function accelFor(speed: number) {
  return Math.max(40, speed * 1.4);
}

function firstTrain(n: number, stops: number[], speed: number, still: boolean): Train | null {
  const count = stops.length;
  if (count === 0) return null;
  if (count === 1) return { at: 0, to: 0, dir: 1, moving: false, clock: 0, pos: stops[0]!, hold: false };
  const target = clamp(FIRST_STOP[n % FIRST_STOP.length]!, 1, count - 1);
  if (still || speed <= 0) return { at: target, to: target, dir: 1, moving: false, clock: 0, pos: stops[target]!, hold: false };
  const from = stops[target - 1]!;
  const length = stops[target]! - from;
  const accel = accelFor(speed);
  const clock = Math.max(0, profile(length, speed, accel).total - (FIRST_ARRIVAL[n % FIRST_ARRIVAL.length] ?? 1));
  return { at: target - 1, to: target, dir: 1, moving: true, clock, pos: from + travelled(length, speed, accel, clock), hold: false };
}

function advance(train: Train, stops: number[], dt: number, speed: number, dwell: number, onArrive: (index: number) => void) {
  if (train.hold || stops.length < 2) return;
  const accel = accelFor(speed);
  train.clock += dt;
  for (let guard = 0; guard < 4; guard++) {
    if (!train.moving) {
      if (train.clock < dwell) return;
      train.clock -= dwell;
      let next = train.at + train.dir;
      if (next < 0 || next >= stops.length) {
        train.dir = (-train.dir) as Side;
        next = train.at + train.dir;
      }
      train.to = next;
      train.moving = true;
    }
    const from = stops[train.at]!;
    const to = stops[train.to]!;
    const length = Math.abs(to - from);
    const total = profile(length, speed, accel).total;
    if (train.clock < total) {
      train.pos = from + Math.sign(to - from) * travelled(length, speed, accel, train.clock);
      return;
    }
    train.clock -= total;
    train.at = train.to;
    train.pos = to;
    train.moving = false;
    onArrive(train.at);
  }
}

function place(anchor: Pt, w: number, h: number, gap: number, boxes: Box[], vertical: "above" | "below", horizontal: "right" | "left", avoid: Pt[] = []) {
  const sides = [vertical, vertical === "above" ? "below" : "above", horizontal, horizontal === "right" ? "left" : "right"] as const;
  for (const box of boxes) {
    let best = null as Spot | null;
    let bestCover = Infinity;
    for (const side of sides) {
      let spot = null as Spot | null;
      if (side === "above" || side === "below") {
        const x = clamp(anchor.x - w / 2, box.l, box.r - w);
        const y = side === "above" ? anchor.y - gap - h : anchor.y + gap;
        if (y >= box.t && y + h <= box.b && box.r - box.l >= w) spot = { x, y, side };
      } else {
        const y = clamp(anchor.y - h / 2, box.t, box.b - h);
        const x = side === "right" ? anchor.x + gap : anchor.x - gap - w;
        if (x >= box.l && x + w <= box.r && box.b - box.t >= h) spot = { x, y, side };
      }
      if (!spot) continue;
      const cover = polylineCover(avoid, { l: spot.x - 4, t: spot.y - 4, r: spot.x + w + 4, b: spot.y + h + 4 });
      if (cover < bestCover - 8) {
        best = spot;
        bestCover = cover;
      }
    }
    if (best) return best;
  }
  const outer = boxes[boxes.length - 1] ?? { l: 0, t: 0, r: w, b: h };
  return { x: clamp(anchor.x - w / 2, outer.l, outer.r - w), y: clamp(anchor.y - gap - h, outer.t, outer.b - h), side: "above" as const };
}

function boundsFor(stage: HTMLElement): Box[] {
  const s = stage.getBoundingClientRect();
  const root = stage.closest("[data-slot=metro-map-gallery]")?.getBoundingClientRect() ?? s;
  const loose = { l: root.left - s.left + 8, t: root.top - s.top + 8, r: root.right - s.left - 8, b: root.bottom - s.top - 8 };
  const wrap = stage.parentElement?.getBoundingClientRect() ?? s;
  const tight = { l: Math.max(loose.l, -10), t: Math.max(loose.t, Math.min(-14, wrap.top - s.top)), r: Math.min(loose.r, s.width + 10), b: Math.min(loose.b, Math.max(s.height + 14, wrap.bottom - s.top)) };
  return [tight, loose];
}

function segmentCover(a: Pt, b: Pt, box: Box) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edge = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };
  if (!edge(-dx, a.x - box.l) || !edge(dx, box.r - a.x) || !edge(-dy, a.y - box.t) || !edge(dy, box.b - a.y)) return 0;
  return Math.max(0, t1 - t0) * Math.hypot(dx, dy);
}

function polylineCover(points: Pt[], box: Box) {
  let sum = 0;
  for (let i = 0; i + 1 < points.length; i++) sum += segmentCover(points[i]!, points[i + 1]!, box);
  return sum;
}

function labelSpots(st: StationGeo, ink: number): LabelSpot[] {
  const offset = 9 * ink + 8;
  if (st.out) return [{ dx: st.out.x, dy: st.out.y, offset: offset + 2, chip: true }];
  return [
    { dx: st.nx * st.side, dy: st.ny * st.side, offset, chip: false },
    { dx: -st.nx * st.side, dy: -st.ny * st.side, offset, chip: false },
  ];
}

function overlaps(a: Box, b: Box) {
  return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
}

function alignFor(dx: number, dy: number) {
  const ax = Math.abs(dx) < 0.3 ? -0.5 : dx > 0 ? 0 : -1;
  const ay = Math.abs(dy) < 0.3 ? -0.5 : dy > 0 ? 0 : -1;
  return { ax, ay };
}

export function MetroMapGallery({
  items,
  lines = [],
  eyebrow,
  heading,
  caption,
  trainSpeed = 60,
  dwell = 1100,
  autoplay = false,
  interval = 2600,
  active: activeProp,
  onActiveChange,
  open: openProp,
  onOpenChange,
  labels = DEFAULT_LABELS,
  className,
  ...rest
}: MetroMapGalleryProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const trainRefs = React.useRef([] as (SVGGElement | null)[]);
  const pulseRefs = React.useRef({} as { [id: string]: SVGCircleElement | null });
  const buttonRefs = React.useRef({} as { [id: string]: HTMLButtonElement | null });
  const labelRefs = React.useRef({} as { [id: string]: HTMLSpanElement | null });
  const trains = React.useRef([] as (Train | null)[]);
  const press = React.useRef(null as { id: string; type: string; at: number } | null);
  const swipe = React.useRef({ id: -1, x: 0, y: 0, moved: false });
  const hovered = React.useRef(null as string | null);
  const viaHover = React.useRef(false);
  const lastRequest = React.useRef(undefined as string | null | undefined);
  const bubbleKey = React.useRef(0);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const [reduced, setReduced] = React.useState(false);
  const [activeState, setActiveState] = React.useState(null as string | null);
  const [openState, setOpenState] = React.useState(null as string | null);
  const [focusId, setFocusId] = React.useState(null as string | null);
  const [playing, setPlaying] = React.useState(autoplay);
  const [bubbles, setBubbles] = React.useState([] as BubbleItem[]);
  const [leaving, setLeaving] = React.useState(null as string | null);
  const [labelLayout, setLabelLayout] = React.useState({} as LabelLayout);

  const controlled = activeProp !== undefined;
  const shown = controlled ? activeProp : activeState;
  const openId = openProp !== undefined ? openProp : openState;
  const orientation: Orientation = size.w > 0 && size.w < PORTRAIT_BELOW ? "portrait" : "landscape";
  const view = VIEW[orientation];
  const scale = size.w ? size.w / view.w : 0.6;
  const ink = clamp(0.62 / scale, 1, 1.7);

  const lineCount = Math.min(MAX_LINES, Math.max(lines.length, 0, ...items.map((station) => Math.floor(station.line) + 1)));
  const groups = React.useMemo(() => {
    const out = Array.from({ length: lineCount }, () => [] as { station: MetroStation; key: number }[]);
    items.forEach((station) => {
      const n = clamp(Math.floor(station.line) || 0, 0, Math.max(0, lineCount - 1));
      const list = out[n];
      if (list) list.push({ station, key: station.order ?? list.length });
    });
    return out.map((list) => list.map((entry, i) => ({ ...entry, i })).sort((a, b) => a.key - b.key || a.i - b.i).map((entry) => entry.station));
  }, [items, lineCount]);
  const geometry = React.useMemo(() => buildGeometry(orientation, groups, lines), [orientation, groups, lines]);
  const sequence = React.useMemo(() => geometry.lines.flatMap((line) => line.stations.map((st) => st.id)), [geometry]);
  const firstId = sequence[0] ?? null;
  const tabStop = (focusId && geometry.byId[focusId] ? focusId : null) ?? (shown && geometry.byId[shown] ? shown : null) ?? firstId;
  const activeGeo = shown ? geometry.byId[shown] ?? null : null;
  const openGeo = openId ? geometry.byId[openId] ?? null : null;

  const callbacks = React.useRef({ onActiveChange, onOpenChange });
  callbacks.current = { onActiveChange, onOpenChange };
  const live = React.useRef({ shown, openId, reduced, controlled, openControlled: openProp !== undefined, geometry });
  live.current = { shown, openId, reduced, controlled, openControlled: openProp !== undefined, geometry };

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => setPlaying(autoplay), [autoplay]);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setSize((old) => (old.w === stage.clientWidth && old.h === stage.clientHeight ? old : { w: stage.clientWidth, h: stage.clientHeight }));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const setShown = React.useCallback((id: string | null) => {
    if (lastRequest.current === id && (live.current.controlled || live.current.shown === id)) return;
    lastRequest.current = id;
    if (!live.current.controlled) setActiveState(id);
    callbacks.current.onActiveChange?.(id);
  }, []);

  const requestOpen = React.useCallback((id: string | null) => {
    if (!live.current.openControlled) setOpenState(id);
    callbacks.current.onOpenChange?.(id);
  }, []);

  const stop = React.useCallback(() => setPlaying(false), []);

  React.useEffect(() => {
    if (!playing || reduced || openId !== null || sequence.length === 0) return;
    let timer = window.setTimeout(function advanceAutoplay() {
      const current = live.current.shown;
      const index = current === null ? 0 : (sequence.indexOf(current) + 1) % sequence.length;
      setShown(sequence[index] ?? null);
      timer = window.setTimeout(advanceAutoplay, interval);
    }, live.current.shown === null ? START_DELAY : interval);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, openId, sequence, interval, setShown]);

  const [previousShown, setPreviousShown] = React.useState(shown);
  if (previousShown !== shown) {
    setPreviousShown(shown);
    setLeaving(previousShown && !shown && !reduced ? previousShown : null);
  }
  React.useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), 180);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  React.useEffect(() => {
    if (shown) setBubbles((list) => (list.some((bubble) => bubble.id === shown) ? list.filter((bubble) => bubble.id !== shown) : list));
  }, [shown]);

  const paintTrain = React.useCallback((n: number) => {
    const node = trainRefs.current[n];
    const train = trains.current[n];
    const line = live.current.geometry.lines[n];
    if (!node || !train || !line) return;
    const p = pointAt(line.route, train.pos);
    node.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${((p.angle * 180) / Math.PI).toFixed(2)})`);
    node.style.setProperty("--t", (line.route.length ? train.pos / line.route.length : 0).toFixed(4));
    node.setAttribute("data-state", train.hold ? "held" : train.moving ? "moving" : "dwell");
  }, []);

  const arrive = React.useCallback((n: number, index: number) => {
    const st = live.current.geometry.lines[n]?.stations[index];
    if (!st || live.current.reduced) return;
    const pulse = pulseRefs.current[st.id];
    pulse?.animate([{ transform: "scale(1)", opacity: 0.8 }, { transform: "scale(2.8)", opacity: 0 }], { duration: 900, easing: "cubic-bezier(.2,.7,.3,1)" });
    const focus = live.current.shown ? live.current.geometry.byId[live.current.shown] : null;
    if (focus && (focus.id === st.id || focus.line !== st.line)) return;
    const key = ++bubbleKey.current;
    setBubbles((list) => [...list.filter((bubble) => bubble.id !== st.id), { key, id: st.id }]);
  }, []);

  React.useEffect(() => {
    trains.current = geometry.lines.map((line, n) => firstTrain(n, line.stations.map((st) => st.distance), trainSpeed, live.current.reduced));
    geometry.lines.forEach((_, n) => paintTrain(n));
    setBubbles([]);
  }, [geometry, trainSpeed, paintTrain]);

  React.useEffect(() => {
    const states = trains.current;
    const held = openId ? geometry.byId[openId] ?? null : null;
    states.forEach((train, n) => {
      if (!train) return;
      const holding = !!held && held.line === n;
      if (holding && held) {
        train.at = held.index;
        train.to = held.index;
        train.pos = held.distance;
        train.moving = false;
        train.clock = 0;
      } else if (train.hold) {
        train.clock = 0;
      }
      if (reduced && !holding && train.moving) {
        train.at = train.to;
        train.pos = geometry.lines[n]?.stations[train.at]?.distance ?? train.pos;
        train.moving = false;
      }
      train.hold = holding;
      paintTrain(n);
    });
    if (reduced || trainSpeed <= 0 || openId !== null) return;
    const stops = geometry.lines.map((line) => line.stations.map((st) => st.distance));
    let raf = 0;
    let last = 0;
    let visible = true;
    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      states.forEach((train, n) => {
        if (!train) return;
        advance(train, stops[n] ?? [], dt, trainSpeed, Math.max(0, dwell) / 1000, (index) => arrive(n, index));
        paintTrain(n);
      });
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const halt = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? halt() : start());
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) start();
      else halt();
    });
    if (observer && stageRef.current) observer.observe(stageRef.current);
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      halt();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [geometry, reduced, trainSpeed, dwell, openId, paintTrain, arrive]);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !size.w || !size.h) return;
    let cancelled = false;
    const resolve = () => {
      if (cancelled) return;
      const kx = size.w / geometry.w;
      const ky = size.h / geometry.h;
      const dotR = Math.max(5, 9 * ink * kx) + 2;
      const half = (14 * ink * kx) / 2 + 1;
      const stations = geometry.lines.flatMap((line) => line.stations);
      const dots = stations.map((st) => ({ id: st.id, box: { l: st.x * kx - dotR, t: st.y * ky - dotR, r: st.x * kx + dotR, b: st.y * ky + dotR } }));
      const paths = geometry.lines.map((line) => line.route.points.map((point) => ({ x: point.x * kx, y: point.y * ky })));
      const order = [...stations].sort((a, b) => Number(b.terminus) - Number(a.terminus) || a.line - b.line || a.index - b.index);
      const placedBoxes = [] as Box[];
      const next: LabelLayout = {};
      for (const st of order) {
        const node = labelRefs.current[st.id];
        if (!node) continue;
        const w = node.offsetWidth;
        const h = node.offsetHeight;
        const spots = labelSpots(st, ink);
        const boxFor = (spot: LabelSpot, slide: number) => {
          const { ax, ay } = alignFor(spot.dx, spot.dy);
          const along = slide * w * 0.38;
          const x0 = (st.x + spot.dx * spot.offset) * kx + ax * w - spot.dy * along;
          const y = (st.y + spot.dy * spot.offset) * ky + ay * h + spot.dx * along;
          const sx = ax === -0.5 ? clamp(0, 4 - x0, size.w - 4 - (x0 + w)) - spot.dy * along : -spot.dy * along;
          const x = x0 + (sx + spot.dy * along);
          return { box: { l: x - 2, t: y - 1, r: x + w + 2, b: y + h + 1 }, sx, sy: spot.dx * along };
        };
        const tries = spots.flatMap((spot, i) => (spot.chip ? [{ i, slide: 0 }] : [0, 1, -1].map((slide) => ({ i, slide }))));
        tries.sort((a, b) => Math.abs(a.slide) - Math.abs(b.slide) || a.i - b.i);
        const free = (box: Box) =>
          box.l >= -12 && box.r <= size.w + 12 && box.t >= -26 && box.b <= size.h + 26 &&
          !placedBoxes.some((other) => overlaps(box, other)) &&
          !dots.some((dot) => dot.id !== st.id && overlaps(box, dot.box)) &&
          paths.every((path) => polylineCover(path, { l: box.l - half, t: box.t - half, r: box.r + half, b: box.b + half }) === 0);
        let pick = null as { i: number; box: Box; sx: number; sy: number } | null;
        for (const attempt of tries) {
          const spot = boxFor(spots[attempt.i]!, attempt.slide);
          if (free(spot.box)) {
            pick = { i: attempt.i, ...spot };
            break;
          }
        }
        if (!pick && st.terminus) pick = { i: 0, ...boxFor(spots[0]!, 0) };
        if (pick) placedBoxes.push(pick.box);
        next[st.id] = pick ? { spot: pick.i, sx: Math.round(pick.sx), sy: Math.round(pick.sy) } : { spot: -1, sx: 0, sy: 0 };
      }
      setLabelLayout((old) => {
        const keys = Object.keys(next);
        const same = keys.length === Object.keys(old).length && keys.every((key) => old[key]?.spot === next[key]?.spot && old[key]?.sx === next[key]?.sx && old[key]?.sy === next[key]?.sy);
        return same ? old : next;
      });
    };
    resolve();
    document.fonts?.ready.then(resolve).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [geometry, size.w, size.h, ink]);

  const previousOpen = React.useRef(openId);
  React.useEffect(() => {
    const before = previousOpen.current;
    previousOpen.current = openId;
    if (before && !openId) buttonRefs.current[before]?.focus({ preventScroll: true });
  }, [openId]);

  const openStation = (id: string) => {
    stop();
    setFocusId(id);
    setShown(id);
    requestOpen(id);
  };

  const neighbour = (id: string | null, key: string) => {
    const st = id ? geometry.byId[id] : null;
    if (!st) return firstId;
    const line = geometry.lines[st.line];
    if (!line) return null;
    if (key === "ArrowRight") return line.stations[Math.min(st.count - 1, st.index + 1)]?.id ?? null;
    if (key === "ArrowLeft") return line.stations[Math.max(0, st.index - 1)]?.id ?? null;
    if (key === "Home") return line.stations[0]?.id ?? null;
    if (key === "End") return line.stations[st.count - 1]?.id ?? null;
    const step = key === "ArrowDown" ? 1 : -1;
    for (let n = st.line + step; n >= 0 && n < geometry.lines.length; n += step) {
      const other = geometry.lines[n]!.stations;
      if (other.length === 0) continue;
      return [...other].sort((a, b) => distance(a, st) - distance(b, st))[0]!.id;
    }
    return st.id;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const from = (event.target as HTMLElement).closest("[data-station]")?.getAttribute("data-station") ?? tabStop;
    const next = neighbour(from, event.key);
    event.preventDefault();
    if (!next) return;
    stop();
    setFocusId(next);
    setShown(next);
    buttonRefs.current[next]?.focus({ preventScroll: true });
  };

  const stepBy = (delta: number) => {
    const current = shown ?? focusId;
    const index = current ? sequence.indexOf(current) : -1;
    const next = sequence[clamp(index < 0 ? 0 : index + delta, 0, sequence.length - 1)];
    if (!next) return;
    setFocusId(next);
    setShown(next);
  };

  const step = (delta: number) => {
    if (!openGeo) return;
    const line = geometry.lines[openGeo.line];
    const next = line?.stations[clamp(openGeo.index + delta, 0, openGeo.count - 1)];
    if (!next || next.id === openGeo.id) return;
    setFocusId(next.id);
    setShown(next.id);
    requestOpen(next.id);
  };

  const origin = () => {
    const card = stageRef.current?.querySelector("[data-card]:not([data-leaving])");
    const rect = card?.getBoundingClientRect();
    if (rect && rect.width > 0) return rect;
    return openId ? buttonRefs.current[openId]?.getBoundingClientRect() ?? null : null;
  };

  const lineOrder = geometry.lines.map((line) => line.index).sort((a, b) => Number(a === activeGeo?.line) - Number(b === activeGeo?.line));
  const kx = size.w ? size.w / geometry.w : 0;
  const ky = size.h ? size.h / geometry.h : 0;
  const labelSize = clamp(8.5 + 3.4 * scale, 10, 12.5);
  const reserve = orientation === "landscape" && size.h ? Math.round(clamp(190 - size.h * 0.55, 0, 72)) : 0;
  const cardGeo = activeGeo ?? (leaving ? geometry.byId[leaving] ?? null : null);
  const captionText = activeGeo
    ? `${activeGeo.station.title} — ${geometry.lines[activeGeo.line]?.name ?? ""} ${labels.line}، ${labels.station} ${activeGeo.index + 1} من ${activeGeo.count}${activeGeo.station.date ? ` (${activeGeo.station.date})` : ""}`
    : caption ?? "";

  return (
    <section
      {...rest}
      data-slot="metro-map-gallery"
      data-mode={orientation}
      data-active={shown ?? ""}
      data-open={openId ?? ""}
      className={cx("relative isolate w-full overflow-hidden bg-background text-foreground", className)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(closest-side at 50% 54%, color-mix(in oklab, var(--color-foreground) 5%, transparent), transparent)" }} />
      {(eyebrow || heading) && (
        <header className="relative z-10 flex flex-col items-center gap-2 px-6 pt-7 text-center">
          {eyebrow && <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>}
          {heading && <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-[30px]">{heading}</h2>}
        </header>
      )}

      {/* dir="ltr" keeps the coordinate system exact across SVG and positioned points */}
      <div data-stage-wrap dir="ltr" className="relative z-20 px-4 sm:px-8" style={{ paddingTop: 20 + reserve, paddingBottom: reserve }}>
        <div
          ref={stageRef}
          data-stage
          role="group"
          aria-roledescription="metro map"
          aria-label={heading ?? "Cairo Metro map"}
          aria-describedby={`${uid}-caption`}
          className="relative mx-auto w-full max-w-[1180px] touch-pan-y select-none"
          style={{ aspectRatio: `${view.w} / ${view.h}` }}
          onKeyDown={onKeyDown}
          onPointerDown={(event) => {
            stop();
            if (event.pointerType === "mouse") return;
            swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
          }}
          onPointerUp={(event) => {
            const s = swipe.current;
            if (s.id !== event.pointerId) return;
            s.id = -1;
            const dx = event.clientX - s.x;
            const dy = event.clientY - s.y;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
              s.moved = true;
              stepBy(dx < 0 ? 1 : -1);
            }
          }}
          onPointerCancel={() => {
            swipe.current.id = -1;
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "mouse" || !viaHover.current || live.current.openId !== null) return;
            viaHover.current = false;
            hovered.current = null;
            if (!stageRef.current?.querySelector("[data-station]:focus-visible")) setShown(null);
          }}
          onClick={(event) => {
            if (swipe.current.moved) {
              swipe.current.moved = false;
              return;
            }
            if (!(event.target as HTMLElement).closest("[data-station]")) setShown(null);
          }}
          onBlur={(event) => {
            const next = event.relatedTarget as Node | null;
            if (next && stageRef.current?.contains(next)) return;
            if (hovered.current === null && live.current.openId === null && !(next instanceof Element && next.closest("[role=dialog]"))) setShown(null);
          }}
        >
          <svg aria-hidden="true" viewBox={`0 0 ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full overflow-visible text-foreground">
            <defs>
              <pattern id={`${uid}-grid`} width={40} height={40} patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth={1} />
              </pattern>
              <radialGradient id={`${uid}-fade`}>
                <stop offset="0.55" stopColor="currentColor" stopOpacity={1} />
                <stop offset="1" stopColor="currentColor" stopOpacity={0} />
              </radialGradient>
              <mask id={`${uid}-mask`} style={{ maskType: "alpha" }}>
                <rect width={view.w} height={view.h} fill={`url(#${uid}-fade)`} />
              </mask>
            </defs>
            <rect width={view.w} height={view.h} fill={`url(#${uid}-grid)`} mask={`url(#${uid}-mask)`} className="opacity-[0.07] dark:opacity-[0.09]" />
            {lineOrder.map((n) => {
              const line = geometry.lines[n]!;
              const dim = activeGeo !== null && activeGeo.line !== n;
              return (
                <g
                  key={n}
                  data-line-group={n}
                  className={cx(!reduced && "transition-opacity duration-200")}
                  style={{ opacity: dim ? 0.35 : 1 }}
                >
                  {/* Outer casing */}
                  <path
                    d={line.route.d}
                    fill="none"
                    className="stroke-track-casing"
                    strokeWidth={20 * ink}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* The Black Railway Track (كل السكك باللون الأسود) */}
                  <path
                    data-line-path={n}
                    data-route={line.route.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    d={line.route.d}
                    fill="none"
                    className="stroke-track-black"
                    strokeWidth={13 * ink}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Roundels */}
                  {line.roundels.map((p, i) => (
                    <g key={i} transform={`translate(${round(p.x)} ${round(p.y)})`}>
                      <circle r={15 * ink} className="fill-background stroke-station-dot" strokeWidth={3.2 * ink} />
                      <text textAnchor="middle" dominantBaseline="central" fontSize={15 * ink} fontWeight={700} className="fill-foreground">
                        {n + 1}
                      </text>
                    </g>
                  ))}
                  {/* Stations */}
                  {line.stations.map((st) => {
                    const on = shown === st.id;
                    return (
                      <g key={st.id} transform={`translate(${round(st.x)} ${round(st.y)})`}>
                        <circle
                          ref={(node) => {
                            pulseRefs.current[st.id] = node;
                          }}
                          data-pulse={st.id}
                          r={9 * ink}
                          fill="none"
                          className="stroke-station-dot"
                          strokeWidth={3 * ink}
                          opacity={0}
                          style={{ transformBox: "fill-box", transformOrigin: "center" }}
                        />
                        <circle
                          data-ring={st.id}
                          r={(on ? 11 : 9) * ink}
                          className="fill-background stroke-station-dot"
                          strokeWidth={(on ? 5 : st.terminus ? 3.4 : 2.5) * ink}
                        />
                      </g>
                    );
                  })}
                  {/* Train */}
                  {line.stations.length > 0 && (
                    <g
                      ref={(node) => {
                        trainRefs.current[n] = node;
                      }}
                      data-train={n}
                      className="cursor-pointer"
                    >
                      {/* Train car body: White in light mode, Black in dark mode */}
                      <rect
                        x={-20 * ink}
                        y={-7.5 * ink}
                        width={40 * ink}
                        height={15 * ink}
                        rx={7.5 * ink}
                        className="metro-train-body"
                        strokeWidth={2.4 * ink}
                        paintOrder="stroke"
                      />
                      {/* Train windows */}
                      {[-10, 0, 10].map((dx) => (
                        <rect
                          key={dx}
                          x={(dx - 3) * ink}
                          y={-2.6 * ink}
                          width={6 * ink}
                          height={5.2 * ink}
                          rx={1.6 * ink}
                          className="metro-train-window"
                        />
                      ))}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {geometry.lines.map((line) => {
            const dim = activeGeo !== null && activeGeo.line !== line.index;
            return (
              <div
                key={line.index}
                role="group"
                aria-label={`${line.name} ${labels.line.toLowerCase()}`}
                data-line-stations={line.index}
                className={cx("pointer-events-none absolute inset-0", !reduced && "transition-opacity duration-200")}
                style={{ opacity: dim ? 0.3 : 1 }}
              >
                {line.stations.map((st) => {
                  const layout = labelLayout[st.id];
                  const spots = labelSpots(st, ink);
                  const spot = spots[layout && layout.spot >= 0 ? layout.spot : 0] ?? spots[0]!;
                  const hidden = (layout?.spot === -1 && shown !== st.id) || (shown === st.id && size.w > 0);
                  const { ax, ay } = alignFor(spot.dx, spot.dy);
                  const on = shown === st.id;
                  return (
                    <React.Fragment key={st.id}>
                      <span
                        ref={(node) => {
                          labelRefs.current[st.id] = node;
                        }}
                        aria-hidden="true"
                        data-label={st.id}
                        data-hidden={hidden || undefined}
                        dir="rtl"
                        className={cx(
                          "absolute block w-max leading-tight select-none",
                          orientation === "portrait" ? "max-w-[7rem]" : "max-w-[10rem]",
                          ax === -0.5 ? "text-center" : ax === 0 ? "text-left" : "text-right",
                          st.terminus || on ? "font-bold text-foreground" : "font-medium text-foreground/80",
                          hidden && "invisible",
                        )}
                        style={{
                          left: `${((st.x + spot.dx * spot.offset) / view.w) * 100}%`,
                          top: `${((st.y + spot.dy * spot.offset) / view.h) * 100}%`,
                          transform: `translate(calc(${ax * 100}% + ${layout?.sx ?? 0}px), calc(${ay * 100}% + ${layout?.sy ?? 0}px))`,
                          fontSize: labelSize,
                        }}
                      >
                        {spot.chip && (
                          <span className="ml-1 inline-flex size-[1.45em] items-center justify-center rounded-full border-2 border-foreground bg-background align-[-0.3em] text-[0.85em] font-bold text-foreground">
                            <span>{line.index + 1}</span>
                          </span>
                        )}
                        {st.station.title}
                      </span>
                      <button
                        ref={(node) => {
                          buttonRefs.current[st.id] = node;
                        }}
                        type="button"
                        data-station={st.id}
                        data-line={st.line}
                        data-order={st.index}
                        data-t={st.t.toFixed(4)}
                        tabIndex={st.id === tabStop ? 0 : -1}
                        aria-label={`${st.station.title}، ${line.name}، ${labels.station} ${st.index + 1} من ${st.count}`}
                        aria-current={on ? "location" : undefined}
                        aria-haspopup="dialog"
                        className="group pointer-events-auto absolute size-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none"
                        style={{ left: `${(st.x / view.w) * 100}%`, top: `${(st.y / view.h) * 100}%`, zIndex: on ? 3 : 1 }}
                        onPointerEnter={(event) => {
                          if (event.pointerType !== "mouse") return;
                          stop();
                          hovered.current = st.id;
                          viaHover.current = true;
                          flushSync(() => setShown(st.id));
                        }}
                        onPointerLeave={(event) => {
                          if (event.pointerType !== "mouse") return;
                          if (hovered.current === st.id) hovered.current = null;
                        }}
                        onPointerDown={(event) => {
                          press.current = { id: st.id, type: event.pointerType, at: performance.now() };
                        }}
                        onFocus={() => {
                          setFocusId(st.id);
                          if (press.current && performance.now() - press.current.at < 800) return;
                          stop();
                          setShown(st.id);
                        }}
                        onClick={(event) => {
                          const pressed = press.current;
                          press.current = null;
                          if (swipe.current.moved) return;
                          event.stopPropagation();
                          if (event.detail !== 0 && pressed && pressed.type !== "mouse" && live.current.shown !== st.id) {
                            stop();
                            setFocusId(st.id);
                            setShown(st.id);
                            return;
                          }
                          openStation(st.id);
                        }}
                      >
                        <span aria-hidden="true" className="absolute inset-[7px] rounded-full ring-ring ring-offset-2 ring-offset-background group-focus-visible:ring-2" />
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}

          {size.w > 0 &&
            bubbles.map((bubble) => {
              const st = geometry.byId[bubble.id];
              if (!st) return null;
              return (
                <Bubble
                  key={bubble.key}
                  station={st}
                  anchor={{ x: st.x * kx, y: st.y * ky }}
                  ring={9 * ink * kx}
                  stageRef={stageRef}
                  onDone={() => setBubbles((list) => list.filter((item) => item.key !== bubble.key))}
                />
              );
            })}

          {size.w > 0 && cardGeo && (
            <Card
              key={cardGeo.id}
              station={cardGeo}
              line={geometry.lines[cardGeo.line]!}
              anchor={{ x: cardGeo.x * kx, y: cardGeo.y * ky }}
              ring={11 * ink * kx}
              center={{ x: size.w / 2, y: size.h / 2 }}
              avoid={(geometry.lines[cardGeo.line]?.route.points ?? []).map((point) => ({ x: point.x * kx, y: point.y * ky }))}
              stageRef={stageRef}
              reduced={reduced}
              leaving={!activeGeo}
            />
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 px-6 pb-7 pt-5 text-center">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label={`خطوط المترو`}>
          {geometry.lines.map((line) => (
            <li key={line.index} className={cx("flex items-center gap-2 text-xs", !reduced && "transition-opacity duration-200", activeGeo && activeGeo.line !== line.index && "opacity-40")}>
              <span aria-hidden="true" className="relative h-1.5 w-6 rounded-full bg-foreground">
                <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-background" />
              </span>
              <span className="font-semibold text-foreground">{line.name}</span>
              <span className="tabular-nums text-muted-foreground">({line.stations.length} محطات رئيسية)</span>
            </li>
          ))}
        </ul>
        <p id={`${uid}-caption`} data-caption aria-live="polite" className="line-clamp-2 h-[2.25rem] max-w-[46ch] text-[13px] leading-[1.125rem] text-muted-foreground">
          {captionText}
        </p>
      </div>

      {openGeo && (
        <StationDialog
          uid={uid}
          station={openGeo}
          line={geometry.lines[openGeo.line]!}
          labels={labels}
          reduced={reduced}
          onStep={step}
          onClose={() => requestOpen(null)}
        />
      )}
    </section>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0">
      <path d={d} />
    </svg>
  );
}

function Bubble({ station, anchor, ring, stageRef, onDone }: {
  station: StationGeo;
  anchor: Pt;
  ring: number;
  stageRef: { current: HTMLDivElement | null };
  onDone: () => void;
}) {
  const outer = React.useRef(null as HTMLDivElement | null);
  const inner = React.useRef(null as HTMLDivElement | null);
  const tail = React.useRef(null as HTMLSpanElement | null);
  const done = React.useRef(onDone);
  done.current = onDone;
  React.useEffect(() => {
    const node = outer.current;
    const body = inner.current;
    const stage = stageRef.current;
    if (!node || !body || !stage) return;
    const w = body.offsetWidth;
    const h = body.offsetHeight;
    const spot = place(anchor, w, h, ring + 9, boundsFor(stage), "above", "right");
    node.style.left = `${spot.x}px`;
    node.style.top = `${spot.y}px`;
    const below = spot.side === "below";
    const tx = clamp(anchor.x - spot.x, 12, w - 12);
    if (tail.current) {
      tail.current.style.left = `${tx}px`;
      tail.current.style.top = below ? "-4px" : `${h - 5}px`;
    }
    body.style.transformOrigin = `${tx}px ${below ? 0 : h}px`;
    const card = stage.querySelector("[data-card]:not([data-leaving]) > div")?.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const mine = { l: spot.x + s.left, t: spot.y + s.top, r: spot.x + s.left + w, b: spot.y + s.top + h };
    if (card && overlaps(mine, { l: card.left, t: card.top, r: card.right, b: card.bottom })) {
      done.current();
      return;
    }
    const lift = below ? -6 : 6;
    const animation = body.animate(
      [
        { opacity: 0, transform: `translateY(${lift}px) scale(0.7)`, easing: "cubic-bezier(.3,.7,.3,1)" },
        { opacity: 1, transform: "translateY(0) scale(1.04)", offset: 0.18, easing: "ease-out" },
        { opacity: 1, transform: "translateY(0) scale(1)", offset: 0.28 },
        { opacity: 1, transform: "translateY(0) scale(1)", offset: 0.8, easing: "ease-in" },
        { opacity: 0, transform: `translateY(${-lift / 2}px) scale(0.92)` },
      ],
      { duration: BUBBLE_MS, fill: "forwards" },
    );
    animation.onfinish = () => done.current();
    return () => animation.cancel();
  }, [anchor.x, anchor.y, ring, stageRef]);
  return (
    <div ref={outer} data-bubble={station.id} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20">
      <div ref={inner} dir="rtl" className="relative flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground opacity-0 shadow-md whitespace-nowrap">
        <span className="size-2 rounded-full bg-foreground" />
        <span>{station.station.title}</span>
        <span ref={tail} className="absolute size-2 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" />
      </div>
    </div>
  );
}

function Card({ station, line, anchor, ring, center, avoid, stageRef, reduced, leaving }: {
  station: StationGeo;
  line: LineGeo;
  anchor: Pt;
  ring: number;
  center: Pt;
  avoid: Pt[];
  stageRef: { current: HTMLDivElement | null };
  reduced: boolean;
  leaving: boolean;
}) {
  const outer = React.useRef(null as HTMLDivElement | null);
  const inner = React.useRef(null as HTMLDivElement | null);
  const tail = React.useRef(null as HTMLSpanElement | null);
  const avoidRef = React.useRef(avoid);
  avoidRef.current = avoid;
  React.useEffect(() => {
    const node = outer.current;
    const body = inner.current;
    const stage = stageRef.current;
    if (!node || !body || !stage) return;
    const w = body.offsetWidth;
    const h = body.offsetHeight;
    const spot = place(anchor, w, h, ring + 10, boundsFor(stage), anchor.y > center.y ? "above" : "below", anchor.x < center.x ? "right" : "left", avoidRef.current);
    node.style.left = `${spot.x}px`;
    node.style.top = `${spot.y}px`;
    const t = tail.current;
    let origin = `${w / 2}px ${h}px`;
    if (t) {
      t.className = t.className.replace(/ tail-\w+/g, "");
      if (spot.side === "above" || spot.side === "below") {
        const tx = clamp(anchor.x - spot.x, 16, w - 16);
        t.style.left = `${tx}px`;
        t.style.top = spot.side === "above" ? `${h - 6}px` : "-6px";
        origin = `${tx}px ${spot.side === "above" ? h : 0}px`;
      } else {
        const ty = clamp(anchor.y - spot.y, 16, h - 16);
        t.style.top = `${ty}px`;
        t.style.left = spot.side === "right" ? "-6px" : `${w - 6}px`;
        origin = `${spot.side === "right" ? 0 : w}px ${ty}px`;
      }
      t.dataset.side = spot.side;
    }
    node.dataset.side = spot.side;
    body.style.transformOrigin = origin;
    const covered = [] as HTMLElement[];
    if (!leaving) {
      const s = stage.getBoundingClientRect();
      const box = { l: s.left + spot.x - 4, t: s.top + spot.y - 4, r: s.left + spot.x + w + 4, b: s.top + spot.y + h + 4 };
      for (const label of stage.querySelectorAll("[data-label]")) {
        if (!(label instanceof HTMLElement) || label.dataset.label === station.id) continue;
        const r = label.getBoundingClientRect();
        if (r.width > 0 && r.left < box.r && box.l < r.right && r.top < box.b && box.t < r.bottom) {
          label.style.opacity = "0";
          covered.push(label);
        }
      }
    }
    const restore = () => covered.forEach((label) => label.style.removeProperty("opacity"));
    if (reduced || leaving) return restore;
    const animation = body.animate(
      [
        { opacity: 0, transform: "scale(0.7)" },
        { opacity: 1, transform: "scale(1.02)", offset: 0.7 },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 240, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    return () => {
      animation.cancel();
      restore();
    };
  }, [anchor.x, anchor.y, ring, center.x, center.y, stageRef, reduced, leaving, station.id]);

  const st = station.station;
  return (
    <div ref={outer} data-card={station.id} data-leaving={leaving || undefined} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30">
      <div
        ref={inner}
        dir="rtl"
        className={cx(
          "relative rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-[0_22px_44px_-18px_color-mix(in_oklab,var(--color-foreground)_45%,transparent)] dark:shadow-[0_22px_44px_-14px_color-mix(in_oklab,black_80%,transparent)]",
          leaving ? "opacity-0 transition-opacity duration-150" : "opacity-100",
        )}
        style={{ width: CARD_W }}
      >
        <span ref={tail} aria-hidden="true" className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-border bg-card [clip-path:polygon(0_0,100%_100%,0_100%)] data-[side=above]:[clip-path:polygon(100%_0,100%_100%,0_100%)] data-[side=below]:[clip-path:polygon(0_0,100%_0,0_100%)] data-[side=right]:[clip-path:polygon(0_0,0_100%,100%_100%)] data-[side=left]:[clip-path:polygon(0_0,100%_0,100%_100%)]" style={{ marginLeft: 6, marginTop: 6 }} />
        <div className="text-right">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-muted-foreground">{line.name}</span>
            <span className="size-2 rounded-full bg-foreground" />
          </div>
          <p className="text-[14px] font-extrabold leading-tight text-foreground">{st.title}</p>
          {(st.label || st.date) && (
            <p className="mt-1 text-[11px] leading-tight text-muted-foreground truncate">
              {[st.label, st.date].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StationDialog({ uid, station, line, labels, reduced, onStep, onClose }: {
  uid: string;
  station: StationGeo;
  line: LineGeo;
  labels: MetroMapGalleryLabels;
  reduced: boolean;
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const dialogRef = React.useRef(null as HTMLDivElement | null);
  const panelRef = React.useRef(null as HTMLDivElement | null);
  const closeRef = React.useRef(null as HTMLButtonElement | null);
  const closing = React.useRef(false);
  const isMountedRef = React.useRef(true);
  const titleId = `${uid}-dialog-title`;
  const st = station.station;
  const handlers = React.useRef({ onStep, onClose });
  handlers.current = { onStep, onClose };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    isMountedRef.current = true;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const panel = panelRef.current;
    const animations = [] as Animation[];
    if (!reduced && panel) {
      animations.push(panel.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: "ease-out" }));
    }
    return () => {
      isMountedRef.current = false;
      document.body.style.overflow = overflow;
      animations.forEach((animation) => animation.cancel());
    };
  }, [mounted, reduced]);

  const dismiss = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const panel = panelRef.current;
    if (!panel || reduced) {
      closing.current = false;
      handlers.current.onClose();
      return;
    }
    const animation = panel.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(8px) scale(0.98)" }], { duration: 160, easing: "ease-in", fill: "forwards" });
    animation.onfinish = () => {
      handlers.current.onClose();
      requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        animation.cancel();
        closing.current = false;
      });
    };
  }, [reduced]);

  React.useEffect(() => {
    if (!mounted) return;
    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        handlers.current.onStep(event.key === "ArrowLeft" ? 1 : -1);
        return;
      }
      if (event.key === "Tab" && !dialog.contains(event.target as Node)) {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mounted, dismiss]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const controls = [...(dialogRef.current?.querySelectorAll("button") ?? [])].filter((node) => !node.disabled);
    const head = controls[0];
    const tail = controls[controls.length - 1];
    if (!head || !tail) return;
    if (event.shiftKey && document.activeElement === head) {
      event.preventDefault();
      tail.focus();
    } else if (!event.shiftKey && document.activeElement === tail) {
      event.preventDefault();
      head.focus();
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} data-metro-dialog={station.id} dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 text-foreground sm:p-8" onKeyDown={onKeyDown}>
      <div aria-hidden="true" className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={dismiss} />
      <div ref={panelRef} className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 text-card-foreground shadow-2xl text-right">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-3 pr-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span aria-hidden="true" className="inline-flex size-6 items-center justify-center rounded-full border-2 border-foreground bg-background text-[11px] font-bold">
              <span>{line.index + 1}</span>
            </span>
            <span>{line.name}</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground pl-10">
            {labels.station} {station.index + 1} من {station.count}
          </span>
        </div>

        {/* Station title */}
        <h3 id={titleId} className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-foreground">
          {st.title}
        </h3>

        {/* Badges */}
        {(st.label || st.date) && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            {st.label && (
              <span className="rounded-full bg-muted border border-border px-3 py-1 font-semibold text-foreground">
                {st.label}
              </span>
            )}
            {st.date && (
              <span className="rounded-full bg-muted/60 border border-border/60 px-3 py-1 text-muted-foreground">
                {st.date}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {st.description && (
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mb-6">
            {st.description}
          </p>
        )}

        {/* Line stations progress */}
        <div className="my-4" aria-hidden="true">
          <div className="relative flex items-center justify-between px-3 py-3 bg-muted/40 rounded-2xl border border-border/60">
            <span className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/20" />
            {line.stations.map((other) => (
              <span
                key={other.id}
                title={other.station.title}
                className={cx(
                  "relative rounded-full transition-all",
                  other.id === station.id
                    ? "size-4.5 border-[3px] border-background bg-foreground scale-125 shadow-sm"
                    : "size-2.5 bg-foreground/40"
                )}
              />
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-dialog-step="previous"
              disabled={station.index === 0}
              onClick={() => handlers.current.onStep(-1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              <Icon d="M9 18l6-6-6-6" />
              {labels.previous}
            </button>
            <button
              type="button"
              data-dialog-step="next"
              disabled={station.index === station.count - 1}
              onClick={() => handlers.current.onStep(1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              {labels.next}
              <Icon d="M15 18l-6-6 6-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-9 items-center px-4 rounded-full bg-foreground text-background text-sm font-bold transition-opacity hover:opacity-90 cursor-pointer"
          >
            {labels.close}
          </button>
        </div>

        {/* Close button in top-left */}
        <button
          ref={closeRef}
          type="button"
          aria-label={labels.close}
          data-dialog-close
          onClick={dismiss}
          className="absolute left-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <Icon d="M18 6 6 18M6 6l12 12" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default MetroMapGallery;
