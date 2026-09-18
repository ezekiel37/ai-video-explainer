export type Orientation = "landscape" | "portrait";
export function stageSize(orientation: Orientation) {
  return orientation === 'portrait'
    ? { width: 624, height: 1000, videoWidth: 720, videoHeight: 1280 }
    : { width: 1184, height: 480, videoWidth: 1280, videoHeight: 720 };
}
