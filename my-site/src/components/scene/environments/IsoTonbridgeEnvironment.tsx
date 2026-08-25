"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { eraAt, eraDistance } from "@/lib/timeline";
import type { EnvironmentProps } from "./types";
import { isoPoints } from "./iso/project";
import { TonbridgeSchool, TonbridgeSchoolForecourt } from "./IsoTonbridgeCampus";
import {
  IsoBox,
  IsoCar,
  IsoCone,
  IsoFascia,
  IsoGable,
  IsoLamp,
  IsoPerson,
  IsoSlab,
  IsoTimber,
  IsoTree,
  IsoWindows,
  shade,
} from "./iso/primitives";

const SIXTHFORM_AT = eraAt("sixthform");

const BRICK = { top: "#E8B4A4", left: "#C47A6E", right: "#D49284" };
const STONE = { top: "#EFE4D0", left: "#C8B49A", right: "#D8C8B0" };
const GRASS = { top: "#C5E0A4", left: "#88B078", right: "#9EC48A" };
const ROAD = { top: "#D2CEC8", left: "#B4AFA8", right: "#C2BDB6" };
const WALK = { top: "#F0E8DA", left: "#D4CBBA", right: "#E2D8C8" };
const WATER = { top: "#B4D6D2", left: "#84B4B0", right: "#9CC8C4" };
const CREAM = { top: "#F4EFE4", left: "#D4CBBA", right: "#E4DCCA" };

const SHOPS = [
  { x: 0.0, w: 1.85, stories: 3, fascia: "#7EB89A", gable: true },
  { x: 1.85, w: 1.65, stories: 2, fascia: "#7A9EC8", gable: false },
  { x: 3.5, w: 2.05, stories: 3, fascia: "#6FB8B0", gable: true },
  { x: 5.55, w: 1.7, stories: 2, fascia: "#E8A0B0", gable: false },
  { x: 7.25, w: 1.9, stories: 3, fascia: "#E08A7A", gable: true },
  { x: 9.15, w: 1.75, stories: 2, fascia: "#5A6E8A", gable: false },
] as const;

const SOUTH_SHOPS = [
  { x: 0.0, w: 1.7, stories: 2, fascia: "#C4A07A", gable: false },
  { x: 1.7, w: 1.9, stories: 3, fascia: "#7A9EC8", gable: true },
  { x: 3.6, w: 1.75, stories: 2, fascia: "#E8A0B0", gable: false },
  { x: 5.35, w: 2.0, stories: 3, fascia: "#7EB89A", gable: true },
  { x: 7.35, w: 1.65, stories: 2, fascia: "#6FB8B0", gable: false },
  { x: 9.0, w: 1.7, stories: 3, fascia: "#E08A7A", gable: true },
] as const;

const BACK_BLOCKS = [
  { x: 0.0, w: 2.05, h: 3.5, top: "#E7C4A8", left: "#C49278", right: "#D4A88C" },
  { x: 2.15, w: 1.9, h: 2.7, top: "#E8D48A", left: "#C4B068", right: "#D4C278" },
  { x: 4.15, w: 1.7, h: 4.1, top: "#A8C4E0", left: "#7A98B8", right: "#8CAAC8" },
  { x: 5.95, w: 2.05, h: 3.15, top: "#E8B8C8", left: "#C4889A", right: "#D4A0B0" },
  { x: 8.1, w: 2.05, h: 2.45, top: "#B8DCC8", left: "#88B8A0", right: "#A0C8B0" },
] as const;

export function IsoTonbridgeEnvironment({ progress }: EnvironmentProps) {
  const reduceMotion = useReducedMotion();
  const drift = useTransform(progress, (value) =>
    reduceMotion ? 0 : eraDistance(value, SIXTHFORM_AT) * -14,
  );

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <rect width="1440" height="900" fill="#F4EFE4" />
      <ellipse cx="720" cy="168" rx="280" ry="36" fill="#E8E0D2" opacity="0.7" />
      <ellipse cx="980" cy="132" rx="220" ry="28" fill="#EDE6D8" opacity="0.8" />

      <motion.g style={{ x: reduceMotion ? 0 : drift }}>
        <Ground />
        <RiverUnderBridge />
        <BridgePiers />
        <BackBlocks />
        <HighStreet />
        <CastlePark reduceMotion={Boolean(reduceMotion)} />
        <EastBackBlocks />
        <EastHighStreet />
        <MidHighStreet />
        <TonbridgeSchool reduceMotion={Boolean(reduceMotion)} />
        <NorthPavement reduceMotion={Boolean(reduceMotion)} />
        <RoadAndBridge />
        <Traffic reduceMotion={Boolean(reduceMotion)} />
        <SouthPavement reduceMotion={Boolean(reduceMotion)} />
        <SouthHighStreet />
        <SouthBank reduceMotion={Boolean(reduceMotion)} />
        <EastSouthStreet reduceMotion={Boolean(reduceMotion)} />
        <MidSouthStreet />
        <TonbridgeSchoolForecourt reduceMotion={Boolean(reduceMotion)} />
      </motion.g>
    </svg>
  );
}

