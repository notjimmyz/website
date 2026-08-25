"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { eraAt, eraDistance } from "@/lib/timeline";
import type { EnvironmentProps } from "./types";

const NOW_AT = eraAt("now");

export function SanFranciscoEnvironment({ progress }: EnvironmentProps) {
  const reduceMotion = useReducedMotion();
  const farX = useTransform(progress, (value) => eraDistance(value, NOW_AT) * -16);
  const midX = useTransform(progress, (value) => eraDistance(value, NOW_AT) * -34);
  const nearX = useTransform(progress, (value) => eraDistance(value, NOW_AT) * -56);
  const fogOpacity = useTransform(
    progress,
    (value) => 0.06 + eraDistance(value, NOW_AT) * 0.72,
  );

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <g data-layer="background">
        <rect width="1440" height="900" fill="#E7EDE4" />
        <rect width="1440" height="460" fill="#D7E6E3" />
        <circle cx="1168" cy="132" r="46" fill="#F0D37A" />
        <ellipse cx="210" cy="108" rx="64" ry="22" fill="#F4F1EA" />
        <ellipse cx="258" cy="118" rx="44" ry="16" fill="#F7F4EE" />
        <ellipse cx="900" cy="86" rx="70" ry="20" fill="#F4F1EA" />
        <g transform="translate(312 168)" fill="none" stroke="#F7F4EE" strokeWidth="2.5" strokeLinecap="round">
          <path d="M0 8 C 6 2 12 2 18 8" />
          <path d="M8 8 L 4 0" />
          <path d="M8 8 L 14 1" />
        </g>
      </g>

      <motion.g data-layer="landscape" style={{ x: reduceMotion ? 0 : farX }}>
        <path
          d="M-40 500 C 70 430 150 470 250 438 C 340 412 410 468 520 448 C 620 430 700 480 820 458 L 820 720 L -40 720 Z"
          fill="#C3D6A8"
        />
        <GoldenGate />
        <path
          d="M-20 560 C 90 500 170 548 280 522 C 400 494 500 560 640 534 C 760 512 860 570 1000 548 C 1120 530 1240 572 1480 540 L 1480 780 L -20 780 Z"
          fill="#A9C489"
        />
        <SutroTower />
        <path
          d="M720 520 C 820 478 900 510 980 492 C 1070 472 1140 520 1240 500 C 1330 482 1400 518 1500 498 L 1500 700 L 720 700 Z"
          fill="#B7CFA0"
        />
      </motion.g>

      <motion.g data-layer="buildings" style={{ x: reduceMotion ? 0 : midX }}>
        <CoitTower />
        <PalaceOfFineArts />
        <PaintedLadies />
        <Downtown />
        <FerryBuilding />
      </motion.g>

      <g data-layer="landscape-water">
        <path
          d="M0 708 C 180 688 320 728 520 710 C 740 690 960 734 1440 708 L 1440 900 L 0 900 Z"
          fill="#8FBFC0"
        />
        <path
          d="M0 778 C 240 758 480 798 760 776 C 1040 754 1240 792 1440 774 L 1440 900 L 0 900 Z"
          fill="#7BAFB2"
        />
      </g>

      <motion.g data-layer="props" style={{ x: reduceMotion ? 0 : nearX }}>
        <Sailboat />
        <CableCar />
        <ChinatownGate />
      </motion.g>

      <g data-layer="characters">
        <g transform="translate(640 656)">
          <circle cx="9" cy="6" r="5.5" fill="#3A322C" />
          <rect x="4" y="13" width="10" height="15" rx="3" fill="#6F5E52" />
        </g>
      </g>

      <motion.g data-layer="fog" style={{ opacity: fogOpacity }}>
        <ellipse cx="360" cy="560" rx="320" ry="72" fill="#F4F0E6" />
        <ellipse cx="860" cy="610" rx="400" ry="90" fill="#EEF3EE" />
        <rect y="500" width="1440" height="240" fill="#E7EDE4" opacity="0.4" />
      </motion.g>
    </svg>
  );
}

