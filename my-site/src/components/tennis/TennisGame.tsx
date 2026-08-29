"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameLoop } from "@/hooks/use-game-loop";
import { useTennisKeys, type PadKey } from "@/hooks/use-tennis-keys";
import { decideBot } from "@/lib/tennis/bot";
import {
  project,
  screenPan,
  SCREEN_H,
  SCREEN_W,
  SIN_PITCH,
} from "@/lib/tennis/camera";
import { KIT } from "@/lib/tennis/palette";
import { createMatch, resetMatch, step as advance } from "@/lib/tennis/step";
import type {
  Actor,
  Ball,
  Difficulty,
  GameState,
  Phase,
  Pose,
  Team,
  TimingGrade,
  ToastKind,
} from "@/lib/tennis/types";
import { Court } from "./Court";
import { ControlsCard, Panel, Scoreboard, TimingFlash, ToastLine } from "./Hud";
import { BallSprite, PlayerSprite, POSES } from "./Sprites";

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
  userIsNear: boolean | null;
};

function collectNodes(svg: SVGSVGElement): SceneNodes | null {
  const pick = <T extends Element>(name: string) =>
    svg.querySelector<T>(`[data-node="${name}"]`);

  const readActor = (name: string): ActorNodes | null => {
    const root = pick<SVGGElement>(`${name}-root`);
    const body = pick<SVGGElement>(`${name}-body`);
    const shadow = pick<SVGEllipseElement>(`${name}-shadow`);
    if (!root || !body || !shadow) return null;

    const poses = {} as Record<Pose, SVGGElement>;
    for (const pose of POSES) {
      const node = pick<SVGGElement>(`${name}-pose-${pose}`);
      if (!node) return null;
      poses[pose] = node;
    }
    return { root, body, shadow, poses, lastPose: "ready" };
  };

  const scene = pick<SVGGElement>("scene");
  const dynamic = pick<SVGGElement>("dynamic");
  const user = readActor("user");
  const bot = readActor("bot");
  const ballBody = pick<SVGGElement>("ball-body");
  const ballShadow = pick<SVGEllipseElement>("ball-shadow");

  if (!scene || !dynamic || !user || !bot || !ballBody || !ballShadow) return null;

  return {
    scene,
    dynamic,
    user,
    bot,
    ball: { body: ballBody, shadow: ballShadow },
    userIsNear: null,
  };
}

function paintActor(nodes: ActorNodes, actor: Actor) {
  const p = project(actor.x, actor.y, 0);
  nodes.body.setAttribute(
    "transform",
    `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(p.k * actor.facing).toFixed(3)} ${p.k.toFixed(3)})`,
  );

  const rx = 1.05 * p.k;
  nodes.shadow.setAttribute("cx", p.x.toFixed(1));
  nodes.shadow.setAttribute("cy", p.y.toFixed(1));
  nodes.shadow.setAttribute("rx", rx.toFixed(1));
  nodes.shadow.setAttribute("ry", (rx * SIN_PITCH).toFixed(1));

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
    `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.k.toFixed(3)}) rotate(${((ball.spin * 40) % 360).toFixed(0)})`,
  );

  const ground = project(ball.x, ball.y, 0);
  const rx = 0.42 * ground.k;
  nodes.shadow.setAttribute("cx", ground.x.toFixed(1));
  nodes.shadow.setAttribute("cy", ground.y.toFixed(1));
  nodes.shadow.setAttribute("rx", rx.toFixed(1));
  nodes.shadow.setAttribute("ry", (rx * SIN_PITCH).toFixed(1));
  nodes.shadow.setAttribute("opacity", (0.2 * (1 - Math.min(0.85, ball.z / 16))).toFixed(2));
}

function paintScene(nodes: SceneNodes, state: GameState, reduceMotion: boolean) {
  const pan = reduceMotion ? 0 : screenPan(state.ball.x);
  nodes.scene.setAttribute("transform", `translate(${pan.toFixed(1)} 0)`);

  paintActor(nodes.user, state.user);
  paintActor(nodes.bot, state.bot);
  paintBall(nodes.ball, state.ball);

  // Painter's order: whoever is further from the camera is drawn first.
  const userIsNear = state.user.y > state.bot.y;
  if (nodes.userIsNear !== userIsNear) {
    const far = userIsNear ? nodes.bot.root : nodes.user.root;
    nodes.dynamic.insertBefore(far, nodes.dynamic.firstChild);
    nodes.userIsNear = userIsNear;
  }
}

const POINT_NAMES = ["0", "15", "30", "40"];

function pointLabel(state: GameState, team: Team) {
  const score = state.score;
  const mine = score.points[team];
  const theirs = score.points[team === "user" ? "bot" : "user"];
  if (score.tiebreak) return String(mine);
  if (mine >= 3 && theirs >= 3) {
    if (mine === theirs) return "40";
    return mine > theirs ? "Ad" : "—";
  }
  return POINT_NAMES[mine] ?? "40";
}

type Hud = {
  gamesUser: number;
  gamesBot: number;
  pointUser: string;
  pointBot: string;
  server: Team;
  tiebreak: boolean;
  phase: Phase;
  serveStage: GameState["serveStage"];
  faults: number;
  aiming: boolean;
  toast: string | null;
  toastKind: ToastKind;
  grade: TimingGrade | null;
  gradeTick: number;
  winner: Team | null;
};

