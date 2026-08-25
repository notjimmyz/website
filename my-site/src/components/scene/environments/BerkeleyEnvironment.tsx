"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { eraAt, eraDistance } from "@/lib/timeline";
import type { EnvironmentProps } from "./types";

const COLLEGE_AT = eraAt("college");

export function BerkeleyEnvironment({ progress }: EnvironmentProps) {
  const reduceMotion = useReducedMotion();
  const hillsY = useTransform(progress, (value) => eraDistance(value, COLLEGE_AT) * 18);
  const towerY = useTransform(progress, (value) => eraDistance(value, COLLEGE_AT) * 28);

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <g data-layer="background">
        <rect width="1440" height="900" fill="#F0E4C4" />
        <rect width="1440" height="380" fill="#E7D6A8" />
        <circle cx="260" cy="150" r="46" fill="#F3D89A" />
      </g>

      <motion.g
        data-layer="landscape"
        style={{ y: reduceMotion ? 0 : hillsY }}
      >
        <path
          d="M0 430 C 160 390 260 470 430 430 C 620 386 740 460 920 420 C 1100 382 1240 450 1440 410 L 1440 900 L 0 900 Z"
          fill="#C5D1A8"
        />
        <path
          d="M0 520 C 200 488 340 560 560 530 C 780 500 980 562 1440 528 L 1440 900 L 0 900 Z"
          fill="#9AAD86"
        />
        <path
          d="M0 680 C 260 652 420 710 680 690 C 940 670 1160 720 1440 700 L 1440 900 L 0 900 Z"
          fill="#C5D1A8"
        />
      </motion.g>

      <g data-layer="buildings">
        <motion.g style={{ y: reduceMotion ? 0 : towerY }}>
          <g transform="translate(686 318)">
            <rect x="22" y="86" width="52" height="292" fill="#D9C4A0" />
            <rect x="14" y="54" width="68" height="44" fill="#D2BA94" />
            <rect x="28" y="66" width="12" height="12" fill="#EFE0C4" />
            <rect x="56" y="66" width="12" height="12" fill="#EFE0C4" />
            <circle cx="48" cy="76" r="8" fill="#EFE0C4" />
            <polygon points="48,0 86,54 10,54" fill="#C4A882" />
            <rect x="46" y="8" width="4" height="22" fill="#C4A882" />
            <rect x="30" y="140" width="8" height="18" fill="#EFE0C4" />
            <rect x="58" y="140" width="8" height="18" fill="#EFE0C4" />
            <rect x="30" y="190" width="8" height="18" fill="#EFE0C4" />
            <rect x="58" y="190" width="8" height="18" fill="#EFE0C4" />
            <rect x="30" y="240" width="8" height="18" fill="#EFE0C4" />
            <rect x="58" y="240" width="8" height="18" fill="#EFE0C4" />
          </g>
        </motion.g>

        <circle cx="560" cy="620" r="58" fill="#7D9A6A" />
        <rect x="552" y="620" width="16" height="70" fill="#6B5340" />
        <circle cx="880" cy="640" r="72" fill="#6B8A5A" />
        <rect x="872" y="640" width="16" height="78" fill="#6B5340" />
        <circle cx="500" cy="670" r="40" fill="#8AA876" />
        <circle cx="940" cy="680" r="36" fill="#7D9A6A" />
      </g>

      <g data-layer="props">
        <g transform="translate(548 668)">
          <rect x="0" y="20" width="22" height="96" fill="#8B7355" />
          <rect x="322" y="20" width="22" height="96" fill="#8B7355" />
          <path
            d="M10 28 C 80 -18 264 -18 334 28"
            fill="none"
            stroke="#8B7355"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <rect x="8" y="24" width="328" height="10" fill="#7A654A" />
        </g>
      </g>

      <g data-layer="characters">
        <g transform="translate(704 748)">
          <circle cx="10" cy="6" r="6" fill="#3A322C" />
          <rect x="4" y="14" width="12" height="18" rx="3" fill="#3F5C8A" />
          <rect x="16" y="18" width="8" height="12" rx="2" fill="#C4A882" />
        </g>
      </g>
    </svg>
  );
}
