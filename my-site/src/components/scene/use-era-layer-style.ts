"use client";

import { useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { eraVisibility } from "@/lib/timeline";

export function useEraLayerStyle(progress: MotionValue<number>, at: number) {
  const reduceMotion = useReducedMotion();

  const opacity = useTransform(progress, (value) => eraVisibility(value, at));
  const x = useTransform(progress, (value) => `${(value - at) * -7}%`);

  return {
    opacity,
    x: reduceMotion ? 0 : x,
  };
}
