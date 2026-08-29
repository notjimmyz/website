import {
  BASELINE_Y,
  BETWEEN_PAUSE,
  COURT_HALF_WIDTH,
  FAULT_PAUSE,
  FLASH_DURATION,
  GAMES_TO_WIN,
  MOVE_ACCEL,
  MOVE_FRICTION,
  MOVE_SPEED,
  NET_STANDOFF,
  PLANT_DAMP,
  READY_BACK,
  RECOVER_SPEED_SCALE,
  RETURN_STANCE_BACK,
  RETURN_STANCE_X,
  ROAM_BACK,
  ROAM_SIDE,
  SERVE_CONTACT_LOW,
  SERVE_DELAY,
  SERVE_STANCE_BACK,
  SHOTS,
  TIEBREAK_TARGET,
  TOAST_DURATION,
  TOSS_START_Z,
  TOSS_VZ,
  type ShotType,
} from "./constants";
import {
  inServiceBox,
  inSingles,
  isDeuceCourt,
  serveBoxSign,
  serveStanceX,
} from "./court";
import { clamp } from "./math";
import { advanceBall } from "./physics";
import { SERVE_IDEAL_DELAY } from "./serve";
import {
  canReach,
  contactTiming,
  groundTarget,
  launchShot,
  positionQuality,
  servePositionQuality,
  serveTarget,
  timingGrade,
  timingQuality,
} from "./shot";
import {
  actorOf,
  other,
  type Actor,
  type Ball,
  type Difficulty,
  type GameState,
  type Input,
  type PointReason,
  type Pose,
  type Side,
  type Team,
  type TimingGrade,
  type ToastKind,
} from "./types";

const SIDE_LIMIT = COURT_HALF_WIDTH + ROAM_SIDE;

function makeActor(id: Team, own: Side): Actor {
  return {
    id,
    own,
    x: 0,
    y: own * (BASELINE_Y + READY_BACK),
    vx: 0,
    vy: 0,
    facing: 1,
    stroke: "idle",
    shot: null,
    contactAt: 0,
    strokeUntil: 0,
    aimX: 0,
    aimY: 0,
    pose: "ready",
    planAimX: 0,
    planAimY: 0,
    planShot: "topspin",
    nextActionAt: 0,
    serveSwingAt: 0,
    committed: false,
  };
}

function makeBall(): Ball {
  return {
    x: 0,
    y: 0,
    z: 3,
    vx: 0,
    vy: 0,
    vz: 0,
    mode: "idle",
    hitter: null,
    serve: false,
    bounces: 0,
    landingX: 0,
    landingY: 0,
    spin: 0,
  };
}

export function createMatch(difficulty: Difficulty, seed = 20260828): GameState {
  const state: GameState = {
    t: 0,
    seed,
    difficulty,
    phase: "serve",
    phaseUntil: 0,
    serveStage: "ready",
    tossAt: 0,
    faults: 0,
    user: makeActor("user", 1),
    bot: makeActor("bot", -1),
    ball: makeBall(),
    score: {
      games: { user: 0, bot: 0 },
      points: { user: 0, bot: 0 },
      tiebreak: false,
      server: "user",
      played: 0,
    },
    winner: null,
    toast: null,
    flash: null,
  };

  setUpServe(state);
  return state;
}

export function resetMatch(state: GameState, difficulty: Difficulty) {
  const score = state.score;
  state.t = 0;
  state.difficulty = difficulty;
  score.games.user = 0;
  score.games.bot = 0;
  score.points.user = 0;
  score.points.bot = 0;
  score.tiebreak = false;
  score.server = "user";
  score.played = 0;
  state.winner = null;
  state.toast = null;
  state.flash = null;
  setUpServe(state);
}

// Serving --------------------------------------------------------------------

export function serveContext(state: GameState) {
  const server = actorOf(state, state.score.server);
  const deuce = isDeuceCourt(state.score.played);
  return { server, deuce, boxSign: serveBoxSign(server.own, deuce) };
}

function setUpServe(state: GameState) {
  const { server, deuce, boxSign } = serveContext(state);
  const receiver = actorOf(state, other(server.id));

  state.phase = "serve";
  state.serveStage = "ready";
  state.phaseUntil = state.t + SERVE_DELAY;
  state.faults = 0;

  placeActor(
    server,
    serveStanceX(server.own, deuce),
    server.own * (BASELINE_Y + SERVE_STANCE_BACK),
  );
  placeActor(
    receiver,
    boxSign * RETURN_STANCE_X,
    receiver.own * (BASELINE_Y + RETURN_STANCE_BACK),
  );

  restBall(state);
}

