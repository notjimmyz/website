"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { eraAt, eraDistance } from "@/lib/timeline";
import type { EnvironmentProps } from "./types";
import { iso, isoPoints, TILE_H, TILE_W } from "./iso/project";
import { IsoBox, IsoCone, IsoSlab, IsoTree, IsoWindows } from "./iso/primitives";

const COLLEGE_AT = eraAt("college");

const ROAD = { top: "#D2CEC8", left: "#B4AFA8", right: "#C2BDB6" };
const BRICK = { top: "#D2A090", left: "#B07A6A", right: "#C28A7A" };
const COL = { top: "#EFE8DC", left: "#C4BCAF", right: "#D6CEC2" };
const TERRA = { top: "#C88878", left: "#A45C52", right: "#B87064" };
const GLASS = { top: "#8AA0B0", left: "#4E6270", right: "#5E7482" };
const SLAB = { top: "#E8E2D6", left: "#C4BEB2", right: "#D4CEC2" };
const TRELLIS = { top: "#D8D4CC", left: "#B0ACA4", right: "#C0BCB4" };
const DARK_GLASS = "#3A4A54";

const MAIN = { x: -0.35, y: 5.0, w: 74.3, d: 1.85, h: 0.2 };
const CROSS_W = MAIN.d;
const CROSS_X = MAIN.x + MAIN.w / 2 - CROSS_W / 2;

const HALL_W = 3.55;
const HALL_D = 3.35;
const HALL_X = CROSS_X - 0.32 - HALL_W;
const HALL_Y = MAIN.y - 0.15 - HALL_D;

const WATER = { top: "#B4D6D2", left: "#84B4B0", right: "#9CC8C4" };
const CONCRETE = { top: "#E6E2DA", left: "#C4C0B8", right: "#D4D0C8" };
const WHITE = { top: "#F7F4EE", left: "#D8D4CC", right: "#E8E4DC" };
const STONE = { top: "#EFE4D0", left: "#C8B49A", right: "#D8C8B0" };
const TEAL = { top: "#5EB0B8", left: "#2F6E78", right: "#3D8A92" };
const FOLD_A = "#E0C4A4";
const FOLD_B = "#C8A888";

const GREY_LEN = MAIN.y - HALL_Y;
const GREY_Y = HALL_Y;
const GREY_D = GREY_LEN + 0.12;

const PLAZA_BAND = 0.28;
const PLAZA_COLS = 3;
const PLAZA_INNER = (GREY_LEN * 3 - 5 * PLAZA_BAND) / 4;
const PLAZA_PITCH = PLAZA_INNER + PLAZA_BAND;
const PLAZA_ROWS = 6;
const BRICK_LEN = PLAZA_ROWS * PLAZA_INNER + (PLAZA_ROWS + 1) * PLAZA_BAND;
const BRICK_Y = HALL_Y - BRICK_LEN;
const BRICK_D = BRICK_LEN + 0.08;
const GATE_Y = HALL_Y - (4 * PLAZA_INNER + 5 * PLAZA_BAND);
const PLAZA_W = PLAZA_COLS * PLAZA_INNER + (PLAZA_COLS + 1) * PLAZA_BAND;
const PLAZA_X = CROSS_X + CROSS_W / 2 - PLAZA_W / 2;
const PLAZA_Y = BRICK_Y;
const FOUNTAIN_COL = 0;
const FOUNTAIN_ROW = 4;

const BEAR_W = 3.7;
const BEAR_D = 4.05;
const BEAR_GAP = 4.6;
const BEAR_Y = HALL_Y - BEAR_GAP - BEAR_D;
const BEAR_X = CROSS_X - 2.55 - BEAR_W;
const FOUNTAIN_X = PLAZA_X + PLAZA_BAND + FOUNTAIN_COL * PLAZA_PITCH + PLAZA_INNER / 2;
const FOUNTAIN_Y = PLAZA_Y + PLAZA_BAND + FOUNTAIN_ROW * PLAZA_PITCH + PLAZA_INNER / 2;

const SPROUL_W = 3.85;
const SPROUL_D = 4 * PLAZA_INNER + 3 * PLAZA_BAND;
const SPROUL_X = PLAZA_X + PLAZA_W + 0.32;
const SPROUL_Y = PLAZA_Y + PLAZA_BAND + 3 * PLAZA_PITCH;

const TREE_PAD_W = 2 * PLAZA_INNER + 3 * PLAZA_BAND;
const TREE_PAD_D = 2 * PLAZA_INNER + 3 * PLAZA_BAND;
const TREE_PAD_X = PLAZA_X - TREE_PAD_W;
const TREE_PAD_Y = PLAZA_Y - PLAZA_PITCH;

const DW_D = 5 * PLAZA_PITCH;
const DW_W = 2.85 * PLAZA_PITCH;
const DW_X = TREE_PAD_X - 0.3 - DW_W;
const DW_Y = TREE_PAD_Y + TREE_PAD_D / 2 - DW_D / 2;
const HEDGE = { top: "#6FA86C", left: "#4E7E52", right: "#5E8E60" };


