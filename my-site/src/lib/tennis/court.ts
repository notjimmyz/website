import {
  BALL_RADIUS,
  BASELINE_Y,
  COURT_HALF_WIDTH,
  NET_HEIGHT_CENTRE,
  NET_HEIGHT_POST,
  NET_POST_X,
  SERVE_STANCE_X,
  SERVICE_LINE_Y,
} from "./constants";
import type { Side } from "./types";

/** The tape sags toward the middle, which is what makes cross-court cheaper. */
export function netHeightAt(x: number) {
  const f = Math.min(1, Math.abs(x) / NET_POST_X);
  return NET_HEIGHT_CENTRE + (NET_HEIGHT_POST - NET_HEIGHT_CENTRE) * f * f;
}

export function inSingles(x: number, y: number) {
  return (
    Math.abs(x) <= COURT_HALF_WIDTH + BALL_RADIUS &&
    Math.abs(y) <= BASELINE_Y + BALL_RADIUS
  );
}

/**
 * `receiver` is the side of the court the ball must land on, `boxSign` the x
 * half of that side.
 */
export function inServiceBox(x: number, y: number, receiver: Side, boxSign: Side) {
  const depth =
    receiver > 0
      ? y > 0 && y <= SERVICE_LINE_Y + BALL_RADIUS
      : y < 0 && y >= -SERVICE_LINE_Y - BALL_RADIUS;
  const width =
    boxSign > 0
      ? x >= -BALL_RADIUS && x <= COURT_HALF_WIDTH + BALL_RADIUS
      : x <= BALL_RADIUS && x >= -COURT_HALF_WIDTH - BALL_RADIUS;
  return depth && width;
}

/** Deuce court on even points, ad court on odd ones. */
export function isDeuceCourt(played: number) {
  return played % 2 === 0;
}

/** Server stands right of the centre mark in the deuce court. */
export function serveStanceX(own: Side, deuce: boolean): number {
  return own * SERVE_STANCE_X * (deuce ? 1 : -1);
}

/** The target box always sits diagonally opposite the server's stance. */
export function serveBoxSign(own: Side, deuce: boolean): Side {
  return (-own * (deuce ? 1 : -1)) as Side;
}
