import { PROFILES } from "./bot";
import {
  ACCEL,
  AIR_CONTROL,
  BALL_FRICTION,
  BALL_RADIUS,
  BALL_RESTITUTION,
  BLOCK_BASE,
  BLOCK_RANGE,
  BLOCK_STUN,
  BODY_SEPARATION,
  CHECK_DEFENDER_GAP,
  CHECK_Y,
  COURT_DEPTH,
  COURT_HALF_WIDTH,
  CROSSOVER_BOOST,
  CROSSOVER_COOLDOWN,
  CROSSOVER_DURATION,
  CROSSOVER_REACH,
  FRICTION,
  GRAB_RANGE,
  GRAVITY,
  HOOP_X,
  HOOP_Y,
  JUMP_VZ,
  MADE_PAUSE,
  METER_CENTER,
  METER_OVERFILL,
  PLAYER_HEIGHT,
  RELEASE_HEIGHT,
  RIM_HEIGHT,
  SHOT_CLOCK,
  SHOT_JUMP_VZ,
  SHOT_WINDUP,
  SPRINT_SPEED,
  STAMINA_DRAIN,
  STAMINA_MAX,
  STAMINA_REGEN,
  STAMINA_SPRINT_MIN,
  STEAL_BASE,
  STEAL_COOLDOWN,
  STEAL_RANGE,
  STEAL_SELF_STUMBLE,
  STUMBLE_DURATION,
  STUMBLE_FACTOR,
  TARGET_SCORE,
  TOAST_DURATION,
  TURNOVER_PAUSE,
  WALK_SPEED,
} from "./constants";
import { clampToCourtX, clampToCourtY, distanceToHoop, shotValue } from "./court";
import { random } from "./rng";
import { contestOn, greenWindow, missTarget, resolveShot } from "./shot";
import type {
  Actor,
  Difficulty,
  GameState,
  Input,
  Meter,
  Team,
  ToastKind,
} from "./types";

function createMeter(): Meter {
  return {
    active: false,
    value: 0,
    center: METER_CENTER,
    half: 0,
    releaseTarget: null,
    lastError: 0,
    greened: false,
    flashUntil: 0,
  };
}

function createActor(id: Team): Actor {
  return {
    id,
    x: 0,
    y: id === "user" ? CHECK_Y : CHECK_Y - CHECK_DEFENDER_GAP,
    vx: 0,
    vy: 0,
    z: 0,
    vz: 0,
    facing: 1,
    speedScale: 1,
    stamina: STAMINA_MAX,
    pose: "run",
    poseUntil: 0,
    airborneFor: "none",
    crossoverUntil: 0,
    crossoverReadyAt: 0,
    stumbleUntil: 0,
    stealReadyAt: 0,
    stunUntil: 0,
    meter: createMeter(),
    perceivedX: 0,
    perceivedY: CHECK_Y,
    decideAt: 0,
    jinx: 0,
  };
}

export function createGame(difficulty: Difficulty, seed = 0x2f6a1b): GameState {
  const state: GameState = {
    t: 0,
    phase: "check",
    phaseUntil: 0,
    possession: "user",
    scoreUser: 0,
    scoreBot: 0,
    shotClock: SHOT_CLOCK,
    difficulty,
    user: createActor("user"),
    bot: createActor("bot"),
    ball: {
      x: 0,
      y: CHECK_Y,
      z: 2,
      vx: 0,
      vy: 0,
      vz: 0,
      holder: "user",
      mode: "held",
      shooter: null,
      value: 1,
      outcome: null,
      landsAt: 0,
      grabReadyAt: 0,
      looseSince: 0,
    },
    toast: null,
    winner: null,
    seed,
  };

  applyDifficulty(state, difficulty);
  setCheck(state, "user");
  return state;
}

function applyDifficulty(state: GameState, difficulty: Difficulty) {
  state.difficulty = difficulty;
  state.bot.speedScale = PROFILES[difficulty].speed;
}

export function resetGame(state: GameState, difficulty: Difficulty) {
  state.t = 0;
  state.scoreUser = 0;
  state.scoreBot = 0;
  state.winner = null;
  state.toast = null;
  applyDifficulty(state, difficulty);
  setCheck(state, "user");
}