export function IsoBerkeleyEnvironment({ progress }: EnvironmentProps) {
  const reduceMotion = useReducedMotion();
  const drift = useTransform(progress, (value) =>
    reduceMotion ? 0 : eraDistance(value, COLLEGE_AT) * -14,
  );

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <rect width="1440" height="900" fill="#F0E4C4" />
      <ellipse cx="720" cy="150" rx="280" ry="36" fill="#E7D6A8" opacity="0.75" />
      <ellipse cx="1040" cy="118" rx="220" ry="28" fill="#EDDDB4" opacity="0.8" />
      <circle cx="1180" cy="96" r="34" fill="#F3D89A" />

      <motion.g style={{ x: reduceMotion ? 0 : drift }}>
        <BrickWalk />
        <DwinelleHall />
        <GateTreeCourt reduceMotion={Boolean(reduceMotion)} />
        <SproulHall />
        <SatherGate />
        <GoldenBear />
        <LudwigsFountain />
        <Moffitt />
        <Road />
        <PlaceName x={HALL_X + HALL_W / 2} y={HALL_Y + HALL_D * 0.55} z={4.15} size={13}>
          MLK
        </PlaceName>
        <PlaceName x={BEAR_X + BEAR_W / 2} y={BEAR_Y + BEAR_D * 0.55} z={2.45} size={13}>
          GBC
        </PlaceName>
        <PlaceName x={CROSS_X + CROSS_W / 2} y={GATE_Y + 0.2} z={3.85} size={12}>
          Sather Gate
        </PlaceName>
        <PlaceName x={SPROUL_X + SPROUL_W / 2} y={SPROUL_Y + SPROUL_D / 2} z={3.95} size={12}>
          Sproul
        </PlaceName>
        <PlaceName x={DW_X + DW_W * 0.58} y={DW_Y + DW_D * 0.5} z={3.7} size={12}>
          Dwinelle
        </PlaceName>
      </motion.g>
    </svg>
  );
}

function BrickWalk() {
  const z = MAIN.h + 0.012;
  const tileRows = [1, 4, 5];
  const brickRow = 2;
  const cells = tileRows.flatMap((row) =>
    Array.from({ length: PLAZA_COLS }, (_, col) => ({
      key: `${col}-${row}`,
      x: PLAZA_X + PLAZA_BAND + col * PLAZA_PITCH,
      y: PLAZA_Y + PLAZA_BAND + row * PLAZA_PITCH,
    })),
  );
  const brickY = PLAZA_Y + PLAZA_BAND + brickRow * PLAZA_PITCH;
  const brickX = PLAZA_X + PLAZA_BAND;
  const brickW = PLAZA_W - PLAZA_BAND * 2;

  return (
    <g data-landmark="brick-walk">
      <IsoSlab x={PLAZA_X} y={PLAZA_Y - 3 * PLAZA_PITCH} w={PLAZA_W} d={BRICK_D + 3 * PLAZA_PITCH} h={MAIN.h} {...ROAD} />
      <polygon
        points={isoPoints([
          [brickX, brickY, z],
          [brickX + brickW, brickY, z],
          [brickX + brickW, brickY + PLAZA_INNER, z],
          [brickX, brickY + PLAZA_INNER, z],
        ])}
        fill={BRICK.top}
      />
      {cells.map((cell) => (
        <polygon
          key={cell.key}
          points={isoPoints([
            [cell.x, cell.y, z],
            [cell.x + PLAZA_INNER, cell.y, z],
            [cell.x + PLAZA_INNER, cell.y + PLAZA_INNER, z],
            [cell.x, cell.y + PLAZA_INNER, z],
          ])}
          fill={BRICK.top}
        />
      ))}
    </g>
  );
}

function GateTreeCourt({ reduceMotion }: { reduceMotion: boolean }) {
  const z = MAIN.h;
  const padW = TREE_PAD_W;
  const padD = TREE_PAD_D;
  const padX = TREE_PAD_X;
  const padY = TREE_PAD_Y;
  const planter = PLAZA_INNER * 0.4;
  const cells = [0, 1].flatMap((col) =>
    [0, 1].map((row) => ({
      key: `${col}-${row}`,
      col,
      row,
      x: padX + PLAZA_BAND + col * PLAZA_PITCH,
      y: padY + PLAZA_BAND + row * PLAZA_PITCH,
    })),
  );

  return (
    <g data-landmark="gate-tree-court">
      <IsoSlab x={padX} y={padY} w={padW} d={padD} h={MAIN.h} {...ROAD} />
      {cells.map((cell, index) => {
        const cx = cell.x + PLAZA_INNER / 2;
        const cy = cell.y + PLAZA_INNER / 2;
        const lampX = cell.col === 0 ? cell.x + PLAZA_INNER - 0.12 : cell.x + 0.12;
        return (
          <g key={cell.key}>
            <polygon
              points={isoPoints([
                [cell.x, cell.y, z + 0.012],
                [cell.x + PLAZA_INNER, cell.y, z + 0.012],
                [cell.x + PLAZA_INNER, cell.y + PLAZA_INNER, z + 0.012],
                [cell.x, cell.y + PLAZA_INNER, z + 0.012],
              ])}
              fill={SLAB.top}
            />
            <IsoSlab
              x={cx - planter / 2}
              y={cy - planter / 2}
              z={z}
              w={planter}
              d={planter}
              h={0.08}
              {...STONE}
            />
            <IsoDisc x={cx} y={cy} z={z + 0.08} r={planter * 0.28} fill="#B08968" />
            <IsoTree
              x={cx}
              y={cy}
              z={z + 0.08}
              scale={0.58}
              canopy={index % 2 === 0 ? "#8FCB8A" : "#7EBE7A"}
              delay={`${(index % 4) * 0.2}s`}
              reduceMotion={reduceMotion}
            />
            <Lamp x={lampX} y={cy} z={z} />
          </g>
        );
      })}
    </g>
  );
}

