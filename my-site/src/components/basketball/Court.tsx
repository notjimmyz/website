import { memo } from "react";
import {
  BACKBOARD_BOTTOM,
  BACKBOARD_HALF_WIDTH,
  BACKBOARD_TOP,
  BACKBOARD_Y,
  COURT_DEPTH,
  COURT_HALF_WIDTH,
  FT_CIRCLE_R,
  FT_LINE_Y,
  HOOP_X,
  HOOP_Y,
  KEY_HALF_WIDTH,
  RESTRICTED_R,
  RIM_HEIGHT,
  RIM_RADIUS,
} from "@/lib/basketball/constants";
import {
  groundEllipse,
  project,
  projectPath,
  projectPolygon,
  SCREEN_H,
  SCREEN_W,
} from "@/lib/basketball/camera";
import { arcPoints, threePointPoints } from "@/lib/basketball/court";
import { CAGE, COURT, HOOP, SHADOW, SURROUNDS } from "@/lib/basketball/palette";

const APRON_X = COURT_HALF_WIDTH + 2.6;
const APRON_BACK = -3.4;
const APRON_FRONT = COURT_DEPTH + 3.2;
const FENCE_BACK_Y = -6;
const FENCE_SIDE_X = 29.5;
const FENCE_HEIGHT = 10;
const GROUND_BACK = -44;

const LINE = COURT.line;
const LINE_WIDTH = 2.6;

export const Court = memo(function Court() {
  return (
    <g data-layer="court">
      <Backdrop />
      <Ground />
      <Fence />
      <Surface />
      <Markings />
      <Hoop />
    </g>
  );
});

function Backdrop() {
  // The horizon sits above the frame at this focal length, so the sky and the
  // treeline are painted in screen space behind the projected ground.
  const horizon = project(0, GROUND_BACK, 0).y;

  return (
    <g data-layer="backdrop">
      <rect x="0" y="0" width={SCREEN_W} height={horizon + 4} fill={SURROUNDS.sky} />
      <rect
        x="0"
        y={horizon - 78}
        width={SCREEN_W}
        height="78"
        fill={SURROUNDS.skyBand}
        opacity="0.55"
      />
      <g data-layer="treeline">
        {TREES.map((tree, index) => (
          <ellipse
            key={index}
            cx={tree.x}
            cy={horizon - tree.rise}
            rx={tree.rx}
            ry={tree.ry}
            fill={index % 3 === 0 ? SURROUNDS.treeNear : SURROUNDS.treeFar}
            opacity={index % 3 === 0 ? 0.95 : 0.8}
          />
        ))}
      </g>
      <g data-layer="pavilion">
        <rect
          x="196"
          y={horizon - 40}
          width="118"
          height="40"
          fill={SURROUNDS.building}
        />
        <polygon
          points={`190,${horizon - 40} 320,${horizon - 40} 255,${horizon - 58}`}
          fill={SURROUNDS.buildingRoof}
        />
        <rect
          x="1042"
          y={horizon - 32}
          width="150"
          height="32"
          fill={SURROUNDS.building}
          opacity="0.9"
        />
      </g>
      <rect
        x="0"
        y={horizon - 12}
        width={SCREEN_W}
        height="16"
        fill={SURROUNDS.hedge}
        opacity="0.9"
      />
    </g>
  );
}

const TREES = [
  { x: 60, rx: 78, ry: 30, rise: 16 },
  { x: 168, rx: 58, ry: 24, rise: 12 },
  { x: 372, rx: 86, ry: 32, rise: 18 },
  { x: 486, rx: 54, ry: 22, rise: 10 },
  { x: 592, rx: 74, ry: 28, rise: 15 },
  { x: 726, rx: 62, ry: 24, rise: 12 },
  { x: 846, rx: 88, ry: 34, rise: 19 },
  { x: 968, rx: 58, ry: 23, rise: 11 },
  { x: 1128, rx: 80, ry: 30, rise: 16 },
  { x: 1268, rx: 66, ry: 26, rise: 13 },
  { x: 1390, rx: 74, ry: 29, rise: 15 },
];

