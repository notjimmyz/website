import { GRAVITY, SERVE_STRIKE_Z, TOSS_START_Z, TOSS_VZ } from "./constants";

/**
 * Seconds from the toss until the ball drops back through the ideal strike
 * height. Pressing so that contact lands here is the on-time serve.
 */
export const SERVE_IDEAL_DELAY = (() => {
  const rise = TOSS_START_Z - SERVE_STRIKE_Z;
  const disc = TOSS_VZ * TOSS_VZ + 2 * GRAVITY * rise;
  if (disc <= 0) return TOSS_VZ / GRAVITY;
  return (TOSS_VZ + Math.sqrt(disc)) / GRAVITY;
})();

export const TOSS_APEX = TOSS_START_Z + (TOSS_VZ * TOSS_VZ) / (2 * GRAVITY);
