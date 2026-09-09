import { Easing } from "remotion";
import type { Scene, SceneAnimation, SceneGraph } from "@explainmotion/schema";

export const FPS = 30;

export type EasingName = SceneAnimation["easing"];

/** Map our scene-graph easing names to deterministic Remotion easing functions. */
export function easingFor(name: EasingName): (t: number) => number {
  switch (name) {
    case "linear":
      return Easing.linear;
    case "easeInOut":
      return Easing.inOut(Easing.ease);
    case "easeOut":
    default:
      return Easing.out(Easing.ease);
  }
}

export function secondsToFrames(seconds: number, fps = FPS): number {
  return Math.round(seconds * fps);
}

export function msToFrames(ms: number, fps = FPS): number {
  return Math.max(1, Math.round((ms / 1000) * fps));
}

export type SceneTiming = {
  scene: Scene;
  index: number;
  startFrame: number;
  durationInFrames: number;
};

/** Lay scenes back-to-back on the timeline and return each one's frame window. */
export function getSceneTimings(graph: SceneGraph, fps = FPS): SceneTiming[] {
  let cursor = 0;
  return graph.scenes.map((scene, index) => {
    const durationInFrames = Math.max(1, secondsToFrames(scene.durationSeconds, fps));
    const timing: SceneTiming = { scene, index, startFrame: cursor, durationInFrames };
    cursor += durationInFrames;
    return timing;
  });
}

export function totalDurationInFrames(graph: SceneGraph, fps = FPS): number {
  return getSceneTimings(graph, fps).reduce((total, timing) => total + timing.durationInFrames, 0);
}

const APPEAR_TYPES = new Set<SceneAnimation["type"]>(["fade-in", "slide-in", "reveal-badge", "zoom-focus"]);
const EMPHASIS_TYPES = new Set<SceneAnimation["type"]>(["highlight-node", "pulse"]);

export type NodeAppear = {
  startFrame: number;
  durationInFrames: number;
  type: SceneAnimation["type"];
  easing: EasingName;
};

/**
 * How/when a node enters. Prefers an explicit appear animation from the scene
 * graph; otherwise falls back to a staggered fade so nodes don't all pop at once.
 */
export function getNodeAppear(scene: Scene, nodeId: string, index: number, fps = FPS): NodeAppear {
  const anim = scene.animations.find((a) => a.target === nodeId && APPEAR_TYPES.has(a.type));
  if (anim) {
    return {
      startFrame: secondsToFrames(anim.startTimeSeconds, fps),
      durationInFrames: msToFrames(anim.durationMs, fps),
      type: anim.type,
      easing: anim.easing
    };
  }

  return {
    startFrame: secondsToFrames(index * 0.5, fps),
    durationInFrames: msToFrames(600, fps),
    type: "fade-in",
    easing: "easeOut"
  };
}

export type NodeEmphasis = {
  startFrame: number;
  type: SceneAnimation["type"];
};

/** Optional emphasis (highlight/pulse) layered on top of an already-visible node. */
export function getNodeEmphasis(scene: Scene, nodeId: string, fps = FPS): NodeEmphasis | null {
  const anim = scene.animations.find((a) => a.target === nodeId && EMPHASIS_TYPES.has(a.type));
  if (!anim) return null;
  return { startFrame: secondsToFrames(anim.startTimeSeconds, fps), type: anim.type };
}

/** An edge traces itself once its source node has finished entering. */
export function getEdgeDraw(scene: Scene, fromNodeId: string, fromIndex: number, fps = FPS) {
  const appear = getNodeAppear(scene, fromNodeId, fromIndex, fps);
  const startFrame = appear.startFrame + appear.durationInFrames;
  return { startFrame, durationInFrames: msToFrames(700, fps) };
}
