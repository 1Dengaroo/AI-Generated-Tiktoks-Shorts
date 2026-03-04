import {
  FPS,
  computeDurationInFrames,
  DEFAULT_CAPTION_STYLE,
  DEFAULT_INTRO_CONFIG,
  DEFAULT_BACKGROUND_AUDIO,
  CAPTION_FONTS,
} from "@/remotion/remotion.types";

describe("FPS", () => {
  it("is 30", () => {
    expect(FPS).toBe(30);
  });
});

describe("computeDurationInFrames", () => {
  it("sums intro and body durations and converts to frames", () => {
    // 2s intro + 10s body = 12s * 30fps = 360 frames
    expect(computeDurationInFrames(2, 10)).toBe(360);
  });

  it("returns at least 1 second of frames", () => {
    expect(computeDurationInFrames(0, 0)).toBe(FPS);
  });

  it("rounds to nearest frame", () => {
    // 0s intro + 1.5s body = 45 frames exactly
    expect(computeDurationInFrames(0, 1.5)).toBe(45);
  });

  it("handles fractional durations", () => {
    // 1.2 + 3.7 = 4.9s * 30 = 147
    expect(computeDurationInFrames(1.2, 3.7)).toBe(147);
  });

  it("handles intro-only duration", () => {
    expect(computeDurationInFrames(5, 0)).toBe(150);
  });
});

describe("defaults", () => {
  it("DEFAULT_CAPTION_STYLE has valid font", () => {
    expect(CAPTION_FONTS).toContain(DEFAULT_CAPTION_STYLE.font);
  });

  it("DEFAULT_CAPTION_STYLE stroke is enabled by default", () => {
    expect(DEFAULT_CAPTION_STYLE.strokeEnabled).toBe(true);
  });

  it("DEFAULT_INTRO_CONFIG is enabled by default", () => {
    expect(DEFAULT_INTRO_CONFIG.enabled).toBe(true);
  });

  it("DEFAULT_INTRO_CONFIG uses fade transition", () => {
    expect(DEFAULT_INTRO_CONFIG.transition.type).toBe("fade");
  });

  it("DEFAULT_BACKGROUND_AUDIO has no source by default", () => {
    expect(DEFAULT_BACKGROUND_AUDIO.src).toBeNull();
  });

  it("DEFAULT_BACKGROUND_AUDIO volume is between 0 and 1", () => {
    expect(DEFAULT_BACKGROUND_AUDIO.volume).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_BACKGROUND_AUDIO.volume).toBeLessThanOrEqual(1);
  });
});
