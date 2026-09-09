import type { CSSProperties, ReactNode } from "react";
import { Fragment } from "react";
import { AbsoluteFill, Series, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, SceneEdge, SceneGraph, SceneNode } from "@explainmotion/schema";
import { CARD_HEIGHT, CARD_WIDTH, layoutScene, type PositionedNode } from "@explainmotion/layout";
import { NodeIcon, nodeIconKind } from "./icons";
import {
  FPS,
  easingFor,
  getEdgeDraw,
  getNodeAppear,
  getNodeEmphasis,
  getSceneTimings
} from "./animation";

export { FPS, getSceneTimings, totalDurationInFrames } from "./animation";

export type ScenePreviewProps = {
  scene: Scene;
  activeNodeId?: string;
};

export type Orientation = "landscape" | "portrait";

/** Video stage dimensions (canvas minus padding, title and caption). */
const STAGE_WIDTH = 1184;
const STAGE_HEIGHT = 480;
const PORTRAIT_STAGE_WIDTH = 624;
const PORTRAIT_STAGE_HEIGHT = 1000;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Uniform scale so a dense scene's laid-out content always fits the stage. */
function fitScale(nodes: PositionedNode[], width: number, height: number): number {
  let maxX = 0;
  let maxY = 0;
  for (const node of nodes) {
    maxX = Math.max(maxX, node.x + CARD_WIDTH);
    maxY = Math.max(maxY, node.y + CARD_HEIGHT);
  }
  const sx = maxX > width ? width / maxX : 1;
  const sy = maxY > height ? height / maxY : 1;
  return Math.min(1, sx, sy);
}

function nodeTone(node: SceneNode): string {
  if (node.type === "database-card") return "#1f5f72";
  if (node.type === "service-card") return "#256d5a";
  if (node.type === "device-card") return "#5f4b32";
  if (node.type === "avatar-card") return "#6f4b5b";
  if (node.type === "badge") return "#7a5c1f";
  if (node.type === "progress-bar") return "#3f5b8f";
  return "#52525b";
}

