"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/create/AudioPlayer";
import { Loader2, Volume2, User, UserRound } from "lucide-react";
import { voices } from "@/lib/narration/voices";
import type { GeneratedStory } from "@/lib/story/story.types";
import type {
  VoiceEffect,
  NarrationResult,
  TtsProvider,
} from "@/lib/narration/narration.types";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api/endpoints";

type NarrationStepProps = {
  story: GeneratedStory;
  titleNarrationUrl: string | null;
  narrationUrl: string | null;
  voiceId: string;
  voiceEffect: VoiceEffect;
  onNarrationGenerated: (result: NarrationResult) => void;
  onVoiceChange: (voiceId: string) => void;
};

const openaiVoices = voices.filter((v) => v.provider === "openai");

function getProviderForVoice(voiceId: string): TtsProvider {
  const voice = voices.find((v) => v.id === voiceId);
  return voice?.provider ?? "openai";
}

export function NarrationStep({
  story,
  titleNarrationUrl,
  narrationUrl,
  voiceId,
  voiceEffect,
  onNarrationGenerated,
  onVoiceChange,
}: NarrationStepProps) {
  const provider = getProviderForVoice(voiceId);

  const generateNarration = useCallback(
    () =>
      Promise.all([
        api.narration.generate({
          text: story.title,
          voiceId,
          voiceEffect,
          provider,
          segment: "title",
        }),
        api.narration.generate({
          text: story.fullText,
          voiceId,
          voiceEffect,
          provider,
          segment: "body",
        }),
      ]),
    [story.title, story.fullText, voiceId, voiceEffect, provider],
  );

  const { loading, error, execute: runGenerate } = useApi(generateNarration);

  async function handleGenerate() {
    try {
      const [titleData, bodyData] = await runGenerate();
      onNarrationGenerated({
        titleAudioUrl: titleData.audioUrl,
        titleAudioKey: titleData.audioKey,
        titleDurationSec: titleData.durationSeconds,
        bodyAudioUrl: bodyData.audioUrl,
        bodyAudioKey: bodyData.audioKey,
        bodyDurationSec: bodyData.durationSeconds,
      });
    } catch {
      // error is set by useApi
    }
  }

  const lines = story.fullText.split(/(?<=[.!?])\s+/);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Script panel */}
      <div>
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Script
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This text will be narrated using AI voice synthesis.
        </p>
        <div className="mt-3 rounded-lg border border-border/50 bg-card/80 p-4">
          <div className="space-y-1 font-mono text-sm leading-relaxed">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-6 shrink-0 text-right text-xs text-muted-foreground/40">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice selection grouped by provider */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Voice
        </label>

        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {openaiVoices.map((v) => (
            <button
              key={v.id}
              onClick={() => onVoiceChange(v.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all",
                voiceId === v.id
                  ? "border-primary bg-primary/5 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.3)]"
                  : "border-border/50 hover:border-primary/50",
              )}
            >
              {v.gender === "female" ? (
                <UserRound className="size-5 text-muted-foreground" />
              ) : (
                <User className="size-5 text-muted-foreground" />
              )}
              <span className="text-xs font-medium">{v.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {v.gender}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button + audio player */}
      <div className="space-y-4">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="transition-shadow hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.5)]"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Volume2 className="size-4" />
          )}
          {loading
            ? "Generating Narration..."
            : narrationUrl
              ? "Regenerate Narration"
              : "Generate Narration"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {titleNarrationUrl && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <AudioPlayer src={titleNarrationUrl} />
          </div>
        )}
        {narrationUrl && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Body
            </label>
            <AudioPlayer src={narrationUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
