import { iso, isoPoints, TILE_H, TILE_W } from "./iso/project";
import {
  IsoBox,
  IsoCone,
  IsoFascia,
  IsoGable,
  IsoLamp,
  IsoSlab,
  IsoTree,
  IsoWindows,
  shade,
} from "./iso/primitives";

const STONE = { top: "#E6D2B0", left: "#C49868", right: "#D4B486" };
const SLATE = { top: "#8A6C70", left: "#5C464C", right: "#72585E" };
const GRASS = { top: "#C5E09A", left: "#8FB872", right: "#A4CC84" };
const GRASS_STRIPE = "#8FBF72";
const COURT = { top: "#6FCF8A", left: "#4EAE6C", right: "#5EBE7A" };
const BASKETBALL = { top: "#7EB8D4", left: "#5A96B4", right: "#6AA8C4" };
const ASTRO = { top: "#62C878", left: "#3EA85C", right: "#50B86A" };
const TRACK = { top: "#E29484", left: "#C47468", right: "#D48478" };
const SILVER = { top: "#D8DCE0", left: "#A8B0B6", right: "#C0C6CC" };
const FENCE = { top: "#D4D8DC", left: "#8E98A0", right: "#A4AEB6" };
const MESH = "#B4BEC4";
const PATH = { top: "#E8DFD0", left: "#C8BFB0", right: "#D8CFC0" };
const LOT = { top: "#C8C4BE", left: "#A8A49E", right: "#B8B4AE" };
const ROAD = { top: "#D2CEC8", left: "#B4AFA8", right: "#C2BDB6" };
const WINDOW = "#4A423A";
const STRING = "#D8C49A";
const BRICK = { top: "#E09A8C", left: "#C06E64", right: "#D28276" };
const BRICK_STRING = "#E8B4A8";
const SAND = { top: "#EDE0B0", left: "#D4C484", right: "#E2D498" };

const SCHOOL_SHIFT = 7.85;
const QX = 22.75 + SCHOOL_SHIFT;
const SOUTH_Y = 2.22;
const SOUTH_D = 2.32;
const NORTH_Y = -5.7;
const NORTH_D = 2.35;
const WEST_W = 2.72;
const QUAD_INNER_W = 3.75;
const SPINE_W = 2.62;
const EAST_COURT_W = 7.35;
const EAST_W = 2.78;
const INNER_X = QX + WEST_W;
const SPINE_X = INNER_X + QUAD_INNER_W;
const EAST_INNER_X = SPINE_X + SPINE_W;
const EAST_X = EAST_INNER_X + EAST_COURT_W;
const INNER_Y = NORTH_Y + NORTH_D;
const INNER_D = SOUTH_Y - INNER_Y;

const HEAD = { x: 23.8 + SCHOOL_SHIFT, y: -17.5, w: 18.8, d: 11.6 };
const FIFTY = { x: 27.4 + SCHOOL_SHIFT, y: -35.1, w: 23.2, d: 17.2 };

const TRACK_CX = 19.85 + SCHOOL_SHIFT;
const TRACK_CY = -21.55;
const TRACK_STRETCH = 4.25;
const TRACK_R = 3.75;
const FIFTY_ROAD_X = FIFTY.x - 1.18;
const FIFTY_ROAD_W = 0.92;
const SPORTS_STREET_Y = FIFTY.y - 0.82;
const SPORTS_STREET_D = 0.72;
const ROWANS_W = 7.25;
const ROWANS_D = 4.05;
const TENNIS_W = 3.85;
const TENNIS_D = 7.2;
const ROWANS_X = FIFTY_ROAD_X - TENNIS_W - 0.28 - ROWANS_W - 0.12;
const ROWANS_Y = SPORTS_STREET_Y - ROWANS_D - 0.12;
const TENNIS_X = ROWANS_X + ROWANS_W + 0.28;
const TENNIS_Y = SPORTS_STREET_Y - TENNIS_D - 0.12;
const SPORTS_STREET_X = ROWANS_X - 0.4;
const SPORTS_STREET_W = FIFTY.x + 0.15 - SPORTS_STREET_X;
const BASKETBALL_X = ROWANS_X + 0.2;
const BASKETBALL_Y = SPORTS_STREET_Y + SPORTS_STREET_D + 2.75;
const BASKETBALL_W = 6.1;
const BASKETBALL_D = 2.25;

