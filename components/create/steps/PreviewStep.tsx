"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { StoryVideo } from "@/remotion/compositions/StoryVideo";
import {
  IntroCard,
  CaptionsCard,
  EffectsCard,
} from "@/components/create/CaptionStylePanel";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api/endpoints";
import {
  FPS,
  computeDurationInFrames,
  DEFAULT_CAPTION_STYLE,
  DEFAULT_INTRO_CONFIG,
} from "@/remotion/remotion.types";
import type {
  CaptionStyle,
  IntroConfig,
  BackgroundAudioConfig,
} from "@/remotion/remotion.types";
import type { VideoCompositionProps } from "@/components/create/create-wizard.types";

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

type Preset = {
  name: string;
  captionStyle: Partial<CaptionStyle>;
  introConfig?: Partial<IntroConfig>;
  narrationVolume?: number;
  playbackRate?: number;
};

const PRESETS: Preset[] = [
  {
    name: "Default",
    captionStyle: { ...DEFAULT_CAPTION_STYLE },
    introConfig: { ...DEFAULT_INTRO_CONFIG },
    narrationVolume: 0.5,
    playbackRate: 1.25,
  },
  {
    name: "Energetic",
    captionStyle: {
      transition: { type: "bounce", durationSec: 0.2 },
      highlightEnabled: true,
      highlightColor: "#00FFD5",
      fontSize: 88,
    },
    narrationVolume: 0.35,
    playbackRate: 1.5,
  },
  {
    name: "Cinematic",
    captionStyle: {
      font: "Oswald",
      fontSize: 72,
      strokeEnabled: true,
      strokeWidth: 16,
      strokeColor: "#000000",
      transition: { type: "fade", durationSec: 0.4 },
      highlightEnabled: false,
    },
    introConfig: { titleCardStyle: "bold" },
    narrationVolume: 0.5,
    playbackRate: 1,
  },
  {
    name: "Clean",
    captionStyle: {
      font: "Poppins",
      fontSize: 68,
      strokeEnabled: false,
      highlightEnabled: false,
      transition: { type: "fade", durationSec: 0.3 },
    },
    introConfig: { titleCardStyle: "minimal" },
    narrationVolume: 0.5,
    playbackRate: 1.25,
  },
];

type AudioOption = { name: string; url: string };

type PreviewStepProps = VideoCompositionProps & {
  backgroundPreviewSrc: string;
  onCaptionStyleChange: (style: CaptionStyle) => void;
  onIntroConfigChange: (config: IntroConfig) => void;
  onPlaybackRateChange: (rate: number) => void;
  onBackgroundAudioChange: (config: BackgroundAudioConfig) => void;
  onNarrationVolumeChange: (volume: number) => void;
};

