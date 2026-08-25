"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ERAS,
  HANDLE_SIZE,
  TIMELINE_END,
  TIMELINE_EXTENT,
  TIMELINE_START,
  pointerToProgress,
  progressToUnit,
  progressValueText,
} from "@/lib/timeline";
import { cn } from "@/lib/utils";

type TimelineScrubberProps = {
  progress: MotionValue<number>;
  setProgress: (value: number, options?: { immediate?: boolean }) => void;
};

export function TimelineScrubber({
  progress,
  setProgress,
}: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const trackWidth = useMotionValue(0);
  const handleX = useTransform(
    [progress, trackWidth],
    ([value, width]) =>
      ((value as number) - TIMELINE_START) /
        Math.max(TIMELINE_END - TIMELINE_START, 0.0001) *
        Math.max(0, (width as number) - HANDLE_SIZE),
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateWidth = () => {
      trackWidth.set(track.getBoundingClientRect().width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(track);
    return () => observer.disconnect();
  }, [trackWidth]);

  useMotionValueEvent(progress, "change", (value) => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.setAttribute("aria-valuenow", String(Math.round(progressToUnit(value) * 100)));
    slider.setAttribute("aria-valuetext", progressValueText(value));
  });

  const moveToClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      setProgress(pointerToProgress(clientX, track.getBoundingClientRect(), HANDLE_SIZE), {
        immediate: true,
      });
    },
    [setProgress],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    moveToClientX(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    moveToClientX(event.clientX);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = progress.get();
    const step = (event.shiftKey ? 0.12 : 0.04) * TIMELINE_EXTENT;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        setProgress(current + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        setProgress(current - step);
        break;
      case "Home":
        event.preventDefault();
        setProgress(TIMELINE_START);
        break;
      case "End":
        event.preventDefault();
        setProgress(TIMELINE_END);
        break;
      case "PageUp":
        event.preventDefault();
        setProgress(current + 1);
        break;
      case "PageDown":
        event.preventDefault();
        setProgress(current - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div
          className="mb-3 grid items-end"
          style={{ gridTemplateColumns: `repeat(${ERAS.length}, minmax(0, 1fr))` }}
        >
          {ERAS.map((era, index) => (
            <button
              key={era.id}
              type="button"
              className={cn(
                "min-h-11 transition-opacity duration-150 leading-tight",
                "text-[0.65rem] tracking-[0.12em] text-foreground/70 uppercase sm:text-xs sm:tracking-[0.16em]",
                "hover:text-foreground",
                "focus-visible:text-foreground focus-visible:underline focus-visible:underline-offset-4",
                index === 0 && "text-left",
                index > 0 && index < ERAS.length - 1 && "text-center",
                index === ERAS.length - 1 && "text-right",
              )}
              onClick={() => setProgress(era.at)}
            >
              {era.label}
            </button>
          ))}
        </div>

        <div
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
          aria-valuetext="Now, San Francisco, California"
          aria-orientation="horizontal"
          className="group/slider touch-none outline-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={onKeyDown}
        >
          <p id={labelId} className="sr-only">
            Timeline
          </p>
          <div
            ref={trackRef}
            className="relative flex h-12 cursor-grab items-center active:cursor-grabbing"
          >
            <div className="absolute inset-x-[14px] top-1/2 h-px -translate-y-1/2 bg-foreground/20" />
            {ERAS.map((era) => (
              <span
                key={era.id}
                aria-hidden="true"
                className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/35"
                style={{
                  left: `calc(${HANDLE_SIZE / 2}px + ${progressToUnit(era.at)} * (100% - ${HANDLE_SIZE}px))`,
                }}
              />
            ))}
            <motion.div
              className="absolute top-[calc(50%-14px)] left-0"
              style={{ x: handleX }}
            >
              <div
                className={cn(
                  "size-7 rounded-full bg-foreground",
                  "shadow-[0_0_0_6px_color-mix(in_oklch,var(--background)_70%,transparent)]",
                  "transition-transform duration-150 ease-out",
                  "group-active/slider:scale-95",
                  "group-focus-visible/slider:shadow-[0_0_0_6px_color-mix(in_oklch,var(--background)_70%,transparent),0_0_0_8px_var(--foreground)]",
                )}
              />
            </motion.div>
          </div>
        </div>

        <p className="mt-2 text-center text-xs tracking-[0.16em] text-muted-foreground uppercase">
          Drag to travel through time
        </p>
      </div>
    </div>
  );
}
