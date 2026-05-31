export type HexCell = {
  id: number;
  cx: number;
  cy: number;
  /** Flat-top hex vertices [x,y] × 6 */
  vertices: [number, number][];
  intensity: number;
};

const SQRT3 = Math.sqrt(3);

/** Flat-top hexagon radius (center to vertex) */
function hexVertices(cx: number, cy: number, r: number): [number, number][] {
  const verts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return verts;
}

export function buildHexGrid(width: number, height: number, hexRadius = 36): HexCell[] {
  const cells: HexCell[] = [];
  const horiz = SQRT3 * hexRadius;
  const vert = 1.5 * hexRadius;
  const cols = Math.ceil(width / horiz) + 2;
  const rows = Math.ceil(height / vert) + 2;
  let id = 0;

  for (let row = -1; row < rows; row++) {
    const offsetX = row % 2 !== 0 ? horiz / 2 : 0;
    for (let col = -1; col < cols; col++) {
      const cx = col * horiz + offsetX;
      const cy = row * vert;
      cells.push({
        id: id++,
        cx,
        cy,
        vertices: hexVertices(cx, cy, hexRadius * 0.98),
        intensity: 0,
      });
    }
  }

  return cells;
}

export function findCellsNearPoint(
  cells: HexCell[],
  px: number,
  py: number,
  radius: number,
): HexCell[] {
  const r2 = radius * radius;
  const result: HexCell[] = [];

  for (const cell of cells) {
    const dx = cell.cx - px;
    const dy = cell.cy - py;
    if (dx * dx + dy * dy <= r2) {
      result.push(cell);
    }
  }

  result.sort((a, b) => {
    const da = (a.cx - px) ** 2 + (a.cy - py) ** 2;
    const db = (b.cx - px) ** 2 + (b.cy - py) ** 2;
    return da - db;
  });

  return result;
}

export function hasActiveCells(cells: HexCell[], threshold = 0.008): boolean {
  for (const cell of cells) {
    if (cell.intensity > threshold) return true;
  }
  return false;
}

export function decayCells(cells: HexCell[], factor: number): void {
  for (const cell of cells) {
    if (cell.intensity > 0) {
      cell.intensity *= factor;
      if (cell.intensity < 0.008) cell.intensity = 0;
    }
  }
}
