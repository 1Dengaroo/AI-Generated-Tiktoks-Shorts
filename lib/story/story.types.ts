export type StorySegment = {
  index: number;
  text: string;
};

export type GeneratedStory = {
  title: string;
  segments: StorySegment[];
  fullText: string;
};

export type StoryGenerateRequest = {
  prompt: string;
  tone?: string;
  maxDurationSeconds?: number;
};

export type StoryGenerateResponse = {
  story: GeneratedStory;
};
