import { mkdirSync } from "node:fs";
import path from "node:path";
import { generateMockSceneGraph } from "@explainmotion/ai";
import { renderExplainerStill } from "../src/render";

/** Render one frame to PNG for a quick visual check. Usage: tsx render-still.ts [frame] */
async function main() {
  const frame = Number(process.argv[2] ?? 150);
  const graph = generateMockSceneGraph("4b83f3c8-95a6-4ed0-9e89-53edac5b28c4", "how money transfer works");
  const outputDir = path.join(process.cwd(), "render-output");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `still-${frame}.png`);

  await renderExplainerStill({ graph, outputPath, frame });
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
