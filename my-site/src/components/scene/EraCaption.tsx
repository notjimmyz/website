"use client";

import { motion, type MotionValue } from "motion/react";
import type { ReactNode } from "react";
import { ERAS } from "@/lib/timeline";
import { useEraLayerStyle } from "./use-era-layer-style";

type EraCaptionProps = {
  progress: MotionValue<number>;
};

export function EraCaption({ progress }: EraCaptionProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-10 sm:px-10 sm:pt-14">
      <div className="relative mx-auto min-h-[8.5rem] max-w-5xl sm:min-h-[9.5rem]">
        {ERAS.map((era) => (
          <CaptionLayer key={era.id} progress={progress} at={era.at}>
            <p className="font-heading text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] tracking-tight text-foreground">
              {era.label}
            </p>
            <p className="mt-3 text-sm tracking-[0.22em] text-foreground/70 uppercase">
              {era.place}
            </p>
            <p className="mt-1 text-xs tracking-[0.18em] text-foreground/45 uppercase">
              {era.region}
            </p>
          </CaptionLayer>
        ))}
      </div>
    </div>
  );
}

function CaptionLayer({
  progress,
  at,
  children,
}: {
  progress: MotionValue<number>;
  at: number;
  children: ReactNode;
}) {
  const { opacity } = useEraLayerStyle(progress, at);

  return (
    <motion.div className="absolute inset-x-0 top-0" style={{ opacity }}>
      {children}
    </motion.div>
  );
}