function actorOf(state: GameState, team: Team) {
  return team === "user" ? state.user : state.bot;
}

function other(team: Team): Team {
  return team === "user" ? "bot" : "user";
}

export function setToast(state: GameState, text: string, kind: ToastKind) {
  state.toast = { text, kind, until: state.t + TOAST_DURATION };
}

function resetMeter(meter: Meter) {
  meter.active = false;
  meter.value = 0;
  meter.releaseTarget = null;
}

function setCheck(state: GameState, offense: Team) {
  const off = actorOf(state, offense);
  const def = actorOf(state, other(offense));

  // The defender checks the ball up at their own guarding distance, so nobody
  // gets a free look straight off the check.
  const gap =
    def.id === "bot" ? PROFILES[state.difficulty].space : CHECK_DEFENDER_GAP;

  off.x = 0;
  off.y = CHECK_Y;
  def.x = 0;
  def.y = CHECK_Y - gap;

  for (const actor of [off, def]) {
    actor.vx = 0;
    actor.vy = 0;
    actor.z = 0;
    actor.vz = 0;
    actor.airborneFor = "none";
    actor.stumbleUntil = 0;
    actor.stunUntil = 0;
    actor.crossoverUntil = 0;
    actor.pose = "run";
    actor.perceivedX = state.user.x;
    actor.perceivedY = state.user.y;
    resetMeter(actor.meter);
  }

  const ball = state.ball;
  ball.holder = offense;
  ball.mode = "held";
  ball.shooter = null;
  ball.outcome = null;
  ball.vx = 0;
  ball.vy = 0;
  ball.vz = 0;
  ball.grabReadyAt = 0;

  state.possession = offense;
  state.shotClock = SHOT_CLOCK;
  state.phase = "check";
  state.phaseUntil = state.t + 0.35;
  attachBall(state);
}

function attachBall(state: GameState) {
  const ball = state.ball;
  if (ball.mode !== "held" || !ball.holder) return;

  const holder = actorOf(state, ball.holder);

  if (holder.meter.active) {
    const lift = Math.min(1, holder.meter.value / holder.meter.center);
    ball.x = holder.x + holder.facing * 0.3;
    ball.y = holder.y - 0.2;
    ball.z = holder.z + 2.6 + lift * (RELEASE_HEIGHT - 2.6);
    return;
  }

  const bounce = Math.abs(Math.sin(state.t * 8.4)) * 1.5;
  ball.x = holder.x + holder.facing * 1;
  ball.y = holder.y + 0.3;
  ball.z = holder.z + 1 + bounce;
  ball.vx = 0;
  ball.vy = 0;
  ball.vz = 0;
}

function moveActor(state: GameState, actor: Actor, input: Input, dt: number) {
  const stunned = state.t < actor.stunUntil;
  const stumbled = !stunned && state.t < actor.stumbleUntil;
  const airborne = actor.z > 0.01;

  let top =
    (input.sprint && actor.stamina > STAMINA_SPRINT_MIN ? SPRINT_SPEED : WALK_SPEED) *
    actor.speedScale;
  if (state.t < actor.crossoverUntil) top *= CROSSOVER_BOOST;
  if (stumbled) top *= STUMBLE_FACTOR;
  if (actor.meter.active) top *= 0.35;

  let ix = stunned ? 0 : input.moveX;
  let iy = stunned ? 0 : input.moveY;
  const magnitude = Math.hypot(ix, iy);
  if (magnitude > 1) {
    ix /= magnitude;
    iy /= magnitude;
  }

  const moving = magnitude > 0.01;
  const rate = (moving ? ACCEL : FRICTION) * (airborne ? AIR_CONTROL : 1) * dt;
  const dvx = ix * top - actor.vx;
  const dvy = iy * top - actor.vy;
  const delta = Math.hypot(dvx, dvy);

  if (delta > 0.0001) {
    const scale = Math.min(1, rate / delta);
    actor.vx += dvx * scale;
    actor.vy += dvy * scale;
  }

  if (stunned) {
    actor.vx = 0;
    actor.vy = 0;
  }

  actor.x = clampToCourtX(actor.x + actor.vx * dt);
  actor.y = clampToCourtY(actor.y + actor.vy * dt);

  if (input.sprint && moving && actor.stamina > 0) {
    actor.stamina = Math.max(0, actor.stamina - STAMINA_DRAIN * dt);
  } else {
    actor.stamina = Math.min(STAMINA_MAX, actor.stamina + STAMINA_REGEN * dt);
  }

  if (actor.z > 0 || actor.vz !== 0) {
    actor.vz -= GRAVITY * dt;
    actor.z += actor.vz * dt;
    if (actor.z <= 0) {
      actor.z = 0;
      actor.vz = 0;
      actor.airborneFor = "none";
    }
  }

  if (Math.abs(actor.vx) > 1.2) actor.facing = actor.vx > 0 ? 1 : -1;
}

