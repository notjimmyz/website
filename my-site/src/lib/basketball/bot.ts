import {
  ARC_RADIUS,
  BLOCK_RANGE,
  CHECK_Y,
  COURT_DEPTH,
  COURT_HALF_WIDTH,
  HOOP_X,
  HOOP_Y,
  STEAL_RANGE,
} from "./constants";
import { distanceToHoop } from "./court";
import { random } from "./rng";
import { emptyInput, type Difficulty, type GameState, type Input } from "./types";

export type BotProfile = {
  /** Time constant for how quickly the bot notices where you actually are. */
  reaction: number;
  speed: number;
  /** Steal attempts per second while within reach. */
  stealRate: number;
  /** Chance per second of going up for the block on a live shot. */
  blockRate: number;
  blockSkill: number;
  /** Chance of biting on a crossover. */
  bite: number;
  /** How often the bot greens its own shot. */
  green: number;
  drive: number;
  /** Preferred distance to sit off the ball on defense. */
  space: number;
  /** Shot clock reading that forces a shot. */
  urgency: number;
  openness: number;
};

export const PROFILES: Record<Difficulty, BotProfile> = {
  easy: {
    reaction: 0.34,
    speed: 0.78,
    stealRate: 0.25,
    blockRate: 0.55,
    blockSkill: 0.5,
    bite: 0.68,
    green: 0.16,
    drive: 0.28,
    space: 5.2,
    urgency: 3,
    openness: 5.2,
  },
  normal: {
    reaction: 0.2,
    speed: 0.93,
    stealRate: 0.6,
    blockRate: 1.5,
    blockSkill: 0.85,
    bite: 0.4,
    green: 0.4,
    drive: 0.5,
    space: 3.8,
    urgency: 4.5,
    openness: 4,
  },
  hard: {
    reaction: 0.11,
    speed: 1.02,
    stealRate: 0.95,
    blockRate: 2.4,
    blockSkill: 1.15,
    bite: 0.18,
    green: 0.64,
    drive: 0.74,
    space: 2.7,
    urgency: 6,
    openness: 3,
  },
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};

const botInput: Input = emptyInput();

function steer(input: Input, fromX: number, fromY: number, toX: number, toY: number) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.hypot(dx, dy);

  if (distance < 0.35) {
    input.moveX = 0;
    input.moveY = 0;
    return distance;
  }

  input.moveX = dx / distance;
  input.moveY = dy / distance;
  return distance;
}

/**
 * Builds the bot's input for this frame. The bot plays through exactly the same
 * input shape as the player, so both sides share one set of rules.
 */
export function decideBot(state: GameState, dt: number): Input {
  const input = botInput;
  input.moveX = 0;
  input.moveY = 0;
  input.sprint = false;
  input.shootHeld = false;
  input.shootPressed = false;
  input.shootReleased = false;
  input.actionPressed = false;
  input.startPressed = false;

  const profile = PROFILES[state.difficulty];
  const me = state.bot;
  const foe = state.user;
  const ball = state.ball;

  // Perception lags behind the truth, which is what makes easy feel beatable.
  const blend = Math.min(1, dt / Math.max(0.016, profile.reaction));
  me.perceivedX += (foe.x - me.perceivedX) * blend;
  me.perceivedY += (foe.y - me.perceivedY) * blend;

  if (state.phase === "check") {
    if (state.possession === "bot" && state.t > state.phaseUntil + 0.35) {
      input.startPressed = true;
    }
    return input;
  }

  if (state.phase === "made" || state.phase === "turnover" || state.phase === "over") {
    return input;
  }

  if (ball.mode !== "held") {
    // Chase the loose ball, biased to where it is heading.
    const leadX = ball.x + ball.vx * 0.25;
    const leadY = ball.y + ball.vy * 0.25;
    steer(input, me.x, me.y, clampX(leadX), clampY(leadY));
    input.sprint = true;
    return input;
  }

  if (ball.holder === "bot") {
    driveOrShoot(state, input, profile, dt);
    return input;
  }

  defend(state, input, profile, dt);
  return input;
}

