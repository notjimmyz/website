import { bilerp, iso, isoPoints } from "./project";

export type BoxColors = {
  top: string;
  left: string;
  right: string;
};

type IsoBoxProps = {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
} & BoxColors;

export function IsoBox({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  top,
  left,
  right,
}: IsoBoxProps) {
  return (
    <g>
      <polygon
        points={isoPoints([
          [x, y, z + h],
          [x + w, y, z + h],
          [x + w, y + d, z + h],
          [x, y + d, z + h],
        ])}
        fill={top}
      />
      <polygon
        points={isoPoints([
          [x, y + d, z + h],
          [x + w, y + d, z + h],
          [x + w, y + d, z],
          [x, y + d, z],
        ])}
        fill={left}
      />
      <polygon
        points={isoPoints([
          [x + w, y, z + h],
          [x + w, y + d, z + h],
          [x + w, y + d, z],
          [x + w, y, z],
        ])}
        fill={right}
      />
    </g>
  );
}

export function IsoSlab({
  x,
  y,
  z = 0,
  w,
  d,
  h = 0.16,
  top,
  left,
  right,
}: Omit<IsoBoxProps, "h"> & { h?: number }) {
  return <IsoBox x={x} y={y} z={z} w={w} d={d} h={h} top={top} left={left} right={right} />;
}

export function IsoGable({
  x,
  y,
  z,
  w,
  d,
  rise,
  left,
  right,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  rise: number;
  left: string;
  right: string;
}) {
  const mid = y + d / 2;

  return (
    <g>
      <polygon
        points={isoPoints([
          [x, y, z],
          [x + w, y, z],
          [x + w, mid, z + rise],
          [x, mid, z + rise],
        ])}
        fill={right}
      />
      <polygon
        points={isoPoints([
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, mid, z + rise],
          [x, mid, z + rise],
        ])}
        fill={left}
      />
      <polygon
        points={isoPoints([
          [x + w, y, z],
          [x + w, mid, z + rise],
          [x + w, y + d, z],
        ])}
        fill={right}
      />
    </g>
  );
}

export function IsoCone({
  x,
  y,
  z,
  w,
  d,
  rise,
  left,
  right,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  rise: number;
  left: string;
  right: string;
}) {
  const peak: [number, number, number] = [x + w / 2, y + d / 2, z + rise];

  return (
    <g>
      <polygon points={isoPoints([peak, [x + w, y, z], [x + w, y + d, z]])} fill={right} />
      <polygon points={isoPoints([peak, [x + w, y + d, z], [x, y + d, z]])} fill={left} />
    </g>
  );
}

export function IsoTimber({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  fill = "#4A4038",
}: {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  fill?: string;
}) {
  const p00 = iso(x, y + d, z + h);
  const p10 = iso(x + w, y + d, z + h);
  const p11 = iso(x + w, y + d, z);
  const p01 = iso(x, y + d, z);
  const strips: Array<[number, number, number, number]> = [
    [0.02, 0.98, 0.3, 0.36],
    [0.02, 0.98, 0.62, 0.68],
    [0.08, 0.14, 0.08, 0.92],
    [0.46, 0.54, 0.08, 0.92],
    [0.86, 0.92, 0.08, 0.92],
  ];

  return (
    <g>
      {strips.map(([ua, ub, va, vb], index) => {
        const q0 = bilerp(p00, p10, p11, p01, ua, va);
        const q1 = bilerp(p00, p10, p11, p01, ub, va);
        const q2 = bilerp(p00, p10, p11, p01, ub, vb);
        const q3 = bilerp(p00, p10, p11, p01, ua, vb);
        return (
          <polygon
            key={index}
            points={`${q0.x},${q0.y} ${q1.x},${q1.y} ${q2.x},${q2.y} ${q3.x},${q3.y}`}
            fill={fill}
          />
        );
      })}
    </g>
  );
}

export function IsoWindows({
  face,
  x,
  y,
  z = 0,
  w,
  d,
  h,
  cols,
  rows,
  fill = "#D7E8F0",
  u0 = 0.12,
  u1 = 0.88,
  v0 = 0.1,
  v1 = 0.58,
}: {
  face: "left" | "right";
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  cols: number;
  rows: number;
  fill?: string;
  u0?: number;
  u1?: number;
  v0?: number;
  v1?: number;
}) {
  const p00 =
    face === "left" ? iso(x, y + d, z + h) : iso(x + w, y, z + h);
  const p10 =
    face === "left" ? iso(x + w, y + d, z + h) : iso(x + w, y + d, z + h);
  const p11 =
    face === "left" ? iso(x + w, y + d, z) : iso(x + w, y + d, z);
  const p01 =
    face === "left" ? iso(x, y + d, z) : iso(x + w, y, z);

  const windows = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const colSpan = (u1 - u0) / cols;
      const rowSpan = (v1 - v0) / rows;
      const ua = u0 + col * colSpan + colSpan * 0.16;
      const ub = u0 + col * colSpan + colSpan * 0.78;
      const va = v0 + row * rowSpan + rowSpan * 0.18;
      const vb = v0 + row * rowSpan + rowSpan * 0.82;
      const q0 = bilerp(p00, p10, p11, p01, ua, va);
      const q1 = bilerp(p00, p10, p11, p01, ub, va);
      const q2 = bilerp(p00, p10, p11, p01, ub, vb);
      const q3 = bilerp(p00, p10, p11, p01, ua, vb);
      windows.push(
        <polygon
          key={`${face}-${row}-${col}`}
          points={`${q0.x},${q0.y} ${q1.x},${q1.y} ${q2.x},${q2.y} ${q3.x},${q3.y}`}
          fill={fill}
        />,
      );
    }
  }

  return <g>{windows}</g>;
}

