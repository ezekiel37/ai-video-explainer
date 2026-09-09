"use client";

import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import type { Scene } from "@explainmotion/schema";

export function SceneFlowPreview({ scene }: { scene: Scene }) {
  const nodes: Node[] = scene.nodes.map((node, index) => ({
    id: node.id,
    position: scene.layout === "horizontal-flow" ? { x: index * 210, y: index % 2 === 0 ? 30 : 128 } : { x: 0, y: index * 118 },
    data: {
      label: node.label
    },
    style: {
      width: 156,
      borderRadius: 8,
      border: "1px solid rgba(39, 39, 42, 0.16)",
      background: node.importance === "primary" ? "#f3faf7" : "#ffffff",
      color: "#18181b",
      fontSize: 13,
      boxShadow: "0 18px 44px -34px rgba(24, 24, 27, 0.55)"
    }
  }));

  const edges: Edge[] = scene.edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#256d5a"
    },
    style: {
      stroke: "#256d5a"
    }
  }));

  return (
    <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} panOnScroll>
      <Background color="#d4d4d8" gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
