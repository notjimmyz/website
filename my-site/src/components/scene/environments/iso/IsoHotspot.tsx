import type { KeyboardEvent } from "react";
import { iso } from "./project";

export function IsoHotspot({
  x,
  y,
  z,
  label,
  ariaLabel,
  accent,
  active,
  onOpen,
  width = 116,
}: {
  x: number;
  y: number;
  z: number;
  label: string;
  ariaLabel: string;
  accent: string;
  active: boolean;
  onOpen?: () => void;
  width?: number;
}) {
  const ground = iso(x, y, 0.2);
  const anchor = iso(x, y, z);
  const chipX = anchor.x - width / 2;
  const chipY = anchor.y - 20;
  const textX = chipX + (width + 18) / 2;

  function activate() {
    onOpen?.();
  }

  function onKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  }

  return (
    <g
      role="button"
      tabIndex={active ? 0 : -1}
      aria-label={ariaLabel}
      data-landmark={`${label.toLowerCase().replace(/\s+/g, "-")}-hotspot`}
      className="iso-hotspot"
      style={{ pointerEvents: active ? "auto" : "none" }}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      <title>{ariaLabel}</title>
      <ellipse cx={ground.x} cy={ground.y + 4} rx="16" ry="7" fill="#5C5048" opacity="0.16" />
      <line
        x1={ground.x}
        y1={ground.y}
        x2={anchor.x}
        y2={anchor.y + 8}
        stroke="#C4B8A4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        className="iso-hotspot-chip"
        x={chipX}
        y={chipY}
        width={width}
        height="30"
        rx="15"
        fill="#F7F3EA"
        stroke="#D4C4A8"
        strokeWidth="1.15"
      />
      <circle cx={chipX + 16} cy={chipY + 15} r="8" fill={accent} />
      <path
        d={`M ${chipX + 13.2} ${chipY + 11.4} L ${chipX + 19.4} ${chipY + 15} L ${chipX + 13.2} ${chipY + 18.6}`}
        fill="none"
        stroke="#F7F3EA"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={textX}
        y={chipY + 19}
        fill="#5C5048"
        fontFamily="var(--font-display), ui-serif, Georgia, serif"
        fontSize="12"
        fontWeight="500"
        letterSpacing="0.04em"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}
