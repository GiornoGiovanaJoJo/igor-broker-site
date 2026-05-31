import { useEffect, useRef } from 'react';
import {
  BASE_GRID_ALPHA,
  CRACK_DECAY,
  CRACK_GOLD,
  CRACK_GOLD_LIGHT,
  CRACK_IMPULSE,
  CRACK_RADIUS,
  CRACK_WARM,
  MAX_ACTIVE_CELLS,
} from './crackPalette';
import {
  buildHexGrid,
  decayCells,
  findCellsNearPoint,
  hasActiveCells,
  type HexCell,
} from './hexGrid';

function strokeHex(ctx: CanvasRenderingContext2D, cell: HexCell) {
  const [first, ...rest] = cell.vertices;
  ctx.beginPath();
  ctx.moveTo(first[0], first[1]);
  for (const [x, y] of rest) {
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawCell(ctx: CanvasRenderingContext2D, cell: HexCell, dpr: number) {
  const intensity = cell.intensity;

  if (intensity <= 0) {
    ctx.strokeStyle = `rgba(184, 149, 92, ${BASE_GRID_ALPHA})`;
    ctx.lineWidth = 0.5 * dpr;
    ctx.shadowBlur = 0;
    strokeHex(ctx, cell);
    ctx.stroke();
    return;
  }

  const alpha = Math.min(1, intensity);
  const glow = 6 + intensity * 10;

  ctx.save();
  ctx.shadowBlur = glow * dpr;
  ctx.shadowColor = `rgba(212, 188, 132, ${alpha * 0.65})`;

  const fillGrad = ctx.createRadialGradient(cell.cx, cell.cy, 0, cell.cx, cell.cy, 36 * dpr);
  fillGrad.addColorStop(0, `rgba(244, 241, 234, ${alpha * 0.18})`);
  fillGrad.addColorStop(0.45, `rgba(212, 188, 132, ${alpha * 0.12})`);
  fillGrad.addColorStop(1, 'rgba(184, 149, 92, 0)');

  strokeHex(ctx, cell);
  ctx.fillStyle = fillGrad;
  ctx.fill();

  const edgeGrad = ctx.createLinearGradient(
    cell.cx - 20,
    cell.cy - 20,
    cell.cx + 20,
    cell.cy + 20,
  );
  edgeGrad.addColorStop(0, CRACK_GOLD);
  edgeGrad.addColorStop(0.5, CRACK_GOLD_LIGHT);
  edgeGrad.addColorStop(1, CRACK_WARM);

  ctx.strokeStyle = edgeGrad;
  ctx.globalAlpha = alpha * 0.85;
  ctx.lineWidth = (0.8 + intensity * 1.2) * dpr;
  strokeHex(ctx, cell);
  ctx.stroke();
  ctx.restore();
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  cells: HexCell[],
  width: number,
  height: number,
  dpr: number,
) {
  ctx.clearRect(0, 0, width, height);

  for (const cell of cells) {
    if (cell.intensity <= 0) drawCell(ctx, cell, dpr);
  }
  for (const cell of cells) {
    if (cell.intensity > 0) drawCell(ctx, cell, dpr);
  }
}

export function HexCrackCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<HexCell[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, dirty: false });
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cellsRef.current = buildHexGrid(w, h);
      renderFrame(ctx, cellsRef.current, w * dpr, h * dpr, dpr);
    };

    const scheduleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    const applyCrack = (px: number, py: number) => {
      const nearby = findCellsNearPoint(cellsRef.current, px, py, CRACK_RADIUS);
      let count = 0;
      for (const cell of nearby) {
        if (count >= MAX_ACTIVE_CELLS) break;
        const dist = Math.hypot(cell.cx - px, cell.cy - py);
        const falloff = 1 - dist / CRACK_RADIUS;
        cell.intensity = Math.min(1, cell.intensity + CRACK_IMPULSE * falloff);
        count++;
      }
    };

    const tick = () => {
      rafRef.current = 0;
      if (document.visibilityState === 'hidden') {
        runningRef.current = false;
        return;
      }

      const cells = cellsRef.current;
      const mouse = mouseRef.current;

      if (mouse.dirty) {
        applyCrack(mouse.x, mouse.y);
        mouse.dirty = false;
      }

      decayCells(cells, CRACK_DECAY);

      const w = window.innerWidth;
      const h = window.innerHeight;
      renderFrame(ctx, cells, w * dprRef.current, h * dprRef.current, dprRef.current);

      if (hasActiveCells(cells) || mouseRef.current.dirty) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
      }
    };

    const startLoop = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, dirty: true };
      startLoop();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && hasActiveCells(cellsRef.current)) {
        startLoop();
      }
    };

    resize();
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', scheduleResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(scheduleResize);
    ro.observe(document.documentElement);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', scheduleResize);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
