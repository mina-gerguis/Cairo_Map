const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const size = 512;
  const { data, info } = await sharp('public/images/brand/qareeb_blackbg.jpg')
    .resize(size, size, { fit: 'contain' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const threshold = 120;

  // Function to sample pixel (0 outside bounds)
  const val = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return 0;
    return data[y * w + x] > threshold ? 1 : 0;
  };

  // Marching squares segments
  // Each segment is [ [x1, y1], [x2, y2] ]
  // Edge centers:
  // Top: (x + 0.5, y)
  // Right: (x + 1, y + 0.5)
  // Bottom: (x + 0.5, y + 1)
  // Left: (x, y + 0.5)
  const segments = [];

  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const tl = val(x, y);
      const tr = val(x + 1, y);
      const br = val(x + 1, y + 1);
      const bl = val(x, y + 1);
      const cell = (tl << 3) | (tr << 2) | (br << 1) | bl;

      const top = [x + 0.5, y];
      const right = [x + 1, y + 0.5];
      const bottom = [x + 0.5, y + 1];
      const left = [x, y + 0.5];

      switch (cell) {
        case 1:  segments.push([left, bottom]); break;
        case 2:  segments.push([bottom, right]); break;
        case 3:  segments.push([left, right]); break;
        case 4:  segments.push([top, right]); break;
        case 5:  segments.push([left, top]); segments.push([bottom, right]); break;
        case 6:  segments.push([top, bottom]); break;
        case 7:  segments.push([left, top]); break;
        case 8:  segments.push([top, left]); break;
        case 9:  segments.push([top, bottom]); break;
        case 10: segments.push([top, right]); segments.push([left, bottom]); break;
        case 11: segments.push([top, right]); break;
        case 12: segments.push([right, left]); break;
        case 13: segments.push([bottom, right]); break;
        case 14: segments.push([left, bottom]); break;
        default: break;
      }
    }
  }

  console.log(`Generated ${segments.length} segments`);

  // Chain segments into closed loops
  const key = pt => `${Math.round(pt[0] * 10)},${Math.round(pt[1] * 10)}`;
  const map = new Map();
  for (const seg of segments) {
    const k1 = key(seg[0]);
    if (!map.has(k1)) map.set(k1, []);
    map.get(k1).push(seg);
  }

  const loops = [];
  const used = new Set();

  for (let i = 0; i < segments.length; i++) {
    if (used.has(i)) continue;
    const loop = [segments[i][0], segments[i][1]];
    used.add(i);

    let current = segments[i][1];
    let closed = false;

    while (!closed) {
      const k = key(current);
      const candidates = map.get(k) || [];
      let nextSeg = null;

      for (const seg of candidates) {
        const segIdx = segments.indexOf(seg);
        if (!used.has(segIdx)) {
          used.add(segIdx);
          nextSeg = seg;
          break;
        }
      }

      if (!nextSeg) break;

      current = nextSeg[1];
      loop.push(current);

      if (Math.hypot(current[0] - loop[0][0], current[1] - loop[0][1]) < 1.0) {
        closed = true;
      }
    }

    if (loop.length > 20) {
      loops.push(loop);
    }
  }

  console.log(`Found ${loops.length} loops: sizes = ${loops.map(l => l.length).join(', ')}`);

  // Douglas-Peucker simplification
  function simplify(pts, tol) {
    if (pts.length <= 2) return pts;
    let maxD = 0;
    let maxI = 0;
    const [x1, y1] = pts[0];
    const [x2, y2] = pts[pts.length - 1];
    const len = Math.hypot(x2 - x1, y2 - y1);

    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i];
      const d = len === 0 
        ? Math.hypot(px - x1, py - y1)
        : Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / len;
      if (d > maxD) {
        maxD = d;
        maxI = i;
      }
    }

    if (maxD > tol) {
      const p1 = simplify(pts.slice(0, maxI + 1), tol);
      const p2 = simplify(pts.slice(maxI), tol);
      return p1.slice(0, p1.length - 1).concat(p2);
    }
    return [pts[0], pts[pts.length - 1]];
  }

  // Sort loops by length descending: loop 0 is outer contour, loop 1 is inner hole
  loops.sort((a, b) => b.length - a.length);

  const simplifiedLoops = loops.map(l => simplify(l, 1.5));
  console.log(`Simplified loops sizes: ${simplifiedLoops.map(l => l.length).join(', ')}`);

  // Convert to smooth Catmull-Rom or Cubic Bezier path
  function toSvgBezier(pts) {
    if (pts.length < 3) return '';
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? pts.length - 2 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[(i + 2) % pts.length];

      // Catmull-Rom to Cubic Bezier control points
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    d += ' Z';
    return d;
  }

  // Also standard line path
  function toSvgLines(pts) {
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
    }
    d += ' Z';
    return d;
  }

  const result = {
    viewBox: `0 0 ${w} ${h}`,
    outerLines: toSvgLines(simplifiedLoops[0]),
    outerBezier: toSvgBezier(simplifiedLoops[0]),
    innerLines: simplifiedLoops[1] ? toSvgLines(simplifiedLoops[1]) : '',
    innerBezier: simplifiedLoops[1] ? toSvgBezier(simplifiedLoops[1]) : '',
    // Combined fill path (outer + inner with evenodd fill-rule)
    combinedBezier: `${toSvgBezier(simplifiedLoops[0])} ${simplifiedLoops[1] ? toSvgBezier(simplifiedLoops[1]) : ''}`
  };

  fs.writeFileSync('scripts/qareeb_svg_data.json', JSON.stringify(result, null, 2));
  console.log('Successfully saved to scripts/qareeb_svg_data.json');
}

run();