function placeActor(actor: Actor, x: number, y: number) {
  actor.x = x;
  actor.y = y;
  actor.vx = 0;
  actor.vy = 0;
  actor.stroke = "idle";
  actor.shot = null;
  actor.pose = "ready";
  actor.aimX = 0;
  actor.aimY = 0;
  actor.committed = false;
  actor.nextActionAt = 0;
  actor.serveSwingAt = 0;
}

function restBall(state: GameState) {
  const { server } = serveContext(state);
  const ball = state.ball;
  ball.mode = "idle";
  ball.x = server.x + server.own * 0.9;
  ball.y = server.y - server.own * 1.1;
  ball.z = 3;
  ball.vx = 0;
  ball.vy = 0;
  ball.vz = 0;
  ball.hitter = null;
  ball.serve = false;
  ball.bounces = 0;
}

function toss(state: GameState) {
  const { server } = serveContext(state);
  const ball = state.ball;
  ball.mode = "toss";
  ball.x = server.x + server.own * 0.3;
  ball.y = server.y - server.own * 1.3;
  ball.z = TOSS_START_Z;
  ball.vx = 0;
  ball.vy = 0;
  ball.vz = TOSS_VZ;
  ball.bounces = 0;
  ball.serve = false;
  ball.hitter = null;
  state.serveStage = "toss";
  state.tossAt = state.t;
}

function updateServe(state: GameState, input: Input) {
  const { server } = serveContext(state);

  if (state.serveStage === "ready") {
    if (input.topspin && state.t >= state.phaseUntil) toss(state);
    return;
  }

  if (server.stroke === "idle") {
    // The toss is up: WASD is already picking the corner of the box.
    server.aimX = input.moveX;
    server.aimY = input.moveY;

    if (input.topspin) {
      server.stroke = "aiming";
      server.shot = "serve";
      server.contactAt = state.t + SHOTS.serve.windup;
    } else if (state.ball.z <= SERVE_CONTACT_LOW && state.ball.vz < 0) {
      fault(state);
    }
  }
}

function fault(state: GameState) {
  state.faults += 1;

  if (state.faults >= 2) {
    endPoint(state, other(state.score.server), "double-fault");
    return;
  }

  const { server } = serveContext(state);
  server.stroke = "idle";
  server.shot = null;
  server.pose = "ready";
  state.serveStage = "ready";
  state.phase = "serve";
  state.phaseUntil = state.t + FAULT_PAUSE;
  restBall(state);
  say(state, "Fault", "fault");
}

// Strokes --------------------------------------------------------------------

function pickShot(input: Input): ShotType | null {
  if (input.topspin) return "topspin";
  if (input.drop) return "drop";
  if (input.lob) return "lob";
  return null;
}

/** The server stands still through the toss, so WASD is free to aim. */
function isPlanted(state: GameState, actor: Actor) {
  if (actor.stroke === "aiming") return true;
  return (
    state.phase === "serve" &&
    state.serveStage === "toss" &&
    actor.id === state.score.server
  );
}

function updateActor(state: GameState, actor: Actor, input: Input, dt: number) {
  if (isPlanted(state, actor)) {
    const damp = Math.exp(-PLANT_DAMP * dt);
    actor.vx *= damp;
    actor.vy *= damp;
    if (actor.stroke === "aiming") {
      actor.aimX = input.moveX;
      actor.aimY = input.moveY;
    }
  } else {
    steer(actor, input, dt);
  }

  actor.x += actor.vx * dt;
  actor.y += actor.vy * dt;
  confine(actor);

  if (state.phase === "rally" && actor.stroke === "idle") {
    const shot = pickShot(input);
    if (shot) {
      actor.stroke = "aiming";
      actor.shot = shot;
      actor.contactAt = state.t + SHOTS[shot].windup;
      actor.aimX = input.moveX;
      actor.aimY = input.moveY;
    }
  }

  if (actor.stroke === "aiming" && state.t >= actor.contactAt) {
    const shot = actor.shot ?? "topspin";
    if (shot === "serve") resolveServe(state, actor);
    else resolveStroke(state, actor, shot);
    if (actor.stroke === "aiming") {
      actor.stroke = "recover";
      actor.strokeUntil = state.t + SHOTS[shot].recover;
    }
  }

  if (actor.stroke === "recover" && state.t >= actor.strokeUntil) {
    actor.stroke = "idle";
    actor.shot = null;
    actor.committed = false;
  }

  face(actor, state.ball);
  actor.pose = readPose(actor);
}