export const BASKETBALL_HOTSPOT = {
  x: BASKETBALL_X + BASKETBALL_W / 2,
  y: BASKETBALL_Y + BASKETBALL_D / 2,
} as const;

export function TonbridgeSchool({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-landmark="tonbridge-school">
      <SchoolFields reduceMotion={reduceMotion} />
      <SchoolBuildings />
    </g>
  );
}

export function TonbridgeSchoolForecourt({ reduceMotion }: { reduceMotion: boolean }) {
  return <SchoolForecourt reduceMotion={reduceMotion} />;
}

function SchoolFields({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-landmark="tonbridge-grounds">
      <IsoSlab
        x={12.4 + SCHOOL_SHIFT}
        y={TENNIS_Y - 0.7}
        w={17.6}
        d={HEAD.y + HEAD.d - 0.55 - (TENNIS_Y - 0.7)}
        h={0.1}
        {...GRASS}
      />
      <IsoSlab x={HEAD.x - 0.4} y={FIFTY.y - 1.2} w={FIFTY.x + FIFTY.w - HEAD.x + 2.2} d={FIFTY.d + HEAD.d + 2.8} h={0.1} {...GRASS} />
      <NamedField x={HEAD.x} y={HEAD.y} w={HEAD.w} d={HEAD.d} stripes={16} />
      <NamedField x={FIFTY.x} y={FIFTY.y} w={FIFTY.w} d={FIFTY.d} stripes={20} />
      <IsoSlab x={QX + 0.15} y={HEAD.y} w={0.55} d={SOUTH_Y - HEAD.y} h={0.14} {...ROAD} />
      <IsoSlab x={FIFTY_ROAD_X} y={SPORTS_STREET_Y} w={FIFTY_ROAD_W} d={FIFTY.y + FIFTY.d - SPORTS_STREET_Y} h={0.14} {...ROAD} />
      <IsoSlab x={SPORTS_STREET_X} y={SPORTS_STREET_Y} w={SPORTS_STREET_W} d={SPORTS_STREET_D} h={0.15} {...ROAD} />
      <IsoSlab x={FIFTY.x + FIFTY.w + 0.35} y={-36.4} w={1.15} d={40.4} h={0.16} {...ROAD} />
      <IsoSlab x={SPINE_X + 0.4} y={FIFTY.y + 1.2} w={0.55} d={FIFTY.d + HEAD.d + 2.2} h={0.12} {...PATH} />
      <IsoSlab x={29.55 + SCHOOL_SHIFT} y={SOUTH_Y} w={1.5} d={2.55} h={0.12} {...PATH} />
      <RowansAstro />
      <TennisCourts />
      <SportsCenter />
      <BasketballCourt />
      <AthleticsTrack />
      <TreeLines reduceMotion={reduceMotion} />
    </g>
  );
}

function SchoolBuildings() {
  return (
    <g data-landmark="tonbridge-quad">
      <FivesAnnex />
      <TheQuad />
      <VisitorsCourt />
      <QuadWest />
      <QuadSpine />
      <EastWing />
      <Satellites />
      <BoardingHouses />
      <QuadSouth />
      <StreetHouses />
      <IsoLamp x={QX + 1.2} y={4.55} />
      <IsoLamp x={SPINE_X + 0.4} y={4.55} />
      <IsoLamp x={EAST_INNER_X + 2.4} y={4.55} />
      <IsoLamp x={EAST_X + 0.6} y={4.55} />
    </g>
  );
}

function SchoolForecourt({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-landmark="ferox-hall">
      <CampusBlock x={23.1 + SCHOOL_SHIFT} y={7.15} w={2.35} d={2.2} h={2.55} />
      <IsoBox x={25.7 + SCHOOL_SHIFT} y={7.15} z={0.16} w={3.45} d={2.3} h={2.85} {...STONE} />
      <IsoWindows face="left" x={25.7 + SCHOOL_SHIFT} y={7.15} z={0.16} w={3.45} d={2.3} h={2.85} cols={4} rows={3} fill={WINDOW} v0={0.12} v1={0.74} />
      <IsoFascia x={25.7 + SCHOOL_SHIFT} y={7.15} z={0.16} w={3.45} d={2.3} h={2.85} fill={STRING} />
      <IsoGable x={25.7 + SCHOOL_SHIFT} y={7.15} z={3.01} w={3.45} d={2.3} rise={0.7} left={SLATE.left} right={SLATE.right} />
      <CampusBlock x={29.4 + SCHOOL_SHIFT} y={7.2} w={2.2} d={2.15} h={2.4} gable />
      <IsoTree x={22.6 + SCHOOL_SHIFT} y={7.35} canopy="#8FCB8A" delay="0.2s" reduceMotion={reduceMotion} />
      <IsoTree x={32.2 + SCHOOL_SHIFT} y={7.4} canopy="#7EBE7A" delay="0.5s" reduceMotion={reduceMotion} />
    </g>
  );
}

