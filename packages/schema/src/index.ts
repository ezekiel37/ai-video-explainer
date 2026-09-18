import { z } from "zod";

export const projectFormatSchema = z.enum(["landscape"]);
export const projectStyleSchema = z.enum(["minimal-tech"]);
export const layoutSchema = z.enum(["horizontal-flow", "step-sequence"]);

export const nodeTypeSchema = z.enum([
  "avatar-card",
  "service-card",
  "database-card",
  "device-card",
  "icon-card",
  "plain-card",
  "badge",
  "progress-bar"
]);

export const edgeTypeSchema = z.enum(["arrow"]);

export const animationTypeSchema = z.enum([
  "fade-in",
  "slide-in",
  "pulse",
  "highlight-node",
  "trace-arrow",
  "zoom-focus",
  "reveal-badge",
  "scene-cut"
]);

export const voiceSchema = z.object({
  provider: z.enum(["mock", "gemini", "google"]).default("mock"),
  voiceId: z.string().min(1).default("default"),
  speed: z.number().positive().max(2).default(1)
});

export const sceneNodeSchema = z.object({
  id: z.string().min(1),
  type: nodeTypeSchema,
  label: z.string().min(1).max(42),
  asset: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  importance: z.enum(["primary", "secondary", "supporting", "decorative"]).default("secondary"),
  metadata: z.record(z.string()).default({})
});

export const sceneEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  type: edgeTypeSchema.default("arrow"),
  label: z.string().max(48).optional(),
  animation: z.literal("trace-arrow").default("trace-arrow")
});

export const calloutSchema = z.object({
  id: z.string().min(1),
  target: z.string().min(1),
  label: z.string().min(1).max(64)
});

export const sceneAnimationSchema = z.object({
  id: z.string().min(1),
  type: animationTypeSchema,
  target: z.string().min(1),
  startTimeSeconds: z.number().finite().min(0),
  durationMs: z.number().int().positive().max(5000),
  easing: z.enum(["linear", "easeOut", "easeInOut"]).default("easeOut")
});

export const sceneSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(80),
    durationSeconds: z.number().positive().max(15),
    narration: z.string().min(8).max(220),
    layout: layoutSchema,
    nodes: z.array(sceneNodeSchema).min(1).max(8),
    edges: z.array(sceneEdgeSchema).max(12),
    callouts: z.array(calloutSchema).max(4).default([]),
    animations: z.array(sceneAnimationSchema).max(64).default([])
  })
  .superRefine((scene, context) => {
    for (const [name, items] of Object.entries({ nodes: scene.nodes, edges: scene.edges, callouts: scene.callouts, animations: scene.animations })) {
      const ids = new Set<string>();
      for (const [index, item] of items.entries()) {
        if (ids.has(item.id)) context.addIssue({ code: z.ZodIssueCode.custom, path: [name, index, "id"], message: "IDs must be unique within their collection." });
        ids.add(item.id);
      }
    }
    const nodeIds = new Set(scene.nodes.map((node) => node.id));
    for (const edge of scene.edges) {
      if (nodeIds.has(edge.id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["edges"], message: "Node and edge IDs must not overlap." });
    }
    for (const [index, animation] of scene.animations.entries()) {
      if (animation.startTimeSeconds + animation.durationMs / 1000 > scene.durationSeconds) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["animations", index], message: "Animation must finish within its scene. Increase scene duration or move the animation earlier." });
      }
    }

    for (const edge of scene.edges) {
      if (!nodeIds.has(edge.from)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", edge.id, "from"],
          message: `Edge ${edge.id} references missing from node ${edge.from}`
        });
      }

      if (!nodeIds.has(edge.to)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", edge.id, "to"],
          message: `Edge ${edge.id} references missing to node ${edge.to}`
        });
      }
    }

    for (const callout of scene.callouts) {
      if (!nodeIds.has(callout.target)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["callouts", callout.id, "target"],
          message: `Callout ${callout.id} references missing node ${callout.target}`
        });
      }
    }

    for (const animation of scene.animations) {
      if (!nodeIds.has(animation.target) && !scene.edges.some((edge) => edge.id === animation.target)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["animations", animation.id, "target"],
          message: `Animation ${animation.id} references missing target ${animation.target}`
        });
      }
    }
  });

export const sceneGraphSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(120),
  format: projectFormatSchema.default("landscape"),
  durationTargetSeconds: z.number().min(30).max(90),
  style: projectStyleSchema.default("minimal-tech"),
  voice: voiceSchema.default({ provider: "mock", voiceId: "default", speed: 1 }),
  scenes: z.array(sceneSchema).min(1).max(8)
}).superRefine((graph, context) => {
  if (new Set(graph.scenes.map(scene => scene.id)).size !== graph.scenes.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ["scenes"], message: "Scene IDs must be unique." });
  if (graph.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0) > 90) context.addIssue({ code: z.ZodIssueCode.custom, path: ["scenes"], message: "The total video duration must not exceed 90 seconds." });
});

export const storyboardSceneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  narration: z.string().min(8).max(220),
  visualSummary: z.string().min(1),
  keyEntities: z.array(z.string()).min(1).max(8),
  relationships: z.array(z.string()).default([]),
  suggestedLayout: layoutSchema,
  emphasis: z.string().min(1)
});

export const storyboardSchema = z.object({
  title: z.string().min(1).max(120),
  targetAudience: z.string().min(1),
  videoGoal: z.string().min(1),
  scenes: z.array(storyboardSceneSchema).min(1).max(8)
});

export type ProjectFormat = z.infer<typeof projectFormatSchema>;
export type ProjectStyle = z.infer<typeof projectStyleSchema>;
export type SceneLayout = z.infer<typeof layoutSchema>;
export type SceneNode = z.infer<typeof sceneNodeSchema>;
export type SceneEdge = z.infer<typeof sceneEdgeSchema>;
export type SceneAnimation = z.infer<typeof sceneAnimationSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type SceneGraph = z.infer<typeof sceneGraphSchema>;
export type Storyboard = z.infer<typeof storyboardSchema>;
export type StoryboardScene = z.infer<typeof storyboardSceneSchema>;

export function validateSceneGraph(input: unknown) {
  return sceneGraphSchema.safeParse(input);
}