function Ground() {
  return (
    <g data-layer="ground">
      <IsoSlab x={-0.15} y={-0.15} w={11.15} d={1.7} {...WALK} />
      <IsoSlab x={-0.15} y={4.35} w={11.15} d={0.65} {...WALK} />
      <IsoSlab x={-0.15} y={6.85} w={10.8} d={2.85} {...WALK} />
      <IsoSlab x={10.6} y={-0.2} w={6.1} d={5.15} {...GRASS} />
      <IsoSlab x={16.65} y={-0.15} w={13.95} d={1.85} {...WALK} />
      <IsoSlab x={16.65} y={4.35} w={13.95} d={0.65} {...WALK} />
      <IsoSlab x={16.65} y={6.85} w={13.95} d={2.85} {...WALK} />
      <IsoSlab x={30.55} y={4.35} w={43.6} d={0.65} {...WALK} />
      <IsoSlab x={30.55} y={6.85} w={43.6} d={0.7} {...WALK} />
    </g>
  );
}

function RiverUnderBridge() {
  return (
    <g data-layer="river-under">
      <IsoSlab x={10.85} y={4.9} w={5.85} d={2.05} h={0.12} {...WATER} />
    </g>
  );
}

function BridgePiers() {
  return (
    <g data-landmark="bridge-piers">
      {[11.7, 13.15, 14.6, 15.95].map((x) => (
        <IsoBox key={x} x={x} y={6.15} z={-0.55} w={0.28} d={0.28} h={0.72} {...CREAM} />
      ))}
    </g>
  );
}

function RoadAndBridge() {
  const marks = Array.from({ length: 54 }, (_, index) => -0.1 + index * 1.18);

  return (
    <g data-landmark="high-street-road">
      <IsoSlab x={-0.35} y={5.0} w={74.3} d={1.85} h={0.2} {...ROAD} />
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
      <BridgeRails />
    </g>
  );
}

function BridgeRails() {
  const posts = Array.from({ length: 8 }, (_, index) => 11.25 + index * 0.62);

  return (
    <g data-landmark="medway-bridge">
      <IsoBox x={10.9} y={5.02} z={0.2} w={5.7} d={0.08} h={0.08} {...CREAM} />
      <IsoBox x={10.9} y={6.72} z={0.2} w={5.7} d={0.08} h={0.08} {...CREAM} />
      {posts.map((x) => (
        <g key={x}>
          <IsoBox x={x} y={5.02} z={0.28} w={0.08} d={0.08} h={0.38} {...CREAM} />
          <IsoBox x={x} y={6.72} z={0.28} w={0.08} d={0.08} h={0.38} {...CREAM} />
        </g>
      ))}
    </g>
  );
}