function separate(state: GameState) {
  const a = state.user;
  const b = state.bot;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= BODY_SEPARATION || distance < 0.0001) return;

  const push = (BODY_SEPARATION - distance) / 2;
  const nx = dx / distance;
  const ny = dy / distance;

  a.x = clampToCourtX(a.x - nx * push);
  a.y = clampToCourtY(a.y - ny * push);
  b.x = clampToCourtX(b.x + nx * push);
  b.y = clampToCourtY(b.y + ny * push);
}

function startShot(state: GameState, shooter: Actor) {
  const meter = shooter.meter;
  meter.active = true;
  meter.value = 0;
  meter.greened = false;
  meter.center = METER_CENTER;

  shooter.vz = SHOT_JUMP_VZ;
  shooter.z = Math.max(shooter.z, 0.001);
  shooter.airborneFor = "shot";
  shooter.pose = "shoot";

  if (shooter.id === "bot") {
    const profile = PROFILES[state.difficulty];
    const defender = state.user;
    const distance = distanceToHoop(shooter.x, shooter.y);
    const nominal = greenWindow(state.difficulty, contestOn(shooter, defender), distance);
    const greened = random(state) < profile.green;
    const drift = greened
      ? (random(state) - 0.5) * nominal * 1.1
      : (random(state) < 0.5 ? -1 : 1) * (nominal + 0.03 + random(state) * 0.1);
    meter.releaseTarget = meter.center + drift;
  } else {
    meter.releaseTarget = null;
  }
}