function Lamp({ x, y, z }: { x: number; y: number; z: number }) {
  const cap = iso(x, y, z + 0.78);
  return (
    <g>
      <IsoBox
        x={x - 0.035}
        y={y - 0.035}
        z={z}
        w={0.07}
        d={0.07}
        h={0.68}
        top="#5C544C"
        left="#3E3A36"
        right="#4A4640"
      />
      <circle cx={cap.x} cy={cap.y} r="3.6" fill="#F3E4B8" />
    </g>
  );
}

function TileRoof({
  x,
  y,
  z,
  w,
  d,
  edge = TERRA,
  cap = SLAB,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  edge?: { top: string; left: string; right: string };
  cap?: { top: string; left: string; right: string };
}) {
  const rim = 0.22;
  return (
    <g>
      <IsoSlab x={x - 0.08} y={y - 0.08} z={z} w={w + 0.16} d={d + 0.16} h={0.1} {...edge} />
      <IsoSlab x={x + rim} y={y + rim} z={z + 0.1} w={w - rim * 2} d={d - rim * 2} h={0.08} {...cap} />
    </g>
  );
}

function DwinelleHall() {
  const z = MAIN.h;
  const h = 3.05;
  const wingD = PLAZA_INNER * 0.92;
  const reach = PLAZA_INNER * 1.08;
  const spineW = PLAZA_INNER * 1.12;
  const frontX = DW_X + DW_W - spineW - reach;
  const frontW = spineW + reach;
  const courtY = DW_Y + wingD;
  const courtD = DW_D - wingD * 2;
  const southY = DW_Y + DW_D - wingD;
  const rearW = frontX - DW_X;
  const wall = 0.7;
  const hole = PLAZA_INNER * 0.88;
  const ringW = hole + wall * 2;
  const ringD = hole + wall * 2;
  const ringX = DW_X;
  const ringY = DW_Y - 0.34 - ringD;
  const connW = PLAZA_INNER * 0.62;
  const connX = DW_X + 0.18;
  const connY = ringY + ringD - 0.06;
  const connD = DW_Y - connY + 0.1;
  const cx = frontX + spineW + reach * 0.52;
  const cy = DW_Y + DW_D / 2;
  const brickCols = 2;
  const brickRows = 6;
  const brick = 0.2;
  const brickGap = 0.055;
  const brickW = brickCols * brick + (brickCols + 1) * brickGap;
  const brickD = brickRows * brick + (brickRows + 1) * brickGap;
  const brickX = cx - brickW / 2;
  const brickY = cy - brickD / 2;
  const hedge = Array.from({ length: 6 }, (_, index) => courtY + 0.16 + index * ((courtD - 0.48) / 5));

  return (
    <g data-landmark="dwinelle" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoSlab x={frontX + spineW} y={courtY} z={z} w={reach} d={courtD} h={0.1} {...ROAD} />
      <IsoSlab x={DW_X + 0.18} y={courtY + 0.14} z={z} w={rearW - 0.32} d={courtD - 0.28} h={0.08} {...ROAD} />

      <IsoDisc x={cx} y={cy} z={z + 0.1} r={1.18} fill={STONE.top} />
      <IsoDisc x={cx} y={cy} z={z + 0.16} r={0.92} fill={STONE.left} />
      <IsoSlab x={brickX - 0.08} y={brickY - 0.08} z={z + 0.16} w={brickW + 0.16} d={brickD + 0.16} h={0.06} {...STONE} />
      {Array.from({ length: brickCols }, (_, col) =>
        Array.from({ length: brickRows }, (_, row) => (
          <polygon
            key={`${col}-${row}`}
            points={isoPoints([
              [brickX + brickGap + col * (brick + brickGap), brickY + brickGap + row * (brick + brickGap), z + 0.23],
              [brickX + brickGap + col * (brick + brickGap) + brick, brickY + brickGap + row * (brick + brickGap), z + 0.23],
              [brickX + brickGap + col * (brick + brickGap) + brick, brickY + brickGap + row * (brick + brickGap) + brick, z + 0.23],
              [brickX + brickGap + col * (brick + brickGap), brickY + brickGap + row * (brick + brickGap) + brick, z + 0.23],
            ])}
            fill={BRICK.top}
          />
        )),
      )}

      <IsoBox x={frontX} y={DW_Y} z={z} w={frontW} d={wingD} h={h} {...WHITE} />
      <IsoBox x={frontX} y={southY} z={z} w={frontW} d={wingD} h={h} {...WHITE} />
      <IsoBox x={frontX} y={courtY} z={z} w={spineW} d={courtD} h={h} {...WHITE} />
      <IsoBox x={DW_X} y={southY} z={z} w={rearW + 0.02} d={wingD} h={h * 0.94} {...WHITE} />
      <IsoBox x={DW_X} y={courtY} z={z} w={0.88} d={courtD} h={h * 0.9} {...WHITE} />
      <IsoBox x={DW_X} y={DW_Y} z={z} w={rearW + 0.02} d={wingD} h={h} {...WHITE} />

      <IsoSlab x={ringX + wall} y={ringY + wall} z={z} w={hole} d={hole} h={0.1} {...ROAD} />
      <IsoBox x={ringX} y={ringY} z={z} w={ringW} d={wall} h={h * 0.92} {...WHITE} />
      <IsoBox x={ringX} y={ringY + wall + hole} z={z} w={ringW} d={wall} h={h * 0.92} {...WHITE} />
      <IsoBox x={ringX} y={ringY} z={z} w={wall} d={ringD} h={h * 0.92} {...WHITE} />
      <IsoBox x={ringX + wall + hole} y={ringY} z={z} w={wall} d={ringD} h={h * 0.92} {...WHITE} />
      <IsoBox x={connX} y={connY} z={z} w={connW} d={connD} h={h * 0.82} {...WHITE} />
      <IsoBox x={connX - 0.08} y={DW_Y - 0.12} z={z} w={connW + 0.16} d={0.42} h={h + 0.28} {...WHITE} />

      <IsoWindows face="right" x={frontX} y={DW_Y} z={z} w={frontW} d={wingD} h={h} cols={4} rows={3} fill={DARK_GLASS} v0={0.12} v1={0.9} />
      <IsoWindows face="left" x={frontX} y={DW_Y} z={z} w={frontW} d={wingD} h={h} cols={3} rows={3} fill={DARK_GLASS} v0={0.12} v1={0.9} />
      <IsoWindows face="right" x={frontX} y={southY} z={z} w={frontW} d={wingD} h={h} cols={4} rows={3} fill={DARK_GLASS} v0={0.12} v1={0.9} />
      <IsoWindows face="left" x={frontX} y={southY} z={z} w={frontW} d={wingD} h={h} cols={3} rows={3} fill={DARK_GLASS} v0={0.12} v1={0.9} />
      <IsoWindows face="right" x={frontX} y={courtY} z={z} w={spineW} d={courtD} h={h} cols={5} rows={3} fill={DARK_GLASS} v0={0.12} v1={0.9} />
      <IsoWindows face="left" x={frontX} y={courtY} z={z} w={spineW} d={courtD} h={h} cols={4} rows={3} fill={DARK_GLASS} v0={0.12} v1={0.9} />
      <IsoWindows face="right" x={ringX + wall + hole} y={ringY} z={z} w={wall} d={ringD} h={h * 0.92} cols={2} rows={2} fill={DARK_GLASS} v0={0.16} v1={0.86} />
      <IsoWindows face="left" x={ringX} y={ringY} z={z} w={wall} d={ringD} h={h * 0.92} cols={2} rows={2} fill={DARK_GLASS} v0={0.16} v1={0.86} />
      <IsoWindows face="right" x={DW_X} y={DW_Y} z={z} w={rearW + 0.02} d={wingD} h={h} cols={3} rows={3} fill={DARK_GLASS} v0={0.12} v1={0.9} />

      <IsoSlab x={frontX + frontW - 0.1} y={DW_Y + 0.42} z={z + h * 0.42} w={0.16} d={0.58} h={0.07} {...STONE} />
      <IsoSlab x={frontX + frontW - 0.1} y={southY + 0.42} z={z + h * 0.42} w={0.16} d={0.58} h={0.07} {...STONE} />
      <IsoSlab x={frontX + frontW - 0.1} y={DW_Y + 0.42} z={z + h * 0.68} w={0.16} d={0.58} h={0.07} {...STONE} />
      <IsoSlab x={frontX + frontW - 0.1} y={southY + 0.42} z={z + h * 0.68} w={0.16} d={0.58} h={0.07} {...STONE} />

      <IsoSlab x={frontX + spineW + reach - 0.38} y={courtY - 0.06} z={z} w={0.38} d={0.26} h={0.1} {...STONE} />
      <IsoSlab x={frontX + spineW + reach - 0.38} y={southY - 0.2} z={z} w={0.38} d={0.26} h={0.1} {...STONE} />

      {hedge.map((hy) => (
        <IsoBox key={hy} x={frontX + spineW + 0.06} y={hy} z={z} w={0.2} d={0.2} h={0.26} {...HEDGE} />
      ))}
      <IsoTree x={frontX + frontW - 0.15} y={southY + wingD + 0.15} z={z} scale={0.42} canopy="#7EBE7A" delay="0.2s" />
      <IsoTree x={frontX + frontW + 0.05} y={southY + 0.2} z={z} scale={0.38} canopy="#8FCB8A" delay="0.5s" />

      <TileRoof x={frontX} y={DW_Y} z={z + h} w={frontW} d={wingD} edge={BRICK} cap={BRICK} />
      <TileRoof x={frontX} y={southY} z={z + h} w={frontW} d={wingD} edge={BRICK} cap={BRICK} />
      <TileRoof x={frontX} y={courtY} z={z + h} w={spineW} d={courtD} edge={BRICK} cap={BRICK} />
      <TileRoof x={DW_X} y={southY} z={z + h * 0.94} w={rearW + 0.02} d={wingD} edge={BRICK} cap={BRICK} />
      <TileRoof x={DW_X} y={DW_Y} z={z + h} w={rearW + 0.02} d={wingD} edge={BRICK} cap={BRICK} />
      <TileRoof x={ringX} y={ringY} z={z + h * 0.92} w={ringW} d={wall} edge={BRICK} cap={BRICK} />
      <TileRoof x={ringX} y={ringY + wall + hole} z={z + h * 0.92} w={ringW} d={wall} edge={BRICK} cap={BRICK} />
      <TileRoof x={ringX} y={ringY} z={z + h * 0.92} w={wall} d={ringD} edge={BRICK} cap={BRICK} />
      <TileRoof x={ringX + wall + hole} y={ringY} z={z + h * 0.92} w={wall} d={ringD} edge={BRICK} cap={BRICK} />
      <IsoSlab x={connX - 0.06} y={connY} z={z + h * 0.82} w={connW + 0.12} d={connD} h={0.1} {...SLAB} />
      <IsoSlab x={connX - 0.08} y={DW_Y - 0.12} z={z + h + 0.28} w={connW + 0.16} d={0.42} h={0.08} {...SLAB} />
    </g>
  );
}

