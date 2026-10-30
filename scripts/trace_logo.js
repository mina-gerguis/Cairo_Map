const sharp = require('sharp');
const fs = require('fs');

async function run() {
  // Resize to a manageable resolution, say 512x512, for clean, crisp contour extraction
  const { data, info } = await sharp('public/images/brand/qareeb_blackbg.jpg')
    .resize(512, 512)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  console.log(`Resized to ${width}x${height}`);

  // Binarize
  const threshold = 128;
  const grid = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i++) {
    grid[i] = data[i] > threshold ? 1 : 0;
  }

  // Moore-Neighbor contour tracing algorithm
  function traceContour(startX, startY) {
    const points = [];
    let x = startX;
    let y = startY;
    let dir = 0; // 0: E, 1: SE, 2: S, 3: SW, 4: W, 5: NW, 6: N, 7: NE
    const dx = [1, 1, 0, -1, -1, -1, 0, 1];
    const dy = [0, 1, 1, 1, 0, -1, -1, -1];

    let currentDir = 7;
    let firstX = x;
    let firstY = y;
    let secondX = -1;
    let secondY = -1;

    for (let step = 0; step < 100000; step++) {
      points.push({ x, y });

      let found = false;
      // Search starting from currentDir - 2 (or + 5 mod 8 in standard Moore)
      let searchDir = (currentDir + 5) % 8;
      for (let i = 0; i < 8; i++) {
        const checkDir = (searchDir + i) % 8;
        const nx = x + dx[checkDir];
        const ny = y + dy[checkDir];

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (grid[ny * width + nx] === 1) {
            x = nx;
            y = ny;
            currentDir = checkDir;
            found = true;
            break;
          }
        }
      }

      if (!found) break;

      if (points.length === 2) {
        secondX = x;
        secondY = y;
      } else if (points.length > 2) {
        if (x === firstX && y === firstY && points[1].x === secondX && points[1].y === secondY) {
          // Closed loop completed
          break;
        }
      }
    }

    return points;
  }

  // Find outer contour: scan from top-left
  let outer = null;
  outerLoop:
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y * width + x] === 1) {
        outer = traceContour(x, y);
        break outerLoop;
      }
    }
  }

  console.log(`Outer contour points: ${outer ? outer.length : 0}`);

  // Find inner hole: look inside the head
  // Head is around top right, let's look for a 0 inside a 1
  let inner = null;
  // Scan between y = 100..250, x = 250..450
  for (let y = 100; y < 250; y++) {
    let crossed = false;
    for (let x = 250; x < 450; x++) {
      if (grid[y * width + x] === 1) {
        crossed = true;
      } else if (crossed && grid[y * width + x] === 0) {
        // We hit the hole! The border of the hole is adjacent 1
        // Trace the hole border (the 1s that touch this 0)
        inner = traceContour(x - 1, y);
        break;
      }
    }
    if (inner && inner.length > 20) break;
  }

  console.log(`Inner contour points: ${inner ? inner.length : 0}`);

  // Simplify points (Ramer-Douglas-Peucker)
  function simplify(pts, epsilon) {
    if (pts.length <= 2) return pts;
    let dmax = 0;
    let index = 0;
    const end = pts.length - 1;
    for (let i = 1; i < end; i++) {
      const d = perpendicularDistance(pts[i], pts[0], pts[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
    if (dmax > epsilon) {
      const rec1 = simplify(pts.slice(0, index + 1), epsilon);
      const rec2 = simplify(pts.slice(index), epsilon);
      return rec1.slice(0, rec1.length - 1).concat(rec2);
    } else {
      return [pts[0], pts[end]];
    }
  }

  function perpendicularDistance(pt, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.hypot(dx, dy);
    if (mag === 0) return Math.hypot(pt.x - lineStart.x, pt.y - lineStart.y);
    return Math.abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / mag;
  }

  const simplifiedOuter = simplify(outer, 1.2);
  const simplifiedInner = simplify(inner, 0.8);

  console.log(`Simplified outer: ${simplifiedOuter.length}, inner: ${simplifiedInner.length}`);

  // Generate SVG path string with smooth beziers or polyline
  function toSvgPath(pts) {
    if (!pts || pts.length === 0) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
    d += ' Z';
    return d;
  }

  fs.writeFileSync('scripts/logo_paths.json', JSON.stringify({
    viewBox: `0 0 ${width} ${height}`,
    outerPath: toSvgPath(simplifiedOuter),
    innerPath: toSvgPath(simplifiedInner),
    outerPts: simplifiedOuter,
    innerPts: simplifiedInner
  }, null, 2));

  console.log('Saved to scripts/logo_paths.json');
}

run();
