import type { SceneGraph, SceneNode } from "@explainmotion/schema";
import { sceneGraphSchema } from "@explainmotion/schema";
import { mermaidToSceneGraph } from "./mermaid";

type Section = { title: string; items: string[] };

function clean(text: string): string {
  return text
    .replace(/[*_`#>]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => clean(sentence))
    .filter((sentence) => sentence.length > 0);
}

/** Short, card-friendly label: first clause, capped length. */
function toLabel(item: string): string {
  const clause = clean(item).split(/[—,:;]/)[0].trim();
  const base = clause.length >= 3 ? clause : clean(item);
  return base.length > 40 ? `${base.slice(0, 39)}…` : base;
}

/** Parse prose / outlines (PRDs, posts, feature specs) into sections. */
function parseSections(input: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  const ensure = (title: string) => {
    current = { title: clean(title) || "Overview", items: [] };
    sections.push(current);
  };

  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const colonHeading = !heading && line.endsWith(":") && line.length <= 60 ? line.slice(0, -1) : null;
    const bullet = line.match(/^[-*•]\s+(.*)$/) ?? line.match(/^\d+[.)]\s+(.*)$/);

    if (heading || colonHeading) {
      ensure(heading ? heading[1] : (colonHeading as string));
    } else if (bullet) {
      if (!current) ensure("Overview");
      current!.items.push(clean(bullet[1]));
    } else {
      if (!current) ensure("Overview");
      for (const sentence of splitSentences(line)) current!.items.push(sentence);
    }
  }

  return sections.map((section) => ({ ...section, items: section.items.filter(Boolean) })).filter((section) => section.items.length > 0);
}

const MAX_SCENES = 6;
const MAX_NODES_PER_SCENE = 8;

/**
 * Heuristic adapter: turn an outline / PRD / post into a validated scene graph.
 * Good for structured text (headings + bullets). Free-form prose benefits from an
 * LLM pass later — this is the deterministic baseline. Throws if there's no content.
 */
export function textToSceneGraph(projectId: string, input: string): SceneGraph {
  const sections = parseSections(input).slice(0, MAX_SCENES);
  if (sections.length === 0) {
    throw new Error("No content found to turn into scenes.");
  }

  const scenes = sections.map((section, sceneIndex) => {
    const items = section.items.slice(0, MAX_NODES_PER_SCENE);
    const nodes: SceneNode[] = items.map((item, index) => ({
      id: `n_${sceneIndex + 1}_${index + 1}`,
      type: "plain-card",
      label: toLabel(item),
      importance: index === 0 ? "primary" : "secondary",
      metadata: {}
    }));

    const edges = nodes.slice(1).map((node, index) => ({
      id: `edge_${sceneIndex + 1}_${index + 1}`,
      from: nodes[index].id,
      to: node.id,
      type: "arrow" as const,
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

    const narration = clean(`${section.title}. ${items[0]}`).slice(0, 220);
    return {
      id: `scene_${String(sceneIndex + 1).padStart(2, "0")}`,
      title: section.title.slice(0, 80),
      durationSeconds: Math.min(15, Math.max(6, nodes.length * 2)),
      narration: narration.length >= 8 ? narration : `${section.title} overview.`,
      layout: "step-sequence" as const,
      nodes,
      edges,
      callouts: [],
      animations
    };
  });

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
  const graph: SceneGraph = {
    projectId,
    title: sections[0].title.slice(0, 120),
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

/** Auto-detect: Mermaid diagrams go to the diagram parser, everything else to text. */
export function contentToSceneGraph(projectId: string, content: string): SceneGraph {
  const looksLikeMermaid = /^\s*(?:flowchart|graph)\b/i.test(content) || /--?>|-\.->|==>/.test(content);
  return looksLikeMermaid ? mermaidToSceneGraph(projectId, content) : textToSceneGraph(projectId, content);
}
