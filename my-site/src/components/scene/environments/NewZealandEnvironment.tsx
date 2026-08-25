"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { eraAt, eraDistance } from "@/lib/timeline";
import type { EnvironmentProps } from "./types";

const BIRTH_AT = eraAt("birth");

export function NewZealandEnvironment({ progress }: EnvironmentProps) {
  const reduceMotion = useReducedMotion();
  const hillsY = useTransform(progress, (value) => eraDistance(value, BIRTH_AT) * 14);
  const flockX = useTransform(progress, (value) => eraDistance(value, BIRTH_AT) * -28);

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <g data-layer="background">
        <rect width="1440" height="900" fill="#E3EBE0" />
        <rect width="1440" height="420" fill="#D5E4D6" />
        <circle cx="1180" cy="148" r="44" fill="#F0D37A" />
      </g>

      <motion.g
        data-layer="landscape"
        style={{ y: reduceMotion ? 0 : hillsY }}
      >
        <path
          d="M-40 430 L 120 300 L 240 390 L 400 250 L 560 360 L 720 220 L 900 340 L 1080 260 L 1240 350 L 1480 280 L 1480 520 L -40 520 Z"
          fill="#C5D0C4"
        />
        <path
          d="M-40 500 C 140 450 260 530 430 490 C 620 446 760 530 960 492 C 1140 458 1280 520 1480 486 L 1480 900 L -40 900 Z"
          fill="#C3D6A4"
        />
        <path
          d="M-40 590 C 180 548 340 620 560 582 C 780 544 980 618 1480 574 L 1480 900 L -40 900 Z"
          fill="#A8C484"
        />
        <path
          d="M-40 700 C 220 668 420 740 680 708 C 940 676 1180 742 1480 710 L 1480 900 L -40 900 Z"
          fill="#8FB56C"
        />
      </motion.g>

      <motion.g data-layer="props" style={{ x: reduceMotion ? 0 : flockX }}>
        <Sheep x={210} y={528} scale={0.62} />
        <Sheep x={310} y={548} scale={0.5} flip />
        <Sheep x={980} y={512} scale={0.58} />
        <Sheep x={160} y={632} scale={0.86} flip />
        <Sheep x={430} y={618} scale={1} />
        <Sheep x={620} y={646} scale={0.78} flip />
        <Sheep x={860} y={608} scale={0.92} />
        <Sheep x={1120} y={638} scale={0.84} flip />
        <Sheep x={1280} y={600} scale={0.7} />
        <Sheep x={340} y={742} scale={1.12} />
        <Sheep x={540} y={768} scale={0.72} flip />
        <Sheep x={780} y={734} scale={1.05} />
        <Sheep x={1040} y={756} scale={0.9} flip />
        <Lamb x={470} y={780} />
      </motion.g>

      <g data-layer="landscape-grass">
        <GrassTuft x={80} y={820} />
        <GrassTuft x={150} y={846} />
        <GrassTuft x={260} y={830} />
        <GrassTuft x={900} y={838} />
        <GrassTuft x={1180} y={822} />
        <GrassTuft x={1320} y={850} />
      </g>
    </svg>
  );
}

function Sheep({
  x,
  y,
  scale = 1,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
}) {
  return (
    <g
      data-landmark="sheep"
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
    >
      <rect x="-10" y="10" width="4" height="12" rx="1.5" fill="#3A322C" />
      <rect x="-1" y="10" width="4" height="12" rx="1.5" fill="#3A322C" />
      <rect x="8" y="10" width="4" height="11" rx="1.5" fill="#3A322C" />
      <rect x="16" y="10" width="4" height="11" rx="1.5" fill="#3A322C" />
      <ellipse cx="2" cy="0" rx="22" ry="14" fill="#F7F4EE" />
      <ellipse cx="-12" cy="-4" rx="10" ry="9" fill="#F2EEE6" />
      <ellipse cx="12" cy="-5" rx="11" ry="9" fill="#F7F4EE" />
      <ellipse cx="-18" cy="4" rx="8" ry="7" fill="#EFEBE3" />
      <ellipse cx="24" cy="3" rx="8" ry="7" fill="#3A322C" />
      <ellipse cx="28" cy="-2" rx="3.5" ry="4.5" fill="#3A322C" />
      <circle cx="27" cy="2" r="1.4" fill="#F7F4EE" />
    </g>
  );
}

function Lamb({ x, y }: { x: number; y: number }) {
  return (
    <g data-landmark="lamb" transform={`translate(${x} ${y}) scale(0.58)`}>
      <rect x="-8" y="8" width="3.5" height="10" rx="1.5" fill="#3A322C" />
      <rect x="2" y="8" width="3.5" height="10" rx="1.5" fill="#3A322C" />
      <rect x="10" y="8" width="3.5" height="9" rx="1.5" fill="#3A322C" />
      <ellipse cx="2" cy="0" rx="16" ry="11" fill="#F7F4EE" />
      <ellipse cx="16" cy="3" rx="6.5" ry="5.5" fill="#3A322C" />
      <circle cx="18.5" cy="2" r="1.2" fill="#F7F4EE" />
    </g>
  );
}

function GrassTuft({ x, y }: { x: number; y: number }) {
  return (
    <g
      data-landmark="grass"
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke="#6F9A52"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M0 16 Q -6 2 -10 0" />
      <path d="M0 16 Q 0 2 2 -4" />
      <path d="M0 16 Q 7 4 12 2" />
    </g>
  );
}