function steer(actor: Actor, input: Input, dt: number) {
  const scale = actor.stroke === "recover" ? RECOVER_SPEED_SCALE : 1;
  let mx = input.moveX;
  let my = input.moveY;
  const len = Math.hypot(mx, my);
  if (len > 1) {
    mx /= len;
    my /= len;
  }

  // Input is read in the player's own frame, so W is always toward the net.
  const wantX = actor.own * mx * MOVE_SPEED * scale;
  const wantY = actor.own * my * MOVE_SPEED * scale;
  const rate = len > 0.01 ? MOVE_ACCEL : MOVE_FRICTION;

  actor.vx = approach(actor.vx, wantX, rate * dt);
  actor.vy = approach(actor.vy, wantY, rate * dt);
}

function approach(value: number, goal: number, delta: number) {
  if (value < goal) return Math.min(goal, value + delta);
  return Math.max(goal, value - delta);
}

function confine(actor: Actor) {
  const near = actor.own * NET_STANDOFF;
  const far = actor.own * (BASELINE_Y + ROAM_BACK);
  const low = Math.min(near, far);
  const high = Math.max(near, far);

  if (actor.y < low) {
    actor.y = low;
    actor.vy = Math.max(actor.vy, 0);
  } else if (actor.y > high) {
    actor.y = high;
    actor.vy = Math.min(actor.vy, 0);
  }

  if (actor.x < -SIDE_LIMIT) {
    actor.x = -SIDE_LIMIT;
    actor.vx = Math.max(actor.vx, 0);
  } else if (actor.x > SIDE_LIMIT) {
    actor.x = SIDE_LIMIT;
    actor.vx = Math.min(actor.vx, 0);
  }
}

function face(actor: Actor, ball: Ball) {
  const gap = ball.x - actor.x;
  if (Math.abs(gap) > 0.6) actor.facing = gap > 0 ? 1 : -1;
}

function readPose(actor: Actor): Pose {
  if (actor.shot === "serve") return "serve";
  if (actor.stroke === "idle") return "ready";
  return actor.pose === "reach" && actor.stroke === "recover" ? "reach" : "swing";
}

function resolveStroke(state: GameState, actor: Actor, shot: ShotType) {
  const ball = state.ball;
  const playable =
    ball.mode === "flight" &&
    ball.hitter !== actor.id &&
    ball.bounces < 2 &&
    !(ball.serve && ball.bounces === 0);

  if (!playable || !canReach(actor, ball)) return;

  const error = contactTiming(actor, ball);
  const quality = clamp(
    timingQuality(error) * positionQuality(actor, ball) * SHOTS[shot].consistency,
    0.05,
    1,
  );

  const stretched = Math.abs(ball.x - actor.x) > 3.6;
  launchShot(state, actor, shot, groundTarget(actor, SHOTS[shot]), quality);
  ball.serve = false;

  actor.stroke = "recover";
  actor.strokeUntil = state.t + SHOTS[shot].recover;
  actor.pose = stretched ? "reach" : "swing";

  if (actor.id === "user") flash(state, timingGrade(error));
}

function resolveServe(state: GameState, actor: Actor) {
  const ball = state.ball;
  const { boxSign } = serveContext(state);

  if (ball.mode !== "toss" || ball.z < SERVE_CONTACT_LOW || ball.z > 12) {
    fault(state);
    return;
  }

  const error = state.t - (state.tossAt + SERVE_IDEAL_DELAY);
  const quality = clamp(
    timingQuality(error) * servePositionQuality(ball) * SHOTS.serve.consistency,
    0.05,
    1,
  );

  launchShot(state, actor, "serve", serveTarget(actor, boxSign, SHOTS.serve), quality);
  ball.serve = true;
  state.phase = "rally";

  if (actor.id === "user") flash(state, timingGrade(error));
}

// Ball and point resolution --------------------------------------------------

function updateBall(state: GameState, dt: number) {
  const ball = state.ball;
  const event = advanceBall(ball, dt);

  if (ball.mode !== "flight" || !ball.hitter) return;

  if (event.net) {
    if (ball.serve && ball.bounces === 0) fault(state);
    else endPoint(state, other(ball.hitter), "net");
    return;
  }

  if (!event.bounce) return;

  const { x, y } = event.bounce;
  const hitter = ball.hitter;
  const hitterOwn = actorOf(state, hitter).own;

  if (ball.bounces >= 2) {
    endPoint(state, hitter, ball.serve ? "ace" : "rally");
    return;
  }

  if (ball.serve) {
    const receiver = actorOf(state, other(hitter));
    const boxSign = serveBoxSign(hitterOwn, isDeuceCourt(state.score.played));
    if (!inServiceBox(x, y, receiver.own, boxSign)) fault(state);
    return;
  }

  const crossed = (y > 0 ? 1 : -1) === -hitterOwn;
  if (!crossed || !inSingles(x, y)) endPoint(state, other(hitter), "out");
}