/** The node's outline shape — services are hexagons, databases cylinders, etc. */
function NodeBody({ type, active, tone }: { type: SceneNode["type"]; active: boolean; tone: string }) {
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;
  const stroke = active ? tone : "rgba(63, 63, 70, 0.18)";
  const sw = active ? 2 : 1.25;
  const fill = "#ffffff";
  const svgStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    filter: "drop-shadow(0 16px 26px rgba(24, 24, 27, 0.10))",
    overflow: "visible"
  };

  let shape: ReactNode;
  switch (type) {
    case "service-card": {
      const n = 20;
      shape = (
        <polygon
          points={`${n},1 ${w - n},1 ${w - 1},${h / 2} ${w - n},${h - 1} ${n},${h - 1} 1,${h / 2}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      );
      break;
    }
    case "badge":
      shape = <rect x={1} y={1} width={w - 2} height={h - 2} rx={(h - 2) / 2} fill={fill} stroke={stroke} strokeWidth={sw} />;
      break;
    case "database-card":
      shape = (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <rect x={1} y={1} width={w - 2} height={h - 2} rx={11} />
          <ellipse cx={w / 2} cy={17} rx={(w - 30) / 2} ry={7} fill="none" />
        </g>
      );
      break;
    case "device-card":
      shape = (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <rect x={1} y={1} width={w - 2} height={h - 2} rx={11} />
          <line x1={13} y1={23} x2={w - 13} y2={23} strokeWidth={1} />
        </g>
      );
      break;
    case "progress-bar":
      shape = (
        <g>
          <rect x={1} y={1} width={w - 2} height={h - 2} rx={11} fill={fill} stroke={stroke} strokeWidth={sw} />
          <rect x={14} y={h - 22} width={w - 28} height={7} rx={3.5} fill="#e4e4e7" />
          <rect x={14} y={h - 22} width={(w - 28) * 0.62} height={7} rx={3.5} fill={tone} />
        </g>
      );
      break;
    default:
      shape = <rect x={1} y={1} width={w - 2} height={h - 2} rx={12} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={svgStyle}>
      {shape}
    </svg>
  );
}

type NodeRenderState = {
  node: SceneNode;
  x: number;
  y: number;
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  active: boolean;
};

function NodeCard({ node, x, y, opacity, translateX, translateY, scale, active }: NodeRenderState) {
  const tone = nodeTone(node);
  const kind = nodeIconKind(node);
  // Avatars get a circular badge; everything else a rounded icon chip.
  const chipRadius = node.type === "avatar-card" ? 999 : 9;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        opacity,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transformOrigin: "center"
      }}
    >
      <NodeBody type={node.type} active={active} tone={tone} />
      <div style={{ position: "absolute", inset: 0, padding: 12, display: "grid", alignContent: "center", gap: 5, color: "#18181b" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: chipRadius,
            background: tone,
            display: "grid",
            placeItems: "center",
            boxShadow: `0 8px 18px -10px ${tone}`
          }}
        >
          <NodeIcon kind={kind} color="#ffffff" size={19} />
        </div>
        <strong style={{ fontSize: 14, lineHeight: 1.15 }}>{node.label}</strong>
        <span style={{ fontSize: 10.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.4 }}>{node.type.replace("-card", "")}</span>
      </div>
    </div>
  );
}

type ArrowEndpoint = { x: number; y: number };

/**
 * "Line draws itself" via native SVG: `pathLength={1}` normalizes the curve so
 * `strokeDashoffset = 1 - progress` reveals it deterministically (no GSAP needed,
 * and identical headless vs. preview). No `viewBox` so SVG units == CSS px and the
 * arrow aligns with the absolutely-positioned cards.
 */
function TraceArrow({
  id,
  from,
  to,
  label,
  progress,
  flow
}: {
  id: string;
  from: ArrowEndpoint;
  to: ArrowEndpoint;
  label?: string;
  progress: number;
  /** Current frame; when set, dots flow along the drawn arrow to show direction. */
  flow?: number;
}) {
  // Anchor to the card edges and true vertical centers so the line touches both boxes.
  const startX = from.x + CARD_WIDTH;
  const startY = from.y + CARD_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + CARD_HEIGHT / 2;
  const midX = (startX + endX) / 2;

  // Long, flowing curve: horizontal tangents at both ends with extended control
  // handles so the line sweeps like a hand-drawn explainer arrow. Same-row edges
  // get a gentle upward bow instead of a flat line.
  const dx = endX - startX;
  const dy = endY - startY;
  const handle = Math.max(72, Math.min(190, Math.abs(dx) * 0.62 + Math.abs(dy) * 0.45));
  const sameRow = Math.abs(dy) < 6;
  const c1y = sameRow ? startY - 40 : startY;
  const c2y = sameRow ? endY - 40 : endY;
  const d = `M ${startX} ${startY} C ${startX + handle} ${c1y}, ${endX - handle} ${c2y}, ${endX} ${endY}`;
  const markerId = `arrowhead-${id}`;

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
      <defs>
        {/* refX at the tip + userSpaceOnUse so the arrowhead point lands exactly on the card edge. */}
        <marker id={markerId} markerUnits="userSpaceOnUse" markerWidth={12} markerHeight={12} refX={10} refY={6} orient="auto">
          <path d="M0,0 L10,6 L0,12 Z" fill="#256d5a" />
        </marker>
      </defs>
      <path
        d={d}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
        fill="none"
        stroke="#256d5a"
        strokeWidth={2.5}
        strokeLinecap="round"
        markerEnd={progress > 0.98 ? `url(#${markerId})` : undefined}
      />
      {flow !== undefined && progress > 0.99 ? (
        <path
          d={d}
          fill="none"
          stroke="#4bae93"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="2 13"
          strokeDashoffset={-(flow * 0.9)}
          opacity={0.85}
        />
      ) : null}
      {label && progress > 0.6 ? (
        <text
          x={midX}
          y={Math.min(from.y, to.y) - 8}
          textAnchor="middle"
          fill="#52525b"
          fontSize={11}
          opacity={interpolate(progress, [0.6, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        >
          {truncate(label, 22)}
        </text>
      ) : null}
    </svg>
  );
}

function StepBadge({ index, top, opacity }: { index: number; top: number; opacity: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        top: top + 22,
        width: 32,
        height: 32,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: "#18181b",
        color: "#ffffff",
        fontSize: 12,
        fontWeight: 700,
        opacity
      }}
    >
      {index + 1}
    </div>
  );
}

function staticState(node: PositionedNode, active: boolean): NodeRenderState {
  return { node, x: node.x, y: node.y, opacity: 1, translateX: 0, translateY: 0, scale: 1, active };
}

/**
 * Lightweight, non-animated preview used by the web editor. Everything is fully
 * revealed; the selected node gets an outline. (The editor edits meaning, not motion.)
 */
export function ScenePreview({ scene, activeNodeId }: ScenePreviewProps) {
  const positioned = layoutScene(scene);
  const nodeMap = new Map(positioned.nodes.map((node) => [node.id, node]));
  const isStep = scene.layout === "step-sequence";
  const scale = fitScale(positioned.nodes, 1180, 540);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: isStep ? 430 : 380, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {!isStep
          ? positioned.edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              return <TraceArrow key={edge.id} id={edge.id} from={from} to={to} label={edge.label} progress={1} />;
            })
          : null}
        {positioned.nodes.map((node, index) => (
          <Fragment key={node.id}>
            {isStep ? <StepBadge index={index} top={node.y} opacity={1} /> : null}
            <NodeCard {...staticState(node, node.id === activeNodeId)} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** Frame-driven node state for the video render. Deterministic in `frame`. */
function animatedNodeState(scene: Scene, node: PositionedNode, index: number, frame: number, fps: number): NodeRenderState {
  const appear = getNodeAppear(scene, node.id, index, fps);
  const progress = interpolate(frame, [appear.startFrame, appear.startFrame + appear.durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easingFor(appear.easing)
  });

  let translateX = 0;
  let scale = 1;
  if (appear.type === "slide-in") translateX = interpolate(progress, [0, 1], [-28, 0]);
  if (appear.type === "zoom-focus") scale = interpolate(progress, [0, 1], [0.9, 1]);

  let active = false;
  const emphasis = getNodeEmphasis(scene, node.id, fps);
  if (emphasis && frame >= emphasis.startFrame) {
    active = true;
    const seconds = (frame - emphasis.startFrame) / fps;
    const amplitude = emphasis.type === "pulse" ? 0.03 : 0.02;
    scale *= 1 + Math.sin(seconds * Math.PI * 2 * 1.2) * amplitude;
  }

  return { node, x: node.x, y: node.y, opacity: progress, translateX, translateY: 0, scale, active };
}

function AnimatedScene({ scene, orientation }: { scene: Scene; orientation: Orientation }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Portrait stacks everything vertically (step-sequence reads well in 9:16).
  const portrait = orientation === "portrait";
  const stageWidth = portrait ? PORTRAIT_STAGE_WIDTH : STAGE_WIDTH;
  const stageHeight = portrait ? PORTRAIT_STAGE_HEIGHT : STAGE_HEIGHT;
  const effectiveLayout: Scene["layout"] = portrait ? "step-sequence" : scene.layout;
  const positioned = layoutScene({ ...scene, layout: effectiveLayout }, { width: stageWidth, height: stageHeight });
  const nodeMap = new Map(positioned.nodes.map((node) => [node.id, node]));
  const indexById = new Map(positioned.nodes.map((node, index) => [node.id, index]));
  const isStep = effectiveLayout === "step-sequence";
  const scale = fitScale(positioned.nodes, stageWidth, stageHeight);

  const sceneFade = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#f8fafc", padding: 48, opacity: sceneFade }}>
      <p style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#71717a", margin: 0 }}>{effectiveLayout}</p>
      <h2 style={{ fontSize: 30, lineHeight: 1.1, margin: "6px 0 0", color: "#18181b" }}>{scene.title}</h2>

      <div style={{ position: "relative", flex: 1, marginTop: 24 }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {!isStep
            ? positioned.edges.map((edge: SceneEdge) => {
                const from = nodeMap.get(edge.from);
                const to = nodeMap.get(edge.to);
                if (!from || !to) return null;
                const draw = getEdgeDraw(scene, edge.from, indexById.get(edge.from) ?? 0, fps);
                const progress = interpolate(frame, [draw.startFrame, draw.startFrame + draw.durationInFrames], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: easingFor("easeInOut")
                });
                return <TraceArrow key={edge.id} id={edge.id} from={from} to={to} label={edge.label} progress={progress} flow={frame} />;
              })
            : null}
          {positioned.nodes.map((node, index) => {
            const state = animatedNodeState(scene, node, index, frame, fps);
            return (
              <Fragment key={node.id}>
                {isStep ? <StepBadge index={index} top={node.y} opacity={state.opacity} /> : null}
                <NodeCard {...state} />
              </Fragment>
            );
          })}
        </div>
      </div>

      <p style={{ fontSize: 18, lineHeight: 1.4, color: "#3f3f46", maxWidth: portrait ? "100%" : 900, margin: 0 }}>
        {scene.narration}
      </p>
    </AbsoluteFill>
  );
}

function Watermark() {
  return (
    <div
      style={{
        position: "absolute",
        right: 22,
        bottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(24, 24, 27, 0.72)",
        color: "#ffffff",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 0.2,
        opacity: 0.92
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 3, background: "#4bae93", display: "block" }} />
      Made with ExplainMotion
    </div>
  );
}

/** The full video: every scene played back-to-back, durations from the graph. */
export function ExplainerComposition({
  graph,
  orientation = "landscape",
  watermark = false
}: {
  graph: SceneGraph;
  orientation?: Orientation;
  watermark?: boolean;
}) {
  const timings = getSceneTimings(graph, FPS);

  return (
    <AbsoluteFill style={{ background: "#f8fafc" }}>
      <Series>
        {timings.map((timing) => (
          <Series.Sequence key={timing.scene.id} durationInFrames={timing.durationInFrames}>
            <AnimatedScene scene={timing.scene} orientation={orientation} />
          </Series.Sequence>
        ))}
      </Series>
      {watermark ? <Watermark /> : null}
    </AbsoluteFill>
  );
}