function CastlePark({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-landmark="castle-park">
      <IsoBox x={12.15} y={0.55} z={0.16} w={3.15} d={1.55} h={1.7} {...STONE} />
      <IsoWindows face="left" x={12.15} y={0.55} z={0.16} w={3.15} d={1.55} h={1.7} cols={3} rows={1} fill="#EFE6D8" />
      <IsoBox x={12.05} y={0.35} z={0.16} w={1.2} d={1.2} h={3.15} {...STONE} />
      <IsoBox x={14.2} y={0.4} z={0.16} w={1.2} d={1.2} h={2.95} {...STONE} />
      <IsoWindows face="right" x={12.05} y={0.35} z={0.16} w={1.2} d={1.2} h={3.15} cols={1} rows={2} fill="#EFE6D8" />
      <IsoWindows face="left" x={14.2} y={0.4} z={0.16} w={1.2} d={1.2} h={2.95} cols={1} rows={2} fill="#EFE6D8" />
      <polygon
        points={isoPoints([
          [13.15, 2.1, 0.7],
          [14.2, 2.1, 0.7],
          [14.2, 2.1, 0.16],
          [13.15, 2.1, 0.16],
        ])}
        fill="#5C5048"
      />
      <IsoBox x={12.5} y={0.48} z={3.31} w={0.08} d={0.08} h={0.7} top="#8A8070" left="#6A6458" right="#7A7468" />
      <g className={reduceMotion ? undefined : "iso-sway"} style={{ animationDelay: "0.4s" }}>
        <IsoBox x={12.5} y={0.42} z={3.95} w={0.42} d={0.08} h={0.16} top="#C45C5C" left="#A84848" right="#B45454" />
        <IsoBox x={12.5} y={0.42} z={3.79} w={0.42} d={0.08} h={0.16} top="#E8C15A" left="#C4A048" right="#D4B050" />
      </g>
      <IsoTree x={11.35} y={2.4} canopy="#8FCB8A" delay="0s" reduceMotion={reduceMotion} />
      <IsoTree x={15.55} y={2.15} canopy="#7EBE7A" delay="0.6s" reduceMotion={reduceMotion} />
      <IsoTree x={11.9} y={3.7} canopy="#A4D49A" delay="1.1s" reduceMotion={reduceMotion} />
    </g>
  );
}

function BackBlocks() {
  return (
    <g data-layer="back-street">
      {BACK_BLOCKS.map((block) => (
        <g key={block.x} className="iso-hover" style={{ pointerEvents: "auto" }}>
          <IsoBox x={block.x} y={0.05} z={0.16} w={block.w} d={1.45} h={block.h} top={block.top} left={block.left} right={block.right} />
          <IsoWindows
            face="left"
            x={block.x}
            y={0.05}
            z={0.16}
            w={block.w}
            d={1.45}
            h={block.h}
            cols={2}
            rows={Math.max(2, Math.round(block.h))}
            v1={0.86}
          />
          <IsoWindows
            face="right"
            x={block.x}
            y={0.05}
            z={0.16}
            w={block.w}
            d={1.45}
            h={block.h}
            cols={1}
            rows={Math.max(2, Math.round(block.h) - 1)}
            v1={0.86}
          />
          <IsoBox
            x={block.x + block.w * 0.35}
            y={0.45}
            z={0.16 + block.h}
            w={0.38}
            d={0.28}
            h={0.22}
            top="#D8D2C8"
            left="#B8B2A8"
            right="#C8C2B8"
          />
        </g>
      ))}
    </g>
  );
}

function HighStreet() {
  return (
    <g data-landmark="high-street">
      {SHOPS.map((shop) => (
        <BrickShop key={shop.x} y={1.7} d={2.55} {...shop} />
      ))}
    </g>
  );
}

function SouthHighStreet() {
  return (
    <g data-landmark="high-street-south">
      {SOUTH_SHOPS.map((shop) => (
        <BrickShop key={shop.x} y={7.45} d={2.2} {...shop} />
      ))}
    </g>
  );
}

function BrickShop({
  x,
  y,
  w,
  d,
  stories,
  fascia,
  gable,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  stories: number;
  fascia: string;
  gable: boolean;
}) {
  const h = 0.85 + stories * 0.82;
  const z = 0.16;

  return (
    <g className="iso-hover" style={{ pointerEvents: "auto" }}>
      <IsoBox x={x} y={y} z={z} w={w} d={d} h={h} {...BRICK} />
      <IsoWindows face="left" x={x} y={y} z={z} w={w} d={d} h={h} cols={3} rows={stories} fill="#F3EEE4" />
      <IsoWindows face="right" x={x} y={y} z={z} w={w} d={d} h={h} cols={1} rows={stories} fill="#F3EEE4" />
      <IsoFascia x={x} y={y} z={z} w={w} d={d} h={h} fill={fascia} />
      {gable ? (
        <IsoGable x={x} y={y} z={z + h} w={w} d={d} rise={0.55} left={shade(BRICK.left, -12)} right={shade(BRICK.right, -8)} />
      ) : (
        <IsoBox
          x={x + w * 0.38}
          y={y + 0.4}
          z={z + h}
          w={0.22}
          d={0.22}
          h={0.42}
          top={shade(BRICK.top, -16)}
          left={shade(BRICK.left, -10)}
          right={shade(BRICK.right, -10)}
        />
      )}
    </g>
  );
}

