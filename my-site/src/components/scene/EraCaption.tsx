"use client";

import { motion, type MotionValue } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { ERAS, type NestedChapter } from "@/lib/timeline";
import { useEraLayerStyle } from "./use-era-layer-style";

type EraCaptionProps = {
  progress: MotionValue<number>;
  nested?: NestedChapter | null;
  onBack?: () => void;
};

export function EraCaption({ progress, nested = null, onBack }: EraCaptionProps) {
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (nested) backRef.current?.focus();
  }, [nested]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-10 sm:px-10 sm:pt-14">
      <div className="relative mx-auto min-h-[8.5rem] max-w-5xl sm:min-h-[9.5rem]">
        {nested ? (
          <div>
            {onBack ? (
              <button
                ref={backRef}
                type="button"
                onClick={onBack}
                className="pointer-events-auto mb-5 min-h-11 text-left text-[0.62rem] tracking-[0.18em] text-foreground/55 uppercase transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:underline focus-visible:underline-offset-4 sm:text-xs"
              >
                Back to High School
              </button>
            ) : null}
            <p className="font-heading text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] tracking-tight text-foreground">
              {nested.label}
            </p>
            <p className="mt-3 text-sm tracking-[0.22em] text-foreground/70 uppercase">
              {nested.place}
            </p>
            <p className="mt-1 text-xs tracking-[0.18em] text-foreground/45 uppercase">
              {nested.region}
            </p>
          </div>
        ) : (
          ERAS.map((era) => (
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
          ))
        )}
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