function SproulRoof({ z }: { z: number }) {
  const trim = 0.1;
  const capW = SPROUL_W + 0.28;
  const capD = SPROUL_D * 0.28;
  const capX = SPROUL_X - 0.14;
  const northY = SPROUL_Y - 0.06;
  const southY = SPROUL_Y + SPROUL_D - capD + 0.06;
  const spineW = SPROUL_W * 0.44;
  const spineX = SPROUL_X + (SPROUL_W - spineW) / 2;
  const spineY = northY + capD - 0.08;
  const spineD = southY - spineY + 0.08;
  const hole = 0.58;
  const well = { top: "#3A4248", left: "#2A3238", right: "#323A40" };

  return (
    <g>
      <IsoSlab x={capX - trim} y={northY - trim} z={z} w={capW + trim * 2} d={capD + trim * 2} h={0.07} {...WHITE} />
      <IsoSlab x={capX} y={northY} z={z + 0.07} w={capW} d={capD} h={0.13} {...TERRA} />
      <IsoSlab x={capX - trim} y={southY - trim} z={z} w={capW + trim * 2} d={capD + trim * 2} h={0.07} {...WHITE} />
      <IsoSlab x={capX} y={southY} z={z + 0.07} w={capW} d={capD} h={0.13} {...TERRA} />
      <IsoSlab x={spineX - trim} y={spineY} z={z} w={spineW + trim * 2} d={spineD} h={0.07} {...WHITE} />
      <IsoSlab x={spineX} y={spineY} z={z + 0.07} w={spineW} d={spineD} h={0.13} {...TERRA} />
      <IsoSlab
        x={spineX + spineW / 2 - 0.11}
        y={spineY}
        z={z + 0.2}
        w={0.22}
        d={spineD}
        h={0.05}
        {...WHITE}
      />
      <IsoSlab
        x={capX + capW / 2 - hole / 2}
        y={southY + capD * 0.28}
        z={z + 0.2}
        w={hole}
        d={hole}
        h={0.06}
        {...well}
      />
    </g>
  );
}

