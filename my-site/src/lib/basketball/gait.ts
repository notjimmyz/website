import { CROSSOVER_DURATION } from "./constants";
import type { Actor } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(u: number) {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function crossoverProgress(actor: Actor, t: number) {
  if (t >= actor.crossoverUntil) return 1;
  return clamp(1 - (actor.crossoverUntil - t) / CROSSOVER_DURATION, 0, 1);
}

/** World-space dribble hand: old side, through the legs, then the new side. */
export function dribbleSide(actor: Actor, t: number) {
  const u = crossoverProgress(actor, t);
  if (u >= 1) return actor.facing;
  const cross = smoothstep((u - 0.18) / 0.42);
  return mix(actor.crossoverFrom, actor.facing, cross);
}

export type LimbPose = {
  facing: 1 | -1;
  bob: number;
  hipX: number;
  hipRot: number;
  torsoRot: number;
  headRot: number;
  legL: number;
  kneeL: number;
  legR: number;
  kneeR: number;
  armL: number;
  elbowL: number;
  armR: number;
  elbowR: number;
  wristL: number;
  wristR: number;
};

export function shotLift(actor: Actor) {
  return Math.min(1, actor.meter.value / Math.max(0.25, actor.meter.center));
}

export function limbPose(actor: Actor, t: number, reduceMotion: boolean): LimbPose {
  const damp = reduceMotion ? 0.35 : 1;
  const u = crossoverProgress(actor, t);

  if (actor.meter.active || actor.pose === "shoot") return shootPose(actor);
  if (u < 1) return crossoverPose(actor, u, damp);
  if (actor.airborneFor === "block" || actor.pose === "reach") return reachPose(actor, damp);
  return runPose(actor, t, damp);
}

function runPose(actor: Actor, t: number, damp: number): LimbPose {
  const speed = Math.hypot(actor.vx, actor.vy);
  const moving = actor.z < 0.18 && speed > 1.1;
  const amp = moving ? Math.min(1, speed / 14) * damp : 0;
  const stride = Math.sin(actor.gait);
  const idle = reduceIdle(t, damp, moving);

  const localVx = actor.vx * actor.facing;
  const lean = clamp(localVx * 0.22, -5, 5) * damp;
  const stumble = t < actor.stumbleUntil ? 5 * damp : 0;
  const air = actor.z > 0.05 ? clamp(actor.z * 2.5, 0, 8) : 0;

  const hipRot = stride * 4 * amp + lean + stumble;
  const torsoRot = -hipRot * 0.4;

  return {
    facing: actor.facing,
    bob: (moving ? (1 - Math.abs(stride)) * 0.04 * amp : idle.bob) + actor.z * 0.02,
    hipX: stride * 0.08 * amp + idle.hipX,
    hipRot,
    torsoRot,
    headRot: -torsoRot * 0.35,
    // Compact athletic stride: planted knees, short arm pump, elbows locked.
    legL: stride * 12 * amp,
    kneeL: 16 + 10 * amp * Math.max(0, stride) + air,
    legR: -stride * 12 * amp,
    kneeR: 16 + 10 * amp * Math.max(0, -stride) + air,
    armL: -stride * 9 * amp,
    elbowL: 58 + 8 * amp,
    armR: stride * 9 * amp,
    elbowR: -(58 + 8 * amp),
    wristL: 0,
    wristR: 0,
  };
}

function reduceIdle(t: number, damp: number, moving: boolean) {
  if (moving) return { bob: 0, hipX: 0 };
  return {
    bob: (0.5 + 0.5 * Math.sin(t * 2.1)) * 0.02 * damp,
    hipX: Math.sin(t * 1.5) * 0.02 * damp,
  };
}

type ShotKeys = Omit<LimbPose, "facing">;

function mixKeys(a: ShotKeys, b: ShotKeys, t: number): ShotKeys {
  const u = smoothstep(t);
  return {
    bob: mix(a.bob, b.bob, u),
    hipX: mix(a.hipX, b.hipX, u),
    hipRot: mix(a.hipRot, b.hipRot, u),
    torsoRot: mix(a.torsoRot, b.torsoRot, u),
    headRot: mix(a.headRot, b.headRot, u),
    legL: mix(a.legL, b.legL, u),
    kneeL: mix(a.kneeL, b.kneeL, u),
    legR: mix(a.legR, b.legR, u),
    kneeR: mix(a.kneeR, b.kneeR, u),
    armL: mix(a.armL, b.armL, u),
    elbowL: mix(a.elbowL, b.elbowL, u),
    armR: mix(a.armR, b.armR, u),
    elbowR: mix(a.elbowR, b.elbowR, u),
    wristL: mix(a.wristL, b.wristL, u),
    wristR: mix(a.wristR, b.wristR, u),
  };
}

// Angles are SVG degrees from hanging-down. Negative swings the right (shooting)
// arm out toward the shooting shoulder; ±180 is straight up. A jumper from this
// camera is a sequence, not a held overhead pose: gather at the chest, dip,
// high L at the ear, then extend and snap at the top of the jump.
const POCKET: ShotKeys = {
  bob: 0.14,
  hipX: 0.05,
  hipRot: 2,
  torsoRot: 4,
  headRot: 1,
  legL: 7,
  kneeL: 42,
  legR: -3,
  kneeR: 38,
  armL: -32,
  elbowL: -78,
  armR: 45,
  elbowR: -100,
  wristL: -8,
  wristR: 10,
};

const DIP: ShotKeys = {
  bob: 0.22,
  hipX: 0.04,
  hipRot: 3,
  torsoRot: 7,
  headRot: 3,
  legL: 8,
  kneeL: 50,
  legR: -2,
  kneeR: 46,
  armL: -36,
  elbowL: -82,
  armR: 50,
  elbowR: -108,
  wristL: -6,
  wristR: 14,
};

const SET: ShotKeys = {
  bob: 0.1,
  hipX: 0.03,
  hipRot: 1,
  torsoRot: 1,
  headRot: -4,
  legL: 5,
  kneeL: 34,
  legR: -5,
  kneeR: 26,
  armL: -125,
  elbowL: -40,
  armR: -130,
  elbowR: -70,
  wristL: 6,
  wristR: 16,
};

const RELEASE: ShotKeys = {
  bob: 0.02,
  hipX: 0,
  hipRot: 0,
  torsoRot: -6,
  headRot: -8,
  legL: 2,
  kneeL: 10,
  legR: -2,
  kneeR: 8,
  armL: -18,
  elbowL: 42,
  armR: -176,
  elbowR: -12,
  wristL: 10,
  wristR: 62,
};

function shootPose(actor: Actor): LimbPose {
  const lift = shotLift(actor);
  const keys =
    lift < 0.2
      ? mixKeys(POCKET, DIP, lift / 0.2)
      : lift < 0.5
        ? mixKeys(DIP, SET, (lift - 0.2) / 0.3)
        : mixKeys(SET, RELEASE, (lift - 0.5) / 0.5);

  return {
    facing: actor.facing,
    ...keys,
    bob: keys.bob + actor.z * 0.02,
  };
}

function reachPose(actor: Actor, damp: number): LimbPose {
  const block = actor.airborneFor === "block" ? 1 : 0.7;
  return {
    facing: actor.facing,
    bob: 0.03 + actor.z * 0.03,
    hipX: 0,
    hipRot: 3 * damp,
    torsoRot: -4 * damp,
    headRot: 2 * damp,
    legL: -4,
    kneeL: 18,
    legR: 4,
    kneeR: 16,
    armL: mix(12, 28, block),
    elbowL: mix(52, 44, block),
    armR: mix(-80, -174, block),
    elbowR: mix(-28, -10, block),
    wristL: 0,
    wristR: 8,
  };
}

function crossoverPose(actor: Actor, u: number, damp: number): LimbPose {
  const from = actor.crossoverFrom;
  const to = actor.facing;
  const wind = Math.sin(u * Math.PI);
  const whip = smoothstep(u);
  const facing: 1 | -1 = u < 0.4 ? from : to;

  return {
    facing,
    bob: wind * 0.14 * damp,
    hipX: mix(from * 0.08, to * 0.14, whip) * damp,
    hipRot: mix(from * 4, to * 10, whip) * damp - wind * 6 * damp,
    torsoRot: mix(-from * 3, to * 6, whip) * damp,
    headRot: -wind * 4 * damp,
    legL: (from * 6 + wind * 12 * from) * damp,
    kneeL: 22 + wind * 14,
    legR: (-from * 8 - wind * 10 * from) * damp,
    kneeR: 20 + wind * 12,
    armL: wind * 8 * damp,
    elbowL: 62,
    armR: -wind * 14,
    elbowR: -62,
    wristL: 0,
    wristR: 0,
  };
}