function EastHighStreet() {
  const y = 1.7;
  const d = 2.55;
  const z = 0.16;

  return (
    <g data-landmark="east-town">
      <g className="iso-hover" style={{ pointerEvents: "auto" }}>
        <IsoBox x={16.85} y={y} z={z} w={1.85} d={d} h={3.15} {...CREAM} />
        <IsoTimber x={16.85} y={y} z={z} w={1.85} d={d} h={3.15} />
        <IsoWindows face="left" x={16.85} y={y} z={z} w={1.85} d={d} h={3.15} cols={2} rows={3} fill="#F7F3EA" />
        <IsoFascia x={16.85} y={y} z={z} w={1.85} d={d} h={3.15} fill="#5C5048" />
        <IsoGable
          x={16.85}
          y={y}
          z={z + 3.15}
          w={1.85}
          d={d}
          rise={0.48}
          left={shade(CREAM.left, -10)}
          right={shade(CREAM.right, -6)}
        />
      </g>

      <g className="iso-hover" style={{ pointerEvents: "auto" }}>
        <IsoBox x={18.7} y={y} z={z} w={2.1} d={d} h={3.35} {...BRICK} />
        <IsoWindows face="left" x={18.7} y={y} z={z} w={2.1} d={d} h={3.35} cols={3} rows={3} fill="#F3EEE4" />
        <IsoWindows face="right" x={18.7} y={y} z={z} w={2.1} d={d} h={3.35} cols={1} rows={3} fill="#F3EEE4" />
        <IsoFascia x={18.7} y={y} z={z} w={2.1} d={d} h={3.35} fill="#6FB8B0" />
        <IsoBox
          x={19.3}
          y={y + d - 0.12}
          z={z + 1.15}
          w={0.85}
          d={0.42}
          h={1.15}
          top="#F4EFE4"
          left="#D8D0C4"
          right="#E8E2D6"
        />
        <IsoWindows
          face="left"
          x={19.3}
          y={y + d - 0.12}
          z={z + 1.15}
          w={0.85}
          d={0.42}
          h={1.15}
          cols={2}
          rows={1}
          v0={0.18}
          v1={0.78}
          fill="#F7F3EA"
        />
        <IsoGable
          x={18.7}
          y={y}
          z={z + 3.35}
          w={2.1}
          d={d}
          rise={0.62}
          left={shade(BRICK.left, -12)}
          right={shade(BRICK.right, -8)}
        />
      </g>

      <g className="iso-hover" style={{ pointerEvents: "auto" }}>
        <IsoBox x={20.8} y={y} z={z} w={1.95} d={d} h={3.05} {...BRICK} />
        <IsoWindows face="left" x={20.8} y={y} z={z} w={1.95} d={d} h={3.05} cols={3} rows={3} fill="#F3EEE4" />
        <IsoWindows face="right" x={20.8} y={y} z={z} w={1.95} d={d} h={3.05} cols={1} rows={2} fill="#F3EEE4" />
        <IsoFascia x={20.8} y={y} z={z} w={1.95} d={d} h={3.05} fill="#3A322C" />
        <IsoBox
          x={21.55}
          y={y + d - 0.18}
          z={z}
          w={0.72}
          d={0.72}
          h={3.55}
          top="#4A4038"
          left="#2E2824"
          right="#3A322C"
        />
        <IsoWindows
          face="left"
          x={21.55}
          y={y + d - 0.18}
          z={z + 1.2}
          w={0.72}
          d={0.72}
          h={1.6}
          cols={1}
          rows={2}
          fill="#F4F0E8"
        />
        <IsoCone
          x={21.5}
          y={y + d - 0.22}
          z={z + 3.55}
          w={0.82}
          d={0.82}
          rise={0.7}
          left="#3A322C"
          right="#5C5048"
        />
      </g>
    </g>
  );
}

