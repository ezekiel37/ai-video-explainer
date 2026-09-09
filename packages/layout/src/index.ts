import type { Scene, SceneNode } from "@explainmotion/schema";

export type PositionedNode = SceneNode & {
  x: number;
  y: number;
};

export type PositionedScene = Omit<Scene, "nodes"> & {
  nodes: PositionedNode[];
};

/** Card dimensions are the single source of truth for layout + arrow anchoring. */
export const CARD_WIDTH = 154;
export const CARD_HEIGHT = 88;

export type LayoutOptions = {
  /** Usable stage width in px (horizontal-flow). */
  width?: number;
  /** Usable stage height in px (step-sequence). */
  height?: number;
};

const HORIZONTAL_SPACING = 220;
const STEP_SPACING = 132;
const MARGIN = 8;

/**
 * Deterministic layout that fits the node count into the available stage so wide
 * scenes (up to 8 nodes) don't overflow the canvas. Spacing shrinks as needed but
 * never below the card size, so cards never overlap in the common case.
 */
export function layoutScene(scene: Scene, options: LayoutOptions = {}): PositionedScene {
  const width = options.width ?? 1180;
  const height = options.height ?? 540;
  const count = scene.nodes.length;

  const nodes = scene.nodes.map((node, index) => {
    if (scene.layout === "horizontal-flow") {
      const track = Math.max(0, width - CARD_WIDTH - MARGIN * 2);
      const spacing = count > 1 ? Math.min(HORIZONTAL_SPACING, track / (count - 1)) : 0;
      return { ...node, x: MARGIN + index * spacing, y: index % 2 === 0 ? 110 : 210 };
    }

    const track = Math.max(0, height - CARD_HEIGHT);
    const fitted = count > 1 ? Math.min(STEP_SPACING, track / (count - 1)) : 0;
    const spacing = count > 1 ? Math.max(CARD_HEIGHT + 12, fitted) : 0;
    return { ...node, x: 120, y: index * spacing };
  });

  return {
    ...scene,
    nodes
  };
}
