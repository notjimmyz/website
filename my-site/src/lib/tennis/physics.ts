import {
  BALL_RADIUS,
  BOUNCE_FLOOR,
  BOUNCE_FRICTION,
  BOUNCE_RESTITUTION,
  GRAVITY,
  MIN_FLIGHT,
  NET_POST_X,
  ROLL_DAMP,
} from "./constants";
import { netHeightAt } from "./court";
import type { Ball } from "./types";

export type BallEvent = {
  /** The ball met the tape on its way across. */
  net: boolean;
  /** Where the ball first touched down this tick, if it did. */
  bounce: { x: number; y: number } | null;
};

const QUIET: BallEvent = { net: false, bounce: null };

export function advanceBall(ball: Ball, dt: number): BallEvent {
  if (ball.mode === "idle") return QUIET;

  const prevY = ball.y;
  const prevZ = ball.z;

  ball.vz -= GRAVITY * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  let net = false;

  if (ball.mode === "flight" && prevY > 0 !== ball.y > 0) {
    const span = prevY - ball.y;
    const f = span === 0 ? 0 : prevY / span;
    const zAt = prevZ + (ball.z - prevZ) * f;
    const xAt = ball.x - ball.vx * dt * (1 - f);

    if (Math.abs(xAt) <= NET_POST_X && zAt <= netHeightAt(xAt) + BALL_RADIUS) {
      net = true;
      ball.x = xAt;
      ball.y = 0;
      ball.z = Math.max(zAt, BALL_RADIUS);
      ball.vx *= 0.14;
      ball.vy *= -0.08;
      ball.vz = 0;
    }
  }

  let bounce: BallEvent["bounce"] = null;

  if (ball.z <= BALL_RADIUS && ball.vz <= 0) {
    ball.z = BALL_RADIUS;
    if (ball.vz > -BOUNCE_FLOOR) {
      ball.vz = 0;
      const damp = Math.exp(-ROLL_DAMP * dt);
      ball.vx *= damp;
      ball.vy *= damp;
    } else {
      ball.vz = -ball.vz * BOUNCE_RESTITUTION;
      ball.vx *= BOUNCE_FRICTION;
      ball.vy *= BOUNCE_FRICTION;
      ball.bounces += 1;
      bounce = { x: ball.x, y: ball.y };
    }
  }

  ball.spin += dt * (Math.abs(ball.vx) + Math.abs(ball.vy)) * 0.12;

  return net || bounce ? { net, bounce } : QUIET;
}

export type Launch = {
  vx: number;
  vy: number;
  vz: number;
  flight: number;
};

/**
 * Picks the flight time whose parabola clears the tape by `clearance` feet, then
 * reads the launch velocity off it. Pace is therefore a consequence of the arc:
 * a flat strike arrives fast, a loopy one floats, and a clearance at or below
 * the tape genuinely finds the net.
 */
export function solveFlight(
  fromX: number,
  fromY: number,
  fromZ: number,
  toX: number,
  toY: number,
  clearance: number,
  minFlight: number,
  maxFlight: number,
): Launch {
  const span = fromY - toY;
  let f = Math.abs(span) < 0.01 ? 0.5 : fromY / span;
  f = Math.min(0.92, Math.max(0.08, f));

  const netX = fromX + (toX - fromX) * f;
  const wanted = netHeightAt(netX) + clearance;
  const need = wanted - fromZ * (1 - f);
  const denom = GRAVITY * f * (1 - f);

  const floor = Math.max(MIN_FLIGHT, minFlight);
  let flight = need > 0 ? Math.sqrt((2 * need) / denom) : floor;
  flight = Math.min(maxFlight, Math.max(floor, flight));

  return {
    vx: (toX - fromX) / flight,
    vy: (toY - fromY) / flight,
    vz: -fromZ / flight + (GRAVITY * flight) / 2,
    flight,
  };
}
