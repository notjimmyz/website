"use client";

import { useReducedMotion } from "motion/react";

const BRICK = "#A65C48";
const BRICK_DARK = "#8F4E3E";
const FRAME = "#F3EEE4";
const ROAD = "#8A8680";

export function TonbridgeEnvironment() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <g data-layer="background">
        <rect width="1440" height="900" fill="#D5D8DC" />
        <rect width="1440" height="430" fill="#C5CCD2" />
        <ellipse cx="180" cy="70" rx="220" ry="48" fill="#B4BCC4" />
        <ellipse cx="360" cy="92" rx="180" ry="40" fill="#C0C6CC" />
        <ellipse cx="620" cy="58" rx="260" ry="52" fill="#AEB6BE" />
        <ellipse cx="900" cy="84" rx="210" ry="44" fill="#B8BFC6" />
        <ellipse cx="1180" cy="64" rx="240" ry="50" fill="#A8B0B8" />
        <ellipse cx="1400" cy="96" rx="160" ry="36" fill="#B4BBC2" />
        <ellipse cx="80" cy="130" rx="140" ry="28" fill="#C4CAD0" />
        <ellipse cx="760" cy="120" rx="190" ry="32" fill="#B0B8C0" />
      </g>

      <g>
        <ParkAndCastle />
        <HighStreet />
        <River />
        <BridgePiers />
        <Pavement />
        <Road />
        <BridgeFarRail />
        <ParkedCars />
        <Traffic reduceMotion={Boolean(reduceMotion)} />
        <BridgeNearRail />
        <g data-layer="props">
          <Lamp x={390} />
          <Lamp x={680} />
          <Lamp x={980} />
          <Lamp x={1240} />
          <PostBox x={410} y={628} />
          <Person x={370} y={612} fill="#5C5048" />
          <Person x={640} y={612} fill="#3F5C8A" />
          <Person x={1020} y={612} fill="#6B5340" />
        </g>
      </g>

      <Rain reduceMotion={Boolean(reduceMotion)} />
    </svg>
  );
}

function ParkAndCastle() {
  return (
    <g data-landmark="castle-park">
      <path
        d="M-20 640 C 30 598 80 578 140 576 C 200 574 250 598 318 640 L 318 688 L -20 688 Z"
        fill="#8FA876"
      />
      <path
        d="M-20 662 C 50 640 120 634 190 650 C 250 664 290 676 318 682 L 318 688 L -20 688 Z"
        fill="#7D9A6A"
      />
      <circle cx="36" cy="612" r="16" fill="#6F8F52" />
      <circle cx="278" cy="618" r="18" fill="#6F8F52" />
      <rect x="33" y="612" width="6" height="28" fill="#6B5340" />
      <rect x="275" y="618" width="6" height="24" fill="#6B5340" />

      <g data-landmark="tonbridge-castle" transform="translate(78 536) scale(0.72)">
        <ellipse cx="36" cy="168" rx="32" ry="11" fill="#7A8A62" />
        <rect x="8" y="64" width="56" height="104" fill="#C9B89A" />
        <ellipse cx="36" cy="64" rx="28" ry="12" fill="#D4C4A8" />
        <ellipse cx="124" cy="168" rx="32" ry="11" fill="#7A8A62" />
        <rect x="96" y="64" width="56" height="104" fill="#C4B494" />
        <ellipse cx="124" cy="64" rx="28" ry="12" fill="#D0C0A4" />
        <rect x="52" y="92" width="52" height="72" fill="#B8A888" />
        <path d="M66 112 C 78 98 98 98 110 112 L 110 164 L 66 164 Z" fill="#5C5048" />
        <rect x="18" y="86" width="10" height="13" fill="#EFE6D8" />
        <rect x="108" y="86" width="10" height="13" fill="#EFE6D8" />
        <rect x="34" y="14" width="3" height="52" fill="#8A8070" />
        <rect x="34" y="10" width="16" height="9" fill="#C45C5C" />
        <rect x="34" y="19" width="16" height="9" fill="#E8C15A" />
      </g>
    </g>
  );
}

function HighStreet() {
  return (
    <g data-landmark="high-street">
      <BrickShop x={312} width={122} stories={3} fascia="#3F6B4A" gable />
      <BrickShop x={434} width={108} stories={2} fascia="#3F5C8A" />
      <BrickShop x={554} width={148} stories={3} fascia="#2F5C52" gable />
      <BrickShop x={702} width={120} stories={2} fascia="#C45C5C" />
      <BrickShop x={822} width={136} stories={3} fascia="#F3EEE4" gable />
      <BrickShop x={958} width={128} stories={2} fascia="#24344C" />
      <BrickShop x={1086} width={140} stories={3} fascia="#3A322C" gable />
      <BrickShop x={1226} width={132} stories={2} fascia="#6B5340" />
      <ShopSigns />
      <Chimneys />
    </g>
  );
}