function TheQuad() {
  const cars = ["#C45C5C", "#7A9EC8", "#E8D48A", "#F4EFE4", "#5C5048", "#6FB8B0"];
  const stallW = QUAD_INNER_W - 0.4;

  return (
    <g data-landmark="the-quad">
      <IsoSlab x={INNER_X} y={NORTH_Y} w={QUAD_INNER_W} d={SOUTH_Y - NORTH_Y} h={0.12} {...LOT} />
      {Array.from({ length: 5 }, (_, index) => (
        <polygon
          key={index}
          points={isoPoints([
            [INNER_X + 0.2, NORTH_Y + 0.45 + index * 1.35, 0.14],
            [INNER_X + stallW, NORTH_Y + 0.45 + index * 1.35, 0.14],
            [INNER_X + stallW, NORTH_Y + 0.52 + index * 1.35, 0.14],
            [INNER_X + 0.2, NORTH_Y + 0.52 + index * 1.35, 0.14],
          ])}
          fill="#B8B4AE"
        />
      ))}
      {cars.map((color, index) => (
        <IsoBox
          key={index}
          x={INNER_X + 0.35 + (index % 2) * 1.55}
          y={NORTH_Y + 0.7 + Math.floor(index / 2) * 1.55}
          z={0.14}
          w={0.95}
          d={0.46}
          h={0.24}
          top={color}
          left={shade(color, -22)}
          right={shade(color, -12)}
        />
      ))}
    </g>
  );
}

function VisitorsCourt() {
  const cars = ["#C45C5C", "#7A9EC8", "#E8D48A", "#F4EFE4", "#5C5048", "#6FB8B0"];

  return (
    <g data-landmark="visitors-parking">
      <IsoSlab x={EAST_INNER_X} y={NORTH_Y} w={EAST_COURT_W} d={SOUTH_Y - NORTH_Y} h={0.12} {...LOT} />
      {cars.map((color, index) => (
        <IsoBox
          key={index}
          x={EAST_INNER_X + 0.55 + (index % 3) * 2.15}
          y={INNER_Y + 0.7 + Math.floor(index / 3) * 1.7}
          z={0.14}
          w={0.95}
          d={0.46}
          h={0.24}
          top={color}
          left={shade(color, -22)}
          right={shade(color, -12)}
        />
      ))}
    </g>
  );
}

function QuadSouth() {
  const westBays = [
    { w: 2.72, h: 3.35 },
    { w: 2.45, h: 3.7 },
    { w: 1.3, h: 3.2 },
    { w: 2.62, h: 3.85 },
  ] as const;
  const eastBays = [
    { w: 2.4, h: 3.45 },
    { w: 2.55, h: 3.9 },
    { w: 2.4, h: 3.3 },
    { w: 2.78, h: 3.55 },
  ] as const;
  let x = QX;

  return (
    <g data-landmark="quad-south">
      {westBays.map((bay, index) => {
        const origin = x;
        x += bay.w;
        return (
          <CampusBlock key={`w-${index}`} x={origin} y={SOUTH_Y} w={bay.w} d={SOUTH_D} h={bay.h} gable={index % 2 === 0} />
        );
      })}
      {eastBays.map((bay, index) => {
        const origin = EAST_INNER_X + eastBays.slice(0, index).reduce((sum, item) => sum + item.w, 0);
        return (
          <CampusBlock key={`e-${index}`} x={origin} y={SOUTH_Y} w={bay.w} d={SOUTH_D} h={bay.h} gable={index % 2 === 1} />
        );
      })}
    </g>
  );
}

function QuadWest() {
  const midY = INNER_Y + 2.15;
  return (
    <g data-landmark="quad-west">
      <CampusBlock x={QX} y={NORTH_Y} w={WEST_W} d={INNER_Y + 2.15 - NORTH_Y} h={3.15} gable />
      <CampusBlock x={QX} y={midY} w={WEST_W} d={SOUTH_Y - midY} h={3.05} />
    </g>
  );
}