function SproulHall() {
  const z = MAIN.h;
  const h = 2.85;
  const wingInset = 0.42;
  const midD = SPROUL_D * 0.36;
  const wingD = (SPROUL_D - midD) / 2;
  const midY = SPROUL_Y + wingD;
  const wingX = SPROUL_X + wingInset;
  const wingW = SPROUL_W - wingInset;
  const col = 0.16;
  const colH = h * 0.78;
  const cols = Array.from({ length: 4 }, (_, index) => midY + 0.22 + index * ((midD - 0.44 - col) / 3));

  return (
    <g data-landmark="sproul" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoSlab
        x={SPROUL_X - 0.55}
        y={midY + 0.18}
        z={z}
        w={0.55}
        d={midD - 0.36}
        h={0.1}
        {...STONE}
      />
      <IsoSlab
        x={SPROUL_X - 0.34}
        y={midY + 0.26}
        z={z + 0.1}
        w={0.34}
        d={midD - 0.52}
        h={0.1}
        {...STONE}
      />
      <IsoBox x={wingX} y={SPROUL_Y} z={z} w={wingW} d={wingD} h={h * 0.92} {...WHITE} />
      <IsoBox x={wingX} y={SPROUL_Y + wingD + midD} z={z} w={wingW} d={wingD} h={h * 0.92} {...WHITE} />
      <IsoBox x={SPROUL_X} y={midY} z={z} w={SPROUL_W} d={midD} h={h} {...WHITE} />
      <IsoWindows
        face="left"
        x={wingX}
        y={SPROUL_Y}
        z={z}
        w={wingW}
        d={SPROUL_D}
        h={h * 0.92}
        cols={5}
        rows={2}
        fill={DARK_GLASS}
        v0={0.14}
        v1={0.86}
      />
      <IsoWindows
        face="right"
        x={wingX}
        y={SPROUL_Y}
        z={z}
        w={wingW}
        d={wingD}
        h={h * 0.92}
        cols={3}
        rows={2}
        fill={DARK_GLASS}
        v0={0.14}
        v1={0.86}
      />
      <IsoWindows
        face="right"
        x={wingX}
        y={SPROUL_Y + wingD + midD}
        z={z}
        w={wingW}
        d={wingD}
        h={h * 0.92}
        cols={3}
        rows={2}
        fill={DARK_GLASS}
        v0={0.14}
        v1={0.86}
      />
      <IsoWindows
        face="right"
        x={SPROUL_X}
        y={midY}
        z={z}
        w={SPROUL_W}
        d={midD}
        h={h}
        cols={3}
        rows={3}
        fill={DARK_GLASS}
        v0={0.12}
        v1={0.88}
      />
      {cols.map((cy) => (
        <IsoBox key={cy} x={SPROUL_X - 0.12} y={cy} z={z + 0.2} w={col} d={col} h={colH} {...COL} />
      ))}
      <polygon
        points={isoPoints([
          [SPROUL_X - 0.04, midY + 0.08, z + h],
          [SPROUL_X - 0.04, midY + midD - 0.08, z + h],
          [SPROUL_X - 0.04, midY + midD / 2, z + h + 0.48],
        ])}
        fill={WHITE.top}
      />
      <SproulRoof z={z + h} />
    </g>
  );
}

