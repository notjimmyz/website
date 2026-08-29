import { VERTICAL } from "@/lib/tennis/camera";
import { BALL, RACKET, SHADOW } from "@/lib/tennis/palette";
import type { Pose } from "@/lib/tennis/types";

/** Art is drawn in feet with heights pre-squashed, so one uniform scale works. */
const up = (feet: number) => -(feet * VERTICAL);

type Point = [number, number];
type Limb = [Point, Point, Point];

type Frame = {
  legs: [Limb, Limb];
  shorts: Point[];
  torso: Point[];
  head: Point;
  arms: [Limb, Limb];
  racket: { hand: Point; tip: Point };
};

const FRAMES: Record<Pose, Frame> = {
  ready: {
    legs: [
      [
        [-0.3, 2.9],
        [-0.6, 1.5],
        [-0.72, 0.06],
      ],
      [
        [0.3, 2.9],
        [0.62, 1.5],
        [0.76, 0.06],
      ],
    ],
    shorts: [
      [-0.62, 2.4],
      [0.62, 2.4],
      [0.54, 3.3],
      [-0.54, 3.3],
    ],
    torso: [
      [-0.5, 3.15],
      [0.5, 3.15],
      [0.58, 4.7],
      [-0.58, 4.7],
    ],
    head: [0, 5.25],
    arms: [
      [
        [-0.55, 4.55],
        [-1.05, 3.95],
        [-1.35, 3.4],
      ],
      [
        [0.55, 4.55],
        [1.15, 4],
        [1.7, 3.5],
      ],
    ],
    racket: { hand: [1.7, 3.5], tip: [3, 4.2] },
  },
  swing: {
    legs: [
      [
        [-0.32, 2.85],
        [-0.95, 1.6],
        [-1.35, 0.06],
      ],
      [
        [0.32, 2.85],
        [0.85, 1.5],
        [1.15, 0.06],
      ],
    ],
    shorts: [
      [-0.66, 2.35],
      [0.62, 2.35],
      [0.54, 3.25],
      [-0.58, 3.25],
    ],
    torso: [
      [-0.55, 3.1],
      [0.5, 3.1],
      [0.62, 4.7],
      [-0.5, 4.7],
    ],
    head: [0.15, 5.25],
    arms: [
      [
        [-0.55, 4.55],
        [-1.2, 4.3],
        [-1.55, 3.8],
      ],
      [
        [0.6, 4.6],
        [1.5, 4.35],
        [2.4, 3.95],
      ],
    ],
    racket: { hand: [2.4, 3.95], tip: [3.7, 4.9] },
  },
  serve: {
    legs: [
      [
        [-0.3, 2.9],
        [-0.55, 1.5],
        [-0.7, 0.06],
      ],
      [
        [0.3, 2.9],
        [0.6, 1.55],
        [0.8, 0.06],
      ],
    ],
    shorts: [
      [-0.6, 2.45],
      [0.6, 2.45],
      [0.52, 3.35],
      [-0.52, 3.35],
    ],
    torso: [
      [-0.5, 3.2],
      [0.5, 3.2],
      [0.55, 4.8],
      [-0.55, 4.8],
    ],
    head: [0, 5.3],
    arms: [
      [
        [-0.55, 4.65],
        [-0.95, 5.6],
        [-1.15, 6.5],
      ],
      [
        [0.55, 4.65],
        [0.85, 5.7],
        [0.95, 6.7],
      ],
    ],
    racket: { hand: [0.95, 6.7], tip: [1.35, 8.3] },
  },
  reach: {
    legs: [
      [
        [-0.35, 2.6],
        [-1.4, 1.5],
        [-2.1, 0.06],
      ],
      [
        [0.35, 2.6],
        [1.3, 1.2],
        [2, 0.06],
      ],
    ],
    shorts: [
      [-0.66, 2.1],
      [0.62, 2.1],
      [0.56, 3],
      [-0.6, 3],
    ],
    torso: [
      [-0.55, 2.85],
      [0.5, 2.85],
      [0.7, 4.4],
      [-0.4, 4.4],
    ],
    head: [0.3, 4.95],
    arms: [
      [
        [-0.5, 4.25],
        [-1.3, 4],
        [-1.9, 3.6],
      ],
      [
        [0.65, 4.3],
        [1.8, 3.6],
        [2.9, 3],
      ],
    ],
    racket: { hand: [2.9, 3], tip: [4.1, 3.6] },
  },
};