function releaseShot(state: GameState, shooter: Actor, defender: Actor) {
  const meter = shooter.meter;
  const ball = state.ball;
  const distance = distanceToHoop(shooter.x, shooter.y);
  const contest = contestOn(shooter, defender);
  const half = greenWindow(state.difficulty, contest, distance);
  const error = meter.value - meter.center;
  const resolution = resolveShot({
    error,
    half,
    distance,
    contest,
    random: random(state),
  });

  meter.active = false;
  meter.half = half;
  meter.lastError = error;
  meter.greened = resolution.greened;
  meter.flashUntil = state.t + 1.1;
  meter.releaseTarget = null;

  ball.holder = null;
  ball.shooter = shooter.id;
  ball.value = shotValue(shooter.x, shooter.y);

  const fromX = ball.x;
  const fromY = ball.y;
  const fromZ = Math.max(ball.z, RELEASE_HEIGHT * 0.85);

  const reach = Math.hypot(shooter.x - defender.x, shooter.y - defender.y);
  const blockSkill = defender.id === "bot" ? PROFILES[state.difficulty].blockSkill : 1;
  const jumping = defender.airborneFor === "block" && defender.z > 0.12;
  const blocked =
    jumping &&
    reach < BLOCK_RANGE &&
    random(state) < BLOCK_BASE * (1 - (reach / BLOCK_RANGE) ** 2) * blockSkill;

  if (blocked) {
    const fromDefX = shooter.x - defender.x;
    const fromDefY = shooter.y - defender.y;
    const fromDef = Math.max(0.001, Math.hypot(fromDefX, fromDefY));
    const fromHoopX = shooter.x - HOOP_X;
    const fromHoopY = shooter.y - HOOP_Y;
    const fromHoop = Math.max(0.001, Math.hypot(fromHoopX, fromHoopY));
    let nx = fromHoopX / fromHoop * 0.7 + fromDefX / fromDef * 0.3;
    let ny = fromHoopY / fromHoop * 0.7 + fromDefY / fromDef * 0.3;
    const n = Math.max(0.001, Math.hypot(nx, ny));
    nx /= n;
    ny /= n;

    const kick = 15.5 + random(state) * 3.5;
    ball.outcome = "blocked";
    ball.mode = "loose";
    ball.x = fromX + nx * 1.2;
    ball.y = fromY + ny * 1.2;
    ball.z = fromZ;
    ball.vx = nx * kick + (random(state) - 0.5) * 4;
    ball.vy = ny * kick + (random(state) - 0.5) * 2.4;
    ball.vz = 8.4;
    ball.grabReadyAt = state.t + 0.1;
    ball.looseSince = state.t;
    shooter.stunUntil = state.t + BLOCK_STUN;
    shooter.vx = 0;
    shooter.vy = 0;
    state.phase = "live";
    setToast(state, defender.id === "user" ? "Blocked!" : "Blocked by CPU", "block");
    return;
  }

  ball.outcome = resolution.made ? "make" : "miss";
  ball.mode = "flight";

  const flight = 0.62 + distance * 0.028;
  let targetX = HOOP_X;
  let targetY = HOOP_Y;
  let targetZ = RIM_HEIGHT;

  if (!resolution.made) {
    const miss = missTarget(error, half, random(state));
    targetX += miss.lateral;
    targetY += miss.depth;
    targetZ += 0.4;
  }

  ball.vx = (targetX - fromX) / flight;
  ball.vy = (targetY - fromY) / flight;
  ball.vz = (targetZ - fromZ) / flight + 0.5 * GRAVITY * flight;
  ball.landsAt = state.t + flight;
  state.phase = "shot";

  if (resolution.greened) setToast(state, "Green", "green");
}

function attemptSteal(state: GameState, thief: Actor, holder: Actor) {
  thief.pose = "reach";
  thief.poseUntil = state.t + 0.28;

  const reach = Math.hypot(thief.x - holder.x, thief.y - holder.y);
  if (reach > STEAL_RANGE) {
    thief.stealReadyAt = state.t + STEAL_COOLDOWN;
    return;
  }

  const exposure = holder.meter.active ? 0.9 : 1;
  const shaken = state.t < holder.stumbleUntil ? 1.7 : 1;
  const chance = STEAL_BASE * (1 - (reach / STEAL_RANGE) ** 2) * shaken * exposure;

  if (random(state) < chance) {
    const ball = state.ball;
    resetMeter(holder.meter);
    holder.airborneFor = "none";
    ball.holder = thief.id;
    ball.mode = "held";
    ball.shooter = null;
    ball.outcome = null;
    state.possession = thief.id;
    state.shotClock = SHOT_CLOCK;
    thief.stealReadyAt = state.t + 0.4;
    setToast(state, thief.id === "user" ? "Stolen!" : "CPU steal", "steal");
    return;
  }

  thief.stealReadyAt = state.t + STEAL_COOLDOWN;
  thief.stumbleUntil = state.t + STEAL_SELF_STUMBLE;
}

function attemptCrossover(state: GameState, handler: Actor, defender: Actor) {
  if (state.t < handler.crossoverReadyAt) return;

  handler.crossoverUntil = state.t + CROSSOVER_DURATION;
  handler.crossoverReadyAt = state.t + CROSSOVER_COOLDOWN;
  handler.facing = handler.facing === 1 ? -1 : 1;

  const reach = Math.hypot(handler.x - defender.x, handler.y - defender.y);
  if (reach > CROSSOVER_REACH) return;

  const bite =
    defender.id === "bot"
      ? PROFILES[state.difficulty].bite
      : Math.hypot(defender.vx, defender.vy) > WALK_SPEED * 0.8
        ? 0.6
        : 0.32;

  if (random(state) < bite) {
    defender.stumbleUntil = state.t + STUMBLE_DURATION;
    setToast(state, handler.id === "user" ? "Shook him" : "CPU shakes you", "info");
  }
}

