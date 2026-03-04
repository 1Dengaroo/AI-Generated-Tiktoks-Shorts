import { Composition } from "remotion";
import { StoryVideo } from "./compositions/StoryVideo";
import {
  DEFAULT_CAPTION_STYLE,
  DEFAULT_INTRO_CONFIG,
  DEFAULT_BACKGROUND_AUDIO,
} from "./remotion.types";

const FPS = 30;

export function RemotionRoot() {
  return (
    <Composition
      id="StoryVideo"
      component={StoryVideo}
      durationInFrames={FPS * 30}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        backgroundVideoSrc: "",
        backgroundVideoStartFrom: 0,
        titleNarrationSrc: "",
        titleNarrationDurationSec: 0,
        narrationSrc: "",
        captions: [],
        durationInFrames: FPS * 30,
        playbackRate: 1.5,
        captionStyle: DEFAULT_CAPTION_STYLE,
        title: "",
        introConfig: DEFAULT_INTRO_CONFIG,
        backgroundAudio: DEFAULT_BACKGROUND_AUDIO,
        narrationVolume: 0.5,
      }}
    />
  );
}
