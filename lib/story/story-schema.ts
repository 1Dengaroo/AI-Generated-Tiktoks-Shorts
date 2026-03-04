import { z } from "zod";

export const storyGenerateRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  tone: z.string().max(50).optional(),
  maxDurationSeconds: z.number().min(10).max(180).optional(),
});

export const storySegmentSchema = z.object({
  index: z.number(),
  text: z.string(),
});

export const generatedStorySchema = z.object({
  title: z.string(),
  segments: z.array(storySegmentSchema),
  fullText: z.string(),
});