function applyActions(state: GameState, actor: Actor, input: Input, dt: number) {
  if (state.t < actor.stunUntil) return;

  const ball = state.ball;
  const opponent = actorOf(state, other(actor.id));
  const hasBall = ball.mode === "held" && ball.holder === actor.id;

  if (actor.meter.active) {
    actor.meter.value += dt / SHOT_WINDUP;
    const target = actor.meter.releaseTarget;
    const forced = actor.meter.value >= METER_OVERFILL;
    const auto = target !== null && actor.meter.value >= target;

    if (input.shootReleased || forced || auto) {
      releaseShot(state, actor, opponent);
    }
    return;
  }

  if (hasBall) {
    if (input.shootPressed && state.phase === "live") {
      startShot(state, actor);
      return;
    }
    if (input.actionPressed) attemptCrossover(state, actor, opponent);
    return;
  }

  // Off the ball: jump to contest or reach in for the steal.
  if (input.shootPressed && actor.z <= 0.01) {
    actor.vz = JUMP_VZ;
    actor.z = 0.001;
    actor.airborneFor = "block";
    actor.pose = "reach";
    actor.poseUntil = state.t + 0.4;
  }

  if (
    input.actionPressed &&
    state.t >= actor.stealReadyAt &&
    ball.mode === "held" &&
    ball.holder === opponent.id
  ) {
    attemptSteal(state, actor, opponent);
  }
}

function updatePose(state: GameState, actor: Actor) {
  if (actor.meter.active || (actor.airborneFor === "shot" && actor.z > 0.01)) {
    actor.pose = "shoot";
    return;
  }
  if (actor.airborneFor === "block" && actor.z > 0.01) {
    actor.pose = "reach";
    return;
  }
  if (state.t < actor.poseUntil) return;
  actor.pose = "run";
}

function scoreBasket(state: GameState) {
  const ball = state.ball;
  const team = ball.shooter ?? state.possession;
  const value = ball.value;

  if (team === "user") state.scoreUser += value;
  else state.scoreBot += value;

  ball.mode = "loose";
  ball.x = HOOP_X;
  ball.y = HOOP_Y;
  ball.z = RIM_HEIGHT - 1.2;
  ball.vx = 0;
  ball.vy = 1.4;
  ball.vz = -7;
  ball.grabReadyAt = Number.POSITIVE_INFINITY;
  ball.looseSince = state.t;

  const total = team === "user" ? state.scoreUser : state.scoreBot;
  setToast(state, `+${value}`, "score");

  if (total >= TARGET_SCORE) {
    state.phase = "over";
    state.winner = team;
    return;
  }

  // Make it, take it.
  state.possession = team;
  state.phase = "made";
  state.phaseUntil = state.t + MADE_PAUSE;
}

function reboundOffRim(state: GameState) {
  const ball = state.ball;
  const awayX = ball.x - HOOP_X;
  const awayY = ball.y - HOOP_Y;
  const away = Math.max(0.6, Math.hypot(awayX, awayY));
  const kick = 4 + random(state) * 5;

  // Caroms are mostly random so the shooter has no claim on their own miss.
  const spin = random(state) * Math.PI * 2;

  ball.mode = "loose";
  ball.outcome = null;
  ball.vx = Math.cos(spin) * kick + (awayX / away) * 2.4;
  ball.vy = Math.sin(spin) * kick + (awayY / away) * 2.4 + 1.2;
  ball.vz = 6.5 + random(state) * 3;
  ball.grabReadyAt = state.t + 0.16;
  ball.looseSince = state.t;
  state.phase = "live";
}

