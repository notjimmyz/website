"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { eraAt, eraDistance, eraVisibility } from "@/lib/timeline";
import type { EnvironmentProps } from "./types";

const CHILDHOOD_AT = eraAt("childhood");
const WATERLINE = 708;

const day = {
  pearl: "#E8966A",
  pearlInner: "#F0B090",
  swfc: "#5EAEA8",
  jinmao: "#C4978A",
  tower: "#3E8E8C",
  orange: "#E8874A",
  yellow: "#E8C15A",
  teal: "#6BB8B0",
  purple: "#A888B0",
  dome: "#6A9BB8",
  bridge: "#4A9A96",
  tree: "#7BA04A",
  bank: "#D4855C",
  lights: "transparent",
};

const night = {
  pearl: "#E85A9C",
  pearlInner: "#5AD4E8",
  swfc: "#24344C",
  jinmao: "#3A2A40",
  tower: "#1E3A52",
  orange: "#2A2438",
  yellow: "#32283A",
  teal: "#1C3348",
  purple: "#2C2040",
  dome: "#243048",
  bridge: "#1A3048",
  tree: "#243820",
  bank: "#4A2830",
  lights: "#F5E6A3",
};

export function ShanghaiEnvironment({ progress }: EnvironmentProps) {
  const reduceMotion = useReducedMotion();
  const sunRef = useRef<HTMLButtonElement>(null);
  const [isSunset, setIsSunset] = useState(false);
  const sunset = useMotionValue(0);
  const dayOpacity = useTransform(sunset, [0, 1], [1, 0]);
  const nightOpacity = useTransform(sunset, [0, 1], [0, 1]);
  const sunY = useTransform(sunset, [0, 1], [0, reduceMotion ? 0 : 86]);
  const sunFill = useTransform(sunset, [0, 1], ["#F4D56A", "#F07848"]);
  const sunGlow = useTransform(sunset, [0, 1], [0.22, 0.55]);
  const sceneX = useTransform(progress, (value) =>
    reduceMotion ? 0 : eraDistance(value, CHILDHOOD_AT) * -28,
  );

  useEffect(() => {
    const on = eraVisibility(progress.get(), CHILDHOOD_AT) > 0.45;
    if (sunRef.current) {
      sunRef.current.style.pointerEvents = on ? "auto" : "none";
    }
  }, [progress]);

  useMotionValueEvent(progress, "change", (value) => {
    const on = eraVisibility(value, CHILDHOOD_AT) > 0.45;
    if (sunRef.current) {
      sunRef.current.style.pointerEvents = on ? "auto" : "none";
    }
  });

  const toggleSunset = useCallback(() => {
    const next = !isSunset;
    setIsSunset(next);
    if (reduceMotion) {
      sunset.set(next ? 1 : 0);
      return;
    }
    animate(sunset, next ? 1 : 0, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
  }, [isSunset, reduceMotion, sunset]);

  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="shanghai-day-sky" x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#F4EFD4" />
            <stop offset="100%" stopColor="#F0CDB4" />
          </linearGradient>
          <linearGradient id="shanghai-night-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16183E" />
            <stop offset="58%" stopColor="#3A2458" />
            <stop offset="100%" stopColor="#E8786A" />
          </linearGradient>
          <clipPath id="shanghai-water">
            <rect x="0" y={WATERLINE} width="1440" height={192} />
          </clipPath>
        </defs>

        <motion.g data-layer="day" style={{ opacity: dayOpacity }}>
          <rect width="1440" height="900" fill="url(#shanghai-day-sky)" />
          <Cloud x={180} y={90} fill="#F7F4EE" />
          <Cloud x={980} y={70} fill="#E7F0F0" />
          <motion.g style={{ x: sceneX }}>
            <Scene palette={day} lights={false} />
          </motion.g>
        </motion.g>

        <motion.g data-layer="night" style={{ opacity: nightOpacity }}>
          <rect width="1440" height="900" fill="url(#shanghai-night-sky)" />
          <Cloud x={180} y={90} fill="#243056" accent="#E8946A" />
          <Cloud x={980} y={70} fill="#1E2848" accent="#E8786A" />
          <motion.g style={{ x: sceneX }}>
            <Scene palette={night} lights />
          </motion.g>
        </motion.g>
      </svg>

      <motion.button
        ref={sunRef}
        type="button"
        aria-pressed={isSunset}
        aria-label={isSunset ? "Return to daytime Shanghai" : "See Shanghai at sunset"}
        className="absolute top-[11%] right-[10%] z-10 size-14 cursor-pointer rounded-full outline-none sm:size-16 pointer-events-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        style={{ backgroundColor: sunFill, y: sunY }}
        onClick={toggleSunset}
        whileHover={reduceMotion ? undefined : { scale: 1.08 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-[-18px] rounded-full bg-[#F4D56A]"
          style={{ opacity: sunGlow }}
        />
        <span className="sr-only">
          {isSunset ? "Sunset on. Click for day." : "Daytime on. Click for sunset."}
        </span>
      </motion.button>
    </div>
  );
}

function Scene({
  palette,
  lights,
}: {
  palette: typeof day;
  lights: boolean;
}) {
  return (
    <>
      <Skyline palette={palette} lights={lights} />
      <Water fill={lights ? "#14182E" : "#7EC8C4"} />
      <g clipPath="url(#shanghai-water)">
        <g
          opacity={lights ? 0.55 : 0.34}
          transform={`translate(0 ${WATERLINE}) scale(1 -0.42) translate(0 ${-WATERLINE})`}
        >
          <Skyline palette={palette} lights={lights} />
          <Bridge fill={palette.bridge} />
        </g>
        {lights ? <NightReflections /> : null}
      </g>
      <Bridge fill={palette.bridge} />
      <Banks palette={palette} />
    </>
  );
}

function Skyline({
  palette,
  lights,
}: {
  palette: typeof day;
  lights: boolean;
}) {
  return (
    <g data-layer="buildings">
      <rect x="70" y="560" width="44" height="148" fill={palette.orange} />
      <rect x="122" y="520" width="52" height="188" fill={palette.teal} />
      <rect x="182" y="548" width="40" height="160" fill={palette.yellow} />
      <circle cx="248" cy="548" r="28" fill={palette.dome} />
      <rect x="226" y="548" width="44" height="160" fill={palette.purple} />

      <OrientalPearl fill={palette.pearl} inner={palette.pearlInner} />

      <rect x="620" y="430" width="48" height="278" fill={palette.orange} />
      <rect x="676" y="470" width="36" height="238" fill={palette.yellow} />
      <rect x="720" y="390" width="42" height="318" fill={palette.teal} />

      <JinMao fill={palette.jinmao} />
      <WorldFinancialCenter fill={palette.swfc} />
      <ShanghaiTower fill={palette.tower} />

      <rect x="1188" y="448" width="38" height="260" fill={palette.orange} />
      <rect x="1234" y="500" width="54" height="208" fill={palette.yellow} />
      <rect x="1296" y="468" width="44" height="240" fill={palette.teal} />

      {lights ? <WindowLights /> : null}
    </g>
  );
}

function OrientalPearl({ fill, inner }: { fill: string; inner: string }) {
  return (
    <g data-landmark="oriental-pearl" transform="translate(430 248)">
      <path d="M64 460 L 8 460 L 48 250" fill={fill} />
      <path d="M64 460 L 120 460 L 80 250" fill={inner} />
      <rect x="58" y="40" width="12" height="360" fill={fill} />
      <circle cx="64" cy="268" r="54" fill={fill} />
      <circle cx="64" cy="268" r="34" fill={inner} />
      <circle cx="64" cy="148" r="28" fill={fill} />
      <circle cx="64" cy="86" r="10" fill={inner} />
      <rect x="61" y="0" width="6" height="78" fill={fill} />
    </g>
  );
}

function JinMao({ fill }: { fill: string }) {
  return (
    <g data-landmark="jin-mao" transform="translate(778 268)">
      <rect x="10" y="280" width="70" height="160" fill={fill} />
      <rect x="16" y="232" width="58" height="50" fill={fill} />
      <rect x="22" y="184" width="46" height="50" fill={fill} />
      <rect x="28" y="136" width="34" height="50" fill={fill} />
      <rect x="34" y="88" width="22" height="50" fill={fill} />
      <rect x="40" y="40" width="10" height="50" fill={fill} />
      <rect x="42" y="8" width="6" height="34" fill={fill} />
    </g>
  );
}

function WorldFinancialCenter({ fill }: { fill: string }) {
  return (
    <g data-landmark="swfc" transform="translate(872 168)">
      <path
        fillRule="evenodd"
        d="M10 540 L 4 52 L 78 52 L 72 540 Z M18 108 L 41 52 L 64 108 L 64 132 L 18 132 Z"
        fill={fill}
      />
    </g>
  );
}

function ShanghaiTower({ fill }: { fill: string }) {
  return (
    <g data-landmark="shanghai-tower" transform="translate(980 78)">
      <path d="M36 630 L 10 110 Q 48 8 70 104 L 82 630 Z" fill={fill} />
      <path d="M42 630 L 26 160 Q 50 70 62 156 L 70 630 Z" fill="#7EC8C4" opacity="0.35" />
    </g>
  );
}

function Bridge({ fill }: { fill: string }) {
  const bays = Array.from({ length: 12 }, (_, index) => index * 96);

  return (
    <g data-landmark="waibaidu" transform="translate(96 628)" stroke={fill} fill="none">
      <rect x="0" y="52" width="1248" height="8" fill={fill} stroke="none" />
      <rect x="0" y="0" width="1248" height="7" fill={fill} stroke="none" />
      {bays.map((x) => (
        <path
          key={x}
          d={`M${x} 7 L${x + 96} 52 M${x + 96} 7 L${x} 52`}
          strokeWidth="5"
        />
      ))}
      <rect x="0" y="0" width="10" height="60" fill={fill} stroke="none" />
      <rect x="1238" y="0" width="10" height="60" fill={fill} stroke="none" />
    </g>
  );
}

function Water({ fill }: { fill: string }) {
  return (
    <path
      d={`M0 ${WATERLINE} C 240 688 480 732 760 710 C 1040 688 1240 730 1440 712 L 1440 900 L 0 900 Z`}
      fill={fill}
    />
  );
}

function Banks({ palette }: { palette: typeof day }) {
  return (
    <g data-layer="landscape">
      <path d="M-20 760 L 80 700 L 170 760 L 170 900 L -20 900 Z" fill={palette.bank} />
      <circle cx="36" cy="720" r="36" fill={palette.tree} />
      <circle cx="78" cy="736" r="28" fill={palette.tree} />
      <circle cx="112" cy="750" r="22" fill={palette.tree} />
      <path d="M1280 770 L 1360 700 L 1480 760 L 1480 900 L 1280 900 Z" fill={palette.bank} />
      <circle cx="1348" cy="724" r="40" fill={palette.tree} />
      <circle cx="1396" cy="744" r="30" fill={palette.tree} />
      <circle cx="1428" cy="758" r="20" fill={palette.tree} />
    </g>
  );
}

function Cloud({
  x,
  y,
  fill,
  accent,
}: {
  x: number;
  y: number;
  fill: string;
  accent?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="78" ry="18" fill={fill} />
      <ellipse cx="48" cy="6" rx="50" ry="14" fill={fill} />
      {accent ? <ellipse cx="10" cy="10" rx="60" ry="8" fill={accent} /> : null}
    </g>
  );
}

function WindowLights() {
  return (
    <g data-layer="lights" fill="#F5E6A3">
      <rect x="132" y="540" width="6" height="8" />
      <rect x="148" y="560" width="6" height="8" />
      <rect x="132" y="590" width="6" height="8" />
      <rect x="148" y="620" width="6" height="8" />
      <rect x="632" y="450" width="7" height="9" />
      <rect x="650" y="478" width="7" height="9" />
      <rect x="632" y="510" width="7" height="9" />
      <rect x="650" y="548" width="7" height="9" />
      <rect x="632" y="590" width="7" height="9" />
      <rect x="732" y="410" width="7" height="9" fill="#7EE0E8" />
      <rect x="748" y="448" width="7" height="9" />
      <rect x="732" y="490" width="7" height="9" fill="#F090C0" />
      <rect x="748" y="540" width="7" height="9" />
      <rect x="900" y="200" width="8" height="10" />
      <rect x="918" y="240" width="8" height="10" fill="#7EE0E8" />
      <rect x="900" y="290" width="8" height="10" />
      <rect x="918" y="340" width="8" height="10" />
      <rect x="900" y="400" width="8" height="10" fill="#F090C0" />
      <rect x="918" y="460" width="8" height="10" />
      <rect x="1020" y="180" width="6" height="8" fill="#7EE0E8" />
      <rect x="1036" y="220" width="6" height="8" />
      <rect x="1020" y="280" width="6" height="8" fill="#7EE0E8" />
      <rect x="1036" y="340" width="6" height="8" />
      <rect x="1020" y="420" width="6" height="8" />
    </g>
  );
}

function NightReflections() {
  return (
    <g data-layer="reflections" opacity="0.7">
      <rect x="470" y="720" width="6" height="90" fill="#E85A9C" />
      <rect x="500" y="720" width="5" height="70" fill="#5AD4E8" />
      <rect x="890" y="720" width="5" height="80" fill="#F5E6A3" />
      <rect x="1028" y="720" width="6" height="96" fill="#7EE0E8" />
      <rect x="640" y="720" width="4" height="64" fill="#F090C0" />
    </g>
  );
}