function Road() {
  const marks = Array.from({ length: 54 }, (_, index) => -0.1 + index * 1.18);

  return (
    <g data-landmark="telegraph-road">
      <g data-landmark="side-street">
        <IsoSlab x={CROSS_X} y={GREY_Y} w={CROSS_W} d={GREY_D} h={MAIN.h} {...ROAD} />
      </g>
      <IsoSlab {...MAIN} {...ROAD} />
      {marks.map((x) => (
        <polygon
          key={x}
          points={isoPoints([
            [x, 5.88, 0.21],
            [x + 0.42, 5.88, 0.21],
            [x + 0.42, 5.94, 0.21],
            [x, 5.94, 0.21],
          ])}
          fill="#F4F0E8"
        />
      ))}
    </g>
  );
}

function TealFrame({
  x,
  y,
  z,
  w,
  d,
  h,
  bar = 0.16,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  bar?: number;
}) {
  return (
    <g>
      <IsoBox x={x} y={y} z={z} w={bar} d={d} h={h} {...TEAL} />
      <IsoBox x={x + w - bar} y={y} z={z} w={bar} d={d} h={h} {...TEAL} />
      <IsoBox x={x} y={y} z={z + h - bar} w={w} d={d} h={bar} {...TEAL} />
    </g>
  );
}

function SatherGate() {
  const z = MAIN.h;
  const post = 0.3;
  const depth = 0.42;
  const height = 2.55;
  const innerGap = 2.05;
  const sideGap = 0.7;
  const span = post * 4 + innerGap + sideGap * 2;
  const x = CROSS_X + CROSS_W / 2 - span / 2;
  const y = GATE_Y - 0.1;
  const posts = [
    x,
    x + post + sideGap,
    x + post + sideGap + post + innerGap,
    x + post + sideGap + post + innerGap + post + sideGap,
  ];
  const archX0 = posts[1] + post;
  const archX1 = posts[2];
  const archZ = z + height * 0.82;
  const archRise = 0.92;
  const frameY = y + 0.05;
  const frameD = depth - 0.08;
  const frameZ = z + 0.16;
  const frameH = archZ - frameZ;

  return (
    <g data-landmark="sather-gate" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x - 0.18} y={y - 0.06} z={z} w={span + 0.36} d={depth + 0.12} h={0.16} {...STONE} />
      {posts.map((px) => (
        <IsoBox key={px} x={px} y={y} z={z + 0.16} w={post} d={depth} h={height} {...STONE} />
      ))}
      <TealFrame x={posts[0] + post} y={frameY} z={frameZ} w={sideGap} d={frameD} h={frameH} />
      <TealFrame x={posts[2] + post} y={frameY} z={frameZ} w={sideGap} d={frameD} h={frameH} />
      <TealFrame x={archX0} y={frameY} z={frameZ} w={innerGap} d={frameD} h={frameH} bar={0.18} />
      <BronzeArch x0={archX0} x1={archX1} y={y} z={archZ} rise={archRise} depth={depth} />
      <circle
        cx={iso((archX0 + archX1) / 2, y + depth / 2, archZ + archRise + 0.12).x}
        cy={iso((archX0 + archX1) / 2, y + depth / 2, archZ + archRise + 0.12).y}
        r="6"
        fill={TEAL.top}
      />
      {posts.slice(1, 3).map((px) => {
        const lamp = iso(px + post / 2, y + depth / 2, z + 0.16 + height + 0.08);
        return <circle key={px} cx={lamp.x} cy={lamp.y} r="5.2" fill="#F3E4B8" />;
      })}
    </g>
  );
}

function BronzeArch({
  x0,
  x1,
  y,
  z,
  rise,
  depth,
}: {
  x0: number;
  x1: number;
  y: number;
  z: number;
  rise: number;
  depth: number;
}) {
  const steps = 8;
  const cx = (x0 + x1) / 2;
  const rx = (x1 - x0) / 2;
  const innerRx = rx - 0.28;
  const innerZ = z + 0.08;
  const innerRise = rise - 0.16;

  return (
    <g>
      {Array.from({ length: steps }, (_, index) => {
        const a0 = Math.PI * (index / steps);
        const a1 = Math.PI * ((index + 1) / steps);
        const outer = (angle: number, faceY: number): [number, number, number] => [
          cx - rx * Math.cos(angle),
          faceY,
          z + rise * Math.sin(angle),
        ];
        const inner = (angle: number, faceY: number): [number, number, number] => [
          cx - innerRx * Math.cos(angle),
          faceY,
          innerZ + innerRise * Math.sin(angle),
        ];
        return (
          <g key={index}>
            <polygon
              points={isoPoints([outer(a0, y + depth), outer(a1, y + depth), inner(a1, y + depth), inner(a0, y + depth)])}
              fill={index < steps / 2 ? TEAL.right : TEAL.left}
            />
            <polygon
              points={isoPoints([outer(a0, y), outer(a1, y), inner(a1, y), inner(a0, y)])}
              fill={TEAL.top}
            />
            <polygon
              points={isoPoints([outer(a0, y), outer(a1, y), outer(a1, y + depth), outer(a0, y + depth)])}
              fill={TEAL.top}
            />
          </g>
        );
      })}
    </g>
  );
}