export function PreviewStep({
  backgroundVideoSrc: _backgroundVideoSrc,
  backgroundPreviewSrc,
  backgroundVideoStartFrom,
  titleNarrationSrc,
  titleNarrationDurationSec,
  narrationSrc,
  captions,
  durationSeconds,
  playbackRate,
  captionStyle,
  onCaptionStyleChange,
  title,
  introConfig,
  onIntroConfigChange,
  backgroundAudio,
  onBackgroundAudioChange,
  onPlaybackRateChange,
  narrationVolume,
  onNarrationVolumeChange,
}: PreviewStepProps) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const playerRef = useRef<PlayerRef>(null);
  const playerWrapRef = useRef<HTMLDivElement>(null);
  const fetchAudios = useCallback(() => api.audios.list(), []);
  const { data: audiosData, execute: loadAudios } = useApi(fetchAudios, {
    silent: true,
  });
  const audioOptions: AudioOption[] = audiosData?.audios ?? [];

  useEffect(() => {
    loadAudios();
  }, [loadAudios]);

  const introDurationSec = introConfig.enabled
    ? (titleNarrationDurationSec + introConfig.pauseSec) / playbackRate
    : 0;
  const bodyDurationSec = durationSeconds / playbackRate;
  const durationInFrames = computeDurationInFrames(
    introDurationSec,
    bodyDurationSec,
  );

  function applyPreset(preset: Preset) {
    onCaptionStyleChange({ ...captionStyle, ...preset.captionStyle });
    if (preset.introConfig) {
      onIntroConfigChange({ ...introConfig, ...preset.introConfig });
    }
    if (preset.narrationVolume !== undefined) {
      onNarrationVolumeChange(preset.narrationVolume);
    }
    if (preset.playbackRate !== undefined) {
      onPlaybackRateChange(preset.playbackRate);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {!alertDismissed && (
        <Alert>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Choppiness in the preview is normal and will not appear in the
              final render.
            </span>
            <button
              onClick={() => setAlertDismissed(true)}
              className="ml-4 shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr_320px]">
        {/* Left: Intro + Captions — scrollable, capped to player height */}
        <div className="order-2 lg:order-1">
          <div className="space-y-4">
            <IntroCard
              introConfig={introConfig}
              onIntroConfigChange={onIntroConfigChange}
            />
            <CaptionsCard
              captionStyle={captionStyle}
              onChange={onCaptionStyleChange}
            />
          </div>
        </div>

        {/* Center: Player */}
        <div className="order-1 lg:order-2">
          <div
            ref={playerWrapRef}
            className="mx-auto"
            style={{ maxWidth: 360 }}
          >
            <Player
              ref={playerRef}
              component={StoryVideo}
              compositionWidth={1080}
              compositionHeight={1920}
              durationInFrames={durationInFrames}
              fps={FPS}
              inputProps={{
                backgroundVideoSrc: backgroundPreviewSrc,
                backgroundVideoStartFrom,
                titleNarrationSrc,
                titleNarrationDurationSec,
                narrationSrc,
                captions,
                durationInFrames,
                playbackRate,
                captionStyle,
                title,
                introConfig,
                backgroundAudio,
                narrationVolume,
              }}
              controls
              style={{
                width: "100%",
                aspectRatio: "9/16",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow:
                  "0 8px 32px -8px rgba(0,0,0,0.3), 0 0 0 1px hsl(var(--border) / 0.5)",
              }}
            />
          </div>
          <div className="mt-3 flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-lg border border-border/50 bg-card/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                Presets
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {PRESETS.map((preset) => (
                  <DropdownMenuItem
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right: Effects + Playback speed + Background audio */}
        <div className="order-3">
          <div className="space-y-4">
            <EffectsCard
              captionStyle={captionStyle}
              onChange={onCaptionStyleChange}
            />
            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Playback Speed
              </label>
              <div className="mt-3 inline-flex rounded-lg border border-border/50 bg-background/50 p-0.5">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onPlaybackRateChange(speed)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      playbackRate === speed
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Narration Volume
              </label>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Volume</span>
                  <span>{Math.round(narrationVolume * 100)}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[Math.round(narrationVolume * 100)]}
                  onValueChange={([v]) => onNarrationVolumeChange(v / 100)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Background Audio
              </label>
              <select
                value={backgroundAudio.src ?? ""}
                onChange={(e) =>
                  onBackgroundAudioChange({
                    ...backgroundAudio,
                    src: e.target.value || null,
                  })
                }
                className="mt-3 w-full rounded-md border border-border/50 bg-background/50 px-3 py-1.5 text-sm"
              >
                <option value="">None</option>
                {audioOptions.map((audio) => (
                  <option key={audio.name} value={audio.url}>
                    {audio.name}
                  </option>
                ))}
              </select>
              {backgroundAudio.src && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Volume</span>
                    <span>{Math.round(backgroundAudio.volume * 100)}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[Math.round(backgroundAudio.volume * 100)]}
                    onValueChange={([v]) =>
                      onBackgroundAudioChange({
                        ...backgroundAudio,
                        volume: v / 100,
                      })
                    }
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
