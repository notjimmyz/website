// Fixed broadcast camera behind the player's baseline, looking down the court
// so pushing "up" on the keys drives toward the net. Same perspective divide as
// the basketball court, tuned for a surface that is twice as long.

export const SCREEN_W = 1440;
export const SCREEN_H = 900;
export const SCREEN_CX = 720;
// Framed so the far player's head and the near player's feet both keep a margin
// once `preserveAspectRatio="slice"` crops a widescreen viewport.
export const SCREEN_CY = 320;

export const CAM_Y = 120;
export const CAM_HEIGHT = 44;
export const CAM_PITCH = (19 * Math.PI) / 180;
export const FOCAL = 2400;

export const COS_PITCH = Math.cos(CAM_PITCH);
export const SIN_PITCH = Math.sin(CAM_PITCH);

export type Projected = {
  x: number;
  y: number;
  k: number;
  depth: number;
};

export function project(x: number, y: number, z = 0): Projected {
  const dy = CAM_Y - y;
  const dz = z - CAM_HEIGHT;
  const depth = dy * COS_PITCH - dz * SIN_PITCH;
  const up = dy * SIN_PITCH + dz * COS_PITCH;
  const k = FOCAL / Math.max(depth, 6);

  return {
    x: SCREEN_CX + x * k,
    y: SCREEN_CY - up * k,
    k,
    depth,
  };
}

export function projectPolygon(points: Array<[number, number, number?]>) {
  return points
    .map(([x, y, z]) => {
      const p = project(x, y, z ?? 0);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

export function projectPath(points: Array<[number, number, number?]>) {
  return points
    .map(([x, y, z], index) => {
      const p = project(x, y, z ?? 0);
      return `${index === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");
}

/** A painted line on the ground, widened in world space so it foreshortens. */
export function groundStripe(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * (width / 2);
  const oy = (dx / len) * (width / 2);
  return projectPolygon([
    [x1 + ox, y1 + oy],
    [x2 + ox, y2 + oy],
    [x2 - ox, y2 - oy],
    [x1 - ox, y1 - oy],
  ]);
}

/**
 * Sprite art is drawn with vertical measurements pre-multiplied by this factor,
 * so a single uniform scale by `k` gives the correct foreshortening.
 */
export const VERTICAL = COS_PITCH;

export function screenPan(ballX: number) {
  return Math.max(-52, Math.min(52, -ballX * 2.2));
}
