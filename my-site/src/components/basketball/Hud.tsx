"use client";

import { AnimatePresence, motion } from "motion/react";
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

export function ControlsCard({ onOffense }: { onOffense: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-7 left-6 text-background sm:bottom-9 sm:left-10">
      <p className="text-[0.58rem] tracking-[0.24em] text-background/60 uppercase">
        Controls
      </p>
      <div className="mt-3 flex flex-wrap gap-x-10 gap-y-4">
        <Group
          title="Always"
          rows={[
            ["Move", "W A S D"],
            ["Sprint", "Shift"],
          ]}
        />
        <Group
          title="Offense"
          dim={!onOffense}
          rows={[
            ["Shoot", "Space — release in the green"],
            ["Crossover", "J"],
          ]}
        />
        <Group
          title="Defense"
          dim={onOffense}
          rows={[
            ["Block", "Space"],
            ["Steal", "J"],
          ]}
        />
      </div>
      <p className="mt-4 text-[0.6rem] tracking-[0.18em] text-background/50 uppercase">
        Enter check ball · P pause · Esc leave the court
      </p>
    </div>
  );
}

function Group({
  title,
  rows,
  dim = false,
}: {
  title: string;
  rows: Array<[string, string]>;
  dim?: boolean;
}) {
  return (
    <div className={cn("transition-opacity duration-300", dim ? "opacity-40" : "opacity-100")}>
      <p className="text-[0.56rem] tracking-[0.2em] text-background/55 uppercase">{title}</p>
      <dl className="mt-1.5 space-y-1">
        {rows.map(([key, value]) => (
          <div key={key} className="flex items-baseline gap-2.5">
            <dt className="text-[0.68rem] tracking-[0.12em] text-background/70 uppercase">
              {key}
            </dt>
            <dd className="text-[0.78rem] text-background">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
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