function EastSouthStreet({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-landmark="east-town-south">
      <BrickShop x={16.85} y={7.45} w={1.8} d={2.2} stories={3} fascia="#7A9EC8" gable />
      <g className="iso-hover" style={{ pointerEvents: "auto" }}>
        <IsoBox x={18.65} y={7.45} z={0.16} w={2.05} d={2.2} h={3.2} {...CREAM} />
        <IsoWindows face="left" x={18.65} y={7.45} z={0.16} w={2.05} d={2.2} h={3.2} cols={3} rows={3} fill="#3A322C" />
        <IsoWindows face="right" x={18.65} y={7.45} z={0.16} w={2.05} d={2.2} h={3.2} cols={1} rows={2} fill="#3A322C" />
        <IsoFascia x={18.65} y={7.45} z={0.16} w={2.05} d={2.2} h={3.2} fill="#6A9EC8" />
        <IsoBox
          x={18.65}
          y={7.45}
          z={3.36}
          w={2.05}
          d={2.2}
          h={0.12}
          top="#F7F3EA"
          left="#D8D0C4"
          right="#E8E2D6"
        />
      </g>
      <BrickShop x={20.7} y={7.45} w={1.9} d={2.2} stories={2} fascia="#E08A7A" gable={false} />
      <BrickShop x={22.7} y={7.45} w={1.85} d={2.2} stories={3} fascia="#C4A07A" gable />
      <IsoLamp x={17.4} y={7.05} />
      <IsoLamp x={20.15} y={7.05} />
      <IsoPerson x={19.1} y={7.15} fill="#5C5048" reduceMotion={reduceMotion} delay="0.6s" />
    </g>
  );
}

function EastBackBlocks() {
  const blocks = [
    { x: 16.9, w: 2.0, h: 3.2, top: "#E7C4A8", left: "#C49278", right: "#D4A88C" },
    { x: 19.1, w: 1.85, h: 2.55, top: "#B8DCC8", left: "#88B8A0", right: "#A0C8B0" },
    { x: 22.9, w: 2.1, h: 3.7, top: "#A8C4E0", left: "#7A98B8", right: "#8CAAC8" },
    { x: 25.2, w: 1.9, h: 2.85, top: "#E8D48A", left: "#C4B068", right: "#D4C278" },
    { x: 27.3, w: 2.05, h: 3.35, top: "#E8B8C8", left: "#C4889A", right: "#D4A0B0" },
  ] as const;

  return (
    <g data-layer="east-back-street">
      {blocks.map((block) => (
        <g key={block.x} className="iso-hover" style={{ pointerEvents: "auto" }}>
          <IsoBox x={block.x} y={0.05} z={0.16} w={block.w} d={1.45} h={block.h} top={block.top} left={block.left} right={block.right} />
          <IsoWindows face="left" x={block.x} y={0.05} z={0.16} w={block.w} d={1.45} h={block.h} cols={2} rows={Math.max(2, Math.round(block.h))} v1={0.86} />
          <IsoWindows face="right" x={block.x} y={0.05} z={0.16} w={block.w} d={1.45} h={block.h} cols={1} rows={Math.max(2, Math.round(block.h) - 1)} v1={0.86} />
        </g>
      ))}
    </g>
  );
}

function MidHighStreet() {
  const y = 1.7;
  const d = 2.55;
  const z = 0.16;

  return (
    <g data-landmark="mid-town">
      <g className="iso-hover" style={{ pointerEvents: "auto" }}>
        <IsoBox x={22.75} y={y} z={z} w={1.95} d={d} h={3.2} {...CREAM} />
        <IsoWindows face="left" x={22.75} y={y} z={z} w={1.95} d={d} h={3.2} cols={3} rows={3} fill="#F3EEE4" />
        <IsoWindows face="right" x={22.75} y={y} z={z} w={1.95} d={d} h={3.2} cols={1} rows={2} fill="#F3EEE4" />
        <IsoFascia x={22.75} y={y} z={z} w={1.95} d={d} h={3.2} fill="#7A9EC8" />
        <IsoGable
          x={22.75}
          y={y}
          z={z + 3.2}
          w={1.95}
          d={d}
          rise={0.5}
          left={shade(CREAM.left, -10)}
          right={shade(CREAM.right, -6)}
        />
      </g>
      <BrickShop x={24.7} y={y} w={2.15} d={d} stories={3} fascia="#E8A0B0" gable />
      <BrickShop x={26.85} y={y} w={1.8} d={d} stories={2} fascia="#7EB89A" gable={false} />
      <BrickShop x={28.65} y={y} w={1.95} d={d} stories={3} fascia="#5A6E8A" gable />
    </g>
  );
}

