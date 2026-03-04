import type { GeneratedStory } from "@/lib/story/story.types";
import type { VoiceEffect } from "@/lib/narration/narration.types";
import type {
  CaptionWord,
  CaptionStyle,
  IntroConfig,
  BackgroundAudioConfig,
} from "@/remotion/remotion.types";

export type WizardStep =
  | "story"
  | "narration"
  | "background"
  | "preview"
  | "finish";

export type VideoCompositionProps = {
  backgroundVideoSrc: string;
  backgroundVideoStartFrom: number;
  titleNarrationSrc: string;
  titleNarrationDurationSec: number;
  narrationSrc: string;
  captions: CaptionWord[];
  durationSeconds: number;
  playbackRate: number;
  captionStyle: CaptionStyle;
  title: string;
  introConfig: IntroConfig;
  backgroundAudio: BackgroundAudioConfig;
  narrationVolume: number;
};

export type WizardState = {
  step: WizardStep;
  story: GeneratedStory | null;
  voiceId: string;
  voiceEffect: VoiceEffect;
  playbackRate: number;
  titleAudioUrl: string | null;
  titleAudioDuration: number | null;
  narrationUrl: string | null;
  narrationKey: string | null;
  narrationDuration: number | null;
  captions: CaptionWord[];
  backgroundVideoUrl: string | null;
  backgroundPreviewUrl: string | null;
  backgroundVideoStartFrom: number;
  captionStyle: CaptionStyle;
  introConfig: IntroConfig;
  backgroundAudio: BackgroundAudioConfig;
  narrationVolume: number;
};
