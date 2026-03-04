"use client";

import { useState, useCallback, useEffect } from "react";
import { StoryStep } from "./steps/StoryStep";
import { NarrationStep } from "./steps/NarrationStep";
import { BackgroundStep } from "./steps/BackgroundStep";
import { PreviewStep } from "./steps/PreviewStep";
import { FinishStep } from "./steps/FinishStep";
import type { WizardState, WizardStep } from "./create-wizard.types";
import type { GeneratedStory } from "@/lib/story/story.types";
import type {
  CaptionStyle,
  IntroConfig,
  BackgroundAudioConfig,
} from "@/remotion/remotion.types";
import type { NarrationResult } from "@/lib/narration/narration.types";
import { api } from "@/lib/api/endpoints";
import {
  DEFAULT_CAPTION_STYLE,
  DEFAULT_INTRO_CONFIG,
  DEFAULT_BACKGROUND_AUDIO,
} from "@/remotion/remotion.types";
import { DEFAULT_VOICE } from "@/lib/narration/voices";
import {
  BookOpen,
  Volume2,
  MonitorPlay,
  Film,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SESSION_KEY = "rshorts-wizard-state";

function loadWizardState(): WizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WizardState;
  } catch {
    return null;
  }
}

const STEPS: { value: WizardStep; label: string; icon: React.ReactNode }[] = [
  { value: "story", label: "Story", icon: <BookOpen className="size-4" /> },
  {
    value: "narration",
    label: "Narration",
    icon: <Volume2 className="size-4" />,
  },
  {
    value: "background",
    label: "Background",
    icon: <MonitorPlay className="size-4" />,
  },
  { value: "preview", label: "Preview", icon: <Film className="size-4" /> },
  {
    value: "finish",
    label: "Finish",
    icon: <Clapperboard className="size-4" />,
  },
];