function BrickShop({
  x,
  width,
  stories,
  fascia,
  gable = false,
  arch = false,
}: {
  x: number;
  width: number;
  stories: number;
  fascia: string;
  gable?: boolean;
  arch?: boolean;
}) {
  const ground = 72;
  const story = 46;
  const height = ground + stories * story;
  const top = 640 - height;

  return (
    <g transform={`translate(${x} ${top})`}>
      <rect width={width} height={height} fill={BRICK} />
      <rect y={height - ground} width={width} height={ground} fill={fascia} />
      {gable ? (
        <polygon
          points={`${width / 2},-28 ${width + 8},12 -8,12`}
          fill={BRICK_DARK}
        />
      ) : (
        <rect y={-10} width={width} height={10} fill={BRICK_DARK} />
      )}
      {arch ? (
        <path
          d={`M${width * 0.18} ${height - 8} C ${width * 0.18} ${height - 58} ${width * 0.82} ${height - 58} ${width * 0.82} ${height - 8}`}
          fill="#1A1816"
        />
      ) : (
        <>
          <rect x={8} y={height - 58} width={width * 0.42} height={42} fill="#D7E0E4" />
          <rect x={width * 0.52} y={height - 58} width={width * 0.28} height={42} fill="#D7E0E4" />
          <rect x={width - 22} y={height - 52} width={12} height={52} fill="#3A322C" />
        </>
      )}
      {Array.from({ length: stories }, (_, storyIndex) =>
        Array.from({ length: 3 }, (_, windowIndex) => (
          <rect
            key={`${storyIndex}-${windowIndex}`}
            x={12 + windowIndex * ((width - 24) / 3)}
            y={10 + storyIndex * story}
            width={18}
            height={24}
            fill={FRAME}
          />
        )),
      )}
    </g>
  );
}

function ShopSigns() {
  return (
    <g data-layer="signs">
      <circle cx="386" cy="612" r="10" fill="#1F7A4C" />
      <rect x="846" y="574" width="18" height="18" fill="#3A322C" />
      <rect x="872" y="574" width="18" height="18" fill="#C45C5C" stroke="#3A322C" strokeWidth="2" />
    </g>
  );
}

function Chimneys() {
  return (
    <g fill={BRICK_DARK}>
      <rect x="360" y="368" width="14" height="32" />
      <rect x="610" y="352" width="16" height="34" />
      <rect x="760" y="388" width="14" height="28" />
      <rect x="870" y="348" width="14" height="36" />
      <rect x="1130" y="352" width="14" height="30" />
    </g>
  );
}

function Pavement() {
  return (
    <g>
      <rect x="312" y="640" width="1128" height="44" fill="#B56A52" />
      <rect x="312" y="682" width="1128" height="6" fill="#C4A090" />
    </g>
  );
}

function Road() {
  return (
    <g>
      <rect x="0" y="688" width="1440" height="72" fill={ROAD} />
      <rect x="80" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="240" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="400" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="560" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="720" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="880" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="1040" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="1200" y="720" width="70" height="5" fill="#E8E2D4" />
      <rect x="1360" y="720" width="70" height="5" fill="#E8E2D4" />
    </g>
  );
}

function BridgePiers() {
  return (
    <g data-landmark="bridge-piers">
      <rect x="22" y="760" width="16" height="58" fill="#C4B8A8" />
      <rect x="148" y="760" width="16" height="64" fill="#C4B8A8" />
      <rect x="274" y="760" width="16" height="56" fill="#C4B8A8" />
    </g>
  );
}

function BridgeFarRail() {
  const posts = Array.from({ length: 10 }, (_, index) => 18 + index * 29);

  return (
    <g data-landmark="bridge-far-rail">
      <rect x="8" y="682" width="304" height="5" fill="#F4F1EA" />
      {posts.map((x) => (
        <path
          key={x}
          d={`M${x} 687 Q ${x + 12} 672 ${x + 24} 687`}
          fill="none"
          stroke="#F4F1EA"
          strokeWidth="3"
        />
      ))}
      {posts.map((x) => (
        <rect key={`post-${x}`} x={x + 10} y="668" width="3" height="19" fill="#F4F1EA" />
      ))}
      <rect x="28" y="646" width="5" height="36" fill="#F4F1EA" />
      <rect x="20" y="636" width="21" height="12" rx="6" fill="#F4F1EA" />
      <rect x="278" y="646" width="5" height="36" fill="#F4F1EA" />
      <rect x="270" y="636" width="21" height="12" rx="6" fill="#F4F1EA" />
    </g>
  );
}

function BridgeNearRail() {
  return (
    <g data-landmark="bridge-near-rail">
      <rect x="8" y="754" width="304" height="5" fill="#F4F1EA" />
    </g>
  );
}