function GoldenGate() {
  return (
    <g data-landmark="golden-gate" transform="translate(128 392)">
      <rect x="86" y="0" width="14" height="168" fill="#D06A4F" />
      <rect x="250" y="16" width="14" height="152" fill="#D06A4F" />
      <rect x="78" y="28" width="30" height="8" fill="#C45F46" />
      <rect x="242" y="42" width="30" height="8" fill="#C45F46" />
      <rect x="78" y="70" width="30" height="7" fill="#C45F46" />
      <rect x="242" y="82" width="30" height="7" fill="#C45F46" />
      <path
        d="M0 92 Q 93 10 93 10 Q 176 108 257 34 Q 340 98 410 86"
        fill="none"
        stroke="#D06A4F"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M86 92 L 86 168 L 12 168" fill="none" stroke="#D06A4F" strokeWidth="3" />
      <path d="M257 92 L 257 168 L 330 168" fill="none" stroke="#D06A4F" strokeWidth="3" />
      <rect x="0" y="166" width="410" height="7" fill="#C45F46" />
    </g>
  );
}

function CoitTower() {
  return (
    <g data-landmark="coit-tower" transform="translate(72 408)">
      <rect x="18" y="36" width="28" height="96" fill="#E7D3A4" />
      <rect x="12" y="22" width="40" height="18" fill="#DCC898" />
      <rect x="24" y="8" width="16" height="16" fill="#E7D3A4" />
      <rect x="28" y="0" width="8" height="10" fill="#D4C090" />
      <rect x="8" y="118" width="14" height="18" fill="#E8C97A" />
      <rect x="36" y="124" width="12" height="14" fill="#D4897A" />
      <rect x="50" y="128" width="10" height="12" fill="#8BA4C8" />
    </g>
  );
}

function PalaceOfFineArts() {
  return (
    <g data-landmark="palace-of-fine-arts" transform="translate(368 548)">
      <path d="M18 38 A 37 28 0 0 1 92 38 L 92 48 L 18 48 Z" fill="#D4896A" />
      <circle cx="55" cy="34" r="16" fill="#E0A07E" />
      <rect x="24" y="48" width="8" height="44" fill="#F3EEE4" />
      <rect x="42" y="48" width="8" height="44" fill="#F3EEE4" />
      <rect x="60" y="48" width="8" height="44" fill="#F3EEE4" />
      <rect x="78" y="48" width="8" height="44" fill="#F3EEE4" />
      <rect x="16" y="90" width="78" height="10" fill="#E6D5C2" />
    </g>
  );
}

function PaintedLadies() {
  return (
    <g data-landmark="painted-ladies" transform="translate(508 528)">
      <Victorian x={0} y={18} width={44} body="#E8C97A" roof="#C4A265" />
      <Victorian x={36} y={6} width={46} body="#D4897A" roof="#B86B4E" />
      <Victorian x={74} y={14} width={42} body="#8BA4C8" roof="#5E7394" />
    </g>
  );
}

function Victorian({
  x,
  y,
  width,
  body,
  roof,
}: {
  x: number;
  y: number;
  width: number;
  body: string;
  roof: string;
}) {
  const mid = width / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={`${mid},0 ${width},26 0,26`} fill={roof} />
      <rect y="24" width={width} height="52" fill={body} />
      <rect x={mid - 6} y="48" width="12" height="28" fill="#F7F1E6" />
      <rect x="8" y="36" width="8" height="10" fill="#F7F1E6" />
      <rect x={width - 16} y="36" width="8" height="10" fill="#F7F1E6" />
    </g>
  );
}