const POSES = Object.keys(FRAMES) as Pose[];

function path(points: Point[]) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${up(y).toFixed(2)}`)
    .join(" ");
}

function shape(points: Point[]) {
  return `${path(points)} Z`;
}

export type Kit = {
  shirt: string;
  shirtShade: string;
  shorts: string;
  shortsShade: string;
  skin: string;
  skinShade: string;
  hair: string;
  grip: string;
};

function Racket({ hand, tip, grip }: { hand: Point; tip: Point; grip: string }) {
  const dx = tip[0] - hand[0];
  const dy = tip[1] - hand[1];
  const len = Math.hypot(dx, dy) || 1;
  const throatX = hand[0] + (dx / len) * 0.62;
  const throatY = hand[1] + (dy / len) * 0.62;
  const headX = (throatX + tip[0]) / 2;
  const headY = (throatY + tip[1]) / 2;
  const angle = (Math.atan2(up(dy), dx) * 180) / Math.PI;

  return (
    <g>
      <path
        d={path([hand, [throatX, throatY]])}
        stroke={grip}
        strokeWidth={0.17}
        strokeLinecap="round"
        fill="none"
      />
      <g transform={`translate(${headX.toFixed(2)} ${up(headY).toFixed(2)}) rotate(${angle.toFixed(1)})`}>
        <ellipse rx={0.74} ry={0.52} fill={RACKET.strings} opacity={0.85} />
        <ellipse rx={0.74} ry={0.52} fill="none" stroke={RACKET.frame} strokeWidth={0.14} />
      </g>
    </g>
  );
}

function PoseArt({ pose, kit }: { pose: Pose; kit: Kit }) {
  const frame = FRAMES[pose];
  const [back, front] = frame.legs;
  const [offArm, hitArm] = frame.arms;

  return (
    <g>
      <path
        d={path(back)}
        stroke={kit.skinShade}
        strokeWidth={0.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d={path(offArm)}
        stroke={kit.skinShade}
        strokeWidth={0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d={path(front)}
        stroke={kit.skin}
        strokeWidth={0.42}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d={shape(frame.shorts)} fill={kit.shorts} />
      <path
        d={path([frame.shorts[0], frame.shorts[3]])}
        stroke={kit.shortsShade}
        strokeWidth={0.12}
        fill="none"
      />
      <path d={shape(frame.torso)} fill={kit.shirt} />
      <path
        d={path([frame.torso[1], frame.torso[2]])}
        stroke={kit.shirtShade}
        strokeWidth={0.16}
        fill="none"
      />
      <circle
        cx={frame.head[0]}
        cy={up(frame.head[1])}
        r={0.44}
        fill={kit.skin}
      />
      <path
        d={`M ${(frame.head[0] - 0.44).toFixed(2)} ${up(frame.head[1] + 0.06).toFixed(2)} a 0.44 ${(0.44 * VERTICAL).toFixed(2)} 0 0 1 0.88 0 Z`}
        fill={kit.hair}
      />
      <path
        d={path(hitArm)}
        stroke={kit.skin}
        strokeWidth={0.32}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Racket hand={frame.racket.hand} tip={frame.racket.tip} grip={kit.grip} />
    </g>
  );
}

export function PlayerSprite({ name, kit }: { name: "user" | "bot"; kit: Kit }) {
  return (
    <g data-node={`${name}-root`}>
      <ellipse data-node={`${name}-shadow`} fill={SHADOW} opacity={0.2} />
      <g data-node={`${name}-body`}>
        {POSES.map((pose) => (
          <g
            key={pose}
            data-node={`${name}-pose-${pose}`}
            display={pose === "ready" ? "inline" : "none"}
          >
            <PoseArt pose={pose} kit={kit} />
          </g>
        ))}
      </g>
    </g>
  );
}

export function BallSprite() {
  return (
    <g data-node="ball-root">
      <ellipse data-node="ball-shadow" fill={SHADOW} opacity={0.18} />
      <g data-node="ball-body">
        <circle r={0.5} fill={BALL.fill} />
        <path
          d="M -0.5 0 a 0.62 0.62 0 0 0 1 0"
          fill="none"
          stroke={BALL.seam}
          strokeWidth={0.09}
        />
        <path d="M -0.34 0.3 a 0.5 0.5 0 0 0 0.68 0" fill={BALL.shade} opacity={0.5} />
      </g>
    </g>
  );
}

export { POSES };
