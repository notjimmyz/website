import { VERTICAL } from "@/lib/basketball/camera";
import { BALL_RADIUS } from "@/lib/basketball/constants";
import { BALL, KIT, METER, SHADOW } from "@/lib/basketball/palette";

type Kit = typeof KIT.user;

// Sprite art is drawn in feet, with vertical measurements foreshortened so a
// single uniform scale by the projected `k` is correct. The game loop finds
// these nodes by their `data-node` name and writes transforms straight to them.
const up = (feet: number) => -(feet * VERTICAL);

export const METER_W = 14;
export const METER_H = 96;
export const METER_RANGE = 1.15;

export function ActorSprite({ name, kit }: { name: string; kit: Kit }) {
  return (
    <g data-node={`${name}-root`}>
      <ellipse
        data-node={`${name}-shadow`}
        cx="0"
        cy="0"
        rx="0"
        ry="0"
        fill={SHADOW}
        opacity="0.2"
      />
      <g data-node={`${name}-body`}>
        <g data-node={`${name}-pose-run`}>
          <RunPose kit={kit} />
        </g>
        <g data-node={`${name}-pose-shoot`} display="none">
          <ShootPose kit={kit} />
        </g>
        <g data-node={`${name}-pose-reach`} display="none">
          <ReachPose kit={kit} />
        </g>
      </g>
    </g>
  );
}

function Head({ kit }: { kit: Kit }) {
  return (
    <g>
      <rect x="-0.16" y={up(5.62)} width="0.32" height={0.28 * VERTICAL} fill={kit.skinShade} />
      <circle cx="0" cy={up(5.98)} r="0.44" fill={kit.skin} />
      <path
        d={`M -0.44 ${up(6.04)} A 0.44 ${0.44 * VERTICAL} 0 0 1 0.44 ${up(6.04)} Z`}
        fill={kit.hair}
      />
    </g>
  );
}

function RunPose({ kit }: { kit: Kit }) {
  return (
    <g>
      <rect
        x="-0.72"
        y={up(2.95)}
        width="0.5"
        height={2.95 * VERTICAL}
        rx="0.2"
        fill={kit.skinShade}
      />
      <rect x="0.2" y={up(2.7)} width="0.5" height={2.7 * VERTICAL} rx="0.2" fill={kit.skin} />
      <rect
        x="-0.86"
        y={up(4.15)}
        width="1.72"
        height={1.3 * VERTICAL}
        rx="0.26"
        fill={kit.shorts}
      />
      <rect
        x="-0.86"
        y={up(4.15)}
        width="1.72"
        height={0.34 * VERTICAL}
        fill={kit.shortsShade}
      />
      <polygon
        points={`-0.78,${up(5.3)} -1.16,${up(4.7)} -0.94,${up(3.5)} -0.62,${up(3.8)}`}
        fill={kit.skin}
      />
      <polygon
        points={`0.78,${up(5.3)} 1.16,${up(4.76)} 0.98,${up(3.66)} 0.64,${up(3.9)}`}
        fill={kit.skinShade}
      />
      <rect
        x="-0.76"
        y={up(5.5)}
        width="1.52"
        height={1.42 * VERTICAL}
        rx="0.34"
        fill={kit.jersey}
      />
      <rect
        x="-0.76"
        y={up(4.4)}
        width="1.52"
        height={0.32 * VERTICAL}
        fill={kit.jerseyShade}
      />
      <Head kit={kit} />
    </g>
  );
}

function ShootPose({ kit }: { kit: Kit }) {
  return (
    <g>
      <rect
        x="-0.56"
        y={up(2.85)}
        width="0.48"
        height={2.85 * VERTICAL}
        rx="0.2"
        fill={kit.skinShade}
      />
      <rect x="0.08" y={up(2.85)} width="0.48" height={2.85 * VERTICAL} rx="0.2" fill={kit.skin} />
      <rect
        x="-0.8"
        y={up(4.2)}
        width="1.6"
        height={1.35 * VERTICAL}
        rx="0.26"
        fill={kit.shorts}
      />
      <rect
        x="-0.74"
        y={up(5.55)}
        width="1.48"
        height={1.4 * VERTICAL}
        rx="0.34"
        fill={kit.jersey}
      />
      <polygon
        points={`-0.7,${up(5.5)} -0.42,${up(6.9)} -0.02,${up(6.9)} -0.16,${up(5.4)}`}
        fill={kit.skin}
      />
      <polygon
        points={`0.72,${up(5.4)} 0.5,${up(6.6)} 0.16,${up(6.6)} 0.2,${up(5.3)}`}
        fill={kit.skinShade}
      />
      <Head kit={kit} />
    </g>
  );
}

