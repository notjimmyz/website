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

export type PadKey =
  | "w"
  | "a"
  | "s"
  | "d"
  | "shift"
  | " "
  | "j"
  | "enter"
  | "p";

export type GameKeys = {
  input: Input;
  /** Union of keyboard and on-screen key holds. */
  held: Set<string>;
  /** Edge flags consumed by the simulation each frame. */
  clearEdges: () => void;
  pausePressed: boolean;
  clearPause: () => void;
  press: (key: PadKey) => void;
  release: (key: PadKey) => void;
};

export function useGameKeys(active: boolean): RefObject<GameKeys> {
  const ref = useRef<GameKeys>({
    input: emptyInput(),
    held: new Set(),
    clearEdges: () => {},
    pausePressed: false,
    clearPause: () => {},
    press: () => {},
    release: () => {},
  });

  useEffect(() => {
    const keyboard = new Set<string>();
    const pointer = new Set<string>();
    const state = ref.current;
    const held = state.held;

    const rebuildHeld = () => {
      held.clear();
      keyboard.forEach((key) => held.add(key));
      pointer.forEach((key) => held.add(key));
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

    const setKey = (source: Set<string>, key: string, down: boolean) => {
      if (!HANDLED.has(key)) return;

      const was = held.has(key);
      if (down) source.add(key);
      else source.delete(key);
      rebuildHeld();
      const is = held.has(key);

      if (!was && is) {
        if (key === " ") state.input.shootPressed = true;
        if (key === "j") state.input.actionPressed = true;
        if (key === "enter") state.input.startPressed = true;
        if (key === "p") state.pausePressed = true;
      }
      if (was && !is && key === " ") state.input.shootReleased = true;

      syncMovement();
    };

    state.clearEdges = () => {
      state.input.shootPressed = false;
      state.input.shootReleased = false;
      state.input.actionPressed = false;
      state.input.startPressed = false;
    };

    state.clearPause = () => {
      state.pausePressed = false;
    };

    const reset = () => {
      keyboard.clear();
      pointer.clear();
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

    state.press = (key) => setKey(pointer, key, true);
    state.release = (key) => setKey(pointer, key, false);

    const normalize = (event: KeyboardEvent) => {
      if (event.key === "Shift") return "shift";
      return event.key.toLowerCase();
    };

    // Leave keys alone while a control has focus, so the back button and the
    // difficulty buttons stay operable from the keyboard.
    const onControl = (target: EventTarget | null) =>
      target instanceof Element &&
      target.closest("[data-game-pad]") === null &&
      target.closest("button, a, input, select, textarea") !== null;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = normalize(event);
      if (!HANDLED.has(key)) return;
      if (onControl(event.target)) return;

      // Space and the arrows would otherwise scroll the page or activate the
      // focused back button.
      event.preventDefault();
      if (event.repeat) return;

      setKey(keyboard, key, true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = normalize(event);
      if (!HANDLED.has(key)) return;
      if (onControl(event.target)) return;

      event.preventDefault();
      setKey(keyboard, key, false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
      state.press = () => {};
      state.release = () => {};
      reset();
    };
  }, [active]);

  return ref;
}
