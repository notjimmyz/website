"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { emptyInput, type Input } from "@/lib/tennis/types";

const MOVE_KEYS = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];

const HANDLED = new Set([...MOVE_KEYS, "j", "k", "l", "p"]);

export type PadKey = "w" | "a" | "s" | "d" | "j" | "k" | "l" | "p";

export type PressedKeys = Record<PadKey, boolean>;

export const IDLE_KEYS: PressedKeys = {
  w: false,
  a: false,
  s: false,
  d: false,
  j: false,
  k: false,
  l: false,
  p: false,
};

function readPressed(held: Set<string>): PressedKeys {
  return {
    w: held.has("w") || held.has("arrowup"),
    a: held.has("a") || held.has("arrowleft"),
    s: held.has("s") || held.has("arrowdown"),
    d: held.has("d") || held.has("arrowright"),
    j: held.has("j"),
    k: held.has("k"),
    l: held.has("l"),
    p: held.has("p"),
  };
}

export type TennisKeys = {
  input: Input;
  /** Edge flags consumed by the simulation each frame. */
  clearEdges: () => void;
  pausePressed: boolean;
  clearPause: () => void;
  press: (key: PadKey) => void;
  release: (key: PadKey) => void;
};

export function useTennisKeys(active: boolean): {
  keys: RefObject<TennisKeys>;
  pressed: PressedKeys;
} {
  const ref = useRef<TennisKeys>({
    input: emptyInput(),
    clearEdges: () => {},
    pausePressed: false,
    clearPause: () => {},
    press: () => {},
    release: () => {},
  });
  const [pressed, setPressed] = useState<PressedKeys>(IDLE_KEYS);
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setPressed(IDLE_KEYS);
  }

  useEffect(() => {
    const keyboard = new Set<string>();
    const pointer = new Set<string>();
    const held = new Set<string>();
    const state = ref.current;

    const rebuild = () => {
      held.clear();
      keyboard.forEach((key) => held.add(key));
      pointer.forEach((key) => held.add(key));
    };

    const syncMovement = () => {
      const input = state.input;
      const left = held.has("a") || held.has("arrowleft");
      const right = held.has("d") || held.has("arrowright");
      const up = held.has("w") || held.has("arrowup");
      const down = held.has("s") || held.has("arrowdown");

      input.moveX = (right ? 1 : 0) - (left ? 1 : 0);
      // Screen "up" heads toward the net, which the simulation reads as -1.
      input.moveY = (down ? 1 : 0) - (up ? 1 : 0);
    };

    const setKey = (source: Set<string>, key: string, down: boolean) => {
      if (!HANDLED.has(key)) return;

      const was = held.has(key);
      if (down) source.add(key);
      else source.delete(key);
      rebuild();
      const is = held.has(key);

      if (!was && is) {
        if (key === "j") state.input.topspin = true;
        if (key === "k") state.input.drop = true;
        if (key === "l") state.input.lob = true;
        if (key === "p") state.pausePressed = true;
      }

      syncMovement();
      setPressed(readPressed(held));
    };

    state.clearEdges = () => {
      state.input.topspin = false;
      state.input.drop = false;
      state.input.lob = false;
    };

    state.clearPause = () => {
      state.pausePressed = false;
    };

    const reset = (announce: boolean) => {
      keyboard.clear();
      pointer.clear();
      held.clear();
      state.input.moveX = 0;
      state.input.moveY = 0;
      state.clearEdges();
      if (announce) setPressed(IDLE_KEYS);
    };

    if (!active) {
      reset(false);
      return;
    }

    state.press = (key) => setKey(pointer, key, true);
    state.release = (key) => setKey(pointer, key, false);

    // Leave keys alone while a control has focus, so the back button and the
    // difficulty buttons stay operable from the keyboard.
    const onControl = (target: EventTarget | null) =>
      target instanceof Element &&
      target.closest("[data-game-pad]") === null &&
      target.closest("button, a, input, select, textarea") !== null;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!HANDLED.has(key)) return;
      if (onControl(event.target)) return;

      event.preventDefault();
      if (event.repeat) return;
      setKey(keyboard, key, true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!HANDLED.has(key)) return;
      if (onControl(event.target)) return;

      event.preventDefault();
      setKey(keyboard, key, false);
    };

    const onBlur = () => reset(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      state.press = () => {};
      state.release = () => {};
      reset(false);
    };
  }, [active]);

  return { keys: ref, pressed: active ? pressed : IDLE_KEYS };
}
