import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { CaptionWord, CaptionStyle } from "@/remotion/remotion.types";
import { loadCaptionFont } from "@/remotion/load-fonts";

type CaptionOverlayProps = {
  captions: CaptionWord[];
  playbackRate: number;
  captionStyle: CaptionStyle;
  introEndTimeSec: number;
};

/** A phrase is a group of consecutive caption words that form a natural unit. */
type CaptionPhrase = {
  startIndex: number;
  endIndex: number; // exclusive
};

const SHORT_WORD_THRESHOLD = 8;
const SENTENCE_ENDERS = /[.!?]$/;

/**
 * Group words into phrases: 1 word per frame by default.
 * Two short words (both <= 8 chars) get combined into one phrase,
 * unless the first word ends a sentence.
 */
function buildPhrases(captions: CaptionWord[]): CaptionPhrase[] {
  if (captions.length === 0) return [];

  const phrases: CaptionPhrase[] = [];
  let i = 0;

  while (i < captions.length) {
    const current = captions[i];
    const next = i + 1 < captions.length ? captions[i + 1] : null;

    const canCombine =
      next !== null &&
      !SENTENCE_ENDERS.test(current.word) &&
      current.word.length <= SHORT_WORD_THRESHOLD &&
      next.word.replace(/[.,!?;:\u2014\u2013]/g, "").length <=
        SHORT_WORD_THRESHOLD;

    if (canCombine) {
      phrases.push({ startIndex: i, endIndex: i + 2 });
      i += 2;
    } else {
      phrases.push({ startIndex: i, endIndex: i + 1 });
      i += 1;
    }
  }

  return phrases;
}

function getPlacementStyle(placement: CaptionStyle["placement"]): {
  style: React.CSSProperties;
  baseTransform: string;
} {
  switch (placement) {
    case "top":
      return { style: { top: "15%", bottom: "auto" }, baseTransform: "" };
    case "middle":
      return {
        style: { top: "50%", bottom: "auto" },
        baseTransform: "translateY(-50%)",
      };
    case "bottom":
      return { style: { bottom: "20%", top: "auto" }, baseTransform: "" };
  }
}

/**
 * Find which phrase should be displayed at `bodyTimeSec`.
 * `lingerSec` controls how long a phrase stays visible after its last word ends.
 */
function findActivePhrase(
  captions: CaptionWord[],
  phrases: CaptionPhrase[],
  bodyTimeSec: number,
  scaleTime: (t: number) => number,
  lingerSec: number,
): CaptionPhrase | null {
  if (phrases.length === 0) return null;

  // Before the first word starts
  if (bodyTimeSec < scaleTime(captions[0].start)) return null;

  // After the last word ends (plus linger)
  const lastWord = captions[captions.length - 1];
  if (bodyTimeSec > scaleTime(lastWord.end) + lingerSec) return null;

  // Find phrase containing the current time (including linger window)
  for (const phrase of phrases) {
    const phraseStart = scaleTime(captions[phrase.startIndex].start);
    const phraseEnd = scaleTime(captions[phrase.endIndex - 1].end) + lingerSec;
    if (bodyTimeSec >= phraseStart && bodyTimeSec <= phraseEnd) {
      return phrase;
    }
  }

  return null;
}

export function CaptionOverlay({
  captions,
  playbackRate,
  captionStyle,
  introEndTimeSec,
}: CaptionOverlayProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeSec = frame / fps;

  const fontFamily = loadCaptionFont(captionStyle.font);

  const scaleTime = (t: number) => t / playbackRate;
  const phrases = useMemo(() => buildPhrases(captions), [captions]);

  // Frame-align bodyStartDisplay to match the Sequence `from` used for audio
  const bodyStartDisplay = Math.round(scaleTime(introEndTimeSec) * fps) / fps;
  if (currentTimeSec < bodyStartDisplay) return null;

  // Time elapsed since body narration started, shifted by user offset
  const bodyTimeSec =
    currentTimeSec - bodyStartDisplay + captionStyle.captionOffsetSec;

  const activePhrase = findActivePhrase(
    captions,
    phrases,
    bodyTimeSec,
    scaleTime,
    captionStyle.captionLingerSec,
  );
  if (!activePhrase) return null;

  const visibleWords = captions.slice(
    activePhrase.startIndex,
    activePhrase.endIndex,
  );
  if (visibleWords.length === 0) return null;

  const { style: placementStyle, baseTransform } = getPlacementStyle(
    captionStyle.placement,
  );

  const groupStartSec = scaleTime(visibleWords[0].start);
  const { transition } = captionStyle;
  let groupOpacity = 1;
  let groupTransform = "none";

  if (transition.type !== "none") {
    const elapsed = bodyTimeSec - groupStartSec;
    const dur = transition.durationSec;
    const clamp = {
      extrapolateLeft: "clamp" as const,
      extrapolateRight: "clamp" as const,
    };

    if (transition.type === "fade") {
      groupOpacity = interpolate(elapsed, [0, dur], [0, 1], clamp);
    } else if (transition.type === "bounce") {
      const scale = interpolate(
        elapsed,
        [0, dur * 0.5, dur],
        [0.85, 1.1, 1],
        clamp,
      );
      groupTransform = `scale(${scale})`;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 40px",
        gap: 16,
        flexWrap: "wrap",
        opacity: groupOpacity,
        transform:
          [baseTransform, groupTransform].filter(Boolean).join(" ") || "none",
        ...placementStyle,
      }}
    >
      {visibleWords.map((word, i) => {
        const isActive =
          bodyTimeSec >= scaleTime(word.start) &&
          bodyTimeSec <= scaleTime(word.end);

        return (
          <span
            key={`${activePhrase.startIndex}-${i}`}
            style={{
              fontFamily,
              fontSize: captionStyle.fontSize,
              fontWeight: 800,
              color:
                isActive && captionStyle.highlightEnabled
                  ? captionStyle.highlightColor
                  : "#FFFFFF",
              textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              lineHeight: 1.2,
              ...(captionStyle.strokeEnabled
                ? {
                    WebkitTextStroke: `${captionStyle.strokeWidth}px ${captionStyle.strokeColor}`,
                    paintOrder: "stroke fill" as const,
                  }
                : {}),
            }}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
}
