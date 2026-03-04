import { renderRequestSchema } from "@/lib/render/render-schema";

const validRequest = {
  compositionProps: {
    backgroundVideoSrc: "https://s3.amazonaws.com/bucket/video.mp4",
    backgroundVideoStartFrom: 30,
    titleNarrationSrc: "https://s3.amazonaws.com/bucket/title.mp3",
    titleNarrationDurationSec: 3.5,
    narrationSrc: "https://s3.amazonaws.com/bucket/narration.mp3",
    captions: [
      { word: "Hello", start: 0, end: 0.5 },
      { word: "world", start: 0.5, end: 1.0 },
    ],
    durationInFrames: 900,
    playbackRate: 1.25,
    captionStyle: {
      placement: "middle",
      font: "Montserrat",
      highlightEnabled: false,
      highlightColor: "#00FFD5",
      strokeEnabled: true,
      strokeWidth: 12,
      strokeColor: "#000000",
      transition: { type: "none", durationSec: 0.3 },
      captionOffsetSec: 0,
      captionLingerSec: 0.1,
    },
    title: "Test Story",
    introConfig: {
      enabled: true,
      pauseSec: 1,
      transition: { type: "fade", durationSec: 0.5 },
    },
    backgroundAudio: {
      src: null,
      volume: 0.15,
    },
  },
};

describe("renderRequestSchema", () => {
  it("accepts a valid render request", () => {
    const result = renderRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("rejects empty narrationSrc", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.narrationSrc = "";
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects empty backgroundVideoSrc", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.backgroundVideoSrc = "";
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects playbackRate below 0.5", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.playbackRate = 0.1;
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects playbackRate above 2", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.playbackRate = 3;
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects durationInFrames of 0", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.durationInFrames = 0;
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects invalid caption font", () => {
    const bad = structuredClone(validRequest);
    (bad.compositionProps.captionStyle as Record<string, unknown>).font =
      "Comic Sans";
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects invalid caption placement", () => {
    const bad = structuredClone(validRequest);
    (bad.compositionProps.captionStyle as Record<string, unknown>).placement =
      "left";
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects invalid caption transition type", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.captionStyle.transition.type = "slide" as never;
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects invalid intro transition type", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.introConfig.transition.type = "bounce" as never;
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts all valid caption fonts", () => {
    const fonts = ["Montserrat", "Bangers", "Roboto", "Oswald", "Poppins"];
    for (const font of fonts) {
      const req = structuredClone(validRequest);
      req.compositionProps.captionStyle.font = font;
      expect(renderRequestSchema.safeParse(req).success).toBe(true);
    }
  });

  it("accepts all valid intro transition types", () => {
    const types = ["fade", "slide-up", "slide-down", "scale", "none"];
    for (const type of types) {
      const req = structuredClone(validRequest);
      req.compositionProps.introConfig.transition.type = type;
      expect(renderRequestSchema.safeParse(req).success).toBe(true);
    }
  });

  it("rejects background audio volume above 1", () => {
    const bad = structuredClone(validRequest);
    bad.compositionProps.backgroundAudio.volume = 1.5;
    expect(renderRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts background audio with null src", () => {
    const req = structuredClone(validRequest);
    req.compositionProps.backgroundAudio.src = null;
    expect(renderRequestSchema.safeParse(req).success).toBe(true);
  });

  it("rejects missing compositionProps entirely", () => {
    expect(renderRequestSchema.safeParse({}).success).toBe(false);
  });
});
