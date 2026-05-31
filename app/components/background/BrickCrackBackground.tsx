import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  brickGridKey,
  buildBrickGrid,
  DESKTOP_BRICK,
  distToRect,
  MOBILE_BRICK,
  type BrickCell,
} from './brickCrackGeometry';

type Props = {
  interactive?: boolean;
  className?: string;
};

const HOVER_RADIUS = 44;
const NEIGHBOR_ROWS = 1;
const NEIGHBOR_COLS = 1;

const Brick = memo(function Brick({ brick }: { brick: BrickCell }) {
  const { x, y, w, h } = brick;
  const shade = 0.03 + (brick.id % 5) * 0.008;

  return (
    <g className="brick-cell">
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
      {brick.cracks.map((crack) => (
        <path
          key={crack.id}
          data-crack-id={crack.id}
          className={`brick-crack brick-crack--${crack.kind}`}
          d={crack.d}
        />
      ))}
    </g>
  );
});

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

export function BrickCrackBackground({ interactive = false, className = '' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const bricksRef = useRef<BrickCell[]>([]);
  const gridRef = useRef<Map<string, number>>(new Map());
  const pathElsRef = useRef<Map<string, SVGPathElement>>(new Map());
  const litCracksRef = useRef<Set<string>>(new Set());
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
    const map = new Map<string, number>();
    for (const b of bricks) map.set(brickGridKey(b.row, b.col), b.id);
    gridRef.current = map;
    litCracksRef.current.clear();

    const pathMap = new Map<string, SVGPathElement>();
    svgRef.current?.querySelectorAll<SVGPathElement>('path[data-crack-id]').forEach((el) => {
      const id = el.getAttribute('data-crack-id');
      if (id) pathMap.set(id, el);
    });
    pathElsRef.current = pathMap;
  }, [bricks]);

  const applyLitCracks = useCallback((next: Set<string>) => {
    const prev = litCracksRef.current;
    if (setsEqual(prev, next)) return;

    const pathEls = pathElsRef.current;
    for (const id of prev) {
      if (next.has(id)) continue;
      pathEls.get(id)?.classList.remove('brick-crack--lit');
    }
    for (const id of next) {
      if (prev.has(id)) continue;
      pathEls.get(id)?.classList.add('brick-crack--lit');
    }

    litCracksRef.current = next;
  }, []);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM()?.inverse();
    if (!ctm) return null;
    const p = pt.matrixTransform(ctm);
    return { x: p.x, y: p.y };
  }, []);

  const expandNeighbors = useCallback((seedIds: Set<number>) => {
    const expanded = new Set(seedIds);
    const map = gridRef.current;
    for (const brickId of seedIds) {
      const brick = bricksRef.current[brickId];
      if (!brick) continue;
      for (let dr = -NEIGHBOR_ROWS; dr <= NEIGHBOR_ROWS; dr++) {
        for (let dc = -NEIGHBOR_COLS; dc <= NEIGHBOR_COLS; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nid = map.get(brickGridKey(brick.row + dr, brick.col + dc));
          if (nid !== undefined) expanded.add(nid);
        }
      }
    }
    return expanded;
  }, []);

  useEffect(() => {
    if (!interactive) return;

    let raf = 0;
    const radius = HOVER_RADIUS;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const svgPt = clientToSvg(e.clientX, e.clientY);
        if (!svgPt) return;

        const { x, y } = svgPt;
        const litSeed = new Set<number>();
        const pad = radius;

        for (const brick of bricksRef.current) {
          if (x < brick.x - pad || x > brick.x + brick.w + pad) continue;
          if (y < brick.y - pad || y > brick.y + brick.h + pad) continue;
          if (distToRect(x, y, brick.x, brick.y, brick.w, brick.h) < radius) {
            litSeed.add(brick.id);
          }
        }

        const litBrickIds = expandNeighbors(litSeed);
        const nearby = new Set<string>();
        for (const brickId of litBrickIds) {
          const brick = bricksRef.current[brickId];
          if (!brick) continue;
          for (const crack of brick.cracks) nearby.add(crack.id);
        }

        applyLitCracks(nearby);
      });
    };

    const onLeave = () => applyLitCracks(new Set());

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [interactive, clientToSvg, expandNeighbors, applyLitCracks]);

  return (
    <svg
      ref={svgRef}
      className={`brick-crack-bg ${interactive ? 'brick-crack-bg--interactive' : ''} ${className}`.trim()}
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${size.w} ${size.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="brick-face-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e2c2a" />
          <stop offset="45%" stopColor="#1c1b19" />
          <stop offset="100%" stopColor="#0f0e0d" />
        </linearGradient>
        <filter id="crack-gold-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f4e8c8" floodOpacity="0.95" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#b8955c" floodOpacity="0.5" />
        </filter>
      </defs>

      <rect className="brick-mortar-bg" width={size.w} height={size.h} />

      {bricks.map((brick) => (
        <Brick key={brick.id} brick={brick} />
      ))}
    </svg>
  );
}