function readHud(state: GameState, gradeTick: number): Hud {
  return {
    gamesUser: state.score.games.user,
    gamesBot: state.score.games.bot,
    pointUser: pointLabel(state, "user"),
    pointBot: pointLabel(state, "bot"),
    server: state.score.server,
    tiebreak: state.score.tiebreak,
    phase: state.phase,
    serveStage: state.serveStage,
    faults: state.faults,
    aiming:
      state.user.stroke === "aiming" ||
      (state.phase === "serve" && state.score.server === "user"),
    toast: state.toast?.text ?? null,
    toastKind: state.toast?.kind ?? "info",
    grade: state.flash?.grade ?? null,
    gradeTick,
    winner: state.winner,
  };
}

function sameHud(a: Hud, b: Hud) {
  return (
    a.gamesUser === b.gamesUser &&
    a.gamesBot === b.gamesBot &&
    a.pointUser === b.pointUser &&
    a.pointBot === b.pointBot &&
    a.server === b.server &&
    a.tiebreak === b.tiebreak &&
    a.phase === b.phase &&
    a.serveStage === b.serveStage &&
    a.faults === b.faults &&
    a.aiming === b.aiming &&
    a.toast === b.toast &&
    a.toastKind === b.toastKind &&
    a.grade === b.grade &&
    a.gradeTick === b.gradeTick &&
    a.winner === b.winner
  );
}

export function TennisGame() {
  const reduceMotion = useReducedMotion();
  const [game] = useState(() => createMatch("normal"));
  const [hud, setHud] = useState<Hud>(() => readHud(game, 0));
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodesRef = useRef<SceneNodes | null>(null);
  const hudRef = useRef<Hud>(hud);
  const reduceRef = useRef(false);
  const gradeTick = useRef(0);
  const lastFlash = useRef<number>(0);

  const playing = started && !paused && hud.phase !== "over";
  const { keys, pressed } = useTennisKeys(playing);

  useEffect(() => {
    reduceRef.current = Boolean(reduceMotion);
  }, [reduceMotion]);

  const step = (dt: number) => {
    const pad = keys.current;
    advance(game, pad.input, decideBot(game, difficulty), dt);
    pad.clearEdges();
  };

  const render = () => {
    const nodes = nodesRef.current;
    if (nodes) paintScene(nodes, game, reduceRef.current);

    // A fresh flash with the same grade still needs to replay its animation.
    if (game.flash && game.flash.until !== lastFlash.current) {
      lastFlash.current = game.flash.until;
      gradeTick.current += 1;
    }

    const next = readHud(game, gradeTick.current);
    if (!sameHud(hudRef.current, next)) {
      hudRef.current = next;
      setHud(next);
    }
  };

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
      resetMatch(game, value);
      const next = readHud(game, gradeTick.current);
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
    hud.phase === "serve" && hud.server === "user"
      ? hud.serveStage === "ready"
        ? hud.faults > 0
          ? "Second serve — J to toss"
          : "J to toss"
        : "J again to strike"
      : hud.phase === "serve"
        ? "CPU to serve"
        : null;

  const pressPad = (key: PadKey) => {
    if (key === "p") {
      setPaused(true);
      return;
    }
    keys.current.press(key);
  };

  return (
    <div
      ref={surfaceRef}
      tabIndex={-1}
      className="relative h-full w-full outline-none"
      aria-label="Tennis singles"
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
            <PlayerSprite name="bot" kit={KIT.bot} />
            <PlayerSprite name="user" kit={KIT.user} />
            <BallSprite />
          </g>
        </g>
      </svg>

      <Scoreboard
        gamesUser={hud.gamesUser}
        gamesBot={hud.gamesBot}
        pointUser={hud.pointUser}
        pointBot={hud.pointBot}
        serving={hud.server}
        tiebreak={hud.tiebreak}
        difficulty={difficulty}
      />
      <ControlsCard
        aiming={hud.aiming}
        pressed={pressed}
        interactive={playing}
        onPress={pressPad}
        onRelease={(key) => keys.current.release(key)}
      />
      <TimingFlash grade={hud.grade} tick={hud.gradeTick} />
      <ToastLine text={hud.toast ?? prompt} kind={hud.toast ? hud.toastKind : "info"} />

      <p className="sr-only" aria-live="polite">
        {`Games: you ${hud.gamesUser}, CPU ${hud.gamesBot}. Points: you ${hud.pointUser}, CPU ${hud.pointBot}.`}
      </p>

      <AnimatePresence>
        {!started ? (
          <Panel
            key="intro"
            title="Singles"
            detail={
              <>
                <p>
                  First to four games, tiebreak at three all. WASD to move, then J
                  topspin, K drop shot, L lob.
                </p>
                <p className="mt-3">
                  The moment you swing, WASD becomes your aim: W deep, S short, A and D
                  across. Timing and how well set you are decide whether the ball goes
                  where you asked.
                </p>
              </>
            }
            primaryLabel="Walk on"
            onPrimary={() => beginMatch(difficulty)}
            difficulty={difficulty}
            onDifficulty={setDifficulty}
          />
        ) : null}

        {started && paused && hud.phase !== "over" ? (
          <Panel
            key="paused"
            title="Paused"
            detail={<p>Changing opponent starts a fresh set.</p>}
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
            title={hud.winner === "user" ? "Your set." : "CPU takes the set."}
            detail={<p>{`Final games ${hud.gamesUser} to ${hud.gamesBot}.`}</p>}
            primaryLabel="Play again"
            onPrimary={() => beginMatch(difficulty)}
            difficulty={difficulty}
            onDifficulty={setDifficulty}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
