"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/*
 * Glass Reveal Component: a mark lingers against the rim of a clear glass tile,
 * the glass bends it into color via chromatic dispersion at the corners,
 * then lets go and reveals the mark.
 * Self-contained: One WebGL2 pass, no external dependencies.
 * Shader and spring timeline ported from zanwei/glass-icon-reveal (MIT).
 */

export type Look = "light" | "dark"

export interface GlassTuning {
  /** How far the slab stands above the logo, so how hard the rim bends it */
  opticalDepth: number
  /** Colour split of everything the rim draws in */
  dispersion: number
  /** Soft colour glow inside the rim */
  colorBleed: number
  doubleBevel: number
  bevelWidth: number
  /** Superellipse exponent of the tile: 2 is a circle, ~5 an app icon */
  corner: number
  cornerPull: number
  cornerWidth: number
  cornerFocus: number
  edgeSmear: number
  stretch: number
  tilt: number
  /** Ball-lens bulge of the young droplet */
  bulge: number
  specular: number
  halo: number
  shadow: number
  ripple: number
  /** Droplet spring: 0 = no overshoot */
  bounce: number
  /** Droplet spring period, seconds */
  response: number
  startSize: number
  startZoom: number
  /** Seconds the logo takes to glide out of the droplet's magnification: the stretch where the rim bends it */
  glide: number
  /** Seconds the logo stays in glass */
  present: number
  drift: number
  swell: number
  focus: number
  /** Soft band of light that crosses the glass while it holds the logo (0 = none) */
  sheen: number
  /** How far the light turns round the rim while the glass holds, radians */
  lightTurn: number
}

export interface Settings extends GlassTuning {
  tileSize: number
  logoScale: number
  finalScale: number
  logoOffset: [number, number]
  iconPlate: boolean
  keepPlate: boolean
  originalColors: boolean
  background: string
  plateColor: string
  logoColor: string
  hold: number
}

const LIGHT: Settings = {
  tileSize: 256,
  logoScale: 0.7,
  finalScale: 0.69,
  logoOffset: [0, 0],
  iconPlate: false,
  keepPlate: false,
  originalColors: false,
  opticalDepth: 1.1,
  dispersion: 1.7,
  colorBleed: 1.25,
  doubleBevel: 1,
  bevelWidth: 0.14,
  corner: 4.8,
  cornerPull: 2.1,
  cornerWidth: 2.2,
  cornerFocus: 0.58,
  edgeSmear: 2.85,
  stretch: 0,
  tilt: 0.35,
  bulge: 1,
  specular: 1,
  halo: 0,
  shadow: 1,
  ripple: 1,
  bounce: 0,
  response: 0.42,
  startSize: 0.2,
  startZoom: 2.6,
  glide: 2.3,
  present: 2.4,
  drift: 0.12,
  swell: 0.5,
  focus: 1,
  sheen: 1,
  lightTurn: 0.9,
  hold: 1,
  background: "#e9e9eb",
  plateColor: "#ffffff",
  logoColor: "#0e1428",
}

export const LOOKS: Record<Look, Settings> = {
  light: LIGHT,
  dark: {
    ...LIGHT,
    logoScale: 0.72,
    finalScale: 1,
    iconPlate: true,
    halo: 1,
    shadow: 0,
    ripple: 0.5,
    startZoom: 1.6,
    drift: 0.05,
    opticalDepth: 0.75,
    bevelWidth: 0.22,
    dispersion: 0.9,
    colorBleed: 0.45,
    corner: 5,
    cornerPull: 1.4,
    edgeSmear: 1.2,
    tilt: 0,
    cornerWidth: 1.2,
    cornerFocus: 0.4,
    background: "#000000",
    plateColor: "#05070b",
    logoColor: "#ffffff",
  },
}

/* ------------------------------------------------------------------ *
 * Logo → texture + signed distance field
 * ------------------------------------------------------------------ */
const TEX = 1024 // logo texture size
const BOX = 0.75 // share of the texture the logo fills (the rest is room for the SDF)

export interface LogoData {
  canvas: HTMLCanvasElement
  sdf: Float32Array
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("GlassIconReveal: the logo could not be loaded"))
    img.src = src
  })
}

function isMarkup(logo: string) {
  return logo.trimStart().startsWith("<")
}

// SVG markup → data URL rendered at texture size; currentColor turns white (only the shape matters).
function svgToUrl(text: string) {
  const svg = new DOMParser().parseFromString(text, "image/svg+xml").documentElement
  if (!svg || svg.nodeName.toLowerCase() !== "svg") throw new Error("GlassIconReveal: the SVG could not be read")
  let w = parseFloat(svg.getAttribute("width") || "")
  let h = parseFloat(svg.getAttribute("height") || "")
  const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number)
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) [w, h] = [vb[2], vb[3]]
  if (!(w > 0 && h > 0)) w = h = 100
  const s = TEX / Math.max(w, h)
  svg.setAttribute("width", String(Math.round(w * s)))
  svg.setAttribute("height", String(Math.round(h * s)))
  const out = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, "#ffffff")
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(out)
}

export const logoUrl = (logo: string) => (isMarkup(logo) ? svgToUrl(logo) : logo)

// Draws the source into a TEX×TEX canvas, cropped to its visible pixels and fitted into the logo box.
function fitToTexture(source: CanvasImageSource, sw: number, sh: number) {
  const tmp = document.createElement("canvas")
  tmp.width = tmp.height = TEX
  const tc = tmp.getContext("2d", { willReadFrequently: true })!
  const s0 = Math.min(TEX / sw, TEX / sh)
  const dx0 = (TEX - sw * s0) / 2
  const dy0 = (TEX - sh * s0) / 2
  tc.drawImage(source, dx0, dy0, sw * s0, sh * s0)
  const d = tc.getImageData(0, 0, TEX, TEX).data

  let opaque = true
  for (let i = 3; i < d.length; i += 4 * 97) {
    if (d[i] < 250) {
      opaque = false
      break
    }
  }
  const key = [d[0], d[1], d[2]]
  const keyAlpha = (r: number, g: number, b: number) =>
    Math.min(1, Math.max(0, (Math.hypot(r - key[0], g - key[1], b - key[2]) / 441 - 0.08) / 0.2))

  let x0 = TEX,
    y0 = TEX,
    x1 = -1,
    y1 = -1
  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const i = (y * TEX + x) * 4
      const a = opaque ? keyAlpha(d[i], d[i + 1], d[i + 2]) * 255 : d[i + 3]
      if (a > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) throw new Error("GlassIconReveal: the logo is empty")
  const bw = x1 - x0 + 1
  const bh = y1 - y0 + 1
  const s = (TEX * BOX) / Math.max(bw, bh)

  const out = document.createElement("canvas")
  out.width = out.height = TEX
  const oc = out.getContext("2d", { willReadFrequently: true })!
  oc.imageSmoothingQuality = "high"
  oc.drawImage(source, TEX / 2 - (x0 + bw / 2 - dx0) * s, TEX / 2 - (y0 + bh / 2 - dy0) * s, sw * s0 * s, sh * s0 * s)
  if (opaque) {
    const im = oc.getImageData(0, 0, TEX, TEX)
    const e = im.data
    for (let i = 0; i < e.length; i += 4) e[i + 3] = Math.round(e[i + 3] * keyAlpha(e[i], e[i + 1], e[i + 2]))
    oc.putImageData(im, 0, 0)
  }
  return out
}

