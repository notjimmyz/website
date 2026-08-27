// Fixed broadcast camera: high behind half court, looking down at the rim, so
// pushing "up" on the keys drives toward the hoop. Vertical structures keep
// their true perspective, which is what sells the 2K-style read of the floor.

export const SCREEN_W = 1440;
export const SCREEN_H = 900;
export const SCREEN_CX = 720;
export const SCREEN_CY = 493;

export const CAM_Y = 130;
export const CAM_HEIGHT = 52;
export const CAM_PITCH = (24 * Math.PI) / 180;
export const FOCAL = 3080;

export const COS_PITCH = Math.cos(CAM_PITCH);
export const SIN_PITCH = Math.sin(CAM_PITCH);

export type Projected = {
  x: number;
  y: number;
  k: number;
  depth: number;
};

export function project(x: number, y: number, z = 0): Projected {
  const across = x;
  const dy = CAM_Y - y;
  const dz = z - CAM_HEIGHT;
  const depth = dy * COS_PITCH - dz * SIN_PITCH;
  const up = dy * SIN_PITCH + dz * COS_PITCH;
  const k = FOCAL / Math.max(depth, 4);

  return {
    x: SCREEN_CX + across * k,
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

/** A circle painted flat on the floor reads as an ellipse squashed by the pitch. */
export function groundEllipse(radius: number, k: number) {
  return { rx: radius * k, ry: radius * k * SIN_PITCH };
}

/**
 * Sprite art is drawn with vertical measurements pre-multiplied by this factor,
 * so a single uniform scale by `k` gives the correct foreshortening.
 */
export const VERTICAL = COS_PITCH;

export function screenPan(ballX: number) {
  return Math.max(-70, Math.min(70, -ballX * 4.2));
}