function QuadSpine() {
  const midY = INNER_Y + 2.05;
  return (
    <g data-landmark="quad-spine">
      <CampusBlock x={SPINE_X} y={NORTH_Y} w={SPINE_W} d={midY - NORTH_Y} h={3.4} gable />
      <CampusBlock x={SPINE_X} y={midY} w={SPINE_W} d={SOUTH_Y - midY} h={3.25} />
    </g>
  );
}

function EastWing() {
  return (
    <g data-landmark="east-court">
      <Chapel x={EAST_X - 0.08} y={NORTH_Y} />
      <CampusBlock x={EAST_X} y={INNER_Y} w={EAST_W} d={2.15} h={3.55} gable brick />
      <CampusBlock x={EAST_X} y={INNER_Y + 2.15} w={EAST_W} d={SOUTH_Y - (INNER_Y + 2.15)} h={3.2} brick />
    </g>
  );
}

function Satellites() {
  return (
    <g data-landmark="avenue-blocks">
      <CampusBlock x={EAST_X + EAST_W + 0.45} y={-2.45} w={2.15} d={1.85} h={2.45} />
      <CampusBlock x={EAST_X + EAST_W + 0.7} y={-0.35} w={2.35} d={2.05} h={2.7} gable />
    </g>
  );
}

function FivesAnnex() {
  return (
    <g data-landmark="fives-squash">
      <IsoBox x={QX - 5.35} y={NORTH_Y - 2.2} z={0.16} w={2.35} d={2.15} h={1.55} {...STONE} />
      <IsoWindows face="left" x={QX - 5.35} y={NORTH_Y - 2.2} z={0.16} w={2.35} d={2.15} h={1.55} cols={4} rows={1} v0={0.22} v1={0.78} fill={WINDOW} />
      <IsoBox x={QX - 2.85} y={NORTH_Y - 2.1} z={0.16} w={2.55} d={2.05} h={1.7} {...STONE} />
      <IsoWindows face="left" x={QX - 2.85} y={NORTH_Y - 2.1} z={0.16} w={2.55} d={2.05} h={1.7} cols={3} rows={1} v0={0.22} v1={0.78} fill={WINDOW} />
      <IsoBox x={QX - 0.15} y={NORTH_Y - 1.95} z={0.16} w={1.95} d={1.9} h={1.4} {...STONE} />
    </g>
  );
}

function Chapel({ x, y }: { x: number; y: number }) {
  const w = 3.05;
  const d = 2.15;
  const h = 5.55;
  const brick = BRICK;
  const roof = SLATE;

  return (
    <g data-landmark="chapel" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x} y={y} z={0.16} w={w} d={d} h={h} {...brick} />
      <BrickStripes x={x} y={y} w={w} d={d} h={h} />
      <IsoBox x={x - 0.12} y={y + d - 0.28} z={0.16} w={0.22} d={0.28} h={h * 0.72} {...brick} />
      <IsoBox x={x + w - 0.1} y={y + d - 0.28} z={0.16} w={0.22} d={0.28} h={h * 0.72} {...brick} />
      <BrickStripes x={x - 0.12} y={y + d - 0.28} w={0.22} d={0.28} h={h * 0.72} />
      <IsoWindows face="left" x={x} y={y} z={0.16} w={w} d={d} h={h} cols={3} rows={1} fill={WINDOW} u0={0.1} u1={0.9} v0={0.12} v1={0.84} />
      <IsoWindows face="right" x={x} y={y} z={0.16} w={w} d={d} h={h} cols={1} rows={1} fill={WINDOW} v0={0.14} v1={0.82} />
      <IsoBox x={x + w * 0.38} y={y + d - 0.08} z={0.16} w={0.72} d={0.22} h={1.05} top="#C07A70" left="#A45C56" right="#B46A62" />
      <IsoBox x={x + w * 0.46} y={y + d + 0.04} z={0.42} w={0.32} d={0.12} h={0.55} top={WINDOW} left="#3A322C" right="#4A4038" />
      <IsoFascia x={x} y={y} z={0.16} w={w} d={d} h={h} fill={BRICK_STRING} />
      {Array.from({ length: 4 }, (_, index) => (
        <IsoBox
          key={index}
          x={x + 0.12 + index * 0.72}
          y={y + d - 0.2}
          z={0.16 + h}
          w={0.22}
          d={0.16}
          h={0.32}
          {...brick}
        />
      ))}
      <IsoGable x={x} y={y} z={0.16 + h} w={w} d={d} rise={1.85} left={roof.left} right={roof.right} />
      <IsoBox x={x + 1.12} y={y + 0.68} z={0.16 + h + 1.35} w={0.72} d={0.72} h={1.15} {...roof} />
      <IsoCone
        x={x + 0.98}
        y={y + 0.54}
        z={0.16 + h + 2.45}
        w={1.0}
        d={1.0}
        rise={1.25}
        left={roof.left}
        right={roof.right}
      />
    </g>
  );
}

