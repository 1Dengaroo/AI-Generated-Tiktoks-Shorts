import { z } from "zod";

const captionWordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

const captionTransitionSchema = z.object({
  type: z.enum(["fade", "bounce", "none"]),
  durationSec: z.number().min(0.1).max(1),
});

const captionStyleSchema = z.object({
  placement: z.enum(["top", "middle", "bottom"]),
  font: z.enum(["Montserrat", "Bangers", "Roboto", "Oswald", "Poppins"]),
  highlightEnabled: z.boolean(),
  highlightColor: z.string(),
  strokeEnabled: z.boolean(),
  strokeWidth: z.number().min(1).max(32),
  strokeColor: z.string(),
  transition: captionTransitionSchema,
  captionOffsetSec: z.number().min(-0.5).max(0.5),
  captionLingerSec: z.number().min(0).max(1),
});

const titleTransitionSchema = z.object({
  type: z.enum(["fade", "slide-up", "slide-down", "scale", "none"]),
  durationSec: z.number().min(0.1).max(2),
});

const introConfigSchema = z.object({
  enabled: z.boolean(),
  pauseSec: z.number().min(0).max(5),
  transition: titleTransitionSchema,
});

export const renderRequestSchema = z.object({
  compositionProps: z.object({
    backgroundVideoSrc: z.string().min(1),
    backgroundVideoStartFrom: z.number().min(0),
    titleNarrationSrc: z.string(),
    titleNarrationDurationSec: z.number().min(0),
    narrationSrc: z.string().min(1),
    captions: z.array(captionWordSchema),
    durationInFrames: z.number().min(1),
    playbackRate: z.number().min(0.5).max(2),
    captionStyle: captionStyleSchema,
    title: z.string(),
    introConfig: introConfigSchema,
    backgroundAudio: z.object({
      src: z.string().nullable(),
      volume: z.number().min(0).max(1),
    }),
  }),
});