function Ground() {
  return (
    <g data-layer="ground">
      <polygon
        points={projectPolygon([
          [-120, GROUND_BACK],
          [120, GROUND_BACK],
          [120, APRON_FRONT + 10],
          [-120, APRON_FRONT + 10],
        ])}
        fill={SURROUNDS.grass}
      />
      {[0, 1, 2, 3, 4].map((index) => {
        const y0 = GROUND_BACK + 6 + index * 7.5;
        return (
          <polygon
            key={index}
            points={projectPolygon([
              [-120, y0],
              [120, y0],
              [120, y0 + 3.6],
              [-120, y0 + 3.6],
            ])}
            fill={SURROUNDS.grassStripe}
            opacity="0.55"
          />
        );
      })}
      <polygon
        points={projectPolygon([
          [-120, GROUND_BACK],
          [120, GROUND_BACK],
          [120, GROUND_BACK + 5],
          [-120, GROUND_BACK + 5],
        ])}
        fill={SURROUNDS.turf}
        opacity="0.5"
      />
    </g>
  );
}

function Fence() {
  const posts: number[] = [];
  for (let x = -FENCE_SIDE_X; x <= FENCE_SIDE_X + 0.01; x += 6.85) {
    posts.push(x);
  }

  const sidePosts: number[] = [];
  for (let y = FENCE_BACK_Y; y <= APRON_FRONT; y += 7.2) {
    sidePosts.push(y);
  }

  return (
    <g data-layer="fence">
      {[-1, 1].map((side) => (
        <g key={side}>
          <polygon
            points={projectPolygon([
              [side * FENCE_SIDE_X, FENCE_BACK_Y, 0],
              [side * FENCE_SIDE_X, APRON_FRONT, 0],
              [side * FENCE_SIDE_X, APRON_FRONT, FENCE_HEIGHT],
              [side * FENCE_SIDE_X, FENCE_BACK_Y, FENCE_HEIGHT],
            ])}
            fill={CAGE.mesh}
            opacity="0.26"
          />
          {sidePosts.map((y) => (
            <path
              key={y}
              d={projectPath([
                [side * FENCE_SIDE_X, y, 0],
                [side * FENCE_SIDE_X, y, FENCE_HEIGHT],
              ])}
              stroke={CAGE.post}
              strokeWidth="2.4"
              opacity="0.85"
            />
          ))}
          <path
            d={projectPath([
              [side * FENCE_SIDE_X, FENCE_BACK_Y, FENCE_HEIGHT],
              [side * FENCE_SIDE_X, APRON_FRONT, FENCE_HEIGHT],
            ])}
            stroke={CAGE.post}
            strokeWidth="2.6"
            fill="none"
          />
        </g>
      ))}

      <polygon
        points={projectPolygon([
          [-FENCE_SIDE_X, FENCE_BACK_Y, 0],
          [FENCE_SIDE_X, FENCE_BACK_Y, 0],
          [FENCE_SIDE_X, FENCE_BACK_Y, FENCE_HEIGHT],
          [-FENCE_SIDE_X, FENCE_BACK_Y, FENCE_HEIGHT],
        ])}
        fill={CAGE.mesh}
        opacity="0.3"
      />
      {posts.map((x) => (
        <path
          key={x}
          d={projectPath([
            [x, FENCE_BACK_Y, 0],
            [x, FENCE_BACK_Y, FENCE_HEIGHT],
          ])}
          stroke={CAGE.post}
          strokeWidth="2.6"
        />
      ))}
      <path
        d={projectPath([
          [-FENCE_SIDE_X, FENCE_BACK_Y, FENCE_HEIGHT],
          [FENCE_SIDE_X, FENCE_BACK_Y, FENCE_HEIGHT],
        ])}
        stroke={CAGE.post}
        strokeWidth="2.8"
        fill="none"
      />
    </g>
  );
}

