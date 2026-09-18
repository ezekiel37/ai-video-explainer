"use client";

import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node, type ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import { useEffect, useRef, useState } from "react";
import { layoutScene } from "@explainmotion/layout";
import type { Scene } from "@explainmotion/schema";

export function SceneFlowPreview({ scene }: { scene: Scene }) {
  const holder = useRef<HTMLDivElement>(null);
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  useEffect(() => {
    if (!flow || !holder.current) return;
    let frame = 0;
    const fit = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => flow.fitView({ padding: 0.2, minZoom: 0.05, maxZoom: 1 })); };
    const observer = new ResizeObserver(fit);
    observer.observe(holder.current); fit();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [flow, scene]);
  const nodes: Node[] = layoutScene(scene).nodes.map((node) => ({
    id: node.id,
    position: { x: node.x, y: node.y },
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
    <div ref={holder} style={{ width: "100%", height: 360 }}>
    <ReactFlow onInit={setFlow} minZoom={0.05} maxZoom={2} nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} panOnScroll>
      <Background color="#d4d4d8" gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
    </div>
  );
}
