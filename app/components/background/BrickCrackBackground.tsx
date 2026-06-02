import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildBrickGrid,
  buildMortarJoints,
  DESKTOP_BRICK,
  MOBILE_BRICK,
  type BrickCell,
  type MortarJoint,
} from './brickCrackGeometry';

type Props = {
  interactive?: boolean;
  className?: string;
};

/** Coarse heat grid — cheap decay + radial stamp */
const HEAT_CELL = 40;
const DECAY = 0.965;
const STAMP_RADIUS = 130;
const STAMP_PEAK = 0.55;
const GLOW_RADIUS = 200;
const JOINT_HEAT_THRESHOLD = 0.06;

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
      const px = col * HEAT_CELL + HEAT_CELL * 0.5;
      const py = row * HEAT_CELL + HEAT_CELL * 0.5;
      const d2 = (px - cx) ** 2 + (py - cy) ** 2;
      if (d2 > r2) continue;
      const t = 1 - Math.sqrt(d2) / radius;
      const add = peak * t * t;
      const i = row * cols + col;
      grid[i] = Math.min(1, grid[i] + add);
    }
  }
}

function jointCellIndices(
  joint: MortarJoint,
  cols: number,
  rows: number,
): number[] {
  const mx = (joint.x1 + joint.x2) * 0.5;
  const my = (joint.y1 + joint.y2) * 0.5;
  const col = Math.min(cols - 1, Math.max(0, Math.floor(mx / HEAT_CELL)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor(my / HEAT_CELL)));
  const i = row * cols + col;
  const out = [i];
  if (col > 0) out.push(i - 1);
  if (col < cols - 1) out.push(i + 1);
  if (row > 0) out.push(i - cols);
  if (row < rows - 1) out.push(i + cols);
  return out;
}

function buildJointIndex(joints: MortarJoint[], cols: number, rows: number) {
  const byCell = new Map<number, number[]>();
  for (let j = 0; j < joints.length; j++) {
    for (const cell of jointCellIndices(joints[j], cols, rows)) {
      let list = byCell.get(cell);
      if (!list) {
        list = [];
        byCell.set(cell, list);
      }
      if (list[list.length - 1] !== j) list.push(j);
    }
  }
  return byCell;
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

export function BrickCrackBackground({ interactive = false, className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1, y: -1, active: false });
  const heatRef = useRef<ReturnType<typeof createHeatGrid> | null>(null);
  const jointsRef = useRef<MortarJoint[]>([]);
  const jointIndexRef = useRef<Map<number, number[]>>(new Map());
  const mortarRef = useRef(5);
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

  const joints = useMemo(() => buildMortarJoints(bricks), [bricks]);

  useEffect(() => {
    jointsRef.current = joints;
    mortarRef.current = brickSpec.mortar;
    const grid = createHeatGrid(size.w, size.h);
    heatRef.current = grid;
    jointIndexRef.current = buildJointIndex(joints, grid.cols, grid.rows);
  }, [joints, brickSpec.mortar, size.w, size.h]);

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

    const scheduleTick = () => {
      if (!running || looping) return;
      looping = true;
      raf = requestAnimationFrame(tick);
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = size.w;
      const h = size.h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const grid = createHeatGrid(w, h);
      heatRef.current = grid;
      jointIndexRef.current = buildJointIndex(jointsRef.current, grid.cols, grid.rows);
    };

    resizeCanvas();

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
      if (!heat) {
        scheduleTick();
        return;
      }

      const { data, cols, rows } = heat;
      for (let i = 0; i < data.length; i++) {
        data[i] *= DECAY;
        if (data[i] < 0.004) data[i] = 0;
      }

      const mouse = mouseRef.current;
      if (mouse.active && mouse.x >= 0) {
        stampRadial(data, cols, rows, mouse.x, mouse.y, STAMP_RADIUS, STAMP_PEAK);
      }

      let hasHeat = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > JOINT_HEAT_THRESHOLD) {
          hasHeat = true;
          break;
        }
      }

      if (!mouse.active && !hasHeat) {
        ctx.clearRect(0, 0, size.w, size.h);
        return;
      }

      ctx.clearRect(0, 0, size.w, size.h);

      let peak = 0;
      if (mouse.active) {
        peak = sampleHeat(data, cols, rows, mouse.x, mouse.y);
        const g = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          GLOW_RADIUS,
        );
        g.addColorStop(0, `rgba(244, 232, 200, ${0.22 * peak})`);
        g.addColorStop(0.35, `rgba(184, 149, 92, ${0.1 * peak})`);
        g.addColorStop(1, 'rgba(184, 149, 92, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - GLOW_RADIUS, mouse.y - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);
      } else if (hasHeat) {
        let maxH = 0;
        let maxX = 0;
        let maxY = 0;
        for (let ci = 0; ci < data.length; ci++) {
          if (data[ci] <= maxH) continue;
          maxH = data[ci];
          const col = ci % cols;
          const row = (ci / cols) | 0;
          maxX = col * HEAT_CELL + HEAT_CELL * 0.5;
          maxY = row * HEAT_CELL + HEAT_CELL * 0.5;
        }
        const g = ctx.createRadialGradient(maxX, maxY, 0, maxX, maxY, GLOW_RADIUS);
        g.addColorStop(0, `rgba(244, 232, 200, ${0.18 * maxH})`);
        g.addColorStop(0.4, `rgba(184, 149, 92, ${0.08 * maxH})`);
        g.addColorStop(1, 'rgba(184, 149, 92, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(maxX - GLOW_RADIUS, maxY - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);
      }

      const lineW = mortarRef.current + 1.5;
      const jointList = jointsRef.current;
      const jointIndex = jointIndexRef.current;
      const drawn = new Set<number>();

      ctx.lineCap = 'round';
      ctx.lineWidth = lineW;

      for (let ci = 0; ci < data.length; ci++) {
        const cellHeat = data[ci];
        if (cellHeat < JOINT_HEAT_THRESHOLD) continue;
        const list = jointIndex.get(ci);
        if (!list) continue;

        for (let k = 0; k < list.length; k++) {
          const j = list[k];
          if (drawn.has(j)) continue;
          drawn.add(j);

          const joint = jointList[j];
          const h = sampleHeat(
            data,
            cols,
            rows,
            (joint.x1 + joint.x2) * 0.5,
            (joint.y1 + joint.y2) * 0.5,
          );
          if (h < JOINT_HEAT_THRESHOLD) continue;

          ctx.strokeStyle = `rgba(244, 228, 192, ${Math.min(0.95, h * 1.15)})`;
          ctx.beginPath();
          ctx.moveTo(joint.x1, joint.y1);
          ctx.lineTo(joint.x2, joint.y2);
          ctx.stroke();
        }
      }

      scheduleTick();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        looping = false;
      } else if (running && (mouseRef.current.active || heatRef.current?.data.some((v) => v > JOINT_HEAT_THRESHOLD))) {
        scheduleTick();
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
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