function GoldenBear() {
  const x = BEAR_X;
  const y = BEAR_Y;
  const w = BEAR_W;
  const d = BEAR_D;
  const z = MAIN.h;
  const bodyH = 1.18;
  const wingD = d * 0.38;
  const glassY = y + wingD;
  const glassD = d - wingD;
  const roofZ = z + bodyH;
  const over = 0.72;
  const roofX = x - 0.08;
  const roofY = y - 0.1;
  const roofW = w + over;
  const roofD = d + 0.2;
  const sign = iso(x + w + 0.22, y + d * 0.58, roofZ + 0.28);

  return (
    <g data-landmark="gbc" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x} y={y} z={z} w={w} d={wingD} h={bodyH} {...CONCRETE} />
      <IsoWindows
        face="right"
        x={x}
        y={y}
        z={z}
        w={w}
        d={wingD}
        h={bodyH}
        cols={4}
        rows={1}
        fill="#C8C4BC"
        v0={0.18}
        v1={0.82}
      />
      <IsoBox x={x} y={glassY} z={z} w={w} d={glassD} h={bodyH} {...GLASS} />
      <IsoWindows
        face="left"
        x={x}
        y={glassY}
        z={z}
        w={w}
        d={glassD}
        h={bodyH}
        cols={2}
        rows={1}
        fill={DARK_GLASS}
        v0={0.14}
        v1={0.86}
      />
      <IsoWindows
        face="right"
        x={x}
        y={glassY}
        z={z}
        w={w}
        d={glassD}
        h={bodyH}
        cols={3}
        rows={1}
        fill={DARK_GLASS}
        v0={0.14}
        v1={0.86}
      />

      {[0.12, 0.38, 0.64, 0.88].map((t) => (
        <IsoBox
          key={t}
          x={x + w + 0.12}
          y={y + 0.18 + t * (d - 0.52)}
          z={z}
          w={0.18}
          d={0.18}
          h={bodyH}
          {...WHITE}
        />
      ))}

      <IsoSlab x={x + w - 0.02} y={roofY} z={roofZ - 0.04} w={over + 0.04} d={roofD} h={0.06} {...WHITE} />
      <FoldedRoof x={roofX} y={roofY} z={roofZ} w={roofW} d={roofD} rise={0.5} bays={3} />

      <circle cx={sign.x} cy={sign.y} r="8.5" fill="#3F5C8A" />
      <circle cx={sign.x} cy={sign.y + 1.2} r="4.6" fill="#E8C15A" />

      <IsoCone
        x={x + w - 0.05}
        y={y + 0.12}
        z={z}
        w={0.62}
        d={0.62}
        rise={0.52}
        left="#3A5A88"
        right="#4A6A98"
      />
      <IsoCone
        x={x + w + 0.22}
        y={y + 0.55}
        z={z}
        w={0.58}
        d={0.58}
        rise={0.48}
        left="#3A5A88"
        right="#4A6A98"
      />
    </g>
  );
}

function FoldedRoof({
  x,
  y,
  z,
  w,
  d,
  rise,
  bays,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  rise: number;
  bays: number;
}) {
  const bay = d / bays;

  return (
    <g>
      {Array.from({ length: bays }, (_, index) => {
        const y0 = y + index * bay;
        const ym = y0 + bay / 2;
        const y1 = y0 + bay;
        return (
          <g key={index}>
            <polygon
              points={isoPoints([
                [x, y0, z],
                [x + w, y0, z],
                [x + w, ym, z + rise],
                [x, ym, z + rise],
              ])}
              fill={FOLD_A}
            />
            <polygon
              points={isoPoints([
                [x, ym, z + rise],
                [x + w, ym, z + rise],
                [x + w, y1, z],
                [x, y1, z],
              ])}
              fill={FOLD_B}
            />
            <polygon
              points={isoPoints([
                [x + w, y0, z],
                [x + w, ym, z + rise],
                [x + w, ym, z - 0.1],
                [x + w, y0, z - 0.1],
              ])}
              fill={WHITE.right}
            />
            <polygon
              points={isoPoints([
                [x + w, ym, z + rise],
                [x + w, y1, z],
                [x + w, y1, z - 0.1],
                [x + w, ym, z - 0.1],
              ])}
              fill={WHITE.left}
            />
          </g>
        );
      })}
    </g>
  );
}

function LudwigsFountain() {
  return (
    <g data-landmark="ludwigs-fountain">
      <IsoDisc x={FOUNTAIN_X} y={FOUNTAIN_Y} z={MAIN.h} r={0.92} fill={CONCRETE.top} />
      <IsoDisc x={FOUNTAIN_X} y={FOUNTAIN_Y} z={MAIN.h + 0.08} r={0.7} fill={WATER.top} />
    </g>
  );
}