function Downtown() {
  return (
    <g data-landmark="downtown" transform="translate(860 268)">
      <rect x="118" y="168" width="36" height="250" fill="#9BB8C6" />
      <rect x="160" y="210" width="44" height="208" fill="#C9D6DB" />
      <polygon points="74,0 100,418 48,418" fill="#EDE6DA" />
      <path d="M190 418 L190 96 Q 224 36 258 96 L258 418 Z" fill="#7FA4B6" />
      <rect x="264" y="188" width="30" height="230" fill="#D5C6B4" />
    </g>
  );
}

function FerryBuilding() {
  return (
    <g data-landmark="ferry-building" transform="translate(628 568)">
      <rect x="0" y="92" width="248" height="40" fill="#F3EEE4" />
      <rect x="8" y="100" width="14" height="18" fill="#E7DCC8" />
      <rect x="32" y="100" width="14" height="18" fill="#E7DCC8" />
      <rect x="200" y="100" width="14" height="18" fill="#E7DCC8" />
      <rect x="224" y="100" width="14" height="18" fill="#E7DCC8" />
      <rect x="108" y="8" width="32" height="96" fill="#EFE8DC" />
      <polygon points="124,0 140,12 108,12" fill="#DCCDB8" />
      <circle cx="124" cy="40" r="8" fill="#F7F1E6" />
      <rect x="118" y="104" width="12" height="28" fill="#DCCDB8" />
    </g>
  );
}

function SutroTower() {
  return (
    <g data-landmark="sutro-tower" transform="translate(1184 368)" fill="none" strokeLinecap="round">
      <path d="M8 108 L 28 0 L 48 108" stroke="#D4897A" strokeWidth="4" />
      <path d="M28 0 L28 108" stroke="#F3EEE4" strokeWidth="4" />
      <path d="M14 36 L42 36" stroke="#F3EEE4" strokeWidth="3" />
      <path d="M11 64 L45 64" stroke="#D4897A" strokeWidth="3" />
      <path d="M8 92 L48 92" stroke="#F3EEE4" strokeWidth="3" />
    </g>
  );
}

function Sailboat() {
  return (
    <g data-landmark="sailboat" transform="translate(404 742)">
      <polygon points="22,0 22,38 4,38" fill="#F7F4EE" />
      <polygon points="24,8 40,38 24,38" fill="#E8D08A" />
      <rect x="0" y="38" width="44" height="7" rx="3" fill="#3A322C" />
    </g>
  );
}

function CableCar() {
  return (
    <g data-landmark="cable-car" transform="translate(1088 572) rotate(-20)">
      <rect x="0" y="10" width="64" height="28" rx="3" fill="#C45C5C" />
      <rect x="0" y="6" width="64" height="8" fill="#E8C97A" />
      <rect x="8" y="16" width="12" height="10" fill="#F7F1E6" />
      <rect x="26" y="16" width="12" height="10" fill="#F7F1E6" />
      <rect x="44" y="16" width="12" height="10" fill="#F7F1E6" />
      <rect x="30" y="-10" width="3" height="18" fill="#3A322C" />
      <circle cx="14" cy="42" r="5" fill="#3A322C" />
      <circle cx="50" cy="42" r="5" fill="#3A322C" />
    </g>
  );
}

function ChinatownGate() {
  return (
    <g data-landmark="chinatown-gate" transform="translate(1276 586)">
      <rect x="14" y="44" width="14" height="78" fill="#C4A265" />
      <rect x="90" y="44" width="14" height="78" fill="#C4A265" />
      <path d="M0 40 Q 8 22 28 28 L 59 8 L 90 28 Q 110 22 118 40 Z" fill="#5F8A62" />
      <path d="M18 48 Q 28 36 40 40 L 59 28 L 78 40 Q 90 36 100 48 Z" fill="#3F6B4A" />
      <rect x="10" y="42" width="98" height="8" fill="#E8C97A" />
      <circle cx="20" cy="46" r="3" fill="#D06A4F" />
      <circle cx="98" cy="46" r="3" fill="#D06A4F" />
    </g>
  );
}