// Signed distance field from alpha (TinySDF method): + outside, − inside, in texture units.
function buildSdf(canvas: HTMLCanvasElement) {
  const n = TEX * TEX
  const alpha = canvas.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, TEX, TEX).data
  const INF = 1e20
  const outer = new Float64Array(n)
  const inner = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const a = alpha[i * 4 + 3] / 255
    if (a >= 1) {
      outer[i] = 0
      inner[i] = INF
    } else if (a <= 0) {
      outer[i] = INF
      inner[i] = 0
    } else {
      const dd = 0.5 - a
      outer[i] = dd > 0 ? dd * dd : 0
      inner[i] = dd < 0 ? dd * dd : 0
    }
  }
  const f = new Float64Array(TEX)
  const z = new Float64Array(TEX + 1)
  const v = new Uint16Array(TEX)
  edt(outer, f, v, z, INF)
  edt(inner, f, v, z, INF)
  const sdf = new Float32Array(n)
  for (let i = 0; i < n; i++) sdf[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / TEX
  return sdf
}

function edt(grid: Float64Array, f: Float64Array, v: Uint16Array, z: Float64Array, INF: number) {
  for (let x = 0; x < TEX; x++) edt1d(grid, x, TEX, f, v, z, INF)
  for (let y = 0; y < TEX; y++) edt1d(grid, y * TEX, 1, f, v, z, INF)
}

