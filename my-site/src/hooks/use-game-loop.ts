"use client";

import { useEffect, useRef } from "react";

type GameLoopOptions = {
  active: boolean;
  /** Advances the simulation by exactly `dt` seconds. */
  step: (dt: number) => void;
  /** Writes the current simulation state to the DOM. */
  render: () => void;
  fixedDt?: number;
  maxStepsPerFrame?: number;
};

export function useGameLoop({
  active,
  step,
  render,
  fixedDt = 1 / 60,
  maxStepsPerFrame = 5,
}: GameLoopOptions) {
  const stepRef = useRef(step);
  const renderRef = useRef(render);

  useEffect(() => {
    stepRef.current = step;
    renderRef.current = render;
  }, [render, step]);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    let last = performance.now();
    let accumulator = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      const elapsed = Math.min(0.25, (now - last) / 1000);
      last = now;
      accumulator += elapsed;

      let steps = 0;
      while (accumulator >= fixedDt && steps < maxStepsPerFrame) {
        stepRef.current(fixedDt);
        accumulator -= fixedDt;
        steps += 1;
      }

      if (steps === maxStepsPerFrame) accumulator = 0;

      renderRef.current();
    };

    // A hidden tab stops firing frames; reset the clock so the simulation does
    // not fast-forward on return.
    const onVisibility = () => {
      last = performance.now();
      accumulator = 0;
    };

    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, fixedDt, maxStepsPerFrame]);
}
