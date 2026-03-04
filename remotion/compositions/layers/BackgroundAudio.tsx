import { Html5Audio } from "remotion";
import type { BackgroundAudioConfig } from "../../remotion.types";

export function BackgroundAudio({ src, volume }: BackgroundAudioConfig) {
  if (!src) return null;

  return <Html5Audio src={src} volume={volume} loop />;
}
