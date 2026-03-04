"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  CAPTION_FONTS,
  TITLE_TRANSITION_TYPES,
  CAPTION_TRANSITION_TYPES,
  TITLE_CARD_STYLES,
  type CaptionStyle,
  type CaptionPlacement,
  type CaptionFont,
  type IntroConfig,
  type TitleTransitionType,
  type TitleCardStyleType,
  type CaptionTransitionType,
} from "@/remotion/remotion.types";

const cardClass = "rounded-lg border border-border/50 bg-card/50 p-4";

type IntroCardProps = {
  introConfig: IntroConfig;
  onIntroConfigChange: (config: IntroConfig) => void;
};

export function IntroCard({
  introConfig,
  onIntroConfigChange,
}: IntroCardProps) {
  return (
    <div className={cardClass}>
      <h4 className="border-l-2 border-primary pl-2 text-xs font-semibold uppercase tracking-wider text-foreground">
        Intro
      </h4>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Title Card
          </span>
          <Switch
            size="sm"
            checked={introConfig.enabled}
            onCheckedChange={(v) =>
              onIntroConfigChange({ ...introConfig, enabled: v })
            }
          />
        </div>
        {introConfig.enabled && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Style
              </span>
              <Select
                value={introConfig.titleCardStyle ?? "social"}
                onValueChange={(v) =>
                  onIntroConfigChange({
                    ...introConfig,
                    titleCardStyle: v as TitleCardStyleType,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TITLE_CARD_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(introConfig.titleCardStyle ?? "social") === "social" && (
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <span className="text-xs text-muted-foreground">Likes</span>
                  <Input
                    placeholder="Auto"
                    value={introConfig.likeCount ?? ""}
                    onChange={(e) =>
                      onIntroConfigChange({
                        ...introConfig,
                        likeCount: e.target.value,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Comments
                  </span>
                  <Input
                    placeholder="Auto"
                    value={introConfig.commentCount ?? ""}
                    onChange={(e) =>
                      onIntroConfigChange({
                        ...introConfig,
                        commentCount: e.target.value,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Pause after title
                </span>
                <span className="text-xs text-muted-foreground">
                  {introConfig.pauseSec}s
                </span>
              </div>
              <Slider
                min={0.5}
                max={3}
                step={0.5}
                value={[introConfig.pauseSec]}
                onValueChange={([v]) =>
                  onIntroConfigChange({ ...introConfig, pauseSec: v })
                }
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Transition
              </span>
              <Select
                value={introConfig.transition.type}
                onValueChange={(v) =>
                  onIntroConfigChange({
                    ...introConfig,
                    transition: {
                      ...introConfig.transition,
                      type: v as TitleTransitionType,
                    },
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TITLE_TRANSITION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {introConfig.transition.type !== "none" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Speed</span>
                  <span className="text-xs text-muted-foreground">
                    {introConfig.transition.durationSec}s
                  </span>
                </div>
                <Slider
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={[introConfig.transition.durationSec]}
                  onValueChange={([v]) =>
                    onIntroConfigChange({
                      ...introConfig,
                      transition: {
                        ...introConfig.transition,
                        durationSec: v,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type CaptionsCardProps = {
  captionStyle: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
};

export function CaptionsCard({ captionStyle, onChange }: CaptionsCardProps) {
  const update = <K extends keyof CaptionStyle>(
    key: K,
    value: CaptionStyle[K],
  ) => {
    onChange({ ...captionStyle, [key]: value });
  };

  return (
    <div className={cardClass}>
      <h4 className="border-l-2 border-primary pl-2 text-xs font-semibold uppercase tracking-wider text-foreground">
        Captions
      </h4>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Placement
          </span>
          <Select
            value={captionStyle.placement}
            onValueChange={(v) => update("placement", v as CaptionPlacement)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Font
          </span>
          <Select
            value={captionStyle.font}
            onValueChange={(v) => update("font", v as CaptionFont)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAPTION_FONTS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Size
            </span>
            <span className="text-xs text-muted-foreground">
              {captionStyle.fontSize}px
            </span>
          </div>
          <Slider
            min={40}
            max={120}
            step={4}
            value={[captionStyle.fontSize]}
            onValueChange={([v]) => update("fontSize", v)}
          />
        </div>
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            <svg
              className="h-3 w-3 transition-transform group-open:rotate-90"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4.5 2.5L8 6L4.5 9.5" />
            </svg>
            Advanced
          </summary>
          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Timing Offset
                </span>
                <span className="text-xs text-muted-foreground">
                  {captionStyle.captionOffsetSec > 0 ? "+" : ""}
                  {captionStyle.captionOffsetSec.toFixed(2)}s
                </span>
              </div>
              <Slider
                min={-0.5}
                max={0.5}
                step={0.05}
                value={[captionStyle.captionOffsetSec]}
                onValueChange={([v]) =>
                  update("captionOffsetSec", Math.round(v * 100) / 100)
                }
              />
              <p className="text-[10px] text-muted-foreground/60">
                Shift captions earlier or later
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Linger
                </span>
                <span className="text-xs text-muted-foreground">
                  {captionStyle.captionLingerSec.toFixed(1)}s
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[captionStyle.captionLingerSec]}
                onValueChange={([v]) => update("captionLingerSec", v)}
              />
              <p className="text-[10px] text-muted-foreground/60">
                How long captions stay after the word ends
              </p>
              {captionStyle.captionLingerSec > 0 &&
                captionStyle.transition.type !== "none" && (
                  <p className="text-[10px] text-amber-500">
                    Linger and caption transitions may not work well together
                  </p>
                )}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

type EffectsCardProps = {
  captionStyle: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
};

export function EffectsCard({ captionStyle, onChange }: EffectsCardProps) {
  const update = <K extends keyof CaptionStyle>(
    key: K,
    value: CaptionStyle[K],
  ) => {
    onChange({ ...captionStyle, [key]: value });
  };

  return (
    <div className={cardClass}>
      <h4 className="border-l-2 border-primary pl-2 text-xs font-semibold uppercase tracking-wider text-foreground">
        Effects
      </h4>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Highlight
            </span>
            <Switch
              size="sm"
              checked={captionStyle.highlightEnabled}
              onCheckedChange={(v) => update("highlightEnabled", v)}
            />
          </div>
          {captionStyle.highlightEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Color</span>
              <input
                type="color"
                value={captionStyle.highlightColor}
                onChange={(e) => update("highlightColor", e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
              />
              <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {captionStyle.highlightColor}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Text Stroke
            </span>
            <Switch
              size="sm"
              checked={captionStyle.strokeEnabled}
              onCheckedChange={(v) => update("strokeEnabled", v)}
            />
          </div>
          {captionStyle.strokeEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Color</span>
                <input
                  type="color"
                  value={captionStyle.strokeColor}
                  onChange={(e) => update("strokeColor", e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                />
                <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {captionStyle.strokeColor}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Width</span>
                  <span className="text-xs text-muted-foreground">
                    {captionStyle.strokeWidth}px
                  </span>
                </div>
                <Slider
                  min={1}
                  max={32}
                  step={1}
                  value={[captionStyle.strokeWidth]}
                  onValueChange={([v]) => update("strokeWidth", v)}
                />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Caption Transition
          </span>
          <Select
            value={captionStyle.transition.type}
            onValueChange={(v) =>
              update("transition", {
                ...captionStyle.transition,
                type: v as CaptionTransitionType,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAPTION_TRANSITION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {captionStyle.transition.type !== "none" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Speed</span>
              <span className="text-xs text-muted-foreground">
                {captionStyle.transition.durationSec}s
              </span>
            </div>
            <Slider
              min={0.1}
              max={1}
              step={0.1}
              value={[captionStyle.transition.durationSec]}
              onValueChange={([v]) =>
                update("transition", {
                  ...captionStyle.transition,
                  durationSec: v,
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
