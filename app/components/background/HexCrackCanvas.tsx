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

function strokeHexPath(ctx: CanvasRenderingContext2D, cell: HexCell) {
  const [first, ...rest] = cell.vertices;
  ctx.beginPath();
  ctx.moveTo(first[0], first[1]);
  for (const [x, y] of rest) {
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawIdleCell(ctx: CanvasRenderingContext2D, cell: HexCell) {
  ctx.save();
  ctx.strokeStyle = `rgba(184, 149, 92, ${BASE_GRID_ALPHA})`;
  ctx.lineWidth = 0.75;
  strokeHexPath(ctx, cell);
  ctx.stroke();
  ctx.restore();
}

function drawCrackedCell(ctx: CanvasRenderingContext2D, cell: HexCell) {
  const intensity = Math.min(1, cell.intensity);
  const glow = 12 + intensity * 22;

  ctx.save();

  // Light leaking through the crack
  const fillGrad = ctx.createRadialGradient(cell.cx, cell.cy, 0, cell.cx, cell.cy, 42);
  fillGrad.addColorStop(0, `rgba(244, 241, 234, ${intensity * 0.35})`);
  fillGrad.addColorStop(0.35, `rgba(212, 188, 132, ${intensity * 0.22})`);
  fillGrad.addColorStop(0.7, `rgba(184, 149, 92, ${intensity * 0.08})`);
  fillGrad.addColorStop(1, 'rgba(184, 149, 92, 0)');

  strokeHexPath(ctx, cell);
  ctx.fillStyle = fillGrad;
  ctx.fill();

  ctx.shadowBlur = glow;
  ctx.shadowColor = `rgba(212, 188, 132, ${intensity * 0.85})`;

  const edgeGrad = ctx.createLinearGradient(
    cell.cx - 28,
    cell.cy - 28,
    cell.cx + 28,
    cell.cy + 28,
  );
  edgeGrad.addColorStop(0, CRACK_GOLD);
  edgeGrad.addColorStop(0.45, CRACK_GOLD_LIGHT);
  edgeGrad.addColorStop(1, CRACK_WARM);

  ctx.strokeStyle = edgeGrad;
  ctx.globalAlpha = 0.55 + intensity * 0.45;
  ctx.lineWidth = 1.1 + intensity * 1.6;
  strokeHexPath(ctx, cell);
  ctx.stroke();
  ctx.restore();
}

function renderFrame(ctx: CanvasRenderingContext2D, cells: HexCell[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);

  for (const cell of cells) {
    if (cell.intensity <= 0) drawIdleCell(ctx, cell);
  }
  for (const cell of cells) {
    if (cell.intensity > 0) drawCrackedCell(ctx, cell);
  }
}

export function HexCrackCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<HexCell[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, dirty: false });
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cellsRef.current = buildHexGrid(w, h, 34);
      renderFrame(ctx, cellsRef.current, w, h);
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
        if (falloff <= 0) continue;
        cell.intensity = Math.min(1, cell.intensity + CRACK_IMPULSE * falloff * falloff);
        count++;
      }
    };

    const tick = () => {
      rafRef.current = 0;
      if (document.visibilityState === 'hidden') {
        runningRef.current = false;
        return;
      }

      const { w, h } = sizeRef.current;
      const cells = cellsRef.current;
      const mouse = mouseRef.current;

      if (mouse.dirty) {
        applyCrack(mouse.x, mouse.y);
        mouse.dirty = false;
      }

      decayCells(cells, CRACK_DECAY);
      renderFrame(ctx, cells, w, h);

      if (hasActiveCells(cells, 0.015) || mouseRef.current.dirty) {
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
      if (document.visibilityState === 'visible') {
        startLoop();
      }
    };

    resize();
    startLoop();
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
      className="absolute inset-0 z-[1] h-full w-full"
      aria-hidden
    />
  );
}