function IsoDisc({
  x,
  y,
  z,
  r,
  fill,
}: {
  x: number;
  y: number;
  z: number;
  r: number;
  fill: string;
}) {
  const center = iso(x, y, z);
  return (
    <ellipse
      cx={center.x}
      cy={center.y}
      rx={r * TILE_W * Math.SQRT2}
      ry={r * TILE_H * Math.SQRT2}
      fill={fill}
    />
  );
}

function Moffitt() {
  const x = HALL_X;
  const y = HALL_Y;
  const w = HALL_W;
  const d = HALL_D;
  const z = MAIN.h;
  const col = 0.2;
  const groundH = 1.22;
  const deckH = 0.14;
  const upperH = 1.82;
  const shaft = groundH + deckH + upperH;
  const roofZ = z + shaft;
  const over = 0.48;
  const roofX = x - over;
  const roofY = y - over;
  const roofW = w + over * 2;
  const roofD = d + over * 2;
  const innerX = x + 0.14;
  const innerY = y + 0.14;
  const innerW = w - 0.28;
  const innerD = d - 0.28;
  const slats = 8;

  return (
    <g data-landmark="mlk" className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={innerX} y={innerY} z={z} w={innerW} d={innerD} h={groundH} {...GLASS} />
      <IsoWindows
        face="left"
        x={innerX}
        y={innerY}
        z={z}
        w={innerW}
        d={innerD}
        h={groundH}
        cols={3}
        rows={1}
        fill={DARK_GLASS}
        v0={0.12}
        v1={0.88}
      />
      <IsoWindows
        face="right"
        x={innerX}
        y={innerY}
        z={z}
        w={innerW}
        d={innerD}
        h={groundH}
        cols={4}
        rows={1}
        fill={DARK_GLASS}
        v0={0.12}
        v1={0.88}
      />

      {colonnade(x, y, w, d, col, 3, 5).map((post) => (
        <IsoBox
          key={`${post.x}:${post.y}`}
          x={post.x}
          y={post.y}
          z={z}
          w={col}
          d={col}
          h={shaft}
          {...COL}
        />
      ))}

      <IsoSlab x={innerX - 0.04} y={innerY - 0.04} z={z + groundH} w={innerW + 0.08} d={innerD + 0.08} h={deckH} {...SLAB} />
      <IsoBox
        x={x + w - 0.08}
        y={y + 0.18}
        z={z + groundH + deckH}
        w={0.05}
        d={d - 0.36}
        h={0.22}
        top="#6A645C"
        left="#4A4640"
        right="#5A564E"
      />

      <IsoBox x={innerX} y={innerY} z={z + groundH + deckH} w={innerW} d={innerD} h={upperH} {...TERRA} />
      <IsoWindows
        face="left"
        x={innerX}
        y={innerY}
        z={z + groundH + deckH}
        w={innerW}
        d={innerD}
        h={upperH}
        cols={3}
        rows={2}
        fill={DARK_GLASS}
        v0={0.1}
        v1={0.9}
      />
      <IsoWindows
        face="right"
        x={innerX}
        y={innerY}
        z={z + groundH + deckH}
        w={innerW}
        d={innerD}
        h={upperH}
        cols={4}
        rows={2}
        fill={DARK_GLASS}
        v0={0.1}
        v1={0.9}
      />

      <IsoSlab x={roofX} y={roofY} z={roofZ} w={roofW} d={roofD} h={0.12} {...SLAB} />
      {Array.from({ length: slats }, (_, index) => {
        const sx = roofX + 0.1 + (index * (roofW - 0.28)) / (slats - 1);
        return (
          <IsoBox
            key={sx}
            x={sx}
            y={roofY}
            z={roofZ + 0.12}
            w={0.08}
            d={roofD}
            h={0.1}
            {...TRELLIS}
          />
        );
      })}

    </g>
  );
}

function colonnade(
  x: number,
  y: number,
  w: number,
  d: number,
  size: number,
  alongW: number,
  alongD: number,
) {
  const xs = Array.from({ length: alongW }, (_, index) => x + (index * (w - size)) / (alongW - 1));
  const ys = Array.from({ length: alongD }, (_, index) => y + (index * (d - size)) / (alongD - 1));
  const posts = new Map<string, { x: number; y: number }>();

  for (const px of xs) {
    posts.set(`${px.toFixed(3)},${y.toFixed(3)}`, { x: px, y });
    posts.set(`${px.toFixed(3)},${(y + d - size).toFixed(3)}`, { x: px, y: y + d - size });
  }
  for (const py of ys) {
    posts.set(`${x.toFixed(3)},${py.toFixed(3)}`, { x, y: py });
    posts.set(`${(x + w - size).toFixed(3)},${py.toFixed(3)}`, { x: x + w - size, y: py });
  }

  return [...posts.values()].toSorted((a, b) => a.x + a.y - (b.x + b.y));
}

function PlaceName({
  x,
  y,
  z = 0,
  size = 12,
  children,
}: {
  x: number;
  y: number;
  z?: number;
  size?: number;
  children: string;
}) {
  const point = iso(x, y, z);

  return (
    <text
      x={point.x}
      y={point.y}
      textAnchor="middle"
      fill="#5C5048"
      stroke="#F4EFE4"
      strokeWidth={3}
      paintOrder="stroke"
      fontFamily="var(--font-display), ui-serif, Georgia, serif"
      fontSize={size}
      fontWeight="500"
      letterSpacing="0.04em"
      style={{ pointerEvents: "none" }}
    >
      {children}
    </text>
  );
}
