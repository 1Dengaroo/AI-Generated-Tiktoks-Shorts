import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { StoryVideoProps } from "../remotion.types";
import { BackgroundVideo } from "./layers/BackgroundVideo";
import { BackgroundAudio } from "./layers/BackgroundAudio";
import { NarrationAudio } from "./layers/NarrationAudio";
import { CaptionOverlay } from "./layers/CaptionOverlay";
import { TitleCard } from "./layers/TitleCard";

export function StoryVideo({
  backgroundVideoSrc,
  backgroundVideoStartFrom,
  titleNarrationSrc,
  titleNarrationDurationSec,
  narrationSrc,
  captions,
  playbackRate,
  captionStyle,
  title,
  introConfig,
  backgroundAudio,
  narrationVolume = 1,
}: StoryVideoProps) {
  const { fps } = useVideoConfig();

  // introEndTimeSec is in "audio-time" convention (gets divided by playbackRate
  // via scaleTime() in child components to produce display time)
  const introEndTimeSec = introConfig.enabled
    ? titleNarrationDurationSec + introConfig.pauseSec
    : 0;

  const toFrame = (audioSec: number) =>
    Math.round((audioSec / playbackRate) * fps);

  // Add a small buffer (+3 frames) so frame rounding never clips the last syllable
  const titleEndFrame = toFrame(titleNarrationDurationSec) + 3;
  const introEndFrame = toFrame(introEndTimeSec);

  return (
    <AbsoluteFill>
      <BackgroundVideo
        src={backgroundVideoSrc}
        startFrom={backgroundVideoStartFrom}
      />
      <BackgroundAudio
        src={backgroundAudio.src}
        volume={backgroundAudio.volume}
      />
      {/* Title narration: separate audio for just the title text */}
      {introConfig.enabled && titleNarrationSrc && (
        <Sequence durationInFrames={titleEndFrame} layout="none">
          <NarrationAudio
            src={titleNarrationSrc}
            playbackRate={playbackRate}
            volume={narrationVolume}
          />
        </Sequence>
      )}
      {/* Body narration: starts after intro period */}
      {introConfig.enabled ? (
        <Sequence from={introEndFrame} layout="none">
          <NarrationAudio
            src={narrationSrc}
            playbackRate={playbackRate}
            volume={narrationVolume}
          />
        </Sequence>
      ) : (
        <NarrationAudio
          src={narrationSrc}
          playbackRate={playbackRate}
          volume={narrationVolume}
        />
      )}
      {introConfig.enabled && (
        <TitleCard
          title={title}
          introEndTimeSec={introEndTimeSec}
          playbackRate={playbackRate}
          transition={introConfig.transition}
          titleCardStyle={introConfig.titleCardStyle ?? "social"}
          likeCount={introConfig.likeCount}
          commentCount={introConfig.commentCount}
        />
      )}
      <CaptionOverlay
        captions={captions}
        playbackRate={playbackRate}
        captionStyle={captionStyle}
        introEndTimeSec={introEndTimeSec}
      />
    </AbsoluteFill>
  );
}
