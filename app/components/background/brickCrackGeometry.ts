export type BrickCell = {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type MortarJoint = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function edgeKey(x1: number, y1: number, x2: number, y2: number): string {
  const ax = Math.round(x1);
  const ay = Math.round(y1);
  const bx = Math.round(x2);
  const by = Math.round(y2);
  return ax < bx || (ax === bx && ay <= by) ? `${ax},${ay},${bx},${by}` : `${bx},${by},${ax},${ay}`;
}

/** Unique mortar seam segments along brick perimeters (shared edges deduped). */
export function buildMortarJoints(bricks: BrickCell[]): MortarJoint[] {
  const seen = new Set<string>();
  const joints: MortarJoint[] = [];

  for (const b of bricks) {
    const edges: [number, number, number, number][] = [
      [b.x, b.y, b.x + b.w, b.y],
      [b.x, b.y + b.h, b.x + b.w, b.y + b.h],
      [b.x, b.y, b.x, b.y + b.h],
      [b.x + b.w, b.y, b.x + b.w, b.y + b.h],
    ];

    for (const [x1, y1, x2, y2] of edges) {
      const key = edgeKey(x1, y1, x2, y2);
      if (seen.has(key)) continue;
      seen.add(key);
      joints.push({ id: key, x1, y1, x2, y2 });
    }
  }

  return joints;
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
      cells.push({
        id,
        row,
        col,
        x: col * unitW + offset,
        y: row * unitH,
        w: brickW,
        h: brickH,
      });
      id++;
    }
  }

  return cells;
}

export function brickGridKey(row: number, col: number): string {
  return `${row},${col}`;
}

export const DESKTOP_BRICK = { w: 248, h: 86, mortar: 5 };
export const MOBILE_BRICK = { w: 176, h: 64, mortar: 4 };