const REASON_TEXT: Record<PointReason, string> = {
  out: "Out",
  net: "Net",
  rally: "Point",
  ace: "Ace",
  "double-fault": "Double fault",
};

function endPoint(state: GameState, winner: Team, reason: PointReason) {
  state.phase = "between";
  state.phaseUntil = state.t + BETWEEN_PAUSE;
  state.user.stroke = "idle";
  state.bot.stroke = "idle";
  state.user.shot = null;
  state.bot.shot = null;

  say(state, REASON_TEXT[reason], reason === "ace" ? "good" : "point");
  awardPoint(state, winner);
}

// Scoring --------------------------------------------------------------------

function awardPoint(state: GameState, winner: Team) {
  const score = state.score;
  const loser = other(winner);
  score.points[winner] += 1;
  score.played += 1;

  const target = score.tiebreak ? TIEBREAK_TARGET : 4;
  if (score.points[winner] >= target && score.points[winner] - score.points[loser] >= 2) {
    winGame(state, winner);
    return;
  }

  if (score.tiebreak) {
    // The serve swaps after the first point of the breaker, then every two.
    if (score.played % 2 === 1) score.server = other(score.server);
    return;
  }

  // Fold anything past 40-40 back onto deuce and advantage.
  if (score.points.user >= 3 && score.points.bot >= 3) {
    const lead = score.points[winner] - score.points[loser];
    score.points[winner] = lead === 0 ? 3 : 4;
    score.points[loser] = 3;
  }
}

function winGame(state: GameState, winner: Team) {
  const score = state.score;
  score.games[winner] += 1;
  score.points.user = 0;
  score.points.bot = 0;
  score.played = 0;

  if (score.tiebreak || score.games[winner] >= GAMES_TO_WIN) {
    state.winner = winner;
    return;
  }

  score.server = other(score.server);
  if (
    score.games.user === GAMES_TO_WIN - 1 &&
    score.games.bot === GAMES_TO_WIN - 1
  ) {
    score.tiebreak = true;
  }
}

// Feedback -------------------------------------------------------------------

function say(state: GameState, text: string, kind: ToastKind) {
  state.toast = { text, kind, until: state.t + TOAST_DURATION };
}

function flash(state: GameState, grade: TimingGrade) {
  state.flash = { grade, until: state.t + FLASH_DURATION };
}

// Between points -------------------------------------------------------------

function driftHome(state: GameState, actor: Actor, dt: number) {
  const homeY = actor.own * (BASELINE_Y + READY_BACK);
  const ease = 1 - Math.exp(-2.6 * dt);
  actor.x += (0 - actor.x) * ease;
  actor.y += (homeY - actor.y) * ease;
  actor.vx = 0;
  actor.vy = 0;
  actor.pose = "ready";
  actor.stroke = "idle";
  actor.shot = null;
}

// Entry point ----------------------------------------------------------------

/** Reads the phase behind a call boundary, since a stroke may have ended the point. */
function halted(state: GameState) {
  return state.phase === "between" || state.phase === "over";
}

export function step(state: GameState, userInput: Input, botInput: Input, dt: number) {
  state.t += dt;

  if (state.toast && state.t >= state.toast.until) state.toast = null;
  if (state.flash && state.t >= state.flash.until) state.flash = null;

  if (state.phase === "over") {
    advanceBall(state.ball, dt);
    return;
  }

  if (state.phase === "between") {
    advanceBall(state.ball, dt);
    driftHome(state, state.user, dt);
    driftHome(state, state.bot, dt);
    if (state.t >= state.phaseUntil) {
      if (state.winner) state.phase = "over";
      else setUpServe(state);
    }
    return;
  }

  if (state.phase === "serve") {
    updateServe(state, state.score.server === "user" ? userInput : botInput);
    if (state.phase !== "serve") return;
  }

  updateActor(state, state.user, userInput, dt);
  if (halted(state)) return;

  updateActor(state, state.bot, botInput, dt);
  if (halted(state)) return;

  updateBall(state, dt);
}
