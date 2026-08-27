import {
  ARC_RADIUS,
  CORNER_X,
  CORNER_Y,
  COURT_DEPTH,
  COURT_HALF_WIDTH,
  HOOP_X,
  HOOP_Y,
  PLAYER_RADIUS,
} from "./constants";

export function distanceToHoop(x: number, y: number) {
  return Math.hypot(x - HOOP_X, y - HOOP_Y);
}

export function isBehindArc(x: number, y: number) {
  if (Math.abs(x) >= CORNER_X && y <= CORNER_Y) return true;
  return distanceToHoop(x, y) >= ARC_RADIUS;
}

export function shotValue(x: number, y: number): 1 | 2 {
  return isBehindArc(x, y) ? 2 : 1;
}

export function clampToCourtX(x: number) {
  const limit = COURT_HALF_WIDTH - PLAYER_RADIUS;
  return Math.min(limit, Math.max(-limit, x));
}

export function clampToCourtY(y: number) {
  return Math.min(COURT_DEPTH - PLAYER_RADIUS, Math.max(PLAYER_RADIUS, y));
}

/** Points along a circle, in world coordinates, for rendering as a polyline. */
export function arcPoints(
  cx: number,
  cy: number,
  radius: number,
  fromAngle: number,
  toAngle: number,
  steps = 40,
): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = fromAngle + ((toAngle - fromAngle) * i) / steps;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return points;
}

/** The three point line: corner, sweep, corner. */
export function threePointPoints(steps = 56): Array<[number, number]> {
  const sweepStart = Math.atan2(CORNER_Y - HOOP_Y, -CORNER_X);
  const sweepEnd = Math.atan2(CORNER_Y - HOOP_Y, CORNER_X);
  return [
    [-CORNER_X, 0],
    ...arcPoints(HOOP_X, HOOP_Y, ARC_RADIUS, sweepStart, sweepEnd, steps),
    [CORNER_X, 0],
  ];
}
