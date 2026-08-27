export type Team = "user" | "bot";

export type Difficulty = "easy" | "normal" | "hard";

export type Phase = "check" | "live" | "shot" | "made" | "turnover" | "over";

export type Pose = "run" | "shoot" | "reach";

export type Meter = {
  active: boolean;
  value: number;
  center: number;
  half: number;
  releaseTarget: number | null;
  lastError: number;
  greened: boolean;
  flashUntil: number;
};

export type Actor = {
  id: Team;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  vz: number;
  facing: 1 | -1;
  /** Difficulty scaling on top speed. */
  speedScale: number;
  stamina: number;
  pose: Pose;
  poseUntil: number;
  airborneFor: "none" | "block" | "shot";
  crossoverUntil: number;
  crossoverReadyAt: number;
  stumbleUntil: number;
  stealReadyAt: number;
  meter: Meter;
  perceivedX: number;
  perceivedY: number;
  decideAt: number;
  jinx: number;
};

export type ShotOutcome = "make" | "miss" | "blocked";

export type Ball = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  holder: Team | null;
  mode: "held" | "flight" | "loose";
  shooter: Team | null;
  value: 1 | 2;
  outcome: ShotOutcome | null;
  landsAt: number;
  grabReadyAt: number;
  looseSince: number;
};

export type ToastKind = "green" | "score" | "steal" | "block" | "info";

export type Toast = {
  text: string;
  kind: ToastKind;
  until: number;
};

export type GameState = {
  t: number;
  phase: Phase;
  phaseUntil: number;
  possession: Team;
  scoreUser: number;
  scoreBot: number;
  shotClock: number;
  difficulty: Difficulty;
  user: Actor;
  bot: Actor;
  ball: Ball;
  toast: Toast | null;
  winner: Team | null;
  seed: number;
};

export type Input = {
  moveX: number;
  moveY: number;
  sprint: boolean;
  shootHeld: boolean;
  shootPressed: boolean;
  shootReleased: boolean;
  actionPressed: boolean;
  startPressed: boolean;
};

export function emptyInput(): Input {
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