function Surface() {
  return (
    <g data-layer="surface">
      <polygon
        points={projectPolygon([
          [-APRON_X, APRON_BACK],
          [APRON_X, APRON_BACK],
          [APRON_X, APRON_FRONT],
          [-APRON_X, APRON_FRONT],
        ])}
        fill={COURT.apron}
      />
      <polygon
        points={projectPolygon([
          [-COURT_HALF_WIDTH, 0],
          [COURT_HALF_WIDTH, 0],
          [COURT_HALF_WIDTH, COURT_DEPTH],
          [-COURT_HALF_WIDTH, COURT_DEPTH],
        ])}
        fill={COURT.floor}
      />
      <polygon
        points={projectPolygon([
          [-COURT_HALF_WIDTH, 0],
          [COURT_HALF_WIDTH, 0],
          [COURT_HALF_WIDTH, 12],
          [-COURT_HALF_WIDTH, 12],
        ])}
        fill={COURT.floorFar}
        opacity="0.55"
      />

      <polygon
        points={projectPolygon([
          [-KEY_HALF_WIDTH, 0],
          [KEY_HALF_WIDTH, 0],
          [KEY_HALF_WIDTH, FT_LINE_Y],
          [-KEY_HALF_WIDTH, FT_LINE_Y],
        ])}
        fill={COURT.paint}
      />
      <polygon
        points={projectPolygon(arcPoints(HOOP_X, FT_LINE_Y, FT_CIRCLE_R, 0, Math.PI * 2, 48))}
        fill={COURT.paint}
      />
      <polygon
        points={projectPolygon([
          [-KEY_HALF_WIDTH, 0],
          [KEY_HALF_WIDTH, 0],
          [KEY_HALF_WIDTH, 6],
          [-KEY_HALF_WIDTH, 6],
        ])}
        fill={COURT.paintFar}
        opacity="0.5"
      />
    </g>
  );
}

