export type BrickCell = {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

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

/** Spatial hash: which bricks overlap a heat cell */
export function buildBrickCellIndex(bricks: BrickCell[], cellSize: number): Map<number, BrickCell[]> {
  const map = new Map<number, BrickCell[]>();

  for (const b of bricks) {
    const c0 = Math.floor(b.x / cellSize);
    const c1 = Math.floor((b.x + b.w) / cellSize);
    const r0 = Math.floor(b.y / cellSize);
    const r1 = Math.floor((b.y + b.h) / cellSize);

    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        const key = row * 4096 + col;
        const list = map.get(key);
        if (list) list.push(b);
        else map.set(key, [b]);
      }
    }
  }

  return map;
}

export function isMortarAt(
  x: number,
  y: number,
  brickIndex: Map<number, BrickCell[]>,
  cellSize: number,
): boolean {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  const list = brickIndex.get(row * 4096 + col);
  if (!list) return true;

  for (const b of list) {
    if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return false;
  }

  return true;
}

/** 1 = mortar gap, 0 = brick — one value per heat cell (no overlap) */
export function buildMortarGrid(
  bricks: BrickCell[],
  cols: number,
  rows: number,
  cellSize: number,
): Uint8Array {
  const brickIndex = buildBrickCellIndex(bricks, cellSize);
  const grid = new Uint8Array(cols * rows);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize + cellSize * 0.5;
      const y = row * cellSize + cellSize * 0.5;
      grid[row * cols + col] = isMortarAt(x, y, brickIndex, cellSize) ? 1 : 0;
    }
  }

  return grid;
}

export function brickGridKey(row: number, col: number): string {
  return `${row},${col}`;
}

export const DESKTOP_BRICK = { w: 248, h: 86, mortar: 5 };
export const MOBILE_BRICK = { w: 176, h: 64, mortar: 4 };
