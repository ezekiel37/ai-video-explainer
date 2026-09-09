import { generateMockSceneGraph } from "@explainmotion/ai";
import { enqueueRender, getRenderJobSnapshot } from "../lib/server/queue";

/** Enqueues a render and polls BullMQ status until the worker finishes. Needs Redis + a running worker. */
async function main() {
  const graph = generateMockSceneGraph("4b83f3c8-95a6-4ed0-9e89-53edac5b28c4", "how money transfer works");
  const jobId = await enqueueRender({ projectId: graph.projectId, sceneGraph: graph });
  console.log(`enqueued job ${jobId}`);

  for (let i = 0; i < 200; i += 1) {
    const snapshot = await getRenderJobSnapshot(jobId);
    console.log(`  ${snapshot?.status} ${snapshot?.progress ?? 0}%`);
    if (snapshot && (snapshot.status === "completed" || snapshot.status === "failed")) {
      console.log(`final: ${JSON.stringify(snapshot)}`);
      process.exit(snapshot.status === "completed" ? 0 : 1);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  console.error("timed out");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
