import { memo } from "react";
import {
  APRON_BACK,
  APRON_SIDE,
  BASELINE_Y,
  CENTRE_MARK,
  COURT_HALF_WIDTH,
  LINE_WIDTH,
  NET_POST_X,
  SERVICE_LINE_Y,
} from "@/lib/tennis/constants";
import { netHeightAt } from "@/lib/tennis/court";
import {
  groundStripe,
  project,
  projectPolygon,
  SCREEN_H,
  SCREEN_W,
  VERTICAL,
} from "@/lib/tennis/camera";
import { COURT, NET, SURROUNDS } from "@/lib/tennis/palette";

const HALF = COURT_HALF_WIDTH;

function Stripe({
  x1,
  y1,
  x2,
  y2,
  width = LINE_WIDTH,
  fill = COURT.line,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  fill?: string;
}) {
  return <polygon points={groundStripe(x1, y1, x2, y2, width)} fill={fill} />;
}

function Net() {
  const samples = 33;
  const tapeTop: Array<[number, number, number]> = [];
  const tapeBottom: Array<[number, number, number]> = [];
  const strands: string[] = [];

  for (let i = 0; i < samples; i += 1) {
    const x = -NET_POST_X + (i / (samples - 1)) * NET_POST_X * 2;
    const top = netHeightAt(x);
    tapeTop.push([x, 0, top]);
    tapeBottom.push([x, 0, top - 0.22]);
    strands.push(projectPolygon([[x, 0, 0], [x, 0, top]]));
  }

  const mesh = projectPolygon([
    ...tapeBottom,
    ...[...tapeBottom].reverse().map(([x]) => [x, 0, 0] as [number, number, number]),
  ]);

  const tape = projectPolygon([...tapeTop, ...[...tapeBottom].reverse()]);

  const post = (x: number) => {
    const base = project(x, 0, 0);
    const head = project(x, 0, 3.5);
    const width = Math.max(2, 0.28 * base.k);
    return (
      <g key={x}>
        <line
          x1={base.x}
          y1={base.y}
          x2={head.x}
          y2={head.y}
          stroke={NET.post}
          strokeWidth={width}
          strokeLinecap="round"
        />
        <line
          x1={base.x}
          y1={base.y}
          x2={head.x}
          y2={head.y}
          stroke={NET.postShade}
          strokeWidth={width * 0.35}
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <g data-part="net">
      <polygon points={mesh} fill={NET.mesh} opacity={0.34} />
      <g stroke={NET.mesh} strokeWidth={1} opacity={0.5}>
        {strands.map((points, index) => (
          <polyline key={index} points={points} fill="none" />
        ))}
      </g>
      <polygon points={tape} fill={NET.tape} />
      {post(-NET_POST_X)}
      {post(NET_POST_X)}
    </g>
  );
}

/**
 * The camera looks down at the surface, so anything tall behind the court runs
 * off the top of the frame. The far side is therefore built from two flat bands
 * and a row of crowns peeking over the near one.
 */
const HEDGE_HEIGHT = 1.6;

function Backdrop() {
  const treeLineY = -64;
  const hedgeY = -58;

  const band = (y: number, height: number) =>
    projectPolygon([
      [-90, y, height],
      [90, y, height],
      [90, y, 0],
      [-90, y, 0],
    ]);

  const crowns = [-62, -41, -23, -7, 12, 33, 58].map((x, index) => {
    const radius = 2.7 + (index % 3) * 0.9;
    const anchor = project(x, hedgeY, HEDGE_HEIGHT + radius * 0.55);
    return (
      <ellipse
        key={x}
        cx={anchor.x}
        cy={anchor.y}
        rx={radius * anchor.k}
        ry={radius * anchor.k * VERTICAL}
        fill={index % 2 === 0 ? SURROUNDS.treeNear : SURROUNDS.hedge}
      />
    );
  });

  return (
    <g data-part="backdrop">
      <polygon points={band(treeLineY, 6)} fill={SURROUNDS.treeFar} />
      {crowns}
      <polygon points={band(hedgeY, HEDGE_HEIGHT)} fill={SURROUNDS.hedge} />
    </g>
  );
}

export const Court = memo(function Court() {
  const grass = projectPolygon([
    [-120, -96, 0],
    [120, -96, 0],
    [120, 78, 0],
    [-120, 78, 0],
  ]);

  const apron = projectPolygon([
    [-APRON_SIDE, -APRON_BACK, 0],
    [APRON_SIDE, -APRON_BACK, 0],
    [APRON_SIDE, APRON_BACK, 0],
    [-APRON_SIDE, APRON_BACK, 0],
  ]);

  const surfaceFar = projectPolygon([
    [-HALF - 2.2, -BASELINE_Y - 2.2, 0],
    [HALF + 2.2, -BASELINE_Y - 2.2, 0],
    [HALF + 2.2, 0, 0],
    [-HALF - 2.2, 0, 0],
  ]);

  const surfaceNear = projectPolygon([
    [-HALF - 2.2, 0, 0],
    [HALF + 2.2, 0, 0],
    [HALF + 2.2, BASELINE_Y + 2.2, 0],
    [-HALF - 2.2, BASELINE_Y + 2.2, 0],
  ]);

  return (
    <g data-part="court">
      <rect x={0} y={0} width={SCREEN_W} height={SCREEN_H} fill={SURROUNDS.grass} />
      <polygon points={grass} fill={SURROUNDS.grass} />
      <Backdrop />
      <polygon points={apron} fill={COURT.apron} />
      <polygon points={surfaceFar} fill={COURT.innerFar} />
      <polygon points={surfaceNear} fill={COURT.inner} />

      <Stripe x1={-HALF} y1={BASELINE_Y} x2={HALF} y2={BASELINE_Y} />
      <Stripe x1={-HALF} y1={-BASELINE_Y} x2={HALF} y2={-BASELINE_Y} />
      <Stripe x1={-HALF} y1={-BASELINE_Y} x2={-HALF} y2={BASELINE_Y} />
      <Stripe x1={HALF} y1={-BASELINE_Y} x2={HALF} y2={BASELINE_Y} />

      <Stripe x1={-HALF} y1={SERVICE_LINE_Y} x2={HALF} y2={SERVICE_LINE_Y} />
      <Stripe x1={-HALF} y1={-SERVICE_LINE_Y} x2={HALF} y2={-SERVICE_LINE_Y} />
      <Stripe x1={0} y1={-SERVICE_LINE_Y} x2={0} y2={SERVICE_LINE_Y} />

      <Stripe
        x1={0}
        y1={BASELINE_Y}
        x2={0}
        y2={BASELINE_Y - CENTRE_MARK}
        width={LINE_WIDTH * 1.6}
      />
      <Stripe
        x1={0}
        y1={-BASELINE_Y}
        x2={0}
        y2={-BASELINE_Y + CENTRE_MARK}
        width={LINE_WIDTH * 1.6}
      />

      <Net />
    </g>
  );
});
