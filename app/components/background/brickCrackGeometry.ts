export type CrackKind = 'primary' | 'secondary' | 'micro';

export type CrackPath = {
  id: string;
  d: string;
  kind: CrackKind;
  points: [number, number][];
};

export type BrickCell = {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cracks: CrackPath[];
};

function seeded(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function jaggedLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  segments = 6,
  jitter = 6,
): { d: string; points: [number, number][] } {
  const pts: [number, number][] = [[x1, y1]];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const falloff = Math.sin(t * Math.PI);
    const j = (seeded(seed + i * 3.7) - 0.5) * jitter * falloff * 2;
    const kink = seeded(seed + i * 9.1) > 0.88 ? (seeded(seed + i) - 0.5) * jitter * 0.5 : 0;
    pts.push([x1 + dx * t + nx * (j + kink), y1 + dy * t + ny * (j + kink)]);
  }
  pts.push([x2, y2]);

  const [first, ...rest] = pts;
  const d = `M ${first[0].toFixed(1)} ${first[1].toFixed(1)}${rest.map(([px, py]) => ` L ${px.toFixed(1)} ${py.toFixed(1)}`).join('')}`;
  return { d, points: pts };
}

function pointAlongPolyline(points: [number, number][], t: number): [number, number] {
  const idx = Math.min(points.length - 2, Math.max(0, Math.floor(t * (points.length - 1))));
  const localT = t * (points.length - 1) - idx;
  const [x1, y1] = points[idx];
  const [x2, y2] = points[idx + 1];
  return [x1 + (x2 - x1) * localT, y1 + (y2 - y1) * localT];
}

/** Point on brick inner perimeter + outward normal angle (cracks spawn from mortar stress) */
function pointOnPerimeter(
  x: number,
  y: number,
  w: number,
  h: number,
  pad: number,
  t: number,
): { px: number; py: number; nx: number; ny: number; tx: number; ty: number } {
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  const perimeter = 2 * (iw + ih);
  let d = ((t % 1) + 1) % 1 * perimeter;

  if (d <= iw) {
    return { px: x + pad + d, py: y + pad, nx: 0, ny: -1, tx: 1, ty: 0 };
  }
  d -= iw;
  if (d <= ih) {
    return { px: x + pad + iw, py: y + pad + d, nx: 1, ny: 0, tx: 0, ty: 1 };
  }
  d -= ih;
  if (d <= iw) {
    return { px: x + pad + iw - d, py: y + pad + ih, nx: 0, ny: 1, tx: -1, ty: 0 };
  }
  d -= iw;
  return { px: x + pad, py: y + pad + ih - d, nx: -1, ny: 0, tx: 0, ty: -1 };
}

function addMicroFrom(
  cracks: CrackPath[],
  brickId: number,
  ox: number,
  oy: number,
  baseAngle: number,
  spread: number,
  seed: number,
  maxLen: number,
): void {
  const angle = baseAngle + (seeded(seed) - 0.5) * spread;
  const len = 2.5 + seeded(seed + 1) * maxLen;
  const line = jaggedLine(
    ox,
    oy,
    ox + Math.cos(angle) * len,
    oy + Math.sin(angle) * len,
    seed * 47,
    3,
    1.5,
  );
  cracks.push({ id: `${brickId}-micro-${cracks.length}`, kind: 'micro', ...line });
}

