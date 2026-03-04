import { Audio } from "remotion";

type NarrationAudioProps = {
  src: string;
  playbackRate: number;
  volume?: number;
};

export function NarrationAudio({
  src,
  playbackRate,
  volume = 1,
}: NarrationAudioProps) {
  return <Audio src={src} playbackRate={playbackRate} volume={volume} />;
}
