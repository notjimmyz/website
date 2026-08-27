"use client";

import { useEffect, useRef, type RefObject } from "react";
import { emptyInput, type Input } from "@/lib/basketball/types";

const MOVE_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
]);

const HANDLED = new Set([
  ...MOVE_KEYS,
  " ",
  "shift",
  "j",
  "enter",
  "p",
]);

export type GameKeys = {
  input: Input;
  /** Edge flags consumed by the simulation each frame. */
  clearEdges: () => void;
  pausePressed: boolean;
  clearPause: () => void;
};

export function useGameKeys(active: boolean): RefObject<GameKeys> {
  const ref = useRef<GameKeys>({
    input: emptyInput(),
    clearEdges: () => {},
    pausePressed: false,
    clearPause: () => {},
  });

  useEffect(() => {
    const held = new Set<string>();
    const state = ref.current;

    state.clearEdges = () => {
      state.input.shootPressed = false;
      state.input.shootReleased = false;
      state.input.actionPressed = false;
      state.input.startPressed = false;
    };

    state.clearPause = () => {
      state.pausePressed = false;
    };

    const syncMovement = () => {
      const input = state.input;
      const left = held.has("a") || held.has("arrowleft");
      const right = held.has("d") || held.has("arrowright");
      const towardHoop = held.has("w") || held.has("arrowup");
      const away = held.has("s") || held.has("arrowdown");

      input.moveX = (right ? 1 : 0) - (left ? 1 : 0);
      // Screen "up" heads toward the rim, which is decreasing world y.
      input.moveY = (away ? 1 : 0) - (towardHoop ? 1 : 0);
      input.sprint = held.has("shift");
      input.shootHeld = held.has(" ");
    };

    const reset = () => {
      held.clear();
      const input = state.input;
      input.moveX = 0;
      input.moveY = 0;
      input.sprint = false;
      input.shootHeld = false;
      state.clearEdges();
    };

    if (!active) {
      reset();
      return;
    }

    const normalize = (event: KeyboardEvent) => {
      if (event.key === "Shift") return "shift";
      return event.key.toLowerCase();
    };

    // Leave keys alone while a control has focus, so the back button and the
    // difficulty buttons stay operable from the keyboard.
    const onControl = (target: EventTarget | null) =>
      target instanceof Element && target.closest("button, a, input, select, textarea") !== null;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = normalize(event);
      if (!HANDLED.has(key)) return;
      if (onControl(event.target)) return;

      // Space and the arrows would otherwise scroll the page or activate the
      // focused back button.
      event.preventDefault();
      if (event.repeat) return;

      held.add(key);

      if (key === " ") state.input.shootPressed = true;
      if (key === "j") state.input.actionPressed = true;
      if (key === "enter") state.input.startPressed = true;
      if (key === "p") state.pausePressed = true;

      syncMovement();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = normalize(event);
      if (!HANDLED.has(key)) return;
      if (onControl(event.target)) return;

      event.preventDefault();
      held.delete(key);

      if (key === " ") state.input.shootReleased = true;

      syncMovement();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
      reset();
    };
  }, [active]);

  return ref;
}