function River() {
  return (
    <g data-layer="landscape-water">
      <path
        d="M0 760 C 220 752 480 778 760 762 C 1040 746 1240 772 1440 760 L 1440 900 L 0 900 Z"
        fill="#7A8B84"
      />
      <path
        d="M0 820 C 260 808 560 836 880 818 C 1160 802 1320 828 1440 818 L 1440 900 L 0 900 Z"
        fill="#6A7C76"
      />
      <path d="M0 778 L 90 768 L 170 780 L 170 802 L 0 802 Z" fill="#6F8F52" />
      <path d="M1280 770 L 1380 746 L 1480 768 L 1480 800 L 1280 800 Z" fill="#7D9A6A" />
      <Boat x={70} y={812} />
      <Boat x={170} y={828} />
      <Boat x={250} y={808} />
    </g>
  );
}

function Boat({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 10 L 8 0 L 40 0 L 48 10 Z" fill="#F3EEE4" />
      <rect x="16" y="-8" width="14" height="8" fill="#C45C5C" />
    </g>
  );
}

function Car({
  x,
  y,
  body,
  roof,
  flip = false,
}: {
  x: number;
  y: number;
  body: string;
  roof?: string;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <rect x="0" y="10" width="64" height="18" rx="4" fill={body} />
      <rect x="12" y="0" width="34" height="14" rx="3" fill={roof ?? body} />
      <circle cx="14" cy="28" r="6" fill="#3A322C" />
      <circle cx="50" cy="28" r="6" fill="#3A322C" />
      <rect x="16" y="4" width="12" height="8" fill="#D7E0E4" />
      <rect x="32" y="4" width="10" height="8" fill="#D7E0E4" />
    </g>
  );
}

function Bus({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="110" height="36" rx="6" fill="#4A7CA8" />
      <rect x="10" y="8" width="18" height="12" fill="#D7E0E4" />
      <rect x="34" y="8" width="18" height="12" fill="#D7E0E4" />
      <rect x="58" y="8" width="18" height="12" fill="#D7E0E4" />
      <rect x="82" y="8" width="18" height="12" fill="#D7E0E4" />
      <circle cx="22" cy="38" r="7" fill="#3A322C" />
      <circle cx="88" cy="38" r="7" fill="#3A322C" />
    </g>
  );
}

function ParkedCars() {
  return (
    <g data-layer="parked-cars">
      <Car x={390} y={656} body="#E8E4DC" />
      <Car x={640} y={656} body="#3A322C" roof="#2A2420" />
      <Car x={900} y={656} body="#6B8A9A" />
      <Car x={1160} y={656} body="#C45C5C" />
    </g>
  );
}

function Traffic({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="moving-cars">
      <g className={reduceMotion ? undefined : "tonbridge-traffic-right"}>
        <Car x={40} y={698} body="#2A2A2A" />
      </g>
      <g className={reduceMotion ? undefined : "tonbridge-traffic-right-slow"}>
        <Car x={220} y={698} body="#C45C5C" />
      </g>
      <g className={reduceMotion ? undefined : "tonbridge-traffic-left"}>
        <Bus x={1100} y={692} />
      </g>
    </g>
  );
}

function Lamp({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 470)`}>
      <rect x="8" y="40" width="5" height="168" fill="#3A322C" />
      <rect x="0" y="28" width="22" height="12" rx="6" fill="#3A322C" />
      <circle cx="4" cy="24" r="7" fill="#C4789A" />
      <circle cx="16" cy="20" r="6" fill="#A888B0" />
    </g>
  );
}

function PostBox({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="8" width="18" height="28" rx="3" fill="#C45C5C" />
      <rect x="0" y="0" width="18" height="10" rx="3" fill="#C45C5C" />
      <rect x="4" y="12" width="10" height="4" fill="#3A322C" />
    </g>
  );
}

function Person({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="8" cy="5" r="5" fill="#3A322C" />
      <rect x="3" y="12" width="10" height="16" rx="3" fill={fill} />
    </g>
  );
}

const RAIN_DROPS = Array.from({ length: 58 }, (_, index) => ({
  x: (index * 127 + 28) % 1440,
  y: (index * 71 + 16) % 820,
  length: 13 + (index % 5) * 4,
}));

function Rain({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <g data-layer="rain" opacity="0.34">
      <g className={reduceMotion ? undefined : "tonbridge-rain"}>
        <RainField />
        <g transform="translate(-16 -88)">
          <RainField />
        </g>
      </g>
    </g>
  );
}

function RainField() {
  return (
    <g fill="none" stroke="#6B92B8" strokeWidth="1.35" strokeLinecap="round">
      {RAIN_DROPS.map((drop) => (
        <line
          key={`${drop.x}-${drop.y}`}
          x1={drop.x}
          y1={drop.y}
          x2={drop.x - 4}
          y2={drop.y + drop.length}
        />
      ))}
    </g>
  );
}
