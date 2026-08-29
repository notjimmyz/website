import type { GameState } from "./types";

/** mulberry32, seeded off the game state so a match is reproducible. */
export function random(state: GameState) {
  state.seed = (state.seed + 0x6d2b79f5) | 0;
  let t = state.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Roughly normal, centred on zero, in the range +/- 1. */
export function jitter(state: GameState) {
  return (random(state) + random(state) + random(state) - 1.5) / 1.5;
}
