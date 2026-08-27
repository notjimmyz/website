import { BLOCK_RANGE, METER_HALF_BASE } from "./constants";
import type { Actor, Difficulty } from "./types";

/**
 * 0 when the defender is nowhere near, 1 when they are draped over the
 * shooter and up in the air.
 */
export function contestOn(shooter: Actor, defender: Actor) {
  const distance = Math.hypot(shooter.x - defender.x, shooter.y - defender.y);
  const proximity = Math.max(0, 1 - distance / (BLOCK_RANGE + 2.6));
  const hand = defender.z > 0.5 ? 1.35 : defender.airborneFor === "block" ? 1.15 : 1;
  return Math.min(1, proximity * hand);
}

const WINDOW_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 1.35,
  normal: 1,
  hard: 0.85,
};

/** Half-width of the green window: tight shots and heavy contest shrink it. */
export function greenWindow(difficulty: Difficulty, contest: number, distance: number) {
  const range = Math.max(0.6, 1 - Math.max(0, distance - 14) * 0.014);
  const pressure = 1 - contest * 0.55;
  return Math.max(
    0.022,
    METER_HALF_BASE * WINDOW_BY_DIFFICULTY[difficulty] * range * pressure,
  );
}

export type ShotResolution = {
  made: boolean;
  probability: number;
  /** Signed release error: negative is early (short), positive is late (long). */
  error: number;
  greened: boolean;
};

export function resolveShot({
  error,
  half,
  distance,
  contest,
  random,
}: {
  error: number;
  half: number;
  distance: number;
  contest: number;
  random: number;
}): ShotResolution {
  const greened = Math.abs(error) <= half;
  const base = Math.max(0.3, Math.min(0.82, 0.82 - distance * 0.013));
  const slip = Math.max(0, Math.abs(error) - half);
  const timing = greened ? 1 : Math.max(0, 1 - slip / 0.2);
  const pressure = 1 - contest * 0.45;

  const probability = Math.max(
    0,
    Math.min(0.97, (greened ? 0.96 : base) * timing * pressure),
  );

  return { made: random < probability, probability, error, greened };
}

/** Where a miss ends up: early releases fall short, late ones run long. */
export function missTarget(error: number, half: number, spread: number) {
  const direction = error > 0 ? 1 : -1;
  const slip = Math.max(0, Math.abs(error) - half);
  const magnitude = 0.75 + Math.min(1.7, slip * 7);
  return {
    lateral: (spread - 0.5) * 1.5,
    depth: direction * magnitude,
  };
}