function tryGrab(state: GameState) {
  const ball = state.ball;
  if (state.t < ball.grabReadyAt) return;

  const patience = Math.max(0, state.t - ball.looseSince - 3);
  const baseRange = GRAB_RANGE + patience * 1.6;

  let winner: Actor | null = null;
  let best = Infinity;

  for (const actor of [state.user, state.bot]) {
    if (state.t < actor.stunUntil) continue;
    const jumping = actor.airborneFor === "block";
    const range = baseRange + (jumping ? 1.4 : 0);
    const horiz = Math.hypot(actor.x - ball.x, actor.y - ball.y);
    if (horiz > range) continue;
    if (ball.z > PLAYER_HEIGHT + actor.z + 1.3) continue;

    const score = horiz - (jumping ? 1.8 : 0);
    if (score < best) {
      best = score;
      winner = actor;
    }
  }

  if (!winner) return;

  const changed = state.possession !== winner.id;
  state.possession = winner.id;
  state.shotClock = SHOT_CLOCK;

  ball.holder = winner.id;
  ball.mode = "held";
  ball.shooter = null;
  ball.outcome = null;

  if (changed) setToast(state, winner.id === "user" ? "Your ball" : "CPU ball", "info");
}

function updateBall(state: GameState, dt: number) {
  const ball = state.ball;

  if (ball.mode === "held") {
    attachBall(state);
    return;
  }

  ball.vz -= GRAVITY * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  if (ball.mode === "flight") {
    if (state.t >= ball.landsAt) {
      if (ball.outcome === "make") scoreBasket(state);
      else reboundOffRim(state);
    }
    return;
  }

  if (ball.z <= BALL_RADIUS) {
    ball.z = BALL_RADIUS;
    if (ball.vz < 0) ball.vz = -ball.vz * BALL_RESTITUTION;
    if (Math.abs(ball.vz) < 1.4) ball.vz = 0;
    ball.vx *= BALL_FRICTION;
    ball.vy *= BALL_FRICTION;
  }

  const limitX = COURT_HALF_WIDTH - 1;
  if (ball.x < -limitX) {
    ball.x = -limitX;
    ball.vx = Math.abs(ball.vx) * 0.6;
  }
  if (ball.x > limitX) {
    ball.x = limitX;
    ball.vx = -Math.abs(ball.vx) * 0.6;
  }
  if (ball.y < 0.7) {
    ball.y = 0.7;
    ball.vy = Math.abs(ball.vy) * 0.6;
  }
  if (ball.y > COURT_DEPTH - 1) {
    ball.y = COURT_DEPTH - 1;
    ball.vy = -Math.abs(ball.vy) * 0.6;
  }

  if (state.phase === "made" || state.phase === "over") return;
  tryGrab(state);
}

function updateShotClock(state: GameState, dt: number) {
  if (state.phase !== "live" || state.ball.mode !== "held") return;

  state.shotClock = Math.max(0, state.shotClock - dt);
  if (state.shotClock > 0) return;

  const losing = state.possession;
  resetMeter(actorOf(state, losing).meter);
  state.possession = other(losing);
  state.phase = "turnover";
  state.phaseUntil = state.t + TURNOVER_PAUSE;
  setToast(state, "Shot clock", "info");
}

export function step(state: GameState, user: Input, bot: Input, dt: number) {
  state.t += dt;

  if (state.toast && state.t > state.toast.until) state.toast = null;

  if (state.phase === "check") {
    const wants =
      user.startPressed ||
      user.shootPressed ||
      bot.startPressed ||
      Math.abs(user.moveX) + Math.abs(user.moveY) > 0 ||
      Math.abs(bot.moveX) + Math.abs(bot.moveY) > 0;

    if (state.t >= state.phaseUntil && wants) state.phase = "live";
    attachBall(state);
    return;
  }

  if (state.phase === "made" || state.phase === "turnover") {
    updateBall(state, dt);
    if (state.t >= state.phaseUntil) setCheck(state, state.possession);
    return;
  }

  if (state.phase === "over") {
    updateBall(state, dt);
    return;
  }

  moveActor(state, state.user, user, dt);
  moveActor(state, state.bot, bot, dt);
  separate(state);

  applyActions(state, state.user, user, dt);
  applyActions(state, state.bot, bot, dt);

  updatePose(state, state.user);
  updatePose(state, state.bot);

  updateBall(state, dt);
  updateShotClock(state, dt);
}
