import {
  voices,
  DEFAULT_VOICE,
  DEFAULT_VOICE_ID,
  DEFAULT_PROVIDER,
} from "@/lib/narration/voices";

describe("voices", () => {
  it("has at least one voice", () => {
    expect(voices.length).toBeGreaterThan(0);
  });

  it("every voice has required fields", () => {
    for (const v of voices) {
      expect(v.id).toBeTruthy();
      expect(v.name).toBeTruthy();
      expect(["male", "female"]).toContain(v.gender);
      expect(["openai", "elevenlabs"]).toContain(v.provider);
    }
  });

  it("has no duplicate voice ids", () => {
    const ids = voices.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes both openai and elevenlabs providers", () => {
    const providers = new Set(voices.map((v) => v.provider));
    expect(providers.has("openai")).toBe(true);
    expect(providers.has("elevenlabs")).toBe(true);
  });

  it("DEFAULT_VOICE matches DEFAULT_VOICE_ID", () => {
    expect(DEFAULT_VOICE.id).toBe(DEFAULT_VOICE_ID);
  });

  it("DEFAULT_VOICE uses the default provider", () => {
    expect(DEFAULT_VOICE.provider).toBe(DEFAULT_PROVIDER);
  });

  it("DEFAULT_VOICE exists in the voices list", () => {
    expect(voices).toContainEqual(DEFAULT_VOICE);
  });
});
