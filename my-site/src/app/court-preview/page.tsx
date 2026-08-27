"use client";

import { Court } from "@/components/basketball/Court";
import { ActorSprite, BallSprite } from "@/components/basketball/Sprites";
import { project, SCREEN_H, SCREEN_W, SIN_PITCH } from "@/lib/basketball/camera";
import { KIT } from "@/lib/basketball/palette";

// Temporary harness for eyeballing the court render.
function Placed({
  x,
  y,
  z = 0,
  facing = 1,
  children,
}: {
  x: number;
  y: number;
  z?: number;
  facing?: 1 | -1;
  children: React.ReactNode;
}) {
  const p = project(x, y, z);
  const ground = project(x, y, 0);
  const rx = 1.15 * ground.k;

  return (
    <g>
      <ellipse
        cx={ground.x}
        cy={ground.y}
        rx={rx}
        ry={rx * SIN_PITCH}
        fill="#2C3E52"
        opacity="0.2"
      />
      <g transform={`translate(${p.x} ${p.y}) scale(${p.k * facing} ${p.k})`}>{children}</g>
    </g>
  );
}

export default function CourtPreview() {
  return (
    <svg viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`} width={SCREEN_W} height={SCREEN_H}>
      <Court />
      <Placed x={-4} y={26}>
        <ActorSprite name="preview-user" kit={KIT.user} />
      </Placed>
      <Placed x={-3} y={20} facing={-1}>
        <ActorSprite name="preview-bot" kit={KIT.bot} />
      </Placed>
      <Placed x={6} y={12}>
        <ActorSprite name="preview-third" kit={KIT.bot} />
      </Placed>
      <Placed x={-4} y={24} z={7}>
        <BallSprite />
      </Placed>
    </svg>
  );
}