export function IsoFascia({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  fill,
  v0 = 0.68,
}: {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  fill: string;
  v0?: number;
}) {
  const p00 = iso(x, y + d, z + h);
  const p10 = iso(x + w, y + d, z + h);
  const p11 = iso(x + w, y + d, z);
  const p01 = iso(x, y + d, z);
  const a = bilerp(p00, p10, p11, p01, 0, v0);
  const b = bilerp(p00, p10, p11, p01, 1, v0);
  const c = bilerp(p00, p10, p11, p01, 1, 1);
  const e = bilerp(p00, p10, p11, p01, 0, 1);

  return (
    <g>
      <polygon
        points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${e.x},${e.y}`}
        fill={fill}
      />
      <polygon
        points={[
          bilerp(p00, p10, p11, p01, 0.08, 0.74),
          bilerp(p00, p10, p11, p01, 0.36, 0.74),
          bilerp(p00, p10, p11, p01, 0.36, 0.96),
          bilerp(p00, p10, p11, p01, 0.08, 0.96),
        ]
          .map((point) => `${point.x},${point.y}`)
          .join(" ")}
        fill="#D7E8F0"
      />
      <polygon
        points={[
          bilerp(p00, p10, p11, p01, 0.78, 0.76),
          bilerp(p00, p10, p11, p01, 0.9, 0.76),
          bilerp(p00, p10, p11, p01, 0.9, 1),
          bilerp(p00, p10, p11, p01, 0.78, 1),
        ]
          .map((point) => `${point.x},${point.y}`)
          .join(" ")}
        fill="#3A322C"
      />
    </g>
  );
}

export function IsoTree({
  x,
  y,
  z = 0,
  scale = 1,
  canopy = "#8FCB8A",
  canopyDark = "#6FA86C",
  delay = "0s",
  reduceMotion = false,
}: {
  x: number;
  y: number;
  z?: number;
  scale?: number;
  canopy?: string;
  canopyDark?: string;
  delay?: string;
  reduceMotion?: boolean;
}) {
  const base = iso(x, y, z);
  const top = iso(x, y, z + 1.15);
  const trunk = 6 * scale;
  const canopyR = 16 * scale;
  const shadeR = 10 * scale;

  return (
    <g className="iso-hover" style={{ pointerEvents: "auto" }}>
      <ellipse cx={base.x} cy={base.y + 6} rx={16 * scale} ry={7 * scale} fill="#C8BEB0" opacity="0.35" />
      <rect
        x={base.x - trunk / 2}
        y={top.y + 10}
        width={trunk}
        height={base.y - top.y - 6}
        fill="#B08968"
      />
      <g
        className={reduceMotion ? undefined : "iso-sway"}
        style={{ animationDelay: delay }}
      >
        <circle cx={top.x} cy={top.y} r={canopyR} fill={canopy} />
        <circle cx={top.x - 5 * scale} cy={top.y + 4 * scale} r={shadeR} fill={canopyDark} opacity="0.45" />
      </g>
    </g>
  );
}

export function IsoCar({
  x,
  y,
  z = 0.18,
  color,
  cabin = "#F4F0E8",
  along = "x",
}: {
  x: number;
  y: number;
  z?: number;
  color: string;
  cabin?: string;
  along?: "x" | "y";
}) {
  const w = along === "x" ? 0.78 : 0.42;
  const d = along === "x" ? 0.4 : 0.72;
  const left = shade(color, -18);
  const right = shade(color, -8);

  return (
    <g>
      <IsoBox x={x} y={y} z={z} w={w} d={d} h={0.2} top={color} left={left} right={right} />
      <IsoBox
        x={along === "x" ? x + 0.18 : x + 0.06}
        y={along === "x" ? y + 0.06 : y + 0.16}
        z={z + 0.2}
        w={along === "x" ? 0.38 : 0.3}
        d={along === "x" ? 0.28 : 0.36}
        h={0.16}
        top={cabin}
        left={shade(cabin, -14)}
        right={shade(cabin, -8)}
      />
    </g>
  );
}

export function IsoPerson({
  x,
  y,
  z = 0.16,
  fill,
  reduceMotion = false,
  delay = "0s",
}: {
  x: number;
  y: number;
  z?: number;
  fill: string;
  reduceMotion?: boolean;
  delay?: string;
}) {
  const feet = iso(x, y, z);
  const head = iso(x, y, z + 0.72);

  return (
    <g
      className={reduceMotion ? undefined : "iso-bob"}
      style={{ animationDelay: delay }}
    >
      <rect
        x={feet.x - 4}
        y={head.y + 8}
        width="8"
        height={feet.y - head.y - 10}
        rx="3"
        fill={fill}
      />
      <circle cx={head.x} cy={head.y + 4} r="5" fill="#5C5048" />
    </g>
  );
}

export function IsoLamp({ x, y, z = 0.16 }: { x: number; y: number; z?: number }) {
  return (
    <g>
      <IsoBox
        x={x}
        y={y}
        z={z}
        w={0.08}
        d={0.08}
        h={1.35}
        top="#6A645C"
        left="#4E4A44"
        right="#5C5852"
      />
      <circle cx={iso(x, y, z + 1.42).x} cy={iso(x, y, z + 1.42).y} r="5" fill="#E7A8C0" />
      <circle
        cx={iso(x + 0.12, y, z + 1.38).x}
        cy={iso(x + 0.12, y, z + 1.38).y}
        r="4"
        fill="#C9A8D4"
      />
    </g>
  );
}

export function shade(hex: string, amount: number) {
  const value = hex.replace("#", "");
  const num = Number.parseInt(value, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
