import { mkdirSync } from "node:fs";
import path from "node:path";
import { generateMockSceneGraph } from "@explainmotion/ai";
import { renderExplainer } from "../src/render";

/** Renders the mock money-transfer explainer to render-output/demo.mp4 for verification. */
async function main() {
  const graph = generateMockSceneGraph("4b83f3c8-95a6-4ed0-9e89-53edac5b28c4", "how money transfer works");
  const outputDir = path.join(process.cwd(), "render-output");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "demo.mp4");

  console.log(`Rendering ${graph.scenes.length} scenes -> ${outputPath}`);
  await renderExplainer({
    graph,
    outputPath,
    onProgress: (percent) => process.stdout.write(`\rprogress ${percent}%   `)
  });
  console.log(`\nDone: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