export function CreateWizard() {
  const [infoOpen, setInfoOpen] = useState(false);

  // Show info modal on first visit (checked after hydration)
  useEffect(() => {
    if (!sessionStorage.getItem("rshorts-info-dismissed")) {
      setInfoOpen(true);
    }
  }, []);

  const dismissInfo = () => {
    sessionStorage.setItem("rshorts-info-dismissed", "1");
    setInfoOpen(false);
  };

  const defaultState: WizardState = {
    step: "story",
    story: null,
    voiceId: DEFAULT_VOICE.id,
    voiceEffect: "none",
    playbackRate: 1.25,
    titleAudioUrl: null,
    titleAudioDuration: null,
    narrationUrl: null,
    narrationKey: null,
    narrationDuration: null,
    captions: [],
    backgroundVideoUrl: null,
    backgroundPreviewUrl: null,
    backgroundVideoStartFrom: 0,
    captionStyle: DEFAULT_CAPTION_STYLE,
    introConfig: DEFAULT_INTRO_CONFIG,
    backgroundAudio: DEFAULT_BACKGROUND_AUDIO,
    narrationVolume: 0.5,
  };

  const [state, setState] = useState<WizardState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage after hydration to avoid mismatch
  useEffect(() => {
    const saved = loadWizardState();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  // Persist wizard state to sessionStorage on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setStep = (step: WizardStep) => setState((prev) => ({ ...prev, step }));

  const handleStoryGenerated = useCallback((story: GeneratedStory) => {
    setState((prev) => ({
      ...prev,
      story,
      titleAudioUrl: null,
      titleAudioDuration: null,
      narrationUrl: null,
      narrationKey: null,
      narrationDuration: null,
      captions: [],
    }));
  }, []);

  const handleStoryEdited = useCallback((story: GeneratedStory) => {
    setState((prev) => ({ ...prev, story }));
  }, []);

  const handleNarrationGenerated = useCallback(
    async (result: NarrationResult) => {
      setState((prev) => ({
        ...prev,
        titleAudioUrl: result.titleAudioUrl,
        titleAudioDuration: result.titleDurationSec,
        narrationUrl: result.bodyAudioUrl,
        narrationKey: result.bodyAudioKey,
        narrationDuration: result.bodyDurationSec,
        captions: [],
      }));

      api.captions
        .generate({ audioKey: result.bodyAudioKey })
        .then((data) => {
          setState((prev) => ({ ...prev, captions: data.words }));
        })
        .catch(() => {
          // Captions are optional
        });
    },
    [],
  );

  const handleVoiceChange = useCallback((voiceId: string) => {
    setState((prev) => ({ ...prev, voiceId }));
  }, []);

  const handlePlaybackRateChange = useCallback((playbackRate: number) => {
    setState((prev) => ({ ...prev, playbackRate }));
  }, []);

  const handleBackgroundSelect = useCallback(
    (url: string, previewUrl: string) => {
      const startFrom = Math.floor(Math.random() * 120);
      setState((prev) => ({
        ...prev,
        backgroundVideoUrl: url,
        backgroundPreviewUrl: previewUrl,
        backgroundVideoStartFrom: startFrom,
      }));
    },
    [],
  );

  const handleCaptionStyleChange = useCallback((captionStyle: CaptionStyle) => {
    setState((prev) => ({ ...prev, captionStyle }));
  }, []);

  const handleIntroConfigChange = useCallback((introConfig: IntroConfig) => {
    setState((prev) => ({ ...prev, introConfig }));
  }, []);

  const handleBackgroundAudioChange = useCallback(
    (backgroundAudio: BackgroundAudioConfig) => {
      setState((prev) => ({ ...prev, backgroundAudio }));
    },
    [],
  );

  const handleNarrationVolumeChange = useCallback((narrationVolume: number) => {
    setState((prev) => ({ ...prev, narrationVolume }));
  }, []);

  const canAccessStep = (step: WizardStep): boolean => {
    switch (step) {
      case "story":
        return true;
      case "narration":
        return !!state.story;
      case "background":
        return !!state.narrationUrl;
      case "preview":
        return !!state.narrationUrl && !!state.backgroundVideoUrl;
      case "finish":
        return !!state.narrationUrl && !!state.backgroundVideoUrl;
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.value === state.step);

  const isStepCompleted = (step: WizardStep): boolean => {
    switch (step) {
      case "story":
        return !!state.story;
      case "narration":
        return !!state.narrationUrl;
      case "background":
        return !!state.backgroundVideoUrl;
      case "preview":
        return !!state.narrationUrl && !!state.backgroundVideoUrl;
      case "finish":
        return false;
    }
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length && canAccessStep(STEPS[nextIndex].value)) {
      setStep(STEPS[nextIndex].value);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Horizontal step indicator */}
      <div className="border-b border-border/50 bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6 py-3">
          {STEPS.map((s, i) => {
            const isActive = s.value === state.step;
            const isCompleted = isStepCompleted(s.value);
            const isAccessible = canAccessStep(s.value);

            return (
              <div key={s.value} className="flex items-center">
                {i > 0 && (
                  <div
                    className={cn(
                      "mx-1 h-px w-6 transition-colors",
                      isStepCompleted(STEPS[i - 1].value)
                        ? "bg-primary/50"
                        : "bg-border/50",
                    )}
                  />
                )}
                <button
                  onClick={() => isAccessible && setStep(s.value)}
                  disabled={!isAccessible}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.4)]"
                      : isCompleted
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : isAccessible
                          ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                          : "cursor-not-allowed text-muted-foreground/40",
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="size-3.5" />
                  ) : (
                    s.icon
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-6">
        {/* Step content */}
        <div className="py-6">
          {state.step === "story" && (
            <StoryStep
              story={state.story}
              onStoryGenerated={handleStoryGenerated}
              onStoryEdited={handleStoryEdited}
            />
          )}

          {state.step === "narration" && state.story && (
            <NarrationStep
              story={state.story}
              titleNarrationUrl={state.titleAudioUrl}
              narrationUrl={state.narrationUrl}
              voiceId={state.voiceId}
              voiceEffect={state.voiceEffect}
              onNarrationGenerated={handleNarrationGenerated}
              onVoiceChange={handleVoiceChange}
            />
          )}

          {state.step === "background" && (
            <BackgroundStep
              selectedUrl={state.backgroundVideoUrl}
              onSelect={handleBackgroundSelect}
            />
          )}

          {state.step === "preview" &&
            state.narrationUrl &&
            state.backgroundVideoUrl && (
              <PreviewStep
                backgroundVideoSrc={state.backgroundVideoUrl}
                backgroundPreviewSrc={
                  state.backgroundPreviewUrl || state.backgroundVideoUrl
                }
                backgroundVideoStartFrom={state.backgroundVideoStartFrom}
                titleNarrationSrc={state.titleAudioUrl ?? ""}
                titleNarrationDurationSec={state.titleAudioDuration ?? 0}
                narrationSrc={state.narrationUrl}
                captions={state.captions}
                durationSeconds={state.narrationDuration ?? 30}
                playbackRate={state.playbackRate}
                captionStyle={state.captionStyle}
                onCaptionStyleChange={handleCaptionStyleChange}
                title={state.story?.title ?? ""}
                introConfig={state.introConfig}
                onIntroConfigChange={handleIntroConfigChange}
                onPlaybackRateChange={handlePlaybackRateChange}
                backgroundAudio={state.backgroundAudio}
                onBackgroundAudioChange={handleBackgroundAudioChange}
                narrationVolume={state.narrationVolume}
                onNarrationVolumeChange={handleNarrationVolumeChange}
              />
            )}

          {state.step === "finish" &&
            state.narrationUrl &&
            state.backgroundVideoUrl && (
              <FinishStep
                backgroundVideoSrc={state.backgroundVideoUrl}
                backgroundVideoStartFrom={state.backgroundVideoStartFrom}
                titleNarrationSrc={state.titleAudioUrl ?? ""}
                titleNarrationDurationSec={state.titleAudioDuration ?? 0}
                narrationSrc={state.narrationUrl}
                captions={state.captions}
                durationSeconds={state.narrationDuration ?? 30}
                playbackRate={state.playbackRate}
                captionStyle={state.captionStyle}
                title={state.story?.title ?? ""}
                introConfig={state.introConfig}
                backgroundAudio={state.backgroundAudio}
                narrationVolume={state.narrationVolume}
              />
            )}
        </div>
      </div>

      {/* Info modal for first-time visitors */}
      <Dialog open={infoOpen} onOpenChange={(open) => !open && dismissInfo()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="size-5 text-primary" />
              How it works
            </DialogTitle>
          </DialogHeader>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">1. Write a story</strong> -
              Type a prompt and we will generate a short narration script for
              you.
            </li>
            <li>
              <strong className="text-foreground">2. Pick a voice</strong> -
              Choose a voice and speed, then generate the audio.
            </li>
            <li>
              <strong className="text-foreground">
                3. Choose a background
              </strong>{" "}
              - Pick a gameplay or scenic video to play behind your narration.
            </li>
            <li>
              <strong className="text-foreground">4. Preview and tweak</strong>{" "}
              - Adjust captions, intros, and timing until it looks right.
            </li>
            <li>
              <strong className="text-foreground">5. Export</strong> - Render
              your video as an MP4 ready for TikTok, Reels, or Shorts.
            </li>
          </ol>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full">Get started</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom navigation bar — fixed to bottom */}
      <div className="sticky bottom-0 border-t border-border/50 bg-background/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl justify-between px-6">
          {currentStepIndex > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(STEPS[currentStepIndex - 1].value)}
            >
              <ChevronLeft className="size-4" />
              {STEPS[currentStepIndex - 1].label}
            </Button>
          ) : (
            <div />
          )}
          {currentStepIndex < STEPS.length - 1 && (
            <Button
              onClick={nextStep}
              disabled={!canAccessStep(STEPS[currentStepIndex + 1]?.value)}
            >
              Continue to {STEPS[currentStepIndex + 1]?.label}
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
