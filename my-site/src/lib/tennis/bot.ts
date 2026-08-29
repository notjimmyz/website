import {
  BASELINE_Y,
  COMFORT_HIGH,
  CONTACT_AHEAD,
  READY_BACK,
  ROAM_BACK,
  SHOTS,
  type ShotType,
} from "./constants";
import { inSingles } from "./court";
import { clamp } from "./math";
import { advanceBall } from "./physics";
import { random } from "./rng";
import { SERVE_IDEAL_DELAY } from "./serve";
import { strikePlane } from "./shot";
import {
  actorOf,
  emptyInput,
  other,
  type Actor,
  type Ball,
  type Difficulty,
  type GameState,
  type Input,
  type Team,
} from "./types";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Club",
  normal: "County",
  hard: "Varsity",
};

type Profile = {
  /** Seconds of slop on the swing, positive or negative. */
  swingJitter: number;
  /** Seconds of slop on the serve strike. */
  serveJitter: number;
  /** Feet the bot settles away from the perfect spot. */
  footwork: number;
  /** Chance it correctly leaves a ball that is heading out. */
  judgement: number;
  dropChance: number;
  lobChance: number;
  speedScale: number;
};

const PROFILES: Record<Difficulty, Profile> = {
  easy: {
    swingJitter: 0.15,
    serveJitter: 0.14,
    footwork: 3.4,
    judgement: 0.25,
    dropChance: 0.06,
    lobChance: 0.3,
    speedScale: 0.72,
  },
  normal: {
    swingJitter: 0.085,
    serveJitter: 0.08,
    footwork: 2,
    judgement: 0.6,
    dropChance: 0.12,
    lobChance: 0.5,
    speedScale: 0.88,
  },
  hard: {
    swingJitter: 0.04,
    serveJitter: 0.04,
    footwork: 1,
    judgement: 0.88,
    dropChance: 0.18,
    lobChance: 0.66,
    speedScale: 0.98,
  },
};

function drive(input: Input, bot: Actor, targetX: number, targetY: number) {
  const dx = targetX - bot.x;
  const dy = targetY - bot.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.6) return;
  // Movement is read in the actor's own frame, so mirror the world delta.
  input.moveX = (bot.own * dx) / len;
  input.moveY = (bot.own * dy) / len;
}

/** Seconds until the ball reaches the strike plane, or null if it never does. */
function timeToPlane(me: Actor, state: GameState) {
  const ball = state.ball;
  const closing = strikePlane(me) - ball.y;
  if (ball.vy === 0) return null;
  const t = closing / ball.vy;
  return t >= 0 && t < 4 ? t : null;
}

export type Read = { x: number; y: number; t: number };

/**
 * Runs the ball forward to the spot where it drops back through comfortable
 * strike height on this player's side. That is what a real player reads, and it
 * is what stops the bot from sprinting at the bounce mark.
 */
function readBall(state: GameState, me: Actor): Read | null {
  const ball: Ball = { ...state.ball };
  const h = 1 / 40;
  const reach = Math.abs(BASELINE_Y + ROAM_BACK);
  let t = 0;

  while (t < 3.2) {
    advanceBall(ball, h);
    t += h;
    if (ball.bounces >= 2) return null;
    if (ball.y * me.own <= 0) continue;
    if (Math.abs(ball.y) > reach) return null;
    if (ball.bounces >= 1 && ball.vz < 0 && ball.z <= COMFORT_HIGH) {
      return { x: ball.x, y: ball.y, t };
    }
  }

  return null;
}

function chooseShot(state: GameState, foe: Actor, profile: Profile): ShotType {
  const depth = foe.y * foe.own;
  const roll = random(state);
  if (depth < 18 && roll < profile.lobChance) return "lob";
  if (depth > BASELINE_Y - 4 && roll < profile.dropChance) return "drop";
  return "topspin";
}

function planAim(state: GameState, me: Actor, foe: Actor, shot: ShotType) {
  // Hit into the space the opponent is not standing in.
  const away = foe.x > 0 ? -1 : 1;
  me.planAimX = clamp(away * (0.55 + random(state) * 0.45) * me.own, -1, 1);
  me.planAimY = shot === "drop" ? 0.4 : -0.6 - random(state) * 0.4;
}

/**
 * Produces the same `Input` a player would, so both ends run through identical
 * rules in `step`. Passing a team lets either baseline be driven by the AI.
 */
export function decideBot(
  state: GameState,
  difficulty: Difficulty,
  team: Team = "bot",
): Input {
  const input = emptyInput();
  const me = actorOf(state, team);
  const foe = actorOf(state, other(team));
  const ball = state.ball;
  const profile = PROFILES[difficulty];

  if (state.phase === "between" || state.phase === "over") return input;

  // While a swing is in the air WASD is the aim, so hand back the plan.
  if (me.stroke === "aiming") {
    input.moveX = me.planAimX;
    input.moveY = me.planAimY;
    return input;
  }

  if (state.phase === "serve") {
    if (state.score.server !== team) {
      const boxSide = ball.x > 0 ? 1 : -1;
      drive(input, me, boxSide * 7.5, me.own * (BASELINE_Y + 3));
      return input;
    }

    if (state.serveStage === "ready") {
      if (me.nextActionAt === 0) me.nextActionAt = state.t + 0.6;
      if (state.t >= me.nextActionAt && state.t >= state.phaseUntil) {
        input.topspin = true;
        me.serveSwingAt =
          state.t +
          SERVE_IDEAL_DELAY -
          SHOTS.serve.windup +
          (random(state) * 2 - 1) * profile.serveJitter;
        // Second serves go safer: more air, more of the box.
        me.planAimX = (random(state) * 2 - 1) * (state.faults > 0 ? 0.35 : 0.9);
        me.planAimY = state.faults > 0 ? 0.5 : -0.3;
        me.nextActionAt = 0;
      }
      return input;
    }

    if (state.t >= me.serveSwingAt) input.topspin = true;
    input.moveX = me.planAimX;
    input.moveY = me.planAimY;
    return input;
  }

  // Rally: read the ball, get behind it, swing when it arrives.
  const incoming = ball.mode === "flight" && ball.hitter !== team;
  if (!incoming) {
    drive(input, me, 0, me.own * (BASELINE_Y + READY_BACK));
    return input;
  }

  const read = readBall(state, me);
  const arrival = read ? read.t : timeToPlane(me, state);
  const spotX = read ? read.x : ball.x;
  const spotY = read
    ? read.y + me.own * CONTACT_AHEAD
    : me.own * (BASELINE_Y + READY_BACK);

  const wander = me.committed ? 0 : (random(state) * 2 - 1) * profile.footwork;
  drive(input, me, spotX + wander, spotY);
  input.moveX *= profile.speedScale;
  input.moveY *= profile.speedScale;

  if (me.stroke !== "idle" || arrival === null) return input;

  const leaving =
    ball.bounces === 0 &&
    !inSingles(ball.landingX, ball.landingY) &&
    random(state) < profile.judgement;
  if (leaving) return input;

  const ready = ball.bounces >= 1 || Math.abs(me.y) < 22;
  if (!ready) return input;

  const shot = chooseShot(state, foe, profile);
  const lead = SHOTS[shot].windup + (random(state) * 2 - 1) * profile.swingJitter;
  if (arrival <= lead) {
    planAim(state, me, foe, shot);
    me.committed = true;
    if (shot === "topspin") input.topspin = true;
    else if (shot === "drop") input.drop = true;
    else input.lob = true;
  }

  return input;
}