function ReachPose({ kit }: { kit: Kit }) {
  return (
    <g>
      <rect
        x="-0.92"
        y={up(2.8)}
        width="0.48"
        height={2.8 * VERTICAL}
        rx="0.2"
        fill={kit.skinShade}
      />
      <rect x="0.44" y={up(2.8)} width="0.48" height={2.8 * VERTICAL} rx="0.2" fill={kit.skin} />
      <rect
        x="-0.86"
        y={up(4.1)}
        width="1.72"
        height={1.3 * VERTICAL}
        rx="0.26"
        fill={kit.shorts}
      />
      <rect
        x="-0.74"
        y={up(5.45)}
        width="1.48"
        height={1.38 * VERTICAL}
        rx="0.34"
        fill={kit.jersey}
      />
      <polygon
        points={`0.6,${up(5.5)} 0.98,${up(7.3)} 0.6,${up(7.34)} 0.24,${up(5.4)}`}
        fill={kit.skin}
      />
      <polygon
        points={`-0.72,${up(5.35)} -1.34,${up(5.05)} -1.38,${up(4.7)} -0.68,${up(4.6)}`}
        fill={kit.skinShade}
      />
      <Head kit={kit} />
    </g>
  );
}

export function BallSprite() {
  return (
    <g data-node="ball-root">
      <ellipse
        data-node="ball-shadow"
        cx="0"
        cy="0"
        rx="0"
        ry="0"
        fill={SHADOW}
        opacity="0.18"
      />
      <g data-node="ball-body">
        <circle cx="0" cy="0" r={BALL_RADIUS} fill={BALL.fill} />
        <path
          d={`M ${-BALL_RADIUS * 0.72} ${BALL_RADIUS * 0.66}
              A ${BALL_RADIUS} ${BALL_RADIUS} 0 0 0 ${BALL_RADIUS * 0.72} ${BALL_RADIUS * 0.66} Z`}
          fill={BALL.shade}
        />
        <path
          d={`M 0 ${-BALL_RADIUS} L 0 ${BALL_RADIUS}`}
          stroke={BALL.seam}
          strokeWidth="0.055"
          opacity="0.75"
        />
        <path
          d={`M ${-BALL_RADIUS} 0 Q 0 ${-BALL_RADIUS * 0.42} ${BALL_RADIUS} 0`}
          stroke={BALL.seam}
          strokeWidth="0.055"
          fill="none"
          opacity="0.75"
        />
      </g>
    </g>
  );
}

/** 2K-style release meter: hold to fill, let go inside the green band. */
export function ShotMeter() {
  return (
    <g data-node="meter-root" display="none">
      <rect
        x="0"
        y="0"
        width={METER_W}
        height={METER_H}
        rx={METER_W / 2}
        fill={METER.track}
        stroke={METER.trackEdge}
        strokeWidth="1.2"
        opacity="0.95"
      />
      <rect
        data-node="meter-window"
        x="0.6"
        y="0"
        width={METER_W - 1.2}
        height="0"
        fill={METER.greenSoft}
        opacity="0.85"
      />
      <rect
        data-node="meter-fill"
        x="2.4"
        y={METER_H}
        width={METER_W - 4.8}
        height="0"
        rx={(METER_W - 4.8) / 2}
        fill={METER.fill}
      />
      <line
        data-node="meter-tick"
        x1="0"
        y1="0"
        x2={METER_W}
        y2="0"
        stroke={METER.green}
        strokeWidth="1.6"
        opacity="0.9"
      />
    </g>
  );
}
