import type { ShotType } from "./constants";

export type Team = "user" | "bot";

export type Difficulty = "easy" | "normal" | "hard";

/** Which end a player owns: +1 is the near baseline, -1 the far one. */
export type Side = 1 | -1;

export type TimingGrade = "very-early" | "early" | "on-time" | "late" | "very-late";

export type Stroke = "idle" | "aiming" | "recover";

export type Pose = "ready" | "swing" | "serve" | "reach";

export type Phase = "serve" | "rally" | "between" | "over";

export type ServeStage = "ready" | "toss";

export type PointReason = "out" | "net" | "rally" | "ace" | "double-fault";

export type ToastKind = "info" | "fault" | "point" | "good";

export type Input = {
  /** Left/right in the player's own frame. */
  moveX: number;
  /** Toward the net is -1, away is +1, in the player's own frame. */
  moveY: number;
  topspin: boolean;
  drop: boolean;
  lob: boolean;
};

export function emptyInput(): Input {
  return { moveX: 0, moveY: 0, topspin: false, drop: false, lob: false };
}

export type Actor = {
  id: Team;
  own: Side;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  stroke: Stroke;
  shot: ShotType | null;
  /** Absolute time the racket meets the ball. */
  contactAt: number;
  strokeUntil: number;
  /** Aim sampled from WASD while the swing is in the air. */
  aimX: number;
  aimY: number;
  pose: Pose;
  /** Bot planning, unused by the player. */
  planAimX: number;
  planAimY: number;
  planShot: ShotType;
  nextActionAt: number;
  serveSwingAt: number;
  committed: boolean;
};

export type Ball = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mode: "idle" | "toss" | "flight";
  hitter: Team | null;
  /** True from the serve strike until the receiver touches it. */
  serve: boolean;
  bounces: number;
  /** Where the last strike was aimed to land, used by the bot to read the ball. */
  landingX: number;
  landingY: number;
  spin: number;
};

export type MatchScore = {
  games: Record<Team, number>;
  points: Record<Team, number>;
  tiebreak: boolean;
  server: Team;
  /** Points completed in the current game, drives the deuce/ad court. */
  played: number;
};

export type Toast = {
  text: string;
  kind: ToastKind;
  until: number;
};

export type Flash = {
  grade: TimingGrade;
  until: number;
};

export type GameState = {
  t: number;
  seed: number;
  difficulty: Difficulty;
  phase: Phase;
  /** Serve gate during "serve", pause end during "between". */
  phaseUntil: number;
  serveStage: ServeStage;
  tossAt: number;
  faults: number;
  user: Actor;
  bot: Actor;
  ball: Ball;
  score: MatchScore;
  winner: Team | null;
  toast: Toast | null;
  flash: Flash | null;
};

export function other(team: Team): Team {
  return team === "user" ? "bot" : "user";
}

export function actorOf(state: GameState, team: Team): Actor {
  return team === "user" ? state.user : state.bot;
}
