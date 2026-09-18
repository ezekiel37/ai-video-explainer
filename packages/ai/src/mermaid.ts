import type { SceneGraph, SceneNode } from "@explainmotion/schema";
import { sceneGraphSchema } from "@explainmotion/schema";

// --- Parsing -------------------------------------------------------------

export type MermaidShape =
  | "cylinder"
  | "circle"
  | "stadium"
  | "subroutine"
  | "hexagon"
  | "decision"
  | "rect"
  | "rounded";

export type ParsedNode = { id: string; label: string; shape: MermaidShape };
export type ParsedEdge = { from: string; to: string; label?: string };
export type ParsedMermaid = { direction: string; nodes: ParsedNode[]; edges: ParsedEdge[] };

const IGNORED_PREFIXES = ["subgraph", "end", "style", "classdef", "class", "click", "linkstyle", "direction"];

// Longest/compound wrappers first so e.g. `[(` wins over `[`.
const NODE_DEF = /([A-Za-z0-9_]+)(\[\([^\]]*\)\]|\(\([^)]*\)\)|\(\[[^\]]*\]\)|\[\[[^\]]*\]\]|\{\{[^}]*\}\}|\[[^\]]*\]|\([^)]*\)|\{[^}]*\})/g;

function classifyWrapper(wrapper: string): { shape: MermaidShape; label: string } {
  const inner = (open: number, close: number) => wrapper.slice(open, wrapper.length - close);
  if (wrapper.startsWith("[(")) return { shape: "cylinder", label: inner(2, 2) };
  if (wrapper.startsWith("((")) return { shape: "circle", label: inner(2, 2) };
  if (wrapper.startsWith("([")) return { shape: "stadium", label: inner(2, 2) };
  if (wrapper.startsWith("[[")) return { shape: "subroutine", label: inner(2, 2) };
  if (wrapper.startsWith("{{")) return { shape: "hexagon", label: inner(2, 2) };
  if (wrapper.startsWith("{")) return { shape: "decision", label: inner(1, 1) };
  if (wrapper.startsWith("[")) return { shape: "rect", label: inner(1, 1) };
  return { shape: "rounded", label: inner(1, 1) };
}

