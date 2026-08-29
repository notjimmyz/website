import {
  COMFORT_HIGH,
  COMFORT_LOW,
  CONTACT_AHEAD,
  CONTACT_FLOOR,
  MOVE_SPEED,
  REACH_DEPTH,
  REACH_HEIGHT,
  REACH_LATERAL,
  SERVE_AIM_CENTRE,
  SERVE_STRIKE_Z,
  SHOTS,
  TIMING_FAR,
  TIMING_NEAR,
  TIMING_ON,
  type ShotProfile,
  type ShotType,
} from "./constants";
import { solveFlight } from "./physics";
import { random } from "./rng";
import type { Actor, Ball, GameState, Side, TimingGrade } from "./types";
import { clamp, clamp01, mix, ramp } from "./math";

/** Where the racket wants to meet the ball, a step in front of the player. */
export function strikePlane(actor: Actor) {
  return actor.y - actor.own * CONTACT_AHEAD;
}

/**
 * Signed seconds between the swing and the ideal strike: negative means the
 * racket arrived before the ball did.
 */
export function contactTiming(actor: Actor, ball: Ball) {
  const plane = strikePlane(actor);
  const closing = actor.own > 0 ? Math.max(ball.vy, 6) : Math.min(ball.vy, -6);
  return (ball.y - plane) / closing;
}

export function timingGrade(error: number): TimingGrade {
  const size = Math.abs(error);
  if (size <= TIMING_ON) return "on-time";
  if (size <= TIMING_NEAR) return error < 0 ? "early" : "late";
  return error < 0 ? "very-early" : "very-late";
}

export function timingQuality(error: number) {
  const size = Math.abs(error);
  if (size <= TIMING_ON) return 1;
  if (size <= TIMING_NEAR) return mix(1, 0.62, ramp(size, TIMING_ON, TIMING_NEAR));
  return mix(0.62, 0.16, ramp(size, TIMING_NEAR, TIMING_FAR));
}

export function canReach(actor: Actor, ball: Ball) {
  return (
    Math.abs(ball.x - actor.x) <= REACH_LATERAL &&
    Math.abs(ball.y - strikePlane(actor)) <= REACH_DEPTH &&
    Math.abs(contactTiming(actor, ball)) <= TIMING_FAR &&
    ball.z <= REACH_HEIGHT &&
    ball.z >= -0.1
  );
}

/**
 * How well set the player was: stretched wide, jammed, sprinting or reaching
 * above the shoulder all take something off the ball.
 */
export function positionQuality(actor: Actor, ball: Ball) {
  const lateral = clamp01(Math.abs(ball.x - actor.x) / REACH_LATERAL);
  const depth = clamp01(Math.abs(ball.y - strikePlane(actor)) / REACH_DEPTH);
  const pace = clamp01(Math.hypot(actor.vx, actor.vy) / MOVE_SPEED);
  const height =
    ball.z < COMFORT_LOW
      ? ramp(COMFORT_LOW - ball.z, 0, COMFORT_LOW)
      : ramp(ball.z - COMFORT_HIGH, 0, REACH_HEIGHT - COMFORT_HIGH);

  const quality =
    (1 - 0.62 * lateral ** 1.4) *
    (1 - 0.3 * depth) *
    (1 - 0.26 * pace) *
    (1 - 0.3 * height);

  return clamp(quality, 0.06, 1);
}

/** The serve is judged on where the toss was, not on footwork. */
export function servePositionQuality(ball: Ball) {
  return clamp(1 - 0.7 * ramp(Math.abs(ball.z - SERVE_STRIKE_Z), 0, 3.4), 0.1, 1);
}

export type Target = { x: number; y: number };

/**
 * WASD during the swing picks a spot on the opponent's court. Aim is read in the
 * player's own frame so both ends steer the same way.
 */
export function groundTarget(actor: Actor, profile: ShotProfile): Target {
  const depth = clamp(profile.depthCentre - actor.aimY * profile.depthSpread, 3, 37);
  const across = clamp(actor.own * actor.aimX * profile.widthSpread, -12, 12);
  return { x: across, y: -actor.own * depth };
}

/** Serve aim runs from the T to the sideline inside the legal box. */
export function serveTarget(actor: Actor, boxSign: Side, profile: ShotProfile): Target {
  const depth = clamp(profile.depthCentre - actor.aimY * profile.depthSpread, 3.5, 19);
  const outward = clamp(
    SERVE_AIM_CENTRE + boxSign * actor.own * actor.aimX * profile.widthSpread,
    1.2,
    12.4,
  );
  return { x: boxSign * outward, y: -actor.own * depth };
}

export type StrikeResult = {
  grade: TimingGrade;
  quality: number;
};

/**
 * Intended target in, actual ball out. Timing and footwork set the quality, the
 * quality sets the scatter, and the scatter is allowed to miss the court.
 */
export function launchShot(
  state: GameState,
  actor: Actor,
  shot: ShotType,
  target: Target,
  quality: number,
): void {
  const profile = SHOTS[shot];
  const ball = state.ball;

  const spread = mix(profile.errorPoor, profile.errorBest, quality);
  const angle = random(state) * Math.PI * 2;
  const radius = Math.sqrt(random(state)) * spread;
  const landX = target.x + Math.cos(angle) * radius;
  const landY = target.y + Math.sin(angle) * radius * 1.3;

  const clearance =
    mix(profile.clearPoor, profile.clearBest, quality) +
    (random(state) * 2 - 1) * profile.clearScatter * (1 - quality);

  const fromZ = Math.max(ball.z, CONTACT_FLOOR);
  const launch = solveFlight(
    ball.x,
    ball.y,
    fromZ,
    landX,
    landY,
    clearance,
    profile.minFlight,
    profile.maxFlight,
  );

  ball.z = fromZ;
  ball.vx = launch.vx;
  ball.vy = launch.vy;
  ball.vz = launch.vz;
  ball.mode = "flight";
  ball.hitter = actor.id;
  ball.bounces = 0;
  ball.landingX = landX;
  ball.landingY = landY;
}