function CampusBlock({
  x,
  y,
  w,
  d,
  h,
  gable = false,
  brick = false,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  gable?: boolean;
  brick?: boolean;
}) {
  const merlons = Math.max(2, Math.round(w));
  const wall = brick ? BRICK : STONE;
  const fascia = brick ? BRICK_STRING : STRING;

  return (
    <g className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x} y={y} z={0.16} w={w} d={d} h={h} {...wall} />
      {brick ? (
        <>
          <BrickStripes x={x} y={y} w={w} d={d} h={h} />
          <IsoBox x={x - 0.1} y={y + d - 0.26} z={0.16} w={0.2} d={0.26} h={h * 0.7} {...wall} />
          <IsoBox x={x + w - 0.1} y={y + d - 0.26} z={0.16} w={0.2} d={0.26} h={h * 0.7} {...wall} />
          <BrickStripes x={x - 0.1} y={y + d - 0.26} w={0.2} d={0.26} h={h * 0.7} />
        </>
      ) : null}
      <IsoWindows
        face="left"
        x={x}
        y={y}
        z={0.16}
        w={w}
        d={d}
        h={h}
        cols={brick ? 3 : Math.max(2, Math.round(w + 0.4))}
        rows={brick ? 1 : Math.max(2, Math.round(h - 0.45))}
        fill={WINDOW}
        u0={brick ? 0.1 : 0.12}
        u1={brick ? 0.9 : 0.88}
        v0={brick ? 0.12 : 0.1}
        v1={brick ? 0.84 : 0.76}
      />
      <IsoWindows
        face="right"
        x={x}
        y={y}
        z={0.16}
        w={w}
        d={d}
        h={h}
        cols={1}
        rows={brick ? 1 : 2}
        fill={WINDOW}
        v0={brick ? 0.14 : 0.16}
        v1={brick ? 0.82 : 0.72}
      />
      <IsoFascia x={x} y={y} z={0.16} w={w} d={d} h={h} fill={fascia} />
      {gable ? (
        <IsoGable x={x} y={y} z={0.16 + h} w={w} d={d} rise={brick ? 1.05 : 0.78} left={SLATE.left} right={SLATE.right} />
      ) : (
        <>
          {Array.from({ length: merlons }, (_, index) => (
            <IsoBox
              key={index}
              x={x + 0.12 + index * ((w - 0.28) / merlons)}
              y={y + d - 0.22}
              z={0.16 + h}
              w={0.2}
              d={0.18}
              h={brick ? 0.38 : 0.28}
              {...wall}
            />
          ))}
          <IsoBox
            x={x + w * 0.4}
            y={y + 0.4}
            z={0.16 + h}
            w={0.28}
            d={0.28}
            h={0.5}
            top={SLATE.top}
            left={SLATE.left}
            right={SLATE.right}
          />
        </>
      )}
    </g>
  );
}

function BrickStripes({ x, y, w, d, h }: { x: number; y: number; w: number; d: number; h: number }) {
  return (
    <g>
      {[0.22, 0.48, 0.78].map((t) => (
        <IsoBox key={t} x={x} y={y} z={0.16 + h * t} w={w} d={d} h={0.11} {...SAND} />
      ))}
    </g>
  );
}

function StreetHouses() {
  const x = EAST_X + EAST_W + 1.35;

  return (
    <g data-landmark="high-street-houses">
      <IsoSlab x={x - 0.25} y={SOUTH_Y - 0.2} w={5.6} d={SOUTH_D + 0.45} h={0.1} {...PATH} />
      <CampusBlock x={x} y={SOUTH_Y} w={2.55} d={SOUTH_D} h={3.05} gable />
      <CampusBlock x={x + 2.7} y={SOUTH_Y} w={2.4} d={SOUTH_D} h={2.75} />
    </g>
  );
}

