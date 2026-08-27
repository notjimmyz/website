"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
/** mulberry32, seeded off the game state so a match is reproducible. */
function random(state) {
    state.seed = (state.seed + 0x6d2b79f5) | 0;
    let t = state.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
