"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = createGame;
exports.resetGame = resetGame;
exports.setToast = setToast;
exports.step = step;
const bot_1 = require("./bot");
const constants_1 = require("./constants");
const court_1 = require("./court");
const rng_1 = require("./rng");
const shot_1 = require("./shot");
function createMeter() {
    return {
        active: false,
        value: 0,
        center: constants_1.METER_CENTER,
        half: 0,
        releaseTarget: null,
        lastError: 0,
        greened: false,
        flashUntil: 0,
    };
}
function createActor(id) {
    return {
        id,
        x: 0,
        y: id === "user" ? constants_1.CHECK_Y : constants_1.CHECK_Y - constants_1.CHECK_DEFENDER_GAP,
        vx: 0,
        vy: 0,
        z: 0,
        vz: 0,
        facing: 1,
        speedScale: 1,
        stamina: constants_1.STAMINA_MAX,
        pose: "run",
        poseUntil: 0,
        airborneFor: "none",
        crossoverUntil: 0,
        crossoverReadyAt: 0,
        stumbleUntil: 0,
        stealReadyAt: 0,
        meter: createMeter(),
        perceivedX: 0,
        perceivedY: constants_1.CHECK_Y,
        decideAt: 0,
        jinx: 0,
    };
}
function createGame(difficulty, seed = 0x2f6a1b) {
    const state = {
        t: 0,
        phase: "check",
        phaseUntil: 0,
        possession: "user",
        scoreUser: 0,
        scoreBot: 0,
        shotClock: constants_1.SHOT_CLOCK,
        difficulty,
        user: createActor("user"),
        bot: createActor("bot"),
        ball: {
            x: 0,
            y: constants_1.CHECK_Y,
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
function applyDifficulty(state, difficulty) {
    state.difficulty = difficulty;
    state.bot.speedScale = bot_1.PROFILES[difficulty].speed;
}
function resetGame(state, difficulty) {
    state.t = 0;
    state.scoreUser = 0;
    state.scoreBot = 0;
    state.winner = null;
    state.toast = null;
    applyDifficulty(state, difficulty);
    setCheck(state, "user");
}
function actorOf(state, team) {
    return team === "user" ? state.user : state.bot;
}
function other(team) {
    return team === "user" ? "bot" : "user";
}
function setToast(state, text, kind) {
    state.toast = { text, kind, until: state.t + constants_1.TOAST_DURATION };
}
function resetMeter(meter) {
    meter.active = false;
    meter.value = 0;
    meter.releaseTarget = null;
}
function setCheck(state, offense) {
    const off = actorOf(state, offense);
    const def = actorOf(state, other(offense));
    // The defender checks the ball up at their own guarding distance, so nobody
    // gets a free look straight off the check.
    const gap = def.id === "bot" ? bot_1.PROFILES[state.difficulty].space : constants_1.CHECK_DEFENDER_GAP;
    off.x = 0;
    off.y = constants_1.CHECK_Y;
    def.x = 0;
    def.y = constants_1.CHECK_Y - gap;
    for (const actor of [off, def]) {
        actor.vx = 0;
        actor.vy = 0;
        actor.z = 0;
        actor.vz = 0;
        actor.airborneFor = "none";
        actor.stumbleUntil = 0;
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
    state.shotClock = constants_1.SHOT_CLOCK;
    state.phase = "check";
    state.phaseUntil = state.t + 0.35;
    attachBall(state);
}
function attachBall(state) {
    const ball = state.ball;
    if (ball.mode !== "held" || !ball.holder)
        return;
    const holder = actorOf(state, ball.holder);
    if (holder.meter.active) {
        const lift = Math.min(1, holder.meter.value / holder.meter.center);
        ball.x = holder.x + holder.facing * 0.3;
        ball.y = holder.y - 0.2;
        ball.z = holder.z + 3.5 + lift * (constants_1.RELEASE_HEIGHT - 3.5);
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
function moveActor(state, actor, input, dt) {
    const stumbled = state.t < actor.stumbleUntil;
    const airborne = actor.z > 0.01;
    let top = (input.sprint && actor.stamina > constants_1.STAMINA_SPRINT_MIN ? constants_1.SPRINT_SPEED : constants_1.WALK_SPEED) *
        actor.speedScale;
    if (state.t < actor.crossoverUntil)
        top *= constants_1.CROSSOVER_BOOST;
    if (stumbled)
        top *= constants_1.STUMBLE_FACTOR;
    if (actor.meter.active)
        top *= 0.35;
    let ix = input.moveX;
    let iy = input.moveY;
    const magnitude = Math.hypot(ix, iy);
    if (magnitude > 1) {
        ix /= magnitude;
        iy /= magnitude;
    }
    const moving = magnitude > 0.01;
    const rate = (moving ? constants_1.ACCEL : constants_1.FRICTION) * (airborne ? constants_1.AIR_CONTROL : 1) * dt;
    const dvx = ix * top - actor.vx;
    const dvy = iy * top - actor.vy;
    const delta = Math.hypot(dvx, dvy);
    if (delta > 0.0001) {
        const scale = Math.min(1, rate / delta);
        actor.vx += dvx * scale;
        actor.vy += dvy * scale;
    }
    actor.x = (0, court_1.clampToCourtX)(actor.x + actor.vx * dt);
    actor.y = (0, court_1.clampToCourtY)(actor.y + actor.vy * dt);
    if (input.sprint && moving && actor.stamina > 0) {
        actor.stamina = Math.max(0, actor.stamina - constants_1.STAMINA_DRAIN * dt);
    }
    else {
        actor.stamina = Math.min(constants_1.STAMINA_MAX, actor.stamina + constants_1.STAMINA_REGEN * dt);
    }
    if (actor.z > 0 || actor.vz !== 0) {
        actor.vz -= constants_1.GRAVITY * dt;
        actor.z += actor.vz * dt;
        if (actor.z <= 0) {
            actor.z = 0;
            actor.vz = 0;
            actor.airborneFor = "none";
        }
    }
    if (Math.abs(actor.vx) > 1.2)
        actor.facing = actor.vx > 0 ? 1 : -1;
}
function separate(state) {
    const a = state.user;
    const b = state.bot;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= constants_1.BODY_SEPARATION || distance < 0.0001)
        return;
    const push = (constants_1.BODY_SEPARATION - distance) / 2;
    const nx = dx / distance;
    const ny = dy / distance;
    a.x = (0, court_1.clampToCourtX)(a.x - nx * push);
    a.y = (0, court_1.clampToCourtY)(a.y - ny * push);
    b.x = (0, court_1.clampToCourtX)(b.x + nx * push);
    b.y = (0, court_1.clampToCourtY)(b.y + ny * push);
}
function startShot(state, shooter) {
    const meter = shooter.meter;
    meter.active = true;
    meter.value = 0;
    meter.greened = false;
    meter.center = constants_1.METER_CENTER;
    shooter.vz = constants_1.SHOT_JUMP_VZ;
    shooter.z = Math.max(shooter.z, 0.001);
    shooter.airborneFor = "shot";
    shooter.pose = "shoot";
    if (shooter.id === "bot") {
        const profile = bot_1.PROFILES[state.difficulty];
        const defender = state.user;
        const distance = (0, court_1.distanceToHoop)(shooter.x, shooter.y);
        const nominal = (0, shot_1.greenWindow)(state.difficulty, (0, shot_1.contestOn)(shooter, defender), distance);
        const greened = (0, rng_1.random)(state) < profile.green;
        const drift = greened
            ? ((0, rng_1.random)(state) - 0.5) * nominal * 1.1
            : ((0, rng_1.random)(state) < 0.5 ? -1 : 1) * (nominal + 0.03 + (0, rng_1.random)(state) * 0.1);
        meter.releaseTarget = meter.center + drift;
    }
    else {
        meter.releaseTarget = null;
    }
}
function releaseShot(state, shooter, defender) {
    const meter = shooter.meter;
    const ball = state.ball;
    const distance = (0, court_1.distanceToHoop)(shooter.x, shooter.y);
    const contest = (0, shot_1.contestOn)(shooter, defender);
    const half = (0, shot_1.greenWindow)(state.difficulty, contest, distance);
    const error = meter.value - meter.center;
    const resolution = (0, shot_1.resolveShot)({
        error,
        half,
        distance,
        contest,
        random: (0, rng_1.random)(state),
    });
    meter.active = false;
    meter.half = half;
    meter.lastError = error;
    meter.greened = resolution.greened;
    meter.flashUntil = state.t + 1.1;
    meter.releaseTarget = null;
    ball.holder = null;
    ball.shooter = shooter.id;
    ball.value = (0, court_1.shotValue)(shooter.x, shooter.y);
    const fromX = ball.x;
    const fromY = ball.y;
    const fromZ = Math.max(ball.z, constants_1.RELEASE_HEIGHT * 0.85);
    const reach = Math.hypot(shooter.x - defender.x, shooter.y - defender.y);
    const blockSkill = defender.id === "bot" ? bot_1.PROFILES[state.difficulty].blockSkill : 1;
    const blocked = defender.z > 0.7 &&
        reach < constants_1.BLOCK_RANGE &&
        (0, rng_1.random)(state) < constants_1.BLOCK_BASE * (1 - reach / constants_1.BLOCK_RANGE) * blockSkill;
    if (blocked) {
        const awayX = shooter.x - defender.x;
        const awayY = shooter.y - defender.y;
        const away = Math.max(0.001, Math.hypot(awayX, awayY));
        ball.outcome = "blocked";
        ball.mode = "loose";
        ball.x = fromX;
        ball.y = fromY;
        ball.z = fromZ;
        ball.vx = (awayX / away) * 9 + ((0, rng_1.random)(state) - 0.5) * 4;
        ball.vy = (awayY / away) * 9;
        ball.vz = 3.5;
        ball.grabReadyAt = state.t + 0.22;
        ball.looseSince = state.t;
        state.phase = "live";
        setToast(state, defender.id === "user" ? "Blocked!" : "Blocked by CPU", "block");
        return;
    }
    ball.outcome = resolution.made ? "make" : "miss";
    ball.mode = "flight";
    const flight = 0.62 + distance * 0.028;
    let targetX = constants_1.HOOP_X;
    let targetY = constants_1.HOOP_Y;
    let targetZ = constants_1.RIM_HEIGHT;
    if (!resolution.made) {
        const miss = (0, shot_1.missTarget)(error, half, (0, rng_1.random)(state));
        targetX += miss.lateral;
        targetY += miss.depth;
        targetZ += 0.4;
    }
    ball.vx = (targetX - fromX) / flight;
    ball.vy = (targetY - fromY) / flight;
    ball.vz = (targetZ - fromZ) / flight + 0.5 * constants_1.GRAVITY * flight;
    ball.landsAt = state.t + flight;
    state.phase = "shot";
    if (resolution.greened)
        setToast(state, "Green", "green");
}
function attemptSteal(state, thief, holder) {
    thief.pose = "reach";
    thief.poseUntil = state.t + 0.28;
    const reach = Math.hypot(thief.x - holder.x, thief.y - holder.y);
    if (reach > constants_1.STEAL_RANGE) {
        thief.stealReadyAt = state.t + constants_1.STEAL_COOLDOWN;
        return;
    }
    const exposure = holder.meter.active ? 0.6 : 1;
    const shaken = state.t < holder.stumbleUntil ? 1.7 : 1;
    const chance = constants_1.STEAL_BASE * (1 - reach / constants_1.STEAL_RANGE) * shaken * exposure;
    if ((0, rng_1.random)(state) < chance) {
        const ball = state.ball;
        resetMeter(holder.meter);
        holder.airborneFor = "none";
        ball.holder = thief.id;
        ball.mode = "held";
        ball.shooter = null;
        ball.outcome = null;
        state.possession = thief.id;
        state.shotClock = constants_1.SHOT_CLOCK;
        thief.stealReadyAt = state.t + 0.4;
        setToast(state, thief.id === "user" ? "Stolen!" : "CPU steal", "steal");
        return;
    }
    thief.stealReadyAt = state.t + constants_1.STEAL_COOLDOWN;
    thief.stumbleUntil = state.t + constants_1.STEAL_SELF_STUMBLE;
}
function attemptCrossover(state, handler, defender) {
    if (state.t < handler.crossoverReadyAt)
        return;
    handler.crossoverUntil = state.t + constants_1.CROSSOVER_DURATION;
    handler.crossoverReadyAt = state.t + constants_1.CROSSOVER_COOLDOWN;
    handler.facing = handler.facing === 1 ? -1 : 1;
    const reach = Math.hypot(handler.x - defender.x, handler.y - defender.y);
    if (reach > constants_1.CROSSOVER_REACH)
        return;
    const bite = defender.id === "bot"
        ? bot_1.PROFILES[state.difficulty].bite
        : Math.hypot(defender.vx, defender.vy) > constants_1.WALK_SPEED * 0.8
            ? 0.6
            : 0.32;
    if ((0, rng_1.random)(state) < bite) {
        defender.stumbleUntil = state.t + constants_1.STUMBLE_DURATION;
        setToast(state, handler.id === "user" ? "Shook him" : "CPU shakes you", "info");
    }
}
function applyActions(state, actor, input, dt) {
    const ball = state.ball;
    const opponent = actorOf(state, other(actor.id));
    const hasBall = ball.mode === "held" && ball.holder === actor.id;
    if (actor.meter.active) {
        actor.meter.value += dt / constants_1.SHOT_WINDUP;
        const target = actor.meter.releaseTarget;
        const forced = actor.meter.value >= constants_1.METER_OVERFILL;
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
        if (input.actionPressed)
            attemptCrossover(state, actor, opponent);
        return;
    }
    // Off the ball: jump to contest or reach in for the steal.
    if (input.shootPressed && actor.z <= 0.01) {
        actor.vz = constants_1.JUMP_VZ;
        actor.z = 0.001;
        actor.airborneFor = "block";
        actor.pose = "reach";
        actor.poseUntil = state.t + 0.4;
    }
    if (input.actionPressed &&
        state.t >= actor.stealReadyAt &&
        ball.mode === "held" &&
        ball.holder === opponent.id) {
        attemptSteal(state, actor, opponent);
    }
}
function updatePose(state, actor) {
    if (actor.meter.active || (actor.airborneFor === "shot" && actor.z > 0.01)) {
        actor.pose = "shoot";
        return;
    }
    if (actor.airborneFor === "block" && actor.z > 0.01) {
        actor.pose = "reach";
        return;
    }
    if (state.t < actor.poseUntil)
        return;
    actor.pose = "run";
}
function scoreBasket(state) {
    const ball = state.ball;
    const team = ball.shooter ?? state.possession;
    const value = ball.value;
    if (team === "user")
        state.scoreUser += value;
    else
        state.scoreBot += value;
    ball.mode = "loose";
    ball.x = constants_1.HOOP_X;
    ball.y = constants_1.HOOP_Y;
    ball.z = constants_1.RIM_HEIGHT - 1.2;
    ball.vx = 0;
    ball.vy = 1.4;
    ball.vz = -7;
    ball.grabReadyAt = Number.POSITIVE_INFINITY;
    ball.looseSince = state.t;
    const total = team === "user" ? state.scoreUser : state.scoreBot;
    setToast(state, `+${value}`, "score");
    if (total >= constants_1.TARGET_SCORE) {
        state.phase = "over";
        state.winner = team;
        return;
    }
    // Make it, take it.
    state.possession = team;
    state.phase = "made";
    state.phaseUntil = state.t + constants_1.MADE_PAUSE;
}
function reboundOffRim(state) {
    const ball = state.ball;
    const awayX = ball.x - constants_1.HOOP_X;
    const awayY = ball.y - constants_1.HOOP_Y;
    const away = Math.max(0.6, Math.hypot(awayX, awayY));
    const kick = 4 + (0, rng_1.random)(state) * 5;
    // Caroms are mostly random so the shooter has no claim on their own miss.
    const spin = (0, rng_1.random)(state) * Math.PI * 2;
    ball.mode = "loose";
    ball.outcome = null;
    ball.vx = Math.cos(spin) * kick + (awayX / away) * 2.4;
    ball.vy = Math.sin(spin) * kick + (awayY / away) * 2.4 + 1.2;
    ball.vz = 6.5 + (0, rng_1.random)(state) * 3;
    ball.grabReadyAt = state.t + 0.16;
    ball.looseSince = state.t;
    state.phase = "live";
}
function tryGrab(state) {
    const ball = state.ball;
    if (state.t < ball.grabReadyAt || ball.z > constants_1.GRAB_HEIGHT)
        return;
    const patience = Math.max(0, state.t - ball.looseSince - 3);
    const range = constants_1.GRAB_RANGE + patience * 1.6;
    const candidates = [state.user, state.bot].sort((a, b) => Math.hypot(a.x - ball.x, a.y - ball.y) - Math.hypot(b.x - ball.x, b.y - ball.y));
    const winner = candidates[0];
    if (Math.hypot(winner.x - ball.x, winner.y - ball.y) > range)
        return;
    const changed = state.possession !== winner.id;
    state.possession = winner.id;
    state.shotClock = constants_1.SHOT_CLOCK;
    ball.holder = winner.id;
    ball.mode = "held";
    ball.shooter = null;
    ball.outcome = null;
    if (changed)
        setToast(state, winner.id === "user" ? "Your ball" : "CPU ball", "info");
}
function updateBall(state, dt) {
    const ball = state.ball;
    if (ball.mode === "held") {
        attachBall(state);
        return;
    }
    ball.vz -= constants_1.GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.z += ball.vz * dt;
    if (ball.mode === "flight") {
        if (state.t >= ball.landsAt) {
            if (ball.outcome === "make")
                scoreBasket(state);
            else
                reboundOffRim(state);
        }
        return;
    }
    if (ball.z <= constants_1.BALL_RADIUS) {
        ball.z = constants_1.BALL_RADIUS;
        if (ball.vz < 0)
            ball.vz = -ball.vz * constants_1.BALL_RESTITUTION;
        if (Math.abs(ball.vz) < 1.4)
            ball.vz = 0;
        ball.vx *= constants_1.BALL_FRICTION;
        ball.vy *= constants_1.BALL_FRICTION;
    }
    const limitX = constants_1.COURT_HALF_WIDTH - 1;
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
    if (ball.y > constants_1.COURT_DEPTH - 1) {
        ball.y = constants_1.COURT_DEPTH - 1;
        ball.vy = -Math.abs(ball.vy) * 0.6;
    }
    if (state.phase === "made" || state.phase === "over")
        return;
    tryGrab(state);
}
function updateShotClock(state, dt) {
    if (state.phase !== "live" || state.ball.mode !== "held")
        return;
    state.shotClock = Math.max(0, state.shotClock - dt);
    if (state.shotClock > 0)
        return;
    const losing = state.possession;
    resetMeter(actorOf(state, losing).meter);
    state.possession = other(losing);
    state.phase = "turnover";
    state.phaseUntil = state.t + constants_1.TURNOVER_PAUSE;
    setToast(state, "Shot clock", "info");
}
function step(state, user, bot, dt) {
    state.t += dt;
    if (state.toast && state.t > state.toast.until)
        state.toast = null;
    if (state.phase === "check") {
        const wants = user.startPressed ||
            user.shootPressed ||
            bot.startPressed ||
            Math.abs(user.moveX) + Math.abs(user.moveY) > 0 ||
            Math.abs(bot.moveX) + Math.abs(bot.moveY) > 0;
        if (state.t >= state.phaseUntil && wants)
            state.phase = "live";
        attachBall(state);
        return;
    }
    if (state.phase === "made" || state.phase === "turnover") {
        updateBall(state, dt);
        if (state.t >= state.phaseUntil)
            setCheck(state, state.possession);
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
