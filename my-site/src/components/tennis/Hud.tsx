"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PadKey, PressedKeys } from "@/hooks/use-tennis-keys";
import { DIFFICULTY_LABEL } from "@/lib/tennis/bot";
import { GAMES_TO_WIN } from "@/lib/tennis/constants";
import type { Difficulty, TimingGrade, ToastKind } from "@/lib/tennis/types";
import { cn } from "@/lib/utils";

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export function Scoreboard({
  gamesUser,
  gamesBot,
  pointUser,
  pointBot,
  serving,
  tiebreak,
  difficulty,
}: {
  gamesUser: number;
  gamesBot: number;
  pointUser: string;
  pointBot: string;
  serving: "user" | "bot";
  tiebreak: boolean;
  difficulty: Difficulty;
}) {
  return (
    <div className="pointer-events-none absolute top-10 right-6 text-right sm:top-14 sm:right-10">
      <p className="text-[0.58rem] tracking-[0.24em] text-foreground/50 uppercase">
        {tiebreak ? "Tiebreak" : `First to ${GAMES_TO_WIN} games`}
      </p>
      <div className="mt-2 flex items-end justify-end gap-5">
        <Side label="You" games={gamesUser} point={pointUser} serving={serving === "user"} />
        <span className="font-heading pb-1 text-xl text-foreground/25">/</span>
        <Side label="CPU" games={gamesBot} point={pointBot} serving={serving === "bot"} />
      </div>
      <p className="mt-2 text-[0.6rem] tracking-[0.2em] text-foreground/45 uppercase">
        {DIFFICULTY_LABEL[difficulty]}
      </p>
    </div>
  );
}

function Side({
  label,
  games,
  point,
  serving,
}: {
  label: string;
  games: number;
  point: string;
  serving: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-[0.6rem] tracking-[0.2em] uppercase transition-colors",
          serving ? "text-foreground" : "text-foreground/40",
        )}
      >
        {serving ? `● ${label}` : label}
      </p>
      <div className="flex items-baseline justify-end gap-2">
        <span className="font-heading text-[2.75rem] leading-none tracking-tight text-foreground">
          {games}
        </span>
        <span className="text-sm tracking-[0.12em] text-foreground/55 tabular-nums">
          {point}
        </span>
      </div>
    </div>
  );
}

const GRADE_LABEL: Record<TimingGrade, string> = {
  "very-early": "Very early",
  early: "Early",
  "on-time": "On time",
  late: "Late",
  "very-late": "Very late",
};

const GRADE_TONE: Record<TimingGrade, string> = {
  "very-early": "text-[#D9877B]",
  early: "text-[#E0B45C]",
  "on-time": "text-[#6FBE8A]",
  late: "text-[#E0B45C]",
  "very-late": "text-[#D9877B]",
};

export function TimingFlash({ grade, tick }: { grade: TimingGrade | null; tick: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[26%] flex justify-center">
      <AnimatePresence mode="wait">
        {grade ? (
          <motion.p
            key={`${grade}-${tick}`}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "font-heading text-[clamp(1.6rem,3.4vw,2.6rem)] tracking-[0.06em] uppercase",
              GRADE_TONE[grade],
            )}
          >
            {GRADE_LABEL[grade]}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const TOAST_TONE: Record<ToastKind, string> = {
  info: "text-foreground/70",
  fault: "text-[#C4625A]",
  point: "text-foreground",
  good: "text-[#3F8C63]",
};

export function ToastLine({ text, kind }: { text: string | null; kind: ToastKind }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[13%] flex justify-center px-6">
      <AnimatePresence mode="wait">
        {text ? (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "font-heading text-center text-[clamp(1.5rem,3vw,2.4rem)] tracking-tight",
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

export function ControlsCard({
  aiming,
  pressed,
  interactive,
  onPress,
  onRelease,
}: {
  aiming: boolean;
  pressed: PressedKeys;
  interactive: boolean;
  onPress: (key: PadKey) => void;
  onRelease: (key: PadKey) => void;
}) {
  const cap = (key: PadKey, label: string, hint: string, wide?: boolean) => (
    <Keycap
      label={label}
      hint={hint}
      wide={wide}
      pressed={pressed[key]}
      interactive={interactive}
      onPress={() => onPress(key)}
      onRelease={() => onRelease(key)}
    />
  );

  return (
    <div className="pointer-events-none absolute bottom-6 left-5 sm:bottom-8 sm:left-9">
      <p className="text-[0.58rem] tracking-[0.24em] text-foreground/50 uppercase">
        {aiming ? "Aiming" : "Controls"}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-4">
        <PadGroup label={aiming ? "Aim" : "Move"} detail={aiming ? "W deep · S short" : undefined}>
          <div className="grid w-fit grid-cols-3 gap-1">
            <span />
            {cap("w", "W", aiming ? "Aim deep" : "Move up")}
            <span />
            {cap("a", "A", aiming ? "Aim left" : "Move left")}
            {cap("s", "S", aiming ? "Aim short" : "Move down")}
            {cap("d", "D", aiming ? "Aim right" : "Move right")}
          </div>
        </PadGroup>

        <PadGroup label="Topspin">{cap("j", "J", "Topspin")}</PadGroup>
        <PadGroup label="Drop">{cap("k", "K", "Drop shot")}</PadGroup>
        <PadGroup label="Lob">{cap("l", "L", "Lob")}</PadGroup>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2">
        <PadGroup label="Pause" compact>
          {cap("p", "P", "Pause")}
        </PadGroup>
        <p className="pb-1.5 text-[0.58rem] tracking-[0.18em] text-foreground/45 uppercase">
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
          "tracking-[0.18em] text-foreground/55 uppercase",
          compact ? "mt-1 text-[0.5rem]" : "mt-1.5 text-[0.56rem]",
        )}
      >
        {label}
      </p>
      {detail ? (
        <p className="mt-0.5 text-[0.5rem] tracking-[0.14em] text-foreground/40 uppercase">
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
  wide?: boolean;
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
        wide ? "min-w-[4.6rem] px-3" : "min-w-11 px-1.5",
        pressed
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/45 bg-background/50 text-foreground hover:border-foreground hover:bg-background/80",
        pressed && !reduceMotion ? "translate-y-[2px]" : null,
        !pressed && !reduceMotion ? "shadow-[0_2px_0_0_rgba(44,64,52,0.28)]" : "shadow-none",
      )}
    >
      {label}
    </button>
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
  detail: React.ReactNode;
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
      className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 px-6"
    >
      <div className="max-w-md text-center">
        <p className="font-heading text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] tracking-tight text-foreground">
          {title}
        </p>
        <div className="mt-4 text-sm leading-relaxed text-foreground/65">{detail}</div>

        {difficulty && onDifficulty ? (
          <div className="mt-8">
            <p className="text-[0.58rem] tracking-[0.24em] text-foreground/45 uppercase">
              Opponent
            </p>
            <div className="mt-3 flex justify-center gap-2">
              {DIFFICULTIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onDifficulty(value)}
                  aria-pressed={value === difficulty}
                  className={cn(
                    "min-h-11 border-b px-4 text-[0.7rem] tracking-[0.16em] uppercase transition-colors",
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