function BoardingHouses() {
  const x = EAST_X + EAST_W + 1.55;

  return (
    <g data-landmark="boarding-houses">
      <IsoSlab x={x - 0.35} y={-5.15} w={6.15} d={7.15} h={0.1} {...PATH} />
      <CampusBlock x={x + 0.35} y={-4.85} w={2.45} d={2.05} h={2.85} gable />
      <CampusBlock x={x + 3.05} y={-4.95} w={2.2} d={2.15} h={2.55} />
      <CampusBlock x={x} y={-2.35} w={2.55} d={2.1} h={3.15} />
      <CampusBlock x={x + 2.8} y={-2.45} w={2.35} d={2.2} h={2.7} gable />
    </g>
  );
}

function BasketballCourt() {
  const x = BASKETBALL_X;
  const y = BASKETBALL_Y;
  const w = BASKETBALL_W;
  const d = BASKETBALL_D;
  const midY = y + d * 0.5;

  return (
    <g data-landmark="basketball">
      <IsoSlab x={x - 0.35} y={y - 0.15} w={w + 0.7} d={d + 0.3} h={0.1} {...PATH} />
      <Court x={x} y={y} w={w} d={d} fill={BASKETBALL} lines />
      <BasketballHoop x={x + 0.08} y={midY} facing={1} />
      <BasketballHoop x={x + w - 0.2} y={midY} facing={-1} />
    </g>
  );
}

function BasketballHoop({
  x,
  y,
  facing,
}: {
  x: number;
  y: number;
  facing: 1 | -1;
}) {
  const z = 0.16;
  const postH = 1.22;
  const boardX = facing === 1 ? x + 0.1 : x - 0.1;
  const rim = iso(x + facing * 0.32, y, z + 1.02);

  return (
    <g>
      <IsoBox
        x={x}
        y={y - 0.07}
        z={z}
        w={0.14}
        d={0.14}
        h={postH}
        top="#E8A07A"
        left="#C47858"
        right="#D48A68"
      />
      <IsoBox
        x={boardX}
        y={y - 0.38}
        z={z + 0.9}
        w={0.12}
        d={0.76}
        h={0.48}
        top="#F7F4EE"
        left="#D4CCC0"
        right="#E6DED4"
      />
      <ellipse
        cx={rim.x}
        cy={rim.y}
        rx="8"
        ry="4.5"
        fill="none"
        stroke="#E08A5A"
        strokeWidth="2.2"
      />
    </g>
  );
}

function SportsCenter() {
  const x = ROWANS_X;
  const y = SPORTS_STREET_Y + SPORTS_STREET_D + 0.12;
  const w = ROWANS_W;
  const d = 2.45;
  const h = 1.7;

  return (
    <g data-landmark="sports-center" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x} y={y} z={0.16} w={w} d={d} h={h} {...SILVER} />
      <IsoWindows face="left" x={x} y={y} z={0.16} w={w} d={d} h={h} cols={7} rows={1} v0={0.28} v1={0.78} fill="#F4EFE4" />
      <IsoBox x={x + 0.2} y={y + 0.2} z={0.16 + h} w={w - 0.4} d={d - 0.4} h={0.12} top="#E8ECF0" left="#C4C8CC" right="#D4D8DC" />
    </g>
  );
}

function TennisCourts() {
  return (
    <g data-landmark="tennis">
      <Court x={TENNIS_X} y={TENNIS_Y} w={TENNIS_W} d={TENNIS_D} fill={COURT} lines />
      {[0.26, 0.74].map((t) => (
        <IsoBox
          key={t}
          x={TENNIS_X + 0.38}
          y={TENNIS_Y + TENNIS_D * t - 0.03}
          z={0.16}
          w={TENNIS_W - 0.76}
          d={0.06}
          h={0.28}
          top="#F4F0E8"
          left="#D0CCC4"
          right="#E0DCD4"
        />
      ))}
    </g>
  );
}

