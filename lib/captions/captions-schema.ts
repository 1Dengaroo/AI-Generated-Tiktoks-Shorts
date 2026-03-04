import { z } from "zod";

export const captionsGenerateRequestSchema = z.object({
  audioKey: z.string().min(1).max(500),
});
