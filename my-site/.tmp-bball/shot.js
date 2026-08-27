"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contestOn = contestOn;
exports.greenWindow = greenWindow;
exports.resolveShot = resolveShot;
exports.missTarget = missTarget;
const constants_1 = require("./constants");
/**
 * 0 when the defender is nowhere near, 1 when they are draped over the
 * shooter and up in the air.
 */
function contestOn(shooter, defender) {
    const distance = Math.hypot(shooter.x - defender.x, shooter.y - defender.y);
    const proximity = Math.max(0, 1 - distance / (constants_1.BLOCK_RANGE + 2.6));
    const hand = defender.z > 0.5 ? 1.35 : defender.airborneFor === "block" ? 1.15 : 1;
    return Math.min(1, proximity * hand);
}
const WINDOW_BY_DIFFICULTY = {
    easy: 1.35,
    normal: 1,
    hard: 0.85,
};
/** Half-width of the green window: tight shots and heavy contest shrink it. */
function greenWindow(difficulty, contest, distance) {
    const range = Math.max(0.6, 1 - Math.max(0, distance - 14) * 0.014);
    const pressure = 1 - contest * 0.55;
    return Math.max(0.022, constants_1.METER_HALF_BASE * WINDOW_BY_DIFFICULTY[difficulty] * range * pressure);
}
function resolveShot({ error, half, distance, contest, random, }) {
    const greened = Math.abs(error) <= half;
    const base = Math.max(0.3, Math.min(0.82, 0.82 - distance * 0.013));
    const slip = Math.max(0, Math.abs(error) - half);
    const timing = greened ? 1 : Math.max(0, 1 - slip / 0.2);
    const pressure = 1 - contest * 0.45;
    const probability = Math.max(0, Math.min(0.97, (greened ? 0.96 : base) * timing * pressure));
    return { made: random < probability, probability, error, greened };
}
/** Where a miss ends up: early releases fall short, late ones run long. */
function missTarget(error, half, spread) {
    const direction = error > 0 ? 1 : -1;
    const slip = Math.max(0, Math.abs(error) - half);
    const magnitude = 0.75 + Math.min(1.7, slip * 7);
    return {
        lateral: (spread - 0.5) * 1.5,
        depth: direction * magnitude,
    };
}
