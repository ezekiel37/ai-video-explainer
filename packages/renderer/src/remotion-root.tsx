import { Composition } from "remotion";
import type { SceneGraph } from "@explainmotion/schema";
import { ExplainerComposition, FPS, totalDurationInFrames } from "./index";

const emptyGraph: SceneGraph = {
  projectId: "4b83f3c8-95a6-4ed0-9e89-53edac5b28c4",
  title: "How Money Transfer Works",
  format: "landscape",
  durationTargetSeconds: 40,
  style: "minimal-tech",
  voice: {
    provider: "mock",
    voiceId: "default",
    speed: 1
  },
  scenes: [
    {
      id: "scene_01",
      title: "Transfer starts",
      durationSeconds: 8,
      narration: "User A confirms the transfer in the mobile app.",
      layout: "horizontal-flow",
      nodes: [
        {
          id: "user_a",
          type: "avatar-card",
          label: "User A",
          asset: "core/user",
          importance: "primary",
          metadata: {}
        },
        {
          id: "mobile_app",
          type: "device-card",
          label: "Mobile App",
          asset: "core/mobile-app",
          importance: "secondary",
          metadata: {}
        }
      ],
      edges: [
        {
          id: "edge_01",
          from: "user_a",
          to: "mobile_app",
          type: "arrow",
          label: "Confirms",
          animation: "trace-arrow"
        }
      ],
      callouts: [],
      animations: [
        { id: "anim_01", type: "highlight-node", target: "user_a", startTimeSeconds: 0.4, durationMs: 700, easing: "easeOut" },
        { id: "anim_02", type: "slide-in", target: "mobile_app", startTimeSeconds: 1.2, durationMs: 600, easing: "easeOut" }
      ]
    }
  ]
};

export function RemotionRoot() {
  return (
    <Composition
      id="ExplainMotionLandscape"
      component={ExplainerComposition}
      fps={FPS}
      width={1280}
      height={720}
      defaultProps={{
        graph: emptyGraph,
        orientation: "landscape" as const,
        watermark: false
      }}
      calculateMetadata={({ props }) => {
        const portrait = props.orientation === "portrait";
        return {
          durationInFrames: totalDurationInFrames(props.graph, FPS),
          width: portrait ? 720 : 1280,
          height: portrait ? 1280 : 720
        };
      }}
    />
  );
}
