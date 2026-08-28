// All world units are feet. x runs across the court, y runs from the baseline
// toward half court, z is up.

export const COURT_HALF_WIDTH = 25;
export const COURT_DEPTH = 34;
export const FLOOR_BACK = -6;
export const FLOOR_FRONT = 40;

export const HOOP_X = 0;
export const HOOP_Y = 5.25;
export const RIM_HEIGHT = 10;
export const RIM_RADIUS = 0.78;

export const BACKBOARD_Y = 4;
export const BACKBOARD_HALF_WIDTH = 3;
export const BACKBOARD_BOTTOM = 9;
export const BACKBOARD_TOP = 12.5;

export const KEY_HALF_WIDTH = 8;
export const FT_LINE_Y = 19;
export const FT_CIRCLE_R = 6;
export const ARC_RADIUS = 23.75;
export const CORNER_X = 22;
export const CORNER_Y = HOOP_Y + Math.sqrt(ARC_RADIUS ** 2 - CORNER_X ** 2);
export const RESTRICTED_R = 4;

export const PLAYER_HEIGHT = 5.5;
export const PLAYER_RADIUS = 1.02;
export const BODY_SEPARATION = 1.85;

export const WALK_SPEED = 14.5;
export const SPRINT_SPEED = 21.5;
export const ACCEL = 78;
export const FRICTION = 62;
export const AIR_CONTROL = 0.45;

export const GRAVITY = 32.2;
export const JUMP_VZ = 13.4;
export const SHOT_JUMP_VZ = 9.2;

export const STAMINA_MAX = 100;
export const STAMINA_DRAIN = 26;
export const STAMINA_REGEN = 17;
export const STAMINA_SPRINT_MIN = 7;

export const CROSSOVER_DURATION = 0.3;
export const CROSSOVER_BOOST = 1.42;
export const CROSSOVER_COOLDOWN = 0.95;
export const CROSSOVER_REACH = 6;
export const STUMBLE_DURATION = 0.5;
export const STUMBLE_FACTOR = 0.44;

export const STEAL_RANGE = 4.6;
export const STEAL_COOLDOWN = 0.5;
export const STEAL_BASE = 0.48;
export const STEAL_SELF_STUMBLE = 0.12;

export const BLOCK_RANGE = 5.2;
export const BLOCK_BASE = 0.78;
export const BLOCK_STUN = 1.05;
/** Seconds after release where a late jump can still swat the ball. */
export const BLOCK_CHASE = 0.34;

export const SHOT_WINDUP = 0.62;
export const METER_CENTER = 0.84;
export const METER_HALF_BASE = 0.09;
export const METER_OVERFILL = 1.12;
export const RELEASE_HEIGHT = 5.7;

export const BALL_RADIUS = 0.4;
export const BALL_RESTITUTION = 0.54;
export const BALL_FRICTION = 0.72;
export const GRAB_RANGE = 3.4;

export const SHOT_CLOCK = 12;
export const TARGET_SCORE = 7;
export const CHECK_Y = 26;
export const CHECK_DEFENDER_GAP = 4.2;

export const MADE_PAUSE = 1.15;
export const TURNOVER_PAUSE = 0.9;
export const TOAST_DURATION = 1.5;