function RowansAstro() {
  const pad = 0.1;

  return (
    <g data-landmark="rowans-astro">
      <Cage
        x={ROWANS_X - pad}
        y={ROWANS_Y - pad}
        w={ROWANS_W + pad * 2}
        d={ROWANS_D + pad * 2}
        h={1.45}
      >
        <Court x={ROWANS_X} y={ROWANS_Y} w={ROWANS_W} d={ROWANS_D} fill={ASTRO} lines />
      </Cage>
    </g>
  );
}

function Cage({
  x,
  y,
  w,
  d,
  h,
  children,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  children: React.ReactNode;
}) {
  const z = 0.16;
  const t = 0.1;

  return (
    <g>
      <CageMesh
        a={[x, y, z + h]}
        b={[x + w, y, z + h]}
        c={[x + w, y, z]}
        e={[x, y, z]}
        bars={6}
      />
      <CageMesh
        a={[x, y, z + h]}
        b={[x, y + d, z + h]}
        c={[x, y + d, z]}
        e={[x, y, z]}
        bars={4}
      />
      <IsoBox x={x} y={y} z={z} w={t} d={t} h={h} {...FENCE} />
      <IsoBox x={x + w - t} y={y} z={z} w={t} d={t} h={h} {...FENCE} />
      {children}
      <CageMesh
        a={[x, y + d, z + h]}
        b={[x + w, y + d, z + h]}
        c={[x + w, y + d, z]}
        e={[x, y + d, z]}
        bars={6}
      />
      <CageMesh
        a={[x + w, y, z + h]}
        b={[x + w, y + d, z + h]}
        c={[x + w, y + d, z]}
        e={[x + w, y, z]}
        bars={4}
      />
      <IsoBox x={x} y={y + d - t} z={z} w={t} d={t} h={h} {...FENCE} />
      <IsoBox x={x + w - t} y={y + d - t} z={z} w={t} d={t} h={h} {...FENCE} />
      <IsoBox x={x + w * 0.5 - t * 0.5} y={y} z={z} w={t} d={t} h={h} {...FENCE} />
      <IsoBox x={x + w * 0.5 - t * 0.5} y={y + d - t} z={z} w={t} d={t} h={h} {...FENCE} />
      <IsoBox x={x} y={y} z={z + h - 0.07} w={w} d={t} h={0.07} {...FENCE} />
      <IsoBox x={x} y={y + d - t} z={z + h - 0.07} w={w} d={t} h={0.07} {...FENCE} />
      <IsoBox x={x} y={y} z={z + h - 0.07} w={t} d={d} h={0.07} {...FENCE} />
      <IsoBox x={x + w - t} y={y} z={z + h - 0.07} w={t} d={d} h={0.07} {...FENCE} />
    </g>
  );
}

function CageMesh({
  a,
  b,
  c,
  e,
  bars,
}: {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  e: [number, number, number];
  bars: number;
}) {
  return (
    <g>
      <polygon points={isoPoints([a, b, c, e])} fill={MESH} opacity="0.32" />
      {Array.from({ length: bars }, (_, index) => {
        const t = (index + 1) / (bars + 1);
        const top: [number, number, number] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2]];
        const bot: [number, number, number] = [e[0] + (c[0] - e[0]) * t, e[1] + (c[1] - e[1]) * t, e[2]];
        return (
          <polyline
            key={index}
            points={isoPoints([top, bot])}
            fill="none"
            stroke={MESH}
            strokeWidth="1"
            opacity="0.85"
          />
        );
      })}
    </g>
  );
}

function AthleticsTrack() {
  const stretch = TRACK_STRETCH;
  const outer = TRACK_R;
  const inner = 2.45;
  const north = TRACK_CY - stretch;
  const south = TRACK_CY + stretch;
  const lane = (inner + outer) * 0.5;

  return (
    <g data-landmark="wilmot-track">
      <IsoDisc x={TRACK_CX} y={north} z={0.14} r={outer} fill={TRACK.top} />
      <IsoDisc x={TRACK_CX} y={south} z={0.14} r={outer} fill={TRACK.top} />
      <IsoSlab x={TRACK_CX - outer} y={north} w={outer * 2} d={stretch * 2} h={0.14} {...TRACK} />
      <IsoDisc x={TRACK_CX} y={north} z={0.17} r={inner} fill={GRASS.top} />
      <IsoDisc x={TRACK_CX} y={south} z={0.17} r={inner} fill={GRASS.top} />
      <IsoSlab x={TRACK_CX - inner} y={north} z={0.02} w={inner * 2} d={stretch * 2} h={0.15} {...GRASS} />
      <IsoDisc x={TRACK_CX} y={north} z={0.185} r={lane} fill="none" stroke="#F0C4B8" />
      <IsoDisc x={TRACK_CX} y={south} z={0.185} r={lane} fill="none" stroke="#F0C4B8" />
    </g>
  );
}