function buildBrickCracks(id: number, x: number, y: number, w: number, h: number): CrackPath[] {
  const cracks: CrackPath[] = [];
  const severity = seeded(id * 1.7);
  const pad = 3;

  // Origin on perimeter — mortar joint / corner stress
  const originT = seeded(id * 2.1);
  const origin = pointOnPerimeter(x, y, w, h, pad, originT);

  // Exit on another part of perimeter (real crack crosses the brick face)
  const travel = 0.28 + seeded(id * 3.3) * 0.55;
  const exit = pointOnPerimeter(x, y, w, h, pad, originT + travel);

  const primary = jaggedLine(
    origin.px,
    origin.py,
    exit.px,
    exit.py,
    id * 13,
    6 + Math.floor(seeded(id * 12) * 3),
    4,
  );
  cracks.push({ id: `${id}-primary`, kind: 'primary', ...primary });

  const pAngle = Math.atan2(exit.py - origin.py, exit.px - origin.px);
  const inwardAngle = Math.atan2(-origin.ny, -origin.nx);

  // Short stress lines at entry point — only near corners / heavier damage
  const nearCorner =
    (origin.px <= x + pad + 6 || origin.px >= x + w - pad - 6) &&
    (origin.py <= y + pad + 6 || origin.py >= y + h - pad - 6);
  const originFan = nearCorner ? 1 + Math.floor(seeded(id * 15) * 2) : severity > 0.62 ? 1 : 0;
  for (let f = 0; f < originFan; f++) {
    const fanAngle = inwardAngle + (seeded(id + f * 19) - 0.5) * 0.35;
    addMicroFrom(cracks, id, origin.px, origin.py, fanAngle, 0.35, id * 21 + f, 3 + severity * 2);
  }

  // Secondary branches — split off primary propagating into brick body
  const branchCount = severity > 0.35 ? 1 + Math.floor(seeded(id * 25) * (severity > 0.7 ? 2 : 1)) : 1;
  for (let b = 0; b < branchCount; b++) {
    const t = 0.25 + seeded(id * 27 + b) * 0.55;
    const [px, py] = pointAlongPolyline(primary.points, t);
    const side = seeded(id + b * 29) > 0.5 ? 1 : -1;
    const bAngle = pAngle + side * (0.55 + seeded(id + b * 31) * 0.75);
    const bLen = 10 + seeded(id + b * 33) * Math.min(w, h) * (0.22 + severity * 0.16);
    const secondary = jaggedLine(
      px,
      py,
      px + Math.cos(bAngle) * bLen,
      py + Math.sin(bAngle) * bLen,
      id * 35 + b,
      4,
      3,
    );
    cracks.push({ id: `${id}-sec-${b}`, kind: 'secondary', ...secondary });
  }

  // Corner-initiated extra branch when origin is near a corner
  if (nearCorner) {
    const cornerBranch = jaggedLine(
      origin.px,
      origin.py,
      origin.px + (exit.px - origin.px) * (0.35 + seeded(id * 53) * 0.25) + (seeded(id * 55) - 0.5) * w * 0.12,
      origin.py + (exit.py - origin.py) * (0.35 + seeded(id * 57) * 0.25) + (seeded(id * 59) - 0.5) * h * 0.1,
      id * 61,
      4,
      2.5,
    );
    cracks.push({ id: `${id}-corner`, kind: 'secondary', ...cornerBranch });
  }

  return cracks;
}

export function buildBrickGrid(
  width: number,
  height: number,
  brickW: number,
  brickH: number,
  mortar: number,
): BrickCell[] {
  const cells: BrickCell[] = [];
  const unitW = brickW + mortar;
  const unitH = brickH + mortar;
  const rows = Math.ceil(height / unitH) + 1;
  const cols = Math.ceil(width / unitW) + 1;
  let id = 0;

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = -1; col < cols; col++) {
      const x = col * unitW + offset;
      const y = row * unitH;

      cells.push({
        id,
        row,
        col,
        x,
        y,
        w: brickW,
        h: brickH,
        cracks: buildBrickCracks(id, x, y, brickW, brickH),
      });
      id++;
    }
  }

  return cells;
}

export function distToPolyline(px: number, py: number, points: [number, number][]): number {
  let min = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) {
      min = Math.min(min, Math.hypot(px - x1, py - y1));
      continue;
    }
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    min = Math.min(min, Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)));
  }
  return min;
}

/** Distance from point to brick rectangle (0 if inside) */
export function distToRect(px: number, py: number, bx: number, by: number, bw: number, bh: number): number {
  const cx = Math.max(bx, Math.min(px, bx + bw));
  const cy = Math.max(by, Math.min(py, by + bh));
  return Math.hypot(px - cx, py - cy);
}

export function brickGridKey(row: number, col: number): string {
  return `${row},${col}`;
}

export const DESKTOP_BRICK = { w: 248, h: 86, mortar: 5 };
export const MOBILE_BRICK = { w: 176, h: 64, mortar: 4 };
