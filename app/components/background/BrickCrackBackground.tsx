import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildBrickGrid,
  buildMortarGrid,
  DESKTOP_BRICK,
  MOBILE_BRICK,
  type BrickCell,
} from './brickCrackGeometry';

type Props = {
  interactive?: boolean;
  className?: string;
};

/** Simulation grid — small cells hit 5px mortar; rendered via upscaled texture */
const HEAT_CELL = 8;
const DECAY = 0.968;
const STAMP_RADIUS = 150;
const STAMP_PEAK = 0.95;
const GLOW_RADIUS = 240;
const INNER_GLOW_RADIUS = 90;
const HEAT_THRESHOLD = 0.035;
const MORTAR_MASK_INSET = 0.85;
const GLOW_BLUR_PX = 1.75;

function getDpr(): number {
  return Math.min(window.devicePixelRatio || 1, 2.5);
}

const Brick = memo(function Brick({ brick }: { brick: BrickCell }) {
  const { x, y, w, h } = brick;
  const shade = 0.03 + (brick.id % 5) * 0.008;

  return (
    <rect
      className="brick-face"
      x={x}
      y={y}
      width={w}
      height={h}
      rx={1.5}
      ry={1.5}
      style={{ ['--brick-shade' as string]: shade }}
    />
  );
});

function createHeatGrid(w: number, h: number) {
  const cols = Math.ceil(w / HEAT_CELL) + 1;
  const rows = Math.ceil(h / HEAT_CELL) + 1;
  return { cols, rows, data: new Float32Array(cols * rows) };
}

function stampRadial(
  grid: Float32Array,
  mortarGrid: Uint8Array,
  cols: number,
  rows: number,
  cx: number,
  cy: number,
  radius: number,
  peak: number,
) {
  const c0 = Math.max(0, Math.floor((cx - radius) / HEAT_CELL));
  const c1 = Math.min(cols - 1, Math.ceil((cx + radius) / HEAT_CELL));
  const r0 = Math.max(0, Math.floor((cy - radius) / HEAT_CELL));
  const r1 = Math.min(rows - 1, Math.ceil((cy + radius) / HEAT_CELL));
  const r2 = radius * radius;

  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      const i = row * cols + col;
      if (!mortarGrid[i]) continue;

      const px = col * HEAT_CELL + HEAT_CELL * 0.5;
      const py = row * HEAT_CELL + HEAT_CELL * 0.5;
      const d2 = (px - cx) ** 2 + (py - cy) ** 2;
      if (d2 > r2) continue;
      const t = 1 - Math.sqrt(d2) / radius;
      const add = peak * t * t;
      grid[i] = Math.min(1, grid[i] + add);
    }
  }
}

function sampleHeat(
  grid: Float32Array,
  cols: number,
  rows: number,
  x: number,
  y: number,
): number {
  const col = Math.min(cols - 1, Math.max(0, Math.floor(x / HEAT_CELL)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor(y / HEAT_CELL)));
  return grid[row * cols + col];
}

function createMortarMaskCanvas(
  w: number,
  h: number,
  bricks: BrickCell[],
  dpr: number,
): HTMLCanvasElement {
  const mask = document.createElement('canvas');
  mask.width = Math.floor(w * dpr);
  mask.height = Math.floor(h * dpr);
  const mctx = mask.getContext('2d');
  if (!mctx) return mask;

  mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mctx.fillStyle = '#fff';
  mctx.fillRect(0, 0, w, h);
  mctx.globalCompositeOperation = 'destination-out';
  mctx.fillStyle = '#000';
  const inset = MORTAR_MASK_INSET;
  for (const b of bricks) {
    mctx.fillRect(b.x + inset, b.y + inset, b.w - inset * 2, b.h - inset * 2);
  }
  return mask;
}

