"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useGameKeys } from "@/hooks/use-game-keys";
import { useGameLoop } from "@/hooks/use-game-loop";
import { decideBot } from "@/lib/basketball/bot";
import { project, screenPan, SCREEN_H, SCREEN_W, SIN_PITCH } from "@/lib/basketball/camera";
import { PLAYER_HEIGHT, SHOT_CLOCK } from "@/lib/basketball/constants";
import { distanceToHoop } from "@/lib/basketball/court";
import { KIT, METER } from "@/lib/basketball/palette";
import { contestOn, greenWindow } from "@/lib/basketball/shot";
import { createGame, resetGame, step as advance } from "@/lib/basketball/step";
import type {
  Actor,
  Ball,
  Difficulty,
  GameState,
  Phase,
  Pose,
  Team,
  ToastKind,
} from "@/lib/basketball/types";
import { Court } from "./Court";
import { ControlsCard, Panel, Scoreboard, ToastLine } from "./Hud";
import { ActorSprite, BallSprite, METER_H, METER_RANGE, ShotMeter } from "./Sprites";

const POSES: Pose[] = ["run", "shoot", "reach"];

const COARSE_QUERY = "(pointer: coarse)";

function subscribeToPointer(onChange: () => void) {
  const query = window.matchMedia(COARSE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useCoarsePointer() {
  return useSyncExternalStore(
    subscribeToPointer,
    () => window.matchMedia(COARSE_QUERY).matches,
    () => false,
  );
}

type ActorNodes = {
  root: SVGGElement;
  body: SVGGElement;
  shadow: SVGEllipseElement;
  poses: Record<Pose, SVGGElement>;
  lastPose: Pose;
};

type SceneNodes = {
  scene: SVGGElement;
  dynamic: SVGGElement;
  user: ActorNodes;
  bot: ActorNodes;
  ball: { body: SVGGElement; shadow: SVGEllipseElement };
  meter: {
    root: SVGGElement;
    window: SVGRectElement;
    fill: SVGRectElement;
    tick: SVGLineElement;
  };
  userIsNear: boolean | null;
};

function collectNodes(svg: SVGSVGElement): SceneNodes | null {
  const pick = <T extends Element>(name: string) =>
    svg.querySelector<T>(`[data-node="${name}"]`);

  const readActor = (name: string): ActorNodes | null => {
    const root = pick<SVGGElement>(`${name}-root`);
    const body = pick<SVGGElement>(`${name}-body`);
    const shadow = pick<SVGEllipseElement>(`${name}-shadow`);
    const run = pick<SVGGElement>(`${name}-pose-run`);
    const shoot = pick<SVGGElement>(`${name}-pose-shoot`);
    const reach = pick<SVGGElement>(`${name}-pose-reach`);
    if (!root || !body || !shadow || !run || !shoot || !reach) return null;
    return { root, body, shadow, poses: { run, shoot, reach }, lastPose: "run" };
  };

  const scene = pick<SVGGElement>("scene");
  const dynamic = pick<SVGGElement>("dynamic");
  const user = readActor("user");
  const bot = readActor("bot");
  const ballBody = pick<SVGGElement>("ball-body");
  const ballShadow = pick<SVGEllipseElement>("ball-shadow");
  const meterRoot = pick<SVGGElement>("meter-root");
  const meterWindow = pick<SVGRectElement>("meter-window");
  const meterFill = pick<SVGRectElement>("meter-fill");
  const meterTick = pick<SVGLineElement>("meter-tick");

  if (
    !scene ||
    !dynamic ||
    !user ||
    !bot ||
    !ballBody ||
    !ballShadow ||
    !meterRoot ||
    !meterWindow ||
    !meterFill ||
    !meterTick
  ) {
    return null;
  }

  return {
    scene,
    dynamic,
    user,
    bot,
    ball: { body: ballBody, shadow: ballShadow },
    meter: { root: meterRoot, window: meterWindow, fill: meterFill, tick: meterTick },
    userIsNear: null,
  };
}

function paintActor(nodes: ActorNodes, actor: Actor) {
  const p = project(actor.x, actor.y, actor.z);
  nodes.body.setAttribute(
    "transform",
    `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(p.k * actor.facing).toFixed(3)} ${p.k.toFixed(3)})`,
  );

  const ground = project(actor.x, actor.y, 0);
  const rx = 1.15 * ground.k;
  nodes.shadow.setAttribute("cx", ground.x.toFixed(1));
  nodes.shadow.setAttribute("cy", ground.y.toFixed(1));
  nodes.shadow.setAttribute("rx", rx.toFixed(1));
  nodes.shadow.setAttribute("ry", (rx * SIN_PITCH).toFixed(1));
  nodes.shadow.setAttribute("opacity", (0.22 * (1 - Math.min(1, actor.z / 5))).toFixed(2));

  if (nodes.lastPose !== actor.pose) {
    for (const pose of POSES) {
      nodes.poses[pose].setAttribute("display", pose === actor.pose ? "inline" : "none");
    }
    nodes.lastPose = actor.pose;
  }
}

function paintBall(nodes: SceneNodes["ball"], ball: Ball) {
  const p = project(ball.x, ball.y, ball.z);
  nodes.body.setAttribute(
    "transform",
    `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.k.toFixed(3)})`,
  );

  const ground = project(ball.x, ball.y, 0);
  const rx = 0.5 * ground.k;
  nodes.shadow.setAttribute("cx", ground.x.toFixed(1));
  nodes.shadow.setAttribute("cy", ground.y.toFixed(1));
  nodes.shadow.setAttribute("rx", rx.toFixed(1));
  nodes.shadow.setAttribute("ry", (rx * SIN_PITCH).toFixed(1));
  nodes.shadow.setAttribute("opacity", (0.2 * (1 - Math.min(1, ball.z / 13))).toFixed(2));
}

function paintMeter(nodes: SceneNodes["meter"], state: GameState) {
  const meter = state.user.meter;
  const showing = meter.active || state.t < meter.flashUntil;
  nodes.root.setAttribute("display", showing ? "inline" : "none");
  if (!showing) return;

  const anchor = project(state.user.x, state.user.y, PLAYER_HEIGHT + 1.6);
  nodes.root.setAttribute(
    "transform",
    `translate(${(anchor.x + 30).toFixed(1)} ${(anchor.y - METER_H).toFixed(1)})`,
  );

  // While the meter is live the window is recomputed every frame, so a closing
  // defender visibly squeezes the green.
  const half = meter.active
    ? greenWindow(
        state.difficulty,
        contestOn(state.user, state.bot),
        distanceToHoop(state.user.x, state.user.y),
      )
    : meter.half;

  const top = (value: number) =>
    METER_H * (1 - Math.min(METER_RANGE, Math.max(0, value)) / METER_RANGE);

  const bandTop = top(meter.center + half);
  const bandBottom = top(meter.center - half);
  nodes.window.setAttribute("y", bandTop.toFixed(1));
  nodes.window.setAttribute("height", Math.max(2, bandBottom - bandTop).toFixed(1));

  const fillTop = top(meter.value);
  nodes.fill.setAttribute("y", fillTop.toFixed(1));
  nodes.fill.setAttribute("height", Math.max(0, METER_H - fillTop).toFixed(1));
  nodes.fill.setAttribute(
    "fill",
    meter.active ? METER.fill : meter.greened ? METER.green : METER.miss,
  );

  const tick = top(meter.center).toFixed(1);
  nodes.tick.setAttribute("y1", tick);
  nodes.tick.setAttribute("y2", tick);
}

function paintScene(nodes: SceneNodes, state: GameState, reduceMotion: boolean) {
  const pan = reduceMotion ? 0 : screenPan(state.ball.x);
  nodes.scene.setAttribute("transform", `translate(${pan.toFixed(1)} 0)`);

  paintActor(nodes.user, state.user);
  paintActor(nodes.bot, state.bot);
  paintBall(nodes.ball, state.ball);
  paintMeter(nodes.meter, state);

  // Painter's order: whoever is further from the camera is drawn first.
  const userIsNear = state.user.y > state.bot.y;
  if (nodes.userIsNear !== userIsNear) {
    const far = userIsNear ? nodes.bot.root : nodes.user.root;
    nodes.dynamic.insertBefore(far, nodes.dynamic.firstChild);
    nodes.userIsNear = userIsNear;
  }
}

type Hud = {
  scoreUser: number;
  scoreBot: number;
  possession: Team;
  phase: Phase;
  shotClock: number;
  toast: string | null;
  toastKind: ToastKind;
  winner: Team | null;
};

function readHud(state: GameState): Hud {
  return {
    scoreUser: state.scoreUser,
    scoreBot: state.scoreBot,
    possession: state.possession,
    phase: state.phase,
    shotClock: Math.ceil(state.shotClock),
    toast: state.toast?.text ?? null,
    toastKind: state.toast?.kind ?? "info",
    winner: state.winner,
  };
}

function sameHud(a: Hud, b: Hud) {
  return (
    a.scoreUser === b.scoreUser &&
    a.scoreBot === b.scoreBot &&
    a.possession === b.possession &&
    a.phase === b.phase &&
    a.shotClock === b.shotClock &&
    a.toast === b.toast &&
    a.toastKind === b.toastKind &&
    a.winner === b.winner
  );
}

export function BasketballGame() {
  const reduceMotion = useReducedMotion();
  const [game] = useState(() => createGame("normal"));
  const [hud, setHud] = useState<Hud>(() => readHud(game));
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const coarsePointer = useCoarsePointer();

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodesRef = useRef<SceneNodes | null>(null);
  const hudRef = useRef<Hud>(hud);
  const reduceRef = useRef(false);

  const playing = started && !paused && hud.phase !== "over";
  const keys = useGameKeys(playing);

  useEffect(() => {
    reduceRef.current = Boolean(reduceMotion);
  }, [reduceMotion]);

  const step = useCallback(
    (dt: number) => {
      const pad = keys.current;
      advance(game, pad.input, decideBot(game, dt), dt);
      pad.clearEdges();
    },
    [game, keys],
  );

  const render = useCallback(() => {
    const nodes = nodesRef.current;
    if (nodes) paintScene(nodes, game, reduceRef.current);

    const next = readHud(game);
    if (!sameHud(hudRef.current, next)) {
      hudRef.current = next;
      setHud(next);
    }
  }, [game]);

  useGameLoop({ active: playing, step, render });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const nodes = collectNodes(svg);
    nodesRef.current = nodes;
    if (nodes) paintScene(nodes, game, reduceRef.current);
  }, [game]);

  const focusSurface = useCallback(() => {
    // Runs after the era caption grabs focus, so the court owns the keyboard.
    requestAnimationFrame(() => surfaceRef.current?.focus());
  }, []);

  useEffect(() => {
    focusSurface();
  }, [focusSurface]);

  const beginMatch = useCallback(
    (value: Difficulty) => {
      resetGame(game, value);
      const next = readHud(game);
      hudRef.current = next;
      setHud(next);
      setPaused(false);
      setStarted(true);
      const nodes = nodesRef.current;
      if (nodes) paintScene(nodes, game, reduceRef.current);
      focusSurface();
    },
    [game, focusSurface],
  );

  const idle = !started || hud.phase === "over";

  useEffect(() => {
    if (!idle) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      if (event.target instanceof Element && event.target.closest("button")) return;
      event.preventDefault();
      beginMatch(difficulty);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [beginMatch, difficulty, idle]);

  useEffect(() => {
    if (idle) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "p") return;
      if (event.target instanceof Element && event.target.closest("button")) return;
      event.preventDefault();
      setPaused((value) => !value);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [idle]);

  const prompt =
    hud.phase === "check"
      ? hud.possession === "user"
        ? "Your ball — Enter to check it up"
        : "CPU ball"
      : null;

  return (
    <div
      ref={surfaceRef}
      tabIndex={-1}
      className="relative h-full w-full outline-none"
      aria-label="Basketball one on one"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <g data-node="scene">
          <Court />
          <g data-node="dynamic">
            <ActorSprite name="bot" kit={KIT.bot} />
            <ActorSprite name="user" kit={KIT.user} />
            <BallSprite />
          </g>
          <ShotMeter />
        </g>
      </svg>

      <Scoreboard
        scoreUser={hud.scoreUser}
        scoreBot={hud.scoreBot}
        possession={hud.possession}
        shotClock={Math.min(SHOT_CLOCK, hud.shotClock)}
        difficulty={difficulty}
      />
      <ControlsCard onOffense={hud.possession === "user"} />
      <ToastLine text={hud.toast ?? prompt} kind={hud.toast ? hud.toastKind : "info"} />

      <p className="sr-only" aria-live="polite">
        {`You ${hud.scoreUser}, CPU ${hud.scoreBot}. ${
          hud.possession === "user" ? "Your possession." : "CPU possession."
        }`}
      </p>

      <AnimatePresence>
        {!started ? (
          <Panel
            key="intro"
            title="One on one"
            detail={
              coarsePointer
                ? "Built for a keyboard, so this one plays best on a laptop. First to seven, twos from behind the arc, and make it to keep it."
                : "First to seven. Twos from behind the arc, and make it to keep it. Hold Space, then release inside the green to shoot."
            }
            primaryLabel="Check the ball"
            onPrimary={() => beginMatch(difficulty)}
            difficulty={difficulty}
            onDifficulty={setDifficulty}
          />
        ) : null}

        {started && paused && hud.phase !== "over" ? (
          <Panel
            key="paused"
            title="Paused"
            detail="Take a breath. Picking a new difficulty starts a fresh game."
            primaryLabel="Resume"
            onPrimary={() => {
              setPaused(false);
              focusSurface();
            }}
            difficulty={difficulty}
            onDifficulty={(value) => {
              setDifficulty(value);
              beginMatch(value);
            }}
            secondaryLabel="Restart"
            onSecondary={() => beginMatch(difficulty)}
          />
        ) : null}

        {started && hud.phase === "over" ? (
          <Panel
            key="over"
            title={hud.winner === "user" ? "Your game." : "CPU takes it."}
            detail={`Final score ${hud.scoreUser} to ${hud.scoreBot}.`}
            primaryLabel="Run it back"
            onPrimary={() => beginMatch(difficulty)}
            difficulty={difficulty}
            onDifficulty={setDifficulty}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
