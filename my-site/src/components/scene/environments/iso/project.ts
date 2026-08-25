export const TILE_W = 12;
export const TILE_H = 6;
export const ORIGIN_X = 214;
export const ORIGIN_Y = 392;

export type IsoPoint = { x: number; y: number };

export function iso(x: number, y: number, z = 0): IsoPoint {
  return {
    x: ORIGIN_X + (x - y) * TILE_W,
    y: ORIGIN_Y + (x + y) * TILE_H - z * TILE_H * 2,
  };
}

export function isoPoints(corners: Array<[number, number, number]>) {
  return corners
    .map(([x, y, z]) => {
      const point = iso(x, y, z);
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(" ");
}

export function lerp(a: IsoPoint, b: IsoPoint, t: number): IsoPoint {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function bilerp(
  p00: IsoPoint,
  p10: IsoPoint,
  p11: IsoPoint,
  p01: IsoPoint,
  u: number,
  v: number,
) {
  return lerp(lerp(p00, p10, u), lerp(p01, p11, u), v);
}