function clampX(x: number) {
  const limit = COURT_HALF_WIDTH - 1.5;
  return Math.min(limit, Math.max(-limit, x));
}

function clampY(y: number) {
  return Math.min(COURT_DEPTH - 1.5, Math.max(1.5, y));
}

function driveOrShoot(state: GameState, input: Input, profile: BotProfile, dt: number) {
  const me = state.bot;
  const foe = state.user;
  const distance = distanceToHoop(me.x, me.y);
  const guarded = Math.hypot(me.x - foe.x, me.y - foe.y);

  if (me.meter.active) {
    input.shootHeld = true;
    return;
  }

  if (!state.cleared) {
    const takeY = Math.min(COURT_DEPTH - 1.6, HOOP_Y + ARC_RADIUS + 0.8);
    steer(input, me.x, me.y, clampX(me.x * 0.35), takeY);
    input.sprint = true;
    return;
  }

  const forced = state.shotClock <= profile.urgency;
  const open = guarded > profile.openness;
  const inRange = distance < ARC_RADIUS + 3;
  const atRim = distance < 6.5;
  // Having got a step on the defender is reason enough to go up with it.
  const beaten = distanceToHoop(foe.x, foe.y) > distance + 1.4;

  if (
    inRange &&
    (forced ||
      ((atRim || beaten || open) && random(state) < 0.02 + profile.drive * 0.05))
  ) {
    input.shootPressed = true;
    input.shootHeld = true;
    return;
  }

  if (state.t >= me.decideAt) {
    // Pick a fresh attacking angle every so often.
    me.decideAt = state.t + 0.6 + random(state) * 0.9;
    me.jinx = (random(state) - 0.5) * 2;
  }

  const wantsRim = random(state) < profile.drive * dt * 4 || distance > ARC_RADIUS + 1;
  const targetY = wantsRim ? HOOP_Y + 3.2 : Math.min(CHECK_Y, HOOP_Y + ARC_RADIUS - 1.5);
  const targetX = clampX(HOOP_X + me.jinx * (wantsRim ? 5 : 12));

  steer(input, me.x, me.y, targetX, clampY(targetY));
  input.sprint = guarded < 4.5 || distance > 18;

  const crossoverWindow =
    guarded < 5 && state.t >= me.crossoverReadyAt && random(state) < profile.drive * dt * 3;
  if (crossoverWindow) input.actionPressed = true;
}

function defend(state: GameState, input: Input, profile: BotProfile, dt: number) {
  const me = state.bot;
  const foe = state.user;

  // Sit on the line between the ball and the rim.
  const toRimX = HOOP_X - me.perceivedX;
  const toRimY = HOOP_Y - me.perceivedY;
  const toRim = Math.max(0.001, Math.hypot(toRimX, toRimY));
  const gap = Math.min(profile.space, toRim * 0.55);
  const targetX = me.perceivedX + (toRimX / toRim) * gap;
  const targetY = me.perceivedY + (toRimY / toRim) * gap;

  const distance = steer(input, me.x, me.y, clampX(targetX), clampY(targetY));
  input.sprint = distance > 2.4;

  const reach = Math.hypot(me.x - foe.x, me.y - foe.y);
  const ball = state.ball;
  const chase =
    ball.mode === "flight" &&
    ball.shooter === "user" &&
    state.t <= ball.blockUntil &&
    Math.hypot(me.x - ball.x, me.y - ball.y) < BLOCK_RANGE;

  if (me.z <= 0.01) {
    const contest = foe.meter.active && reach < BLOCK_RANGE && foe.meter.value > 0.45;
    if ((contest || chase) && random(state) < profile.blockRate * dt) {
      input.shootPressed = true;
      return;
    }
  }

  if (
    reach < STEAL_RANGE * 0.85 &&
    state.t >= me.stealReadyAt &&
    random(state) < profile.stealRate * dt
  ) {
    input.actionPressed = true;
  }
}
