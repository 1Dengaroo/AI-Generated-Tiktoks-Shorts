import { z } from "zod";

export const narrationGenerateRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().max(100).optional(),
  voiceEffect: z.enum(["none", "anonymous"]).optional(),
  provider: z.enum(["openai", "elevenlabs"]).optional(),
  segment: z.enum(["title", "body"]).optional(),
});
