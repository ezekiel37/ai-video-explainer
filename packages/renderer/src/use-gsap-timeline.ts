import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

/**
 * Frame-driven GSAP for Remotion.
 *
 * Remotion renders deterministically by *seeking to a frame*, not by playing in
 * real time. A normal `gsap.to(...)` runs on its own RAF clock and will look right
 * in the browser preview but freeze/desync in the headless MP4 render. The only
 * safe pattern is: build a PAUSED timeline once, then `seek()` it to the current
 * frame on every render. Then GSAP is just a deterministic math engine and the
 * render matches the preview exactly.
 *
 * Used only on the render side (never imported by the web editor) because the
 * SVG plugins touch the DOM at import time.
 */

let registered = false;
function ensurePlugins(): void {
  if (registered) return;
  gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin);
  registered = true;
}

export type TimelineBuilder = (context: {
  root: Element;
  gsap: typeof gsap;
}) => gsap.core.Timeline;

/**
 * Returns a ref to attach to the animation root. `build` constructs a paused
 * timeline (use `gsap` + plugins freely); it is seeked to `frame / fps` each frame.
 */
export function useGsapTimeline<T extends Element>(build: TimelineBuilder, deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    ensurePlugins();
    const timeline = build({ root, gsap });
    timeline.pause(0);
    timelineRef.current = timeline;

    return () => {
      timeline.kill();
      timelineRef.current = null;
    };
    // deps are caller-controlled (e.g. scene id); intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Deterministic: depends only on the integer frame.
  useLayoutEffect(() => {
    timelineRef.current?.seek(frame / fps, false);
  }, [frame, fps]);

  return ref;
}
