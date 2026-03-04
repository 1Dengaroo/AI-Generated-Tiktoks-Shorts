export type CaptionWord = {
  word: string;
  start: number;
  end: number;
};

export type CaptionPlacement = "top" | "middle" | "bottom";

export type TitleTransitionType =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "scale"
  | "none";

export type CaptionTransitionType = "fade" | "bounce" | "none";

export type TransitionConfig = {
  type: TitleTransitionType | CaptionTransitionType;
  durationSec: number;
};

export const TITLE_TRANSITION_TYPES: {
  value: TitleTransitionType;
  label: string;
}[] = [
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
  { value: "scale", label: "Scale" },
  { value: "none", label: "None" },
];

export const CAPTION_TRANSITION_TYPES: {
  value: CaptionTransitionType;
  label: string;
}[] = [
  { value: "fade", label: "Fade" },
  { value: "bounce", label: "Bounce" },
  { value: "none", label: "None" },
];

export type CaptionFont =
  | "Montserrat"
  | "Bangers"
  | "Roboto"
  | "Oswald"
  | "Poppins";

export type CaptionStyle = {
  placement: CaptionPlacement;
  font: CaptionFont;
  fontSize: number;
  highlightEnabled: boolean;
  highlightColor: string;
  strokeEnabled: boolean;
  strokeWidth: number;
  strokeColor: string;
  transition: TransitionConfig;
  /** Shift captions earlier (negative) or later (positive) in seconds */
  captionOffsetSec: number;
  /** How long a caption lingers after its word ends (seconds). 0 = hide immediately. */
  captionLingerSec: number;
};

export const CAPTION_FONTS: CaptionFont[] = [
  "Montserrat",
  "Bangers",
  "Roboto",
  "Oswald",
  "Poppins",
];

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  placement: "middle",
  font: "Montserrat",
  fontSize: 80,
  highlightEnabled: false,
  highlightColor: "#00FFD5",
  strokeEnabled: true,
  strokeWidth: 12,
  strokeColor: "#000000",
  transition: { type: "none", durationSec: 0.3 },
  captionOffsetSec: 0,
  captionLingerSec: 0.1,
};

export type TitleCardStyleType = "social" | "minimal" | "bold";

export const TITLE_CARD_STYLES: { value: TitleCardStyleType; label: string }[] =
  [
    { value: "social", label: "Social Post" },
    { value: "minimal", label: "Minimal" },
    { value: "bold", label: "Bold" },
  ];

export type IntroConfig = {
  enabled: boolean;
  pauseSec: number;
  transition: TransitionConfig;
  titleCardStyle: TitleCardStyleType;
  likeCount: string;
  commentCount: string;
};

export const DEFAULT_INTRO_CONFIG: IntroConfig = {
  enabled: true,
  pauseSec: 1,
  transition: { type: "fade", durationSec: 0.5 },
  titleCardStyle: "social",
  likeCount: "",
  commentCount: "",
};

export const FPS = 30;

export function computeDurationInFrames(
  introDurationSec: number,
  bodyDurationSec: number,
): number {
  return Math.max(Math.round((introDurationSec + bodyDurationSec) * FPS), FPS);
}

export type BackgroundAudioConfig = {
  src: string | null;
  volume: number;
};

export const DEFAULT_BACKGROUND_AUDIO: BackgroundAudioConfig = {
  src: null,
  volume: 0.15,
};

export type StoryVideoProps = {
  backgroundVideoSrc: string;
  backgroundVideoStartFrom: number;
  titleNarrationSrc: string;
  titleNarrationDurationSec: number;
  narrationSrc: string;
  captions: CaptionWord[];
  durationInFrames: number;
  playbackRate: number;
  captionStyle: CaptionStyle;
  title: string;
  introConfig: IntroConfig;
  backgroundAudio: BackgroundAudioConfig;
  narrationVolume: number;
};