function MidSouthStreet() {
  return (
    <g data-landmark="mid-town-south">
      <BrickShop x={24.55} y={7.45} w={1.9} d={2.2} stories={2} fascia="#6FB8B0" gable={false} />
      <BrickShop x={26.45} y={7.45} w={2.05} d={2.2} stories={3} fascia="#E8A0B0" gable />
      <BrickShop x={28.5} y={7.45} w={1.85} d={2.2} stories={2} fascia="#7A9EC8" gable={false} />
    </g>
  );
}

function NorthPavement({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="pavement-life">
      <IsoLamp x={0.6} y={4.55} />
      <IsoLamp x={3.55} y={4.55} />
      <IsoLamp x={6.65} y={4.55} />
      <IsoLamp x={9.55} y={4.55} />
      <IsoLamp x={17.5} y={4.55} />
      <IsoLamp x={20.4} y={4.55} />
      <IsoLamp x={23.7} y={4.55} />
      <IsoLamp x={27.1} y={4.55} />
      <IsoBox x={1.0} y={4.58} z={0.16} w={0.22} d={0.18} h={0.42} top="#E07A7A" left="#C45C5C" right="#D46A6A" />
      <IsoCar x={1.8} y={4.48} color="#F0E6D8" />
      <IsoCar x={4.6} y={4.48} color="#5C5048" />
      <IsoCar x={7.85} y={4.48} color="#8AA8B8" />
      <IsoPerson x={1.35} y={4.62} fill="#5C5048" reduceMotion={reduceMotion} delay="0s" />
      <IsoPerson x={4.0} y={4.7} fill="#3F5C8A" reduceMotion={reduceMotion} delay="0.4s" />
      <IsoPerson x={7.15} y={4.64} fill="#6B5340" reduceMotion={reduceMotion} delay="0.8s" />
      <IsoPerson x={9.9} y={4.68} fill="#C45C5C" reduceMotion={reduceMotion} delay="1.2s" />
    </g>
  );
}

function SouthPavement({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="south-pavement">
      <IsoLamp x={1.2} y={7.05} />
      <IsoLamp x={5.1} y={7.05} />
      <IsoLamp x={8.6} y={7.05} />
      <IsoCar x={3.1} y={6.95} color="#E8C4A8" />
      <IsoPerson x={2.2} y={7.12} fill="#3F5C8A" reduceMotion={reduceMotion} delay="0.2s" />
      <IsoPerson x={6.4} y={7.18} fill="#6B5340" reduceMotion={reduceMotion} delay="0.9s" />
    </g>
  );
}

function Traffic({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="traffic">
      <g className={reduceMotion ? undefined : "iso-drive-se"}>
        <IsoCar x={0.35} y={5.28} color="#2A2A2A" />
      </g>
      <g className={reduceMotion ? undefined : "iso-drive-se-slow"}>
        <IsoCar x={2.4} y={5.28} color="#E08A7A" />
      </g>
      <g className={reduceMotion ? undefined : "iso-drive-nw"}>
        <IsoCar x={14.2} y={6.05} color="#7A9EC8" />
      </g>
      <g className={reduceMotion ? undefined : "iso-drive-nw-slow"}>
        <IsoBus x={11.4} y={5.95} />
      </g>
    </g>
  );
}

function IsoBus({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <IsoBox x={x} y={y} z={0.2} w={1.25} d={0.5} h={0.42} top="#7AA8C8" left="#5A88A8" right="#6A98B8" />
      <IsoWindows face="left" x={x} y={y} z={0.2} w={1.25} d={0.5} h={0.42} cols={4} rows={1} v0={0.18} v1={0.62} />
    </g>
  );
}

function SouthBank({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="river-front">
      <IsoSlab x={10.85} y={6.85} w={5.85} d={2.15} h={0.14} {...WATER} />
      <IsoSlab x={12.4} y={8.7} w={3.6} d={0.65} h={0.18} {...GRASS} />
      <Boat x={12.4} y={7.45} />
      <Boat x={13.9} y={7.95} />
      <Boat x={15.2} y={7.55} />
      <IsoTree x={12.15} y={3.55} canopy="#8FCB8A" delay="0.3s" reduceMotion={reduceMotion} />
    </g>
  );
}

function Boat({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <IsoBox x={x} y={y} z={0.14} w={0.7} d={0.28} h={0.12} top="#F4EFE4" left="#D4CBBA" right="#E4DCCA" />
      <IsoBox x={x + 0.18} y={y + 0.04} z={0.26} w={0.28} d={0.2} h={0.16} top="#E07A7A" left="#C45C5C" right="#D46A6A" />
    </g>
  );
}
