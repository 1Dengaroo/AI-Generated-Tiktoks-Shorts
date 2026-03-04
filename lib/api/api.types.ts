export type {
  StoryGenerateRequest,
  StoryGenerateResponse,
} from "@/lib/story/story.types";

export type {
  NarrationGenerateRequest,
  NarrationGenerateResponse,
} from "@/lib/narration/narration.types";

export type {
  CaptionsGenerateRequest,
  CaptionsGenerateResponse,
} from "@/lib/captions/captions.types";

export type { RenderStatusResponse } from "@/lib/render/render.types";

export type { StoredFile } from "@/lib/video/storage.types";

export type VideosResponse = {
  videos: { name: string; url: string; previewUrl: string }[];
};

export type AudiosResponse = {
  audios: { name: string; url: string }[];
};

export type RenderStartRequest = {
  compositionProps: Record<string, unknown>;
};

export type RenderStartResponse = {
  renderId: string;
  bucketName: string;
};

export type ClipSaveRequest = {
  outputUrl: string;
  sourceBucket: string;
};
