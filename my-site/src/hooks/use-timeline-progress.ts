"use client";

import {
  animate,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { useCallback } from "react";
import { clampProgress } from "@/lib/timeline";

type SetProgressOptions = {
  immediate?: boolean;
};

export function useTimelineProgress(initial = 0): {
  progress: MotionValue<number>;
  setProgress: (value: number, options?: SetProgressOptions) => void;
} {
  const progress = useMotionValue(initial);
  const reduceMotion = useReducedMotion();

  const setProgress = useCallback(
    (value: number, options?: SetProgressOptions) => {
      const next = clampProgress(value);

      if (options?.immediate || reduceMotion) {
        progress.set(next);
        return;
      }

      animate(progress, next, {
        type: "spring",
        stiffness: 160,
        damping: 28,
        mass: 0.75,
      });
    },
    [progress, reduceMotion],
  );

  return { progress, setProgress };
}