function cleanLabel(raw: string): string {
  return raw
    .replace(/<br\s*\/?>(?=)/gi, " ")
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse a Mermaid flowchart (the common `flowchart`/`graph` subset) into nodes + edges. */
export function parseMermaid(input: string): ParsedMermaid {
  const rawLines = input.replace(/^\s*```(?:mermaid)?\s*\n/i, "").replace(/\n\s*```\s*$/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("%%"));

  let direction = "LR";
  const body: string[] = [];
  for (const line of rawLines) {
    const header = line.match(/^(?:flowchart|graph)\s+([A-Za-z]{1,2})\b/i);
    if (header) {
      direction = header[1].toUpperCase();
      if (!["LR", "RL", "TB", "TD", "BT"].includes(direction)) throw new Error("Unsupported Mermaid direction.");
      const remainder = line.slice(header[0].length).replace(/^\s*;?\s*/, "");
      if (remainder) body.push(remainder);
      continue;
    }
    if (/^(?:flowchart|graph)\b/i.test(line)) throw new Error("Specify a Mermaid direction, for example flowchart LR.");
    const lower = line.toLowerCase();
    if (/^subgraph\b/.test(lower)) throw new Error("Subgraphs are not supported yet. Flatten the diagram explicitly before importing.");
    if (IGNORED_PREFIXES.some((prefix) => new RegExp(`^${prefix}\\b`).test(lower))) continue;
    body.push(line);
  }

  const nodes = new Map<string, ParsedNode>();
  const addNode = (id: string, def?: { shape: MermaidShape; label: string }) => {
    const existing = nodes.get(id);
    if (def) {
      nodes.set(id, { id, shape: def.shape, label: cleanLabel(def.label) || id });
    } else if (!existing) {
      nodes.set(id, { id, shape: "rect", label: id });
    }
  };

  // First pass: collect node definitions across all statements.
  for (const line of body) {
    let match: RegExpExecArray | null;
    NODE_DEF.lastIndex = 0;
    while ((match = NODE_DEF.exec(line)) !== null) {
      addNode(match[1], classifyWrapper(match[2]));
    }
  }

  // Second pass: edges. Strip shapes (keep ids), normalize `-- text -->` to `-->|text|`.
  const edges: ParsedEdge[] = [];
  for (const rawLine of body) {
    for (const statement of rawLine.replace(NODE_DEF, "$1").split(";")) {
      let line = statement;
      line = line.replace(/--\s+([^>|-][^>|]*?)\s+-->/g, "-->|$1|");
      const tokens = line
        .split(/(-->|---|-\.->|-\.-|==>|===)/)
        .map((token) => token.trim())
        .filter((token) => token.length > 0);

      let prev: string | null = null;
      for (const token of tokens) {
        if (/^(-->|---|-\.->|-\.-|==>|===)$/.test(token)) continue;
        let rest = token;
        let label: string | undefined;
        const labelMatch = rest.match(/^\|([^|]*)\|\s*/);
        if (labelMatch) {
          label = cleanLabel(labelMatch[1]);
          rest = rest.slice(labelMatch[0].length);
        }
        const id = rest.trim().split(/\s+/)[0];
        if (!id) continue;
        if (!/^[A-Za-z0-9_]+$/.test(rest.trim())) throw new Error(`Unsupported Mermaid statement: ${rawLine}. Use explicit node IDs and supported arrows.`);
        addNode(id);
        if (prev) edges.push({ from: prev, to: id, label: label || undefined });
        prev = id;
      }
    }
  }

  return { direction, nodes: [...nodes.values()], edges };
}

// --- Mapping to the scene graph -----------------------------------------

function shapeToNodeType(shape: MermaidShape): SceneNode["type"] {
  switch (shape) {
    case "cylinder":
      return "database-card";
    case "circle":
      return "avatar-card";
    case "stadium":
      return "badge";
    case "hexagon":
    case "subroutine":
    case "decision":
      return "service-card";
    default:
      return "plain-card";
  }
}

const MAX_NODES_PER_SCENE = 8;
const MAX_EDGES_PER_SCENE = 12;

function buildNarration(labels: string[]): string {
  const first = labels[0];
  const last = labels[labels.length - 1];
  const text =
    labels.length === 1
      ? `This step highlights ${first}.`
      : `This scene shows ${labels.length} connected items, including ${first} and ${last}.`;
  return text.length < 8 ? `${text} Overview of the flow.` : text.slice(0, 220);
}

/**
 * Convert a Mermaid flowchart into a validated scene graph. Throws if the diagram
 * has no nodes or the result fails schema validation.
 */
export function mermaidToSceneGraph(projectId: string, input: string): SceneGraph {
  const parsed = parseMermaid(input);
  if (parsed.nodes.length === 0) {
    throw new Error("No nodes found in the diagram.");
  }

  const layout = ["TB", "TD", "BT"].includes(parsed.direction) ? "step-sequence" : "horizontal-flow";
  // Cover every relationship. Nodes may repeat across scenes to provide context
  // for a cross-scene connection; no edge is filtered away at a chunk boundary.
  const nodeById = new Map(parsed.nodes.map(node => [node.id, node]));
  const groups: { nodes: ParsedNode[]; edges: ParsedEdge[] }[] = [];
  let current: { nodes: ParsedNode[]; edges: ParsedEdge[] } = { nodes: [], edges: [] };
  const flush = () => { if (current.nodes.length) groups.push(current); current = { nodes: [], edges: [] }; };
  const covered = new Set<string>();
  for (const edge of parsed.edges) {
    const needed = [edge.from, edge.to].filter((id, index, ids) => ids.indexOf(id) === index && !current.nodes.some(node => node.id === id));
    if (current.nodes.length + needed.length > MAX_NODES_PER_SCENE || current.edges.length >= MAX_EDGES_PER_SCENE) flush();
    for (const id of [edge.from, edge.to]) {
      if (!current.nodes.some(node => node.id === id)) current.nodes.push(nodeById.get(id)!);
      covered.add(id);
    }
    current.edges.push(edge);
  }
  for (const node of parsed.nodes.filter(node => !covered.has(node.id))) {
    if (current.nodes.length >= MAX_NODES_PER_SCENE) flush();
    current.nodes.push(node);
  }
  flush();
  if (groups.length > 8) throw new Error("This diagram needs more than eight scenes. Split it into smaller explanations before importing.");
  if (["RL", "BT"].includes(parsed.direction)) groups.forEach(group => group.nodes.reverse());

  const scenes = groups.map((group, sceneIndex) => {
    const nodes: SceneNode[] = group.nodes.map((node, index) => ({
      id: node.id,
      type: shapeToNodeType(node.shape),
      label: node.label.slice(0, 42),
      importance: index === 0 ? "primary" : "secondary",
      metadata: { sourceLabel: node.label }
    }));

    if (group.edges.some(edge => (edge.label?.length ?? 0) > 48)) throw new Error("An edge label exceeds 48 characters. Shorten it explicitly before importing.");
    const edges = group.edges
      .map((edge, index) => ({
        id: `edge_${sceneIndex + 1}_${index + 1}`,
        from: edge.from,
        to: edge.to,
        type: "arrow" as const,
        label: edge.label ? edge.label.slice(0, 48) : undefined,
        animation: "trace-arrow" as const
      }));

    const animations = nodes.map((node, index) => ({
      id: `anim_${sceneIndex + 1}_${index + 1}`,
      type: index === 0 ? ("highlight-node" as const) : ("fade-in" as const),
      target: node.id,
      startTimeSeconds: index === 0 ? 0.4 : index * 0.5,
      durationMs: 600,
      easing: "easeOut" as const
    }));

    const labels = nodes.map((node) => node.label);
    return {
      id: `scene_${String(sceneIndex + 1).padStart(2, "0")}`,
      title: groups.length > 1 ? `Part ${sceneIndex + 1}` : "How it works",
      durationSeconds: Math.min(15, Math.max(6, nodes.length * 2)),
      narration: buildNarration(labels),
      layout: layout as "horizontal-flow" | "step-sequence",
      nodes,
      edges,
      callouts: [],
      animations
    };
  });

  const allLabels = parsed.nodes.map((node) => node.label);
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);

  const graph: SceneGraph = {
    projectId,
    title: `${allLabels[0]} → ${allLabels[allLabels.length - 1]}`.slice(0, 120),
    format: "landscape",
    durationTargetSeconds: Math.min(90, Math.max(30, totalDuration)),
    style: "minimal-tech",
    voice: { provider: "mock", voiceId: "default", speed: 1 },
    scenes
  };

  const result = sceneGraphSchema.safeParse(graph);
  if (!result.success) {
    throw new Error(`Generated scene graph is invalid: ${result.error.issues.map((i) => i.message).join("; ")}`);
  }
  return result.data;
}