function clipToMortar(ctx: CanvasRenderingContext2D, mask: HTMLCanvasElement, w: number, h: number) {
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(mask, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

function paintMortarGlow(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  intensity: number,
) {
  const peak = Math.min(1, intensity);

  const outer = ctx.createRadialGradient(gx, gy, 0, gx, gy, GLOW_RADIUS);
  outer.addColorStop(0, `rgba(255, 248, 235, ${0.62 * peak})`);
  outer.addColorStop(0.2, `rgba(244, 232, 200, ${0.42 * peak})`);
  outer.addColorStop(0.45, `rgba(212, 188, 132, ${0.22 * peak})`);
  outer.addColorStop(0.7, `rgba(184, 149, 92, ${0.08 * peak})`);
  outer.addColorStop(1, 'rgba(184, 149, 92, 0)');
  ctx.fillStyle = outer;
  ctx.fillRect(gx - GLOW_RADIUS, gy - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);

  const inner = ctx.createRadialGradient(gx, gy, 0, gx, gy, INNER_GLOW_RADIUS);
  inner.addColorStop(0, `rgba(255, 252, 245, ${0.85 * peak})`);
  inner.addColorStop(0.5, `rgba(240, 219, 160, ${0.35 * peak})`);
  inner.addColorStop(1, 'rgba(240, 219, 160, 0)');
  ctx.fillStyle = inner;
  ctx.fillRect(gx - INNER_GLOW_RADIUS, gy - INNER_GLOW_RADIUS, INNER_GLOW_RADIUS * 2, INNER_GLOW_RADIUS * 2);
}

function paintHeatLayer(
  ctx: CanvasRenderingContext2D,
  heatTex: HTMLCanvasElement,
  data: Float32Array,
  mortarGrid: Uint8Array,
  cols: number,
  rows: number,
  w: number,
  h: number,
) {
  heatTex.width = cols;
  heatTex.height = rows;
  const tctx = heatTex.getContext('2d', { alpha: true });
  if (!tctx) return;

  const img = tctx.createImageData(cols, rows);
  const px = img.data;
  for (let ci = 0; ci < data.length; ci++) {
    if (!mortarGrid[ci]) continue;
    const heat = data[ci];
    if (heat < HEAT_THRESHOLD) continue;

    const col = ci % cols;
    const row = (ci / cols) | 0;
    const i = (row * cols + col) * 4;
    const a = Math.min(255, Math.floor((0.4 + heat * 0.6) * 255));
    px[i] = 255;
    px[i + 1] = 246;
    px[i + 2] = 232;
    px[i + 3] = a;
  }
  tctx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(heatTex, 0, 0, cols, rows, 0, 0, w, h);
}

export function BrickCrackBackground({ interactive = false, className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowBufRef = useRef<HTMLCanvasElement | null>(null);
  const blurBufRef = useRef<HTMLCanvasElement | null>(null);
  const heatTexRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1, y: -1, active: false });
  const heatRef = useRef<ReturnType<typeof createHeatGrid> | null>(null);
  const mortarGridRef = useRef<Uint8Array>(new Uint8Array(0));
  const mortarMaskRef = useRef<HTMLCanvasElement | null>(null);
  const bricksRef = useRef<BrickCell[]>([]);
  const [size, setSize] = useState({ w: 1440, h: 900, mobile: false });

  useEffect(() => {
    const update = () =>
      setSize({
        w: window.innerWidth,
        h: window.innerHeight,
        mobile: window.matchMedia('(max-width: 768px)').matches,
      });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const brickSpec = size.mobile ? MOBILE_BRICK : DESKTOP_BRICK;
  const bricks = useMemo(
    () => buildBrickGrid(size.w, size.h, brickSpec.w, brickSpec.h, brickSpec.mortar),
    [size.w, size.h, brickSpec.w, brickSpec.h, brickSpec.mortar],
  );

  useEffect(() => {
    bricksRef.current = bricks;
    const grid = createHeatGrid(size.w, size.h);
    heatRef.current = grid;
    mortarGridRef.current = buildMortarGrid(bricks, grid.cols, grid.rows, HEAT_CELL);
    const dpr = getDpr();
    mortarMaskRef.current = createMortarMaskCanvas(size.w, size.h, bricks, dpr);
  }, [bricks, size.w, size.h]);

  useEffect(() => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let looping = false;

    const ensureBuffers = (w: number, h: number, dpr: number) => {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!glowBufRef.current) glowBufRef.current = document.createElement('canvas');
      if (!blurBufRef.current) blurBufRef.current = document.createElement('canvas');
      if (!heatTexRef.current) heatTexRef.current = document.createElement('canvas');
      const glowBuf = glowBufRef.current;
      const blurBuf = blurBufRef.current;
      glowBuf.width = Math.floor(w * dpr);
      glowBuf.height = Math.floor(h * dpr);
      blurBuf.width = glowBuf.width;
      blurBuf.height = glowBuf.height;

      const grid = createHeatGrid(w, h);
      heatRef.current = grid;
      mortarGridRef.current = buildMortarGrid(bricksRef.current, grid.cols, grid.rows, HEAT_CELL);
      mortarMaskRef.current = createMortarMaskCanvas(w, h, bricksRef.current, dpr);
    };

    const scheduleTick = () => {
      if (!running || looping) return;
      looping = true;
      raf = requestAnimationFrame(tick);
    };

    const dpr = getDpr();
    ensureBuffers(size.w, size.h, dpr);

    const clientToLocal = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      const scaleX = size.w / rect.width;
      const scaleY = size.h / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const onMove = (e: MouseEvent) => {
      const pt = clientToLocal(e.clientX, e.clientY);
      mouseRef.current = { x: pt.x, y: pt.y, active: true };
      scheduleTick();
    };

    const onLeave = () => {
      mouseRef.current.active = false;
      scheduleTick();
    };

    const tick = () => {
      if (!running) return;
      looping = false;

      const heat = heatRef.current;
      const mortarMask = mortarMaskRef.current;
      const mortarGrid = mortarGridRef.current;
      const glowBuf = glowBufRef.current;
      const blurBuf = blurBufRef.current;
      const heatTex = heatTexRef.current;
      if (!heat || !mortarMask || !glowBuf || !blurBuf || !heatTex) {
        scheduleTick();
        return;
      }

      const { data, cols, rows } = heat;
      const dpr = getDpr();
      for (let i = 0; i < data.length; i++) {
        data[i] *= DECAY;
        if (data[i] < 0.003) data[i] = 0;
      }

      const mouse = mouseRef.current;
      if (mouse.active && mouse.x >= 0) {
        stampRadial(data, mortarGrid, cols, rows, mouse.x, mouse.y, STAMP_RADIUS, STAMP_PEAK);
      }

      let hasHeat = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > HEAT_THRESHOLD && mortarGrid[i]) {
          hasHeat = true;
          break;
        }
      }

      if (!mouse.active && !hasHeat) {
        ctx.clearRect(0, 0, size.w, size.h);
        return;
      }

      const gctx = glowBuf.getContext('2d');
      if (!gctx) {
        scheduleTick();
        return;
      }
      gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gctx.clearRect(0, 0, size.w, size.h);

      if (mouse.active) {
        const peak = sampleHeat(data, cols, rows, mouse.x, mouse.y);
        paintMortarGlow(gctx, mouse.x, mouse.y, Math.max(peak, 0.35));
      } else if (hasHeat) {
        let maxH = 0;
        let maxX = 0;
        let maxY = 0;
        for (let ci = 0; ci < data.length; ci++) {
          if (!mortarGrid[ci] || data[ci] <= maxH) continue;
          maxH = data[ci];
          const col = ci % cols;
          const row = (ci / cols) | 0;
          maxX = col * HEAT_CELL + HEAT_CELL * 0.5;
          maxY = row * HEAT_CELL + HEAT_CELL * 0.5;
        }
        paintMortarGlow(gctx, maxX, maxY, maxH);
      }

      paintHeatLayer(gctx, heatTex, data, mortarGrid, cols, rows, size.w, size.h);
      clipToMortar(gctx, mortarMask, size.w, size.h);

      const bctx = blurBuf.getContext('2d');
      if (!bctx) {
        scheduleTick();
        return;
      }
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, size.w, size.h);
      bctx.imageSmoothingEnabled = true;
      bctx.imageSmoothingQuality = 'high';
      bctx.filter = `blur(${GLOW_BLUR_PX}px)`;
      bctx.drawImage(glowBuf, 0, 0, size.w, size.h);
      bctx.filter = 'none';

      ctx.clearRect(0, 0, size.w, size.h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(blurBuf, 0, 0, size.w, size.h);
      ctx.globalCompositeOperation = 'source-over';

      scheduleTick();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        looping = false;
      } else if (
        running &&
        (mouseRef.current.active ||
          heatRef.current?.data.some((v, i) => v > HEAT_THRESHOLD && mortarGridRef.current[i]))
      ) {
        scheduleTick();
      }
    };

    const onResize = () => {
      ensureBuffers(size.w, size.h, getDpr());
    };
    window.addEventListener('resize', onResize);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [interactive, size.w, size.h]);

  return (
    <div ref={wrapRef} className={`brick-wall-bg ${className}`.trim()} aria-hidden>
      <svg
        className="brick-wall-bg__svg"
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="brick-face-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e2c2a" />
            <stop offset="45%" stopColor="#1c1b19" />
            <stop offset="100%" stopColor="#0f0e0d" />
          </linearGradient>
        </defs>
        <rect className="brick-mortar-bg" width={size.w} height={size.h} />
        {bricks.map((brick) => (
          <Brick key={brick.id} brick={brick} />
        ))}
      </svg>
      {interactive && (
        <canvas ref={canvasRef} className="brick-wall-bg__glow" width={size.w} height={size.h} />
      )}
    </div>
  );
}
