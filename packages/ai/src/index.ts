import type { SceneGraph, SceneNode, Storyboard } from "@explainmotion/schema";

export { parseMermaid, mermaidToSceneGraph } from "./mermaid";
export type { ParsedMermaid, ParsedNode, ParsedEdge, MermaidShape } from "./mermaid";
export { textToSceneGraph, contentToSceneGraph } from "./text";

const moneyTransferScenes = [
  {
    title: "Sender starts transfer",
    narration: "User A enters an amount and confirms the transfer in the mobile app.",
    entities: ["User A", "Mobile App"]
  },
  {
    title: "Request reaches backend",
    narration: "The app sends a structured transfer request to the API server.",
    entities: ["Mobile App", "API Server"]
  },
  {
    title: "Checks protect the transfer",
    narration: "Authentication and fraud checks verify that the transfer can continue.",
    entities: ["API Server", "Auth Service", "Fraud Check"]
  },
  {
    title: "Ledger records the movement",
    narration: "The ledger debits User A and credits User B in one controlled update.",
    entities: ["Ledger", "User B"]
  },
  {
    title: "Both users are notified",
    narration: "The system confirms success and notifies both users immediately.",
    entities: ["Notification", "Success"]
  }
];

const onboardingScenes = [
  {
    title: "Visitor creates account",
    narration: "A new user signs up and starts the onboarding path.",
    entities: ["User", "Signup Form"]
  },
  {
    title: "Email is verified",
    narration: "The product verifies the email before unlocking setup steps.",
    entities: ["Email", "Auth Service"]
  },
  {
    title: "Profile takes shape",
    narration: "The user adds profile details and chooses key preferences.",
    entities: ["Profile", "Preferences"]
  },
  {
    title: "Checklist guides completion",
    narration: "A focused checklist shows the next useful action.",
    entities: ["Checklist", "Dashboard"]
  }
];

export function generateMockStoryboard(prompt: string): Storyboard {
  const normalizedPrompt = prompt.toLowerCase();
  const isOnboarding = normalizedPrompt.includes("onboard") || normalizedPrompt.includes("signup");
  const scenes = isOnboarding ? onboardingScenes : moneyTransferScenes;

  return {
    title: isOnboarding ? "How SaaS Onboarding Works" : "How Money Transfer Works",
    targetAudience: isOnboarding ? "product teams" : "technical product teams",
    videoGoal: "Explain the process clearly with a small number of animated steps.",
    scenes: scenes.map((scene, index) => ({
      id: `scene_${String(index + 1).padStart(2, "0")}`,
      title: scene.title,
      narration: scene.narration,
      visualSummary: scene.entities.join(" to "),
      keyEntities: scene.entities,
      relationships: scene.entities.slice(1).map((entity, entityIndex) => `${scene.entities[entityIndex]} to ${entity}`),
      suggestedLayout: index % 2 === 0 ? "horizontal-flow" : "step-sequence",
      emphasis: index === scenes.length - 1 ? "success state" : scene.entities[0]
    }))
  };
}

function toNode(entity: string, index: number): SceneNode {
  const id = entity.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const label = entity.length > 32 ? entity.slice(0, 29) + "..." : entity;
  const lower = entity.toLowerCase();

  if (lower.includes("user")) {
    return { id, type: "avatar-card", label, asset: "core/user", importance: index === 0 ? "primary" : "secondary", metadata: {} };
  }

  if (lower.includes("database") || lower.includes("ledger")) {
    return {
      id,
      type: "database-card",
      label,
      asset: "tech-product/database",
      importance: index === 0 ? "primary" : "secondary",
      metadata: {}
    };
  }

  if (lower.includes("app") || lower.includes("dashboard") || lower.includes("form")) {
    return {
      id,
      type: "device-card",
      label,
      asset: lower.includes("dashboard") ? "tech-product/dashboard" : "core/mobile-app",
      importance: index === 0 ? "primary" : "secondary",
      metadata: {}
    };
  }

  if (lower.includes("api") || lower.includes("auth") || lower.includes("fraud")) {
    return {
      id,
      type: "service-card",
      label,
      asset: lower.includes("auth") ? "tech-product/auth-service" : "tech-product/api-server",
      importance: index === 0 ? "primary" : "secondary",
      metadata: {}
    };
  }

  return { id, type: "icon-card", label, asset: "core/check", importance: index === 0 ? "primary" : "secondary", metadata: {} };
}

export function generateMockSceneGraph(projectId: string, prompt: string): SceneGraph {
  const storyboard = generateMockStoryboard(prompt);
  const scenes = storyboard.scenes.map((scene, sceneIndex) => {
    const nodes = scene.keyEntities.map(toNode);

    return {
      id: scene.id,
      title: scene.title,
      durationSeconds: 8,
      narration: scene.narration,
      layout: scene.suggestedLayout,
      nodes,
      edges: nodes.slice(1).map((node, nodeIndex) => ({
        id: `edge_${sceneIndex + 1}_${nodeIndex + 1}`,
        from: nodes[nodeIndex].id,
        to: node.id,
        type: "arrow" as const,
        label: scene.relationships[nodeIndex] ?? "Next",
        animation: "trace-arrow" as const
      })),
      callouts: [],
      animations: nodes.map((node, nodeIndex) => ({
        id: `anim_${sceneIndex + 1}_${nodeIndex + 1}`,
        type: nodeIndex === 0 ? ("highlight-node" as const) : ("fade-in" as const),
        target: node.id,
        startTimeSeconds: nodeIndex * 1.2,
        durationMs: 700,
        easing: "easeOut" as const
      }))
    };
  });

  return {
    projectId,
    title: storyboard.title,
    format: "landscape",
    durationTargetSeconds: Math.max(30, scenes.reduce((total, scene) => total + scene.durationSeconds, 0)),
    style: "minimal-tech",
    voice: {
      provider: "mock",
      voiceId: "default",
      speed: 1
    },
    scenes
  };
}
