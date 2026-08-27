"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PadKey } from "@/hooks/use-game-keys";
import { DIFFICULTY_LABEL } from "@/lib/basketball/bot";
import { TARGET_SCORE } from "@/lib/basketball/constants";
import type { Difficulty, Team, ToastKind } from "@/lib/basketball/types";
import { cn } from "@/lib/utils";

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export function Scoreboard({
  scoreUser,
  scoreBot,
  possession,
  shotClock,
  difficulty,
}: {
  scoreUser: number;
  scoreBot: number;
  possession: Team;
  shotClock: number;
  difficulty: Difficulty;
}) {
  return (
    <div className="pointer-events-none absolute top-10 right-6 text-right sm:top-14 sm:right-10">
      <p className="text-[0.58rem] tracking-[0.24em] text-foreground/50 uppercase">
        First to {TARGET_SCORE}
      </p>
      <div className="mt-2 flex items-end justify-end gap-5">
        <Side label="You" value={scoreUser} live={possession === "user"} />
        <span className="font-heading pb-1 text-xl text-foreground/25">/</span>
        <Side label="CPU" value={scoreBot} live={possession === "bot"} />
      </div>
      <p className="mt-2 text-[0.6rem] tracking-[0.2em] text-foreground/45 uppercase">
        {DIFFICULTY_LABEL[difficulty]} · Shot clock {shotClock}
      </p>
    </div>
  );
}

function Side({ label, value, live }: { label: string; value: number; live: boolean }) {
  return (
    <div>
      <p
        className={cn(
          "text-[0.6rem] tracking-[0.2em] uppercase transition-colors",
          live ? "text-foreground" : "text-foreground/40",
        )}
      >
        {live ? `● ${label}` : label}
      </p>
      <p className="font-heading text-[2.75rem] leading-none tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export type PressedKeys = {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  shift: boolean;
  space: boolean;
  j: boolean;
  enter: boolean;
  p: boolean;
};

export const IDLE_KEYS: PressedKeys = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
  space: false,
  j: false,
  enter: false,
  p: false,
};

export function readPressed(held: Set<string>): PressedKeys {
  return {
    w: held.has("w") || held.has("arrowup"),
    a: held.has("a") || held.has("arrowleft"),
    s: held.has("s") || held.has("arrowdown"),
    d: held.has("d") || held.has("arrowright"),
    shift: held.has("shift"),
    space: held.has(" "),
    j: held.has("j"),
    enter: held.has("enter"),
    p: held.has("p"),
  };
}

export function samePressed(a: PressedKeys, b: PressedKeys) {
  return (
    a.w === b.w &&
    a.a === b.a &&
    a.s === b.s &&
    a.d === b.d &&
    a.shift === b.shift &&
    a.space === b.space &&
    a.j === b.j &&
    a.enter === b.enter &&
    a.p === b.p
  );
}

export function ControlsCard({
  onOffense,
  pressed,
  interactive,
  onPress,
  onRelease,
}: {
  onOffense: boolean;
  pressed: PressedKeys;
  interactive: boolean;
  onPress: (key: PadKey) => void;
  onRelease: (key: PadKey) => void;
}) {
  const shootHint = onOffense ? "Shoot" : "Block";
  const actionHint = onOffense ? "Crossover" : "Steal";

  return (
    <div className="pointer-events-none absolute bottom-6 left-5 text-background sm:bottom-8 sm:left-9">
      <p className="text-[0.58rem] tracking-[0.24em] text-background/60 uppercase">
        Controls
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-4">
        <PadGroup label="Move">
          <div className="grid w-[7.75rem] grid-cols-3 gap-1">
            <span />
            <Keycap
              label="W"
              hint="Move toward hoop"
              pressed={pressed.w}
              interactive={interactive}
              onPress={() => onPress("w")}
              onRelease={() => onRelease("w")}
            />
            <span />
            <Keycap
              label="A"
              hint="Move left"
              pressed={pressed.a}
              interactive={interactive}
              onPress={() => onPress("a")}
              onRelease={() => onRelease("a")}
            />
            <Keycap
              label="S"
              hint="Move away from hoop"
              pressed={pressed.s}
              interactive={interactive}
              onPress={() => onPress("s")}
              onRelease={() => onRelease("s")}
            />
            <Keycap
              label="D"
              hint="Move right"
              pressed={pressed.d}
              interactive={interactive}
              onPress={() => onPress("d")}
              onRelease={() => onRelease("d")}
            />
          </div>
        </PadGroup>

        <PadGroup label="Sprint">
          <Keycap
            label="Shift"
            hint="Sprint"
            wide="shift"
            pressed={pressed.shift}
            interactive={interactive}
            onPress={() => onPress("shift")}
            onRelease={() => onRelease("shift")}
          />
        </PadGroup>

        <PadGroup
          label={shootHint}
          detail={onOffense ? "Hold, release in green" : undefined}
        >
          <Keycap
            label="Space"
            hint={shootHint}
            wide="space"
            pressed={pressed.space}
            interactive={interactive}
            onPress={() => onPress(" ")}
            onRelease={() => onRelease(" ")}
          />
        </PadGroup>

        <PadGroup label={actionHint}>
          <Keycap
            label="J"
            hint={actionHint}
            pressed={pressed.j}
            interactive={interactive}
            onPress={() => onPress("j")}
            onRelease={() => onRelease("j")}
          />
        </PadGroup>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2">
        <PadGroup label="Check ball" compact>
          <Keycap
            label="Enter"
            hint="Check ball"
            wide="enter"
            pressed={pressed.enter}
            interactive={interactive}
            onPress={() => onPress("enter")}
            onRelease={() => onRelease("enter")}
          />
        </PadGroup>
        <PadGroup label="Pause" compact>
          <Keycap
            label="P"
            hint="Pause"
            pressed={pressed.p}
            interactive={interactive}
            onPress={() => onPress("p")}
            onRelease={() => onRelease("p")}
          />
        </PadGroup>
        <p className="pb-1.5 text-[0.58rem] tracking-[0.18em] text-background/50 uppercase">
          Esc leave the court
        </p>
      </div>
    </div>
  );
}