function Markings() {
  const halfCircle = arcPoints(HOOP_X, COURT_DEPTH, 6, Math.PI, Math.PI * 2, 28);

  return (
    <g
      data-layer="markings"
      fill="none"
      stroke={LINE}
      strokeWidth={LINE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    >
      <path
        d={projectPath([
          [-COURT_HALF_WIDTH, 0],
          [COURT_HALF_WIDTH, 0],
        ])}
      />
      <path
        d={projectPath([
          [-COURT_HALF_WIDTH, 0],
          [-COURT_HALF_WIDTH, COURT_DEPTH],
        ])}
      />
      <path
        d={projectPath([
          [COURT_HALF_WIDTH, 0],
          [COURT_HALF_WIDTH, COURT_DEPTH],
        ])}
      />
      <path
        d={projectPath([
          [-COURT_HALF_WIDTH, COURT_DEPTH],
          [COURT_HALF_WIDTH, COURT_DEPTH],
        ])}
      />
      <path d={projectPath(halfCircle)} />

      <path
        d={projectPath([
          [-KEY_HALF_WIDTH, 0],
          [-KEY_HALF_WIDTH, FT_LINE_Y],
          [KEY_HALF_WIDTH, FT_LINE_Y],
          [KEY_HALF_WIDTH, 0],
        ])}
      />
      <path d={projectPath(arcPoints(HOOP_X, FT_LINE_Y, FT_CIRCLE_R, 0, Math.PI * 2, 48))} />
      <path
        d={projectPath(arcPoints(HOOP_X, HOOP_Y, RESTRICTED_R, 0, Math.PI, 24))}
        strokeWidth="2.2"
      />
      <path d={projectPath(threePointPoints())} />

      <g stroke={COURT.lineSoft} strokeWidth="2" opacity="0.75">
        <path d={projectPath(arcPoints(HOOP_X, FT_LINE_Y, 2.1, 0, Math.PI * 2, 28))} />
      </g>
    </g>
  );
}

function Hoop() {
  const rim = project(HOOP_X, HOOP_Y, RIM_HEIGHT);
  const rimSize = groundEllipse(RIM_RADIUS, rim.k);
  const netBottom = project(HOOP_X, HOOP_Y, RIM_HEIGHT - 1.35);
  const netSize = groundEllipse(RIM_RADIUS * 0.62, netBottom.k);
  const base = project(HOOP_X, -2.2, 0);

  return (
    <g data-layer="hoop">
      <ellipse
        cx={base.x}
        cy={base.y}
        rx={2.6 * base.k}
        ry={2.6 * base.k * 0.34}
        fill={SHADOW}
        opacity="0.16"
      />
      <polygon
        points={projectPolygon([
          [-1.7, -4.1, 0],
          [1.7, -4.1, 0],
          [1.7, -0.6, 0],
          [-1.7, -0.6, 0],
        ])}
        fill={HOOP.base}
        opacity="0.85"
      />
      <polygon
        points={projectPolygon([
          [-0.42, -2.2, 0],
          [0.42, -2.2, 0],
          [0.42, -2.2, 11.2],
          [-0.42, -2.2, 11.2],
        ])}
        fill={HOOP.pole}
      />
      <polygon
        points={projectPolygon([
          [-0.26, -2.2, 10.6],
          [0.26, -2.2, 10.6],
          [0.26, BACKBOARD_Y, 12.1],
          [-0.26, BACKBOARD_Y, 12.1],
        ])}
        fill={HOOP.poleShade}
      />
      <polygon
        points={projectPolygon([
          [-BACKBOARD_HALF_WIDTH, BACKBOARD_Y, BACKBOARD_BOTTOM],
          [BACKBOARD_HALF_WIDTH, BACKBOARD_Y, BACKBOARD_BOTTOM],
          [BACKBOARD_HALF_WIDTH, BACKBOARD_Y, BACKBOARD_TOP],
          [-BACKBOARD_HALF_WIDTH, BACKBOARD_Y, BACKBOARD_TOP],
        ])}
        fill={HOOP.board}
        opacity="0.82"
        stroke={HOOP.boardEdge}
        strokeWidth="2.2"
      />
      <polygon
        points={projectPolygon([
          [-1, BACKBOARD_Y, BACKBOARD_BOTTOM + 0.5],
          [1, BACKBOARD_Y, BACKBOARD_BOTTOM + 0.5],
          [1, BACKBOARD_Y, BACKBOARD_BOTTOM + 2],
          [-1, BACKBOARD_Y, BACKBOARD_BOTTOM + 2],
        ])}
        fill="none"
        stroke={HOOP.rim}
        strokeWidth="2"
        opacity="0.8"
      />
      <path
        d={projectPath([
          [0, BACKBOARD_Y, RIM_HEIGHT],
          [0, HOOP_Y - RIM_RADIUS, RIM_HEIGHT],
        ])}
        stroke={HOOP.rim}
        strokeWidth="3"
      />
      <path
        d={`M ${(rim.x - rimSize.rx).toFixed(1)} ${rim.y.toFixed(1)}
            L ${(netBottom.x - netSize.rx).toFixed(1)} ${netBottom.y.toFixed(1)}
            A ${netSize.rx.toFixed(1)} ${netSize.ry.toFixed(1)} 0 0 0 ${(netBottom.x + netSize.rx).toFixed(1)} ${netBottom.y.toFixed(1)}
            L ${(rim.x + rimSize.rx).toFixed(1)} ${rim.y.toFixed(1)}
            A ${rimSize.rx.toFixed(1)} ${rimSize.ry.toFixed(1)} 0 0 1 ${(rim.x - rimSize.rx).toFixed(1)} ${rim.y.toFixed(1)} Z`}
        fill={HOOP.net}
        opacity="0.42"
      />
      <ellipse
        cx={rim.x}
        cy={rim.y}
        rx={rimSize.rx}
        ry={rimSize.ry}
        fill="none"
        stroke={HOOP.rim}
        strokeWidth="3.4"
      />
    </g>
  );
}

export const COURT_VIEWBOX = `0 0 ${SCREEN_W} ${SCREEN_H}`;