function edt1d(grid: Float64Array, offset: number, stride: number, f: Float64Array, v: Uint16Array, z: Float64Array, INF: number) {
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  f[0] = grid[offset]
  for (let q = 1, k = 0, s = 0; q < TEX; q++) {
    f[q] = grid[offset + q * stride]
    const q2 = q * q
    do {
      const r = v[k]
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2
    } while (s <= z[k] && --k > -1)
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  for (let q = 0, k = 0; q < TEX; q++) {
    while (z[k + 1] < q) k++
    const r = v[k]
    const qr = q - r
    grid[offset + q * stride] = f[r] + qr * qr
  }
}

const logoCache = new Map<string, Promise<LogoData>>()

export function loadLogo(logo: string) {
  let job = logoCache.get(logo)
  if (!job) {
    job = loadImage(logoUrl(logo)).then((img) => {
      const canvas = fitToTexture(img, img.naturalWidth || TEX, img.naturalHeight || TEX)
      return { canvas, sdf: buildSdf(canvas) }
    })
    logoCache.set(logo, job)
    job.catch(() => logoCache.delete(logo))
  }
  return job
}

/* ------------------------------------------------------------------ *
 * Shader
 * ------------------------------------------------------------------ */
const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uCenter;      // device px, GL coords
uniform float uTile;       // tile size, device px
uniform sampler2D uSdf;    // signed distance, texture units, + outside
uniform sampler2D uCol;    // premultiplied colour, mipmapped
uniform float uTexSize;
uniform float uBoxFrac;

uniform float uPlateScale; // plate size relative to the tile
uniform float uShapeN;     // superellipse exponent: 2 = circle
uniform float uCornerN;    // final exponent, used by the ghost
uniform float uOptics;     // 1 = full refraction, 0 = flat
uniform float uPlateAlpha; // 1 = glass shown, 0 = bare logo
uniform float uLogoHalf;   // logo half size in plate units (zoom included)
uniform vec2 uLogoOff;     // logo centre, plate units
uniform float uBold;       // stroke swell, in logo half-size units
uniform float uBlur;       // edge softness, plate units
uniform float uFrost;      // milky lift inside a young bubble
uniform float uDome;       // lens bulge height
uniform float uDrop;       // 1 while the glass is a round droplet, 0 once it has spread into the tile
uniform float uPinch;      // the face's stretch toward its corners, at the rim
uniform float uTilt;       // extra stretch of the rising diagonal's corners (0–1)
uniform float uRim;
uniform float uHalo;
uniform float uShadow;
uniform float uGhost;
uniform float uRipR;       // ripple radius, plate sizes
uniform float uRipA;
uniform float uBare;       // 1 once the logo may show without glass (the ending)
uniform float uReach;      // the rim band's full width, plate units
uniform float uCornerPull; // how much harder the corners pull than the sides
uniform float uStreak;     // how far a corner smears content along the rim, in band widths
uniform float uWiden;      // how much wider the folding band grows toward the corners
uniform float uSlab;       // how far the slab stands above the logo, plate units
uniform float uEtaSpread;  // index spread across the spectrum (red highest)
uniform float uFocus;      // how far in along the diagonal a corner focuses, plate units
uniform float uFocusK;     // how quickly the view slides back from the focus across the band
uniform float uFocusSplit; // how much further in red meets than violet, plate units
uniform float uRimLine;    // how far across the band the sight line takes to turn in to the focus
uniform float uCornerOn;   // 0 while the glass is round, 1 once it has spread into the tile
uniform float uDissolve;   // 0 → 1 as the glass lets go of the logo
uniform float uGlow;       // colour bleed in the rim, plate units on screen
uniform float uFaceDisp;   // lateral colour across the face
uniform float uVivid;      // chroma lift of the dispersed light

uniform float uDisp;
uniform float uDouble;
uniform float uBevelW;
uniform float uSpec;
uniform float uIconPlate;
uniform float uUseColor;
uniform float uLightScene; // 1 = light backdrop, 0 = dark
uniform float uLightGlass; // the same for what the glass sits on (the plate, when there is one)
uniform float uKeep;       // 1 = the glass settles into a flat plate instead of letting go of it
uniform float uSheen;      // strength of the light band crossing the face
uniform float uSweep;      // where that band is, plate sizes along its diagonal
uniform float uLightAng;   // how far the rim light has turned, radians

uniform vec3 uBg;
uniform vec3 uPlateCol;
uniform vec3 uLogoCol;

float px; // one device pixel in plate units

vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

// aa: footprint of one screen pixel at q, plate units.
vec4 logoAt(vec2 q, float blur, float aa) {
  float L = uLogoHalf;
  float k = 0.5 * uBoxFrac / L;
  vec2 uv = vec2(0.5 + (q.x - uLogoOff.x) * k, 0.5 - (q.y - uLogoOff.y) * k);
  float d = texture(uSdf, uv).r / k;
  float w = 0.75 * aa + blur;
  float a = 1.0 - smoothstep(-w, w, d - uBold * L);
  vec3 c = uLogoCol;
  if (uUseColor > 0.5) {
    float lod = log2(max(1.0, w * k * uTexSize));
    vec4 c0 = textureLod(uCol, uv, lod);
    vec4 c1 = textureLod(uCol, uv, lod + 3.0);
    vec4 c2 = textureLod(uCol, uv, 7.0);
    c = c2.rgb / max(c2.a, 1e-4);
    c = mix(c, c1.rgb / max(c1.a, 1e-4), smoothstep(0.0, 0.06, c1.a));
    c = mix(c, c0.rgb / max(c0.a, 1e-4), smoothstep(0.02, 0.3, c0.a));
  }
  return vec4(c, a);
}

// Superellipse field. Returns signed distance (plate units, − inside); g = 1 on the rim.
float shape(vec2 p, float scale, float n, out vec2 nOut, out float g, out vec2 dg) {
  vec2 pp = p / scale;
  vec2 a = max(abs(pp), vec2(1e-6));
  g = pow(pow(a.x, n) + pow(a.y, n), 1.0 / n);
  dg = sign(pp) * pow(a, vec2(n - 1.0)) * pow(max(g, 1e-6), 1.0 - n);
  float dgl = max(length(dg), 1e-6);
  nOut = dg / dgl;
  return (g - 1.0) / dgl * scale;
}

// Curvature radius (plate units) of the shape's contour through p.
float contourRadius(vec2 p, float scale, float n) {
  vec2 a = max(abs(p / scale), vec2(1e-4));
  vec2 a1 = pow(a, vec2(n - 1.0));
  vec2 a2 = pow(a, vec2(n - 2.0));
  float k = (n - 1.0) * (a2.x * a1.y * a1.y + a2.y * a1.x * a1.x) / pow(max(dot(a1, a1), 1e-30), 1.5);
  return scale / max(k, 1e-3);
}

// Where the glass looks across rounded edge
vec2 refractSample(float x, float bwF, float eta, float R, vec2 dirOut, vec2 p, float dome, float offMul) {
  float u = clamp(1.0 - x, 0.0, 0.995);
  float th = asin(u), thr = asin(u / eta);
  float z = uSlab + bwF * sqrt(1.0 - u * u);
  float off = offMul * z * tan(th - thr);
  off = off / (1.0 + off / (6.0 * R));
  return p - (dirOut * off + p * dome) * uOptics;
}

float gauss(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
float band(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }

// Visible spectrum, red (0) to violet (1).
float bump(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
vec3 spectrum(float x) {
  return vec3(bump(x, 0.34, 0.2) + 0.08 * bump(x, 0.93, 0.05), bump(x, 0.58, 0.1), bump(x, 0.8, 0.11));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  px = 2.0 / uTile;
  vec2 p = (gl_FragCoord.xy - uCenter) * px;

  vec4 lg = logoAt(p, uBlur, px);
  vec3 plain = mix(uBg, lg.rgb, lg.a * uBare);

  vec2 nOut, dg; float g;
  float sd = shape(p, uPlateScale, uShapeN, nOut, g, dg);
  float s = -sd;
  float bw = max(uBevelW, 0.004) * uPlateScale;
  float x = clamp(s / bw, 0.0, 1.0);
  float R = contourRadius(p, uPlateScale, uShapeN);
  vec2 pq = p * p;
  float diag = 4.0 * pq.x * pq.y / max((pq.x + pq.y) * (pq.x + pq.y), 1e-6);
  float tilt = mix(1.0 - uTilt, 1.0, smoothstep(-0.02, 0.02, p.x * p.y));
  float pinchPart = uPinch * min(g * g, 1.0) * diag * diag * tilt;
  float dome = uDome * (1.0 - min(g * g, 1.0)) + pinchPart;
  vec2 dirOut = normalize(mix(nOut, p / max(length(p), 1e-4), 0.2));
  float cornerness = max(smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y), smoothstep(0.15, 0.75, diag));
  float offMul = 1.0 + 0.4 * max(uCornerPull - 1.0, 0.0) * tilt * cornerness * uCornerOn;
  vec2 focus = sign(p) * (pow(0.5, 1.0 / uShapeN) - uFocus * 0.70710678) * uPlateScale;
  float focusW = tilt * cornerness * uOptics * uCornerOn;
  float bwF = max(uReach, 0.004) * (1.0 + uWiden * tilt * cornerness * uCornerOn);
  float xf = clamp(s / bwF, 0.0, 1.0);
  vec2 qc = refractSample(xf, bwF, 1.5, R, dirOut, p, dome, offMul);
  float foot = max(max(length(dFdx(qc)), length(dFdy(qc))), 0.25 * px);

  // Backdrop: anticipation ghost, ripple, soft lift shadow and glow.
  vec3 bg = uBg;
  vec3 lift = mix(uBg + vec3(0.06), mix(uBg, vec3(1.0), 0.55), uLightScene);
  if (uGhost > 0.001) {
    vec2 gn, gdg; float gg;
    float gsd = shape(p, 1.0, uCornerN, gn, gg, gdg);
    bg = mix(bg, lift, uGhost * 0.12 * (1.0 - smoothstep(-0.16, 0.14, gsd)));
    bg *= 1.0 - uGhost * 0.03 * uLightScene * exp(-max(gsd, 0.0) / 0.12) * step(0.0, gsd);
  }
  float outside = max(sd, 0.0);
  if (uRipA > 0.001) {
    float d0 = (uRipR - 1.0) * uPlateScale;
    float rx = (sd - d0) / 0.022;
    float ring = exp(-rx * rx);
    bg += uRipA * ring * (0.04 * (0.55 + 0.45 * dot(nOut, normalize(vec2(-0.5, 0.8))))) * mix(0.5, 1.0, uLightScene);
    bg -= uRipA * 0.016 * uLightScene * exp(-(rx - 1.6) * (rx - 1.6));
  }
  float shadowFall = max(sd, 0.0) / (0.9 * uPlateScale);
  bg *= 1.0 - uShadow * 0.03 * exp(-shadowFall * shadowFall) * step(0.0, sd);
  vec3 haloCol = mix(vec3(0.62, 0.69, 0.80), vec3(1.0), uLightScene);
  bg = mix(bg, haloCol, clamp(uHalo * (0.30 * exp(-outside / (0.025 * uPlateScale)) + 0.07 * exp(-outside / (0.12 * uPlateScale))), 0.0, 1.0) * step(0.0, sd));

  vec3 col = bg;
  float soft = px + uBlur * 0.8 + 0.06 * uDissolve * (1.0 - uKeep) * uPlateScale;
  if (sd < soft) {
    float y1 = 1.0 - x;
    const float K = 2.6;
    float base1 = max(1.0 - pow(y1, K), 1e-4);
    float db = min(pow(y1, K - 1.0) * pow(base1, 1.0 / K - 1.0), 25.0);
    float s1 = bw * 0.62;
    float w2 = bw * 0.22;
    float t2 = clamp((s - s1) / w2, -1.0, 1.0);
    float dh2 = uDouble * bw * 0.16;
    float dd = dh2 * 0.5 * cos(t2 * 1.5707963) * 1.5707963 / w2 * step(abs(t2), 0.999);
    vec2 gDome = -uDome * 2.0 * g * dg * step(g, 1.0);
    vec2 grad = -(db + dd) * nOut + gDome;

    vec3 back = mix(uBg, uPlateCol, uIconPlate);
    vec3 liftG = mix(back + vec3(0.06), mix(back, vec3(1.0), 0.55), uLightGlass);
    float rblur = uBlur + 0.05 * length(qc - p) + min(uGlow * uOptics * (1.0 - xf) * foot / px, 0.04);

    float cornerW = smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y);
    float streak = 0.35 * uStreak * bw * mix(0.15, 1.0, cornerW) * pow(1.0 - xf, 1.5) * uOptics;
    vec2 tangent = vec2(-nOut.y, nOut.x);
    vec3 acc = vec3(0.0), wsum = vec3(0.0);
    for (int i = 0; i < 20; i++) {
      float lam = (float(i) + 0.5) / 20.0;
      float c = uDisp * (1.0 - 2.0 * lam);
      vec2 along = tangent * (streak * 2.0 * (fract(float(i) * 0.618034 + 0.31) - 0.5));
      float cf = uDisp * (1.0 - 2.0 * lam) * (lam > 0.5 ? 1.0 : 0.5);
      vec2 sp = refractSample(xf, bwF, 1.5 + uEtaSpread * c, R, dirOut, p + along,
                              dome + pinchPart * 0.3 * c, offMul);
      vec2 focusL = focus - sign(p) * (0.70710678 * uFocusSplit * c * uPlateScale);
      float wFocus = pow(1.0 - xf, uFocusK) * smoothstep(0.0, uRimLine * (1.0 + 0.6 * c), xf);
      sp = mix(sp, mix(p + along, focusL, wFocus), focusW);
      float faceOnly = smoothstep(0.7, 1.0, xf) * uOptics;
      sp *= 1.0 + uFaceDisp * cf * faceOnly;
      vec4 l = logoAt(sp, rblur + 0.12 * streak + uFaceDisp * 0.5 * max(c, 0.0) * faceOnly, foot);
      vec3 w = spectrum(lam);
      acc += mix(back, l.rgb, l.a) * w;
      wsum += w;
    }
    vec3 trans = acc / wsum;
    float tl = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    trans = clamp(tl + (trans - tl) * (1.0 + uVivid * uOptics), 0.0, 1.0);
    float hazeLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float hazeGate = mix(1.0 - smoothstep(0.25, 0.75, hazeLum), smoothstep(0.25, 0.75, hazeLum), uLightGlass);
    trans = mix(trans, liftG, uFrost * 0.45 * hazeGate);

    float glassAmt = pow(1.0 - uDissolve, 1.5);
    float lit = uSpec * glassAmt;
    vec3 rimCol = mix(vec3(0.80, 0.87, 0.97), vec3(1.0), uLightGlass);

    float sc = uPlateScale;
    float tLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float lightOnly = smoothstep(0.35, 0.85, tLum);
    float hw = smoothstep(-0.85, 0.5, dot(nOut, rot(vec2(0.5, 0.866), uLightAng)));
    float tileBand = band(s, 0.016 * sc, 0.075 * sc, 0.022 * sc);
    float dropBand = (1.0 - smoothstep(0.06 * sc, 0.13 * sc, s)) * smoothstep(0.0, 0.004 * sc, s);
    float glow = mix(0.32 * tileBand, 0.75 * dropBand, uDrop) * lightOnly;
    float edgeLine = gauss(s, 0.005 * sc, 0.0045 * sc);
    float lip = gauss(s, 0.15 * sc, 0.007 * sc) * uDouble * (1.0 - uDrop);
    vec3 lightGlass = mix(trans, vec3(1.0), glow * glassAmt);
    lightGlass += (0.075 * hw * edgeLine + 0.06 * (0.4 + 0.6 * hw) * lip) * lit;
    lightGlass *= 1.0 - 0.05 * (1.0 - hw) * edgeLine * glassAmt * (1.0 - uDrop);
    lightGlass = mix(lightGlass, vec3(1.0), 0.55 * uDrop * glassAmt * edgeLine);

    vec3 Nl = normalize(vec3(-grad, 1.0));
    float edge = 1.0 - Nl.z;
    vec2 ldir = rot(normalize(vec2(-0.62, 0.78)), uLightAng);
    float side = dot(nOut, ldir);
    float fres = pow(edge, 1.5);
    vec3 rim = rimCol * fres * (0.35 + 0.65 * max(side, -side * 0.8)) * uRim * 0.65;
    vec3 Hv = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
    float spc = pow(max(dot(Nl, Hv), 0.0), 140.0) * 0.8 * smoothstep(0.0, 0.25, y1);
    vec3 darkGlass = trans * (1.0 - 0.25 * fres) + (rim + vec3(spc)) * lit;
    darkGlass = mix(darkGlass, rimCol, uDrop * 0.4 * uSpec * (1.0 - smoothstep(0.0, 0.1 * uPlateScale, s)));
    vec3 glass = mix(darkGlass, lightGlass, uLightGlass);

    float sweepD = dot(p / uPlateScale, normalize(vec2(0.8, 0.6))) - uSweep;
    float sheen = uSheen * glassAmt * exp(-sweepD * sweepD / 0.03) * (0.55 + 0.45 * (1.0 - x));
    glass = mix(glass, vec3(1.0), sheen * mix(0.22, 0.42, uLightGlass));

    float cov = clamp(0.5 - sd / soft, 0.0, 1.0);
    col = mix(bg, glass, cov);
  }

  vec3 outc = mix(plain, col, uPlateAlpha);
  outc += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(outc, 1.0);
}`

/* ------------------------------------------------------------------ *
 * Renderer
 * ------------------------------------------------------------------ */
type Frame = ReturnType<typeof frameAt>

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false })
  if (!gl) return null
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader")
    return sh
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "program")
  gl.useProgram(prog)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "aPos")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const U: Record<string, WebGLUniformLocation | null> = {}
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(prog, i)!
    U[info.name] = gl.getUniformLocation(prog, info.name)
  }

  const sdfTex = gl.createTexture()
  const colTex = gl.createTexture()
  gl.uniform1i(U.uSdf, 0)
  gl.uniform1i(U.uCol, 1)
  let hasLogo = false

  const params = (filter: number) => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  function setLogo(logo: LogoData) {
    gl!.activeTexture(gl!.TEXTURE0)
    gl!.bindTexture(gl!.TEXTURE_2D, sdfTex)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.R16F, TEX, TEX, 0, gl!.RED, gl!.FLOAT, logo.sdf)
    params(gl!.LINEAR)

    gl!.activeTexture(gl!.TEXTURE1)
    gl!.bindTexture(gl!.TEXTURE_2D, colTex)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, gl!.RGBA, gl!.UNSIGNED_BYTE, logo.canvas)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl!.generateMipmap(gl!.TEXTURE_2D)
    params(gl!.LINEAR_MIPMAP_LINEAR)
    hasLogo = true
  }

  function render(fr: Frame, w: number, h: number, tilePx: number) {
    if (!hasLogo) return
    gl!.viewport(0, 0, w, h)
    gl!.uniform2f(U.uCenter, w / 2, h / 2)
    gl!.uniform1f(U.uTile, tilePx)
    gl!.uniform1f(U.uTexSize, TEX)
    gl!.uniform1f(U.uBoxFrac, BOX)
    for (const k in fr) {
      const v = fr[k as keyof Frame]
      if (typeof v === "number" && U[k]) gl!.uniform1f(U[k], v)
    }
    gl!.uniform3fv(U.uBg, fr.uBg)
    gl!.uniform3fv(U.uPlateCol, fr.uPlateCol)
    gl!.uniform3fv(U.uLogoCol, fr.uLogoCol)
    gl!.uniform2fv(U.uLogoOff, fr.uLogoOff)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function dispose() {
    gl!.getExtension("WEBGL_lose_context")?.loseContext()
  }

  return { setLogo, render, dispose }
}

/* ------------------------------------------------------------------ *
 * Spring timeline
 * ------------------------------------------------------------------ */
const TAIL = 1.1 // from the glass letting go to everything at rest, seconds
const OUTRO = 0.5 // loop only: the logo blurs away before the next reveal
const endOf = (P: Settings) => P.present + TAIL

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const smoother = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "")
  if (h.length === 3) h = h.replace(/./g, "$&$&")
  const v = parseInt(h.slice(0, 6), 16) || 0
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}
const luminance = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

function spring(t: number, response: number, damping: number) {
  if (t <= 0) return 0
  const w = (2 * Math.PI) / response
  if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t)
  const wd = w * Math.sqrt(1 - damping * damping)
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t))
}

const reachCache = new Map<string, number>()
function timeToReach(level: number, response: number, damping: number) {
  const key = `${level}/${response}/${damping}`
  let t = reachCache.get(key)
  if (t === undefined) {
    let lo = 0
    let hi = 3
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (spring(mid, response, damping) < level) lo = mid
      else hi = mid
    }
    reachCache.set(key, (t = hi))
  }
  return t
}

function frameAt(T: number, P: Settings, outro = 0) {
  const tx = P.present
  const keep = P.keepPlate ? 1 : 0
  const damping = 1 - P.bounce
  const grow = spring(T + 0.01, P.response, damping)
  const tl = timeToReach(0.85, P.response, damping) - 0.01
  const tm = timeToReach(0.92, P.response, damping) - 0.01
  const morph = spring(T - tm, 0.4, 1)
  const drop = 1 - smooth(0.05, 1, morph)
  const appear = smooth(0, 0.08, T)
  const drift = P.drift * spring(T - 0.3, 2.2, 1)
  const zoomIn = 0.25 * spring(T, 0.7, 1) + 0.75 * smoother(0, P.glide, T)
  const settle = spring(T - 0.5, 2.4, 1)
  const exit = spring(T - tx, 0.95, 1)
  const release = spring(T - tx - 0.05, 0.65, 1)
  const dome = 0.15 * P.bulge * (1 - smooth(0.4, 0.95, grow))
  const view = (1 + (P.startZoom - 1) * (1 - zoomIn)) * (1 - 0.045 * settle) * mix(1, P.finalScale, exit) * (1 - 0.06 * outro)
  const bandW = mix(P.bevelWidth, Math.max(P.bevelWidth, 0.4), drop)
  const plateScale = mix(P.startSize, 1, grow) * (1 + drift) * (1 + 0.14 * release * (1 - keep)) * (1 - keep * (0.03 * release + 0.06 * outro))
  const bg = hexToRgb(P.background)
  return {
    uPlateScale: plateScale,
    uShapeN: mix(2, P.corner, morph),
    uCornerN: P.corner,
    uOptics: 1 - smooth(0.55, 1, release),
    uPlateAlpha: keep ? appear * (1 - outro) : appear * (1 - smooth(0.45, 1, release)),
    uLogoHalf: P.logoScale * view,
    uLogoOff: [P.logoOffset[0] * view, P.logoOffset[1] * view] as [number, number],
    uKeep: keep,
    uSheen: P.sheen,
    uSweep: mix(-1.6, 1.6, smoother(0.9, tx - 0.1, T)),
    uLightAng: P.lightTurn * smoother(0.4, tx + 0.4, T),
    uBold: P.swell * 0.03 * (1 - zoomIn),
    uBlur: P.focus * 0.05 * (1 - smooth(0.3, 0.95, grow)) + 0.03 * outro,
    uFrost: P.focus * (1 - smooth(0.5, 0.95, grow)),
    uPinch: 0.38 * P.stretch * smooth(0.1, 0.9, morph) * smooth(0.75, 0.97, zoomIn),
    uTilt: P.tilt,
    uDome: dome,
    uDrop: drop,
    uRim: 1 + 0.8 * drop,
    uHalo: P.halo * (0.5 + 0.5 * drop) * (1 - keep * release),
    uShadow: Math.max(P.shadow * smooth(0.45, 0.8, grow) * (1 - smooth(0, 0.6, morph)), 0.8 * P.shadow * keep * release),
    uGhost: smooth(0, 0.03, T) * (1 - smooth(0.04, 0.08, T)),
    uRipR: 1 + 0.9 * Math.max(0, T - tl),
    uRipA: P.ripple * smooth(tl, tl + 0.06, T) * Math.exp(-Math.max(0, T - tl) / 0.6),
    uBare: (1 - keep) * smooth(tx - 0.25, tx, T) * (1 - outro),
    uReach: bandW * plateScale,
    uCornerPull: P.cornerPull,
    uStreak: P.edgeSmear,
    uWiden: P.cornerWidth,
    uSlab: 0.3 * P.opticalDepth,
    uEtaSpread: 0.06,
    uFocus: P.cornerFocus,
    uFocusK: 1.0,
    uFocusSplit: 0.056 * P.colorBleed,
    uRimLine: 0.09,
    uCornerOn: smooth(0.35, 1, morph),
    uGlow: 0.012 * P.colorBleed,
    uFaceDisp: 0.012 * P.dispersion,
    uVivid: 0.85,
    uDissolve: release,
    uDisp: P.dispersion,
    uDouble: P.doubleBevel,
    uBevelW: bandW * (1 - release),
    uSpec: P.specular,
    uIconPlate: P.iconPlate ? 1 : 0,
    uUseColor: P.originalColors ? 1 : 0,
    uLightScene: luminance(bg) > 0.5 ? 1 : 0,
    uLightGlass: luminance(P.iconPlate ? hexToRgb(P.plateColor) : bg) > 0.5 ? 1 : 0,
    uBg: bg,
    uPlateCol: hexToRgb(P.plateColor),
    uLogoCol: hexToRgb(P.logoColor),
  }
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */
export interface GlassIconRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** SVG markup (`<svg …>…</svg>`) or an image URL. Only the shape is used unless `originalColors` is on */
  logo: string
  /** Starting preset: light glass over a pale backdrop, or dark glass with an icon plate */
  look?: Look
  /** Backdrop colour (hex). Match it to the page: the canvas paints it */
  background?: string
  logoColor?: string
  /** Colour of the tile behind the logo while `iconPlate` is on */
  plateColor?: string
  iconPlate?: boolean
  /** End on the flat icon plate (an app icon, a badge) instead of the bare logo */
  keepPlate?: boolean
  /** Keep the logo's own colours instead of `logoColor` */
  originalColors?: boolean
  /** Largest tile size in px; it shrinks to fit the container */
  tileSize?: number
  /** Logo half size relative to the tile's half size */
  logoScale?: number
  /** Logo size once the glass is gone, relative to `logoScale` */
  finalScale?: number
  /** Shift of the logo's centre, in tile half sizes (y up) */
  logoOffset?: [number, number]
  loop?: boolean
  /** Seconds the finished logo stays before the next loop */
  hold?: number
  speed?: number
  /** Freeze the reveal at this many seconds instead of playing it (scroll-driven or static use) */
  time?: number
  /** Fine-tune the glass and the motion */
  tuning?: Partial<GlassTuning>
  /** Accessible name of the logo */
  label?: string
  /** Callback fired once reveal animation finishes */
  onComplete?: () => void
}

export function GlassIconReveal({
  logo,
  look = "light",
  background,
  logoColor,
  plateColor,
  iconPlate,
  keepPlate,
  originalColors,
  tileSize,
  logoScale,
  finalScale,
  logoOffset,
  loop = true,
  hold,
  speed = 1,
  time,
  tuning,
  label = "Logo",
  onComplete,
  className,
  style,
  onClick,
  ...props
}: GlassIconRevealProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const engineRef = React.useRef<ReturnType<typeof startEngine> | null>(null)
  const [fallback, setFallback] = React.useState(false)

  const tuningKey = JSON.stringify(tuning ?? {})
  const offsetKey = logoOffset ? logoOffset.join(",") : ""
  const settings = React.useMemo<Settings>(() => {
    const own = { background, logoColor, plateColor, iconPlate, keepPlate, originalColors, tileSize, logoScale, finalScale, hold }
    const set: Partial<Settings> = Object.fromEntries(Object.entries(own).filter(([, v]) => v !== undefined))
    if (offsetKey) set.logoOffset = offsetKey.split(",").map(Number) as [number, number]
    return { ...LOOKS[look], ...set, ...(JSON.parse(tuningKey) as Partial<GlassTuning>) }
  }, [look, background, logoColor, plateColor, iconPlate, keepPlate, originalColors, tileSize, logoScale, finalScale, hold, offsetKey, tuningKey])

  const live = React.useRef({ settings, loop, speed, time, onComplete })
  live.current = { settings, loop, speed, time, onComplete }

  React.useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const engine = startEngine(wrap, live)
    if (!engine) {
      setFallback(true)
      return
    }
    engineRef.current = engine
    return () => {
      engineRef.current = null
      engine.dispose()
    }
  }, [])

  React.useEffect(() => {
    engineRef.current?.invalidate()
  }, [settings, loop, speed, time])

  React.useEffect(() => {
    let cancelled = false
    loadLogo(logo).then(
      (data) => {
        if (cancelled) return
        engineRef.current?.setLogo(data)
      },
      (err) => console.error(err),
    )
    return () => {
      cancelled = true
    }
  }, [logo])

  const fallbackUrl = React.useMemo(() => (fallback ? logoUrl(logo) : ""), [fallback, logo])

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={label}
      className={cn("relative isolate cursor-pointer overflow-hidden select-none", className)}
      style={{ backgroundColor: settings.background, ...style }}
      onClick={(e) => {
        engineRef.current?.replay()
        onClick?.(e)
      }}
      {...props}
    >
      {fallback && (
        <span
          aria-hidden
          className="absolute inset-0 m-auto block"
          style={{
            width: settings.tileSize * settings.logoScale * settings.finalScale * BOX,
            height: settings.tileSize * settings.logoScale * settings.finalScale * BOX,
            maxWidth: "40%",
            maxHeight: "40%",
            backgroundColor: settings.logoColor,
            maskImage: `url("${fallbackUrl}")`,
            WebkitMaskImage: `url("${fallbackUrl}")`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      )}
    </div>
  )
}

function startEngine(
  wrap: HTMLDivElement,
  live: React.RefObject<{ settings: Settings; loop: boolean; speed: number; time?: number; onComplete?: () => void }>,
) {
  const canvas = document.createElement("canvas")
  canvas.setAttribute("aria-hidden", "true")
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block"
  wrap.appendChild(canvas)

  let renderer: ReturnType<typeof createRenderer> = null
  try {
    renderer = createRenderer(canvas)
  } catch (err) {
    console.error(err)
  }
  if (!renderer) {
    canvas.remove()
    return null
  }

  const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let logo: LogoData | null = null
  let time = reduceMotion ? 1.4 : 0
  let playing = !reduceMotion
  let pauseLeft = 0
  let outro = 0
  let dirty = true
  let visible = false
  let lost = false
  let raf = 0
  let last = 0
  let hasFiredComplete = false

  function tick(now: number) {
    raf = 0
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    const { settings: P, loop, speed, time: fixed, onComplete } = live.current
    const end = endOf(P)
    if (fixed !== undefined) {
      playing = false
      time = fixed
      outro = clamp01((fixed - end - Math.max(0.05, P.hold)) / OUTRO)
    } else if (playing && logo) {
      if (pauseLeft > 0) {
        pauseLeft -= dt
        const was = outro
        outro = clamp01(1 - pauseLeft / OUTRO)
        if (pauseLeft <= 0) {
          pauseLeft = 0
          outro = 0
          time = 0
        }
        if (outro !== was || time === 0) dirty = true
      } else {
        time += dt * speed
        if (time >= end) {
          time = end
          if (!hasFiredComplete) {
            hasFiredComplete = true
            onComplete?.()
          }
          if (loop) {
            pauseLeft = Math.max(0.05, P.hold) + OUTRO
          } else {
            playing = false
          }
        }
        dirty = true
      }
    }
    if (dirty && logo && renderer && !lost) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      const w = Math.max(1, Math.round(cw * dpr))
      const h = Math.max(1, Math.round(ch * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const tile = Math.min(P.tileSize, Math.min(cw, ch) / 1.75)
      renderer.render(frameAt(Math.min(time, end), P, outro), w, h, tile * dpr)
      dirty = false
    }
    if (visible && playing && logo && !lost) raf = requestAnimationFrame(tick)
  }

  function kick() {
    if (raf || !visible || lost) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) kick()
    else if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  })
  io.observe(wrap)
  const ro = new ResizeObserver(() => {
    dirty = true
    kick()
  })
  ro.observe(wrap)

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
  }
  const onRestored = () => {
    lost = false
    try {
      renderer = createRenderer(canvas)
      if (renderer && logo) renderer.setLogo(logo)
    } catch (err) {
      console.error(err)
    }
    dirty = true
    kick()
  }
  canvas.addEventListener("webglcontextlost", onLost)
  canvas.addEventListener("webglcontextrestored", onRestored)

  return {
    setLogo(data: LogoData) {
      logo = data
      renderer?.setLogo(data)
      if (!reduceMotion) {
        time = 0
        playing = true
        pauseLeft = 0
        outro = 0
        hasFiredComplete = false
      }
      dirty = true
      kick()
    },
    replay() {
      time = 0
      playing = true
      pauseLeft = 0
      outro = 0
      hasFiredComplete = false
      dirty = true
      kick()
    },
    invalidate() {
      dirty = true
      kick()
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      renderer?.dispose()
      canvas.remove()
    },
  }
}

/* ------------------------------------------------------------------ *
 * Logos & Presets
 * ------------------------------------------------------------------ */

// 21st.dev Mark
export const MARK_21ST = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="247.7 247.8 330.4 330.4"><path fill-rule="evenodd" d="M543.595 247.8C562.596 247.8 578 263.209 578 282.217V492.158C578 494.06 576.46 495.6 574.559 495.6H471.345C469.445 495.6 467.906 497.141 467.906 499.042V574.758C467.906 576.66 466.364 578.2 464.464 578.2H282.12C263.118 578.2 247.714 562.791 247.714 543.783V499.499C247.714 497.081 248.988 494.84 251.061 493.597L374.676 419.4C377.484 417.714 376.542 413.562 373.535 413.054L372.915 413H251.156C249.254 413 247.714 411.46 247.714 409.558V333.842C247.714 331.941 249.254 330.4 251.156 330.4H381.893C383.792 330.4 385.334 328.86 385.334 326.958V251.242C385.334 249.341 386.874 247.8 388.773 247.8H543.595ZM388.773 330.4C386.874 330.4 385.334 331.941 385.334 333.842V492.158C385.334 494.06 386.874 495.6 388.773 495.6H464.464C466.364 495.6 467.906 494.06 467.906 492.158V333.842C467.906 331.941 466.364 330.4 464.464 330.4H388.773Z"/></svg>`

// Qareeb (قريب) Brand Mark
const QAREEB_OUTER_PATH = `M 1396 248.672 C 1377.416 251.640, 1360.764 256.865, 1347.302 263.952 C 1333.099 271.429, 1324.129 279.526, 1317.126 291.191 C 1315.907 293.221, 1308.672 312.571, 1301.047 334.191 C 1273.975 410.949, 1268.697 425.949, 1255.012 465 C 1247.398 486.725, 1235.911 519.350, 1229.484 537.500 C 1223.056 555.650, 1216.933 573.162, 1215.875 576.415 C 1208.770 598.275, 1209.473 632.092, 1217.587 658.691 C 1220.877 669.478, 1228.515 684.617, 1234.964 693.135 C 1241.492 701.758, 1255.769 715.239, 1264 720.553 C 1302.834 745.625, 1353.440 753.229, 1405.869 741.869 C 1418.922 739.041, 1433.272 733.943, 1447.787 726.976 C 1467.893 717.325, 1482.057 707.219, 1499.238 690.266 C 1504.044 685.523, 1508.157 681.836, 1508.378 682.072 C 1510.066 683.875, 1525.065 707.948, 1530.999 718.378 C 1543.877 741.012, 1560.265 782.236, 1567.421 810 C 1587.739 888.832, 1587.880 971.383, 1567.864 1070 C 1557.184 1122.623, 1542.471 1170.813, 1519.872 1227.202 C 1489.474 1303.048, 1447.123 1376.389, 1399.371 1435.881 C 1362.211 1482.176, 1319.619 1525.055, 1278 1558.070 C 1246.468 1583.083, 1229.289 1594.697, 1184.500 1621.282 C 1163.241 1633.900, 1119.589 1654.118, 1089.163 1665.439 C 1059.926 1676.318, 1022.397 1687.157, 995.500 1692.491 C 979.491 1695.666, 936.373 1701.521, 917.500 1703.082 C 898.865 1704.624, 841.391 1704.646, 822 1703.118 C 804.542 1701.742, 772.474 1697.355, 751.500 1693.473 C 693.864 1682.804, 642.441 1662.303, 596.116 1631.523 C 577.466 1619.131, 564.387 1608.160, 546.460 1589.867 C 519.497 1562.354, 496.777 1529.977, 480.950 1496.512 C 463.818 1460.287, 453.745 1424.313, 447.486 1377 C 441.950 1335.160, 441.543 1272.553, 446.486 1223.500 C 453.280 1156.084, 468.056 1085.406, 493.106 1000.500 C 508.442 948.522, 548.254 831.534, 582.416 738.069 C 589.337 719.132, 595 703.325, 595 702.942 C 595 702.560, 591.512 701.340, 587.250 700.231 C 582.987 699.122, 568.479 695.235, 555.009 691.593 C 541.539 687.951, 530.015 685.164, 529.401 685.400 C 528.787 685.635, 527.992 687.292, 527.634 689.080 C 527.276 690.869, 522.753 702.495, 517.582 714.916 C 507.448 739.258, 496.461 767.124, 478.316 814.500 C 447.436 895.131, 413.657 994.034, 396.893 1052.904 C 365.165 1164.318, 349.139 1239.837, 337.559 1332.500 C 328.332 1406.334, 326.596 1480.303, 332.549 1546 C 339.393 1621.529, 357.419 1694.479, 384.441 1756 C 400.941 1793.566, 416.911 1820.717, 442.178 1854.158 C 467.797 1888.065, 498.290 1916.720, 533 1939.507 C 557.689 1955.715, 578.563 1966.534, 604.529 1976.580 C 645.332 1992.366, 682.686 2000.621, 738.500 2006.187 C 756.023 2007.934, 822.872 2007.934, 841.500 2006.187 C 898.959 2000.796, 937.091 1992.721, 988 1975.161 C 1023.755 1962.828, 1066.754 1942.745, 1106 1920.049 C 1144.876 1897.567, 1196.236 1859.837, 1238.061 1823.035 C 1256.145 1807.123, 1297.423 1766.338, 1314.564 1747.447 C 1349.965 1708.429, 1384.381 1666.350, 1410.621 1630 C 1456.379 1566.611, 1488.732 1513.484, 1522.974 1445.500 C 1555.858 1380.214, 1578.829 1325.007, 1601.198 1257.500 C 1619.153 1203.313, 1632.634 1152.804, 1643.503 1099 C 1665.252 991.335, 1675.390 882.213, 1673.652 774.500 C 1672.533 705.104, 1668.392 651.582, 1659.417 590.500 C 1653.497 550.205, 1642.821 498.478, 1633.515 465 C 1629.255 449.673, 1616.832 414.107, 1610.496 399.096 C 1584.839 338.311, 1548.002 293.800, 1503 269.204 C 1487.431 260.694, 1463.334 252.685, 1443.747 249.508 C 1435.210 248.123, 1402.969 247.559, 1396 248.672`
const QAREEB_INNER_PATH = `M 1387 456.091 C 1380.195 457.411, 1369.180 463.274, 1362.808 468.969 C 1351.460 479.112, 1343.047 495.544, 1342.218 509.185 C 1341.794 516.162, 1342.025 517.451, 1344.735 523.185 C 1349.611 533.503, 1357.906 540.510, 1372.697 546.803 C 1395.792 556.631, 1431.740 561.128, 1462 557.976 C 1473.204 556.809, 1488.065 554.196, 1489.880 553.074 C 1490.847 552.476, 1489.889 549.742, 1485.961 541.891 C 1465.137 500.269, 1441.078 471.521, 1417.860 460.518 C 1406.895 455.322, 1397.742 454.009, 1387 456.091`

export const QAREEB_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="280 200 1440 1840"><path fill="currentColor" fill-rule="evenodd" d="${QAREEB_OUTER_PATH} ${QAREEB_INNER_PATH}"/></svg>`

export type GlassReveal21stProps = Omit<GlassIconRevealProps, "logo">

export function GlassReveal21st({ tuning, ...props }: GlassReveal21stProps) {
  return (
    <GlassIconReveal
      logo={MARK_21ST}
      label="21st.dev"
      look="light"
      logoColor="#0045ff"
      logoScale={0.6}
      finalScale={0.8}
      {...props}
      tuning={{
        startZoom: 2.3,
        ...tuning,
      }}
    />
  )
}

export type GlassRevealQareebProps = Omit<GlassIconRevealProps, "logo">

export function GlassRevealQareeb({
  tuning,
  look = "dark",
  logoColor,
  background,
  plateColor,
  iconPlate,
  ...props
}: GlassRevealQareebProps) {
  const isDark = look === "dark"
  return (
    <GlassIconReveal
      logo={QAREEB_MARK}
      label="قريب"
      look={look}
      logoColor={logoColor ?? (isDark ? "#38bdf8" : "#2563eb")}
      background={background ?? (isDark ? "#030712" : "#ffffff")}
      plateColor={plateColor ?? (isDark ? "#0b1329" : "#f1f5f9")}
      iconPlate={iconPlate ?? true}
      logoScale={0.64}
      finalScale={0.78}
      {...props}
      tuning={{
        startZoom: 2.2,
        dispersion: 1.8,
        colorBleed: 1.3,
        ...tuning,
      }}
    />
  )
}

export default GlassIconReveal
