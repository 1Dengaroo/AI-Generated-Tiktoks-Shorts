import { apiClient } from "./client";
import type {
  StoryGenerateRequest,
  StoryGenerateResponse,
  NarrationGenerateRequest,
  NarrationGenerateResponse,
  CaptionsGenerateRequest,
  CaptionsGenerateResponse,
  RenderStatusResponse,
  StoredFile,
  VideosResponse,
  AudiosResponse,
  RenderStartRequest,
  RenderStartResponse,
  ClipSaveRequest,
} from "./api.types";

export const api = {
  story: {
    generate: (body: StoryGenerateRequest) =>
      apiClient
        .post<StoryGenerateResponse>("/story/generate", body)
        .then((r) => r.data),
  },

  narration: {
    generate: (body: NarrationGenerateRequest) =>
      apiClient
        .post<NarrationGenerateResponse>("/narration/generate", body)
        .then((r) => r.data),
  },

  captions: {
    generate: (body: CaptionsGenerateRequest) =>
      apiClient
        .post<CaptionsGenerateResponse>("/captions/generate", body)
        .then((r) => r.data),
  },

  videos: {
    list: () => apiClient.get<VideosResponse>("/videos").then((r) => r.data),
  },

  audios: {
    list: () => apiClient.get<AudiosResponse>("/audios").then((r) => r.data),
  },

  clips: {
    list: () => apiClient.get<StoredFile[]>("/clips").then((r) => r.data),
    save: (body: ClipSaveRequest) =>
      apiClient.post("/clips/save", body).then((r) => r.data),
  },

  render: {
    start: (body: RenderStartRequest) =>
      apiClient.post<RenderStartResponse>("/render", body).then((r) => r.data),
    status: (id: string, bucketName: string) =>
      apiClient
        .get<RenderStatusResponse>(
          `/render/${id}?bucketName=${encodeURIComponent(bucketName)}`,
        )
        .then((r) => r.data),
  },
};
