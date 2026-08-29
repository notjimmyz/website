// All world units are feet. x runs across the court, y runs baseline to
// baseline with the player's end at +y and the opponent at -y, z is up. The net
// sits on y = 0, so "own side" is just the sign of y.

export const COURT_HALF_WIDTH = 13.5;
export const DOUBLES_HALF_WIDTH = 18;
export const BASELINE_Y = 39;
export const SERVICE_LINE_Y = 21;
export const CENTRE_MARK = 0.5;

export const APRON_SIDE = 27;
export const APRON_BACK = 52;

export const NET_HEIGHT_CENTRE = 3;
export const NET_HEIGHT_POST = 3.5;
export const NET_POST_X = 16.5;

export const LINE_WIDTH = 0.24;

// Movement -------------------------------------------------------------------

export const PLAYER_HEIGHT = 5.8;
export const MOVE_SPEED = 29;
export const MOVE_ACCEL = 165;
export const MOVE_FRICTION = 140;
/** Velocity decay per second while a swing is winding up, so shots plant. */
export const PLANT_DAMP = 5.4;
export const RECOVER_SPEED_SCALE = 0.72;

/** How far a player may stray past their own lines. */
export const ROAM_BACK = 7;
export const ROAM_SIDE = 9;
/** Closest a player may stand to the net. */
export const NET_STANDOFF = 3.2;

export const SERVE_STANCE_X = 4.5;
export const SERVE_STANCE_BACK = 1.4;
export const RETURN_STANCE_X = 7.5;
export const RETURN_STANCE_BACK = 3;
export const READY_BACK = 2.5;

// Ball -----------------------------------------------------------------------

export const GRAVITY = 32.2;
export const BALL_RADIUS = 0.17;
export const BOUNCE_RESTITUTION = 0.58;
export const BOUNCE_FRICTION = 0.76;
export const ROLL_DAMP = 2.2;
/** Below this rebound speed the ball settles instead of counting a bounce. */
export const BOUNCE_FLOOR = 1.5;

// Contact --------------------------------------------------------------------

/** The strike plane sits this far net-side of the player. */
export const CONTACT_AHEAD = 1.1;
export const REACH_LATERAL = 6.2;
/** Hard cap so a wildly late swing cannot connect from across the court. */
export const REACH_DEPTH = 15;
export const REACH_HEIGHT = 8.6;
export const CONTACT_FLOOR = 0.9;
export const COMFORT_LOW = 1.6;
export const COMFORT_HIGH = 4.6;

/** Signed seconds between the swing and the ideal strike. */
export const TIMING_ON = 0.045;
export const TIMING_NEAR = 0.11;
export const TIMING_FAR = 0.22;

// Serve ----------------------------------------------------------------------

export const TOSS_START_Z = 4.2;
export const TOSS_VZ = 19;
export const SERVE_STRIKE_Z = 8.2;
export const SERVE_CONTACT_LOW = 3.4;
export const SERVE_AIM_CENTRE = 6.8;

// Match ----------------------------------------------------------------------

export const GAMES_TO_WIN = 4;
export const TIEBREAK_TARGET = 7;

export const SERVE_DELAY = 0.55;
export const FAULT_PAUSE = 1.1;
export const BETWEEN_PAUSE = 1.7;
export const FLASH_DURATION = 0.8;
export const TOAST_DURATION = 1.5;

// Shots ----------------------------------------------------------------------

export type ShotType = "topspin" | "drop" | "lob" | "serve";

/** Nothing may leave the racket faster than this, whatever the geometry asks. */
export const MIN_FLIGHT = 0.5;

export type ShotProfile = {
  /** Seconds between pressing the key and the racket meeting the ball. */
  windup: number;
  /** Seconds of reduced control after the swing. */
  recover: number;
  /** Intended landing depth measured from the net, before aim. */
  depthCentre: number;
  depthSpread: number;
  widthSpread: number;
  /** Feet of air over the tape on a botched strike and on a pure one. */
  clearPoor: number;
  clearBest: number;
  /** Random slop added to the clearance, scaled by how bad the strike was. */
  clearScatter: number;
  /** Radius of the landing scatter on a pure strike and on a botched one. */
  errorBest: number;
  errorPoor: number;
  minFlight: number;
  maxFlight: number;
  /** Baseline difficulty of the stroke itself. */
  consistency: number;
};

export const SHOTS: Record<ShotType, ShotProfile> = {
  topspin: {
    windup: 0.24,
    recover: 0.2,
    depthCentre: 26,
    depthSpread: 9,
    widthSpread: 11.5,
    clearPoor: 5.4,
    clearBest: 1.7,
    clearScatter: 2.6,
    errorBest: 1.2,
    errorPoor: 9,
    minFlight: 0.55,
    maxFlight: 2.4,
    consistency: 1,
  },
  drop: {
    windup: 0.28,
    recover: 0.22,
    depthCentre: 7.5,
    depthSpread: 3.5,
    widthSpread: 9,
    clearPoor: 2.9,
    clearBest: 1.2,
    clearScatter: 2,
    errorBest: 1.5,
    errorPoor: 9.5,
    minFlight: 0.5,
    maxFlight: 2.3,
    consistency: 0.8,
  },
  lob: {
    windup: 0.3,
    recover: 0.26,
    depthCentre: 32,
    depthSpread: 4.5,
    widthSpread: 8,
    clearPoor: 6,
    clearBest: 10,
    clearScatter: 3.4,
    errorBest: 2.2,
    errorPoor: 11,
    minFlight: 1.1,
    maxFlight: 3,
    consistency: 0.88,
  },
  serve: {
    windup: 0.2,
    recover: 0.34,
    depthCentre: 11,
    depthSpread: 6.5,
    widthSpread: 5.6,
    clearPoor: 3.6,
    clearBest: 1.1,
    clearScatter: 2.4,
    errorBest: 1.1,
    errorPoor: 7,
    minFlight: 0.5,
    maxFlight: 1.5,
    consistency: 0.95,
  },
};
