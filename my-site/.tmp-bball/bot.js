"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIFFICULTY_LABEL = exports.PROFILES = void 0;
exports.decideBot = decideBot;
const constants_1 = require("./constants");
const court_1 = require("./court");
const rng_1 = require("./rng");
const types_1 = require("./types");
exports.PROFILES = {
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
exports.DIFFICULTY_LABEL = {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
};
const botInput = (0, types_1.emptyInput)();
function steer(input, fromX, fromY, toX, toY) {
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
function decideBot(state, dt) {
    const input = botInput;
    input.moveX = 0;
    input.moveY = 0;
    input.sprint = false;
    input.shootHeld = false;
    input.shootPressed = false;
    input.shootReleased = false;
    input.actionPressed = false;
    input.startPressed = false;
    const profile = exports.PROFILES[state.difficulty];
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
function clampX(x) {
    const limit = constants_1.COURT_HALF_WIDTH - 1.5;
    return Math.min(limit, Math.max(-limit, x));
}
function clampY(y) {
    return Math.min(constants_1.COURT_DEPTH - 1.5, Math.max(1.5, y));
}
function driveOrShoot(state, input, profile, dt) {
    const me = state.bot;
    const foe = state.user;
    const distance = (0, court_1.distanceToHoop)(me.x, me.y);
    const guarded = Math.hypot(me.x - foe.x, me.y - foe.y);
    if (me.meter.active) {
        input.shootHeld = true;
        return;
    }
    const forced = state.shotClock <= profile.urgency;
    const open = guarded > profile.openness;
    const inRange = distance < constants_1.ARC_RADIUS + 3;
    const atRim = distance < 6.5;
    // Having got a step on the defender is reason enough to go up with it.
    const beaten = (0, court_1.distanceToHoop)(foe.x, foe.y) > distance + 1.4;
    if (inRange &&
        (forced ||
            ((atRim || beaten || open) && (0, rng_1.random)(state) < 0.02 + profile.drive * 0.05))) {
        input.shootPressed = true;
        input.shootHeld = true;
        return;
    }
    if (state.t >= me.decideAt) {
        // Pick a fresh attacking angle every so often.
        me.decideAt = state.t + 0.6 + (0, rng_1.random)(state) * 0.9;
        me.jinx = ((0, rng_1.random)(state) - 0.5) * 2;
    }
    const wantsRim = (0, rng_1.random)(state) < profile.drive * dt * 4 || distance > constants_1.ARC_RADIUS + 1;
    const targetY = wantsRim ? constants_1.HOOP_Y + 3.2 : Math.min(constants_1.CHECK_Y, constants_1.HOOP_Y + constants_1.ARC_RADIUS - 1.5);
    const targetX = clampX(constants_1.HOOP_X + me.jinx * (wantsRim ? 5 : 12));
    steer(input, me.x, me.y, targetX, clampY(targetY));
    input.sprint = guarded < 4.5 || distance > 18;
    const crossoverWindow = guarded < 5 && state.t >= me.crossoverReadyAt && (0, rng_1.random)(state) < profile.drive * dt * 3;
    if (crossoverWindow)
        input.actionPressed = true;
}
function defend(state, input, profile, dt) {
    const me = state.bot;
    const foe = state.user;
    // Sit on the line between the ball and the rim.
    const toRimX = constants_1.HOOP_X - me.perceivedX;
    const toRimY = constants_1.HOOP_Y - me.perceivedY;
    const toRim = Math.max(0.001, Math.hypot(toRimX, toRimY));
    const gap = Math.min(profile.space, toRim * 0.55);
    const targetX = me.perceivedX + (toRimX / toRim) * gap;
    const targetY = me.perceivedY + (toRimY / toRim) * gap;
    const distance = steer(input, me.x, me.y, clampX(targetX), clampY(targetY));
    input.sprint = distance > 2.4;
    const reach = Math.hypot(me.x - foe.x, me.y - foe.y);
    if (foe.meter.active && reach < constants_1.BLOCK_RANGE && me.z <= 0.01) {
        const ready = foe.meter.value > 0.45;
        if (ready && (0, rng_1.random)(state) < profile.blockRate * dt) {
            input.shootPressed = true;
            return;
        }
    }
    if (reach < constants_1.STEAL_RANGE * 0.85 &&
        state.t >= me.stealReadyAt &&
        (0, rng_1.random)(state) < profile.stealRate * dt) {
        input.actionPressed = true;
    }
}
