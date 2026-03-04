import { storyGenerateRequestSchema } from "@/lib/story/story-schema";
import { narrationGenerateRequestSchema } from "@/lib/narration/narration-schema";
import { captionsGenerateRequestSchema } from "@/lib/captions/captions-schema";

describe("storyGenerateRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = storyGenerateRequestSchema.safeParse({
      prompt: "A cat runs a company",
      tone: "dramatic",
    });
    expect(result.success).toBe(true);
  });

  it("requires a non-empty prompt", () => {
    const result = storyGenerateRequestSchema.safeParse({ prompt: "" });
    expect(result.success).toBe(false);
  });

  it("rejects prompt over 1000 chars", () => {
    const result = storyGenerateRequestSchema.safeParse({
      prompt: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("allows optional fields to be omitted", () => {
    const result = storyGenerateRequestSchema.safeParse({
      prompt: "Something",
    });
    expect(result.success).toBe(true);
  });
});

describe("narrationGenerateRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = narrationGenerateRequestSchema.safeParse({
      text: "Hello world",
      voiceId: "alloy",
      voiceEffect: "none",
      provider: "openai",
      segment: "body",
    });
    expect(result.success).toBe(true);
  });

  it("requires non-empty text", () => {
    const result = narrationGenerateRequestSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid voice effect", () => {
    const result = narrationGenerateRequestSchema.safeParse({
      text: "test",
      voiceEffect: "reverb",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid provider", () => {
    const result = narrationGenerateRequestSchema.safeParse({
      text: "test",
      provider: "google",
    });
    expect(result.success).toBe(false);
  });
});

describe("captionsGenerateRequestSchema", () => {
  it("accepts a valid audio key", () => {
    const result = captionsGenerateRequestSchema.safeParse({
      audioKey: "narrations/abc123.mp3",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty audio key", () => {
    const result = captionsGenerateRequestSchema.safeParse({ audioKey: "" });
    expect(result.success).toBe(false);
  });
});
