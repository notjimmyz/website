// Headless smoke test for the basketball simulation. Compiled lib lives beside
// this file; run via `node .tmp-bball/smoke.cjs`.
const { createGame, step } = require("./step.js");
const { decideBot } = require("./bot.js");
const { distanceToHoop } = require("./court.js");
const C = require("./constants.js");

const DT = 1 / 60;

function emptyInput() {
  return {
    moveX: 0,
    moveY: 0,
    sprint: false,
    shootHeld: false,
    shootPressed: false,
    shootReleased: false,
    actionPressed: false,
    startPressed: false,
  };
}

function mulberry(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stands in for a keyboard. "perfect" always releases on the sweet spot,
 * "human" adds timing noise so misses, rebounds and bot possessions happen.
 */
function makeUser(kind, rng) {
  let releaseAt = null;

  return function scriptUser(state, input) {
    input.moveX = 0;
    input.moveY = 0;
    input.sprint = false;
    input.shootPressed = false;
    input.shootReleased = false;
    input.actionPressed = false;
    input.startPressed = false;

    const me = state.user;
    const foe = state.bot;
    const ball = state.ball;

    if (state.phase === "check") {
      input.startPressed = true;
      return;
    }

    const aim = (tx, ty) => {
      const dx = tx - me.x;
      const dy = ty - me.y;
      const d = Math.hypot(dx, dy) || 1;
      input.moveX = dx / d;
      input.moveY = dy / d;
    };

    if (me.meter.active) {
      input.shootHeld = true;
      if (releaseAt === null) {
        const noise = kind === "human" ? (rng() - 0.5) * 0.22 : 0;
        releaseAt = me.meter.center + noise;
      }
      if (me.meter.value >= releaseAt) {
        input.shootHeld = false;
        input.shootReleased = true;
        releaseAt = null;
      }
      return;
    }

    releaseAt = null;

    if (ball.mode !== "held") {
      aim(ball.x, ball.y);
      input.sprint = true;
      return;
    }

    if (ball.holder === "user") {
      const distance = distanceToHoop(me.x, me.y);
      const guarded = Math.hypot(me.x - foe.x, me.y - foe.y);

      if (distance < 13 && (guarded > 3.4 || state.shotClock < 4)) {
        input.shootPressed = true;
        input.shootHeld = true;
        return;
      }

      aim(0, C.HOOP_Y + 6);
      input.sprint = true;
      if (guarded < 4.5 && rng() < 0.02) input.actionPressed = true;
      return;
    }

    aim(foe.x, foe.y);
    input.sprint = true;
    if (rng() < 0.02) input.actionPressed = true;
    if (foe.meter.active && rng() < 0.06) input.shootPressed = true;
  };
}

function finite(state, tick) {
  const values = [
    state.user.x,
    state.user.y,
    state.user.z,
    state.bot.x,
    state.bot.y,
    state.bot.z,
    state.ball.x,
    state.ball.y,
    state.ball.z,
    state.shotClock,
  ];
  for (const value of values) {
    if (!Number.isFinite(value)) throw new Error(`non-finite value at tick ${tick}`);
  }

  const slack = 3;
  for (const actor of [state.user, state.bot]) {
    if (Math.abs(actor.x) > C.COURT_HALF_WIDTH + slack) {
      throw new Error(`actor left the court sideways at tick ${tick}: ${actor.x}`);
    }
    if (actor.y < -slack || actor.y > C.COURT_DEPTH + slack) {
      throw new Error(`actor left the court lengthwise at tick ${tick}: ${actor.y}`);
    }
  }
}

function playGame(difficulty, seed, kind) {
  const state = createGame(difficulty, seed);
  const input = emptyInput();
  const rng = mulberry(seed ^ 0x9e3779b9);
  const scriptUser = makeUser(kind, rng);

  let ticks = 0;
  let looseFor = 0;
  let maxLoose = 0;
  let shots = 0;
  let greens = 0;
  let steals = 0;
  let blocks = 0;
  let turnovers = 0;
  let possession = state.possession;
  let changes = 0;
  let botPossessions = 0;
  let botShots = 0;
  let botSeconds = 0;

  while (state.phase !== "over" && ticks < 60 * 60 * 6) {
    scriptUser(state, input);
    const wasShooting = state.user.meter.active;
    const botWasShooting = state.bot.meter.active;
    const lastToast = state.toast?.text ?? null;

    step(state, input, decideBot(state, DT), DT);

    if (botWasShooting && !state.bot.meter.active) botShots += 1;
    if (state.ball.holder === "bot") botSeconds += DT;
    ticks += 1;
    finite(state, ticks);

    if (wasShooting && !state.user.meter.active) {
      shots += 1;
      if (state.user.meter.greened) greens += 1;
    }

    const toast = state.toast?.text ?? null;
    if (toast && toast !== lastToast) {
      if (toast.includes("Stolen") || toast.includes("steal")) steals += 1;
      if (toast.includes("Blocked")) blocks += 1;
      if (toast === "Shot clock") turnovers += 1;
    }

    if (state.possession !== possession) {
      possession = state.possession;
      changes += 1;
      if (possession === "bot") botPossessions += 1;
    }

    if (state.ball.mode === "loose") {
      looseFor += DT;
      maxLoose = Math.max(maxLoose, looseFor);
    } else {
      looseFor = 0;
    }
  }

  return {
    seconds: +(ticks * DT).toFixed(1),
    user: state.scoreUser,
    bot: state.scoreBot,
    winner: state.winner,
    finished: state.phase === "over",
    maxLoose: +maxLoose.toFixed(1),
    shots,
    greens,
    steals,
    blocks,
    turnovers,
    changes,
    botPossessions,
    botShots,
    botSeconds: +botSeconds.toFixed(1),
  };
}

const SEEDS = Array.from({ length: 12 }, (_, i) => 1 + i * 104729);
let failures = 0;

for (const kind of ["perfect", "human"]) {
  console.log(`\n=== ${kind} player ===`);
  for (const difficulty of ["easy", "normal", "hard"]) {
    let botTotal = 0;
    let userWins = 0;
    let botPoss = 0;
    let botShots = 0;

    for (const seed of SEEDS) {
      const r = playGame(difficulty, seed, kind);
      const ok = r.finished && r.maxLoose < 10;
      if (!ok) failures += 1;
      botTotal += r.bot;
      botPoss += r.botPossessions;
      botShots += r.botShots;
      if (r.winner === "user") userWins += 1;

      console.log(
        `${ok ? "ok  " : "FAIL"} ${difficulty.padEnd(6)} seed ${String(seed).padEnd(9)} ` +
          `${String(r.seconds).padStart(5)}s  ${r.user}-${r.bot} (${r.winner})  ` +
          `green ${r.greens}/${r.shots}  steals ${r.steals}  blocks ${r.blocks}  ` +
          `cpu poss ${r.botPossessions} shots ${r.botShots} ball ${r.botSeconds}s  ` +
          `maxLoose ${r.maxLoose}s`,
      );
    }

    console.log(
      `     -> ${difficulty}: cpu averaged ${(botTotal / SEEDS.length).toFixed(1)} points from ` +
        `${(botPoss / SEEDS.length).toFixed(1)} possessions and ${(botShots / SEEDS.length).toFixed(1)} shots, ` +
        `player won ${userWins}/${SEEDS.length}`,
    );
  }
}

console.log(failures === 0 ? "\nall games completed cleanly" : `\n${failures} failing games`);
process.exit(failures === 0 ? 0 : 1);