function Court({
  x,
  y,
  w,
  d,
  fill,
  lines = false,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  fill: { top: string; left: string; right: string };
  lines?: boolean;
}) {
  return (
    <g>
      <IsoSlab x={x} y={y} w={w} d={d} h={0.14} {...fill} />
      {lines ? (
        <>
          <polygon
            points={isoPoints([
              [x + 0.15, y + 0.15, 0.16],
              [x + w - 0.15, y + 0.15, 0.16],
              [x + w - 0.15, y + d - 0.15, 0.16],
              [x + 0.15, y + d - 0.15, 0.16],
            ])}
            fill="none"
            stroke="#F4F0E8"
            strokeWidth="1.2"
          />
          <polygon
            points={isoPoints([
              [x + w * 0.5, y + 0.15, 0.16],
              [x + w * 0.5, y + d - 0.15, 0.16],
              [x + w * 0.5 + 0.04, y + d - 0.15, 0.16],
              [x + w * 0.5 + 0.04, y + 0.15, 0.16],
            ])}
            fill="#F4F0E8"
          />
        </>
      ) : null}
    </g>
  );
}

function NamedField({
  x,
  y,
  w,
  d,
  stripes,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  stripes: number;
}) {
  return (
    <g>
      <IsoSlab x={x} y={y} z={0.02} w={w} d={d} h={0.12} {...GRASS} />
      {Array.from({ length: stripes }, (_, index) => {
        if (index % 2 !== 0) return null;
        const u0 = x + (index / stripes) * w;
        const u1 = x + ((index + 1) / stripes) * w;
        return (
          <polygon
            key={index}
            points={isoPoints([
              [u0, y, 0.15],
              [u1, y, 0.15],
              [u1, y + d, 0.15],
              [u0, y + d, 0.15],
            ])}
            fill={GRASS_STRIPE}
            opacity="0.5"
          />
        );
      })}
    </g>
  );
}

function TreeLines({ reduceMotion }: { reduceMotion: boolean }) {
  const headEast = Array.from({ length: 8 }, (_, index) => ({
    x: HEAD.x + HEAD.w + 0.2,
    y: HEAD.y + 0.35 + index * 1.35,
    canopy: index % 2 === 0 ? "#A4D49A" : "#8FCB8A",
  }));
  const fiftyHead = Array.from({ length: 10 }, (_, index) => ({
    x: HEAD.x + 0.45 + index * 2.05,
    y: HEAD.y - 0.28,
    canopy: index % 2 === 0 ? "#7EBE7A" : "#8FCB8A",
  }));
  const fiftyEast = Array.from({ length: 9 }, (_, index) => ({
    x: FIFTY.x + FIFTY.w + 0.15,
    y: FIFTY.y + 0.8 + index * 1.6,
    canopy: index % 2 === 0 ? "#A4D49A" : "#7EBE7A",
  }));
  const highStreet = [23.4, 27.2, 35.6, 39.8].map((x, index) => ({
    x: x + SCHOOL_SHIFT,
    y: 4.35,
    canopy: index % 2 === 0 ? "#8FCB8A" : "#A4D49A",
  }));

  return (
    <g data-layer="trees">
      {[...headEast, ...fiftyHead, ...fiftyEast, ...highStreet].map((tree, index) => (
        <IsoTree
          key={`${tree.x}-${tree.y}`}
          x={tree.x}
          y={tree.y}
          canopy={tree.canopy}
          delay={`${(index % 6) * 0.18}s`}
          reduceMotion={reduceMotion}
        />
      ))}
    </g>
  );
}

function IsoDisc({
  x,
  y,
  z,
  r,
  fill,
  stroke,
}: {
  x: number;
  y: number;
  z: number;
  r: number;
  fill: string;
  stroke?: string;
}) {
  const center = iso(x, y, z);
  return (
    <ellipse
      cx={center.x}
      cy={center.y}
      rx={r * TILE_W * Math.SQRT2}
      ry={r * TILE_H * Math.SQRT2}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 1.4 : undefined}
    />
  );
}
