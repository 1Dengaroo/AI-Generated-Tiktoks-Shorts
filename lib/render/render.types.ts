export type RenderStatus = "rendering" | "done" | "error";

export type RenderJob = {
  id: string;
  status: RenderStatus;
  progress: number;
  outputUrl: string | null;
  error: string | null;
};

export type RenderStatusResponse = {
  job: RenderJob;
};
