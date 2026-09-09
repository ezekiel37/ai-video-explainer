import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import type { SceneGraph } from "@explainmotion/schema";

const COMPOSITION_ID = "ExplainMotionLandscape";

export type RenderFormat = "mp4" | "gif";
export type RenderOrientation = "landscape" | "portrait";

export type RenderExplainerOptions = {
  graph?: SceneGraph;
  outputPath: string;
  format?: RenderFormat;
  orientation?: RenderOrientation;
  watermark?: boolean;
  onProgress?: (percent: number) => void;
};

/**
 * Bundle the Remotion composition and render the scene graph to MP4 or GIF, in
 * landscape (16:9) or portrait (9:16). Server-side only (worker + scripts).
 */
export async function renderExplainer(options: RenderExplainerOptions): Promise<string> {
  const entryPoint = fileURLToPath(new URL("./entry.ts", import.meta.url));
  const orientation = options.orientation ?? "landscape";
  const format = options.format ?? "mp4";
  const inputProps = {
    ...(options.graph ? { graph: options.graph } : {}),
    orientation,
    watermark: options.watermark ?? false
  };

  await ensureBrowser();

  const serveUrl = await bundle({ entryPoint });

  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });

  await renderMedia({
    serveUrl,
    composition,
    codec: format === "gif" ? "gif" : "h264",
    // GIFs: drop to ~15fps and loop forever to keep file size sane.
    ...(format === "gif" ? { everyNthFrame: 2, numberOfGifLoops: 0 } : {}),
    outputLocation: options.outputPath,
    inputProps,
    onProgress: ({ progress }) => options.onProgress?.(Math.round(progress * 100))
  });

  return options.outputPath;
}

/** Render a single frame to PNG — used for thumbnails and quick visual checks. */
export async function renderExplainerStill(options: {
  graph?: SceneGraph;
  outputPath: string;
  frame?: number;
  orientation?: RenderOrientation;
  watermark?: boolean;
}): Promise<string> {
  const entryPoint = fileURLToPath(new URL("./entry.ts", import.meta.url));
  const orientation = options.orientation ?? "landscape";
  const inputProps = { ...(options.graph ? { graph: options.graph } : {}), orientation, watermark: options.watermark ?? false };

  await ensureBrowser();
  const serveUrl = await bundle({ entryPoint });
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });

  await renderStill({
    serveUrl,
    composition,
    output: options.outputPath,
    frame: options.frame ?? 0,
    inputProps
  });

  return options.outputPath;
}