function PadGroup({
  label,
  detail,
  compact = false,
  children,
}: {
  label: string;
  detail?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <p
        className={cn(
          "tracking-[0.18em] text-background/55 uppercase",
          compact ? "mt-1 text-[0.5rem]" : "mt-1.5 text-[0.56rem]",
        )}
      >
        {label}
      </p>
      {detail ? (
        <p className="mt-0.5 text-[0.5rem] tracking-[0.14em] text-background/40 uppercase">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function Keycap({
  label,
  hint,
  pressed,
  interactive,
  wide,
  onPress,
  onRelease,
}: {
  label: string;
  hint: string;
  pressed: boolean;
  interactive: boolean;
  wide?: "shift" | "space" | "enter";
  onPress: () => void;
  onRelease: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      data-game-pad=""
      tabIndex={-1}
      disabled={!interactive}
      aria-pressed={pressed}
      aria-label={hint}
      onPointerDown={(event) => {
        if (!interactive || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress();
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onLostPointerCapture={onRelease}
      className={cn(
        "pointer-events-auto cursor-pointer touch-manipulation select-none border text-[0.68rem] tracking-[0.14em] uppercase",
        "min-h-11 transition-[transform,background-color,border-color,color,box-shadow] duration-75 ease-out disabled:pointer-events-none disabled:cursor-default",
        wide === "space" ? "min-w-[7.5rem] px-4" : wide === "shift" || wide === "enter" ? "min-w-[4.6rem] px-3" : "min-w-11 px-1.5",
        pressed
          ? "border-background bg-background text-foreground"
          : "border-background/70 bg-background/12 text-background hover:border-background hover:bg-background/22",
        pressed && !reduceMotion ? "translate-y-[2px]" : null,
        !pressed && !reduceMotion ? "shadow-[0_2px_0_0_rgba(244,239,228,0.45)]" : "shadow-none",
      )}
    >
      {label}
    </button>
  );
}

const TOAST_TONE: Record<ToastKind, string> = {
  green: "text-[#8FD8A8]",
  score: "text-background",
  steal: "text-[#F2C879]",
  block: "text-[#F0A79A]",
  info: "text-background/75",
};

export function ToastLine({ text, kind }: { text: string | null; kind: ToastKind }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center">
      <AnimatePresence mode="wait">
        {text ? (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "font-heading text-[clamp(1.75rem,4vw,3rem)] tracking-tight",
              TOAST_TONE[kind],
            )}
          >
            {text}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Panel({
  title,
  detail,
  primaryLabel,
  onPrimary,
  difficulty,
  onDifficulty,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  detail: string;
  primaryLabel: string;
  onPrimary: () => void;
  difficulty?: Difficulty;
  onDifficulty?: (value: Difficulty) => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-background/88 px-6"
    >
      <div className="max-w-md text-center">
        <p className="font-heading text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] tracking-tight text-foreground">
          {title}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-foreground/65">{detail}</p>

        {difficulty && onDifficulty ? (
          <div className="mt-8">
            <p className="text-[0.58rem] tracking-[0.24em] text-foreground/45 uppercase">
              Bot difficulty
            </p>
            <div className="mt-3 flex justify-center gap-2">
              {DIFFICULTIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onDifficulty(value)}
                  aria-pressed={value === difficulty}
                  className={cn(
                    "min-h-11 px-4 text-[0.7rem] tracking-[0.16em] uppercase transition-colors",
                    "border-b",
                    value === difficulty
                      ? "border-foreground text-foreground"
                      : "border-transparent text-foreground/45 hover:text-foreground/80",
                  )}
                >
                  {DIFFICULTY_LABEL[value]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-9 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onPrimary}
            className="min-h-11 text-xs tracking-[0.2em] text-foreground uppercase transition-opacity hover:opacity-70 focus-visible:underline focus-visible:underline-offset-4"
          >
            {primaryLabel}
          </button>
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="min-h-11 text-[0.68rem] tracking-[0.18em] text-foreground/50 uppercase transition-colors hover:text-foreground focus-visible:underline focus-visible:underline-offset-4"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
